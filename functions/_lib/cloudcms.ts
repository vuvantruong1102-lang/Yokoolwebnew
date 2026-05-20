// ============================================================
// CloudCMS integration helpers - dùng chung cho tất cả functions
// ============================================================

export type Env = {
  CLOUDCMS_API: string; // env variable, set trong Pages settings
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_html: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  focus_keyword: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  og_type: string;
  twitter_card: string;
  schema_type: string;
  schema_json: string | null;
  featured_image_alt: string | null;
  robots_index: number;
  robots_follow: number;
  view_count: number;
  reading_time: number | null;
  word_count: number | null;
  published_at: number | null;
  updated_at: number;
  author_name?: string;
  author_avatar?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  tags?: Array<{ id: string; name: string; slug: string }>;
};

const DEFAULT_API = 'https://cloudcms-api.vuvantruong1102.workers.dev';

export function apiBase(env: Env): string {
  return (env.CLOUDCMS_API ?? DEFAULT_API).replace(/\/+$/, '');
}

export async function fetchPostsList(
  env: Env,
  opts: { page?: number; limit?: number; category?: string } = {}
): Promise<{ items: Post[]; page: number; limit: number }> {
  const params = new URLSearchParams();
  if (opts.page) params.set('page', String(opts.page));
  if (opts.limit) params.set('limit', String(opts.limit));
  if (opts.category) params.set('category', opts.category);

  const url = `${apiBase(env)}/api/public/posts?${params}`;
  const resp = await fetch(url, { cf: { cacheTtl: 300, cacheEverything: true } });
  if (!resp.ok) throw new Error(`Posts API error: ${resp.status}`);
  return resp.json();
}

export async function fetchPostBySlug(env: Env, slug: string): Promise<Post | null> {
  const url = `${apiBase(env)}/api/public/posts/${encodeURIComponent(slug)}`;
  const resp = await fetch(url, { cf: { cacheTtl: 300, cacheEverything: true } });
  if (resp.status === 404) return null;
  if (!resp.ok) throw new Error(`Post API error: ${resp.status}`);
  return resp.json();
}

// HTML escape (chỉ dùng cho text plain, không dùng cho content_html đã render)
export function escapeHtml(s: string | null | undefined): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]!));
}

// Format ngày tháng VN
export function formatDateVN(timestamp: number | null): string {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function isoDate(timestamp: number | null): string {
  return timestamp ? new Date(timestamp).toISOString() : '';
}

// Build SEO meta tags từ Post
export function buildMetaTags(post: Post, baseUrl: string): string {
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || '';
  const canonical = post.canonical_url || `${baseUrl}/news/${post.slug}.html`;
  const ogImage = post.og_image_url || '';
  const robots = [
    post.robots_index ? 'index' : 'noindex',
    post.robots_follow ? 'follow' : 'nofollow',
  ].join(',');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': post.schema_type || 'Article',
    headline: post.title,
    description: description,
    image: ogImage || undefined,
    datePublished: isoDate(post.published_at),
    dateModified: isoDate(post.updated_at),
    author: post.author_name ? { '@type': 'Person', name: post.author_name } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Yokool',
      logo: { '@type': 'ImageObject', url: `${baseUrl}/images/yokool-logo.png` },
    },
    mainEntityOfPage: canonical,
  };

  return `
    <title>${escapeHtml(title)} | Yokool</title>
    <meta name="description" content="${escapeHtml(description)}">
    ${post.meta_keywords ? `<meta name="keywords" content="${escapeHtml(post.meta_keywords)}">` : ''}
    <meta name="robots" content="${robots}">
    <link rel="canonical" href="${escapeHtml(canonical)}">

    <meta property="og:type" content="${escapeHtml(post.og_type || 'article')}">
    <meta property="og:title" content="${escapeHtml(post.og_title || title)}">
    <meta property="og:description" content="${escapeHtml(post.og_description || description)}">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : ''}
    <meta property="og:site_name" content="Yokool">
    <meta property="og:locale" content="vi_VN">

    <meta name="twitter:card" content="${escapeHtml(post.twitter_card || 'summary_large_image')}">
    <meta name="twitter:title" content="${escapeHtml(post.og_title || title)}">
    <meta name="twitter:description" content="${escapeHtml(post.og_description || description)}">
    ${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}">` : ''}

    <meta property="article:published_time" content="${isoDate(post.published_at)}">
    <meta property="article:modified_time" content="${isoDate(post.updated_at)}">
    ${post.author_name ? `<meta property="article:author" content="${escapeHtml(post.author_name)}">` : ''}

    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  `.trim();
}
