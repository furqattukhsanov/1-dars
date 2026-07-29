-- LolaMarket — Saytda (lolamarket.uz) Telegram orqali kirish
--
-- Muammo: sayt xaridorida Telegram Mini App'dagidek imzolangan `initData` yo'q,
-- shuning uchun 006 da buyurtma faqat telefon bilan yozilardi — `tg_user_id`
-- NULL qolardi va xaridorga bot orqali holat xabari yuborib bo'lmasdi.
--
-- Yechim — bir martalik kod (deep-link) oqimi:
--   1) sayt `web_login_codes` ga kod yozadi va `t.me/<bot>?start=web_<kod>` ni ochadi;
--   2) foydalanuvchi botda "Boshlash" bosadi — webhook kodni tasdiqlaydi va
--      Telegram ID'ni kodga bog'laydi (ID Telegram'dan keladi, brauzerdan emas);
--   3) sayt kodni so'raydi va almashtirib sessiya oladi (`web_sessions`).
--
-- Nega Telegram Login Widget emas: widget BotFather'da domen sozlashni talab
-- qiladi va ba'zi ichki brauzerlarda (Instagram/Telegram) ochilmaydi. Deep-link
-- esa telefonda bir bosishda ishlaydi va bir xil botdan foydalanadi.
--
-- Idempotent: qayta ishga tushsa xatosiz o'tadi.

-- Telegram username — profilda ko'rsatiladi va admin xabarida bog'lanish uchun
-- kerak (`orders.tg_username` allaqachon bor, lekin u faqat buyurtma snapshoti).
ALTER TABLE users ADD COLUMN IF NOT EXISTS tg_username TEXT;

-- ============ Bir martalik kirish kodi ============
-- `code`          — deep-link'ga tushadigan qism (Telegram'ga ko'rinadi).
-- `verifier_hash` — faqat BRAUZERDA qoladigan ikkinchi sirning sha256'si.
--   Nega ikkita: `code` Telegram xabarida ko'rinadi (guruhga ulashilishi,
--   yelka ortidan o'qilishi mumkin). Kodni bilgan begona odam sessiyani
--   o'g'irlamasin uchun almashtirishda `verifier` ham talab qilinadi.
CREATE TABLE IF NOT EXISTS web_login_codes (
  code           TEXT PRIMARY KEY,
  verifier_hash  TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'confirmed', 'used')),
  tg_user_id     BIGINT,
  user_id        INT REFERENCES users(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at   TIMESTAMPTZ,
  expires_at     TIMESTAMPTZ NOT NULL
);

-- Eskirgan kodlarni tozalash uchun
CREATE INDEX IF NOT EXISTS idx_web_login_codes_expires ON web_login_codes (expires_at);

-- ============ Sayt sessiyasi ============
-- Token BAZADA saqlanmaydi — faqat uning sha256'si. Baza nusxasi sizib chiqsa
-- ham hech kim tayyor sessiya tokenini olib qo'ya olmaydi.
-- Token brauzerga HttpOnly cookie sifatida beriladi (JS o'qiy olmaydi).
CREATE TABLE IF NOT EXISTS web_sessions (
  token_hash    TEXT PRIMARY KEY,
  user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tg_user_id    BIGINT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_web_sessions_user ON web_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_web_sessions_expires ON web_sessions (expires_at);
