// ============ MAHSULOT SAHIFASI — og: META (2026-08-16) ============
// Mahsulot 2026-08-16 dan o'z manzilida yashaydi (`/mahsulot/<id>`).
// Sahifaning O'ZINI baribir statik `index.html` chizadi — bu modul unga
// FAQAT `<head>` ichidagi `og:` teglarini qo'shib beradi, ya'ni Telegramga
// (yoki boshqa joyga) havola tashlanganda oldindan ko'rish umumiy sayt
// tavsifi emas, AYNAN o'sha matoni ko'rsatadi.
//
// ⚠️ NEGA SERVER KERAK: `og:` teglarini oldindan ko'rish roboti HTML ning
// O'ZIDAN o'qiydi, JS ni bajarmaydi. Ya'ni buni frontendda qilib bo'lmaydi —
// `document.title` odamga ishlaydi, robotga esa yo'q.
//
// 🔴 BU MODUL IXTIYORIY VA SHUNDAY QOLISHI KERAK. nginx `/mahsulot/` ni
// bu yerga yo'naltirmasa — sayt avvalgidek statik `index.html` bilan
// TO'LIQ ishlaydi, faqat oldindan ko'rish umumiy bo'ladi. Mahsulot
// sahifasini backend'ga BOG'LAB qo'yish xato bo'lardi: backend yiqilsa
// katalogdagi har bir mato 502 ga aylanardi (hozir esa faqat `/api/*`
// yiqiladi va sahifa o'zi ochiladi).

const fs = require('fs');
const path = require('path');

const pool = require('../db');
const { WEB_ROOT, SITE_ORIGIN, OG_ENABLED } = require('../config');
const { rateLimited } = require('../lib/http');
const { escapeHtml, money } = require('../lib/format');
const { r2PublicUrl } = require('../lib/r2');
// ⚠️ Rasm manzili katalog bilan AYNI funksiyadan olinadi, nusxa
// KO'CHIRILMAYDI: u imzo qo'yadi (`productPhotoSig`) va imzo ikki joyda
// yashasa, biri o'zgarganda ikkinchisi jimgina yaroqsiz havola berardi.
const { productPhotoUrl } = require('./catalog');

/** `/mahsulot/<id>` dan id ni oladi; boshqa yo'l bo'lsa `null` */
function productIdFromPath(urlPath) {
  const m = /^\/mahsulot\/([^/]+)\/?$/.exec(urlPath);
  if (!m) return null;
  try { return decodeURIComponent(m[1]); } catch (_) { return m[1]; }
}

/* `index.html` ni HAR SO'ROVDA diskdan o'qiymiz, xotirada saqlamaymiz.
   Sabab: deploy statik fayllarni rsync bilan almashtiradi va servisni
   qayta ishga tushirmaydi (`server/README.md`). Kesh qo'yilsa yangi
   deploy'dan keyin ESKI HTML tarqatilib turardi — ya'ni deploy qilingan
   o'zgarish faqat mahsulot sahifalarida ko'rinmasdi va sababi hech qayerda
   ko'rinmasdi. Fayl lokal diskda va bir necha o'n kilobayt. */
function readIndexHtml() {
  return fs.readFileSync(path.join(WEB_ROOT, 'index.html'), 'utf8');
}

/** Rasm manzili — katalogdagi bilan AYNI uch pog'ona (R2 → Telegram → statik) */
function ogImage(r) {
  const u = r2PublicUrl(r.img_r2_key)
    || (r.img_file_id ? productPhotoUrl(r.img_file_id) : r.img);
  if (!u) return `${SITE_ORIGIN}/assets/pwa/icon-512.png`;
  if (/^https?:\/\//.test(u)) return u;
  // Nisbiy yo'l — Mini App papkasida yotadi (`script.js` → `apiImgUrl` bilan
  // AYNI qoida). Robot uchun MUTLAQ manzil bo'lishi shart.
  if (u.charAt(0) === '/') return SITE_ORIGIN + u;
  return `${SITE_ORIGIN}/mini-app/${u.replace(/^\.?\//, '')}`;
}

/* Teglar `</head>` dan OLDIN qo'yiladi.
   ⚠️ HAR BIR qiymat `escapeHtml` dan o'tadi. Bu atribut ichiga boradi
   (`content="…"`), ya'ni sotuvchi mahsulot nomiga `"` yozsa tegdan chiqib
   ketib, o'z HTML ini qo'sha olardi — bu XSS bo'lardi va u AYNAN robot
   emas, ODAM ochadigan sahifada bajarilardi. */
function ogTags(r) {
  const nom = r.name_uz || r.id;
  const sotuvchi = r.business_name_uz || '';
  const narx = money(r.price);
  const tavsif = [sotuvchi, narx, r.comp_uz].filter(Boolean).join(' · ');
  const url = `${SITE_ORIGIN}/mahsulot/${encodeURIComponent(r.id)}`;

  const teglar = [
    ['og:type', 'product'],
    ['og:site_name', 'LolaMarket'],
    ['og:title', `${nom} — LolaMarket`],
    ['og:description', tavsif],
    ['og:url', url],
    ['og:image', ogImage(r)],
  ];

  return teglar
    .map(([k, v]) => `  <meta property="${k}" content="${escapeHtml(v)}" />`)
    .join('\n')
    // Telegram `og:` ni o'qiydi; `twitter:card` boshqa joylarda kerak
    + `\n  <meta name="twitter:card" content="summary_large_image" />`
    + `\n  <title>${escapeHtml(nom)} — LolaMarket</title>`;
}

/* Asl `<title>` OLIB TASHLANADI, aks holda sahifada ikkita `<title>` qolib,
   brauzer BIRINCHISINI oladi — ya'ni yangi sarlavha yozilgan bo'lsa ham
   ko'rinmasdi. */
function injectOg(html, r) {
  return html
    .replace(/\n?\s*<title>[\s\S]*?<\/title>/i, '')
    .replace(/<\/head>/i, `${ogTags(r)}\n</head>`);
}

/* ⚠️ Bu funksiya HAR DOIM javob yozadi — "men bu yo'lni olmadim" degan
   qaytish qiymati YO'Q va bu ataylab. U `async`, ya'ni qaytargan narsasi
   har doim Promise — chaqiruvchi `if (handle(...)) return;` deb yozsa
   shart HAR DOIM rost bo'lardi va mos kelmagan yo'lda so'rov javobsiz
   OSILIB qolardi (brauzer taymautgacha kutardi, jurnalda esa hech narsa
   yo'q). Yo'lni tanlash chaqiruvchida, javob esa doim shu yerda. */
async function handleProductPage(req, res, ip, urlPath) {
  if (rateLimited(`pdp:${ip}`, 120)) { res.writeHead(429).end('too many requests'); return; }
  const id = productIdFromPath(urlPath);

  let html;
  try {
    html = readIndexHtml();
  } catch (e) {
    // Statik fayl o'qilmadi — bu bizning nuqsonimiz, xaridor ko'rmasin.
    // 502 qaytaramiz, nginx esa zaxira sifatida statik faylni beradi
    // (`error_page 502 = @static`, `server/README.md`).
    console.error('pdp index.html o\'qilmadi:', e.message);
    res.writeHead(502).end('bad gateway');
    return;
  }

  // Id ajralmasa (`/mahsulot/`, `/mahsulot/a/b`) — sahifa BARIBIR beriladi,
  // faqat og: teglarisiz. Frontend katalogni ochadi.
  if (id) try {
    const { rows } = await pool.query(
      `SELECT p.id, p.name_uz, p.price, p.comp_uz, p.img, p.img_file_id, p.img_r2_key,
              s.business_name_uz
         FROM products p
         LEFT JOIN sellers s ON s.id = p.seller_id
        WHERE p.id = $1 AND p.status = 'published'`,
      [id]
    );
    // Mahsulot topilmasa sahifa BARIBIR beriladi — frontend katalogni
    // ochadi. 404 qaytarish oson yo'l edi, lekin o'shanda e'lon
    // moderatsiyaga qaytarilgan paytda tarqalgan havola "sayt buzuq"
    // bo'lib ko'rinardi.
    if (rows.length) html = injectOg(html, rows[0]);
  } catch (e) {
    // Baza yiqilsa ham sahifa ochiladi — faqat og: teglarisiz.
    console.error('pdp so\'rovi xatosi:', e.message);
  }

  res.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    // Qisqa kesh: narx o'zgarsa oldindan ko'rish uzoq eskirmasin.
    'cache-control': 'public, max-age=300',
  });
  res.end(html);
}

module.exports = { handleProductPage, productIdFromPath, injectOg, ogTags, OG_ENABLED };
