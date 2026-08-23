-- LolaMarket — admin panelda «Bot userlar» sahifasi (2026-08-23)
--
-- ============ NEGA KERAK ============
-- Founder boshqa botining panelini ko'rsatdi: har foydalanuvchi bir qator —
-- ism, @username, rol, AI so'rovlari (7 kun), oxirgi kirish, va «kredit
-- berish» tugmasi; pastida «Oxirgi harakatlar» lentasi (kim, nima, qachon).
-- Bizda bu ma'lumotning KO'P QISMI allaqachon bor edi (`users`, `ai_credits`,
-- `product_ai_image.tg_user_id`), ikkita narsa YO'Q edi:
--   1. «oxirgi kirish» — Mini App'da sessiya yo'q (kimlik har so'rovda
--      imzolangan `initData` dan olinadi), ya'ni uni yozadigan joy yo'q edi;
--      saytda `web_sessions.last_seen_at` bor, lekin u sessiya ustuni,
--      foydalanuvchi ustuni emas;
--   2. «kim nima qildi» — `traffic_events` ATAYLAB anonim (db/028: kun bilan
--      tuzlangan belgi, Telegram ID yo'q) va bu qaror O'ZGARMAYDI.
--
-- ============ `users.last_seen_at` ============
-- Yozuvchi — `lib/auth.js` → `requestUser()`: kimlik IKKALA kanalda ham shu
-- bitta nuqtadan olinadi (CLAUDE.md), shuning uchun «oxirgi kirish» ham shu
-- yerda yangilanadi va yangi endpoint qo'shilganda eslab qolish shart emas.
--
-- ⚠️ ESKI FOYDALANUVCHILARDA NULL QOLADI va panel buni `—` deb ko'rsatadi.
-- `created_at` bilan to'ldirish jimgina yolg'on bo'lardi: «oxirgi kirish»
-- o'lchov boshlangan kundan boshlab O'LCHANADI, undan oldin noma'lum
-- (`NULL` reyting va `src IS NULL` qoidalari bilan bitta oila).
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- ============ `user_events` — KIRGAN foydalanuvchining amallari ============
-- `traffic_events` dan FARQI — bu yerda Telegram ID bor. Ikkalasi bitta
-- jadvalga QO'SHILMAGAN, chunki ular ikki xil va'da beradi:
--   traffic_events → «necha marta ko'rildi», kim ekani SAQLANMAYDI (mehmon
--                    ham o'lchanadi, kuzatuv yozuvi yo'q);
--   user_events    → «bu odam nima qildi», FAQAT kirgan foydalanuvchi va
--                    FAQAT uning o'zi bajargan amal (sevimli, AI rasm,
--                    buyurtma, saytga kirish).
-- ⚠️ «Mato ko'rildi» bu yerga YOZILMAYDI: ko'rish anonim beacon orqali
-- keladi va u kimlik so'ramaydi (Test 42, 5-band). Ya'ni lentada ko'rishlar
-- chiqmaydi — bu kamchilik emas, db/028 qarorining davomi.
--
-- Yozuvchi bitta: `server/lib/user-events.js` → `recordUserEvent()`. U
-- «eng yaxshi harakat»: yozuv yiqilsa asosiy amal (buyurtma, sevimli)
-- YIQILMAYDI, lekin xato yutilmaydi — `console.error` alertga chiqadi.
CREATE TABLE IF NOT EXISTS user_events (
  id         BIGSERIAL PRIMARY KEY,
  at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Telegram ID. `users` ga FK ATAYLAB yo'q (db/028 dagi sabab bilan):
  -- hodisa — o'tmishdagi fakt, foydalanuvchi qatori o'chsa ham qolsin.
  tg_user_id BIGINT NOT NULL,

  -- Hodisa turi. RO'YXAT BU YERDA YO'Q — faqat SHAKL: ro'yxat kodda, bitta
  -- joyda (`lib/user-events.js` → `KINDS`). Sabab — CLAUDE.md `to_status`
  -- darsi: bir xil ro'yxat ikki joyda yashasa ikkinchisi tuzoq bo'ladi
  -- (`admin_actions_kind_check` da `review_hide` yo'q edi, db/014).
  kind       TEXT NOT NULL CHECK (char_length(kind) BETWEEN 2 AND 32
                                  AND kind ~ '^[a-z_]+$'),

  -- Qaysi mato (bo'lsa). `products.id` — TEXT. FK yo'q (yuqoridagi sabab).
  product_id TEXT CHECK (product_id IS NULL OR product_id ~ '^[a-zA-Z0-9_-]{1,40}$'),

  -- Qisqa izoh — buyurtma raqami kabi. Foydalanuvchi yozgan matn BU YERGA
  -- TUSHMAYDI (izoh, manzil): lenta `innerHTML` ga boradi va bu ustun
  -- faqat server yasagan qisqa satr uchun.
  label      TEXT CHECK (label IS NULL OR char_length(label) <= 80)
);

COMMENT ON TABLE user_events IS
  'Kirgan foydalanuvchining O''ZI bajargan amallari (sevimli, AI rasm, buyurtma, kirish). traffic_events dan farqi — Telegram ID bor; ko''rishlar bu yerga yozilmaydi (beacon anonim).';

-- Panel ikki xil so'raydi: «oxirgi N kun lentasi» (at bo'yicha) va
-- «shu odamning 7 kunlik AI soni» (tg_user_id + at).
CREATE INDEX IF NOT EXISTS idx_user_events_at ON user_events (at DESC);
CREATE INDEX IF NOT EXISTS idx_user_events_user ON user_events (tg_user_id, at DESC);

-- ============ EGALIK — SHU QATORLARSIZ JADVAL O'LIK (db/028 darsi) ============
ALTER TABLE user_events OWNER TO lola;
ALTER SEQUENCE user_events_id_seq OWNER TO lola;

-- ============ ADMIN AMALI: `credit_grant` ============
-- Paneldagi «Kredit berish» tugmasi ham Telegram tasdig'idan o'tadi
-- (CLAUDE.md: panel faqat so'rov yaratadi). Ro'yxat to'liq qayta yoziladi —
-- `server/test.js` → Test 23 uni `ADMIN_ACTIONS` kalitlari bilan solishtiradi.
ALTER TABLE admin_actions DROP CONSTRAINT IF EXISTS admin_actions_kind_check;
ALTER TABLE admin_actions ADD CONSTRAINT admin_actions_kind_check
  CHECK (kind IN ('seller_approve','seller_reject',
                   'product_publish','product_reject',
                   'order_payout','order_refund',
                   'dispute_resolve','review_hide',
                   'video_remove','credit_grant'));

-- ============ TEKSHIRUV ============
DO $$
DECLARE
  sinov CONSTANT BIGINT := -4242;
  n INT;
BEGIN
  DELETE FROM user_events WHERE tg_user_id = sinov;

  INSERT INTO user_events (tg_user_id, kind, product_id, label)
    VALUES (sinov, 'favorite_add', 'ik-1402', NULL),
           (sinov, 'order', NULL, '#LM-1');
  SELECT count(*) INTO n FROM user_events WHERE tg_user_id = sinov;
  IF n <> 2 THEN RAISE EXCEPTION 'user_events yozuvi buzilgan: kutilgan 2, kelgan %', n; END IF;

  -- Shakl qorovullari ishlashi SHART — ixtiyoriy matn o'tmasin.
  BEGIN
    INSERT INTO user_events (tg_user_id, kind) VALUES (sinov, '<img src=x>');
    RAISE EXCEPTION 'hodisa turi shakli TEKSHIRILMAYAPTI';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO user_events (tg_user_id, kind, product_id) VALUES (sinov, 'order', 'x; DROP TABLE');
    RAISE EXCEPTION 'mahsulot id shakli TEKSHIRILMAYAPTI';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Yangi admin amali qabul qilinishi kerak (db/024 naqshi).
  INSERT INTO admin_actions (kind, target_id, payload) VALUES ('credit_grant', '-4242', '{}');
  DELETE FROM admin_actions WHERE kind = 'credit_grant' AND target_id = '-4242';

  DELETE FROM user_events WHERE tg_user_id = sinov;

  -- Ustun haqiqatan bor-yo'qligi.
  PERFORM 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_seen_at';
  IF NOT FOUND THEN RAISE EXCEPTION 'users.last_seen_at yaratilmadi'; END IF;

  RAISE NOTICE 'Tekshiruv OK — user_events yozadi, shakl qorovullari ishlaydi, credit_grant qabul qilinadi.';
END $$;
