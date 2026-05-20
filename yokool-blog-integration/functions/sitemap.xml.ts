// ============================================================
// /functions/sitemap.xml.ts
// Sitemap động cho yokool.vn
// Gộp: static pages + blog posts từ CloudCMS + bài static cũ (đã hardcode list)
// ============================================================

import { type Env, apiBase } from './_lib/cloudcms';

// Các trang tĩnh chính của website
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

// Các bài viết static cũ - liệt kê thủ công để không bị mất khi build sitemap
// Khi nào migrate hết sang CMS thì xoá list này
const STATIC_BLOG_POSTS = [
  '/news/rc502-gan-65w-mini.html',
  '/news/rc502-sac-laptop-vs-truyen-thong.html',
  '/news/rc502-tinh-hop-day-thiet-ke.html',
  '/news/jp395-magsafe-10000mah.html',
  '/news/jp395-chon-pin-du-phong.html',
  '/news/jp395-magsafe-iphone.html',
  '/news/ol212-o-dien-du-lich-180-quoc-gia.html',
  '/news/sl207-pd35w-5-thiet-bi.html',
  '/news/so-sanh-ol212-vs-sl207.html',
  '/news/cong-nghe-gan-la-gi.html',
];

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const baseUrl = new URL(context.request.url).origin;
  const today = new Date().toISOString().split('T')[0];

  // 1. Static pages
  const staticXml = STATIC_PAGES.map(p => `
  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('');

  // 2. Static blog posts cũ
  const staticBlogXml = STATIC_BLOG_POSTS.map(loc => `
  <url>
    <loc>${baseUrl}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

  // 3. CMS blog posts
  let cmsBlogXml = '';
  try {
    const resp = await fetch(`${apiBase(context.env)}/api/public/posts?limit=1000`, {
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (resp.ok) {
      const data = await resp.json() as { items: Array<{ slug: string; published_at: number; updated_at?: number }> };
      cmsBlogXml = data.items.map(p => {
        const lastmod = p.updated_at
          ? new Date(p.updated_at).toISOString().split('T')[0]
          : (p.published_at ? new Date(p.published_at).toISOString().split('T')[0] : today);
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
    console.error('Sitemap CMS fetch failed:', err);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticXml}${staticBlogXml}${cmsBlogXml}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=600',
    },
  });
};
