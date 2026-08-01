-- LolaMarket — eski buyurtmalarda commission_amount / payout_amount to'ldirish
--
-- Muammo: Sprint 7 (005_sprint7_admin.sql) commission_rate/commission_amount/
-- payout_amount ustunlarini qo'shdi, lekin ulardan OLDIN yaratilgan buyurtmalarda
-- bu ustunlar NULL qoladi — komissiya hisoboti ularni 0 deb ko'rsatadi va
-- statistika kamayib ko'rinadi (haqiqiy GMV o'zgarmagan).
--
-- Stavka: 005 dan oldin commission_rate umuman yozilmagan, shuning uchun
-- haqiqiy o'shа paytdagi stavkani bilib bo'lmaydi — 2026-07-30 da amalda
-- bo'lgan default qiymat, 0.10, ishlatiladi.
--
-- ⚠️ Bu 0.10 QASDDAN qotirilgan va O'ZGARTIRILMAYDI — migratsiya production'da
-- 2026-07-30 da ALLAQACHON bajarilgan, fayl o'sha ijroning qaydi. 2026-08-02 da
-- stavka 0.12 ga ko'tarildi va MAVJUD buyurtmalar ham qayta hisoblandi, lekin
-- buni shu faylni tahrirlash emas, keyingi migratsiya qiladi:
-- db/013_commission_12.sql. Joriy stavka faqat server/config.js dan keladi.
--
-- Idempotent: faqat commission_amount IS NULL qatorlarga tegadi, qayta
-- ishga tushirilsa hech narsa o'zgarmaydi.

UPDATE orders
   SET commission_rate   = COALESCE(commission_rate, 0.10),
       commission_amount = ROUND(total_amount * COALESCE(commission_rate, 0.10)),
       payout_amount     = total_amount - ROUND(total_amount * COALESCE(commission_rate, 0.10))
 WHERE commission_amount IS NULL
   AND total_amount IS NOT NULL;
