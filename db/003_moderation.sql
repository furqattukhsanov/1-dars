-- LolaMarket — Moderatsiya (approval) workflow (Sprint 3 davomi / Dars 11)
-- Mahsulot e'lonlariga status qo'shadi: draft / pending / published / rejected.
-- Yangi e'lon avval 'pending' bo'ladi — admin tasdiqlamaguncha katalogda ko'rinmaydi.
-- Idempotent: qayta ishga tushsa xatosiz o'tadi va mavjud pending'larni buzmaydi.

-- ============ products.status ============
-- Ustun BIRINCHI marta qo'shilganda mavjud (seed) mahsulotlar allaqachon
-- katalogda edi — shu sabab ularni 'published' deb belgilaymiz. Bu bulk-UPDATE
-- faqat ustun yangi qo'shilgandagina bajariladi (DO-blok ichida), shuning uchun
-- keyingi migratsiyalarda haqiqiy 'pending' e'lonlarni tasodifan nashr qilib yubormaydi.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'status'
  ) THEN
    ALTER TABLE products
      ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('draft', 'pending', 'published', 'rejected'));
    -- Mavjud barcha mahsulotlar → published (bir martalik)
    UPDATE products SET status = 'published';
  END IF;
END $$;

-- Rad etish sababi (moderator kiritadi, ixtiyoriy)
ALTER TABLE products ADD COLUMN IF NOT EXISTS reject_reason TEXT;

-- E'lonni kim yuborganini kuzatish uchun (Telegram user id)
ALTER TABLE products ADD COLUMN IF NOT EXISTS submitted_by_tg BIGINT;

-- Moderatsiya vaqtini kuzatish uchun
ALTER TABLE products ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Status bo'yicha tez filtr (katalog faqat 'published', moderatsiya faqat 'pending')
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
