-- LolaMarket — Sprint 7: admin panel (bahslar, komissiya, to'lov/refund)
--
-- Uch blokni ochadi:
--   1) Komissiya — har buyurtmada stavka SNAPSHOT qilinadi (keyin stavka
--      o'zgarsa eski buyurtmalar hisoboti buzilmasin).
--   2) Bahsli holatlar — 001'dagi `disputes` skeleti haqiqiy ish oqimiga
--      kengaytiriladi (holat, dalil, sotuvchi javobi, moderator qarori).
--   3) admin_actions — panel yozuvchi amalni SO'RAYDI, Telegram'da tasdiqlanadi.
--      Panel tokeni o'g'irlansa ham tasdiqsiz pul o'tkazilmaydi.
--
-- Idempotent: qayta ishga tushsa xatosiz o'tadi.

-- ============ 0) Ilgari QO'LDA qo'shilgan ustunlar ============
-- DIQQAT: prepay_amount / rest_amount / tracking_code 2026-07-25 da to'g'ridan-to'g'ri
-- production bazada ALTER bilan qo'shilgan, migratsiya fayliga tushmagan edi —
-- toza bazada loyiha ishga tushmasdi. Shu yerda rasmiylashtiriladi.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS prepay_amount BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rest_amount   BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_code TEXT;

-- ============ 1) Komissiya va to'lov ============
-- commission_rate — buyurtma yaratilgan PAYTDAGI stavka (masalan 0.1000).
-- payout_amount   — sotuvchiga o'tkaziladigan summa = total - commission.
-- Ikkalasi ham serverda hisoblanadi; klient yuborgan qiymatga ishonilmaydi.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS commission_rate   NUMERIC(5,4);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS commission_amount BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payout_amount     BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_out_at       TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_amount     BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_reason     TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_at       TIMESTAMPTZ;

-- Buyurtma holatlari kengaydi:
--   disputed  — bahs ochilgan (yakunlanmaydi, moderator qaroriga qadar turadi)
--   completed — sotuvchiga pul o'tkazilgan (savdo yopildi)
--   refunded  — xaridorga pul qaytarilgan
-- CHECK cheklovi nomi standart (`orders_status_check`), lekin baza qo'lda
-- yaratilgan bo'lsa boshqacha bo'lishi mumkin — shuning uchun `status` ustuniga
-- tegishli BARCHA check cheklovlarini topib tashlaymiz, keyin yangisini qo'yamiz.
DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN
    SELECT con.conname
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
     WHERE rel.relname = 'orders'
       AND con.contype = 'c'
       AND pg_get_constraintdef(con.oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE orders DROP CONSTRAINT %I', c.conname);
  END LOOP;

  ALTER TABLE orders ADD CONSTRAINT orders_status_check
    CHECK (status IN ('pending','confirmed','shipped','delivered',
                      'disputed','completed','refunded','cancelled'));
END $$;

-- ============ 2) Bahsli holatlar ============
-- 001'dagi jadval mavjud (id, order_id, reason, evidence_url, decision,
-- at_fault, created_at) — ustidan ish oqimi maydonlari qo'shiladi.
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open';
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS opened_by_tg BIGINT;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS seller_id INT REFERENCES sellers(id) ON DELETE SET NULL;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS seller_response TEXT;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS seller_responded_at TIMESTAMPTZ;
-- Telegram file_id massivi: dalil rasmlari Telegram serverida qoladi, bizda
-- faqat havola. Fayl yuklash/disk boshqaruvi kerak emas (2026-07-27 qarori).
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS evidence_file_ids TEXT[] NOT NULL DEFAULT '{}';
-- Bot dalil rasmini kutyaptimi? Bahs ochilganda true bo'ladi, xaridor
-- "tayyor" deb yozguncha yoki 10 rasm yuborguncha shunday qoladi.
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS awaiting_evidence BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS logistics_payer TEXT;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS refund_amount BIGINT;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
-- 24 soatlik eslatma bir martadan ko'p yubormasin uchun
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS reminded_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'disputes_status_check') THEN
    ALTER TABLE disputes ADD CONSTRAINT disputes_status_check
      CHECK (status IN ('open', 'resolved', 'rejected'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'disputes_at_fault_check') THEN
    ALTER TABLE disputes ADD CONSTRAINT disputes_at_fault_check
      CHECK (at_fault IS NULL OR at_fault IN ('buyer', 'seller', 'none'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'disputes_logistics_payer_check') THEN
    ALTER TABLE disputes ADD CONSTRAINT disputes_logistics_payer_check
      CHECK (logistics_payer IS NULL OR logistics_payer IN ('buyer', 'seller', 'platform'));
  END IF;
END $$;

-- Bitta buyurtmada bir vaqtda faqat BITTA ochiq bahs bo'lsin (ikki marta
-- bosilsa yoki ikki qurilmadan ochilsa dublikat yaratilmaydi).
CREATE UNIQUE INDEX IF NOT EXISTS idx_disputes_one_open_per_order
  ON disputes (order_id) WHERE status = 'open';

-- Moderator navbati va 24 soatlik eslatma skaneri uchun
CREATE INDEX IF NOT EXISTS idx_disputes_open ON disputes (created_at) WHERE status = 'open';

-- ============ 3) Admin amallari (panel so'raydi → Telegram tasdiqlaydi) ============
-- Oqim: panel POST /api/admin/action → bu yerga 'pending' yozuv + ADMIN_CHAT_ID'ga
-- inline tugmali xabar → admin "Tasdiqlash"ni bosadi → callback_query keladi →
-- amal bajariladi va status 'done' bo'ladi.
-- Nega shunday: panel tokeni brauzer sessionStorage'da yashaydi va o'g'irlanishi
-- mumkin; pul o'tkazish/refund kabi qaytarib bo'lmaydigan amallar uchun bitta
-- token yetarli emas (2026-07-27 founder qarori).
CREATE TABLE IF NOT EXISTS admin_actions (
  id           SERIAL PRIMARY KEY,
  kind         TEXT NOT NULL
               CHECK (kind IN ('seller_approve','seller_reject',
                               'product_publish','product_reject',
                               'order_payout','order_refund',
                               'dispute_resolve')),
  -- Amal tegishli obyekt: ariza id / mahsulot id / buyurtma id / bahs id
  target_id    TEXT NOT NULL,
  -- Amalga xos qo'shimcha ma'lumot: {reason, amount, atFault, logisticsPayer, ...}
  payload      JSONB NOT NULL DEFAULT '{}'::jsonb,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','done','declined','expired','failed')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at   TIMESTAMPTZ,
  decided_by   BIGINT,          -- tasdiqlagan adminning Telegram ID'si
  error        TEXT,            -- bajarishda xato bo'lsa sababi
  tg_message_id BIGINT          -- tasdiq xabari (bosilgach tahrirlanadi)
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_pending
  ON admin_actions (requested_at DESC) WHERE status = 'pending';

-- ============ 4) Statistika uchun indekslar ============
-- Kunlik/oylik GMV agregatsiyasi `created_at` bo'yicha guruhlaydi; holat
-- bo'yicha ham filtrlaymiz (bekor qilingan buyurtma GMV'ga kirmasin).
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders (status, created_at DESC);
