/* ── Page loader ── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('page-loader');
    if (!loader) return;
    loader.classList.add('hide');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  }, 600);
});

/* ── Telegram Mini App init ── */
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
}

/* ── Nav scroll ── */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

/* ── Scroll fade-up ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = (i * 0.06) + 's';
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ── Kategoriya chiplari — filtrlash ── */
const chipsWrap = document.getElementById('chips');
const grid = document.getElementById('product-grid');

if (chipsWrap && grid) {
  const chips = chipsWrap.querySelectorAll('.chip');
  const cards = grid.querySelectorAll('.product-card');

  chipsWrap.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    chips.forEach(c => c.classList.toggle('active', c === chip));

    const cat = chip.dataset.cat;
    cards.forEach(card => {
      card.classList.toggle('is-hidden', cat !== 'all' && card.dataset.cat !== cat);
    });
  });
}

/* ── Email form ── */
function handleSubmit(e) {
  e.preventDefault();
  e.target.style.display = 'none';
  const success = document.getElementById('success');
  if (success) success.hidden = false;
}
