# Mini App — Reklama banneri (texnik topshiriq)

**Sana:** 2026-08-14 · **Holat:** o'lchamlar qulflandi, dizayn kutilmoqda
**Maqsad:** Fable 3–4 ta dizayn variantini shu o'lchamlar bo'yicha chizadi,
founder tanlaydi, keyin production'ga chiqariladi.

Founder qarorlari (2026-08-14):

| Savol | Qaror |
|---|---|
| Nisbat | **16:4.5** (= 32:9) |
| Joylashuv | Kartochka, **qidiruv qatoridan pastda, kategoriya chiplaridan tepada** |
| Matn | **Kodda** (`AD_SLIDES` → uz/ru), rasm faqat fon |
| CTA tugmasi | ❌ Yo'q — **butun banner bosiladi** |
| Quiz | ❌ Kerak emas — oddiy slayder |

> **Nisbat 16:9 dan 16:4.5 ga o'zgardi** (founder: «juda baland, kartochkalarga
> halaqit beradi»). O'lchandi va tasdiqlandi: kartochka ko'rinishi
> **171px → 271px**, ya'ni endi to'liq bir qator kartochka ko'rinadi.
> Shu o'zgarish CTA tugmasini ham olib tashladi — pastdagi 7-bandga qarang.

---

## 1. Nima uchun qilinyapti

Mini App'da reklama banneri **umuman yo'q**. U faqat saytda bor
(`index.html` → `.ad-banner`, 3 slayd). Ya'ni bu ortiqcha yo'l EMAS, haqiqiy
bo'shliq — CLAUDE.md dagi «mavjud funksiyaga ikkinchi yo'l qo'shilmasin»
qoidasi bu yerga tegishli emas (tekshirildi).

---

## 2. O'lchamlar

### 2.1 Ekranda (CSS px)

Kenglik = ekran kengligi − 32px (bosh sahifaning yon paddingi, `renderHome()` da
o'lchangan). Balandlik = kenglik × 4.5/16.

Quyidagi balandliklar **brauzerda o'lchangan**, hisoblab yozilmagan:

| Qurilma | Ekran | Banner kengligi | Balandligi | Sarlavhaga qoladi |
|---|---|---|---|---|
| Kichik Android | 360 | 328 | **92** | 64px |
| iPhone SE | 375 | 343 | **96** | 68px |
| **iPhone 14 (etalon)** | **390** | **358** | **101** | **72px** |
| Pixel / Android o'rtacha | 393 | 361 | **102** | 74px |
| Android katta | 412 | 380 | **107** | 79px |
| iPhone Pro Max | 430 | 398 | **112** | 83px |

CSS'da qat'iy balandlik YOZILMAYDI — `aspect-ratio: 32 / 9` ishlatiladi,
shunda hamma qurilmada o'zi to'g'ri chiqadi.

### 2.2 Ekran byudjeti

O'lchangan (kod'dan): header **58px** (`--header-h`), dock **92px** (`--dock-h`).
⚠️ Telegram WebView balandligi ~**750px** deb olindi — bu **TAXMIN**, qurilmada
`Telegram.WebApp.viewportStableHeight` bilan tasdiqlanishi kerak.

```
750 − 58 − 92                        = ~600px foydali balandlik
Salom + qidiruv + chiplar + sarlavha = ~215px
Banner (101) + oraliq (14)           = ~115px
─────────────────────────────────────────────
Mahsulot kartochkasiga qoladi        = ~271px  ✅ (brauzerda o'lchandi)
```

**271px — endi TO'LIQ bir qator kartochka ko'rinadi.** 16:9 da bu 171px edi,
ya'ni kartochkaning faqat tepasi ko'rinardi. Founder haq edi: banner katalogni
bosib turgan edi.

### 2.3 Manba rasm fayli (Fable chizadigan narsa)

| Nima | Qiymat |
|---|---|
| **Asosiy o'lcham** | **1200 × 338 px** |
| Kichik nusxa | 800 × 225 px |
| Format | WebP (asosiy) + JPEG (zaxira) |
| Rang profili | sRGB |

**Nima uchun 1200:** eng keng holat 398 CSS px × 3x piksel zichligi = 1194 → 1200.
**Nima uchun 800 ham kerak:** 360–390px telefonda 2x zichlikda 720px yetadi —
u yerda 1200px rasm bekorga trafik yeydi.
**Nima uchun 338, 337.5 emas:** aniq 32:9 → 337.5px, ya'ni butun son emas.
338 olinadi (farq 0.15%, `object-fit: cover` uni jimgina yutadi).

**Fayl og'irligi (qat'iy chegara):**

Piksel soni 16:9 ga nisbatan yarmiga tushdi, shuning uchun chegara ham
qattiqlashdi:

| Slayd | WebP | JPEG zaxira |
|---|---|---|
| 1-slayd (darhol yuklanadi) | ≤ 55 KB | ≤ 85 KB |
| 2–4 slayd (`loading="lazy"`) | ≤ 40 KB | ≤ 65 KB |
| **Jami** | **≤ 180 KB** | — |

---

## 3. 🔴 Fable uchun ENG MUHIM raqam — masshtab

Rasm 1200px kenglikda chizilib, telefonda 326–396px da ko'rsatiladi. Ya'ni
rasmdagi hamma narsa kichrayadi — lekin **qanchalik kichrayishi qurilmaga
bog'liq**:

| Qurilma | Banner kengligi | Masshtab |
|---|---|---|
| **Kichik Android (360px)** | 328 | **27.3%** ← eng yomon holat |
| iPhone 14 (390px) | 358 | 29.8% |
| iPhone Pro Max (430px) | 398 | 33.0% |

⚠️ **Hisob ENG KICHIK telefon bo'yicha yuritiladi** (27.3%): u yerda o'qilgan
matn hamma joyda o'qiladi, teskarisi esa to'g'ri emas.

```
1200 × 0.273 → rasmdagi 100px sarlavha 360px telefonda 27px bo'ladi
```

| Ekranda kerak | Rasmda chizilsin |
|---|---|
| 24px (katta sarlavha) | **88px** |
| 20px (o'rta sarlavha) | **73px** |
| 16px (kichik matn) | **59px** |
| 13px (mutlaq minimum) | **48px** |

🔴 **Rasmda 48px'dan kichik matn CHIZILMASIN** — u arzon Android'da o'qilmaydi.
Bu eng ko'p uchraydigan xato: dizayn 1200px tuvalda chiroyli ko'rinadi,
telefonda esa matn yo'q bo'lib qoladi.

> **Tuzatish izohi (o'lchovdan keyin):** bu jadvalda avval 30% masshtab va
> 44px minimum yozilgandi — u 390px telefon bo'yicha hisoblangan edi.
> Brauzerda o'lchanganda eng kichik qurilmada masshtab **27.3%** ekani
> chiqdi, ya'ni 44px u yerda 12px ga tushib o'qilmay qolardi. Raqamlar eng
> yomon holat bo'yicha qayta hisoblandi.

---

## 4. Xavfsiz zonalar (1200 × 338 tuval)

Strelka va nuqtalar **HTML bilan rasm USTIGA** chiziladi. Ya'ni rasmda
o'sha joy tinch qolishi shart.

⚠️ **Tartib GORIZONTAL bo'ldi.** 16:9 da sarlavha tepada, tugma pastda edi.
338px tuvalda ustma-ust joylashtirishga joy yo'q — sarlavha CHAPGA, HTML
elementlari O'NGGA ajratildi.

```
        x=47                          x=780        x=1200
        │                             │            │
┌───────┼─────────────────────────────┼────────────┐  y=0
│┐      │                             │           ┌│  ← 67px burchak
││ ┌────┴─────────────────────────┐   │▓▓▓▓▓▓▓▓▓▓▓││
││ │                              │   │▓  HTML   ▓││  y=47
││ │   SARLAVHA ZONASI            │   │▓  ZONASI ▓││
││ │   (Fable shu yerda erkin)    │   │▓    →    ▓││
││ │   733 × 244 px               │   │▓  ● ─ ─  ▓││
││ └──────────────────────────────┘   │▓▓▓▓▓▓▓▓▓▓▓││  y=291
│┘      │                             │           └│
└───────┴─────────────────────────────┴────────────┘  y=338
```

| Zona | Koordinata (1200×338) | Qoida |
|---|---|---|
| **Sarlavha** | x 47→780, y 47→291 | Fable erkin. Matn ≥ 48px |
| **O'ng HTML bandi** | x 780→1200 (**35%**) | Muhim detal YO'Q, tinch fon |
| **Burchaklar** | har burchakdan 67px | Radius kesib o'tadi (20px CSS) |

**O'ng band nima uchun tinch bo'lishi kerak:** u yerda strelka va oq nuqtalar
turadi. Rasmda o'sha joyda naqsh yoki kontrast chiziq bo'lsa, ular
o'qilmay qoladi. Ideal — silliq mato, soya yoki bir tekis rang.

🔴 **Sarlavha 2 QATORDAN oshmasin.** Ekranda sarlavhaga 64–83px qoladi
(qurilmaga qarab). 16px matn 2 qatorda ~40px, ya'ni sig'adi; 3 qator
(~60px) esa eng kichik telefonda paddingni yeb qo'yadi.

---

## 5. Ekrandagi joylashuv

```
┌────────────────────────────┐
│  Salom, Maryam 🌷          │   ← greeting
│  Bugun qanday matolar…     │
│                            │   gap 14px
│  [🔍 qidiruv      ]  [☰]   │   ← 48px
│                            │   gap 14px
│  ╭────────────────────────╮│   ← BANNER (yangi)
│  │ Sarlavha rasmda   → ●──││      358 × 101, radius 20px
│  ╰────────────────────────╯│      BUTUN TASMA BOSILADI
│                            │   gap 14px
│  Barchasi  Ipak  So'zana   │   ← cat-chips
│                            │
│  Tavsiya etiladi           │
│  ┌────────┐  ┌────────┐    │
│  │        │  │        │    │   ← ~271px ko'rinadi:
│  │        │  │        │    │      TO'LIQ qator kartochka
│  └────────┘  └────────┘    │
└────────────────────────────┘
```

**Nima uchun chiplardan TEPADA:** founder tanlovi. Reklama ko'proq ko'riladi.
⚠️ Bunda kategoriya tanlash bir ekran pastga suriladi — filtr qiladigan xaridor
har safar banner yonidan o'tadi. Bu bilib qilingan almashuv.

---

## 6. Ramka va uslub

| Xususiyat | Qiymat | Manba |
|---|---|---|
| Radius | 20px | `--radius-lg` |
| Ramka | 1px, anor rangi 8% shaffoflikda | saytdagi `.ad-banner` bilan bir xil |
| Soya | `0 16px 38px -24px rgba(23,26,48,.4)` | sayt bilan bir xil |
| Fon (rasm yuklanmaguncha) | `--pom-50` | token |
| `overflow` | `hidden` | radius ishlashi uchun |
| `isolation` | `isolate` | ichki qatlamlar chiqib ketmasin |

🔴 **Rang QO'LDA yozilmasin** (`#7a140d`, `#510100`, `#8f1a10`) — faqat
`var(--pom-*)` tokenlari. Buni **Test 26** qo'riqlaydi, buzilsa test qizil.

---

## 7. CTA tugmasi — YO'Q, butun banner bosiladi

**Founder qarori (2026-08-14):** «cta tugmasini shart emas, bannerga bosganda
ishlaydigan qilamiz».

Sabab o'lchovdan chiqdi: 101px balandlikda 38px tugma + padding bannerning
~70% ini yeb, sarlavhaga joy qoldirmasdi. Ingichka tasma bannerlarda butun
maydonni bosiladigan qilish odatiy naqsh.

| Xususiyat | Qiymat |
|---|---|
| Bosiladigan element | **butun `.ad-banner`** |
| Tegish maydoni | 92–112px balandlik — 44px minimumdan ancha katta ✅ |
| Belgi | O'ngda strelka `→`, 15px SVG, `stroke="currentColor"` |
| Strelka rangi | `var(--pom-700)` |
| Bosilganda | `transform: scale(.985)` — bosilgani sezilsin |
| Semantika | `<button>` yoki `role="button"` + `aria-label` |

⚠️ **Nuqta bosilganda banner amali ISHLAMASIN.** Nuqtalar bannerning ichida
turadi, ya'ni ularga bosilganda hodisa yuqoriga ko'tarilib banner amalini ham
ishga tushirardi — foydalanuvchi slaydni almashtirmoqchi bo'lib katalogga
tushib ketardi. Nuqta ishlovchisida `stopPropagation()` bo'lsin.

⚠️ **Surish (swipe) bosish deb hisoblanmasin.** Barmoq 45px dan ko'p
surilgan bo'lsa — bu swipe, bosish EMAS. Aks holda har surishda banner
amali ishga tushardi.

---

## 8. Nuqtalar (indikator)

| Xususiyat | Qiymat |
|---|---|
| Joylashuv | Pastki o'ng, ichkariga ~10px |
| Tegish maydoni | **44 × 44px** (2026-07-29 qarori — o'zgarmaydi) |
| Ko'rinadigan nuqta | 7 × 7px, radius 999px |
| Faol nuqta | **18 × 7px**, `var(--pom-400)` |
| Nofaol | oq 90%, `box-shadow: 0 1px 4px rgba(23,26,48,.55)` |

Soya shart: nuqtalar har xil rangli rasm ustida turadi, soyasiz oq fonda
yo'qoladi.

⚠️ **Nuqta 8px → 7px ga kichraytirildi** (faol 22 → 18px): banner endi 101px
balandlikda va avvalgi o'lcham strelka bilan yonma-yon tor edi. Tegish maydoni
**44px'ligicha qoladi** — ko'rinadigan qism kichraydi, bosiladigan qism emas.

---

## 9. Harakat (animatsiya)

| Nima | Qiymat | Izoh |
|---|---|---|
| Avtomatik almashish | **5000ms** | sayt bilan bir xil |
| O'tish | crossfade **480ms** | `--dur-slow` + `--ease-out` |
| Ken Burns (zum) | `scale(1.03)` → `scale(1.1)`, 7s | ixtiyoriy |
| Surish (swipe) | chegara **45px** | sayt bilan bir xil |
| `touch-action` | **`pan-y`** | pastga qarang ⚠️ |
| Pauza | `document.hidden` bo'lganda | batareya |

`prefers-reduced-motion: reduce` bo'lsa: avtomatik almashish **YO'Q**, zum
**YO'Q**, crossfade **YO'Q** (bir zumda almashadi). Qo'lda surish ishlayveradi.

⚠️ **`touch-action: pan-y` — nima uchun aynan shu:** banner gorizontal
suriladi, sahifa esa vertikal. `pan-y` brauzerga «vertikalni sen boshqar,
gorizontalni men» deydi. `pan-x` yozilsa — banner ustida sahifa umuman
skroll qilmaydi (kategoriya chiplarida aynan shu masala bo'lgan, `3b90627`).

---

## 10. 🔴 Kodga ulashdagi tuzoqlar

Bular dizaynga emas, **kodga** tegishli — lekin e'tibordan chetda qolsa
banner «ishlagandek ko'rinib» ishlamaydi.

### 10.1 `renderHome()` TO'RT joydan chaqiriladi

| Qator | Joy | `render()` dan o'tadimi |
|---|---|---|
| `app.js:3987` | `render()` | ✅ ha |
| `app.js:1277` | `applyPriceFilter()` | ❌ **yo'q** |
| `app.js:1288` | `clearPriceFilter()` | ❌ **yo'q** |
| `app.js:3778` | `selectCat()` | ❌ **yo'q** |

🔴 `mountAdBanner()` faqat `render()` ga ulansa — foydalanuvchi **kategoriya
bosishi bilan banner muzlab qoladi**: rasm turadi, nuqtalar o'lik, almashish
yo'q. Konsolda xato yo'q, ya'ni nuqson JIMGINA keladi.

**Yechim:** bitta `paintHome()` yordamchisi yozilsin —
`innerHTML = renderHome()` + `focusCatChip()` + `mountAdBanner()` — va to'rtala
joy o'shanga o'tkazilsin. Shunda kelajakda beshinchi chaqiruv qo'shilsa ham
o'zi qamraladi.

### 10.2 Taymer to'planib qolmasin

`mountAdBanner()` ENG BOSHIDA eski taymerni `clearInterval` qilsin. Aks holda
har kategoriya bosilganda yangi taymer qo'shilib, slaydlar tez-tez
«titraydigan» bo'lib qoladi.

### 10.3 `<picture>` tuzog'i — 3 marta tishlagan

Rasm `<picture>` ga o'ralsa, `telegram-app/styles.css` ga QO'SHILSIN:

```css
.ad-slide picture { display: block; width: 100%; height: 100%; }
```

`<picture>` standart holda `inline` va balandligi `auto` — rasmdagi
`height: 100%` tayanadigan narsasini yo'qotadi va **blok balandligi nolga
tushadi**. Nuqson jimgina: rasm yo'qolmaydi, konsolda xato yo'q, blok
shunchaki yopiladi.

### 10.4 `flex: none` — 3 marta tishlagan

Bosh sahifa konteyneri `display: flex; flex-direction: column`. Uning bolasi
standart holda **siqiladi** (`flex-shrink: 1`), ya'ni `aspect-ratio` KAFOLAT
EMAS. `.ad-banner` ga `flex: none` yozilsin.

**Tekshirish ko'z bilan emas, o'lchov bilan:**
```js
document.querySelector('.ad-banner').getBoundingClientRect().height
// 390px ekranda 201 (±1) bo'lishi shart
```

### 10.5 Kesh versiyalari

Fayl tahrirlansa `telegram-app/index.html` da raqam **ko'tarilsin**:

| Fayl | Hozir | Bo'lsin |
|---|---|---|
| `app.js` | `?v=89` | `?v=90` |
| `styles.css` | `?v=33` | `?v=34` |

Buni **Test 16** qo'riqlaydi (fayl `sha256` ini jadval bilan solishtiradi).

### 10.6 Service worker'ga TEGILMAYDI

Banner rasmlari `sw.js` → `PRECACHE` ro'yxatiga **qo'shilmasin**. Qo'shilsa
`CACHE_VERSION` ni ham oshirish kerak bo'ladi (**Test 17**) va 4 ta rasm uchun
bu ortiqcha murakkablik. Rasmlar oddiy yo'l bilan yuklanadi.

### 10.7 CSP — o'zgarmaydi ✅

Jonli sarlavha o'lchandi:
```
img-src 'self' data: https://cdn.lolamarket.uz https://*.maps.yandex.net …
```
Rasmlar `telegram-app/assets/` da tursa `'self'` ularni qamraydi.
**Nginx'ga tegilmaydi** — mavjud ruxsat yetganda yangi ruxsat ochilmaydi.

### 10.8 Rasmlar qayerda yashaydi

```
telegram-app/assets/ads/
├── ad-1-1200.webp   ad-1-800.webp   ad-1-1200.jpg
├── ad-2-1200.webp   ad-2-800.webp   ad-2-1200.jpg
├── ad-3-1200.webp   ad-3-800.webp   ad-3-1200.jpg
└── ad-4-1200.webp   ad-4-800.webp   ad-4-1200.jpg
```

🔴 **`Photo/` ga QO'YILMASIN** — ikki sabab: (1) u founder mulki, tegilmaydi;
(2) `Photo/` Mini App'ga umuman deploy qilinmaydi va rasm production'da 404
bo'lardi.

Deploy avtomatik: CI `telegram-app/*` ni `mini-app/` ga ko'chiradi
(`deploy.yml:62`), ichki papkalar birga ketadi — `assets/products/` allaqachon
shu yo'l bilan ishlayapti.

---

## 11. ⚠️ Ochiq masala — TIL

Mini App **to'liq ikki tilli** (`uz` / `ru`, `app.js:71` va `app.js:254`).
Sarlavha rasm ichida chizilgani uchun **til almashganda sarlavha almashmaydi** —
rus tilidagi xaridor o'zbekcha sarlavha ko'radi.

Uchta yo'l bor, qaror founderniki:

| Yo'l | Narxi | Natijasi |
|---|---|---|
| **A.** Faqat o'zbekcha | 0 | Rus xaridor o'zbekcha sarlavha ko'radi |
| **B.** Har slaydga 2 rasm | 2× rasm, 2× og'irlik | To'g'ri, lekin 8 ta fayl |
| **C.** Sarlavha rasmda — brend/vizual, so'zsiz | 0 | Til muammosi yo'qoladi |

**Kod ikkalasiga ham tayyor yoziladi:** slayd ma'lumotida rasm
`{ uz: '…', ru: '…' }` ko'rinishida turadi va `ru` bo'lmasa `uz` ga qaytadi.
Ya'ni bugun A yo'li tanlansa ham, ertaga rus nusxasi kodga tegmasdan
qo'shiladi.

---

## 12. Fable uchun qisqa xulosa (ko'chirib olinadigan)

```
TUVAL:        1200 × 338 px, sRGB, WebP + JPEG
NISBAT:       16:4.5 (= 32:9) — INGICHKA TASMA, qat'iy
MASSHTAB:     27.3% (eng kichik telefon) — rasmdagi 88px = ekranda 24px
MATN MIN:     48px (rasmda). Undan kichik — arzon Android'da o'qilmaydi
SARLAVHA:     CHAPDA — x 47→780, y 47→291 (733 × 244 px)
              MAKS 2 QATOR (ekranda 64–83px qoladi)
BO'SH ZONA:   O'NGDA — x 780→1200 (35%), strelka+nuqtalar, TINCH fon
BURCHAK:      har burchakdan 67px ichkari (radius kesadi)
TUGMA:        YO'Q — butun tasma bosiladi
OG'IRLIK:     1-slayd ≤ 55KB, qolgani ≤ 40KB (WebP)
SONI:         3–4 slayd
BREND RANG:   #7a140d (anor) — lekin kodda faqat var(--pom-700)
SHRIFT:       Bricolage Grotesque (sarlavha), Hanken Grotesque (matn)
MAVZU:        O'zbek to'qima matolari — ikat, adras, so'zana, ipak
```

⚠️ **Ingichka tasmada rasm «foto» emas, FON bo'ladi.** 101px balandlikda
matoning naqshi tanilmaydi — u tekstura bo'lib ko'rinadi. Ya'ni dizayn
«mato surati + matn» emas, **«tekstura foni + kuchli sarlavha»** bo'lsin.
Bu 16:4.5 tanlovining tabiiy natijasi, nuqson emas.

---

## 13. Chiqarishdan oldingi tekshiruv ro'yxati

- [ ] `getBoundingClientRect().height` = **101** (±1) — 390px ekranda
- [ ] Sarlavha 2 qatordan oshmayaptimi, kesilmayaptimi
- [ ] Kategoriya bosilgandan keyin banner ALMASHISHDA davom etyaptimi (10.1)
- [ ] Banner ustida sahifa vertikal skroll qilyaptimi (`pan-y`)
- [ ] Chapga/o'ngga surish ishlaydimi
- [ ] **Nuqta bosilganda banner amali ishlamayaptimi** (7-band)
- [ ] **Surish bosish deb hisoblanmayaptimi** (7-band)
- [ ] `?v=` raqamlari ko'tarilganmi (10.5)
- [ ] Rasmlar `telegram-app/assets/ads/` da (10.8)
- [ ] Kodda qo'lda hex rang yo'qmi (Test 26)
- [ ] `node server/test.js` — hammasi yashil
- [ ] Production'da rasm haqiqatan ko'rinyaptimi (KO'Z bilan — CSP jimgina bloklaydi)
