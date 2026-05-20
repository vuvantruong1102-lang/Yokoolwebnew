// ============================================================
// /functions/sitemap.xml.ts
// Sitemap động: static pages + blog posts (fetch từ CloudCMS)
// URL: /sitemap.xml
// ============================================================

import { type Env, apiBase } from './_lib/cloudcms';

// Các trang tĩnh của website
const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/b2b.html', priority: '0.9', changefreq: 'monthly' },
  { loc: '/news.html', priority: '0.8', changefreq: 'daily' },
  { loc: '/products/jp395.html', priority: '0.9', changefreq: 'monthly' },
  { loc: '/products/rc502.html', priority: '0.9', changefreq: 'monthly' },
  { loc: '/products/sl207.html', priority: '0.9', changefreq: 'monthly' },
  { loc: '/products/ol212.html', priority: '0.9', changefreq: 'monthly' },
  { loc: '/lien-he.html', priority: '0.6', changefreq: 'monthly' },
  { loc: '/faq.html', priority: '0.6', changefreq: 'monthly' },
  { loc: '/bao-hanh.html', priority: '0.6', changefreq: 'monthly' },
  { loc: '/van-chuyen.html', priority: '0.6', changefreq: 'monthly' },
];

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const baseUrl = new URL(context.request.url).origin;
  const today = new Date().toISOString().split('T')[0];

  // Static pages XML
  const staticXml = STATIC_PAGES.map(p => `
  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('');

  // Blog posts từ CloudCMS
  let blogXml = '';
  try {
    const resp = await fetch(`${apiBase(context.env)}/api/public/posts?limit=1000`, {
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (resp.ok) {
      const data = await resp.json() as { items: Array<{ slug: string; published_at: number }> };
      blogXml = data.items.map(p => {
        const lastmod = p.published_at ? new Date(p.published_at).toISOString().split('T')[0] : today;
        return `
  <url>
    <loc>${baseUrl}/news/${p.slug}.html</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }).join('');
    }
  } catch (err) {
    console.error('Sitemap blog fetch failed:', err);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticXml}${blogXml}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=600',
    },
  });
};
