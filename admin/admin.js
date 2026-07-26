// Admin panel — /api/admin/summary orqali real ma'lumot (buyurtmalar, kategoriyalar,
// moderatsiya/sotuvchi arizalari SONI). Parol client-side EMAS — server ADMIN_PANEL_TOKEN
// bilan tekshiradi (X-Admin-Token header).
//
// DIZAYN BOSQICHI: GMV, komissiya, sotuvchilar ro'yxati, arizalar ro'yxati va moderatsiya
// navbati uchun backend endi'cha ro'yxat qaytarmaydi — shu qismlar quyidagi MOCK_* bilan
// vizual maqsadda to'ldirilgan. Backend ulanganda faqat shu bloklarni almashtirish kifoya.

const CAT_LABELS = {
  ikat: "Ikat va adras",
  suzani: "So'zana",
  silk: 'Ipak',
  cotton: 'Paxta',
  wool: 'Jun',
  linen: "Zig'ir",
};

const CAT_COLORS = ['#8f1a10', '#C9362D', '#E84B40', '#D98E0C', '#119DAB', '#54D7E1'];

const STATUS_LABELS = {
  pending:   { text: 'Yangi',         cls: 'status-new',     color: '#D98E0C' },
  confirmed: { text: 'Tasdiqlangan',  cls: 'status-done',    color: '#1FA971' },
  shipped:   { text: "Yo'lda",        cls: 'status-pending', color: '#119DAB' },
  delivered: { text: 'Yetkazildi',    cls: 'status-done',    color: '#1FA971' },
  cancelled: { text: 'Bekor qilindi', cls: 'status-new',     color: '#E5484D' },
};

/* ═══════════════════════ Mock — dizayn bosqichi ═══════════════════════ */

const MOCK_GMV_TOTAL = 84500000;
const MOCK_GMV_TREND = [38, 52, 45, 61, 58, 74, 90]; // nisbiy qiymatlar, so'nggi 7 kun
const MOCK_GMV_DAYS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sh', 'Ya'];
const MOCK_COMMISSION_TOTAL = 9800000;
const MOCK_ORDERS_THIS_MONTH = 342;

const MOCK_VISITORS_TODAY = 612;
const MOCK_VISITORS_MONTH = 12480;
const MOCK_VISITORS_TREND = [1240, 1380, 1510, 1290, 1670, 1840, 1960]; // kunlik tashriflar
const MOCK_BUYERS_TODAY = 24;
const MOCK_BUYERS_MONTH = 210;
const MOCK_BUYERS_TREND = [22, 28, 19, 31, 27, 35, 40]; // kunlik noyob xaridorlar
const MOCK_WEEK_DAYS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sh', 'Ya'];

const MOCK_APPLICATIONS = [
  { name: "Aziz Rahimov", business: "Marg'ilon ipak ustaxonasi", phone: '+998 90 123 45 67', category: 'Ipak', date: '2 soat oldin' },
  { name: 'Dilnoza Yusupova', business: "Namangan to'qimachilik", phone: '+998 91 234 56 78', category: "So'zana", date: '5 soat oldin' },
  { name: 'Bahodir Karimov', business: "Buxoro adras sexi", phone: '+998 93 345 67 89', category: 'Ikat va adras', date: 'Kecha' },
];

const MOCK_SELLERS = [
  { name: "Farrux To'xtayev", phone: '+998 90 111 22 33', products: 24, rating: 4.8, joined: '2026-03-12' },
  { name: 'Malika Ergasheva', phone: '+998 93 222 33 44', products: 17, rating: 4.6, joined: '2026-04-02' },
  { name: 'Jasur Nazarov', phone: '+998 94 333 44 55', products: 31, rating: 4.9, joined: '2026-02-20' },
  { name: 'Shahnoza Qodirova', phone: '+998 97 444 55 66', products: 9,  rating: 4.5, joined: '2026-05-18' },
];

const MOCK_MOD_QUEUE = [
  { name: "Ikat rulon — an'anaviy naqsh", seller: 'Farrux To\'xtayev', price: '185 000 so\'m/rulon', date: '1 soat oldin', img: '../Photo/textile/186e363817f29c3d01029ef64db8aae6.jpg' },
  { name: "So'zana qo'lda tikilgan", seller: 'Malika Ergasheva', price: '420 000 so\'m/rulon', date: '3 soat oldin', img: '../Photo/textile/2563ba9a9ee78e0305adc5ab277db180.jpg' },
  { name: 'Ipak atlas — yorqin rang', seller: 'Jasur Nazarov', price: '260 000 so\'m/rulon', date: '4 soat oldin', img: '../Photo/textile/3b60658c5d1d11daaa938e227d976395.jpg' },
  { name: "Paxta mato — oq", seller: 'Shahnoza Qodirova', price: '95 000 so\'m/rulon', date: 'Kecha', img: '../Photo/textile/668f7de0e14d13ef96a6a44b2b4c51ba.jpg' },
];

/* ═══════════════════════════════════════════════════════════════════ */

let lastOrders = [];
let lastCategories = [];

function fmtSom(n) {
  return Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ') + " so'm";
}

async function fetchSummary(token) {
  const res = await fetch('/api/admin/summary', { headers: { 'X-Admin-Token': token } });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || !data.ok) throw new Error('unauthorized');
  return data.data;
}

async function checkPassword() {
  const input = document.getElementById('passwordInput');
  const btn = document.getElementById('loginBtn');
  const token = input.value.trim();
  document.getElementById('loginError').style.display = 'none';
  if (!token) return;

  btn.disabled = true;
  btn.textContent = '...';
  try {
    const summary = await fetchSummary(token);
    sessionStorage.setItem('adminToken', token);
    renderSummary(summary);
    showDashboard();
  } catch (e) {
    document.getElementById('loginError').style.display = 'block';
    input.value = '';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Kirish';
  }
}

document.getElementById('passwordInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkPassword();
});

function logout() {
  sessionStorage.removeItem('adminToken');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('passwordInput').value = '';
}

function showDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
}

/* ─── Render: umumiy ─── */

function renderSummary(d) {
  lastOrders = d.recentOrders || [];
  lastCategories = d.categories || [];

  renderStats(d);
  renderRevenueChart();
  renderVisitorStats();

  const activeFilter = document.querySelector('.order-filter.active');
  renderOrders(activeFilter ? activeFilter.dataset.filter : 'all');
  renderOrdersMini();

  renderCategories(lastCategories);
  renderCatList(lastCategories);
  renderStatusDist();

  renderApplications();
  renderSellers();
  renderModQueue();

  updateNavBadges(d);
}

function renderStats(d) {
  document.getElementById('statOrdersTotal').textContent = MOCK_ORDERS_THIS_MONTH.toLocaleString('ru-RU').replace(/,/g, ' ');
  document.getElementById('statOrdersToday').textContent = `${d.ordersToday} bugun`;
  document.getElementById('statGmv').textContent = fmtSom(MOCK_GMV_TOTAL);
  document.getElementById('statCommission').textContent = fmtSom(MOCK_COMMISSION_TOTAL);
  document.getElementById('statModeration').textContent = d.moderationPending;
  document.getElementById('statSellerApps').textContent = `${d.sellerAppsPending} yangi ariza`;
  document.getElementById('revenueTotal').textContent = fmtSom(MOCK_GMV_TOTAL);
}

function updateNavBadges(d) {
  setBadge('navBadgeOrders', (d.recentOrders || []).filter((o) => o.status === 'pending').length);
  setBadge('navBadgeSellers', d.sellerAppsPending);
  setBadge('navBadgeModeration', d.moderationPending);
}

function setBadge(id, count) {
  const el = document.getElementById(id);
  if (!count) { el.classList.remove('show'); return; }
  el.textContent = count > 99 ? '99+' : count;
  el.classList.add('show');
}

/* ─── Orders ─── */

function orderRow(o) {
  const st = STATUS_LABELS[o.status] || { text: o.status || '?', cls: 'status-pending' };
  return `
    <tr>
      <td class="order-id">${o.id}</td>
      <td>${o.buyerName || "Noma'lum"}</td>
      <td class="order-type">${o.itemsCount} ta mahsulot</td>
      <td class="order-date">${o.date ? o.date.uz : '-'}</td>
      <td><span class="status-badge ${st.cls}">${st.text}</span></td>
    </tr>`;
}

function renderOrders(filter) {
  const list = filter === 'all' ? lastOrders : lastOrders.filter((o) => o.status === filter);
  document.getElementById('orderCount').textContent = list.length + ' ta';
  const tbody = document.getElementById('ordersBody');
  tbody.innerHTML = list.length
    ? list.map(orderRow).join('')
    : `<tr><td colspan="5" class="empty-cell">Buyurtma topilmadi</td></tr>`;
}

function renderOrdersMini() {
  const tbody = document.getElementById('ordersBodyMini');
  const list = lastOrders.slice(0, 5);
  tbody.innerHTML = list.length
    ? list.map(orderRow).join('')
    : `<tr><td colspan="5" class="empty-cell">Buyurtma topilmadi</td></tr>`;
}

document.querySelectorAll('.order-filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.order-filter').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    renderOrders(btn.dataset.filter);
  });
});

/* ─── Categories ─── */

function renderCategories(categories) {
  const grid = document.getElementById('chartGrid');
  if (!categories.length) {
    grid.innerHTML = `<div class="empty-panel">Nashr etilgan mahsulot yo'q</div>`;
    return;
  }
  const top = categories.slice(0, 6);
  const max = Math.max(...top.map((c) => c.count));
  grid.innerHTML = top.map((c) => `
    <div class="chart-item">
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="height:${max ? Math.round((c.count / max) * 100) : 0}%"></div>
      </div>
      <div class="chart-num">${c.count}</div>
      <div class="chart-label">${CAT_LABELS[c.catKey] || c.catKey}</div>
    </div>
  `).join('');
}

function renderCatList(categories) {
  const wrap = document.getElementById('catList');
  if (!categories.length) {
    wrap.innerHTML = `<div class="empty-panel">Ma'lumot yo'q</div>`;
    return;
  }
  const top = categories.slice(0, 6);
  const max = Math.max(...top.map((c) => c.count));
  wrap.innerHTML = top.map((c, i) => `
    <div class="cat-row">
      <span class="cat-swatch" style="background:${CAT_COLORS[i % CAT_COLORS.length]}"></span>
      <div class="cat-info">
        <div class="cat-name">${CAT_LABELS[c.catKey] || c.catKey}</div>
        <div class="cat-bar-wrap"><div class="cat-bar" style="width:${max ? Math.round((c.count / max) * 100) : 0}%;background:${CAT_COLORS[i % CAT_COLORS.length]}"></div></div>
      </div>
      <span class="cat-count">${c.count}</span>
    </div>
  `).join('');
}

/* ─── Revenue chart (SVG, silliq chiziq) ─── */

function smoothPath(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const mx = (x0 + x1) / 2;
    d += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

function renderLineChart(chartElId, axisElId, data, days, color, gradId) {
  const el = document.getElementById(chartElId);
  const axis = document.getElementById(axisElId);
  const w = 560, h = 150, pad = 8;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);

  const points = data.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return [x, y];
  });

  const linePath = smoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1][0]} ${h} L ${points[0][0]} ${h} Z`;
  const last = points[points.length - 1];

  el.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.28" />
          <stop offset="100%" stop-color="${color}" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path d="${areaPath}" fill="url(#${gradId})" />
      <path d="${linePath}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="${last[0]}" cy="${last[1]}" r="4.5" fill="${color}" stroke="#fff" stroke-width="2" />
    </svg>
  `;
  axis.innerHTML = days.map((d) => `<span>${d}</span>`).join('');
}

function renderRevenueChart() {
  renderLineChart('revenueChart', 'revenueAxis', MOCK_GMV_TREND, MOCK_GMV_DAYS, '#8f1a10', 'gmvFill');
}

function renderVisitorStats() {
  document.getElementById('statVisitors').textContent = MOCK_VISITORS_MONTH.toLocaleString('ru-RU').replace(/,/g, ' ');
  document.getElementById('statVisitorsToday').textContent = `${MOCK_VISITORS_TODAY} bugun`;
  document.getElementById('statBuyers').textContent = MOCK_BUYERS_MONTH.toLocaleString('ru-RU').replace(/,/g, ' ');
  document.getElementById('statBuyersToday').textContent = `${MOCK_BUYERS_TODAY} bugun`;
  document.getElementById('statConversion').textContent = ((MOCK_BUYERS_MONTH / MOCK_VISITORS_MONTH) * 100).toFixed(1) + '%';
  document.getElementById('visitorsTotal').textContent = MOCK_VISITORS_MONTH.toLocaleString('ru-RU').replace(/,/g, ' ') + ' tashrif';
  document.getElementById('buyersTotal').textContent = MOCK_BUYERS_MONTH.toLocaleString('ru-RU').replace(/,/g, ' ') + ' xaridor';

  renderLineChart('visitorsChart', 'visitorsAxis', MOCK_VISITORS_TREND, MOCK_WEEK_DAYS, '#119DAB', 'visitorsFill');
  renderLineChart('buyersChart', 'buyersAxis', MOCK_BUYERS_TREND, MOCK_WEEK_DAYS, '#D98E0C', 'buyersFill');
}

/* ─── Status distribution (haqiqiy buyurtmalardan hisoblanadi) ─── */

function renderStatusDist() {
  const wrap = document.getElementById('statusDist');
  if (!lastOrders.length) {
    wrap.innerHTML = `<div class="empty-panel">Buyurtma yo'q</div>`;
    return;
  }
  const counts = {};
  lastOrders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
  const max = Math.max(...Object.values(counts));
  wrap.innerHTML = Object.keys(STATUS_LABELS).map((key) => {
    const st = STATUS_LABELS[key];
    const count = counts[key] || 0;
    return `
      <div class="status-dist-row">
        <span class="status-dist-label">${st.text}</span>
        <div class="status-dist-bar-wrap"><div class="status-dist-bar" style="width:${max ? Math.round((count / max) * 100) : 0}%;background:${st.color}"></div></div>
        <span class="status-dist-val">${count}</span>
      </div>`;
  }).join('');
}

/* ─── Sellers / applications (mock) ─── */

function initials(name) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

function renderApplications() {
  document.getElementById('applicationsCount').textContent = MOCK_APPLICATIONS.length + ' ta';
  document.getElementById('applicationsGrid').innerHTML = MOCK_APPLICATIONS.map((a) => `
    <div class="app-card glass">
      <div class="app-card-head">
        <div class="app-avatar">${initials(a.name)}</div>
        <div>
          <div class="app-name">${a.name}</div>
          <div class="app-meta">${a.date}</div>
        </div>
      </div>
      <div class="app-details">
        <div class="app-detail-row"><span>Korxona</span><span>${a.business}</span></div>
        <div class="app-detail-row"><span>Telefon</span><span>${a.phone}</span></div>
        <div class="app-detail-row"><span>Kategoriya</span><span>${a.category}</span></div>
      </div>
      <div class="app-actions">
        <button class="btn-approve">Tasdiqlash</button>
        <button class="btn-reject">Rad etish</button>
      </div>
    </div>
  `).join('');
}

function renderSellers() {
  document.getElementById('sellersCount').textContent = MOCK_SELLERS.length + ' ta';
  document.getElementById('sellersBody').innerHTML = MOCK_SELLERS.map((s) => `
    <tr>
      <td class="order-product">${s.name}</td>
      <td class="order-type">${s.phone}</td>
      <td class="order-type">${s.products} ta</td>
      <td class="order-type">★ ${s.rating}</td>
      <td class="order-date">${s.joined}</td>
    </tr>
  `).join('');
}

/* ─── Moderation queue (mock) ─── */

function renderModQueue() {
  document.getElementById('modQueueCount').textContent = MOCK_MOD_QUEUE.length + ' ta';
  document.getElementById('modGrid').innerHTML = MOCK_MOD_QUEUE.map((m) => `
    <div class="mod-card glass">
      <img class="mod-thumb" src="${m.img}" alt="${m.name}" />
      <div class="mod-body">
        <div class="mod-name">${m.name}</div>
        <div class="mod-meta">${m.seller} · ${m.date}</div>
        <div class="mod-price">${m.price}</div>
        <div class="mod-actions">
          <button class="btn-approve">Nashr</button>
          <button class="btn-reject">Rad</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ─── Sidebar navigatsiya ─── */

const PAGE_META = {
  dashboard:  { title: 'Dashboard',   subtitle: 'Umumiy ko\'rinish' },
  orders:     { title: 'Buyurtmalar', subtitle: 'Barcha buyurtmalar va holatlar' },
  sellers:    { title: 'Sotuvchilar', subtitle: 'Arizalar va tasdiqlangan sotuvchilar' },
  moderation: { title: 'Moderatsiya', subtitle: 'Nashr navbati' },
  stats:      { title: 'Statistika',  subtitle: "Tashriflar, buyurtmalar va kategoriya tahlili" },
};

function goToPage(page) {
  if (!PAGE_META[page]) return;
  document.querySelectorAll('.nav-item[data-page]').forEach((b) => b.classList.toggle('active', b.dataset.page === page));
  document.querySelectorAll('.page').forEach((p) => p.classList.toggle('active', p.id === `page-${page}`));
  document.getElementById('pageTitle').textContent = PAGE_META[page].title;
  document.getElementById('pageSubtitle').textContent = PAGE_META[page].subtitle;
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

document.querySelectorAll('[data-page]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    goToPage(el.dataset.page);
  });
});

// Sessiyada saqlangan kalit bo'lsa — avtomatik kirish
const savedToken = sessionStorage.getItem('adminToken');
if (savedToken) {
  fetchSummary(savedToken)
    .then((summary) => { renderSummary(summary); showDashboard(); })
    .catch(() => sessionStorage.removeItem('adminToken'));
}
