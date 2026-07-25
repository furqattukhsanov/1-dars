// Admin panel — /api/admin/summary orqali real ma'lumot.
// Parol client-side EMAS — server ADMIN_PANEL_TOKEN bilan tekshiradi
// (X-Admin-Token header). Bu yerda faqat KO'RISH: tasdiqlash/rad etish
// hamon bot buyruqlari orqali (/moderatsiya, /sotuvchilar) amalga oshadi.

const CAT_LABELS = {
  ikat: "Ikat va adras",
  suzani: "So'zana",
  silk: 'Ipak',
  cotton: 'Paxta',
  wool: 'Jun',
  linen: "Zig'ir",
};

const STATUS_LABELS = {
  pending:   { text: 'Yangi',         cls: 'status-new' },
  confirmed: { text: 'Tasdiqlangan',  cls: 'status-done' },
  shipped:   { text: "Yo'lda",        cls: 'status-pending' },
  delivered: { text: 'Yetkazildi',    cls: 'status-done' },
  cancelled: { text: 'Bekor qilindi', cls: 'status-new' },
};

let lastOrders = [];

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

function renderSummary(d) {
  document.getElementById('statModeration').textContent = d.moderationPending;
  document.getElementById('statSellerApps').textContent = d.sellerAppsPending;
  document.getElementById('statOrdersToday').textContent = d.ordersToday;
  document.getElementById('statSellers').textContent = d.sellersVerified;

  lastOrders = d.recentOrders || [];
  const activeFilter = document.querySelector('.order-filter.active');
  renderOrders(activeFilter ? activeFilter.dataset.filter : 'all');
  renderCategories(d.categories || []);
}

function renderOrders(filter) {
  const list = filter === 'all' ? lastOrders : lastOrders.filter((o) => o.status === filter);
  document.getElementById('orderCount').textContent = list.length + ' ta';
  const tbody = document.getElementById('ordersBody');
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-cell">Buyurtma topilmadi</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map((o) => {
    const st = STATUS_LABELS[o.status] || { text: o.status || '?', cls: 'status-pending' };
    return `
    <tr>
      <td class="order-id">${o.id}</td>
      <td>${o.buyerName || "Noma'lum"}</td>
      <td class="order-type">${o.itemsCount} ta mahsulot</td>
      <td class="order-date">${o.date ? o.date.uz : '-'}</td>
      <td><span class="status-badge ${st.cls}">${st.text}</span></td>
    </tr>`;
  }).join('');
}

function renderCategories(categories) {
  const grid = document.getElementById('chartGrid');
  if (!categories.length) {
    grid.innerHTML = `<div class="empty-cell">Nashr etilgan mahsulot yo'q</div>`;
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

document.querySelectorAll('.order-filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.order-filter').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    renderOrders(btn.dataset.filter);
  });
});

// Sessiyada saqlangan kalit bo'lsa — avtomatik kirish
const savedToken = sessionStorage.getItem('adminToken');
if (savedToken) {
  fetchSummary(savedToken)
    .then((summary) => { renderSummary(summary); showDashboard(); })
    .catch(() => sessionStorage.removeItem('adminToken'));
}
