const { BOT_USERNAME } = require('../config');
const { pool } = require('../db');
const { safeEqual, dateLabel, sha256, randHex } = require('../lib/format');
const { rateLimited, sendJson, fail, parseCookies } = require('../lib/http');
const { callTelegram } = require('../lib/telegram-api');

// ============ SAYTDA TELEGRAM ORQALI KIRISH (deep-link + cookie sessiya) ============
// Sayt xaridorida imzolangan initData yo'q (u Mini App ichida emas), shuning
// uchun kimlik shu yo'l bilan olinadi:
//   1) brauzer /api/auth/web/start — server `code` va `verifier` yasaydi;
//   2) brauzer `t.me/<bot>?start=web_<code>` ni ochadi;
//   3) foydalanuvchi botda "Boshlash" bosadi — Telegram webhook'ga ID'ni O'ZI
//      yuboradi, ya'ni ID brauzerdan kelmaydi va soxtalashtirib bo'lmaydi;
//   4) brauzer code+verifier bilan so'raydi va HttpOnly cookie sessiya oladi.
const WEB_LOGIN_TTL_MS = 10 * 60 * 1000;      // kod 10 daqiqa yashaydi
const WEB_SESSION_TTL_DAYS = 30;
const SESSION_COOKIE = 'lm_session';

// Sessiya tokeni faqat HttpOnly cookie'da yuradi — sahifadagi JS uni o'qiy
// olmaydi, shuning uchun XSS bo'lsa ham token o'g'irlanmaydi (admin panel
// tokenidan farqi shu: u sessionStorage'da yashaydi).
function setSessionCookie(res, token) {
  const maxAge = WEB_SESSION_TTL_DAYS * 24 * 60 * 60;
  res.setHeader('Set-Cookie',
    `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
}

// Cookie'dagi tokendan foydalanuvchini qaytaradi (yoki null).
// Har bir himoyalangan endpoint shu orqali "bu kim" ekanini biladi.
async function webSessionUser(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token || !/^[0-9a-f]{32,128}$/.test(token)) return null;
  const { rows } = await pool.query(
    `UPDATE web_sessions s SET last_seen_at = now()
      WHERE s.token_hash = $1 AND s.expires_at > now()
      RETURNING s.user_id, s.tg_user_id`,
    [sha256(token)]
  );
  if (!rows.length) return null;
  const { rows: u } = await pool.query(
    `SELECT id, full_name, phone, role, tg_user_id, tg_username FROM users WHERE id = $1`,
    [rows[0].user_id]
  );
  if (!u.length) return null;
  return {
    id: u[0].id,
    tgUserId: String(u[0].tg_user_id || rows[0].tg_user_id),
    name: u[0].full_name,
    phone: u[0].phone,
    username: u[0].tg_username,
    role: u[0].role,
  };
}

function publicUser(u) {
  return u && { name: u.name, username: u.username, phone: u.phone, role: u.role };
}

// ---- POST /api/auth/web/start — kod yaratish ----
async function handleWebLoginStart(req, res, ip) {
  if (rateLimited(`weblogin:${ip}`, 10)) return fail(res, 'too many requests', 429);
  try {
    const code = randHex(12);      // deep-link'da ko'rinadi
    const verifier = randHex(24);  // faqat brauzerda qoladi
    await pool.query(
      `INSERT INTO web_login_codes (code, verifier_hash, expires_at)
       VALUES ($1, $2, now() + ($3 || ' milliseconds')::interval)`,
      [code, sha256(verifier), String(WEB_LOGIN_TTL_MS)]
    );
    // Eskirgan kodlarni shu yerda tozalaymiz — alohida cron kerak emas
    pool.query(`DELETE FROM web_login_codes WHERE expires_at < now() - interval '1 day'`)
      .catch(() => {});
    sendJson(res, 200, {
      ok: true,
      code,
      verifier,
      url: `https://t.me/${BOT_USERNAME}?start=web_${code}`,
      expiresIn: Math.floor(WEB_LOGIN_TTL_MS / 1000),
    });
  } catch (e) {
    console.error('webLoginStart xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ---- GET /api/auth/web/poll?code=..&verifier=.. — kodni sessiyaga almashtirish ----
// Brauzer botda tasdiqlanishini shu endpoint orqali kutadi.
async function handleWebLoginPoll(req, res, ip) {
  if (rateLimited(`weblogin:poll:${ip}`, 120)) return fail(res, 'too many requests', 429);
  let code, verifier;
  try {
    const q = new URL(req.url, 'http://x').searchParams;
    code = q.get('code');
    verifier = q.get('verifier');
  } catch (e) { /* pastda tekshiriladi */ }
  if (!code || !verifier) return fail(res, 'invalid code', 400);

  try {
    const { rows } = await pool.query(
      `SELECT code, verifier_hash, status, user_id, expires_at < now() AS expired
         FROM web_login_codes WHERE code = $1`,
      [code]
    );
    // Kod topilmasa ham "expired" deymiz — mavjud kodlarni taxmin qilib
    // bo'lmasin uchun javob bir xil bo'ladi.
    if (!rows.length) return sendJson(res, 200, { ok: true, status: 'expired' });
    const row = rows[0];
    if (!safeEqual(row.verifier_hash, sha256(verifier))) return fail(res, 'invalid code', 403);
    if (row.status === 'used') return sendJson(res, 200, { ok: true, status: 'expired' });
    if (row.expired) return sendJson(res, 200, { ok: true, status: 'expired' });
    if (row.status !== 'confirmed') return sendJson(res, 200, { ok: true, status: 'pending' });

    // Tasdiqlangan — kod bir marta ishlaydi, keyin sessiyaga aylanadi
    const upd = await pool.query(
      `UPDATE web_login_codes SET status='used' WHERE code=$1 AND status='confirmed' RETURNING user_id, tg_user_id`,
      [code]
    );
    if (!upd.rows.length) return sendJson(res, 200, { ok: true, status: 'expired' });

    const token = randHex(32);
    await pool.query(
      `INSERT INTO web_sessions (token_hash, user_id, tg_user_id, expires_at)
       VALUES ($1, $2, $3, now() + ($4 || ' days')::interval)`,
      [sha256(token), upd.rows[0].user_id, String(upd.rows[0].tg_user_id), String(WEB_SESSION_TTL_DAYS)]
    );
    const { rows: u } = await pool.query(
      `SELECT full_name, phone, role, tg_username FROM users WHERE id = $1`,
      [upd.rows[0].user_id]
    );
    setSessionCookie(res, token);
    sendJson(res, 200, {
      ok: true,
      status: 'confirmed',
      user: u.length
        ? { name: u[0].full_name, username: u[0].tg_username, phone: u[0].phone, role: u[0].role }
        : null,
    });
  } catch (e) {
    console.error('webLoginPoll xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ---- GET /api/auth/web/me — sahifa ochilganda sessiyani tiklash ----
async function handleWebMe(req, res, ip) {
  if (rateLimited(`webme:${ip}`, 60)) return fail(res, 'too many requests', 429);
  try {
    const u = await webSessionUser(req);
    sendJson(res, 200, { ok: true, user: publicUser(u) || null });
  } catch (e) {
    console.error('webMe xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ---- POST /api/auth/web/logout ----
async function handleWebLogout(req, res, ip) {
  if (rateLimited(`weblogout:${ip}`, 30)) return fail(res, 'too many requests', 429);
  try {
    const token = parseCookies(req)[SESSION_COOKIE];
    if (token) await pool.query(`DELETE FROM web_sessions WHERE token_hash = $1`, [sha256(token)]);
  } catch (e) {
    console.error('webLogout xatosi:', e.message);
  }
  clearSessionCookie(res);
  sendJson(res, 200, { ok: true });
}

// ---- GET /api/web/orders — profildagi "Mening buyurtmalarim" ----
async function handleWebMyOrders(req, res, ip) {
  if (rateLimited(`weborders:${ip}`, 60)) return fail(res, 'too many requests', 429);
  try {
    const u = await webSessionUser(req);
    if (!u) return fail(res, 'unauthorized', 401);
    const { rows } = await pool.query(
      `SELECT id, status, created_at, total_amount FROM orders
        WHERE tg_user_id = $1 ORDER BY created_at DESC LIMIT 30`,
      [u.tgUserId]
    );
    sendJson(res, 200, {
      ok: true,
      orders: rows.map((o) => ({
        id: o.id,
        status: o.status,
        date: dateLabel(new Date(o.created_at)).uz,
        total: o.total_amount === null ? null : Number(o.total_amount),
      })),
    });
  } catch (e) {
    console.error('webMyOrders xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ---- Botda "Boshlash" bosilganda (webhook) — kodni tasdiqlash ----
// Telegram ID shu yerda keladi: uni klient emas, Telegram yuboradi.
async function confirmWebLoginCode(msg, code) {
  const { rows: found } = await pool.query(
    `SELECT code FROM web_login_codes WHERE code = $1 AND status = 'pending' AND expires_at > now()`,
    [code]
  );
  if (!found.length) {
    await callTelegram('sendMessage', {
      chat_id: msg.chat.id,
      text: "⌛️ Kirish kodi eskirgan yoki allaqachon ishlatilgan.\n\nSaytda \"Kirish\" tugmasini qaytadan bosing.",
    });
    return;
  }

  const fullName =
    [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ') || msg.from.username || null;
  const { rows: users } = await pool.query(
    `INSERT INTO users (tg_user_id, full_name, tg_username, role)
     VALUES ($1, $2, $3, 'buyer')
     ON CONFLICT (tg_user_id) DO UPDATE
       SET full_name   = COALESCE(EXCLUDED.full_name, users.full_name),
           tg_username = COALESCE(EXCLUDED.tg_username, users.tg_username)
     RETURNING id, phone`,
    [String(msg.from.id), fullName, msg.from.username || null]
  );
  const user = users[0];

  const { rows: upd } = await pool.query(
    `UPDATE web_login_codes
        SET status='confirmed', tg_user_id=$1, user_id=$2, confirmed_at=now()
      WHERE code=$3 AND status='pending' AND expires_at > now()
      RETURNING code`,
    [String(msg.from.id), user.id, code]
  );
  if (!upd.length) return; // oradan o'tib ketgan — jim o'tamiz

  await callTelegram('sendMessage', {
    chat_id: msg.chat.id,
    parse_mode: 'HTML',
    text: `✅ <b>Saytga kirdingiz</b>\n\nlolamarket.uz sahifasiga qayting — profilingiz ochiladi.\nBuyurtma bersangiz, holati haqidagi xabar shu yerga keladi.`,
  });

  // Telefon hali yo'q bo'lsa — bir marta so'raymiz. Bo'lsa, checkout formasi
  // avtomatik to'ladi va xaridor uni qayta yozmaydi.
  if (!user.phone) {
    await callTelegram('sendMessage', {
      chat_id: msg.chat.id,
      text: "📱 Buyurtmani tezroq rasmiylashtirish uchun telefon raqamingizni bir marta yuboring — keyingi safar forma o'zi to'ladi.",
      reply_markup: {
        keyboard: [[{ text: '📱 Telefon raqamni yuborish', request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }
}

module.exports = { handleWebLoginStart, handleWebLoginPoll, handleWebMe, handleWebLogout, handleWebMyOrders, confirmWebLoginCode, webSessionUser };
