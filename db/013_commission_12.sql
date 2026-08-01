-- LolaMarket — komissiya stavkasi 10% dan 12% ga (2026-08-02 founder qarori)
--
-- Odatda `orders.commission_rate` buyurtma yaratilgan PAYTDAGI stavkaning
-- snapshot'i bo'lib, ataylab o'zgarmas edi (Sprint 7 qarori). Bu safar
-- founder MAVJUD buyurtmalarni ham yangi stavkaga o'tkazishni so'radi —
-- ya'ni bazada bitta yagona stavka qoladi, o'tgan davr hisoboti esa
-- retroaktiv o'zgaradi. Bu ongli qaror, nuqson emas.
--
-- ⚠️ MUHIM — TO'LANGAN BUYURTMALAR HAM QAMRALADI. Pul allaqachon o'tkazilgan
-- buyurtmalarda (paid_out_at IS NOT NULL) sotuvchiga ESKI 10% stavka bo'yicha,
-- ya'ni summaning 90% i to'langan. Ularni 12% ga o'tkazgach baza haqiqiy bank
-- o'tkazmasi bilan ZID bo'ladi: yozuvda "sotuvchiga 88% o'tdi" deb turadi,
-- aslida 90% o'tgan.
--
-- Bu ogohlantirish founder'ga aytildi va u 2026-08-02 da "to'langan buyurtmalar
-- ham yangi stavkada qolsin" deb ATAYLAB tasdiqladi — ya'ni bazada bitta yagona
-- stavka bo'lishi buxgalteriya aniqligidan ustun qo'yildi. `WHERE paid_out_at
-- IS NULL` filtri SHU SABAB yo'q; kelajakda kimdir "unutib qoldirilgan" deb
-- qo'shib qo'ymasin. Migratsiya bunday qatorlarni quyida ro'yxatlab beradi —
-- ular bo'yicha farq buxgalteriyada qo'lda hisobga olinadi.
--
-- Idempotent: summalar har safar `total_amount` dan QAYTA hisoblanadi
-- (o'suvchi emas), shuning uchun qayta ishga tushirilsa natija o'zgarmaydi.
--
-- Qaytarib olish: quyida `orders_commission_bak_20260802` zaxira jadvali
-- yaratiladi — kerak bo'lsa undan tiklanadi (eng pastdagi izohga qarang).

BEGIN;

-- 1. Zaxira: o'zgarishdan OLDINGI holat. Bir marta yaratiladi — migratsiya
--    qayta ishga tushsa zaxira ustidan yozilmaydi (aks holda birinchi
--    ishga tushirishdagi asl 10% qiymatlar yo'qolardi).
CREATE TABLE IF NOT EXISTS orders_commission_bak_20260802 AS
  SELECT id, total_amount, commission_rate, commission_amount,
         payout_amount, paid_out_at, status, now() AS backed_up_at
    FROM orders;

-- 2. Pul o'tkazilgan buyurtmalar — bazadagi yozuv haqiqiy o'tkazmadan
--    farq qiladigan qatorlar. Migratsiya chiqishida ko'rinadi.
DO $$
DECLARE r RECORD; n INT := 0;
BEGIN
  FOR r IN
    SELECT id, total_amount,
           ROUND(total_amount * 0.10) AS eski_komissiya,
           ROUND(total_amount * 0.12) AS yangi_komissiya
      FROM orders
     WHERE paid_out_at IS NOT NULL
     ORDER BY id
  LOOP
    n := n + 1;
    RAISE NOTICE 'TO''LANGAN #% — jami %, komissiya % -> % (farq %)',
      r.id, r.total_amount, r.eski_komissiya, r.yangi_komissiya,
      r.yangi_komissiya - r.eski_komissiya;
  END LOOP;
  IF n = 0 THEN
    RAISE NOTICE 'Pul o''tkazilgan buyurtma yo''q — buxgalteriya farqi yo''q.';
  ELSE
    RAISE NOTICE '% ta to''langan buyurtma yangi stavkaga o''tkazildi — farqni qo''lda hisobga oling.', n;
  END IF;
END $$;

-- 3. Qayta hisoblash. total_amount NULL bo'lgan qator bo'lsa tegilmaydi.
UPDATE orders
   SET commission_rate   = 0.12,
       commission_amount = ROUND(total_amount * 0.12),
       payout_amount     = total_amount - ROUND(total_amount * 0.12)
 WHERE total_amount IS NOT NULL;

-- 4. Tasdiqlash: 0.12 dan boshqa stavka qolmasligi kerak.
DO $$
DECLARE bad INT;
BEGIN
  SELECT count(*) INTO bad
    FROM orders
   WHERE total_amount IS NOT NULL
     AND (commission_rate IS DISTINCT FROM 0.12
       OR commission_amount IS DISTINCT FROM ROUND(total_amount * 0.12)
       OR payout_amount IS DISTINCT FROM total_amount - ROUND(total_amount * 0.12));
  IF bad > 0 THEN
    RAISE EXCEPTION 'Tekshiruv muvaffaqiyatsiz: % ta qator 12% ga mos emas', bad;
  END IF;
  RAISE NOTICE 'Tekshiruv OK — barcha buyurtmalar 12% stavkada.';
END $$;

COMMIT;

-- Tiklash (kerak bo'lsa):
--   UPDATE orders o
--      SET commission_rate   = b.commission_rate,
--          commission_amount = b.commission_amount,
--          payout_amount     = b.payout_amount
--     FROM orders_commission_bak_20260802 b
--    WHERE o.id = b.id;
