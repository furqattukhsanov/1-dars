# Sayt banneri — RASM TZ (2026-08-16)

**Kimga:** dizayner / rasm generatori · **Nechta fayl:** 3 ta
**Nima uchun:** founder — «rasm sifati xira»

---

## 1. Nima uchun yangi fayl kerak

Hozirgi rasmlar **1200 × 338** — ular **Mini App** uchun chizilgan va u yerda
to'g'ri: telefon ekranida Mini App slaydi ~358 × 101 CSS px, ya'ni 1200×338
manba u yerda hatto ortig'i bilan yetadi.

Saytdagi banner esa ancha **KATTA**. Natijada brauzer o'sha faylni
**cho'zishga majbur** va rasm xiralashadi. O'lchandi (taxmin emas):

| Qurilma | Slayd (CSS px) | Kerak (fizik px) | 1200×338 dan cho'zilish |
|---|---|---|---|
| iPhone 375, DPR 2 | 343 × 220 | 686 × 440 | **1.30x** |
| iPhone 375, DPR 3 | 343 × 220 | 1029 × 660 | **1.95x** |
| Katta telefon 430, DPR 3 | 396 × 220 | 1187 × 660 | **1.95x** |
| Noutbuk 1280, DPR 2 | 1116 × 293 | 2232 × 586 | **1.86x** |
| Monitor 1538+, DPR 2 | 1116 × 352 | 2232 × 704 | **2.08x** |

Ya'ni nuqson rasmda emas — **rasm boshqa o'lchov uchun chizilgan**.

---

## 2. Nima topshiriladi

**Har slayd uchun BITTA fayl — MASTER.** Qolganini men kesib, kichraytirib,
WebP/JPEG ga o'girib qo'yaman (`cwebp` + `sips` mashinada bor). Sababi:
sayt ikkita har xil shakldagi kesim ishlatadi (keng ekran uchun ingichka
tasma, telefon uchun kvadratroq), va agar ikkalasi ALOHIDA chizilsa bitta
slaydning ikki yuzi **boshqa-boshqa mato** bo'lib qolardi.

| | |
|---|---|
| O'lcham | **2400 × 1000 px** (qat'iy) |
| Nisbat | 2.4 : 1 |
| Format | PNG yoki JPEG, sifat ≥ 95 (yo'qotishsiz afzal) |
| Rang | sRGB |
| Soni | **3 ta**: `ad-1` (AI), `ad-2` (24/7), `ad-3` (bepul yetkazish) |
| Nomi | `ad-1-master.png`, `ad-2-master.png`, `ad-3-master.png` |
| Qayerga | `docs/dizayn-tizimi/masters/` yoki shunchaki menga bering |

🔴 **2026-08-16 HOLATI: masterlar repoda YO'Q.** Bu qatorda ular
`docs/dizayn-tizimi/masters/` ga qo'yilsin deb yozilgan, amalda esa
2026-08-16 dagi partiya faqat `~/Downloads/design_handoff_sayt_banners/masters/`
da yotibdi (3 PNG, **47 MB**). O'sha papka o'chsa **kesimlarni qayta yasab
bo'lmaydi** va quyidagi surish formulasi shu partiya uchun ishlatib bo'lmas
holga keladi — hujjat qoladi, manba yo'qoladi. Founder qarori kutilmoqda:
repoga qo'yilsinmi, R2 ga yuklansinmi, yoki ataylab saqlanmasinmi.

⚠️ **2400×1000 ni kichraytirmang.** Bu raqam yuqoridagi jadvaldan kelib
chiqqan: eng katta ehtiyoj 2232 × 704 fizik piksel, keng kesim esa
masterning o'rta tasmasidan olinadi.

---

## 3. Zonalar — ENG MUHIM QISM

Sayt rasmdan **ikki xil kesim** oladi va ikkalasi ham masterning
**o'rtasidan** kesiladi. Shuning uchun kompozitsiya shu ikki to'rtburchakda
ham ishlashi kerak:

```
2400 × 1000 MASTER
┌──────────────────────────────────────────────┐ ← yuqori 12% : NAFAS
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   (kesilib ketadi)
├──────────────────────────────────────────────┤ y=122
│                                              │
│   MATN ZONASI (chap 72%)   │  MATO ZONASI    │ ← KENG kesim
│   och, tinch, kontrast past│  (o'ng 28%)     │   2400 × 756
│                            │  burma, yorug'lik│
├──────────────────────────────────────────────┤ y=878
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ← pastki 12% : NAFAS
└──────────────────────────────────────────────┘

TELEFON kesimi — masterdan 2000 × 1000, keyin 1800 × 900 ga kichraytiriladi.
```

🔴 **TELEFON KESIMI MARKAZDAN OLINMAYDI — O'NGGA SURILADI** (2026-08-16 da
o'lchandi, birinchi urinish shu sababli xato chiqdi). Bu TZ da avval
«o'rtasidan» deb yozilgan edi va u YOLG'ON bo'ldi: kesim ekranga
`object-fit: cover` bilan chiziladi va telefon slaydi 2:1 dan TORROQ
(375px da nisbat 1.56), ya'ni brauzer kesimning yon tomonlaridan YANA
~22% ini oladi. Ikki kesish ustma-ust tushib, mato butunlay kadrdan
chiqib ketdi — banner tekis bej quti bo'lib ko'rindi.

Surish miqdori TAXMIN QILINMAYDI, hisoblanadi:

```
S = matoBoshlanishi_px − 2686        (master 4800px kengligida)
```

`2686` — 375px telefonda ko'rinadigan oynaning 72% nuqtasi (o'lchandi).
`matoBoshlanishi` esa ustunlarning RANGDORLIGI bilan topiladi: chap zona
tinch va och, mato esa to'yingan rangda. 2026-08-16 dagi partiya uchun:

| Slayd | Mato boshlanishi | Surish `S` |
|---|---|---|
| ad-1 | 77.9% (3739px) | 800 (maksimum) |
| ad-2 | 68.0% (3264px) | 578 |
| ad-3 | 70.9% (3403px) | 717 |

⚠️ `S` eng ko'pi **800** bo'la oladi (`S + 4000 ≤ 4800`). ad-1 da mato juda
kech boshlangani uchun maksimum ishlatildi va shunda ham u kadrning o'ng
~20% ini egalladi (28% o'rniga). **Dizaynerga xabar:** mato masterning
**68–72%** idan boshlansa eng yaxshi natija chiqadi; 78% kech.

| Zona | Talab |
|---|---|
| **Chap 72%** (x 0 → 1728) | Ustiga **to'q rangli matn** tushadi (`#171A30`). Fon shu yerda **och va tinch**. Naqsh bo'lsa — juda yumshoq. ⚠️ 72% — Mini App'dagi 65% dan KATTA, chunki saytda shrift kattaroq |
| **O'ng 28%** (x 1728 → 2400) | Mato o'zi «gapiradi»: burma, yorug'lik, chuqurlik |
| **Yuqori va pastki 12%** (har biri ~120px) | **NAFAS** — muhim detal bo'lmasin, keng kesimda bu joy kesilib ketadi |
| **Chap va o'ng 200px** | Telefon kesimida bu joy kesiladi — muhim detal bo'lmasin |

Ya'ni **hamma muhim narsa markazdagi 2000 × 756 to'rtburchakda** bo'lsin.

---

## 4. Uch slayd — mazmun va rang

Matn rasmga CHIZILMAYDI, sayt uni ustiga o'zi qo'yadi va til almashganda
o'zi almashadi. Rang kayfiyati esa matn ostidagi chip rangiga hamohang.

| # | Nima haqida | Ustiga tushadigan matn | Urg'u rangi | Fon kayfiyati |
|---|---|---|---|---|
| 1 | AI xizmati | **Matolarni AI bilan jonlantiring** + chip «Sinab ko'rish» | Anor `#7a140d` | Iliq pushti-anor. Ipak/atlas — yaltiroq, harakatli burma |
| 2 | 24/7 buyurtma | **24/7 buyurtma berishingiz mumkin** (chipsiz) | Za'faron `#89540C` | Iliq sariq-oltin. Paxta/adras — tinch, «har doim ochiq» |
| 3 | Bepul yetkazish | **Bepul yetkazib berish** + chip «Ilk 3 ta buyurtma» | Feruza `#0C656F` | Salqin ko'k-feruza. Ikat/so'zana, Samarqand koshini rangi |

Uchtasi **bitta oila, uch kayfiyat** bo'lsin — uch xil dunyo emas.

---

## 5. Brend

- **LolaMarket** — O'zbekiston to'qima matolari uchun B2B bozor. Auditoriya:
  tikuvchilar, ateliyelar, mato do'konlari — professional xaridorlar
- **Mavzu:** ikat, adras, so'zana, ipak, paxta, atlas. Mahalliy mato,
  mahalliy nur — «stok foto» hissi emas
- **Palitra:** anor `#7a140d`, lola-qizil `#E84B40`, feruza `#119DAB`,
  za'faron `#D98E0C`, indigo-qora `#171A30`, iliq oq `#FBF6EC`
- **Uslub:** yumshoq, premium, tabiiy nur. Qattiq neon, og'ir grafika,
  3D render hissi — yo'q
- **Ton:** ishonchli savdo hamkori, «hype» emas

---

## 6. Qilinmasin

- ❌ Matn, harf, raqam, logo — sayt o'zi yozadi
- ❌ Tugma, strelka, nuqta, ramka — sayt o'zi chizadi
- ❌ Odam yuzi, qo'l
- ❌ Mayda naqsh — kichrayganda «shovqin» bo'ladi
- ❌ Chap 72% da to'q fon — qora matn o'qilmaydi
- ❌ Burchaklarda muhim detal — ekranda 20px radius bilan yumaloqlanadi

---

## 7. Fayl kelgandan keyin men nima qilaman

Bu qism dizaynerga emas, **kelasi sessiyaga** yozilgan.

**Bu qism 2026-08-16 da BAJARILDI** — quyida amalda nima qilingani turadi.

1. Masterdan ikki kesim (`sips`): keng — o'rta tasma `4800 × 1509`, telefon —
   O'NGGA SURILGAN `4000 × 2000` (`--cropOffset 0 S`, yuqoridagi jadval).
2. Har kesim IKKI o'lchamda: keng `2240` va `1400`, telefon `1800` va `900`.
   Sabab: bitta o'lcham berilsa DPR1 noutbuk ham, DPR2 telefon ham eng
   katta faylni tortardi. `srcset` + `sizes` bilan brauzer o'zi tanlaydi.

   ⚠️ **Bu jadval 2026-08-16 da hisobotchi tomonidan QAYTA O'LCHANDI va
   raqamlar tuzatildi.** Avval bu yerda «DPR2 telefon 46 KB, DPR1 noutbuk
   78 KB, bitta o'lchamda ~272 KB» deb yozilgan edi. Birinchi ikkisi
   telefon kesimi O'NGGA SURILISHIDAN OLDIN o'lchangan (surilgan kadrga
   ko'proq mato tushdi, ya'ni fayl OG'IRLASHDI), uchinchisi esa hozirgi
   fayllardan umuman qayta hisoblanmadi. Quyidagilar diskdagi baytdan,
   **o'nlik KB** da (1 KB = 1000 bayt):

   | Yo'l | Tanlanadigan fayl | Uchala slayd |
   |---|---|---|
   | DPR2 telefon (375px) | `m-900` | **51 KB** |
   | DPR3 telefon (375px) | `m-1800` | **231 KB** |
   | DPR1 noutbuk (1280px) | `w-1400` | **79 KB** |
   | DPR2 monitor (1538px+) | `w-2240` | **201 KB** |

   Kichik o'lchamlar bo'lmaganda DPR2 telefon `m-1800` ni (231 KB, **4.5x**
   ortiq), DPR1 noutbuk esa `w-2240` ni (201 KB, **2.5x** ortiq) tortardi —
   `srcset` ning foydasi shu, «~272 KB» degan raqam esa manbasiz edi.
   🔴 **DPR3 telefon yo'li (231 KB) hech qayerda o'lchanmagan edi va u eng
   og'iri** — `ad-2` ning o'zi 159 KB. Kelasi partiyada birinchi qaraladigan
   raqam shu.
3. Siqilish `cwebp -q 72 -m 6` — daraja TAXMIN QILINMADI, o'lchandi:
   q62 dan q86 gacha EKRANDAGI farq 255 dan 1.4–2.2 (1% dan kam), ya'ni
   yuqori sifat faqat baytga tushadi, ko'zga emas. Og'irliklar (diskdan
   qayta o'lchandi): ad-1 — 9.7–44 KB, ad-3 — 9.2–28 KB, **ad-2 — 32–159 KB**
   (paxta to'quv teksturasi qimmat, boshqa ikkalasidan ~4x og'ir).
4. JPEG zaxira — bitta o'lcham (`-w-1400.jpg`), WebP'ni bilmaydigan
   brauzer juda kam.
5. `index.html` da `<picture>` ikki `<source>` bilan:
   `media="(max-width: 640px)"` → telefon kesimi, keyin keng kesim.
4. 🔴 **`style.css` da `object-position: 62%` OLIB TASHLANSIN.** U 32:9
   rasm uchun yozilgan vaqtinchalik chora edi (o'sha rasmda telefonda
   enining ~44% i ko'rinardi). 2:1 telefon kesimida enining ~78% i
   ko'rinadi, ya'ni `center` to'g'ri ishlaydi va surish endi ZARAR beradi.
5. 🔴 **Fayl nomi YANGI bo'lsin** (`ad-1-w`, `ad-1-m` kabi), eskisining
   ustiga yozilmasin: `sw.js` rasmlarni `cacheFirst` bilan beradi, ya'ni
   qaytib kelgan foydalanuvchi eski XIRA rasmni ko'rib turardi va yangisi
   faqat KEYINGI tashrifda kelardi.
6. 🔴 **`server/test.js` → Test 32 ning 5-bandi O'ZGARADI.** Hozir u sayt
   va Mini App nusxalari **bayt-ma-bayt bir xil** ekanini tekshiradi. Sayt
   o'z kesimlariga o'tgach bu shart yolg'on bo'ladi. Ikki yo'l bor va
   founder tanlasin:
   - **(a)** Mini App'ning `1200 × 338` i ham SHU masterlardan qayta
     kesiladi → ikkala yuz bitta rasmdan chiqadi, qorovul «hamma kesim
     bitta masterdan» shaklida qoladi (master `sha256` i jadvalda).
   - **(b)** Mini App eski rasmlarida qoladi → ikki yuz boshqa-boshqa
     ko'rinadi va qorovul olib tashlanadi.
   **Tavsiya — (a):** aks holda «ikki yuz bir xil» degan qaror jimgina
   yo'qoladi va buni hech narsa ko'rsatmaydi.

---

## 8. Bu TZ qayerdan chiqdi

Raqamlar hujjatdan KO'CHIRILMADI — 2026-08-16 da brauzerda
`getBoundingClientRect()` va `devicePixelRatio` bilan o'lchandi, slayd
o'lchami esa `style.css` dagi `.ad-slide { height: clamp(193.6px, 22.88vw,
352px) }` va `.container { max-width: 1180px }` qoidalaridan hisoblab
chiqildi. Balandlik founder tomonidan ikki qadamda sozlangan (−20%, keyin
+10%) — **u o'zgarsa bu TZ dagi o'lchamlar ham qayta hisoblansin.**

Eski TZ — `banner-dizayn-brief.md` (Mini App uchun, 1200×338). U
**bekor qilinmaydi**: Mini App hamon o'sha o'lchovda ishlaydi.
