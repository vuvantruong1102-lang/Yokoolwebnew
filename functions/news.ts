// ============================================================
// /functions/news.ts
// Render trang list bài viết tại /news (catch trước file news.html cũ)
// ============================================================

import { type Env, fetchPostsList, escapeHtml, formatDateVN } from './_lib/cloudcms';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const category = url.searchParams.get('category') ?? undefined;
  const baseUrl = url.origin;

  try {
    const { items } = await fetchPostsList(context.env, { page, limit: 12, category });

    const html = renderListPage(items, page, baseUrl, category);
    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=60, s-maxage=300',
      },
    });
  } catch (err: any) {
    console.error('Error rendering news list:', err);
    // Fallback: render empty state thay vì 500
    return new Response(renderListPage([], 1, baseUrl), {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }
};

function renderListPage(posts: any[], page: number, baseUrl: string, category?: string): string {
  const title = category ? `Tin tức - ${category} | Yokool` : 'Tin tức | Yokool';
  const description = 'Cập nhật tin tức, mẹo sạc, hướng dẫn sử dụng và các bài viết mới nhất từ Yokool.';

  const postsHtml = posts.length === 0
    ? `<div class="news-empty">
         <p>Chưa có bài viết nào.</p>
         <a href="/" class="cta-button">Về trang chủ <span class="cta-arrow">→</span></a>
       </div>`
    : posts.map(renderPostCard).join('');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${baseUrl}/news.html">

  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${baseUrl}/news.html">
  <meta property="og:site_name" content="Yokool">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/news-detail.css">
  <link rel="icon" type="image/png" href="/images/yokool-logo.png">
</head>
<body>
  <!-- HEADER -->
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

  <!-- PAGE HEADER -->
  <section class="news-hero">
    <div class="news-hero-inner">
      <h1>Tin tức Yokool</h1>
      <p>Mẹo sạc, hướng dẫn, cập nhật sản phẩm và câu chuyện thương hiệu.</p>
    </div>
  </section>

  <!-- POSTS GRID -->
  <main class="news-main">
    <div class="news-grid">
      ${postsHtml}
    </div>

    ${posts.length >= 12 ? `
      <div class="news-pagination">
        ${page > 1 ? `<a href="?page=${page - 1}" class="page-link">← Trang trước</a>` : ''}
        <span class="page-current">Trang ${page}</span>
        <a href="?page=${page + 1}" class="page-link">Trang sau →</a>
      </div>
    ` : ''}
  </main>

  <!-- FOOTER -->
  <footer class="site-footer">
    <div class="footer-inner">
      <p>© 2026 Yokool — Stay powered. Stay cool. · <a href="/lien-he.html">Liên hệ</a> · <a href="/b2b.html">B2B</a></p>
    </div>
  </footer>

  <script src="/script.js"></script>
</body>
</html>`;
}

function renderPostCard(post: any): string {
  const dateStr = formatDateVN(post.published_at);
  return `
    <a href="/news/${escapeHtml(post.slug)}.html" class="news-card">
      ${post.og_image_url ? `
        <div class="news-card-image">
          <img src="${escapeHtml(post.og_image_url)}" alt="${escapeHtml(post.title)}" loading="lazy">
        </div>
      ` : '<div class="news-card-image news-card-image-placeholder"></div>'}
      <div class="news-card-body">
        ${post.category_name ? `<span class="news-card-category">${escapeHtml(post.category_name)}</span>` : ''}
        <h2 class="news-card-title">${escapeHtml(post.title)}</h2>
        ${post.excerpt ? `<p class="news-card-excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
        <div class="news-card-meta">
          ${dateStr ? `<time>${dateStr}</time>` : ''}
          ${post.reading_time ? `<span>${post.reading_time} phút đọc</span>` : ''}
        </div>
      </div>
    </a>
  `;
}
