-- LolaMarket — Ma'lumotlar bazasi sxemasi (Sprint 2 / Dars 9)
-- PRD §6 "Ma'lumot modeli" asosida.
-- Bu fayl parol saqlamaydi — DATABASE_URL faqat serverdagi .env da.
-- Qayta ishga tushirsa xatosiz o'tsin uchun IF NOT EXISTS ishlatilgan.

-- ============ Foydalanuvchi ============
-- PRD: ism, telefon, rol (xaridor / ishlab chiqaruvchi / admin)
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  full_name   TEXT,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'buyer'
              CHECK (role IN ('buyer', 'seller', 'admin')),
  tg_user_id  BIGINT,              -- Telegram foydalanuvchi ID (auth Sprint 3 da)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ Ishlab chiqaruvchi (sotuvchi) ============
-- PRD: kompaniya, manzil, tasdiq holati, reyting
CREATE TABLE IF NOT EXISTS sellers (
  id                SERIAL PRIMARY KEY,
  user_id           INT REFERENCES users(id) ON DELETE SET NULL,
  business_name_uz  TEXT NOT NULL,
  business_name_ru  TEXT,
  city_uz           TEXT,
  city_ru           TEXT,
  is_verified       BOOLEAN NOT NULL DEFAULT false,  -- founder tasdig'i
  rating            NUMERIC(2,1),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ Mahsulot ============
-- PRD: kategoriya, narx/rulon, rulon soni, rasm (+ Mini App kartochka maydonlari)
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,                -- masalan 'ik-1402'
  seller_id   INT REFERENCES sellers(id) ON DELETE SET NULL,
  sort_order  INT,                             -- katalogda ko'rsatish tartibi
  cat_key     TEXT,                            -- silk / ikat / suzani / cotton / wool / linen
  pattern     TEXT,                            -- SVG naqsh kaliti
  img         TEXT,
  price       BIGINT NOT NULL,                 -- so'm / rulon
  unit        TEXT NOT NULL DEFAULT 'rulon',
  moq         INT NOT NULL DEFAULT 1,          -- minimum buyurtma
  lead_days   INT,                             -- tayyorlash muddati (kun)
  rating      NUMERIC(2,1),
  reviews     INT DEFAULT 0,
  stock_key   TEXT,                            -- in / low / made
  badge_tone  TEXT,
  width       TEXT,
  weight      TEXT,
  name_uz     TEXT NOT NULL,
  name_ru     TEXT,
  comp_uz     TEXT,                            -- tarkib (kompozitsiya)
  comp_ru     TEXT,
  badge_uz    TEXT,
  badge_ru    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mavjud bazada (jadval allaqachon yaratilgan bo'lsa) ustunni qo'shish
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INT;

-- Buyurtma raqami uchun ketma-ketlik (#LM-3001 dan boshlab)
CREATE SEQUENCE IF NOT EXISTS order_seq START 3001;

-- ============ Buyurtma ============
-- PRD: xaridor, mahsulot, miqdor, holat. 1 order = 1 sotuvchi.
CREATE TABLE IF NOT EXISTS orders (
  id            TEXT PRIMARY KEY,              -- masalan '#LM-3001'
  buyer_id      INT REFERENCES users(id) ON DELETE SET NULL,
  buyer_name    TEXT,
  tg_user_id    BIGINT,
  tg_username   TEXT,
  address       TEXT,
  payment       TEXT,                          -- naqd / karta / ...
  comment       TEXT,
  total_amount  BIGINT,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ Buyurtma tarkibi ============
CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  TEXT REFERENCES products(id) ON DELETE SET NULL,
  name        TEXT,                            -- buyurtma paytidagi nom (snapshot)
  qty         INT NOT NULL DEFAULT 1,
  unit_price  BIGINT
);

-- ============ To'lov (escrow) ============
-- PRD: summa, komissiya, escrow holati
CREATE TABLE IF NOT EXISTS payments (
  id                 SERIAL PRIMARY KEY,
  order_id           TEXT REFERENCES orders(id) ON DELETE CASCADE,
  provider           TEXT,                     -- payme / click
  provider_txn_id    TEXT,
  amount             BIGINT,
  commission_amount  BIGINT,
  status             TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','held','released','refunded')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ Bahsli holat ============
-- PRD: sabab, dalil (rasm/video), qaror, kim aybdor
CREATE TABLE IF NOT EXISTS disputes (
  id            SERIAL PRIMARY KEY,
  order_id      TEXT REFERENCES orders(id) ON DELETE CASCADE,
  reason        TEXT,
  evidence_url  TEXT,
  decision      TEXT,
  at_fault      TEXT,                          -- buyer / seller
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ BTS Pochta nuqtasi ============
-- PRD: manzil, shahar, kod
CREATE TABLE IF NOT EXISTS bts_points (
  id       SERIAL PRIMARY KEY,
  name     TEXT,
  address  TEXT,
  city     TEXT,
  code     TEXT
);

-- Indekslar (tez-tez ishlatiladigan so'rovlar uchun)
CREATE INDEX IF NOT EXISTS idx_products_cat     ON products(cat_key);
CREATE INDEX IF NOT EXISTS idx_products_seller  ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_order_items_ord  ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created   ON orders(created_at DESC);
