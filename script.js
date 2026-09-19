/* ==========================================================================
   朱朝阳 · 个人主页   script.js
   原生 JS，无任何依赖；直接双击 index.html 即可运行（file:// 协议可用）
   ========================================================================== */
(function () {
  "use strict";

  /* 兜底：脚本一旦抛错，就撤掉 html 上的 js 标记，让所有渐入内容立刻可见 */
  window.addEventListener("error", function () {
    document.documentElement.classList.remove("js");
  });

  /* ------------------------------------------------------------------
     1. 相册数据
     照片放在 assets/photos/ 下，命名 photo-01.jpg … photo-21.jpg。
     要加照片：把文件拷进该目录，然后在下面数组里补一行文件名。
     caption 留空则灯箱里只显示序号；想写说明就填进去。
     ------------------------------------------------------------------ */
  var PHOTO_FILES = [
    "photo-01.jpg", "photo-02.jpg", "photo-03.jpg", "photo-04.jpg",
    "photo-05.jpg", "photo-06.jpg", "photo-07.jpg", "photo-08.jpg",
    "photo-09.jpg", "photo-10.jpg", "photo-11.jpg", "photo-12.jpg",
    "photo-13.jpg", "photo-14.jpg", "photo-15.jpg", "photo-16.jpg",
    "photo-17.jpg", "photo-18.jpg", "photo-19.jpg", "photo-20.jpg",
    "photo-21.jpg"
  ];

  var CAPTIONS = {
    /* 例： "photo-03.jpg": "在兰州新区的校园里，秋天的下午。", */
  };

  var PHOTO_DIR = "assets/photos/";

  var photos = PHOTO_FILES.map(function (file, i) {
    var no = pad(i + 1);
    return {
      file: file,
      src: PHOTO_DIR + file,
      alt: "朱朝阳的照片 " + no,
      caption: CAPTIONS[file] || ""
    };
  });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  /* ------------------------------------------------------------------
     2. 主题切换（跟随系统 + 手动记忆）
     ------------------------------------------------------------------ */
  var root = document.documentElement;
  var themeToggle = $("#themeToggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("zc-theme", theme); } catch (e) { /* 忽略 */ }
    if (themeToggle) {
      var isDark = theme === "dark";
      themeToggle.setAttribute("aria-label", isDark ? "切换到浅色主题" : "切换到深色主题");
      themeToggle.setAttribute("title", isDark ? "切换到浅色主题" : "切换到深色主题");
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  /* ------------------------------------------------------------------
     3. 顶栏：滚动加阴影 + 移动端菜单 + 高亮当前区块
     ------------------------------------------------------------------ */
  var header = $("#siteHeader");
  var navToggle = $("#navToggle");
  var nav = $("#primaryNav");

  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function closeNav() {
    if (!nav) return;
    nav.classList.remove("is-open");
    if (navToggle) {
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-expanded", "false");
    }
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.classList.toggle("is-active", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    });
  }

  /* 点击导航链接后收起移动端菜单 */
  $$(".nav__link").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  /* 滚动高亮 */
  var navLinks = $$(".nav__link");
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (sec) { spy.observe(sec); });
  }

  /* ------------------------------------------------------------------
     4. 滚动出现的渐入动画
     两套机制并行、互相兜底：
       ① IntersectionObserver —— 正常浏览器里最省事；
       ② getBoundingClientRect 扫描（初始 / 滚动 / 缩放 / load / 旋转）——
          不依赖渲染帧，任何环境下都不会让内容一直隐藏。
     watchReveal() 可反复调用，后来生成的内容（例如相册卡片）也能纳入同一套机制。
     ------------------------------------------------------------------ */
  var pending = [];
  var revealObserver = null;

  function showNow(el) {
    el.classList.add("is-visible");
    if (revealObserver) revealObserver.unobserve(el);
  }

  /* 幂等扫描：凡是已经越过视口下沿的元素立刻显示 */
  function sweep() {
    if (!pending.length) return;
    var limit = window.innerHeight || 0;
    pending = pending.filter(function (el) {
      if (el.getBoundingClientRect().top < limit) {
        showNow(el);
        return false;
      }
      return true;
    });
  }

  function watchReveal(items) {
    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + "ms";
      if (reduceMotion) {
        el.classList.add("is-visible");
        return;
      }
      pending.push(el);
      if (revealObserver) revealObserver.observe(el);
    });
    sweep();
  }

  if (!reduceMotion && "IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        showNow(entry.target);
        var idx = pending.indexOf(entry.target);
        if (idx > -1) pending.splice(idx, 1);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  }

  watchReveal($$(".reveal"));

  window.addEventListener("scroll", sweep, { passive: true });
  window.addEventListener("resize", sweep);
  window.addEventListener("load", sweep);
  window.addEventListener("orientationchange", sweep);

  /* ------------------------------------------------------------------
     5. 相册渲染（照片列表来自上面的 PHOTO_FILES）
     ------------------------------------------------------------------ */
  var grid = $("#galleryGrid");
  var lightbox = null;

  function buildGallery() {
    if (!grid) return [];

    var frag = document.createDocumentFragment();
    var cards = [];

    photos.forEach(function (photo, index) {
      var figure = document.createElement("figure");
      figure.className = "photo-card reveal";

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "photo-card__btn";
      btn.setAttribute("data-index", String(index));
      btn.setAttribute("aria-label", "放大查看第 " + (index + 1) + " 张照片");

      var img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.alt;
      img.loading = index < 4 ? "eager" : "lazy";
      img.decoding = "async";
      img.width = 1279;
      img.height = 1706;

      var zoom = document.createElement("span");
      zoom.className = "photo-card__zoom";
      zoom.setAttribute("aria-hidden", "true");
      zoom.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
        '<circle cx="11" cy="11" r="6.4"/><path d="M15.8 15.8 21 21M11 8.6v4.8M8.6 11h4.8"/></svg>';

      btn.appendChild(img);
      btn.appendChild(zoom);
      figure.appendChild(btn);
      frag.appendChild(figure);
      cards.push(figure);
    });

    grid.appendChild(frag);
    return cards;
  }

  var galleryCards = buildGallery();

  /* 相册卡片也纳入同一套“滚动出现”机制（IO + 兜底扫描），避免照片区域空白 */
  watchReveal(galleryCards);

  /* ------------------------------------------------------------------
     6. 灯箱：点开大图 / 左右切换 / 键盘 / 手势
     ------------------------------------------------------------------ */
  function createLightbox() {
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "照片查看器");
    box.innerHTML =
      '<div class="lightbox__backdrop" data-close="1"></div>' +
      '<div class="lightbox__stage">' +
      '<img class="lightbox__img" alt="">' +
      '<p class="lightbox__caption" hidden></p>' +
      "</div>" +
      '<button class="lightbox__btn lightbox__close" type="button" data-close="1" aria-label="关闭（Esc 键）">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
      "</button>" +
      '<button class="lightbox__btn lightbox__nav lightbox__prev" type="button" aria-label="上一张（左方向键）">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>' +
      "</button>" +
      '<button class="lightbox__btn lightbox__nav lightbox__next" type="button" aria-label="下一张（右方向键）">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>' +
      "</button>" +
      '<span class="lightbox__counter" aria-live="polite"></span>';

    document.body.appendChild(box);

    var imgEl = $(".lightbox__img", box);
    var captionEl = $(".lightbox__caption", box);
    var counterEl = $(".lightbox__counter", box);
    var closeBtn = $(".lightbox__close", box);
    var current = 0;
    var lastFocused = null;

    function preload(index) {
      var photo = photos[(index + photos.length) % photos.length];
      if (photo) new Image().src = photo.src;
    }

    function show(index) {
      current = (index + photos.length) % photos.length;
      var photo = photos[current];

      imgEl.src = photo.src;
      imgEl.alt = photo.alt;
      captionEl.hidden = !photo.caption;
      captionEl.textContent = photo.caption || "";
      counterEl.textContent = pad(current + 1) + " / " + pad(photos.length);

      preload(current + 1);
      preload(current - 1);
    }

    function open(index) {
      lastFocused = document.activeElement;
      box.classList.add("is-open");
      document.body.classList.add("is-locked");
      show(index);
      closeBtn.focus();
    }

    function close() {
      box.classList.remove("is-open");
      document.body.classList.remove("is-locked");
      imgEl.removeAttribute("src");
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    box.addEventListener("click", function (event) {
      if (event.target.closest("[data-close]")) { close(); return; }
      if (event.target.closest(".lightbox__prev")) { show(current - 1); return; }
      if (event.target.closest(".lightbox__next")) { show(current + 1); }
    });

    document.addEventListener("keydown", function (event) {
      if (!box.classList.contains("is-open")) return;
      if (event.key === "Escape") { close(); }
      else if (event.key === "ArrowLeft") { show(current - 1); }
      else if (event.key === "ArrowRight") { show(current + 1); }
      else if (event.key === "Tab") { event.preventDefault(); closeBtn.focus(); }
    });

    /* 手机端左右滑动 */
    var startX = null;

    box.addEventListener("touchstart", function (event) {
      startX = event.changedTouches[0].clientX;
    }, { passive: true });

    box.addEventListener("touchend", function (event) {
      if (startX === null) return;
      var dx = event.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) < 45) return;
      show(dx < 0 ? current + 1 : current - 1);
    }, { passive: true });

    return { open: open, close: close };
  }

  if (grid && photos.length) {
    lightbox = createLightbox();

    grid.addEventListener("click", function (event) {
      var btn = event.target.closest(".photo-card__btn");
      if (!btn) return;
      lightbox.open(parseInt(btn.getAttribute("data-index"), 10) || 0);
    });
  }

  /* ------------------------------------------------------------------
     7. 页脚年份
     ------------------------------------------------------------------ */
  var yearEl = $("#copyrightYear");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

})();
