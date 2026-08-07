-- LolaMarket — LOLA CREDIT (2026-08-07, founder qarori)
-- "Har bir insonga 20 ta lola credit beramiz, bitta rasmga 2 credit ketadi."
--
-- ============ NEGA KUNLIK LIMIT EMAS ============
-- Ilgari gating `ai_usage (tg_user_id, day, used)` da edi — KUNLIK hisob.
-- Kredit boshqa tushuncha: u QOLDIQ va o'zi tiklanmaydi. Farq foydalanuvchiga
-- aytiladigan gapda ko'rinadi: kunlik limitda "ertaga 00:00 da yangilanadi"
-- deyish HAQIQAT edi, kreditda esa u YOLG'ON bo'lardi — shuning uchun o'sha
-- xabar UI dan ham olib tashlandi (telegram-app/app.js → `aiNoCredit`).
--
-- `ai_usage` jadvali O'CHIRILMAYDI: unda haqiqiy tarix bor va uni o'chirish
-- "qancha sarflangan" savolini javobsiz qoldirardi. U shunchaki YOZILMAYDI.
--
-- ============ NEGA ATOMIK ============
-- `decrementStock` (routes/orders.js) va `takeQuota` bilan AYNI naqsh —
-- CLAUDE.md ning zaxira qoidasi. Tekshirish va yechish BITTA gapda:
--
--   INSERT INTO ai_credits (tg_user_id, balance, spent)
--   VALUES ($1, $2 - $3, $3)
--   ON CONFLICT (tg_user_id)
--   DO UPDATE SET balance = ai_credits.balance - $3,
--                 spent   = ai_credits.spent + $3,
--                 updated_at = now()
--         WHERE ai_credits.balance >= $3
--   RETURNING balance;
--
-- Qator qaytmasa — kredit yetmadi. Alohida `SELECT` + `UPDATE` ga
-- BO'LINMASIN: ikki so'rov bir vaqtda kelsa ikkalasi ham "krediti bor" deb
-- o'qib o'tib ketardi va balans MANFIYGA tushardi — aynan oxirgi rulon
-- muammosi, faqat pul tomonda.
--
-- Birinchi so'rovda qator O'ZI tug'iladi (`INSERT ... ON CONFLICT`): "20 ta
-- berish" uchun alohida ro'yxatdan o'tkazish qadami YO'Q. Shuning uchun
-- balansni oldindan yaratib qo'yish kerak emas va "kredit berilmay qolgan
-- foydalanuvchi" degan holat umuman mavjud emas.

BEGIN;

CREATE TABLE IF NOT EXISTS ai_credits (
  tg_user_id BIGINT PRIMARY KEY,

  -- Qoldiq. CHECK — oxirgi qorovul: kod atomik bo'lsa ham, kelajakda kimdir
  -- qo'lda `UPDATE` yozsa baza uni manfiyga tushirishga YO'L QO'YMAYDI.
  balance    INT NOT NULL CHECK (balance >= 0),

  -- Umumiy sarf — "qancha pul ketdi" savoliga javob. Balansdan ayirib
  -- hisoblab bo'lmaydi, chunki cheksiz ro'yxatdagi foydalanuvchida balans
  -- umuman kamaymaydi (server/routes/ai.js → `takeCredits`).
  spent      INT NOT NULL DEFAULT 0 CHECK (spent >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ "MENING RASMLARIM" ============
-- Kim chizganini bilish uchun. Ilgari bu saqlanMASDI: `product_ai_image`
-- MAHSULOT bo'yicha kalitlangan (018 dagi qaror — pul tejash uchun) va
-- foydalanuvchi umuman qatnashmasdi.
--
-- ⚠️ Ustun NULL bo'lishi MUMKIN va bu ataylab: 018 gacha chizilgan rasmlarda
-- muallif ma'lum EMAS. Uni "birinchi admin" yoki 0 bilan to'ldirish jimgina
-- yolg'on bo'lardi — `NULL` esa "bilinmaydi" degani va lentada shunday
-- qaraladi (reyting `NULL` qoidasi bilan bitta oila).
--
-- ⚠️ Bu ustun keshni FOYDALANUVCHI bo'yicha bo'lmaydi: kalit hamon
-- (product_id, choices_hash). Ya'ni ikkinchi odam ayni javoblar bilan
-- so'rasa, u tayyor rasmni BEPUL oladi va `tg_user_id` BIRINCHI chizgan
-- odamniki bo'lib qoladi. Bu 018 dagi pul qarorining davomi.
ALTER TABLE product_ai_image
  ADD COLUMN IF NOT EXISTS tg_user_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_ai_image_user
  ON product_ai_image (tg_user_id, created_at DESC);

-- Egalik: 004/005/015/016 dagi kabi — ilova `lola` user bilan ulanadi
ALTER TABLE ai_credits OWNER TO lola;

COMMIT;

-- ============ TEKSHIRUV ============
-- Migratsiya "o'tdi" degani jadval TO'G'RI ekanini bildirmaydi (016/017/018 darsi).
DO $$
DECLARE
  bal_null TEXT;
  has_user BOOLEAN;
BEGIN
  SELECT is_nullable INTO bal_null
    FROM information_schema.columns
   WHERE table_name = 'ai_credits' AND column_name = 'balance';
  IF bal_null IS DISTINCT FROM 'NO' THEN
    RAISE EXCEPTION 'ai_credits.balance NOT NULL bo''lishi kerak: %', bal_null;
  END IF;

  -- CHECK haqiqatan ishlaydimi — e'lon qilingani yetarli emas (016 darsi).
  BEGIN
    INSERT INTO ai_credits (tg_user_id, balance) VALUES (-999, -1);
    RAISE EXCEPTION 'manfiy balans qabul qilindi — CHECK ishlamayapti';
  EXCEPTION WHEN check_violation THEN
    NULL; -- kutilgan
  END;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'product_ai_image' AND column_name = 'tg_user_id'
  ) INTO has_user;
  IF NOT has_user THEN
    RAISE EXCEPTION 'product_ai_image.tg_user_id qo''shilmagan';
  END IF;

  RAISE NOTICE 'Tekshiruv OK — ai_credits va product_ai_image.tg_user_id tayyor.';
END $$;
