-- LolaMarket — rulon zaxirasi (haqiqiy son)
--
-- Muammo (Sprint 4 quyrug'i, 2026-07-27 dan beri ochiq): buyurtma berilganda
-- mahsulot zaxirasi kamaymasdi. `products` da faqat `stock_key TEXT`
-- (in / low / made) bor edi — bu SOTUVCHI QO'LDA qo'yadigan yorliq, haqiqiy
-- son emas. Natijada bitta rulondan 100 ta buyurtma qabul qilinishi mumkin
-- edi va katalog "mavjud" deb ko'rsatib turaverardi.
--
-- Yechim: sonli `stock` ustuni. Kamaytirish buyurtma tranzaksiyasi ichida,
-- atomik `UPDATE ... WHERE stock >= qty` bilan bo'ladi (routes/orders.js) —
-- shuning uchun bir vaqtda kelgan ikki buyurtma bitta rulonni ikki marta
-- sotib yubormaydi.
--
-- NULL = CHEKSIZ (zaxira qoidasidan ozod). Ikki holatda ishlatiladi:
--   1) `made` — "buyurtmaga tayyorlanadi" mahsulotlar: ular buyurtmadan
--      keyin to'qiladi, ombor soni ularga ma'nosiz (2026-07-30 qarori);
--   2) sotuvchi hali aniq son kiritmagan eski mahsulotlar — ular
--      to'satdan "tugagan" bo'lib qolmasin.
--
-- Boshlang'ich qiymat mavjud `stock_key` yorlig'idan taxmin qilinadi, shunda
-- katalogdagi hozirgi "Kam qoldi" belgilari yolg'onga aylanmaydi. Bu FAQAT
-- taxmin — sotuvchi keyin kabinetdan aniq sonni kiritadi.
--
-- Idempotent: qayta ishga tushsa xatosiz o'tadi (ustun qo'shish IF NOT EXISTS,
-- to'ldirish esa faqat `stock IS NULL` qatorlarga tegadi).

ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT;

-- Manfiy zaxira mantiqsiz — kamaytirish `WHERE stock >= qty` bilan himoyalangan,
-- lekin cheklov bazada ham turadi (qo'lda UPDATE qilinса ham buzilmasin).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_stock_nonneg') THEN
    ALTER TABLE products ADD CONSTRAINT products_stock_nonneg
      CHECK (stock IS NULL OR stock >= 0);
  END IF;
END $$;

-- Mavjud qatorlarni to'ldirish. `made` ataylab tegilmaydi (NULL = cheksiz).
UPDATE products
   SET stock = CASE stock_key
                 WHEN 'in'  THEN 50
                 WHEN 'low' THEN 5
               END
 WHERE stock IS NULL
   AND stock_key IN ('in', 'low');
