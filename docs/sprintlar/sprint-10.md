# Sprint 10 — AI kiyim RASMI (Dars 17)

**Holat:** tugadi
**Sana:** rejalashtirildi 2026-08-06 (founder bilan savol-javob orqali),
matn qismi 2026-08-06 da chiqdi va RAD ETILDI,
**rasm qismi 2026-08-07 da tugadi va production'da tasdiqlandi**,
2026-08-08 da production'dan kelgan uch nosozlik yopildi (sprint ochilmadi)

## YOPILDI (2026-08-07)

Sprint `jarayonda` da turgan yagona sabab — rasm varianti billing'ga bog'liq
edi. Founder billing'ni to'ladi va **shart bajarildi**: «billing yoqdim»
dalil deb QABUL QILINMADI — serverdan jonli kalit bilan haqiqiy so'rov
yuborildi va `429` / `limit: 0` **yo'qolgani KO'RILDI**. Bu aynan shu faylda
2026-08-06 da oldindan yozib qo'yilgan talab edi va u ishladi.

Production'da **2 ta haqiqiy rasm chizildi** va manba mato bilan
solishtirildi: rang va naqsh **KO'CHIRILGAN**, o'ylab topilmagan — ya'ni
1-qarorni bekor qilishga asos bo'lgan da'vo ("image-to-image naqshni
ko'chiradi") endi tekshirilgan da'vo.

⚠️ **Matn g'oyalari BUTUNLAY olib tashlandi** (founder: "matn ai umuman
kerak emas, faqat rasm qolsin"). Pastdagi matn bo'limlari TARIX uchun
qoldirildi — o'chirilmadi, chunki rasm yo'li o'sha qarorlarning butun
qorovul qatlamini (imzo, kesh + `sourceHash`, atomik limit, oq ro'yxat)
meros qilib oldi va ular nega shunday ekanini faqat o'sha matn tushuntiradi.

⚠️ **Sprintning ASOSIY darsi:** «tugadi» ikki marta yozildi va ikkalasi ham
boshqa narsa haqida edi. 2026-08-06 da kod tugadi, maqsad tegmadi;
2026-08-07 da maqsad tegdi. Oradagi farqni test emas, **founderning qo'lidagi
sinov** ko'rsatdi.

Kod yozildi, testlar yashil va endpoint production'da tirik. Yopilish mezoni
(founder sinab, sifatni QO'LDA baholashi) ham **BAJARILDI** — founder
2026-08-06 da sinab ko'rdi. Natija: **funksiya RAD ETILDI.**

⚠️ **Aniqlik uchun:** mezonda "10 xil matoda" deb yozilgandi, amalda 10 tasini
sanab chiqish KERAK BO'LMADI. Sabab shunda: rad etish **sifat** darajasida
emas («g'oyalar bo'sh chiqdi»), **maqsad** darajasida bo'ldi («matn umuman
kerak emas»). Bunday hukmda o'nta takror hech narsani o'zgartirmasdi —
mezon o'z vazifasini birinchi sinovdayoq bajardi.

> "menga umuman matn kerak emas, menga faqat rasm generatsiya qilib berishi
> kerak" — founder, 2026-08-06

Ya'ni sprint texnik jihatdan bajarildi, **maqsad jihatidan mo'ljalga
tegmadi**. Bu nuqson emas, sinovning ISHLAGANI: shu fayl boshidanoq
"testlar o'tishi AI **ma'noli** yozganini umuman isbotlamaydi, u faqat javob
SHAKLI to'g'riligini isbotlaydi" deb yozgan edi. Aynan shunday bo'ldi —
o'nta mutatsiyadan omon qolgan testlar funksiya kerakligini isbotlay olmadi.

**Nima bo'ladi:** matn tugmasi production'da QOLDIRILDI (founder qarori
2026-08-06 — o'chirish yoki yashirish kerak emas). Rasm varianti alohida
ishga o'tdi va u **billing'ga bog'liq** (pastdagi "Rasm varianti" bo'limiga
qara). Sprint rasm ishlagan kuni yopiladi.

⚠️ **1-qaror (rasm rad etilgani) bekor qilindi.** Uning sababi "AI matoning
haqiqiy rangi va naqshini chizmaydi" edi. Founder ko'rsatgan misol boshqa
usulni ochdi: rasm MATNDAN emas, **mahsulot suratidan** chiqariladi
(image-to-image), ya'ni naqsh o'ylab topilmaydi, ko'chiriladi. Eski e'tiroz
shu bilan asosan yopiladi — lekin butunlay emas: mato haqiqiy bo'lsa ham,
rasmda **mavjud bo'lmagan buyum** ko'rinadi, shuning uchun ostiga
"AI tasavvuri — haqiqiy mahsulot emas" yorlig'i SHART.

## Rasm varianti — ~~BLOKLANGAN~~ **YOPILDI (2026-08-07)**

⚠️ Quyidagi blok 2026-08-06 dagi holatni tasvirlaydi va **2026-08-07 da
yopildi** — matn tarix uchun qoldirildi, chunki to'siqning nima bo'lgani va
uni qanday tekshirganimiz kelajakda yana kerak bo'ladi. Bugungi holat pastdagi
"RASM QISMI — DEPLOY DALILI (2026-08-07)" bo'limida.

**Hajmi (founder qarori):** bitta mahsulotga **BITTA rasm** — hozircha shu.
"Bir nechta variant" yoki "har g'oyaga alohida rasm" MVP ga kirmaydi.
Usuli — **image-to-image**: manba mahsulotning O'Z surati, natija esa o'sha
matodan tikilgan buyum kiygan model (studiya fotosi uslubida).

⚠️ Rasm ostida **"AI tasavvuri — haqiqiy mahsulot emas"** yorlig'i SHART.
Sabab yuqorida: naqsh ko'chirilgani bilan **buyumning o'zi mavjud emas**.

**To'siq pul, kod emas.** Gemini bepul tarifida rasm modellari uchun kvota
**`limit: 0`** — `gemini-3.1-flash-image` ham, `gemini-2.5-flash-image` ham
birinchi so'rovdayoq HTTP 429 qaytardi. O'sha kalitda MATN modeli bemalol
ishlayveradi (HTTP 200), ya'ni farq aynan tarifda.

⚠️ **Xato xabari yo'ldan ozdiradi:** u "Please retry in 27s" deydi, holbuki
chegara nol — kutish HECH QACHON yordam bermaydi. Bu shu loyihaning
"jimgina yolg'on" oilasidagi tashqi namuna: xabar to'g'ri ko'rinadi va
noto'g'ri yo'lga boshlaydi.

Yechim: kalit turgan Google loyihasida billing yoqilishi (~$0.04/rasm,
12 mahsulot ≈ $0.50, bir marta). Founder: "pulim bo'lganda qilamiz".

⚠️ **Billing yoqilgan kuni AYNI sinov qaytarilsin** — serverdan jonli kalit
bilan rasm modeliga so'rov, va **429 / `limit: 0` yo'qolgani KO'RILSIN.**
"Billing yoqdim" o'zi dalil emas: bugun bloklanganini ham faqat haqiqiy
so'rov ko'rsatdi, taxmin emas.

**Qayta ishlatiladi (qaytadan yozilmasin):** imzo tekshiruvi, kesh +
`sourceHash`, ATOMIK kunlik limit, oq ro'yxat — hammasi `routes/ai.js` da
tayyor, faqat natija turi matndan rasmga o'zgaradi. Rasm saqlash uchun
tavsiya: Telegram `file_id` + mavjud `/api/product-photo` proksisi
(deploy'dan omon qoladi, loyihada allaqachon ishlaydigan naqsh).

✅ **Tavsiya AYNAN shunday bajarildi** — natija Telegram'da yashaydi, bazada
faqat `file_id` (`db/017`). Qayta ishlatish rejasi ham to'liq ishladi: imzo,
kesh + hash, atomik limit, oq ro'yxat — hech biri qaytadan yozilmadi.

---

## RASM QISMI (2026-08-07)

### Bajarilgan ishlar

#### Baza
- [x] `db/017_ai_image.sql` — `product_ai_image`: `file_id`, `source_hash`
      (mato matni **+ SURAT havolasi**), `model`, `created_at`.
      ⚠️ **`lang` ustuni ATAYLAB YO'Q** — 016 dan aynan shu bilan farq qiladi:
      rasmda matn yo'q, ya'ni ruscha va o'zbekcha uchun AYNI rasm ishlaydi.
      "Har ehtimolga" `lang` qo'shilsa kesh ikkiga bo'linib, bitta rasm uchun
      ikki marta to'lanardi
- [x] `db/018_ai_image_choices.sql` — `choices_hash` + `choices` (JSONB), PK
      `(product_id, choices_hash)` ga kengaydi. Eski qatorlar
      O'CHIRILMADI — ular allaqachon to'langan rasm

#### Backend
- [x] `server/lib/ai.js` — `generateImage()`, image-to-image (manba:
      mahsulotning O'Z surati), `IMAGE_CHOICES`, `choicesHash()`,
      `normalizeChoices()`, `extractImage()`
- [x] **Rasm uchun ALOHIDA chegara: 20 MB / 120 s.** Matn chegarasi
      (200 KB / qisqa timeout) qoldirilsa so'rov O'RTASIDA uzilardi va
      **kvota baribir sarflangan** bo'lardi — ya'ni pul ketib, natija
      kelmasdi. Bu Test 14g bilan qulflandi
- [x] `server/lib/telegram-api.js` — `sendPhotoBytes()` (multipart) va
      `tgDownloadFile()`
- [x] `server/routes/ai.js` — `POST /api/ai/image`: imzo → kesh → ATOMIK
      kunlik limit → manba surat → AI → Telegram → kesh
- [x] `GET /api/ai/gallery` — **FAQAT O'QISH.** Bu yerda hech narsa
      generatsiya qilinmaydi: galereya sahifasi ochilishi kvota sarflasa,
      bitta aylanish butun kunlik limitni yeb qo'yardi
- [x] `server/config.js` — `AI_IMAGE_MODEL`, `AI_IMAGE_CHAT_ID`,
      `AI_IMAGE_ENABLED`; hammasi SHAKLI bo'yicha tekshiriladi
      (`chatId()` / `aiKey()` namunasi)
- [x] `server/README.md` — `.env` jadvali va **nginx ogohlantirishi**:
      umumiy `/api/` blokida `proxy_read_timeout 30s`, rasm undan uzoq ketadi

#### Matn g'oyalari — OLIB TASHLANDI
- [x] `POST /api/ai/ideas`, `generateIdeas`, `parseIdeas`, provayder
      abstraksiyasi (OpenAI yo'li — **hech qachon sinalmagan edi**), UI,
      Test 14 / 14b / 14d
- [x] `product_ai_ideas` jadvali bazada **QOLDIRILDI** — o'chirish qaytarib
      bo'lmaydi, saqlab turish esa hech kimga zarar qilmaydi

#### Rasmdan oldin 3 ta savol (founder qarori)
- [x] «Nima tikilsin / Kim uchun / Qayerga». Ro'yxat **SERVERDA tug'iladi**
      (`IMAGE_CHOICES`), klient yuborgani oq ro'yxatdan o'tadi, yaroqsizi 400
- [x] Kesh kaliti — `mahsulot + javoblar`, **foydalanuvchi bo'yicha EMAS**
- [x] Promptda kiyinish odobi qat'iy: yopiq, lekin zamonaviy va chiroyli;
      model Markaziy Osiyo ko'rinishida

#### Frontend
- [x] **Bosh sahifa va katalog BIRLASHTIRILDI.** Bo'shagan tab o'rniga AI
      bo'limi (`renderAi`). Tartib: Katalog · Savat · Buyurtma · AI
- [x] Bosh sahifadagi filtr endi SHU sahifada ochiladi (ilgari u katalogga
      o'tkazardi — ya'ni filtr bosish sahifani almashtirardi)
- [x] AI bo'limi CSS: `.ai-chip`, `.ai-cta`, `.ai-figure`, tanlash
      hisoblagichi, kutish chizig'i
- [x] Kesh versiyalari: `app.js?v=62→70`, `styles.css?v=17→21`
      (Test 16 jadvali ham yangilandi)

#### Yo'l-yo'lakay topilgan JIMGINA nuqson
- [x] `--border-hair` tokeni `telegram-app/styles.css` da **UMUMAN
      aniqlanmagan** edi, `app.js` esa uni **31 joyda** ishlatadi
      (`var(--border-hair)`, sanaldi). Brauzerda o'lchandi: chegaralar
      `rgba(23,26,48,.08)` o'rniga `rgb(23,26,48)` bo'lib chiqardi —
      **~12 barobar to'q**, va bu BUTUN Mini App'ga ta'sir qilgan.
      Nuqson jimgina: xato yo'q, konsolda ham yo'q.
      Endi `styles.css:79` da aniqlangan

#### Testlar
- [x] **Test 14e** — rasm keshi suratga bog'langan (surat almashsa yaroqsiz)
- [x] **Test 14f** — rasm javobi qat'iy tekshiriladi
- [x] **Test 14g** — rasm chegaralari matndan ALOHIDA
- [x] **Test 14h** — kesh yozuv yo'li to'g'ri
- [x] **Test 14i** — javoblar oq ro'yxati qat'iy
- [x] **Test 14j** — frontend yorliqlari serverdagi kalitlarni **qoplaydi**
      (serverga kalit qo'shilib frontendda unutilsa test QIZIL)
- [x] Har biri **MUTATSIYA bilan** sinaldi — 7 mutatsiya, hammasi tutildi
- [x] Lint: **0 xato** (27 ogohlantirish — ular avvaldan bor)

---

## RASM QISMI — DEPLOY DALILI (2026-08-07)

### 1. Billing — TAXMIN emas, O'LCHOV

Founder billing'ni to'ladi. «Billing yoqdim» dalil deb qabul QILINMADI:
serverdan jonli kalit bilan rasm modeliga haqiqiy so'rov yuborildi va
**`429` / `limit: 0` yo'qolgani ko'rildi**. Bu talab 2026-08-06 da shu
faylga OLDINDAN yozib qo'yilgan edi — ya'ni tekshiruv eslab qolishga emas,
**hujjatga** tayandi.

### 2. Ikkita HAQIQIY rasm chizildi va manba bilan solishtirildi

Rang va naqsh **KO'CHIRILGAN**, o'ylab topilmagan. Bu 1-qarorni bekor
qilishga asos bo'lgan yagona da'vo edi va endi u tekshirilgan.
⚠️ E'tiroz butunlay yo'qolmaydi — **buyumning o'zi mavjud emas**, shuning
uchun "AI tasavvuri" yorlig'i qoladi.

### 3. Testlar — raqam SANALDI

**37 ta PASS** (`npm test`, to'liq chiqish o'qildi). Oldingi holat — 34.
Farq: matn testlaridan 3 tasi olib tashlandi (14, 14b, 14d), rasm uchun
6 tasi qo'shildi (14e…14j): `34 − 3 + 6 = 37`.

⚠️ **Sessiya davomida bu raqam «32 → 36» deb aytilgan edi va ikkala uchi ham
noto'g'ri.** Tuzatishning o'zi kichik, lekin naqsh aynan CLAUDE.md dagi
**"hujjatdagi raqam — tekshirilmagan da'vo"** qoidasi: raqam ikki mustaqil
usul bilan olindi — `grep -c "✅ Test "` = 37 va `npm test` chiqishidagi
qatorlar = 37.

---

## Maqsad

⚠️ **Bu — sprint BOSHIDAGI maqsad va u o'zgardi.** Quyidagisi bajarildi va
production'da turibdi, lekin founder qabul sinovida uni rad etdi. Bugungi
maqsad — **rasm** (tepadagi blok va "Rasm varianti" bo'limi). Eski matn
tarix uchun qoldirildi.

Mahsulot sahifasiga **"AI bilan g'oya olish"** tugmasi qo'shiladi. Bosilganda AI
o'sha matoning tarkibi, zichligi va turiga qarab **undan nima tikish mumkinligini**
yozib beradi, va har bir g'oyaga **LolaMarket katalogidagi haqiqiy qo'shimcha
mahsulotlarni** (astar, ip, tugma va h.k.) bog'laydi.

Sabab: xaridorning bosh savoli "bu mato yaxshimi?" emas, **"bu matodan menga
nima chiqadi va yana nima kerak bo'ladi?"**. Birinchi savolga reyting va sharh
javob beradi, ikkinchisiga hozir hech narsa javob bermaydi — xaridor o'zi
o'ylab topishi kerak. Ikkinchi javob savdoni ham oshiradi: g'oya yoniga
qo'shimcha mahsulot chiqsa, bitta buyurtma o'rniga to'plam buyurtma bo'ladi.

---

## Founder qarorlari (2026-08-06, savol-javob)

Har bir qaror savol-javob orqali ATAYLAB tanlangan. Muqobili va rad etilish
sababi ham yozilgan — keyin "nega bunday qilingan?" degan savol tug'ilmasin.

### 1. ~~Natija — matn g'oyalari + katalogdan tavsiya. Rasm YO'Q~~ — BEKOR QILINDI

⚠️ **Bu qaror 2026-08-06 da o'sha kunning O'ZIDA bekor qilindi** (tepadagi
blokka qara). Quyidagi matn TARIX sifatida qoldirildi — o'chirilmadi, chunki
rad etilish sababini bilmasdan turib qarorning nega ag'darilgani ham
tushunarsiz bo'lardi.

3–5 ta kiyim g'oyasi (nomi, nega bu mato mos, taxminiy sarf, qiyinlik) va har
g'oya yoniga katalogdan mos qo'shimcha mahsulotlar.

**Rasm generatsiyasi rad etildi.** Uchta sabab: qimmat (~$0.04/rasm), sekin
(~10–20 s) va — eng muhimi — **AI matoning haqiqiy rangi va naqshini
chizmaydi**. Xaridor rasmga qarab "shu mato shunday ko'rinar ekan" deb o'ylaydi,
holbuki rasm o'ylab topilgan. Bu loyihaning **"o'ylab topilgan raqam
ko'rsatilmasin"** qoidasining aynan vizual ko'rinishi bo'lardi va reyting
`NULL` qaroridan ham og'irroq yolg'on chiqarardi: raqamni odam shubha ostiga
oladi, rasmga esa ishonadi.

### 2. Xaridor bosadi — natija mahsulotga biriktiriladi, hamma ko'radi

Birinchi bosgan foydalanuvchi generatsiya qildiradi, natija `products` ga
bog'lanib saqlanadi va keyingi hamma **tekin va darrov** ko'radi.

Ya'ni AI xarajati **foydalanuvchi soniga emas, MAHSULOT soniga** bog'liq.
Bugungi katalogda bu — **12 ta so'rov**, bir marta. Foydalanuvchi soni o'ssa
xarajat o'smaydi.

⚠️ Bu yerda avval «85 mahsulot» deb yozilgan edi — **noto'g'ri**. 2026-08-06 da
ochiq API'dan tekshirildi: `status='published'` mahsulotlar soni **12**
(`silk` 3, `cotton` 3, `suzani` 2, `linen` 2, `ikat` 1, `wool` 1).

### 3. Kesh mahsulot MATNIGA bog'lanadi, vaqtga emas

Kesh qatorida generatsiya paytidagi mato tavsifining `sha256` i saqlanadi:
`name_uz | comp_uz | cat_key | width | weight`. O'qishda hash qayta hisoblanadi
va mos kelmasa kesh **yaroqsiz** deb qaraladi.

Sabab: mato tarkibi tahrirlansa (masalan "100% ipak" → "70% ipak, 30% paxta"),
eski tarkibga qarab yozilgan g'oyalar sahifada QOLIB KETARDI va buni hech kim
sezmasdi. Bu **"jimgina yolg'on yo'qlikdan yomonroq"** oilasidagi nuqson —
`NULL` reyting va `ALERT_CHAT_ID` darslari bilan bitta qatorda.

Vaqt bo'yicha eskirish (30 kun) rad etildi: **vaqt o'tishi tahrir bilan bog'liq
emas** — u muammoni hal qilmaydi, faqat kechiktiradi.

### 4. Limit — ro'yxatdan o'tgan foydalanuvchiga kuniga 10 ta

Faqat imzolangan `initData` orqali kim ekani aniq bo'lgan foydalanuvchi
generatsiya qildira oladi. Bu **"foydalanuvchi kimligi hech qachon brauzerdan
olinmaydi"** qoidasining to'g'ridan-to'g'ri qo'llanishi — klient yuborgan
`tg_user_id` ga ishonilmaydi.

10 ta tanlandi, chunki kesh borligi uchun limit faqat **YANGI** mahsulotlarga
sarflanadi: katalogni kezib yurgan xaridor allaqachon generatsiya qilingan
mahsulotlarda limitga umuman tegmaydi. Ya'ni 10 ta = kuniga 10 ta hali hech kim
so'ramagan mato — haqiqiy xaridor uchun yetib ortadi, bot uchun kam.

IP bo'yicha ochiq limit rad etildi: IP oson almashtiriladi va birinchi
kunning o'zida butun katalogni generatsiya qildirish mumkin bo'lardi.

### 5. AI hech qachon mahsulot O'YLAB TOPMAYDI — u faqat kategoriya aytadi

Eng nozik texnik qaror. AI javobida aniq mahsulot `id` si bo'lmaydi — u faqat
**kategoriya kaliti** qaytaradi (masalan `astar`, `ip`, `tugma`). Server o'sha
kalit bo'yicha bazadan **haqiqiy mavjud** mahsulotni tanlaydi.

Muqobil (butun katalogni promptga solib, AI aniq `id` tanlashi) rad etildi:
prompt kattayadi (har so'rovda 85 mahsulot) va AI mavjud bo'lmagan `id` o'ylab
topishi mumkin — ya'ni xaridor bosadigan, lekin ochilmaydigan havola paydo
bo'lardi. Bu qaror **arxitektura darajasida** kafolat beradi: modelni
"o'ylab topma" deb ishontirishga umuman tayanilmaydi.

⚠️ Kategoriya kalitlari server tomonda **oq ro'yxat** bilan tekshiriladi.
Ro'yxatda yo'q kalit jimgina tashlab yuboriladi, butun javob rad etilmaydi.

**Oq ro'yxat aynan nima — 2026-08-06 founder qarori.** Bugungi katalogda
astar/ip/tugma UMUMAN YO'Q (tekshirildi, pastdagi 2-savolga qara), shuning
uchun oq ro'yxat = bugungi **mato turlari**: `silk`, `ikat`, `suzani`,
`cotton`, `wool`, `linen`. AI "astar kerak" demaydi — u "bu g'oyaga
qo'shimcha mato: `cotton`" deydi va server katalogdan haqiqiy paxta matosini
tanlaydi. Ya'ni tavsiya **bugungi katalogda ishlaydi**, bo'sh chiqmaydi.

⚠️ Oq ro'yxat qo'lda yozilgan doimiy EMAS — u bazadagi mavjud `cat_key`
lardan olinadi. Sabab shu faylning o'z darsi (`db/014`): **bir xil ro'yxat
ikki joyda takrorlanmasin**. Katalogga aksessuar qo'shilgan kuni ro'yxat
o'zi kengayadi va kodga tegilmaydi.

### 6. AI javobi — qat'iy JSON, markdown EMAS

`[{ nom, izoh, sarf, qiyinlik, kerakli_kategoriyalar[] }]`. Server sxemani
tekshiradi; mos kelmasa javob rad etiladi va keshga YOZILMAYDI.

Markdown rad etildi va sabab jiddiy: markdown'ni HTML ga aylantirish degani
**AI chiqargan HTML `innerHTML` ga boradi** degani — bu CLAUDE.md taqiqlagan
aynan o'sha yo'l. JSON'da har maydon alohida chiziladi va har biri `esc()` dan
o'tadi.

### 7. Faqat o'zbekcha (MVP)

Ruscha keyingi sprintga. Kesh bitta ustun, prompt bitta, xarajat ikki barobar
kam. Ruscha qo'shilganda kesh kaliti `mahsulot + til` bo'ladi — bugundan
shunday loyihalanadi, lekin bugun ishlatilmaydi.

### 8. Provayder — kod bog'lanmaydi, SINALADIGANI esa **Gemini Flash**

Founder qarori: "keyin aniq qiladigan qilgin". Shuning uchun `server/lib/ai.js`
**abstraksiya** bo'lib yoziladi — `.env` dagi bitta o'zgaruvchi (`AI_PROVIDER`)
provayderni almashtiradi, chaqiruvchi kod esa qaysi model ishlayotganini
bilmaydi.

**2026-08-06 founder qarori: haqiqatan sinaladigan provayder — Gemini Flash**
(bepul kvota bor, 12 ta generatsiyada xarajat nolga yaqin). Ya'ni sprint
yopilishida yoziladigan javob oldindan ma'lum: **sinalgan — Gemini Flash,
OpenAI yo'li sinalmagan.** Uning JSON rejimi OpenAI'nikidan bo'shroq, shuning
uchun 6-qarordagi sxema tekshiruvi bu yerda bezak emas — **yagona qorovul**.

⚠️ Bu qarorning narxi ochiq yozilsin: **abstraksiya bepul emas.** Ikkita
provayderning JSON rejimi va xato formati har xil, ya'ni ikkalasi ham
sinalmaguncha "almashtirsa ishlaydi" degan da'vo TEKSHIRILMAGAN da'vo bo'lib
qoladi. Sprint yopilishida qaysi provayder haqiqatan sinalgani aniq yozilsin.

### 9. Kalit `.env` da, SHAKLI bo'yicha tekshiriladi

`config.js` da `AI_API_KEY` va `AI_PROVIDER` shakli tekshiriladi (`chatId()`
namunasidek). Kalit yo'q yoki namuna qolib ketgan bo'lsa — **tugma umuman
chizilmaydi** va jurnalda qichqiriladi.

Sabab to'g'ridan-to'g'ri `ALERT_CHAT_ID` darsidan: `.env` dagi
`AI_API_KEY=<key>` namunasi **bo'sh emas**, ya'ni `||` uni haqiqiy qiymat deb
qabul qiladi va funksiya jimgina o'lik turaverardi.

### 10. MVP da moderatsiya YO'Q — bu bilib qilingan tanlov

Founder qarori. AI bema'ni g'oya yozsa uni sahifadan olib tashlashning
UI yo'li birinchi versiyada bo'lmaydi.

⚠️ **Xavf ochiq yozilsin:** noto'g'ri natija sahifada qolib ketadi. Ikkita
zaxira yo'l bor va ikkalasi ham qo'lda: (a) mahsulotni tahrirlash — 3-qarordagi
hash o'zgaradi va kesh o'zi yaroqsiz bo'ladi; (b) baza qatorini o'chirish.
Admin panelda tugma qo'shilsa u CLAUDE.md bo'yicha **yozuv amali** bo'ladi,
ya'ni Telegram'da tasdiqlanishi va `admin_actions_kind_check` ga yangi tur
qo'shilishi shart (`db/014` darsi — ro'yxat yangilanmasa amal production'da
BUTUNLAY ishlamaydi).

### 11. Tugma joyi — tarkib/xususiyatlar ostida, sharhlardan tepada

Mantiqiy oqim: xaridor mato tavsifini o'qiydi → aynan shu yerda "bundan nima
tikilardi?" savoli tug'iladi. Sotib olish tugmasiga xalaqit bermaydi, sahifa
oxirida ko'milib ham qolmaydi.

### 12. Sprint hajmi — faqat AI funksiyasi

C3 (CSP `'unsafe-inline'` ni olib tashlash) bu sprintga KIRMAYDI, alohida
qoladi.

---

## Bajariladigan vazifalar

### Baza
- [x] `db/016_ai_ideas.sql` — `product_ai_ideas` jadvali:
      **PK `(product_id, lang)`**, `products` ga FK, `ideas` (JSONB),
      `source_hash` (TEXT), `model` (TEXT — qaysi model yozgani), `created_at`
- [x] `ai_usage` — kunlik limit hisobi: `tg_user_id`, `day` (DATE), `used` (INT),
      PK `(tg_user_id, day)`

⚠️ **Rejadan ATAYLAB chetlashildi — ikki joyda.** Ikkalasining sababi ham
migratsiya faylining izohida yozilgan, bu yerda faqat qisqacha:

1. **PK `(product_id, lang)`, faqat `product_id` emas.** Yuqoridagi ro'yxatda
   "`product_id` (PK)" deb yozilgandi, lekin shu faylning **7-qarori** aniq
   talab qiladi: "kesh kaliti `mahsulot + til` bo'ladi — BUGUNDAN shunday
   loyihalanadi". Ikkisidan qaror kuchliroq. Aks holda ruscha qo'shilgan kuni
   JONLI jadvalda PK o'zgartirish yoki tayyor keshni tashlab yuborish kerak
   bo'lardi.
2. **`ai_usage` kaliti `tg_user_id`, `users.id` EMAS.** `users` qatori faqat
   `/api/auth` chaqirilgandan keyin paydo bo'ladi; `users.id` ga FK qo'yilsa
   limitni oshirishdan oldin har safar upsert kerak bo'lardi — bitta atomik
   `INSERT ... ON CONFLICT` o'rniga ikkita yozuv va yana bitta poyga oynasi.

Migratsiyaning oxirida **PK tarkibini tekshiradigan `DO $$` bloki** bor:
"migratsiya o'tdi" degani jadval TO'G'RI degani emas.

### Backend
- [x] `server/config.js` — `AI_PROVIDER` va `AI_API_KEY` SHAKL bo'yicha
      tekshiruvi. Yaroqsiz bo'lsa funksiya o'chadi va jurnalda qichqiriladi
      (`chatId()` namunasi). ⚠️ Bu yerda `process.exit(1)` QILINMAYDI — AI
      ixtiyoriy funksiya, u bo'lmasa sayt ishlayveradi (farqi `ADMIN_CHAT_ID`
      dan shunda). **Kalitning O'ZI jurnalga yozilmaydi — faqat uzunligi**
- [x] `server/lib/ai.js` — provayderdan mustaqil qatlam: prompt yasash, JSON
      sxemani tekshirish, xatoni normallashtirish, `sourceHash`
- [x] `server/routes/ai.js` — `POST /api/ai/ideas`:
      1. `initData` imzosi tekshiriladi (klient `tg_user_id` iga ISHONILMAYDI)
      2. kesh o'qiladi, `source_hash` solishtiriladi — mos bo'lsa darrov qaytariladi
         (limitga TEGMAYDI)
      3. limit ATOMIK oshiriladi (pastdagi qorovulga qarang)
      4. AI chaqiriladi, JSON tekshiriladi
      5. kategoriya kalitlari oq ro'yxatdan o'tkaziladi → SQL bilan haqiqiy
         mahsulot topiladi
      6. kesh yoziladi
- [x] Kunlik limit **ATOMIK** bo'lsin — `UPDATE ... WHERE used < :limit RETURNING`
      naqshida, alohida `SELECT` + `UPDATE` ga BO'LINMASIN. Sabab
      `decrementStock` bilan AYNI: ikki so'rov bir vaqtda kelsa ikkalasi ham
      "hali limit tugamagan" deb o'qib o'tib ketardi.
      ⚠️ Kun **`Asia/Tashkent`** da hisoblanadi, `CURRENT_DATE` (UTC) da emas:
      foydalanuvchiga "Ertaga 00:00 da yangilanadi" deyiladi, UTC bo'lsa limit
      aslida mahalliy 05:00 da yangilanardi va xabar JIMGINA yolg'on bo'lardi
- [x] Xato yo'li: `console.error('aiIdeas xatosi:', e.message)` — belgi birinchi
      argumentda, o'zgaruvchan qism ikkinchisida (alert guruhlash kaliti)

### Frontend (Mini App)
- [x] `telegram-app/app.js` — `renderDetail()` ga tugma va natija bloki,
      tarkib/xususiyatlar ostida, sharhlardan tepada.
      **Aniq joy topildi (2026-08-06):** `${reviewsSection(p.id)}` chaqiruvidan
      bir qator TEPA (`telegram-app/app.js` ~1010-qator) — u ayni paytda
      xususiyatlar jadvali va miqdor blokidan keyin, sharhlardan oldin turadi,
      ya'ni 11-qaror talabini bitta joyga qo'yish bilan bajaradi
- [x] Hodisa **inline BO'LMASIN** — `data-action` delegatsiyasi orqali
      (C1/C2 shartnomasi: `data-action` / `data-arg` / `data-input`)
- [x] AI matni `vm()` dan O'TMAYDI (u mahsulot maydonlari uchun) — shuning uchun
      har bir maydon **chizish joyida** `esc()` bilan o'raladi
- [x] **Besh** holat chiziladi: tugma / yuklanmoqda / natija / xato / limit
      (rejada uchta yozilgandi — xato va limit ALOHIDA chiqadi, chunki
      foydalanuvchi uchun ular boshqa-boshqa ish talab qiladi)
- [x] `index.html` da `app.js?v=61→62`, `styles.css?v=16→17` bumb qilindi
      (`@keyframes spin` CSS ga qo'shilgani uchun ikkalasi ham)

### Xato va limit xabarlari
- [x] Limit tugaganda — **qachon qaytishini ham aytadi**: "Bugungi 10 ta g'oya
      tugadi. Ertaga 00:00 da yangilanadi." (founder qarori: shunchaki "limit
      tugadi" deyish foydalanuvchini nima qilishni bilmay qoldiradi)
- [x] Texnik xato — "Hozir generatsiya qilib bo'lmadi, birozdan keyin urinib
      ko'ring", tugma qayta faollashadi
- [x] Zaxira sifatida qo'lda yozilgan "umumiy g'oyalar" ATAYLAB ko'rsatilmaydi:
      u AI ishlamayotganini yashirardi va bu yana o'sha jimgina yolg'on bo'lardi
- [x] Matnlar `STR` da **uz va ru** uchun ham qo'shildi (funksiyaning O'ZI
      hozircha faqat o'zbekcha g'oya yozadi — 7-qaror; tarjima qilingani
      interfeys matnlari)

### Testlar (`server/test.js`)
- [x] **Test 14** — kesh hash bo'yicha yaroqsiz bo'lishi (mahsulot matni o'zgarsa)
- [x] **Test 14b** — AI javobi sxemasi qat'iy tekshirilishi; mavjud bo'lmagan
      kategoriya tashlab yuborilishi va javob baribir chiqishi
- [x] **Test 14c** — kunlik limit ATOMIK ekani (parallel so'rovlar bilan)
- [x] **Test 14d** — sxemadan o'tmagan javob keshga YOZILMASLIGI
- [x] `console.error` birinchi argumenti qat'iy ekani — **Test 10c avtomatik
      qamradi**, yangi fayllar `server/lib/` va `server/routes/` da bo'lgani
      uchun qo'lda hech narsa qo'shilmadi (qorovul o'zi kengaydi)
- [x] ⚠️ Har bir test **mutatsiya bilan** tasdiqlandi — "test yozdim va yashil"
      dalil emas. **10 ta mutatsiya**, har birida test QIZIL bo'lishi ko'rildi:
      1. hashdan `comp_uz` olib tashlandi
      2. g'oyalar soni tekshiruvi olib tashlandi
      3. oq ro'yxat filtri olib tashlandi
      4. `qiyinlik` oq ro'yxati olib tashlandi
      5. limitning `WHERE` sharti olib tashlandi
      6. mahalliy mintaqa → UTC ga o'zgartirildi
      7. atomik naqsh alohida `SELECT` + `UPDATE` ga bo'lindi
      8. kesh yozuvi tartibi buzildi
      9–10. ikkinchi yozuv nuqtasi — sxema tekshiruvidan OLDIN va KEYIN

### Deploy
- [x] `db/016` production'da qo'llanildi — ikkala jadval bazada
- [x] `.env` ga `AI_PROVIDER` va `AI_API_KEY` qo'shildi — namuna qoldirilmadi
      (⚠️ lekin qatorlar IKKI MARTA tushib qolgan, pastdagi ochiq ishga qara)
- [x] Servis restart (founder bajardi) — 06:33 da ko'tarildi
- [x] Deploy tekshiruvi HTTP kodiga emas javob TARKIBIga qaradi
- [x] ⚠️ **Deploy'dan KEYIN "DEPLOY DALILI" qismi to'ldirilsin** — bu safar
      **bajarildi va ikkinchi commit KERAK BO'LMADI.** Reja ishladi: 2026-08-06
      da aynan shu bo'shliq sababli qo'shimcha commit (`f32a42c`) kerak
      bo'lgandi, shuning uchun qadam rejaga OLDINDAN kiritilgan edi va eslab
      qolishga tayanilmadi

---

## DEPLOY DALILI (2026-08-06)

Quyidagilarning hammasi HAQIQATAN o'lchandi. "Deploy qildim ≠ ishlayapti"
darsi bo'yicha har bandda **nima ko'rilgani** yozilgan, "qilindi" emas.

### 1. Testlar — mutatsiya bilan tasdiqlangan

4 ta yangi test yashil, butun to'plam yashil. Yashillikning O'ZI dalil deb
qabul qilinmadi: yuqoridagi **10 ta mutatsiya** o'tkazildi va har birida
tegishli test qizil bo'ldi. Ya'ni testlar haqiqatan himoyaga bog'langan.

### 2. Frontend brauzerda o'lchandi

- **5 holat** chizildi va ko'rildi (tugma / yuklanmoqda / natija / xato / limit).
- **XSS sinovi:** AI maydonlariga `<img src=x onerror=...>` qo'yildi —
  `img` tegi YARATILMADI va skript ISHLAMADI. Ya'ni `esc()` chizish joyida
  haqiqatan qo'llanyapti (AI matni `vm()` dan o'tmaydi).
- **Delegatsiya josus bilan tekshirildi:** `askAi` `'ik-1402'` **satr** bilan
  chaqirildi, ya'ni hodisa `data-action` orqali ketyapti va inline emas —
  C1/C2 shartnomasi buzilmadi.
- **Joylashuv o'lchandi** (11-qaror talabi): xususiyatlar `4352` < AI `8266`
  < sharhlar `9239`. Ya'ni blok haqiqatan xususiyatlardan pastda va
  sharhlardan tepada — ko'z bilan emas, piksel bilan tasdiqlandi.

### 3. Production'da endpoint tirik

`POST /api/ai/ideas` imzosiz so'rovda **401** qaytaradi (deploy'dan oldin
**404** edi). Farqi muhim: 404 "yo'l yo'q", 401 "yo'l bor va qorovul ishlayapti".
Muvaffaqiyat belgisi sifatida 200 kutilmadi — imzosiz so'rov 200 qaytarsa
bu nuqson bo'lardi.

### 4. `config.js` qorovuli production'da ISHLAB KETDI

Kalit hali qo'yilmagan paytda jurnalda aynan shu chiqdi:

```
AI funksiyasi o'chiq — sozlama to'liq emas: provider=yo'q key=yo'q
```

va tugma umuman chizilmadi. Bu `ALERT_CHAT_ID` darsining amaliy takrori:
o'sha paytda xato monitoringi ikki kun o'lik turgan va buni HECH NARSA
ko'rsatmagan edi. Bu safar sozlama to'liq emasligi **birinchi soniyadayoq
ko'rindi**.

### 5. Gemini haqiqatan sinaldi

Serverdan `gemini-flash-latest` ga so'rov yuborildi — **HTTP 200**, JSON
rejimi toza JSON qaytardi. Ya'ni 8-qarordagi "sinaladigan provayder" haqida
yozilgan narsa endi tekshirilgan da'vo.

⚠️ **OpenAI yo'li SINALMAGAN** va shu holicha e'lon qilinadi — 8-qarorda
oldindan shunday kelishilgan edi. "Abstraksiya bor" degani "ikkalasi ham
ishlaydi" degani EMAS.

---

## Qilingan ishlar

- [2026-08-06] Sprint 10 founder bilan 12 ta savol-javob orqali rejalashtirildi
  — har qarorning muqobili va rad etilish sababi yozildi
- [2026-08-06] `db/016_ai_ideas.sql` — `product_ai_ideas` (PK
  `(product_id, lang)`) va `ai_usage` (PK `(tg_user_id, day)`) jadvallari.
  Migratsiya oxirida PK tarkibini tekshiradigan `DO $$` bloki bor
- [2026-08-06] `server/lib/ai.js` — provayderdan mustaqil AI qatlami: Gemini va
  OpenAI yo'llari, prompt, JSON sxema tekshiruvi, `sourceHash`
- [2026-08-06] `server/routes/ai.js` — `POST /api/ai/ideas`: `initData` imzosi,
  hash bo'yicha kesh, ATOMIK kunlik limit, oq ro'yxat filtri, kesh yozuvi
- [2026-08-06] `server/config.js` — `AI_PROVIDER`/`AI_API_KEY` SHAKL qorovuli
  (`chatId()` namunasi), `AI_ENABLED`, `AI_DAILY_LIMIT`. `process.exit` ATAYLAB
  yo'q: AI ixtiyoriy funksiya, u o'chsa sayt ishlayveradi
- [2026-08-06] `server/routes/catalog.js` — `/api/auth/telegram` javobiga
  `aiEnabled` qo'shildi (KO'RINISH belgisi; endpoint mustaqil tekshiradi)
- [2026-08-06] `server/server.js` — `/api/ai/ideas` router'ga ulandi. **POST**,
  chunki GET keshlanadigan o'qish deb tushunilardi va Cloudflare uni jimgina
  keshlab qo'yishi mumkin edi
- [2026-08-06] `server/test.js` — Test 14, 14b, 14c, 14d qo'shildi va **10 ta
  mutatsiya bilan** tasdiqlandi
- [2026-08-06] `telegram-app/app.js` — `aiSection()`, `aiIdeaCard()`,
  `askAi()`, `repaintDetail()`, `S.aiEnabled`/`S.aiIdeas`, uz/ru matnlari.
  Hodisa delegatsiya orqali, har maydon chizish joyida `esc()` dan o'tadi
- [2026-08-06] `telegram-app/styles.css` — `@keyframes spin`;
  `index.html` da `app.js?v=62`, `styles.css?v=17`
- [2026-08-06] Production: `db/016` qo'llandi, `server/` rsync qilindi, servis
  06:33 da ko'tarildi, endpoint 401 qaytardi (avval 404), Gemini HTTP 200
- [2026-08-06] **Founder qabul sinovi o'tkazildi — funksiya RAD ETILDI.**
  Matn g'oyalari kerak emas ekan; kerak bo'lgani — mahsulot suratidan
  chiqariladigan RASM (image-to-image), hozircha bitta mahsulotga bitta rasm
- [2026-08-06] Rasm modellari serverdan JONLI KALIT bilan sinaldi:
  `gemini-3.1-flash-image` va `gemini-2.5-flash-image` — ikkalasi ham HTTP 429,
  sabab `limit: 0` (bepul tarifda rasm kvotasi umuman yo'q). O'SHA kalitda
  matn modeli HTTP 200 qaytardi, ya'ni farq kalitda emas, TARIFDA
- [2026-08-06] Hujjat to'g'rilandi: yopilish mezoni "BAJARILMAGAN" emas,
  "BAJARILDI, natija rad etish" — va 1-qaror (rasm rad etilgani) bekor
  qilingani uch joyda (tepa blok, qarorning o'zi, qarorlar tarixi) yozildi
- [2026-08-07] **Billing yoqildi va SINOV QAYTARILDI** — serverdan jonli
  kalit bilan rasm modeliga so'rov, `429` / `limit: 0` YO'QOLGANI ko'rildi.
  «Billing yoqdim» dalil deb qabul qilinmadi
- [2026-08-07] `server/lib/ai.js` — `generateImage()` (image-to-image, manba
  mahsulotning O'Z surati), `IMAGE_CHOICES`, `choicesHash()`,
  `normalizeChoices()`, `extractImage()`. Rasm uchun ALOHIDA chegara:
  **20 MB / 120 s** (matn chegarasi qoldirilsa so'rov o'rtasida uzilardi va
  kvota baribir sarflangan bo'lardi)
- [2026-08-07] `server/lib/telegram-api.js` — `sendPhotoBytes()` (multipart)
  va `tgDownloadFile()`. Natija Telegram'da yashaydi, bazada faqat `file_id`
  — deploy'dan omon qoladi
- [2026-08-07] `server/routes/ai.js` — `POST /api/ai/image`: imzo → kesh →
  ATOMIK kunlik limit → manba surat → AI → Telegram → kesh.
  `GET /api/ai/gallery` — FAQAT O'QISH, generatsiya YO'Q
- [2026-08-07] `server/config.js` — `AI_IMAGE_MODEL`, `AI_IMAGE_CHAT_ID`,
  `AI_IMAGE_ENABLED`, hammasi SHAKLI bo'yicha tekshiriladi. `AI_MODEL`
  (matn modeli) olib tashlandi
- [2026-08-07] `db/017_ai_image.sql` — rasm keshi. `lang` ustuni ATAYLAB
  yo'q: rasmda matn yo'q, ya'ni ikkala til uchun AYNI rasm
- [2026-08-07] `db/018_ai_image_choices.sql` — `choices_hash` + `choices`,
  PK `(product_id, choices_hash)`. Kesh kaliti `mahsulot + javoblar`
- [2026-08-07] **Matn g'oyalari BUTUNLAY olib tashlandi** — `/api/ai/ideas`,
  `generateIdeas`, `parseIdeas`, provayder abstraksiyasi (OpenAI yo'li,
  hech qachon sinalmagan), UI, Test 14/14b/14d. `product_ai_ideas` jadvali
  bazada QOLDIRILDI (o'chirish qaytarib bo'lmaydi)
- [2026-08-07] **Rasmdan oldin 3 ta savol** — «Nima tikilsin / Kim uchun /
  Qayerga». Ro'yxat SERVERDA tug'iladi, klient yuborgani oq ro'yxatdan
  o'tadi, yaroqsizi 400. Promptda kiyinish odobi qat'iy: yopiq, lekin
  zamonaviy va chiroyli; model Markaziy Osiyo ko'rinishida
- [2026-08-07] **Bosh sahifa va katalog BIRLASHTIRILDI.** Bo'shagan tab
  o'rniga AI bo'limi (`renderAi`). Tartib: Katalog · Savat · Buyurtma · AI.
  Bosh sahifadagi filtr endi shu sahifada ochiladi
- [2026-08-07] `telegram-app/styles.css` — AI bo'limi uchun CSS
  (`.ai-chip`, `.ai-cta`, `.ai-figure`, tanlash hisoblagichi, kutish
  chizig'i); `app.js?v=70`, `styles.css?v=21`, Test 16 jadvali yangilandi
- [2026-08-07] **JIMGINA nuqson tuzatildi:** `--border-hair` tokeni
  `styles.css` da umuman aniqlanmagan edi, `app.js` esa uni 31 joyda
  ishlatadi. Chegaralar `rgba(23,26,48,.08)` o'rniga `rgb(23,26,48)` —
  ~12 barobar to'q, butun Mini App'ga ta'sir qilgan
- [2026-08-07] Testlar **34 → 37** (14e, 14f, 14g, 14h, 14i, 14j qo'shildi;
  14, 14b, 14d olib tashlandi). Har biri MUTATSIYA bilan sinaldi —
  7 mutatsiya, hammasi tutildi. Lint 0 xato
- [2026-08-07] Production'da tasdiqlandi: 2 ta haqiqiy rasm chizildi, manba
  mato bilan solishtirildi — rang va naqsh KO'CHIRILGAN
- [2026-08-07] `server/README.md` — `.env` jadvaliga `AI_*` qatorlari va
  **nginx ogohlantirishi**: umumiy `/api/` blokidagi `proxy_read_timeout 30s`
  rasm so'roviga yetmaydi

### Ikkinchi to'lqin — sprint YOPILGANDAN KEYIN (2026-08-07, o'sha kun)

⚠️ Bu bo'lim sprint `tugadi` deb belgilangandan KEYIN qo'shildi va holat
o'zgartirilmadi. Sabab: yopilish mezoni (founder qo'lda sinab qabul qilishi)
allaqachon bajarilgan, quyidagilari esa **qabul qilingan funksiyaning ustiga
qo'yilgan qatlam**. "Yopildi" ni ochib qayta yopish yozuvni chalkashtirardi —
qaysi sana haqiqiy qabul sanasi ekani ko'rinmay qolardi.

- [2026-08-07] **Orqa fon xilma-xilligi** (`server/lib/ai.js`): 18 ta sahna
  (`SAHNA`), `uslub` bo'yicha 3 guruh × 6 fon. Fon uslubga ZID bo'lmasligi
  uchun guruhlangan — bayramona ko'ylakni ofis yo'lagida ko'rsatish rasmni
  buzardi.
  ⚠️ **Fon TASODIFIY EMAS** — u kesh kalitidan hosil qilinadi (`sceneFor`:
  `mahsulot id + javoblar hash`). `Math.random()` ikki yo'ldan birini
  berardi va ikkalasi ham yomon: sahna kesh kalitiga kirmasa — birinchi
  chizilgan rasm abadiy qoladi va tasodif KO'RINMAYDI (kod bor, natijasi
  yo'q); kirsa — har bosishda yangi kalit tug'ilib kesh butunlay ishlamay
  qoladi va ayni mato uchun qayta-qayta ~$0.04 to'lanardi
- [2026-08-07] Promptga **neytral yorug'lik bandi** qo'shildi. Fon kelgani
  bilan rasmning MAQSADI o'zgarmadi — u matoning HAQIQIY rangi. Rangli
  yorug'lik (neon, quyoshbotar) matoni boshqa rangga bo'yab qo'yardi va
  image-to-image ning butun sababi yo'qolardi; foydalanuvchi buni tekshira
  ham olmasdi
- [2026-08-07] **`PROMPT_VERSION` qorovuli** (`server/lib/ai.js`, hozir `v3`).
  Kesh kaliti (`imageSourceHash`) promptga UMUMAN qaramasdi: prompt o'zgarsa
  ham allaqachon chizilgan rasmlar abadiy eski holida qolardi va galereya
  aynan shu keshdan oziqlanadi. Nuqson JIMGINA bo'lardi — kod yangi, test
  yashil, deploy muvaffaqiyatli, ekranda esa hech narsa o'zgarmagan.
  Endi versiya hash ichida. Narxi ochiq: versiya oshgach har bir rasm bir
  marta qayta chiziladi (~$0.04), lekin faqat kimdir SO'RAGANDA
- [2026-08-07] **LOLA CREDIT — kunlik limit o'rniga balans** (founder qarori).
  `db/019_lola_credits.sql`: `ai_credits` jadvali (`balance`, `spent`,
  `CHECK >= 0`) + `product_ai_image.tg_user_id`. Har foydalanuvchiga 20
  credit, bitta rasm 2 credit. Yechish **ATOMIK** — `decrementStock` naqshi
  (`INSERT ... ON CONFLICT ... WHERE balance >= narx RETURNING`), alohida
  `SELECT` + `UPDATE` ga bo'linmaydi: aks holda balans MANFIYGA tushardi.
  Balans BIRINCHI so'rovda o'zi tug'iladi, ya'ni "krediti berilmay qolgan
  foydalanuvchi" degan holat mavjud emas
- [2026-08-07] `server/config.js` — `AI_CREDITS_START`, `AI_CREDIT_COST`,
  `AI_UNLIMITED_TG_IDS`; hammasi SHAKLI bo'yicha tekshiriladi
  (`ALERT_CHAT_ID` darsi). Narx boshlang'ich qoldiqdan katta bo'lsa jurnalda
  QICHQIRADI — aks holda hech kim rasm chiza olmasdi va sababi ko'rinmasdi.
  `AI_DAILY_LIMIT` **eskirdi**, lekin o'chirilmadi: `db/016` va uning izohlari
  hali shu tushunchaga ishora qiladi
- [2026-08-07] **"Ertaga yangilanadi" xabari O'CHIRILDI.** Kunlik limitda u
  HAQIQAT edi, kreditda YOLG'ON: kredit — qoldiq, u o'zi tiklanmaydi.
  Yana o'sha "jimgina yolg'on yo'qlikdan yomonroq" oilasi
- [2026-08-07] **Kredit qoldig'i SO'RALMASDAN ko'rsatiladi** (`/api/ai/my`).
  Ilgari foydalanuvchi chegarani faqat U TUGAGANDA bilardi (HTTP 429), ya'ni
  pul sarflashdan oldin nechta qolganini ko'ra olmasdi
- [2026-08-07] **Tezlik chegarasi tartibi almashdi** (`routes/ai.js`): kimlik
  AVVAL, `rateLimited` KEYIN. Ilgari cheksiz ro'yxatdagi odam ham 7-so'rovda
  429 olardi — "cheksiz kredit" jimgina yolg'on bo'lardi. Kalit ham IP dan
  `tg.id + IP` ga o'tdi: bitta uy Wi-Fi'sidagi ikki xaridor bir-birini
  bloklamasin
- [2026-08-07] **`kim = erkak` varianti olib tashlandi** (founder qarori).
  Kalit shunchaki o'chirildi, "ko'rsatilmasin" bayrog'i QO'YILMADI: ro'yxat
  oq ro'yxat bo'lgani uchun yo'q kalit avtomatik 400 oladi. Bazadagi eski
  `erkak` qatorlari O'CHIRILMADI (haqiqiy, pulga chizilgan rasmlar), lekin
  lentada KO'RSATILMAYDI — filtr `normalizeChoices` ning O'ZI bilan qilinadi
  (`joriyMi`), ya'ni ikkinchi ro'yxat yozilmadi (`db/014` darsi)
- [2026-08-07] **Dizayn guruhi qo'shildi**: neoklassika / zamonaviy /
  minimalistik / combo. `combo` tanlansa ikki qo'shimcha savol ochiladi
  (`COMBO_CHOICES`: rang, qo'shimcha material) va **erkin matn**. Combo
  javoblari `/api/auth/telegram` da ALOHIDA yuboriladi (`aiComboChoices`),
  chunki ular SHARTLI — bitta ro'yxatga qo'shilsa frontend ularni doim
  chizardi
- [2026-08-07] **Erkin matn — founder qarori TAVSIYAGA QARAMASDAN.** Tavsiya
  "faqat oq ro'yxat" edi, founder: "erkin matn shunsiz ham bo'lmaydi".
  Shuning uchun himoya KIRISHDA turadi va u ikki qavat: (1) SHAKL —
  `cleanComboText`, 60 belgi, qavs/tirnoq/burchak qavs/qiya chiziq/yangi
  qator O'TMAYDI (aynan shular bilan promptga "yangi ko'rsatma"
  tiqishtiriladi); (2) O'RIN — matn promptda MA'LUMOT deb e'lon qilinadi va
  ortidan darrov `ODOB` keladi, chunki model OXIRGI ko'rsatmalarga ko'proq
  og'irlik beradi. ⚠️ Matn KESILMAYDI, uzun bo'lsa RAD ETILADI: jimgina
  qirqilsa xaridor yozganini emas boshqasini olardi, ustiga bu pullik so'rov
- [2026-08-07] **AI ekrani qayta yozildi** (`telegram-app/app.js`): sehrgar
  (mato tanlash → savollar → natija), "Mening rasmlarim" tabi, kredit
  rozetkasi, Telegram'ga ulashish, "Shu matodan buyurtma" CTA, kutish holati
  ekran almashganda saqlanadi. Natija bloki `aiImageSection` ni QAYTA
  ISHLATADI — ikkinchi nusxa yozilmadi. `index.html` da `app.js?v=70→71`
- [2026-08-07] `GET /api/ai/my` — "Mening rasmlarim" + kredit BITTA javobda.
  **Imzo SHART** (galereyadan farqi shu: u ochiq va umumiy)
- [2026-08-07] Testlar **37 → 40**: 14c kredit uchun qayta yozildi, 14j combo
  javoblarini ham qamraydi, yangi **14k** (fon xilma-xilligi va kesh
  buzilmagani), **14l** (prompt versiyasi qorovuli — u promptning O'ZINI
  hashlaydi), **14m** (erkin matn kirishda tozalanadi).
  ⚠️ Raqam IKKI MUSTAQIL usul bilan olindi: `grep -c "✅ Test "` = **40** va
  `npm test` chiqishidagi qatorlar = **40**. Lint: **0 xato**
  (28 ogohlantirish — 27 tasi avvaldan bor, biri `test.js` dagi endi keraksiz
  `eslint-disable` izohi)
- [2026-08-07] Deploy: `db/019` production'da BAJARILDI; `.env` tuzatildi —
  `AI_UNLIMITED_TG_IDS` da namuna qolib ketgan edi (`ALERT_CHAT_ID` darsining
  aynan takrori, faqat bu safar `config.js` qorovuli uni TUTDI).
  ⚠️ **Backend rsync va servis restarti HALI QILINMAGAN** — ya'ni bu commit
  paytida production hamon ESKI kodni ishlatyapti

---

## Sprint yopilish mezoni

**Founder 10 xil matoda tugmani bosadi va natija sifatini QO'LDA baholaydi.**
Savol: g'oyalar mantiqiymi, sarf hisobi realmi, tavsiya qilingan qo'shimcha
mahsulot o'rinlimi.

Bu Sprint 9 dagi **"sozlandi degani uchun `[x]` qilinmaydi — dalil ko'rsatilishi
kerak"** qarorining davomi. Bu funksiyada texnik yashillik yetarli emas:
testlar o'tishi AI **ma'noli** yozganini umuman isbotlamaydi — u faqat javob
SHAKLI to'g'riligini isbotlaydi.

**Holat (2026-08-06): BAJARILDI — natija RAD ETISH.** Founder sinab ko'rdi va
matn g'oyalari kerak emas degan hukmga keldi (tepadagi blokka qara). Ya'ni bu
mezon "hali tekshirmadik" holatidan "tekshirdik va kerak emas ekan" holatiga
o'tdi — **farqi muhim**, birinchisi ish qoldi degani, ikkinchisi ish
noto'g'ri narsaga sarflandi degani.

~~Sprint shunga qaramay **jarayonda**, `tugadi` emas~~ — **2026-08-07 da
YOPILDI.** Founder haqiqatan so'ragan shakl (**rasm**) ishlab ketdi va
production'da qo'lda baholandi: 2 ta haqiqiy rasm chizildi, manba mato bilan
solishtirildi, rang va naqsh ko'chirilgani ko'rildi. Mezon aynan shu ikkinchi
o'tishda o'z vazifasini bajardi — birinchi o'tishda u "kerak emas" degan
javobni, ikkinchisida "ha, shu" degan javobni berdi.

⚠️ **Mezonning O'ZI ham dars berdi.** U "sifat yaxshimi?" deb so'rardi va
javob "sifat masalasi emas, funksiyaning O'ZI kerak emas" bo'lib chiqdi.
Ya'ni mezon nuqsonni tutdi, lekin **o'zi kutgan turdagisini emas**. Keyingi
sprintlarda yopilish mezoniga "bu funksiya umuman kerakmi?" degan savol ham
kiritilsin — va u kod yozilgunga QADAR so'ralsin.

---

## Ochiq qolgani (2026-08-06)

Bu ro'yxat ataylab "bajarildi" deb yopilmadi.

1. ~~**Rasm varianti — BILLING'ga bog'liq.**~~ — **2026-08-07 da YOPILDI.**
   Founder billing'ni to'ladi, sinov qaytarildi va `limit: 0` yo'qolgani
   KO'RILDI. Rasm production'da ishlaydi.
   ~~Sprint yopilish mezoni bajarilmagan~~ — 2026-08-06 da bajarildi
   (natijasi rad etish), 2026-08-07 da qayta bajarildi (natijasi qabul).
2. **MVP da moderatsiya yo'q** — bilib qilingan tanlov (10-qaror), xavfi va
   ikkita qo'lda zaxira yo'li o'sha yerda yozilgan.
3. **`.env` da `AI_*` qatorlari IKKI MARTA turibdi.** Qiymatlar bir xil va
   systemd oxirgisini oladi, ya'ni bugun hech narsa buzilmaydi — lekin
   kelajakda BITTASI tahrirlanib ikkinchisi qolib ketsa, o'zgarish jimgina
   qo'llanmasdi va sabab topilmasdi. Tozalanishi kerak.
4. ~~**`--border-hair` aniqlanmagan**~~ — **2026-08-07 da TUZATILDI**
   (`styles.css:79`). Brauzerda o'lchandi: chegara `rgb(23,26,48)` edi,
   `rgba(23,26,48,.08)` bo'ldi. Ta'sir doirasi taxmin qilinmadi, sanaldi:
   `app.js` da 31 ta `var(--border-hair)`.

---

## Ochiq qolgani (2026-08-07 da qo'shildi)

1. **nginx `proxy_read_timeout` — rasm yo'liga alohida blok kerak.**
   Umumiy `/api/` blokida 30 s turibdi, rasm undan uzoq ketishi mumkin.
   Tartibi `server/README.md` da yozilgan. ⚠️ **Cloudflare ham o'z chegarasini
   qo'yadi** (~100 s bepul tarifda), ya'ni nginx'ni ko'tarish YETARLI
   bo'lmasligi mumkin — buni TAXMIN qilmasdan o'lchash kerak.
   Bu founder bajaradigan ish (nginx tahriri).
2. **Test 5 (`Buzuq havola yo'q`) yo'llarni QO'LDA yozilgan ro'yxatdan
   oladi** — ya'ni yangi endpoint unga avtomatik tushmaydi. Route jadvali
   testi (`testRouteTable`) esa avtomatik. Bu "yozilgan qoida himoya emas —
   uni tekshiradigan test himoya" oilasidan va u hozir **qamrovni ro'yxat
   belgilaydigan** holatda: ro'yxat jimgina eskiradi va buni hech narsa
   ko'rsatmaydi. Keyingi sessiyaga band.
3. **`product_ai_ideas` jadvali bazada qoldi** — hech kim o'qimaydi.
   Ataylab: o'chirish qaytarib bo'lmaydi, turgani zarar qilmaydi.

---

## Ochiq savollar

1. ~~**Provayder qaysi?**~~ — **2026-08-06 da YOPILDI: Gemini Flash sinaladi**
   (8-qarorga qara). Kod ikkalasiga tayyor bo'ladi, lekin "ishlaydi" deyish
   faqat Gemini haqida bo'ladi
2. ~~**Kategoriya oq ro'yxati qanday?**~~ — **2026-08-06 da TEKSHIRILDI va
   YOPILDI.** Ogohlantirish to'g'ri chiqdi: ochiq katalogda 12 mahsulot,
   hammasi mato (`silk` 3, `cotton` 3, `suzani` 2, `linen` 2, `ikat` 1,
   `wool` 1), astar/ip/tugma bitta ham yo'q. Founder qarori: oq ro'yxat
   bugungi mato turlaridan iborat bo'ladi va bazadan olinadi (5-qarorga qara)
3. **Oylik xarajat shifti?** Hamon raqamsiz. Lekin kattalik tartibi endi
   ma'lum: kesh + 12 mahsulot = **bir martalik 12 so'rov**, keyin faqat yangi
   e'lonlar. Gemini Flash bepul kvotasida bu amalda nol.
   ⚠️ **Rasmda bu javob ISHLAMAYDI:** rasmning bepul kvotasi yo'q
   (`limit: 0`), ya'ni "amalda nol" o'rniga ~$0.04/rasm — bugungi katalogda
   bir martalik ~$0.50. Kesh bu yerda ham asosiy qorovul bo'lib qoladi

---

## Qarorlar tarixi

- [2026-08-06] ~~Qaror: **AI rasm generatsiyasi rad etildi**~~ — AI matoning
  haqiqiy rangi va naqshini chiza olmaydi, xaridor esa rasmga raqamdan ko'ra
  ko'proq ishonadi. "O'ylab topilgan raqam ko'rsatilmasin" qoidasining vizual
  shakli. ⚠️ **SHU KUNNING O'ZIDA BEKOR QILINDI — pastdagi yozuvga qara**
- [2026-08-06] Qaror: **AI aniq mahsulot `id` si qaytarmaydi, faqat kategoriya
  kaliti** — mavjud bo'lmagan mahsulotga havola chiqishi arxitektura darajasida
  imkonsiz bo'lsin, modelning "o'ylab topmasligi"ga tayanilmasin
- [2026-08-06] Qaror: **kesh vaqt bilan emas, mahsulot matnining `sha256` i
  bilan eskiradi** — vaqt o'tishi tahrir bilan bog'liq emas, ya'ni vaqt bo'yicha
  eskirish eskirgan g'oyani ko'rsatib turish muddatini qisqartiradi xolos
- [2026-08-06] Qaror: **javob qat'iy JSON, markdown emas** — markdown'ni HTML ga
  aylantirish AI chiqargan HTML ni `innerHTML` ga olib borardi, ya'ni CLAUDE.md
  taqiqlagan yo'lni AI uchun ochib berardi
- [2026-08-06] Qaror: **provayder tanlanmaguncha kod unga bog'lanmaydi**
  (`server/lib/ai.js`), lekin abstraksiya "ikkalasi ham ishlaydi" degani EMAS —
  faqat sinalgani ishlaydi va sprint yopilishida qaysi biri sinalgani yozilsin
- [2026-08-06] Qaror: **MVP da moderatsiya yo'q** — bilib qilingan tanlov,
  xavfi (noto'g'ri g'oya sahifada qolib ketishi) va ikkita qo'lda zaxira yo'li
  yuqorida yozilgan. Admin tugmasi qo'shilganda u Telegram tasdiqlash yo'lidan
  o'tsin
- [2026-08-06] ⚠️ TUZOQ (qaror emas, eslatma): **"katalogdan tavsiya" bugungi
  katalogda bo'sh chiqishi mumkin** — `cat_key` lar mato turlari, qo'shimcha
  mahsulot (astar, ip, tugma) esa katalogda yo'q. Ishni shu ro'yxatni
  tekshirishdan boshlash kerak
- [2026-08-06] ✅ Yuqoridagi tuzoq **TEKSHIRILDI va tasdiqlandi** — ochiq
  API'da 12 mahsulot, hammasi mato, aksessuar nol. Yo'l-yo'lakay hujjatning
  o'zidagi xato ham tuzatildi: «85 mahsulot» → **12**. Dars kichik lekin
  takrorlanuvchi: **sprint hujjatidagi raqam ham tekshirilmagan da'vo bo'lishi
  mumkin** — u ham `.env` dagi namuna kabi "bo'sh emas, demak to'g'ri" deb
  qabul qilingan edi
- [2026-08-06] Qaror: **oq ro'yxat bugungi mato turlaridan iborat va BAZADAN
  olinadi** — AI aksessuar emas, qo'shimcha MATO tavsiya qiladi. Ikki sabab:
  (a) funksiya bugungi katalogda bo'sh chiqmaydi, (b) ro'yxat kodda qo'lda
  takrorlanmaydi, ya'ni katalogga aksessuar qo'shilganda kodga tegilmaydi
  (`db/014` darsi — ikkinchi ro'yxat himoya emas, kelajakdagi tuzoq)
- [2026-08-06] Qaror: **sinaladigan provayder — Gemini Flash** (bepul kvota).
  Sprint yopilishida "ikkalasi ham ishlaydi" deb YOZILMAYDI — OpenAI yo'li
  sinalmagan bo'lib qoladi va shu holicha e'lon qilinadi
- [2026-08-06] Qaror (kod yozilayotganda): **kesh PK `(product_id, lang)`,
  faqat `product_id` emas** — vazifalar ro'yxatiga zid, lekin 7-qarorga muvofiq.
  Ro'yxat bilan qaror zid kelsa QAROR kuchliroq. Aks holda ruscha qo'shilgan
  kuni jonli jadvalda PK o'zgartirish kerak bo'lardi
- [2026-08-06] Qaror: **`ai_usage` kaliti `tg_user_id`, `users.id` EMAS** —
  `users` qatori faqat `/api/auth` dan keyin paydo bo'ladi, FK qo'yilsa har
  safar upsert va yana bitta poyga oynasi qo'shilardi. Kimlik baribir
  imzolangan `initData` dan keladi
- [2026-08-06] Qaror: **kunlik limit kuni `Asia/Tashkent` da hisoblanadi**,
  `CURRENT_DATE` (UTC) da emas. Foydalanuvchiga "Ertaga 00:00 da yangilanadi"
  deyiladi; UTC ishlatilsa limit mahalliy 05:00 da yangilanardi va xabar
  jimgina yolg'on bo'lardi — yana o'sha oila
- [2026-08-06] Qaror: **`/api/ai/ideas` — POST, GET emas.** Generatsiya yozuv
  amali (kesh va limit yoziladi), GET esa keshlanadigan o'qish deb tushunilardi
  va Cloudflare uni jimgina keshlab qo'yishi mumkin edi
- [2026-08-06] Qaror: **`aiEnabled` — ko'rinish belgisi, himoya EMAS.** Tugmani
  yashirish hech qachon yagona qorovul bo'lmaydi; endpoint sozlamani mustaqil
  tekshiradi
- [2026-08-06] Qaror: **kalitning O'ZI hech qachon jurnalga yozilmaydi** —
  yaroqsizlik haqidagi xabarda faqat uzunligi ko'rsatiladi. Diagnoz uchun
  uzunlik yetarli, sir esa jurnalga tushmaydi
- [2026-08-06] Dars: **qorovul o'zi kengaydi.** `console.error` qoidasi uchun
  qo'lda test yozilmadi — Test 10c `server/lib/` va `server/routes/` ni
  skanerlagani uchun yangi ikki faylni O'ZI qamrab oldi. Bu 2026-08-05 dagi
  "yozilgan qoida himoya emas, uni tekshiradigan test himoya" darsining
  foydasi birinchi marta amalda ko'ringan joy
- [2026-08-06] Dars: **"deploy dalili" qadami rejaga oldindan kiritilgani
  ishladi** — `f32a42c` da kerak bo'lgan ikkinchi commit bu safar kerak
  bo'lmadi. Ya'ni jarayondagi bo'shliq eslab qolish bilan emas, REJAGA
  yozilgan qadam bilan yopildi
- [2026-08-06] Qaror (qabul sinovidan keyin): **1-qaror BEKOR QILINDI —
  kerak bo'lgani matn emas, RASM.** Eski rad etishning sababi ("AI matoning
  rangi va naqshini o'ylab topadi") founder ko'rsatgan usulda kuchini
  yo'qotadi: rasm MATNDAN emas, **mahsulot suratidan** chiqariladi
  (image-to-image), ya'ni naqsh o'ylab topilmaydi — **ko'chiriladi**.
  Hajmi: bitta mahsulotga bitta rasm. E'tiroz butunlay yo'qolmaydi (buyumning
  o'zi mavjud emas), shuning uchun "AI tasavvuri" yorlig'i shart
- [2026-08-06] Qaror: **matn tugmasi production'da QOLDIRILADI** — o'chirilmaydi
  va yashirilmaydi. Rad etilgan funksiyani darhol yulib tashlash bilan
  shoshilinmadi: u ishlab turibdi, hech kimga zarari yo'q, rasm yo'li esa
  uning butun qorovul qatlamini (imzo, kesh + `sourceHash`, atomik limit,
  oq ro'yxat) qayta ishlatadi — olib tashlansa o'sha kod ham birga ketardi
- [2026-08-06] Dars: **rad etish kod sifatida emas, MAQSAD darajasida keldi.**
  10 ta mutatsiyadan omon qolgan testlar, 5 ta chizilgan holat, XSS sinovi,
  piksel bilan o'lchangan joylashuv — hammasi to'g'ri edi va **hech biri
  funksiya kerakligini isbotlay olmadi**. Bu shu faylning o'z ogohlantirishi
  amalda ko'ringan joyi: "testlar o'tishi AI MA'NOLI yozganini isbotlamaydi".
  Amaliy xulosa: "bu kerakmi?" savoli yopilish mezoniga emas, **kod
  yozilishidan OLDINGI bosqichga** qo'yilsin
- [2026-08-06] Dars (tashqi "jimgina yolg'on"): Gemini'ning 429 xatosi
  **"Please retry in 27s" deydi, holbuki chegara nol** — kutish hech qachon
  yordam bermaydi. Sabab faqat javob TANASIDAGI `limit: 0` da ko'rinadi.
  Ya'ni xato xabarining tavsiyasi ham tekshirilmagan da'vo bo'lishi mumkin

### 2026-08-07 (rasm qismi)

- [2026-08-07] Qaror: **matn g'oyalari BUTUNLAY olib tashlanadi.** Founder:
  "matn ai umuman kerak emas, faqat rasm qolsin". 2026-08-06 dagi "matn
  tugmasi QOLDIRILADI" qarori shu bilan bekor bo'ldi — sabab o'zgardi:
  o'shanda uni saqlab turishning asosi qorovul qatlamini yo'qotmaslik edi,
  endi esa o'sha qatlam rasm yo'lida ISHLAB turibdi, ya'ni matnni saqlashning
  yagona sababi qolmadi. Birga ketdi: provayder abstraksiyasi va OpenAI
  yo'li — u **hech qachon sinalmagan** edi va 8-qarorda buning narxi
  oldindan ochiq yozilgan («abstraksiya bepul emas»). Ya'ni sinalmagan yo'l
  oxir-oqibat foyda bermay, faqat qarz bo'lib qoldi
- [2026-08-07] Qaror: **`product_ai_ideas` jadvali O'CHIRILMAYDI** —
  o'chirish qaytarib bo'lmaydi, turgani esa hech kimga zarar qilmaydi.
  "Almashtirishni qo'lga kiritmasdan eskisini o'chirma" oilasining
  baza ko'rinishi
- [2026-08-07] Qaror: **rasmdan oldin 3 ta savol** («Nima tikilsin / Kim
  uchun / Qayerga») va **ro'yxat SERVERDA tug'iladi.** Klient yuborgan javob
  oq ro'yxatdan o'tadi, yaroqsizi 400. Frontendda faqat YORLIQ (uz/ru),
  kalit emas — `db/014` darsi: ikkinchi ro'yxat himoya emas, tuzoq.
  Buni Test 14j qulfladi: serverga kalit qo'shilib frontendda unutilsa
  test QIZIL bo'ladi
- [2026-08-07] Qaror: **kesh kaliti `mahsulot + javoblar`, foydalanuvchi
  bo'yicha EMAS.** So'zma-so'z talqin (har foydalanuvchiga o'z qatori)
  rad etildi: bir xil javob bergan ikki xaridor AYNAN BIR rasmni oladi,
  ya'ni ikkinchisi uchun to'lash sof isrof (~$0.04) bo'lardi va xarajat
  foydalanuvchi soniga qarab o'sardi. Xaridor nuqtai nazaridan farq yo'q —
  javobi boshqa bo'lsa rasmi ham boshqa. Bu 4-qarorning davomi: xarajat
  endi "mahsulot × javob to'plami" ga bog'liq
- [2026-08-07] Qaror: **rasm keshida `lang` ustuni YO'Q** (016 dan ataylab
  farq). Rasmda matn yo'q, ya'ni ikkala til uchun AYNI rasm ishlaydi.
  "Har ehtimolga" qo'shilsa kesh ikkiga bo'linib bir rasm uchun ikki marta
  to'lattirardi. ⚠️ 7-qaror bilan zid emas — o'sha qaror MATN keshi haqida
  edi va bu yerda kesh matn EMAS
- [2026-08-07] Qaror: **rasm uchun chegaralar matnnikidan ALOHIDA**
  (20 MB / 120 s). Matn chegarasi (200 KB) qoldirilsa so'rov O'RTASIDA
  uzilardi va **kvota baribir sarflangan** bo'lardi — pul ketib, natija
  kelmasdi. Qorovul: Test 14g
- [2026-08-07] Qaror: **`AI_IMAGE_ENABLED` alohida bayroq, `AI_ENABLED`
  ning o'zi yetarli emas.** "Matn ishlaydi, rasm ishlamaydi" HAQIQIY holat:
  2026-08-06 da aynan shunday edi (matn 200, rasm 429 `limit: 0`).
  `AI_PROVIDER=openai` bo'lsa rasm o'chadi va jurnalda qichqiradi —
  OpenAI rasm yo'li YOZILMAGAN va u jimgina "ishlayotgandek" qolmasin
- [2026-08-07] Qaror: **`GET /api/ai/gallery` — FAQAT O'QISH.** Galereya
  sahifasi ochilishi generatsiya qildirsa, bitta aylanish butun kunlik
  limitni yeb qo'yardi. Generatsiya faqat `POST /api/ai/image` da
- [2026-08-07] Qaror: **bosh sahifa va katalog birlashtiriladi**, bo'shagan
  tab AI bo'limiga beriladi. Bosh sahifadagi filtr endi shu sahifada
  ochiladi — ilgari filtr bosish foydalanuvchini boshqa ekranga otib
  yuborardi
- [2026-08-07] Qaror: **promptda kiyinish odobi qat'iy** — yopiq, lekin
  zamonaviy va chiroyli; model Markaziy Osiyo ko'rinishida. Bu bozor
  qarori, texnik emas: natija O'zbekiston B2B xaridoriga ko'rsatiladi
- [2026-08-07] ⚠️ **Dars: preview brauzerda tab `hidden` bo'lgani uchun CSS
  transition MUZLAYDI.** Shu sababli navigatsiyada MAVJUD BO'LMAGAN nuqson
  IKKI MARTA "topildi". O'lchash usuli: o'tishni vaqtincha o'chirib
  tekshirish. Bu `tezlik-olchov-usuli` xotirasidagi "brauzer panelidagi FCP
  yolg'on (tab hidden)" darsining aynan **ikkinchi ko'rinishi** — ya'ni
  muammo bir marta emas, ikki marta shu joydan chiqdi
- [2026-08-07] ⚠️ **Dars: Test 5 (`Buzuq havola yo'q`) yo'llarni QO'LDA
  yozilgan ro'yxatdan oladi** — yangi endpoint unga avtomatik tushmaydi,
  `testRouteTable` esa avtomatik. "Qamrovni ro'yxat belgilaydi" naqshi:
  ro'yxat jimgina eskiradi va buni na test, na xato ko'rsatadi. Bu 2026-08-06
  dagi Test 16/17 darsining takrori — ochiq band sifatida yozildi
- [2026-08-07] Dars: **sessiya hisobotidagi test soni ham tekshirilmagan
  da'vo bo'lib chiqdi** — «32 → 36» deyilgandi, haqiqatda **34 → 37**
  (ikkala uchi ham noto'g'ri). Raqam ikki mustaqil usul bilan olindi:
  `grep -c` va `npm test` chiqishi. Xuddi shu narsa 2026-08-06 da
  «85 mahsulot» → 12 va «250 KB shrift» → 131 KB da bo'lgan edi

### 2026-08-07 (ikkinchi to'lqin — yopilgandan keyingi qatlam)

- [2026-08-07] Qaror: **orqa fon kesh kalitidan hosil qilinadi, TASODIFIY
  emas** (`sceneFor`). `Math.random()` ikki yo'ldan birini berardi va
  ikkalasi ham nuqson: sahna kesh kalitiga kirmasa tasodif KO'RINMAYDI
  (kod bor, natijasi yo'q — jimgina yolg'on), kirsa esa kesh butunlay
  o'ladi va ayni mato uchun qayta-qayta ~$0.04 to'lanadi. Kalitdan hosil
  qilinsa: boshqa mahsulot — boshqa fon, boshqa javob — boshqa fon, AYNI
  so'rov esa AYNI rasm. Lenta xilma-xil, hisob o'zgarmagan
- [2026-08-07] Qaror: **sahna XARIDORDAN so'ralmaydi.** `IMAGE_CHOICES` ga
  to'rtinchi guruh qilib qo'shilmadi — founder "2–3 savol" degan, va xaridor
  fon tanlagani emas, MATONI ko'rgani keladi
- [2026-08-07] Qaror: **prompt kesh kalitiga KIRADI (`PROMPT_VERSION`)** —
  bu sozlama emas, QOROVUL. Kesh kaliti promptga qaramasa, prompt yaxshilansa
  ham eski rasmlar abadiy qolardi va **ekranda hech narsa o'zgarmasdi**,
  holbuki kod yangi, test yashil, deploy muvaffaqiyatli. Bu `?v=` qoidasi
  bilan BITTA OILA: manba o'zgarsa versiya HAM oshadi. Qorovuli — Test 14l,
  u promptning O'ZINI hashlaydi, ya'ni matn tahrirlanib versiya qolsa test
  QIZIL bo'ladi (yozilgan qoida himoya emas — uni tekshiradigan test himoya)
- [2026-08-07] Qaror (founder): **kunlik limit o'rniga LOLA CREDIT** —
  har insonga 20 credit, bitta rasm 2 credit. Kunlik limitdan farqi
  TUSHUNCHADA: kredit — QOLDIQ va o'zi tiklanmaydi. Shu sababli "ertaga
  00:00 da yangilanadi" xabari UI dan OLIB TASHLANDI — 2026-08-06 da u
  haqiqat edi, bugun yolg'on bo'lardi. Qayta to'ldirish (kunlik yoki xarid)
  ATAYLAB yozilmadi: kerak bo'lganda ochiq qo'shiladi, "bir kun o'zi
  tiklanadi" degan taxminga tayanilmaydi
- [2026-08-07] Qaror: **`AI_UNLIMITED_TG_IDS` — `ADMIN_TG_IDS` dan ALOHIDA
  ro'yxat.** Admin ro'yxati moderatsiya haqida; unga qo'shilgan yangi odam
  jimgina cheksiz PUL sarflash huquqini ham olardi (~$0.04/rasm). Pulga
  tegadigan huquq alohida va ko'rinadigan ro'yxatda tursin.
  ⚠️ Cheksiz ro'yxatda ham **sarf BARIBIR yoziladi** (`ai_credits.spent`):
  yozuvni o'tkazib yuborish oson yo'l edi, lekin o'shanda hisob kelganda
  kim qancha sarflaganini ko'rsatadigan iz qolmasdi
- [2026-08-07] Qaror: **kimlik tekshiruvi tezlik chegarasidan OLDIN.**
  Teskari tartibda cheksiz ro'yxatdagi odam 7-so'rovda 429 olardi — ya'ni
  "cheksiz" jimgina yolg'on bo'lardi (kredit cheksiz, lekin daqiqada 6 ta)
- [2026-08-07] Qaror (founder): **`erkak` varianti olib tashlanadi.** Kalit
  o'chirildi, "yashirilsin" bayrog'i qo'yilmadi — oq ro'yxatda yo'q kalit
  o'zi 400 oladi. Bazadagi eski qatorlar O'CHIRILMAYDI (haqiqiy, pulga
  chizilgan rasmlar) va lentada `normalizeChoices` ning O'ZI bilan
  filtrlanadi — **ikkinchi ro'yxat yozilmaydi** (`db/014` darsi). Ro'yxat
  qaytsa, o'sha rasmlar ham qaytadi
- [2026-08-07] Qaror (founder, TAVSIYAGA QARSHI): **combo dizaynda ERKIN
  MATN bo'ladi.** Tavsiya "faqat oq ro'yxat" edi — sabab: erkin matn promptga
  boradi va prompt in'ektsiyasining to'g'ridan-to'g'ri yo'li. Founder
  qabul qildi, shuning uchun himoya kirishda va **ikki qavat**: shakl
  tekshiruvi (60 belgi, qavs/tirnoq/yangi qator o'tmaydi) va promptdagi
  devor — matn MA'LUMOT deb e'lon qilinadi, `ODOB` esa undan KEYIN turadi,
  chunki model oxirgi ko'rsatmalarga ko'proq og'irlik beradi. Qorovul —
  Test 14m
- [2026-08-07] Qaror: **erkin matn KESILMAYDI, uzun bo'lsa RAD ETILADI.**
  Jimgina qirqilsa xaridor yozganini emas, boshqasini olardi — ustiga bu
  pullik so'rov. Bo'sh matn kalit sifatida UMUMAN qo'shilmaydi: `{matn:''}`
  va matnsiz so'rov ikki xil kesh kaliti berardi va ayni rasm uchun ikki
  marta to'lanardi
- [2026-08-07] Qaror: **combo qo'shimchalari boshqa dizaynda JIMGINA
  tashlanadi, rad etilmaydi.** Xaridor combo'ni tanlab rangni to'ldirib
  keyin "minimalistik" ga o'tsa, klientda eski javob qolib ketadi — uni rad
  etish foydalanuvchi hech qanday xato qilmagan joyda yo'lni to'sardi.
  Tashlangani zararsiz: u na promptga, na kesh kalitiga kiradi.
  ⚠️ Bu `normalizeChoices` ning asosiy qoidasidan (notanish kalit — XATO)
  ataylab farq qiladi va farqning sababi shu izohda yozilgan
- [2026-08-07] Qaror: **kredit qoldig'i so'ralmasdan ko'rsatiladi**
  (`/api/ai/my` va har javobda). Ilgari foydalanuvchi chegarani faqat U
  TUGAGANDA bilardi, ya'ni pul sarflashdan oldin nechta qolganini ko'ra
  olmasdi. Keshdan o'qish esa **kredit YEMAYDI** — AI chaqiruvi bo'lmagan
  joyda to'lanadigan narsa ham yo'q (4-qarorning davomi)
- [2026-08-07] Qaror: **`AI_DAILY_LIMIT` va `ai_usage` O'CHIRILMAYDI.**
  Sozlama o'qiladi, lekin hech qayerda ishlatilmaydi; jadvalda haqiqiy tarix
  bor va uni o'chirish "qancha sarflangan" savolini javobsiz qoldirardi.
  "Almashtirishni qo'lga kiritmasdan eskisini o'chirma" oilasining baza
  ko'rinishi — `product_ai_ideas` bilan bitta qatorda
- [2026-08-07] Qaror: **`product_ai_image.tg_user_id` NULL bo'lishi mumkin**
  va bu ataylab: 019 gacha chizilgan rasmlarda muallif ma'lum EMAS. Uni
  "birinchi admin" yoki `0` bilan to'ldirish jimgina yolg'on bo'lardi —
  `NULL` esa "bilinmaydi" degani (reyting `NULL` qoidasi bilan bitta oila).
  Ustun keshni foydalanuvchi bo'yicha BO'LMAYDI: kalit hamon
  `(product_id, choices_hash)`, ya'ni ikkinchi odam ayni javoblar bilan
  so'rasa tayyor rasmni BEPUL oladi
- [2026-08-07] Dars: **`.env` da yana namuna qolib ketdi** —
  `AI_UNLIMITED_TG_IDS`. Bu 2026-08-05 dagi `ALERT_CHAT_ID` holatining aynan
  takrori, faqat bu safar **oqibati bo'lmadi**: `config.js` dagi shakl
  tekshiruvi uni tutdi va jurnalda qichqirdi. Ya'ni o'sha kuni yozilgan
  qoida bugun birinchi marta HAQIQIY nosozlikni ushladi — qorovul
  qo'yilgani nazariy foyda emas ekan

---

## 2026-08-07 (kechqurun) — Rasm funksiyasi kengaytirildi

Sprint 10 ertalab yopilgan edi; bu bo'lim founder o'sha kuni bergan to'rtta
yangi talab va ular ochib bergan nuqsonlar haqida.

### Bajarilgani

| Band | Natija |
|---|---|
| Orqa fon xilma-xilligi | 18 sahna (`SAHNA`), uslub bo'yicha 3 × 6 |
| Prompt versiyasi | `PROMPT_VERSION` kesh kalitida, hozir `v3` |
| Lola credit | 20 boshlang'ich, 1 rasm = 2 credit (`db/019`) |
| `erkak` varianti | olib tashlandi (founder qarori) |
| Dizayn yo'nalishi | neoklassika / zamonaviy / minimalistik / combo |
| Combo | rang + qo'shimcha material + ERKIN MATN |
| AI ekrani | sehrgar, mening rasmlarim, kredit, ulashish, buyurtma CTA |
| Testlar | 42 ta yashil (yangi: 14k, 14l, 14m, 14n) |

### Qarorlar

- [2026-08-07] Qaror: **orqa fon TASODIFIY EMAS, kesh kalitidan hosil
  qilinadi.** `Math.random()` ikki yo'ldan birini berardi: sahna kesh
  kalitiga kirmasa — birinchi chizilgan rasm abadiy qoladi va tasodif
  KO'RINMAYDI; kirsa — har bosishda yangi kalit tug'iladi va ayni mato
  uchun qayta-qayta ~$0.04 to'lanadi. Kalitning O'ZIDAN hosil qilinganda
  lenta xilma-xil bo'ladi, hisob esa o'zgarmaydi
- [2026-08-07] Dars: **kesh kaliti promptga umuman qaramasdi.** Prompt
  yaxshilansa ham allaqachon chizilgan rasmlar abadiy eski holida qolardi
  va galereya faqat shu keshdan oziqlanadi — kod yangi, testlar yashil,
  deploy muvaffaqiyatli, ekranda esa hech narsa o'zgarmagan. `?v=`
  qoidasining aynan o'zi, faqat fayl o'rniga prompt
- [2026-08-07] Dars: **qorovul pul sarflashga majburlasa, u qorovul emas.**
  Test 14l ning birinchi shakli hamma javob birikmasini birga hashlardi va
  shu sababli `erkak` OLIB TASHLANGANDA ham qizil bo'lardi — holbuki ayol
  rasmlarining prompti o'zgarmagan va ular keshda to'g'ri turibdi. Endi
  skelet va har bir variant iborasi alohida tekshiriladi; variant qo'shilishi
  yoki olib tashlanishi versiya oshirishni TALAB QILMAYDI
- [2026-08-07] Qaror: **kredit — QOLDIQ, kunlik limit emas.** Farq
  foydalanuvchiga aytiladigan gapda ko'rindi: kunlik limitda "ertaga 00:00 da
  yangilanadi" HAQIQAT edi, kreditda YOLG'ON — shuning uchun o'sha xabar UI
  dan o'chirildi, dead-code bo'lib qoldirilmadi
- [2026-08-07] Qaror: **`AI_UNLIMITED_TG_IDS` — `ADMIN_TG_IDS` dan alohida.**
  Admin ro'yxati moderatsiya haqida; unga qo'shilgan yangi odam jimgina
  cheksiz PUL sarflash huquqini ham olardi. Cheksiz yo'lda ham `spent`
  yoziladi — aks holda o'z xarajating ko'rinmas bo'lardi
- [2026-08-07] **PRODUCTION DARSI: provayder nosozligi xaridor hisobidan
  to'lanmaydi.** Gemini `HTTP 503 high demand` qaytardi va founder xato
  xabarini VA 2 credit kamaygan balansni ko'rdi. Kredit AI chaqiruvidan
  OLDIN yechiladi (bu ataylab — poyga oynasi uchun), lekin xatoda
  QAYTMASDI. `refundCredits` qo'shildi; `spent >= cost` sharti ikki marta
  qaytarishga yo'l qo'ymaydi. Telegram'ga yuklash yiqilganda ham
  qaytariladi — o'shanda Google'ga pul to'langan va zarar BIZNIKI, xaridor
  esa rasm olmagani uchun to'lamaydi. Qaytarish xatosi ASL xatoni bosib
  ketmasin: aks holda alertda "gemini 503" o'rniga "baza band" ko'rinib
  tashxis yo'qolardi. Qorovul: Test 14n
- [2026-08-07] Qaror: **erkin matn — founder qarori, tavsiyaga QARSHI.**
  Tavsiya "faqat oq ro'yxat" edi (uch sabab: `ODOB` promptda yashaydi va
  matn uni bekor qilishi mumkin; cheksiz kesh kaliti; chiqishda ikki
  marta qochirish). Founder: "erkin matn shunsiz ham bo'lmaydi". Shuning
  uchun himoya KIRISHGA qo'yildi va u ikki qavat — shakl tekshiruvi
  (`cleanComboText`) va promptdagi devor, `ODOB` matndan KEYIN turadi
- [2026-08-07] Dars: **hujjatda yozilgani qo'llanganini bildirmaydi.**
  `server/README.md` da `/api/ai/image` uchun 180s nginx bloki yozilgan,
  konfiguratsiyada esa YO'Q ekan — 30 soniyada nginx ulanishni uzadi,
  foydalanuvchi 504 ko'radi, kredit esa allaqachon yechilgan bo'ladi.
  "Tekshirilmagan da'vo" qoidasining nginx dagi ko'rinishi

### Ochiq qolgani

- Kredit **qayta to'ldirilmaydi** (kunlik ham, xarid orqali ham) — 20 ta
  tugagach foydalanuvchi to'xtaydi. Ataylab: qaysi shakl kerakligi hali
  hal qilinmagan va "bir kun o'zi tiklanadi" degan taxminga tayanilmadi
- nginx 180s bloki hali qo'llanmagan (buyruq founderga berildi)
- Galereyada `erkak` va 018 dan oldingi (javobsiz) rasmlar endi
  ko'rsatilmaydi — o'chirilmadi, faqat yashirildi

---

## 2026-08-08 — Production'dan kelgan uch nosozlik yopildi

Sprint 10 allaqachon `tugadi` holatida; bu bo'lim funksiya TIRIK ishlab
turgan holda chiqqan uchta nosozlik haqida. Ikkitasi Telegram alertidan,
biri kredit yo'lidan keldi.

### Bajarilgani

| Band | Natija |
|---|---|
| 503 qayta urinish | 2s+5s → 2s+5s+10s, ±25% jitter, 500/502/503/504 |
| `javobda parts yo'q` | sabab `finishReason` dan olinadi (`refusalReason`) |
| Xato TURI | `busy` / `blocked` ajratildi, route `ai_busy` (503) / `ai_blocked` (422) qaytaradi |
| Alert kaliti | provayder bandligi alohida kalitga chiqdi |
| Klient | ikki yangi holat + `aiBusy` / `aiBlocked` yorliqlari (uz/ru) |
| `takeCredits` SQL | `$2::int - $3::int` — `unknown - unknown` tuzatildi |
| Testlar | 42 ta yashil (yangi: 14o; 14f kengaytirildi) |
| Kesh | `app.js?v=71` → `?v=72` |

### Qilingan ishlar

- [2026-08-08] 503 qayta urinish uzaytirildi — ikki urinish bandlik
  to'lqinidan chiqishga yetmagani production'da ko'rindi (ketma-ket 5 ta
  alert); jitter qo'shildi, `QAYTA_URINILADI` = 500/502/503/504
- [2026-08-08] `extractImage` ning ko'r xato yo'li yopildi — `parts` yo'q
  javobda ham sabab (`IMAGE_SAFETY`, `PROHIBITED_CONTENT`, …) xato matniga
  tushadi
- [2026-08-08] `routes/ai.js` xato turiga qarab uch xil javob qaytaradi;
  kredit uchalasida ham qaytariladi (o'zgarmadi)
- [2026-08-08] Mini App'da `busy` va `blocked` holatlari — `blocked` da
  tugma "Qayta urinish" EMAS, "Boshqacha chizish"
- [2026-08-08] `takeCredits` dagi `VALUES ($1, $2 - $3, $3)` tuzatildi —
  turi ko'rsatilmagan ikki parametr Postgres uchun `unknown` edi
- [2026-08-08] Test 14o qo'shildi (6 band), Test 14f kengaytirildi;
  qorovul uch xil orqaga qaytarish bilan tekshirildi va uchalasida ham
  qizil bo'ldi

### Qarorlar

- [2026-08-08] Qaror: **429 qayta urinish ro'yxatiga KIRMAYDI va buni endi
  test qo'riqlaydi.** 2026-08-06 darsi: bepul tarifda kvota `limit: 0` edi
  va Google'ning o'z xabari "27 soniyadan keyin urinib ko'ring" derdi —
  kutish HECH QACHON yordam bermasdi. 429 ni takrorlash faqat javobni
  sekinlashtiradi va sababni yashiradi. `500 INTERNAL` esa AKSINCHA
  ro'yxatga kiritildi: Gemini uni bandlik cho'qqisida 503 bilan bir xil
  ma'noda qaytaradi
- [2026-08-08] Qaror: **jitter bezak emas, qorovul.** Kutish aniq 2s/5s
  bo'lsa bandlikda yiqilgan HAMMA so'rov bir vaqtda uyg'onib band
  provayderga birdan urardi — ya'ni qayta urinishning O'ZI bandlikni
  kuchaytirardi. Umumiy kutish 17s: nginx chegarasiga sig'ishi kerak,
  aks holda foydalanuvchi 504 ko'rardi va server hamon ishlab turardi
- [2026-08-08] Qaror: **xato TURI belgi bilan uzatiladi, matn tahlili
  bilan emas** (`e.kind`). Matnni o'qib "band ekan" deb topish yo'li
  ataylab tanlanmadi — provayder xato matnini o'zgartirsa u JIMGINA
  ishlamay qolardi va foydalanuvchi yana umumiy xato ko'rardi
- [2026-08-08] Qaror: **`MAX_TOKENS` rad etish EMAS.** U bizning
  tomondagi nosozlik va uni `blocked` deb belgilash foydalanuvchiga
  "javoblaringizni o'zgartiring" deb YOLG'ON aytardi — o'zgartirish esa
  hech narsani hal qilmasdi. Testda alohida band bilan qulflandi
- [2026-08-08] Qaror: **provayder bandligi alohida alert kalitida.** U
  bizning nosozligimiz emas va tez-tez takrorlanadi; umumiy
  `aiImage xatosi:` kalitida qolsa haqiqiy nuqsonni Telegram'da ko'mib
  yuborardi. Birinchi argument o'zgarmas — Test 10c qoidasi saqlandi
- [2026-08-08] Qaror: **xabar kredit qaytarilganini AYTADI.** Server uni
  allaqachon qaytarardi, lekin buni jim qoldirardi va xaridor "pulim
  ketdi" degan shubhada qolardi. Qaytarish faqat kodda bo'lsa u
  foydalanuvchi uchun mavjud emas
- [2026-08-08] Dars: **taqlid qilingan `pool.query` SQL matnini
  TEKSHIRMAYDI.** `takeCredits` dagi `unknown - unknown` production'da
  yiqildi, Test 14c esa yashil turardi — chunki u `pool.query` ni taqlid
  qiladi va SQL hech qachon haqiqiy Postgres'ga bormaydi. Qorovul
  matnning O'ZIGA qo'yildi (Test 14o, 6-band): ikki `$N` orasidagi
  arifmetikada tur ko'rsatilmasa test qizil bo'ladi
- [2026-08-08] Dars: **izohdagi "Qorovul: Test 14o" ning o'zi qorovul
  emas.** `::int` tuzatilganda izohga shunday yozilgan edi, Test 14o esa
  o'sha bandni UMUMAN tekshirmasdi — ya'ni himoya bor deb ishonilardi va
  yo'q edi. Bu CLAUDE.md dagi "yozilgan qoida himoya emas — uni
  tekshiradigan test himoya" qoidasining aynan o'zi, faqat bu safar
  yolg'on da'vo izohda turardi. Band qo'shilgach izoh haqiqatga aylandi
- [2026-08-08] Dars: **test soni yana noto'g'ri sanaldi.** Sessiya
  yakunida "45 test (avval 44 edi)" deb yozilgandi, o'lchov esa
  **42 (avval 41)** berdi. Bu `docs`dagi raqam qoidasining uchinchi
  takrori — raqam yozilishidan oldin `node test.js` bilan sanalsin

### Ochiq qolgani

- **503 ning ildizi bizda emas** — bu Google tomonidagi bandlik va qayta
  urinish uni kamaytiradi, YO'Q QILMAYDI. Butunlay yopish uchun zaxira
  rasm modeli kerak, `AI_IMAGE_MODEL` esa hozir bitta qiymat
  (`config.js`) — ya'ni bu band kodni emas, sozlama shaklini o'zgartiradi
- Yangi xato yo'llari production'da hali KO'RILMAGAN: `ai_busy` va
  `ai_blocked` ekranlari faqat testda tekshirilgan. Deploy'dan keyin
  haqiqiy 503 kutiladi va xabar QO'LDA tasdiqlansin

---

## 2026-08-09 — FASON banki: "har safar bir xil ko'ylak" yopildi

Sprint 10 hamon `tugadi` holatida — bu bo'lim funksiya TIRIK ishlab turgan
holda founderning **sifat bahosidan** chiqqan o'zgarish haqida.

Founder AI rasm sifatini **10 dan 4** deb baholadi. Quiz o'tkazildi va asosiy
shikoyat aniqlandi: *"ko'ylak fasonini zo'r qilmayapti har safar, bir xil
defolt fason turibdi"*.

### Tashxis — taxmin emas, KODDA tasdiqlangan

Nuqson modelda emas, **promptning muvozanatida** edi va uni prompt matnining
o'zini o'qib ko'rish ochdi:

| Band | Qanday yozilgan | Kuchi |
|---|---|---|
| `kiyim` | `a modern long dress` — **4 so'z** | bo'sh |
| `ODOB` | yopiq yoqa, uzun yeng, tizzadan uzun, tanaga yopishmasin | to'rt tomondan aniq chegara |

**Aniq ko'rsatma bo'sh ko'rsatmani HAR DOIM yengadi.** Shuning uchun har
rasmda odob g'olib chiqib fason yo'qolardi va model o'sha qutiga eng xavfsiz
javobni — bitta shaklsiz uzun ko'ylakni — qaytaraverardi.

⚠️ Muhim tafsilot: shikoyat "AI yomon" degan taassurot berardi, sabab esa
**bizning promptimizda** edi. Model almashtirilganda hech narsa o'zgarmasdi.

### Bajarilgani

| Band | Natija |
|---|---|
| FASON banki | 7 o'q (yoqa 6, yeng 6, bel 5, etak 5, shim 4, bogla 5, ost 5, detal 6) — **42 ibora**, ko'ylak uchun **5400** birikma |
| `fasonFor()` | `SAHNA` naqshi — kesh kalitidan hosil qilinadi, har o'q MUSTAQIL seed bilan |
| `FASON_OQLARI` | qaysi buyumga qaysi o'q qo'llanadi (ro'molda yeng ham, etak ham yo'q) |
| `kim` savoli | **BUTUNLAY olib tashlandi** — model promptda qotib turadi (`MODEL_ODAM`) |
| Rasm nisbati | `imageConfig.aspectRatio = '3:4'` — ilgari `generationConfig` UMUMAN yo'q edi |
| `KADR` | to'liq bo'y poyabzalgacha, ko'z darajasi, 85mm, yuz yon/pastga, aksessuar yo'q |
| `KADR_SOCH` | alohida ajratildi va bosh kiyimda TASHLANADI |
| `TAQIQ` | maneken, ikkinchi odam, kollaj, ko'zgu, flat-lay, buzilgan qo'l |
| `comp_uz` | endi TALAB qilinadi: "let the garment drape the way this composition really behaves" |
| `dizayn` uchala iborasi | abstrakt tilakdan aniq konstruksiyaga qayta yozildi |
| "Boshqa fason" tugmasi | `variant` (1..5) kesh kalitida — yangi rasm, yangi kredit, narx tugmaning O'ZIDA |
| `joriyJavobmi()` | galereya filtri — eski tekshiruv `kim` guruhi ketgach JIMGINA ishlamay qolardi |
| `PROMPT_VERSION` | 3 → 4 |
| Testlar | **43 → 44** (yangi 14p; 14i kengaytirildi; 14j/14k/14m `kim` siz holatga moslandi) |
| Kesh | `app.js?v=72` → `?v=73` |

### Qilingan ishlar

- [2026-08-09] **FASON banki qo'shildi** (`server/lib/ai.js`) — 7 o'q, 42 ibora.
  `fasonFor()` ularni SAHNA naqshi bo'yicha kesh kalitidan hosil qiladi, har
  o'q MUSTAQIL seed bilan. Har bir ibora ODOBGA MOS (yopiq yoqa, uzun yeng,
  tizzadan uzun) — aks holda prompt o'zi bilan urishardi va model ziddiyatni
  yana o'rtacha javob bilan hal qilardi
- [2026-08-09] `FASON_OQLARI` jadvali — qaysi buyumga qaysi o'q qo'llanadi.
  Bu `IMAGE_CHOICES.kiyim` ning ikkinchi ro'yxati EMAS: u kalitlarni
  takrorlamaydi, ularga XOSSA biriktiradi. Farqni Test 14p ushlab turadi
- [2026-08-09] **`kim` savoli BUTUNLAY olib tashlandi** (founder: "bola kerak
  emas, defolt ayol tura qolsin"). Kalit emas, BUTUN SAVOL ketdi — bitta
  variantli savol savol emas. Xaridorga 4 emas **3 savol** qoldi
- [2026-08-09] **Rasm nisbati qo'shildi** — API so'rovida `generationConfig`
  UMUMAN yo'q edi, endi `imageConfig.aspectRatio = '3:4'` (founder tanlovi)
- [2026-08-09] `KADR` bloki — to'liq bo'y poyabzalgacha, ko'z darajasi, 85mm,
  yuz yon/pastga qaragan, aksessuar yo'q. Ilgari kadr haqida BITTA ibora bor
  edi ("full-body photograph") va u kamera haqida hech narsa aytmasdi
- [2026-08-09] `KADR_SOCH` alohida ajratildi va bosh kiyimda tashlanadi.
  Shart `kiyim === 'romol'` emas, **o'qdan** olinadi (`db/014` darsi)
- [2026-08-09] `TAQIQ` salbiy ro'yxati — maneken, ikkinchi odam, kollaj,
  ko'zgu, flat-lay, buzilgan qo'l
- [2026-08-09] `comp_uz` endi faqat AYTILMAYDI, undan TALAB qilinadi
- [2026-08-09] `dizayn` uchala iborasi qayta yozildi — abstrakt tilakdan
  ("relaxed modern cut") aniq konstruksiyaga
- [2026-08-09] **"Boshqa fason" tugmasi** (`telegram-app/app.js`) — `variant`
  (1..`VARIANT_MAX`=5) kesh kalitiga kiradi. Chegara SERVERDAN keladi
  (`aiVariantMax`, `/api/auth/telegram`). Javob o'zgarsa yoki "boshqacha
  chizish" bosilsa variant nolga qaytadi
- [2026-08-09] `joriyJavobmi()` qo'shildi — galereya filtri. Ro'yxat qo'lda
  emas, jadvallardan hosil qilinadi
- [2026-08-09] `PROMPT_VERSION` 3 → 4 — butun kesh eskiradi, har rasm bir
  marta qayta chiziladi (~$0.04), **faqat so'ralganda**
- [2026-08-09] Yangi **Test 14p** (fason xilma-xilligi, kesh buzilmasligi,
  ODOB bilan ziddiyat yo'qligi, o'qlar mustaqilligi, har kiyim turi
  chizilishi). Test 14i ga `variant` va `joriyJavobmi` qorovullari qo'shildi.
  `PROMPT_QOROVUL` v4 ga yangilandi (86 variant). 14j/14k/14m `kim` siz
  holatga moslandi
- [2026-08-09] `telegram-app/index.html` — `app.js?v=72` → `?v=73`
- [2026-08-09] `loyiha-panel.html` — `panel.js?v=9` → `?v=10`, Test 16
  jadvali yangilandi

### Sinov

- **44 test PASS.** ⚠️ Raqam IKKI MUSTAQIL usul bilan olindi:
  `grep -c "✅ Test "` = **44** va `node server/test.js` chiqishidagi qatorlar
  = **44**. HEAD dagi holat 43 edi
- `node --check` barcha o'zgargan fayllarda o'tdi
- **Prompt uch xil kiyim turi uchun CHOP ETILIB ko'zdan kechirildi** va aynan
  shu yo'l bilan ikkita ziddiyat topildi: ro'mol + "sochi ko'rinib tursin",
  kostyum + "floor-skimming hem". **Ikkalasini ham test tutmagan bo'lardi** —
  har ikkala jumla alohida to'g'ri, ziddiyat faqat BIRGA o'qilganda ko'rinadi

### Qarorlar

- [2026-08-09] Qaror: **fason TASODIFIY EMAS, kesh kalitidan hosil qilinadi**
  (`fasonFor`). `SAHNA` qarorining aynan takrori va u ataylab: naqsh shu
  loyihada allaqachon SINALGAN. `Math.random()` ikki yo'ldan birini berardi
  va ikkalasi ham nuqson — kesh kalitiga kirmasa tasodif KO'RINMAYDI, kirsa
  kesh o'ladi va ayni mato uchun qayta-qayta ~$0.04 to'lanadi
- [2026-08-09] Qaror: **har o'q MUSTAQIL seed oladi.** Bitta seed'dan hamma
  o'q olinsa ular birga harakatlanardi — 6 xil yoqa emas, 6 xil TO'PLAM
  chiqardi va xilma-xillik o'nlab marta kamayardi. O'q nomi seed'ga
  qo'shilgani uchun ular bir-biridan mustaqil aylanadi: ko'ylak uchun
  6×6×5×5×6 = **5400** fason
- [2026-08-09] Qaror: **har bir fason iborasi ODOBGA MOS bo'lishi SHART.**
  Aks holda ikki band bir-biriga zid buyruq berardi va tuzatilayotgan
  nuqsonning O'ZI qaytardi. Ro'yxatga yangi ibora qo'shilsa shu chegara
  saqlansin
- [2026-08-09] Qaror (founder): **`kim` guruhi butunlay olib tashlanadi.**
  2026-08-07 da `erkak` kaliti ketgandi, bugun `bola` ham ketdi va guruh
  bitta variant bilan qoldi — bitta variantli savol savol emas, u shunchaki
  bosiladigan tugma bo'lardi. Model `MODEL_ODAM` da qotib turadi va yosh
  oralig'i ATAYLAB yozilgan: aytilmasa har rasmda boshqa yosh chiqib lenta
  bir butun ko'rinmasdi
- [2026-08-09] ⚠️ **Yozib qoldirilgan TEKSHIRILMAGAN gumon:** Google rasm
  modellari fotorealistik BOLA tasvirini bloklaydi deb o'ylaymiz va
  production'dagi `IMAGE_PROHIBITED_CONTENT` ning bir qismi shundan bo'lishi
  mumkin edi. **Buni O'LCHAMADIK** — guruh boshqa sababga ko'ra ketdi.
  Ya'ni rad etishlar shundan keyin ham davom etsa, sabab bola EMAS edi.
  Gumon kod izohida ham turibdi — "hujjatdagi raqam tekshirilmagan da'vo"
  qoidasining oldini olish shakli: taxmin taxmin deb belgilandi
- [2026-08-09] Qaror: **soch qoidasi kadrdan AJRATILADI.** Ro'mol sochni
  yopadi, ya'ni "sochi yig'ilgan va ko'rinib turadi" bilan bitta promptda
  tursa gap o'zi bilan urishardi. Shart o'qdan olinadi, `kiyim === 'romol'`
  dan emas — aks holda `IMAGE_CHOICES.kiyim` ning ikkinchi ro'yxati paydo
  bo'lardi
- [2026-08-09] Qaror: **"Boshqa fason" tugmasi variantni AVTOMATIK
  oshirmaydi.** Har variant alohida kesh kaliti, ya'ni alohida ~$0.04 va
  alohida kredit — pul sarflaydigan qarorni foydalanuvchi qabul qiladi.
  Narx tugmaning O'ZIDA yozilgan, bosishdan OLDIN: yonidagi "Boshqacha
  chizish" TEKIN va farqi ko'rinmasa xaridor bilmagan holda pul sarflardi
- [2026-08-09] Qaror: **`VARIANT_MAX` serverdan keladi va chegaraga
  yetganda tugma UMUMAN chizilmaydi.** Klientdagi boshlang'ich qiymat `0` —
  javob kelmaguncha tugma yo'q. Zaxira raqam qo'yilsa va server boshqa
  chegara bilan ishlasa xaridor tugmani bosib "javob yaroqsiz" xatosini
  ko'rardi, ustiga bu pullik yo'l (`db/014` darsi, `aiComboTextMax` bilan
  bitta oilada)
- [2026-08-09] Qaror: **`variant = 0` kalitni UMUMAN qo'shmaydi.**
  `{variant:0}` va variantsiz so'rov ikki xil kesh kaliti berardi va
  birinchi rasm uchun ikki marta to'langan bo'lardi (`matn` bilan aynan bir
  sabab)
- [2026-08-09] **Dars: guruh olib tashlash galereya filtrini JIMGINA
  buzardi.** `joriyMi` to'g'ridan-to'g'ri `normalizeChoices` ni chaqirardi va
  2026-08-07 da bu YETARLI edi — o'shanda olib tashlangan narsa guruh
  ICHIDAGI kalit edi (`kim: erkak`). Bugun butun GURUH ketdi va
  `normalizeChoices` faqat O'ZI biladigan guruhlarni aylangani uchun
  notanish `kim` kaliti e'tibordan chetda qolardi — bazadagi `kim=erkak` va
  `kim=bola` rasmlari lentaga QAYTIB kelardi. Nuqson jimgina: kod yangi,
  test yashil, lentada esa olib tashlangan variantlar. Farq
  `joriyJavobmi()` da: `normalizeChoices` "javob yetarlimi" ni tekshiradi,
  `joriyJavobmi` esa "javob ORTIQCHA emasmi" ni ham
- [2026-08-09] **Dars: ziddiyatni TEST emas, promptni CHOP ETISH topdi.**
  Ikkita nuqson (ro'mol + soch, kostyum + "floor-skimming hem") faqat
  shu yo'l bilan ko'rindi va ularni test tuta olmasdi — har ikkala jumla
  ALOHIDA to'g'ri, ziddiyat faqat birga o'qilganda paydo bo'ladi. Ya'ni
  prompt — kod emas, MATN, va matnni o'qish kerak
- [2026-08-09] **Dars: sessiya hisobotidagi test soni YANA noto'g'ri
  bo'ldi** — "34 test" deb aytilgandi, o'lchov **44** berdi. Bu
  `hujjatdagi raqam — tekshirilmagan da'vo` qoidasining **to'rtinchi**
  takrori (avvallari: «85 mahsulot» → 12, «250 KB shrift» → 131 KB,
  «32 → 36» → 34 → 37, «45 test» → 42). Raqam yozilishidan oldin
  `node server/test.js` bilan sanalsin

### Ochiq qolgani

1. ⚠️ **Rasm nisbati o'zgarishi production'da TEKSHIRILMAGAN.** Ilgari nisbat
   qanday bo'lgani ham O'LCHANMAGAN (lokalda API kaliti yo'q) — ya'ni bu
   hozircha **tekshirilmagan da'vo**. Agar `imageConfig` ni model qabul
   qilmasa **HTTP 400** keladi va sabab javob tanasida ko'rinadi. Orqaga
   qaytarish — faqat o'sha blokni olib tashlash, boshqa hech narsaga tegmaydi.
   Deploy'dan keyin BIRINCHI rasmda tasdiqlansin
2. **Fason banki sifatni oshirgani hali QO'LDA baholanmagan** — bu sprintning
   o'z darsi: testlar o'tishi rasm CHIROYLI chiqqanini isbotlamaydi, u faqat
   ro'yxatlar mos va kesh buzilmaganini isbotlaydi. Founder bahosi 4 edi;
   yangi baho deploy'dan keyin olinsin
3. **Bola gumoni o'lchanmagan** (yuqoridagi qarorga qara) — rad etishlar
   davom etsa sabab boshqa joyda
4. `PROMPT_VERSION` 4 ga o'tgani uchun mavjud har bir rasm bir marta qayta
   chiziladi (~$0.04 × so'ralganlari). Bu ATAYLAB va narxi ochiq yozildi

---

## 2026-08-13 — AI kiyim rasmi SAYTDA (C1)

Sprint 10 hamon `tugadi` holatida. Bu bo'lim funksiyaning O'ZI haqida emas —
u ishlab turgan edi — balki **u KIMGA yetib borgani** haqida: AI rasmi faqat
Mini App'da mavjud edi, lolamarket.uz xaridori esa uni umuman ko'rmasdi.

### Tashxis — qoida YOZILGAN edi, naqsh esa TAKRORLANGAN

2026-08-12 da CLAUDE.md ga "kimlik IKKI KANALDA ham bitta nuqtadan olinadi"
qoidasi yozilgan edi. O'sha kuni u bahs ochish (`/api/disputes`) uchun
tuzatildi. **AI endpointi esa eski holida qoldi:**

| Endpoint | Kimlik | Sayt xaridori nima ko'radi |
|---|---|---|
| `POST /api/ai/image` | `authUser()` — faqat `initData` | jimgina **HTTP 401** |
| `GET /api/ai/my` | `authUser()` — faqat `initData` | jimgina **HTTP 401** |

⚠️ Bu qoidaning kuchsizligi emas, uning **tabiati**: qoida yozilgani uni
bajarilgan qilmaydi. Loyihaning o'z darsi yana tasdiqlandi — **yozilgan qoida
himoya emas, uni tekshiradigan TEST himoya** (`console.error`, `?v=`,
`ALERT_CHAT_ID` bandlari bilan bitta oila). Shuning uchun bu safar tuzatish
bilan BIRGA qorovul yozildi (Test 3f).

Ikkinchi to'siq: sozlama. AI savol kalitlari `/api/auth/telegram` javobining
ICHIDA qo'lda yig'ilardi, ya'ni **sayt bu blokni umuman olmasdi** — savollarni
chizishning iloji yo'q edi. Uni ikkinchi endpointga NUSXA ko'chirish esa
`db/014` naqshining o'zi bo'lardi (bir xil ro'yxat ikki joyda → jimgina
ajralib ketadi).

### Bajarilgani

| Band | Natija |
|---|---|
| `routes/ai.js` | `authUser()` → `await requestUser(req)` — ikkala joyda (`handleAiImage`, `handleAiMy`) |
| `aiClientConfig()` | YANGI (`lib/ai.js`) — mijoz sozlamasining YAGONA manbai; nusxa emas, **bitta funksiya ikki endpointda** |
| `/api/auth/web/me` | endi AYNI sozlamani beradi — **kirmagan foydalanuvchiga ham** |
| `script.js` | AI bloki **+432 qator**, **13 yangi funksiya** — Mini App'dagi HAMMA holat qoplandi |
| Kirmagan holat | blok KO'RINADI, tugma o'rniga "Kirish"; kirgandan keyin AYNI mahsulotga qaytadi |
| `style.css` | **+179 qator** — hammasi MAVJUD tokenlardan, yangi rang/o'lcham o'ylab topilmadi |
| **Test 3f** | YANGI qorovul — sayt chaqirgan endpoint sayt kimligini bilishini tekshiradi |
| Yo'l-yo'lakay nuqson | `input` delegatsiyasi `data-arg` ni UZATMASDI — erkin matn so'rovga TUSHMASDI |
| Poyga tuzatildi | sozlama kech kelsa AI bloki JIMGINA yo'q bo'lardi — endi tafsilot qayta chiziladi |
| Kesh | `style.css?v=40 → 41` (index.html VA admin/index.html), `script.js?v=30 → 31` |
| Testlar | **53 → 54** |

### Qilingan ishlar

- [2026-08-13] **`routes/ai.js` kimligi ikkala kanaldan** — `authUser()` →
  `requestUser()` (`handleAiImage`, `handleAiMy`). Ilgari sayt xaridori bir
  xil tugmani bosib JIMGINA 401 olardi. ⚠️ Ikkala yo'l ham kimlikni SERVER
  tomonda hal qiladi (imzolangan `initData` yoki HttpOnly cookie) — klientdan
  `tg_user_id` baribir olinmaydi: kredit hisobi shu ID ga bog'langan, ya'ni
  u yerdagi xato "boshqaning kreditini sarflash" degani bo'lardi
- [2026-08-13] **`aiClientConfig()` qo'shildi** (`server/lib/ai.js`) — bayroq,
  savol kalitlari, combo kalitlari va ikkita chegara BITTA joydan. Ikkinchi
  endpointga nusxa KO'CHIRILMADI: yangi savol guruhi qo'shilsa u avtomatik
  ikkala kanalga boradi. `enabled: false` bo'lsa qolgan maydonlar `null` —
  frontend savolsiz so'rov yubora olmaydi
- [2026-08-13] `routes/catalog.js` — `/api/auth/telegram` dagi qo'lda yig'ilgan
  blok o'sha funksiyaga almashtirildi (xatti-harakat o'zgarmadi)
- [2026-08-13] `routes/web-auth.js` — `/api/auth/web/me` endi AYNI sozlamani
  qaytaradi. ⚠️ **Kirmagan foydalanuvchiga ham** (`user: null`): aks holda AI
  funksiyasi kirmagan odam uchun MAVJUD EMASday ko'rinardi va u nima uchun
  kirishini bilmasdi
- [2026-08-13] **Saytga AI bloki** (`script.js`, **+432 qator, 13 funksiya** —
  `git diff` bilan SANALDI, taxmin emas): `aiSection()`,
  `pickAiChoice`, `askAiImage`, `resetAiImage`, `otherCutAiImage`, `setAiText`,
  `shareAiImage`, `loginForAi`, `loadAiCredits`, `aiCreditLine`,
  `aiOtherCutBtn`, `readAiConfig`, `repaintDetail`. Mini App'dagi hamma holat
  qoplandi: savollar, combo shoxi (shartli 2 savol + erkin matn), kutish,
  provayder band, model rad etdi, kredit tugadi, surat yo'q, texnik xato,
  natija. Savol kalitlari SERVERDAN — sayt o'zi hech narsa o'ylab topmaydi
- [2026-08-13] **Kirmagan foydalanuvchida blok YASHIRILMAYDI** — tugma o'rniga
  "Kirish" turadi va kirgandan keyin xaridor AYNI mahsulotga qaytadi
  (`afterLoginView = 'detail'`). Blokni yashirish funksiyani mavjud emasday
  ko'rsatardi
- [2026-08-13] `style.css` — AI uslublari (**+179 qator**) Mini App'dan olib
  o'tildi. Har qiymat MAVJUD tokenlardan, aylanish animatsiyasi mavjud
  `auth-spin` dan: yangi rang yoki o'lcham kiritilsa sayt bilan Mini App
  jimgina ajralib ketardi
- [2026-08-13] **Yo'l-yo'lakay nuqson: `input` delegatsiyasi `data-arg` ni
  UZATMASDI** (`script.js`). Mini App uzatadi, sayt esa yo'q — natijada AI
  erkin matni `aiText[undefined]` ga yozilardi va **xaridor yozgan izoh
  so'rovga UMUMAN tushmasdi**. Konsolda xato yo'q, tugma ishlaydi, natija
  boshqa. Delegatsiya endi `fn(qiymat, data-arg)` chaqiradi — ikkala klientda
  BITTA shartnoma. ⚠️ Bu nuqson kodni o'qib emas, **brauzerda o'lchab** topildi
- [2026-08-13] **Poyga tuzatildi:** `/api/auth/web/me` asinxron, ya'ni sekin
  tarmoqda xaridor mahsulotni sozlama kelgunicha ochib ulgurardi va o'shanda
  AI bloki JIMGINA yo'q bo'lardi. Endi sozlama kelganda ochiq turgan tafsilot
  oynasi qayta chiziladi — FAQAT `detail`: checkout'ga tegilsa xaridor
  yozayotgan maydonlar o'chib ketardi
- [2026-08-13] **Yangi Test 3f** (`server/test.js`) — sayt chaqirgan endpoint
  sayt kimligini bilishini tekshiradi. Ro'yxat QO'LDA yozilmaydi: `script.js`
  dan saytning O'Z chaqiruvlari (yo'l + METOD) yig'iladi, `server.js`
  router'idan handler nomi topiladi, `routes/` dagi funksiya TANASI o'qiladi.
  Tanada `authUser(` bo'lib `requestUser(`/`webSessionUser(` bo'lmasa — QIZIL
- [2026-08-13] `index.html` va `admin/index.html` — `style.css?v=40 → 41`
  (IKKALASI birga), `index.html` — `script.js?v=30 → 31`. Test 16 jadvali
  yangilandi. ⚠️ **Test 16 amalda ushladi** — jadval yangilanmagan holatda
  test qizil bo'ldi, ya'ni qorovul haqiqiy ish qildi
- [2026-08-13] `CLAUDE.md` — "kimlik ikki kanalda" qoidasi ostiga naqsh
  takrorlangani va uni endi Test 3f qo'riqlashi yozildi
- [2026-08-13] `loyiha-panel.html` — `panel.js?v=11` → `?v=12`, Test 16
  jadvali yangilandi

### Sinov — nima TASDIQLANDI

- **54 test PASS.** ⚠️ Raqam IKKI MUSTAQIL usul bilan olindi:
  `grep -c "✅ Test " server/test.js` = **54** va `npm test` chiqishidagi
  qatorlar = **54**. HEAD dagi holat **53** edi
- **Test 3f 5 mutatsiya bilan sinaldi, 5 tasi ham ushlandi.** Sinov IKKITA
  TESHIK ochdi va ikkalasi ham tuzatildi:
  (a) **izohdagi** `requestUser()` so'zi qorovulni aldardi — endi tahlildan
  oldin izohlar olib tashlanadi (`kodSofi`);
  (b) o'ram funksiyaning **NOMIGA** ishonish yetarli emas — `reviewAuthor` ning
  cookie yo'li o'chirilganda ham test yashil qolardi, endi o'ramning ICHI ochib
  ko'riladi (`kengaytir`)
- **Brauzerda o'lchangani** (stub server bilan): sozlama serverdan yetib keldi
  (3 guruh, 13 chip), kirmagan holatda "Kirish" tugmasi, chip tanlash va
  hisoblagich, CTA faqat hamma javob berilganda ochilishi, combo shoxi
  (6 savol + matn maydoni, `maxlength` SERVERDAN = 60), so'rov tanasi
  (`{productId, choices:{kiyim,uslub,dizayn,matn,variant}}`), "boshqa fason"
  variantni 1 ga oshirishi, natija bloki (394px, rasm yuklandi, yorliq
  joyida), mobil ko'rinish (gorizontal oqim yo'q)
- **OLTI xato holati o'lchandi:** busy · blocked · nocredit · nophoto · error ·
  tarmoqsiz. Ustiga 401 → "Kirish" → kirgandan keyin AYNI mahsulotga qaytish
- **Poyga 15 soniyalik sun'iy kechikish bilan tasdiqlandi** — sozlama kech
  kelganda ochiq tafsilot oynasi qayta chizildi
- ⚠️ **Stub sozlamani O'YLAB TOPMADI:** u haqiqiy `aiClientConfig()` dan oldi,
  sayt yuborgan so'rov tanasi esa serverning haqiqiy `normalizeChoices()` idan
  o'tkazildi va qabul qilindi. Aks holda sinov o'zini o'zi tekshirgan bo'lardi
- **Xavfsizlik:** sayt yo'li cookie bilan ishlaydi, lekin sessiya cookie'si
  `SameSite=Lax` va CORS aniq `ALLOWED_ORIGIN` da — CSRF yuzasi ochilmadi

### Sinov — nima TASDIQLANMADI (ochiq yozilsin)

🔴 **SAYTDA HALI BIRONTA HAQIQIY RASM CHIZILMAGAN.** Brauzer sinovi **stub
server** bilan o'tkazildi — lokalda Postgres ham, Gemini kaliti ham yo'q.
Ya'ni tasdiqlangani: *sayt to'g'ri so'rov yuboradi va javobning har turini
to'g'ri chizadi*. Tasdiqlanmagani: *haqiqiy backend shu so'rovni qabul qilib
rasm qaytarishi*. Bu farq `2026-08-09` dagi «`imageConfig` qabul qilinishi
o'lchanmagan» bandi bilan bitta toifada va shu holicha e'lon qilinadi.

### DEPLOY DALILI (2026-08-13)

> **Qisman to'ldirildi (2026-08-13).** 1–3 O'LCHANDI, 4–6 hamon OCHIQ va
> ular founder ishtirokini talab qiladi (Telegram orqali kirish). Bandlar
> ataylab ochiq qoldirilyapti: oldingi sessiyalarda aynan shu joy hujjat
> qarzi tug'dirgan (sprintda "production'da tasdiqlandi" deb yozilgan,
> aslida o'lchanmagan holat — `ALERT_CHAT_ID` darsi).
> ⚠️ **4-band bajarilmaguncha "saytda AI ishlayapti" DEYILMAYDI** — hozir
> tasdiqlangani "yo'l ochiq", "yo'ldan o'tildi" emas.

1. [x] `server/` rsync + servis restart — **2026-08-13 03:58:05**.
       ⚠️ **Birinchi urinish JIMGINA muvaffaqiyatsiz bo'ldi:** founder
       rsync + restart qildi, servis HAQIQATAN qayta ishga tushdi
       (`ActiveEnterTimestamp` 00:10:44), lekin fayllar diskda ESKI qoldi
       (`lib/ai.js` 08-09 dan) va `/api/version` hamon `6dd041f` berardi.
       Dalil servis holatida emas, **javob tarkibida** ekani shu yerda
       yana tasdiqlandi. Ikkinchi rsync'dan keyin diskdagi kod
       `grep -c aiClientConfig` bilan to'g'ridan-to'g'ri tekshirildi.
2. [x] `/api/auth/web/me` (kirmagan holatda): `aiImageEnabled: true`,
       `aiImageChoices` — `kiyim`/`uslub`/`dizayn`, `aiComboChoices` —
       `rang`/`qoshimcha`, `aiComboTextMax: 60`, `aiVariantMax: 5`.
       `/api/version` → `c82deb0`. Kesh chetlab o'tildi
       (`cf-cache-status: DYNAMIC`, ya'ni javob origin'dan).
3. [x] `script.js?v=31` → `200 application/javascript` va TARKIBIDA yangi
       kod (9 ta moslik); `style.css?v=41` → `200 text/css`, AI uslublari
       joyida; `index.html` ikkalasini yangi versiya bilan chaqiryapti.
       Soft-200 tuzog'i chetlab o'tildi — kodga emas, TUR va TARKIBGA
       qaraldi. Brauzerda: blok chizildi (3 savol, 13 chip, tugma
       "Kirish — rasm chizish uchun"), konsolda xato 0.
       Yo'l-yo'lakay: `/api/ai/image` va `/api/ai/my` sessiyasiz **401**
       (500 emas), Mini App kanali buzilmagan (soxta `initData` → 401),
       `/api/ai/gallery` CDN'dan rasm qaytaryapti.
4. [ ] **Saytda BIRINCHI HAQIQIY RASM chizildi** — kredit yechildi, rasm
       ko'rindi, "AI tasavvuri" yorlig'i joyida
5. [ ] Sayt sessiyasi bilan `/api/ai/my` javob berdi (401 EMAS).
       ⚠️ Hozir faqat SALBIY holat sinalgan (sessiyasiz → 401); ijobiy
       holat kirishni talab qiladi
6. [ ] Rasm Mini App galereyasida ham ko'rindi (egasi BITTA Telegram ID)

**Yo'l-yo'lakay tozalangan:** serverdagi `.env` da `AI_PROVIDER`,
`AI_API_KEY`, `AI_DAILY_LIMIT` ikki martadan yozilgan edi (qiymatlar aynan
bir xil). 23 → 19 qator. `.env` ni `EnvironmentFile=` orqali **systemd**
o'qiydi (dotenv EMAS), ya'ni oxirgi qiymat yutadi — shuning uchun aynan
yutayotgan nusxa saqlandi. Hal qilingan muhit o'zgarmagani `sha256`
barmoq izi bilan tasdiqlandi (oldin va keyin `2ac4324097b8d60b`), keyin
`systemd-run --property=EnvironmentFile=...` bilan systemd faylni
HAQIQATAN o'qiy olishi sinaldi — servisga tegmasdan, chunki buzuq fayl
faqat KEYINGI restartda chiqib, sababi noma'lum bo'lib qolardi.

### Qarorlar

- [2026-08-13] Qaror: **AI endpointlari `requestUser()` ga o'tkazildi,
  `authUser()` da QOLDIRILMADI.** `authUser()` faqat Mini App'ni biladi, ya'ni
  sayt xaridori uchun funksiya MAVJUD EMAS edi — lekin tugma ko'rinmagani
  uchun buni hech narsa ko'rsatmasdi. CLAUDE.md dagi istisno ("faqat Mini App
  uchun mo'ljallangan endpoint `authUser()` da qolishi mumkin") bu yerga
  QO'LLANMAYDI: AI rasmi ikkala kanalda ham xaridorga mo'ljallangan
- [2026-08-13] Qaror: **mijoz sozlamasi bitta funksiyadan** (`aiClientConfig`),
  ikkinchi endpointga nusxa ko'chirilmaydi. `db/014` naqshi: bir xil ro'yxat
  ikki joyda yozilsa ular jimgina ajralib ketadi va farq KO'RINMAYDI — sayt
  xaridori shunchaki tugmani ko'rmay qo'yardi. Yangi savol guruhi qo'shilsa
  u avtomatik ikkala kanalga boradi
- [2026-08-13] Qaror: **kirmagan foydalanuvchiga sozlama BERILADI va blok
  KO'RSATILADI.** Tugma o'rniga "Kirish". Sabab: yashirilgan funksiya —
  mavjud bo'lmagan funksiya; xaridor nima uchun kirishi kerakligini bilmasa
  kirmaydi. Bu KO'RINISH qarori, himoya emas — endpointning o'zi baribir
  mustaqil tekshiradi (`401`)
- [2026-08-13] Qaror: **tuzatish bilan BIRGA qorovul yoziladi (Test 3f).**
  Bu bandning eng muhim qismi: qoida 2026-08-12 da YOZILGAN edi va bir kun
  ichida buzilgan holda topildi. Ro'yxat qo'lda yozilmasligi ataylab —
  saytga yangi `fetch('/api/...')` qo'shilsa u AVTOMATIK qamraladi, aks holda
  qorovulning o'zi eskirardi
- [2026-08-13] Qaror: **sozlama kech kelganda faqat `detail` qayta chiziladi**,
  checkout EMAS. Checkout ham qayta chizilsa xaridor yozayotgan maydonlar
  (telefon, manzil, izoh) o'chib ketardi — ya'ni tuzatish o'zidan kattaroq
  nuqson yaratardi. Bu `onPriceDraft()` da `paintSheet()` chaqirmaslik
  qarorining aynan takrori (Sprint 4, 2026-07-31)
- [2026-08-13] **Dars: `data-arg` uzatilmagani JIMGINA yolg'on edi.** Sayt
  delegatsiyasi `input` uchun ikkinchi argumentni bermasdi va AI erkin matni
  hech qayerga bormasdi. Ekran to'g'ri ko'rinardi, tugma ishlardi, xato yo'q
  edi — faqat NATIJA boshqa chiqardi. Ikki klient bitta shartnomani
  (`data-action` / `data-arg` / `data-input`) ikki xil bajarishi shu toifadagi
  nuqsonlarning manbai; endi ikkalasi bir xil
- [2026-08-13] **Dars: deploy tartibi IKKALA yo'nalishda ham xavfsiz
  bo'lishi ATAYLAB tanlandi.** Eski backend + yangi frontend bo'lsa
  `/api/auth/web/me` sozlama qaytarmaydi, `aiCfg` `null` qoladi va blok
  UMUMAN chizilmaydi — o'lik tugma paydo bo'lmaydi. Ya'ni frontend CI orqali
  oldin chiqsa ham xaridor buzuq holatni ko'rmaydi

### Ochiq qolgani

1. 🔴 **Deploy qilinmagan.** `server/` CI orqali CHIQMAYDI — qo'lda rsync va
   servis restart kerak va uni **founder bajaradi**. Yuqoridagi DEPLOY DALILI
   ro'yxati shundan keyin to'ldiriladi
2. 🔴 **Saytdan birinchi haqiqiy rasm hali chizilmagan** — yuqoridagi
   "TASDIQLANMADI" bandiga qara. Bu 2026-08-09 dagi ochiq band bilan bitta:
   o'sha kuni ham «hali hech kim rasm chizdirmagan» deb yozilgandi
3. **Sayt va Mini App AI bloki endi IKKI joyda chiziladi** (`script.js` va
   `telegram-app/app.js`) — mantiq bir xil, kod alohida. Sozlama va savol
   kalitlari serverdan kelgani uchun ular ajralib keta olmaydi, LEKIN
   ko'rinish (matn, xato xabarlari) qo'lda sinxron turadi. Uchinchi kanal
   paydo bo'lsa bu blok umumiy modulga chiqarilsin
4. **AI natijasi saytda ulashilishi (`shareAiImage`) faqat brauzer
   `navigator.share` bo'lgan holatda o'lchandi** — desktop zaxira yo'li
   (havolani nusxalash) ko'z bilan ko'rildi, lekin haqiqiy rasm URL bilan
   sinalmagan

## 2026-08-13 (davomi) — AI kutish holati: spinner o'rniga atelye animatsiyasi

30 soniyagacha davom etadigan kutish jim spinner bilan turardi — foydalanuvchi
ilova qotib qoldi deb o'ylashi mumkin edi. Endi kutish holatining o'zi
mahsulot: **ikkala kanalda BIR XIL** (`script.js` → `aiSection`,
`telegram-app/app.js` → `aiImageSection`).

### Qilingan ishlar

- [2026-08-13] **Kutish bloki:** 3:4 nisbatli skelet (rasm chiqadigan joyning
  O'ZI — serverdagi `aspectRatio 3:4` bilan bir nisbat) + shimmer; ichida
  spinner o'rniga SVG **igna-chok animatsiyasi** (chok `stroke-dasharray`
  bilan "tikilib boradi", igna tebranadi); matn «Rasm chizilmoqda… (30
  soniyagacha)» → «Mo'jiza tayyor bo'lmoqda… ✨» (ru: «Чудо готовится… ✨»)
- [2026-08-13] **~30 soniyalik HALOL progress-chiziq** — tez boshlanib
  sekinlashadi va **92% da TO'XTAYDI**: javob kelganda blok butunlay
  almashadi. 100% ga yetkazib qo'yish "tayyor bo'ldi-yu chiqmadi" degan
  yolg'on va'da bo'lardi — bu «jimgina yolg'on yo'qlikdan yomonroq»
  oilasidagi qaror, faqat UI darajasida
- [2026-08-13] **Natija blur'dan ochiladi + bir martalik ✨ uchqun.**
  `fresh` bayrog'i bir MARTALIK: o'qilgach o'chiriladi — yorliq almashib
  qayta chizilganda animatsiya TAKRORLANMAYDI (har qayta chizishda "yangi
  rasm" effekti yolg'on bo'lardi). Mini App'da qo'shimcha haptic
  (`notificationOccurred('success')`, `try/catch` bilan — haptic ixtiyoriy)
- [2026-08-13] Kesh: `telegram-app/styles.css?v=21 → 22`,
  `telegram-app/app.js?v=73 → 74`; sayt tomoni C2/C3 bilan birga
  `style.css?v=43` / `script.js?v=33` ichida. Test 16 jadvali yangilandi

### Ochiq qolgani

- Animatsiya lokal brauzerda ko'rildi; haqiqiy 30 soniyalik chizish bilan
  (jonli Gemini) hali kuzatilmagan — bu «saytda birinchi haqiqiy rasm»
  ochiq bandi bilan birga yopiladi

## 2026-08-13 (davomi 2) — AI rasmi tayyor bo'lganda BAYRAM

Sprint 10 hamon `tugadi` holatida. Bu bo'lim funksiyaga emas, uning oxirgi
soniyasiga tegadi: ~30 soniya kutgan xaridor natijani **jimgina** olardi —
rasm paydo bo'lardi, xolos. Kutish holati kechagi bo'limda mahsulotga
aylantirilgan edi, tugash lahzasi esa bo'sh qolgan edi.

### Nima uchun konfettini O'ZIMIZ chizamiz — O'LCHANGAN, taxmin emas

Boshlang'ich taxmin: «Telegram'ning quizdagi konfettisi bor, uni chaqiramiz».
**Bu taxmin tekshirildi va NOTO'G'RI chiqdi.** 2026-08-13 da production'dagi
JONLI SDK o'qildi: `window.Telegram.WebApp` da bayramga aloqador narsa
faqat `HapticFeedback` ning uchta metodi (`impactOccurred`,
`notificationOccurred`, `selectionChanged`) — konfetti metodi **YO'Q**.
Rasmiy Bot API changelog ham buni tasdiqladi: `message_effect_id` **chat
xabari** uchun qo'shilgan (7.4), Mini App SDK'siga berilmagan.

⚠️ Bu CLAUDE.md dagi **«hujjatdagi raqam — tekshirilmagan da'vo»** qoidasining
takrori, faqat raqam emas **imkoniyat** darajasida: «Telegram'da konfetti bor»
degan gap to'g'ri, lekin **qaysi kanalda** borligi tekshirilmasa ish noto'g'ri
narsaga yo'naltirilardi. Tekshirmasdan boshlangan bo'lsa, mavjud bo'lmagan
metodni chaqiradigan kod yozilib, u `try/catch` ichida **jimgina hech narsa
qilmasdi** — konsolda xato yo'q, tugma ishlaydi, bayram esa yo'q.

Shuning uchun bayram IKKI KANALDAN keladi va ular boshqa-boshqa narsa:

| Kanal | Nima | Qayerda |
|---|---|---|
| Ilova ichi | o'zimiz chizgan konfetti (42 bo'lak, brend ranglari) | `telegram-app/app.js`, `script.js` |
| Telegram chati | Telegram'ning HAQIQIY effekti (🎉) | `sendPhotoWithEffect()` |

### Bajarilgani

| Band | Natija |
|---|---|
| `konfetti()` | Mini App'ga qo'shildi — sayt qismi `fc06b6f` da allaqachon chiqqan |
| `sendPhotoWithEffect()` | YANGI (`lib/telegram-api.js`) — tayyor rasm foydalanuvchining O'Z chatiga `message_effect_id` bilan |
| Baytlar | QAYTA YUKLANMAYDI — `file_id` uzatiladi, rasm Telegram'da allaqachon yotibdi |
| Effekt rad etilsa | effektSIZ bir marta qayta uriniladi |
| `AI_IMAGE_EFFECT_ID` | yangi sozlama, SHAKLI tekshiriladi (`^\d{5,25}$`) |
| **Test 21** | YANGI qorovul — 5 mutatsiya bilan sinaldi |
| Testlar | **55 → 56** (grep = 56, `npm test` = 56 — ikki mustaqil usul) |
| Kesh | `telegram-app/styles.css?v=22 → 23`, `app.js?v=74 → 75`, `panel.js?v=13 → 14` |

### Qilingan ishlar

- [2026-08-13] **`konfetti()` Mini App'da** (`telegram-app/app.js`,
  `styles.css`) — AI rasmi `state: 'done'` bo'lgan lahzada otiladi.
  42 bo'lak, brend ranglari, har biriga tasodifiy yon siljish (`--x`),
  aylanish (`--r`), kechikish va davomiylik. Qatlam `position: fixed` va
  **`pointer-events: none`** — aks holda rasm tayyor bo'lgan lahzada butun
  ekran 3 soniya bosishni yutib turardi, ya'ni «bayram» xaridorni
  «ulashish» tugmasidan uzib qo'yardi. Element 3.2 s da o'zini o'chiradi
- [2026-08-13] **`prefers-reduced-motion` IKKI qatlamda hurmat qilinadi** —
  JS'da darrov `return`, CSS'da `display: none`. Bittasi yetardi, ikkinchisi
  ataylab: uslub fayli keshda eskirib qolsa ham JS qorovuli ishlaydi
- [2026-08-13] **Uslub JS'da `style` orqali qo'yiladi, shablon satriga
  INTERPOLATSIYA QILINMAYDI** — CLAUDE.md `esc()` bandidagi «atribut ichida
  boshqa til boshlansa `esc()` yaramaydi» darsi. Bu yerda tashqi matn yo'q,
  lekin naqsh bitta bo'lsin
- [2026-08-13] **`sendPhotoWithEffect()`** (`server/lib/telegram-api.js`) —
  tayyor rasm foydalanuvchining O'Z chatiga `message_effect_id` bilan
  yuboriladi. Baytlar QAYTA YUKLANMAYDI: `photo: fileId`, chunki rasm shu
  bot orqali Telegram'ga allaqachon yuklangan. Yon foydasi rejalashtirilmagan
  edi va u qimmatli: xaridor ilovani yopib qo'ysa ham **rasm chatida qoladi**
- [2026-08-13] ⚠️ **Effekt rad etilsa xabar YO'QOLMAYDI.** Telegram noto'g'ri
  yoki qo'llab-quvvatlanmaydigan `message_effect_id` da BUTUN `sendPhoto`
  so'rovini rad etadi — ya'ni qaytarish yo'li bo'lmasa xaridor tayyor rasmni
  chatda **umuman olmasdi**, va buni hech narsa ko'rsatmasdi, chunki ilovada
  rasm baribir ko'rinadi. Endi rad javobida bir marta effektSIZ takrorlanadi:
  **bayram — qo'shimcha, xabar — asosiy narsa**
- [2026-08-13] **Chaqiruv kreditni qaytaradigan `try` dan TASHQARIDA**
  (`routes/ai.js`, `refundCredits` blokidan keyin) va O'Z `try` si bilan
  o'ralgan — R2 va tasma bandlari bilan AYNI qoida: rasm allaqachon
  chizilgan, pul allaqachon to'langan va xaridor natijani ilovada olgan.
  Chat xabari yiqilsa (bot bloklangan, chat ochilmagan — Telegram 403) butun
  so'rov yiqilmasin va kredit qaytarilmasin
- [2026-08-13] **Xato YUTILMAYDI** — `console.error` alertga chiqadi, birinchi
  argument o'zgarmas belgi (`'aiImage chatga yuborilmadi:'` /
  `'aiImage chat xabari xatosi:'`), o'zgaruvchan qism ikkinchisida.
  `ALERT_CHAT_ID` darsi: aks holda «rasm chatga konfetti bilan ketyapti»
  degan ishonch oylab o'lchanmagan da'vo bo'lib qolardi
- [2026-08-13] **`AI_IMAGE_EFFECT_ID` SHAKLI tekshiriladi** (`config.js` →
  `effectId()`, `^\d{5,25}$`). `process.env.X || ZAXIRA` naqshining O'ZI
  yetarli emas — `ALERT_CHAT_ID` darsi: `.env` da namuna qolib ketsa u bo'sh
  emas, ya'ni `||` uni haqiqiy qiymat deb qabul qilardi va Telegram HAR
  SAFAR rad etardi. Yaroqsiz qiymat jurnalda QICHQIRADI va effektsiz
  ishlanadi; `process.exit` YO'Q — bayram ixtiyoriy funksiya
- [2026-08-13] **Yangi Test 21** — qorovul to'rt narsani qulflaydi:
  (1) effekt rad etilganda AYNI shoxda effektsiz qayta urinish bor,
  (2) rasm `file_id` bilan ketadi, (3) chaqiruv kredit qaytarish blokidan
  KEYIN va o'z `try`/`console.error` i bilan, (4) `effectId()` shakl
  qorovuli mavjud va jimgina yutmaydi. Beshinchisi — `konfetti()`
  IKKALA kanalda bor va rasm TAYYOR bo'lgan joyda CHAQIRILADI (funksiya
  yozilib chaqirilmay qolishi eng oson jimgina nuqson edi)
- [2026-08-13] Kesh: `telegram-app/styles.css?v=22 → 23`,
  `telegram-app/app.js?v=74 → 75`, `panel.js?v=13 → 14`; Test 16 jadvali
  yangilandi

### Qarorlar

- [2026-08-13] **Qaror: konfetti ilovada O'ZIMIZ chiziladi, Telegram'niki
  chatda ishlatiladi.** Sabab — Mini App SDK'da konfetti metodi yo'q
  (jonli SDK o'qib tekshirildi). Muqobil «umuman qilmaymiz» rad etildi:
  30 soniyalik kutishdan keyin jim natija kutishning o'zini qadrsizlantiradi
- [2026-08-13] **Qaror: bayram effekti hech qachon xabarni yo'qotmaydi.**
  Effektli so'rov rad etilsa effektsiz bir marta takrorlanadi. Bu R2
  («ombor almashtirish bir tomonlama eshik bo'lmasin») va tasma
  («tasma xatosi rasmni yo'qotmasin») qarorlari bilan bitta oila:
  **qo'shimcha qulaylik asosiy natijani hech qachon garovga qo'ymaydi**
- [2026-08-13] **Qaror: `AI_IMAGE_EFFECT_ID` ning zaxirasi kodda turadi**
  (`5046509860389126442`), `.env` da almashtirsa bo'ladi. Muqobil «faqat
  `.env` dan» rad etildi: sozlanmagan serverda bayram jimgina yo'q bo'lardi
  va buni hech kim sezmasdi

### Ochiq qolgani

1. 🔴 **Haqiqiy Telegram bilan chat xabari va effekt HECH QACHON otilmagan.**
   Effekt id `5046509860389126442` **hujjatdan olingan**, jonli tasdiqlanmagan
   — ya'ni bu ayni paytda TEKSHIRILMAGAN DA'VO. Aynan shu sabab effektsiz
   qaytarish yo'li yozildi: da'vo noto'g'ri chiqsa ham xaridor rasmni oladi.
   Founder birinchi rasmni chizdirganda **chatga xabar kelgani** va
   **effekt otilgani** ALOHIDA ko'rilsin — «xabar keldi» «effekt ishladi»
   degani emas
2. 🔴 **Deploy qilinmagan** — `server/` CI orqali CHIQMAYDI, qo'lda rsync va
   servis restart kerak va uni founder bajaradi
3. Konfetti lokal brauzerda ko'rildi; haqiqiy AI javobi bilan (jonli Gemini)
   hali kuzatilmagan — bu «saytda birinchi haqiqiy rasm» ochiq bandi bilan
   birga yopiladi
4. Konfetti endi **ikki faylda takrorlangan** (`script.js` va
   `telegram-app/app.js`) — 2026-08-13 dagi «AI bloki ikki joyda» bandi bilan
   bitta ro'yxatda. Test 21 ikkalasi ham MAVJUD ekanini qo'riqlaydi, lekin
   ular ajralib ketmasligini emas
