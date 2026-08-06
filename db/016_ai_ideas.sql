-- LolaMarket — AI kiyim g'oyalari keshi va kunlik limit (2026-08-06, Sprint 10)
--
-- Ikkita jadval qo'shiladi:
--   1) product_ai_ideas — mahsulotga biriktirilgan AI g'oyalari (kesh)
--   2) ai_usage         — foydalanuvchining kunlik generatsiya hisobi
--
-- ============ NEGA KESH VAQT BILAN EMAS, HASH BILAN ESKIRADI ============
-- Vasvasa: `created_at + 30 kun` bilan eskirtirish. QILINMADI (Sprint 10,
-- 3-qaror). Vaqt o'tishi mato tavsifining o'zgarishi bilan HECH QANDAY
-- bog'liq emas: tarkib "100% ipak" dan "70% ipak, 30% paxta" ga tahrirlansa,
-- eski tarkibga qarab yozilgan g'oyalar sahifada qolib ketardi va buni hech
-- kim sezmasdi. Vaqt bo'yicha eskirish bu muammoni HAL QILMAYDI — u faqat
-- yolg'onning ko'rsatilish muddatini qisqartiradi.
--
-- Shuning uchun `source_hash` — generatsiya paytidagi mato matnining sha256'si
-- (`name_uz | comp_uz | cat_key | width | weight`). O'qishda hash qayta
-- hisoblanadi; mos kelmasa kesh YAROQSIZ deb qaraladi va qayta generatsiya
-- bo'ladi. Bu `NULL` reyting va `ALERT_CHAT_ID` darslari bilan bitta oilada:
-- **jimgina yolg'on yo'qlikdan yomonroq** — yo'qlik ko'rinadi, yolg'on esa yo'q.

BEGIN;

-- ============ 1. G'OYALAR KESHI ============
--
-- ⚠️ BIRLAMCHI KALIT `(product_id, lang)`, faqat `product_id` EMAS.
-- Sprint faylining vazifalar ro'yxatida "product_id (PK)" deb yozilgan edi,
-- lekin O'SHA faylning 7-qarori aniq talab qiladi: "Ruscha qo'shilganda kesh
-- kaliti `mahsulot + til` bo'ladi — BUGUNDAN shunday loyihalanadi, lekin bugun
-- ishlatilmaydi". Ikkisidan qaror kuchliroq. Bugun bu yerda faqat 'uz' qatorlar
-- bo'ladi; ruscha qo'shilganda MIGRATSIYA KERAK BO'LMAYDI — aks holda tayyor
-- keshni tashlab yuborish yoki PK ni jonli jadvalda o'zgartirish kerak bo'lardi.
CREATE TABLE IF NOT EXISTS product_ai_ideas (
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  -- Til bu jadvalda TUG'ILADI va boshqa joyda ro'yxat sifatida takrorlanmaydi,
  -- shuning uchun bu yerda CHECK o'rinli (db/015 dagi `actor_kind` bilan bir xil
  -- mulohaza). Taqqoslash uchun: `to_status` da CHECK ataylab YO'Q, chunki u
  -- ro'yxat `orders_status_check` da allaqachon bor edi.
  lang        TEXT NOT NULL DEFAULT 'uz' CHECK (lang IN ('uz', 'ru')),
  -- AI javobi: [{ nom, izoh, sarf, qiyinlik, kerakli_kategoriyalar[] }]
  -- Sxemasi SERVERDA tekshiriladi (server/lib/ai.js) — mos kelmasa bu yerga
  -- umuman yozilmaydi. Bazada sxema majburlanmaydi: JSONB CHECK'i xatoni
  -- generatsiya paytida emas, YOZUV paytida ushlagan bo'lardi va xato xabari
  -- foydasiz chiqardi.
  ideas       JSONB NOT NULL,
  -- Generatsiya paytidagi mato matnining sha256'si (yuqoridagi izohga qara)
  source_hash TEXT NOT NULL,
  -- Qaysi model yozgani. Diagnoz uchun: sifat yomon bo'lsa "qaysi model
  -- yozgan edi?" degan savolga javob kerak, provayder esa almashishi mumkin.
  model       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, lang)
);

-- ============ 2. KUNLIK LIMIT HISOBI ============
--
-- ⚠️ KALIT `tg_user_id`, `users.id` EMAS — bu ataylab qilingan tanlov.
-- Sabab: `users` qatori faqat Mini App `/api/auth` ni chaqirgandan keyin
-- paydo bo'ladi, mahsulot sahifasini ochish esa uni chaqirmaydi. `users.id` ga
-- FK qo'yilsa, limitni oshirishdan OLDIN har safar upsert qilish kerak bo'lardi
-- — ya'ni bitta atomik `INSERT ... ON CONFLICT` o'rniga ikkita yozuv va yana
-- bitta poyga oynasi. Kimlik baribir imzolangan `initData` dan keladi
-- (CLAUDE.md: "foydalanuvchi kimligi hech qachon brauzerdan olinmaydi"),
-- shuning uchun `tg_user_id` ning o'zi ishonchli.
--
-- ============ NEGA `day` MAHALLIY VAQTDA ============
-- `CURRENT_DATE` server mintaqasida (UTC) hisoblanadi. Foydalanuvchiga esa
-- "Ertaga 00:00 da yangilanadi" deyiladi — u TOSHKENT vaqtini nazarda tutadi.
-- UTC ishlatilsa limit aslida mahalliy 05:00 da yangilanardi va xabar JIMGINA
-- yolg'on bo'lardi: foydalanuvchi 00:30 da kirib "yangilanmabdi" deb ko'rardi,
-- xato esa hech qayerda ko'rinmasdi. Shuning uchun kun MINTAQA BILAN
-- hisoblanadi va yozuvchi kod ham shu ifodani ishlatadi (server/routes/ai.js).
CREATE TABLE IF NOT EXISTS ai_usage (
  tg_user_id  BIGINT NOT NULL,
  day         DATE   NOT NULL,
  used        INT    NOT NULL DEFAULT 0 CHECK (used >= 0),
  PRIMARY KEY (tg_user_id, day)
);

-- Limit ATOMIK oshiriladi — `decrementStock` bilan AYNI naqsh
-- (CLAUDE.md: zaxira qoidasi). Kod tomonda shakl:
--
--   INSERT INTO ai_usage (tg_user_id, day, used)
--   VALUES ($1, (now() AT TIME ZONE 'Asia/Tashkent')::date, 1)
--   ON CONFLICT (tg_user_id, day)
--   DO UPDATE SET used = ai_usage.used + 1
--         WHERE ai_usage.used < $2
--   RETURNING used;
--
-- Qator qaytmasa — limit tugagan. Alohida `SELECT` + `UPDATE` ga
-- BO'LINMASIN: ikki so'rov bir vaqtda kelsa ikkalasi ham "hali limit
-- tugamagan" deb o'qib o'tib ketardi — aynan oxirgi rulon muammosi.

-- Eski kunlarni tozalash uchun (kelajakda cron kerak bo'lsa)
CREATE INDEX IF NOT EXISTS idx_ai_usage_day ON ai_usage (day);

-- Egalik: 004/005/015 dagi kabi — ilova `lola` user bilan ulanadi
ALTER TABLE product_ai_ideas OWNER TO lola;
ALTER TABLE ai_usage         OWNER TO lola;

-- ============ TEKSHIRUV ============
-- Migratsiya "o'tdi" degani jadval TO'G'RI ekanini bildirmaydi. Bu yerda
-- aynan ikkita nozik joy tekshiriladi: PK tarkibi (tilsiz PK keyin migratsiya
-- talab qilardi) va atomik naqsh uchun kerak bo'lgan `ai_usage` PK si.
DO $$
DECLARE pk_ideas TEXT; pk_usage TEXT;
BEGIN
  SELECT string_agg(a.attname, ',' ORDER BY k.ord) INTO pk_ideas
    FROM pg_constraint c
    JOIN LATERAL unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord) ON true
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
   WHERE c.conrelid = 'product_ai_ideas'::regclass AND c.contype = 'p';

  SELECT string_agg(a.attname, ',' ORDER BY k.ord) INTO pk_usage
    FROM pg_constraint c
    JOIN LATERAL unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord) ON true
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
   WHERE c.conrelid = 'ai_usage'::regclass AND c.contype = 'p';

  IF pk_ideas IS DISTINCT FROM 'product_id,lang' THEN
    RAISE EXCEPTION 'product_ai_ideas PK kutilgani (product_id,lang) emas: %', pk_ideas;
  END IF;
  IF pk_usage IS DISTINCT FROM 'tg_user_id,day' THEN
    RAISE EXCEPTION 'ai_usage PK kutilgani (tg_user_id,day) emas: %', pk_usage;
  END IF;

  RAISE NOTICE 'Tekshiruv OK — product_ai_ideas(%) va ai_usage(%) tayyor.', pk_ideas, pk_usage;
END $$;

COMMIT;
