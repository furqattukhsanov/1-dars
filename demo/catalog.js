/* Telegram Mini App */
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
}

/* Filter */
document.querySelectorAll('.cat-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.cat-card').forEach(card => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.type !== filter);
    });
  });
});

/* ── Cart ── */
let cart = JSON.parse(localStorage.getItem('lolaCart') || '[]');

function parsePrice(str) {
  return parseInt(str.replace(/\D/g, ''), 10) || 0;
}

function saveCart() {
  localStorage.setItem('lolaCart', JSON.stringify(cart));
}

function updateBadge() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cartBadge');
  badge.textContent = total;
  badge.classList.toggle('hidden', total === 0);
}

function addToCart(name, price, sub, img) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, sub, img, qty: 1 });
  }
  saveCart();
  updateBadge();
  const btn = document.getElementById('detailAdd');
  const orig = btn.textContent;
  btn.textContent = "Qo'shildi ✓";
  setTimeout(() => { btn.textContent = orig; }, 1200);
}

function renderCart() {
  const body    = document.getElementById('cartBody');
  const totalEl = document.getElementById('cartTotal');
  if (cart.length === 0) {
    body.innerHTML = '<p class="cart-empty">Savat bo\'sh</p>';
    totalEl.textContent = '';
    return;
  }
  let total = 0;
  body.innerHTML = cart.map((item, i) => {
    const unit = parsePrice(item.price);
    total += unit * item.qty;
    return `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.img}" alt="${item.name}" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-sub">${item.sub}</div>
          <div class="cart-item-price">${item.price}</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
          <button class="cart-remove" onclick="removeItem(${i})">&#215;</button>
        </div>
      </div>`;
  }).join('');
  totalEl.textContent = 'Jami: ' + total.toLocaleString('ru-RU') + " so'm";
}

function changeQty(i, delta) {
  cart[i].qty += delta;
  if (cart[i].qty <= 0) cart.splice(i, 1);
  saveCart();
  updateBadge();
  renderCart();
}

function removeItem(i) {
  cart.splice(i, 1);
  saveCart();
  updateBadge();
  renderCart();
}

/* Cart modal */
const cartModal = document.getElementById('cartModal');

document.getElementById('cartBtn').addEventListener('click', () => {
  renderCart();
  cartModal.classList.add('open');
  document.body.style.overflow = 'hidden';
});

document.getElementById('cartClose').addEventListener('click', closeCart);
document.getElementById('cartBackdrop').addEventListener('click', closeCart);

function closeCart() {
  cartModal.classList.remove('open');
  document.body.style.overflow = '';
}

/* Checkout modal */
const checkoutModal = document.getElementById('checkoutModal');

document.getElementById('cartCheckoutBtn').addEventListener('click', () => {
  if (cart.length === 0) return;
  closeCart();
  checkoutModal.classList.add('open');
  document.body.style.overflow = 'hidden';
});

document.getElementById('checkoutClose').addEventListener('click', closeCheckout);
document.getElementById('checkoutBackdrop').addEventListener('click', closeCheckout);

function closeCheckout() {
  checkoutModal.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name  = document.getElementById('checkoutName').value.trim();
  const phone = document.getElementById('checkoutPhone').value.trim();

  const lines = cart.map(item => {
    const unit = parsePrice(item.price);
    return `📦 ${item.name} — ${item.qty} dona — ${(unit * item.qty).toLocaleString('ru-RU')} so'm`;
  }).join('\n');

  const total = cart.reduce((sum, item) => sum + parsePrice(item.price) * item.qty, 0);

  const text = `🛒 Yangi buyurtma!\n\n👤 Ism: ${name}\n📞 Tel: ${phone}\n\n${lines}\n\n💰 Jami: ${total.toLocaleString('ru-RU')} so'm`;

  try {
    await fetch('https://api.telegram.org/bot8639028527:AAEBNkfWjYto5PRuHAhNDZHdb29e4dPtaHs/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: 1378240226, text })
    });
  } catch (_) {}

  cart = [];
  saveCart();
  updateBadge();
  closeCheckout();
  document.getElementById('checkoutForm').reset();

  const successModal = document.getElementById('successModal');
  successModal.classList.add('open');
  setTimeout(() => successModal.classList.remove('open'), 3000);
});

/* Detail modal */
const detailModal    = document.getElementById('detailModal');
const detailClose    = document.getElementById('detailClose');
const detailBackdrop = document.getElementById('detailBackdrop');

function openDetail(card) {
  document.getElementById('detailImg').src           = card.dataset.img;
  document.getElementById('detailImg').alt           = card.dataset.name;
  document.getElementById('detailName').textContent  = card.dataset.name;
  document.getElementById('detailSub').textContent   = card.dataset.sub;
  document.getElementById('detailPrice').textContent = card.dataset.price;
  detailModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  detailModal.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.cat-card').forEach(card => {
  card.addEventListener('click', () => openDetail(card));
});
detailClose.addEventListener('click', closeDetail);
detailBackdrop.addEventListener('click', closeDetail);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });

document.getElementById('detailAdd').addEventListener('click', () => {
  const name  = document.getElementById('detailName').textContent;
  const price = document.getElementById('detailPrice').textContent;
  const sub   = document.getElementById('detailSub').textContent;
  const img   = document.getElementById('detailImg').src;
  addToCart(name, price, sub, img);
});

/* Init */
updateBadge();
