-- LolaMarket — mahsulot VIDEOSI (2026-08-13)
--
-- Rasm uchun qurilgan yo'lning yoniga ikkinchi tarmoq: sotuvchi botga qisqa
-- video yuboradi, u R2 ga tushadi va `cdn.lolamarket.uz` dan beriladi.
-- Ustunlar 009 (`img_file_id`) va 021 (`img_r2_key`) bilan bir xil naqshda.
--
-- ============ NEGA VIDEO UCHUN R2 SHART, RASM UCHUN ESA YO'Q ============
-- Rasmda uch pog'ona bor: R2 → Telegram proksi → statik fayl. Videoda ikkinchi
-- pog'ona AMALDA YO'Q: `handleProductPhoto` (routes/catalog.js) faylni
-- butunlay `pipe` qiladi va `Range` (HTTP 206) javobini bermaydi, iOS Safari
-- esa `<video>` uchun aynan shuni talab qiladi. Ya'ni `vid_file_id` ning O'ZI
-- hech narsa ko'rsatmaydi.
--
-- Shuning uchun kod tartibi teskari: avval R2, KEYIN bu jadval. R2 yiqilsa
-- bu yerga UMUMAN yozilmaydi. Aks holda katalogda hech qachon ochilmaydigan
-- video "bor" bo'lib turardi — bu `NULL` reyting va `ALERT_CHAT_ID` darslari
-- bilan bitta oila: **jimgina yolg'on yo'qlikdan yomonroq**.
--
-- ⚠️ Shunga qaramay `vid_file_id` SAQLANADI. R2 — qo'shimcha ombor,
-- almashtiruvchi emas (2026-08-09 qoidasi): R2 yo'lida nimadir chiqsa
-- Telegram nusxasi joyida turadi va baytlar yo'qolmaydi.
--
-- ============ NEGA `vid_seconds` GA CHECK QO'YILMAGAN ============
-- Davomiylik chegarasi (30 s) kodda turadi (`routes/catalog.js` →
-- `VIDEO_MAX_SECONDS`). Uni bu yerga ham yozish — o'sha ikkinchi ro'yxat
-- tuzog'i: 2026-08-03 da `admin_actions_kind_check` da `review_hide` yo'qligi
-- sharh yashirishni production'da butunlay o'ldirgan edi. Chegara o'zgarsa
-- ikki joyda o'zgarishi kerak bo'lardi va biri albatta unutilardi.
--
-- Idempotent: qayta ishga tushsa xatosiz o'tadi.

BEGIN;

-- Telegram nusxasi — ZAXIRA kanal (021 dagi `file_id` bilan bir xil mulohaza)
ALTER TABLE products ADD COLUMN IF NOT EXISTS vid_file_id TEXT;

-- R2 dagi obyekt kaliti. NULL = video KO'RSATILMAYDI (yuqoridagi sabab).
ALTER TABLE products ADD COLUMN IF NOT EXISTS vid_r2_key TEXT;

-- Muqova (poster) — videoning birinchi kadri. Telegram uni O'ZI beradi
-- (`msg.video.thumbnail`), shuning uchun serverda `ffmpeg` KERAK EMAS.
-- Bu ataylab: loyiha `sharp` dan ham voz kechgan (`lib/png.js` darsi) —
-- nativ paket deploy'ga yangi sinish nuqtasi qo'shardi.
ALTER TABLE products ADD COLUMN IF NOT EXISTS vid_poster_file_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS vid_poster_r2_key TEXT;

-- Davomiylik (soniya) — UI da "0:14" bo'lib ko'rsatiladi.
ALTER TABLE products ADD COLUMN IF NOT EXISTS vid_seconds INT;

-- Hajm (bayt). Founder qarori: namunalar yig'ilgach "video qancha joy oladi"
-- degan savolga O'LCHANGAN javob kerak, taxmin emas ("hujjatdagi raqam —
-- tekshirilmagan da'vo" darsi). R2 dan HEAD so'rov bilan ham olsa bo'lardi,
-- lekin u har ko'rish uchun tashqi chaqiruv qo'shardi — bayt allaqachon
-- qo'limizda (yuklab olingan bufer), shu yerda yozib qo'yiladi.
ALTER TABLE products ADD COLUMN IF NOT EXISTS vid_bytes INT;

-- Video QACHON kelgani. `created_at` BUNI BERMAYDI — u e'lon yaratilgan
-- payt: allaqachon nashr qilingan eski mahsulotga bugun yuborilgan video
-- ro'yxatning tubiga tushib ketardi va moderator uni ko'rmasdi.
ALTER TABLE products ADD COLUMN IF NOT EXISTS vid_at TIMESTAMPTZ;

-- Bot shu mahsulot uchun video kutayaptimi.
--
-- 🔴 DEFAULT `false` — ENG MUHIM QATOR. Agar `true` bo'lsa, bazadagi HAMMA
-- eski mahsulot "video kutyapti" holatiga tushardi va sotuvchi bahs uchun
-- yuborgan tasodifiy video eng oxirgi e'loniga yopishib qolardi. Yangi
-- e'londa bayroq kod tomonidan yoqiladi (`handleSubmitProduct`), eskisida
-- esa — sotuvchi rasm yuborgan paytda (`handleProductImage`).
ALTER TABLE products ADD COLUMN IF NOT EXISTS awaiting_video BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN products.vid_r2_key IS
  'R2 dagi video kaliti. NULL = video ko''rsatilmaydi (Telegram proksisi Range bermaydi).';
COMMENT ON COLUMN products.vid_file_id IS
  'Telegram zaxira nusxasi. R2 yo''lida nosozlik chiqsa baytlar shu yerdan qaytariladi.';

-- ============ TEKSHIRUV ============
-- Migratsiya "o'tdi" degani jadval TO'G'RI ekanini bildirmaydi (016/017/021
-- darsi). Bu yerda to'rtta nozik joy tekshiriladi.
DO $$
DECLARE
  yetishmagan TEXT;
  aw_nullable TEXT;
  aw_default  TEXT;
  ochiq_eski  INT;
BEGIN
  -- 1) Hamma ustun paydo bo'ldimi.
  SELECT string_agg(k, ', ') INTO yetishmagan
    FROM unnest(ARRAY['vid_file_id','vid_r2_key','vid_poster_file_id',
                      'vid_poster_r2_key','vid_seconds','vid_bytes','vid_at','awaiting_video']) AS k
   WHERE NOT EXISTS (
     SELECT 1 FROM information_schema.columns
      WHERE table_name = 'products' AND column_name = k);
  IF yetishmagan IS NOT NULL THEN
    RAISE EXCEPTION 'products ga qo''shilmagan ustun(lar): %', yetishmagan;
  END IF;

  -- 2) Video ustunlari NULL qabul qilsin — `NULL` = "video yo'q" holati.
  --    Zaxira qiymat (bo'sh satr) QO'YILMAYDI: u "kalit bor, lekin bo'sh"
  --    degan mavjud bo'lmagan holatni yaratardi (021 dagi bilan bir xil).
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'products'
       AND column_name IN ('vid_file_id','vid_r2_key','vid_poster_file_id',
                           'vid_poster_r2_key','vid_seconds','vid_bytes','vid_at')
       AND is_nullable <> 'YES')
  THEN
    RAISE EXCEPTION 'video ustunlari NULL qabul qilishi kerak';
  END IF;

  -- 3) Bayroq NOT NULL va DEFAULT false. `NULL` uchinchi holat bo'lib
  --    qolsa "kutyaptimi?" degan savolga javob noaniq bo'lardi.
  SELECT is_nullable, column_default INTO aw_nullable, aw_default
    FROM information_schema.columns
   WHERE table_name = 'products' AND column_name = 'awaiting_video';
  IF aw_nullable <> 'NO' OR aw_default IS DISTINCT FROM 'false' THEN
    RAISE EXCEPTION 'awaiting_video NOT NULL DEFAULT false bo''lishi kerak (nullable=%, default=%)',
      aw_nullable, aw_default;
  END IF;

  -- 4) 🔴 Eski qatorlarning BIRORTASI ham ochiq qolmasin. Bu (3) dan
  --    alohida tekshiriladi: DEFAULT to'g'ri bo'lsa ham, kimdir migratsiyani
  --    tahrirlab `UPDATE ... SET awaiting_video = true` qo'shsa, bazadagi
  --    har bir e'lon keyingi tasodifiy videoni o'ziga tortib olardi.
  SELECT count(*) INTO ochiq_eski FROM products WHERE awaiting_video = true;
  IF ochiq_eski > 0 THEN
    RAISE EXCEPTION 'migratsiyadan keyin % ta mahsulot video kutyapti — 0 bo''lishi kerak', ochiq_eski;
  END IF;

  RAISE NOTICE 'Tekshiruv OK — video ustunlari tayyor, eski e''lonlar video kutmayapti.';
END $$;

COMMIT;
