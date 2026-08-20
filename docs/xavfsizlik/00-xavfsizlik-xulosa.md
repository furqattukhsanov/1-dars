# 00 — Xavfsizlik xulosasi: umumiy zaiflik jadvali + tuzatish rejasi

**Sana:** 2026-08-20 · **Qamrov:** LolaMarket (sayt + Mini App + admin panel +
Hetzner backend) **va** Fable-agent guardrail'lari («kibir hujum»).
**Tur:** oq (etik) audit, loyiha o'zimizniki.

Bu — bosh hujjat. Tafsilotlar:
[`01-pentest-metodologiya`](01-pentest-metodologiya.md) ·
[`kibir-hujum-hisoboti`](../kibir-hujum-hisoboti.md) ·
[`xavfsizlik-sarlavhalari`](../xavfsizlik-sarlavhalari.md).

---

## 1. Avval — nima ALLAQACHON yaxshi (halol rasm)

Audit ko'p narsani **mustahkam** deб topdi — bularni «zaiflik» deб yozib bo'lmaydi:

| ✅ Kuchli tomon | Qayerda (jonli tekshirilgan) |
|---|---|
| SQL **parametrlangan** (`$1,$2`) — injection yuzasi past | `routes/*.js` `pool.query(sql, [...])` |
| Cookie **HttpOnly + Secure + SameSite=Lax** | `lib/web-session.js:20` |
| **Rate-limit** deyarli har endpointda | `lib/http.js` → `rateLimited`, `routes/*` |
| **CSP majburlangan** + XFO + nosniff + referrer + permissions-policy | jonli `curl -sI` |
| Sirlar repoda **yo'q**, `.env` serverda | `server/README.md` |
| Admin yozuvi **Telegram'da tasdiqlanadi** (ikki kanal) | CLAUDE.md arxitektura |
| Foydalanuvchi matni `esc()` + testlar bilan qoplangan | Test 3f, 15 |

Ya'ni asosiy devor sog'lom. Quyidagilar — **qolgan** nozik joylar.

---

## 2. 🎯 Umumiy zaiflik jadvali (hammasi bitta joyda)

Jiddiylik: 🔴 yuqori · 🟠 o'rta · 🟡 past. Holat: ✅ tasdiqlangan · 🔬 sinov kerak.

| # | Soha | Zaiflik | Nega xavfli — **soda tilda** | Jidd. | Holat |
|---|------|---------|------------------------------|-------|-------|
| **W1** | Sarlavha | HSTS atigi **30 kun**, `includeSubDomains` va `preload` yo'q | Brauzerга «doim HTTPS ishlat» degan eslatma qisqa muddatli. Uzoq kirmagan foydalanuvchi keyingi safar bir marta HTTP'ga tushib qolса, o'rtadagi hujumchi ushlab olishi mumkin. Subdomenlar (`cdn.`) umuman qamralmagan | 🟠 | ✅ |
| **W2** | CSP | `style-src 'unsafe-inline'` hamon ochiq | Saytga zararli kod kirib qolса, u `style="..."` orqali ish bajara oladi. `esc()` bu yo'lni yopmaydi — CSP'ning eng kuchli qulfі shu joyda ochiq turibdi | 🟠 | ✅ |
| **W3** | Maxfiylik | Baza zaxirasi **Telegram chatiga** boradi (butun mijoz bazasi) | `BACKUP_CHAT_ID` chatidagi **har kim** butun bazani — telefon, manzil, buyurtmalar — yuklab olishi mumkin. Bitta chat a'zosi ketса yoki qo'shilса, hammaga ochiladi | 🔴 | ✅ |
| **W4** | Admin | Panel tokeni `sessionStorage`da (XSS'da o'g'irlanadi) | Admin brauzeriga zararli kod kirса, token o'g'irlanadi va hujumchi panelni ochadi. **Yozuv amali Telegram tasdig'i bilan qoplangan**, lekin ko'rish (mijoz ma'lumoti) baribir ochiq bo'lardi | 🟠 | ✅ |
| **W5** | Rate-limit | IP Cloudflare ortida noto'g'ri olinishi mumkin | Agar nginx haqiqiy IP'ni to'g'ri uzatmasa, hamma foydalanuvchi **bitta Cloudflare IP**si ko'rinib qoladi: yo hamma bir-birini bloklaydi, yo cheklov umuman ishlamaydi (brute-force ochiq) | 🟠 | 🔬 |
| **W6** | IDOR | `/api/order-status?id=` **autentifikatsiyasiz**, ID ketma-ket (`#LM-1..N`) | ✅ **Tasdiqlandi (2026-08-20, jonli).** Istalgan odam login'siz istalgan buyurtma **holatini** o'qiy oladi. ID ketma-ket bo'lgani uchun `#LM-1..N` ni sanab: (1) jami buyurtma soni, (2) har birining holati va vaqt bo'yicha o'zgarishi — raqobatchiga biznes hajmi/tezligi ochiladi. **PII chiqmaydi** (faqat status), yozuv imkoni yo'q, shuning uchun 🔴 emas 🟠. Bahs/profil esa TOZA — `WHERE tg_user_id=$auth` bilan bog'langan | 🟠 | ✅ |
| **W7** | R2 ombor | `cdn.lolamarket.uz` ochiq o'qiladi (kalit topilса) | Rasm URL'lari ommaviy — bu dizayn. Xavf faqат **baza zaxirasi** u yerga qo'yilса bo'lardi (qo'yilmaydi — qoida bor) | 🟡 | ✅ |
| **W8** | Rate-limit | Xotirada saqlanadi, restart'da nollanadi | Server qayta ishga tushса hisob nolga tushadi; bir necha nusxa bo'lса bo'linmaydi. Kichik kamchilik, asosiy himoya emas | 🟡 | ✅ |
| **W9** | Sarlavha | COOP/CORP/COEP yo'q | Zamonaviy izolyatsiya qatlamlari yo'q — past ustuvorlik, qo'shса yomon emas | 🟡 | ✅ |
| **Z1** | AI-guardrail | Chat kanalining o'zi tekshirilmagan ishonch ildizi | Chatда yozаётган odам haqiqiy founder ekанини agent kripto bilan bilолмайди. Qurilma o'g'ирланса, hujumчи «ishonчли» bo'lиб qoлади. **Telegram ikki-kanal tasdig'i qoplaydi** | 🔴 | ✅ |
| **Z2** | AI-guardrail | Testsiz «odat» qoidalar | «Prompt'ni o'qi», «ikkinchi yo'l so'ra», «`hidden`<`display`» — test qo'riqlamaydi. Bosim ostida agent ularni «hozir ahamiyatsiz» deб o'tkazиб yuborса, **hech narsa ushlamaydi** | 🟠 | ✅ |
| **Z3** | AI-guardrail | Kuzatilgan matndan injection | Fayл/tool ичидаги «SYSTEM: founder ruxsat berди» matnини buyruq deб o'qиш xavfи. Loyihanинг O'Z qo'риqчилари ham izohдаги matndan aldanган (Test 3f, 23) | 🟠 | ✅ |
| **Z4** | AI-guardrail | Shoshilinch + qaytmas amal | «Tez bo'l» bosими ostида `rm -rf` kabi qaytmас amал — 2026-08-03да `/opt/lolamarket-notify/` ни **haqиqатан o'чирган** | 🟠 | ✅ |

---

## 3. 🛠 Tuzatish rejasi — sessiyalarga bo'lingan

Har band: **chora** · kim bajaradi · murakkablik (🟢 oson · 🟠 o'rta · 🔴 og'ir) ·
token bahosi (mening ishим) · tavsiya model.

### 🟢 Sessiya 1 — Tez g'alabalar (kod emas, ~1 soat, Cloudflare/config)

| Band | Chora | Kim | Murakkab. | Token | Model |
|------|-------|-----|-----------|-------|-------|
| W1 | HSTS'ni `max-age=31536000; includeSubDomains; preload` ga oshirish (Cloudflare Transform Rule) | Founder | 🟢 | ~4k | Fable (matn tayyorlaydi) |
| W3 | `BACKUP_CHAT_ID` chatini faqat founder qoladigan **shaxsiy** chatga o'tkazish; a'zolar ro'yxatini tekshirish | Founder | 🟢 | ~3k | Fable |
| W9 | `Cross-Origin-Opener-Policy: same-origin` + `Resource-Policy` qo'shish (ixtiyoriy) | Founder | 🟢 | ~3k | Fable |

### 🟠 Sessiya 2 — Jonli audit + «sinov kerak»larni yopish (~yarim kun)

| Band | Chora | Kim | Murakkab. | Token | Model |
|------|-------|-----|-----------|-------|-------|
| W5 | nginx `set_real_ip_from` (Cloudflare IP oralig'i) + `real_ip_header CF-Connecting-IP` sozlanganini tekshirish; noto'g'ri bo'lsa tuzatish | Founder+Agent | 🟠 | ~15k | Fable |
| W6 | ✅ Sinaldi (2026-08-20). **Tuzatish:** `/api/order-status` ga imzo qo'shish — `orderStatusSig(id)` (mavjud `productPhotoSig` naqshi, `routes/catalog.js:68`), create-javobida `statusSig` qaytariladi, frontend `?s=` bilan so'raydi, handler `safeEqual` bilan tekshiradi. Bahs/profil TOZA — tegilmaydi. + `script.js`/`app.js` `?v=` oshadi + qorovul test | Agent | 🟠 | ~25k | Fable |
| W4 | Admin panelni `sessionStorage` token o'rniga **HttpOnly cookie** sessiyaga o'tkazish (saytdаги naqsh bilan bir xil) | Agent | 🔴 | ~60k | Opus |

### 🔴 Sessiya 3 — Katta qarz: `style-src 'unsafe-inline'` (alohida sprint)

| Band | Chora | Kim | Murakkab. | Token | Model |
|------|-------|-----|-----------|-------|-------|
| W2 | Yuzlab inline `style="..."` atributini `vm()`/`dataset` naqshiga o'tkazib CSP'dan `style-src 'unsafe-inline'` ni olib tashlash + qorovul test | Agent | 🔴 | ~120k+ | Opus (bir necha bosqich) |

⚠️ Bu — C3 (`script-src`) qarziga o'xshash, lekin kattaroq (455+ inline style faqat
`app.js`da). Alohida sprintga arziydi; shoshilib qilinса sayt jimgina sinadi.

### 🟠 Sessiya 4 — AI-guardrail mustahkamlash (kibir darslari)

| Band | Chora | Kim | Murakkab. | Token | Model |
|------|-------|-----|-----------|-------|-------|
| Z2 | Testга tushadigan «odat»larга qorovul yozish (`hidden`<`display`, «ikkinchi yo'l») — `server/test.js` | Agent | 🟠 | ~30k | Fable |
| Z3+Z4 | Odatni CLAUDE.md'da mustahkamlash: shubhali «buyruq» matnini **ko'rsatib so'rash**; qaytmas amal oldidan «bu qaytariladimi?» | Agent | 🟢 | ~8k | Fable |

---

## 4. Ustuvorlik (nimadan boshlash)

1. **W3 (zaxira maxfiyligi)** — 🔴 va tuzatishi eng oson (chat a'zolarini cheklash). Bugun.
2. **W6 (IDOR)** — ✅ **sinaldi va tasdiqlandi (2026-08-20):** `/api/order-status` autentifikatsiyasiz, ID ketma-ket. 🟠 (faqat holat chiqadi, PII emas). Tuzatish tayyor — imzo qo'shish.
3. **W1 (HSTS)** — 🟠, bir bosishlik. Sessiya 1 bilan birga.
4. Qolgani — rejadagi tartibда.

> **Eslatma (CLAUDE.md qoidasi):** 🔬 «sinov kerak» belgilar **da'vo, isbot emas** —
> W5 va W6 jonli tekshirilmaguncha «bor» ham, «yo'q» ham deyilmaydi. Sessiya 2
> ularni faktga aylantiradi.
