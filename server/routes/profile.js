const https = require('https');
const { BOT_TOKEN } = require('../config');
const { pool } = require('../db');
const { requestUser } = require('../lib/auth');
const { isPickupPointId } = require('../lib/maps');
const { callTelegram, tgGetFile } = require('../lib/telegram-api');
const { rateLimited, readBody, ok, fail } = require('../lib/http');
const { usableMime, mimeFromPath } = require('./catalog');

// ============ XARIDOR PROFILI — DOIMIY OLISH NUQTASI ============
// "Mening manzilim" (2026-08-13 founder qarori): xaridor doimiy BTS olish
// nuqtasini kartadan belgilaydi va u BAZADA saqlanadi, ya'ni telefonda ham,
// kompyuterda ham bir xil bo'ladi (`db/022`).
//
// ⚠️ Kimlik `requestUser()` dan — `authUser()` dan EMAS (CLAUDE.md). Bu
// endpointni SAYT ham chaqiradi: `authUser()` da qolsa sayt xaridori
// jimgina 401 olardi va manzil faqat Mini App'da saqlanardi. Aynan shu
// nuqson bahs ochishda (C1) va AI rasmida (C2) ikki marta takrorlangan.
// Qorovul: `server/test.js` → Test 3f (saytning fetch chaqiruvlarini
// avtomatik yig'adi).
async function handleSavePickupPoint(req, res, ip) {
  if (rateLimited(`pickup:${ip}`, 30)) return fail(res, 'too many requests', 429);
  const u = await requestUser(req);
  if (!u || !u.id) return fail(res, 'unauthorized', 401);

  try {
    const data = JSON.parse(await readBody(req, 2_000) || '{}');

    // `null` — tanlovni BEKOR QILISH (xaridor "boshqa nuqtadan olaman"
    // deganda). Bo'sh satr ham shu ma'noda qabul qilinadi, chunki forma
    // bo'shatilganda brauzer aynan bo'sh satr yuboradi.
    const xom = data.pointId;
    const tozalash = xom == null || xom === '';
    if (!tozalash && !isPickupPointId(xom)) {
      return fail(res, 'nuqta id yaroqsiz', 400);
    }
    const qiymat = tozalash ? null : xom;

    const { rows } = await pool.query(
      `UPDATE users SET pickup_point_id = $2
        WHERE tg_user_id = $1
        RETURNING pickup_point_id`,
      [String(u.id), qiymat]
    );
    // Foydalanuvchi bazada yo'q bo'lishi — HAQIQIY holat emas: sessiya
    // ham, initData ham `users` yozuvidan tug'iladi. Shunday bo'lsa ham
    // JIMGINA "ok" qaytarilmaydi: xaridor "saqlandi" deb o'ylab, keyingi
    // kirishda manzilini topmasdi (jimgina yolg'on — CLAUDE.md).
    if (!rows.length) return fail(res, 'foydalanuvchi topilmadi', 404);

    ok(res, { pickupPointId: rows[0].pickup_point_id });
  } catch (e) {
    // Birinchi argument — alert guruhlash KALITI, o'zgaruvchan qism ikkinchida.
    console.error('pickupPoint saqlashda xato:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ PROFIL SURATI — /api/me/photo (2026-08-13) ============
// Founder: "profil egasini rasm telegramdagi rasmdan olinsin". Ilgari
// ikkala yuzda ham bosh harflar (FT) chizilardi.
//
// ⚠️ `initDataUnsafe.user.photo_url` ISHLATILMAYDI va bu ataylab, ikki
// sabab bilan:
//   1) U Telegram hujjatiga ko'ra FAQAT ilova biriktirma menyusidan
//      ochilganda keladi — bizdagi kirish nuqtalarida (bot menyusi,
//      inline tugma) u YO'Q bo'lardi va avatar jimgina chizilmasdi.
//   2) SAYTDA `initData` umuman yo'q. Bir yuzda ishlab ikkinchisida
//      ishlamaydigan yechim aynan CLAUDE.md ogohlantirgan naqsh.
// Shuning uchun surat SERVERDAN olinadi va ikkala kanal bitta yo'ldan
// yuradi (`requestUser`).
//
// 🔴 TELEGRAM FAYL MANZILI QAYTARILMAYDI — faqat baytlar proksi qilinadi.
// `https://api.telegram.org/file/bot<TOKEN>/...` manzilida BOT TOKENI
// turadi: redirect qilinsa token brauzer tarixiga, `Referer` ga va
// foydalanuvchi ko'chira oladigan havolaga tushardi.
const FOTO_TTL_MS = 6 * 60 * 60 * 1000;   // 6 soat
const FOTO_KESH_MAX = 500;

// ⚠️ Kesh — xotirada va MAQSADLI kichik. Har profil ochilishida Telegram'ga
// IKKI chaqiruv ketardi (`getUserProfilePhotos` + `getFile`), holbuki avatar
// deyarli o'zgarmaydi. Xotira cheksiz o'smasin: chegaraga yetganda eng eski
// yozuv tashlanadi (`Map` kiritish tartibini saqlaydi).
// Surat YO'Q ekani ham keshlanadi — aks holda avatarsiz foydalanuvchi HAR
// ochilishda ikkita bekor chaqiruv qilardi.
const fotoKesh = new Map();

function keshOqi(tgId) {
  const v = fotoKesh.get(tgId);
  if (!v) return undefined;
  if (Date.now() > v.until) { fotoKesh.delete(tgId); return undefined; }
  return v.filePath;                       // null = surat yo'q
}

function keshYoz(tgId, filePath) {
  if (fotoKesh.size >= FOTO_KESH_MAX) fotoKesh.delete(fotoKesh.keys().next().value);
  fotoKesh.set(tgId, { filePath, until: Date.now() + FOTO_TTL_MS });
}

async function fotoYoli(tgId) {
  const keshda = keshOqi(tgId);
  if (keshda !== undefined) return keshda;

  const r = await callTelegram('getUserProfilePhotos', { user_id: Number(tgId), limit: 1 });
  let sizes = null;
  try { sizes = JSON.parse(r.body)?.result?.photos?.[0] || null; } catch (_) { /* tana JSON emas */ }
  if (!Array.isArray(sizes) || !sizes.length) { keshYoz(tgId, null); return null; }

  // ⚠️ ENG KATTA emas, avatarga YETADIGANI tanlanadi. Telegram bir nechta
  // o'lcham beradi va eng kattasi ~640px — u ekranda 54px chiziladigan
  // doira uchun bir necha barobar ortiqcha trafik bo'lardi. 160px dan
  // katta bo'lmagan eng kattasi olinadi, bo'lmasa ro'yxatning birinchisi
  // (eng kichigi).
  const mos = sizes.filter((s) => s && s.width <= 160).sort((a, b) => b.width - a.width)[0] || sizes[0];
  const yol = await tgGetFile(mos.file_id);
  keshYoz(tgId, yol || null);
  return yol || null;
}

async function handleMyPhoto(req, res, ip) {
  if (rateLimited(`myphoto:${ip}`, 120)) return fail(res, 'too many requests', 429);
  const u = await requestUser(req);
  if (!u || !u.id) return fail(res, 'unauthorized', 401);
  try {
    const filePath = await fotoYoli(String(u.id));
    // Surat YO'Q — bu XATO emas, oddiy holat (Telegram'da avatar
    // qo'ymagan odam). Frontend 404 da bosh harflarga qaytadi.
    if (!filePath) return fail(res, 'not found', 404);

    https.get(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`, (tgRes) => {
      if (tgRes.statusCode !== 200) {
        tgRes.resume();
        // Telegram fayl manzili vaqt bilan eskiradi — keshni tozalaymiz,
        // aks holda 6 soat davomida buzilgan yo'l qaytaverardi.
        fotoKesh.delete(String(u.id));
        return fail(res, 'not found', 404);
      }
      res.writeHead(200, {
        'Content-Type': usableMime(tgRes.headers['content-type']) || mimeFromPath(filePath),
        // 🔴 `private` — SHAXSIY surat. `public` bo'lsa Cloudflare uni
        // chetda keshlab, boshqa foydalanuvchiga berib yuborishi mumkin
        // edi (katalog rasmidan farqi aynan shu).
        'Cache-Control': 'private, max-age=21600',
      });
      tgRes.pipe(res);
    }).on('error', () => fail(res, 'server error', 500));
  } catch (e) {
    // Birinchi argument — alert guruhlash KALITI, o'zgaruvchan qism ikkinchida.
    console.error('myPhoto xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

module.exports = { handleSavePickupPoint, handleMyPhoto };
