/* ── Page loader ── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('page-loader');
    loader.classList.add('loader-hidden');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  }, 600);
});

/* ── Telegram Mini App init ── */
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
}

/* ── Hero parallax ── */
const heroEl  = document.querySelector('.hero');
const heroImg = document.querySelector('.hero-img');

heroEl.addEventListener('mousemove', (e) => {
  const { left, top, width, height } = heroEl.getBoundingClientRect();
  const x = ((e.clientX - left) / width  - 0.5) * 18;
  const y = ((e.clientY - top)  / height - 0.5) * 10;
  heroImg.style.transform = `translate(${x}px, ${y}px)`;
});

heroEl.addEventListener('mouseleave', () => {
  heroImg.style.transform = 'translate(0, 0)';
});

/* ── Nav scroll ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

/* ── Scroll fade-up ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = (i * 0.08) + 's';
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ── Slide-right (showcase cards) ── */
const rowObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const cards = entry.target.querySelectorAll('.slide-right');
      cards.forEach((card, i) => {
        setTimeout(() => card.classList.add('visible'), i * 80);
      });
      rowObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05 });

const showcaseGrid = document.querySelector('.showcase-grid');
if (showcaseGrid) rowObserver.observe(showcaseGrid);

/* ── Catalog filters ── */
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

/* ── Detail modal ── */
const detailModal    = document.getElementById('detailModal');
const detailClose    = document.getElementById('detailClose');
const detailBackdrop = document.getElementById('detailBackdrop');

function openDetail(card) {
  document.getElementById('detailImg').src          = card.dataset.img;
  document.getElementById('detailImg').alt          = card.dataset.name;
  document.getElementById('detailName').textContent = card.dataset.name;
  document.getElementById('detailSub').textContent  = card.dataset.sub;
  document.getElementById('detailPrice').textContent = card.dataset.price;
  const msg = encodeURIComponent('Buyurtma: ' + card.dataset.name);
  document.getElementById('detailOrder').href = 'https://t.me/furqattukhsanov?text=' + msg;
  detailModal.classList.add('open');
}

function closeDetail() { detailModal.classList.remove('open'); }

document.querySelectorAll('.cat-card').forEach(card => {
  card.addEventListener('click', () => openDetail(card));
});
detailClose.addEventListener('click', closeDetail);
detailBackdrop.addEventListener('click', closeDetail);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });

/* ── Catalog modal ── */
const demoBtn        = document.getElementById('demoBtn');
const catalogModal   = document.getElementById('catalogModal');
const catalogClose   = document.getElementById('catalogClose');
const catalogBackdrop = document.getElementById('catalogBackdrop');

function openCatalog() {
  catalogModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCatalog() {
  catalogModal.classList.remove('open');
  document.body.style.overflow = '';
}

demoBtn.addEventListener('click', openCatalog);
catalogClose.addEventListener('click', closeCatalog);
catalogBackdrop.addEventListener('click', closeCatalog);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCatalog(); });

/* ── Email form ── */
function handleSubmit(e) {
  e.preventDefault();
  e.target.style.display = 'none';
  document.getElementById('success').style.display = 'block';
}
