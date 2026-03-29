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
  free:    { cloud_projects: 3,  private_projects: 0 },
  starter: { cloud_projects: -1, private_projects: -1 }, // -1 = unlimited
  pro:     { cloud_projects: -1, private_projects: -1 },
  team:    { cloud_projects: -1, private_projects: -1 },
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
