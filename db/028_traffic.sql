-- LolaMarket — sayt va Mini App TRAFIGI (2026-08-18)
--
-- ============ NEGA KERAK ============
-- Panelda 2026-08-13 dan `users.src` bor (odam QAYSI kanaldan keldi), lekin
-- "odam kelgandan KEYIN nima qildi" savoli butunlay ochiq edi: qaysi ekran
-- ochilgan, qaysi mato ko'rilgan, ko'rgan odam savatga qo'shdimi. Ya'ni
-- reklama pulining KIRISHI o'lchanardi, ICHKARIDAGI yo'li esa yo'q.
--
-- ⚠️ TRAFIK ALLAQACHON O'LCHANAYAPTI — LEKIN BOSHQA JOYDA. Cloudflare Web
-- Analytics beacon'i (`static.cloudflareinsights.com/beacon.min.js`) ikkala
-- yuzda ham jonli ishlaydi (2026-08-18 da brauzerda o'lchandi: `cdn-cgi/rum`
-- so'rovi otiladi, sayt tag'i `6acaeab5…`). Shuning uchun bu jadval
-- Cloudflare'ning O'RNINI BOSMAYDI va u bilan bahslashmaydi ham — u boshqa
-- savolga javob beradi:
--
--   Cloudflare biladi          → necha kishi keldi, qaysi mamlakat, qaysi havola
--   Cloudflare BILMAYDI        → qaysi MATO ko'rildi, ko'rish→savat konversiyasi
--
-- Ikkinchisi bizning `products` va `orders` jadvallari bilan BIR BAZADA
-- bo'lmasa umuman hisoblab bo'lmaydi — Cloudflare bizning mahsulot id'imizni
-- bilmaydi. Aynan shuning uchun ikkinchi yo'l ochildi (CLAUDE.md — "mavjud
-- funksiya ustiga ikkinchi yo'l" bandi: ortiqchalik SANALDI va farq shu).
--
-- ⚠️ Cloudflare raqamlari SAMPLED: 7 kundan keyin ~10% ga siyraklashadi va
-- GraphQL javobida namuna darajasi dinamik tanlanadi. Bu jadvaldagi son esa
-- HAR BIR hodisaning o'zi, ya'ni ANIQ. Ikkalasi panelda bir xil ko'rinmasin —
-- yonma-yon qo'yilsa "raqamlar mos kelmayapti" degan yolg'on nosozlik
-- tug'ilardi.
--
-- ============ MAXFIYLIK — IP HECH QACHON SAQLANMAYDI ============
-- `visitor` ustuni — `sha256(ip + '|' + user-agent + '|' + sir + '|' + KUN)`
-- ning birinchi 16 hex belgisi. Uchta xossa ATAYLAB shunday:
--   1. IP xom ko'rinishda BAZAGA TUSHMAYDI (zaxira nusxasi Telegram'ga
--      ketadi — CLAUDE.md, `BACKUP_CHAT_ID` bandi: o'sha chatdagi har kim
--      butun bazani yuklab oladi, ya'ni bu yerda xom IP bo'lsa u tarqardi);
--   2. Hash ichida KUN turadi, ya'ni bir xil odamning bugungi va ertangi
--      belgisi BOSHQACHA — odamni kunlar bo'ylab kuzatib bo'lmaydi;
--   3. Sir (`TRAFFIC_SALT`) serverda yashaydi, ya'ni bazani ko'rgan odam
--      ma'lum IP ni izlab topa olmaydi (rainbow table yo'q).
--
-- 🔴 SHUNING UCHUN "tashrifchi" SONI TAXMINIY va panel shunday DEYISHI SHART:
-- bitta ofisdagi 5 kishi bitta IP ostida (lekin har xil qurilma → har xil
-- user-agent → ko'pincha ajraladi), bitta odam wifi'dan 4G'ga o'tsa esa IKKI
-- marta sanaladi. "Ko'rishlar" ANIQ, "tashrifchi" TAXMINIY — panelda bu farq
-- yozilmasa raqam jimgina yolg'on gapirardi (`NULL` reyting oilasi).
--
-- ============ NEGA `screen` RO'YXATI BU YERDA YO'Q ============
-- Ekran nomlari (`katalog`, `product`, `savat`…) FAQAT kodda, bitta joyda
-- (`server/lib/traffic.js` → `SCREENS`). Bu yerda faqat SHAKL cheklanadi:
-- uzunlik va belgilar to'plami. Sabab CLAUDE.md dagi `to_status` darsi —
-- bir xil ro'yxat ikki joyda yashasa, ikkinchisi kelajakdagi tuzoq bo'ladi
-- (2026-08-03 da `admin_actions_kind_check` da `review_hide` yo'q edi va
-- sharh yashirish production'da BUTUNLAY ishlamasdi).
--
-- ⚠️ `kind` va `face` da esa CHECK BOR — chunki ular jadvalning TA'RIFI va
-- ustidan boshqa cheklov o'tmaydi. Tuzoqqa aylanmasligi uchun ro'yxat kod
-- bilan qulflangan: `server/test.js` → Test 42 SQL dagi CHECK ni
-- `lib/traffic.js` dagi ro'yxat bilan HARFMA-HARF solishtiradi, ya'ni yangi
-- tur qo'shilib migratsiya yangilanmasa test QIZIL bo'ladi.

CREATE TABLE IF NOT EXISTS traffic_events (
  id         BIGSERIAL PRIMARY KEY,
  at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Hodisa turi. 'view' — ekran ochildi, 'cart' — savatga qo'shildi.
  -- Buyurtma ATAYLAB yo'q: u `orders` jadvalida yashaydi va u yerda HAQIQIY
  -- (pulga bog'langan). Bu yerga nusxalansa ikki manba ikki xil son berardi.
  kind       TEXT NOT NULL CHECK (kind IN ('view','cart')),

  -- Qaysi yuz. Sayt va Mini App bir xil emas: Mini App'ga faqat Telegram'dan
  -- kiriladi, saytga esa qidiruvdan ham — aralashtirilsa "sayt o'sdi" degan
  -- xulosa aslida Mini App o'sishi bo'lib chiqishi mumkin.
  face       TEXT NOT NULL CHECK (face IN ('web','miniapp')),

  -- Normallashtirilgan ekran nomi. Klient yuborgan qiymat SERVERDA ro'yxatga
  -- solishtiriladi va mos kelmasa 'other' bo'ladi — ya'ni bu ustunga
  -- ixtiyoriy matn TUSHMAYDI (cardinality ham, XSS ham shu yerda to'xtaydi).
  screen     TEXT NOT NULL CHECK (char_length(screen) BETWEEN 2 AND 40
                                  AND screen ~ '^[a-z0-9_:-]+$'),

  -- Qaysi mato. ⚠️ `products.id` — TEXT (`'ik-1402'`), INT emas.
  --
  -- ⚠️ TASHQI KALIT ATAYLAB QO'YILMAGAN. Ikki sabab, ikkalasi ham amaliy:
  --   1. Hodisa — O'TMISHDAGI FAKT. "O'sha kuni bu matoni 40 kishi ko'rgan"
  --      degani mahsulot keyin o'chirilsa ham YOLG'ONGA aylanmaydi; FK esa
  --      uni `NULL` ga aylantirib, ko'rishlarni "noma'lum mahsulot" uyumiga
  --      qo'shib yuborardi.
  --   2. Yozuv yo'li SINMASIN: mahsulot sahifa ochilgan payt bilan beacon
  --      kelgan payt orasida o'chirilsa, FK butun INSERT ni yiqitardi va
  --      bu xato alertga chiqib, hech kimga foydasi yo'q shovqin berardi.
  -- Panel `LEFT JOIN products` qiladi — nom topilmasa xom id ko'rsatiladi.
  product_id TEXT CHECK (product_id IS NULL OR product_id ~ '^[a-zA-Z0-9_-]{1,40}$'),

  -- Kun ichida tashrifchini ajratadigan belgi (yuqoridagi MAXFIYLIK bandi).
  visitor    TEXT NOT NULL CHECK (visitor ~ '^[0-9a-f]{16}$'),

  -- Qayerdan kelgan — FAQAT HOST (`t.me`, `google.com`). To'liq URL ATAYLAB
  -- saqlanmaydi: unda qidiruv so'zi va shaxsiy parametrlar bo'lishi mumkin.
  ref        TEXT CHECK (ref IS NULL OR char_length(ref) <= 64),

  -- Kampaniya belgisi (`?src=guruh_ipak`). `users.src` bilan AYNI shakl
  -- (`routes/webhook.js` → `manbaBelgisi`), shunda panel ikkalasini bitta
  -- nom ostida solishtira oladi.
  src        TEXT CHECK (src IS NULL OR src ~ '^[a-z0-9_]{2,32}$')
);

COMMENT ON TABLE traffic_events IS
  'Sayt/Mini App trafigi. Bir qator = bitta hodisa. IP saqlanmaydi — `visitor` kun bilan tuzlangan sha256. Cloudflare Web Analytics ning o''rnini bosmaydi: bu yerda mahsulot darajasidagi ko''rish va konversiya bor.';
COMMENT ON COLUMN traffic_events.visitor IS
  'sha256(ip|user-agent|TRAFFIC_SALT|YYYY-MM-DD) ning 16 hex belgisi. Kunlar bo''ylab bog''lanmaydi — ataylab.';

-- ============ INDEKSLAR ============
-- Panel HAR DOIM vaqt oralig'i bo'yicha so'raydi (`at >= now() - N kun`),
-- shuning uchun asosiy indeks `at` da. `DESC` — oxirgi kunlar birinchi.
CREATE INDEX IF NOT EXISTS idx_traffic_at ON traffic_events (at DESC);

-- "Eng ko'p ko'rilgan matolar" so'rovi uchun. Qisman indeks: qatorlarning
-- ko'p qismida `product_id` NULL (katalog, savat, profil ekranlari).
CREATE INDEX IF NOT EXISTS idx_traffic_product ON traffic_events (product_id, at DESC)
  WHERE product_id IS NOT NULL;

-- ============ TEKSHIRUV ============
-- "Migratsiya o'tdi" ≠ "jadval to'g'ri ishlaydi" (db/025 dagi naqsh).
-- Bu yerda AYNAN maxfiylik va aniqlik da'volari sinaladi, chunki panelning
-- raqami shularga tayanadi. Sinov qatorlari darrov o'chiriladi.
DO $$
DECLARE
  belgi_a CONSTANT TEXT := '00000000deadbeef';   -- "bugungi" tashrifchi
  belgi_b CONSTANT TEXT := '11111111deadbeef';   -- "ertangi" (boshqa kun → boshqa belgi)
  n INT;
BEGIN
  DELETE FROM traffic_events WHERE visitor IN (belgi_a, belgi_b);

  -- Bitta odam uch ekran ochdi → 3 ko'rish, 1 tashrifchi.
  INSERT INTO traffic_events (kind, face, screen, visitor) VALUES
    ('view','web','katalog',belgi_a),
    ('view','web','savat',  belgi_a),
    ('view','web','profil', belgi_a);

  SELECT count(*) INTO n FROM traffic_events WHERE visitor = belgi_a;
  IF n <> 3 THEN RAISE EXCEPTION 'ko''rish soni buzilgan: kutilgan 3, kelgan %', n; END IF;

  SELECT count(DISTINCT visitor) INTO n FROM traffic_events WHERE visitor IN (belgi_a, belgi_b);
  IF n <> 1 THEN RAISE EXCEPTION 'tashrifchi soni buzilgan: kutilgan 1, kelgan %', n; END IF;

  -- Ertasi kun AYNI odam boshqa belgi oladi (hash ichida kun turadi) — ya'ni
  -- "kunlik tashrifchi" 2 bo'ladi va bu ATAYLAB shunday. Agar kelajakda
  -- belgi kunsiz yasalsa bu yerda hech narsa qizil bo'lmaydi — shuning uchun
  -- ASL qorovul kodda: `server/test.js` → Test 42.
  INSERT INTO traffic_events (kind, face, screen, visitor) VALUES ('view','web','katalog',belgi_b);
  SELECT count(DISTINCT visitor) INTO n FROM traffic_events WHERE visitor IN (belgi_a, belgi_b);
  IF n <> 2 THEN RAISE EXCEPTION 'kunlar ajratilmayapti: kutilgan 2, kelgan %', n; END IF;

  -- Shakl qorovullari HAQIQATAN ishlashi kerak: ixtiyoriy matn o'tmasin.
  BEGIN
    INSERT INTO traffic_events (kind, face, screen, visitor)
      VALUES ('view','web','<img src=x onerror=alert(1)>',belgi_a);
    RAISE EXCEPTION 'ekran nomi shakli TEKSHIRILMAYAPTI — ixtiyoriy matn o''tib ketdi';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO traffic_events (kind, face, screen, visitor)
      VALUES ('view','web','katalog','IP:127.0.0.1');
    RAISE EXCEPTION 'tashrifchi belgisi shakli TEKSHIRILMAYAPTI — xom IP o''tib ketdi';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO traffic_events (kind, face, screen, visitor)
      VALUES ('buyurtma','web','katalog',belgi_a);
    RAISE EXCEPTION 'hodisa turi ro''yxati TEKSHIRILMAYAPTI';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Mahsulot id — TEXT, lekin ixtiyoriy matn EMAS. FK yo'qligi (yuqoridagi
  -- izoh) shakl tekshiruvini MUHIMROQ qiladi: bu yerda xatolik bo'lsa uni
  -- boshqa hech narsa ushlamaydi.
  BEGIN
    INSERT INTO traffic_events (kind, face, screen, visitor, product_id)
      VALUES ('view','web','product',belgi_a,'ik-1402; DROP TABLE');
    RAISE EXCEPTION 'mahsulot id shakli TEKSHIRILMAYAPTI';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- Haqiqiy shakldagi id esa O'TISHI shart — qorovul juda tor bo'lib
  -- qolgan bo'lsa bu yerda ko'rinadi (mavjud bo'lmagan mahsulot ham
  -- yoziladi: FK yo'q, bu ataylab).
  INSERT INTO traffic_events (kind, face, screen, visitor, product_id)
    VALUES ('view','web','product',belgi_a,'ik-1402');

  DELETE FROM traffic_events WHERE visitor IN (belgi_a, belgi_b);
  RAISE NOTICE 'Tekshiruv OK — ko''rish aniq, tashrifchi kun bilan ajraladi, shakl qorovullari ishlaydi.';
END $$;
