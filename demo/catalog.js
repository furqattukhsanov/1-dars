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
  const msg = encodeURIComponent('Buyurtma: ' + card.dataset.name);
  document.getElementById('detailOrder').href = 'https://t.me/furqattukhsanov?text=' + msg;
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
