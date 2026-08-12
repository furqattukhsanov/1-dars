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

/* Forma yuborish uchun alohida qatlam: `submit` `click` emas, ya'ni yuqoridagi
   tinglovchi uni ko'rmaydi. Funksiya HODISANING O'ZINI oladi — `submitOrder`
   ichida `preventDefault()` chaqiriladi, aks holda sahifa qayta yuklanardi. */
document.addEventListener('submit', (e) => {
  const form = e.target.closest('[data-submit]');
  if (!form) return;
  const fn = window[form.dataset.submit];
  if (typeof fn === 'function') fn(e);
});

/* Enter bosilishi — uchinchi qatlam. `keydown` ham `click` emas, ya'ni yuqoridagi
   tinglovchilarning hech biri uni ko'rmaydi. Narx filtrining ikkala maydonida
   ilgari `onkeydown="if(event.key==='Enter')applyPrice()"` turardi va u C1
   supurishidan O'TIB KETGAN edi — o'sha qidiruv faqat click/input/change/submit/
   error hodisalarini sanagan, ya'ni "hammasini qamradim" degan xulosa qidiruv
   ro'yxati qanchalik to'liq bo'lsa shunchalik to'g'ri bo'lgan. Endi qamrovni
   hodisa nomlari ro'yxati emas, Test 15 belgilaydi. */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const el = e.target.closest('[data-enter]');
  if (!el) return;
  const fn = window[el.dataset.enter];
  if (typeof fn === 'function') fn();
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
   unga maydon qiymati uzatiladi.

   ⚠️ IKKINCHI argument — `data-arg` (2026-08-13). Maydon QAYSI narsaga
   tegishli ekanini bilish kerak bo'lgan joy paydo bo'ldi: AI erkin matni
   mahsulotga bog'langan (`setAiText(qiymat, productId)`). Mini App
   delegatsiyasi buni ALLAQACHON shunday qiladi, ya'ni bu yerda yangi
   konvensiya emas — ikki yuza o'rtasidagi FARQ yopildi.
   Farq jimgina zarar keltirgan edi: `data-arg` uzatilmagani uchun matn
   `aiText[undefined]` ga yozilardi va xaridor yozgan izoh so'rovga UMUMAN
   tushmasdi — konsolda xato yo'q, tugma ishlaydi, natija esa boshqa.
   Bitta argument oladigan eski chaqiruvlar (`onSearch`, `onReviewBody`,
   `onDisputeComment`) ortiqcha argumentni shunchaki e'tiborsiz qoldiradi. */
document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-input]');
  if (!el) return;
  const fn = window[el.dataset.input];
  if (typeof fn === 'function') fn(e.target.value, el.dataset.arg);
});

/* ── `change` delegatsiyasi ──
   `<select>` uchun. Zamonaviy brauzerlar tanlovda `input` ni ham otadi,
   ya'ni yuqoridagi qatlam KO'PINCHA yetardi — lekin `change` bu element
   uchun kanonik hodisa va hamma joyda otiladi. BTS nuqtasi buyurtmaning
   yetkazish manzili, ya'ni "ko'pincha ishlaydi" yetarli emas. */
document.addEventListener('change', (e) => {
  const el = e.target.closest('[data-change]');
  if (!el) return;
  const fn = window[el.dataset.change];
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
  loadAiCredits();
  // Checkout'dan kirgan bo'lsa — formaga qaytamiz, savat yo'qolmaydi
  if (afterLoginView === 'checkout' && cartCount()) {
    afterLoginView = null;
    drawerView = 'checkout';
    renderDrawer();
    return;
  }
  // AI blokidan kirgan bo'lsa — AYNI mahsulotga qaytamiz, aks holda xaridor
  // profilga tushib qolib, qaysi matoni ko'rayotganini qaytadan qidirardi.
  if (afterLoginView === 'detail' && detailId && product(detailId)) {
    afterLoginView = null;
    drawerView = 'detail';
    renderDrawer();
    if (!isOpen()) openDrawerEl();
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
  // Sharh va bahslar ham tozalanadi — ular AVVALGI hisobning ma'lumoti.
  // Qolib ketsa keyingi kirgan odam begona bahs matnini ko'rib qolardi.
  myReviews = [];
  myDisputes = [];
  // Kredit qoldig'i ham AVVALGI hisobniki — qolib ketsa keyingi kirgan odam
  // begona balansni ko'rib turardi. Rasm holatlari ham tozalanadi: "kredit
  // tugadi" yozuvi yangi hisobda jimgina yolg'on bo'lardi.
  aiCredits = null;
  Object.keys(aiImages).forEach((k) => { delete aiImages[k]; });
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
  // Bahslar ham: qatorda "murojaat" tugmasi yoki ochiq bahs holati
  // ko'rsatiladi — ikkinchi marta bahs ochib bo'lmaydi (server 409 beradi)
  loadMyDisputes();
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
    if (!d || !d.ok) return;
    // To'lov sozlamalari — faqat SHAKLI to'g'ri bo'lsa qabul qilinadi.
    // `!= null` tekshiruvining O'ZI yetarli emas: bo'sh satr yoki `0` ham
    // "keldi" bo'lib ko'rinardi va zaxira qiymatni bosib o'tardi
    // (CLAUDE.md — "sozlama qiymati bo'sh emasligi uni haqiqiy qilmaydi").
    if (Number.isFinite(d.prepayRate) && d.prepayRate > 0 && d.prepayRate <= 1) {
      PREPAY_RATE = d.prepayRate;
    }
    if (Number.isFinite(d.deliveryFee) && d.deliveryFee >= 0) {
      DELIVERY_FEE_ESTIMATE = d.deliveryFee;
    }
    // ⚠️ Bu yerda ham `renderDrawer()` chaqirilMAYDI — `setBtsPoint` dagi
    // bilan bitta sabab: checkout ochiq bo'lsa xaridor yozgan maydonlar
    // o'chib ketardi. Faqat raqamlar joyida almashtiriladi.
    paintCheckoutTotals();
    // AI sozlamasi — kalitlar SERVERDAN (`aiClientConfig`). Kirmagan
    // foydalanuvchi ham oladi: bo'lim ko'rinadi, tugma o'rniga "Kirish".
    // ⚠️ Tafsilot oynasi ALLAQACHON ochiq bo'lsa u qayta chiziladi: bu so'rov
    // asinxron, ya'ni sekin tarmoqda xaridor mahsulotni sozlama kelgunicha
    // ochib ulgurishi mumkin va o'shanda AI bloki JIMGINA yo'q bo'lardi
    // (xato yo'q, sabab ko'rinmaydi). Checkout va boshqa ko'rinishlarga
    // TEGILMAYDI — u yerda xaridor yozayotgan maydonlar o'chib ketardi.
    aiCfg = readAiConfig(d);
    if (aiCfg && isOpen() && drawerView === 'detail') renderDrawer();
    if (d.user) {
      me = d.user;
      refreshAuthUi();
      loadAiCredits();
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

/* Bahs faqat mato yo'lga chiqqandan keyin — server bilan BIR XIL ro'yxat
   (server/routes/disputes.js → DISPUTE_ALLOWED_ORDER_STATUS). Undan oldingi
   muammo "buyurtma" muammosi (bekor qilish), bahs emas. */
const DISPUTE_OK_STATUS = ['shipped', 'delivered', 'completed'];

/* Bahs sabablari — kalitlar SERVERDAGI `DISPUTE_REASONS` bilan bir xil
   bo'lishi SHART (`server/routes/disputes.js`). Server `enum` bilan
   tekshiradi: kalit mos kelmasa xaridor formani to'ldirib bo'lgach 400
   xato ko'rardi. */
const DISPUTE_REASONS = {
  not_delivered: 'Mato yetib kelmadi',
  damaged:       'Mato shikastlangan',
  wrong_item:    'Boshqa mato keldi',
  quality:       'Sifat mos emas',
  quantity:      'Miqdor kam chiqdi',
  other:         'Boshqa muammo',
};
const DISPUTE_STATUS = {
  open:     "Ko'rib chiqilmoqda",
  resolved: 'Hal qilindi',
  rejected: 'Rad etildi',
  closed:   'Yopildi',
};

/** buyurtma id → tarix ochiqmi */
const openHistory = {};
/** serverdan kelgan bahslar (kirgan bo'lsa) */
let myDisputes = [];

function disputeOf(orderId) {
  return myDisputes.find((d) => d.orderId === orderId) || null;
}

function toggleHistory(orderId) {
  openHistory[orderId] = !openHistory[orderId];
  if (drawerView === 'profile') renderDrawer();
}

function loadMyDisputes() {
  if (!me) { myDisputes = []; return; }
  apiJson('/api/disputes')
    .then((d) => { myDisputes = d && d.ok && Array.isArray(d.data) ? d.data : []; })
    .catch(() => { myDisputes = []; })
    .then(() => { if (isOpen() && drawerView === 'profile') renderDrawer(); });
}

function orderRowHtml(o) {
  const st = ORDER_STATUS[o.status] || { label: o.status, tone: 'wait' };
  const items = REVIEW_OK_STATUS.includes(o.status) ? (o.items || []) : [];
  const hist = Array.isArray(o.history) ? o.history : [];
  const open = openHistory[o.id];
  const disp = disputeOf(o.id);

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

      <!-- Holat tarixi — BAZADAGI haqiqiy yozuvlar (order_status_history).
           Qadamlar ro'yxati oldindan chizilmaydi: "1-2-3-4" ko'rinishidagi
           progress hali bo'lmagan qadamni ham ko'rsatib, buyurtma qayerdaligi
           haqida yolg'on gapirardi. Tarix yo'q bo'lsa blok umuman yo'q. -->
      ${hist.length ? `
      <button class="order-hist-btn" data-action="toggleHistory" data-arg="${esc(o.id)}" aria-expanded="${open ? 'true' : 'false'}">
        ${open ? 'Tarixni yashirish' : `Holat tarixi (${hist.length})`}
      </button>
      ${open ? `
      <ol class="order-hist">
        ${hist.map((h) => {
          const hs = ORDER_STATUS[h.status] || { label: h.status };
          return `<li class="order-hist-line"><span class="order-hist-dot"></span>
            <span class="order-hist-txt">${esc(hs.label)}</span>
            <span class="order-hist-date">${esc(h.date || '')}</span></li>`;
        }).join('')}
      </ol>` : ''}` : ''}

      <!-- Bahs: ochilgan bo'lsa holati, bo'lmasa tugma -->
      ${disp ? `
      <div class="order-disp">
        <div class="order-disp-top">
          <b>Bahs #${esc(String(disp.id))}</b>
          <span class="order-disp-st ${disp.status === 'open' ? 'warn' : 'ok'}">${esc(DISPUTE_STATUS[disp.status] || disp.status)}</span>
        </div>
        <div class="order-disp-reason">${esc(disp.reason || '')}</div>
        ${disp.sellerResponse ? `<div class="order-disp-reply"><b>Ishlab chiqaruvchi javobi:</b> ${esc(disp.sellerResponse)}</div>` : ''}
        ${disp.refundAmount ? `<div class="order-disp-reply"><b>Qaytariladi:</b> ${money(disp.refundAmount)}</div>` : ''}
      </div>`
        : DISPUTE_OK_STATUS.includes(o.status)
        ? `<button class="order-disp-btn" data-action="openDispute" data-arg="${esc(o.id)}">Muammo bo'yicha murojaat</button>`
        : ''}

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
      mergeCatalog(list);
      if (isOpen() && drawerView === 'detail') renderDrawer();
    })
    .catch(() => { /* detal data-* atributlari bilan ishlayveradi */ })
    // Savat/saralanganlarni tozalash SO'ROV TUGAGACH bo'ladi — muvaffaqiyatda
    // ham, xatoda ham. Sabab pastda, `settleCatalog()` izohida.
    .then(settleCatalog);
}

/* ====================================================
   KATALOGNI BAZA BILAN BIRLASHTIRISH (2026-08-12)

   2026-08-12 gacha saytdagi katalog `index.html` ichiga QO'LDA yozilgan 12 ta
   kartochkadan iborat edi, Mini App esa o'shanda ham `/api/products` dan
   o'qirdi. Natijada sotuvchi e'lon qo'shsa u Mini App'da chiqar, saytda esa
   HECH QACHON ko'rinmasdi — o'lchandi: bazada 22 ta nashr etilgan e'lon,
   saytda 12 ta. Teskarisi ham bor edi: `ik-9001` saytda turardi, bazada esa
   yo'q — xaridor uni savatga solib buyurtma bersa server rad etardi.

   Yechim — ALMASHTIRISH emas, BIRLASHTIRISH:
     * HTML'dagi kartochkalar joyida qoladi. Ular SEO uchun ham, tarmoq sekin
       bo'lganda darhol chiziladigan tarkib uchun ham kerak — katalog butunlay
       JS'ga o'tkazilsa qidiruv tizimi bo'sh sahifa ko'rardi;
     * bazada bor, HTML'da yo'q e'lon — gridga QO'SHILADI;
     * ikkalasida bor e'lonning narxi va zaxirasi bazadagiga TENGLASHTIRILADI;
     * HTML'da bor, bazada yo'q kartochka — OLIB TASHLANADI (`ik-9001` toifasi).

   Kartochka DOM'ga haqiqiy `.product-card` bo'lib tushadi, shuning uchun
   filtr, qidiruv, narx oralig'i, savat, saralanganlar va detal oynasi
   qo'shimcha kodsiz ishlayveradi — ularning hammasi `data-*` atributlarini
   o'qiydi (`product()`), alohida ro'yxatni emas.
   ==================================================== */

/** Zaxira chegarasi — Mini App'dagi `LOW_STOCK` bilan bir xil qiymat */
const LOW_STOCK = 5;
const STOCK_TXT = { in: 'Sotuvda', low: 'Kam qoldi', made: 'Buyurtmaga', out: 'Tugadi' };
/** `badge_tone` → mavjud CSS sinfi */
const BADGE_TONE = { primary: 'tone-primary', teal: 'tone-teal', saffron: 'tone-saffron', neutral: 'tone-neutral' };

/** zaxirasi tugagan mahsulot id'lari — savat tugmasi o'rniga "Tugadi" chiqadi */
const soldOutIds = new Set();

/* Zaxira ko'rinishi — Mini App'dagi `stockView()` bilan AYNAN bir xil qoida
   (`telegram-app/app.js`). `stock === null` CHEKSIZ degani: `made`
   mahsulotlar va sotuvchi son kiritmagan e'lonlar. */
function stockView(p) {
  const n = p.stock;
  if (n === null || n === undefined) {
    const k = STOCK_TXT[p.stockKey] ? p.stockKey : 'made';
    return { txt: STOCK_TXT[k], key: k, soldOut: false };
  }
  if (n <= 0) return { txt: STOCK_TXT.out, key: 'out', soldOut: true };
  if (n <= LOW_STOCK) return { txt: `${STOCK_TXT.low} · ${n}`, key: 'low', soldOut: false };
  return { txt: STOCK_TXT.in, key: 'in', soldOut: false };
}

/* Rasm manzili.

   ⚠️ Bazadagi eski e'lonlarda `img` — `assets/products/textile-01.jpg`, ya'ni
   NISBIY yo'l. U Mini App uchun yozilgan va serverda `/mini-app/assets/...`
   ostida yotadi; sayt ildizida esa bunday fayl YO'Q. Nisbiy yo'l shundoq
   qo'yilsa `lolamarket.uz/assets/products/textile-01.jpg` so'raladi va nginx
   `try_files ... /index.html` bilan **HTTP 200 va HTML** qaytaradi — ya'ni
   rasm sindi, lekin holat kodi sog'lom ko'rinadi (CLAUDE.md dagi o'sha
   soft-200 tuzog'i; 2026-08-12 da `curl` bilan o'lchandi:
   `200 text/html`). Shuning uchun nisbiy yo'l Mini App papkasiga
   yo'naltiriladi — fayl HAQIQATAN o'sha yerda (`200 image/jpeg`).

   Sotuvchi qo'shgan yangi e'lonlarda `img` allaqachon to'liq manzil bo'ladi:
   `https://cdn.lolamarket.uz/...` (R2) yoki `/api/product-photo?...`
   (Telegram proksi) — ular tegilmaydi. */
function apiImgUrl(u) {
  const s = String(u || '');
  if (!s) return '';
  if (/^(https?:)?\/\//.test(s) || s.charAt(0) === '/') return s;
  // Mutlaq yo'l — nisbiy emas: nisbiysi joriy sahifa manziliga bog'lanadi va
  // katalog ildizdan boshqa yo'lda ochilsa jimgina sinardi.
  return '/mini-app/' + s.replace(/^\.?\//, '');
}

/** API yozuvidan kartochka HTML'i — HTML'dagi qo'lda yozilgan kartochka bilan
    bir xil tuzilma (`data-*`, `act-<id>`, `fav-<id>`), aks holda savat va
    saralanganlar bu kartochkalarni ko'rmasdi. */
function apiCardHtml(p) {
  const name = p.name && p.name.uz ? p.name.uz : p.id;
  const supplier = (p.supplier && p.supplier.uz) || '';
  const img = apiImgUrl(p.img);
  const st = stockView(p);
  // Belgi: sotuvchi bergani ustun, bo'lmasa zaxira holati (faqat diqqat
  // talab qiladigani — "Sotuvda" har kartochkada takrorlansa shovqin bo'ladi)
  const badgeTxt = (p.badge && p.badge.uz) || (st.key === 'low' || st.key === 'out' || st.key === 'made' ? st.txt : '');
  const badgeCls = BADGE_TONE[p.badgeTone] || (st.key === 'out' ? 'tone-neutral' : st.key === 'low' ? 'tone-saffron' : 'tone-teal');

  return `
    <article class="product-card fade-up" data-id="${esc(p.id)}" data-name="${esc(name)}" data-price="${esc(String(p.price))}" data-supplier="${esc(supplier)}" data-cat="${esc(p.catKey || '')}">
      <div class="product-media">
        ${img ? `<img src="${esc(img)}" alt="${esc(name)}" loading="lazy" />` : ''}
        ${badgeTxt ? `<span class="badge-pill ${badgeCls}">${esc(badgeTxt)}</span>` : ''}
        <button class="fav-btn" id="fav-${esc(p.id)}" data-action="toggleFav" data-arg="${esc(p.id)}" aria-label="Saralanganlarga qo'shish" aria-pressed="false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 20.8s-6.9-4.3-9-8a5.2 5.2 0 0 1-.5-3.7A4.8 4.8 0 0 1 6.3 5.5c1.9 0 3.4 1 4.3 2.3.4.6 1 .6 1.4 0 .9-1.3 2.4-2.3 4.3-2.3a4.8 4.8 0 0 1 3.8 3.6 5.2 5.2 0 0 1-.5 3.7c-2.1 3.7-9 8-9 8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <div class="product-body">
        <div class="product-name">${esc(name)}</div>
        <div class="product-supplier">
          <span>${esc(supplier)}</span>
          ${p.verified ? `<span class="verified" title="LolaMarket tomonidan tasdiqlangan ishlab chiqaruvchi" aria-label="LolaMarket tomonidan tasdiqlangan ishlab chiqaruvchi"><svg width="12" height="12" viewBox="0 0 24 24" fill="#7a140d"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.6 1.5-.9 2.9.9 2.9-2.6 1.5-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8L3 16.3l.9-2.9L3 10.5l2.6-1.5 1-2.8 3 .2z"/><path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>` : ''}
        </div>
        <div class="product-price">
          <span class="price-label">1 dona ${esc(p.unit === 'panel' ? 'panel' : 'rulon')} narxi</span>
          <span class="price-value">${money(Number(p.price) || 0)}</span>
        </div>
        <div class="card-action" id="act-${esc(p.id)}"></div>
      </div>
    </article>`;
}

/** Yangi kartochka HTML'dagilar bilan bir xil imkoniyatga ega bo'lsin:
    ko'rinish animatsiyasi va klaviatura bilan ochilishi. Init blokidagi
    sozlash faqat sahifa yuklanganda mavjud kartochkalar ustidan yurgan. */
function equipCard(card) {
  observer.observe(card);
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', (card.dataset.name || 'Mahsulot') + ' — batafsil');
  card.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (e.target !== card) return;
    e.preventDefault();
    openDetail(card.dataset.id);
  });
}

function mergeCatalog(list) {
  if (!grid || !Array.isArray(list) || !list.length) return;

  const seen = new Set();
  const added = [];

  list.forEach((p) => {
    if (!p || !p.id) return;
    seen.add(p.id);
    if (stockView(p).soldOut) soldOutIds.add(p.id); else soldOutIds.delete(p.id);

    const el = productEl(p.id);
    if (!el) { added.push(apiCardHtml(p)); return; }

    // ---- Allaqachon HTML'da bor: narxni bazadagiga tenglashtiramiz ----
    // Ko'rsatilgan narx bazadagidan ajralib ketmasin. Buyurtma summasini
    // baribir server hisoblaydi (`submitOrder` izohi), ya'ni eskirgan narx
    // xaridorga BOSHQA raqam va'da qilib, checkout'da uchinchisini
    // ko'rsatardi.
    const price = Number(p.price) || 0;
    if (price && Number(el.dataset.price) !== price) {
      el.dataset.price = String(price);
      const box = el.querySelector('.price-value');
      if (box) box.textContent = money(price);
    }
  });

  // ---- Bazada yo'q kartochkalarni olib tashlaymiz ----
  // Aynan `ik-9001` toifasi: kartochka savat tugmasi bilan turadi, lekin
  // buyurtma serverda rad etiladi. Bu qadam nuqsonni O'ZI TUZATADIGAN
  // qiladi — kelajakda e'lon bazadan olinsa saytda qolib ketmaydi.
  grid.querySelectorAll('.product-card[data-id]').forEach((el) => {
    if (!seen.has(el.dataset.id)) el.remove();
  });

  if (added.length) {
    const box = document.createElement('div');
    box.innerHTML = added.join('');
    [...box.children].forEach((card) => { grid.appendChild(card); equipCard(card); });
  }

  renderAllCardActions();
  renderAllFavBtns();
  applyFilter();
}

/* Katalog so'rovi tugagach (muvaffaqiyat ham, xato ham) bir marta chaqiriladi.

   Savat va saralanganlar `localStorage` da yotadi va ilgari sahifa
   yuklanayotganda DOM'ga qarab tozalanardi. Endi bu MUMKIN EMAS: o'sha
   ondagi DOM'da faqat HTML'dagi kartochkalar bor, sotuvchi e'lonlari esa
   hali kelmagan — ya'ni tozalash xaridorning savatidagi haqiqiy mahsulotni
   "yo'q ekan" deb tashlab yuborardi. Shuning uchun tozalash katalog
   joyiga tushgandan KEYINGA suriladi. */
function settleCatalog() {
  let changed = false;
  Object.keys(cart).forEach((id) => {
    if (!productEl(id)) { delete cart[id]; changed = true; }
  });
  const keepFavs = favs.filter((id) => productEl(id));
  if (keepFavs.length !== favs.length) { favs = keepFavs; saveFavs(); }
  if (changed) saveCart();

  updateBadge();
  updateFavBadge();
  if (isOpen()) renderDrawer();
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

/* ====================================================
   AI KIYIM RASMI — SAYTDA (2026-08-13, C1)

   Mini App'dagi bo'lim (`telegram-app/app.js` → `aiImageSection`) saytga
   olib o'tildi. Endpointlar AYNI: `/api/ai/image`, `/api/ai/my`. Ikki
   kanalning yagona farqi KIMLIKDA:
     * Mini App — imzolangan `initData` header'da;
     * sayt — HttpOnly cookie sessiyasi, ya'ni bu yerda hech qanday header
       qo'shilmaydi, faqat `credentials: 'same-origin'` (`apiJson` shuni
       qiladi).
   Server ikkalasini `requestUser()` bilan BITTA shaklga keltiradi
   (CLAUDE.md — "kimlik ikki kanalda bitta nuqtadan").

   ⚠️ SAVOL KALITLARI SERVERDAN keladi (`/api/auth/web/me` → `aiClientConfig`)
   va bu yerda QO'LDA yozilmaydi. Yorliqlar (o'zbekcha matn) esa frontendda —
   Mini App'dagi bilan bir xil bo'linish. Sabab: kalit ikki joyda yozilsa
   ular ajralib ketardi va sayt xaridori serverning oq ro'yxatidan
   o'tmaydigan javob yuborib, tugmani bosgach 400 xato ko'rardi — ustiga bu
   PULLIK so'rov (db/014 darsi).

   ⚠️ AVTOMATIK YUKLASH YO'Q — bu qaror Mini App'dan ko'chdi va sabab
   XARAJATDA: bitta rasm ~$0.04 va 2 Lola credit. Kirish nuqtasi doim TUGMA.
   ==================================================== */

/** Serverdan kelgan sozlama. `null` — hali kelmagan yoki AI o'chiq */
let aiCfg = null;
/** productId → { state: 'loading'|'done'|'error'|... , url } */
const aiImages = {};
/** productId → { guruh: kalit } */
const aiChoices = {};
/** productId → erkin matn (faqat combo) */
const aiText = {};
/** productId → "boshqa fason" varianti (0 = birinchi) */
const aiVariant = {};
/** { balance, cost, unlimited } — serverdan. `null` bo'lsa qator CHIZILMAYDI */
let aiCredits = null;

/* Yorliqlar — kalitlar serverdan, matn shu yerda (Mini App bilan bir xil).
   ⚠️ Yorliq topilmasa kalitning O'ZI chiziladi: jimgina yo'qolib qolgandan
   ko'ra "notanish kalit" ko'rinib turgani yaxshi. */
const AI_Q = {
  kiyim: "Nima tikilsin?", uslub: "Qayerga?", dizayn: "Dizayn yo'nalishi",
  rang: "Qo'shimcha rang", qoshimcha: "Qo'shimcha material",
};
const AI_O = {
  koylak_milliy: 'Milliy ko\'ylak', koylak: 'Ko\'ylak', kostyum: 'Kostyum',
  palto: 'Palto', yubka: 'Yubka', romol: 'Ro\'mol',
  kundalik: 'Kundalik', bayram: 'Bayram / to\'y', ish: 'Ish',
  neoklassika: 'Neoklassika', zamonaviy: 'Zamonaviy',
  minimalistik: 'Minimalistik', combo: 'Combo',
  oq: 'Oq', qora: 'Qora', bej: 'Bej', kok: 'Ko\'k',
  yashil: 'Yashil', bordo: 'Bordo', oltin: 'Oltin',
  yoq: 'Yo\'q', charm: 'Charm', jinsi: 'Jinsi',
  bahmal: 'Bahmal', dantel: 'Dantel', trikotaj: 'Trikotaj',
};

/** Serverdan kelgan AI sozlamasini SHAKLI bo'yicha qabul qiladi.
    ⚠️ `!= null` yetarli emas (CLAUDE.md — "sozlama qiymati bo'sh emasligi
    uni haqiqiy qilmaydi"): bo'sh obyekt kelsa bo'lim savolsiz chizilib,
    tugma bosilgach server 400 berardi. Shakl noto'g'ri bo'lsa `aiCfg` `null`
    qoladi va bo'lim UMUMAN ko'rsatilmaydi. */
function readAiConfig(d) {
  if (!d || !d.aiImageEnabled) return null;
  const g = d.aiImageChoices;
  if (!g || typeof g !== 'object' || !Object.keys(g).length) return null;
  const toza = {};
  Object.keys(g).forEach((k) => { if (Array.isArray(g[k]) && g[k].length) toza[k] = g[k]; });
  if (Object.keys(toza).length !== Object.keys(g).length) return null;
  const combo = d.aiComboChoices && typeof d.aiComboChoices === 'object' ? d.aiComboChoices : null;
  return {
    keys: toza,
    comboKeys: combo,
    textMax: Number.isInteger(d.aiComboTextMax) && d.aiComboTextMax > 0 ? d.aiComboTextMax : 60,
    variantMax: Number.isInteger(d.aiVariantMax) && d.aiVariantMax > 0 ? d.aiVariantMax : 0,
  };
}

/** Kredit qatori. `null` bo'lsa UMUMAN chizilmaydi — CLAUDE.md: ma'lumot
    bazadan kelmasa blok ko'rsatilmaydi (o'ylab topilgan raqam qo'yilmaydi). */
function aiCreditLine() {
  if (!aiCredits) return '';
  const matn = aiCredits.unlimited
    ? 'Lola credit: ∞ Cheksiz'
    : `${aiCredits.balance} credit qoldi · Bitta rasm — ${aiCredits.cost} credit`;
  return `<div class="ai-count" style="margin-top:8px">✦ ${esc(matn)}</div>`;
}

/* "Boshqa fason" tugmasi. Chegaraga yetganda UMUMAN chizilmaydi (o'chirilgan
   holda qoldirilmaydi): bosilmaydigan tugma xaridorga nima qilish kerakligini
   aytmaydi, yo'q tugma esa savol tug'dirmaydi. Narx tugmaning O'ZIDA — bu
   YANGI kesh kaliti, ya'ni yangi rasm va yangi kredit. */
function aiOtherCutBtn(id) {
  const joriy = aiVariant[id] || 0;
  if (!aiCfg || !aiCfg.variantMax || joriy >= aiCfg.variantMax) return '';
  const narx = aiCredits && aiCredits.cost;
  return `<button class="ai-ghost" data-action="otherCutAiImage" data-arg="${esc(id)}">✦ ${
    esc('Boshqa fason' + (narx ? ` · Yangi fason — ${narx} credit` : ''))}</button>`;
}

/** Mahsulot tafsilotidagi AI bloki. Bo'sh satr = blok umuman yo'q. */
function aiSection(id) {
  if (!aiCfg) return '';
  const head = '<div class="pd-sec-title">AI kiyim rasmi</div>';
  const st = aiImages[id];

  // Holat 1 — savollar.
  // ⚠️ Zaxira javob ATAYLAB YO'Q: hammasi tanlanmaguncha tugma o'chiq turadi.
  // Sabab pulda — oldindan to'ldirilgan javob bilan xaridor o'zi tanlamagan
  // narsani chizdirib yuborardi.
  if (!st) {
    const tanlov = aiChoices[id] || {};
    // Combo savollari SHARTLI: `dizayn = combo` tanlanmaguncha chizilmaydi
    // va majburiy ham emas.
    const combo = tanlov.dizayn === 'combo' && aiCfg.comboKeys;
    const guruhlar = Object.keys(aiCfg.keys).concat(combo ? Object.keys(aiCfg.comboKeys) : []);
    const kalitlar = (g) => aiCfg.keys[g] || (aiCfg.comboKeys && aiCfg.comboKeys[g]) || [];

    const savollar = guruhlar.map((guruh, i) => `
      <div class="ai-q">
        <span class="ai-q-num">${i + 1}</span>
        <span class="ai-q-label">${esc(AI_Q[guruh] || guruh)}</span>
      </div>
      <div class="ai-chips">
        ${kalitlar(guruh).map((k) => `
          <button class="ai-chip${tanlov[guruh] === k ? ' on' : ''}" data-action="pickAiChoice" data-arg="${esc(id)}|${esc(guruh)}|${esc(k)}">${esc(AI_O[k] || k)}</button>`).join('')}
      </div>`).join('');

    // Erkin matn (faqat combo). Belgilar ro'yxati bu yerda TAKRORLANMAYDI —
    // tekshiruv faqat serverda (`cleanComboText`); `maxlength` ham serverdan.
    const matnBlok = combo ? `
      <div class="ai-q" style="margin-top:12px">
        <span class="ai-q-num">✎</span>
        <span class="ai-q-label">Yana nima qo'shilsin? (ixtiyoriy)</span>
      </div>
      <input class="ai-text" type="text" data-input="setAiText" data-arg="${esc(id)}"
             value="${esc(aiText[id] || '')}" maxlength="${aiCfg.textMax}"
             placeholder="masalan: oltin tugma, qora yoqa" />` : '';

    const nechta = guruhlar.filter((g) => tanlov[g]).length;
    const tayyor = nechta === guruhlar.length;

    // ⚠️ Kirmagan foydalanuvchiga bo'lim BARIBIR ko'rsatiladi, faqat tugma
    // o'rniga "Kirish" turadi. Blokni butunlay yashirish oson yo'l edi, lekin
    // o'shanda funksiya kirmagan odam uchun MAVJUD EMASday ko'rinardi va u
    // nima uchun kirishi kerakligini bilmasdi.
    const cta = me
      ? `<button class="ai-cta" data-action="askAiImage" data-arg="${esc(id)}"${tayyor ? '' : ' disabled'}>${tayyor ? '✦ ' : ''}Rasmni chizish</button>`
      : `<button class="ai-cta" data-action="loginForAi">Kirish — rasm chizish uchun</button>`;

    return `${head}
      <div class="ai-card">
        <div class="ai-lead">
          <span class="ai-lead-icon">🧵</span>
          <span>Mahsulot suratidan chiziladi</span>
        </div>
        ${savollar}
        ${matnBlok}
        ${tayyor || !me ? '' : `<div class="ai-count">${esc(`${guruhlar.length} tadan ${nechta} tasi tanlandi`)}</div>`}
        ${me ? aiCreditLine() : ''}
        ${cta}
      </div>`;
  }

  // Holat 2 — yuklanmoqda. Kutish vaqti AYTILADI: rasm sekin chiziladi va
  // jim spinner yonida foydalanuvchi sayt qotib qolgan deb o'ylardi.
  if (st.state === 'loading') {
    return `${head}
      <div class="ai-wait">
        <div class="ai-wait-row"><span class="ai-spin"></span><span>Rasm chizilmoqda… (30 soniyagacha)</span></div>
        <div class="ai-bar"></div>
      </div>`;
  }

  // Holat 3 — surat yo'q. Bu XATO EMAS, shuning uchun qayta urinish tugmasi
  // ham YO'Q: qayta bosish natijani o'zgartirmasdi va kredit yeyilardi.
  if (st.state === 'nophoto') {
    return `${head}<div class="ai-msg ai-msg-plain">Bu mahsulotda surat yo'q, shuning uchun rasm chizib bo'lmaydi</div>`;
  }

  // Holat 4 — kredit tugadi. ⚠️ "Ertaga yangilanadi" DEYILMAYDI: kredit
  // qoldiq, u o'zi tiklanmaydi va bunday xabar jimgina yolg'on bo'lardi.
  if (st.state === 'nocredit') {
    return `${head}<div class="ai-msg ai-msg-warn">Kredit qoldig'i tugadi — yangi rasm chizib bo'lmaydi.</div>`;
  }

  if (st.state === 'badtext') {
    return `${head}
      <div class="ai-msg ai-msg-warn">
        Matnda ruxsat etilmagan belgi bor — faqat harf, raqam, vergul va chiziqcha
        <button class="ai-ghost" data-action="resetAiImage" data-arg="${esc(id)}">Boshqacha chizish</button>
      </div>`;
  }

  // Provayder band — bu NOSOZLIK EMAS: server allaqachon uch marta urinib
  // ko'rgan va kredit qaytarilgan. Shuning uchun qayta urinish MA'NOLI.
  if (st.state === 'busy') {
    return `${head}
      <div class="ai-msg ai-msg-warn">
        AI xizmati hozir band. Kreditingiz qaytarildi — bir necha daqiqadan keyin urinib ko'ring
        <button class="ai-ghost" data-action="askAiImage" data-arg="${esc(id)}">Qayta urinish</button>
      </div>`;
  }

  // Model rad etdi. ⚠️ Tugma "qayta urinish" EMAS: ayni javoblar ayni rad
  // javobini beradi. Yagona foydali harakat — javoblarni o'zgartirish.
  if (st.state === 'blocked') {
    return `${head}
      <div class="ai-msg ai-msg-warn">
        AI bu so'rov bo'yicha rasm chizishdan bosh tortdi. Kreditingiz qaytarildi — javoblarni o'zgartirib ko'ring
        <button class="ai-ghost" data-action="resetAiImage" data-arg="${esc(id)}">Boshqacha chizish</button>
      </div>`;
  }

  // Kirish talab qilindi (sessiya eskirgan). Alohida holat: umumiy xato
  // ko'rsatilsa xaridor qayta-qayta bosib, hech qachon kirmasdi.
  if (st.state === 'noauth') {
    return `${head}
      <div class="ai-msg ai-msg-warn">
        Sessiya tugagan — rasm chizish uchun qaytadan kiring
        <button class="ai-ghost" data-action="loginForAi">Kirish</button>
      </div>`;
  }

  // Texnik xato. ⚠️ Zaxira sifatida "namunaviy rasm" ATAYLAB ko'rsatilmaydi:
  // u AI ishlamayotganini yashirardi ("jimgina yolg'on yo'qlikdan yomonroq").
  if (st.state === 'error') {
    return `${head}
      <div class="ai-msg ai-msg-err">
        Hozir generatsiya qilib bo'lmadi, birozdan keyin urinib ko'ring
        <button class="ai-ghost" data-action="askAiImage" data-arg="${esc(id)}">Qayta urinish</button>
      </div>`;
  }

  // Natija. ⚠️ Yorliq rasm bilan BITTA blokda va uning ICHIDA turadi —
  // pastda alohida qatorda emas: skrinshot olinganda kadrdan chiqib ketmasin.
  return `${head}
    <figure class="ai-figure">
      <img src="${esc(st.url)}" alt="AI kiyim rasmi" loading="lazy" />
      <figcaption class="ai-note"><span>⚠️</span><span>AI tasavvuri — haqiqiy mahsulot emas</span></figcaption>
    </figure>
    <div class="ai-acts">
      ${aiOtherCutBtn(id)}
      <button class="ai-ghost" data-action="resetAiImage" data-arg="${esc(id)}">Boshqacha chizish</button>
      <button class="ai-ghost" data-action="shareAiImage" data-arg="${esc(st.url)}">Ulashish</button>
    </div>
    ${aiCreditLine()}`;
}

/* Detalni qayta chizish — foydalanuvchi boshqa ko'rinishga o'tib ketgan
   bo'lsa hech narsa qilmaydi (`loadReviews` dagi bilan bir xil naqsh). */
function repaintDetail(id) {
  if (isOpen() && drawerView === 'detail' && detailId === id) renderDrawer();
}

/* Chip bosilganda. Argument `id|guruh|kalit` — delegatsiya bitta `data-arg`
   beradi, shuning uchun `|` bilan kodlanadi (`qtyStep` dagi bilan ayni
   konvensiya).
   ⚠️ Bu yerda TEKSHIRUV yo'q: serverdan kelmagan kalit umuman chizilmaydi,
   server esa har so'rovda o'z oq ro'yxatidan mustaqil o'tkazadi. */
function pickAiChoice(arg) {
  const [id, guruh, kalit] = String(arg).split('|');
  if (!id || !guruh || !kalit) return;
  aiChoices[id] = Object.assign({}, aiChoices[id] || {}, { [guruh]: kalit });
  // ⚠️ Javob o'zgarsa variant NOLGA qaytadi. Aks holda xaridor "palto" dan
  // "ko'ylak" ga o'tganda darrov 3-fason so'ralgan bo'lardi — ya'ni u
  // so'ramagan variant uchun kredit ketardi va sababi ko'rinmasdi.
  delete aiVariant[id];
  repaintDetail(id);
}

/* Erkin matn. ⚠️ Bu yerda QAYTA CHIZISH YO'Q: `renderDrawer()` butun tanani
   qayta yozadi va har harfda kursor maydondan uchib ketardi (saytdagi boshqa
   matn maydonlari ham shu naqshda — `onReviewBody`, `onDisputeComment`). */
function setAiText(qiymat, id) {
  aiText[String(id)] = String(qiymat || '');
}

/* "Boshqacha chizish" — natijani tozalaydi va savollarga QAYTARADI.
   Javoblar SAQLANADI: xaridor odatda bittasini o'zgartirmoqchi bo'ladi. */
function resetAiImage(id) {
  delete aiImages[String(id)];
  // Variant ham nolga qaytadi — aks holda tekin bo'lishi kerak bo'lgan
  // qaytish jimgina pullik variantda qolib ketardi.
  delete aiVariant[String(id)];
  repaintDetail(String(id));
}

/* "Boshqa fason" — javoblar SAQLANADI, faqat variant raqami oshadi va darrov
   yangi so'rov ketadi. Savollarga QAYTARILMAYDI: xaridor javoblaridan
   mamnun, unga yoqmagani — chizilgan fason.
   ⚠️ Chegara SERVERDAN kelgan qiymat bilan tekshiriladi va bu YAGONA
   tekshiruv emas: server ham mustaqil o'tkazadi. Bu yerdagisi xatoni pul
   sarflanadigan yo'ldan OLDIN ushlaydi. */
function otherCutAiImage(id) {
  const key = String(id);
  const keyingi = (aiVariant[key] || 0) + 1;
  if (!aiCfg || !aiCfg.variantMax || keyingi > aiCfg.variantMax) return;
  aiVariant[key] = keyingi;
  askAiImage(key);
}

/* Kirish — AI blokidan. Kirgandan keyin AYNI mahsulot tafsilotiga qaytadi
   (`afterLoginView`), aks holda xaridor profilga tushib qolib, qaysi matoni
   ko'rayotganini qaytadan qidirardi. */
function loginForAi() {
  afterLoginView = 'detail';
  drawerView = 'login';
  loginState = 'idle';
  loginErr = '';
  renderDrawer();
}

/* Tugma bosilganda. Kimlik cookie sessiyasidan — brauzer hech qanday ID
   yubormaydi (CLAUDE.md: `tg_user_id` klientdan olinmaydi), server uni
   `requestUser()` bilan o'zi aniqlaydi. */
function askAiImage(id) {
  const key = String(id);
  aiImages[key] = { state: 'loading' };
  repaintDetail(key);

  fetch('/api/ai/image', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: key,
      // Matn va variant HAR DOIM yuboriladi — server `dizayn = combo`
      // bo'lmasa matnni, `variant = 0` bo'lsa variantni O'ZI tashlaydi.
      // Klientda ikkinchi tekshiruv yozilmadi: u serverdagi qoidaning
      // nusxasi bo'lardi.
      choices: Object.assign({}, aiChoices[key] || {}, {
        matn: aiText[key] || '',
        variant: aiVariant[key] || 0,
      }),
    }),
  })
    .then((r) => r.json().catch(() => null).then((j) => ({ r, j })))
    .then(({ r, j }) => {
      if (j && j.data && j.data.credits) aiCredits = j.data.credits;
      if (r.status === 401) {
        // Sessiya eskirgan yoki umuman kirilmagan.
        aiImages[key] = { state: 'noauth' };
      } else if (r.status === 429 && j && j.error === 'no_credit') {
        if (j.credits) aiCredits = Object.assign({}, aiCredits || {}, j.credits);
        aiImages[key] = { state: 'nocredit' };
      } else if (r.status === 400 && j && j.error === 'bad_choices') {
        aiImages[key] = { state: 'badtext' };
      } else if (j && j.error === 'ai_busy') {
        aiImages[key] = { state: 'busy' };
      } else if (r.status === 422 && j && j.error === 'ai_blocked') {
        aiImages[key] = { state: 'blocked' };
      } else if (r.status === 422 && j && j.error === 'no_source_photo') {
        aiImages[key] = { state: 'nophoto' };
      } else if (j && j.ok && j.data && j.data.image) {
        aiImages[key] = { state: 'done', url: j.data.image };
      } else {
        aiImages[key] = { state: 'error' };
      }
    })
    .catch(() => { aiImages[key] = { state: 'error' }; })
    .then(() => repaintDetail(key));
}

/* Ulashish — rasm Telegram'da yoki CDN'da yashaydi, ya'ni bu deyarli tekin
   kanal. Mini App'dagi `openTelegramLink` bu yerda yo'q: saytda oddiy
   `window.open` ishlaydi. */
function shareAiImage(url) {
  const s = String(url || '');
  const toliq = s.indexOf('http') === 0 ? s : location.origin + s;
  window.open(
    'https://t.me/share/url?url=' + encodeURIComponent(toliq) +
    '&text=' + encodeURIComponent('AI bilan chizilgan — lolamarket.uz'),
    '_blank'
  );
}

/* Kredit qoldig'ini so'raymiz — SO'RALMASDAN ko'rsatiladi, ya'ni xaridor
   chegarani u TUGAGANDA emas, pul sarflashdan OLDIN ko'radi.
   ⚠️ Xato bo'lsa JIM o'tadi va kredit qatori umuman chizilmaydi: bu yerda
   o'ylab topilgan raqam ko'rsatishdan ko'ra hech narsa ko'rsatmagan yaxshi. */
function loadAiCredits() {
  if (!me || !aiCfg || aiCredits) return;
  apiJson('/api/ai/my')
    .then((d) => {
      if (d && d.ok && d.data && d.data.credits) {
        aiCredits = d.data.credits;
        if (isOpen() && drawerView === 'detail') renderDrawer();
      }
    })
    .catch(() => { /* kredit qatori chizilmaydi — nuqson emas */ });
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

      ${m ? `<div class="pd-stock ${esc(stockView(m).key)}">${esc(stockView(m).txt)}</div>` : ''}

      <div class="pd-act" id="pd-act">
        ${soldOutIds.has(id)
          ? `<button class="pd-add is-out" type="button" disabled>${esc(STOCK_TXT.out)}</button>`
          : qty
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

      ${aiSection(id)}

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

/* ====================================================
   BAHS OCHISH (xaridor tomoni, 2026-08-12)

   Sayt kafolat va'da qilardi, lekin muammoni bildiradigan MEXANIZM yo'q edi —
   xaridor faqat Mini App orqali bahs ocha olardi. Endpoint ham faqat
   Telegram initData'ni qabul qilardi; u `requestUser()` bilan ikkala kanalga
   ochildi (`server/lib/auth.js`).

   Dalil rasmi shu yerda YIG'ILMAYDI: bahs ochilgach bot xaridordan rasm
   so'raydi va Telegram faqat `file_id` ni beradi — fayl bizning serverga
   tushmaydi. Sayt xaridorida Telegram hisobi bor (kirish o'sha orqali
   bo'lgan), ya'ni bot xabari unga yetib boradi.
   ==================================================== */

let disputeTarget = null;      // { orderId }
let disputeReason = 'damaged';
let disputeComment = '';
let disputeSending = false;

function openDispute(orderId) {
  const o = (myOrders || []).find((x) => x.id === orderId);
  if (!o) return;
  disputeTarget = { orderId };
  disputeReason = 'damaged';
  disputeComment = '';
  disputeSending = false;
  drawerView = 'dispute';
  renderDrawer();
}

function setDisputeReason(k) {
  if (DISPUTE_REASONS[k]) disputeReason = k;
  renderDrawer();
}

function onDisputeComment(v) { disputeComment = v; }

function disputeFormHtml() {
  const t = disputeTarget;
  if (!t) return '';
  return `
    <div class="rv">
      <div class="rv-target">Buyurtma ${esc(t.orderId)}</div>
      <div class="rv-sub">Muammoni tanlang. Yuborgach botda sizdan rasm so'raladi — dalil moderator qarorini tezlashtiradi.</div>

      <div class="dsp-reasons">
        ${Object.keys(DISPUTE_REASONS).map((k) => `
        <button class="dsp-reason ${k === disputeReason ? 'on' : ''}" data-action="setDisputeReason" data-arg="${esc(k)}">
          ${esc(DISPUTE_REASONS[k])}
        </button>`).join('')}
      </div>

      <textarea class="rv-text" rows="4" placeholder="Qisqacha tafsilot (ixtiyoriy)"
        data-input="onDisputeComment">${esc(disputeComment)}</textarea>

      <div class="rv-btns">
        <button class="auth-ghost" data-action="backToProfile">Bekor</button>
        <button class="pd-add" data-action="submitDispute" ${disputeSending ? 'disabled' : ''}>${disputeSending ? 'Yuborilmoqda…' : 'Murojaat yuborish'}</button>
      </div>
    </div>`;
}

function submitDispute() {
  if (!disputeTarget || disputeSending) return;
  disputeSending = true;
  renderDrawer();
  const t = disputeTarget;
  apiJson('/api/disputes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: t.orderId,
      reasonKey: disputeReason,
      comment: disputeComment.trim() || undefined,
    }),
  })
    .then((d) => {
      if (!d || d.ok !== true) throw new Error((d && d.error) || "Murojaat yuborilmadi");
      showToast("Murojaat qabul qilindi — botda rasm so'raladi");
      loadMyDisputes();
      backToProfile();
    })
    .catch((e) => {
      disputeSending = false;
      renderDrawer();
      showToast(e.message || 'Murojaat yuborilmadi');
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
    const clean = {};
    Object.keys(raw).forEach((id) => {
      const qty = parseInt(raw[id], 10);
      if (qty > 0) clean[id] = Math.min(qty, 999);
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

/* DIQQAT: bu yerda ilgari `filter((id) => productEl(id))` turardi — DOM'da
   yo'q mahsulot darhol tashlab yuborilardi. Endi katalogning bir qismi
   `/api/products` dan KEYINROQ keladi, ya'ni o'sha tekshiruv xaridorning
   haqiqiy tanlovini o'chirib yuborardi. Tozalash `settleCatalog()` ga
   ko'chirildi — u so'rov tugagandan keyin ishlaydi. */
function loadFavs() {
  try {
    const raw = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((id) => typeof id === 'string') : [];
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

/* ── To'lov sozlamalari ──
   Haqiqiy manba — SERVER (`/api/auth/web/me` javobi, `server/config.js`).
   Bu yerdagi qiymatlar javob kelmaguncha ishlatiladigan zaxira, ya'ni ular
   "taxmin", "haqiqat" emas. Sabab: `PREPAY_RATE` `.env` orqali o'zgarishi
   mumkin va o'zgargan kuni saytdagi qo'lda yozilgan raqam jimgina yolg'onga
   aylanardi — xaridor bir summani ko'rib, server boshqasini hisoblardi.

   ⚠️ Bularning hech biri hisob-kitob uchun ishonchli emas: buyurtma summasi
   HAR DOIM server tomonda qayta hisoblanadi (`routes/orders.js`). Bu faqat
   xaridorga NIMA KO'RSATILISHI. */
let DELIVERY_FEE_ESTIMATE = 25000;
let PREPAY_RATE = 0.5;

function prepayAmount(total) { return Math.round(total * PREPAY_RATE); }
function restAmount(total) { return total - prepayAmount(total); }

/* ── BTS olish nuqtalari ──
   Mini App'dagi `BTS_POINTS` bilan AYNAN bir xil ro'yxat
   (`telegram-app/app.js`). Vaqtinchalik: BTS integratsiyasi ulangach
   ikkalasi ham serverdan (`/api/bts-points`) o'qiydi.

   ⚠️ Ro'yxat ikki joyda turgani BILIB QILINGAN vaqtinchalik qaror, chunki
   uchinchi nusxa (server) hali yo'q. Nomlar o'zgarsa IKKALASI birga
   yangilansin — aks holda sayt va Mini App boshqa-boshqa nuqta nomini
   buyurtmaga yozib yuborardi. */
const BTS_REGIONS = [
  { key: 'tas', name: 'Toshkent' },
  { key: 'far', name: "Farg'ona" },
  { key: 'sam', name: 'Samarqand' },
  { key: 'bux', name: 'Buxoro' },
  { key: 'and', name: 'Andijon' },
];
const BTS_POINTS = [
  { id: 'bts-112', region: 'tas', name: "BTS №112 — Chilonzor",         addr: "Bunyodkor ko'ch. 45",        hours: '9:00–19:00' },
  { id: 'bts-097', region: 'tas', name: "BTS №097 — Yunusobod",         addr: "Amir Temur ko'ch. 12",       hours: '9:00–18:00' },
  { id: 'bts-054', region: 'tas', name: "BTS №054 — Sergeli",           addr: "Yangi Sergeli 8",            hours: '9:00–19:00' },
  { id: 'bts-021', region: 'tas', name: "BTS №021 — Mirzo Ulug'bek",    addr: "Mustaqillik ko'ch. 78",      hours: '9:00–18:00' },
  { id: 'bts-140', region: 'far', name: "BTS №140 — Farg'ona markaz",   addr: "Mustaqillik ko'ch. 24",      hours: '9:00–18:00' },
  { id: 'bts-146', region: 'far', name: "BTS №146 — Marg'ilon",         addr: "Toshkent ko'ch. 5",          hours: '9:00–18:00' },
  { id: 'bts-203', region: 'sam', name: "BTS №203 — Samarqand markaz",  addr: "Registon ko'ch. 3",          hours: '9:00–19:00' },
  { id: 'bts-311', region: 'bux', name: "BTS №311 — Buxoro markaz",     addr: "Bahouddin Naqshband 17",     hours: '9:00–18:00' },
  { id: 'bts-408', region: 'and', name: "BTS №408 — Andijon markaz",    addr: "Navoiy shoh ko'chasi 41",    hours: '9:00–18:00' },
];
function btsById(id) { return BTS_POINTS.find((p) => p.id === id) || null; }

/* Tanlangan nuqta saqlanadi — B2B xaridor deyarli doim bitta nuqtadan oladi.
   Kalit Mini App'dagi bilan AYNAN bir xil va bu ATAYLAB: sayt ham, Mini App
   ham `lolamarket.uz` domenida, ya'ni `localStorage` ular orasida umumiy.
   Mini App'da nuqta tanlagan xaridor saytda uni to'ldirilgan holda topadi. */
const BTS_KEY = 'lolamarket_bts_point';
let btsPoint = (() => {
  try { return localStorage.getItem(BTS_KEY) || null; } catch (e) { return null; }
})();

/* ⚠️ Bu yerda `renderDrawer()` CHAQIRILMAYDI. Checkout — to'ldirilayotgan
   forma: uni qaytadan chizish xaridor allaqachon yozgan ism, telefon va
   izohni O'CHIRIB yuboradi (2026-08-12 da sinovda aynan shunday bo'ldi —
   uch maydon ham bo'shab qoldi). Tanlov `<select>` da o'zi ko'rinib turadi,
   shuning uchun faqat yonidagi izoh qatori almashtiriladi. */
function setBtsPoint(id) {
  btsPoint = btsById(id) ? id : null;
  try { if (btsPoint) localStorage.setItem(BTS_KEY, btsPoint); } catch (e) { /* private mode */ }
  paintBtsInfo();
}

/* Xulosadagi raqamlarni JOYIDA yangilaydi — butun formani qayta chizmasdan.
   Sozlama serverdan kechroq kelsa (checkout allaqachon ochiq bo'lsa) shu
   chaqiriladi. Checkout ochiq bo'lmasa hech narsa qilmaydi. */
function paintCheckoutTotals() {
  const pct = document.getElementById('co-prepay-pct');
  if (!pct) return;
  const total = cartTotal();
  pct.textContent = Math.round(PREPAY_RATE * 100) + '%';
  document.getElementById('co-prepay-val').textContent = money(prepayAmount(total));
  document.getElementById('co-rest-val').textContent = money(restAmount(total));
  document.getElementById('co-delivery').textContent = money(DELIVERY_FEE_ESTIMATE);
}

function paintBtsInfo() {
  const sel = document.getElementById('co-bts');
  const old = sel?.parentElement?.querySelector('.co-bts-info, .co-hint');
  if (!old) return;
  const p = btsById(btsPoint);
  const box = document.createElement('div');
  if (p) {
    box.className = 'co-bts-info';
    box.textContent = `${p.addr} · Ish vaqti ${p.hours}`;
  } else {
    box.className = 'co-hint';
    box.textContent = 'BTS Pochta orqali yetkaziladi — sizga eng qulay nuqtani tanlang.';
  }
  old.replaceWith(box);
}

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
  // Zaxirasi tugagan mahsulot savatga TUSHMAYDI. Tugmani yashirish yagona
  // qorovul emas: server ham `stock >= qty` shartida atomik tekshiradi
  // (`routes/orders.js` → `decrementStock`). Bu yerdagi tekshiruv xaridor
  // butun checkout'ni to'ldirib bo'lib "tugagan" xatosini ko'rmasligi uchun.
  if (soldOutIds.has(id)) { showToast("Bu mato hozircha tugagan"); return; }
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

  // Zaxira tugagan — "Savatga" o'rniga o'chirilgan holat. Miqdor tanlagichi
  // ham chizilmaydi: savatda turgan mahsulot tugab qolsa "+" bosish
  // xaridorni serverdagi xatoga olib borardi.
  if (soldOutIds.has(id)) {
    box.innerHTML = `<button class="add-btn is-out" type="button" disabled>${esc(STOCK_TXT.out)}</button>`;
    return;
  }

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

  if (drawerView === 'dispute') {
    title.textContent = 'Muammo bo\'yicha murojaat';
    body.innerHTML = disputeFormHtml();
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

/* ⚠️ `p.img` ham `esc()` dan o'tadi (2026-08-12). Ilgari u xom qo'yilardi va
   xavfsiz edi — rasm manzili `index.html` da qo'lda yozilgan bo'lardi. Endi
   katalog BAZADAN keladi, ya'ni qiymat tashqi manba bo'lib qoldi. Qochirilmasa
   tirnoq atributdan chiqib ketadi: `src="x" onerror="..."` — sinovda aynan
   shunday bo'lgani ko'rildi. Bu oddiy atribut, shuning uchun `esc()` yetarli
   (CSS `url()` ichida bo'lganda `cssUrl()` kerak bo'lardi — CLAUDE.md). */
function lineHtml(id) {
  const p = product(id);
  if (!p) return '';
  const qty = cart[id];
  return `
    <div class="cart-line">
      <img class="cart-line-img" src="${esc(p.img)}" alt="" loading="lazy" />
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
      <img class="fav-line-img" src="${esc(p.img)}" alt="" loading="lazy" />
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
        <span>Yetkazish (taxminiy)</span><span id="co-delivery">${money(DELIVERY_FEE_ESTIMATE)}</span>
      </div>
      <div class="co-sum-row" style="font-weight:700;color:var(--text-strong)">
        <span>Jami</span><span>${money(cartTotal())}</span>
      </div>

      <!-- Oldindan to'lov — Mini App bilan bir xil bo'linish (2026-08-12).
           Ilgari saytda faqat "Jami" turardi va xaridor butun summani hozir
           to'laydi deb o'ylardi; Mini App esa AYNI buyurtma uchun 50% ni
           ko'rsatardi. Ikki kanal bir narsaga ikki xil narx aytmasin. -->
      <div class="co-sum-row co-prepay" style="margin-top:9px;padding-top:9px;border-top:1px solid var(--border-hair)">
        <span>Hozir to'lanadi <b class="co-prepay-tag" id="co-prepay-pct">${esc(String(Math.round(PREPAY_RATE * 100)))}%</b></span>
        <span class="co-prepay-val" id="co-prepay-val">${money(prepayAmount(cartTotal()))}</span>
      </div>
      <div class="co-sum-row" style="color:var(--text-muted);font-size:13px">
        <span>Mato tayyor bo'lgach</span><span id="co-rest-val">${money(restAmount(cartTotal()))}</span>
      </div>
    </div>
    <div style="font-size:11px;color:var(--text-subtle);line-height:1.4;margin-top:-4px">Yetkazish BTS nuqtasida to'g'ridan-to'g'ri to'lanadi, yuqoridagi jamiga kirmaydi.</div>

    ${me ? '' : `
      <div class="co-login">
        <div class="co-login-txt">
          <b>Telegram orqali kiring</b> — ism va telefon o'zi to'ladi, buyurtma
          holati esa botga xabar bo'lib keladi.
        </div>
        <button type="button" class="co-login-btn" data-action="loginFromCheckout">Kirish</button>
      </div>`}

    <form id="co-form" data-submit="submitOrder" style="margin-top:16px" novalidate>
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
      <!-- Manzil ERKIN MATN emas, ro'yxatdan tanlanadi (2026-08-12).
           Ilgari bu oddiy matn maydoni edi va xaridor "Chilonzor" yoki
           "BTS 112" kabi har xil yozardi — logistika esa aynan qaysi nuqta
           ekanini topa olmasdi. Mini App boshidan ro'yxatdan tanlatadi,
           sayt esa ortda qolgandi. -->
      <div class="co-field">
        <label class="co-label" for="co-bts">BTS olish nuqtasi *</label>
        <select class="co-input co-select" id="co-bts" data-change="setBtsPoint" required>
          <option value=""${btsPoint ? '' : ' selected'}>— Nuqtani tanlang —</option>
          ${BTS_REGIONS.map((r) => {
            const inRegion = BTS_POINTS.filter((p) => p.region === r.key);
            if (!inRegion.length) return '';
            return `<optgroup label="${esc(r.name)}">${inRegion.map((p) => `
              <option value="${esc(p.id)}"${btsPoint === p.id ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}</optgroup>`;
          }).join('')}
        </select>
        ${(() => {
          const p = btsById(btsPoint);
          return p
            ? `<div class="co-bts-info">${esc(p.addr)} · Ish vaqti ${esc(p.hours)}</div>`
            : `<div class="co-hint">BTS Pochta orqali yetkaziladi — sizga eng qulay nuqtani tanlang.</div>`;
        })()}
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
  const comment = val('co-comment');
  const err = document.getElementById('co-err');
  const btn = document.getElementById('co-submit');

  // Manzil endi ro'yxatdan keladi. Tanlangan nuqta `<select>` ning O'ZIDAN
  // o'qiladi, `btsPoint` o'zgaruvchisidan emas: `change` hodisasi otilmay
  // qolgan (yoki brauzer avtomatik to'ldirgan) holatda ikkalasi ajralib
  // ketishi mumkin, forma esa ekranda ko'rinib turgan qiymatni yuborishi
  // shart — xaridor nimani ko'rgan bo'lsa, o'sha ketsin.
  const point = btsById(document.getElementById('co-bts')?.value || btsPoint);
  const address = point ? `${point.name}, ${point.addr}` : '';

  const digits = phone.replace(/\D/g, '');
  if (!name) return showErr(err, 'Ismingizni kiriting.');
  if (digits.length < 9) return showErr(err, "Telefon raqamini to'liq kiriting.");
  if (!point) return showErr(err, 'BTS olish nuqtasini tanlang.');
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
    // `pickupPointId` — Mini App yuboradigan AYNI maydon (`telegram-app/app.js`).
    // Server uni hozircha o'qimaydi (`address` matnidan foydalanadi), lekin
    // ikki kanal bir xil shaklda yuborsa BTS integratsiyasi ulanganda faqat
    // server tomoni o'zgaradi.
    body: JSON.stringify({ items, buyerName: name, phone, company, address, comment, pickupPointId: point.id }),
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

/* ── Katalogni bazadan yuklash ──
   Ilgari bu so'rov faqat mahsulot detali ochilganda ketardi (u paytda undan
   olinadigan narsa tafsilotlar edi). Endi katalogning O'ZI shunga bog'liq:
   sotuvchi e'lonlari, narxlar va zaxira shu javobdan keladi, shuning uchun
   so'rov sahifa ochilishi bilan boshlanadi. */
loadCatalogMeta();

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
