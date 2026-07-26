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

/* ═══════════════ Reja (future/lolamarket-future.html'dan) ═══════════════
   Manba: LolaMarketning tasdiqlangan 12 oylik savdo rejasi, Sentabrdan
   boshlab qayta tartiblangan (kunlik sotuv 5 → 80 birlikkacha o'sadi, ~12%
   komissiya marjasi bilan). Iyul va Avgust uchun haqiqiy reja yo'q — naqsh
   davomiga ko'ra taxminiy hisoblab qo'shilgan (PLAN_ESTIMATED). Summalar
   manbadagi kabi $ da — hozircha so'mdagi haqiqiy GMV bilan bevosita
   solishtirilmaydi, faqat reja ko'lamini ko'rsatish uchun. */

const PLAN_MONTHS = ['Sentabr', 'Oktabr', 'Noyabr', 'Dekabr', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust'];
const PLAN_UNITS_PER_DAY = [5, 15, 25, 35, 45, 55, 55, 45, 55, 80, 55, 30];
const PLAN_UNITS_PER_MONTH = [150, 450, 750, 1050, 1350, 1650, 1650, 1350, 1650, 2400, 1650, 900];
const PLAN_ESTIMATED = [false, false, false, false, false, false, false, false, false, false, true, true];
const PLAN_PRICE_PER_UNIT = 82; // $, manbadagi o'rtacha chek
const PLAN_COMMISSION_RATE = 0.12;
const USD_TO_SOM = 12600; // reja $ da, fakt so'mda — grafikda solishtirish uchun

function fmtUsd(n) {
  return '$' + Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ');
}

// Reja Sentabrdan boshlanadi (indeks 0) — joriy kalendar oyni shu siklga moslaydi
function currentPlanIndex() {
  const realMonth = new Date().getMonth(); // 0 = Yanvar ... 8 = Sentabr
  return (realMonth - 8 + 12) % 12;
}

function renderPlanFakt(d) {
  const idx = currentPlanIndex();
  const planUnitsDay = PLAN_UNITS_PER_DAY[idx];
  const faktOrdersToday = d && typeof d.ordersToday === 'number' ? d.ordersToday : 0;

  document.getElementById('pfPlanUnitsDay').textContent = planUnitsDay;
  document.getElementById('pfPlanMonth').textContent = PLAN_MONTHS[idx] + (PLAN_ESTIMATED[idx] ? ' (taxminiy)' : '');
  document.getElementById('pfFaktOrdersToday').textContent = faktOrdersToday;

  const pct = planUnitsDay ? Math.round((faktOrdersToday / planUnitsDay) * 100) : 0;
  document.getElementById('pfBajarilish').textContent = pct + '%';

  const tbody = document.getElementById('planBody');
  tbody.innerHTML = PLAN_MONTHS.map((name, i) => {
    const gmv = PLAN_UNITS_PER_MONTH[i] * PLAN_PRICE_PER_UNIT;
    const commission = gmv * PLAN_COMMISSION_RATE;
    const star = PLAN_ESTIMATED[i] ? ' *' : '';
    const current = i === idx ? ' style="font-weight:700"' : '';
    return `
      <tr${current}>
        <td>${name}${star}</td>
        <td>${PLAN_UNITS_PER_DAY[i]}</td>
        <td>${PLAN_UNITS_PER_MONTH[i].toLocaleString('ru-RU').replace(/,/g, ' ')}</td>
        <td>${fmtUsd(PLAN_PRICE_PER_UNIT)}</td>
        <td>${fmtUsd(gmv)}</td>
        <td>${fmtUsd(commission)}</td>
      </tr>`;
  }).join('');
}

/* ═══════════ Kunlik seriya: reja (tekis taqsimot) + fakt (mock) ═══════════
   Reja kunlik qiymati = oylik reja / o'sha oydagi kunlar soni (tekis taqsimot,
   founder qarori). 30 kunlik oyna ikki kalendar oyni qamrasa, reja chizig'i oy
   chegarasida pog'ona ko'rinishida o'zgaradi — bu ataylab shunday.
   FAKT hozircha MOCK: backend'da kunlik GMV agregatsiyasi qo'shilgach
   buildDailySeries()dagi `fakt` maydonini real ma'lumotga almashtirish kifoya. */

const CHART_DAYS = 30;

function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function planSomForDate(date) {
  const i = (date.getMonth() - 8 + 12) % 12; // reja Sentabrdan boshlanadi
  return (PLAN_UNITS_PER_MONTH[i] / daysInMonth(date)) * PLAN_PRICE_PER_UNIT * USD_TO_SOM;
}

function buildDailySeries() {
  const today = new Date();
  // Deterministik generator — sahifa har yuklanganda grafik bir xil ko'rinsin
  let seed = 20260726;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };

  // Fakt uchun bazis — joriy oyning kunlik rejasi. Ataylab kunlik rejaga bog'lanmagan:
  // oy chegarasida reja pog'ona bo'lib sakraydi va fakt chizig'i ham "jar" bo'lib tushardi.
  const base = planSomForDate(today);

  const out = [];
  for (let i = CHART_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const k = CHART_DAYS - 1 - i;        // 0 → 29
    const t = k / (CHART_DAYS - 1);      // 0 → 1, yengil o'sish trendi
    // Sinus to'lqin + kichik shovqin: chiziq "tishli" emas, oqib turadigan ko'rinishda
    const ratio = Math.max(0.4, 0.66 + t * 0.30 + Math.sin(k / 4.2) * 0.055 + (rnd() - 0.5) * 0.05);
    out.push({ date: d, plan: planSomForDate(d), fakt: Math.round(base * ratio) });
  }
  return out;
}

const DAILY_SERIES = buildDailySeries();
const SERIES_FAKT_TOTAL = DAILY_SERIES.reduce((s, p) => s + p.fakt, 0);
const SERIES_PLAN_TOTAL = DAILY_SERIES.reduce((s, p) => s + p.plan, 0);

/* ═══════════════════════════════════════════════════════════════════ */

let lastOrders = [];
let lastCategories = [];

function fmtSom(n) {
  return Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ') + " so'm";
}

// Katta summalarni ixcham ko'rsatish: 1 240 000 000 → 1.24 mlrd so'm
function fmtSomShort(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2).replace('.', ',') + ' mlrd';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.', ',') + ' mln';
  return Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ');
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
  renderPlanGauge();
  renderWeekBars();
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
  renderPlanFakt(d);

  updateNavBadges(d);
}

function renderStats(d) {
  // GMV/komissiya/buyurtma soni kunlik seriyadan hisoblanadi — grafik bilan mos bo'lsin
  const orders = Math.round(SERIES_FAKT_TOTAL / (PLAN_PRICE_PER_UNIT * USD_TO_SOM));
  document.getElementById('statOrdersTotal').textContent = orders.toLocaleString('ru-RU').replace(/,/g, ' ');
  document.getElementById('statOrdersToday').textContent = `${d.ordersToday} bugun`;
  document.getElementById('statGmv').textContent = fmtSomShort(SERIES_FAKT_TOTAL) + " so'm";
  document.getElementById('statCommission').textContent = fmtSomShort(SERIES_FAKT_TOTAL * PLAN_COMMISSION_RATE) + " so'm";
  document.getElementById('statModeration').textContent = d.moderationPending;
  document.getElementById('statSellerApps').textContent = `${d.sellerAppsPending} yangi ariza`;
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

// Dashboard'da so'nggi buyurtmalar jadval emas — kartochkalarda ko'rsatiladi
function renderOrdersMini() {
  const wrap = document.getElementById('orderCardsMini');
  const list = lastOrders.slice(0, 4);
  if (!list.length) {
    wrap.innerHTML = `<div class="empty-panel">Buyurtma topilmadi</div>`;
    return;
  }
  wrap.innerHTML = list.map((o) => {
    const st = STATUS_LABELS[o.status] || { text: o.status || '?', cls: 'status-pending' };
    const name = o.buyerName || "Noma'lum";
    return `
      <div class="order-card">
        <div class="oc-top">
          <span class="oc-id">${o.id}</span>
          <span class="status-badge ${st.cls}">${st.text}</span>
        </div>
        <div class="oc-buyer">
          <span class="oc-avatar">${initials(name)}</span>
          <span class="oc-name">${name}</span>
        </div>
        <div class="oc-foot">
          <span>${o.itemsCount} ta mahsulot</span>
          <span>${o.date ? o.date.uz : '-'}</span>
        </div>
      </div>`;
  }).join('');
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

/* ─── Hero combo chart: kunlik fakt ustunlari + reja chizig'i ─── */

const MONTHS_SHORT = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
function fmtDay(d) {
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

function renderRevenueChart() {
  const el = document.getElementById('revenueChart');
  const axis = document.getElementById('revenueAxis');
  const tip = document.getElementById('chartTip');
  const s = DAILY_SERIES;

  const w = 720, h = 260, padT = 16, padB = 8;
  const innerH = h - padT - padB;
  const max = Math.max(...s.map((p) => p.fakt)) * 1.12 || 1;
  const slot = w / s.length;
  const y = (v) => padT + (1 - v / max) * innerH;

  // FAKT — silliq chiziq + gradient to'ldirish (Statistika sahifasidagi grafik uslubi)
  const faktPts = s.map((p, i) => [i * slot + slot / 2, y(p.fakt)]);
  const faktLine = smoothPath(faktPts);
  const faktArea = `${faktLine} L ${faktPts[faktPts.length - 1][0].toFixed(1)} ${h} L ${faktPts[0][0].toFixed(1)} ${h} Z`;
  const faktEnd = faktPts[faktPts.length - 1];

  const hits = s.map((p, i) =>
    `<rect class="col-hit" x="${(i * slot).toFixed(1)}" y="0" width="${slot.toFixed(1)}" height="${h}" data-i="${i}" />`
  ).join('');

  el.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gmvFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E84B40" stop-opacity="0.30" />
          <stop offset="100%" stop-color="#E84B40" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path d="${faktArea}" fill="url(#gmvFill)" />
      <path d="${faktLine}" fill="none" stroke="#C9362D" stroke-width="2.6"
        stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
      <circle cx="${faktEnd[0].toFixed(1)}" cy="${faktEnd[1].toFixed(1)}" r="4"
        fill="#C9362D" stroke="#fff" stroke-width="2" vector-effect="non-scaling-stroke" />
      ${hits}
    </svg>
  `;

  el.querySelectorAll('.col-hit').forEach((rect) => {
    rect.addEventListener('mouseenter', () => {
      const p = s[Number(rect.dataset.i)];
      const pct = p.plan ? Math.round((p.fakt / p.plan) * 100) : 0;
      tip.innerHTML = `
        <div class="tip-date">${fmtDay(p.date)}</div>
        <div class="tip-row"><span>Fakt</span><b>${fmtSomShort(p.fakt)}</b></div>
        <div class="tip-row"><span>Reja</span><b>${fmtSomShort(p.plan)}</b></div>
        <div class="tip-row"><span>Bajarilish</span><b>${pct}%</b></div>`;
      // Chekka ustunlarda tooltip panel tashqarisiga chiqmasin
      const pos = ((Number(rect.dataset.i) + 0.5) / s.length) * 100;
      tip.style.left = pos.toFixed(2) + '%';
      tip.style.transform = pos < 18 ? 'translateX(-6%)' : pos > 82 ? 'translateX(-94%)' : 'translateX(-50%)';
      tip.classList.add('show');
    });
  });
  el.addEventListener('mouseleave', () => tip.classList.remove('show'));

  // O'q: 30 ta yorliq siqilib ketadi — har 6-kunni ko'rsatamiz
  const marks = [0, 6, 12, 18, 24, s.length - 1];
  axis.innerHTML = marks.map((i) => `<span>${fmtDay(s[i].date)}</span>`).join('');

  // Panel sarlavhasi — summa to'liq raqamlarda, balansdek o'qilsin
  // (O'rtacha kunlik / reja / bajarilish / bugun ko'rsatkichlari founder qaroriga
  // ko'ra olib tashlandi — reja va bajarilish "Reja bajarilishi" doira
  // kartochkasida, bugungi GMV esa 7 kunlik ustunlarda ko'rinadi.)
  document.getElementById('revenueTotal').textContent = fmtSom(SERIES_FAKT_TOTAL);
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

/* ─── Reja bajarilishi — doira ko'rsatkich ─── */

function renderPlanGauge() {
  const el = document.getElementById('planGauge');
  if (!el) return;

  const pct = SERIES_PLAN_TOTAL ? (SERIES_FAKT_TOTAL / SERIES_PLAN_TOTAL) * 100 : 0;
  const shown = Math.max(0, Math.min(pct, 100));
  const r = 58, cx = 74, cy = 74;
  const circ = 2 * Math.PI * r;
  const dash = (shown / 100) * circ;

  el.innerHTML = `
    <svg viewBox="0 0 148 148">
      <defs>
        <linearGradient id="gaugeArc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#E84B40" />
          <stop offset="100%" stop-color="#8f1a10" />
        </linearGradient>
      </defs>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#E8EAF0" stroke-width="13" />
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#gaugeArc)" stroke-width="13"
        stroke-linecap="round" stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}"
        transform="rotate(-90 ${cx} ${cy})" />
      <text class="gauge-center-val" x="${cx}" y="${cy + 2}" text-anchor="middle">${Math.round(pct)}%</text>
      <text class="gauge-center-lbl" x="${cx}" y="${cy + 20}" text-anchor="middle">BAJARILDI</text>
    </svg>`;

  const gap = SERIES_FAKT_TOTAL - SERIES_PLAN_TOTAL;
  document.getElementById('gaugePctText').textContent = Math.round(pct) + '%';
  document.getElementById('gaugeFakt').textContent = fmtSom(SERIES_FAKT_TOTAL);
  document.getElementById('gaugePlan').textContent = fmtSom(SERIES_PLAN_TOTAL);

  const gapEl = document.getElementById('gaugeGap');
  gapEl.textContent = (gap >= 0 ? '+' : '−') + fmtSom(Math.abs(gap));
  gapEl.className = 'gl-val ' + (gap >= 0 ? 'is-ahead' : 'is-behind');
}

/* ─── Oxirgi 7 kun — kunlik GMV ustunlari ─── */

function renderWeekBars() {
  const el = document.getElementById('weekBars');
  if (!el) return;

  const last7 = DAILY_SERIES.slice(-7);
  // Shkala fakt VA reja'ning kattasiga qo'yiladi (reja chizig'i ham ramka ichida
  // qolishi kerak), ustiga 8% bo'sh joy — aks holda reja chizig'i track'ning eng
  // tepasiga qadalib, oddiy chegaraga o'xshab ko'rinmay qoladi
  const peak = Math.max(...last7.map((p) => Math.max(p.fakt, p.plan))) || 1;
  const max = peak * 1.08;
  const total = last7.reduce((s, p) => s + p.fakt, 0);

  el.innerHTML = last7.map((p) => {
    const h = Math.max(4, Math.round((p.fakt / max) * 100));
    const ph = Math.min(100, Math.round((p.plan / max) * 100));
    const done = p.plan && p.fakt >= p.plan;
    return `
      <div class="wb-item" title="${fmtDay(p.date)} — fakt ${fmtSom(p.fakt)}, reja ${fmtSom(p.plan)}">
        <div class="wb-track">
          <div class="wb-bar${done ? ' is-good' : ''}" style="height:${h}%"></div>
          <div class="wb-plan" style="bottom:${ph}%"></div>
        </div>
        <div class="wb-val">${fmtSomShort(p.fakt)}</div>
        <div class="wb-day">${fmtDay(p.date)}</div>
      </div>`;
  }).join('');

  document.getElementById('weekTotal').textContent = fmtSom(total);
}

/* ─── Status distribution (haqiqiy buyurtmalardan hisoblanadi) ─── */

// Bir xil taqsimot ikki joyda ko'rinadi: Dashboard va Statistika sahifasida
function renderStatusDist() {
  ['statusDist', 'statusDistDash'].forEach(renderStatusDistInto);
}

function renderStatusDistInto(elId) {
  const wrap = document.getElementById(elId);
  if (!wrap) return;
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
  planfakt:   { title: 'Reja/Fakt',   subtitle: "12 oylik savdo rejasi va joriy holat" },
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
