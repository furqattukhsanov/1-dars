-- LolaMarket — sevimli matolar BAZADA (2026-08-14)
--
-- Founder qarori: "sevimlilarni bazaga saqlaydigan qilamiz".
--
-- ============ NEGA KERAK ============
-- ♡ tugmasi shu kuni tuzatilgan edi (15 kartochkadan 4 tasida bor edi,
-- endi 15/15), LEKIN ortidagi va'da hamon bajarilmasdi: `S.liked` FAQAT
-- brauzer xotirasida yashardi. Ya'ni Mini App yopilsa saqlangan mato
-- yo'qolardi, boshqa qurilmada esa ro'yxat bo'sh chiqardi. Bu aynan
-- founder shikoyat qilgan naqshning o'zi — "tugma ishlagandek tuyulib,
-- natijasi yo'q" — faqat bir qavat chuqurroq.
--
-- `localStorage` ATAYLAB tanlanmadi: B2B xaridor telefonda ham,
-- kompyuterda ham kiradi (`db/022` dagi ayni mulohaza). Ustiga sevimli
-- ro'yxati "Saqlangan matolar" ekranining YAGONA mazmuni — u qurilmaga
-- bog'liq bo'lsa, ekran bir joyda to'la, boshqasida bo'sh ko'rinardi.
--
-- ============ NEGA KALIT `tg_user_id`, `users.id` EMAS ============
-- `db/016` va `db/019` dagi ayni tanlov: kimlik imzolangan `initData` dan
-- (yoki sayt cookie sessiyasidan) keladi va u BUTUN son Telegram ID.
-- `users.id` ga FK qo'yilsa har yozuvdan oldin upsert kerak bo'lardi —
-- ya'ni bitta atomik `INSERT ... ON CONFLICT` o'rniga ikkita yozuv va
-- yana bitta poyga oynasi.
--
-- ============ NEGA `products` GA ESA FK BOR ============
-- Yuqoridagidan farqli: mahsulot IDsi mijozdan keladi va u O'YLAB
-- TOPILGAN bo'lishi mumkin. FK uni bazaning O'ZIDA rad etadi, ya'ni
-- validatsiya ikki joyda takrorlanmaydi. `ON DELETE CASCADE` — mahsulot
-- butunlay o'chirilsa sevimli yozuvi ham ketadi va "Saqlangan matolar"
-- ekranida bo'sh kartochka qolmaydi (`ik-9001` darsi).
--
-- ⚠️ E'LON YASHIRILGANDA (status <> 'published') yozuv QOLADI va bu
-- ATAYLAB: sotuvchi mahsulotni vaqtincha yashirib qayta ochishi mumkin,
-- xaridorning tanlovi esa uning aybi bilan o'chmasin. Ro'yxat chizilganda
-- klient baribir katalog bo'yicha filtrlaydi (`renderSaved`), ya'ni
-- yashirilgan mato ko'rinmaydi — lekin qaytganda o'z joyida turadi.

BEGIN;

CREATE TABLE IF NOT EXISTS user_favorites (
  tg_user_id  BIGINT      NOT NULL,
  product_id  TEXT        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tg_user_id, product_id)
);

-- Ro'yxat HAR DOIM bitta foydalanuvchi bo'yicha va yangisi tepada o'qiladi.
CREATE INDEX IF NOT EXISTS user_favorites_user_idx
  ON user_favorites (tg_user_id, created_at DESC);

-- Egalik: `015`–`019` dagi kabi — ilova `lola` user bilan ulanadi, migratsiya
-- esa `sudo -u postgres psql` bilan bajariladi, ya'ni jadval `postgres`
-- egaligida tug'iladi va ilova unga yoza olmaydi.
--
-- ⚠️ Bu qator 2026-08-18 da QO'SHILDI (fayl 2026-08-17 da yozilgan). Sabab:
-- AYNI kamchilik `db/028` da production'ni sindirdi —
-- `permission denied for table traffic_events`. Bu yerda nuqson KO'RINMAGAN
-- bo'lishi mumkin, chunki jadval o'sha paytda boshqa yo'l bilan (yoki `lola`
-- nomidan) yaratilgan bo'lsa egalik allaqachon to'g'ri. Qator IDEMPOTENT:
-- egalik to'g'ri bo'lsa hech narsa o'zgarmaydi. Yozilishining sababi — TOZA
-- bazada qayta qurilganda jadval jimgina yozib bo'lmaydigan holda tug'ilmasin.
ALTER TABLE user_favorites OWNER TO lola;

-- ============ TEKSHIRUV ============
-- Migratsiya O'ZINI tekshiradi (`db/022` naqshi): yozilgan SQL bajarilgan
-- SQL degani emas — `server/test.js` SQL'ni ISHGA TUSHIRMAYDI, ya'ni
-- yashil test bu yerda hech narsani isbotlamaydi.
DO $$
DECLARE
  sinov_mahsulot TEXT;
  ushladi        BOOLEAN := FALSE;
BEGIN
  IF to_regclass('public.user_favorites') IS NULL THEN
    RAISE EXCEPTION 'user_favorites jadvali yaratilmagan';
  END IF;

  -- Takroriy ♡ ikkita qator yasamasligi kerak (ikki marta bosish, ikki qurilma).
  SELECT id INTO sinov_mahsulot FROM products LIMIT 1;

  IF sinov_mahsulot IS NULL THEN
    RAISE NOTICE 'Diqqat: products bo''sh — xulq tekshiruvi O''TKAZIB YUBORILDI (tuzilma tekshirildi).';
  ELSE
    INSERT INTO user_favorites (tg_user_id, product_id) VALUES (-999999, sinov_mahsulot);
    BEGIN
      INSERT INTO user_favorites (tg_user_id, product_id) VALUES (-999999, sinov_mahsulot);
    EXCEPTION WHEN unique_violation THEN
      ushladi := TRUE;
    END;

    DELETE FROM user_favorites WHERE tg_user_id = -999999;

    IF NOT ushladi THEN
      RAISE EXCEPTION 'PRIMARY KEY ishlamadi — bitta mato ikki marta saqlanib qoldi';
    END IF;

    -- Mavjud bo'lmagan mahsulot RAD ETILISHI kerak (mijoz id o'ylab topsa).
    ushladi := FALSE;
    BEGIN
      INSERT INTO user_favorites (tg_user_id, product_id) VALUES (-999999, 'yoq-mahsulot-9999');
    EXCEPTION WHEN foreign_key_violation THEN
      ushladi := TRUE;
    END;
    DELETE FROM user_favorites WHERE tg_user_id = -999999;

    IF NOT ushladi THEN
      RAISE EXCEPTION 'FK ishlamadi — mavjud bo''lmagan mahsulot sevimliga qo''shildi';
    END IF;

    RAISE NOTICE 'Tekshiruv OK — user_favorites tayyor, takror va soxta id rad etiladi.';
  END IF;
END $$;

COMMIT;
