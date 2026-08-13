// Admin panel — barcha ma'lumot /api/admin/summary va /api/admin/disputes dan.
// Kirish: ADMIN_PANEL_TOKEN (X-Admin-Token header), parol client-side EMAS.
//
// YOZUV AMALLARI IKKI BOSQICHLI (2026-07-27 founder qarori):
// panel faqat SO'ROV yuboradi (POST /api/admin/action) — amal Telegram'dagi
// "Tasdiqlash" tugmasi bosilgandan keyin bajariladi. Shu sabab har tugma
// bosilganda "Telegram'da tasdiqlang" oynasi chiqadi va natija so'raladi.

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
  completed: { text: 'Yakunlandi',    cls: 'status-done',    color: '#0E7A52' },
  refunded:  { text: 'Qaytarildi',    cls: 'status-new',     color: '#8f1a10' },
  cancelled: { text: 'Bekor qilindi', cls: 'status-new',     color: '#E5484D' },
};

const FAULT_LABELS   = { buyer: 'Xaridor', seller: 'Sotuvchi', none: 'Hech kim' };
const PAYER_LABELS   = { buyer: 'Xaridor', seller: 'Sotuvchi', platform: 'Platforma' };

/* ═══════════════ Reja (future/lolamarket-future.html'dan) ═══════════════
   Manba: LolaMarketning tasdiqlangan 12 oylik savdo rejasi, Sentabrdan
   boshlab qayta tartiblangan. Iyul va Avgust uchun haqiqiy reja yo'q —
   naqsh davomiga ko'ra taxminiy (PLAN_ESTIMATED). Reja $ da, fakt so'mda —
   solishtirish uchun reja USD_TO_SOM bilan so'mga o'giriladi. */

const PLAN_MONTHS = ['Sentabr', 'Oktabr', 'Noyabr', 'Dekabr', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust'];
const PLAN_UNITS_PER_DAY = [5, 15, 25, 35, 45, 55, 55, 45, 55, 80, 55, 30];
const PLAN_UNITS_PER_MONTH = [150, 450, 750, 1050, 1350, 1650, 1650, 1350, 1650, 2400, 1650, 900];
const PLAN_ESTIMATED = [false, false, false, false, false, false, false, false, false, false, true, true];
const PLAN_PRICE_PER_UNIT = 82; // $, manbadagi o'rtacha chek
const USD_TO_SOM = 12600;

const MONTHS_SHORT = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

function fmtUsd(n) {
  return '$' + Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ');
}
function fmtSom(n) {
  return Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ') + " so'm";
}
// Katta summalarni ixcham ko'rsatish: 1 240 000 000 → 1,24 mlrd
function fmtSomShort(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2).replace('.', ',') + ' mlrd';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.', ',') + ' mln';
  return Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ');
}
function fmtNum(n) {
  return Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ');
}
function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
// Reja Sentabrdan boshlanadi (indeks 0) — kalendar oyni shu siklga moslaydi
function planIndexForMonth(monthIdx) {
  return (monthIdx - 8 + 12) % 12;
}
// Kunlik reja = oylik reja / o'sha oydagi kunlar soni (tekis taqsimot, founder qarori)
function planSomForDate(date) {
  const i = planIndexForMonth(date.getMonth());
  return (PLAN_UNITS_PER_MONTH[i] / daysInMonth(date)) * PLAN_PRICE_PER_UNIT * USD_TO_SOM;
}
function planSomForMonth(monthIdx) {
  return PLAN_UNITS_PER_MONTH[planIndexForMonth(monthIdx)] * PLAN_PRICE_PER_UNIT * USD_TO_SOM;
}
function fmtDay(d) {
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function initials(name) {
  return String(name || '?').split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}
// Davomiylik "0:14" ko'rinishida. `null` — Telegram `duration` bermagan holat
// va u "0 soniya" deb KO'RSATILMAYDI: nol yolg'on raqam bo'lardi.
function fmtDur(sec) {
  if (sec == null) return null;
  const s = Math.max(0, Math.round(sec));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
function fmtMB(bytes) {
  if (bytes == null) return null;
  return (Math.round((bytes / (1024 * 1024)) * 10) / 10).toString().replace('.', ',') + ' MB';
}

/* Video bloki — moderatsiya kartochkasi va videolar ro'yxatida BIR XIL.
   `preload="none"` SHART: sahifada 50 tagacha video bo'lishi mumkin va
   metama'lumot ham oldindan yuklansa panel ochilishi og'irlashardi. Muqova
   `poster` bo'lib turadi, baytlar esa faqat "play" bosilganda keladi.
   Muqova bo'lmasa (Telegram thumbnail bermagan) mahsulot rasmiga tushamiz. */
function videoBlock(m) {
  if (!m.video) return '';
  const poster = m.videoPoster || m.img || '';
  return `<video class="mod-video" src="${esc(m.video)}"${poster ? ` poster="${esc(poster)}"` : ''}
    controls preload="none" playsinline></video>`;
}
// "0:14 · 3,2 MB" — mavjud bo'lgani ko'rsatiladi, yo'g'i tashlab ketiladi
// (panelda o'ylab topilgan raqam ko'rsatilmasin — loyiha qoidasi).
function videoMeta(m) {
  return [fmtDur(m.videoSeconds), fmtMB(m.videoBytes)].filter(Boolean).join(' · ');
}

/* ═══════════════════════ Holat ═══════════════════════ */

const state = {
  token: null,
  summary: null,
  disputes: [],
  daily: [],     // { date:Date, gmv, plan, orders, commission }
};

/* ═══════════════════════ API ═══════════════════════ */

async function api(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: { 'X-Admin-Token': state.token, ...(opts.body ? { 'Content-Type': 'application/json' } : {}), ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || !data.ok) {
    const err = new Error((data && data.error) || 'so\'rov bajarilmadi');
    err.status = res.status;
    throw err;
  }
  return data.data;
}

const fetchSummary  = () => api('/api/admin/summary');
const fetchDisputes = () => api('/api/admin/disputes');

/* ═══════════════════════ Kirish ═══════════════════════ */

async function checkPassword() {
  const input = document.getElementById('passwordInput');
  const btn = document.getElementById('loginBtn');
  const token = input.value.trim();
  document.getElementById('loginError').style.display = 'none';
  if (!token) return;

  btn.disabled = true;
  btn.textContent = '...';
  const prev = state.token;
  state.token = token;
  try {
    await loadAll();
    sessionStorage.setItem('adminToken', token);
    showDashboard();
  } catch (e) {
    state.token = prev;
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
document.getElementById('loginBtn').addEventListener('click', checkPassword);

function logout() {
  sessionStorage.removeItem('adminToken');
  state.token = null;
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('passwordInput').value = '';
}

document.querySelector('.sidebar-logout').addEventListener('click', logout);

function showDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
}

async function loadAll() {
  // Bahslar alohida endpoint — u yiqilsa ham qolgan panel ishlashi kerak
  const [summary, disputes] = await Promise.all([
    fetchSummary(),
    fetchDisputes().catch(() => []),
  ]);
  state.summary = summary;
  state.disputes = disputes;
  state.daily = (summary.daily || []).map((d) => {
    const date = new Date(d.day + 'T00:00:00');
    return { date, gmv: d.gmv, orders: d.orders, commission: d.commission, plan: planSomForDate(date) };
  });
  renderAll();
}

async function refresh() {
  try { await loadAll(); } catch (e) { toast("Yangilash bajarilmadi: " + e.message, 'err'); }
}

/* ═══════════════════════ Toast + modal ═══════════════════════ */

let toastTimer = null;
function toast(msg, kind) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (kind === 'err' ? ' toast-err' : kind === 'ok' ? ' toast-ok' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 5000);
}

// Maydonlar so'raydigan oddiy modal. fields: [{name,label,type,value,options,hint}]
// Promise → qiymatlar obyekti yoki null (bekor qilindi)
function askModal(title, fields, okLabel) {
  return new Promise((resolve) => {
    const back = document.getElementById('modalBack');
    const body = document.getElementById('modalBody');
    document.getElementById('modalTitle').textContent = title;
    body.innerHTML = fields.map((f) => {
      if (f.type === 'select') {
        return `<label class="mf"><span>${esc(f.label)}</span>
          <select data-name="${esc(f.name)}">${f.options.map((o) =>
            `<option value="${esc(o.value)}"${o.value === f.value ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select>
          ${f.hint ? `<i class="mf-hint">${esc(f.hint)}</i>` : ''}</label>`;
      }
      if (f.type === 'textarea') {
        return `<label class="mf"><span>${esc(f.label)}</span>
          <textarea data-name="${esc(f.name)}" rows="3">${esc(f.value || '')}</textarea>
          ${f.hint ? `<i class="mf-hint">${esc(f.hint)}</i>` : ''}</label>`;
      }
      if (f.type === 'static') {
        return `<div class="mf mf-static"><span>${esc(f.label)}</span><b>${esc(f.value)}</b></div>`;
      }
      return `<label class="mf"><span>${esc(f.label)}</span>
        <input data-name="${esc(f.name)}" type="${f.type || 'text'}" value="${esc(f.value == null ? '' : f.value)}" />
        ${f.hint ? `<i class="mf-hint">${esc(f.hint)}</i>` : ''}</label>`;
    }).join('');

    document.getElementById('modalOk').textContent = okLabel || 'Davom etish';
    back.classList.add('show');

    const close = (result) => {
      back.classList.remove('show');
      document.getElementById('modalOk').onclick = null;
      document.getElementById('modalCancel').onclick = null;
      back.onclick = null;
      resolve(result);
    };
    document.getElementById('modalOk').onclick = () => {
      const out = {};
      body.querySelectorAll('[data-name]').forEach((el) => { out[el.dataset.name] = el.value.trim(); });
      close(out);
    };
    document.getElementById('modalCancel').onclick = () => close(null);
    back.onclick = (e) => { if (e.target === back) close(null); };
  });
}

/* ═══════════ Yozuv amali: panel so'raydi → Telegram tasdiqlaydi ═══════════ */

const WAIT_MS = 2000;
const WAIT_TRIES = 60;   // ~2 daqiqa

async function runAdminAction(kind, targetId, payload, label) {
  let req;
  try {
    req = await api('/api/admin/action', {
      method: 'POST',
      body: JSON.stringify({ kind, targetId, payload: payload || {} }),
    });
  } catch (e) {
    toast(e.message, 'err');
    return false;
  }

  const wait = document.getElementById('waitBack');
  document.getElementById('waitText').textContent =
    `${label} — Telegram'dagi "Tasdiqlash" tugmasini bosing`;
  wait.classList.add('show');

  try {
    for (let i = 0; i < WAIT_TRIES; i++) {
      await new Promise((r) => setTimeout(r, WAIT_MS));
      let st;
      try { st = await api(`/api/admin/action?id=${req.id}`); } catch (_) { continue; }
      if (st.status === 'pending') continue;
      wait.classList.remove('show');
      if (st.status === 'done') { toast(`${label} — bajarildi`, 'ok'); await refresh(); return true; }
      if (st.status === 'declined') { toast(`${label} — Telegram'da bekor qilindi`); return false; }
      if (st.status === 'expired')  { toast(`${label} — so'rov eskirdi, qayta urining`, 'err'); return false; }
      toast(`${label} — bajarilmadi: ${st.error || 'xato'}`, 'err');
      return false;
    }
    toast("Telegram'da tasdiqlanmadi — so'rov kuchda qoldi", 'err');
    return false;
  } finally {
    wait.classList.remove('show');
  }
}

/* ═══════════════════════ Render ═══════════════════════ */

function renderAll() {
  const d = state.summary;
  renderStats(d);
  renderRevenueChart();
  renderPlanGauge();
  renderWeekBars();

  const activeFilter = document.querySelector('.order-filter.active');
  renderOrders(activeFilter ? activeFilter.dataset.filter : 'all');
  renderOrdersMini();

  renderCategories(d.categories || []);
  renderCatList(d.categories || []);
  renderStatusDist();

  renderApplications();
  renderSellers();
  renderModQueue();
  renderVideoQueue();
  renderDisputes();
  renderTopSellers();
  renderUsers();
  renderGrowth();
  renderPlanFakt();

  updateNavBadges(d);
}

const sum = (arr, k) => arr.reduce((s, x) => s + (x[k] || 0), 0);

function renderStats(d) {
  const gmv = sum(state.daily, 'gmv');
  const orders = sum(state.daily, 'orders');
  const commission = sum(state.daily, 'commission');

  document.getElementById('statOrdersTotal').textContent = fmtNum(orders);
  document.getElementById('statOrdersToday').textContent = `${d.ordersToday} bugun`;
  document.getElementById('statGmv').textContent = gmv ? fmtSomShort(gmv) + " so'm" : '0';
  document.getElementById('statCommission').textContent = commission ? fmtSomShort(commission) + " so'm" : '0';
  document.getElementById('statCommissionFoot').textContent =
    `${(d.commissionRate * 100).toFixed(0)}% stavka · o'tkazilishi kutilmoqda: ${fmtSomShort(d.totals.payoutDue)}`;
  document.getElementById('statModeration').textContent = d.moderationPending;
  document.getElementById('statSellerApps').textContent = `${d.sellerAppsPending} yangi ariza`;
}

function updateNavBadges(d) {
  setBadge('navBadgeOrders', (d.recentOrders || []).filter((o) => o.status === 'pending').length);
  setBadge('navBadgeSellers', d.sellerAppsPending);
  setBadge('navBadgeModeration', d.moderationPending);
  setBadge('navBadgeDisputes', d.disputesOpen);
}

function setBadge(id, count) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!count) { el.classList.remove('show'); return; }
  el.textContent = count > 99 ? '99+' : count;
  el.classList.add('show');
}

/* ─── Buyurtmalar ─── */

function orderActions(o) {
  const btns = [];
  if (o.status === 'delivered' && !o.hasDispute) {
    btns.push(`<button class="btn-mini btn-approve" data-act="payout" data-id="${esc(o.id)}">Pul o'tkazish</button>`);
  }
  if (o.status !== 'refunded' && o.status !== 'cancelled') {
    btns.push(`<button class="btn-mini btn-reject" data-act="refund" data-id="${esc(o.id)}">Refund</button>`);
  }
  return btns.join('') || '<span class="muted">—</span>';
}

function orderRow(o) {
  const st = STATUS_LABELS[o.status] || { text: o.status || '?', cls: 'status-pending' };
  return `
    <tr>
      <td class="order-id">${esc(o.id)}${o.hasDispute ? ' <span class="dispute-flag" title="Ochiq bahs">⚖️</span>' : ''}</td>
      <td>
        ${esc(o.buyerName || "Noma'lum")}${o.source === 'web' ? ' <span class="src-web" title="lolamarket.uz saytidan berilgan — xaridor Telegram\'da emas">sayt</span>' : ''}
        ${o.phone ? `<div class="order-phone">${esc(o.phone)}</div>` : ''}
      </td>
      <td class="order-type">${o.itemsCount} ta</td>
      <td class="num">${o.total == null ? '—' : fmtSom(o.total)}</td>
      <td class="num">${o.commission == null ? '—' : fmtSom(o.commission)}</td>
      <td class="num">${o.payout == null ? '—' : fmtSom(o.payout)}</td>
      <td class="order-date">${o.date ? o.date.uz : '-'}</td>
      <td><span class="status-badge ${st.cls}">${st.text}</span></td>
      <td class="row-actions">${orderActions(o)}</td>
    </tr>`;
}

function renderOrders(filter) {
  const all = state.summary.recentOrders || [];
  const list = filter === 'all' ? all : all.filter((o) => o.status === filter);
  document.getElementById('orderCount').textContent = list.length + ' ta';
  const tbody = document.getElementById('ordersBody');
  tbody.innerHTML = list.length
    ? list.map(orderRow).join('')
    : `<tr><td colspan="9" class="empty-cell">Buyurtma topilmadi</td></tr>`;
}

function renderOrdersMini() {
  const wrap = document.getElementById('orderCardsMini');
  const list = (state.summary.recentOrders || []).slice(0, 4);
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
          <span class="oc-id">${esc(o.id)}</span>
          <span class="status-badge ${st.cls}">${st.text}</span>
        </div>
        <div class="oc-buyer">
          <span class="oc-avatar">${esc(initials(name))}</span>
          <span class="oc-name">${esc(name)}</span>
        </div>
        <div class="oc-foot">
          <span>${o.itemsCount} ta mahsulot</span>
          <span>${o.total == null ? '' : fmtSomShort(o.total)}</span>
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

// Buyurtma jadvalidagi amallar (delegatsiya — jadval qayta chiziladi)
document.getElementById('ordersBody').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const id = btn.dataset.id;
  const order = (state.summary.recentOrders || []).find((o) => o.id === id);
  if (!order) return;

  if (btn.dataset.act === 'payout') {
    const r = await askModal("Sotuvchiga pul o'tkazish", [
      { type: 'static', label: 'Buyurtma', value: id },
      { type: 'static', label: 'Jami', value: fmtSom(order.total || 0) },
      { type: 'static', label: 'Komissiya', value: fmtSom(order.commission || 0) },
      { type: 'static', label: "Sotuvchiga o'tkaziladi", value: fmtSom(order.payout || 0) },
    ], "Telegram'ga so'rov yuborish");
    if (!r) return;
    await runAdminAction('order_payout', id, {}, "Pul o'tkazish");
    return;
  }

  if (btn.dataset.act === 'refund') {
    const r = await askModal('Pul qaytarish (refund)', [
      { type: 'static', label: 'Buyurtma', value: id },
      { type: 'static', label: 'Buyurtma summasi', value: fmtSom(order.total || 0) },
      { name: 'amount', label: 'Qaytariladigan summa (so\'m)', type: 'number', value: order.total || 0,
        hint: 'Qisman qaytarish uchun kichikroq summa kiriting' },
      { name: 'reason', label: 'Sabab', type: 'textarea',
        hint: 'Xaridorga Telegram xabarida ko\'rsatiladi' },
    ], "Telegram'ga so'rov yuborish");
    if (!r) return;
    const amount = parseInt(r.amount, 10);
    if (!Number.isInteger(amount) || amount < 1) return toast('Summa noto\'g\'ri', 'err');
    if (!r.reason || r.reason.length < 3) return toast('Sabab yozilishi shart', 'err');
    await runAdminAction('order_refund', id, { amount, reason: r.reason }, 'Refund');
  }
});

/* ─── Kategoriyalar ─── */

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
      <div class="chart-label">${esc(CAT_LABELS[c.catKey] || c.catKey)}</div>
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
        <div class="cat-name">${esc(CAT_LABELS[c.catKey] || c.catKey)}</div>
        <div class="cat-bar-wrap"><div class="cat-bar" style="width:${max ? Math.round((c.count / max) * 100) : 0}%;background:${CAT_COLORS[i % CAT_COLORS.length]}"></div></div>
      </div>
      <span class="cat-count">${c.count}</span>
    </div>
  `).join('');
}

/* ─── Savdo dinamikasi (SVG, silliq chiziq) ─── */

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

function renderRevenueChart() {
  const el = document.getElementById('revenueChart');
  const axis = document.getElementById('revenueAxis');
  const tip = document.getElementById('chartTip');
  const s = state.daily;
  const total = sum(s, 'gmv');

  document.getElementById('revenueTotal').textContent = fmtSom(total);

  if (!s.length) { el.innerHTML = ''; axis.innerHTML = ''; return; }

  const w = 720, h = 260, padT = 16, padB = 8;
  const innerH = h - padT - padB;
  // Savdo hali bo'lmasa max = 0 bo'lib chiziq NaN bo'lardi — 1 ga tushamiz
  const max = (Math.max(...s.map((p) => p.gmv)) || 1) * 1.12;
  const slot = w / s.length;
  const y = (v) => padT + (1 - v / max) * innerH;

  const faktPts = s.map((p, i) => [i * slot + slot / 2, y(p.gmv)]);
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
      const pct = p.plan ? Math.round((p.gmv / p.plan) * 100) : 0;
      tip.innerHTML = `
        <div class="tip-date">${fmtDay(p.date)}</div>
        <div class="tip-row"><span>Fakt</span><b>${fmtSomShort(p.gmv)}</b></div>
        <div class="tip-row"><span>Reja</span><b>${fmtSomShort(p.plan)}</b></div>
        <div class="tip-row"><span>Buyurtma</span><b>${p.orders}</b></div>
        <div class="tip-row"><span>Bajarilish</span><b>${pct}%</b></div>`;
      const pos = ((Number(rect.dataset.i) + 0.5) / s.length) * 100;
      tip.style.left = pos.toFixed(2) + '%';
      tip.style.transform = pos < 18 ? 'translateX(-6%)' : pos > 82 ? 'translateX(-94%)' : 'translateX(-50%)';
      tip.classList.add('show');
    });
  });
  el.addEventListener('mouseleave', () => tip.classList.remove('show'));

  const marks = [0, 6, 12, 18, 24, s.length - 1].filter((i) => i < s.length);
  axis.innerHTML = [...new Set(marks)].map((i) => `<span>${fmtDay(s[i].date)}</span>`).join('');
}

/* ─── Reja bajarilishi — doira ko'rsatkich ─── */

function renderPlanGauge() {
  const el = document.getElementById('planGauge');
  if (!el) return;
  const fakt = sum(state.daily, 'gmv');
  const plan = sum(state.daily, 'plan');

  const pct = plan ? (fakt / plan) * 100 : 0;
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

  const gap = fakt - plan;
  document.getElementById('gaugePctText').textContent = Math.round(pct) + '%';
  document.getElementById('gaugeFakt').textContent = fmtSom(fakt);
  document.getElementById('gaugePlan').textContent = fmtSom(plan);

  const gapEl = document.getElementById('gaugeGap');
  gapEl.textContent = (gap >= 0 ? '+' : '−') + fmtSom(Math.abs(gap));
  gapEl.className = 'gl-val ' + (gap >= 0 ? 'is-ahead' : 'is-behind');
}

/* ─── Oxirgi 7 kun — kunlik GMV ustunlari ─── */

function renderWeekBars() {
  const el = document.getElementById('weekBars');
  if (!el) return;
  const last7 = state.daily.slice(-7);
  if (!last7.length) { el.innerHTML = `<div class="empty-panel">Ma'lumot yo'q</div>`; return; }

  // Shkala fakt VA rejaning kattasiga qo'yiladi, ustiga 8% bo'sh joy —
  // aks holda reja chizig'i track tepasiga qadalib ko'rinmay qoladi
  const peak = Math.max(...last7.map((p) => Math.max(p.gmv, p.plan))) || 1;
  const max = peak * 1.08;
  const total = sum(last7, 'gmv');

  el.innerHTML = last7.map((p) => {
    const h = Math.max(4, Math.round((p.gmv / max) * 100));
    const ph = Math.min(100, Math.round((p.plan / max) * 100));
    const done = p.plan && p.gmv >= p.plan;
    return `
      <div class="wb-item" title="${fmtDay(p.date)} — fakt ${fmtSom(p.gmv)}, reja ${fmtSom(p.plan)}">
        <div class="wb-track">
          <div class="wb-bar${done ? ' is-good' : ''}" style="height:${h}%"></div>
          <div class="wb-plan" style="bottom:${ph}%"></div>
        </div>
        <div class="wb-val">${fmtSomShort(p.gmv)}</div>
        <div class="wb-day">${fmtDay(p.date)}</div>
      </div>`;
  }).join('');

  document.getElementById('weekTotal').textContent = fmtSom(total);
}

/* ─── Buyurtma holatlari taqsimoti ─── */

function renderStatusDist() {
  ['statusDist', 'statusDistDash'].forEach(renderStatusDistInto);
}

function renderStatusDistInto(elId) {
  const wrap = document.getElementById(elId);
  if (!wrap) return;
  const orders = state.summary.recentOrders || [];
  if (!orders.length) {
    wrap.innerHTML = `<div class="empty-panel">Buyurtma yo'q</div>`;
    return;
  }
  const counts = {};
  orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
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

/* ─── Sotuvchi arizalari ─── */

function renderApplications() {
  const list = state.summary.applications || [];
  document.getElementById('applicationsCount').textContent = list.length + ' ta';
  const grid = document.getElementById('applicationsGrid');
  if (!list.length) {
    grid.innerHTML = `<div class="empty-panel">Ko'rib chiqilmagan ariza yo'q</div>`;
    return;
  }
  grid.innerHTML = list.map((a) => `
    <div class="app-card glass">
      <div class="app-card-head">
        <div class="app-avatar">${initials(a.business)}</div>
        <div>
          <div class="app-name">${esc(a.business || '?')}</div>
          <div class="app-meta">${esc(a.date ? a.date.uz : '')}</div>
        </div>
      </div>
      <div class="app-details">
        <div class="app-detail-row"><span>Shahar</span><span>${esc(a.city || '—')}</span></div>
        <div class="app-detail-row"><span>Telefon</span><span>${esc(a.phone || '—')}</span></div>
        <div class="app-detail-row"><span>Mahsulot</span><span>${esc(a.productType || '—')}</span></div>
        ${a.tgUsername ? `<div class="app-detail-row"><span>Telegram</span><span>@${esc(a.tgUsername)}</span></div>` : ''}
      </div>
      <div class="app-actions">
        <button class="btn-approve" data-app="${a.id}" data-act="approve">Tasdiqlash</button>
        <button class="btn-reject"  data-app="${a.id}" data-act="reject">Rad etish</button>
      </div>
    </div>
  `).join('');
}

document.getElementById('applicationsGrid').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-app]');
  if (!btn) return;
  const id = btn.dataset.app;
  const app = (state.summary.applications || []).find((a) => String(a.id) === String(id));

  if (btn.dataset.act === 'approve') {
    const r = await askModal('Sotuvchini tasdiqlash', [
      { type: 'static', label: 'Korxona', value: app ? app.business : id },
      { type: 'static', label: 'Shahar', value: app ? (app.city || '—') : '—' },
    ], "Telegram'ga so'rov yuborish");
    if (!r) return;
    await runAdminAction('seller_approve', id, {}, 'Sotuvchini tasdiqlash');
  } else {
    const r = await askModal('Arizani rad etish', [
      { type: 'static', label: 'Korxona', value: app ? app.business : id },
      { name: 'reason', label: 'Sabab (ixtiyoriy)', type: 'textarea',
        hint: 'Arizachiga Telegram orqali yuboriladi' },
    ], "Telegram'ga so'rov yuborish");
    if (!r) return;
    await runAdminAction('seller_reject', id, r.reason ? { reason: r.reason } : {}, 'Arizani rad etish');
  }
});

/* ─── Tasdiqlangan sotuvchilar ─── */

function renderSellers() {
  const list = state.summary.sellers || [];
  document.getElementById('sellersCount').textContent = list.length + ' ta';
  document.getElementById('sellersBody').innerHTML = list.length ? list.map((s) => `
    <tr>
      <td class="order-product">${esc(s.name || '?')}</td>
      <td class="order-type">${esc(s.phone || '—')}</td>
      <td class="order-type">${esc(s.city || '—')}</td>
      <td class="order-type">${s.products} ta</td>
      <td class="order-type">${s.rating == null ? '—' : '★ ' + s.rating}</td>
      <td class="order-date">${esc(s.joined)}</td>
    </tr>
  `).join('') : `<tr><td colspan="6" class="empty-cell">Tasdiqlangan sotuvchi yo'q</td></tr>`;
}

function renderTopSellers() {
  const wrap = document.getElementById('topSellers');
  if (!wrap) return;
  const list = state.summary.topSellers || [];
  if (!list.length) {
    wrap.innerHTML = `<div class="empty-panel">Oxirgi 30 kunda savdo yo'q</div>`;
    return;
  }
  const max = Math.max(...list.map((s) => s.gmv)) || 1;
  wrap.innerHTML = list.map((s, i) => `
    <div class="cat-row">
      <span class="cat-swatch" style="background:${CAT_COLORS[i % CAT_COLORS.length]}"></span>
      <div class="cat-info">
        <div class="cat-name">${esc(s.name || '?')}</div>
        <div class="cat-bar-wrap"><div class="cat-bar" style="width:${Math.round((s.gmv / max) * 100)}%;background:${CAT_COLORS[i % CAT_COLORS.length]}"></div></div>
      </div>
      <span class="cat-count">${fmtSomShort(s.gmv)}</span>
    </div>
  `).join('');
}

/* ─── Foydalanuvchilar ─── */
// ⚠️ Yorliqlarda ATAYLAB "ilovani ochganlar" deyiladi, "bot obunachilari" emas:
// `users` qatori faqat Mini App / sayt / sotuvchi arizasi orqali tug'iladi
// (server tomonda `handleAdminSummary` izohiga qarang). `/start` bosgan odam
// bazada yo'q, ya'ni "obunachi" deb yozilsa raqam jimgina yolg'on gapirardi.
//
// Backend eski versiyada qolsa (`users` maydoni yo'q) blok BUTUNLAY yashiriladi —
// nol ko'rsatilmaydi: "ma'lumot yo'q" bilan "hech kim yo'q" bir xil ko'rinmasin.
function renderUsers() {
  const block = document.getElementById('usersBlock');
  const note = document.getElementById('usersNote');
  if (!block) return;
  // `engaged` ham tekshiriladi, `users` ning O'ZI bor-yo'qligi kifoya emas:
  // deploy oynasida frontend yangi, backend esa bir qadam orqada bo'lishi
  // mumkin (2026-08-08 da aynan shu holat bo'ldi) — o'shanda `engaged`
  // `undefined` bo'lib ekranda "NaN%" chiqardi.
  const u = state.summary.users;
  if (!u || u.engaged == null) {
    block.hidden = true;
    if (note) note.hidden = true;
    return;
  }
  block.hidden = false;
  if (note) note.hidden = false;

  document.getElementById('usersTotal').textContent = fmtNum(u.total) + ' ta';
  // Ulush jamiga nisbatan — "botni ochib qo'ygan, lekin foydalanmagan" ulushi
  // konversiyaning eng qo'pol o'lchovi.
  const ulush = u.total ? Math.round((u.engaged / u.total) * 100) : 0;
  document.getElementById('usersSplit').textContent =
    `${fmtNum(u.engaged)} foydalangan (${ulush}%) · ${fmtNum(u.startOnly)} faqat /start`;

  const rollar = [
    { name: 'Xaridor', n: u.buyers },
    { name: 'Sotuvchi', n: u.sellers },
    { name: 'Admin', n: u.admins },
  ];
  const maxRol = Math.max(...rollar.map((r) => r.n), 1);
  document.getElementById('usersRoles').innerHTML = rollar.map((r, i) => `
    <div class="cat-row">
      <span class="cat-swatch" style="background:${CAT_COLORS[i % CAT_COLORS.length]}"></span>
      <div class="cat-info">
        <div class="cat-name">${r.name}</div>
        <div class="cat-bar-wrap"><div class="cat-bar" style="width:${Math.round((r.n / maxRol) * 100)}%;background:${CAT_COLORS[i % CAT_COLORS.length]}"></div></div>
      </div>
      <span class="cat-count">${fmtNum(r.n)}</span>
    </div>
  `).join('');

  // Ustunlar jamiga nisbatan chiziladi — "oxirgi 30 kunda kelganlar ulushi"
  // o'sish tezligini bitta qarashda ko'rsatadi.
  const yangi = [
    { text: 'Foydalanganlar', n: u.engaged, color: '#119DAB' },
    { text: 'Faqat /start bosgan', n: u.startOnly, color: '#8f1a10' },
    { text: 'Oxirgi 7 kun', n: u.new7, color: '#54D7E1' },
    { text: 'Oxirgi 30 kun', n: u.new30, color: '#D98E0C' },
    { text: 'Telefon raqami bor', n: u.withPhone, color: '#C9362D' },
  ];
  document.getElementById('usersNew').innerHTML = yangi.map((y) => `
    <div class="status-dist-row">
      <span class="status-dist-label">${y.text}</span>
      <div class="status-dist-bar-wrap"><div class="status-dist-bar" style="width:${u.total ? Math.round((y.n / u.total) * 100) : 0}%;background:${y.color}"></div></div>
      <span class="status-dist-val">${fmtNum(y.n)}</span>
    </div>
  `).join('');
}

/* ─── Kanallar va AI (db/025) ───
   `renderUsers` bilan AYNI qoida: backend bir qadam orqada bo'lsa blok
   BUTUNLAY yashiriladi — nol ko'rsatilmaydi, chunki "ma'lumot yo'q" bilan
   "hech kim yo'q" bir xil ko'rinmasligi kerak.

   ⚠️ Bo'sh kanal ro'yxati esa YASHIRILMAYDI: u haqiqiy va foydali javob —
   "havolalar hali ishlatilmayapti" degani. Nol bilan noma'lumning farqi
   shu yerda: birinchisi o'lchangan, ikkinchisi o'lchanmagan. */
function renderGrowth() {
  const block = document.getElementById('growthBlock');
  const note = document.getElementById('growthNote');
  if (!block) return;
  const ai = state.summary.ai;
  const src = state.summary.sources;
  if (!ai || ai.images == null || !Array.isArray(src)) {
    block.hidden = true;
    if (note) note.hidden = true;
    return;
  }
  block.hidden = false;
  if (note) note.hidden = false;

  // ---- Kanallar ----
  const noma = (state.summary.users && state.summary.users.srcUnknown) || 0;
  document.getElementById('srcFoot').textContent = src.length
    ? `${src.length} ta kanal · ${fmtNum(noma)} o'lchanmagan`
    : `Hali birorta havola ishlatilmagan · ${fmtNum(noma)} o'lchanmagan`;

  const srcList = document.getElementById('srcList');
  if (!src.length) {
    srcList.innerHTML = `<div class="empty-panel">Kanal havolasi hali ishlatilmagan</div>`;
  } else {
    const maxSrc = Math.max(...src.map((s) => s.count), 1);
    srcList.innerHTML = src.map((s, i) => `
      <div class="cat-row">
        <span class="cat-swatch" style="background:${CAT_COLORS[i % CAT_COLORS.length]}"></span>
        <div class="cat-info">
          <div class="cat-name">${esc(s.src)}</div>
          <div class="cat-bar-wrap"><div class="cat-bar" style="width:${Math.round((s.count / maxSrc) * 100)}%;background:${CAT_COLORS[i % CAT_COLORS.length]}"></div></div>
        </div>
        <span class="cat-count">${fmtNum(s.count)} / ${fmtNum(s.engaged)}</span>
      </div>
    `).join('');
  }

  // ---- AI ----
  document.getElementById('aiImages').textContent = fmtNum(ai.images) + ' ta rasm';
  document.getElementById('aiFoot').textContent =
    `${fmtNum(ai.users)} foydalanuvchi · ${fmtNum(ai.creditsSpent)} kredit sarflangan`;

  const aiQator = [
    { text: 'Jami chizilgan', n: ai.images, color: '#119DAB' },
    { text: 'Oxirgi 7 kun', n: ai.images7, color: '#54D7E1' },
    { text: 'Chizdirgan odamlar', n: ai.users, color: '#D98E0C' },
  ];
  const maxAi = Math.max(...aiQator.map((a) => a.n), 1);
  document.getElementById('aiDist').innerHTML = aiQator.map((a) => `
    <div class="status-dist-row">
      <span class="status-dist-label">${a.text}</span>
      <div class="status-dist-bar-wrap"><div class="status-dist-bar" style="width:${Math.round((a.n / maxAi) * 100)}%;background:${a.color}"></div></div>
      <span class="status-dist-val">${fmtNum(a.n)}</span>
    </div>
  `).join('');
}

/* ─── Moderatsiya navbati ─── */

function renderModQueue() {
  const list = state.summary.moderationQueue || [];
  document.getElementById('modQueueCount').textContent = list.length + ' ta';
  const grid = document.getElementById('modGrid');
  if (!list.length) {
    grid.innerHTML = `<div class="empty-panel">Moderatsiya navbati bo'sh</div>`;
    return;
  }
  grid.innerHTML = list.map((m) => `
    <div class="mod-card glass">
      ${m.img ? `<img class="mod-thumb" src="${esc(m.img)}" alt="${esc(m.name)}" />`
               : `<div class="mod-thumb mod-thumb-empty">Rasm yo'q</div>`}
      ${videoBlock(m)}
      <div class="mod-body">
        <div class="mod-name">${esc(m.name)}</div>
        <div class="mod-meta">${esc(m.sellerName || "Sotuvchi noma'lum")} · ${esc(m.date ? m.date.uz : '')}</div>
        <div class="mod-price">${fmtSom(m.price)}/${esc(m.unit || 'rulon')}</div>
        <div class="mod-meta">Zaxira: ${m.stock == null ? 'cheksiz' : esc(m.stock)}</div>
        ${m.video ? `<div class="mod-meta">🎬 Video: ${esc(videoMeta(m))}</div>` : ''}
        <div class="mod-actions">
          <button class="btn-approve" data-prod="${esc(m.id)}" data-act="publish">Nashr</button>
          <button class="btn-reject"  data-prod="${esc(m.id)}" data-act="reject">Rad</button>
        </div>
      </div>
    </div>
  `).join('');
}

document.getElementById('modGrid').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-prod]');
  if (!btn) return;
  const id = btn.dataset.prod;
  const p = (state.summary.moderationQueue || []).find((m) => m.id === id);

  if (btn.dataset.act === 'publish') {
    const r = await askModal("E'lonni nashr qilish", [
      { type: 'static', label: 'Mahsulot', value: p ? p.name : id },
      { type: 'static', label: 'Narx', value: p ? fmtSom(p.price) : '—' },
    ], "Telegram'ga so'rov yuborish");
    if (!r) return;
    await runAdminAction('product_publish', id, {}, 'Nashr qilish');
  } else {
    const r = await askModal("E'lonni rad etish", [
      { type: 'static', label: 'Mahsulot', value: p ? p.name : id },
      { name: 'reason', label: 'Sabab', type: 'textarea',
        hint: "Sotuvchiga yuboriladi — u tuzatib qayta yuborishi mumkin" },
    ], "Telegram'ga so'rov yuborish");
    if (!r) return;
    await runAdminAction('product_reject', id, r.reason ? { reason: r.reason } : {}, 'Rad etish');
  }
});

/* ─── Kelgan videolar (db/023) ─── */

// ⚠️ Moderatsiya navbatidan ATAYLAB ALOHIDA ro'yxat. Navbat faqat `pending`
// e'lonlarni ko'rsatadi, video esa ALLAQACHON NASHR QILINGAN mahsulotga ham
// keladi (sotuvchi rasm yuborgach video oynasi ochiladi) — u holda video
// hech qanday navbatga tushmasdan o'tib ketardi va uni hech kim ko'rmasdi.
const VIDEO_STATUS = {
  pending: '⏳ moderatsiyada',
  published: '✅ nashrda',
  rejected: '⛔ rad etilgan',
  draft: '👁 yashirilgan',
};

function renderVideoQueue() {
  const grid = document.getElementById('videoGrid');
  if (!grid) return;
  const list = state.summary.videoQueue || [];
  document.getElementById('videoQueueCount').textContent = list.length + ' ta';
  if (!list.length) {
    grid.innerHTML = `<div class="empty-panel">Hali video kelmagan</div>`;
    return;
  }
  grid.innerHTML = list.map((m) => {
    // Bo'sh bo'laklar tashlab ketiladi — "🎬  · ✅ nashrda" kabi osilgan
    // ajratkich qolmasin (davomiylik yoki hajm kelmagan bo'lishi mumkin).
    const meta = [videoMeta(m), VIDEO_STATUS[m.status] || m.status].filter(Boolean).join(' · ');
    return `
    <div class="mod-card glass">
      ${videoBlock(m)}
      <div class="mod-body">
        <div class="mod-name">${esc(m.name)}</div>
        <div class="mod-meta">${esc(m.sellerName || "Sotuvchi noma'lum")} · ${esc(m.date ? m.date.uz : '')}</div>
        <div class="mod-meta">🎬 ${esc(meta)}</div>
        <div class="mod-actions">
          <button class="btn-reject" data-vid="${esc(m.id)}">Videoni o'chirish</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* Videoni o'chirish — mahsulot O'CHMAYDI, faqat video olib tashlanadi.
   Yozuv amali, ya'ni panel faqat SO'RAYDI: haqiqiy o'chirish Telegram'dagi
   tugma bosilgandan keyin bo'ladi (2026-07-27 qarori — panel tokeni
   `sessionStorage`da yashaydi va o'g'irlanishi mumkin). */
document.getElementById('videoGrid').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-vid]');
  if (!btn) return;
  const id = btn.dataset.vid;
  const m = (state.summary.videoQueue || []).find((x) => x.id === id);
  const r = await askModal('Videoni o\'chirish', [
    { type: 'static', label: 'Mahsulot', value: m ? m.name : id },
    { type: 'static', label: 'Diqqat', value: "Mahsulot o'chmaydi — faqat video" },
    { name: 'reason', label: 'Sabab', type: 'textarea',
      hint: 'Sotuvchiga yuboriladi — u yangi video yuborishi mumkin' },
  ], "Telegram'ga so'rov yuborish");
  if (!r) return;
  await runAdminAction('video_remove', id, r.reason ? { reason: r.reason } : {}, "Videoni o'chirish");
});

/* ─── Bahsli holatlar ─── */

function disputeCard(d) {
  const open = d.status === 'open';
  const stale = open && d.ageHours >= 24;
  const photos = (d.photos || []).map((src) =>
    `<a class="ev-thumb" href="${esc(src)}" target="_blank" rel="noopener">
       <img src="${esc(src)}" alt="Dalil" loading="lazy" />
     </a>`).join('');

  return `
    <div class="dispute-card glass${stale ? ' is-stale' : ''}">
      <div class="dc-head">
        <div>
          <div class="dc-id">Bahs #${d.id} · <span class="oc-id">${esc(d.orderId)}</span></div>
          <div class="dc-meta">${esc(d.buyerName || "Noma'lum")} → ${esc(d.sellerName || "sotuvchi noma'lum")} · ${esc(d.date ? d.date.uz : '')}</div>
        </div>
        <span class="status-badge ${open ? (stale ? 'status-new' : 'status-pending') : 'status-done'}">
          ${open ? (stale ? `${d.ageHours} soat — kechikdi` : 'Ochiq') : d.status === 'resolved' ? 'Hal qilindi' : 'Rad etildi'}
        </span>
      </div>

      <div class="dc-row"><span>Shikoyat</span><b>${esc(d.reason || '—')}</b></div>
      <div class="dc-row"><span>Buyurtma summasi</span><b>${d.orderTotal == null ? '—' : fmtSom(d.orderTotal)}</b></div>
      <div class="dc-row"><span>Sotuvchi javobi</span><b>${d.sellerResponse ? esc(d.sellerResponse) : '<i class="muted">hali javob bermagan</i>'}</b></div>
      ${d.awaitingEvidence && open ? `<div class="dc-note">📸 Xaridor hali dalil yubormoqda</div>` : ''}

      ${photos ? `<div class="ev-grid">${photos}</div>`
               : `<div class="dc-note muted">Dalil rasmi yo'q</div>`}

      ${open ? `
        <div class="dc-actions">
          <button class="btn-approve" data-dispute="${d.id}">Qaror qabul qilish</button>
        </div>`
      : `
        <div class="dc-verdict">
          <div class="dc-row"><span>Aybdor</span><b>${esc(FAULT_LABELS[d.atFault] || '—')}</b></div>
          <div class="dc-row"><span>Logistikani to'ladi</span><b>${esc(PAYER_LABELS[d.logisticsPayer] || '—')}</b></div>
          ${d.refundAmount ? `<div class="dc-row"><span>Qaytarildi</span><b>${fmtSom(d.refundAmount)}</b></div>` : ''}
          <div class="dc-row"><span>Qaror</span><b>${esc(d.decision || '—')}</b></div>
        </div>`}
    </div>`;
}

function renderDisputes() {
  const open = state.disputes.filter((d) => d.status === 'open');
  const closed = state.disputes.filter((d) => d.status !== 'open');
  document.getElementById('disputeCount').textContent = open.length + ' ta ochiq';

  document.getElementById('disputeOpenList').innerHTML = open.length
    ? open.map(disputeCard).join('')
    : `<div class="empty-panel">Ochiq bahs yo'q — hammasi hal qilingan 👌</div>`;

  document.getElementById('disputeClosedList').innerHTML = closed.length
    ? closed.slice(0, 20).map(disputeCard).join('')
    : `<div class="empty-panel">Hal qilingan bahs yo'q</div>`;
}

document.getElementById('disputeOpenList').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-dispute]');
  if (!btn) return;
  const id = btn.dataset.dispute;
  const d = state.disputes.find((x) => String(x.id) === String(id));
  if (!d) return;

  const r = await askModal(`Bahs #${d.id} bo'yicha qaror`, [
    { type: 'static', label: 'Buyurtma', value: d.orderId },
    { type: 'static', label: 'Shikoyat', value: d.reason || '—' },
    { name: 'atFault', label: 'Kim aybdor?', type: 'select', value: 'seller', options: [
      { value: 'seller', label: 'Sotuvchi' }, { value: 'buyer', label: 'Xaridor' }, { value: 'none', label: 'Hech kim' },
    ] },
    { name: 'logisticsPayer', label: "Logistikani kim to'laydi?", type: 'select', value: 'seller', options: [
      { value: 'seller', label: 'Sotuvchi' }, { value: 'buyer', label: 'Xaridor' }, { value: 'platform', label: 'Platforma' },
    ] },
    { name: 'refundAmount', label: 'Qaytariladigan summa (so\'m)', type: 'number', value: 0,
      hint: `0 = qaytarilmaydi. Buyurtma summasi: ${d.orderTotal == null ? '—' : fmtSom(d.orderTotal)}` },
    { name: 'decision', label: 'Qaror matni', type: 'textarea',
      hint: 'Xaridor ham, sotuvchi ham shu matnni Telegram orqali oladi' },
  ], "Telegram'ga so'rov yuborish");
  if (!r) return;

  if (!r.decision || r.decision.length < 3) return toast('Qaror matni yozilishi shart', 'err');
  const refundAmount = parseInt(r.refundAmount, 10) || 0;
  if (refundAmount < 0) return toast('Summa noto\'g\'ri', 'err');

  await runAdminAction('dispute_resolve', id, {
    atFault: r.atFault,
    logisticsPayer: r.logisticsPayer,
    decision: r.decision,
    refundAmount,
  }, 'Bahs qarori');
});

/* ─── Reja / Fakt ─── */

function renderPlanFakt() {
  const monthly = state.summary.monthly || [];
  // Server oxirgi 12 oyni qaytaradi — oy raqami bo'yicha indekslaymiz
  const faktByMonth = new Map(monthly.map((m) => [m.month, m]));

  const now = new Date();
  const idx = planIndexForMonth(now.getMonth());
  const thisKey = now.toISOString().slice(0, 7);
  const thisMonth = faktByMonth.get(thisKey) || { gmv: 0, orders: 0, commission: 0 };

  const planMonthSom = planSomForMonth(now.getMonth());
  const pct = planMonthSom ? Math.round((thisMonth.gmv / planMonthSom) * 100) : 0;

  document.getElementById('pfPlanMonthSom').textContent = fmtSomShort(planMonthSom) + " so'm";
  document.getElementById('pfPlanMonth').textContent = PLAN_MONTHS[idx] + (PLAN_ESTIMATED[idx] ? ' (taxminiy)' : '');
  document.getElementById('pfFaktMonth').textContent = fmtSomShort(thisMonth.gmv) + " so'm";
  document.getElementById('pfFaktOrders').textContent = `${thisMonth.orders} ta buyurtma`;
  document.getElementById('pfBajarilish').textContent = pct + '%';

  // Jadval: reja qatorlari + shu oyga tegishli haqiqiy fakt
  const tbody = document.getElementById('planBody');
  tbody.innerHTML = PLAN_MONTHS.map((name, i) => {
    const gmvUsd = PLAN_UNITS_PER_MONTH[i] * PLAN_PRICE_PER_UNIT;
    const planSom = gmvUsd * USD_TO_SOM;
    // Reja indeksi i → kalendar oy: i=0 Sentabr (8)
    const calMonth = (i + 8) % 12;
    // Oxirgi 12 oy ichidan shu kalendar oyga to'g'ri keladigan faktni topamiz
    const hit = monthly.find((m) => Number(m.month.slice(5, 7)) - 1 === calMonth);
    const fakt = hit ? hit.gmv : null;
    const done = fakt != null && planSom ? Math.round((fakt / planSom) * 100) : null;
    const star = PLAN_ESTIMATED[i] ? ' *' : '';
    const current = i === idx ? ' class="is-current"' : '';
    return `
      <tr${current}>
        <td>${name}${star}</td>
        <td>${PLAN_UNITS_PER_DAY[i]}</td>
        <td>${fmtNum(PLAN_UNITS_PER_MONTH[i])}</td>
        <td>${fmtUsd(gmvUsd)}</td>
        <td class="num">${fmtSomShort(planSom)}</td>
        <td class="num">${fakt == null ? '—' : fmtSomShort(fakt)}</td>
        <td class="num">${done == null ? '—' : `<b class="${done >= 100 ? 'is-ahead' : 'is-behind'}">${done}%</b>`}</td>
      </tr>`;
  }).join('');
}

/* ─── Sidebar navigatsiya ─── */

const PAGE_META = {
  dashboard:  { title: 'Dashboard',   subtitle: "Umumiy ko'rinish" },
  orders:     { title: 'Buyurtmalar', subtitle: "Barcha buyurtmalar, komissiya va to'lovlar" },
  sellers:    { title: 'Sotuvchilar', subtitle: 'Arizalar va tasdiqlangan sotuvchilar' },
  moderation: { title: 'Moderatsiya', subtitle: 'Nashr navbati' },
  disputes:   { title: 'Bahslar',     subtitle: 'Xaridor shikoyatlari va moderator qarori' },
  stats:      { title: 'Statistika',  subtitle: 'Savdo, komissiya va kategoriya tahlili' },
  planfakt:   { title: 'Reja/Fakt',   subtitle: '12 oylik savdo rejasi va haqiqiy natija' },
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

document.getElementById('refreshBtn').addEventListener('click', refresh);

// Sessiyada saqlangan kalit bo'lsa — avtomatik kirish
const savedToken = sessionStorage.getItem('adminToken');
if (savedToken) {
  state.token = savedToken;
  loadAll().then(showDashboard).catch(() => {
    state.token = null;
    sessionStorage.removeItem('adminToken');
  });
}
