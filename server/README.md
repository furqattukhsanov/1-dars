# LolaMarket Backend (`lolamarket-notify`)

Vanilla Node.js server (`http` + `pg`) — Telegram bot relay, katalog API, buyurtma API,
auth (Telegram initData imzosi) va admin moderatsiya.

## Muhim

- **Sirlar bu repoda YO'Q.** `BOT_TOKEN`, `DATABASE_URL`, `ADMIN_CHAT_ID`, `WEBHOOK_SECRET`,
  `ADMIN_TG_IDS` — hammasi faqat serverdagi `/opt/lolamarket-notify/.env` faylida (600, git'ga kirmaydi).
- Bu papka faqat **kod** — deploy paytida `.env` va `node_modules` tegilmaydi.

## Kod tuzilmasi (2026-07-29 dan beri)

Ilgari hammasi bitta `server.js` (2971 satr) edi. Endi:

```
server/
├── server.js       — FAQAT router: qaysi yo'l qaysi modulga
├── config.js       — env sirlari va biznes doimiylari
├── db.js           — umumiy pg pool
├── lib/            — domenga bog'liq bo'lmagan yordamchilar
│   ├── auth.js         — kim bu so'rov egasi (initData, admin token, sotuvchi roli)
│   ├── telegram-auth.js — initData imzosini tekshirish
│   ├── telegram-api.js — bot API (bot tokeni FAQAT shu yerda)
│   ├── http.js         — rate limit, cors, ok/fail, readBody
│   ├── format.js       — escapeHtml, money, sha256 …
│   ├── validate.js     — sxema validatori va ClientError
│   └── contacts.js     — telefon raqamlari fayl bazasi
└── routes/         — domen mantig'i
    ├── catalog.js, orders.js, seller.js, admin.js,
    ├── disputes.js, web-auth.js, seller-application.js
    └── webhook.js
```

Qatlamlar bir tomonga qaraydi: `routes/ → lib/ → config/db`. Domen modullari
bir-birini chaqirmaydi (`webhook.js` dan tashqari — u dispetcher).

## Server joylashuvi

- Server: Hetzner VPS `65.21.180.44`
- Yo'l: `/opt/lolamarket-notify/`
- Systemd servis: `lolamarket-notify`
- Nginx: `/api/*` → `127.0.0.1:3001` proxy

## Deploy

> ⚠️ **DIQQAT — 2026-07-29 dan keyin o'zgardi.** Kod endi bitta fayl emas.
> Faqat `server.js` ni ko'chirsangiz servis `MODULE_NOT_FOUND` bilan qulaydi
> va qayta ko'tarilmaydi. **Butun papkani** ko'chirish shart.

```bash
# 1. Backup — endi butun papka
ssh root@65.21.180.44 "cp -r /opt/lolamarket-notify /opt/lolamarket-notify.bak-$(date +%Y%m%d-%H%M%S)"

# 2. Lokal tekshiruv — lint (yo'qolgan import) + testlar (route jadvali)
cd server && npm test

# 3. Versiya faylini yozish — MAJBURIY.
#    Serverda git YO'Q, shuning uchun versiya shu faylga oldindan yoziladi.
#    Bu qadam tashlab ketilsa /api/version "unknown" qaytaradi va deploy
#    diagnozi ma'nosini yo'qotadi (2026-07-30 da aynan shu bo'ldi).
npm run version:write

# 4. Ko'chirish — BUTUN papka (.env, node_modules va logs tegilmaydi)
#
#    ⚠️ `--delete` repoda YO'Q hamma narsani o'chiradi. 2026-07-30 da shu
#    buyruq serverdagi `pg-backup.sh` va `.mcp-db-url` fayllarini o'chirib
#    yubordi (ular exclude ro'yxatida yo'q edi) — kunlik zaxira cron'i
#    ishlamay qolishiga bir qadam qolgandi. Serverda yashaydigan, repoda
#    bo'lmagan HAR BIR fayl shu ro'yxatda bo'lishi shart.
rsync -av --delete \
  --exclude='.env' --exclude='node_modules' --exclude='contacts.json' \
  --exclude='.mcp-db-url' --exclude='pg-backup.sh' \
  --exclude='*.bak-*' \
  server/ root@65.21.180.44:/opt/lolamarket-notify/

# 4b. Fayl egaligi — `chown -R` ISHLATMANG.
#     2026-07-30 da `chown -R www-data:www-data /opt/lolamarket-notify` berilgan
#     edi va u sirlarni ham qamrab oldi: .env, .mcp-db-url, pg-backup.sh
#     root:root 600/700 dan www-data'ga o'tdi. pg-backup.sh ni root cron
#     ishga tushirgani uchun bu root'gacha ko'tarilish yo'li ochardi.
#     Faqat kod fayllariga teging:
ssh root@65.21.180.44 "find /opt/lolamarket-notify -maxdepth 2 \
  \( -name '*.js' -o -name '*.json' -o -name 'version.txt' \) \
  -exec chown www-data:www-data {} +"

# 5. Qayta ishga tushirish
ssh root@65.21.180.44 "systemctl restart lolamarket-notify && systemctl is-active lolamarket-notify"

# 6. Serverda qaysi kod turganini tasdiqlash (git SHA)
curl -s https://lolamarket.uz/api/version

# 7. Log tekshiruvi
ssh root@65.21.180.44 "journalctl -u lolamarket-notify -n 20 --no-pager"
```

**Orqaga qaytarish** (5-qadam kutilmagan SHA bersa yoki servis ko'tarilmasa):

⚠️ **Bu buyruq 2026-08-05 da QAYTA YOZILDI — eski shakli production'ni
o'ldirishiga bir qadam qolgandi.** Eskisi shunday edi:

```bash
# ❌ ISHLATMANG — nima uchun ekani pastda
rm -rf /opt/lolamarket-notify && mv /opt/lolamarket-notify.bak-<sana> /opt/lolamarket-notify && ...
```

`rm -rf` BIRINCHI turadi. `mv` bajarilmasa — `<sana>` o'rniga haqiqiy sana
qo'yilmasa yoki nom xato bo'lsa — papka ALLAQACHON o'chgan bo'ladi va zanjir
`&&` da uziladi, ya'ni `systemctl restart` ham ishlamaydi. 2026-08-03 da aynan
shu bo'ldi: papka o'chdi, jarayon esa `rm -rf` dan o'lmagani uchun (ochiq fayl
deskriptorlari va xotiradagi kod bilan) ishlayverdi va nosozlik **~24 soat
ko'rinmadi**. Sayt sog'lom ko'rinardi, `/api/version` to'g'ri SHA qaytarardi.
Har qanday restart yoki reboot backendni butunlay o'ldirardi.

**To'g'ri shakl — avval almashtirishni QO'LGA KIRIT, keyin eskisini surib
qo'y (o'chirma):**

```bash
# 1. Zaxira nomini ANIQ ko'rish — namuna qoldirmang
ssh root@65.21.180.44 "ls -d /opt/lolamarket-notify.bak-*"

# 2. Qaytarish. `test -d` zaxira yo'q bo'lsa hech narsa qilmaydi;
#    jonli papka O'CHIRILMAYDI, faqat chetga suriladi.
BAK=/opt/lolamarket-notify.bak-20260803-042350   # ← aniq nom qo'ying
ssh root@65.21.180.44 "test -d $BAK \
  && mv /opt/lolamarket-notify /opt/lolamarket-notify.broken-\$(date +%s) \
  && mv $BAK /opt/lolamarket-notify \
  && systemctl restart lolamarket-notify && systemctl is-active lolamarket-notify"

# 3. Tasdiqlash — jarayon papkadan ko'tarilganini ko'rish.
#    `(deleted)` yozuvi CHIQMASLIGI kerak.
ssh root@65.21.180.44 'ls -l /proc/$(systemctl show lolamarket-notify -p MainPID --value)/cwd'
```

`/proc/PID/cwd` tekshiruvi bejiz emas: 2026-08-03 dagi holatni tashqi belgilar
(`/api/products`, `/api/version`, `systemctl is-active`) UMUMAN ko'rsatmagan —
faqat shu yo'l `(deleted)` deb turgandi. Endi buni `lib/self-check.js` soatiga
bir marta o'zi tekshiradi va Telegram'ga yozadi, lekin deploydan keyin qo'lda
ko'rish ham arzon.

## nginx: `/api` yo'llari (⚠️ 2026-07-29 da muammo topildi)

**Muammo:** nginx'da har bir `/api/...` yo'li ALOHIDA `location` bloki bilan
yozilgan. Router'ga yangi endpoint qo'shilsa-yu nginx'ga qo'shilmasa — so'rov
serverga umuman yetib bormaydi. nginx o'rniga `index.html` ni qaytaradi va
**HTTP 200** beradi.

Ya'ni nosozlik "muvaffaqiyat" niqobi ostida keladi: brauzer xato ko'rsatmaydi,
javob shunchaki JSON emas, HTML bo'ladi. `/api/version` bilan aynan shu bo'ldi —
kod yozilgan, testdan o'tgan, deploy qilingan, lekin **ishlamagan**.

**Yechim (2026-07-30 da qo'llandi) — umumiy blok QO'SHILADI, eskilari
o'chirilmaydi.** nginx eng uzun mos prefiksni tanlaydi, shuning uchun mavjud
`location /api/orders` kabi aniq bloklar baribir ustun turadi — ularning
xatti-harakati zarracha o'zgarmaydi. Yangi blok faqat hech qaysi blokka
tushmagan yo'llarni ushlaydi:

```nginx
# /etc/nginx/sites-available/lolamarket
# Mavjud /api bloklaridan KEYIN, static (location /) blokidan OLDIN
location ^~ /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;   # rate limit shunga tayanadi
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 30s;
}
```

Shundan keyin **yangi endpoint uchun nginx tahriri boshqa kerak bo'lmaydi**.

> `X-Real-IP` qatorini tushirib qoldirmang — usiz barcha foydalanuvchi server
> uchun `127.0.0.1` bo'lib ko'rinadi va rate limit hammani birga bloklaydi.
>
> `^~` — statik fayllar uchun regex `location` bo'lsa, u `/api/` yo'llarini
> tortib olmasligi uchun.

Qo'llash:

```bash
sudo cp /etc/nginx/sites-available/lolamarket /etc/nginx/sites-available/lolamarket.bak-$(date +%Y%m%d-%H%M%S)
sudo nano /etc/nginx/sites-available/lolamarket   # yuqoridagi blokni QO'SHING (eskilarini o'chirmang)
sudo nginx -t                                     # sintaksis tekshiruvi
sudo systemctl reload nginx
```

### Tekshirish

```bash
cd server && npm run check:live
```

Bu skript router'dagi **har bir** yo'lni production'da sinaydi va serverga
yetib bormaganini ko'rsatadi. Yashil bo'lsa — nginx to'g'ri sozlangan.

## Serverdagi fayl egaligi

Hozirgi holat (2026-07-30 dagi tozalashdan keyin):

| Fayl | Egasi | Ruxsat | Izoh |
|---|---|---|---|
| `.env` | `root:root` | 600 | systemd `EnvironmentFile` sifatida PID1/root o'qiydi — ilova emas |
| `.mcp-db-url` | `root:root` | 600 | Baza ulanish satri; servisga kerak emas |
| `pg-backup.sh` | `root:root` | 700 | Root cron ishga tushiradi — www-data yozsa root'gacha ko'tarilish yo'li ochiladi |
| `*.js`, `*.json`, `version.txt` | `www-data` | 644 | Servis o'qishi shart |
| `contacts.json` | `www-data` | 600 | Servis YOZADI |

**Qoida: `chown -R` hech qachon ishlatilmasin** — u sirlarni ham qamrab oladi.

**Keyinroq qilinadigan qattiqlashtirish** (shoshilinch emas): kod fayllari ham
`root:root 644` bo'lishi mumkin edi — shunda servis buzilsa ham o'z kodini
qayta yoza olmaydi (persistence yo'li yopiladi). Faqat `contacts.json` va
`version.txt` www-data uchun ochiq qolishi kerak. Hozirgi holatda kod
www-data'ga tegishli, ya'ni bu himoya hali yo'q.

## Env o'zgaruvchilari (`.env` serverda)

| Nom | Tavsif |
|---|---|
| `BOT_TOKEN` | Telegram bot tokeni |
| `ADMIN_CHAT_ID` | Buyurtma bildirishnomasi keladigan chat |
| `ADMIN_TG_IDS` | Vergul bilan ajratilgan admin Telegram ID'lari (moderatsiya ruxsati) |
| `DATABASE_URL` | PostgreSQL ulanish satri |
| `WEBHOOK_SECRET` | Telegram webhook maxfiy tokeni |
| `ALLOWED_ORIGIN` | CORS origin (default `https://lolamarket.uz`) |
| `MINI_APP_URL` | Mini App URL |
| `BOT_USERNAME` | Saytdagi "Telegram orqali kirish" deep-link'i uchun bot nomi, `@`siz (default `lolamarketbot`) |
| `ADMIN_PANEL_TOKEN` | `admin/index.html` kirish kaliti (`X-Admin-Token` header) — Telegram initData'dan mustaqil, alohida sir. Dalil rasmlari havolasini imzolash uchun ham ishlatiladi |
| `PREPAY_RATE` | Oldindan to'lov ulushi (default `0.5`) |
| `COMMISSION_RATE` | Platforma komissiyasi, 0..1 oralig'ida (default `0.12`). Buyurtma yaratilganda `orders.commission_rate` ga snapshot qilinadi |
| `ALERT_CHAT_ID` | Server xatosi alertlari boradigan chat (default — `ADMIN_CHAT_ID`). Alohida chat tavsiya etiladi: alert oqimi buyurtma xabarlarini ko'mib yubormasin |
| `AI_PROVIDER` | `gemini` yoki `openai`. Bo'sh yoki noma'lum bo'lsa AI funksiyasi o'chadi |
| `AI_API_KEY` | AI provayderi kaliti. Shakli tekshiriladi (`<key>` namunasi qolib ketsa o'chadi) |
| `AI_IMAGE_MODEL` | **Rasm** modeli (default `gemini-2.5-flash-image`). Ataylab `.env` da: model nomi tez o'zgaradi va buning uchun deploy kutilmasin |
| `AI_IMAGE_CHAT_ID` | Generatsiya qilingan rasm yuboriladigan chat — undan `file_id` olinadi (default — `ADMIN_CHAT_ID`). Alohida chat tavsiya etiladi |
| `AI_DAILY_LIMIT` | ⚠️ **ESKIRDI** (2026-08-07) — gating LOLA CREDIT ga o'tdi. Qiymat o'qiladi, lekin HECH QAYERDA ishlatilmaydi |
| `AI_CREDITS_START` | Har bir foydalanuvchiga beriladigan boshlang'ich Lola credit (default `20`). Balans BIRINCHI so'rovda o'zi tug'iladi — alohida "berish" qadami yo'q |
| `AI_CREDIT_COST` | Bitta rasm nechta creditga tushadi (default `2`). Narx boshlang'ich qoldiqdan katta bo'lsa jurnalda qichqiradi — hech kim rasm chiza olmasdi |
| `AI_UNLIMITED_TG_IDS` | Cheksiz generatsiya huquqi — vergul bilan ajratilgan Telegram ID lar. ⚠️ `ADMIN_TG_IDS` dan **ATAYLAB alohida**: admin ro'yxati moderatsiya haqida, bu esa PULGA tegadi. Sarf baribir yoziladi (`ai_credits.spent`) |

**Lola credit qanday ishlaydi (2026-08-07):** balans `ai_credits` jadvalida,
atomik yechiladi (`decrementStock` naqshi). Kunlik limitdan farqi TUSHUNCHADA —
u QOLDIQ va o'zi tiklanmaydi, shuning uchun UI da "ertaga yangilanadi" degan
xabar YO'Q (u yolg'on bo'lardi). Keshdan o'qish credit YEMAYDI: AI chaqiruvi
bo'lmagan joyda to'lanadigan narsa ham yo'q.

⚠️ **Rasm faqat `AI_PROVIDER=gemini` da ishlaydi** — OpenAI rasm yo'li
YOZILMAGAN. `openai` tanlansa matn ishlaydi, rasm tugmasi esa umuman
chizilmaydi (`/api/auth/telegram` javobidagi `aiImageEnabled: false`).

### ⚠️ nginx: rasm so'rovi 30 soniyaga sig'maydi

Umumiy `location ^~ /api/` blokida `proxy_read_timeout 30s` turibdi. Matn
so'rovi uchun bu yetarli, **rasm generatsiyasi esa undan uzoq ketishi
mumkin** — o'shanda nginx ulanishni uzadi va foydalanuvchi 504 ko'radi,
holbuki server hamon ishlab turgan bo'ladi va **kvota allaqachon
sarflangan** bo'ladi (limit AI chaqiruvidan oldin olinadi).

Shuning uchun rasm yo'liga alohida blok kerak — umumiy blokdan OLDIN
(nginx eng uzun mos prefiksni tanlaydi):

```nginx
location = /api/ai/image {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 180s;   # rasm generatsiyasi matndan sekin
}
```

⚠️ **Cloudflare ham o'z chegarasini qo'yadi** (bepul tarifda ~100 s).
Ya'ni nginx'ni 180 s ga ko'tarish yetarli bo'lmasligi mumkin — o'shanda
javob Cloudflare tomonidan uziladi. Buni TAXMIN qilmasdan o'lchash kerak:
birinchi haqiqiy generatsiyada javob vaqti yozib olinsin.

## Xato monitoringi (2026-08-03)

Sentry o'rniga: server xatosi Telegram'ga xabar bo'lib boradi (`lib/alert.js`).
Tashqi akkaunt kerak emas — bot relayi allaqachon ishlab turibdi.

**Ushlash bitta joyda — `console.error` ning o'zida.** Kodda 66 ta `console.error`
bor; ularning har birini alohida tahrirlash 66 ta regress imkoniyati bo'lardi va
kelajakda yangi `console.error` yozgan odam alert qo'shishni unutardi. Endi har
qanday yangi xato yozuvi avtomatik alertga aylanadi.

Ikki qatlamli tom bilan: bir xil xato 10 daqiqada bir marta, jami soatiga 20 ta.
Bosilgan takrorlar SANALADI va keyingi xabarda ko'rsatiladi — ya'ni yo'qolmaydi.
Ikkinchi tom baza qulagan holat uchun: o'shanda har bir so'rov boshqacha matnli
xato beradi va birinchi filtr ularni bir guruh deb ko'rmaydi.

`install()` FAQAT `require.main === module` shohbasida chaqiriladi — testlar
`console.error` ni o'zi ushlaydi (`test.js` → `testNoBrokenReferences`).

⚠️ **Alert chatida xato tafsiloti bo'ladi**, unda foydalanuvchi matni uchrashi
mumkin (buyurtma izohi, manzil). Zaxira nusxa chati bilan bir xil ehtiyot:
chatda begona odam paydo bo'lsa alohida yopiq kanal ochilsin.

## Sprint 7 deploy qadamlari (2026-07-27)

Odatdagi `server.js` deploy'idan tashqari uch narsa kerak. **Tartib muhim:**
avval migratsiya, keyin kod — aks holda yangi kod hali mavjud bo'lmagan
ustunlarga murojaat qiladi.

```bash
# 1. Baza migratsiyasi (idempotent — qayta ishga tushsa xatosiz o'tadi)
scp db/005_sprint7_admin.sql root@65.21.180.44:/tmp/
ssh root@65.21.180.44 "sudo -u postgres psql -d lolamarket -f /tmp/005_sprint7_admin.sql"

# 004 hali qo'llanilmagan bo'lsa avval o'sha (2026-07-25 insidenti):
#   scp db/004_seller_applications.sql root@65.21.180.44:/tmp/
#   ssh ... "sudo -u postgres psql -d lolamarket -f /tmp/004_seller_applications.sql"

# 2. Jadval egaligi — 004 da bo'lgani kabi, yangi jadval `lola` user'ga tegishli bo'lsin
ssh root@65.21.180.44 "sudo -u postgres psql -d lolamarket -c \
  'ALTER TABLE admin_actions OWNER TO lola; \
   ALTER SEQUENCE admin_actions_id_seq OWNER TO lola; \
   GRANT SELECT ON admin_actions TO lola_ro;'"

# 3. COMMISSION_RATE ni .env ga qo'shish (yozilmasa default 12% ishlatiladi)
#    ⚠️ Stavka 2026-08-02 da 0.10 dan 0.12 ga o'zgardi — `grep -q ... ||` faqat
#    QO'SHADI, mavjud qatorni yangilamaydi. Eski serverda qiymatni almashtirish
#    uchun quyidagi `sed` kerak (pastdagi "Komissiya stavkasini o'zgartirish").
ssh root@65.21.180.44 "grep -q COMMISSION_RATE /opt/lolamarket-notify/.env || \
  echo 'COMMISSION_RATE=0.12' >> /opt/lolamarket-notify/.env"

# 4. Kodni ko'chirish va restart (yuqoridagi odatdagi Deploy bo'limi)
```

### Komissiya stavkasini o'zgartirish

Stavka `.env` dagi `COMMISSION_RATE` bilan boshqariladi va **servis qayta
ishga tushgandan keyin** kuchga kiradi. Mavjud qatorni almashtirish kerak —
yuqoridagi `grep -q ... ||` faqat qator umuman bo'lmasa qo'shadi:

```bash
ssh root@65.21.180.44 "cd /opt/lolamarket-notify && cp .env .env.bak-\$(date +%Y%m%d-%H%M%S) && \
  if grep -q '^COMMISSION_RATE=' .env; then sed -i 's|^COMMISSION_RATE=.*|COMMISSION_RATE=0.12|' .env; \
  else echo 'COMMISSION_RATE=0.12' >> .env; fi && grep COMMISSION_RATE .env"
ssh root@65.21.180.44 "systemctl restart lolamarket-notify && systemctl is-active lolamarket-notify"
```

⚠️ **`.env` o'zgarishi faqat YANGI buyurtmalarga ta'sir qiladi.** Stavka
`orders.commission_rate` ga buyurtma yaratilgan paytda snapshot qilinadi, ya'ni
bazadagi mavjud qatorlar servis restartidan keyin ham eski stavkada qoladi.

Mavjud buyurtmalarni ham yangi stavkaga o'tkazish kerak bo'lsa — bu ALOHIDA
migratsiya, `.env` o'zi buni qilmaydi. 2026-08-02 da aynan shunday qilindi:
`db/013_commission_12.sql` barcha buyurtmalarni 12% ga qayta hisobladi
(founder qarori — bazada bitta yagona stavka bo'lsin). Ya'ni snapshot
"o'zgarmas" degani emas, "o'z-o'zidan o'zgarmaydi" degani; retroaktiv
o'zgartirish ongli qaror bilan, zaxira jadval va tekshiruv bilan qilinadi
(013 faylining sarlavhasidagi izohga qarang, jumladan to'langan buyurtmalar
bo'yicha buxgalteriya ogohlantirishi).

### Nginx — yangi proxy bloklari

`/etc/nginx/sites-available/lolamarket` faylida quyidagi yo'llar backend'ga
o'tishi kerak. **Nginx konfiguratsiyasi CI/CD tomonidan boshqarilmaydi** —
qo'lda qo'shiladi (`.bak` nusxa oling, `nginx -t` bilan tekshiring, keyin `reload`):

- `/api/admin/action`
- `/api/admin/disputes`
- `/api/admin/dispute-photo`
- `/api/disputes`
- `/api/seller/dispute`

`/api/admin/` va `/api/seller/` prefiks bloklari allaqachon bo'lsa, birinchi
uchtasi va oxirgisi avtomatik qamraladi — faqat `/api/disputes` alohida kerak.

### Deploydan keyin tekshirish

```bash
# Token bilan summary ishlayaptimi (yangi maydonlar bilan)
curl -s -H "X-Admin-Token: <token>" https://lolamarket.uz/api/admin/summary | head -c 400

# Bahslar endpointi (bo'sh massiv qaytishi normal)
curl -s -H "X-Admin-Token: <token>" https://lolamarket.uz/api/admin/disputes

# Tokensiz 401 bo'lishi shart
curl -s -o /dev/null -w '%{http_code}\n' https://lolamarket.uz/api/admin/disputes
```

Keyin panelda bitta arizani tasdiqlashga urinib ko'ring — Telegram'da tugmali
xabar kelishi va bosilgandan keyin panel "bajarildi" deb ko'rsatishi kerak.

## Saytda Telegram orqali kirish deploy qadamlari (2026-07-29)

**Tartib muhim:** avval migratsiya, keyin kod.

```bash
# 1. Baza migratsiyasi (idempotent)
scp db/007_web_auth.sql root@65.21.180.44:/tmp/
ssh root@65.21.180.44 "sudo -u postgres psql -d lolamarket -f /tmp/007_web_auth.sql"

# 2. Jadval egaligi — yangi jadvallar `lola` user'ga tegishli bo'lsin
ssh root@65.21.180.44 "sudo -u postgres psql -d lolamarket -c \
  'ALTER TABLE web_login_codes OWNER TO lola; \
   ALTER TABLE web_sessions OWNER TO lola;'"

# 3. BOT_USERNAME ni .env ga qo'shish (yozilmasa default `lolamarketbot`)
ssh root@65.21.180.44 "grep -q BOT_USERNAME /opt/lolamarket-notify/.env || \
  echo 'BOT_USERNAME=lolamarketbot' >> /opt/lolamarket-notify/.env"

# 4. Kodni ko'chirish va restart (yuqoridagi odatdagi Deploy bo'limi)
```

### Nginx — yangi proxy yo'llari

- `/api/auth/web/start`, `/api/auth/web/poll`, `/api/auth/web/me`, `/api/auth/web/logout`
  (`/api/auth/` prefiks bloki bo'lsa — avtomatik qamraladi)
- `/api/web/orders` — **alohida kerak**, `/api/web-orders` bloki buni qamramaydi

Proxy blokida `Set-Cookie` va `Cookie` header'lari o'tishi shart (nginx buni
standart holatda o'zi qiladi — `proxy_hide_header Set-Cookie` YOZILMASIN).

### Deploydan keyin tekshirish

```bash
# Kod yaratiladimi (JSON'da code, verifier, url bo'lishi kerak)
curl -s -X POST https://lolamarket.uz/api/auth/web/start

# Sessiyasiz "user": null qaytishi normal
curl -s https://lolamarket.uz/api/auth/web/me

# Sessiyasiz buyurtmalar 401 bo'lishi shart
curl -s -o /dev/null -w '%{http_code}\n' https://lolamarket.uz/api/web/orders
```

Keyin saytda "Kirish" tugmasini bosing — Telegram ochilib "Boshlash" bosilgandan
keyin sahifa o'zi profilingizga o'tishi kerak.
