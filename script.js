/* ── data-action delegatsiyasi ──
   HTML'dagi onclick="fn(...)" o'rniga data-action/data-arg ishlatiladi —
   funksiyalar qachon e'lon qilinishidan qat'i nazar ishlaydi (delegatsiya
   qo'shilgan payt emas, bosilgan payt chaqiriladi). */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) {
    // Kartochkaning bo'sh joyiga bosilsa mahsulot detali ochiladi. Tugmalar
    // (savat, yurakcha) yuqoridagi `closest` da ushlanadi va bu yergacha
    // yetib kelmaydi — ya'ni ular avvalgidek ishlayveradi.
    const card = e.target.closest('.product-card');
    if (card && card.dataset.id) openDetail(card.dataset.id);
    return;
  }
  const action = el.dataset.action;
  const arg = el.dataset.arg;

  if (action === 'reloadHome') {
    e.preventDefault();
    location.reload();
    return;
  }

  const fn = window[action];
  if (typeof fn !== 'function') return;
  if (arg === undefined) { fn(); return; }
  // Raqamli arg (masalan adGo'dagi banner indeksi) satr emas, son bo'lishi kerak
  fn(/^-?\d+$/.test(arg) ? Number(arg) : arg);
});

/* ── Page loader ──
   DIQQAT: bu yerda ilgari `window.addEventListener('load', ...)` turardi.
   `load` hodisasi BARCHA rasm/shrift yuklanib bo'lgandan keyin otiladi, loader
   esa `position: fixed; inset: 0` bilan butun sahifani yopib turadi — ya'ni
   foydalanuvchi hero rasmi (300 KB) va uchinchi domendagi skript tugagunicha
   faqat spinner ko'rardi. Sekin mobil internetda bu 3 soniyadan oshib ketardi.
   Endi DOM tayyor bo'lishi kifoya: tarkib chizilgan, rasmlar o'z navbatida
   kelaveradi. (Xuddi shu tuzoq `pwa.js`da ham bor edi — commit 5ffe1f0.) */
function hidePageLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  loader.classList.add('hide');
  loader.addEventListener('transitionend', () => loader.remove(), { once: true });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', hidePageLoader, { once: true });
} else {
  // `defer` skript shu holatda ishga tushadi (readyState === 'interactive')
  hidePageLoader();
}

/* ── Telegram Mini App init ── */
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
}

/* ── Scroll fade-up ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = (i * 0.06) + 's';
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ====================================================
   REKLAMA BANNERI — 3 slayd, avtomatik aylanadi
   Sichqoncha ustida, fokusda yoki tab ko'rinmay qolganda to'xtaydi.
   ==================================================== */

const adBanner = document.getElementById('ad-banner');
const adSlides = adBanner ? [...adBanner.querySelectorAll('.ad-slide')] : [];
const adDots = adBanner ? [...adBanner.querySelectorAll('.ad-dot')] : [];
const AD_DELAY = 5000;

let adIndex = 0;
let adTimer = null;
let adPaused = false;

function adRender() {
  adSlides.forEach((s, i) => {
    const on = i === adIndex;
    s.classList.toggle('is-active', on);
    s.setAttribute('aria-hidden', on ? 'false' : 'true');
  });
  adDots.forEach((d, i) => {
    const on = i === adIndex;
    d.classList.toggle('is-active', on);
    d.setAttribute('aria-selected', on ? 'true' : 'false');
  });
}

function adStart() {
  if (!adSlides.length || adTimer) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  adTimer = setInterval(() => {
    if (adPaused || document.hidden) return;
    adIndex = (adIndex + 1) % adSlides.length;
    adRender();
  }, AD_DELAY);
}

/* Nuqta bosilganda — o'sha slayd, keyin sanoq qaytadan boshlanadi */
function adGo(i) {
  if (!adSlides.length) return;
  adIndex = (i + adSlides.length) % adSlides.length;
  adRender();
  clearInterval(adTimer);
  adTimer = null;
  adStart();
}

/* Banner tugmalari */
function adGoCatalog() {
  document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function adGoCat(cat) {
  const chip = document.querySelector('.chip[data-cat="' + cat + '"]');
  if (chip) chip.click();
  adGoCatalog();
}

if (adBanner) {
  adBanner.addEventListener('mouseenter', () => { adPaused = true; });
  adBanner.addEventListener('mouseleave', () => { adPaused = false; });
  adBanner.addEventListener('focusin', () => { adPaused = true; });
  adBanner.addEventListener('focusout', () => { adPaused = false; });

  /* Telefonda chapga/o'ngga surish */
  let adX0 = null;
  adBanner.addEventListener('touchstart', (e) => { adX0 = e.changedTouches[0].clientX; }, { passive: true });
  adBanner.addEventListener('touchend', (e) => {
    if (adX0 === null) return;
    const dx = e.changedTouches[0].clientX - adX0;
    adX0 = null;
    if (Math.abs(dx) > 45) adGo(adIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });

  adStart();
}

/* ====================================================
   QIDIRUV VA FILTRLASH
   Kategoriya va qidiruv birgalikda qo'llanadi.
   ==================================================== */

const chipsWrap = document.getElementById('chips');
const grid = document.getElementById('product-grid');

let activeCat = 'all';
let searchQ = '';
// Narx oralig'i filtri — null = o'sha tomon cheklanmagan (Mini App'dagi
// `inPriceRange` bilan bir xil qoida)
let priceMin = null;
let priceMax = null;

function applyFilter() {
  if (!grid) return;
  const q = searchQ.trim().toLowerCase();
  let shown = 0;

  grid.querySelectorAll('.product-card').forEach((card) => {
    const okCat = activeCat === 'all' || card.dataset.cat === activeCat;
    const okQ = !q
      || (card.dataset.name || '').toLowerCase().indexOf(q) !== -1
      || (card.dataset.supplier || '').toLowerCase().indexOf(q) !== -1;
    const ok = okCat && okQ && okPrice(card);
    card.classList.toggle('is-hidden', !ok);
    if (ok) shown++;
  });

  const empty = document.getElementById('no-result');
  if (empty) empty.hidden = shown > 0;
}

/* ====================================================
   NARX ORALIG'I FILTRI

   Narx kartochkaning `data-price` atributidan o'qiladi — JS'da mahsulotlar
   ro'yxati takrorlanmaydi (index.html bitta manba).
   ==================================================== */

function okPrice(card) {
  if (priceMin === null && priceMax === null) return true;
  const v = Number(card.dataset.price);
  // Narxi noma'lum mahsulot filtr yoqilganda ko'rsatilmaydi — uni "arzon"
  // deb ko'rsatish xaridorni chalg'itadi
  if (!Number.isFinite(v)) return false;
  if (priceMin !== null && v < priceMin) return false;
  if (priceMax !== null && v > priceMax) return false;
  return true;
}

// "700 000" ham, "700000" ham qabul qilinadi; bo'sh = chegara yo'q
function parsePriceInput(v) {
  const digits = String(v).replace(/\D/g, '');
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

function somGroup(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

function applyPrice() {
  const lo = parsePriceInput(document.getElementById('price-min')?.value ?? '');
  const hi = parsePriceInput(document.getElementById('price-max')?.value ?? '');
  const err = document.getElementById('price-err');

  if (lo !== null && hi !== null && lo > hi) {
    if (err) err.textContent = "Eng kam narx eng ko'pdan katta bo'lmasin";
    return;
  }
  if (err) err.textContent = '';

  priceMin = lo;
  priceMax = hi;
  applyFilter();
  paintPriceState();
}

function clearPrice() {
  priceMin = null;
  priceMax = null;
  const lo = document.getElementById('price-min');
  const hi = document.getElementById('price-max');
  if (lo) lo.value = '';
  if (hi) hi.value = '';
  const err = document.getElementById('price-err');
  if (err) err.textContent = '';
  applyFilter();
  paintPriceState();
}

// Header'dagi filtr ikonkasi — narx maydoniga olib boradi.
// Qadalgan header balandligi hisobga olinadi, aks holda maydon uning ostida qoladi
function focusPriceFilter() {
  const inp = document.getElementById('price-min');
  if (!inp) return;
  const head = document.getElementById('nav');
  const top = inp.getBoundingClientRect().top + window.scrollY - (head?.offsetHeight || 0) - 20;
  window.scrollTo({ top, behavior: 'smooth' });
  inp.focus({ preventScroll: true });
}

// Yoqilgan filtrni ko'rsatuvchi chip — yoqilmagan bo'lsa umuman ko'rinmaydi
function paintPriceState() {
  const chip = document.getElementById('price-chip');
  const label = document.getElementById('price-chip-label');
  if (!chip || !label) return;

  if (priceMin === null && priceMax === null) { chip.hidden = true; return; }

  if (priceMin !== null && priceMax !== null) {
    label.textContent = `${somGroup(priceMin)} – ${somGroup(priceMax)} so'm`;
  } else if (priceMin !== null) {
    label.textContent = `${somGroup(priceMin)} so'mdan yuqori`;
  } else {
    label.textContent = `${somGroup(priceMax)} so'mgacha`;
  }
  chip.hidden = false;
}

if (chipsWrap) {
  chipsWrap.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    chipsWrap.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
    activeCat = chip.dataset.cat;
    applyFilter();
  });
}

function onSearch(v) {
  searchQ = v;
  const x = document.getElementById('search-x');
  if (x) x.hidden = !v;
  applyFilter();
}

function clearSearch() {
  const inp = document.getElementById('search-inp');
  if (inp) inp.value = '';
  onSearch('');
  inp?.focus();
}

/* ── `input` delegatsiyasi ──
   Yuqoridagi delegatsiya faqat `click` ni ushlaydi. `input` alohida hodisa,
   shuning uchun o'z tinglovchisi bor. Nima uchun to'g'ridan-to'g'ri
   `addEventListener` emas: sharh matni maydoni DINAMIK chiziladi (oyna har
   ochilganda qaytadan), ya'ni bir marta biriktirilgan tinglovchi keyingi
   nusxada yo'q bo'lardi. `data-input` qiymati — global funksiya nomi,
   unga maydon qiymati uzatiladi. */
document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-input]');
  if (!el) return;
  const fn = window[el.dataset.input];
  if (typeof fn === 'function') fn(e.target.value);
});

/* ====================================================
   TELEGRAM ORQALI KIRISH

   Nega deep-link (bir martalik kod), Login Widget emas:
     * widget BotFather'da domen sozlashni talab qiladi va ba'zi ichki
       brauzerlarda (Instagram, Telegram) ochilmaydi;
     * deep-link telefonda bir bosishda ishlaydi — Telegram ochiladi,
       "Boshlash" bosiladi, sayt esa tasdiqni kutib turadi.

   Telegram ID brauzerda HECH QACHON yasalmaydi: uni Telegram to'g'ridan-to'g'ri
   bot webhook'iga yuboradi. Sessiya HttpOnly cookie'da — bu yerdagi JS uni
   o'qiy olmaydi, faqat so'rovlar bilan birga ketadi.
   ==================================================== */

/** Kirgan foydalanuvchi: { name, username, phone, role } yoki null */
let me = null;
/** 'idle' | 'waiting' | 'error' */
let loginState = 'idle';
let loginErr = '';
let loginSession = null;   // { code, verifier, url }
let loginTimer = null;
let loginDeadline = 0;
/** Kirishdan keyin qaytadigan ko'rinish — checkout'dan kirilganda kerak */
let afterLoginView = null;
/** null — hali yuklanmoqda, [] — buyurtma yo'q */
let myOrders = null;

function apiJson(path, opts) {
  return fetch(path, Object.assign({ credentials: 'same-origin' }, opts || {}))
    .then((r) => r.json().catch(() => null));
}

function onLogin() {
  if (me) {
    drawerView = 'profile';
    loadMyOrders();
  } else {
    drawerView = 'login';
    loginState = 'idle';
    loginErr = '';
  }
  renderDrawer();
  openDrawerEl();
}

function startLogin() {
  // Oyna BOSILGAN ZAHOTI ochiladi — so'rovdan keyin ochilsa brauzer uni
  // popup deb bloklaydi. Manzil javob kelgach qo'yiladi.
  const win = window.open('', '_blank');
  loginState = 'waiting';
  loginErr = '';
  loginSession = null;
  renderDrawer();

  apiJson('/api/auth/web/start', { method: 'POST' })
    .then((d) => {
      if (!d || !d.ok || !d.url) throw new Error('start');
      loginSession = d;
      loginDeadline = Date.now() + (d.expiresIn || 600) * 1000;
      if (win && !win.closed) win.location.href = d.url;
      renderDrawer();   // havola tugmasi ko'rinsin (oyna bloklangan bo'lsa ham)
      pollLogin();
    })
    .catch(() => {
      if (win && !win.closed) win.close();
      loginState = 'error';
      loginErr = "Ulanib bo'lmadi. Internetni tekshiring va qaytadan urinib ko'ring.";
      renderDrawer();
    });
}

/** Navbatdagi so'rovni 2 soniyadan keyin rejalashtiradi */
function pollLogin() {
  clearTimeout(loginTimer);
  loginTimer = setTimeout(pollLoginNow, 2000);
}

function pollLoginNow() {
  clearTimeout(loginTimer);
  if (loginState !== 'waiting' || !loginSession) return;
  if (Date.now() > loginDeadline) {
    loginState = 'error';
    loginErr = "Kod muddati tugadi — qaytadan urinib ko'ring.";
    loginSession = null;
    renderDrawer();
    return;
  }
  const q = `code=${encodeURIComponent(loginSession.code)}&verifier=${encodeURIComponent(loginSession.verifier)}`;
  apiJson('/api/auth/web/poll?' + q)
    .then((d) => {
      if (d && d.status === 'confirmed') return onLoggedIn(d.user);
      if (d && d.status === 'expired') {
        loginState = 'error';
        loginErr = "Kod muddati tugadi — qaytadan urinib ko'ring.";
        loginSession = null;
        renderDrawer();
        return;
      }
      pollLogin();
    })
    .catch(() => pollLogin());
}

function cancelLogin() {
  clearTimeout(loginTimer);
  loginState = 'idle';
  loginSession = null;
  renderDrawer();
}

function onLoggedIn(user) {
  clearTimeout(loginTimer);
  me = user || null;
  loginState = 'idle';
  loginSession = null;
  refreshAuthUi();
  showToast(me && me.name ? `Xush kelibsiz, ${firstName(me.name)}!` : 'Kirdingiz');
  // Checkout'dan kirgan bo'lsa — formaga qaytamiz, savat yo'qolmaydi
  if (afterLoginView === 'checkout' && cartCount()) {
    afterLoginView = null;
    drawerView = 'checkout';
    renderDrawer();
    return;
  }
  afterLoginView = null;
  drawerView = 'profile';
  renderDrawer();
  // Telegram'dan qaytgan foydalanuvchi natijani darhol ko'rsin
  if (!isOpen()) openDrawerEl();
  loadMyOrders();
}

/* Telegram'dan sahifaga qaytilganda tasdiqni kutib o'tirmaymiz — darhol
   so'raymiz (fon tab'da taymer sekinlashadi). */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && loginState === 'waiting' && loginSession) pollLoginNow();
});

function logout() {
  apiJson('/api/auth/web/logout', { method: 'POST' }).catch(() => {});
  me = null;
  myOrders = null;
  refreshAuthUi();
  drawerView = 'login';
  loginState = 'idle';
  renderDrawer();
  showToast('Hisobdan chiqdingiz');
}

/** Kirishdan keyin buyurtma formasiga qaytish uchun */
function loginFromCheckout() {
  afterLoginView = 'checkout';
  drawerView = 'login';
  loginState = 'idle';
  renderDrawer();
}

function loadMyOrders() {
  myOrders = null;
  // Sharhlar ham yuklanadi — profildagi buyurtma qatori "Baholash" tugmasini
  // ko'rsatishdan oldin qaysi mahsulot allaqachon baholanganini bilishi kerak
  loadMyReviews();
  apiJson('/api/web/orders')
    .then((d) => {
      myOrders = d && d.ok && Array.isArray(d.orders) ? d.orders : [];
    })
    .catch(() => { myOrders = []; })
    .then(() => {
      if (isOpen() && drawerView === 'profile') renderDrawer();
    });
}

function firstName(name) {
  return String(name || '').trim().split(/\s+/)[0] || '';
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

/** Header va mobil nav tugmasi — kirgan bo'lsa ism ko'rsatiladi */
function refreshAuthUi() {
  const txt = document.querySelector('.login-txt');
  if (txt) txt.textContent = me ? (firstName(me.name) || 'Profil') : 'Kirish';
  const btn = document.getElementById('login-btn');
  if (btn) {
    btn.classList.toggle('is-in', !!me);
    btn.setAttribute('aria-label', me ? 'Profil' : 'Kirish');
  }
  const mBtn = document.getElementById('m-tab-login');
  if (mBtn) {
    mBtn.classList.toggle('is-in', !!me);
    mBtn.setAttribute('aria-label', me ? 'Profil' : 'Kirish');
  }
}

/* Sahifa ochilganda sessiyani tiklaymiz — cookie serverda tekshiriladi */
apiJson('/api/auth/web/me')
  .then((d) => {
    if (d && d.ok && d.user) {
      me = d.user;
      refreshAuthUi();
    }
  })
  .catch(() => { /* server yo'q — sayt kirishsiz ham to'liq ishlaydi */ });

/* ── Kirish va profil ekranlari ── */
function loginHtml() {
  if (loginState === 'waiting') {
    return `
      <div class="auth-wrap">
        <div class="auth-spinner" aria-hidden="true"></div>
        <div class="drawer-empty-title">Telegram'da tasdiqlang</div>
        <div class="drawer-empty-sub">
          Ochilgan botda <b>«Boshlash»</b> (Start) tugmasini bosing — shundan keyin
          bu sahifa o'zi profilingizga o'tadi.
        </div>
        ${loginSession
          ? `<a class="btn-tg" href="${loginSession.url}" target="_blank" rel="noopener">Telegramni ochish</a>`
          : ''}
        <button class="auth-ghost" data-action="cancelLogin">Bekor qilish</button>
      </div>`;
  }

  return `
    <div class="auth-wrap">
      <div class="auth-badge" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M21.7 4.2 2.9 11.4c-1 .4-1 1.2-.1 1.5l4.7 1.5 1.8 5.4c.2.6.4.8 1 .4l2.6-2.1 4.7 3.5c.9.5 1.4.2 1.6-.8l3-14c.2-1-.4-1.4-1.5-1.1zM8.7 14.1 17.3 8c.4-.3.8-.1.5.2l-7.1 6.5-.3 3z"/></svg>
      </div>
      <div class="drawer-empty-title">Telegram orqali kirish</div>
      <div class="drawer-empty-sub">
        Parol ham, SMS ham kerak emas. Kirsangiz — buyurtmalaringiz bir joyda turadi
        va holat o'zgarishi haqidagi xabar Telegram'ga keladi.
      </div>
      ${loginErr ? `<div class="co-err" style="margin-top:2px">${esc(loginErr)}</div>` : ''}
      <button class="btn-tg" data-action="startLogin">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M21.7 4.2 2.9 11.4c-1 .4-1 1.2-.1 1.5l4.7 1.5 1.8 5.4c.2.6.4.8 1 .4l2.6-2.1 4.7 3.5c.9.5 1.4.2 1.6-.8l3-14c.2-1-.4-1.4-1.5-1.1zM8.7 14.1 17.3 8c.4-.3.8-.1.5.2l-7.1 6.5-.3 3z"/></svg>
        Telegram orqali kirish
      </button>
      <div class="co-hint" style="text-align:center;max-width:290px">
        Biz faqat ismingiz va Telegram'dagi nomingizni ko'ramiz. Yozishmalaringizga
        kirish imkonimiz yo'q.
      </div>
    </div>`;
}

const ORDER_STATUS = {
  pending:   { label: 'Kutilmoqda',     tone: 'wait' },
  confirmed: { label: 'Tasdiqlandi',    tone: 'ok'   },
  shipped:   { label: "Yo'lda",         tone: 'ok'   },
  delivered: { label: 'Yetkazildi',     tone: 'ok'   },
  completed: { label: 'Yakunlandi',     tone: 'ok'   },
  disputed:  { label: 'Bahsli',         tone: 'warn' },
  refunded:  { label: 'Qaytarildi',     tone: 'warn' },
  cancelled: { label: 'Bekor qilindi',  tone: 'warn' },
};

function profileHtml() {
  const u = me || {};
  const orders = myOrders === null
    ? `<div class="co-hint" style="text-align:center;padding:14px 0">Yuklanmoqda…</div>`
    : !myOrders.length
      ? `<div class="co-hint" style="text-align:center;padding:14px 0">
           Hozircha buyurtma yo'q. Katalogdan mato tanlab birinchi buyurtmangizni bering.
         </div>`
      : myOrders.map(orderRowHtml).join('');

  return `
    <div class="profile-card">
      <div class="profile-ava" aria-hidden="true">${esc(initials(u.name))}</div>
      <div class="profile-main">
        <div class="profile-name">${esc(u.name || 'Xaridor')}</div>
        ${u.username ? `<div class="profile-sub">@${esc(u.username)}</div>` : ''}
        ${u.phone ? `<div class="profile-sub">${esc(u.phone)}</div>` : ''}
      </div>
    </div>

    <div class="profile-sec-title">Mening buyurtmalarim</div>
    ${orders}

    <button class="auth-ghost" style="margin-top:18px;width:100%" data-action="logout">Hisobdan chiqish</button>`;
}

// Sharh faqat mato yetib kelgandan keyin — server bilan bir xil ro'yxat
// (server/routes/reviews.js → REVIEW_ALLOWED_ORDER_STATUS)
const REVIEW_OK_STATUS = ['delivered', 'completed'];

function orderRowHtml(o) {
  const st = ORDER_STATUS[o.status] || { label: o.status, tone: 'wait' };
  const items = REVIEW_OK_STATUS.includes(o.status) ? (o.items || []) : [];
  return `
    <div class="order-row">
      <div class="order-row-top">
        <span class="order-row-id">${esc(o.id)}</span>
        <span class="order-tag ${st.tone}">${esc(st.label)}</span>
      </div>
      <div class="order-row-bot">
        <span>${esc(o.date || '')}</span>
        <span class="order-row-sum">${o.total === null ? '' : money(o.total)}</span>
      </div>
      ${items.length ? `
      <div class="order-rev">
        ${items.map((it) => {
          const done = reviewOf(o.id, it.id);
          return `
        <div class="order-rev-line">
          <span class="order-rev-name">${esc(it.name || it.id)}</span>
          ${done
            ? `<span class="order-rev-done">${starsHtml(done.stars, 'sm')} Baholandi</span>`
            : `<button class="order-rev-btn" data-action="openReview" data-arg="${esc(o.id)}|${esc(it.id)}">★ Baholash</button>`}
        </div>`;
        }).join('')}
      </div>` : ''}
    </div>`;
}

/* ====================================================
   MAHSULOT DETALI VA SHARHLAR (sayt)

   Landing'da 2026-07-31 gacha mahsulot detali umuman yo'q edi — kartochkadan
   to'g'ridan-to'g'ri savatga qo'shilardi, ya'ni sharhni ko'rsatadigan joy ham
   yo'q edi. Detal yangi SAHIFA emas, mavjud drawer'ning yangi ko'rinishi:
   marshrutlash, yangi HTML fayl va CI `source` ro'yxatiga qo'shish kerak
   bo'lmaydi (o'sha ro'yxat tuzog'i — CLAUDE.md).

   Ma'lumot ikki manbadan qo'shiladi:
     * kartochkaning `data-*` atributlari — nom, narx, sotuvchi, rasm.
       Doim bor, tarmoqqa bog'liq emas;
     * `/api/products` — reyting, zaxira, tafsilotlar (eni, zichlik, tarkib).
       Kelmasa detal baribir ochiladi, faqat qo'shimcha qatorlarsiz.
   ==================================================== */

let detailId = null;
/** mahsulot id → API'dagi to'liq yozuv; null — hali yuklanmagan */
let catalogMeta = null;
let catalogMetaTried = false;
/** mahsulot id → sharhlar massivi (yuklangandan keyin) */
const reviewsCache = {};
/** o'z sharhlarim (kirgan bo'lsa) — "allaqachon baholaganman" ni bilish uchun */
let myReviews = [];

function openDetail(id) {
  if (!product(id)) return;
  detailId = id;
  drawerView = 'detail';
  renderDrawer();
  openDrawerEl();
  loadCatalogMeta();
  loadReviews(id);
}

function loadCatalogMeta() {
  if (catalogMeta || catalogMetaTried) return;
  catalogMetaTried = true;
  apiJson('/api/products')
    .then((d) => {
      const list = d && typeof d === 'object' && 'ok' in d ? (d.ok ? d.data : null) : d;
      if (!Array.isArray(list)) return;
      catalogMeta = {};
      list.forEach((p) => { catalogMeta[p.id] = p; });
      if (isOpen() && drawerView === 'detail') renderDrawer();
    })
    .catch(() => { /* detal data-* atributlari bilan ishlayveradi */ });
}

function loadReviews(id) {
  if (reviewsCache[id] !== undefined) return;
  apiJson('/api/reviews?productId=' + encodeURIComponent(id))
    .then((d) => {
      const list = d && d.ok ? d.data : null;
      if (!Array.isArray(list)) return;
      reviewsCache[id] = list;
      if (isOpen() && drawerView === 'detail' && detailId === id) renderDrawer();
    })
    .catch(() => { /* sharhsiz ham detal ishlaydi */ });
}

function loadMyReviews() {
  if (!me) { myReviews = []; return; }
  apiJson('/api/reviews?mine=1')
    .then((d) => { myReviews = d && d.ok && Array.isArray(d.data) ? d.data : []; })
    .catch(() => { myReviews = []; })
    .then(() => { if (isOpen() && drawerView === 'profile') renderDrawer(); });
}

function starsHtml(n, cls) {
  const full = Math.max(0, Math.min(5, Math.floor(n)));
  return `<span class="stars ${cls || ''}" aria-label="${full} yulduz">${
    '★'.repeat(full)}<span class="stars-empty">${'☆'.repeat(5 - full)}</span></span>`;
}

function detailHtml(id) {
  const p = product(id);
  if (!p) return '';
  const m = catalogMeta ? catalogMeta[id] : null;
  const list = reviewsCache[id];
  const qty = cart[id] || 0;

  // Tafsilotlar faqat API'dan keladi — bo'lmasa qatorning o'zi chizilmaydi
  // (bo'sh "Eni: —" ko'rsatish ma'lumot emas, shovqin)
  const specs = m ? [
    ['Eni', m.width], ['Zichlik', m.weight], ['Tarkibi', m.comp && m.comp.uz],
    ['Yetkazish muddati', m.lead ? m.lead + ' kun' : null],
    ['Minimal buyurtma', m.moq ? m.moq + ' dona' : null],
  ].filter(([, v]) => v) : [];

  return `
    <div class="pd">
      <img class="pd-img" src="${esc(p.img)}" alt="${esc(p.name)}" />

      <div class="pd-head">
        <h3 class="pd-name">${esc(p.name)}</h3>
        ${m && m.rating != null
          ? `<span class="pd-rating">${starsHtml(m.rating)}<b>${esc(String(m.rating))}</b>
               <span class="pd-rating-n">· ${esc(String(m.reviews || 0))} sharh</span></span>`
          : ''}
      </div>

      <div class="pd-sup">${esc(p.supplier)}</div>

      <div class="pd-price">
        <span class="pd-price-label">1 dona rulon narxi</span>
        <span class="pd-price-val">${money(p.price)}</span>
      </div>

      ${specs.length ? `
      <div class="pd-specs">
        ${specs.map(([k, v]) => `
        <div class="pd-spec"><span>${esc(k)}</span><b>${esc(String(v))}</b></div>`).join('')}
      </div>` : ''}

      <div class="pd-act" id="pd-act">
        ${qty
          ? `<div class="qty-row">
               <button class="qty-circle qty-minus" data-action="qtyStepDetail" data-arg="${esc(id)}|-1" aria-label="Kamaytirish">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>
               </button>
               <span class="qty-num">${qty} dona</span>
               <button class="qty-circle qty-plus" data-action="qtyStepDetail" data-arg="${esc(id)}|1" aria-label="Ko'paytirish">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
               </button>
             </div>`
          : `<button class="pd-add" data-action="addFromDetail" data-arg="${esc(id)}">Savatga qo'shish</button>`}
      </div>

      <div class="pd-sec-title">Sharhlar</div>
      ${list === undefined
        // Yuklanmoqda — "sharh yo'q" DEYILMAYDI, aks holda yuklanish paytida
        // yolg'on gap ko'rsatilardi
        ? `<div class="pd-rev-wait"></div>`
        : !list.length
        ? `<div class="pd-rev-empty">
             <div class="pd-rev-empty-t">Hali sharh yo'q</div>
             <div class="pd-rev-empty-s">Sharhni faqat shu matoni sotib olgan xaridor yoza oladi.</div>
           </div>`
        : list.map((r) => `
          <div class="pd-rev">
            <div class="pd-rev-top">${starsHtml(r.stars)}<span class="pd-rev-date">${esc(r.date && r.date.uz || '')}</span></div>
            ${r.body ? `<div class="pd-rev-body">${esc(r.body)}</div>` : ''}
            <div class="pd-rev-who">${esc(r.author || '—')}</div>
          </div>`).join('')}
    </div>`;
}

function addFromDetail(id) {
  addToCart(id);
  if (drawerView === 'detail') renderDrawer();
}

function setQtyDetail(id, d) {
  setQty(id, d);
  if (drawerView === 'detail') renderDrawer();
}

/* ── data-action uchun ingichka o'ramlar ──
   Delegatsiya BITTA argument uzatadi, bu funksiyalar esa ikkitasini oladi
   (id va qadam). Shuning uchun ular `id|delta` shaklida kodlanadi — xuddi
   `openReview` dagi `orderId|productId` kabi, ya'ni yangi konvensiya emas.
   Asl funksiyalar imzosi ATAYLAB o'zgarmadi: ular domen amali, o'ram esa
   faqat transport. */
function qtyStep(arg) {
  const [id, d] = String(arg).split('|');
  setQty(id, Number(d));
}

function qtyStepDetail(arg) {
  const [id, d] = String(arg).split('|');
  setQtyDetail(id, Number(d));
}

/* ── Sharh yozish (saytda) ──
   Kimlik cookie sessiyasidan — brauzer hech qanday ID yubormaydi, server
   uni o'zi aniqlaydi (server/routes/reviews.js → reviewAuthor). */

let reviewTarget = null;   // { orderId, productId, productName }
let reviewStars = 5;
let reviewBody = '';
let reviewSending = false;

/** Shu buyurtmadagi shu mahsulotga sharh yozilganmi? */
function reviewOf(orderId, productId) {
  return myReviews.find((r) => r.orderId === orderId && r.productId === productId) || null;
}

function openReview(arg) {
  const [orderId, productId] = String(arg).split('|');
  const o = (myOrders || []).find((x) => x.id === orderId);
  const item = o && (o.items || []).find((i) => i.id === productId);
  if (!item) return;
  reviewTarget = { orderId, productId, productName: item.name || productId };
  reviewStars = 5;
  reviewBody = '';
  reviewSending = false;
  drawerView = 'review';
  renderDrawer();
}

function setReviewStars(n) {
  reviewStars = Number(n) || 5;
  renderDrawer();
}

function onReviewBody(v) { reviewBody = v; }

function backToProfile() {
  drawerView = 'profile';
  renderDrawer();
}

function reviewFormHtml() {
  const t = reviewTarget;
  if (!t) return '';
  return `
    <div class="rv">
      <div class="rv-target">${esc(t.productName)}</div>
      <div class="rv-sub">Faqat siz olgan mato haqida — bahoyingiz boshqa xaridorlarga yordam beradi.</div>

      <div class="rv-stars">
        ${[1, 2, 3, 4, 5].map((n) => `
        <button class="rv-star ${n <= reviewStars ? 'on' : ''}" data-action="setReviewStars" data-arg="${n}" aria-label="${n} yulduz">★</button>`).join('')}
      </div>

      <textarea class="rv-text" rows="4" placeholder="Sifati haqida qisqacha yozing (ixtiyoriy)"
        data-input="onReviewBody">${esc(reviewBody)}</textarea>

      <div class="rv-btns">
        <button class="auth-ghost" data-action="backToProfile">Bekor</button>
        <button class="pd-add" data-action="submitReview" ${reviewSending ? 'disabled' : ''}>${reviewSending ? 'Yuborilmoqda…' : 'Yuborish'}</button>
      </div>
    </div>`;
}

function submitReview() {
  if (!reviewTarget || reviewSending) return;
  reviewSending = true;
  renderDrawer();
  const t = reviewTarget;
  apiJson('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: t.orderId,
      productId: t.productId,
      stars: reviewStars,
      body: reviewBody.trim() || undefined,
    }),
  })
    .then((d) => {
      if (!d || d.ok !== true) throw new Error((d && d.error) || 'Sharh yuborilmadi');
      showToast('Rahmat! Sharhingiz qo\'shildi');
      // Reyting serverda qayta hisoblandi — keshlarni bekor qilamiz, aks holda
      // xaridor o'z sharhini yozib, eski reytingni ko'rib turardi
      delete reviewsCache[t.productId];
      catalogMeta = null;
      catalogMetaTried = false;
      loadMyReviews();
      backToProfile();
    })
    .catch((e) => {
      reviewSending = false;
      renderDrawer();
      showToast(e.message || 'Sharh yuborilmadi');
    });
}

/* ── Toast ── */
let toastTimer = null;
function showToast(msg) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 2600);
}

/* ====================================================
   SAVAT
   Mahsulot ma'lumoti DOM'dagi data-* atributlaridan
   o'qiladi — yagona manba, JS'da takrorlanmaydi.
   ==================================================== */

const CART_KEY = 'lolamarket_web_cart';
const FAV_KEY = 'lolamarket_web_favs';

/** cart: { [id]: qty } */
let cart = loadCart();
/** favs: saralangan mahsulot id'lari */
let favs = loadFavs();
/** drawer holati: 'cart' | 'checkout' | 'done' | 'fav' */
let drawerView = 'cart';
let lastOrderId = '';

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
    // faqat sahifada mavjud mahsulotlarni qoldiramiz
    const clean = {};
    Object.keys(raw).forEach((id) => {
      const qty = parseInt(raw[id], 10);
      if (productEl(id) && qty > 0) clean[id] = Math.min(qty, 999);
    });
    return clean;
  } catch (e) {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) { /* private mode — jim o'tamiz */ }
}

function loadFavs() {
  try {
    const raw = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
    // sahifada endi mavjud bo'lmagan mahsulotlarni tashlab yuboramiz
    return Array.isArray(raw) ? raw.filter((id) => productEl(id)) : [];
  } catch (e) {
    return [];
  }
}

function saveFavs() {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  } catch (e) { /* private mode */ }
}

function productEl(id) {
  return document.querySelector(`.product-card[data-id="${CSS.escape(id)}"]`);
}

function product(id) {
  const el = productEl(id);
  if (!el) return null;
  return {
    id,
    name: el.dataset.name,
    price: Number(el.dataset.price) || 0,
    supplier: el.dataset.supplier,
    // `currentSrc` — brauzer <picture> dan HAQIQATAN tanlagan manba (WebP),
    // `src` esa har doim JPEG zaxirasi. `src` olinsa tafsilot oynasi, savat va
    // saralanganlar AYNAN bir rasmni ikkinchi formatda qaytadan yuklardi.
    // `currentSrc` rasm yuklana boshlaguncha bo'sh bo'ladi (`loading="lazy"`),
    // shuning uchun zaxira sifatida `src` qoladi.
    img: el.querySelector('img')?.currentSrc
      || el.querySelector('img')?.getAttribute('src') || '',
  };
}

function money(n) {
  return n.toLocaleString('ru-RU').replace(/ /g, ' ') + " so'm";
}

// Logistika (BTS Pochta) taxminiy narxi — server bilan bir xil qiymat
// (server/config.js DELIVERY_FEE_ESTIMATE). Mahsulot summasiga kirmaydi:
// xaridor buni BTS nuqtasida to'g'ridan-to'g'ri BTS'ga to'laydi.
const DELIVERY_FEE_ESTIMATE = 25000;

function cartCount() {
  return Object.values(cart).reduce((s, q) => s + q, 0);
}

function cartTotal() {
  return Object.keys(cart).reduce((s, id) => {
    const p = product(id);
    return p ? s + p.price * cart[id] : s;
  }, 0);
}

/* ── Savatga qo'shish ── */
function addToCart(id) {
  if (!product(id)) return;
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  updateBadge();
  renderCardAction(id);
  if (isOpen() && (drawerView === 'cart' || drawerView === 'fav')) renderDrawer();
}

/** Kartadagi tanlagich: qty 0 bo'lsa "Savatga", aks holda − N dona + */
function renderCardAction(id) {
  const box = document.getElementById('act-' + id);
  if (!box) return;
  const qty = cart[id] || 0;

  if (!qty) {
    box.innerHTML = `
      <button class="add-btn" data-action="addToCart" data-arg="${esc(id)}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Savatga
      </button>`;
    return;
  }

  box.innerHTML = `
    <div class="qty-row">
      <button class="qty-circle qty-minus" data-action="qtyStep" data-arg="${esc(id)}|-1" aria-label="Kamaytirish">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>
      </button>
      <span class="qty-num">${qty} dona</span>
      <button class="qty-circle qty-plus" data-action="qtyStep" data-arg="${esc(id)}|1" aria-label="Ko'paytirish">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>
    </div>`;
}

/** Barcha kartalarni savat holatiga moslash */
function renderAllCardActions() {
  document.querySelectorAll('.product-card').forEach((el) => renderCardAction(el.dataset.id));
}

/* ====================================================
   SARALANGANLAR
   ==================================================== */

function isFav(id) {
  return favs.indexOf(id) !== -1;
}

function toggleFav(id) {
  if (!product(id)) return;
  const i = favs.indexOf(id);
  if (i === -1) favs.push(id); else favs.splice(i, 1);
  saveFavs();
  renderFavBtn(id, i === -1);
  updateFavBadge();
  if (drawerView === 'fav' && isOpen()) renderDrawer();
}

/** Kartadagi yurakcha holati; `pulse` — endigina qo'shilganda urib qo'yadi */
function renderFavBtn(id, pulse) {
  const btn = document.getElementById('fav-' + id);
  if (!btn) return;
  const on = isFav(id);
  btn.classList.toggle('on', on);
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  btn.setAttribute('aria-label', on ? "Saralanganlardan olib tashlash" : "Saralanganlarga qo'shish");
  if (pulse) {
    btn.classList.remove('pulse');
    void btn.offsetWidth; // animatsiyani qayta ishga tushirish
    btn.classList.add('pulse');
  }
}

function renderAllFavBtns() {
  document.querySelectorAll('.product-card').forEach((el) => renderFavBtn(el.dataset.id, false));
}

/* Son ko'rsatilmaydi — faqat yurakcha to'ladi */
function updateFavBadge() {
  const btn = document.getElementById('fav-btn');
  if (btn) btn.classList.toggle('on', favs.length > 0);
}

function openFav() {
  drawerView = 'fav';
  renderDrawer();
  openDrawerEl();
}

/** Saralanganlardan savatga — yurakchada qoladi, faqat savatga qo'shiladi */
function favToCart(id) {
  addToCart(id);
  if (drawerView === 'fav') renderDrawer();
}

function setQty(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] < 1) delete cart[id];
  saveCart();
  updateBadge();
  renderCardAction(id);
  renderDrawer();
}

function removeLine(id) {
  delete cart[id];
  saveCart();
  updateBadge();
  renderCardAction(id);
  renderDrawer();
}

function updateBadge() {
  const n = cartCount();
  // Header'dagi va mobil nav'dagi sanoq — ikkalasi ham birga yangilanadi
  ['cart-count', 'm-cart-count'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = n;
    el.hidden = n === 0;
  });
}

/* ── Mobil pastki nav (faqat telefonda ko'rinadi) ──
   Yangi ekran yaratmaydi — mavjud drawer'larni ochadi, shuning uchun
   sahifa tuzilmasi va SEO o'zgarmaydi. */
function mNav(what) {
  if (what === 'catalog') {
    closeCart();
    document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (what === 'fav')   openFav();
  else if (what === 'cart')    openCart();
  else if (what === 'login')   onLogin();
  mNavActive(what);
}

function mNavActive(what) {
  const map = { catalog: 'm-tab-catalog', fav: 'm-tab-fav', cart: 'm-tab-cart' };
  Object.values(map).forEach((id) => document.getElementById(id)?.classList.remove('is-active'));
  document.getElementById(map[what])?.classList.add('is-active');
}

/* ── Drawer ochish/yopish ── */
function isOpen() {
  return document.getElementById('drawer')?.classList.contains('open');
}

function openCart() {
  drawerView = 'cart';
  renderDrawer();
  openDrawerEl();
}

/** Panelni ochish — savat va saralanganlar uchun umumiy */
function openDrawerEl() {
  const d = document.getElementById('drawer');
  const s = document.getElementById('scrim');
  if (!d || !s) return;
  s.hidden = false;
  requestAnimationFrame(() => s.classList.add('show'));
  d.classList.add('open');
  d.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const d = document.getElementById('drawer');
  const s = document.getElementById('scrim');
  if (!d || !s) return;
  d.classList.remove('open');
  d.setAttribute('aria-hidden', 'true');
  s.classList.remove('show');
  setTimeout(() => { s.hidden = true; }, 240);
  document.body.style.overflow = '';
  // muvaffaqiyat ekranidan keyin savat ko'rinishiga qaytamiz
  if (drawerView === 'done') drawerView = 'cart';
  // Panel yopilgach mobil nav'da "Katalog" yana faol bo'ladi
  mNavActive('catalog');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isOpen()) closeCart();
});

/* ── Drawer render ── */
function renderDrawer() {
  const body = document.getElementById('drawer-body');
  const foot = document.getElementById('drawer-foot');
  const title = document.getElementById('drawer-title');
  if (!body || !foot || !title) return;

  if (drawerView === 'done') {
    title.textContent = 'Buyurtma qabul qilindi';
    body.innerHTML = doneHtml();
    foot.hidden = true;
    return;
  }

  if (drawerView === 'checkout') {
    title.textContent = 'Buyurtmani rasmiylashtirish';
    body.innerHTML = checkoutHtml();
    foot.hidden = true;
    return;
  }

  if (drawerView === 'login') {
    title.textContent = 'Kirish';
    body.innerHTML = loginHtml();
    foot.hidden = true;
    return;
  }

  if (drawerView === 'profile') {
    title.textContent = 'Profil';
    body.innerHTML = profileHtml();
    foot.hidden = true;
    return;
  }

  if (drawerView === 'detail') {
    title.textContent = 'Mahsulot';
    body.innerHTML = detailHtml(detailId);
    foot.hidden = true;
    return;
  }

  if (drawerView === 'review') {
    title.textContent = 'Matoni baholang';
    body.innerHTML = reviewFormHtml();
    foot.hidden = true;
    return;
  }

  if (drawerView === 'fav') {
    title.textContent = 'Saralanganlar';
    foot.hidden = true;
    body.innerHTML = favs.length
      ? favs.map(favLineHtml).join('')
      : `<div class="drawer-empty">
           <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 20.8s-6.9-4.3-9-8a5.2 5.2 0 0 1-.5-3.7A4.8 4.8 0 0 1 6.3 5.5c1.9 0 3.4 1 4.3 2.3.4.6 1 .6 1.4 0 .9-1.3 2.4-2.3 4.3-2.3a4.8 4.8 0 0 1 3.8 3.6 5.2 5.2 0 0 1-.5 3.7c-2.1 3.7-9 8-9 8z"/></svg>
           <div class="drawer-empty-title">Saralanganlar bo'sh</div>
           <div class="drawer-empty-sub">Yoqqan matolarni yurakcha tugmasi bilan belgilang — keyin shu yerdan topasiz.</div>
         </div>`;
    return;
  }

  title.textContent = 'Savat';
  const ids = Object.keys(cart);

  if (!ids.length) {
    body.innerHTML = `
      <div class="drawer-empty">
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1 11.5H7z"/><path d="M9 8V6.2a3 3 0 0 1 6 0V8"/></svg>
        <div class="drawer-empty-title">Savat bo'sh</div>
        <div class="drawer-empty-sub">Katalogdan mato tanlang — buyurtmangizni shu yerda rasmiylashtirasiz.</div>
      </div>`;
    foot.hidden = true;
    return;
  }

  body.innerHTML = ids.map(lineHtml).join('');
  document.getElementById('cart-total').textContent = money(cartTotal());
  foot.hidden = false;
}

function lineHtml(id) {
  const p = product(id);
  if (!p) return '';
  const qty = cart[id];
  return `
    <div class="cart-line">
      <img class="cart-line-img" src="${p.img}" alt="" loading="lazy" />
      <div class="cart-line-main">
        <div class="cart-line-top">
          <div class="cart-line-name">${esc(p.name)}</div>
          <button class="line-x" data-action="removeLine" data-arg="${esc(id)}" aria-label="O'chirish">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div class="cart-line-sup">${esc(p.supplier)}</div>
        <div class="cart-line-bot">
          <div class="qty">
            <button class="qty-btn" data-action="qtyStep" data-arg="${esc(id)}|-1" aria-label="Kamaytirish">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>
            </button>
            <span class="qty-val">${qty} dona</span>
            <button class="qty-btn" data-action="qtyStep" data-arg="${esc(id)}|1" aria-label="Ko'paytirish">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
          <span class="cart-line-price">${money(p.price * qty)}</span>
        </div>
      </div>
    </div>`;
}

function favLineHtml(id) {
  const p = product(id);
  if (!p) return '';
  const inCart = cart[id] || 0;
  return `
    <div class="fav-line">
      <img class="fav-line-img" src="${p.img}" alt="" loading="lazy" />
      <div class="fav-line-main">
        <div class="cart-line-top">
          <div class="cart-line-name">${esc(p.name)}</div>
          <button class="line-x" data-action="toggleFav" data-arg="${esc(id)}" aria-label="Saralanganlardan olib tashlash">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div class="cart-line-sup">${esc(p.supplier)}</div>
        <div class="fav-line-price">${money(p.price)}</div>
        <div class="fav-line-act">
          ${inCart
            ? `<button class="fav-add in-cart" data-action="openCart">Savatda — ${inCart} dona</button>`
            : `<button class="fav-add" data-action="favToCart" data-arg="${esc(id)}">
                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                 Savatga
               </button>`}
        </div>
      </div>
    </div>`;
}

/* ── Checkout ── */
function goCheckout() {
  if (!cartCount()) return;
  drawerView = 'checkout';
  renderDrawer();
  document.getElementById('drawer-body')?.scrollTo(0, 0);
}

function backToCart() {
  drawerView = 'cart';
  renderDrawer();
}

function checkoutHtml() {
  const lines = Object.keys(cart).map((id) => {
    const p = product(id);
    return p
      ? `<div class="co-sum-row"><span>${esc(p.name)} · ${cart[id]} dona</span><span>${money(p.price * cart[id])}</span></div>`
      : '';
  }).join('');

  return `
    <button class="co-back" data-action="backToCart">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6l-6 6 6 6"/></svg>
      Savatga qaytish
    </button>

    <div class="co-sum" style="margin-top:12px">
      ${lines}
      <div class="co-sum-row" style="margin-top:9px;padding-top:9px;border-top:1px solid var(--border-hair);color:var(--text-muted);font-size:13px">
        <span>Yetkazish (taxminiy)</span><span>${money(DELIVERY_FEE_ESTIMATE)}</span>
      </div>
      <div class="co-sum-row" style="font-weight:700;color:var(--text-strong)">
        <span>Jami</span><span>${money(cartTotal())}</span>
      </div>
    </div>
    <div style="font-size:11px;color:var(--text-subtle);line-height:1.4;margin-top:-4px">BTS nuqtasida to'g'ridan-to'g'ri to'lanadi, yuqoridagi jamiga kirmaydi.</div>

    ${me ? '' : `
      <div class="co-login">
        <div class="co-login-txt">
          <b>Telegram orqali kiring</b> — ism va telefon o'zi to'ladi, buyurtma
          holati esa botga xabar bo'lib keladi.
        </div>
        <button type="button" class="co-login-btn" data-action="loginFromCheckout">Kirish</button>
      </div>`}

    <form id="co-form" onsubmit="submitOrder(event)" style="margin-top:16px" novalidate>
      <div class="co-field">
        <label class="co-label" for="co-name">Ismingiz *</label>
        <input class="co-input" id="co-name" type="text" autocomplete="name" placeholder="Ism familiya" value="${me && me.name ? esc(me.name) : ''}" required />
      </div>
      <div class="co-field">
        <label class="co-label" for="co-phone">Telefon *</label>
        <input class="co-input" id="co-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+998 90 123 45 67" value="${me && me.phone ? esc(me.phone) : ''}" required />
        <div class="co-hint">Buyurtmani tasdiqlash uchun shu raqamga bog'lanamiz.</div>
      </div>
      <div class="co-field">
        <label class="co-label" for="co-company">Kompaniya</label>
        <input class="co-input" id="co-company" type="text" autocomplete="organization" placeholder="Ixtiyoriy" />
      </div>
      <div class="co-field">
        <label class="co-label" for="co-address">Yetkazish manzili *</label>
        <input class="co-input" id="co-address" type="text" autocomplete="street-address" placeholder="Viloyat, tuman, BTS Pochta nuqtasi" required />
        <div class="co-hint">BTS Pochta orqali yetkaziladi — eng yaqin nuqtani yozing.</div>
      </div>
      <div class="co-field">
        <label class="co-label" for="co-comment">Izoh</label>
        <textarea class="co-area" id="co-comment" placeholder="Muddat yoki boshqa talablar (ixtiyoriy)"></textarea>
      </div>

      <div class="co-err" id="co-err" hidden></div>

      <button class="btn-order" type="submit" id="co-submit" style="margin-top:16px">
        Buyurtmani yuborish
      </button>
      <div class="co-hint" style="text-align:center;margin-top:10px">
        ${me
          ? "Buyurtma holati Telegram'dagi hisobingizga xabar bo'lib keladi — to'lov hozir olinmaydi."
          : "Buyurtma Telegram orqali bizga yetib boradi — to'lov hozir olinmaydi."}
      </div>
    </form>`;
}

// Ilgari shu yerda nextOrderId() bor edi — buyurtma raqamini brauzerda
// localStorage sanog'idan yasardi. Endi raqam faqat serverdan (order_seq)
// keladi: brauzerda yasalgan raqam bazada mavjud bo'lmagan buyurtmaga
// ishora qilardi va admin panelda hech qachon topilmasdi.

function submitOrder(e) {
  e.preventDefault();

  const name = val('co-name');
  const phone = val('co-phone');
  const company = val('co-company');
  const address = val('co-address');
  const comment = val('co-comment');
  const err = document.getElementById('co-err');
  const btn = document.getElementById('co-submit');

  const digits = phone.replace(/\D/g, '');
  if (!name) return showErr(err, 'Ismingizni kiriting.');
  if (digits.length < 9) return showErr(err, "Telefon raqamini to'liq kiriting.");
  if (!address) return showErr(err, 'Yetkazish manzilini kiriting.');
  if (!cartCount()) return showErr(err, "Savat bo'sh.");
  if (err) err.hidden = true;

  // Serverga faqat mahsulot ID va miqdor ketadi. Nom/narx/jami YUBORILMAYDI —
  // ularni server bazadan oladi, aks holda narxni brauzer dikta qilardi.
  const items = Object.keys(cart).map((id) => ({ id, qty: cart[id] }));

  btn.disabled = true;
  btn.textContent = 'Yuborilmoqda…';

  // credentials — sessiya cookie'si bilan ketsin: server shundan xaridorning
  // Telegram ID'sini biladi va buyurtmani uning hisobiga bog'laydi.
  fetch('/api/web-orders', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, buyerName: name, phone, company, address, comment }),
  })
    .then((r) => r.json().catch(() => null))
    .then((d) => {
      // Buyurtma raqami SERVERDAN keladi — u bazadagi haqiqiy yozuvning raqami.
      // Ilgari raqam brauzerda o'ylab topilardi va bazada hech narsa qolmasdi:
      // xaridor "qabul qilindi" ekranini ko'rar, admin panelda esa buyurtma
      // umuman ko'rinmasdi (2026-07-29 dagi nosozlik).
      if (!d || !d.ok || !d.orderId) throw new Error(d && d.error ? d.error : 'server');
      lastOrderId = d.orderId;
      cart = {};
      saveCart();
      updateBadge();
      renderAllCardActions();
      drawerView = 'done';
      renderDrawer();
      // Profil ro'yxati eskirmasin — kirgan bo'lsa qaytadan o'qiymiz
      if (me) loadMyOrders();
    })
    .catch((e) => {
      btn.disabled = false;
      btn.textContent = 'Buyurtmani yuborish';
      // Server aniq sabab aytgan bo'lsa (MOQ, telefon, tugagan mahsulot) — o'shani
      // ko'rsatamiz. Aks holda umumiy tarmoq xatosi.
      showErr(err, e.message && e.message !== 'server'
        ? e.message
        : "Yuborib bo'lmadi. Internetni tekshiring yoki Telegram bot orqali buyurtma bering.");
    });
}

function doneHtml() {
  return `
    <div class="drawer-done">
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16 10"/></svg>
      <div class="drawer-done-title">Buyurtmangiz qabul qilindi</div>
      <div class="order-id">${lastOrderId}</div>
      <div class="drawer-done-sub" style="margin-top:6px">
        ${me
          ? "Tez orada ko'rsatilgan telefon raqamingizga bog'lanamiz. Holat o'zgarganda Telegram'ga xabar keladi."
          : "Tez orada ko'rsatilgan telefon raqamingizga bog'lanamiz. Buyurtma holatini Telegram bot orqali ham kuzatishingiz mumkin."}
      </div>
      ${me
        ? `<button class="cta-bot-btn" style="margin-top:16px;height:44px;font-size:14px;background:var(--grad-pom);color:var(--pom-100)" data-action="onLogin">
             Buyurtmalarim
           </button>`
        : `<a class="cta-bot-btn" style="margin-top:16px;height:44px;font-size:14px;background:var(--grad-pom);color:var(--pom-100)" href="https://t.me/lolamarketbot" target="_blank" rel="noopener">
             Botni ochish
           </a>`}
    </div>`;
}

/* ── Yordamchilar ── */
function val(id) {
  return (document.getElementById(id)?.value || '').trim();
}

function showErr(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* ── Boshlang'ich holat ──
   Saqlangan savat/saralanganlar bilan qaytgan mehmon darhol o'z holatini ko'radi */
updateBadge();
renderAllCardActions();
updateFavBadge();
renderAllFavBtns();

/* Kartochka endi bosiladigan element — klaviatura bilan ham ochilsin.
   Atributlar HTML'da 12 marta takrorlanmaydi: kartochka qo'shilganda
   unutilishi mumkin bo'lgan narsa shu yerda bir joyda beriladi. */
document.querySelectorAll('.product-card[data-id]').forEach((card) => {
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', (card.dataset.name || 'Mahsulot') + " — batafsil");
  card.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    // Fokus ichkaridagi tugmada bo'lsa (savat/yurakcha) — o'sha tugma ishlasin
    if (e.target !== card) return;
    e.preventDefault();
    openDetail(card.dataset.id);
  });
});
