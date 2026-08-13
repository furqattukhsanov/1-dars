-- LolaMarket — foydalanuvchi QAYERDAN kelgani (2026-08-13)
--
-- MUAMMO: `db/020` "botda qancha odam bor" savoliga javob berdi, lekin
-- "ular QAYERDAN keldi" savoli ochiq qoldi. Ya'ni reklama boshlansa qaysi
-- kanal ishlaganini o'lchash imkoni YO'Q edi va byudjet ko'r-ko'rona
-- ketardi (jamoa muhokamasi, 2026-08-13: PM, marketolog va investor
-- UCHALASI ham aynan shu bandni ko'tardi).
--
-- ============ QAYERDAN KELADI ============
-- Telegram deep-link: `t.me/<bot>?start=PAYLOAD`. Odam havolani bosganda
-- Telegram botga `/start PAYLOAD` yuboradi. Payload'ni BIZ yozamiz, ya'ni
-- har kanalga o'z havolasi beriladi:
--
--   t.me/LolaMarketBot?start=guruh_ipak     → to'qima Telegram guruhi
--   t.me/LolaMarketBot?start=insta          → Instagram profili
--
-- ⚠️ QIYMAT KLIENTDAN KELADI, lekin BROWSER'dan emas: uni Telegram'ning
-- O'ZI webhook orqali yuboradi va so'rov `WEBHOOK_SECRET` bilan
-- tekshirilgan (CLAUDE.md — kimlik brauzerdan olinmaydi). Shunga qaramay
-- payload IXTIYORIY matn bo'lishi mumkin: havolani har kim yasay oladi.
-- Shuning uchun shakl kodda tekshiriladi (`routes/webhook.js` →
-- `manbaBelgisi`) va bu yerda ustun UZUNLIGI bilan ham cheklanadi.
--
-- ============ NEGA BIRINCHI TEGINISH ============
-- `src` FAQAT BIR MARTA yoziladi va keyin HECH QACHON o'zgarmaydi
-- (`COALESCE(users.src, EXCLUDED.src)`). Sabab: odamni platformaga OLIB
-- KELGAN kanal — birinchisi. Keyin u boshqa havoladan qayta kirsa,
-- oxirgi manba yozilsa, eng ko'p ESLATMA yuborilgan kanal eng samarali
-- ko'rinib qolardi — ya'ni raqam o'zini o'zi tasdiqlaydigan yolg'onga
-- aylanardi.
--
-- ⚠️ ORQAGA QAYTMAYDI: bu ustun bugundan sanaydi. Mavjud qatorlarda `src`
-- `NULL` bo'lib qoladi va u "manba noma'lum" degani — "to'g'ridan-to'g'ri
-- keldi" DEGANI EMAS. Panel ikkalasini ARALASHTIRMASLIGI shart
-- (`NULL` reyting qoidasi bilan bitta oila: "o'lchanmagan" ≠ "nol").

ALTER TABLE users ADD COLUMN IF NOT EXISTS src TEXT;

COMMENT ON COLUMN users.src IS
  'BIRINCHI teginish manbasi — /start deep-link payload i. NULL = o''lchanmagan (bu ustun qo''shilishidan oldin kelgan yoki havolasiz /start bosgan).';

-- Panel `GROUP BY src` qiladi — ro'yxat qisqa, lekin `NULL` lar ko'p
-- bo'lgani uchun qisman indeks aynan kerakli qatorlarni qamraydi.
CREATE INDEX IF NOT EXISTS users_src_idx ON users (src) WHERE src IS NOT NULL;

-- ============ TEKSHIRUV ============
-- "Migratsiya o'tdi" ≠ "ustun to'g'ri ishlaydi". Bu yerda BIRINCHI TEGINISH
-- qoidasining o'zi sinaladi: ikkinchi `/start` boshqa havoladan kelganda
-- qiymat O'ZGARMASLIGI kerak. Sinov qatori darrov o'chiriladi.
DO $$
DECLARE
  test_tg CONSTANT TEXT := '-999000001';   -- haqiqiy Telegram ID bo'la olmaydi
  natija  TEXT;
BEGIN
  DELETE FROM users WHERE tg_user_id = test_tg::bigint;

  INSERT INTO users (tg_user_id, role, src) VALUES (test_tg::bigint, 'buyer', 'guruh_ipak');

  -- Ikkinchi teginish — boshqa kanal. Kod ishlatadigan AYNI shakl.
  INSERT INTO users (tg_user_id, role, src) VALUES (test_tg::bigint, 'buyer', 'insta')
  ON CONFLICT (tg_user_id) DO UPDATE SET src = COALESCE(users.src, EXCLUDED.src);

  SELECT src INTO natija FROM users WHERE tg_user_id = test_tg::bigint;
  IF natija <> 'guruh_ipak' THEN
    RAISE EXCEPTION 'BIRINCHI TEGINISH buzilgan: kutilgan guruh_ipak, kelgan %', natija;
  END IF;

  -- Manbasiz `/start` mavjud qiymatni O'CHIRMASLIGI kerak.
  INSERT INTO users (tg_user_id, role, src) VALUES (test_tg::bigint, 'buyer', NULL)
  ON CONFLICT (tg_user_id) DO UPDATE SET src = COALESCE(users.src, EXCLUDED.src);

  SELECT src INTO natija FROM users WHERE tg_user_id = test_tg::bigint;
  IF natija <> 'guruh_ipak' THEN
    RAISE EXCEPTION 'manbasiz /start mavjud manbani o''chirib yubordi: %', natija;
  END IF;

  DELETE FROM users WHERE tg_user_id = test_tg::bigint;
  RAISE NOTICE 'Tekshiruv OK — birinchi teginish saqlanadi, manbasiz /start uni o''chirmaydi.';
END $$;
