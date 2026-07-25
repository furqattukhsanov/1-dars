# Sprint 7 — Admin panel (Dars 14)

**Holat:** jarayonda

---

## Maqsad

Founder sifatida platformani to'liq nazorat qilish: ishlab chiqaruvchilarni tasdiqlash, escrow boshqaruvi, bahsli holatlarni hal qilish.

---

## Bajariladigan vazifalar

### Ishlab chiqaruvchi boshqaruvi
- [ ] Yangi ishlab chiqaruvchi so'rovlari ro'yxati
- [ ] Tasdiqlash / rad etish (sabab bilan)
- [ ] Tasdiqlanganda ishlab chiqaruvchiga Telegram xabarnoma

### Escrow va To'lovlar
- [ ] Barcha buyurtmalar ro'yxati (holat bo'yicha filtr)
- [ ] Har buyurtmada: tovar summasi, komissiya (10–12%), ishlab chiqaruvchiga o'tkaziladigan summa
- [ ] "Pul o'tkazildi" tugmasi → `completed` holati
- [ ] Refund qilish: to'liq yoki qisman, sabab yozish

### Bahsli holatlar
- [ ] Barcha ochiq bahslar ro'yxati
- [ ] Har bahsda: xaridor dalili (rasm/video), ishlab chiqaruvchi javobi
- [ ] Moderator qarori: kim aybdor → logistika kim to'laydi
- [ ] Qarordan keyin avtomatik holat yangilash va Telegram xabarnoma
- [ ] 24 soat ichida hal qilinmagan bahslar uchun eslatma

### Statistika
- [ ] Umumiy buyurtmalar soni va summasi
- [ ] Komissiya daromadi (kunlik / oylik)
- [ ] Eng faol ishlab chiqaruvchilar

---

## Qilingan ishlar

- [2026-07-25] **Admin panel mock ma'lumotlardan real API'ga o'tkazildi (2-variant: real ma'lumot, harakatlar hamon bot orqali).** Sabab: Sprint 0'da admin panel yangi dizaynga o'tkazilganda funksionallik ataylab o'zgartirilmagan edi — mock parol (`PASSWORD='lolamarket'`, brauzer konsolida ochiq ko'rinardi) va hardcoded mock massiv qolgan edi, chunki standalone veb-sahifa Telegram `initData` ishlab chiqara olmaydi. Backend (`server/server.js`): yangi `ADMIN_PANEL_TOKEN` env o'zgaruvchisi (Telegram initData'dan mustaqil alohida sir, `.env`da; berilmasa endpoint doim 401), `safeEqual()` doimiy vaqtli taqqoslash helperi (timing attack himoyasi), yangi **faqat o'qish uchun** `GET /api/admin/summary` endpoint (`X-Admin-Token` header + rate limit) — moderatsiyadagi mahsulotlar soni, ko'rib chiqilmagan sotuvchi arizalari soni, bugungi buyurtmalar soni, tasdiqlangan sotuvchilar soni, kategoriya statistikasi, so'nggi 20 buyurtma; `cors()`ga `X-Admin-Token` header ruxsati qo'shildi; `server/README.md`ga hujjatlashtirildi. Frontend (`admin/`): `admin.js` to'liq qayta yozildi — mock parol va hardcoded massiv olib tashlandi, login formasi kiritilgan qiymatni `X-Admin-Token` sifatida yuboradi, tasdiqlansa token `sessionStorage`da saqlanadi (sahifa ochilganda avtomatik kirish sinaladi); `admin/index.html` statistika kartalari va buyurtma filtrlari real status kalitlariga (`pending/confirmed/shipped/delivered/cancelled`) o'tkazildi, kategoriya diagrammasi JS orqali to'ldiriladi, login maydoni "Admin kaliti"ga o'zgartirildi (kesh `v=2`); `admin/admin.css`ga `.empty-cell` qo'shildi. Brauzerda mock `fetch` bilan to'liq test qilindi (login xatosi, statistika, jadval, filtr, bo'sh holat, kategoriya diagrammasi, noma'lum kategoriya fallback) — 0 konsol xatosi. **Hali qilinmagan:** haqiqiy backend (Postgres + real token) bilan test — production DB lokal muhitda yo'q, deploy vaqtida tasdiqlanadi; `server.js` production serverga hali ko'chirilmagan; `ADMIN_PANEL_TOKEN` production `.env`ga hali qo'shilmagan. Sprint 7dagi qolgan vazifalar (tasdiqlash/rad etish amallari, escrow/refund, bahsli holatlar, statistika sahifasi) hali bot buyruqlari orqali va boshlanmagan holicha qoladi

---

## Qarorlar

- [2026-07-25] Qaror: admin panel `/api/admin/summary` endpointi faqat O'QISH uchun — tasdiqlash/rad etish kabi yozuvchi harakatlar hamon Telegram bot buyruqlari orqali (`/sotuvchi_tasdiqla`, `/nashr` va h.k.) amalga oshiriladi. Sabab: standalone veb-sahifa Telegram `initData` avtorizatsiyasini ishlab chiqara olmaydi, shuning uchun yozuvchi amallarni web panelga o'tkazish xavfsizlik teshigi ochardi; o'qish uchun esa alohida `ADMIN_PANEL_TOKEN` siri yetarli. Bu mavjud "tasdiqlash bot orqali" qaroriga (Sprint 0, 2026-07-25) mos keladi va uni davom ettiradi
