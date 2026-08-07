-- LolaMarket — AI rasm keshi endi XARIDOR JAVOBLARIGA ham bog'lanadi
-- (2026-08-07, founder qarori: "rasmdan oldin 2-3 ta savol so'ralsin,
-- har bir so'ragan odam uchun alohida qilib").
--
-- ============ NEGA FOYDALANUVCHI BO'YICHA EMAS, JAVOB BO'YICHA ============
-- So'zma-so'z talqin — har foydalanuvchiga o'z qatori (`tg_user_id` kalitda).
-- QILINMADI. Sabab pulda: bir xil matoga bir xil javob bergan ikki xaridor
-- AYNAN BIR XIL rasmni oladi, ya'ni ikkinchisi uchun to'lash sof isrof
-- bo'lardi (~$0.04 har biriga, va u foydalanuvchi soniga qarab o'sardi).
--
-- Xaridor nuqtai nazaridan farq YO'Q: u o'z javoblariga mos rasmni ko'radi.
-- Javobi boshqa bo'lsa — rasmi ham boshqa. Bu Sprint 10 ning 4-qarori bilan
-- bitta oilada: "xarajat foydalanuvchi soniga emas, MAHSULOT soniga bog'liq
-- bo'lsin" — endi u "mahsulot × javob to'plami" ga bog'liq.

BEGIN;

-- Javoblarning barmoq izi: `kiyim=koylak&kim=ayol&uslub=bayram` ning sha256'si
-- (server/lib/ai.js → `choicesHash`, kalitlar TARTIBLANGAN holda).
--
-- `DEFAULT ''` faqat MAVJUD qatorlar uchun: 017 davrida javoblar umuman
-- yo'q edi. Ular baribir qayta chiziladi, chunki yangi so'rov bo'sh emas,
-- haqiqiy javob hash'i bilan keladi va mos qator topilmaydi. Eski qatorni
-- O'CHIRMAYMIZ — u allaqachon to'langan rasm va biror kun kerak bo'lishi
-- mumkin; keraksiz bo'lsa keyin alohida tozalanadi.
ALTER TABLE product_ai_image
  ADD COLUMN IF NOT EXISTS choices_hash TEXT NOT NULL DEFAULT '';

-- PK ni kengaytirish: bitta mahsulotda endi bir nechta rasm bo'ladi
-- (har javob to'plamiga bitta).
ALTER TABLE product_ai_image DROP CONSTRAINT IF EXISTS product_ai_image_pkey;
ALTER TABLE product_ai_image ADD PRIMARY KEY (product_id, choices_hash);

-- Qaysi javoblar bilan chizilgani — DIAGNOZ uchun o'qiladigan shaklda.
-- Faqat hash saqlansa "bu rasm nega shunday chiqqan?" degan savolga javob
-- yo'q bo'lardi: hash'ni orqaga qaytarib bo'lmaydi.
ALTER TABLE product_ai_image
  ADD COLUMN IF NOT EXISTS choices JSONB;

COMMIT;

-- ============ TEKSHIRUV ============
-- Migratsiya "o'tdi" degani jadval TO'G'RI ekanini bildirmaydi (016/017 darsi).
DO $$
DECLARE pk_img TEXT;
BEGIN
  SELECT string_agg(a.attname, ',' ORDER BY k.ord) INTO pk_img
    FROM pg_constraint c
    JOIN LATERAL unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord) ON true
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
   WHERE c.conrelid = 'product_ai_image'::regclass AND c.contype = 'p';

  IF pk_img IS DISTINCT FROM 'product_id,choices_hash' THEN
    RAISE EXCEPTION 'product_ai_image PK kutilgani (product_id,choices_hash) emas: %', pk_img;
  END IF;

  RAISE NOTICE 'Tekshiruv OK — product_ai_image(%) tayyor.', pk_img;
END $$;
