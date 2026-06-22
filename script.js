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

/* ── Email form ── */
function handleSubmit(e) {
  e.preventDefault();
  e.target.style.display = 'none';
  document.getElementById('success').style.display = 'block';
}
