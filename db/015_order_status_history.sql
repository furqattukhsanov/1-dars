-- LolaMarket — buyurtma holati tarixi (2026-08-03, B bosqichi 4-band)
--
-- Muammo: `orders.status` faqat JORIY holatni saqlaydi. Buyurtma qachon
-- tasdiqlangani, kim jo'natgani, nega bekor qilingani — hech qayerda yozilmaydi.
-- Bahs chiqqanda "sotuvchi qachon jo'natdi?" degan savolga javob yo'q edi:
-- Telegram yozishmalarini qo'lda titish kerak bo'lardi.
--
-- ============ NEGA to_status DA CHECK YO'Q ============
-- Vasvasa: `CHECK (to_status IN ('pending','confirmed',...))` yozish.
-- QILINMADI. Aynan shu naqsh 2026-08-03 da tishladi: `admin_actions_kind_check`
-- da `review_hide` yo'q edi va sharh yashirish funksiyasi production'da
-- BUTUNLAY ishlamas edi (db/014). Sabab — bitta ro'yxat ikki joyda yashardi va
-- ikkinchisini yangilash unutildi.
--
-- Bu yerda cheklov KERAK EMAS: qiymat har doim `orders` jadvalining O'ZIGA
-- yozilgan `status` dan keladi va uni `orders_status_check` allaqachon
-- tekshirgan. Ya'ni noto'g'ri holat bu jadvalga tushishi uchun avval `orders`
-- ga tushishi kerak — bu esa mumkin emas. Ikkinchi ro'yxat faqat kelajakda
-- yangi holat qo'shilganda jimgina rad etadigan tuzoq bo'lardi.
--
-- `actor_kind` da esa CHECK BOR — u BU jadvalda tug'iladi, boshqa joyda
-- takrorlanmaydi, ya'ni yagona manba shu yerda.

BEGIN;

CREATE TABLE IF NOT EXISTS order_status_history (
  id          SERIAL PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  -- NULL = buyurtma endi yaratildi (oldingi holat yo'q)
  from_status TEXT,
  to_status   TEXT NOT NULL,
  -- Kim o'zgartirdi. 'system' — avtomatik yoki noma'lum manba (backfill).
  actor_kind  TEXT NOT NULL
              CHECK (actor_kind IN ('buyer', 'seller', 'admin', 'bot', 'system')),
  actor_tg    BIGINT,          -- Telegram ID; sayt buyurtmasida NULL bo'lishi mumkin
  -- Qo'shimcha kontekst: BTS trek raqami, bahs #id, qaytarish sababi
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Buyurtma sahifasi tarixni vaqt bo'yicha o'qiydi
CREATE INDEX IF NOT EXISTS idx_osh_order
  ON order_status_history (order_id, created_at);

-- ============ Mavjud buyurtmalar uchun boshlang'ich yozuv ============
-- ⚠️ Bu TIKLANGAN tarix EMAS. Oraliq qadamlar (pending -> confirmed -> shipped)
-- hech qayerda saqlanmagan, ularni qayta tiklab bo'lmaydi. Shuning uchun har
-- bir eski buyurtmaga BITTA qator yoziladi: "shu sana bo'yicha holat shu edi".
-- `from_status` NULL, `actor_kind='system'` — ya'ni bu yozuv haqiqiy o'tish
-- emasligi ochiq ko'rinib turadi va uni keyinchalik chin tarix deb o'qib
-- bo'lmaydi.
--
-- `created_at` buyurtmaning yaratilgan sanasi qilib qo'yiladi (now() emas),
-- aks holda 13 ta eski buyurtma "bugun o'zgargan" bo'lib ko'rinardi.
--
-- Idempotent: allaqachon tarixi bor buyurtma o'tkazib yuboriladi, ya'ni
-- migratsiya qayta ishga tushsa yozuvlar ikkilanmaydi.
INSERT INTO order_status_history (order_id, from_status, to_status, actor_kind, actor_tg, note, created_at)
SELECT o.id, NULL, o.status, 'system', o.tg_user_id,
       'backfill: tarix jadvali qo''shilishidan oldingi holat (oraliq qadamlar noma''lum)',
       o.created_at
  FROM orders o
 WHERE NOT EXISTS (SELECT 1 FROM order_status_history h WHERE h.order_id = o.id);

-- Egalik: 004/005 dagi kabi — ilova `lola` user bilan ulanadi
ALTER TABLE order_status_history OWNER TO lola;
ALTER SEQUENCE order_status_history_id_seq OWNER TO lola;

DO $$
DECLARE n INT; missing INT;
BEGIN
  SELECT count(*) INTO n FROM order_status_history;
  SELECT count(*) INTO missing
    FROM orders o
   WHERE NOT EXISTS (SELECT 1 FROM order_status_history h WHERE h.order_id = o.id);
  IF missing > 0 THEN
    RAISE EXCEPTION 'Tekshiruv muvaffaqiyatsiz: % ta buyurtma tarixsiz qoldi', missing;
  END IF;
  RAISE NOTICE 'Tekshiruv OK — % ta tarix yozuvi, tarixsiz buyurtma yo''q.', n;
END $$;

COMMIT;
