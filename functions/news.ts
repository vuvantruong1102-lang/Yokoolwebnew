// ============================================================
// /functions/news.ts
// Trang danh sách tin tức - SSR
// Bắt URL /news.html (matches /news.html trong Pages routing)
// ============================================================

import {
  type Env, type Post,
  fetchPostsList, renderHead, renderHeader, renderFooter,
  escapeHtml, formatDateVN, isoDate,
} from './_lib/cloudcms';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const baseUrl = url.origin;
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
  const category = url.searchParams.get('category') ?? undefined;

  try {
    const data = await fetchPostsList(context.env, { page, limit: 12, category });

    return new Response(renderNewsListPage(data.items, page, category, baseUrl), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=60, s-maxage=300',
      },
    });
  } catch (err: any) {
    console.error('Error rendering news list:', err);
    return new Response(`Server error: ${err.message}`, { status: 500 });
  }
};

function renderNewsListPage(
  posts: Post[],
  page: number,
  category: string | undefined,
  baseUrl: string
): string {
  const title = category
    ? `Tin tức · Danh mục: ${category} · Yokool`
    : 'Tin tức · Yokool';
  const description =
    'Tin tức công nghệ mới nhất từ Yokool. Hướng dẫn sử dụng sạc dự phòng, củ sạc nhanh, ổ điện du lịch và những đánh giá sản phẩm chân thực.';
  const canonical = `${baseUrl}/news.html${page > 1 ? `?page=${page}` : ''}`;

  // JSON-LD: ItemList Schema
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    numberOfItems: posts.length,
    itemListElement: posts.map((post, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${baseUrl}/news/${post.slug}.html`,
      name: post.title,
    })),
  };

  return `<!DOCTYPE html>
<html lang="vi">
<head>
${renderHead({
  title,
  description,
  canonical,
  ogTitle: title,
  ogDescription: description,
  ogImage: `${baseUrl}/images/og-default.jpg`,
  ogType: 'website',
  jsonLd: itemListSchema,
})}
</head>
<body>
${renderHeader()}

<main class="news-page">
  <section class="news-hero">
    <div class="container">
      <span class="section-label">/ Tin tức Yokool</span>
      <h1 class="news-hero-title">Cập nhật. <em>Mỗi ngày</em>.</h1>
      <p class="news-hero-tagline">
        Hướng dẫn sử dụng, đánh giá sản phẩm và tin tức công nghệ mới nhất từ Yokool.
      </p>
    </div>
  </section>

  <section class="news-list-section">
    <div class="container">
      ${posts.length === 0
        ? `<div class="news-empty">
            <p>Chưa có bài viết nào${category ? ` trong danh mục "${escapeHtml(category)}"` : ''}.</p>
            <a href="/news.html" class="cta-button cta-button--ghost">Xem tất cả tin tức →</a>
          </div>`
        : `<div class="news-grid">
            ${posts.map((post) => renderPostCard(post)).join('\n')}
          </div>

          ${renderPagination(page, posts.length, category)}`
      }
    </div>
  </section>
</main>

${renderFooter()}
</body>
</html>`;
}

function renderPostCard(post: Post): string {
  const url = `/news/${post.slug}.html`;
  const image = post.og_image_url || '/images/og-default.jpg';
  const date = formatDateVN(post.published_at);
  const dateIso = isoDate(post.published_at);
  const readingTime = post.reading_time || 1;
  const category = post.category_name;

  return `
  <article class="news-card">
    <a href="${url}" class="news-card-image-link">
      <img src="${escapeHtml(image)}" alt="${escapeHtml(post.title)}" class="news-card-image" loading="lazy">
    </a>
    <div class="news-card-content">
      ${category ? `<span class="news-card-category">${escapeHtml(category)}</span>` : ''}
      <h2 class="news-card-title">
        <a href="${url}">${escapeHtml(post.title)}</a>
      </h2>
      ${post.excerpt ? `<p class="news-card-excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
      <div class="news-card-meta">
        <time datetime="${dateIso}">${date}</time>
        <span class="news-card-dot">·</span>
        <span>${readingTime} phút đọc</span>
      </div>
    </div>
  </article>
  `.trim();
}

function renderPagination(currentPage: number, itemsCount: number, category: string | undefined): string {
  // Đơn giản: nếu có 12 items thì có thể có page tiếp theo
  const hasNext = itemsCount >= 12;
  const hasPrev = currentPage > 1;
  if (!hasNext && !hasPrev) return '';

  const catParam = category ? `&category=${encodeURIComponent(category)}` : '';

  return `
  <nav class="news-pagination" aria-label="Phân trang">
    ${hasPrev
      ? `<a href="/news.html?page=${currentPage - 1}${catParam}" class="news-page-btn">← Trang trước</a>`
      : `<span class="news-page-btn news-page-btn--disabled">← Trang trước</span>`
    }
    <span class="news-page-current">Trang ${currentPage}</span>
    ${hasNext
      ? `<a href="/news.html?page=${currentPage + 1}${catParam}" class="news-page-btn">Trang sau →</a>`
      : `<span class="news-page-btn news-page-btn--disabled">Trang sau →</span>`
    }
  </nav>
  `.trim();
}
