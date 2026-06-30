/* ============================================================
   LolaMarket Telegram Mini App — dizayndan to'liq implement
   ============================================================ */

// ============ TO'QIMA PATTERNLAR (CSS gradient) ============
const PATTERNS = {
  adras:      "repeating-linear-gradient(96deg,#E84B40 0 16px,#EFA91F 16px 27px,#119DAB 27px 42px,#FBF6EC 42px 48px,#571814 48px 58px,#54D7E1 58px 70px)",
  adrasCool:  "repeating-linear-gradient(94deg,#119DAB 0 15px,#0C656F 15px 26px,#54D7E1 26px 40px,#FBF6EC 40px 46px,#232842 46px 58px)",
  adrasWarm:  "repeating-linear-gradient(92deg,#E84B40 0 14px,#7C201A 14px 24px,#EFA91F 24px 38px,#FBF6EC 38px 44px,#F46A5F 44px 56px)",
  ikat:       "radial-gradient(circle at 20% 30%,rgba(232,75,64,.55) 0 9%,transparent 10%),radial-gradient(circle at 70% 60%,rgba(17,157,171,.55) 0 9%,transparent 10%),repeating-linear-gradient(45deg,#FBF6EC 0 14px,#F1E4CE 14px 28px)",
  suzani:     "radial-gradient(circle at 50% 50%,#E84B40 0 5%,transparent 6%),radial-gradient(circle at 0% 0%,#119DAB 0 5%,transparent 6%),radial-gradient(circle at 100% 100%,#119DAB 0 5%,transparent 6%),radial-gradient(circle at 0% 100%,#EFA91F 0 5%,transparent 6%),radial-gradient(circle at 100% 0%,#EFA91F 0 5%,transparent 6%),#1B1E3C",
  herringbone:"repeating-linear-gradient(45deg,#0C656F 0 4px,#119DAB 4px 8px),repeating-linear-gradient(-45deg,rgba(255,255,255,.06) 0 4px,transparent 4px 8px)",
  weave:      "repeating-linear-gradient(0deg,rgba(23,26,48,.05) 0 3px,transparent 3px 6px),repeating-linear-gradient(90deg,rgba(23,26,48,.06) 0 3px,transparent 3px 6px),#E9D9BE",
  plain:      "linear-gradient(135deg,#F46A5F,#E84B40)",
};
const PSIZES = {
  suzani: "34px 34px",
  ikat: "60px 60px,60px 60px,40px 40px",
  herringbone: "16px 16px,16px 16px",
  weave: "6px 6px,6px 6px,auto",
};
function pSize(k) { return PSIZES[k] || 'auto'; }

// ============ MAHSULOTLAR ============
const PRODUCTS = [
  { id:'ik-1402', pattern:'adras',      price:6.4,  unit:'m',    moq:300, lead:28, rating:4.9, reviews:42,  verified:true,  stockKey:'in',   catKey:'silk',   badgeTone:'primary',
    name:"Marg'ilon ipak ikat", supplier:"Marg'ilon Ipak Co.", city:"Marg'ilon",
    width:"0.9 m", weight:"90 g/m²", comp:"100% tut ipagi", badge:"Tavsiya" },
  { id:'ad-0890', pattern:'adrasWarm',  price:3.8,  unit:'m',    moq:500, lead:32, rating:4.7, reviews:28,  verified:true,  stockKey:'low',  catKey:'ikat',   badgeTone:'saffron',
    name:"Qo'lbola adras", supplier:"Buxoro Looms", city:"Buxoro",
    width:"1.0 m", weight:"150 g/m²", comp:"50% ipak / 50% paxta", badge:"Kam qoldi" },
  { id:'sz-3310', pattern:'suzani',     price:42,   unit:'panel', moq:20,  lead:45, rating:5.0, reviews:17,  verified:true,  stockKey:'made', catKey:'suzani', badgeTone:'teal',
    name:"So'zana panel — anor", supplier:"Nurota Atelier", city:"Nurota",
    width:"1.4 × 1.8 m", weight:"—", comp:"Paxta asos, ipak ip", badge:"Hunarmand" },
  { id:'ck-2201', pattern:'adrasCool',  price:2.9,  unit:'m',    moq:800, lead:21, rating:4.6, reviews:51,  verified:false, stockKey:'in',   catKey:'cotton', badgeTone:'neutral',
    name:"Paxta adras — indigo", supplier:"O'sh Textile", city:"O'sh",
    width:"1.5 m", weight:"180 g/m²", comp:"100% paxta", badge:null },
  { id:'hb-7740', pattern:'herringbone',price:8.2,  unit:'m',    moq:250, lead:35, rating:4.8, reviews:33,  verified:true,  stockKey:'in',   catKey:'wool',   badgeTone:'teal',
    name:"Junli mato — yelkacha", supplier:"Almati Weaving", city:"Almati",
    width:"1.5 m", weight:"320 g/m²", comp:"70% jun / 30% PES", badge:"Yangi" },
  { id:'lk-5512', pattern:'weave',      price:4.1,  unit:'m',    moq:600, lead:24, rating:4.5, reviews:22,  verified:true,  stockKey:'in',   catKey:'linen',  badgeTone:'neutral',
    name:"Zig'ir mato — natural", supplier:"Shymkent Mills", city:"Shymkent",
    width:"1.4 m", weight:"200 g/m²", comp:"100% zig'ir", badge:null },
  { id:'ik-9001', pattern:'ikat',       price:11.5, unit:'m',    moq:150, lead:30, rating:4.9, reviews:19,  verified:true,  stockKey:'in',   catKey:'ikat',   badgeTone:'primary',
    name:"Kelinlik ikat — za'faron", supplier:"Marg'ilon Ipak Co.", city:"Marg'ilon",
    width:"0.9 m", weight:"110 g/m²", comp:"100% tut ipagi", badge:"Tavsiya" },
  { id:'pl-3320', pattern:'plain',      price:2.4,  unit:'m',    moq:1000,lead:18, rating:4.4, reviews:64,  verified:false, stockKey:'in',   catKey:'cotton', badgeTone:'neutral',
    name:"Sodda to'qima — marjon", supplier:"Farg'ona Fabric", city:"Farg'ona",
    width:"1.6 m", weight:"160 g/m²", comp:"65% paxta / 35% PES", badge:null },
];

const CATS = [
  { key:'all',    label:"Barchasi" },
  { key:'ikat',   label:"Ikat va adras" },
  { key:'suzani', label:"So'zana" },
  { key:'silk',   label:"Ipak" },
  { key:'cotton', label:"Paxta" },
  { key:'wool',   label:"Jun" },
  { key:'linen',  label:"Zig'ir" },
];

const ORDERS = [
  { id:'#LM-2041', date:"18-iyun",   items:[{id:'ik-1402',qty:300}],               statusKey:'production' },
  { id:'#LM-2038', date:"10-iyun",   items:[{id:'hb-7740',qty:250},{id:'pl-3320',qty:1000}], statusKey:'shipped' },
  { id:'#LM-1990', date:"22-may",    items:[{id:'ck-2201',qty:800}],               statusKey:'delivered' },
  { id:'#LM-1804', date:"30-aprel",  items:[{id:'lk-5512',qty:600}],               statusKey:'delivered' },
];

const PAY = [
  { key:'escrow', label:"Escrow — xavfsiz to'lov",  sub:"Tavsiya etiladi · yetkazilgach ozod etiladi" },
  { key:'bank',   label:"Bank o'tkazmasi",           sub:"FOB / CIF · 30% oldindan" },
  { key:'click',  label:"Click / Payme",             sub:"Tezkor to'lov" },
];

const RECENT_SEARCHES = ["adras","ipak","so'zana","jun","Marg'ilon"];

const COMPANY = {
  name:"Dilnoza Tekstil MChJ", role:"Xaridor · B2B",
  addr:"Toshkent, Yunusobod t., Amir Temur ko'ch. 12",
  since:"2024 yildan beri", phone:"+998 90 123 45 67",
  email:"savdo@dilnoza.uz", initials:"DT",
};

// ============ HOLAT ============
const S = {
  screen: 'home',
  history: [],
  selectedId: 'ik-1402',
  cart: [],
  qty: 300,
  search: '',
  cat: 'all',
  pay: 'escrow',
  ordersTab: 'active',
  liked: { 'ik-9001': true },
};

// ============ YORDAMCHILAR ============
function money(n) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function num(n) { return Number(n).toLocaleString('en-US'); }
function uShort(u) { return u === 'panel' ? 'dona' : 'm'; }
function step(p) { return p && p.unit === 'panel' ? 5 : 50; }

function byId(id) { return PRODUCTS.find(x => x.id === id); }

const BADGE_COLORS = {
  primary: ['var(--color-primary)','#fff'],
  teal:    ['var(--teal-50)','var(--teal-700)'],
  saffron: ['var(--saffron-50)','var(--saffron-700)'],
  neutral: ['var(--ink-100)','var(--ink-700)'],
};
const STOCK_COLOR = { in:'var(--success-500)', low:'var(--saffron-500)', made:'var(--teal-500)' };
const STOCK_TXT   = { in:'Sotuvda', low:'Kam qoldi', made:'Buyurtmaga' };
const STATUS_TXT  = { production:'Ishlab chiqarilmoqda', shipped:"Yo'lda", delivered:'Yetkazildi', pending:'Tasdiq kutilmoqda' };
const STATUS_COL  = {
  saffron: ['var(--saffron-50)','var(--saffron-700)'],
  teal:    ['var(--teal-50)','var(--teal-700)'],
  success: ['var(--success-100)','#0E6B47'],
  neutral: ['var(--ink-100)','var(--ink-700)'],
};
const STATUS_TONE = { production:'saffron', shipped:'teal', delivered:'success', pending:'neutral' };

function vm(p) {
  const [bbg,bfg] = BADGE_COLORS[p.badgeTone] || BADGE_COLORS.neutral;
  return {
    ...p,
    bg: PATTERNS[p.pattern] || PATTERNS.plain,
    bgSize: pSize(p.pattern),
    priceLabel: money(p.price),
    unitLabel: '/' + uShort(p.unit),
    moqLabel: num(p.moq) + ' ' + uShort(p.unit),
    leadLabel: p.lead + ' kun',
    stockTxt: STOCK_TXT[p.stockKey],
    stockCol: STOCK_COLOR[p.stockKey],
    badgeShow: !!p.badge,
    badgeBg: bbg, badgeFg: bfg,
    liked: !!S.liked[p.id],
    heartFill: S.liked[p.id] ? 'var(--color-primary)' : 'none',
    heartStroke: S.liked[p.id] ? 'var(--color-primary)' : 'var(--text-body)',
    meta: p.city + ' · MOQ ' + num(p.moq) + uShort(p.unit) + ' · ' + p.lead + ' kun',
  };
}

function cartTotal() { return S.cart.reduce((s,c) => s + byId(c.id).price * c.qty, 0); }
function cartCount() { return S.cart.length; }

// ============ NAVIGATSIYA ============
function navigate(screen) {
  if (S.screen !== screen) S.history.push(S.screen);
  S.screen = screen;
  render();
  const w = document.getElementById('screen-wrap');
  if (w) w.scrollTop = 0;
}
function goBack() {
  const prev = S.history.pop() || 'home';
  S.screen = prev;
  render();
}
function tab(k) {
  S.screen = k;
  S.history = [];
  render();
}

// ============ SAVAT ============
function addToCart(id, qty) {
  const line = S.cart.find(x => x.id === id);
  if (line) line.qty += qty;
  else S.cart.push({ id, qty });
  showToast('Savatga qo\'shildi');
  render();
}
function incCart(id) {
  const p = byId(id);
  const line = S.cart.find(x => x.id === id);
  if (line) { line.qty += step(p); render(); }
}
function decCart(id) {
  const p = byId(id);
  const line = S.cart.find(x => x.id === id);
  if (line) { line.qty = Math.max(p.moq, line.qty - step(p)); render(); }
}
function removeCart(id) {
  S.cart = S.cart.filter(x => x.id !== id);
  render();
}

// ============ MAHSULOT OCHISH ============
function openProduct(id) {
  const p = byId(id);
  S.selectedId = id;
  S.qty = p ? p.moq : 300;
  if (S.screen !== 'detail') S.history.push(S.screen);
  S.screen = 'detail';
  render();
  const w = document.getElementById('screen-wrap');
  if (w) w.scrollTop = 0;
}

function incQty() {
  const p = byId(S.selectedId);
  S.qty += step(p);
  const el = document.getElementById('detail-qty');
  if (el) el.textContent = num(S.qty) + ' ' + uShort(p.unit);
  const el2 = document.getElementById('main-btn-sub');
  if (el2) el2.textContent = money(p.price * S.qty);
}
function decQty() {
  const p = byId(S.selectedId);
  S.qty = Math.max(p.moq, S.qty - step(p));
  const el = document.getElementById('detail-qty');
  if (el) el.textContent = num(S.qty) + ' ' + uShort(p.unit);
  const el2 = document.getElementById('main-btn-sub');
  if (el2) el2.textContent = money(p.price * S.qty);
}

// ============ TOAST ============
let _toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.add('hidden'), 2000);
}

// ============ HEADER ============
function updateHeader() {
  const sc = S.screen;
  const titles = {
    home:'LolaMarket', catalog:'Katalog', detail:'Mahsulot',
    search:'Qidiruv', cart:'Savat', checkout:'Buyurtma berish',
    orders:'Buyurtmalarim', profile:'Profil', success:'Buyurtma berish',
  };

  document.getElementById('btn-back').classList.toggle('hidden', !['detail','checkout'].includes(sc));
  document.getElementById('header-brand').style.display = sc === 'home' ? 'flex' : 'none';
  document.getElementById('btn-header-search').classList.toggle('hidden', !['catalog','orders','cart'].includes(sc));

  const titleEl = document.getElementById('header-title');
  const subEl   = document.getElementById('header-sub');
  if (sc === 'home') {
    titleEl.textContent = 'LolaMarket';
    subEl.style.display = 'block';
    subEl.textContent   = 'Telegram Mini App';
  } else if (sc === 'detail' && S.selectedId) {
    const p = byId(S.selectedId);
    titleEl.textContent = p ? p.name : 'Mahsulot';
    subEl.style.display = 'block';
    subEl.textContent   = p ? p.city : '';
  } else {
    titleEl.textContent = titles[sc] || 'LolaMarket';
    subEl.style.display = 'none';
  }
}

// ============ NAVIGATSIYA PANELI ============
function updateNav() {
  const sc = S.screen;
  const TAB_SCREENS = ['home','catalog','search','cart','orders','profile'];
  const showTabBar = TAB_SCREENS.includes(sc);
  const showMainBtn = sc === 'detail' || sc === 'checkout';

  document.getElementById('app-nav').classList.toggle('hidden', !showTabBar);
  document.getElementById('main-btn-bar').classList.toggle('hidden', !showMainBtn);

  if (showTabBar) {
    const navMap = { home:0, catalog:1, cart:2, orders:3 };
    const lensIdx = navMap[sc] ?? null;
    const lensEl = document.getElementById('nav-lens');
    const showLens = lensIdx !== null;
    lensEl.classList.toggle('hidden', !showLens);
    if (showLens) {
      lensEl.style.left = `calc(7px + ${lensIdx} * ((100% - 14px) / 4))`;
    }

    const activeColor = '#651007';
    const inactiveColor = 'rgba(255,250,247,.96)';
    document.getElementById('nav-home').style.color    = (sc==='home')   ? activeColor : inactiveColor;
    document.getElementById('nav-catalog').style.color = (sc==='catalog') ? activeColor : inactiveColor;
    document.getElementById('nav-cart').style.color    = (sc==='cart')    ? activeColor : inactiveColor;
    document.getElementById('nav-orders').style.color  = (sc==='orders')  ? activeColor : inactiveColor;
    document.getElementById('nav-profile').style.color = (sc==='profile') ? '#ffffff'   : inactiveColor;

    const badge = document.getElementById('cart-badge');
    const cnt = cartCount();
    badge.classList.toggle('hidden', cnt === 0);
    if (cnt > 0) badge.textContent = cnt;
  }

  if (showMainBtn) {
    const p = byId(S.selectedId);
    if (sc === 'detail' && p) {
      document.getElementById('main-btn-label').textContent = 'Savatga qo\'shish';
      document.getElementById('main-btn-sub').textContent   = money(p.price * S.qty);
    } else if (sc === 'checkout') {
      document.getElementById('main-btn-label').textContent = 'Buyurtmani tasdiqlash';
      document.getElementById('main-btn-sub').textContent   = money(cartTotal());
    }
  }
}

// ============ EKRAN: BOSH SAHIFA ============
function renderHome() {
  const featured = ['ik-1402','ik-9001','sz-3310','hb-7740'].map(id => vm(byId(id)));
  return `
  <div style="padding:10px 16px 28px;display:flex;flex-direction:column;gap:14px">
    <div>
      <div style="font-family:var(--font-display);font-size:20px;font-weight:800;color:var(--text-strong);letter-spacing:-.02em;line-height:1.15">Salom, Maryam 🌷</div>
      <div style="font-size:12.5px;color:var(--text-muted);margin-top:2px">Bugun qanday matolar kerak?</div>
    </div>

    <div style="display:flex;align-items:center;gap:9px">
      <button onclick="tab('search')" style="flex:1;display:flex;align-items:center;gap:10px;height:48px;padding:0 16px;border:1px solid rgba(255,255,255,.7);border-radius:var(--radius-md);background:rgba(255,255,255,.55);backdrop-filter:blur(20px) saturate(170%);-webkit-backdrop-filter:blur(20px) saturate(170%);box-shadow:0 8px 22px -10px rgba(81,1,0,.18),0 1px 2px rgba(23,26,48,.06),inset 0 1px 0 rgba(255,255,255,.9);cursor:pointer;color:var(--text-subtle);font-size:14.5px;font-family:var(--font-sans)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        Mato yoki kategoriya qidiring
      </button>
      <button onclick="tab('catalog')" style="flex:none;width:48px;height:48px;border-radius:var(--radius-md);background:linear-gradient(150deg,#7a140d,#510100);border:1px solid rgba(255,229,210,.25);box-shadow:0 6px 16px -6px rgba(81,1,0,.6),inset 0 1px 0 rgba(255,229,210,.22);display:flex;align-items:center;justify-content:center;color:#ffe5d2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
      </button>
    </div>

    <div style="display:flex;align-items:center;padding:12px 14px;border-radius:var(--radius-md);background:rgba(255,255,255,.6);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);gap:10px;box-shadow:0 5px 16px -12px rgba(81,1,0,.14)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--color-secondary)"><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
      <span style="font-size:12.5px;color:var(--text-muted)">28 tasdiqlangan fabrika · har bir buyurtmada escrow</span>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between">
      <span style="font-family:var(--font-display);font-size:17px;font-weight:700;color:var(--text-strong)">Tavsiya etiladi</span>
      <button onclick="tab('catalog')" style="font-size:13px;font-weight:600;color:var(--teal-600);background:none;border:none;cursor:pointer">Barchasi ›</button>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      ${featured.map(p => productCard(p, true)).join('')}
    </div>
  </div>`;
}

// ============ EKRAN: KATALOG ============
function renderCatalog() {
  const prods = (S.cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.catKey === S.cat)).map(vm);
  return `
  <div style="padding:14px 16px 28px;display:flex;flex-direction:column;gap:14px">
    <div style="display:flex;gap:9px">
      <button style="flex:1;display:flex;align-items:center;justify-content:center;gap:7px;height:40px;border-radius:var(--radius-md);border:1px solid rgba(255,255,255,.7);background:rgba(255,255,255,.55);backdrop-filter:blur(20px) saturate(170%);-webkit-backdrop-filter:blur(20px) saturate(170%);font-size:13.5px;font-weight:600;color:var(--text-body);box-shadow:0 8px 22px -10px rgba(81,1,0,.18),inset 0 1px 0 rgba(255,255,255,.9)">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Filtr
      </button>
      <button style="flex:1;display:flex;align-items:center;justify-content:center;gap:7px;height:40px;border-radius:var(--radius-md);border:1px solid rgba(255,255,255,.7);background:rgba(255,255,255,.55);backdrop-filter:blur(20px) saturate(170%);-webkit-backdrop-filter:blur(20px) saturate(170%);font-size:13.5px;font-weight:600;color:var(--text-body);box-shadow:0 8px 22px -10px rgba(81,1,0,.18),inset 0 1px 0 rgba(255,255,255,.9)">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M8 4v16m0 0l-3-3m3 3l3-3M16 20V4m0 0l-3 3m3-3l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Saralash
      </button>
    </div>

    <div style="display:flex;gap:9px;overflow-x:auto;margin:0 -16px;padding:2px 16px;scrollbar-width:none">
      ${CATS.map(c => {
        const active = c.key === S.cat;
        return `<button onclick="selectCat('${c.key}')" style="flex:none;height:34px;padding:0 15px;border-radius:999px;font-size:13px;font-weight:600;white-space:nowrap;cursor:pointer;border:1px solid ${active ? 'transparent' : 'var(--border-hair)'};background:${active ? 'var(--ink-900)' : 'var(--glass-fill)'};color:${active ? '#fff' : 'var(--text-body)'}">${c.label}</button>`;
      }).join('')}
    </div>

    ${prods.length === 0
      ? `<div style="text-align:center;padding:40px;color:var(--text-muted)">Mahsulot topilmadi</div>`
      : `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${prods.map(p => productCard(p, false)).join('')}</div>`}
  </div>`;
}

// ============ EKRAN: DETAIL ============
function renderDetail() {
  const p = vm(byId(S.selectedId));
  if (!p) return '';
  return `
  <div style="display:flex;flex-direction:column">
    <div style="position:relative;height:248px;background:${p.bg};background-size:${p.bgSize}">
      ${p.badgeShow ? `<span style="position:absolute;top:14px;left:16px;display:inline-flex;align-items:center;height:26px;padding:0 12px;border-radius:999px;font-size:12px;font-weight:600;background:${p.badgeBg};color:${p.badgeFg}">${p.badge}</span>` : ''}
      <button onclick="toggleLike('${p.id}')" style="position:absolute;top:12px;right:14px;width:38px;height:38px;border-radius:50%;border:1px solid var(--glass-border);background:var(--glass-fill-strong);backdrop-filter:var(--blur-md);-webkit-backdrop-filter:var(--blur-md);display:flex;align-items:center;justify-content:center;color:${p.heartStroke};box-shadow:var(--glass-highlight)">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="${p.heartFill}"><path d="M12 21s-7-4.5-9.2-8.4C1.2 9.6 2.6 6 6 6c2 0 3.2 1.2 4 2.3C10.8 7.2 12 6 14 6c3.4 0 4.8 3.6 3.2 6.6C19 16.5 12 21 12 21z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
      </button>
    </div>

    <div style="margin-top:-22px;border-radius:28px 28px 0 0;background:var(--glass-fill-strong);backdrop-filter:var(--blur-lg);-webkit-backdrop-filter:var(--blur-lg);border-top:1px solid var(--glass-border);box-shadow:var(--glass-highlight);padding:20px 16px 32px;display:flex;flex-direction:column;gap:16px">
      <div>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
          <h1 style="font-family:var(--font-display);font-size:23px;font-weight:800;color:var(--text-strong);letter-spacing:-.02em;line-height:1.15;margin:0">${p.name}</h1>
          <span style="display:inline-flex;align-items:center;gap:4px;flex:none;font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--text-body)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#EFA91F"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 21.4l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>${p.rating}
            <span style="color:var(--text-subtle);font-weight:500">· ${p.reviews} sharh</span>
          </span>
        </div>
        <div style="display:flex;align-items:baseline;gap:4px;margin-top:10px">
          <span style="font-family:var(--font-mono);font-size:30px;font-weight:600;color:var(--text-strong);letter-spacing:-.02em">${money(p.price)}</span>
          <span style="font-size:15px;color:var(--text-muted)">/${uShort(p.unit)}</span>
          <span style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--text-body)"><span style="width:7px;height:7px;border-radius:50%;background:${p.stockCol}"></span>${p.stockTxt}</span>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:var(--radius-md);background:rgba(255,255,255,.6);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.14)">
        <span style="flex:none;width:42px;height:42px;border-radius:12px;background:linear-gradient(150deg,#7a140d,#510100);color:#ffe9db;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:16px">${p.supplier[0]}</span>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:5px;font-size:14px;font-weight:700;color:var(--text-strong)">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.supplier}</span>
            ${p.verified ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="var(--teal-500)"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.6 1.5-.9 2.9.9 2.9-2.6 1.5-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8L3 16.3l.9-2.9L3 10.5l2.6-1.5 1-2.8 3 .2z"/><path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}
          </div>
          <div style="font-size:12px;color:var(--text-muted)">${p.city} · Tasdiqlangan</div>
        </div>
        <button style="display:flex;align-items:center;gap:6px;height:34px;padding:0 13px;border-radius:var(--radius-sm);border:1px solid var(--glass-border);background:var(--glass-fill-strong);font-size:12.5px;font-weight:600;color:var(--text-strong);cursor:pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v11H8l-4 3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>Xabar
        </button>
      </div>

      <div>
        <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--teal-500);margin-bottom:10px">Tafsilotlar</div>
        <div style="border:1px solid var(--border-hair);border-radius:var(--radius-md);overflow:hidden">
          ${[['Eni', p.width],['Zichlik', p.weight],['Tarkibi', p.comp],['Yetkazish muddati', p.leadLabel],['Minimal buyurtma (MOQ)', p.moqLabel]].map(([k,v],i) => `
          <div style="display:flex;justify-content:space-between;padding:11px 14px;background:${i%2===0?'var(--glass-fill)':'rgba(240,243,252,.45)'};${i>0?'border-top:1px solid var(--border-hair)':''}" >
            <span style="font-size:13px;color:var(--text-muted)">${k}</span>
            <span style="font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--text-strong);text-align:right">${v}</span>
          </div>`).join('')}
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-radius:var(--radius-md);background:rgba(255,255,255,.6);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.14)">
        <span style="font-size:14px;font-weight:700;color:var(--text-strong)">Miqdor</span>
        <div style="display:flex;align-items:center;gap:14px">
          <button onclick="decQty()" style="width:36px;height:36px;border-radius:50%;border:1px solid var(--glass-border);background:var(--glass-fill-strong);display:flex;align-items:center;justify-content:center;color:var(--text-strong);box-shadow:var(--glass-highlight);cursor:pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
          </button>
          <span id="detail-qty" style="font-family:var(--font-mono);font-size:16px;font-weight:600;color:var(--text-strong);min-width:80px;text-align:center">${num(S.qty)} ${uShort(byId(S.selectedId).unit)}</span>
          <button onclick="incQty()" style="width:36px;height:36px;border-radius:50%;border:1px solid transparent;background:linear-gradient(150deg,#8f1a10,#510100);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:var(--shadow-sm);cursor:pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-muted)">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--teal-500)"><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        To'lov yetkazilgunga qadar escrow hisobida saqlanadi
      </div>
    </div>
  </div>`;
}

// ============ EKRAN: QIDIRUV ============
function renderSearch() {
  const q = S.search.trim().toLowerCase();
  const results = q ? PRODUCTS.filter(p => (p.name+p.supplier+p.city).toLowerCase().includes(q)).map(vm) : [];
  const hasSearch = q.length > 0;
  return `
  <div style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:16px">
    <div style="display:flex;align-items:center;gap:10px;height:48px;padding:0 16px;border:1px solid #7a140d;border-radius:var(--radius-md);background:var(--glass-fill-strong);backdrop-filter:var(--blur-md);-webkit-backdrop-filter:var(--blur-md);box-shadow:0 0 0 4px rgba(122,20,13,.2),var(--glass-highlight)">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="color:var(--text-subtle)"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <input id="search-inp" type="text" value="${S.search}" placeholder="Mato yoki kategoriya qidiring" oninput="onSearch(this.value)" autocomplete="off" style="flex:1;border:none;outline:none;background:transparent;font-family:var(--font-sans);font-size:15px;color:var(--text-strong)">
      ${S.search ? `<button onclick="clearSearch()" style="color:var(--text-subtle);background:none;border:none;display:flex;align-items:center;cursor:pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>` : ''}
    </div>

    ${hasSearch ? `
      <div style="display:flex;flex-direction:column;gap:11px">
        ${results.length === 0 ? `
          <div style="text-align:center;padding:40px 20px;display:flex;flex-direction:column;align-items:center;gap:8px">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style="color:var(--ink-300)"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <div style="font-size:15px;font-weight:700;color:var(--text-strong)">Hech narsa topilmadi</div>
            <div style="font-size:13px;color:var(--text-muted)">Boshqa so'z bilan urinib ko'ring</div>
          </div>
        ` : `
          <div style="font-size:12.5px;color:var(--text-muted);font-weight:600">${results.length} natija topildi</div>
          ${results.map(p => searchRow(p)).join('')}
        `}
      </div>
    ` : `
      <div>
        <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-subtle);margin-bottom:11px">So'nggi qidiruvlar</div>
        <div style="display:flex;flex-wrap:wrap;gap:9px;margin-bottom:24px">
          ${RECENT_SEARCHES.map(r => `
            <button onclick="pickSearch('${r}')" style="display:flex;align-items:center;gap:7px;height:36px;padding:0 14px;border-radius:999px;border:1px solid var(--glass-border-soft);background:var(--glass-fill);font-family:var(--font-sans);font-size:13.5px;font-weight:500;color:var(--text-body);cursor:pointer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style="color:var(--text-subtle)"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>${r}
            </button>
          `).join('')}
        </div>
        <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--teal-500);margin-bottom:11px">Tavsiya etiladi</div>
        ${PRODUCTS.slice(0,3).map(p => searchRow(vm(p))).join('')}
      </div>
    `}
  </div>`;
}

function searchRow(p) {
  return `
  <div onclick="openProduct('${p.id}')" style="display:flex;gap:12px;align-items:center;cursor:pointer;padding:10px;border-radius:var(--radius-md);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.12)">
    <span style="flex:none;width:60px;height:60px;border-radius:var(--radius-sm);background:${p.bg};background-size:${p.bgSize}"></span>
    <div style="flex:1;min-width:0">
      <div style="font-family:var(--font-display);font-size:14.5px;font-weight:700;color:var(--text-strong);line-height:1.2">${p.name}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${p.supplier} · ${p.city}</div>
      <div style="margin-top:4px"><span style="font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--text-strong)">${p.priceLabel}</span><span style="font-size:11px;color:var(--text-muted)">/${uShort(p.unit)}</span></div>
    </div>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--text-subtle)"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>`;
}

// ============ EKRAN: SAVAT ============
function renderCart() {
  if (S.cart.length === 0) return `
  <div style="padding:60px 24px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center">
    <span style="width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,.6);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.55);display:flex;align-items:center;justify-content:center;color:var(--ink-300)">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M3 6h18" stroke="currentColor" stroke-width="1.7"/><path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
    </span>
    <div style="font-size:16px;font-weight:700;color:var(--text-strong)">Savat bo'sh</div>
    <div style="font-size:13px;color:var(--text-muted)">Katalogdan mato tanlang</div>
    <button onclick="tab('catalog')" style="margin-top:6px;height:42px;padding:0 22px;border-radius:var(--radius-md);border:none;background:linear-gradient(135deg,#8f1a10,#510100);color:#ffe9db;font-size:14px;font-weight:600;cursor:pointer;box-shadow:var(--shadow-sm)">Katalogga o'tish</button>
  </div>`;

  return `
  <div style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:13px">
    ${S.cart.map(c => {
      const p = vm(byId(c.id));
      return `
      <div style="display:flex;gap:12px;padding:12px;border-radius:var(--radius-md);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.12)">
        <span style="flex:none;width:64px;height:64px;border-radius:var(--radius-sm);background:${p.bg};background-size:${p.bgSize}"></span>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column">
          <div style="display:flex;justify-content:space-between;gap:8px">
            <div style="font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--text-strong);line-height:1.2">${p.name}</div>
            <button onclick="removeCart('${p.id}')" style="flex:none;color:var(--text-subtle);background:none;border:none;cursor:pointer;width:22px;height:22px;display:flex;align-items:center;justify-content:center">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div style="font-size:11.5px;color:var(--text-muted);margin-top:1px">${p.supplier}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:8px">
            <div style="display:flex;align-items:center;gap:10px">
              <button onclick="decCart('${p.id}')" style="width:28px;height:28px;border-radius:8px;border:1px solid var(--glass-border);background:var(--glass-fill-strong);display:flex;align-items:center;justify-content:center;color:var(--text-strong);cursor:pointer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
              </button>
              <span style="font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--text-strong);min-width:60px;text-align:center">${num(c.qty)} ${uShort(p.unit)}</span>
              <button onclick="incCart('${p.id}')" style="width:28px;height:28px;border-radius:8px;border:1px solid var(--glass-border);background:var(--glass-fill-strong);display:flex;align-items:center;justify-content:center;color:var(--text-strong);cursor:pointer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
              </button>
            </div>
            <span style="font-family:var(--font-mono);font-size:15px;font-weight:600;color:var(--text-strong)">${money(p.price * c.qty)}</span>
          </div>
        </div>
      </div>`;
    }).join('')}

    <div style="padding:16px;border-radius:var(--radius-lg);background:var(--glass-fill-strong);backdrop-filter:var(--blur-md);-webkit-backdrop-filter:var(--blur-md);border:1px solid var(--glass-border);box-shadow:var(--glass-shadow)">
      <div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--text-muted);margin-bottom:8px"><span>Oraliq jami</span><span style="font-family:var(--font-mono);font-weight:600;color:var(--text-body)">${money(cartTotal())}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--text-muted);margin-bottom:10px"><span>Yetkazish</span><span style="font-size:12.5px">Alohida hisoblanadi</span></div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;padding-top:10px;border-top:1px solid var(--border-hair)">
        <span style="font-size:15px;font-weight:700;color:var(--text-strong)">Jami</span>
        <span style="font-family:var(--font-mono);font-size:21px;font-weight:600;color:var(--text-strong)">${money(cartTotal())}</span>
      </div>
      <button onclick="navigate('checkout')" style="margin-top:14px;width:100%;height:50px;border-radius:var(--radius-md);border:none;background:linear-gradient(135deg,#8f1a10,#510100);color:#ffe9db;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 10px 26px -10px rgba(81,1,0,.55),inset 0 1px 0 rgba(255,229,210,.2)">Rasmiylashtirish</button>
    </div>
  </div>`;
}

// ============ EKRAN: CHECKOUT ============
function renderCheckout() {
  return `
  <div style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:16px">
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px">
        <span style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--teal-500)">Yetkazib berish manzili</span>
        <button style="font-size:12.5px;font-weight:600;color:var(--teal-600);background:none;border:none;cursor:pointer">O'zgartirish</button>
      </div>
      <div style="display:flex;gap:12px;padding:14px;border-radius:var(--radius-md);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.12)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--color-primary);margin-top:2px"><path d="M12 21s-6-5.7-6-10a6 6 0 0 1 12 0c0 4.3-6 10-6 10z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="11" r="2.2" stroke="currentColor" stroke-width="2"/></svg>
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--text-strong)">${COMPANY.name}</div>
          <div style="font-size:13px;color:var(--text-muted);line-height:1.45;margin-top:2px">${COMPANY.addr}</div>
        </div>
      </div>
    </div>

    <div>
      <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--teal-500);margin-bottom:9px">To'lov usuli</div>
      <div style="display:flex;flex-direction:column;gap:9px">
        ${PAY.map(o => {
          const sel = S.pay === o.key;
          return `<button onclick="setPay('${o.key}')" style="display:flex;align-items:center;gap:12px;width:100%;text-align:left;cursor:pointer;padding:13px 14px;border-radius:var(--radius-md);background:rgba(255,255,255,.55);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1.5px solid ${sel ? 'var(--color-secondary)' : 'var(--border-hair)'};transition:border-color 200ms">
            <div style="flex:none;width:20px;height:20px;border-radius:50%;border:2px solid ${sel ? 'var(--color-secondary)' : 'var(--ink-300)'};display:flex;align-items:center;justify-content:center">
              <div style="width:9px;height:9px;border-radius:50%;background:${sel ? 'var(--color-secondary)' : 'transparent'}"></div>
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
      <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--teal-500);margin-bottom:9px">Izoh</div>
      <textarea placeholder="Buyurtma uchun izoh (ixtiyoriy)" rows="3" style="width:100%;resize:none;padding:12px 14px;border:1px solid var(--border-hair);border-radius:var(--radius-md);background:var(--glass-fill-strong);font-family:var(--font-sans);font-size:14px;color:var(--text-strong);outline:none;box-shadow:var(--glass-highlight)"></textarea>
    </div>

    <div>
      <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--teal-500);margin-bottom:9px">Buyurtma tarkibi</div>
      <div style="padding:14px 16px;border-radius:var(--radius-md);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.12)">
        ${S.cart.map(c => {
          const p = byId(c.id);
          return `<div style="display:flex;justify-content:space-between;gap:10px;font-size:13px;margin-bottom:8px"><span style="color:var(--text-body)">${p.name} · ${num(c.qty)} ${uShort(p.unit)}</span><span style="font-family:var(--font-mono);font-weight:600;color:var(--text-strong);flex:none">${money(p.price * c.qty)}</span></div>`;
        }).join('')}
        <div style="display:flex;justify-content:space-between;align-items:baseline;padding-top:10px;border-top:1px solid var(--border-hair)">
          <span style="font-size:14.5px;font-weight:700;color:var(--text-strong)">Jami</span>
          <span style="font-family:var(--font-mono);font-size:19px;font-weight:600;color:var(--text-strong)">${money(cartTotal())}</span>
        </div>
      </div>
    </div>
  </div>`;
}

// ============ EKRAN: MUVAFFAQIYAT ============
function renderSuccess() {
  return `
  <div style="padding:50px 28px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px">
    <span style="width:88px;height:88px;border-radius:50%;background:linear-gradient(135deg,var(--teal-400),var(--teal-600));display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 10px 30px -8px rgba(17,157,171,.42);animation:pop var(--dur-slow) var(--ease-spring)">
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </span>
    <div style="font-family:var(--font-display);font-size:23px;font-weight:800;color:var(--text-strong);letter-spacing:-.02em">Buyurtma qabul qilindi</div>
    <div style="font-size:14px;color:var(--text-muted);line-height:1.55;max-width:280px">Marg'ilon Ipak Co. 24 soat ichida javob beradi.</div>
    <div style="font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--text-strong);padding:8px 16px;border-radius:999px;background:rgba(255,255,255,.62);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.55)">#LM-2042</div>
    <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:300px;margin-top:14px">
      <button onclick="tab('orders')" style="height:50px;border-radius:var(--radius-md);border:none;background:linear-gradient(135deg,#8f1a10,#510100);color:#ffe9db;font-size:15px;font-weight:600;cursor:pointer;box-shadow:var(--shadow-sm)">Buyurtmalarni ko'rish</button>
      <button onclick="tab('home')" style="height:50px;border-radius:var(--radius-md);border:1px solid var(--glass-border);background:var(--glass-fill-strong);color:var(--text-strong);font-size:15px;font-weight:600;cursor:pointer">Xaridni davom ettirish</button>
    </div>
  </div>`;
}

// ============ EKRAN: BUYURTMALAR ============
function renderOrders() {
  const activeOrders = ORDERS.filter(o => o.statusKey !== 'delivered');
  const pastOrders   = ORDERS.filter(o => o.statusKey === 'delivered');
  const list = S.ordersTab === 'active' ? activeOrders : pastOrders;

  return `
  <div style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:14px">
    <div style="display:flex;gap:4px;padding:4px;border-radius:var(--radius-md);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55)">
      <button onclick="setOrdersTab('active')" style="flex:1;height:36px;border:none;border-radius:var(--radius-sm);font-size:13.5px;font-weight:600;cursor:pointer;background:${S.ordersTab==='active'?'var(--surface-solid)':'transparent'};color:${S.ordersTab==='active'?'var(--text-strong)':'var(--text-muted)'}">Faol</button>
      <button onclick="setOrdersTab('past')" style="flex:1;height:36px;border:none;border-radius:var(--radius-sm);font-size:13.5px;font-weight:600;cursor:pointer;background:${S.ordersTab==='past'?'var(--surface-solid)':'transparent'};color:${S.ordersTab==='past'?'var(--text-strong)':'var(--text-muted)'}">Tarix</button>
    </div>

    ${list.length === 0 ? `<div style="text-align:center;padding:40px;color:var(--text-muted)">Faol buyurtma yo'q</div>` :
    list.map(o => {
      const tone = STATUS_TONE[o.statusKey];
      const [sbg,sfg] = STATUS_COL[tone];
      const lines = o.items.map(it => { const p = byId(it.id); return { name:p.name, bg:PATTERNS[p.pattern], bgSize:pSize(p.pattern), qty:it.qty, unit:uShort(p.unit), total:p.price*it.qty }; });
      const total = o.items.reduce((s,it) => s + byId(it.id).price * it.qty, 0);
      return `
      <div style="padding:14px;border-radius:var(--radius-lg);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.12)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:11px">
          <span style="font-family:var(--font-mono);font-size:13.5px;font-weight:600;color:var(--text-strong)">${o.id}</span>
          <span style="display:inline-flex;align-items:center;height:24px;padding:0 11px;border-radius:999px;font-size:11.5px;font-weight:600;background:${sbg};color:${sfg}">${STATUS_TXT[o.statusKey]}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="position:relative;flex:none;width:52px;height:52px;border-radius:var(--radius-sm);background:${lines[0].bg};background-size:${lines[0].bgSize}">
            ${lines.length>1 ? `<span style="position:absolute;right:-6px;bottom:-6px;min-width:24px;height:24px;padding:0 6px;border-radius:999px;background:var(--ink-900);color:#fff;font-family:var(--font-mono);font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;border:2px solid #fff">+${lines.length-1}</span>` : ''}
          </span>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:700;color:var(--text-strong);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${lines[0].name}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${lines.length} tur · ${o.date}</div>
          </div>
          <span style="font-family:var(--font-mono);font-size:15px;font-weight:600;color:var(--text-strong)">${money(total)}</span>
        </div>
        ${o.statusKey!=='delivered' ? `
        <div style="display:flex;gap:9px;margin-top:13px">
          <button style="flex:1;height:38px;border-radius:var(--radius-sm);border:1px solid var(--glass-border);background:var(--glass-fill-strong);font-size:13px;font-weight:600;color:var(--text-strong);cursor:pointer">Kuzatish</button>
          <button style="flex:1;height:38px;border-radius:var(--radius-sm);border:none;background:linear-gradient(135deg,#8f1a10,#510100);font-size:13px;font-weight:600;color:#ffe9db;cursor:pointer">Qayta buyurtma</button>
        </div>` : ''}
      </div>`;
    }).join('')}
  </div>`;
}

// ============ EKRAN: PROFIL ============
function renderProfile() {
  const ordersCount = ORDERS.length;
  return `
  <div style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:14px">
    <div style="display:flex;align-items:center;gap:14px;padding:18px;border-radius:var(--radius-lg);background:var(--glass-fill-strong);backdrop-filter:var(--blur-md);-webkit-backdrop-filter:var(--blur-md);border:1px solid var(--glass-border);box-shadow:var(--glass-shadow)">
      <span style="flex:none;width:58px;height:58px;border-radius:18px;background:linear-gradient(150deg,#7a140d,#510100);color:#ffe9db;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:22px">${COMPANY.initials}</span>
      <div style="flex:1;min-width:0">
        <div style="font-family:var(--font-display);font-size:17px;font-weight:700;color:var(--text-strong);letter-spacing:-.01em">${COMPANY.name}</div>
        <div style="font-size:12.5px;color:var(--text-muted);margin-top:2px">${COMPANY.role} · ${COMPANY.since}</div>
      </div>
      <button style="flex:none;width:36px;height:36px;border-radius:10px;border:1px solid var(--glass-border);background:var(--glass-fill);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-body)">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 20h4L18 10l-4-4L4 16v4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 6l4 4" stroke="currentColor" stroke-width="2"/></svg>
      </button>
    </div>

    <div style="display:flex;flex-direction:column;border:1px solid rgba(255,255,255,.55);border-radius:var(--radius-md);overflow:hidden;background:rgba(255,255,255,.6);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);box-shadow:0 5px 16px -12px rgba(81,1,0,.12)">
      <div style="display:flex;align-items:center;gap:12px;padding:14px;border-bottom:1px solid var(--border-hair)">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--text-muted)"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        <span style="font-size:14px;color:var(--text-body)">${COMPANY.phone}</span>
      </div>
      <div style="display:flex;align-items:center;gap:12px;padding:14px">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--text-muted)"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M4 7l8 6 8-6" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        <span style="font-size:14px;color:var(--text-body)">${COMPANY.email}</span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div style="padding:16px;border-radius:var(--radius-md);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);text-align:center">
        <div style="font-family:var(--font-mono);font-size:26px;font-weight:600;color:var(--text-strong)">${ordersCount}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px">buyurtma</div>
      </div>
      <div style="padding:16px;border-radius:var(--radius-md);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);text-align:center">
        <div style="font-family:var(--font-mono);font-size:26px;font-weight:600;color:var(--text-strong)">$${(ORDERS.reduce((s,o)=>s+o.items.reduce((ss,it)=>ss+byId(it.id).price*it.qty,0),0)).toLocaleString('en-US',{maximumFractionDigits:0})}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px">jami xarid</div>
      </div>
    </div>

    <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-subtle);margin-top:4px">Sozlamalar</div>
    <div style="display:flex;flex-direction:column;border:1px solid rgba(255,255,255,.55);border-radius:var(--radius-md);overflow:hidden;background:rgba(255,255,255,.6);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);box-shadow:0 5px 16px -12px rgba(81,1,0,.12)">
      ${[['Bildirishnomalar','bell'],['Yordam markazi','help-circle'],['Chiqish','log-out']].map(([label,icon],i) => `
        <button style="display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:13px 14px;${i>0?'border-top:1px solid var(--border-hair)':''}background:none;cursor:pointer;font-family:var(--font-sans);font-size:14px;${label==='Chiqish'?'color:var(--danger-500)':'color:var(--text-body)'}">
          <span>${label}</span>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style="color:var(--text-subtle)"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>`).join('')}
    </div>
  </div>`;
}

// ============ MAHSULOT KARTA ============
function productCard(p, showLike) {
  return `
  <div onclick="openProduct('${p.id}')" style="cursor:pointer;background:var(--glass-fill);backdrop-filter:var(--blur-lg);-webkit-backdrop-filter:var(--blur-lg);border:1px solid var(--glass-border-soft);border-radius:var(--radius-lg);box-shadow:0 6px 16px -12px rgba(81,1,0,.14),0 1px 2px rgba(23,26,48,.04);overflow:hidden;display:flex;flex-direction:column">
    <div style="position:relative;height:104px;background:${p.bg};background-size:${p.bgSize}">
      ${p.badgeShow ? `<span style="position:absolute;top:8px;left:8px;display:inline-flex;align-items:center;height:22px;padding:0 9px;border-radius:999px;font-size:11px;font-weight:600;background:${p.badgeBg};color:${p.badgeFg}">${p.badge}</span>` : ''}
      ${showLike ? `
        <button onclick="event.stopPropagation();toggleLike('${p.id}')" style="position:absolute;top:8px;right:8px;width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,.6);background:rgba(255,255,255,.42);backdrop-filter:blur(10px) saturate(160%);-webkit-backdrop-filter:blur(10px) saturate(160%);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px -2px rgba(23,26,48,.22),inset 0 1px 0 rgba(255,255,255,.8)">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="${p.heartFill}" style="color:${p.heartStroke}"><path d="M12 21s-7-4.5-9.2-8.4C1.2 9.6 2.6 6 6 6c2 0 3.2 1.2 4 2.3C10.8 7.2 12 6 14 6c3.4 0 4.8 3.6 3.2 6.6C19 16.5 12 21 12 21z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        </button>` : ''}
    </div>
    <div style="padding:11px 12px 13px;display:flex;flex-direction:column;gap:4px;flex:1">
      <div style="font-family:var(--font-display);font-size:13.5px;font-weight:700;color:var(--text-strong);line-height:1.2;letter-spacing:-.01em">${p.name}</div>
      <div style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--text-muted)">
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.supplier}</span>
        ${p.verified ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="var(--teal-500)" style="flex:none"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.6 1.5-.9 2.9.9 2.9-2.6 1.5-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8L3 16.3l.9-2.9L3 10.5l2.6-1.5 1-2.8 3 .2z"/><path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}
      </div>
      <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-subtle)">${p.meta}</div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:auto;padding-top:5px">
        <span><span style="font-family:var(--font-mono);font-size:15.5px;font-weight:600;color:var(--text-strong)">${p.priceLabel}</span><span style="font-size:10.5px;color:var(--text-muted)">/${uShort(p.unit)}</span></span>
        <button onclick="event.stopPropagation();addToCart('${p.id}',${p.moq})" style="flex:none;width:28px;height:28px;border-radius:50%;border:1px solid var(--glass-border);background:var(--glass-fill-strong);color:var(--text-strong);display:flex;align-items:center;justify-content:center;box-shadow:var(--glass-highlight);cursor:pointer">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>
  </div>`;
}

// ============ INTERAKSIYALAR ============
function toggleLike(id) {
  S.liked[id] = !S.liked[id];
  if (S.liked[id]) showToast("Sevimlilarga qo'shildi");
  render();
}
function selectCat(c) { S.cat = c; document.getElementById('screen-wrap').innerHTML = renderCatalog(); }
function setPay(p) { S.pay = p; document.getElementById('screen-wrap').innerHTML = renderCheckout(); }
function setOrdersTab(t) { S.ordersTab = t; document.getElementById('screen-wrap').innerHTML = renderOrders(); }
function onSearch(v) {
  S.search = v;
  document.getElementById('screen-wrap').innerHTML = renderSearch();
  const inp = document.getElementById('search-inp');
  if (inp) { inp.focus(); const l=inp.value.length; inp.setSelectionRange(l,l); }
}
function clearSearch() { S.search=''; document.getElementById('screen-wrap').innerHTML=renderSearch(); document.getElementById('search-inp')?.focus(); }
function pickSearch(v) { S.search=v; document.getElementById('screen-wrap').innerHTML=renderSearch(); }

function mainBtnAction() {
  if (S.screen === 'detail') {
    addToCart(S.selectedId, S.qty);
    tab('cart');
  } else if (S.screen === 'checkout') {
    S.cart = [];
    S.screen = 'success';
    S.history = [];
    render();
  }
}

// ============ ASOSIY RENDER ============
function render() {
  updateHeader();
  updateNav();

  const map = {
    home: renderHome, catalog: renderCatalog, detail: renderDetail,
    search: renderSearch, cart: renderCart, checkout: renderCheckout,
    success: renderSuccess, orders: renderOrders, profile: renderProfile,
  };
  const fn = map[S.screen];
  if (fn) document.getElementById('screen-wrap').innerHTML = fn();
}

// ============ ISHGA TUSHIRISH ============
if (window.Telegram?.WebApp) {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
}
render();
