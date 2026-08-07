-- LolaMarket — `/start` bosgan odamni ham hisoblash (2026-08-08)
--
-- MUAMMO: botga `/start` bosgan odam bazaga UMUMAN yozilmasdi. `users` qatori
-- faqat uchta joyda tug'ilardi — Mini App ochilganda (`routes/catalog.js`),
-- saytga kirilganda (`routes/web-auth.js`) va sotuvchi arizasi to'ldirilganda
-- (`routes/seller-application.js`). Ya'ni "botda qancha odam bor" degan savolga
-- javob beradigan manba HECH QAYERDA yo'q edi (Telegram Bot API ham bermaydi).
--
-- ⚠️ NEGA YANGI USTUN KERAK: `/start` qatorlarini shunchaki `users` ga qo'shsak,
-- admin paneldagi mavjud "ilovani ochganlar" raqami JIMGINA YOLG'ONGA aylanardi
-- — ichiga ilovani hech qachon ochmagan odamlar qo'shilib ketardi va buni hech
-- narsa ko'rsatmasdi. Shuning uchun ikki tushuncha ustunda AJRATILADI:
--
--   `engaged_at IS NULL`     → faqat `/start` bosgan, boshqa hech narsa qilmagan
--   `engaged_at IS NOT NULL` → ilova / sayt / sotuvchi arizasi orqali foydalangan
--
-- Bu `NULL` reyting qoidasi bilan bitta oilada: "baholanmagan" ≠ "yomon
-- baholangan", xuddi shunday "faqat kirgan" ≠ "foydalangan".

ALTER TABLE users ADD COLUMN IF NOT EXISTS engaged_at TIMESTAMPTZ;

COMMENT ON COLUMN users.engaged_at IS
  'Ilova/sayt/ariza orqali BIRINCHI haqiqiy foydalanish vaqti. NULL = faqat /start bosgan.';

-- Backfill TO'G'RI va uni isbotlash mumkin: bu migratsiyagacha `/start` hech
-- qachon qator YARATMAGAN (`routes/webhook.js` da `INSERT` yo'q edi), ya'ni
-- mavjud HAR BIR qator albatta uchta foydalanish yo'lidan biri orqali kelgan.
UPDATE users SET engaged_at = created_at WHERE engaged_at IS NULL;

-- Panel har so'rovda `count(*) FILTER (WHERE engaged_at IS NULL)` hisoblaydi.
CREATE INDEX IF NOT EXISTS users_engaged_at_idx ON users (engaged_at);
