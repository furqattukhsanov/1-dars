# Sprint 10 — AI kiyim RASMI (Dars 17)

**Holat:** tugadi
**Sana:** rejalashtirildi 2026-08-06 (founder bilan savol-javob orqali),
matn qismi 2026-08-06 da chiqdi va RAD ETILDI,
**rasm qismi 2026-08-07 da tugadi va production'da tasdiqlandi**

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
