-- LolaMarket — review_hide amali admin_actions.kind cheklovida yo'q edi
-- (2026-08-03 da topildi, B2 sinov sessiyasida)
--
-- routes/admin.js dagi ADMIN_ACTIONS jadvalida `review_hide` haqiqiy amal
-- sifatida ro'yxatga olingan (sharh yashirish, Telegram'da tasdiqlanadi —
-- CLAUDE.md arxitektura qoidasi). Lekin 005_sprint7_admin.sql dagi
-- admin_actions_kind_check CHECK cheklovi uni hech qachon o'z ichiga
-- olmagan — dispute_resolve migratsiyaga kiritilgan, review_hide esa
-- unutilgan (sharhlar funksiyasi keyinroq, 012_reviews.sql da qo'shilgan,
-- lekin CHECK shu paytgacha yangilanmagan).
--
-- Natija: sharh yashirish so'ralganda handleAdminActionRequest ->
-- INSERT INTO admin_actions (kind='review_hide', ...) BAZA DARAJASIDA rad
-- etiladi (23514 — check constraint violation). Panelda "Yashirish" tugmasi
-- 500 xato bilan qulaydi. Tasdiqlandi: BEGIN; INSERT ...; ROLLBACK; bilan
-- production'da sinaldi, xato aynan shu edi (hech narsa yozilmadi).
--
-- Postgres CHECK cheklovini ALTER qilib bo'lmaydi — eskisi o'chirilib,
-- YANGI to'liq ro'yxat bilan qayta yaratiladi. Idempotent: eski cheklov
-- yo'q bo'lsa DROP jim o'tadi (IF EXISTS).

BEGIN;

ALTER TABLE admin_actions DROP CONSTRAINT IF EXISTS admin_actions_kind_check;

ALTER TABLE admin_actions ADD CONSTRAINT admin_actions_kind_check
  CHECK (kind IN ('seller_approve','seller_reject',
                   'product_publish','product_reject',
                   'order_payout','order_refund',
                   'dispute_resolve','review_hide'));

-- Tasdiqlash: cheklov endi review_hide'ni qabul qiladi (yozib, orqaga
-- qaytariladi — bazada iz qolmaydi, faqat migratsiya ichida tekshiruv).
DO $$
BEGIN
  INSERT INTO admin_actions (kind, target_id, payload) VALUES ('review_hide', '0', '{}');
  DELETE FROM admin_actions WHERE kind = 'review_hide' AND target_id = '0';
  RAISE NOTICE 'Tekshiruv OK — review_hide endi admin_actions.kind da qabul qilinadi.';
END $$;

COMMIT;
