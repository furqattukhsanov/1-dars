# Sprint 0 — Dizayn va ekranlar (Dars 7)

**Holat:** jarayonda

---

## Maqsad

LolaMarket ning barcha asosiy ekranlarini vizual tarzda loyihalash. Kodga o'tishdan oldin foydalanuvchi oqimini va dizaynini tasdiqlash.

---

## Bajariladigan vazifalar

- [ ] Brend uslubi aniqlash: ranglar (`#6B1020` burgundy, `#C8A24B` oltin), shrift, tugma stili
- [ ] Asosiy ekranlar wireframe/mockup:
  - Bosh sahifa (hero + qisqa katalog preview)
  - Katalog sahifasi (filtr: kategoriya + narx, mahsulot kartochkalari)
  - Mahsulot detail sahifasi (rasm, narx/rulon, reyting, "Buyurtma" tugmasi)
  - Buyurtma berish sahifasi (miqdor, BTS nuqtasi tanlash, to'lov)
  - Ishlab chiqaruvchi kabineti (mahsulotlar ro'yxati, buyurtmalar)
  - Admin panel (ishlab chiqaruvchi tasdiqlash, bahsli holatlar)
- [ ] Foydalanuvchi oqimi (user flow) chizish: xaridor va ishlab chiqaruvchi uchun alohida
- [ ] Dizaynni founder bilan kelishish va tasdiqlash

---

## Qilingan ishlar

- [2026-06-28] Grill-me suhbati orqali biznes model aniqlandi (18 savol, 22 qaror)
- [2026-06-28] Founder PRD yozildi — 7 bo'lim (docs/prd.md)
- [2026-06-28] Texnik PRD yozildi — 18 user story (docs/prd-lolamarket.md)
- [2026-06-28] 10 ta sprint fayl yaratildi (docs/sprintlar/sprint-0..9.md)
- [2026-06-28] hisobotchi agenti yaratildi (.claude/agents/hisobotchi.md)
- [2026-06-28] CLAUDE.md loyiha qoidalari yozildi
- [2026-06-28] loyiha-panel.html sprint progress paneli yaratildi
- [2026-06-28] loyiha-panel.html dizayni glassmorphism + oq fon + rulon animatsiyasi bilan yangilandi
- [2026-06-28] prd.md va prd-lolamarket.md birlashtirildi — yagona 11 bo'limli PRD yaratildi
- [2026-07-22] **lolamarket.uz landing sahifasi to'liq Mini App dizayn tizimiga o'tkazildi.** Eski sayt `sayt-eski/` papkasiga zaxira sifatida ko'chirildi (`index.html`, `style.css`, `script.js`), `demo/index.html` va `admin/index.html` shu eski stilga (`../sayt-eski/style.css?v=6`) ulandi — admin ilgari absolut `https://furqattukhsanov.github.io/1-dars/style.css` manzilini ishlatardi, nisbiy yo'lga o'tkazildi. `style.css` noldan qayta yozildi (1219 → ~700 qator): `telegram-app/styles.css`dagi dizayn tokenlari (anor gradientlari, teal, za'faron, ink shkalasi, glassmorphism, Bricolage Grotesque + Hanken Grotesk + Geist Mono) ko'chirildi, landing uchun qo'shimchalar kiritildi — `--border-hair` (Mini App'da yo'q edi), `--container: 1180px`, responsiv gridlar, hover holatlari (Mini App'da faqat `:active` bor), `backdrop-filter` fallback, `prefers-reduced-motion`. `index.html` yangi tuzilma bilan qayta yozildi: shisha yopishqoq header → hero (status pill + 2 CTA) → 7 kategoriya chipi → 12 mahsulot kartochkasi (ma'lumotlar `telegram-app/app.js`dagi `PRODUCTS`dan) → 4 imkoniyat kartochkasi → to'q anor CTA paneli (email forma) → asoschi bloki → footer. `script.js`dan yangi tuzilmaga keraksiz hero parallax va slide-right observer olib tashlandi, kategoriya chip filtrlash qo'shildi, barcha DOM so'rovlari `null`-himoya bilan o'raldi. Kesh: `style.css?v=7`, `script.js?v=8`. Tekshiruv: mobil 375px va desktop 1280px, 7 chip filtri (2+2+2+3+1+2=12 mahsulot), email forma, 0 konsol xatosi, `demo/` va `admin/` regressiyasi
- [2026-07-22] Landing rasm yo'llari bug'i tuzatildi — sahifa avval `telegram-app/assets/products/textile-NN` yo'llariga ishora qilardi, lekin serverda bu papka `mini-app/` nomi bilan turadi, ya'ni 12 ta rasm ham `404` bo'lar edi. `md5` bilan tasdiqlandi: bu rasmlar `Photo/textile/*` fayllari bilan bayt-bayt bir xil, shuning uchun yo'llar `Photo/textile/` ga o'tkazildi va kirillcha fayl nomi ("Без названия (1).png") percent-encode qilindi

---

## Qarorlar

- [2026-06-28] Komissiya modeli: ishlab chiqaruvchi 10–12% to'laydi
- [2026-06-28] To'lov: Payme + Click, escrow rejimida
- [2026-06-28] Logistika: BTS Pochta (200+ nuqta), xaridor to'laydi
- [2026-06-28] Qaytarish: to'liq pul qaytariladi, aybdor logistika to'laydi
- [2026-06-28] Bahsli holat: moderator 24 soat ichida qaror beradi
- [2026-06-28] MVP platforma: faqat Web (mobil keyinroq)
- [2026-06-28] Minimum buyurtma: 1 rulon
- [2026-07-22] Qaror: Brend dizayn tizimining yagona manbasi — `telegram-app/styles.css` (Mini App tokenlari). Landing sahifa shu tokenlarni ko'chirib oladi va faqat landing uchun zarur bo'lgan qo'shimchalarni (`--border-hair`, `--container`, hover holatlari, responsiv gridlar) o'zidan qo'shadi. Sabab: sayt va Mini App bir xil brendni ko'rsatishi kerak, ikkita mustaqil dizayn tizimini parallel yuritish qimmat
- [2026-07-22] Qaror: Eski landing dizayni o'chirilmaydi, `sayt-eski/` papkasida saqlanadi va `demo/` bilan `admin/` sahifalari hozircha o'sha eski stilda qoladi — bu ikkalasi ichki asboblar, ularni yangi dizaynga o'tkazish alohida ish sifatida keyinroq qilinadi
