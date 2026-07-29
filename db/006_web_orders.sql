-- LolaMarket — Sayt (landing) buyurtmalari bazaga yoziladi
--
-- Muammo (2026-07-29 da topildi): lolamarket.uz savatidan berilgan buyurtma
-- faqat `/api/telegram-notify` orqali Telegram'ga xabar yuborardi va bazaga
-- UMUMAN yozilmasdi. Natijada admin panelda (u `orders` jadvalidan o'qiydi)
-- bunday buyurtmalar hech qachon ko'rinmasdi — 29-iyul 00:13 dagi buyurtma
-- xuddi shu sababdan yo'qolgan.
--
-- Sayt xaridorida Telegram hisobi yo'q, shuning uchun:
--   * `tg_user_id` NULL qoladi — bog'lanish uchun telefon saqlanadi;
--   * `source` buyurtma qayerdan kelganini ko'rsatadi.
--
-- Idempotent: qayta ishga tushsa xatosiz o'tadi.

-- Buyurtma manbai: 'miniapp' (Telegram Mini App) yoki 'web' (lolamarket.uz).
-- Eski qatorlarning hammasi Mini App'dan kelgan — DEFAULT shuni beradi.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'miniapp';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
     WHERE rel.relname = 'orders' AND con.conname = 'orders_source_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_source_check
      CHECK (source IN ('miniapp','web'));
  END IF;
END $$;

-- Sayt buyurtmasida bog'lanishning YAGONA yo'li — telefon. Mini App'da u
-- shart emas (Telegram orqali yoziladi), shuning uchun ustun NULL bo'lishi
-- mumkin; majburiyligi server tomonda, faqat `source='web'` uchun tekshiriladi.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_phone TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_source ON orders (source, created_at DESC);
