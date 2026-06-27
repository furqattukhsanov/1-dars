# Sprint 4 — Asosiy funksiya (Dars 11)

**Holat:** kutilmoqda

---

## Maqsad

LolaMarket ning yuragi — xaridor rulonni topadi, buyurtma beradi, escrow orqali to'laydi, BTS orqali oladi. Bu sprintdan keyin platforma ishlaydi.

---

## Bajariladigan vazifalar

### Katalog (Xaridor)
- [ ] Mahsulotlar ro'yxati sahifasi (`/katalog`)
- [ ] Filtr: kategoriya (chit / atlas / gilam / sitsa) + narx oralig'i
- [ ] Mahsulot kartochkasi: rasm, kategoriya, narx/rulon, rulon soni, ishlab chiqaruvchi reytingi
- [ ] Mahsulot detail sahifasi (`/mahsulot/[slug]`): to'liq ma'lumot + "Buyurtma berish" tugmasi

### Buyurtma oqimi
- [ ] Rulon soni tanlash (minimum 1)
- [ ] Eng yaqin BTS nuqtasini ko'rsatish (telefon/manzil asosida)
- [ ] Buyurtma xulosasi: mahsulot narxi + logistika narxi alohida
- [ ] Buyurtma tasdiqlash → `orders` jadvalida `created` holati

### To'lov (Escrow)
- [ ] Payme integratsiyasi: to'lov tugmasi → Payme → webhook → `paid` holati
- [ ] Click integratsiyasi: xuddi shunday oqim
- [ ] To'lov muvaffaqiyatli bo'lsa escrow-hold yoziladi
- [ ] Idempotent webhook: ikki marta hisoblashni bloklash

### Ishlab chiqaruvchi kabineti
- [ ] Yangi buyurtma bildirishnomasi (Telegram)
- [ ] Buyurtmani tasdiqlash: `confirmed` holati
- [ ] "Yo'lga chiqdi" + BTS tracking raqami kiritish: `shipped` holati

### Mahsulot boshqaruvi (Ishlab chiqaruvchi)
- [ ] Mahsulot qo'shish: kategoriya, narx, rulon soni, rasm yuklash
- [ ] Mahsulot tahrirlash va o'chirish
- [ ] Rulon soni avtomatik kamayishi (buyurtma berilganda)

---

## Qilingan ishlar

_(hozircha bo'sh)_

---

## Qarorlar

_(hozircha bo'sh)_
