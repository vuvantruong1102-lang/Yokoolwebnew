// ============================================================
// /functions/news.ts
// Trang danh sách bài viết tại /news.html
// Dùng class news-hero, news-list-grid, news-card (đã có sẵn trong styles.css)
// ============================================================

import {
  type Env, type Post,
  fetchPostsList, renderHead, renderHeader, renderFooter,
  escapeHtml, formatDateVN, isoDate,
} from './_lib/cloudcms';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const category = url.searchParams.get('category') ?? undefined;
  const baseUrl = url.origin;

  let posts: Post[] = [];
  try {
    const data = await fetchPostsList(context.env, { page, limit: 12, category });
    posts = data.items;
  } catch (err) {
    console.error('News list fetch failed:', err);
    // Tiếp tục render với danh sách rỗng thay vì 500
  }

  return new Response(renderListPage(posts, page, baseUrl, category), {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=60, s-maxage=300',
    },
  });
};

function renderListPage(posts: Post[], page: number, baseUrl: string, category?: string): string {
  const title = category
    ? `Tin tức ${category} — Yokool`
    : 'Tin tức — Yokool';
  const description = 'Tin tức và kiến thức công nghệ từ Yokool: hướng dẫn chọn sạc dự phòng, công nghệ GaN, so sánh sản phẩm, mẹo sử dụng phụ kiện sạc hiệu quả nhất.';

  const headHtml = renderHead({
    title,
    description,
    canonical: `${baseUrl}/news.html`,
    ogImage: `${baseUrl}/images/banner-1.jpg`,
  });

  const content = posts.length === 0
    ? renderEmptyState()
    : renderPostsGrid(posts, page);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
${headHtml}
</head>
<body>

${renderHeader()}

<section class="news-hero">
  <div class="container">
    <div class="news-hero-inner">
      <span class="section-label">/ News &amp; updates</span>
      <h1 class="news-hero-title">${category ? escapeHtml(category) : 'Tin tức Yokool.'}</h1>
      <p class="news-hero-tagline">Cập nhật sản phẩm, công nghệ và câu chuyện thương hiệu.</p>
    </div>
  </div>
</section>

${content}

${renderFooter()}

</body>
</html>`;
}

function renderEmptyState(): string {
  return `
<section class="news-empty">
  <div class="container">
    <div class="news-empty-inner">
      <div class="news-empty-mark">✦</div>
      <h2 class="news-empty-title">Bài viết đang được chuẩn bị</h2>
      <p class="news-empty-description">Đội ngũ Yokool đang biên soạn những bài viết chất lượng về công nghệ sạc, hướng dẫn sử dụng và câu chuyện thương hiệu. Quay lại sớm nhé!</p>
      <div class="news-empty-actions">
        <a href="/index.html" class="cta-button">
          Về trang chủ
          <span class="cta-arrow">→</span>
        </a>
        <a href="https://shopee.vn/tamayokoofficial" target="_blank" rel="noopener" class="cta-button cta-button--ghost">
          Mua tại Shopee
        </a>
      </div>
    </div>
  </div>
</section>`;
}

function renderPostsGrid(posts: Post[], page: number): string {
  const cards = posts.map((post, idx) => renderPostCard(post, idx === 0 && page === 1)).join('\n');

  return `
<section class="news-list-section">
  <div class="container">
    <div class="news-list-grid">
${cards}
    </div>
${posts.length >= 12 ? renderPagination(page) : ''}
  </div>
</section>`;
}

function renderPostCard(post: Post, featured: boolean): string {
  const dateStr = formatDateVN(post.published_at);
  const classes = featured ? 'news-card news-card--featured' : 'news-card';
  // Heading levels: featured = h2, còn lại = h3
  const Tag = featured ? 'h2' : 'h3';

  return `
        <a href="/news/${escapeHtml(post.slug)}.html" class="${classes}">
          <div class="news-card-thumb">
            ${post.og_image_url
              ? `<img src="${escapeHtml(post.og_image_url)}" alt="" loading="lazy">`
              : `<img src="/images/banner-1.jpg" alt="" loading="lazy">`}
          </div>
          <div class="news-card-body">
            ${post.category_name ? `<span class="news-card-category">${escapeHtml(post.category_name)}</span>` : ''}
            <${Tag} class="news-card-title">${escapeHtml(post.title)}</${Tag}>
            ${featured && post.excerpt ? `<p class="news-card-excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
            <div class="news-card-meta">
              ${dateStr ? `<span>${escapeHtml(dateStr)}</span>` : ''}
              ${dateStr && post.reading_time ? `<span aria-hidden="true">·</span>` : ''}
              ${post.reading_time ? `<span>${post.reading_time} phút đọc</span>` : ''}
            </div>
          </div>
        </a>`;
}

function renderPagination(page: number): string {
  return `
    <nav class="news-pagination" aria-label="Phân trang" style="display: flex; justify-content: center; gap: 16px; margin-top: 48px; padding-top: 32px; border-top: 1px solid var(--border-subtle, #e9ecef); font-family: var(--font-mono, monospace); font-size: 13px;">
      ${page > 1 ? `<a href="?page=${page - 1}" class="cta-button cta-button--ghost cta-button--small">← Trang trước</a>` : ''}
      <span style="align-self: center; color: var(--text-tertiary, #888);">Trang ${page}</span>
      <a href="?page=${page + 1}" class="cta-button cta-button--ghost cta-button--small">Trang sau →</a>
    </nav>`;
}
