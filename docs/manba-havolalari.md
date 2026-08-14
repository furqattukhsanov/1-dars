# Manba havolalari (deep-link)

**Nima uchun bu fayl bor:** `users.src` mexanizmi 2026-08-13 da yozildi
(`db/025`), lekin 2026-08-14 gacha **23/23 foydalanuvchida bo'sh** edi va bu
nuqson deb yozib qo'yilgandi. Tekshirilganda boshqacha chiqdi —
[`sprint-4.md`](sprintlar/sprint-4.md) da o'z qo'limiz bilan yozilgan:

> «manba belgisining O'ZI jonli sinalmagan: haqiqiy
> `t.me/<bot>?start=guruh_ipak` havolasi hali bosilmagan»

Ya'ni **buzilgan narsa yo'q edi — ishlatilmagan narsa bor edi.** Havola
yaratilmagan, demak bo'sh ustun KUTILGAN natija. Bu fayl aynan shu bo'shliqni
yopadi: havolalar shu yerda yashaydi, ya'ni "qaysi kanalga qaysi havola
berilgan" savoli hujjatsiz qolmaydi.

---

## Havola shakli

```
https://t.me/lolamarketbot?start=<BELGI>
```

`<BELGI>` — kanalning nomi. **Shakl qat'iy:**

| Ruxsat | Taqiq |
|---|---|
| kichik lotin harflari `a–z` | ❌ katta harf (`Instagram`) |
| raqamlar `0–9` | ❌ chiziqcha (`guruh-ipak`) |
| pastki chiziq `_` | ❌ nuqta, probel, boshqa belgi |
| uzunligi **2–32** belgi | ❌ `web_` bilan boshlanishi (kirish kodi uchun band) |

⚠️ **Telegram bu qoidadan KENGROQ** — u katta harf va chiziqchaga ham ruxsat
beradi. Ya'ni `?start=Instagram` havolasi **ishlaydi**: odam botga kiradi,
lekin manba yozilmaydi.

Shakl ataylab tor qoldirilgan (founder qarori, 2026-08-14): kengaytirilsa
`IG` va `ig` ikki xil kanal bo'lib panelda ikki qatorga bo'linardi.

🔴 **Endi noto'g'ri havola JIM ketmaydi.** 2026-08-14 dan `manbaAniqla()`
(`server/routes/webhook.js`) rad etilgan payload haqida `console.error`
yozadi va u Telegram alertiga chiqadi:

```
deep-link manba belgisi rad etildi — havola shakli noto'g'ri: Instagram
```

Shunday xabar kelsa — havola noto'g'ri yozilgan, **darrov tuzatilsin**. Bunga
qadar bunday havola oylab manbani yo'qotib turishi mumkin edi va buni hech
narsa ko'rsatmasdi.

---

## Havolalar ro'yxati

Yangi kanal qo'shilganda **shu jadvalga ham yozilsin** — aks holda paneldagi
`guruh_ipak` qatori olti oydan keyin nimani anglatishi noma'lum bo'lib qoladi.

| Belgi | Havola | Qayerda ishlatiladi | Qachondan |
|---|---|---|---|
| `insta` | `https://t.me/lolamarketbot?start=insta` | Instagram profil bio'si | — |
| `guruh_ipak` | `https://t.me/lolamarketbot?start=guruh_ipak` | To'qima Telegram guruhlari | — |
| `kanal` | `https://t.me/lolamarketbot?start=kanal` | `t.me/lolamarket_uz` kanali | — |
| `vizitka` | `https://t.me/lolamarketbot?start=vizitka` | Bosma vizitka / QR kod | — |

> «Qachondan» ustuni **ataylab bo'sh**: havola haqiqatan tarqatilgan sanani
> faqat founder biladi va uni taxmin qilib yozish
> [«hujjatdagi raqam — tekshirilmagan da'vo»](../CLAUDE.md) qoidasini
> buzardi. Havola ishlatila boshlangan kuni sana shu yerga yoziladi.

---

## Qoidalar

**Birinchi teginish qulflanadi.** Odam `insta` havolasidan kirib, keyin
`kanal` havolasidan qayta kirsa — `src` **`insta`** bo'lib qoladi
(`COALESCE(users.src, EXCLUDED.src)`). Sabab: odamni platformaga OLIB KELGAN
kanal birinchisi. Teskari bo'lsa, eng ko'p eslatma yuborgan kanal eng
samarali ko'rinib qolardi.

**`src IS NULL` = «o'lchanmagan», «to'g'ridan-to'g'ri keldi» EMAS.** Panelda
kanallar ro'yxatidan tashqarida turadi. Bu ustun `db/025` dan sanaydi, ya'ni
undan oldin kelgan hamma foydalanuvchida `NULL` — va bu normal.

---

## Ishlayotganini tekshirish

Uchidan-uchigacha bir marta o'lchansin (kodga emas, HODISAGA qaraladi):

1. Botni bloklab, keyin blokdan chiqarish yoki yangi Telegram akkaunt —
   `/start` **birinchi marta** bosilishi kerak (`src` faqat birinchi
   teginishda yoziladi).
2. Havolani ochish: `https://t.me/lolamarketbot?start=vizitka`
3. Bazadan tekshirish:

```bash
ssh root@65.21.180.44 "sudo -u postgres psql lolamarket -c \"SELECT tg_user_id, src, created_at FROM users WHERE src IS NOT NULL ORDER BY id DESC LIMIT 5\""
```

⚠️ **Ustun umuman bormi** — buni ham bir marta tasdiqlash kerak. Yo'q bo'lsa
`INSERT` `column "src" does not exist` bilan yiqiladi, xato esa `.catch()`
ichida: `/start` javob beraveradi, saytga kirish ishlayveradi, lekin
**foydalanuvchi bazaga UMUMAN yozilmaydi** — ya'ni "botda qancha odam bor"
hisobi jimgina to'xtaydi.

```bash
ssh root@65.21.180.44 "sudo -u postgres psql lolamarket -c '\\d users'" | grep src
```

Javobda `src | text` qatori bo'lsa — migratsiya o'tgan.
