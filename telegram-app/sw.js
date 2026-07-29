/* ====================================================
   LolaMarket Mini App — Service Worker
   ----------------------------------------------------
   Vazifasi: internet uzilganda ilova butunlay oq ekran
   bo'lib qolmasin. Ma'lumot (API) hech qachon keshlanmaydi —
   narx, zaxira va buyurtma holati eskirgan bo'lishi mumkin emas.
   ==================================================== */

// Har deploy'da bu raqamni oshiring — eski kesh butunlay tozalanadi.
const CACHE_VERSION = 'v2';
const CACHE_NAME = `lolamarket-mini-${CACHE_VERSION}`;

// Faqat offline holat uchun kerak bo'lgan minimal to'plam.
// Ro'yxat qisqa: bittasi yuklanmasa ham SW o'rnatilishi buzilmasin.
const PRECACHE = [
  './offline.html',
  './assets/lola-mark.png',
  './assets/pwa/icon-192.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Panel/ilova "yangilan" desa — kutmasdan yangi SW ishga tushsin.
self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

function isApi(url) {
  return url.pathname.startsWith('/api/');
}

// Tarmoqdan ol, muvaffaqiyatli bo'lsa keshni yangila.
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

// Keshdan ber, orqa fonda yangilab qo'y.
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    fetch(request)
      .then((r) => { if (r && r.ok) cache.put(request, r.clone()); })
      .catch(() => {});
    return cached;
  }
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // API — hech qachon keshlanmaydi va ushlanmaydi.
  if (isApi(url)) return;

  // Boshqa domenlar (shriftlar, telegram.org) — brauzerning o'ziga qoldiramiz.
  if (url.origin !== self.location.origin) return;

  // Sahifa ochilishi: faqat tarmoqdan. Keshlangan HTML qaytarilmaydi —
  // aks holda internetsiz holatda ilova app.js ichidagi namuna katalogni
  // (haqiqiy bo'lmagan narxlar bilan) chizib qo'yadi. Tarmoq yo'q bo'lsa —
  // ochiq-oydin "internet yo'q" sahifasi.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('./offline.html', { ignoreSearch: true })
      )
    );
    return;
  }

  // JS/CSS: har doim tarmoqni birinchi sinaymiz — deploy'dan keyin
  // eski app.js qolib ketmasligi uchun (fayllar ?v=NN bilan keladi).
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Rasm va shriftlar: keshdan tez ber.
  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(cacheFirst(request).catch(() => caches.match(request)));
  }
});
