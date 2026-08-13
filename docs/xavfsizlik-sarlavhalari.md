# Xavfsizlik sarlavhalari (security headers)

**Holat:** ✅ BAJARILDI (2026-08-02) — uchala qoida Cloudflare'da qo'llangan, CSP
**majburlash** rejimida, jonli tekshirilgan (`/`, `/admin/`, `/mini-app/` va
Telegram'dagi Mini App: bloklangan manba 0 ta, rasm xatosi 0 ta, 85 kartochka
chizildi, `window.Telegram` joyida).
**Sana:** 2026-08-02

**Yangilanish (2026-08-06, C3):** `script-src` dagi `'unsafe-inline'` OLIB
TASHLANDI — pastdagi "C3 — `'unsafe-inline'` olib tashlash" bo'limiga qarang.
Kod tomoni tayyor va Test 15 bilan qulflangan; Cloudflare paneldagi qiymatni
**founder qo'lda almashtiradi**.

⚠️ `style-src` dagi `'unsafe-inline'` O'Z JOYIDA QOLADI — bu butunlay boshqa
va ancha katta qarz (kodda yuzlab inline `style="..."` atributi bor,
`vm()` → `bgStyle` naqshi). C3 FAQAT `script-src` haqida.

---

## Muammo

2026-08-02 da jonli tekshirildi:

```
curl -sI https://lolamarket.uz/
```

Javobda **faqat** `strict-transport-security` bor. Ya'ni yo'q:

| Sarlavha | Yo'qligi nimaga olib keladi |
|---|---|
| `X-Frame-Options` | Sayt begona `<iframe>` ichiga solinadi — **clickjacking**. Xaridor "Tasdiqlash" tugmasini bosyapman deb o'ylab, ustiga qo'yilgan shaffof qatlamni bosadi |
| `X-Content-Type-Options` | Brauzer fayl turini o'zi taxmin qiladi (MIME sniffing) — yuklangan fayl skript sifatida ishga tushishi mumkin |
| `Referrer-Policy` | Tashqi saytga o'tilganda to'liq URL (ichidagi ID'lar bilan) yuboriladi |
| `Permissions-Policy` | Sahifa kamera/mikrofon/geolokatsiya so'rashi cheklanmagan |

HSTS **ulanishni** himoya qiladi (kanal shifrlangan bo'lsin), bu sarlavhalar esa
**sahifani** himoya qiladi. Ikkalasi boshqa-boshqa narsa — biri ikkinchisini
almashtirmaydi.

---

## Nega Cloudflare, nginx emas

Sayt Cloudflare orqali uzatiladi (`server: cloudflare`, `cf-ray` javobda bor).
Sarlavhalarni ikki joyda qo'shish mumkin edi:

- **nginx** — konfiguratsiya serverda qo'lda boshqariladi (CI unga tegmaydi).
  Muammo: nginx'da `add_header` **meros olinmaydi** — agar biror `location`
  bloki o'zining `add_header`ini e'lon qilsa, tepadagi hammasini tashlab
  yuboradi. Ya'ni sarlavhalar har blokda takrorlanishi kerak va bittasi
  esdan chiqsa, o'sha yo'l jimgina himoyasiz qoladi.
- **Cloudflare Transform Rules** ✅ — bitta joyda, HAMMA javobga (statik fayl
  ham, `/api/` ham) tegadi, paneldan bir bosishda orqaga qaytariladi.

Kamchiligi: qoida git'da yashamaydi. Shuning uchun aynan shu fayl yozildi —
qoidalarning kanonik nusxasi shu yerda.

---

## Qo'llash — Cloudflare panel

**Yo'l:** Cloudflare → `lolamarket.uz` → **Rules** → **Overview** →
*Create rule* → **Response Header Transform Rule**

### 1-qoida: `lolamarket — asosiy xavfsizlik sarlavhalari`

**Qamrov:** *All incoming requests*

Uchta sarlavha qo'shiladi (har biri *Set static* rejimida):

| Header name | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

`Permissions-Policy` shunday qat'iy yozildi, chunki kod tekshirildi: loyihada
`getUserMedia`, `geolocation` yoki `capture=` umuman ishlatilmaydi. Kelajakda
kamera kerak bo'lsa — avval shu qoidani yumshatish kerak, aks holda brauzer
so'rovni jimgina rad etadi.

### 2-qoida: `lolamarket — freym himoyasi (Mini App'dan tashqari)`

**Qamrov:** *Custom filter expression*

```
not starts_with(http.request.uri.path, "/mini-app")
```

| Header name | Value |
|---|---|
| `X-Frame-Options` | `DENY` |

---

## ⚠️ Nega Mini App istisno

**Telegram Web'da (`web.telegram.org`) Mini App `<iframe>` ichida ochiladi.**
Agar `/mini-app/` ga `X-Frame-Options: DENY` qo'yilsa, brauzerdan Telegram'ga
kirgan foydalanuvchida ilova **bo'sh oq ekran** bo'lib qoladi. Telefondagi
Telegram ilovasida va Telegram Desktop'da muammo bo'lmaydi — u yerda native
WebView ishlatiladi, iframe emas. Ya'ni nuqson faqat foydalanuvchilarning bir
qismida ko'rinadi va uni sezish qiyin.

`X-Frame-Options` da bir nechta manbaga ruxsat berish **imkoni yo'q**
(`ALLOW-FROM` brauzerlar tomonidan tashlab yuborilgan). Shuning uchun 1-bosqichda
Mini App umuman qamralmaydi.

Xavf jihatidan bu maqbul: himoya eng zarur bo'lgan sahifalar — landing (`/`,
sessiya cookie'si bor) va `/admin/` (panel tokeni `sessionStorage`da) — ikkalasi
ham `DENY` ostida qoladi. Mini App'da esa o'g'irlanadigan sessiya yo'q: har
so'rovda Telegram imzolagan `initData` yuboriladi.

**2-bosqichda** (CSP) bu to'g'ri hal qilinadi — `frame-ancestors` bir nechta
manbani qabul qiladi:

```
frame-ancestors 'self' https://telegram.org https://*.telegram.org
```

va u `X-Frame-Options` qila olmagan ishni qiladi — Mini App'ni ham himoya ostiga
oladi. `X-Frame-Options` esa baribir qoldiriladi (eski brauzerlar uchun), pastdagi
"3-qadam" ga qarang.

---

## Tekshirish

Qoidalar saqlangach (Cloudflare'da ~30 soniya):

```bash
curl -sI https://lolamarket.uz/ | grep -iE 'x-frame|x-content|referrer|permissions'
```

Kutilgan javob:
```
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=()
x-frame-options: DENY
```

Mini App'da `x-frame-options` **bo'lmasligi** kerak (qolgan uchtasi bor):

```bash
curl -sI https://lolamarket.uz/mini-app/ | grep -iE 'x-frame|x-content'
```

Eng muhimi — Mini App haqiqatan ochilishi. Telegram'dan botga kirib ilovani
oching (imkoni bo'lsa `web.telegram.org` dan ham).

---

## 2-bosqich — CSP

`Content-Security-Policy` 1-bosqichga ATAYLAB kiritilmadi: yuqoridagi to'rtta
sarlavha noto'g'ri bo'lsa saytni buzmaydi, CSP esa noto'g'ri yozilsa sahifani
**jimgina** sindiradi — skript yuklanmaydi, xato faqat brauzer konsolida ko'rinadi.

### Inventarizatsiya (2026-08-02)

Butun kod ko'rib chiqildi. Tashqi manbalar — atigi ikkita:

| Manba | Nima uchun | Qayerda |
|---|---|---|
| `https://telegram.org` | `telegram-web-app.js` | `index.html:29`, `telegram-app/index.html:28` |
| `https://fonts.googleapis.com` + `https://fonts.gstatic.com` | Bricolage Grotesque, Hanken Grotesk, Geist Mono | `index.html:21`, `telegram-app/index.html:9`, `admin/index.html:11`, `sayt-eski/style.css:1` |

Hamma `fetch` o'z domenimizga ketadi (`/api/...`). `eval()` va `new Function`
umuman ishlatilmaydi. `data:` yoki `blob:` URI yo'q. `unpkg.com` faqat dizayn
tizimi `readme.md` sida eslatilgan — kodda ishlatilmaydi.

### ⚠️ [TARIX] Nega 2026-08-02 da `'unsafe-inline'` qo'yishga majbur edik

_Bu bo'lim TARIX uchun qoldirildi — qarz 2026-08-06 da yopildi, pastdagi
"C3" bo'limiga qarang. Quyidagi raqamlar o'sha kunning holati._

| Fayl | `onclick=` kabi inline hodisalar | `style="` atributi |
|---|---|---|
| `telegram-app/app.js` | 76 | 455 |
| `script.js` | 24 | 15 |
| HTML fayllar | 19 | 4 |

CSP'ning eng kuchli tomoni — inline kodni butunlay taqiqlash. Buni HOZIR qilib
bo'lmaydi: `script-src` dan `'unsafe-inline'` olib tashlansa, Mini App'dagi
hamma tugma o'lik bo'lib qoladi.

Hash bilan ruxsat berish ham ishlamaydi: hodisalar dinamik yaratiladi
(`onclick="openProduct('ik-1402')"` — har mahsulotda boshqa hash), ya'ni
ro'yxat cheksiz bo'lardi.

**Bu CSP'ni sezilarli zaiflashtiradi** — saytga kod kirib qolsa, u baribir ishga
tushadi. Lekin qolgan himoyalar kuchida qoladi:
- begona domendan skript yuklab bo'lmaydi (`script-src`)
- o'g'irlangan ma'lumotni tashqariga yuborib bo'lmaydi (`connect-src 'self'`)
- `frame-ancestors` — `X-Frame-Options` qila olmagan ishni qiladi

**Kelajakdagi ish:** ~120 ta inline hodisani `addEventListener` ga o'tkazish.
Shundan keyingina `'unsafe-inline'` olib tashlanadi va CSP to'liq kuchga kiradi.

### Qoida (2026-08-02 dagi, ESKI — `'unsafe-inline'` bilan)

⚠️ Bugungi kanonik qiymat pastdagi "C3" bo'limida. Bu nusxa faqat solishtirish
uchun turibdi.

```
default-src 'self'; script-src 'self' https://telegram.org https://static.cloudflareinsights.com 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://cdn.lolamarket.uz; connect-src 'self'; frame-ancestors 'self' https://telegram.org https://*.telegram.org; base-uri 'self'; form-action 'self'; object-src 'none'
```

⚠️ **`static.cloudflareinsights.com` — kuzatuv rejimi topgan buzilish.** Bu
Cloudflare Web Analytics beacon'i (`beacon.min.js`). Uni sahifaga Cloudflare
O'ZI qo'shadi, shuning uchun repodagi kodni qidirganda topilmaydi — faqat jonli
brauzerda ko'rinadi. Qoidaning dastlabki nusxasida u yo'q edi va majburlansa
sayt tashrif statistikasi yig'ilmay qolardi (sayt sinmasdi, analitika o'lardi).
Beacon ma'lumotni `lolamarket.uz/cdn-cgi/rum` ga, ya'ni O'Z domenimizga yozadi —
shuning uchun `connect-src 'self'` yetarli, unga hech narsa qo'shish shart emas.

Bandlarning ma'nosi:

| Band | Nima qiladi |
|---|---|
| `default-src 'self'` | Aytilmagan hamma narsa faqat o'z domenimizdan |
| `script-src` | Skript faqat bizdan yoki `telegram.org` dan |
| `style-src` | Uslub bizdan yoki Google Fonts'dan |
| `font-src` | Shrift fayllari `fonts.gstatic.com` dan |
| `img-src 'self' data: https://cdn.lolamarket.uz` | Rasm bizdan (`assets/`, `/api/product-photo`) va R2 omboridan (2026-08-09) |
| `media-src 'self' https://cdn.lolamarket.uz` | Mahsulot videosi R2 dan (2026-08-13). **`img-src` buni qamramaydi** — `<video>` alohida bandga qaraydi |
| `connect-src 'self'` | **`fetch` faqat o'z API'imizga** — ma'lumot tashqariga chiqmaydi |
| `frame-ancestors` | Freym himoyasi, Telegram'ga ruxsat bilan |
| `base-uri 'self'` | `<base>` orqali hamma yo'lni burib yuborishning oldini oladi |
| `form-action 'self'` | Forma begona serverga yuborilmaydi |
| `object-src 'none'` | Flash/plugin butunlay yopiq |

### Ishga tushirish tartibi

**1-qadam — kuzatuv rejimi.** Sarlavha nomi `Content-Security-Policy-Report-Only`.
Brauzer qoidani MAJBURLAMAYDI, faqat buzilishlarni konsolga yozadi. Sayt sinmaydi.

**2-qadam — tekshirish.** Landing, `/admin/`, `/mini-app/` va Telegram'dagi
haqiqiy Mini App ochiladi, konsolda `Content Security Policy` xabarlari
sanaladi. Bo'lsa — qoidaga tegishli manba qo'shiladi.

**3-qadam — majburlash.** Konsol toza bo'lgach, sarlavha nomi
`Content-Security-Policy` ga o'zgartiriladi (qiymat o'sha-o'sha).

⚠️ **`X-Frame-Options` qoidasi O'CHIRILMADI.** Dastlabki rejada "CSP kuchga
kirgach XFO o'chiriladi" deb yozilgan edi — undan voz kechildi. Zamonaviy
brauzerda `frame-ancestors` ustun turadi va XFO e'tiborga olinmaydi, ya'ni
uni qoldirishning ziyoni yo'q; `frame-ancestors` ni tushunmaydigan eski
brauzerda esa XFO yagona qolgan himoya bo'ladi. Ikkala qoida birga turadi.

**Natija (2026-08-02, majburlash rejimida jonli tekshirildi):** landing,
`/admin/`, `/mini-app/` va Telegram'dagi haqiqiy Mini App ochildi — CSP
bloklagan manba 0 ta, rasm xatosi 0 ta, katalogda 85 kartochka chizildi,
`window.Telegram` mavjud. Mini App'ning Telegram ichida ochilishi —
`frame-ancestors` to'g'ri ishlayotganining bevosita dalili.

---

## C3 — `'unsafe-inline'` olib tashlash (2026-08-06)

**Holat:** kod tomoni TAYYOR va test bilan qulflangan. Cloudflare paneldagi
qiymatni **founder almashtiradi** — bu yagona qolgan qadam.

### Kanonik qoida — BUGUNGI qiymat

```
default-src 'self'; script-src 'self' https://telegram.org https://static.cloudflareinsights.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://cdn.lolamarket.uz; media-src 'self' https://cdn.lolamarket.uz; connect-src 'self'; frame-ancestors 'self' https://telegram.org https://*.telegram.org; base-uri 'self'; form-action 'self'; object-src 'none'
```

Eskisidan farqi **bitta**: `script-src` dan `'unsafe-inline'` olib tashlandi.
Qolgan hamma band harfma-harf o'sha-o'sha.

🔴 **`media-src` 2026-08-13 da QO'SHILDI — u bo'lmasa video JIMGINA o'ladi.**
Mahsulot videosi (`db/023`) `cdn.lolamarket.uz` dan `<video>` bilan olinadi.
`img-src` unga TEGISHLI EMAS: `<video>` uchun brauzer `media-src` ga qaraydi,
u aytilmagan bo'lsa `default-src 'self'` ga tushadi va R2 domeni rad etiladi.
Nuqson ko'rinmasdi — sahifa ochilardi, konsolda CSP xatosi qolardi, pleyer
esa bo'sh turardi.

⚠️ **BU YERDA AVVAL NOTO'G'RI YOZILGAN EDI va uni tuzatish darsning o'zi.**
Dastlab shunday deyilgandi: "hozircha CSP majburlanmagani uchun video
ishlaydi, bu **kelajakdagi** tuzoq". **YOLG'ON:** CSP 2026-08-02 dan beri
MAJBURLASH rejimida (shu faylning birinchi qatori aynan shuni aytadi).
Ya'ni tuzoq kelajakda emas, O'SHA KUNI otilishi mumkin edi va faqat
`media-src` o'z vaqtida qo'shilgani uchun otilmadi. Da'vo hujjatning O'ZIDAN
tekshirilmasdan yozilgan — bu **"hujjatdagi raqam — tekshirilmagan da'vo"**
qoidasining aynan takrori, faqat raqam emas, HOLAT haqida.
Tuzatilgan kuni jonli o'lchandi:
`curl -sI https://lolamarket.uz/admin/ | grep -i content-security-policy` →
`media-src 'self' https://cdn.lolamarket.uz` javobda BOR.

- `https://static.cloudflareinsights.com` **SAQLANADI** — beacon `src` li tashqi
  skript, inline emas, ya'ni `'unsafe-inline'` ga umuman bog'liq emas edi.
- `style-src` dagi `'unsafe-inline'` ga **TEGILMADI** (yuqoridagi ogohlantirish).

### Nima qilindi

| Bosqich | Nima | Commit |
|---|---|---|
| C1 | Landing — 26 ta hodisa `data-action` delegatsiyasiga | `02654e8` |
| C2 1-qism | Mini App xaridor yo'li — 53 ta hodisa | `6bbb64f` |
| C2 2-qism | Mini App qolgani + admin + oflayn sahifa — 41 ta | `86c9b5d` |
| **C3** | **Landing oflayn sahifasi, sprint paneli, narx filtri + QOROVUL** | shu ish |

C3 da yopilganlari — **uchalasi ham oldingi supurishlardan o'tib ketgan edi:**

1. **`offline.html`** — inline `onclick` VA inline `<script>` bloki.
   `telegram-app/offline.html` C2 da tuzatilgan, ildizdagi egizagi esa
   supurish ro'yxatiga umuman kirmagan. `offline.js` ga chiqarildi,
   `sw.js` → `PRECACHE` ga qo'shildi va `CACHE_VERSION` `v2` → `v3`.
   ⚠️ Ikkinchi qadam majburiy: keshda eski ro'yxat qolsa `offline.js` aynan
   oflayn holatda yuklanmasdi, ya'ni tuzatish o'zi tuzatayotgan holatda
   ishlamas edi.
2. **`loyiha-panel.html`** — 49 qatorlik inline `<script>`. `panel.js` ga
   chiqarildi. Bu deploy qilinadigan sahifa, ya'ni CSP unga ham tegadi.
3. **`index.html` narx filtri** — ikkita `onkeydown="…Enter…applyPrice()"`.
   C1 supurishi buni ko'rmagan, chunki o'sha qidiruv naqshi faqat
   `click|input|change|submit|error` ni sanardi. `script.js` ga uchinchi
   delegatsiya qatlami qo'shildi (`data-enter`), `data-action` va
   `data-submit` yonига.

### Qorovul — Test 15 (`server/test.js`)

Qoidaning o'zi himoya emas: 18 ta deploy qilinadigan frontend faylini (593 KB)
skanerlab uch narsani qidiradi — inline hodisa, inline `<script>` bloki,
`javascript:` URL. Beshta mutatsiya bilan sinaldi (hodisa qaytarish, skript
bloki qo'shish, `javascript:` URL, istisno ro'yxatini o'chirish, nishon faylni
o'zgartirish) — beshtasida ham qizil bo'ldi.

Istisnolar ro'yxati **AYNAN** solishtiriladi: istisno yo'qolsa ham test qizil
bo'ladi, ya'ni eski sayt tozalangan kuni ro'yxatni yangilash esdan chiqmaydi.

### Istisno QOLMADI — `sayt-eski/` o'chirildi

Dastlab bitta istisno bor edi: `sayt-eski/index.html:69` dagi
`onsubmit="handleSubmit(event)"` — founder qarori bilan tegilmagan
("kerakmas, unut"), ya'ni C3 dan keyin o'sha formadagi email tugmasi jimgina
o'lishi qabul qilingan edi.

**O'sha kuni founder butun papkani o'chirtirdi** va istisno o'z-o'zidan
yopildi. Papkani saqlab turgan sabab tekshirilganda YOLG'ON bo'lib chiqdi:
CLAUDE.md "demo/ va admin/ uning style.css'iga bog'liq" derdi, aslida `demo/`
repoda umuman yo'q edi va `admin/` ildizdagi `style.css` ni ishlatadi
(`admin/index.html:13` → `../style.css`).

Natija: Test 15 ning istisnolar ro'yxati **BO'SH** — deploy qilinadigan kodda
inline hodisa, inline `<script>` va `javascript:` URL **umuman qolmadi**.

⚠️ **Serverdagi `/var/www/lolamarket/sayt-eski/` rsync bilan O'CHMAYDI.**
Repodan olib tashlash uni `https://lolamarket.uz/sayt-eski/` manzilidan
yo'qotmaydi — papka qo'lda olib tashlanishi kerak.

### Yo'l-yo'lakay topilgan alohida nuqson

`loyiha-panel.html` hisobot matnida XOM `"><svg onload=…` turgan edi — bu
proza sifatida yozilgan, lekin brauzer uni **haqiqiy teg** deb ochadi va
ortidagi butun hisobot o'sha `<svg>` ichiga tushib **ko'rinmay qoladi**.
`&lt;` ga o'zgartirildi. Test 15 buni ham qo'riqlaydi.

### Ishga tushirish tartibi (founder)

1. Cloudflare → `lolamarket.uz` → **Rules** → **Overview** → CSP qoidasini ochish.
2. `Content-Security-Policy` qiymatini yuqoridagi **kanonik qoida** bilan
   almashtirish (`script-src` dan `'unsafe-inline'` ketadi, boshqa hech narsa
   o'zgarmaydi).
3. ~30 soniyadan keyin tekshirish:

```bash
curl -sI https://lolamarket.uz/ | grep -i content-security-policy
```

4. Brauzerda ochib konsolni ko'rish: `/`, `/admin/`, `/mini-app/` va
   Telegram'dagi haqiqiy Mini App. **Kutilgan:** `Refused to execute inline
   script` xabari 0 ta. Chiqsa — qaysi fayl ekani xabarda yozilgan bo'ladi.
5. Amaliy sinov: narx filtriga son yozib **Enter** bosish (yangi `data-enter`
   qatlami), oflayn sahifadagi "Qayta urinish" tugmasi, sprint panelidagi
   kartochkalar chizilishi.

⚠️ **Deploy OLDIN, CSP KEYIN.** Yangi `offline.js` va `panel.js` serverga
chiqmasdan turib CSP almashtirilsa, oflayn sahifa va panel bir muddat
ishlamay turadi.

---

## C4 — Yandex karta CSP tomonidan BLOKLANMOQDA (2026-08-13)

🔴 **Holat: NUQSON JONLI.** Kod production'da, karta esa CSP tomonidan
bloklangan — profildagi "Mening manzilim" da karta o'rniga "Karta
yuklanmadi" yozuvi turibdi (nuqta ro'yxatdan tanlanadi, ya'ni funksiya
o'lmagan, lekin kartaning O'ZI ishlamayapti).

⚠️ **Bu bo'limning birinchi nusxasi XATO edi va uni saqlab qo'yish
foydali:** unda "CSP hali qo'llanmagan, xavf KELAJAKDA" deb yozilgandi.
Manba — shu HUJJATNING o'zi (C3 "founder qadamini kutmoqda" deb turardi).
Jonli sarlavha o'lchanganda esa CSP ALLAQACHON majburlanayotgani chiqdi:

```bash
curl -sI https://lolamarket.uz/ | grep -i content-security-policy
```

Ya'ni bu CLAUDE.md dagi **"hujjatdagi raqam — tekshirilmagan da'vo"**
qoidasining aynan o'zi, faqat raqam emas HOLAT darajasida: hujjat "hali
yoqilmagan" derdi, brauzer esa bloklab turgandi. Xulosa: CSP holati
hujjatdan emas, HAR DOIM jonli sarlavhadan o'qilsin.

Karta Yandex Maps JS API 2.1 dan foydalanadi (`script.js` → `loadYmaps`,
`telegram-app/app.js` → `mountBtsMap`). Skript **dinamik** yuklanadi, ya'ni
HTML'da ko'rinmaydi va statik supurishlarda topilmaydi.

### Kerakli manbalar — JONLI O'LCHANGAN (taxmin EMAS)

Kalit bilan karta CSP'siz muhitda ochildi, masshtab o'zgartirildi va
brauzerning `performance` resurs yozuvlaridan mezbon + resurs TURI yig'ildi
(tur direktivani belgilaydi):

| Mezbon | Turi | Direktiva |
|---|---|---|
| `api-maps.yandex.ru` | script ×4 | `script-src` |
| `yastatic.net` | script ×1, img ×4 | `script-src` + `img-src` |
| `core-renderer-tiles.maps.yandex.net` | img ×21 | `img-src` |
| `log.api-maps.yandex.ru` | img ×1 | `img-src` (telemetriya) |

🔴 **O'lchov hujjatdagi taxminni RAD ETDI:** dastlab `connect-src` ga ikkita
mezbon qo'shish kerak deb yozilgandi — **kerak emas ekan.** 2.1 versiyasi
modullarni `<script>` bilan, plitkalarni esa `<img>` bilan oladi, XHR
ishlatmaydi. Taxmin bo'yicha yozilganda CSP keraksiz ravishda kengaytirilgan
bo'lardi.

⚠️ **O'lchov TO'LIQ emas:** u bitta seansni qamradi (Toshkent, masshtab
o'zgarishi, 9 belgi). Boshqa oqim (geolokatsiya tugmasi, boshqa hudud)
yangi mezbon so'rashi mumkin — qoida qo'llangandan keyin konsol BIR MARTA
o'qilsin.

### Yangi kanonik qiymat

```
default-src 'self'; script-src 'self' https://telegram.org https://static.cloudflareinsights.com https://api-maps.yandex.ru https://yastatic.net; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://cdn.lolamarket.uz https://*.maps.yandex.net https://yastatic.net https://log.api-maps.yandex.ru; media-src 'self' https://cdn.lolamarket.uz; connect-src 'self'; frame-ancestors 'self' https://telegram.org https://*.telegram.org; base-uri 'self'; form-action 'self'; object-src 'none'
```

Eskisidan farqi uchta: `script-src` ga ikki mezbon, `img-src` ga uch mezbon,
va `media-src` (u mahsulot VIDEOSI uchun — alohida ish, yuqoridagi bandga
qara). `style-src` ga tegilmaydi: unda `'unsafe-inline'` bor va Yandex o'z
uslublarini aynan shu yo'l bilan qo'yadi.

`log.api-maps.yandex.ru` — Yandex telemetriyasi. Uni ATAYLAB tashlab
ketish mumkin (karta usiz ham to'liq ishlaydi), lekin o'shanda konsolda
HAR SAFAR CSP xatosi chiqib turadi — va "kutilgan xato" konsolni signalsiz
shovqinga aylantiradi. Shuning uchun ro'yxatga kiritildi.

### Qo'llash (founder)

Cloudflare → `lolamarket.uz` → Rules → Overview → CSP qoidasi → qiymatni
yuqoridagi bilan almashtirish. Keyin tekshiruv: profil → "Mening manzilim"
→ karta CHIZILSIN va konsolda `Refused to load` BO'LMASIN.
