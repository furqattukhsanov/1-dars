-- LolaMarket — AI kiyim RASMI keshi (2026-08-07, Sprint 10 ning rasm qismi)
--
-- Sprint 10 matn g'oyalari bilan yopilgan edi, founder esa uni RAD ETDI:
-- "matn umuman kerak emas, faqat rasm kerak". Bu jadval o'sha rasm uchun.
--
-- ============ NEGA ALOHIDA JADVAL, `product_ai_ideas` GA USTUN EMAS ============
-- Ikkisining eskirish SABABI boshqa. G'oyalar mato MATNIDAN chiqadi, rasm esa
-- mato SURATIDAN (image-to-image). Sotuvchi suratni almashtirsa — rasm
-- yaroqsiz, g'oyalar esa o'z kuchida qoladi; tarkibni tahrirlasa — teskarisi.
-- Bitta qatorda tursa ikkalasi bir-birini keraksiz o'chirardi va har safar
-- ~$0.04 qayta to'lanardi.
--
-- ⚠️ `lang` USTUNI YO'Q — bu 016 dan ataylab farq qiladi. Rasmda matn yo'q,
-- ya'ni ruscha va o'zbekcha uchun AYNI rasm ishlaydi. 016 da `lang` bor edi,
-- chunki u yerda javob matn edi; bu yerda uni "har ehtimolga" qo'shish
-- keshni ikkiga bo'lib, bir rasm o'rniga ikki marta to'lattirardi.

BEGIN;

CREATE TABLE IF NOT EXISTS product_ai_image (
  product_id  TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,

  -- Natija Telegram'da yashaydi, serverda EMAS — `products.img_file_id` va
  -- bahs dalillari bilan AYNI naqsh (routes/catalog.js). Sabab: deploy rsync
  -- bilan boradi va serverdagi fayl papkasi bir kun jimgina yo'qolishi mumkin
  -- (2026-08-03 da `/opt/lolamarket-notify/` aynan shunday o'chib ketgan edi).
  -- Rasm mavjud `/api/product-photo` proksisi orqali beriladi — yangi ochiq
  -- yo'l qo'shilmaydi.
  file_id     TEXT NOT NULL,

  -- Generatsiya paytidagi MANBA barmoq izi: mato matni + SURAT havolasi.
  -- 016 dagi `source_hash` dan farqi shu — u yerda surat qatnashmaydi.
  -- Surat almashsa hash o'zgaradi va rasm o'zi yaroqsiz bo'ladi.
  source_hash TEXT NOT NULL,

  -- Qaysi model chizgani. Sifat yomon bo'lsa "qaysi model edi?" degan savolga
  -- javob kerak, model esa almashadi (`gemini-2.5-flash-image` →
  -- `gemini-3.1-flash-image`).
  model       TEXT NOT NULL,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Egalik: 004/005/015/016 dagi kabi — ilova `lola` user bilan ulanadi
ALTER TABLE product_ai_image OWNER TO lola;

-- ============ TEKSHIRUV ============
-- Migratsiya "o'tdi" degani jadval TO'G'RI ekanini bildirmaydi (016 darsi).
-- Bu yerda aynan ikkita nozik joy tekshiriladi: PK FAQAT `product_id` dan
-- iborat (`lang` qo'shilib qolmagan) va `products` ga FK bor (mahsulot
-- o'chsa rasm ham ketadi, aks holda o'lik qator qolardi).
DO $$
DECLARE pk_img TEXT; fk_cnt INT;
BEGIN
  SELECT string_agg(a.attname, ',' ORDER BY k.ord) INTO pk_img
    FROM pg_constraint c
    JOIN LATERAL unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord) ON true
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
   WHERE c.conrelid = 'product_ai_image'::regclass AND c.contype = 'p';

  SELECT count(*) INTO fk_cnt
    FROM pg_constraint
   WHERE conrelid = 'product_ai_image'::regclass AND contype = 'f';

  IF pk_img IS DISTINCT FROM 'product_id' THEN
    RAISE EXCEPTION 'product_ai_image PK kutilgani (product_id) emas: %', pk_img;
  END IF;
  IF fk_cnt < 1 THEN
    RAISE EXCEPTION 'product_ai_image da products ga FK yo''q';
  END IF;

  RAISE NOTICE 'Tekshiruv OK — product_ai_image(%) tayyor.', pk_img;
END $$;

COMMIT;
