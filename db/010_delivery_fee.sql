-- LolaMarket — buyurtma xulosasida logistika (BTS) narxi
--
-- Muammo: checkout va buyurtma xulosasida faqat mahsulot narxi ko'rsatiladi,
-- logistika narxi hech qayerda alohida qator sifatida yo'q edi.
--
-- Yechim: BTS API ulanmagani uchun (Sprint 6) dinamik hisoblanmaydi —
-- COMMISSION_RATE bilan bir xil naqsh: bitta taxminiy summa (config.js
-- DELIVERY_FEE_ESTIMATE), buyurtma yaratilganda snapshot qilinadi. Bu pul
-- platforma escrow'iga kirmaydi (PRD: xaridor BTS nuqtasida to'g'ridan-to'g'ri
-- BTS'ga to'laydi) — faqat ma'lumot va hisobot uchun saqlanadi.
--
-- Idempotent: qayta ishga tushsa xatosiz o'tadi.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee_estimate BIGINT;
