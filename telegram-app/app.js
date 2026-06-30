/* ============================================================
   LolaMarket Telegram Mini App — SPA
   ============================================================ */

// ============ DATA ============

const PRODUCTS = [
  {
    id: 1, name: 'Paxta atlasi', city: 'Toshkent',
    price: 45000, unit: '/m',
    supplier: 'UzTex', verified: true,
    badge: 'Top seller', badgeBg: 'rgba(81,1,0,.82)', badgeFg: '#ffe5d2',
    bg: 'linear-gradient(135deg,#f9b8ae 0%,#ee6e63 100%)',
    width: '140 sm', weight: '210 g/m²', comp: '100% paxta',
    lead: '3–5 kun', moq: '50 m', rating: '4.8', reviews: 124,
    stock: 'Mavjud', stockOk: true,
  },
  {
    id: 2, name: 'Ipak chiffon', city: "Marg'ilon",
    price: 120000, unit: '/m',
    supplier: 'Margilan Silk', verified: true,
    badge: 'Yangi', badgeBg: '#119DAB', badgeFg: '#fff',
    bg: 'linear-gradient(135deg,#8FE9EF 0%,#25BECB 100%)',
    width: '110 sm', weight: '65 g/m²', comp: '100% ipak',
    lead: '7–10 kun', moq: '20 m', rating: '4.9', reviews: 87,
    stock: 'Mavjud', stockOk: true,
  },
  {
    id: 3, name: 'Kanop linen', city: "Farg'ona",
    price: 32000, unit: '/m',
    supplier: 'FarTex', verified: false,
    bg: 'linear-gradient(135deg,#FBD888 0%,#EFA91F 100%)',
    width: '150 sm', weight: '180 g/m²', comp: '55% kanop, 45% paxta',
    lead: '5–7 kun', moq: '100 m', rating: '4.5', reviews: 43,
    stock: 'Mavjud', stockOk: true,
  },
  {
    id: 4, name: 'Jun trikotaj', city: 'Namangan',
    price: 78000, unit: '/m',
    supplier: 'NamKnit', verified: true,
    badge: '-15%', badgeBg: '#D98E0C', badgeFg: '#fff',
    bg: 'linear-gradient(135deg,#CDD2E3 0%,#7E88A8 100%)',
    width: '160 sm', weight: '320 g/m²', comp: '80% jun, 20% nylon',
    lead: '2–3 kun', moq: '30 m', rating: '4.7', reviews: 56,
    stock: 'Cheklangan', stockOk: false,
  },
  {
    id: 5, name: 'Samarqand shoyi', city: 'Samarqand',
    price: 95000, unit: '/m',
    supplier: 'SamSilk', verified: true,
    badge: 'Premium', badgeBg: '#333A57', badgeFg: '#e8eaf6',
    bg: 'linear-gradient(135deg,#d4b8f0 0%,#7c5cdc 100%)',
    width: '120 sm', weight: '90 g/m²', comp: '100% ipak',
    lead: '10–14 kun', moq: '10 m', rating: '5.0', reviews: 32,
    stock: 'Mavjud', stockOk: true,
  },
  {
    id: 6, name: 'Sintetik fleece', city: 'Toshkent',
    price: 28000, unit: '/m',
    supplier: 'PolyTex', verified: false,
    bg: 'linear-gradient(135deg,#B8F0E8 0%,#119DAB 100%)',
    width: '200 sm', weight: '260 g/m²', comp: '100% polyester',
    lead: '1–2 kun', moq: '200 m', rating: '4.3', reviews: 98,
    stock: 'Mavjud', stockOk: true,
  },
];

const CATEGORIES = ['Barchasi', 'Paxta', 'Ipak', 'Zigir', 'Jun', 'Sintetik'];

const RECENT = ['Ipak', 'Paxta gazlama', 'Trikotaj', 'Chiffon', 'Jun'];

const MOCK_ORDERS = [
  {
    id: '#LM-2041', status: 'Yetkazilmoqda', statusBg: '#D5F2E4', statusFg: '#0F7A50',
    firstName: 'Ipak chiffon', items: 2, total: 360000,
    date: '25-iyun', firstBg: 'linear-gradient(135deg,#8FE9EF,#25BECB)', more: '+1', past: false,
  },
  {
    id: '#LM-2039', status: 'Tasdiqlandi', statusBg: '#D7E5FD', statusFg: '#1A5CB8',
    firstName: 'Paxta atlasi', items: 1, total: 225000,
    date: '22-iyun', firstBg: 'linear-gradient(135deg,#f9b8ae,#ee6e63)', more: null, past: false,
  },
  {
    id: '#LM-2031', status: 'Yetkazildi', statusBg: '#E4E7F1', statusFg: '#444C6E',
    firstName: 'Jun trikotaj', items: 3, total: 780000,
    date: '10-iyun', firstBg: 'linear-gradient(135deg,#CDD2E3,#7E88A8)', more: '+2', past: true,
  },
];

const COMPANY = { name: 'Alfa-Tekstil MChJ', addr: 'Toshkent sh., Yunusobod t., Amir Temur ko\'chasi 108' };

// ============ STATE ============

const state = {
  screen: 'home',
  history: [],
  product: null,    // selected product for detail
  cart: [],         // [{ product, qty }]
  likes: new Set(),
  category: 'Barchasi',
  search: '',
  detailQty: 1,
  ordersTab: 'active',
  payMethod: 'escrow',
};

// ============ HELPERS ============

function fmt(price) {
  return price.toLocaleString('uz-UZ') + " so'm";
}

function cartCount() {
  return state.cart.reduce((s, l) => s + l.qty, 0);
}

function cartTotal() {
  return state.cart.reduce((s, l) => s + l.product.price * l.qty, 0);
}

function inCart(product) {
  return state.cart.some(l => l.product.id === product.id);
}

function filteredProducts() {
  if (state.category === 'Barchasi') return PRODUCTS;
  const map = { 'Paxta': 'paxta', 'Ipak': 'ipak', 'Zigir': 'zigir', 'Jun': 'jun', 'Sintetik': 'polyester' };
  const kw = (map[state.category] || '').toLowerCase();
  return PRODUCTS.filter(p => p.comp.toLowerCase().includes(kw));
}

function searchResults() {
  if (!state.search.trim()) return [];
  const q = state.search.toLowerCase();
  return PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.supplier.toLowerCase().includes(q) ||
    p.city.toLowerCase().includes(q)
  );
}

// ============ NAVIGATION ============

function navigate(screen, product) {
  if (screen === 'detail' && product) {
    state.product = product;
    state.detailQty = 1;
  }
  if (state.screen !== screen) {
    state.history.push(state.screen);
  }
  state.screen = screen;
  render();
  document.getElementById('screen-wrap').scrollTop = 0;
}

function goBack() {
  if (state.history.length) {
    state.screen = state.history.pop();
    render();
    document.getElementById('screen-wrap').scrollTop = 0;
  }
}

// ============ CART ============

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const line = state.cart.find(l => l.product.id === productId);
  if (line) {
    line.qty += 1;
  } else {
    state.cart.push({ product, qty: 1 });
  }
  updateCartBadge();
  showToast('Savatga qo\'shildi 🌷');
  // refresh product list buttons without full re-render
  const btn = document.getElementById('add-' + productId);
  if (btn) btn.classList.add('added');
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(l => l.product.id !== productId);
  updateCartBadge();
  renderCartContent();
}

function changeCartQty(productId, delta) {
  const line = state.cart.find(l => l.product.id === productId);
  if (!line) return;
  line.qty = Math.max(1, line.qty + delta);
  updateCartBadge();
  renderCartContent();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  const count = cartCount();
  if (count > 0) {
    badge.classList.remove('hidden');
    badge.textContent = count;
  } else {
    badge.classList.add('hidden');
  }
}

// ============ TOAST ============

let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2200);
}

// ============ HEADER ============

const SCREEN_META = {
  home:     { title: 'LolaMarket', sub: 'Telegram Mini App', brand: true, back: false, search: true },
  catalog:  { title: 'Katalog',    sub: null,                brand: false, back: false, search: true },
  detail:   { title: '',           sub: null,                brand: false, back: true,  search: false },
  search:   { title: 'Qidiruv',    sub: null,                brand: false, back: false, search: false },
  cart:     { title: 'Savat',      sub: null,                brand: false, back: false, search: false },
  checkout: { title: 'Buyurtma',   sub: null,                brand: false, back: true,  search: false },
  success:  { title: '',           sub: null,                brand: false, back: false, search: false },
  orders:   { title: 'Buyurtmalarim', sub: null,             brand: false, back: false, search: false },
  profile:  { title: 'Profil',     sub: null,                brand: false, back: false, search: false },
};

function updateHeader() {
  const meta = SCREEN_META[state.screen] || SCREEN_META.home;

  document.getElementById('btn-back').classList.toggle('hidden', !meta.back);
  document.getElementById('header-brand').style.display = meta.brand ? 'flex' : 'none';
  document.getElementById('btn-header-search').classList.toggle('hidden', !meta.search);

  const titleEl = document.getElementById('header-title');
  const subEl   = document.getElementById('header-sub');

  if (state.screen === 'detail' && state.product) {
    titleEl.textContent = state.product.name;
    subEl.textContent   = state.product.city;
    subEl.style.display = 'block';
  } else {
    titleEl.textContent = meta.title;
    if (meta.sub) {
      subEl.textContent   = meta.sub;
      subEl.style.display = meta.brand ? 'block' : 'none';
    } else {
      subEl.style.display = 'none';
    }
  }
}

function updateNav() {
  const TAB_SCREENS = { home: 'home', catalog: 'catalog', search: 'search', cart: 'cart', orders: 'orders' };
  const activeTab = TAB_SCREENS[state.screen] || null;
  document.querySelectorAll('.nav-item').forEach(btn => {
    const tab = btn.dataset.tab;
    btn.classList.toggle('active', tab === activeTab);
  });
}

// ============ SCREENS ============

function renderHome() {
  const featured = PRODUCTS.slice(0, 4);
  return `
  <div class="screen anim-rise">
    <div>
      <div style="font-family:var(--font-display);font-size:19px;font-weight:800;color:var(--text-strong);letter-spacing:-.02em;line-height:1.15">Xush kelibsiz 🌷</div>
      <div style="font-size:12.5px;color:var(--text-muted);margin-top:2px">O'zbekistonning eng yaxshi to'qima materiallari</div>
    </div>

    <div style="display:flex;align-items:center;gap:9px">
      <button class="search-bar" style="flex:1" onclick="navigate('search')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <span>Material qidiring...</span>
      </button>
      <button onclick="navigate('catalog')" style="flex:none;width:48px;height:48px;border-radius:var(--radius-md);border:1px solid rgba(255,229,210,.25);background:var(--gradient-brand);box-shadow:var(--glow-brand);display:flex;align-items:center;justify-content:center;color:#ffe5d2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
      </button>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between">
      <span style="font-family:var(--font-display);font-size:17px;font-weight:700;color:var(--text-strong)">Tavsiya etilganlar</span>
      <button onclick="navigate('catalog')" style="font-size:13px;font-weight:600;color:var(--text-link)">Barchasi ›</button>
    </div>

    <div class="product-grid">
      ${featured.map(p => productCard(p, true)).join('')}
    </div>
  </div>`;
}

function renderCatalog() {
  const prods = filteredProducts();
  return `
  <div class="screen anim-rise">
    <div style="display:flex;gap:9px">
      <button class="glass-panel" style="flex:1;display:flex;align-items:center;justify-content:center;gap:7px;height:40px;font-size:13.5px;font-weight:600;color:var(--text-body)">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Filtr
      </button>
      <button class="glass-panel" style="flex:1;display:flex;align-items:center;justify-content:center;gap:7px;height:40px;font-size:13.5px;font-weight:600;color:var(--text-body)">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M8 4v16m0 0l-3-3m3 3l3-3M16 20V4m0 0l-3 3m3-3l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Saralash
      </button>
    </div>

    <div class="scroll-x">
      ${CATEGORIES.map(c => `
        <button class="chip ${c === state.category ? 'active' : 'inactive'}"
          onclick="selectCategory('${c}')">${c}</button>
      `).join('')}
    </div>

    ${prods.length === 0
      ? `<div class="empty-state"><div class="empty-title">Mahsulot topilmadi</div><div class="empty-sub">Boshqa kategoriya tanlang</div></div>`
      : `<div class="product-grid">${prods.map(p => productCard(p, false)).join('')}</div>`
    }
  </div>`;
}

function renderDetail() {
  const p = state.product;
  if (!p) return '';
  const total = fmt(p.price * state.detailQty);
  const inC = inCart(p);
  return `
  <div class="screen-flush anim-rise">
    <div style="position:relative;height:248px;background:${p.bg};background-size:cover">
      ${p.badge ? `<span class="product-badge" style="top:14px;left:16px;height:26px;padding:0 12px;font-size:12px;background:${p.badgeBg};color:${p.badgeFg}">${p.badge}</span>` : ''}
      <button
        onclick="toggleLike(${p.id})"
        style="position:absolute;top:12px;right:14px;width:38px;height:38px;border-radius:50%;border:1px solid var(--glass-border);background:var(--glass-fill-strong);backdrop-filter:var(--blur-md);-webkit-backdrop-filter:var(--blur-md);display:flex;align-items:center;justify-content:center;color:${state.likes.has(p.id) ? '#E84B40' : 'var(--text-body)'};box-shadow:var(--glass-highlight)">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="${state.likes.has(p.id) ? 'currentColor' : 'none'}"><path d="M12 21s-7-4.5-9.2-8.4C1.2 9.6 2.6 6 6 6c2 0 3.2 1.2 4 2.3C10.8 7.2 12 6 14 6c3.4 0 4.8 3.6 3.2 6.6C19 16.5 12 21 12 21z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
      </button>
    </div>

    <div style="margin-top:-22px;border-radius:var(--radius-xl) var(--radius-xl) 0 0;background:var(--glass-fill-strong);backdrop-filter:var(--blur-lg);-webkit-backdrop-filter:var(--blur-lg);border-top:1px solid var(--glass-border);box-shadow:var(--glass-highlight);padding:20px 16px 32px;display:flex;flex-direction:column;gap:16px">

      <div>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
          <h1 style="font-family:var(--font-display);font-size:23px;font-weight:800;color:var(--text-strong);letter-spacing:-.02em;line-height:1.15">${p.name}</h1>
          <span style="display:inline-flex;align-items:center;gap:4px;flex:none;font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--text-body)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#EFA91F"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 21.4l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>${p.rating}
            <span style="color:var(--text-subtle);font-weight:500">· ${p.reviews} ta</span>
          </span>
        </div>
        <div style="display:flex;align-items:baseline;gap:4px;margin-top:10px">
          <span style="font-family:var(--font-mono);font-size:30px;font-weight:600;color:var(--text-strong);letter-spacing:-.02em">${p.price.toLocaleString('uz-UZ')}</span>
          <span style="font-size:14px;color:var(--text-muted)">so'm${p.unit}</span>
          <span style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--text-body)">
            <span style="width:7px;height:7px;border-radius:50%;background:${p.stockOk ? '#1FA971' : '#E59413'}"></span>${p.stock}
          </span>
        </div>
      </div>

      <div class="supplier-card">
        <div class="supplier-avatar">${p.supplier[0]}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:5px;font-size:14px;font-weight:700;color:var(--text-strong)">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.supplier}</span>
            ${p.verified ? verifiedSvg('#119DAB') : ''}
          </div>
          <div style="font-size:12px;color:var(--text-muted)">${p.city} · Tasdiqlangan ta'minotchi</div>
        </div>
        <button style="display:flex;align-items:center;gap:6px;height:34px;padding:0 13px;border-radius:var(--radius-sm);border:1px solid var(--glass-border);background:var(--glass-fill-strong);font-size:12.5px;font-weight:600;color:var(--text-strong)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v11H8l-4 3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>Xabar
        </button>
      </div>

      <div>
        <div class="eyebrow" style="margin-bottom:10px">Texnik ko'rsatkichlar</div>
        <div class="specs-table">
          <div class="specs-row"><span class="specs-key">Eni</span><span class="specs-val">${p.width}</span></div>
          <div class="specs-row"><span class="specs-key">Og'irligi</span><span class="specs-val">${p.weight}</span></div>
          <div class="specs-row"><span class="specs-key">Tarkibi</span><span class="specs-val">${p.comp}</span></div>
          <div class="specs-row"><span class="specs-key">Yetkazib berish</span><span class="specs-val">${p.lead}</span></div>
          <div class="specs-row"><span class="specs-key">Minimal buyurtma</span><span class="specs-val">${p.moq}</span></div>
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;" class="glass-panel">
        <span style="font-size:14px;font-weight:700;color:var(--text-strong)">Miqdor</span>
        <div style="display:flex;align-items:center;gap:14px">
          <button class="qty-btn" onclick="changeDetailQty(-1)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
          </button>
          <span class="qty-value" id="detail-qty-label">${state.detailQty * 50} m</span>
          <button class="qty-btn plus" onclick="changeDetailQty(1)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-muted)">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--color-secondary)"><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        To'lov escrow orqali himoyalangan
      </div>

      <button class="btn-primary" style="width:100%" onclick="addDetailToCart(${p.id})">
        ${inC ? '✓ Savatga qo\'shildi' : `Savatga qo'shish — ${total}`}
      </button>
    </div>
  </div>`;
}

function renderSearch() {
  const results = searchResults();
  const hasSearch = state.search.trim().length > 0;
  return `
  <div class="screen anim-rise">
    <span class="search-bar focused" style="cursor:text">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="color:var(--text-subtle)"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <input id="search-input" type="text" value="${escHtml(state.search)}" placeholder="Material qidiring..."
        oninput="onSearch(this.value)"
        autocomplete="off" autocorrect="off" spellcheck="false">
      ${state.search ? `<button onclick="clearSearch()" style="color:var(--text-subtle)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>` : ''}
    </span>

    ${hasSearch ? `
      <div style="display:flex;flex-direction:column;gap:11px">
        ${results.length === 0 ? `
          <div class="empty-state" style="padding:40px 20px">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style="color:var(--ink-300)"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <div class="empty-title">Natija topilmadi</div>
            <div class="empty-sub">Boshqacha kalit so'z yozing</div>
          </div>
        ` : `
          <div style="font-size:12.5px;color:var(--text-muted);font-weight:600">${results.length} ta natija topildi</div>
          ${results.map(p => searchRow(p)).join('')}
        `}
      </div>
    ` : `
      <div>
        <div class="eyebrow" style="margin-bottom:11px">Oxirgi qidiruvlar</div>
        <div style="display:flex;flex-wrap:wrap;gap:9px;margin-bottom:24px">
          ${RECENT.map(r => `
            <button class="chip inactive" onclick="pickRecent('${r}')">
              <span style="display:flex;align-items:center;gap:7px">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style="color:var(--text-subtle)"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>${r}
              </span>
            </button>
          `).join('')}
        </div>
        <div class="eyebrow" style="margin-bottom:11px">Tavsiyalar</div>
        ${PRODUCTS.slice(0, 3).map(p => searchRow(p)).join('')}
      </div>
    `}
  </div>`;
}

function searchRow(p) {
  return `
  <div onclick="navigate('detail', ${JSON.stringify(p).replace(/</g,'\\u003c').replace(/"/g,'&quot;')})" class="glass-panel" style="display:flex;gap:12px;align-items:center;cursor:pointer;padding:10px">
    <span style="flex:none;width:60px;height:60px;border-radius:var(--radius-sm);background:${p.bg};background-size:cover"></span>
    <div style="flex:1;min-width:0">
      <div style="font-family:var(--font-display);font-size:14.5px;font-weight:700;color:var(--text-strong);line-height:1.2">${p.name}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${p.supplier} · ${p.city}</div>
      <div style="margin-top:4px"><span style="font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--text-strong)">${p.price.toLocaleString('uz-UZ')}</span><span style="font-size:11px;color:var(--text-muted)"> so'm${p.unit}</span></div>
    </div>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--text-subtle)"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>`;
}

function renderCart() {
  return `<div class="screen anim-rise" id="cart-content">${cartContent()}</div>`;
}

function cartContent() {
  if (state.cart.length === 0) {
    return `
    <div class="empty-state">
      <div class="empty-icon">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M3 6h18" stroke="currentColor" stroke-width="1.7"/><path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
      </div>
      <div class="empty-title">Savat bo'sh</div>
      <div class="empty-sub">Materiallar qo'shing va buyurtma bering</div>
      <button class="btn-primary" style="width:200px;margin-top:8px" onclick="navigate('catalog')">Katalogga o'tish</button>
    </div>`;
  }

  const lines = state.cart.map(l => `
    <div class="glass-panel" style="display:flex;gap:12px;padding:12px">
      <span style="flex:none;width:64px;height:64px;border-radius:var(--radius-sm);background:${l.product.bg};background-size:cover"></span>
      <div style="flex:1;min-width:0;display:flex;flex-direction:column">
        <div style="display:flex;justify-content:space-between;gap:8px">
          <div style="font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--text-strong);line-height:1.2">${l.product.name}</div>
          <button onclick="removeFromCart(${l.product.id})" style="flex:none;color:var(--text-subtle);width:22px;height:22px;display:flex;align-items:center;justify-content:center">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div style="font-size:11.5px;color:var(--text-muted);margin-top:1px">${l.product.supplier}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:8px">
          <div style="display:flex;align-items:center;gap:10px">
            <button onclick="changeCartQty(${l.product.id},-1)" style="width:28px;height:28px;border-radius:8px;border:1px solid var(--glass-border);background:var(--glass-fill-strong);display:flex;align-items:center;justify-content:center;color:var(--text-strong)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
            </button>
            <span style="font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--text-strong);min-width:56px;text-align:center">${l.qty * 50} m</span>
            <button onclick="changeCartQty(${l.product.id},1)" style="width:28px;height:28px;border-radius:8px;border:1px solid var(--glass-border);background:var(--glass-fill-strong);display:flex;align-items:center;justify-content:center;color:var(--text-strong)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
            </button>
          </div>
          <span style="font-family:var(--font-mono);font-size:15px;font-weight:600;color:var(--text-strong)">${(l.product.price * l.qty).toLocaleString('uz-UZ')} so'm</span>
        </div>
      </div>
    </div>
  `).join('');

  const summary = `
    <div class="glass-card" style="padding:16px">
      <div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--text-muted);margin-bottom:8px"><span>Jami mahsulotlar</span><span style="font-family:var(--font-mono);font-weight:600;color:var(--text-body)">${cartTotal().toLocaleString('uz-UZ')} so'm</span></div>
      <div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--text-muted);margin-bottom:10px"><span>Yetkazib berish</span><span style="font-size:12.5px">Hisoblanadi</span></div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;padding-top:10px;border-top:1px solid var(--border-hair)">
        <span style="font-size:15px;font-weight:700;color:var(--text-strong)">Jami</span>
        <span style="font-family:var(--font-mono);font-size:21px;font-weight:600;color:var(--text-strong)">${cartTotal().toLocaleString('uz-UZ')} so'm</span>
      </div>
      <button class="btn-primary" style="width:100%;margin-top:14px" onclick="navigate('checkout')">Buyurtma berish</button>
    </div>`;

  return lines + summary;
}

function renderCartContent() {
  const wrap = document.getElementById('cart-content');
  if (wrap) wrap.innerHTML = cartContent();
}

function renderCheckout() {
  const payOptions = [
    { id: 'escrow', label: 'Escrow to\'lov', sub: 'Tovar kelgandan keyin pul o\'tkaziladi', },
    { id: 'bank',   label: 'Bank o\'tkazmasi', sub: '1–2 ish kuni ichida', },
    { id: 'cash',   label: 'Naqd pul', sub: 'Kuryer bilan', },
  ];
  return `
  <div class="screen anim-rise">
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px">
        <span class="eyebrow">Yetkazib berish manzili</span>
        <button style="font-size:12.5px;font-weight:600;color:var(--text-link)">O'zgartirish</button>
      </div>
      <div class="glass-panel" style="display:flex;gap:12px;padding:14px">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--color-primary);margin-top:2px"><path d="M12 21s-6-5.7-6-10a6 6 0 0 1 12 0c0 4.3-6 10-6 10z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="11" r="2.2" stroke="currentColor" stroke-width="2"/></svg>
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--text-strong)">${COMPANY.name}</div>
          <div style="font-size:13px;color:var(--text-muted);line-height:1.45;margin-top:2px">${COMPANY.addr}</div>
        </div>
      </div>
    </div>

    <div>
      <div class="eyebrow" style="margin-bottom:9px">To'lov usuli</div>
      <div style="display:flex;flex-direction:column;gap:9px">
        ${payOptions.map(o => {
          const sel = state.payMethod === o.id;
          return `
          <button class="pay-option" style="border:1.5px solid ${sel ? '#7a140d' : 'rgba(255,255,255,.55)'}"
            onclick="selectPay('${o.id}')">
            <div class="pay-radio" style="border:2px solid ${sel ? '#7a140d' : 'var(--ink-300)'}">
              <div class="pay-radio-dot" style="background:${sel ? '#7a140d' : 'transparent'}"></div>
            </div>
            <div style="flex:1">
              <div style="font-size:14px;font-weight:700;color:var(--text-strong)">${o.label}</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:1px">${o.sub}</div>
            </div>
          </button>`;
        }).join('')}
      </div>
    </div>

    <div>
      <div class="eyebrow" style="margin-bottom:9px">Izoh</div>
      <textarea placeholder="Qo'shimcha xabar yozing..." rows="3"
        style="width:100%;resize:none;padding:12px 14px;border:1px solid var(--border-hair);border-radius:var(--radius-md);background:var(--glass-fill-strong);font-family:var(--font-sans);font-size:14px;color:var(--text-strong);outline:none;box-shadow:var(--glass-highlight)"></textarea>
    </div>

    <div>
      <div class="eyebrow" style="margin-bottom:9px">Buyurtma xulosasi</div>
      <div class="glass-panel" style="padding:14px 16px">
        ${state.cart.map(l => `
          <div style="display:flex;justify-content:space-between;gap:10px;font-size:13px;margin-bottom:8px">
            <span style="color:var(--text-body)">${l.product.name} · ${l.qty * 50} m</span>
            <span style="font-family:var(--font-mono);font-weight:600;color:var(--text-strong);flex:none">${(l.product.price * l.qty).toLocaleString('uz-UZ')} so'm</span>
          </div>
        `).join('')}
        <div style="display:flex;justify-content:space-between;align-items:baseline;padding-top:10px;border-top:1px solid var(--border-hair)">
          <span style="font-size:14.5px;font-weight:700;color:var(--text-strong)">Jami</span>
          <span style="font-family:var(--font-mono);font-size:19px;font-weight:600;color:var(--text-strong)">${cartTotal().toLocaleString('uz-UZ')} so'm</span>
        </div>
      </div>
    </div>

    <button class="btn-primary" style="width:100%" onclick="placeOrder()">Buyurtmani tasdiqlash</button>
  </div>`;
}

function renderSuccess() {
  return `
  <div class="screen" style="padding:50px 28px;align-items:center;text-align:center;gap:16px;justify-content:center;min-height:60vh" class="anim-rise">
    <span style="width:88px;height:88px;border-radius:50%;background:var(--gradient-teal);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 10px 30px -8px rgba(17,157,171,.42);animation:pop var(--dur-slow) var(--ease-spring)">
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </span>
    <div style="font-family:var(--font-display);font-size:23px;font-weight:800;color:var(--text-strong);letter-spacing:-.02em">Buyurtma qabul qilindi!</div>
    <div style="font-size:14px;color:var(--text-muted);line-height:1.55;max-width:280px">Ta'minotchi 2 soat ichida siz bilan bog'lanadi.</div>
    <div style="font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--text-strong);padding:8px 16px;border-radius:var(--radius-pill)" class="glass-panel">#LM-2042</div>
    <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:300px;margin-top:14px">
      <button class="btn-primary" style="width:100%" onclick="navigate('orders')">Buyurtmalarimni ko'rish</button>
      <button class="btn-secondary" style="width:100%" onclick="navigate('home')">Bosh sahifaga qaytish</button>
    </div>
  </div>`;
}

function renderOrders() {
  const tab = state.ordersTab;
  const list = MOCK_ORDERS.filter(o => tab === 'active' ? !o.past : o.past);
  return `
  <div class="screen anim-rise">
    <div style="display:flex;gap:4px;padding:4px;border-radius:var(--radius-md)" class="glass-panel">
      <button onclick="setOrdersTab('active')" style="flex:1;height:36px;border:none;border-radius:var(--radius-sm);font-size:13.5px;font-weight:600;cursor:pointer;transition:all var(--dur-base);background:${tab==='active'?'rgba(122,20,13,.90)':'transparent'};color:${tab==='active'?'#ffe9db':'var(--text-muted)'}">Faol</button>
      <button onclick="setOrdersTab('past')" style="flex:1;height:36px;border:none;border-radius:var(--radius-sm);font-size:13.5px;font-weight:600;cursor:pointer;transition:all var(--dur-base);background:${tab==='past'?'rgba(122,20,13,.90)':'transparent'};color:${tab==='past'?'#ffe9db':'var(--text-muted)'}">O'tgan</button>
    </div>

    ${list.length === 0 ? `<div class="empty-state" style="padding:40px 0"><div class="empty-title">Buyurtma yo'q</div></div>` :
    list.map(o => `
      <div class="glass-panel" style="padding:14px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:11px">
          <span style="font-family:var(--font-mono);font-size:13.5px;font-weight:600;color:var(--text-strong)">${o.id}</span>
          <span class="status-badge" style="background:${o.statusBg};color:${o.statusFg}">${o.status}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="position:relative;flex:none;width:52px;height:52px;border-radius:var(--radius-sm);background:${o.firstBg};background-size:cover">
            ${o.more ? `<span style="position:absolute;right:-6px;bottom:-6px;min-width:24px;height:24px;padding:0 6px;border-radius:999px;background:var(--ink-900);color:#fff;font-family:var(--font-mono);font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;border:2px solid #fff">${o.more}</span>` : ''}
          </span>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:700;color:var(--text-strong);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${o.firstName}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${o.items} ta · ${o.date}</div>
          </div>
          <span style="font-family:var(--font-mono);font-size:15px;font-weight:600;color:var(--text-strong)">${o.total.toLocaleString('uz-UZ')} so'm</span>
        </div>
      </div>
    `).join('')}
  </div>`;
}

// ============ PRODUCT CARD ============

function productCard(p, showLike) {
  const liked = state.likes.has(p.id);
  const added = inCart(p);
  return `
  <div class="product-card" onclick="navigate('detail', ${safeJson(p)})">
    <div class="product-img" style="background:${p.bg}">
      ${p.badge ? `<span class="product-badge" style="background:${p.badgeBg};color:${p.badgeFg}">${p.badge}</span>` : ''}
      ${showLike ? `
        <button class="like-btn" onclick="event.stopPropagation();toggleLike(${p.id})">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="${liked ? '#E84B40' : 'none'}" style="color:${liked ? '#E84B40' : 'var(--ink-600)'}"><path d="M12 21s-7-4.5-9.2-8.4C1.2 9.6 2.6 6 6 6c2 0 3.2 1.2 4 2.3C10.8 7.2 12 6 14 6c3.4 0 4.8 3.6 3.2 6.6C19 16.5 12 21 12 21z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        </button>` : ''}
    </div>
    <div class="product-body">
      <div class="product-name">${p.name}</div>
      <div class="product-city">${p.city}</div>
      <div class="product-footer">
        <span><span class="product-price">${p.price.toLocaleString('uz-UZ')}</span><span class="product-unit"> so'm${p.unit}</span></span>
        <button id="add-${p.id}" class="add-btn ${added ? 'added' : ''}"
          onclick="event.stopPropagation();addToCart(${p.id})">
          ${added
            ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
            : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`
          }
        </button>
      </div>
    </div>
  </div>`;
}

// ============ SVG HELPERS ============

function verifiedSvg(color) {
  return `<svg class="verified-icon" width="14" height="14" viewBox="0 0 24 24" fill="${color}"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.6 1.5-.9 2.9.9 2.9-2.6 1.5-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8L3 16.3l.9-2.9L3 10.5l2.6-1.5 1-2.8 3 .2z"/><path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function safeJson(obj) {
  return JSON.stringify(obj).replace(/</g,'\\u003c').replace(/"/g,'&quot;');
}

// ============ INTERACTIONS ============

function selectCategory(cat) {
  state.category = cat;
  document.getElementById('screen-wrap').innerHTML = renderCatalog();
}

function toggleLike(productId) {
  if (state.likes.has(productId)) {
    state.likes.delete(productId);
  } else {
    state.likes.add(productId);
  }
  // just update icon without full re-render
  render();
}

function onSearch(val) {
  state.search = val;
  document.getElementById('screen-wrap').innerHTML = renderSearch();
  // re-focus input
  const inp = document.getElementById('search-input');
  if (inp) { inp.focus(); const len = inp.value.length; inp.setSelectionRange(len, len); }
}

function clearSearch() {
  state.search = '';
  document.getElementById('screen-wrap').innerHTML = renderSearch();
  const inp = document.getElementById('search-input');
  if (inp) inp.focus();
}

function pickRecent(term) {
  state.search = term;
  document.getElementById('screen-wrap').innerHTML = renderSearch();
  const inp = document.getElementById('search-input');
  if (inp) { const len = inp.value.length; inp.focus(); inp.setSelectionRange(len, len); }
}

function changeDetailQty(delta) {
  state.detailQty = Math.max(1, state.detailQty + delta);
  const el = document.getElementById('detail-qty-label');
  if (el) el.textContent = `${state.detailQty * 50} m`;
}

function addDetailToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const line = state.cart.find(l => l.product.id === productId);
  if (line) {
    line.qty = state.detailQty;
  } else {
    state.cart.push({ product, qty: state.detailQty });
  }
  updateCartBadge();
  showToast(`Savatga qo'shildi — ${state.detailQty * 50} m`);
  navigate('cart');
}

function selectPay(method) {
  state.payMethod = method;
  document.getElementById('screen-wrap').innerHTML = renderCheckout();
}

function placeOrder() {
  state.cart = [];
  updateCartBadge();
  navigate('success');
}

function setOrdersTab(tab) {
  state.ordersTab = tab;
  document.getElementById('screen-wrap').innerHTML = renderOrders();
}

// ============ MAIN RENDER ============

function render() {
  updateHeader();
  updateNav();

  const renderers = {
    home:     renderHome,
    catalog:  renderCatalog,
    detail:   renderDetail,
    search:   renderSearch,
    cart:     renderCart,
    checkout: renderCheckout,
    success:  renderSuccess,
    orders:   renderOrders,
  };

  const fn = renderers[state.screen];
  if (fn) {
    document.getElementById('screen-wrap').innerHTML = fn();
  }
}

// ============ NAVIGATE FROM SEARCH ROW (JSON) ============

// Override navigate to handle product passed as JSON via onclick attribute
const _nav = navigate;
window.navigate = function(screen, productData) {
  if (screen === 'detail' && typeof productData === 'string') {
    try { productData = JSON.parse(productData); } catch(e) {}
  }
  _nav(screen, productData);
};

// ============ INIT ============

if (window.Telegram && window.Telegram.WebApp) {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
}

render();
