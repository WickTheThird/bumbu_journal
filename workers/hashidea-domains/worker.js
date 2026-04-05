/**
 * HashIDEA Domain Proxy Worker
 *
 * Deploy on: hashidea-domains.bumbufilip22.workers.dev
 *
 * When a custom domain (e.g. myapp.com) CNAMEs to hashidea-domains.bumbufilip22.workers.dev,
 * this worker reads the Host header, looks up the project ID via the API,
 * and redirects to the embed page.
 *
 * Setup:
 *   1. Create this Worker in Cloudflare dashboard
 *   2. Add a custom domain: hashidea-domains.bumbufilip22.workers.dev
 *   3. Users CNAME their domains to hashidea-domains.bumbufilip22.workers.dev
 *   4. Cloudflare auto-provisions SSL for each custom domain
 *
 * Environment variables:
 *   API_BASE → https://hashidea-api.bumbufilip22.workers.dev
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = request.headers.get('Host') || '';

    // Skip if it's the base domain itself (not a custom domain)
    if (host === 'hashidea-domains.bumbufilip22.workers.dev' || host.endsWith('.workers.dev')) {
      return new Response('HashIDEA Domain Proxy\n\nPoint your CNAME to hashidea-domains.bumbufilip22.workers.dev to host your project.', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Look up the domain
    const apiBase = env.API_BASE || 'https://hashidea-api.bumbufilip22.workers.dev';

    try {
      const lookupRes = await fetch(`${apiBase}/api/domains/lookup?domain=${encodeURIComponent(host)}`);
      const data = await lookupRes.json();

      if (!lookupRes.ok || !data.project_id) {
        return new Response(`
<!DOCTYPE html>
<html>
<head><title>Domain not configured</title>
<style>body{font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#08090d;color:#e2e8f0}
.c{text-align:center;max-width:400px;padding:2rem}h1{color:#8b5cf6;margin-bottom:1rem}a{color:#8b5cf6}</style></head>
<body><div class="c">
<h1>Domain not configured</h1>
<p>This domain is not linked to a HashIDEA project.</p>
<p><a href="https://hashideea.com">Visit HashIDEA</a></p>
</div></body></html>`, {
          status: 404,
          headers: { 'Content-Type': 'text/html' },
        });
      }

      // Fetch the embed page and serve it directly
      const embedUrl = `https://hashideea.com/embed/${data.project_id}?hideHeader=true`;
      const embedRes = await fetch(embedUrl, {
        headers: { 'User-Agent': 'HashIDEA-DomainProxy' },
      });

      // Return the embed page with the custom domain's origin
      const body = await embedRes.text();
      return new Response(body, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=60',
          'X-HashIDEA-Project': data.project_id,
        },
      });
    } catch (e) {
      return new Response('Internal error', { status: 500 });
    }
  },
};
