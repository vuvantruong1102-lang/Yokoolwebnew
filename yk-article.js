/* ============================================================
   yk-article.js — Nâng cấp tiến bộ cho trang chi tiết bài viết
   Chạy sau khi nội dung đã có trong DOM. Nội dung vẫn đọc được
   nếu script chưa/không tải (progressive enhancement).
   Việc:
     1. Gỡ <h1> trùng trong nội dung (template đã có .article-title)
     2. Gán ID duy nhất cho H2/H3 để liên kết neo
     3. Tự sinh Mục lục cho bài dài, nếu bài CHƯA có mục lục sẵn
   Không đụng header/footer/nav.
   ============================================================ */
(function () {
  'use strict';

  var body = document.querySelector('.article-body');
  if (!body) return;

  // --- 1. Gỡ H1 trùng trong nội dung CMS ------------------------
  // Trang chỉ nên có một H1 (.article-title ở header). Nếu biên tập
  // lỡ để H1 trong nội dung, hạ xuống H2 để giữ nội dung, bỏ trùng.
  body.querySelectorAll('h1').forEach(function (h1) {
    var h2 = document.createElement('h2');
    h2.innerHTML = h1.innerHTML;
    for (var i = 0; i < h1.attributes.length; i++) {
      var a = h1.attributes[i];
      if (a.name !== 'id') h2.setAttribute(a.name, a.value);
    }
    h1.replaceWith(h2);
  });

  // --- 2. Gán ID duy nhất cho heading --------------------------
  function slugify(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // bỏ dấu
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60);
  }

  var used = {};
  var headings = body.querySelectorAll('h2, h3');
  headings.forEach(function (h) {
    if (!h.id) {
      var base = slugify(h.textContent) || 'muc';
      var id = base, n = 2;
      while (used[id] || document.getElementById(id)) { id = base + '-' + n++; }
      h.id = id;
    }
    used[h.id] = true;
    h.style.scrollMarginTop = '90px';
  });

  // --- 3. Tự sinh mục lục cho bài dài --------------------------
  // Bỏ qua nếu bài ĐÃ có mục lục. Nhận diện rộng, phòng khi CMS lọc
  // mất class khi biên tập dán HTML:
  //   a) có .yk-toc / nav[aria-label*="ục lục"]
  //   b) hoặc có tiêu đề "Nội dung bài viết" / "Mục lục"
  //   c) hoặc có một danh sách (ol/ul) mà phần lớn link trỏ tới #anchor
  //      nội bộ của bài (đặc trưng của mọi mục lục)
  function looksLikeToc() {
    if (body.querySelector('.yk-toc, nav[aria-label*="ục lục"], nav[aria-label*="ội dung"]')) return true;

    var heads = body.querySelectorAll('p strong, p b, h2, h3, h4, nav > p, nav strong');
    for (var i = 0; i < heads.length; i++) {
      var t = (heads[i].textContent || '').trim().toLowerCase();
      if (t === 'nội dung bài viết' || t === 'mục lục' || t === 'nội dung') return true;
    }

    var lists = body.querySelectorAll('ol, ul');
    for (var j = 0; j < lists.length; j++) {
      var links = lists[j].querySelectorAll('a[href^="#"]');
      var items = lists[j].children.length;
      if (links.length >= 3 && items > 0 && links.length >= items * 0.6) return true;
    }
    return false;
  }

  var hasToc = looksLikeToc();
  var h2s = Array.prototype.filter.call(headings, function (h) {
    return h.tagName === 'H2';
  });

  if (!hasToc && h2s.length >= 4) {
    var nav = document.createElement('nav');
    nav.className = 'yk-toc yk-toc-auto';
    nav.setAttribute('aria-label', 'Mục lục');

    var p = document.createElement('p');
    p.innerHTML = '<strong>Nội dung bài viết</strong>';
    nav.appendChild(p);

    var ol = document.createElement('ol');
    h2s.forEach(function (h) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      ol.appendChild(li);
    });
    nav.appendChild(ol);

    // Chèn trước H2 đầu tiên
    var firstH2 = h2s[0];
    firstH2.parentNode.insertBefore(nav, firstH2);
  }
})();
