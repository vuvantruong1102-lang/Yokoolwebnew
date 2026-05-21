# CỤM C — Frontend cho Yokoolwebnew

## File trong gói này (4 file)

```
cum-c-frontend/
├── blog-enhance.css                      ← NEW (đặt ở ROOT repo)
├── blog-enhance.js                       ← NEW (đặt ở ROOT repo)
└── functions/
    ├── _lib/
    │   └── cloudcms.ts                   ← REPLACE
    └── news/
        └── [slug].ts                     ← REPLACE
```

## Cách upload

1. Giải nén `cum-c-frontend.zip` được folder `cum-c-frontend/`
2. Chọn **TẤT CẢ thứ bên trong**: 2 file `.css`, `.js` và folder `functions/`
3. Vào https://github.com/vuvantruong1102-lang/Yokoolwebnew
4. **Add file** → **Upload files** → kéo cả 3 thứ vừa chọn vào
5. GitHub hiện danh sách 4 file thay đổi:
   - `blog-enhance.css` (mới ở root)
   - `blog-enhance.js` (mới ở root)
   - `functions/_lib/cloudcms.ts` (đè)
   - `functions/news/[slug].ts` (đè)
6. Commit: `Frontend v2: TOC, reading progress, lightbox, related posts`
7. Commit changes

## Test (sau 2-3 phút build)

Mở bất kỳ bài viết CMS nào, vd: `https://yokool.vn/news/<slug>.html`

| Tính năng | Cách kiểm tra |
|---|---|
| **Reading progress bar** | Cuộn xuống → thanh đỏ ở đỉnh tăng dần |
| **TOC (mục lục)** | Trên desktop ≥1280px: box "Mục lục" sticky bên phải. Mobile: inline trong bài |
| **TOC highlight** | Cuộn xuống → item đang xem highlight đỏ |
| **TOC click** | Click item → scroll mượt đến section |
| **Image lightbox** | Click ảnh trong bài → mở fullscreen, nhấn ESC để đóng |
| **Lazy load** | Ảnh dưới fold load khi cuộn tới (kiểm tra Network tab) |
| **Related posts** | Cuộn xuống cuối bài → grid 3 bài cùng category |

## Lưu ý

### TOC chỉ hiện khi bài đủ dài
- Bài cần ≥3 heading (h2/h3) thì TOC mới xuất hiện
- Bài ngắn không có TOC là behavior đúng (không spam UI)

### Related Posts cần data
- Bài hiện tại cần có category
- Phải có ≥1 bài khác cùng category đã published
- Nếu không có → section Related Posts không render (không error)

### Bài static cũ
- TOC/Lightbox **không** chạy trên bài static cũ trong folder `/news/<slug>.html` (theo yêu cầu của bạn)
- Chỉ chạy trên bài render qua function `[slug].ts` (tức bài đã migrate vào CMS)

## Troubleshooting

| Lỗi | Nguyên nhân thường gặp | Fix |
|---|---|---|
| TOC không hiện | Bài chưa đủ 3 h2/h3 | Thêm heading |
| TOC che layout | Hard refresh (Ctrl+Shift+R) | Cache CSS cũ |
| Lightbox không mở | JS chưa load | Check Network tab `/blog-enhance.js` |
| Related Posts trống | Chưa có bài cùng category | Tạo thêm bài + assign category |
| Build fail | Lỗi TypeScript trong `[slug].ts` | Check Cloudflare Pages → Build log |
