-- LolaMarket — mahsulot videosini O'CHIRISH amali (2026-08-13)
--
-- `db/023` bilan video xaridorga ko'rina boshladi, olib tashlash yo'li esa
-- YO'Q edi: nomaqbul video chiqsa faqat BUTUN e'lonni rad etish qolardi —
-- ya'ni sotuvchi aybsiz mahsuloti bilan birga jazolanardi.
--
-- ============ NEGA MIGRATSIYA KERAK ============
-- Amal `admin_actions` orqali o'tadi (panel so'raydi → Telegram tasdiqlaydi,
-- 2026-07-27 qarori), `kind` esa CHECK bilan cheklangan. Ro'yxatga
-- qo'shilmasa amal PRODUCTION'DA JIMGINA ISHLAMAYDI — aynan shu 2026-08-03 da
-- `review_hide` bilan bo'lgan (`db/014`): kod yozilgan, tugma bosiladi,
-- `INSERT` esa CHECK'da yiqiladi va sabab hech qayerda ko'rinmaydi.
--
-- ⚠️ Ro'yxat TO'LIQ qayta yoziladi (DROP + ADD), chunki `ADD CONSTRAINT` ni
-- kengaytirib bo'lmaydi. Shuning uchun bu yerdagi ro'yxat kod bilan bir xil
-- bo'lishi SHART — buni endi `server/test.js` → Test 23 qo'riqlaydi: u
-- `ADMIN_ACTIONS` kalitlarini shu FAYLDAN o'qilgan ro'yxat bilan solishtiradi.
-- Ya'ni yangi amal qo'shilib migratsiya unutilsa, test QIZIL bo'ladi.

BEGIN;

ALTER TABLE admin_actions DROP CONSTRAINT IF EXISTS admin_actions_kind_check;

ALTER TABLE admin_actions ADD CONSTRAINT admin_actions_kind_check
  CHECK (kind IN ('seller_approve','seller_reject',
                   'product_publish','product_reject',
                   'order_payout','order_refund',
                   'dispute_resolve','review_hide',
                   'video_remove'));

-- ============ TEKSHIRUV ============
-- Migratsiya "o'tdi" degani cheklov TO'G'RI degani emas. Bu yerda yangi
-- qiymat HAQIQATAN qabul qilinishi sinaladi (yozib, darrov o'chiriladi —
-- bazada iz qolmaydi), va yo'l-yo'lakay ESKI qiymat ham omon qolgani.
-- Ikkinchisi bekorga emas: ro'yxat to'liq qayta yozilgani uchun bittasini
-- tushirib qoldirish oson va u faqat o'sha amal bosilgan kuni bilinardi.
DO $$
DECLARE
  eskilar TEXT[] := ARRAY['seller_approve','seller_reject','product_publish',
                          'product_reject','order_payout','order_refund',
                          'dispute_resolve','review_hide'];
  k TEXT;
BEGIN
  INSERT INTO admin_actions (kind, target_id, payload) VALUES ('video_remove', '0', '{}');
  DELETE FROM admin_actions WHERE kind = 'video_remove' AND target_id = '0';

  FOREACH k IN ARRAY eskilar LOOP
    BEGIN
      INSERT INTO admin_actions (kind, target_id, payload) VALUES (k, '0', '{}');
      DELETE FROM admin_actions WHERE kind = k AND target_id = '0';
    EXCEPTION WHEN check_violation THEN
      RAISE EXCEPTION 'ESKI amal turi yo''qolgan: % — ro''yxat qayta yozilganda tushib qolgan', k;
    END;
  END LOOP;

  RAISE NOTICE 'Tekshiruv OK — video_remove qabul qilinadi, eski 8 ta tur ham joyida.';
END $$;

COMMIT;
