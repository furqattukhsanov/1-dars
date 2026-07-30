-- LolaMarket — mahsulot rasmi (Telegram file_id)
--
-- Muammo: sotuvchi mahsulot qo'shganda rasm biriktira olmasdi — forma
-- validate sxemasida `img` maydoni umuman yo'q edi, mahsulot doim rasmsiz
-- yaratilardi.
--
-- Yechim — dalil rasmi (disputes) bilan bir xil naqsh (2026-07-27 qarori,
-- 005_sprint7_admin.sql): fayl bizning serverga yuklanmaydi, faqat Telegram
-- file_id saqlanadi. Mahsulot qo'shilgach bot sotuvchidan rasm so'raydi;
-- kelgan rasm shu ustunga yoziladi. Ko'rsatishda server file_id'ni
-- HMAC-imzolangan havola orqali proksi qiladi (bot tokeni chiqmaydi).
--
-- Idempotent: qayta ishga tushsa xatosiz o'tadi.

ALTER TABLE products ADD COLUMN IF NOT EXISTS img_file_id TEXT;

-- Bot mana shu mahsulot uchun rasm kutayaptimi? Yangi e'lon yaratilganda
-- true bo'ladi, rasm kelgach yoki sotuvchi qayta so'raganda o'zgaradi.
-- Eski (bu ustun qo'shilishidan oldingi) qatorlar uchun default FALSE —
-- ular kutilmaganda kelgan rasmni o'ziga tortib olmasin.
ALTER TABLE products ADD COLUMN IF NOT EXISTS awaiting_image BOOLEAN NOT NULL DEFAULT false;
