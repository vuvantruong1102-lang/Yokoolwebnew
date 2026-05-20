// ============================================================
// /functions/news/[slug].ts
// Trang chi tiết bài viết - SSR, SEO tối ưu
// URL: /news/<slug> (không cần .html ở cuối)
// ============================================================

import { type Env, fetchPostBySlug, buildMetaTags, escapeHtml, formatDateVN } from '../_lib/cloudcms';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  let slug = context.params.slug as string;
  if (!slug) return new Response('Not found', { status: 404 });

  // Cho phép truy cập với hoặc không có .html
  if (slug.endsWith('.html')) slug = slug.slice(0, -5);

  const baseUrl = new URL(context.request.url).origin;

  try {
    const post = await fetchPostBySlug(context.env, slug);
    if (!post) return new Response(notFoundHtml(baseUrl), {
      status: 404,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });

    const html = renderPostPage(post, baseUrl);
    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        // Cache 5 phút ở edge, 1 phút ở browser
        'cache-control': 'public, max-age=60, s-maxage=300',
      },
    });
  } catch (err: any) {
    console.error('Error rendering post:', err);
    return new Response(`Server error: ${err.message}`, { status: 500 });
  }
};

function renderPostPage(post: any, baseUrl: string): string {
  const dateStr = formatDateVN(post.published_at);
  const tagsHtml = (post.tags ?? [])
    .map((t: any) => `<span class="post-tag">${escapeHtml(t.name)}</span>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${buildMetaTags(post, baseUrl)}

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/news-detail.css">
  <link rel="icon" type="image/png" href="/images/yokool-logo.png">
</head>
<body>
  <!-- HEADER (giống index.html) -->
  <header class="site-header" id="siteHeader">
    <div class="header-inner">
      <a href="/" class="logo-link" aria-label="Yokool Trang chủ">
        <img src="/images/yokool-logo.png" alt="Yokool" class="logo">
      </a>
      <nav class="main-nav" id="mainNav">
        <a href="/">Trang chủ</a>
        <div class="nav-dropdown">
          <button class="nav-trigger" aria-haspopup="true">Sản phẩm <span class="nav-arrow">▾</span></button>
          <div class="nav-menu">
            <a href="/products/jp395.html">JP395 — Sạc dự phòng</a>
            <a href="/products/rc502.html">RC502 — Củ sạc</a>
            <a href="/products/sl207.html">SL207 — Ổ điện du lịch</a>
            <a href="/products/ol212.html">OL212 — Ổ điện du lịch</a>
          </div>
        </div>
        <a href="/news.html" class="nav-active">Tin tức</a>
        <a href="/b2b.html">B2B</a>
        <a href="/lien-he.html">Liên hệ</a>
      </nav>
      <button class="mobile-toggle" id="mobileToggle" aria-label="Menu">☰</button>
    </div>
  </header>

  <!-- BREADCRUMB -->
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <div class="breadcrumb-inner">
      <a href="/">Trang chủ</a>
      <span class="breadcrumb-sep">›</span>
      <a href="/news.html">Tin tức</a>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">${escapeHtml(post.title)}</span>
    </div>
  </nav>

  <!-- ARTICLE -->
  <main class="post-page">
    <article class="post-article">
      <header class="post-header">
        ${post.category_name ? `<a href="/news.html?category=${encodeURIComponent(post.category_slug)}" class="post-category">${escapeHtml(post.category_name)}</a>` : ''}
        <h1 class="post-title">${escapeHtml(post.title)}</h1>
        ${post.excerpt ? `<p class="post-excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
        <div class="post-meta">
          ${post.author_name ? `<span class="post-author">Bởi <strong>${escapeHtml(post.author_name)}</strong></span>` : ''}
          ${dateStr ? `<time class="post-date" datetime="${new Date(post.published_at).toISOString()}">${dateStr}</time>` : ''}
          ${post.reading_time ? `<span class="post-reading">${post.reading_time} phút đọc</span>` : ''}
        </div>
      </header>

      ${post.og_image_url ? `
        <figure class="post-hero">
          <img src="${escapeHtml(post.og_image_url)}" alt="${escapeHtml(post.featured_image_alt ?? post.title)}" loading="eager">
          ${post.featured_image_alt ? `<figcaption>${escapeHtml(post.featured_image_alt)}</figcaption>` : ''}
        </figure>
      ` : ''}

      <div class="post-content prose">
        ${post.content_html ?? ''}
      </div>

      ${tagsHtml ? `<div class="post-tags">${tagsHtml}</div>` : ''}

      <!-- Share buttons -->
      <div class="post-share">
        <span class="share-label">Chia sẻ:</span>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl + '/news/' + post.slug + '.html')}" target="_blank" rel="noopener" aria-label="Chia sẻ Facebook">Facebook</a>
        <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(baseUrl + '/news/' + post.slug + '.html')}&text=${encodeURIComponent(post.title)}" target="_blank" rel="noopener" aria-label="Chia sẻ X/Twitter">X</a>
        <a href="https://zalo.me/share/url?u=${encodeURIComponent(baseUrl + '/news/' + post.slug + '.html')}" target="_blank" rel="noopener" aria-label="Chia sẻ Zalo">Zalo</a>
      </div>
    </article>

    <!-- CTA mua sản phẩm -->
    <aside class="post-cta-box">
      <h3>Khám phá sản phẩm Yokool</h3>
      <p>Sạc thông minh, nhẹ gánh hành trình. Giải pháp sạc cao cấp cho người năng động.</p>
      <a href="/" class="cta-button">Xem sản phẩm <span class="cta-arrow">→</span></a>
    </aside>
  </main>

  <!-- FOOTER (giống index.html, rút gọn ở đây) -->
  <footer class="site-footer">
    <div class="footer-inner">
      <p>© 2026 Yokool — Stay powered. Stay cool. · <a href="/lien-he.html">Liên hệ</a> · <a href="/b2b.html">B2B</a></p>
    </div>
  </footer>

  <script src="/script.js"></script>
</body>
</html>`;
}

function notFoundHtml(baseUrl: string): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Không tìm thấy bài viết | Yokool</title>
  <meta name="robots" content="noindex">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <main style="padding: 80px 20px; text-align: center;">
    <h1 style="font-size: 32px; margin-bottom: 16px;">Không tìm thấy bài viết</h1>
    <p style="color: #666; margin-bottom: 24px;">Bài viết bạn tìm có thể đã bị xoá hoặc URL không đúng.</p>
    <a href="/news.html" style="color: #DC143B; text-decoration: underline;">← Quay lại trang tin tức</a>
  </main>
</body>
</html>`;
}
