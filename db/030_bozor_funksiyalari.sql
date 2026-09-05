-- LolaMarket — bozor tadqiqotidan kelgan funksiyalar (2026-09-05)
--
-- Manba: 15+ marketplace tadqiqoti (SwatchOn, Alibaba, Uzum, WB...) va
-- founder tanlovi: spec (eni+uzunligi), namuna so'rovi, savat eslatmasi,
-- sharh rasmi, «kelganda xabar ber». Tafsilot: docs/sprintlar/ va sessiya
-- hisobotida.
--
-- ============ 1. Mahsulot: rulon uzunligi ============
-- `width` (eni) 001 dan beri bor edi, lekin sotuvchi kirita olmasdi —
-- faqat seed ma'lumotida yashardi. Endi ikkalasi sotuvchi formasida.
-- TEXT va erkin shakl («40 m») — `width` bilan bitta uslub: birlikni
-- sotuvchi o'zi yozadi, server raqamga majburlamaydi. NULL = ko'rsatilmaydi
-- (o'ylab topilgan qiymat yo'q — NULL reyting qoidasi bilan bitta oila).
ALTER TABLE products ADD COLUMN IF NOT EXISTS roll_length TEXT;

-- ============ 2. Sharh rasmi ============
-- Ozon darsi: «kelgan matoning haqiqiy fotosi» — eng kuchli ishonch signali.
-- Fayl Telegram'da yashaydi (bahs dalili va mahsulot surati bilan bitta
-- omborxona — `sendPhotoBytes` izohi, lib/telegram-api.js), bu yerda faqat
-- file_id lar. Massiv — kelajakda bir nechta rasm uchun; hozircha klient
-- bittadan yuboradi.
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS photo_file_ids TEXT[] NOT NULL DEFAULT '{}';

-- ============ 3. «Kelganda xabar ber» obunasi ============
-- SwatchOn/1688 darsi: tikuvchining eng katta qo'rquvi — ayni matoni qayta
-- topa olmaslik. Mato tugaganda xaridor obuna bo'ladi; sotuvchi zaxirani
-- 0 dan ko'targanda bot xabar yuboradi (routes/seller.js dagi stok yo'li).
--
-- FK ATAYLAB yo'q (db/029 sababi bilan): obuna — foydalanuvchi xohishi
-- fakti; mahsulot o'chsa xabar shunchaki yuborilmaydi.
-- `notified_at` — bir obuna BIR marta otadi (spam emas); xaridor yana
-- obuna bo'lsa yangi qator emas, notified_at NULL ga qaytadi (UNIQUE juftlik).
CREATE TABLE IF NOT EXISTS stock_alerts (
  id          BIGSERIAL PRIMARY KEY,
  tg_user_id  BIGINT NOT NULL,
  product_id  TEXT NOT NULL CHECK (product_id ~ '^[a-zA-Z0-9_-]{1,40}$'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_at TIMESTAMPTZ,
  UNIQUE (tg_user_id, product_id)
);
ALTER TABLE stock_alerts OWNER TO lola;
ALTER SEQUENCE stock_alerts_id_seq OWNER TO lola;

-- ============ 4. Namuna so'rovi ============
-- Mato sohasining №1 xarid to'sig'i: ko'rmasdan hech kim rulon olmaydi
-- (Mood Fabrics: qaytarishlarning 99% i namunasiz xaridlardan). Shartlar
-- (narx, o'lcham) hali founder bilan kelishilmagan — shuning uchun bu
-- BUYURTMA EMAS, SO'ROV: pul yo'q, sotuvchi/founder bog'lanadi. Shartlar
-- aniqlashgach alohida band bilan buyurtma oqimiga ulanadi.
CREATE TABLE IF NOT EXISTS sample_requests (
  id          BIGSERIAL PRIMARY KEY,
  tg_user_id  BIGINT NOT NULL,
  buyer_name  TEXT,
  product_id  TEXT NOT NULL CHECK (product_id ~ '^[a-zA-Z0-9_-]{1,40}$'),
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','done','declined')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE sample_requests OWNER TO lola;
ALTER SEQUENCE sample_requests_id_seq OWNER TO lola;

-- ============ 5. Savat eslatmasi belgisi ============
-- Savat brauzerda yashaydi, server esa `user_events` (cart_add/cart_remove)
-- orqali FAKTNI biladi: «savatga soldi va buyurtma bermadi». Eslatma shu
-- faktni aytadi, savat tarkibini EMAS (taxmin qilingan tarkib jimgina
-- yolg'on bo'lardi). Bu ustun — chastota qulfi: bitta foydalanuvchiga
-- eslatma eng ko'pi bilan 72 soatda bir marta (server/lib/engagement.js).
ALTER TABLE users ADD COLUMN IF NOT EXISTS cart_reminded_at TIMESTAMPTZ;
