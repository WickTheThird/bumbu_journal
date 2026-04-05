/**
 * HashIDEA API Worker — Cloudflare Workers
 *
 * Handles: projects CRUD, user profiles, Stripe billing
 *
 * Bindings required:
 *   DB        → D1 database (hashidea-db)
 *   PROJECTS  → R2 bucket  (hashidea-projects)
 *
 * Environment variables (set via Worker Settings → Variables):
 *   STRIPE_SECRET_KEY    → sk_test_...
 *   STRIPE_WEBHOOK_SECRET → whsec_... (set after creating webhook endpoint)
 *
 * Price ID mapping (hardcoded — update if you recreate products):
 */

const PRICE_TO_PLAN = {
  'price_1TGQH1Isg0HKgiZiwoJS8dsL': 'starter',
  'price_1TGQH1Isg0HKgiZilKpkTzhH': 'pro',
  'price_1TGQH1Isg0HKgiZiVYwMcaks': 'team',
};

// ── Plan limits ─────────────────────────────────────

const PLAN_LIMITS = {
  free:    { cloud_projects: 3,  private_projects: 0, custom_domains: 0 },
  starter: { cloud_projects: -1, private_projects: -1, custom_domains: 1 },  // -1 = unlimited
  pro:     { cloud_projects: -1, private_projects: -1, custom_domains: 5 },
  team:    { cloud_projects: -1, private_projects: -1, custom_domains: 10 },
};

// ── Helpers ─────────────────────────────────────────

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, status = 200, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

function error(message, status = 400, origin) {
  return json({ error: message }, status, origin);
}

function generateId(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => chars[b % chars.length]).join('');
}

// ── Auth ────────────────────────────────────────────

async function verifyGitHubToken(token) {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'HashIDEA-API',
    },
  });
  if (!res.ok) return null;
  return res.json();
}

async function getOrCreateUser(env, ghUser) {
  let user = await env.DB.prepare('SELECT * FROM users WHERE github_id = ?')
    .bind(ghUser.id)
    .first();

  if (!user) {
    const id = generateId();
    await env.DB.prepare(
      'INSERT INTO users (id, github_id, username, avatar_url) VALUES (?, ?, ?, ?)'
    ).bind(id, ghUser.id, ghUser.login, ghUser.avatar_url).run();
    user = { id, github_id: ghUser.id, username: ghUser.login, avatar_url: ghUser.avatar_url, plan: 'free' };
  } else {
    // Update username/avatar if changed
    if (user.username !== ghUser.login || user.avatar_url !== ghUser.avatar_url) {
      await env.DB.prepare('UPDATE users SET username = ?, avatar_url = ? WHERE id = ?')
        .bind(ghUser.login, ghUser.avatar_url, user.id).run();
      user.username = ghUser.login;
      user.avatar_url = ghUser.avatar_url;
    }
  }

  return user;
}

async function authenticate(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const ghUser = await verifyGitHubToken(token);
  if (!ghUser) return null;
  return getOrCreateUser(env, ghUser);
}

// ── Stripe helpers ──────────────────────────────────

async function stripeRequest(env, method, path, body) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body ? new URLSearchParams(body).toString() : undefined,
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `Stripe API error: ${res.status}`);
  }
  return data;
}

async function getOrCreateStripeCustomer(env, user) {
  if (user.stripe_customer_id) return user.stripe_customer_id;

  const customer = await stripeRequest(env, 'POST', '/customers', {
    name: user.username,
    metadata: { hashidea_user_id: user.id, github_id: String(user.github_id) },
  });

  if (!customer.id) throw new Error('Failed to create Stripe customer');

  await env.DB.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?')
    .bind(customer.id, user.id).run();

  return customer.id;
}

// ── Stripe webhook signature verification ───────────

async function verifyStripeSignature(body, signature, secret) {
  const parts = signature.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    acc[key] = value;
    return acc;
  }, {});

  const timestamp = parts.t;
  const sig = parts.v1;
  if (!timestamp || !sig) return false;

  // Check timestamp (allow 5 min tolerance, reject future timestamps too)
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
  if (Math.abs(age) > 300) return false;

  const payload = `${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const expected = Array.from(new Uint8Array(signed))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time comparison via double HMAC
  const encoder = new TextEncoder();
  const cmpKey = await crypto.subtle.importKey(
    'raw', crypto.getRandomValues(new Uint8Array(32)),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const hmac1 = new Uint8Array(await crypto.subtle.sign('HMAC', cmpKey, encoder.encode(expected)));
  const hmac2 = new Uint8Array(await crypto.subtle.sign('HMAC', cmpKey, encoder.encode(sig)));
  if (hmac1.length !== hmac2.length) return false;
  let diff = 0;
  for (let i = 0; i < hmac1.length; i++) diff |= hmac1[i] ^ hmac2[i];
  return diff === 0;
}

// ── Route handlers ──────────────────────────────────

// POST /api/projects
async function createProject(request, env, user, origin) {
  if (!user) return error('Unauthorized', 401, origin);
  const body = await request.json();

  // ── Plan enforcement ──
  const plan = user.plan || 'free';
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  // Check cloud project limit
  if (limits.cloud_projects !== -1) {
    const countResult = await env.DB.prepare('SELECT COUNT(*) as count FROM projects WHERE owner_id = ?').bind(user.id).first();
    const count = countResult?.count || 0;
    if (count >= limits.cloud_projects) {
      return json({
        error: 'plan_limit',
        message: `Free plan allows ${limits.cloud_projects} cloud projects. Upgrade to save more.`,
        limit: limits.cloud_projects,
        current: count,
        plan,
      }, 403, origin);
    }
  }

  // Check private project permission
  if (body.is_public === false && limits.private_projects === 0) {
    return json({
      error: 'plan_limit',
      message: 'Private projects require a Starter plan or above.',
      feature: 'private_projects',
      plan,
    }, 403, origin);
  }

  const id = generateId();

  await env.DB.prepare(
    'INSERT INTO projects (id, owner_id, title, description, is_public, remix_from) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, user.id, body.title || 'Untitled', body.description || null, body.is_public !== false ? 1 : 0, body.remix_from || null).run();

  await env.PROJECTS.put(id, JSON.stringify(body.workspace));

  // Increment fork_count on the original project
  if (body.remix_from) {
    await env.DB.prepare('UPDATE projects SET fork_count = fork_count + 1 WHERE id = ?')
      .bind(body.remix_from).run();
  }

  return json({ id, url: `https://hashideea.com/p/${id}` }, 201, origin);
}

// GET /api/projects/:id
async function getProject(env, id, origin) {
  const project = await env.DB.prepare('SELECT p.*, u.username, u.avatar_url FROM projects p LEFT JOIN users u ON p.owner_id = u.id WHERE p.id = ?').bind(id).first();
  if (!project) return error('Not found', 404, origin);

  // Increment view count
  await env.DB.prepare('UPDATE projects SET view_count = view_count + 1 WHERE id = ?').bind(id).run();

  const workspaceData = await env.PROJECTS.get(id);
  if (!workspaceData) return error('Project data not found', 404, origin);

  const workspace = JSON.parse(await workspaceData.text());

  return json({
    ...project,
    owner: project.username ? { username: project.username, avatar_url: project.avatar_url } : null,
    workspace,
  }, 200, origin);
}

// PATCH /api/projects/:id
async function updateProject(request, env, user, id, origin) {
  if (!user) return error('Unauthorized', 401, origin);

  const project = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
  if (!project) return error('Not found', 404, origin);
  if (project.owner_id !== user.id) return error('Forbidden', 403, origin);

  const body = await request.json();

  if (body.title || body.description !== undefined || body.is_public !== undefined) {
    const updates = [];
    const values = [];
    if (body.title) { updates.push('title = ?'); values.push(body.title); }
    if (body.description !== undefined) { updates.push('description = ?'); values.push(body.description); }
    if (body.is_public !== undefined) { updates.push('is_public = ?'); values.push(body.is_public ? 1 : 0); }
    updates.push("updated_at = datetime('now')");
    values.push(id);
    await env.DB.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
  }

  if (body.workspace) {
    await env.PROJECTS.put(id, JSON.stringify(body.workspace));
  }

  return json({ ok: true }, 200, origin);
}

// DELETE /api/projects/:id
async function deleteProject(env, user, id, origin) {
  if (!user) return error('Unauthorized', 401, origin);

  const project = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
  if (!project) return error('Not found', 404, origin);
  if (project.owner_id !== user.id) return error('Forbidden', 403, origin);

  await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
  await env.PROJECTS.delete(id);

  return json({ ok: true }, 200, origin);
}

// GET /api/me
async function getMe(env, user, origin) {
  if (!user) return error('Unauthorized', 401, origin);

  const countResult = await env.DB.prepare('SELECT COUNT(*) as count FROM projects WHERE owner_id = ?').bind(user.id).first();

  const plan = user.plan || 'free';
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  return json({
    id: user.id,
    github_id: user.github_id,
    username: user.username,
    avatar_url: user.avatar_url,
    plan,
    project_count: countResult?.count || 0,
    limits,
  }, 200, origin);
}

// GET /api/me/projects
async function getMyProjects(env, user, origin) {
  if (!user) return error('Unauthorized', 401, origin);

  const { results } = await env.DB.prepare(
    'SELECT id, title, description, is_public, view_count, created_at, updated_at FROM projects WHERE owner_id = ? ORDER BY updated_at DESC'
  ).bind(user.id).all();

  return json({ projects: results }, 200, origin);
}

// GET /api/users/:username/projects
async function getUserProjects(env, username, origin) {
  const dbUser = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
  if (!dbUser) return error('User not found', 404, origin);

  const { results } = await env.DB.prepare(
    'SELECT id, title, description, is_public, view_count, created_at, updated_at FROM projects WHERE owner_id = ? AND is_public = 1 ORDER BY updated_at DESC'
  ).bind(dbUser.id).all();

  return json({ projects: results }, 200, origin);
}

// ── Billing endpoints ───────────────────────────────

// GET /api/billing/status
async function getBillingStatus(env, user, origin) {
  if (!user) return error('Unauthorized', 401, origin);

  const sub = await env.DB.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
  ).bind(user.id).first();

  if (!sub || sub.status === 'canceled') {
    return json({
      plan: user.plan || 'free',
      status: 'none',
      current_period_end: null,
      cancel_at_period_end: false,
    }, 200, origin);
  }

  return json({
    plan: sub.plan,
    status: sub.status,
    current_period_end: sub.current_period_end,
    cancel_at_period_end: !!sub.cancel_at_period_end,
  }, 200, origin);
}

// POST /api/billing/checkout
async function createCheckout(request, env, user, origin) {
  if (!user) return error('Unauthorized', 401, origin);

  const body = await request.json();
  const priceId = body.price_id;

  if (!priceId || !PRICE_TO_PLAN[priceId]) {
    return error('Invalid price ID', 400, origin);
  }

  const customerId = await getOrCreateStripeCustomer(env, user);

  try {
    const session = await stripeRequest(env, 'POST', '/checkout/sessions', {
      customer: customerId,
      mode: 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      success_url: 'https://hashideea.com/pricing?success=true',
      cancel_url: 'https://hashideea.com/pricing?canceled=true',
      'subscription_data[metadata][hashidea_user_id]': user.id,
      'subscription_data[metadata][plan]': PRICE_TO_PLAN[priceId],
    });
    return json({ url: session.url }, 200, origin);
  } catch (e) {
    return error(e.message || 'Stripe error', 500, origin);
  }
}

// POST /api/billing/portal
async function createPortal(env, user, origin) {
  if (!user) return error('Unauthorized', 401, origin);
  if (!user.stripe_customer_id) return error('No billing account', 400, origin);

  try {
    const session = await stripeRequest(env, 'POST', '/billing_portal/sessions', {
      customer: user.stripe_customer_id,
      return_url: 'https://hashideea.com/pricing',
    });
    return json({ url: session.url }, 200, origin);
  } catch (e) {
    return error(e.message || 'Stripe error', 500, origin);
  }
}

// POST /api/billing/webhook
async function handleWebhook(request, env, origin) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  // Verify webhook signature
  if (env.STRIPE_WEBHOOK_SECRET) {
    if (!signature) return error('Missing signature', 400, origin);
    const valid = await verifyStripeSignature(body, signature, env.STRIPE_WEBHOOK_SECRET);
    if (!valid) return error('Invalid signature', 400, origin);
  }

  const event = JSON.parse(body);
  const obj = event.data.object;

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const plan = PRICE_TO_PLAN[obj.items?.data?.[0]?.price?.id] || obj.metadata?.plan || 'starter';
      const customerId = obj.customer;
      const subscriptionId = obj.id;
      const status = obj.status; // active, past_due, canceled, etc.
      const periodStart = obj.current_period_start ? new Date(obj.current_period_start * 1000).toISOString() : null;
      const periodEnd = obj.current_period_end ? new Date(obj.current_period_end * 1000).toISOString() : null;
      const cancelAtPeriodEnd = obj.cancel_at_period_end ? 1 : 0;

      // Find user by stripe_customer_id
      const user = await env.DB.prepare('SELECT id FROM users WHERE stripe_customer_id = ?')
        .bind(customerId).first();

      if (user) {
        // Upsert subscription
        await env.DB.prepare(`
          INSERT INTO subscriptions (id, user_id, stripe_subscription_id, stripe_customer_id, plan, status, current_period_start, current_period_end, cancel_at_period_end, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT (stripe_subscription_id) DO UPDATE SET
            plan = excluded.plan,
            status = excluded.status,
            current_period_start = excluded.current_period_start,
            current_period_end = excluded.current_period_end,
            cancel_at_period_end = excluded.cancel_at_period_end,
            updated_at = datetime('now')
        `).bind(
          generateId(), user.id, subscriptionId, customerId, plan, status, periodStart, periodEnd, cancelAtPeriodEnd
        ).run();

        // Update user plan if subscription is active
        if (status === 'active' || status === 'trialing') {
          await env.DB.prepare('UPDATE users SET plan = ? WHERE id = ?').bind(plan, user.id).run();
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const customerId = obj.customer;
      const subscriptionId = obj.id;

      await env.DB.prepare(
        "UPDATE subscriptions SET status = 'canceled', updated_at = datetime('now') WHERE stripe_subscription_id = ?"
      ).bind(subscriptionId).run();

      // Reset user to free plan
      const user = await env.DB.prepare('SELECT id FROM users WHERE stripe_customer_id = ?')
        .bind(customerId).first();
      if (user) {
        await env.DB.prepare("UPDATE users SET plan = 'free' WHERE id = ?").bind(user.id).run();
      }
      break;
    }

    case 'invoice.payment_failed': {
      const customerId = obj.customer;
      const user = await env.DB.prepare('SELECT id FROM users WHERE stripe_customer_id = ?')
        .bind(customerId).first();
      if (user) {
        await env.DB.prepare(
          "UPDATE subscriptions SET status = 'past_due', updated_at = datetime('now') WHERE user_id = ? AND status = 'active'"
        ).bind(user.id).run();
      }
      break;
    }
  }

  return json({ received: true }, 200, origin);
}

// ── Likes ───────────────────────────────────────────

// POST /api/projects/:id/like
async function likeProject(env, user, projectId, origin) {
  if (!user) return error('Unauthorized', 401, origin);

  const existing = await env.DB.prepare('SELECT 1 FROM likes WHERE user_id = ? AND project_id = ?')
    .bind(user.id, projectId).first();
  if (existing) {
    const count = (await env.DB.prepare('SELECT like_count FROM projects WHERE id = ?').bind(projectId).first())?.like_count || 0;
    return json({ liked: true, like_count: count }, 200, origin);
  }

  await env.DB.prepare('INSERT INTO likes (user_id, project_id) VALUES (?, ?)').bind(user.id, projectId).run();
  await env.DB.prepare('UPDATE projects SET like_count = like_count + 1 WHERE id = ?').bind(projectId).run();
  const count = (await env.DB.prepare('SELECT like_count FROM projects WHERE id = ?').bind(projectId).first())?.like_count || 0;
  return json({ liked: true, like_count: count }, 200, origin);
}

// DELETE /api/projects/:id/like
async function unlikeProject(env, user, projectId, origin) {
  if (!user) return error('Unauthorized', 401, origin);

  const existing = await env.DB.prepare('SELECT 1 FROM likes WHERE user_id = ? AND project_id = ?')
    .bind(user.id, projectId).first();
  if (!existing) {
    const count = (await env.DB.prepare('SELECT like_count FROM projects WHERE id = ?').bind(projectId).first())?.like_count || 0;
    return json({ liked: false, like_count: count }, 200, origin);
  }

  await env.DB.prepare('DELETE FROM likes WHERE user_id = ? AND project_id = ?').bind(user.id, projectId).run();
  await env.DB.prepare('UPDATE projects SET like_count = MAX(0, like_count - 1) WHERE id = ?').bind(projectId).run();
  const count = (await env.DB.prepare('SELECT like_count FROM projects WHERE id = ?').bind(projectId).first())?.like_count || 0;
  return json({ liked: false, like_count: count }, 200, origin);
}

// ── Bookmarks ───────────────────────────────────────

// POST /api/projects/:id/bookmark
async function bookmarkProject(env, user, projectId, origin) {
  if (!user) return error('Unauthorized', 401, origin);

  const existing = await env.DB.prepare('SELECT 1 FROM bookmarks WHERE user_id = ? AND project_id = ?')
    .bind(user.id, projectId).first();
  if (!existing) {
    await env.DB.prepare('INSERT INTO bookmarks (user_id, project_id) VALUES (?, ?)').bind(user.id, projectId).run();
  }
  return json({ bookmarked: true }, 200, origin);
}

// DELETE /api/projects/:id/bookmark
async function unbookmarkProject(env, user, projectId, origin) {
  if (!user) return error('Unauthorized', 401, origin);
  await env.DB.prepare('DELETE FROM bookmarks WHERE user_id = ? AND project_id = ?').bind(user.id, projectId).run();
  return json({ bookmarked: false }, 200, origin);
}

// GET /api/me/bookmarks
async function getMyBookmarks(env, user, request, origin) {
  if (!user) return error('Unauthorized', 401, origin);

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;

  const countResult = await env.DB.prepare('SELECT COUNT(*) as total FROM bookmarks WHERE user_id = ?').bind(user.id).first();
  const total = countResult?.total || 0;

  const { results } = await env.DB.prepare(`
    SELECT p.id, p.title, p.description, p.view_count, p.fork_count, p.like_count, p.tags, p.created_at, p.updated_at,
           u.username, u.avatar_url
    FROM bookmarks b
    JOIN projects p ON b.project_id = p.id
    LEFT JOIN users u ON p.owner_id = u.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(user.id, limit, offset).all();

  const projects = (results || []).map(r => ({
    id: r.id, title: r.title, description: r.description,
    view_count: r.view_count, fork_count: r.fork_count, like_count: r.like_count,
    tags: r.tags || '', created_at: r.created_at, updated_at: r.updated_at,
    owner: r.username ? { username: r.username, avatar_url: r.avatar_url } : null,
  }));

  return json({ projects, total, page, pages: Math.ceil(total / limit) }, 200, origin);
}

// ── Follows ─────────────────────────────────────────

// POST /api/users/:username/follow
async function followUser(env, user, username, origin) {
  if (!user) return error('Unauthorized', 401, origin);

  const target = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
  if (!target) return error('User not found', 404, origin);
  if (target.id === user.id) return error('Cannot follow yourself', 400, origin);

  const existing = await env.DB.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?')
    .bind(user.id, target.id).first();
  if (!existing) {
    await env.DB.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').bind(user.id, target.id).run();
  }
  return json({ following: true }, 200, origin);
}

// DELETE /api/users/:username/follow
async function unfollowUser(env, user, username, origin) {
  if (!user) return error('Unauthorized', 401, origin);

  const target = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
  if (!target) return error('User not found', 404, origin);

  await env.DB.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').bind(user.id, target.id).run();
  return json({ following: false }, 200, origin);
}

// GET /api/users/:username (enhanced profile)
async function getUserProfile(env, user, username, origin) {
  const dbUser = await env.DB.prepare('SELECT id, username, avatar_url, bio, website, created_at FROM users WHERE username = ?')
    .bind(username).first();
  if (!dbUser) return error('User not found', 404, origin);

  const projectCount = (await env.DB.prepare('SELECT COUNT(*) as c FROM projects WHERE owner_id = ? AND is_public = 1').bind(dbUser.id).first())?.c || 0;
  const totalViews = (await env.DB.prepare('SELECT COALESCE(SUM(view_count), 0) as v FROM projects WHERE owner_id = ?').bind(dbUser.id).first())?.v || 0;
  const followerCount = (await env.DB.prepare('SELECT COUNT(*) as c FROM follows WHERE following_id = ?').bind(dbUser.id).first())?.c || 0;
  const followingCount = (await env.DB.prepare('SELECT COUNT(*) as c FROM follows WHERE follower_id = ?').bind(dbUser.id).first())?.c || 0;

  let isFollowing = false;
  if (user) {
    isFollowing = !!(await env.DB.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').bind(user.id, dbUser.id).first());
  }

  return json({
    username: dbUser.username,
    avatar_url: dbUser.avatar_url,
    bio: dbUser.bio || '',
    website: dbUser.website || '',
    created_at: dbUser.created_at,
    project_count: projectCount,
    total_views: totalViews,
    follower_count: followerCount,
    following_count: followingCount,
    is_following: isFollowing,
  }, 200, origin);
}

// PATCH /api/me/profile
async function updateProfile(request, env, user, origin) {
  if (!user) return error('Unauthorized', 401, origin);
  const body = await request.json();

  const updates = [];
  const values = [];
  if (body.bio !== undefined) { updates.push('bio = ?'); values.push(String(body.bio).slice(0, 200)); }
  if (body.website !== undefined) { updates.push('website = ?'); values.push(String(body.website).slice(0, 200)); }

  if (updates.length === 0) return json({ ok: true }, 200, origin);

  values.push(user.id);
  await env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
  return json({ ok: true }, 200, origin);
}

// GET /api/me/feed
async function getMyFeed(env, user, request, origin) {
  if (!user) return error('Unauthorized', 401, origin);

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;

  const countResult = await env.DB.prepare(`
    SELECT COUNT(*) as total FROM projects p
    JOIN follows f ON f.following_id = p.owner_id
    WHERE f.follower_id = ? AND p.is_public = 1
  `).bind(user.id).first();
  const total = countResult?.total || 0;

  const { results } = await env.DB.prepare(`
    SELECT p.id, p.title, p.description, p.view_count, p.fork_count, p.like_count, p.tags, p.created_at, p.updated_at,
           u.username, u.avatar_url
    FROM projects p
    JOIN follows f ON f.following_id = p.owner_id
    JOIN users u ON p.owner_id = u.id
    WHERE f.follower_id = ? AND p.is_public = 1
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(user.id, limit, offset).all();

  const projects = (results || []).map(r => ({
    id: r.id, title: r.title, description: r.description,
    view_count: r.view_count, fork_count: r.fork_count, like_count: r.like_count,
    tags: r.tags || '', created_at: r.created_at, updated_at: r.updated_at,
    owner: r.username ? { username: r.username, avatar_url: r.avatar_url } : null,
  }));

  return json({ projects, total, page, pages: Math.ceil(total / limit) }, 200, origin);
}

// ── Custom Domains ──────────────────────────────────

// POST /api/projects/:id/domain
async function addDomain(request, env, user, projectId, origin) {
  if (!user) return error('Unauthorized', 401, origin);

  const project = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first();
  if (!project) return error('Project not found', 404, origin);
  if (project.owner_id !== user.id) return error('Forbidden', 403, origin);

  const plan = user.plan || 'free';
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  if (limits.custom_domains === 0) {
    return json({ error: 'plan_limit', message: 'Custom domains require a Starter plan or above.', feature: 'custom_domains', plan }, 403, origin);
  }

  // Check domain count
  const domainCount = (await env.DB.prepare('SELECT COUNT(*) as c FROM custom_domains WHERE user_id = ?').bind(user.id).first())?.c || 0;
  if (domainCount >= limits.custom_domains) {
    return json({ error: 'plan_limit', message: `Your ${plan} plan allows ${limits.custom_domains} custom domain${limits.custom_domains > 1 ? 's' : ''}. Upgrade for more.`, feature: 'custom_domains', plan }, 403, origin);
  }

  const body = await request.json();
  let domain = (body.domain || '').toLowerCase().trim();

  // Strip protocol and trailing slash
  domain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  if (!domain || domain.includes('/') || !domain.includes('.')) {
    return error('Invalid domain', 400, origin);
  }

  // Check domain not already taken
  const existing = await env.DB.prepare('SELECT * FROM custom_domains WHERE domain = ?').bind(domain).first();
  if (existing) {
    if (existing.user_id === user.id) return error('You already own this domain', 400, origin);
    return error('Domain already in use', 409, origin);
  }

  const id = generateId();
  await env.DB.prepare('INSERT INTO custom_domains (id, domain, project_id, user_id) VALUES (?, ?, ?, ?)')
    .bind(id, domain, projectId, user.id).run();

  return json({
    id, domain, project_id: projectId, verified: false,
    cname_target: 'projects.hashideea.dev',
    instructions: `Add a CNAME record for "${domain}" pointing to "projects.hashideea.dev"`,
  }, 201, origin);
}

// DELETE /api/projects/:id/domain
async function removeDomain(env, user, projectId, origin) {
  if (!user) return error('Unauthorized', 401, origin);

  const domain = await env.DB.prepare('SELECT * FROM custom_domains WHERE project_id = ? AND user_id = ?')
    .bind(projectId, user.id).first();
  if (!domain) return error('No domain found', 404, origin);

  await env.DB.prepare('DELETE FROM custom_domains WHERE id = ?').bind(domain.id).run();
  return json({ ok: true }, 200, origin);
}

// GET /api/projects/:id/domain
async function getDomain(env, user, projectId, origin) {
  if (!user) return error('Unauthorized', 401, origin);

  const domain = await env.DB.prepare('SELECT * FROM custom_domains WHERE project_id = ? AND user_id = ?')
    .bind(projectId, user.id).first();

  if (!domain) return json({ domain: null }, 200, origin);

  return json({
    id: domain.id,
    domain: domain.domain,
    verified: !!domain.verified,
    cname_target: 'projects.hashideea.dev',
    created_at: domain.created_at,
  }, 200, origin);
}

// GET /api/domains/lookup?domain=myapp.com (public, used by proxy)
async function lookupDomain(request, env, origin) {
  const url = new URL(request.url);
  const domain = (url.searchParams.get('domain') || '').toLowerCase().trim();
  if (!domain) return error('Domain required', 400, origin);

  const record = await env.DB.prepare(
    'SELECT cd.project_id, cd.verified FROM custom_domains cd WHERE cd.domain = ?'
  ).bind(domain).first();

  if (!record) return error('Domain not found', 404, origin);

  return json({
    project_id: record.project_id,
    verified: !!record.verified,
    embed_url: `https://hashideea.com/embed/${record.project_id}?hideHeader=true`,
  }, 200, origin);
}

// ── Gallery ─────────────────────────────────────────

// GET /api/gallery
async function getGallery(request, env, origin) {
  const url = new URL(request.url);
  const sort = url.searchParams.get('sort') || 'trending';
  const q = url.searchParams.get('q') || '';
  const tag = url.searchParams.get('tag') || '';
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;

  // Build WHERE clause
  let where = 'WHERE p.is_public = 1';
  const bindings = [];

  if (q) {
    where += ' AND (p.title LIKE ? OR p.description LIKE ?)';
    bindings.push(`%${q}%`, `%${q}%`);
  }
  if (tag) {
    where += ' AND p.tags LIKE ?';
    bindings.push(`%${tag}%`);
  }

  // Build ORDER BY
  let orderBy;
  switch (sort) {
    case 'latest':
      orderBy = 'p.created_at DESC';
      break;
    case 'most_viewed':
      orderBy = 'p.view_count DESC';
      break;
    case 'most_forked':
      orderBy = 'p.fork_count DESC';
      break;
    case 'trending':
    default:
      // Trending: (views + 5*forks + 2*likes) * decay where decay = 1/(1 + age_in_days)
      orderBy = "(p.view_count + p.fork_count * 5 + p.like_count * 2) * (1.0 / (1.0 + (julianday('now') - julianday(p.created_at)))) DESC";
      break;
  }

  // Count total
  const countQuery = `SELECT COUNT(*) as total FROM projects p ${where}`;
  const countResult = await env.DB.prepare(countQuery).bind(...bindings).first();
  const total = countResult?.total || 0;

  // Fetch projects
  const query = `
    SELECT p.id, p.title, p.description, p.view_count, p.fork_count, p.like_count, p.tags, p.created_at, p.updated_at,
           u.username, u.avatar_url
    FROM projects p
    LEFT JOIN users u ON p.owner_id = u.id
    ${where}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const { results } = await env.DB.prepare(query)
    .bind(...bindings, limit, offset)
    .all();

  const projects = (results || []).map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    view_count: r.view_count,
    fork_count: r.fork_count,
    like_count: r.like_count || 0,
    tags: r.tags || '',
    created_at: r.created_at,
    updated_at: r.updated_at,
    owner: r.username ? { username: r.username, avatar_url: r.avatar_url } : null,
  }));

  return json({
    projects,
    total,
    page,
    pages: Math.ceil(total / limit),
  }, 200, origin);
}

// ── Router ──────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const origin = request.headers.get('Origin');

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    try {
      // Auth (lazy — only resolve when needed)
      let userPromise = null;
      const getUser = () => {
        if (!userPromise) userPromise = authenticate(request, env);
        return userPromise;
      };

      // Projects
      if (path === '/api/projects' && method === 'POST') {
        return createProject(request, env, await getUser(), origin);
      }

      const projectMatch = path.match(/^\/api\/projects\/([a-z0-9]+)$/);
      if (projectMatch) {
        const id = projectMatch[1];
        if (method === 'GET') return getProject(env, id, origin);
        if (method === 'PATCH') return updateProject(request, env, await getUser(), id, origin);
        if (method === 'DELETE') return deleteProject(env, await getUser(), id, origin);
      }

      // Users
      if (path === '/api/me' && method === 'GET') {
        return getMe(env, await getUser(), origin);
      }
      if (path === '/api/me/projects' && method === 'GET') {
        return getMyProjects(env, await getUser(), origin);
      }

      const userMatch = path.match(/^\/api\/users\/([^/]+)\/projects$/);
      if (userMatch && method === 'GET') {
        return getUserProjects(env, userMatch[1], origin);
      }

      // User profile + follow
      const userProfileMatch = path.match(/^\/api\/users\/([^/]+)$/);
      if (userProfileMatch && method === 'GET') {
        return getUserProfile(env, await getUser(), userProfileMatch[1], origin);
      }

      const followMatch = path.match(/^\/api\/users\/([^/]+)\/follow$/);
      if (followMatch) {
        if (method === 'POST') return followUser(env, await getUser(), followMatch[1], origin);
        if (method === 'DELETE') return unfollowUser(env, await getUser(), followMatch[1], origin);
      }

      // Likes
      const likeMatch = path.match(/^\/api\/projects\/([a-z0-9]+)\/like$/);
      if (likeMatch) {
        if (method === 'POST') return likeProject(env, await getUser(), likeMatch[1], origin);
        if (method === 'DELETE') return unlikeProject(env, await getUser(), likeMatch[1], origin);
      }

      // Bookmarks
      const bookmarkMatch = path.match(/^\/api\/projects\/([a-z0-9]+)\/bookmark$/);
      if (bookmarkMatch) {
        if (method === 'POST') return bookmarkProject(env, await getUser(), bookmarkMatch[1], origin);
        if (method === 'DELETE') return unbookmarkProject(env, await getUser(), bookmarkMatch[1], origin);
      }

      if (path === '/api/me/bookmarks' && method === 'GET') {
        return getMyBookmarks(env, await getUser(), request, origin);
      }

      if (path === '/api/me/profile' && method === 'PATCH') {
        return updateProfile(request, env, await getUser(), origin);
      }

      if (path === '/api/me/feed' && method === 'GET') {
        return getMyFeed(env, await getUser(), request, origin);
      }

      // Custom domains
      const domainMatch = path.match(/^\/api\/projects\/([a-z0-9]+)\/domain$/);
      if (domainMatch) {
        if (method === 'POST') return addDomain(request, env, await getUser(), domainMatch[1], origin);
        if (method === 'DELETE') return removeDomain(env, await getUser(), domainMatch[1], origin);
        if (method === 'GET') return getDomain(env, await getUser(), domainMatch[1], origin);
      }

      if (path === '/api/domains/lookup' && method === 'GET') {
        return lookupDomain(request, env, origin);
      }

      // Gallery
      if (path === '/api/gallery' && method === 'GET') {
        return getGallery(request, env, origin);
      }

      // Billing
      if (path === '/api/billing/status' && method === 'GET') {
        return getBillingStatus(env, await getUser(), origin);
      }
      if (path === '/api/billing/checkout' && method === 'POST') {
        return createCheckout(request, env, await getUser(), origin);
      }
      if (path === '/api/billing/portal' && method === 'POST') {
        return createPortal(env, await getUser(), origin);
      }
      if (path === '/api/billing/webhook' && method === 'POST') {
        return handleWebhook(request, env, origin);
      }

      return error('Not found', 404, origin);
    } catch (e) {
      console.error(e);
      return error('Internal server error', 500, origin);
    }
  },
};
