'use strict';

/* ─── Cloudflare Web Analytics (2026-08-19) ───────────────────────────────
   Panel uchun «necha kishi keldi» raqamlari. Manba — Cloudflare GraphQL
   Analytics API, dataset `rumPageloadEventsAdaptiveGroups`.

   ⚠️ BU BIZNING `traffic_events` NI ALMASHTIRMAYDI (CLAUDE.md). Ikkalasi
   BOSHQA savolga javob beradi:
     Cloudflare → necha kishi keldi, qaysi davlat, qaysi havola (TAXMINIY)
     biz        → qaysi mato ko'rildi, ko'rish→savat→buyurtma (ANIQ)
   Panelda ular YONMA-YON qo'yilmaydi — mos kelmagan ikki raqam «biri
   buzuq» degan yolg'on xulosa beradi.

   🔴 RAQAMLAR NAMUNAVIY. 2026-08-19 da o'lchandi: qaytgan qiymatlarning
   HAMMASI 10 ga bo'linadi (10, 20, 60, 270…). Cloudflare bepul tarifda
   tashriflarning bir qismini oladi va koeffitsiyentga ko'paytiradi. Ya'ni
   «1700 ko'rish» — taxmin, aniq son EMAS. Panel buni AYTADI.

   🔴 `siteTag` — beacon skriptidagi `token` EMAS. Sahifadagi
   `data-cf-beacon` da `6acaeab5…` turadi, GraphQL esa `0d0ad786…` ni
   kutadi. Beacon qiymati bilan so'ralganda javob XATOSIZ va BO'SH keladi
   — panel «hech kim kelmadi» deb turardi. Qiymat `.env` dan olinadi va
   `config.js` da shakli tekshiriladi.

   ⚠️ Admin panel tashriflari HISOBGA OLINMAYDI (founder qarori
   2026-08-19). O'lchandi: 29 kunda 1700 ko'rishning 310 tasi `/admin/` va
   `/loyiha-panel.html` — ya'ni 18% o'zimizniki edi. Filtr GraphQL
   TOMONIDA qo'llanadi (`requestPath_notlike`), ya'ni kunlik raqamlar ham
   tozalangan holda keladi; serverda kesilsa kunlik yig'indi baribir
   admin tashriflarini o'z ichiga olardi. Filtr ishlagani o'lchandi:
   1700 → 1390. */

const { CF_ANALYTICS_TOKEN, CF_ACCOUNT_ID, CF_SITE_TAG, CF_ANALYTICS_ENABLED } = require('../config');

const ENDPOINT = 'https://api.cloudflare.com/client/v4/graphql';

// Hisobdan chiqariladigan yo'llar. `%` — SQL uslubidagi joker (`_like`).
// Ro'yxat SHU YERDA turadi va bitta joyda ishlatiladi: yangi ichki sahifa
// qo'shilsa (masalan `/hisobot/`) uni shu yerga qo'shish kifoya.
const ICHKI_YOLLAR = ['/admin%', '/loyiha-panel%'];

/** GraphQL javobidagi qatorni sodda shaklga keltiradi. */
function qator(x, kalit) {
  return { name: x.dimensions[kalit] || '', n: x.count };
}

/**
 * Cloudflare'dan oxirgi `kun` kunlik trafikni oladi.
 *
 * ⚠️ Xato YUTILMAYDI va NOL ham qaytarilmaydi — chaqiruvchi `{ xato }`
 * oladi va panel SABABNI ko'rsatadi. «0 tashrif» bilan «o'lchanmadi»
 * bir xil ko'rinishi mumkin emas (CLAUDE.md: jimgina yolg'on yo'qlikdan
 * yomonroq).
 *
 * @param {number} kun - nechta kun orqaga
 * @returns {Promise<object>} { daily, countries, paths, referrers, ... } yoki { xato }
 */
async function cfTraffic(kun = 30) {
  if (!CF_ANALYTICS_ENABLED) return { xato: 'sozlanmagan' };

  const n = Math.min(Math.max(Number(kun) || 30, 1), 90);
  const boshlanish = new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

  // ⚠️ Sana STRING sifatida uzatiladi, GraphQL o'zgaruvchisi orqali —
  // shablon satriga qo'yilsa foydalanuvchi kiritgan qiymat so'rovga
  // aralashib ketardi (bu yerda `kun` faqat son, lekin naqsh qoladi).
  const notlike = ICHKI_YOLLAR.map((p) => `{ requestPath_notlike: "${p}" }`).join(', ');
  const umumiy = `siteTag: $tag, date_geq: $dan, AND: [${notlike}]`;

  const query = `
    query ($hisob: string!, $tag: string!, $dan: string!) {
      viewer {
        accounts(filter: { accountTag: $hisob }) {
          kunlik: rumPageloadEventsAdaptiveGroups(
            filter: { ${umumiy} }, limit: 100, orderBy: [date_ASC]
          ) { count sum { visits } dimensions { date } }

          davlat: rumPageloadEventsAdaptiveGroups(
            filter: { ${umumiy} }, limit: 10, orderBy: [count_DESC]
          ) { count dimensions { countryName } }

          sahifa: rumPageloadEventsAdaptiveGroups(
            filter: { ${umumiy} }, limit: 10, orderBy: [count_DESC]
          ) { count dimensions { requestPath } }

          manba: rumPageloadEventsAdaptiveGroups(
            filter: { ${umumiy} }, limit: 10, orderBy: [count_DESC]
          ) { count dimensions { refererHost } }
        }
      }
    }`;

  let javob;
  try {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CF_ANALYTICS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { hisob: CF_ACCOUNT_ID, tag: CF_SITE_TAG, dan: boshlanish },
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!r.ok) return { xato: `Cloudflare HTTP ${r.status}` };
    javob = await r.json();
  } catch (e) {
    // Birinchi argument — alert guruhlash KALITI (CLAUDE.md, Test 10c):
    // o'zgaruvchan qism ikkinchi argumentda turadi.
    console.error('cfTraffic so\'rovi yiqildi:', e.message);
    return { xato: 'so\'rov yiqildi' };
  }

  // ⚠️ GraphQL xatoni HTTP 200 bilan qaytaradi — `errors` ni tekshirmaslik
  // «hammasi joyida» degan yolg'on xulosaga olib borardi (deploy'dagi
  // «HTTP 200 yetarli emas» darsining aynan o'zi).
  if (javob && Array.isArray(javob.errors) && javob.errors.length) {
    console.error('cfTraffic GraphQL xatosi:', String(javob.errors[0] && javob.errors[0].message).slice(0, 200));
    return { xato: 'GraphQL rad etdi' };
  }

  const hisob = javob && javob.data && javob.data.viewer && javob.data.viewer.accounts;
  if (!Array.isArray(hisob) || !hisob.length) return { xato: 'hisob topilmadi' };
  const d = hisob[0];

  const kunlik = (d.kunlik || []).map((x) => ({
    date: x.dimensions.date,
    views: x.count,
    visits: x.sum ? x.sum.visits : 0,
  }));

  // Ma'lumot BO'SH bo'lsa ham `xato` EMAS — bu haqiqiy holat («hali hech
  // kim kelmadi»). Farqni chaqiruvchi `total` orqali ko'radi va panel
  // ikkalasini BOSHQACHA yozadi.
  return {
    daily: kunlik,
    total: kunlik.reduce((s, x) => s + x.views, 0),
    visits: kunlik.reduce((s, x) => s + x.visits, 0),
    countries: (d.davlat || []).map((x) => qator(x, 'countryName')),
    paths: (d.sahifa || []).map((x) => qator(x, 'requestPath')),
    referrers: (d.manba || []).map((x) => qator(x, 'refererHost')),
    // Panel shu bayroqqa qarab «taxminiy» ogohlantirishini chizadi.
    approx: true,
    days: n,
  };
}

module.exports = { cfTraffic, ICHKI_YOLLAR };
