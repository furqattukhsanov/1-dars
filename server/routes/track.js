const { pool } = require('../db');
const { SITE_ORIGIN } = require('../config');
const { rateLimited, readBody, ok, fail } = require('../lib/http');
const {
  KINDS, ekranNomi, botmi, visitorBelgisi, refHost, manbaBelgisi, yuzAniqla,
} = require('../lib/traffic');
const { requestUser } = require('../lib/auth');
const { recordUserEvent } = require('../lib/user-events');

// ============ POST /api/track — TRAFIK HODISASI (2026-08-18) ============
// Sayt va Mini App shu yerga "ekran ochildi" / "savatga qo'shildi" deb
// xabar beradi. Javob hech qachon kutilmaydi — chaqiruv `.catch(() => {})`
// bilan yuboriladi, ya'ni bu endpoint yiqilsa ham FOYDALANUVCHI hech narsa
// sezmaydi. Bu ataylab: o'lchov vositasi o'lchayotgan narsani sindirmasin.
//
// ============ KIMLIK: IKKI JADVAL, IKKI VA'DA (2026-08-23 da o'zgardi) ============
// 2026-08-18 dan 2026-08-23 gacha bu endpoint kimlikni UMUMAN so'ramasdi.
// Founder qarori (2026-08-23): «qaysi mijoz nimani ko'rdi, savatga soldi,
// chiqardi — qadamba-qadam ko'rmoqchiman». Shuning uchun endi:
//   * `traffic_events` — HAMON ANONIM: IP ham, Telegram ID ham yo'q, faqat
//     kun bilan tuzlangan `visitor` (Test 42, 4-band qulflaydi). Mehmon ham
//     shu yerda sanaladi;
//   * `user_events` — QO'SHIMCHA: kimlik `requestUser()` orqali BOR bo'lsa
//     (Mini App `initData` sarlavhasi / sayt cookie), o'sha odamning
//     ko'rish/savat amali ism bilan yoziladi (db/029). Kimlik yo'q bo'lsa
//     hech narsa o'zgarmaydi — mehmon o'lchanishdan to'xtamaydi.
// Kimlik BITTA nuqtadan (`requestUser`, CLAUDE.md) — `authUser()` emas.
// `cart_remove` FAQAT `user_events` ga boradi: `traffic_events` voronkasi
// (ko'rish → savat) o'zgarmaydi, db/028 CHECK ro'yxati ham.

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

  const kindXom = String(d.kind || '').trim();
  const kind = KINDS.includes(kindXom) ? kindXom : null;
  // `cart_remove` — faqat shaxsiy lenta uchun (yuqoridagi izoh)
  if (!kind && kindXom !== 'cart_remove') return fail(res, 'bad request', 400);

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

  if (kind) {
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
  }

  // ---- Shaxsiy lenta (db/029) — faqat kimlik bor bo'lsa va faqat MATO
  // darajasida (katalog/savat ekranini ochish lentaga tushmaydi — u shovqin).
  // Kimlik tekshiruvi yiqilsa beacon yiqilmaydi: o'lchov o'lchanayotgan
  // narsani sindirmasin.
  if (productId) {
    let u = null;
    try { u = await requestUser(req); } catch (e) { console.error('track kimlik xatosi:', e.message); }
    if (u && u.id) {
      if (kindXom === 'view') void recordUserEvent(u.id, 'product_view', { productId });
      else if (kindXom === 'cart') void recordUserEvent(u.id, 'cart_add', { productId });
      else if (kindXom === 'cart_remove') void recordUserEvent(u.id, 'cart_remove', { productId });
    }
  }

  // Tozalash yozuvdan KEYIN va kutilmasdan — beacon javobi kechikmasin.
  eskilarniTozala(kun);

  return ok(res, null, 200);
}

module.exports = { handleTrack };
