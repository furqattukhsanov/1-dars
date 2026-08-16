/* ====================================================
   LolaMarket — Landing PWA
   ----------------------------------------------------
   1) Service worker'ni ro'yxatdan o'tkazadi (offline sahifa uchun)
   2) "Uy ekraniga qo'shish" taklifini ko'rsatadi
   ==================================================== */
(function () {
  'use strict';

  var DISMISS_KEY = 'lm_web_pwa_dismissed_at';
  var DISMISS_DAYS = 14;

  var isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
  var isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    && !/crios|fxios/i.test(navigator.userAgent);

  /* ===== 1. Service worker ===== */
  // `load` hodisasi ALLAQACHON o'tgan bo'lishi mumkin (bfcache'dan tiklanish,
  // skriptning kech ijro etilishi). Unda listener hech qachon otilmaydi va
  // service worker umuman ro'yxatdan o'tmaydi — 2026-07-30 da jonli saytda
  // aynan shu bo'ldi: fayllar joyida, xato yo'q, lekin PWA ishlamayotgan edi.
  // Shuning uchun holat oldindan tekshiriladi.
  function whenReady(fn) {
    if (document.readyState === 'complete') fn();
    else window.addEventListener('load', fn);
  }

  if ('serviceWorker' in navigator) {
    whenReady(function () {
      // updateViaCache:'none' — sw.js brauzer keshidan olinmasin, aks holda
      // yangilangan service worker soatlab eskisi bilan qolib ketadi.
      // ⚠️ Yo'l MUTLAQ (`/sw.js`), nisbiy EMAS (2026-08-16). Mahsulot endi
      // o'z manzilida ochiladi (`/mahsulot/<id>`), nisbiy yo'l esa o'sha
      // sahifada `/mahsulot/sw.js` ga aylanardi. U yerda fayl YO'Q, lekin
      // nginx `try_files ... /index.html` bilan **HTML va HTTP 200**
      // qaytaradi (o'lchandi: `200 text/html`) — ya'ni ro'yxatdan o'tish
      // "fayl topilmadi" deb emas, NOTO'G'RI TUR deb yiqilardi va offline
      // rejim jimgina o'chib qolardi. `scope` ham aniq beriladi: sahifa
      // ildizda bo'lmagani uchun standart qamrov `/mahsulot/` bo'lib
      // qolardi va bosh sahifa SW'siz qolardi.
      navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(function (err) {
        console.warn('[pwa] service worker ro\'yxatdan o\'tmadi:', err);
      });
    });
  }

  /* ===== 2. Uy ekraniga qo'shish ===== */
  if (isStandalone) return;

  function recentlyDismissed() {
    try {
      var at = parseInt(localStorage.getItem(DISMISS_KEY), 10);
      if (!at) return false;
      return (Date.now() - at) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
    } catch (e) {
      return false;
    }
  }

  function remember() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) {}
  }

  var deferredPrompt = null;
  var banner = null;

  function injectStyles() {
    if (document.getElementById('pwa-style')) return;
    var css = ''
      + '#pwa-banner{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));'
      + 'box-sizing:border-box;'
      + 'z-index:900;display:flex;align-items:center;gap:12px;padding:12px 12px 12px 14px;'
      + 'border-radius:18px;background:rgba(255,255,255,.82);'
      + '-webkit-backdrop-filter:blur(16px) saturate(150%);backdrop-filter:blur(16px) saturate(150%);'
      + 'border:1px solid rgba(255,255,255,.65);'
      + 'box-shadow:0 14px 40px -14px rgba(23,26,48,.28),0 2px 8px rgba(23,26,48,.06);'
      + 'transform:translateY(140%);transition:transform .28s cubic-bezier(.22,1,.36,1);}'
      + '#pwa-banner.is-open{transform:translateY(0);}'
      + '#pwa-banner .pwa-text{flex:1;min-width:0;}'
      + '#pwa-banner .pwa-title{display:block;font-size:14px;font-weight:700;color:var(--ink-900,#171A30);}'
      + '#pwa-banner .pwa-sub{display:block;margin-top:2px;font-size:12.5px;line-height:1.35;color:var(--ink-500,#5A6480);}'
      + '#pwa-banner button{-webkit-appearance:none;appearance:none;font-family:inherit;cursor:pointer;}'
      + '#pwa-banner .pwa-add{flex:none;min-height:44px;padding:0 18px;border:0;border-radius:13px;'
      + 'background:var(--pom-400,#E84B40);color:#fff;font-size:14px;font-weight:600;}'
      + '#pwa-banner .pwa-add:active{background:var(--pom-500,#C9362D);}'
      + '#pwa-banner .pwa-close{flex:none;width:44px;height:44px;border:0;border-radius:50%;'
      + 'background:transparent;color:var(--ink-400,#7A859A);display:flex;align-items:center;justify-content:center;}'
      + '@media (min-width:560px){#pwa-banner{left:auto;right:20px;max-width:420px;}}';
    var style = document.createElement('style');
    style.id = 'pwa-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function close() {
    if (!banner) return;
    banner.classList.remove('is-open');
    setTimeout(function () {
      if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
      banner = null;
    }, 300);
  }

  function showBanner(sub, actionLabel, onAction) {
    injectStyles();

    banner = document.createElement('div');
    banner.id = 'pwa-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Ilovani uy ekraniga qo\'shish');

    var text = document.createElement('div');
    text.className = 'pwa-text';
    var title = document.createElement('span');
    title.className = 'pwa-title';
    title.textContent = 'Uy ekraniga qo\'shing';
    var subEl = document.createElement('span');
    subEl.className = 'pwa-sub';
    subEl.textContent = sub;
    text.appendChild(title);
    text.appendChild(subEl);

    banner.appendChild(text);

    if (onAction) {
      var add = document.createElement('button');
      add.type = 'button';
      add.className = 'pwa-add';
      add.textContent = actionLabel;
      add.addEventListener('click', onAction);
      banner.appendChild(add);
    }

    var close_ = document.createElement('button');
    close_.type = 'button';
    close_.className = 'pwa-close';
    close_.setAttribute('aria-label', 'Yopish');
    close_.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    close_.addEventListener('click', function () { remember(); close(); });
    banner.appendChild(close_);

    document.body.appendChild(banner);

    // Pastki mobil navigatsiya (.m-nav) ustida tursin — uni to'sib qo'ymasin.
    var nav = document.querySelector('.m-nav');
    var navH = (nav && getComputedStyle(nav).display !== 'none')
      ? nav.getBoundingClientRect().height : 0;
    if (navH > 0) banner.style.bottom = (navH + 8) + 'px';

    // Boshlang'ich holatni majburan hisoblatamiz — shundan keyin klass
    // qo'shilsa animatsiya ishlaydi.
    void banner.offsetWidth;
    banner.classList.add('is-open');
  }

  // Android / Chrome — brauzer o'zi taklif hodisasini beradi.
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (recentlyDismissed()) return;
    showBanner('Katalog bir bosishda ochiladi.', 'Qo\'shish', function () {
      close();
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () {
        deferredPrompt = null;
        remember();
      });
    });
  });

  window.addEventListener('appinstalled', function () {
    remember();
    close();
  });

  // iOS Safari'da bunday hodisa yo'q — qo'lda qilish yo'lini aytamiz.
  if (isIos && !recentlyDismissed()) {
    whenReady(function () {
      setTimeout(function () {
        if (banner) return;
        showBanner('Ulashish tugmasi → «Uy ekraniga qo\'shish».', null, null);
      }, 2500);
    });
  }
})();
