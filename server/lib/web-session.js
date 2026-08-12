const { pool } = require('../db');
const { sha256 } = require('./format');
const { parseCookies } = require('./http');

// ============ SAYT SESSIYASI ============
// Bu kod ilgari `routes/web-auth.js` ichida turardi va u yerda qolgan ekan
// `lib/auth.js` uni ishlata olmasdi (kutubxona marshrutga bog'lanib qolardi).
// 2026-08-12 da bu yerga ko'chirildi: saytdagi kimlik endi Mini App
// kimligi bilan BIR XIL joydan — `lib/auth.js` → `requestUser()` — olinadi.
//
// ⚠️ Sessiya tokeni faqat HttpOnly cookie'da yuradi va bazada `sha256`
// shaklida saqlanadi: sahifadagi JS uni o'qiy olmaydi, ya'ni XSS bo'lsa ham
// o'g'irlanmaydi (admin panel tokenidan farqi shu — u `sessionStorage`da).
const SESSION_COOKIE = 'lm_session';
const WEB_SESSION_TTL_DAYS = 30;

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

module.exports = { SESSION_COOKIE, WEB_SESSION_TTL_DAYS, setSessionCookie, clearSessionCookie, webSessionUser };
