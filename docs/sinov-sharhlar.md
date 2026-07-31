# Sinov rejasi — sharhlar tizimi (production, haqiqiy Telegram)

**Sana:** 2026-07-31 da yozildi · **Bajaruvchi:** founder (Telegram amallari) + agent (`curl` tekshiruvlari)

Sharh tizimi 2026-07-31 da yozildi va serverga chiqarildi, lekin **hali birorta haqiqiy
sharh bilan sinalmagan**. Loyihaning eng qimmat darsi aynan shu edi: soxta ma'lumot
o'zimiz kutgan shaklda keladi, tashqi xizmat esa kutmagan shaklda — nuqsonlar shu farqda
yashirinadi (2026-07-31 qarori, `sprint-8.md`). Shuning uchun quyidagi qadamlar
**production'da, haqiqiy Telegram bilan** bajariladi.

⚠️ **Sinov o'z chiqindisini o'zi tozalaydi** (2026-07-30 qarori). Oxirgi bo'lim majburiy.

---

## 0. Boshlang'ich holatni yozib olish

Tozalashda nimaga qaytishni bilish uchun. Sinovdan OLDIN bajariladi.

```bash
curl -s https://lolamarket.uz/api/products | grep -o '"id":"[^"]*"\|"stock":[^,]*\|"rating":[^,]*' | paste - - -
```

Kutiladi: har mahsulotda `"rating":null`. Sinalayotgan mahsulotning `stock` sonini
yozib qo'ying — 6-bo'limda shu songa qaytariladi.

---

## 1. Buyurtma yaratish va uni "yetkazildi" holatiga olib borish

Sharh faqat `delivered` yoki `completed` buyurtmadan yoziladi, shuning uchun avval
buyurtma kerak.

| # | Kim | Amal |
|---|---|---|
| 1.1 | Founder | Mini App'dan **1 dona** mato buyurtma qiladi (arzonrog'ini tanlang) |
| 1.2 | Founder | Botda: `/tasdiqla #LM-XXXX` |
| 1.3 | Founder | Botda: `/yolga #LM-XXXX` — trek raqami so'ralsa kiritiladi |
| 1.4 | Founder | Botda: `/yetdi #LM-XXXX` |

**Tekshiruv:** Mini App → "Buyurtmalarim" → "Tarix" tabida buyurtma `Yetkazildi`
bo'lib turadi va ostida **"★ Baholash"** tugmasi chiqadi.

❗️ Agar tugma chiqmasa — `S.myReviews` yuklanmagan yoki buyurtma holati `delivered`
emas. Konsolda `/api/reviews?mine=1` javobini tekshiring.

---

## 2. Sharh yozish (asosiy oqim)

| # | Kim | Amal |
|---|---|---|
| 2.1 | Founder | "★ Baholash" → **4 yulduz** → matn yozadi → "Yuborish" |

**Kutiladi:**
- Ilovada "Rahmat! Sharhingiz qo'shildi" toast'i
- Tugma o'rnida **"★★★★☆ Baholandi"** paydo bo'ladi
- Sotuvchiga Telegram xabari boradi (mahsulot nomi + yulduzlar + matn)
- `ADMIN_CHAT_ID` ga xuddi shu xabar + `Sharh #N` qatori bilan boradi

**Tekshiruv — sharh ommaviy ko'rinadimi:**

```bash
curl -s 'https://lolamarket.uz/api/reviews?productId=MAHSULOT-ID'
```

**Tekshiruv — reyting qayta hisoblandimi (eng muhim qadam):**

```bash
curl -s https://lolamarket.uz/api/products | grep -o '"id":"MAHSULOT-ID"[^}]*"rating":[^,]*'
```

Kutiladi: `"rating":4` va `"reviews":1`. Agar `null` bo'lib qolsa — `recalcRating()`
tranzaksiyada ishlamagan.

**Tekshiruv — ikkala klientda ko'rinadimi:**
- Mini App → mahsulot sahifasi → yulduzlar sarlavha yonida, pastda "Sharhlar" bo'limi
- Sayt → kartochkaga bosing → detal ochiladi → reyting va sharh ko'rinadi

---

## 3. Sotuvchi tomoni (PRD story №15)

| # | Kim | Amal |
|---|---|---|
| 3.1 | Sotuvchi hisobi | Mini App → sotuvchi kabineti → Profil |

**Kutiladi:** "SHARHLAR" kartasida o'rtacha baho (`4`), sharhlar soni va sharh matni.

❗️ Reyting **hech qachon yulduzdan oshiq ko'rinmasligi** kerak: `4.5` bo'lsa
★★★★☆ (to'rtta), beshta emas. Bu 31-iyulda topilgan nuqson edi.

---

## 4. Darvozalar (rad etilishi SHART bo'lgan holatlar)

Bular sinalmasa, tizim "ishlayapti" deb hisoblanmaydi — asosiy oqim ishlashi
darvoza yopiqligini ANGLATMAYDI.

| # | Holat | Qanday sinash | Kutiladi |
|---|---|---|---|
| 4.1 | Kirmagan odam sharh yozmoqchi | `curl -X POST ... /api/reviews` (pastda) | **401** |
| 4.2 | Bir mahsulotga ikkinchi sharh | Ilovada o'sha buyurtmaga qayta baho berish | **409**, "allaqachon sharh yozgansiz" |
| 4.3 | Yo'ldagi buyurtma | `shipped` holatidagi buyurtma | Tugma UMUMAN chiqmaydi |
| 4.4 | Begona buyurtma | Boshqa odamning `#LM-XXXX` raqami bilan POST | **404**, "buyurtma topilmadi" |
| 4.5 | Noto'g'ri yulduz | `stars: 0` yoki `stars: 6` | **400** |
| 4.6 | XSS | Sharh matniga `<img src=x onerror=alert(1)>` | Matn bo'lib ko'rinadi, element yaratilmaydi |

```bash
curl -s -w '\n%{http_code}\n' -X POST -H 'Content-Type: application/json' \
  -d '{"orderId":"#LM-3011","productId":"ik-1402","stars":5}' \
  https://lolamarket.uz/api/reviews
```

4.5 uchun ilovadan yubora olmaysiz (u faqat 1–5 beradi) — bu ataylab serverda
qayta tekshiriladi, chunki klient validatsiyasini DevTools bilan chetlab o'tish oson.

---

## 5. Admin nazorati

| # | Kim | Amal |
|---|---|---|
| 5.1 | Founder | Botda: `/sharhlar` |
| 5.2 | Founder | Botda: `/sharh_yashir N sinov sharhi` (`N` — 5.1 dagi raqam) |

**Kutiladi:** "Sharh #N yashirildi va reytingdan chiqarildi".

**Tekshiruv — reyting QAYTA hisoblandimi:**

```bash
curl -s 'https://lolamarket.uz/api/reviews?productId=MAHSULOT-ID'
curl -s https://lolamarket.uz/api/products | grep -o '"id":"MAHSULOT-ID"[^}]*"rating":[^,]*'
```

Kutiladi: sharhlar ro'yxati **bo'sh**, reyting yana **`null`**, `reviews: 0`.

❗️ Agar reyting `4` bo'lib qolsa — yashirish ishlagan, lekin `recalcRating()`
chaqirilmagan. Bu aynan CLAUDE.md dagi qoida buzilgani: o'chirilgan sharh
reytingda qolib ketishi.

---

## 6. Tozalash (MAJBURIY)

Sinov chiqindisi bazada qolsa, komissiya hisoboti va zaxira soni soxtalashadi —
keyinchalik qaysi qator haqiqiy ekanini ajratib bo'lmaydi (2026-07-30 qarori).

### ⚠️ Eng muhim tuzoq

`reviews` jadvalidan qatorni **qo'lda `DELETE` qilish reytingni QAYTA HISOBLAMAYDI.**
`products.rating` / `products.reviews` va `sellers.rating` — hosila ustunlar, ularning
yagona yozuvchisi `recalcRating()`, u esa faqat ilova kodidan chaqiriladi. SQL bilan
sharhni o'chirib, reytingni yangilashni unutsangiz — katalogda **ortida hech narsa
turmagan reyting** qolib ketadi, ya'ni bu ish nimadan boshlangan bo'lsa, o'shanga
qaytasiz.

Shuning uchun tozalash SQL'i ikki qismdan iborat va **ikkalasi ham bajariladi**:

```sql
BEGIN;

-- 1) Sinov ma'lumotini o'chirish
DELETE FROM reviews     WHERE order_id = '#LM-XXXX';
DELETE FROM order_items WHERE order_id = '#LM-XXXX';
DELETE FROM orders      WHERE id       = '#LM-XXXX';

-- 2) Zaxirani boshlang'ich songa qaytarish (0-bo'limda yozib olingan son)
UPDATE products SET stock = BOSHLANGICH_SON WHERE id = 'MAHSULOT-ID';

-- 3) Reytingni QAYTA HISOBLASH — 1-qadamdan keyin bu MAJBURIY
UPDATE products p
   SET rating  = agg.avg_stars, reviews = agg.n
  FROM (SELECT round(avg(stars)::numeric, 1) AS avg_stars, count(*)::int AS n
          FROM reviews WHERE product_id = 'MAHSULOT-ID' AND status = 'published') agg
 WHERE p.id = 'MAHSULOT-ID';

UPDATE sellers s
   SET rating = (SELECT round(avg(stars)::numeric, 1)
                   FROM reviews WHERE seller_id = s.id AND status = 'published')
 WHERE s.id = (SELECT seller_id FROM products WHERE id = 'MAHSULOT-ID');

COMMIT;
```

**Tozalashdan keyin yakuniy tekshiruv:**

```bash
curl -s https://lolamarket.uz/api/products | grep -o '"rating":[^,]*' | sort | uniq -c
```

Kutiladi: barcha mahsulotda `"rating":null` — ya'ni baza sinovdan oldingi holatda.

---

## Natijani qayerga yozish

Sinov tugagach `docs/sprintlar/sprint-8.md` ning "Qilingan ishlar" bo'limiga yozuv
qo'shiladi. Yozuvda **dalil bo'lsin**: nima sinalgani, qaysi buyruq bilan, qanday
javob kelgani, va **sinalmagan qismi qaysi ekani**. "Sinaldi, ishlaydi" degan gap
dalil emas (2026-07-31 qarori, `sprint-9.md`).

Nuqson topilsa — u ham yoziladi, hatto darhol tuzatilgan bo'lsa ham: nuqsonning
qayerda yashiringani keyingi safar qayerga qarash kerakligini ko'rsatadi.
