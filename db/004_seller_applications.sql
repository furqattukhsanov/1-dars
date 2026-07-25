-- LolaMarket — Sotuvchi arizasi (Sprint 0 davomi)
-- Bot suhbati orqali sotuvchi bo'lishga ariza: korxona nomi → shahar → mahsulot
-- turi → telefon (request_contact). Founder botda /sotuvchi_tasdiqla yoki
-- /sotuvchi_rad bilan ko'rib chiqadi. Idempotent: qayta ishga tushsa xatosiz o'tadi.

CREATE TABLE IF NOT EXISTS seller_applications (
  id             SERIAL PRIMARY KEY,
  tg_user_id     BIGINT NOT NULL,
  tg_username    TEXT,
  -- Suhbat bosqichi: business_name -> city -> product_type -> phone -> done
  step           TEXT NOT NULL DEFAULT 'business_name'
                 CHECK (step IN ('business_name', 'city', 'product_type', 'phone', 'done')),
  business_name  TEXT,
  city           TEXT,
  product_type   TEXT,
  phone          TEXT,
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at    TIMESTAMPTZ
);

-- Bir foydalanuvchining navbatdagi ochiq (hali yakunlanmagan/ko'rib chiqilmagan)
-- arizasini tez topish uchun — bot har xabarda shuni so'raydi.
CREATE INDEX IF NOT EXISTS idx_seller_applications_open
  ON seller_applications (tg_user_id)
  WHERE status = 'pending' AND step != 'done';

-- Admin navbatini (to'ldirilgan, hali ko'rilmagan arizalar) tez olish uchun.
CREATE INDEX IF NOT EXISTS idx_seller_applications_review_queue
  ON seller_applications (created_at DESC)
  WHERE status = 'pending' AND step = 'done';
