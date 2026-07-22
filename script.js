/* ── Page loader ── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('page-loader');
    if (!loader) return;
    loader.classList.add('hide');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  }, 600);
});

/* ── Telegram Mini App init ── */
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
}

/* ── Nav scroll ── */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
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

/* ── Kategoriya chiplari — filtrlash ── */
const chipsWrap = document.getElementById('chips');
const grid = document.getElementById('product-grid');

if (chipsWrap && grid) {
  const chips = chipsWrap.querySelectorAll('.chip');
  const cards = grid.querySelectorAll('.product-card');

  chipsWrap.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    chips.forEach(c => c.classList.toggle('active', c === chip));

    const cat = chip.dataset.cat;
    cards.forEach(card => {
      card.classList.toggle('is-hidden', cat !== 'all' && card.dataset.cat !== cat);
    });
  });
}

/* ====================================================
   SAVAT
   Mahsulot ma'lumoti DOM'dagi data-* atributlaridan
   o'qiladi — yagona manba, JS'da takrorlanmaydi.
   ==================================================== */

const CART_KEY = 'lolamarket_web_cart';
const SEQ_KEY = 'lolamarket_web_order_seq';

/** cart: { [id]: qty } */
let cart = loadCart();
/** drawer holati: 'cart' | 'checkout' | 'done' */
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
  if (drawerView === 'cart' && isOpen()) renderDrawer();
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
  drawerView = cartCount() ? 'cart' : 'cart';
  renderDrawer();
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
        <label class="co-label" for="co-comment">Izoh</label>
        <textarea class="co-area" id="co-comment" placeholder="Yetkazish manzili, muddat yoki boshqa talablar (ixtiyoriy)"></textarea>
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
  const comment = val('co-comment');
  const err = document.getElementById('co-err');
  const btn = document.getElementById('co-submit');

  const digits = phone.replace(/\D/g, '');
  if (!name) return showErr(err, 'Ismingizni kiriting.');
  if (digits.length < 9) return showErr(err, "Telefon raqamini to'liq kiriting.");
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
      address: 'Veb-sayt orqali — manzil aniqlanmagan',
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
   Saqlangan savat bilan qaytgan mehmon kartalarda darhol tanlagichni ko'radi */
updateBadge();
renderAllCardActions();
