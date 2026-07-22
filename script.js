/* ── Page loader ── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('page-loader');
    if (!loader) return;
    loader.classList.add('hide');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  }, 120);
});

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
   QIDIRUV VA FILTRLASH
   Kategoriya va qidiruv birgalikda qo'llanadi.
   ==================================================== */

const chipsWrap = document.getElementById('chips');
const grid = document.getElementById('product-grid');

let activeCat = 'all';
let searchQ = '';

function applyFilter() {
  if (!grid) return;
  const q = searchQ.trim().toLowerCase();
  let shown = 0;

  grid.querySelectorAll('.product-card').forEach((card) => {
    const okCat = activeCat === 'all' || card.dataset.cat === activeCat;
    const okQ = !q
      || (card.dataset.name || '').toLowerCase().indexOf(q) !== -1
      || (card.dataset.supplier || '').toLowerCase().indexOf(q) !== -1;
    const ok = okCat && okQ;
    card.classList.toggle('is-hidden', !ok);
    if (ok) shown++;
  });

  const empty = document.getElementById('no-result');
  if (empty) empty.hidden = shown > 0;
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

/** Filtr tugmasi — kategoriya chiplarini yig'adi/ochadi */
/* ── Kirish — hozircha faqat dizayn ── */
function onLogin() {
  showToast('Telegram orqali kirish tez orada qo\'shiladi');
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
const SEQ_KEY = 'lolamarket_web_order_seq';

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
    img: el.querySelector('img')?.getAttribute('src') || '',
  };
}

function money(n) {
  return n.toLocaleString('ru-RU').replace(/ /g, ' ') + " so'm";
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
      <button class="add-btn" onclick="addToCart('${id}')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Savatga
      </button>`;
    return;
  }

  box.innerHTML = `
    <div class="qty-row">
      <button class="qty-circle qty-minus" onclick="setQty('${id}',-1)" aria-label="Kamaytirish">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>
      </button>
      <span class="qty-num">${qty} dona</span>
      <button class="qty-circle qty-plus" onclick="setQty('${id}',1)" aria-label="Ko'paytirish">
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
  const el = document.getElementById('cart-count');
  if (!el) return;
  const n = cartCount();
  el.textContent = n;
  el.hidden = n === 0;
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
          <button class="line-x" onclick="removeLine('${id}')" aria-label="O'chirish">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div class="cart-line-sup">${esc(p.supplier)}</div>
        <div class="cart-line-bot">
          <div class="qty">
            <button class="qty-btn" onclick="setQty('${id}',-1)" aria-label="Kamaytirish">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>
            </button>
            <span class="qty-val">${qty} dona</span>
            <button class="qty-btn" onclick="setQty('${id}',1)" aria-label="Ko'paytirish">
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
          <button class="line-x" onclick="toggleFav('${id}')" aria-label="Saralanganlardan olib tashlash">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div class="cart-line-sup">${esc(p.supplier)}</div>
        <div class="fav-line-price">${money(p.price)}</div>
        <div class="fav-line-act">
          ${inCart
            ? `<button class="fav-add in-cart" onclick="openCart()">Savatda — ${inCart} dona</button>`
            : `<button class="fav-add" onclick="favToCart('${id}')">
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
    <button class="co-back" onclick="backToCart()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6l-6 6 6 6"/></svg>
      Savatga qaytish
    </button>

    <div class="co-sum" style="margin-top:12px">
      ${lines}
      <div class="co-sum-row" style="margin-top:9px;padding-top:9px;border-top:1px solid var(--border-hair);font-weight:700;color:var(--text-strong)">
        <span>Jami</span><span>${money(cartTotal())}</span>
      </div>
    </div>

    <form id="co-form" onsubmit="submitOrder(event)" style="margin-top:16px" novalidate>
      <div class="co-field">
        <label class="co-label" for="co-name">Ismingiz *</label>
        <input class="co-input" id="co-name" type="text" autocomplete="name" placeholder="Ism familiya" required />
      </div>
      <div class="co-field">
        <label class="co-label" for="co-phone">Telefon *</label>
        <input class="co-input" id="co-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+998 90 123 45 67" required />
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
        Buyurtma Telegram orqali bizga yetib boradi — to'lov hozir olinmaydi.
      </div>
    </form>`;
}

function nextOrderId() {
  let n = parseInt(localStorage.getItem(SEQ_KEY) || '0', 10);
  if (!Number.isFinite(n) || n < 0) n = 0;
  n += 1;
  try { localStorage.setItem(SEQ_KEY, String(n)); } catch (e) {}
  // veb buyurtmalari W bilan — Mini App'nikidan (LM-) ajratish uchun
  return 'LM-W' + String(1000 + n).slice(-4);
}

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

  const items = Object.keys(cart).map((id) => {
    const p = product(id);
    return { name: p.name, qty: cart[id] + ' dona', sum: money(p.price * cart[id]) };
  });

  const orderId = nextOrderId();
  const total = money(cartTotal());

  btn.disabled = true;
  btn.textContent = 'Yuborilmoqda…';

  fetch('/api/telegram-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      buyerName: company ? `${name} (${company})` : name,
      address: address,
      payment: 'Kelishilgan holda',
      comment: [comment, 'Telefon: ' + phone].filter(Boolean).join(' · '),
      items,
      total,
    }),
  })
    .then((r) => {
      if (!r.ok) throw new Error('server ' + r.status);
      return r.json().catch(() => ({}));
    })
    .then(() => {
      lastOrderId = orderId;
      cart = {};
      saveCart();
      updateBadge();
      renderAllCardActions();
      drawerView = 'done';
      renderDrawer();
    })
    .catch(() => {
      btn.disabled = false;
      btn.textContent = 'Buyurtmani yuborish';
      showErr(err, "Yuborib bo'lmadi. Internetni tekshiring yoki Telegram bot orqali buyurtma bering.");
    });
}

function doneHtml() {
  return `
    <div class="drawer-done">
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16 10"/></svg>
      <div class="drawer-done-title">Buyurtmangiz qabul qilindi</div>
      <div class="order-id">${lastOrderId}</div>
      <div class="drawer-done-sub" style="margin-top:6px">
        Tez orada ko'rsatilgan telefon raqamingizga bog'lanamiz.
        Buyurtma holatini Telegram bot orqali ham kuzatishingiz mumkin.
      </div>
      <a class="cta-bot-btn" style="margin-top:16px;height:44px;font-size:14px;background:var(--grad-pom);color:var(--pom-100)" href="https://t.me/lolamarketbot" target="_blank" rel="noopener">
        Botni ochish
      </a>
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
