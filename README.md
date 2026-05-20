# Tích hợp CloudCMS vào Yokool website

Tích hợp blog/tin tức từ CloudCMS vào website yokool.vn dùng Cloudflare Pages Functions (SSR cho SEO tối ưu).

## Cấu trúc file cần upload

Tất cả file bạn cần thêm vào repo **`Yokoolwebnew`**:

```
Yokoolwebnew/  (root của repo)
├── functions/                       ← TẠO MỚI (folder)
│   ├── _lib/
│   │   └── cloudcms.ts             ← Helper module
│   ├── news/
│   │   └── [slug].ts               ← Trang chi tiết bài viết
│   ├── news.ts                     ← Trang list bài viết
│   └── sitemap.xml.ts              ← Sitemap động
├── news-detail.css                  ← TẠO MỚI (CSS cho blog)
└── _redirects                       ← TẠO MỚI hoặc append
```

## Hướng dẫn upload từng file lên GitHub

### Bước 1: Vào repo Yokoolwebnew

URL: `https://github.com/vuvantruong1102-lang/Yokoolwebnew`

### Bước 2: Upload các file functions

GitHub web không tạo được nested folder rỗng → tạo folder bằng cách upload file vào path đúng.

**File 1**: `functions/_lib/cloudcms.ts`
- Click **Add file** → **Create new file** (KHÔNG dùng Upload files cho file đầu tiên)
- Tên file: gõ `functions/_lib/cloudcms.ts` (GitHub tự tạo folder)
- Paste nội dung file `cloudcms.ts`
- Commit changes

**File 2**: `functions/news/[slug].ts`
- Add file → Create new file
- Tên file: `functions/news/[slug].ts`
- Paste nội dung file `[slug].ts`
- Commit

**File 3**: `functions/news.ts`
- Vào folder `functions/` → Add file → Create new file
- Tên file: `news.ts`
- Paste nội dung
- Commit

**File 4**: `functions/sitemap.xml.ts`
- Vào folder `functions/` → Add file → Create new file
- Tên file: `sitemap.xml.ts`
- Paste nội dung
- Commit

### Bước 3: Upload file CSS và _redirects ở root

**File 5**: `news-detail.css` (root level)
- Vào root repo → Add file → Upload files
- Kéo file `news-detail.css` vào
- Commit

**File 6**: `_redirects`
- Vào root repo
- Nếu đã có file `_redirects`: edit thêm dòng `/news/:slug   /news/:slug.html   200`
- Nếu chưa có: Add file → Create → tên `_redirects` → paste nội dung
- Commit

### Bước 4: XOÁ file `news.html` cũ

File `news.html` cũ chỉ là placeholder. Bây giờ function `functions/news.ts` sẽ tự render `/news.html` động.

- Vào file `news.html` ở root → click icon **3 chấm** → Delete file
- Commit

> Nếu không xoá, Pages Functions vẫn ưu tiên function (vì /news không có .html). Nhưng nếu user vào /news.html với .html, file static cũ sẽ được serve. Để chắc nhất là xoá file cũ.

### Bước 5: Tương tự cho `sitemap.xml` cũ

Bạn đã có file `sitemap.xml` tĩnh. Function mới sẽ override → xoá file cũ để tránh confuse.

## Set Environment Variable trong Cloudflare Pages

Sau khi push code, function cần biết URL của CloudCMS API:

1. Cloudflare Dashboard → **Workers & Pages** → click vào project **Yokoolwebnew**
2. Tab **Settings** → mục **Variables and Secrets** (hoặc **Environment variables**)
3. Click **Add variable**
4. Điền:
   - **Variable name**: `CLOUDCMS_API`
   - **Value**: URL Worker của bạn, ví dụ `https://cloudcms-api.vuvantruong1102.workers.dev`
   - (KHÔNG có `/api` ở cuối, KHÔNG có `/` cuối)
5. Apply cho **Production** environment
6. Save

> Nếu không set env var này, function sẽ fallback dùng URL hardcoded trong `cloudcms.ts` — nhưng bạn nên set để dễ thay đổi sau.

## Trigger redeploy

Sau khi commit hết file, Cloudflare Pages **tự build lại**. Vào tab **Deployments** → đợi build xong (2-3 phút).

## Test

### 1. Trang list bài viết
Mở: `https://yokool.vn/news.html` (hoặc `/news`)
→ Phải thấy giao diện trang Tin tức với grid bài viết
→ Nếu CMS chưa có bài → "Chưa có bài viết nào"

### 2. Test bằng cách tạo 1 bài viết
- Vào CloudCMS admin → tạo 1 bài viết mới
- Điền title, content, focus keyword, meta description
- Upload ảnh đại diện
- **Xuất bản** (status published)
- Note lại slug (URL phần `/blog/...`)

### 3. Test bài viết chi tiết
Mở: `https://yokool.vn/news/<slug>.html`
→ Phải thấy trang bài viết render đầy đủ
→ View source (Ctrl+U) → meta tags phải có đầy đủ (title, description, og:image, JSON-LD)

### 4. Test sitemap
Mở: `https://yokool.vn/sitemap.xml`
→ Phải thấy XML với cả static pages + bài viết blog

### 5. Submit lên Google Search Console
- Vào https://search.google.com/search-console
- Property `yokool.vn` → Sitemaps → Add: `https://yokool.vn/sitemap.xml`

## Workflow viết bài mới

1. Vào CloudCMS admin (`https://cloudcms-admin.pages.dev`) → đăng nhập
2. Click **Bài viết mới**
3. Soạn bài với editor (heading, ảnh, link…)
4. Điền:
   - **Focus keyword**: từ khóa chính bạn muốn rank
   - **Meta description**: 140-160 ký tự, có chứa từ khóa
   - **Ảnh đại diện**: upload ảnh
5. Xem điểm SEO panel bên phải, fix các warning
6. Click **Xuất bản**

→ Sau 5 phút (do edge cache TTL), bài viết sẽ hiện tại `https://yokool.vn/news/<slug>.html`

> Nếu muốn thấy ngay, vào Cloudflare Dashboard → Caching → Purge Everything cho yokool.vn

## Troubleshooting

### Bài viết không hiển thị
- Check status có phải `published` không
- Check `https://cloudcms-api.<your-subdomain>.workers.dev/api/public/posts/<slug>` trả gì
- Check env var `CLOUDCMS_API` đã set đúng chưa

### CSS bị broken
- Đảm bảo `news-detail.css` đã upload đúng ở **root** repo (không phải trong folder)
- Hard refresh browser (Ctrl+Shift+R)

### Build fail trên Cloudflare
- Vào tab **Deployments** → xem **Build log**
- Lỗi TypeScript: Cloudflare Pages tự compile TS, không cần build step
- Nếu fail vì syntax: screenshot gửi mình

### URL có .html / không có .html
- Function `[slug].ts` chấp nhận cả `/news/abc` và `/news/abc.html`
- Tốt nhất luôn dùng `/news/<slug>.html` để consistent với site cũ

## Roadmap tiếp theo

- [ ] Bổ sung **related posts** ở cuối bài (cùng category)
- [ ] Thêm **breadcrumb JSON-LD** cho SEO tốt hơn
- [ ] Cache control nâng cao với Workers KV
- [ ] Webhook từ CMS → tự purge cache khi publish bài mới
- [ ] Search trong blog (cần thêm endpoint trong CloudCMS)
