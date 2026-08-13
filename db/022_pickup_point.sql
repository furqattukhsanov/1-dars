-- LolaMarket — xaridorning DOIMIY olish nuqtasi (2026-08-13)
--
-- Founder qarori: profilda "Mening manzilim" bo'limi bo'lsin va xaridor
-- nuqtani KARTADAN belgilasin. Yetkazish modeli o'zgarmaydi — mato baribir
-- BTS nuqtasiga boradi (PRD, `db/010`), bu ustun faqat "men doim SHU
-- nuqtadan olaman" degan tanlovni eslab qoladi va checkout uni oldindan
-- to'ldiradi.
--
-- ============ NEGA `localStorage` YETARLI EMAS ============
-- Tanlov bugungacha faqat brauzerda yotardi (`lolamarket_bts_point`).
-- B2B xaridor telefonda ham, kompyuterda ham kiradi va Mini App bilan sayt
-- bitta odam uchun ikki qurilma bo'lishi mumkin — o'sha holda u har safar
-- nuqtani qaytadan tanlardi. Brauzer keshi tozalansa esa tanlov umuman
-- yo'qolardi. `localStorage` OLIB TASHLANMAYDI: u endi kirmagan (mehmon)
-- xaridor uchun va server javobi kelgunicha ko'rsatiladigan zaxira.
--
-- ============ NEGA CHECK YO'Q ============
-- Nuqtalar ro'yxati hozir FRONTENDDA yashaydi (`BTS_POINTS` — `script.js`
-- va `telegram-app/app.js`), chunki BTS API hali ulanmagan. Ro'yxatni bu
-- yerga CHECK bo'lib ko'chirish — CLAUDE.md ataylab ogohlantirgan naqsh:
-- `admin_actions_kind_check` da aynan shu tishlagan (`db/014`), qiymat
-- qo'shilgan, ikkinchi ro'yxat esa yangilanmay qolgan va funksiya
-- production'da JIMGINA ishlamagan. Shakl tekshiruvi bitta joyda —
-- serverda (`server/lib/maps.js` → `isPickupPointId`).
--
-- Uzunlik chegarasi esa QOLADI va u boshqa narsa: u ro'yxatni takrorlamaydi,
-- faqat validatsiya chetlab o'tilsa bazaga kilobaytlab axlat yozilmasligini
-- kafolatlaydi.

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS pickup_point_id TEXT;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_pickup_point_len') THEN
    ALTER TABLE users ADD CONSTRAINT users_pickup_point_len
      CHECK (pickup_point_id IS NULL OR length(pickup_point_id) <= 64);
  END IF;
END $$;

COMMENT ON COLUMN users.pickup_point_id IS
  'Xaridor tanlagan doimiy BTS olish nuqtasi (masalan bts-112). NULL = tanlanmagan — checkout''da xaridor o''zi tanlaydi.';

-- ============ TEKSHIRUV ============
-- Migratsiya "o'tdi" degani jadval TO'G'RI ekanini bildirmaydi (016/017/021
-- darsi). Uchta nozik joy:
--   1) ustun paydo bo'ldi;
--   2) u NULL qabul qiladi — "tanlanmagan" holati AYNAN shu bilan
--      ifodalanadi (`NULL` reyting qoidasi bilan bitta oila: yo'qlik
--      ko'rinadi, zaxira qiymat esa jimgina yolg'on gapiradi);
--   3) uzunlik chegarasi haqiqatan ishlaydi — CHECK yozilgan-u, amalda
--      o'tib ketadigan holat bo'lmasin.
DO $$
DECLARE
  nullable TEXT;
  ushladi  BOOLEAN := FALSE;
BEGIN
  SELECT is_nullable INTO nullable
    FROM information_schema.columns
   WHERE table_name = 'users' AND column_name = 'pickup_point_id';

  IF nullable IS NULL THEN
    RAISE EXCEPTION 'users.pickup_point_id qo''shilmagan';
  END IF;
  IF nullable <> 'YES' THEN
    RAISE EXCEPTION 'users.pickup_point_id NULL qabul qilishi kerak (hozir: %)', nullable;
  END IF;

  BEGIN
    INSERT INTO users (tg_user_id, pickup_point_id)
    VALUES (-999999, repeat('x', 65));
  EXCEPTION WHEN check_violation THEN
    ushladi := TRUE;
  END;

  IF NOT ushladi THEN
    DELETE FROM users WHERE tg_user_id = -999999;
    RAISE EXCEPTION 'users_pickup_point_len ishlamadi — 65 belgili qiymat o''tib ketdi';
  END IF;

  RAISE NOTICE 'Tekshiruv OK — pickup_point_id tayyor, uzunlik chegarasi ishlaydi.';
END $$;

COMMIT;
