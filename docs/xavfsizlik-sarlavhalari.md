# Xavfsizlik sarlavhalari (security headers)

**Holat:** ✅ BAJARILDI (2026-08-02) — uchala qoida Cloudflare'da qo'llangan, CSP
**majburlash** rejimida, jonli tekshirilgan (`/`, `/admin/`, `/mini-app/` va
Telegram'dagi Mini App: bloklangan manba 0 ta, rasm xatosi 0 ta, 85 kartochka
chizildi, `window.Telegram` joyida).
**Sana:** 2026-08-02

⚠️ Ochiq qarz: CSP `'unsafe-inline'` bilan ishlayapti — sabab pastdagi
"Nega `'unsafe-inline'` qo'yishga majburmiz" bo'limida.

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

### ⚠️ Nega `'unsafe-inline'` qo'yishga majburmiz

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

### Qoida

```
default-src 'self'; script-src 'self' https://telegram.org https://static.cloudflareinsights.com 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self' https://telegram.org https://*.telegram.org; base-uri 'self'; form-action 'self'; object-src 'none'
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
| `img-src 'self' data:` | Rasm bizdan (`assets/`, `/api/product-photo`) |
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
