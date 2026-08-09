-- LolaMarket — R2 fayl ombori kalitlari (2026-08-09)
--
-- Bugungacha rasm ombori vazifasini TELEGRAM bajarib kelgan: fayl Telegram
-- serverida yotadi, bazada faqat `file_id` saqlanadi va ko'rsatishda o'z
-- serverimiz uni proksi qiladi (`routes/catalog.js` → `handleProductPhoto`).
-- U ishlaydi, lekin katalog rasmlarini BOT TOKENIGA bog'lab qo'yadi — token
-- almashsa yoki bot bloklansa rasmlar bilan birga yo'qoladi. Ustiga Telegram
-- rasmni SIQADI, bu esa AI natijasida sezilarli.
--
-- ============ NEGA `file_id` O'CHIRILMAYDI ============
-- Yangi ustun eskisining YONIGA qo'shiladi, O'RNIGA emas. Sabab: ombor
-- almashtirish bir tomonlama eshik bo'lmasligi kerak. R2 yo'lida nimadir
-- chiqsa (kalit eskirdi, bucket sozlamasi o'zgardi), kod bitta shart bilan
-- eski yo'lga qaytadi va MA'LUMOT YO'QOLMAYDI. Ikkalasi ham `NULL` bo'lishi
-- mumkin bo'lgan ustun emas — `file_id` NOT NULL bo'lib qoladi, ya'ni
-- Telegram nusxasi HAR DOIM bor. Bu ataylab: "yangi ombor ishlayapti" degan
-- ishonch hosil bo'lgunga qadar eski nusxa zaxira bo'lib turadi.
--
-- ⚠️ Ustun NULL bo'lishi RUXSAT ETILADI va bu "hali ko'chirilmagan" degani.
-- `NULL` reyting qoidasi bilan bitta oila: yo'qlik ko'rinadi, uni ko'rsatuvchi
-- kod "R2 da yo'q ⇒ Telegram yo'lidan ber" deb aniq qaror qabul qiladi.
-- Zaxira qiymat (bo'sh satr) QO'YILMAYDI — u "kalit bor, lekin bo'sh" degan
-- mavjud bo'lmagan holatni yaratardi.

BEGIN;

-- ---- AI chizgan rasm ----
ALTER TABLE product_ai_image ADD COLUMN IF NOT EXISTS r2_key TEXT;

COMMENT ON COLUMN product_ai_image.r2_key IS
  'R2 dagi obyekt kaliti (masalan ai/<product>/<hash>.png). NULL = hali R2 da yo''q, Telegram file_id ishlatiladi.';

-- ---- Sotuvchi botga yuborgan mahsulot surati ----
ALTER TABLE products ADD COLUMN IF NOT EXISTS img_r2_key TEXT;

COMMENT ON COLUMN products.img_r2_key IS
  'R2 dagi obyekt kaliti. NULL = hali R2 da yo''q, img_file_id ishlatiladi.';

-- ============ TEKSHIRUV ============
-- Migratsiya "o'tdi" degani jadval TO'G'RI ekanini bildirmaydi (016/017 darsi).
-- Bu yerda uchta nozik joy tekshiriladi:
--   1) ikkala ustun ham paydo bo'ldi;
--   2) ular NULL qabul qiladi — aks holda mavjud qatorlar migratsiyani
--      yiqitardi va "ko'chirilmagan" holatini ifodalab bo'lmasdi;
--   3) 🔴 ENG MUHIMI: `product_ai_image.file_id` HAMON `NOT NULL`. Agar
--      kelajakda kimdir uni "endi kerakmas" deb bo'shatib qo'ysa, zaxira
--      yo'l JIMGINA yo'qoladi va buni faqat R2 yiqilgan kuni bilardik.
DO $$
DECLARE
  ai_key_nullable TEXT;
  pr_key_nullable TEXT;
  fid_nullable    TEXT;
BEGIN
  SELECT is_nullable INTO ai_key_nullable
    FROM information_schema.columns
   WHERE table_name = 'product_ai_image' AND column_name = 'r2_key';

  SELECT is_nullable INTO pr_key_nullable
    FROM information_schema.columns
   WHERE table_name = 'products' AND column_name = 'img_r2_key';

  SELECT is_nullable INTO fid_nullable
    FROM information_schema.columns
   WHERE table_name = 'product_ai_image' AND column_name = 'file_id';

  IF ai_key_nullable IS NULL THEN
    RAISE EXCEPTION 'product_ai_image.r2_key qo''shilmagan';
  END IF;
  IF pr_key_nullable IS NULL THEN
    RAISE EXCEPTION 'products.img_r2_key qo''shilmagan';
  END IF;
  IF ai_key_nullable <> 'YES' OR pr_key_nullable <> 'YES' THEN
    RAISE EXCEPTION 'R2 kaliti ustunlari NULL qabul qilishi kerak (ai=%, products=%)',
      ai_key_nullable, pr_key_nullable;
  END IF;
  IF fid_nullable <> 'NO' THEN
    RAISE EXCEPTION 'product_ai_image.file_id endi NOT NULL emas — Telegram zaxirasi yo''qolgan';
  END IF;

  RAISE NOTICE 'Tekshiruv OK — r2_key / img_r2_key tayyor, file_id zaxirasi joyida.';
END $$;

COMMIT;
