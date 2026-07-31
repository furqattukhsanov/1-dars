-- LolaMarket — sharhlar va reyting (PRD story №2, №15)
--
-- Muammo: PRD "5 yulduz + qisqa matn sharh" deb qaror qilgan, lekin sharh
-- yozadigan joy hech qachon qurilmagan edi. `products.rating` va
-- `products.reviews` ustunlari bor edi — ammo ular SEED'dan kelgan o'ylab
-- topilgan sonlar (`4.9`, `42 sharh`) bo'lib, ortida birorta ham haqiqiy
-- sharh turmasdi. Ya'ni katalog xaridorga yolg'on ishonch ko'rsatardi va bu
-- CLAUDE.md dagi "panelda o'ylab topilgan raqam ko'rsatilmasin" qoidasining
-- to'g'ridan-to'g'ri buzilishi edi (2026-07-31 founder qarori bilan tozalanadi).
--
-- Model (2026-07-31 qarori): sharh BUYURTMAGA bog'lanadi — mahsulotga ham,
-- sotuvchiga ham. Bitta yakunlangan buyurtmadagi har mahsulotga bitta sharh.
-- Sabab: buyurtmasiz sharh yozib bo'lmasa, soxta sharh ham yozib bo'lmaydi —
-- moderatsiya darvozasi kerak bo'lmaydi (sharh darhol chiqadi, admin keyin
-- yashira oladi).
--
-- `rating`/`reviews` ustunlari SAQLANADI, lekin endi ular HOSILA: har sharh
-- yozilganda/yashirilganda `routes/reviews.js` → `recalcRating()` ularni
-- qaytadan hisoblaydi. Nega ustun (har o'qishda agregat emas): katalog va
-- admin paneli allaqachon shu ustunlarni o'qiydi, ikkalasini ham agregat
-- so'rovga o'tkazish keraksiz keng o'zgarish bo'lardi. Yagona yozuvchi —
-- `recalcRating()`, boshqa hech qayerdan qo'lda yozilmasin.

CREATE TABLE IF NOT EXISTS reviews (
  id             SERIAL PRIMARY KEY,
  order_id       TEXT NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
  product_id     TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  -- Sotuvchi sharh yozilgan PAYTDAGI egasi (snapshot). Mahsulot keyin boshqa
  -- sotuvchiga o'tsa ham eski sharh yangi sotuvchining reytingiga qo'shilmasin.
  seller_id      INT REFERENCES sellers(id) ON DELETE SET NULL,
  -- Muallif — imzolangan initData'dan olingan Telegram ID. Brauzerdan
  -- kelgan qiymatga hech qachon ishonilmaydi (CLAUDE.md, 2026-07-29).
  author_tg      TEXT NOT NULL,
  author_name    TEXT,
  stars          SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  body           TEXT,
  status         TEXT NOT NULL DEFAULT 'published'
                 CHECK (status IN ('published', 'hidden')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  hidden_at      TIMESTAMPTZ,
  hidden_reason  TEXT
);

-- Bitta buyurtmadagi bitta mahsulotga bitta sharh. Bu qoida BAZADA turadi:
-- ilova darajasidagi "avval tekshir, keyin yoz" ikki bir vaqtdagi so'rovda
-- ikkita sharh yozib yuborardi (zaxira bug'ining aynan o'zi).
CREATE UNIQUE INDEX IF NOT EXISTS reviews_order_product_uniq
  ON reviews (order_id, product_id);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews (product_id) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_reviews_seller  ON reviews (seller_id)  WHERE status = 'published';

-- ============ Seed reytinglarini tozalash ============
-- DIQQAT: bu UPDATE ataylab "sharhi yo'q qatorlar" bilan cheklangan.
-- Shartsiz `UPDATE products SET rating=NULL` yozilsa, migratsiya keyinroq
-- qayta ishga tushirilganda (fayllar idempotent bo'lishi kutiladi) HAQIQIY
-- reytinglarni ham o'chirib yuborardi. Shu shart bilan u istalgancha marta
-- ishlayveradi va faqat ortida sharh turmagan sonni nolga tushiradi.
UPDATE products p
   SET rating = NULL, reviews = 0
 WHERE NOT EXISTS (
   SELECT 1 FROM reviews r WHERE r.product_id = p.id AND r.status = 'published'
 );

UPDATE sellers s
   SET rating = NULL
 WHERE NOT EXISTS (
   SELECT 1 FROM reviews r WHERE r.seller_id = s.id AND r.status = 'published'
 );
