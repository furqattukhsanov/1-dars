const { pool } = require('../db');
const { SITE_ORIGIN } = require('../config');
const { rateLimited, readBody, ok, fail } = require('../lib/http');
const {
  KINDS, ekranNomi, botmi, visitorBelgisi, refHost, manbaBelgisi, yuzAniqla,
} = require('../lib/traffic');

// ============ POST /api/track — TRAFIK HODISASI (2026-08-18) ============
// Sayt va Mini App shu yerga "ekran ochildi" / "savatga qo'shildi" deb
// xabar beradi. Javob hech qachon kutilmaydi — chaqiruv `.catch(() => {})`
// bilan yuboriladi, ya'ni bu endpoint yiqilsa ham FOYDALANUVCHI hech narsa
// sezmaydi. Bu ataylab: o'lchov vositasi o'lchayotgan narsani sindirmasin.
//
// ============ KIMLIK BU YERDA YO'Q — ATAYLAB ============
// ⚠️ Endpoint `authUser()` ni ham, `requestUser()` ni ham CHAQIRMAYDI va bu
// e'tibordan qolgan joy emas, QAROR: trafik o'lchovi kim ekanini bilishi
// SHART EMAS. Kimlik so'ralsa ikki narsa buzilardi — (1) kirmagan mehmon
// (ya'ni trafikning katta qismi) umuman o'lchanmasdi, (2) bazada "kim qaysi
// sahifani ochdi" degan yozuv paydo bo'lardi, holbuki bizga faqat SON kerak.
// CLAUDE.md dagi `requestUser()` qoidasi "kimlik olinsa bitta nuqtadan
// olinsin" deydi — bu yerda kimlik UMUMAN olinmaydi.
//
// ⚠️ Shuning uchun jadvalda IP ham, Telegram ID ham yo'q: faqat kun bilan
// tuzlangan `visitor` belgisi (`lib/traffic.js` → `visitorBelgisi`).

// So'rov tanasi juda kichik — 1 KB dan oshsa bu bizning klientimiz emas.
const MAX_BODY = 1024;

// Bitta IP daqiqasiga necha hodisa yubora oladi. Oddiy foydalanish bunga
// yaqinlashmaydi (ekran almashtirish sekin ish), ya'ni chegaraga urilish
// yo bot, yo nosozlik — ikkalasi ham raqamni shishirishdan yaxshiroq.
const DAQIQA_LIMIT = 60;

// ---- Eskirgan qatorlarni tozalash ----
// Kuniga BIR MARTA, birinchi hodisa kelganda. Alohida cron QO'YILMADI:
// serverda allaqachon bitta cron bor (zaxira) va u repoda YO'Q — ya'ni
// ikkinchisini qo'shish uni ham repodan tashqarida saqlashni talab qilardi.
//
// 400 kun — yildan bir oz ko'p, ya'ni "o'tgan yilning shu oyi" solishtiruvi
// saqlanadi. Bu chegara raqam emas, QAROR: cheksiz saqlash zaxira nusxasini
// yildan yilga og'irlashtirardi (nusxa Telegram'ga ketadi).
const SAQLASH_KUN = 400;
let oxirgiTozalashKuni = '';

async function eskilarniTozala(kun) {
  if (oxirgiTozalashKuni === kun) return;
  oxirgiTozalashKuni = kun;
  try {
    await pool.query(`DELETE FROM traffic_events WHERE at < now() - interval '${SAQLASH_KUN} days'`);
  } catch (e) {
    // Tozalash yiqilsa hodisa yozilishi DAVOM etsin — lekin jimgina emas.
    console.error('trafik tozalash xatosi:', e.message);
  }
}

async function handleTrack(req, res, ip) {
  // ⚠️ 429 ATAYLAB qaytariladi, jim 204 emas: bizning o'z saytimiz chegaraga
  // urilsa bu NOSOZLIK va u ko'rinishi kerak (`ALERT_CHAT_ID` darsi —
  // jimgina yutilgan holat oylab davom etishi mumkin).
  if (rateLimited(`track:${ip}`, DAQIQA_LIMIT)) return fail(res, 'too many requests', 429);

  const ua = req.headers['user-agent'] || '';

  // Bot — QABUL qilinadi, lekin YOZILMAYDI. 204 qaytarilishi robotga
  // "hammasi joyida" deydi va u qayta urinmaydi; bizning raqam esa toza
  // qoladi. Robotni 4xx bilan quvish hech narsa bermasdi — u baribir
  // sahifani oladi.
  if (botmi(ua)) return ok(res, null, 200);

  let d;
  try {
    d = JSON.parse(await readBody(req, MAX_BODY) || '{}');
  } catch (e) {
    return fail(res, 'bad request', 400);
  }

  const kind = KINDS.includes(String(d.kind || '').trim()) ? String(d.kind).trim() : null;
  if (!kind) return fail(res, 'bad request', 400);

  // Yuz `Referer` sarlavhasidan aniqlanadi — klient aytgan qiymat faqat
  // zaxira (`lib/traffic.js` → `yuzAniqla` izohi).
  const face = yuzAniqla(req.headers.referer || req.headers.referrer, d.face);
  const screen = ekranNomi(d.screen);

  // Mahsulot id — shakl bo'yicha. Bazada FK yo'q (db/028 izohi), ya'ni
  // qorovul AYNAN shu yer.
  const xomId = String(d.product || '').trim();
  const productId = /^[a-zA-Z0-9_-]{1,40}$/.test(xomId) ? xomId : null;

  const kun = new Date().toISOString().slice(0, 10);
  const visitor = visitorBelgisi(ip, ua, kun);

  try {
    await pool.query(
      `INSERT INTO traffic_events (kind, face, screen, product_id, visitor, ref, src)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [kind, face, screen, productId, visitor,
        refHost(d.ref, new URL(SITE_ORIGIN).hostname), manbaBelgisi(d.src)]
    );
  } catch (e) {
    // Birinchi argument BARQAROR kalit (CLAUDE.md, Test 10c): xato matni
    // ikkinchi argumentda, aks holda har xil xato alohida alert bo'lardi.
    console.error('trafik yozish xatosi:', e.message);
    return fail(res, 'server error', 500);
  }

  // Tozalash yozuvdan KEYIN va kutilmasdan — beacon javobi kechikmasin.
  eskilarniTozala(kun);

  return ok(res, null, 200);
}

module.exports = { handleTrack };
