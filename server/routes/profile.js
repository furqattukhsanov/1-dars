const { pool } = require('../db');
const { requestUser } = require('../lib/auth');
const { isPickupPointId } = require('../lib/maps');
const { rateLimited, readBody, ok, fail } = require('../lib/http');

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

module.exports = { handleSavePickupPoint };
