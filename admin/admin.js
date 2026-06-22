const PASSWORD = 'lolamarket';

const orders = [
  { id: '#001', name: 'Jahongir Toshmatov', product: "Ko'k Gul",      type: 'Chit mato',  date: '23.06.2026', status: 'Yangi' },
  { id: '#002', name: 'Malika Yusupova',    product: 'Sharq Naqshi',  type: 'Atlas',      date: '23.06.2026', status: 'Yangi' },
  { id: '#003', name: 'Bobur Karimov',      product: 'Pushti Gullar', type: 'Chit mato',  date: '22.06.2026', status: 'Tasdiqlangan' },
  { id: '#004', name: 'Nilufar Rahimova',   product: 'Feruza Naqsh',  type: 'Gilam mato', date: '22.06.2026', status: "Ko'rib chiqilmoqda" },
  { id: '#005', name: 'Sherzod Mirzayev',   product: "Tun Ko'ki",     type: 'Atlas',      date: '21.06.2026', status: 'Tasdiqlangan' },
  { id: '#006', name: 'Dilnoza Hasanova',   product: "Yashil Bog'",   type: 'Chit mato',  date: '21.06.2026', status: 'Tasdiqlangan' },
  { id: '#007', name: 'Otabek Ergashev',    product: 'Qizil Atirgul', type: 'Sitsa',      date: '20.06.2026', status: "Ko'rib chiqilmoqda" },
  { id: '#008', name: 'Sarvinoz Nazarova',  product: "Ko'k Naqsh",    type: 'Gilam mato', date: '20.06.2026', status: 'Tasdiqlangan' },
];

const statusClass = {
  'Yangi':               'status-new',
  "Ko'rib chiqilmoqda":  'status-pending',
  'Tasdiqlangan':        'status-done',
};

function checkPassword() {
  const val = document.getElementById('passwordInput').value;
  if (val === PASSWORD) {
    sessionStorage.setItem('admin', '1');
    showDashboard();
  } else {
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('passwordInput').value = '';
  }
}

document.getElementById('passwordInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkPassword();
});

function logout() {
  sessionStorage.removeItem('admin');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('passwordInput').value = '';
}

function showDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  renderOrders('all');
}

function renderOrders(filter) {
  const list = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  document.getElementById('orderCount').textContent = list.length + ' ta';
  const tbody = document.getElementById('ordersBody');
  tbody.innerHTML = list.map(o => `
    <tr>
      <td class="order-id">${o.id}</td>
      <td>${o.name}</td>
      <td class="order-product">${o.product}</td>
      <td class="order-type">${o.type}</td>
      <td class="order-date">${o.date}</td>
      <td><span class="status-badge ${statusClass[o.status]}">${o.status}</span></td>
    </tr>
  `).join('');
}

document.querySelectorAll('.order-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.order-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderOrders(btn.dataset.filter);
  });
});

if (sessionStorage.getItem('admin') === '1') {
  showDashboard();
}
