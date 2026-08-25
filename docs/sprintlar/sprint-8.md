# Sprint 8 — Sifat tekshiruvi (Dars 15)

**Holat:** jarayonda

---

## Maqsad

Platformaning barcha funksiyalarini real foydalanuvchilar bilan sinovdan o'tkazish, xatolarni topib tuzatish.

---

## Bajariladigan vazifalar

### Xato tekshiruvi
- [ ] To'liq xaridor oqimi: ro'yxatdan o'tish → katalog → buyurtma → to'lov → yetkazib olish
  — **QISMAN (2026-07-31):** saytdan buyurtma (`#LM-3011`, 2026-07-30) ustiga endi **Mini App'dan
  haqiqiy Telegram imzosi bilan buyurtma ham sinaldi** — buyurtma o'tdi va zaxira 20 → 19 bo'ldi,
  ya'ni atomik kamaytirish Mini App yo'lida ham ishlaydi. 30-iyuldagi "Mini App buyurtmasi
  sinalmagan" bo'shlig'i YOPILDI. Band OCHIQ qoladi: **to'lov (Payme/Click) va yetkazib olish (BTS)
  qismi hali umuman sinalmagan** — integratsiyalar Sprint 6'da tugallanmagan
- [ ] To'liq ishlab chiqaruvchi oqimi: kirish → mahsulot qo'shish → buyurtma qabul → jo'natish
  — **QISMAN (2026-07-31):** sotuvchi Mini App'dan mahsulot qo'shdi (`Yengi paplim`, 8 600 000 so'm,
  zaxira 20), bot rasm so'radi, sotuvchi botga rasm yubordi va rasm mahsulotga biriktirildi —
  **haqiqiy Telegram bilan, birinchi marta**. Bu kod 2026-07-30 da yozilgan edi, lekin faqat soxta
  ma'lumot bilan sinalgandi. Moderatsiyagacha mahsulot ommaviy katalogda ko'rinmadi (12 ta bo'lib
  qoldi) — moderatsiya darvozasi ishlaydi. 30-iyuldagi "botga rasm yuborish sinalmagan" bo'shlig'i
  YOPILDI.
  — **(2026-08-01) Oqimning ikkinchi yarmi ham sinaldi:** sotuvchining buyurtmani qabul
  qilishi, jo'natishi va rad etishi (accept / ship / reject) production'da haqiqiy Telegram
  va Mini App bilan o'tkazildi — 31-iyulda ochiq qolgan aynan shu bo'shliq YOPILDI (tafsilot
  "Qilingan ishlar"da). Band hamon OCHIQ, chunki oqimning quyrug'i qolyapti: **to'lov
  (Payme/Click) va yetkazib berish (BTS)** — ikkalasi ham Sprint 6 integratsiyalariga
  bog'liq va tashqi kalitsiz sinab bo'lmaydi
- [ ] Admin oqimi: tasdiqlash → escrow → bahsli holat → qaror
  — **QISMAN (2026-07-31):** moderatsiya navbatida rasm va zaxira ko'rindi, founder tasdiqladi,
  mahsulot katalogga chiqdi (13 ta). HMAC-imzolangan `/api/product-photo` havolasi ham tekshirildi:
  to'g'ri imzo bilan rasm keladi (590 KB, haqiqiy JPEG 1920×2560), soxta imzo bilan **401**.
  30-iyuldagi "navbatda rasm + zaxira ko'rinishi tekshirilmagan" bo'shlig'i YOPILDI. Band OCHIQ
  qoladi: **escrow, bahsli holat va bahs qarori oqimi hali sinalmagan**
  — **(2026-08-03) Bahsli holat va bahs qarori bo'shlig'i YOPILDI:** haqiqiy buyurtma
  `#LM-3001` ustida xaridor → bot → sotuvchi → admin panel → Telegram tasdiqlash zanjiri
  uchidan-uchiga sinaldi (tafsilot "Qilingan ishlar"da), `disputes.status='resolved'` va
  `orders.status='refunded'` bitta tranzaksiyada tasdiqlandi. Band hamon OCHIQ qoladi —
  **escrow (mablag'ni ushlab turish) mexanizmining o'zi alohida sinalmagan**, faqat bahs
  ochilishidan qarorgacha bo'lgan qism
- [ ] Sharhlar oqimi: buyurtma → yetkazildi → sharh → reyting → admin yashirishi
  — kod 2026-07-31 da yozildi va production'ga chiqdi (`rating` endi 13/13 mahsulotda
  `null`, `/api/reviews` 200 qaytaryapti, himoyalangan 4 endpoint 401). **Haqiqiy sharh
  bilan hali sinalmagan.** Qadamma-qadam reja: `docs/sinov-sharhlar.md`
  — **(2026-08-03) Zanjirning oxirgi bo'g'ini test bilan qamaldi:** "admin yashirishi →
  reyting qayta hisoblanishi" ulanishi endi Test 11 da tekshiriladi (tafsilot
  "Qilingan ishlar"da). Band HAMON OCHIQ: jonli bazada **0 ta sharh** bor, ya'ni
  reyting invariantlari trivial ravishda to'g'ri va production ma'lumotida hech narsa
  tasdiqlab bo'lmaydi — haqiqiy sharh kerak
- [ ] To'lov xatolari: bekor qilish, vaqt tugashi, ikki marta to'lash
- [ ] Qaytarish oqimi: xaridor muammo bildiradi → moderator qaror beradi → pul qaytariladi
  — **QISMAN (2026-08-03):** aynan shu zanjir B2 dispute sinovida haqiqiy Telegram va admin
  panel bilan o'tdi — `#LM-3001` uchun qaytarish (1 000 000 so'm, aybdor=sotuvchi) tasdiqlandi
  va `orders.status='refunded'` bo'ldi. Band OCHIQ qoladi: bitta muvaffaqiyatli yo'l sinaldi,
  chegara holatlar (masalan aybdor=xaridor bo'lganda qaytarilmaslik) hali sinalmagan

### Pilot foydalanuvchilar
- [ ] 3–5 ta tanish xaridor bilan real buyurtma sinovlari
- [ ] 2–3 ta ishlab chiqaruvchi bilan kabinet sinovlari
- [ ] Xato va shikoyatlarni yig'ish

### Ishlash tekshiruvi
- [x] Sahifalar yuklanish tezligi (3 soniyadan kam)
  — **YOPILDI (2026-08-05), PRODUCTION O'LCHOVI BILAN.** Dalil pastda, "Yakuniy
  o'lchov" sarlavhasi ostida. Quyidagi ikki yozuv sinov tarixi sifatida
  ATAYLAB saqlanmoqda — band nima uchun ikki marta ochiq qoldirilgani va
  qaysi raqamlar bilan yopilgani ko'rinib tursin.
  — **QISMAN (2026-07-31):** birinchi marta HAQIQATAN o'lchandi va uchta sabab topib
  tuzatildi (pastdagi yozuvga qarang). Band OCHIQ qoladi, chunki o'lchov lokal va Wi-Fi
  bo'yicha — **sekin mobil internetda (O'zbekistondagi haqiqiy 3G/4G) hali sinalmagan**

  — **SEKIN TARMOQDA O'LCHANDI (2026-08-05), band HAMON OCHIQ — mezon o'tmadi.**
  Usul: `curl --limit-rate` bilan HAQIQIY throttling. Brauzer panelidagi FCP ATAYLAB
  ishlatilmadi — tab `hidden` bo'lganda u yolg'on ko'rsatadi (bu allaqachon yozilgan
  dars). Kod BU O'LCHOVDA O'ZGARTIRILMADI — bu tashxis, tuzatish emas.

  | | Landing | Mini App |
  |---|---|---|
  | Chizish uchun kerak bo'lgan qism | 342 KB | 73 KB |
  | Sekin 3G (50 KB/s) | **10.1 s** | ~1.5–2.5 s |
  | Tez 3G (200 KB/s) | **2.66 s** | ~1.6–3.4 s |
  | Birinchi tashrif jami | ~634 KB | ~356 KB |
  | Aylantirganda (14 ta lazy rasm) | ~2.87 MB | — |

  **Mezon bo'yicha hukm:** tez 3G'da landing 2.66 s — o'tadi, lekin ZO'RG'A; sekin
  3G'da 10.1 s — **O'TMAYDI**. Shu sabab band `[x]` QILINMAYDI.

  **Topilganlar:**
  1. `Photo/Main/banner-mato.jpg` — **305 KB**, ya'ni kritik yo'lning **78%i**.
     Sekin 3G'da yolg'iz o'zi ~6 s. WebP/AVIF + `srcset` bilan ~60 KB ga tushsa
     ~5 s tejaladi. **ENG KATTA YUTUQ AYNAN SHU** — qolgan hamma narsa shu bitta
     fayl yonida shovqin.
  2. Shriftlar — 250 KB, 13 ta `woff2`, 3 oila / 10 qalinlik. Mini App uchun
     nomutanosib: butun kritik yo'ldan (73 KB) **3.4 barobar** katta.
     `display=swap` to'g'ri qo'yilgan, ya'ni matn ko'rinmay turmaydi.
  3. **Mini App tarmoq kengligiga BOG'LIQ EMAS.** Ikkala tezlikda ham natija
     1.5–3.5 s oralig'ida sochildi — ya'ni o'lchovni bayt emas, ULANISH KECHIKISHI
     boshqaradi (uchta tashqi domenga ulanish). `fonts.googleapis.com` va
     `fonts.gstatic.com` ga `preconnect` bor, **`telegram.org` ga YO'Q.**
  4. Yaxshi tomoni: barcha skriptlar `defer` (2026-07-31 qoidasi bajarilyapti),
     17 rasmdan 14 tasi `lazy`.

  **Keyingi ishlar (shu bandni yopish uchun):**
  - [x] banner rasmlarni WebP ga o'tkazish + `srcset` — **BAJARILDI (2026-08-05),
    tafsilot "Qilingan ishlar"da.** Kritik yo'l mobilda **342 KB → 88 KB**, lokal
    hisob bo'yicha sekin 3G'da ~10.1 s → ~1.8 s
  - [x] shrift qalinliklarini kamaytirish — **BAJARILDI (2026-08-06), tafsilot
    "Qilingan ishlar"da.** ⚠️ Shu bandning O'ZIDAGI raqam ("250 KB, 13 ta
    `woff2`") NOTO'G'RI edi: u barcha `unicode-range` subsetlarining yig'indisi,
    brauzer esa faqat kerakli subsetni oladi. Haqiqiy xarajat **131 KB / 3 fayl**
    edi, ya'ni muammo hujjatda yozilganidan IKKI BAROBAR kichik. Yangi holat:
    **96 KB / 3 fayl (−35 KB, −27%)**. Tezlik mezoni uchun sezilarli o'zgarish
    KUTILMAYDI (quyidagi "Muhim xulosa"ga qarang) — bu bayt tozaligi va
    `Geist Mono 700` ning soxta qalindan haqiqiyga o'tishi
  - [x] `telegram.org` ga `preconnect` qo'shish — **BAJARILDI (2026-08-06),
    tafsilot "Qilingan ishlar"da.** Shu bilan bu bo'limdagi tezlik bandlarining
    HAMMASI yopildi — ochiq band QOLMADI

  **Band HAMON `[x]` QILINMAYDI:** 88 KB raqami LOKAL hisob — production'da
  qayta o'lchash deploy'dan KEYIN qilinadi, dalil hali yo'q. Bundan tashqari
  yuqoridagi ikki band ochiq.

  — **YAKUNIY O'LCHOV (2026-08-05, `a6962d1` deploy qilingandan KEYIN) — BAND
  YOPILDI.** Yuqoridagi "88 KB" lokal hisob edi; endi raqam production'dan
  olindi. Usul BAZAVIY O'LCHOV BILAN AYNI: `curl --limit-rate`, ya'ni
  solishtirish adolatli.

  | Tarmoq | Oldin (2026-08-05 ertalab) | Keyin (deploydan so'ng) |
  |---|---|---|
  | Sekin 3G (50 KB/s) | **10.14 s** | **2.0 / 2.6 / 2.5 / 1.6 / 2.0 / 2.5 s** |
  | Tez 3G (200 KB/s) | 2.66 s | 1.4–2.4 s |

  Sekin 3G'da OLTI o'lchov olindi va OLTALASI ham 3 soniyadan past — ya'ni
  natija bitta omadli urinish emas. Mezon ("3 soniyadan kam") ikkala tarmoqda
  ham o'tdi, shuning uchun band `[x]`.

  **⚠️ O'LCHOVNING HALOL CHEGARASI.** Bu ketma-ket `curl` — u brauzerning
  PARALLEL yuklashini ham, JS bajarilishini ham qamramaydi, ya'ni haqiqiy
  brauzerdagi "ko'z bilan ko'rinadigan" vaqt bundan farq qilishi mumkin.
  Raqamga ishonish mumkin bo'lgan sabab bitta: bazaviy 10.14 s ham AYNAN shu
  usulda olingan, ya'ni **o'zgarishning kattaligi** to'g'ri o'lchangan.

  **Muhim xulosa — keyingi optimizatsiya uchun.** Endi sekin 3G va tez 3G
  natijalari USTMA-UST tushdi (2.0–2.6 va 1.4–2.4). Bu landing tarmoq
  kengligiga bog'liq bo'lishdan CHIQQANINI bildiradi: vaqtni endi bayt emas,
  ULANISH KECHIKISHI belgilaydi — ya'ni landing 5-avgust ertalabida Mini App
  qanday holatda bo'lsa, o'sha holatga o'tdi. Amaliy oqibati: **kritik yo'ldan
  yana bayt qirqishning foydasi keskin kamaydi.** Quyidagi ikki ochiq band
  (shriftlar, `preconnect`) endi TEZLIK MEZONI uchun emas, boshqa sabablar
  uchun bajariladi — `preconnect` aynan kechikishga tegadi, shrift esa
  ko'proq Mini App tomonida og'irlik.

  **— 2026-08-06 holati: BU BO'LIMDA OCHIQ TEZLIK BANDI QOLMADI.** Uchala
  band ham yopildi: rasmlar (2026-08-05), shriftlar (2026-08-06),
  `telegram.org` `preconnect` (2026-08-06).
- [ ] Mobil da barcha funksiyalar ishlashi
- [ ] To'lov webhook larning ishonchliligi

### Tuzatishlar
- [ ] Pilot dan kelgan xatolarni tuzatish
- [ ] UX muammolarini hal qilish

---

## Qilingan ishlar

- [2026-08-25] **Matt Pocock muhandislik skill'lari uchun per-repo konfiguratsiya
  yozildi** (`/setup-matt-pocock-skills`): `triage`, `qa`, `to-issues`, `tdd`,
  `diagnosing-bugs` kabi skill'lar shu repoda ishlashi uchun uch hujjat ochildi —
  `docs/agents/issue-tracker.md` (masalalar GitHub Issues'da, `gh` CLI
  konvensiyalari, tashqi PR'lar triage yuzasi EMAS, issue matnlari o'zbekcha),
  `docs/agents/triage-labels.md` (beshta kanonik teg standart nomlari bilan;
  tekshirildi: repoda hozircha beshlikdan faqat `wontfix` mavjud, qolganlari
  birinchi ishlatilganda yaratiladi), `docs/agents/domain.md` (repo bitta
  kontekstli; `CONTEXT.md` va `docs/adr/` hali yaratilmagan — skill'lar kerak
  bo'lganda o'zi ochadi). `CLAUDE.md` oxiriga «Agent skills» bo'limi qo'shildi.
  Kod tegilmagan, testlar va `?v=` versiyalariga ta'sir yo'q.

- [2026-08-20] **XAVFSIZLIK AUDITI (oq/etik, o'z loyihamiz) — BITTA HAQIQIY
  ZAIFLIK TOPILIB TUZATILDI: `/api/order-status` IDOR. Testlar: 88 → 89
  (`✅ Test` PASS satrlari, MUSTAQIL sanaldi).**

  Audit ikki qismdan iborat edi: (1) veb-ilova auditi (sayt + Mini App + admin
  + Hetzner backend), (2) AI-guardrail chidamlilik sinovi («kibir hujum», 11
  raund, 33/33 O'TDI — **o'z-o'zini sinov ekani hujjatda ochiq yozilgan**,
  mustaqil tashqi validatsiya EMAS). Hujjatlar: `docs/xavfsizlik/00-xavfsizlik-xulosa.md`
  (umumiy zaiflik jadvali W1–W9 + Z1–Z4 va sessiyalarga bo'lingan tuzatish rejasi),
  `docs/xavfsizlik/01-pentest-metodologiya.md`, `docs/kibir-hujum-hisoboti.md`,
  `docs/kibir-hujum-stsenariylari.md`.

  **TOPILGAN ZAIFLIK (W6, IDOR — jonli tasdiqlangan 2026-08-20):**
  `/api/order-status?id=` endpointi **autentifikatsiyasiz** edi va so'rov faqat
  `WHERE id=$1` bilan ketardi. Buyurtma ID'si ketma-ket
  (`'#LM-' || nextval('order_seq')` → `#LM-1..N`), ya'ni istalgan odam login'siz
  `#LM-1..N` ni sanab (1) jami buyurtma sonini, (2) har birining holatini va vaqt
  bo'yicha o'zgarishini o'qiy olardi — raqobatchiga biznes hajmi/tezligi ochiq edi.
  **PII chiqmaydi** (faqat status), yozuv imkoni yo'q — shuning uchun 🔴 emas, 🟠.
  Jonli PoC: `curl` autentifikatsiyasiz HTTP 200 qaytardi.

  **TUZATISH (bu ishning O'ZI o'lchab tasdiqladi):** `handleOrderStatus`
  (`server/routes/orders.js`) endi `authUser(req)` bilan kimlik oladi (kimliksiz
  **401**) va so'rov EGAGA bog'landi: `WHERE id=$1 AND tg_user_id=$2`. Endpointni
  faqat Mini App chaqiradi (`app.js` → `syncOrderStatuses`), sayt statusni
  `/api/web/orders` ro'yxatidan oladi — shuning uchun `authUser` (initData majburiy)
  ATAYLAB tanlandi (CLAUDE.md: «faqat Mini App uchun mo'ljallangan endpoint
  `authUser`da qolishi mumkin»). ⚠️ Xulosa hujjatining «tuzatish rejasi» dastlab
  **imzo** (`orderStatusSig`) yechimini tavsiya qilgan edi; amalda `authUser`
  qo'llanildi (u yaxshiroq va CLAUDE.md tamoyiliga to'g'ridan-to'g'ri mos) —
  hujjatdagi reja qatori shu jihatdan ESKIRDI.
  Mini App tomoni: `syncOrderStatuses()` poll'i endi `X-Telegram-Init-Data`
  header yuboradi va initData bo'lmasa (Telegram tashqarisi) umuman so'ramaydi.
  Kesh: `telegram-app/app.js?v=101 → v=102` (Test 16 jadvali birga).

  **YANGI QOROVUL — Test 50** (`testOrderStatusScopedToOwner`): `handleOrderStatus`
  tanasini (izohlar TOZALANGAN holda — Test 3f/23 darsi: qorovul matnni emas,
  KODNI o'qisin) skanerlaydi va `authUser(`, `401`, `tg_user_id=$2` borligini talab
  qiladi. **HISOBOTCHI MUSTAQIL SINADI (o'z ta'rifining 0-bo'limi bo'yicha):**
  butun to'plam yashil (89 `✅ Test`), so'ng qorovul MUTATSIYA bilan buzib ko'rildi —
  (a) egalik bog'lanishini olib tashlash → Test 50 `tg_user_id=$2` assertioni QIZIL
  berdi; (b) tuzatishdan oldingi to'liq holatga qaytarish (`WHERE id=$1`) → yana QIZIL;
  (c) `authUser` qatorini o'chirish → bog'liqlik skaneri `u is not defined` bilan
  ushladi. Uch mutatsiya ham ushlandi. Tekshiruv nusxadan tiklandi (`cp`, `git checkout`
  EMAS — xavfsizlik qoidasi); yakunда `git status` toza (faqat ataylab qilingan
  tuzatishlar qoldi).

  🔴 **DEPLOY: STATIK + BACKEND** — `server/routes/orders.js` o'zgardi, ya'ni rsync
  (`--no-owner --no-group` SHART) + servis restart TALAB QILINADI; migratsiya YO'Q.
  Backend ko'tarilmasa eski (himoyasiz) kod production'da qolaveradi. **Founder jonli
  saytda hali tekshirmagan. PUSH QILINMADI** — founder qaroriga qoldirildi.
  Hujjat: `docs/xavfsizlik/00-xavfsizlik-xulosa.md`.

- [2026-08-19] **HISOBOTCHI AGENTINING O'Z TA'RIFI YANGILANDI — JARAYON
  O'ZGARISHI, KOD EMAS. Test soni O'ZGARMADI: 86.**

  O'zgargan yagona ishchi fayl — `.claude/agents/hisobotchi.md`, ya'ni bu
  hisobotni yozadigan agentning O'Z ko'rsatmasi. Ish `681a19f` dan keyin,
  o'sha kunning ikkita sessiyasida chiqqan xatolar ustida qilindi.

  **O'LCHANDI (yangi 0-bo'lim talabi bo'yicha, chaqiruvchining da'vosi
  ko'chirilmadi):** `node server/test.js` mustaqil yurgizildi, `^✅ Test`
  satrlari sanaldi — **86 PASS, 0 xato**. Chaqiruvchi ham 86 degandi; raqam
  mos keldi, lekin u SHUNING UCHUN emas, O'LCHANGANI uchun yozilyapti.

  **1. `Co-Authored-By` qatori shablondan OLIB TASHLANDI.** Model nomi
  ta'rifda QOTIB yozilgan edi va ESKIRDI: bugun agent noto'g'ri nom taklif
  qildi va commit'da uni qo'lda to'g'irlashga to'g'ri keldi. Endi qatorni
  muhitning O'ZI qo'shadi. Dars: **vaqt bilan o'zgaradigan qiymat shablonga
  QOTIRILMASIN** — u eskirganda hech narsa qichqirmaydi, na test qizil
  bo'ladi, na jurnalda iz qoladi; faqat noto'g'ri natija chiqadi va uni
  odam qo'lda tuzatadi. Bu `ALERT_CHAT_ID` va `BANNER_VERSION` darslari
  bilan bitta oila: **jimgina eskirgan qiymat yo'q qiymatdan yomonroq.**

  **2. `git push` endi hisobotchi ishi EMAS.** Ilgari ta'rifda «ha
  javobidan keyin `git add`, `git commit`, `git push`» deb yozilgandi.
  Push tashqi dunyoga chiqadi va CI orqali **production deploy'ini ishga
  tushiradi** — ya'ni u hisobotning davomi emas, **ALOHIDA QAROR**. Endi
  agent `git commit` gacha boradi, undan nariga emas; push'ni founder
  o'zi qabul qiladi. (Shu commit ham aynan shunday: commit qilindi,
  **push QILINMADI**.)

  **3. Yangi 0-bo'lim — «DA'VONI KO'CHIRMA, O'LCHA».** Chaqiruvchi
  agentning «testlar yashil», «bu qator faylda bor», «migratsiya kerak
  emas», «yangi qorovul qo'shildi» degan gaplari endi **TEKSHIRILMAGAN
  DA'VO** deb qaraladi: test YURGIZILADI, fayl OCHIB ko'riladi, sxema
  tasdiqlanadi, yangi qorovul esa MUTATSIYA bilan buzib sinaladi.
  Tekshira olinmagan da'vo hisobotda aynan shunday — **«tekshirilmadi»**
  deb belgilanadi.
  ⚠️ **Bu qadamlarning hammasi bugungi BIRINCHI sessiyada ALLAQACHON
  bajarilgan edi** (test mustaqil sanalgan, `style.css` ochib ko'rilgan,
  4 mutatsiya qilingan) — **lekin ta'rifda yozilmagani uchun TASODIFGA
  bog'liq edi.** Bir marta qilingan ish hali odat emas: keyingi sessiya
  boshqa kontekstda ochiladi va o'sha ehtiyotkorlikni takrorlashi
  kafolatlanmagan.

  **4. Yangi «XAVFSIZLIK QOIDALARI» bo'limi.** `git checkout <fayl>`
  **TAQIQLANADI**; o'rniga `cp` bilan nusxa olib, nusxadan tiklash
  ko'rsatildi. `rm -rf` va `git reset --hard` umuman yo'q. Tekshirish
  uchun kiritilgan HAR QANDAY o'zgarish qaytariladi va oxirida
  `git status` bilan TASDIQLANADI. Sabab: bugun agent
  `git checkout index.html` bilan **commit QILINMAGAN** tahrirni
  (`hidden` olib tashlash + `?v=57`) o'chirib yuborgan — tiklandi, lekin
  **TASODIFAN**, chunki zaxira nusxa olinmagan edi.

  🔴 **ENG QIMMAT BAND — NEGA AYNAN ENDI.** Bu xato 2026-08-07 dagi
  Test 17 yozuvida **ALLAQACHON ogohlantirilgan** edi va shunga qaramay
  takrorlandi. Sabab texnik emas: ogohlantirish **HISOBOTDA** turgan,
  **AGENT TA'RIFIDA** esa turmagan — agent har chaqirilganda o'z
  ta'rifini o'qiydi, eski hisobotlarni emas. Ya'ni **dars yozilishi
  kerak bo'lgan joy — ish bajaruvchining KO'RSATMASI, ish natijasining
  hisoboti emas.** Bu «yozilgan qoida himoya emas, uni tekshiradigan
  test himoya» oilasining qo'shnisi: bu yerda testga tushmaydigan narsa
  (agentning xatti-harakati) bor, shuning uchun u yagona ishlaydigan
  joyga — ta'rifning O'ZIGA yozildi.

  **YO'L-YO'LAKAY O'LCHANDI — ESKI OGOHLANTIRISH YOPILDI.** Oldingi
  yozuvda «backend ko'tarilmasa «Eng yangi» ZAXIRA rejimda ishlaydi va
  buni HECH NARSA ko'rsatmaydi» deb turgandi. Jonli o'lchandi (brauzer
  UA si bilan, Test 43 darsi bo'yicha): `/api/version` = **681a19f**,
  `/api/products` da `createdAt` **24/24** mahsulotda BOR. Backend
  ko'tarilgan, saralash HAQIQIY sanada ishlayapti.

  ⚠️ **RAQAM ANIQLASHTIRILDI:** «14 xil sana» degani 14 xil
  **TIMESTAMP**; kalendar **KUNI** esa atigi **6 ta** (11 mahsulot bitta
  kunda — 2026-07-23, qolganlari 07-31, 08-06, 08-07, 08-09, 08-13).
  Ya'ni saralashda TENG qiymatlar bor va ular orasidagi tartib
  aniqlanmagan. Bu nuqson EMAS (tenglar orasidagi tartib muhim emas),
  lekin «14 xil sana» iborasi *kunlar* deb o'qilsa yolg'on bo'lardi —
  **«hujjatdagi raqam = tekshirilmagan da'vo»** qoidasining kichik,
  lekin aniq namunasi.

  **Kesh:** `panel.js` 48 → **49** (Test 16 jadvali birga:
  `3223b5679c9b` → `4a2fde98ff09`). ⚠️ `loyiha-panel.html` prozasida
  `panel.js?v=` satri **yana oltita** joyda uchraydi (v=13…v=20) va
  ular TARIX — global almashtirish panelni jimgina soxtalashtirardi;
  shuning uchun faqat 1155-qatordagi HAQIQIY `<script src>` o'zgartirildi
  va qolgan oltitasi o'zgarmagani TEKSHIRILDI.

  **DEPLOY:** faqat STATIK (`panel.js`, `loyiha-panel.html`) — backend
  TEGILMADI, migratsiya YO'Q. 🔴 **PUSH QILINMADI** — founder qaroriga
  qoldirildi. 🔴 Founder panelni hali ko'z bilan ko'rmagan.

- [2026-08-19] **UCHTA QOROVUL QARZI YOPILDI (Test 44, 45, 46) VA QOROVULNING
  O'ZIDAGI LATENT NUQSON TUZATILDI. 82 → 86 test.**

  **1. Qarz qayerdan keldi.** 2026-08-16 (footer) va 2026-08-17 (saralash
  varag'i) ishlarida test soni O'ZGARMAGAN edi va ikkala hisobotda bu
  KAMCHILIK deb yozilgandi — qarz `sprint-4.md` → «Qarorlar» da ochiq
  turardi. Qamrovsiz uch joy sanalgandi: (a) `data-action` nomlari,
  (b) `[hidden]` qoidasi va `SORT_KEYS` mosligi, (c) deep-link `sayt_`
  prefiksi. Uchalasi ham JIMGINA sinadigan turdan — konsolda xato yo'q,
  testlar yashil, faqat foydalanuvchi sezadi.

  **2. Test 44 — `data-action` nishoni TIRIK bo'lsin** (244 nishon, 2 yuz).
  Tugma `data-action="nom"` bilan yoziladi, dispatcher `window[nom]` ni
  chaqiradi; nom noto'g'ri bo'lsa `typeof fn !== 'function'` da JIM
  qaytadi. Aynan shu 2026-08-14 da Mini App'dagi «Hisobdan chiqish» bilan
  bo'lgan — tugma tug'ilganidan beri o'lik edi. Ro'yxat QO'LDA yozilmaydi,
  ikkala yuzning HTML+JS manbasidan yig'iladi. Uch qatlam: statik
  `data-action`/`data-submit`/`data-enter`; obyekt maydoni `action: 'nom'`;
  **dinamik** `data-action="${X}"` yozadigan o'ramga chaqiruvda uzatilgan
  nom.
  ⚠️ **Dinamik qatlam NOM O'XSHASHLIGIGA emas, TUZILMAGA qaraydi:** o'ram
  funksiyaning nechanchi PARAMETRI nishon yozayotgani aniqlanadi va
  chaqiruvda AYNAN o'sha pozitsiyadagi argument olinadi. Birinchi variant
  nomga qarardi va SHOVQINLI edi — serverga yuboriladigan
  `action: 'request_image'` buyrug'ini va `segTabs` ning tab kaliti `'new'`
  ni ham «nishon» deb o'qigan. `reloadHome` istisnosi oq ro'yxatda EMAS,
  DISPATCHER KODIDA tekshiriladi: maxsus ishlov o'chirilsa istisno ham
  qolmaydi.

  **3. Test 45 — saralash varag'i va YASHIRISH mexanizmi** (6 `hidden`
  element). `SORT_KEYS` ↔ varaqdagi radio `value` lari ikkala yuzda mos
  bo'lsin; saytda `hidden` atributi bilan turgan HAR BIR element uchun CSS
  da `[hidden] { display: none }` qatori TALAB qilinadi; Mini App'da
  `.hidden { display: none !important }` mavjudligi. Sabab CLAUDE.md da:
  `hidden` muallif `display` qoidasidan KUCHSIZ va 2026-08-13 dagi «narx
  paneli yopiq tursin» qarori production'da hech qachon ishlamagan.

  **4. Test 46 — deep-link belgisi SERVERDAN o'tsin** (2 havola). HTML dagi
  bosiladigan `t.me/...?start=X` havolalari yig'iladi va serverning O'Z
  `manbaBelgisi()` funksiyasi CHAQIRILADI — qoida testga NUSXALANMAYDI, aks
  holda server o'zgarganda qorovul eski qoidani qo'riqlab yashil qolardi.
  Bu 2026-08-16 dagi `sayt_` prefiksi qarzini yopadi (`web_` prefiksli
  payload server tomonidan JIM rad etiladi va QR «nol odam keltirdi» bo'lib
  turardi).

  **5. 🔴 TOPILGAN HAQIQIY NUQSON — KOD YOLG'ON GAPIRARDI, KO'RINISH esa
  TO'G'RI edi.** Test 45 yozilganda `.search-x` (qidiruv × tugmasi) ushlandi:
  `index.html` da `hidden` atributi bor, `script.js` da `x.hidden = !v`
  turardi, lekin `.search-x { display: flex }` (`style.css:1348`) IKKALASINI
  ham bekor qilardi — ya'ni × HECH QACHON yashirilmagan. Founder 2026-08-17
  da «x turaversin» degani uchun EKRANDAGI natija to'g'ri edi, KOD esa
  boshqa narsani da'vo qilardi.
  ⚠️ **Tuzatish yo'nalishi MUHIM:** ko'rinishga TEGILMADI, kod QARORGA
  moslashtirildi — HTML dagi `hidden` va JS dagi `x.hidden = !v` qatori olib
  tashlandi, sababi izohda qoldirildi. Teskarisi (kodni «tuzatib»
  `[hidden]` qatorini qo'shish) founder qarorini JIMGINA bekor qilardi.

  **6. 🔴 QOROVULNING O'ZIDAGI LATENT NUQSON — 7 joyda 6 xil regex.**
  `server/test.js` da izoh tozalash yetti joyda qo'lda takrorlangan va
  OLTITASIDA blok izoh (`/* */`) BIRINCHI olinardi — bu Test 39 ni bir marta
  ko'r qilgan naqshning aynan o'zi (qator izohidagi `/*` blok boshi deb
  o'qilib, undan keyingi butun kod yutilardi). Hammasi bitta o'tishli holat
  mashinasiga (`jsSofi`) o'tkazildi, **10 chaqiruv**. Qarz `sprint-4.md` da
  ochiq band edi.
  ⚠️ **Yo'l-yo'lakay `jsSofi` ning O'ZIDA nuqson topildi: REGEX LITERAL
  hisobga olinmagan edi.** `/\/\//g` kabi ifodaning oxiridagi ikki qiya
  chiziq QATOR IZOHI deb o'qilib, qatorning qolgani yutilardi va undan
  keyingi haqiqiy izohlar tozalanmay qolardi — bu `telegram-app/app.js` ni
  YARIM o'qigan va Test 25 ni bekorga qizartirgan edi. Endi regexmi yoki
  bo'lishmi — oldingi ma'noli belgi hal qiladi.
  Ta'sirlangan 6 test mutatsiya bilan QAYTA sinaldi: nuqson KODDA bo'lsa
  qizil, faqat IZOHDA bo'lsa yashil — **6/6 to'g'ri**.

  **7. Sinalgani.** Ish jarayonida **16 mutatsiya**, 16 tasi ham ushlangan.
  ⚠️ Bu raqam hisobotchi tomonidan QAYTA o'lchanmadi — ish jarayonida
  olingan. Hisobotchi MUSTAQIL tekshirgani: **82 → 86** (`git stash` bilan
  HEAD da 82, ishchi nusxada 86 — `^✅ Test` satrlari sanaldi) va **4 ta
  o'z mutatsiyasi, 4 tasi ham ushlandi** (tafsilot `sprint-4.md` dagi
  yozuvda).

- [2026-08-07] **Test 17 yozildi — service worker kesh versiyasi endi QOROVUL
  ostida. 5-avgustda ataylab ochiq qoldirilgan qarz YOPILDI.**

  **1. Nima uchun Test 16 yetarli emas edi.** Test 16 (`e6716c4`) HTML dagi
  `?v=` versiyalarini qo'riqlaydi, service worker keshi esa BUTUNLAY boshqa
  mexanizm: `PRECACHE` ro'yxatidagi fayllar ATAYLAB `?v=` siz yuradi, chunki
  `sw.js` keshdan `ignoreSearch`siz qidiradi va versiyali so'rov keshdagi
  yozuvni topa olmasdi. Ya'ni ular uchun yagona eskirish dastagi —
  `CACHE_VERSION`, va Test 16 unga umuman qaramaydi. Qorovulning ko'r nuqtasi
  qorovul yo'qligidan yomonroq: u qamrov TUYG'USINI beradi.

  **2. Xavf konkret va JIMGINA.** `offline.js` tahrirlanib `CACHE_VERSION`
  o'sha joyda qolsa, `activate` eski keshni o'chirmaydi va qaytib kelgan
  foydalanuvchida ESKI `offline.html`/`offline.js` abadiy qolib ketadi —
  aynan internet uzilgan paytda, ya'ni tuzatish o'zi kerak bo'lgan holatda
  ishlamaydi. Bu nazariy emas: 2026-08-05 da aynan shu tuzoq ko'ringan
  (kesh tozalanmagan holatda 11 ta ortiqcha JPEG tortilardi).

  **3. Test nima qiladi** (`server/test.js` → `testServiceWorkerCacheVersion`).
  Ro'yxat QO'LDA yozilmaydi — `PRECACHE` ning O'ZI `sw.js` dan o'qiladi, ya'ni
  ro'yxatga yangi fayl qo'shilsa avtomatik qamraladi (Test 16 bilan bitta
  naqsh). Besh qorovul: (a) `CACHE_VERSION` jadvaldagi qiymatga mos;
  (b) `PRECACHE` ro'yxati + undagi HAR BIR faylning tarkibi `sha256` bilan
  jadvalga solishtiriladi — ro'yxatning O'ZI ham hisobga olinadi, chunki fayl
  qo'shilishi/olib tashlanishi ham keshni eskirtiradi, holbuki fayllar tarkibi
  o'zgarmagan bo'lishi mumkin; (c) `PRECACHE` yozuvida `?v=` bo'lmasin —
  yuqoridagi istisno shu bilan QULFLANADI, aks holda kelajakda kimdir
  "izchillik uchun" versiya qo'shib keshni butunlay ishlamas qilardi;
  (d) ro'yxatdagi har bir fayl diskda mavjud; (e) `CACHE_VERSION` nomi/shakli
  o'zgarsa test O'ZI qichqiradi — qorovul jimgina ishlamay qolmasligi uchun.

  **4. Tasdiqlangani — 6 ta MUTATSIYA, 6 tasi ham ushlandi.** Testning yashil
  bo'lishi u ishlayotganini isbotlamaydi, shuning uchun ataylab buzib ko'rildi:
  M1 `offline.js` o'zgardi, versiya qoldi → hash mos kelmadi; M2
  `CACHE_VERSION` `v3`→`v4`, jadval yangilanmadi → tutildi; M3 `PRECACHE` ga
  `?v=2` qo'shildi → tutildi; M4 `PRECACHE` da mavjud bo'lmagan fayl →
  tutildi; M5 `CACHE_VERSION` nomi o'zgartirildi → tutildi; M6 `PRECACHE` dan
  fayl olib tashlandi (fayllar TARKIBI o'zgarmagan holda) → tutildi.
  Mutatsiyalardan keyin fayllar scratchpad zaxirasidan tiklandi —
  `git checkout` ATAYLAB ishlatilmadi, u commit qilinmagan tahrirni
  o'chirib yuborardi. `node test.js` — **34 test PASS** (o'zi sanaldi, oldingi
  yozuvdagi 33 ustiga +1).

  **5. Yo'l-yo'lakay ikki eskirgan da'vo tuzatildi** (ikkalasi ham jonli
  serverdan o'qildi, 2026-08-07): `lolamarket-notify` servisi
  **2026-08-06 06:38:03** da qayta ishga tushgan va hozir `active` — ya'ni
  Sprint 9 dagi "restart HALI BAJARILMAGAN" va quyidagi "kod hali serverga
  ko'chirilmagan" yozuvlari eskirgan edi; ikkalasi ham yangilandi. CSP jonli
  sarlavhada tasdiqlandi (`script-src 'self' https://telegram.org
  https://static.cloudflareinsights.com` — `'unsafe-inline'` YO'Q, C3 yopiq).
  HSTS hamon `max-age=2592000` (30 kun) — founder bandi OCHIQ qoladi.

- [2026-08-06] **`telegram.org` ga `preconnect` qo'shildi — Sprint 8 ning
  OXIRGI ochiq tezlik bandi yopildi.** O'zgarish jismonan ikkita qator:
  `index.html` va `telegram-app/index.html` ga bittadan
  `&lt;link rel="preconnect" href="https://telegram.org"&gt;`. `admin/` ga
  ATAYLAB qo'shilmadi — u `telegram.org` ni umuman ishlatmaydi, ya'ni u yerda
  preconnect faqat behuda ulanish ochardi.

  **1. Asos O'LCHANGAN, taxmin emas.** Sovuq ulanish `curl` bilan 5 marta
  o'lchandi: DNS ~4 ms, TCP ~100 ms, TLS ~100 ms — ya'ni **ulanishning O'ZI
  ~200 ms turadi** va bu SOF KECHIKISH, bayt emas. Aynan shu sabab bandning
  mantiqi bor: 2026-08-05 o'lchoviga ko'ra landing ham, Mini App ham tarmoq
  kengligiga bog'liq EMAS — ikkalasining ham vaqtini ulanish kechikishi
  belgilaydi. Ya'ni shrift bandidan farqli o'laroq, bu band TO'G'RI o'lchamga
  tegadi.

  **2. QARORNING ENG NOZIK JOYI — `crossorigin` QO'YILMADI.** Pastdagi
  skriptda (`&lt;script defer src="https://telegram.org/js/..."&gt;`)
  `crossorigin` atributi yo'q, ya'ni u CORS'siz olinadi. Preconnect'ga
  `crossorigin` qo'yilsa brauzer **BOSHQA ulanish** ochadi, skript esa undan
  foydalanmaydi va **preconnect butunlay behuda ketadi** — bu preconnect'ning
  eng ko'p uchraydigan xatosi. Shrift preconnect'ida esa `crossorigin` BOR va
  bu TO'G'RI, chunki shrift CORS bilan olinadi. Ikkalasi bir xil ko'rinadi,
  lekin qarama-qarshi — shuning uchun sabab kod izohiga yozib qo'yildi.

  **3. Tasdiqlangani.** Ikkala sahifada preconnect chizildi; skriptning
  `crossorigin` i yo'qligi va preconnect'niki bilan MOS kelishi tekshirildi
  (`mos_keladimi: true`); `window.Telegram.WebApp` mavjud; Mini App'da 27 ta
  `[data-action]` joyida. `npm test` — 33 test PASS.

  ⚠️ **HALOL CHEGARA — ATAYLAB YOZILDI: "200 ms tejaldi" DEB YOZILMAYDI.**
  O'lchangani ulanish NARXI (~200 ms), tejovning O'ZI EMAS. Sabab: skript
  allaqachon `&lt;head&gt;` da turibdi va brauzerning preload skaneri uni
  baribir erta topadi, ya'ni haqiqiy yutuq 200 ms dan KICHIK bo'lishi mumkin.
  Sovuq ulanishli oldin/keyin o'lchovini brauzerda ajratib bo'lmadi — ulanish
  hovuzi issiq. Shuning uchun bu yerda faqat narx yozilgan, yutuq emas
  (bugungi "hujjatdagi raqam — tekshirilmagan da'vo" qoidasi bilan bitta
  oiladan: o'lchanmagan raqam yozilsa, ertaga u dalil bo'lib qoladi).

- [2026-08-06] **Shrift bandi YOPILDI: latin subseti 131 KB → 96 KB (−27%), va
  yo'l-yo'lakay MA'LUM BO'LDIKI hujjatdagi raqamning O'ZI noto'g'ri edi.**
  O'zgarish jismonan kichkina — uchta HTML da (`index.html`,
  `telegram-app/index.html`, `admin/index.html`) Google Fonts havolasining
  BITTA qatori almashtirildi. Boshqa hech narsa tegilmadi.

  **1. AVVAL: hujjatdagi raqam tekshirildi va YOLG'ON chiqdi.** Sprint faylida
  ham, qoldiq ro'yxatida ham "shriftlar 250 KB / 13 ta `woff2`" deb yozilgan
  edi. O'lchaganda bu **barcha `unicode-range` subsetlarining yig'indisi**
  ekani aniqlandi — brauzer esa faqat kerakli subsetni (latin) oladi. Haqiqiy
  xarajat: **3 fayl / 131 KB.** Ikki MUSTAQIL usul bir xil javob berdi:
  (a) `curl` bilan latin subsetlarini yig'ish = 131 KB, (b) brauzerdagi
  `performance` resurs yozuvlari = 131 KB, 3 fayl. Ya'ni muammo hujjatda
  yozilganidan **ikki barobar kichik** edi va butun band shu raqamga qarab
  ustuvorlashtirilgan edi.

  **2. Isrofning haqiqiy manbai.** `Bricolage Grotesque` IKKI o'qli o'zgaruvchan
  shrift sifatida so'ralardi: `opsz` (optik o'lcham) butun **12..96 oralig'i**
  + qalinlik. Ikkinchi o'q butun oralig'i bilan bitta fayl **75 KB** turardi.
  Yana ikkita mayda nuqson: `Geist Mono` **400 va 500** so'ralardi lekin
  hech qayerda ishlatilmasdi; `Geist Mono 700` esa **ishlatiladi lekin
  so'ralmasdi** — ya'ni brauzer soxta qalin (faux bold) chizardi.

  **3. Qaror: `opsz` o'qi TASHLANMADI, bitta qiymatga QOTIRILDI.** Sabab va
  o'lchov "Qarorlar" bo'limida. Qisqasi: o'qni butunlay olib tashlash ham
  40 KB berardi, lekin ko'rinishni o'zgartirardi; qotirish AYNI tejovni beradi
  va qaysi qiymatga qotirish TAXMIN qilinmadi, O'LCHANDI.

  | | Oldin | Keyin |
  |---|---|---|
  | Latin subseti | 131 KB | **96 KB** (−35 KB, −27%) |
  | Fayl | 3 ta alohida yuz (7 ta yuz e'loni) | **3 ta o'zgaruvchan fayl** |
  | `Geist Mono 700` | soxta qalin (faux bold) | **haqiqiy** |

  Yuklangan yuzlar endi oraliq: `Bricolage Grotesque 600 800`,
  `Geist Mono 600 700`, `Hanken Grotesk 400 700`.

  **4. DALIL — ko'rinish buzilmagani TAXMIN emas, O'LCHOV.** Lokal (yangi) va
  production (eski) yonma-yon solishtirildi, 1280px va 375px da:

  | Element | Production | Yangi | Farq |
  |---|---|---|---|
  | 34px sarlavha ("Gulli naqsh") | 438.6 px | 445.0 px | +1.5% |
  | 34px sarlavha ("Telegram orqali") | 583.3 px | 591.5 px | +1.4% |
  | 17px nav ("LolaMarket") | 91.1 px | 90.2 px | −1.0% |

  **Eng muhim dalil — BALANDLIKLAR aynan bir xil qoldi** (mobil'da
  18.7 / 43.3 / 21.7 / 43.3 / 16.2; desktopda 18.7 / 77.5 / 38.8). Ya'ni matn
  hech qayerda QAYTA O'RALMAGAN va joylashuv siljimagan — kenglikdagi 1.5%
  farq bitta sarlavhada ~6 piksel va o'ram chizig'ini o'zgartirmaydi. Mini App
  va admin ekranlari ham chizilib ko'rildi; zaxira shriftga tushib qolgan
  element yo'q (`Times` faqat bitta joyda, u O'ZGARISHDAN OLDIN ham shunday
  edi — ya'ni bu regressiya emas). `npm test` — **33 test PASS.**
  _(⚠️ Yo'l-yo'lakay: kechagi hujjatlarda "32 test" deb yozilgan edi. Sanab
  ko'rilganda `HEAD` dagi `server/test.js` da ham 33 ta test yorlig'i bor —
  ya'ni bugun test qo'shilmagan, kechagi raqam noto'g'ri sanalgan. Mayda, lekin
  shu yozuvning O'Z mavzusi bilan bitta oiladan.)_

  **⚠️ HALOL CHEGARA:** bu 35 KB tejov, lekin **tezlik mezoni uchun sezilarli
  o'zgarish KUTILMAYDI va "tezlik yaxshilandi" deb YOZILMAYDI.** 2026-08-05
  yakuniy o'lchoviga ko'ra landing tarmoq kengligiga bog'liq bo'lishdan chiqqan
  (sekin va tez 3G natijalari ustma-ust tushgan, vaqtni ulanish kechikishi
  belgilaydi). Ya'ni bu bayt tozaligi va `Geist Mono` sifatining tuzatilishi —
  sekundomer raqami emas. Aks holda bu o'lchanmagan da'vo bo'lardi.

  **Ochiq qolgani:** `telegram.org` ga `preconnect` — hamon ochiq, xuddi shu
  sababdan katta foyda bermaydi.

- [2026-08-05] **Tezlik bandi YOPILDI: production'da sekin 3G'da 10.14 s → 2.0–2.6 s.
  Qolgan 11 ta mato rasmi WebP ga o'tkazildi va yo'l-yo'lakay IKKITA TIZIMLI
  nuqson topib tuzatildi — ikkalasi ham optimizatsiyani o'z ichidan yeb turgan edi.**

  **1. Bandning yopilishi (asosiy natija).** `a6962d1` (banner WebP) production'ga
  chiqqandan keyin qayta o'lchandi. Usul bazaviy o'lchov bilan AYNI (`curl
  --limit-rate`), sekin 3G'da OLTI marta: **2.0 / 2.6 / 2.5 / 1.6 / 2.0 / 2.5 s** —
  oltalasi ham 3 soniyadan past, oldin 10.14 s edi. Tez 3G: 1.4–2.4 s (oldin 2.66 s).
  Chegara va xulosalar bandning o'z yonida yozilgan. Qisqasi: landing endi tarmoq
  kengligiga bog'liq emas, vaqtni ulanish kechikishi belgilaydi.

  **2. Qolgan 11 ta mato rasmi WebP ga o'tkazildi.** `cwebp -q 72 -m 6`; kengligi
  900px dan katta bo'lgan yagona rasm (`9933cd…`, 1152px) 900 ga kichraytirildi.
  Natija: **2 831 445 → 1 604 168 bayt, ya'ni 1.2 MB (−43%).** Bu rasmlar `lazy`,
  ya'ni kritik yo'lda emas — foydalanuvchi aylantirganda yuklanadi. `index.html` da
  11 ta kartochka `<picture>` ga o'raldi (`script.js?v=23 → v=24`).

  **Sifat q=72 — ASOSLANGAN tanlov, taxmin emas.** Avval q=80 sinaldi va mayda
  naqshli mato suratlarida deyarli foyda bermadi (`7a30c608` −3%, `c20cdf0e` −11%):
  bunday rasmlarning entropiyasi yuqori, ya'ni siqib bo'lmaydigan tafsilot ko'p.
  q=72 da −21% gacha yaxshilandi. Sifat KO'Z BILAN solishtirildi — asl JPEG va
  q=72 yonma-yon ko'rildi: mato tolasi, naqsh qirralari, fon — farq sezilmadi.
  Bu qadam ataylab tashlab ketilmadi, chunki **xaridor matoni aynan rasmga qarab
  baholaydi**, ya'ni bu yerda "bir necha KB" sifatdan muhimroq emas.

  900px chegarasining sababi: rasm eng katta holda mahsulot tafsiloti oynasida
  ko'rsatiladi (`.pd-img`, konteyner kengligining 100%i), ya'ni DPR 2 da ~750–1000px
  kerak. Kartochkada esa atigi ~262px, savatda 62px — undan kattasi isrof.

  **3. TIZIMLI NUQSON — `script.js` → `product()` WebP ni ko'rmasdi.** Funksiya
  `el.querySelector('img')?.getAttribute('src')` qilardi, ya'ni HAR DOIM `.jpg`
  ZAXIRASINI olardi. Bu qiymat uch joyda ishlatiladi: mahsulot tafsiloti oynasi
  (`.pd-img`), savat qatori (`.cart-line-img`), saralanganlar qatori
  (`.fav-line-img`). Natijada kartochka WebP ko'rsatardi, lekin foydalanuvchi
  mahsulotni ochsa yoki savatga solsa — AYNAN O'SHA rasm ikkinchi formatda
  qaytadan yuklanardi. Ya'ni WebP ga o'tish o'sha yo'llarda holatni
  YOMONLASHTIRARDI. Tuzatish: `img.currentSrc || img.getAttribute('src')` —
  `currentSrc` brauzer `<picture>` dan HAQIQATAN tanlagan manba. `getAttribute('src')`
  zaxira bo'lib qoldi, chunki `loading="lazy"` rasmda `currentSrc` yuklana
  boshlagunicha bo'sh bo'ladi.

  Bu `a6962d1` dagi "bir rasm ikki joyda" nuqsonining AYNAN O'SHA OILASI: format
  o'zgarishi rasm CHIZILADIGAN har bir yo'lni qamrashi kerak, aks holda qolgan yo'l
  eski faylni tortib, tejashni bekor qiladi.

  **4. IKKINCHI NUQSON — service worker keshi eski `.jpg` larni ushlab turardi.**
  Sinovda toza yuklanishda ham 11 ta ortiqcha JPEG tortilardi. Sabab: `sw.js`
  `cacheFirst` strategiyasida ishlaydi va eski `.jpg` yozuvlari keshda qolgandi.
  Qo'lda tozalangach — 0 ta JPEG, 14 ta WebP. `CACHE_VERSION` `v1` → `v2`.

  **Buning darsi nuqsondan muhimroq:** `sw.js` faylining O'ZIDA "Har deploy'da bu
  raqamni oshiring — eski kesh butunlay tozalanadi" deb yozib qo'yilgan, lekin
  `CACHE_VERSION` hamon `v1` edi — ya'ni bu ko'rsatma oldingi deploy'larda
  BAJARILMAGAN. Faylda yozilgan ko'rsatma ham, CLAUDE.md dagi qoida kabi,
  tekshirilmasa bajarilmay qolar ekan. Bu bugungi Test 10c darsining (qoidani
  yozgan odam o'sha faylda uni buzdi) to'g'ridan-to'g'ri takrori.

  **Brauzerda tekshirildi (dalillar):** 15 ta `<picture>` (3 banner slaydi + 12
  kartochka) va `script.js?v=24` yuklanyapti; 12 ta kartochkaning HAMMASI `.webp`
  tanlagan va yopilgan (balandligi 0) blok 0 ta — ya'ni `a6962d1` dagi `<picture>`
  CSS tuzog'i bu yerda takrorlanmadi; SW keshi tozalangan TOZA yuklanishda **0 ta
  JPEG, 14 ta WebP**; `product('ik-1402')` `.webp` qaytardi; kartochka bosilib
  tafsilot oynasi ochildi — `.pd-img` `.webp` va ochilishda YANGI JPEG
  SO'RALMADI (0 → 0), ya'ni 3-banddagi tuzatish amalda tasdiqlandi; banner
  ekran suratida to'g'ri chizilgan. Konsoldagi yagona xato — `/api/auth/web/me`
  404, lokal statik serverda backend yo'qligidan (regressiya emas).

  **Eski `.jpg` fayllar O'CHIRILMADI** — ular `<img>` da zaxira bo'lib qoladi
  (eski Safari), `a6962d1` dagi qaror bilan bir xil.

  **Hali qilinmagani:** shriftlar (250 KB, 13 ta `woff2`, 3 oila / 10 qalinlik) va
  `telegram.org` ga `preconnect` — ikkalasi ham OCHIQ. Lekin ular endi tezlik
  MEZONI uchun emas (mezon o'tdi), boshqa sabablar uchun bajariladi.
  _(2026-08-06 tuzatishi: shrift bandi bajarildi, va o'lchaganda yuqoridagi
  "250 KB / 13 ta `woff2`" raqamining O'ZI noto'g'ri bo'lib chiqdi — haqiqiy
  xarajat 131 KB / 3 fayl edi. Yozuv tarix sifatida o'zgartirilmay qolmoqda.)_

- [2026-08-05] **Banner rasmlari WebP ga o'tkazildi — landing kritik yo'li mobilda
  342 KB → 88 KB (A1 o'lchovi ko'rsatgan ENG KATTA yutuq olindi).** Ertalabki A1
  tashxisi bitta faylni ayblagan edi: `banner-mato.jpg` 305 KB, kritik yo'lning 78%i.
  Shu band bajarildi.

  **Vosita:** `cwebp 1.6.0` (Homebrew orqali o'rnatildi — mashinada hech qanday
  konvertor yo'q edi: `sips` WebP yoza olmaydi, Pillow ham yo'q). Sifat `q=80 -m 6`.

  | Fayl | JPEG | WebP | Tejash |
  |---|---|---|---|
  | `banner-mato` (1400px) | 305 349 | 132 732 | −57% |
  | `banner-mato-800` (mobil, 800px) | — | 50 858 | **−83%** asl hajmdan |
  | `banner-mato-2` (900px) | 123 311 | 57 306 | −54% |
  | `d7928cec…` (3-slayd, 850×1360) | 147 072 | 96 976 | −34% |

  **Eng katta yutuq faqat WebP dan emas, `srcset` dan keldi.** Banner konteyneri
  eng ko'pi 1180px, telefonda esa ~400 CSS px — 1400px rasm u yerda ORTIQCHA edi.
  Shuning uchun mobil uchun alohida 800px nusxa qo'shildi. Natija: kritik yo'l
  mobilda **342 KB → 88 KB**, ya'ni sekin 3G'da (50 KB/s) taxminan
  **10.1 s → ~1.8 s**. `<picture>` ishlatildi — WebP asosiy manba, JPEG esa `<img>`
  da zaxira (eski Safari uchun); eski rasmlar O'CHIRILMADI.

  **MAJBURIY CSS tuzatishi — aks holda nuqson JIMGINA chiqadi.** `<picture>` rasm
  bilan uni o'rab turgan quti orasiga KIRADI va u odatda `display: inline`,
  balandligi `auto`. Shuning uchun `.ad-slide img { height: 100% }` va
  `.product-media img { height: 100% }` tayanadigan narsasini yo'qotadi: rasm
  yo'qolmaydi, BLOK balandligi nolga tushadi — ya'ni buzilish xato bermaydi,
  shunchaki ekranda bo'sh joy qoladi. `style.css` ga `<picture>` ni shaffof qutiga
  aylantiruvchi qoida qo'shildi va izohda "rasmni `<picture>` ga o'rasangiz
  konteynerini shu ro'yxatga qo'shing" deb ogohlantirildi.

  **Yo'l-yo'lakay topilgan va tuzatilgan nuqson — O'ZIM KIRITGAN.**
  `Photo/textile/d7928cec…` rasmi IKKI joyda ishlatiladi: banner karuselining
  3-slaydi VA `tx-4402` mahsulot kartochkasi. Faqat bannerni `<picture>` ga o'rasam,
  brauzer AYNAN BIR rasmni ikki formatda ikki marta yuklab olardi (96 KB webp +
  147 KB jpg = 243 KB, avvalgi 147 KB o'rniga) — ya'ni o'zgarishim o'sha rasm uchun
  holatni YOMONLASHTIRARDI. Kartochka ham `<picture>` ga o'raldi va brauzerda
  tasdiqlandi: toza yuklanishda `d7928cec….jpg` UMUMAN so'ralmaydi.

  **Brauzerda tekshirildi (dalillar):** mobil 375px / DPR 2 da brauzer
  `banner-mato-800.webp` ni tanladi, desktop 1280px da `banner-mato.webp` (1400px) —
  ya'ni `srcset` ikki tomonga ham to'g'ri ishlaydi; `getComputedStyle(picture).display
  === 'block'`, `.ad-track` balandligi 250px va `.product-media` 327.5px (ichidagi
  `picture` va `img` ham aynan shuncha) — hech qayerda blok yopilmagan; uchala slayd
  `complete: true` va `currentSrc` uchalasida ham `.webp`. Konsoldagi yagona xatolar —
  `/api/auth/web/me` 404, lokal statik serverda backend yo'qligidan (regressiya emas).

  **Deploy:** `deploy.yml` dagi `source` ro'yxatida `Photo/` PAPKA sifatida turibdi,
  shuning uchun yangi `.webp` fayllar avtomatik chiqadi — CLAUDE.md dagi "yangi fayl
  qo'lda qo'shilsin" tuzog'i faqat yangi ILDIZ fayllariga tegishli.

  **Hali qilinmagani:** qolgan 11 ta `Photo/textile/*.jpg` (~2.7 MB) hamon JPEG —
  ular `lazy`, ya'ni kritik yo'lda emas, lekin aylantirganda yuklanadi. Shriftlar va
  `telegram.org` `preconnect` bandlari ham ochiq. Tezlik bandi `[x]` QILINMADI:
  88 KB — LOKAL hisob, production o'lchovi deploy'dan keyin.

- [2026-08-05] **Sahifa yuklanish tezligi SEKIN MOBIL TARMOQDA birinchi marta
  o'lchandi (A1) — kod o'zgartirilmadi, bu tashxis.** 31-iyulda qolgan bo'shliq
  ("o'lchov lokal va Wi-Fi bo'yicha") yopildi: `curl --limit-rate` bilan haqiqiy
  throttling qo'llanib, 50 KB/s (sekin 3G) va 200 KB/s (tez 3G) da o'lchandi.
  Raqamlar va to'liq jadval yuqoridagi band yonida.

  Qisqasi: **landing sekin 3G'da 10.1 s** — sprint mezoni "3 soniyadan kam"
  O'TMAYDI; tez 3G'da 2.66 s bilan zo'rg'a o'tadi. Sabab bitta faylda to'plangan —
  `Photo/Main/banner-mato.jpg` **305 KB**, kritik yo'lning 78%i, yolg'iz o'zi sekin
  3G'da ~6 s. Shriftlar 250 KB (13 ta `woff2`, 3 oila / 10 qalinlik) —
  Mini App'ning butun kritik yo'lidan 3.4 barobar og'ir.

  **Kutilmagan topilma:** Mini App tarmoq kengligiga deyarli BOG'LIQ EMAS — 50 KB/s
  va 200 KB/s da natija bir xil oraliqda (1.5–3.5 s) sochildi, ya'ni uni bayt emas,
  uchta tashqi domenga ULANISH KECHIKISHI boshqaradi. Shu yerdan aniq qarz chiqdi:
  `fonts.googleapis.com` va `fonts.gstatic.com` ga `preconnect` bor,
  **`telegram.org` ga yo'q** — holbuki `telegram-web-app.js` aynan o'shandan keladi.

  Usul haqida: brauzer panelidagi FCP ATAYLAB ishlatilmadi — tab `hidden` bo'lganda
  u yolg'on ko'rsatadi va bu allaqachon bir marta chalg'itgan. O'lchov tashqi
  vositadan, tarmoq darajasida olindi.

  Band `[x]` QILINMADI. Yopilishi uchun kerak (BAJARILMAGAN): banner rasm →
  WebP/AVIF + `srcset` (~305 KB → ~60 KB, ~5 s tejaydi), shrift qalinliklarini
  kamaytirish, `telegram.org` ga `preconnect`

- [2026-08-05] **Test 2c qo'shildi — "bo'sh emas, lekin yaroqsiz" sozlama qiymati
  qo'riqlanadi (`server/test.js`).** Test `chatId()` qorovulini tekshiradi: butun son
  o'zgarmaydi, manfiy guruh id qabul qilinadi, bo'shliq kesiladi, bo'sh/berilmagan
  qiymat zaxiraga qaytadi. Asosiy bandi esa `<chat_id>` va `abc` kabi qiymatlar —
  ular ham zaxiraga qaytishi, ham `console.error` bilan IZ qoldirishi shart, va
  guruhlash kaliti (1-argument) o'zgarmasligi alohida tekshiriladi. `npm test` — 28
  test PASS. Sabab va tafsilot Sprint 9 dagi 2026-08-05 yozuvida: aynan shu tekshiruv
  yo'qligi xato monitoringini ikki kun jimgina o'lik qilib qo'ygan edi

- [2026-08-03] **B4 — buyurtma holati tarixi (`order_status_history`) qo'shildi: endi har bir
  o'tish "qachon, qaysi holatdan qaysisiga, KIM" bo'lib yoziladi.**

  **Muammo:** `orders.status` faqat JORIY holatni saqlardi. Buyurtma qachon tasdiqlangani,
  kim jo'natgani, nega bekor qilingani hech qayerda qolmasdi — bahs chiqqanda "sotuvchi
  qachon jo'natdi?" degan savolga javob Telegram yozishmalarini qo'lda titishdan iborat edi.
  B2 dagi `#LM-3001` bahsi aynan shuni ko'rsatdi.

  **Sxema** (`db/015_order_status_history.sql`): `order_id`, `from_status` (NULL = buyurtma
  endi yaratildi), `to_status`, `actor_kind` (`buyer`/`seller`/`admin`/`bot`/`system`),
  `actor_tg`, `note`, `created_at`; `(order_id, created_at)` indeksi. Mavjud 13 buyurtma
  backfill qilindi, lekin **TIKLANGAN tarix sifatida emas**: oraliq qadamlar hech qayerda
  saqlanmagan va tiklab bo'lmaydi, shuning uchun har biriga bitta qator yoziladi —
  `from_status=NULL`, `actor_kind='system'` va ochiq izoh bilan, `created_at` esa
  buyurtmaning O'Z sanasi (aks holda 13 ta eski buyurtma "bugun o'zgargan" bo'lib
  ko'rinardi). Migratsiya idempotent va oxirida tarixsiz buyurtma qolmaganini tekshiradi.

  **`to_status` da CHECK ATAYLAB YO'Q** — bu o'sha kuni topilgan `review_hide` darsining
  bevosita natijasi: bitta ro'yxat ikki joyda yashagani uchun `admin_actions_kind_check`
  eskirib qolgan va funksiya butunlay ishlamas edi. Bu yerda qiymat baribir `orders` ning
  o'zidan keladi va `orders_status_check` dan o'tgan bo'ladi, ya'ni ikkinchi ro'yxat faqat
  kelajakda yangi holat qo'shilganda jimgina rad etadigan tuzoq bo'lardi. `actor_kind` da
  esa CHECK BOR — u shu jadvalda tug'iladi va takrorlanmaydi.

  **Yozuvchi** (`server/lib/order-history.js`, yangi fayl): `recordStatusChange()` — tarixning
  YAGONA yozuvchisi. U `pool` emas, **tranzaksiya klientini** talab qiladi va buni haqiqatan
  tekshiradi (`pool` da ham `.query` bor, shuning uchun farq `.release` mavjudligi bo'yicha
  aniqlanadi): `pool` uzatilsa yozuv tranzaksiyadan tashqarida ketib, modulning butun maqsadi
  jimgina yo'qolardi. Xato YUTILMAYDI — tarix yozilmasa butun o'tish ROLLBACK bo'ladi. Bu
  ongli kelishuv: teshikli tarix tarix yo'qligidan yomonroq, chunki unga qarab qaror qabul
  qilinadi. Narxi — tarix jadvali buzilsa buyurtma oqimi ham to'xtaydi, lekin bu B1 alerti
  orqali darhol Telegram'ga chiqadi.

  **Yozuv nuqtalari (5 ta):** `routes/orders.js` — Mini App va sayt buyurtmasi tug'ilishi
  (`from=NULL`, `actor_kind='buyer'`; saytda Telegram hisobi bo'lmasligi mumkin, u holda
  `actor_tg` NULL); `routes/seller.js` — accept/reject/ship; `routes/webhook.js` — bot
  buyruqlari (`/tasdiqla` `/yolga` `/yetdi`), bu yerda **ilgari tranzaksiya UMUMAN yo'q edi**;
  `routes/admin.js` — `order_payout`, `order_refund`, `dispute_resolve`. `UPDATE` lar `prev`
  CTE ga o'tkazildi, chunki `RETURNING` faqat YANGI qiymatni beradi, tarixga esa "qaysi
  holatdan" kerak — `FOR UPDATE` bilan qator qulflanadi va mavjud atomik qorovullar
  (`prev.status = ANY(...)`, `<> 'refunded'`, `status='delivered'`) ilgarigidek ishlaydi.
  Admin amallarida `run(a)` → `run(a, actorTg)` bo'ldi: tugmani BOSGAN adminning Telegram
  ID'si tarixga yoziladi (`a.decided_by` bu paytda hali NULL).

  **Sinov — uchta yangi test va uchta mutatsiya.** Test 12 yozuvchining o'zini qamraydi
  (`pool` rad etilishi, noma'lum `actorKind` rad etilishi, parametrlar, `from`/`actorTg` NULL
  ga aylanishi). **Test 12b eng muhimi:** u manba kodini skanerlaydi va har bir
  `UPDATE orders SET status` yozuvi yonida `recordStatusChange` borligini tekshiradi, ustiga
  aniq inventar (`HISTORY_INVENTORY`) bilan solishtiradi — yangi yozuv nuqtasi qo'shilsa test
  QIZIL bo'ladi va odam ongli qaror qabul qilishga majbur. Sabab: xavf funksiyada emas,
  QAMROVDA — unutilgan yozuv nuqtasi hech narsani buzmaydi, testlar yashil qoladi va tarixda
  jimgina teshik paydo bo'ladi. Test 12c CTE refaktoringidan keyin atomik qorovullar
  joyidaligini tekshiradi. Mutatsiya bilan tasdiqlandi: (a) `seller.js` dan tarix chaqiruvi
  olib tashlanganda 12b qizil; (b) tarixsiz yangi `UPDATE orders SET status` qo'shilganda
  inventar mos kelmadi va 12b qizil; (c) `prev.status = ANY(...)` olib tashlanganda 12c qizil.
  Hammasi qaytarildi. `npm test` — hammasi PASS, lint 0 xato.

  **OCHIQ QARZ (ataylab qoldirildi):** `webhook.js` dagi bot buyrug'ida holat qorovuli YO'Q —
  u `/yetdi` ni istalgan holatdagi buyurtmaga yozaveradi (`seller.js` dan farqi shu). Qorovul
  qo'shish founder'ning bot bilan ishlash odatini kutilmaganda buzardi, bu esa B4 doirasidan
  tashqari xatti-harakat o'zgarishi bo'lardi. Tarix endi `from_status` ni yozadi, ya'ni
  mantiqsiz o'tish KO'RINADI — tuzatilmaydi, lekin yashirinmaydi.

  **Deploy holati:** migratsiya production'da QO'LLANILDI va tasdiqlandi (13 buyurtma,
  13 tarix yozuvi, tarixsiz buyurtma 0, jadval egaligi `lola`), zaxira nusxa olindi.
  **Kod hali serverga ko'chirilmagan** — commit'dan keyin rsync + `systemctl restart
  lolamarket-notify` kerak. Ya'ni HOZIR production'da jadval bor, lekin unga yozadigan kod
  yo'q: bu vaqtinchalik holat, keyingi deploy'gacha yangi o'tishlar tarixga tushmaydi.
  Sprint bandi shu sabab `[x]` qilinmadi (30-iyul qarori: dalil jonli tekshiruvdan keladi).

  ✅ **[2026-08-07] YUQORIDAGI "ko'chirilmagan" YOZUVI ESKIRGAN.** Jonli serverda
  tekshirildi: `/opt/lolamarket-notify/lib/order-history.js` mavjud (2026-08-03 04:15)
  va servis `active`, oxirgi ishga tushish **2026-08-06 06:38:03**. Ya'ni
  "jadval bor, yozadigan kod yo'q" vaqtinchalik holati TUGAGAN. Yozuv ataylab
  o'chirilmadi — u o'sha kunning haqiqiy holati; eskirgani ustiga qo'shildi.

- [2026-08-03] **B2 — bahs (dispute) oqimi jonli Telegram bilan uchidan-uchiga sinaldi, va
  yo'l-yo'lakay `review_hide` amalini BUTUNLAY ishlamas qilib turgan production nuqsoni
  topib tuzatildi.**

  `routes/disputes.js` (316 satr) hech qachon shu tarzda sinalmagan edi. Haqiqiy buyurtma
  `#LM-3001` (allaqachon `shipped` holatida) ustida: xaridor Mini App'dan bahs ochdi
  (sabab + izoh) → bot dalil rasmi so'radi → 1 ta rasm yuborildi → "tayyor" deyildi →
  sotuvchi kabinetdan javob yozildi → admin panelning "Bahslar" bo'limida "Qaror qabul
  qilish" bosildi (aybdor=sotuvchi, logistika=sotuvchi, qaytarish=1 000 000 so'm) →
  Telegram'ga tasdiq xabari keldi → "✅ Tasdiqlash" bosildi. Natija: `disputes.status='resolved'`
  VA `orders.status='refunded'` bitta tranzaksiyada, ikkalasi ham bir xil timestamp bilan
  (`03:56:57.517992`) — kod to'g'ri ishladi.

  **Bitta izohsiz hodisa:** birinchi urinishda admin panel so'rovi serverga umuman yetib
  bormadi (nginx jurnalida iz yo'q, `admin_actions` jadvalida yozuv yo'q — B1 alerti ham
  jim, chunki serverga hech narsa kelmagan, ya'ni bu client-side hodisa). Ikkinchi urinishda
  muammosiz o'tdi. Sabab aniqlanmadi (ehtimol validatsiya toast'i e'tiborsiz qolgan yoki
  tarmoq sekinligi) — takrorlanmadi, shuning uchun kod o'zgartirilmadi.

  **Yo'l-yo'lakay jiddiy production nuqsoni topildi va tuzatildi: `review_hide` amali
  BUTUNLAY ishlamas edi.** `routes/admin.js` da `review_hide` haqiqiy `ADMIN_ACTIONS` amali
  sifatida ro'yxatga olingan (sharh yashirish), lekin `db/005_sprint7_admin.sql` dagi
  `admin_actions_kind_check` CHECK cheklovida bu qiymat yo'q edi — `dispute_resolve`
  migratsiyaga kiritilgan, `review_hide` esa (sharhlar funksiyasi keyinroq, `012_reviews.sql`
  da qo'shilganda) unutilgan. Ya'ni **har safar admin panelda "Sharhni yashirish" bosilganda
  500 xato kelardi** — `INSERT INTO admin_actions` baza darajasida (23514, check constraint)
  rad etilardi. `db/014_review_hide_action.sql` yozildi (CHECK qayta yaratildi, `review_hide`
  qo'shildi), production'da qo'llanildi va ikki marta tasdiqlandi: (a) `BEGIN; INSERT ...;
  ROLLBACK;` bilan oldin xato ekanini ko'rsatdim, migratsiyadan keyin xatosiz o'tdi;
  (b) `\d admin_actions` cheklov ro'yxatida `review_hide` borligini ko'rsatadi. Test residue
  yo'q (`SELECT count(*) FROM admin_actions WHERE kind='review_hide'` = 0).

  **Ishonch darajasi:** ikkalasi ham jonli production'da, real Telegram va real admin panel
  orqali sinaldi va tasdiqlandi (bazadagi haqiqiy qatorlar bilan) — unit test emas.

  **Deploy holati:** migratsiya QO'LLANILDI (production). Kod tomonida o'zgarish yo'q —
  faqat bitta yangi migratsiya fayli (`db/014_review_hide_action.sql`), u allaqachon serverda
  `sudo -u postgres psql -f` bilan bajarilgan. `server/` papkasida O'ZGARISH YO'Q,
  rsync/restart kerak emas.

  **Ochiq narsa:** `#LM-3001` (haqiqiy buyurtma) foydalanuvchining ONGLI QARORI bilan
  `refunded` holatida QOLDIRILDI (tozalanmadi) — bu nuqson emas, buyurtma test qoldig'i
  sifatida ataylab saqlanmoqda.

- [2026-08-03] **"Sharh yashirilganda reyting qayta hisoblanadi" — kod to'g'ri edi, lekin
  bu ULANISH hech qachon tekshirilmagan ekan. Test 11 qo'shildi.**

  Test 8 `recalcRating()` ning O'ZINI sinardi va u o'tardi. Lekin uni `hideReview()`
  HAQIQATAN chaqirishini hech kim tekshirmagan — ya'ni chaqiruv kodda tasodifan olib
  tashlansa **butun test to'plami yashil qolardi**, admin sharhni yashirar, reyting esa
  yashirilgan sharhni hisobga olib abadiy yolg'on qolib ketardi. Bu CLAUDE.md dagi
  "reyting hosila, qo'lda yozilmasin" qoidasining ikkinchi yuzi: qoida bajarilishi
  ta'minlanmagan bo'lsa, u qoida emas, niyat.

  **Test 11 nimani tekshiradi** (`server/test.js`, soxta `pool.connect` klienti bilan —
  baza kerak emas):
  1. `hideReview()` haqiqatan `recalcRating()` ni chaqiradi (`UPDATE products ... avg(stars)`).
  2. **TARTIB:** `UPDATE reviews` → `recalcRating` → `COMMIT`, ya'ni qayta hisoblash
     `COMMIT` dan OLDIN va bitta tranzaksiyada. Keyin bo'lsa, hisoblash qulaganda sharh
     yashirilgan, reyting esa eski holida qolardi — baza o'zi bilan ziddiyatga tushardi.
  3. Faqat `status = 'published'` sharh yashiriladi — ikki marta yashirish sonni buzardi.
  4. Sotuvchi reytingi ham yangilanadi (`UPDATE sellers`).
  5. **Teskari holat:** sharh allaqachon yashirilgan bo'lsa (`UPDATE` 0 qator qaytardi)
     reyting UMUMAN tegilmaydi, `ROLLBACK` bo'ladi va ulanish poolga qaytariladi.

  **Mutatsiya bilan tasdiqlandi:** `hideReview` dagi `recalcRating` chaqiruvi olib
  tashlanganda Test 11 QIZIL bo'ldi, keyin qaytarildi. Ya'ni test haqiqatan shu ulanishni
  tutadi — "yozdim va yashil" degan gapga ishonilmadi.

  **Jonli bazada tekshirilgani va CHEGARASI:** bazada 14 mahsulot va **0 ta sharh** bor.
  Ya'ni reyting invariantlari hozir trivial ravishda to'g'ri va production ma'lumoti bu
  yerda hech narsani isbotlamaydi. Zanjirning qolgan qismi (buyurtma → yetkazildi →
  haqiqiy sharh → reyting) hamon keyingi `SINOV` sessiyasiga qoladi.

- [2026-08-02] **Xavfsizlik auditi Mini App'da saqlanuvchi XSS topdi — tafsilot va
  tuzatish `sprint-9.md` da, bu yerda faqat SINOV USULI qayd etilyapti.**

  Nuqson rejalashtirilgan bandlardan birortasida emas, "bu to'la qonligicha tugadimi?"
  degan savoldan keyingi auditda chiqdi. Sprint 8 uchun ahamiyatli qismi — **qanday
  tasdiqlangani**: teshik "bor ko'rinadi" deb emas, brauzerda to'rtta haqiqiy hujum
  yuki bilan sinaldi (`<img src=x onerror=...>`, `<script>`, `' onmouseover='`,
  `"><svg onload=...>`). Eski yo'lda **4 tadan 3 tasi haqiqiy TEG yaratdi va 3 tasi
  hodisa atributini kiritdi** — ya'ni bu nazariy xavf emas, ishlaydigan hujum edi.
  Tuzatishdan keyin 4 tasi ham 0 teg berdi va oddiy matn bo'lib ko'rindi.

  **Sprint 8 uchun dars:** oqim sinovlari (buyurtma, bahs) shu paytgacha faqat
  ODDIY ma'lumot bilan o'tkazilgan edi. Oqim "ishlaydi" degani uni **yomon niyatli
  kirish bilan** sinalgan degani emas — buyurtma izohi va bahs sababi barcha
  sinovlarda oddiy matn edi, shuning uchun teshik oqim sinovlaridan o'tib ketaverdi.
  Bu 2026-07-31 dagi "soxta ma'lumot o'zimiz kutgan shaklda keladi" darsining ikkinchi
  yuzi: bu safar ma'lumot foydalanuvchidan keladi, biz esa uni ham "kutgan shaklda"
  deb faraz qilgan edik.

- [2026-08-01] **Sotuvchining accept / ship / reject oqimi production'da haqiqiy Telegram va
  Mini App bilan sinaldi — 31-iyulda ochiq qolgan bo'shliq yopildi. Nuqson topilmadi.**

  Sinovda `p-ms8wy86z-r9c2` ("Tola", Marg'ilon Ipak Co., boshlang'ich zaxira 12) ishlatildi.
  To'rtta buyurtma ataylab har xil yo'ldan yuborildi:

  | Buyurtma | Mahsulot | Yo'l | Natija |
  |---|---|---|---|
  | `#LM-3016` | Tola ×1 | accept → ship | trek `test0001` bazaga yozildi |
  | `#LM-3017` | Tola ×1 | accept | `confirmed` da qoldi |
  | `#LM-3018` | Junli mato (`hb-7740`) ×2 | — | ataylab `pending` qoldirildi |
  | `#LM-3019` | Tola ×4 | reject | zaxira **+4 qaytdi** |

  **Tasdiqlangani.** `accept` (`pending` → `confirmed`) — xaridorga Telegram xabari va admin
  chatga bildirishnoma ketdi. `ship` (`confirmed` → `shipped`) — trek raqami saqlandi, va
  **trek raqamisiz jo'natish RAD ETILADI** (ya'ni "jo'natdim, raqamni keyin aytaman" degan
  holat bo'lmaydi — xaridor qo'lida kuzatadigan narsa qolmasdi). `reject`
  (`pending` → `cancelled`) — zaxira **aynan so'ralgan miqdorda** qaytdi: 4 so'raldi, 4 qaytdi.
  Oxirgisi muhim, chunki `restoreStock` buyurtma qatorlari ustidan ishlaydi; noto'g'ri yozilsa
  u zaxirani kam yoki ortiq qaytarardi va xatosi darrov ko'rinmasdi.

  **Sinov chiqindisi tozalandi** (2026-07-30 qaroriga muvofiq): to'rtala buyurtma o'chirildi,
  band turgan zaxira qaytarildi, ikkala mahsulot boshlang'ich holatiga qaytdi (Tola 12, Junli
  mato 49). Tozalash **ochiq API orqali mustaqil tasdiqlandi** — ya'ni "o'chirdim" degan gapga
  emas, bazadan qaytgan songa ishonildi.

  **Sprint 8 da HAMON sinalmagani:** to'lov (Payme/Click — tashqi merchant kaliti yo'q,
  bloklangan), yetkazib berish (BTS API), escrow, bahsli holat va bahs qarori.

  **Yo'l-yo'lakay ko'rilgan, kod O'ZGARTIRILMAGAN ikki narsa:**
  1. `server/routes/seller.js:197` dagi izoh yo'lni `/api/seller/order` deb yozgan, haqiqiy
     yo'l esa `/api/seller/orders` (ko'plikda) — kichik eskirgan izoh, xatti-harakatga ta'siri
     yo'q.
  2. `restoreStock` dagi `UPDATE ... FROM order_items` naqshi tekshirildi va **NUQSON EMAS**
     deb topildi. Shubha o'rinli edi (bir mahsulot ikki qatorda uchrasa `UPDATE` faqat bittasini
     hisobga olardi), lekin bunday holat yuzaga kelmaydi: `orders.js:106` dagi `qtyById` Map va
     `orders.js:121` dagi `prods` bitta buyurtmada bitta mahsulot faqat bir marta qator
     bo'lishini ta'minlaydi. Yozib qo'yilyapti, chunki bu tekshiruv keyin yana takrorlanmasin

- [2026-07-31] **Sharhlar tizimi production'ga chiqdi va DARVOZALARI sinaldi — asosiy
  oqim esa sinalmay qoldi (sabab quyida).**

  **Sinalgani (jonli, `curl` bilan):** soxta reyting yo'qoldi — `/api/products`
  **13/13 mahsulotda `"rating":null, "reviews":0`** qaytaryapti (ilgari `4.9`, `42`).
  `GET /api/reviews?productId=…` → **200** `{"ok":true,"data":[]}`; `productId`siz
  → **400**. Himoyalangan yo'llar: `POST /api/reviews` → **401**, `?mine=1` → **401**,
  `/api/seller/reviews` → **401**, `/api/web/orders` → **401**. **Soxta imzo bilan
  ham 401** (`X-Telegram-Init-Data` da 64 nol) — ya'ni initData tekshiruvi sharh
  yo'lida ham ishlayapti.

  **Sinab BO'LMAGANI va nega:** sharh yozish uchun imzolangan Telegram kimligi kerak,
  agent uni soxtalashtira olmaydi — himoya aynan shu uchun qurilgan. Lokal to'liq
  oqimni ishga tushirish ham imkonsiz: mashinada Postgres ham, Docker ham yo'q
  (`psql`/`docker` topilmadi). Ya'ni **buyurtma → yetkazildi → sharh → reyting
  qayta hisoblanishi → admin yashirishi** zanjiri hali HAQIQIY sharh bilan
  sinalmagan. Qadamma-qadam reja: `docs/sinov-sharhlar.md`, founder bajaradi.

  **Yo'l-yo'lakay yopilgan bo'shliq:** yulduz chegarasini (`stars` 0 yoki 6) jonli
  `curl` bilan sinab bo'lmadi — `/api/reviews` da autentifikatsiya validatsiyadan
  OLDIN ishlaydi, ya'ni so'rov yulduz qiymatiga yetib bormasdan 401 oladi. Chegara
  shu sababli unit test bilan qamaldi (`test.js` → Test 8c): sxema `REVIEW_SCHEMA`
  sifatida eksport qilindi va 0/6/−1/100, satr shaklidagi `"6"`, majburiy maydonlar
  hamda 1000 belgidan uzun matn tekshirildi. `npm test` — 8 ta test guruhi PASS.

- [2026-07-31] **Uch oqim (sotuvchi → admin → xaridor) production'da haqiqiy Telegram bilan
  uchidan-uchiga sinaldi — 30-iyulda "founder qo'lda bajarishi kerak" deb qoldirilgan uchala
  bo'shliq yopildi, va sinov bitta nuqson topdi.**

  **1. Sotuvchi oqimi.** Sotuvchi Mini App'dan mahsulot qo'shdi (`Yengi paplim`, 8 600 000 so'm,
  zaxira 20), bot rasm so'radi, sotuvchi botga rasm yubordi va rasm mahsulotga biriktirildi.
  Bu kod 2026-07-30 da yozilgan edi, lekin **haqiqiy Telegram bilan hech qachon sinalmagandi** —
  faqat soxta ma'lumot bilan. Moderatsiyagacha mahsulot ommaviy katalogda ko'rinmadi (12 ta bo'lib
  qoldi), ya'ni moderatsiya darvozasi haqiqatan yopiq turadi.

  **2. Admin moderatsiyasi.** Navbatda rasm va zaxira ko'rindi, founder tasdiqladi, mahsulot
  katalogga chiqdi (13 ta). HMAC-imzolangan `/api/product-photo` havolasi alohida tekshirildi:
  to'g'ri imzo bilan rasm keladi (590 KB, haqiqiy JPEG 1920×2560), soxta imzo bilan **401** —
  bot tokeni chiqmaydi va havolani o'ylab topib bo'lmaydi.

  **3. Mini App buyurtmasi (Telegram imzosi bilan).** Buyurtma o'tdi, zaxira **20 → 19**
  (1 dona buyurtma qilingan). Ya'ni atomik `UPDATE ... WHERE stock >= qty` faqat sayt yo'lida
  emas, haqiqiy Mini App yo'lida ham ishlaydi — 30-iyulgi sinov buni qamrab olmagan edi.

  **Topilgan va tuzatilgan nuqson: `/api/product-photo` rasmni `application/octet-stream` deb
  qaytarardi.** Sabab: `catalog.js` Telegram fayl CDN'i bergan `content-type` ni shundoq uzatardi,
  u esa yo bo'sh, yo umumiy. Brauzer `<img>` ichida turni o'zi sezgani uchun rasm **ko'rinardi** —
  aynan shuning uchun nuqson uzoq sezilmadi — lekin Cloudflare rasm optimizatsiyasi ishlamasdi.
  Tuzatish (`server/routes/catalog.js`): yangi `usableMime()` bo'sh va `application/octet-stream`
  ni yaroqsiz deb qaytaradi, `mimeFromPath()` esa turni `getFile` qaytargan yo'l kengaytmasidan
  aniqlaydi. **Oddiy `|| ` fallback bu yerda ishlamasdi**: `application/octet-stream` "truthy",
  ya'ni u fallback'ni jimgina bosib o'tardi. Olti holat bilan sinaldi, `npm test` ham o'tdi.
  Kod serverga `scp` qilindi va jonli javob tasdiqlandi: endi `image/jpeg`.

  **Sinov chiqindisi tozalandi** — founder sinov mahsuloti va buyurtmasini bazadan o'chirdi,
  katalog 12 ta bazaviy holatga qaytdi (2026-07-30 dagi qarorga muvofiq).

  **Bilib qo'yish kerak:** `/api/version` hali `28f3b36` ko'rsatadi — bitta fayl `scp` qilingani
  uchun `version.txt` yangilanmadi. Serverda kod yangi, yorliq eski; keyingi to'liq deploy'da
  o'z-o'zidan to'g'rilanadi.

- [2026-07-31] **Yuklanish tezligi birinchi marta o'lchandi — sahifani sekinlashtirgan uchta
  sabab topildi va tuzatildi.** Ilgari bu band "rasmlar siqilgan" degan taxminga tayanardi;
  o'lchanganda ma'lum bo'ldiki, asosiy muammo rasm hajmi emas, **to'sib turuvchi kod** ekan.

  **1. Butun ekranni yopib turuvchi loader `window.load` ga bog'langan edi** (`script.js`).
  `#page-loader` — `position: fixed; inset: 0`, ya'ni u ochiq turganda foydalanuvchi
  sahifadan HECH NARSA ko'rmaydi. U esa `window.load` da yopilardi, `load` hodisasi esa
  yuqoridagi barcha rasm/shrift yuklanib bo'lgandan keyin otiladi. Natijada tarkib
  allaqachon tayyor bo'lsa ham (DOM ~240 ms) foydalanuvchi spinner ko'rib o'tirardi.
  Endi DOM tayyor bo'lishi kifoya. **Bu `pwa.js`dagi tuzoqning (`5ffe1f0`) AYNAN O'ZI —
  `load` hodisasiga bog'lanish.** Uchinchi marta takrorlanmasligi uchun CLAUDE.md ga
  qoida yozildi.

  **2. `telegram-web-app.js` `<head>`da `defer`siz turardi** (landing va Mini App'da ham) —
  114 KB ni uchinchi domendan (`telegram.org`) kutib HTML tahlilini **~613 ms** to'xtatib
  turardi (jonli o'lchov). Uchala skript ham `defer` qilindi. **Diqqat: uchalasi ham
  birdan** — bittasi `defer`siz qolsa u parse paytida, ya'ni defer'liklardan OLDIN ishlaydi
  va `script.js`/`app.js` `window.Telegram`ni topa olmay qoladi. Sinovda `defer`dan keyin
  `window.Telegram` hali ham `object`, filtr ishlaydi (12 tadan 2 tasi), konsolda 0 xato.

  **3. Katalogda 2.1 MB lik PNG turgan ekan** — `Photo/textile/Без названия (1).png`,
  yolg'iz o'zi jonli tarmoqdan **5.6 soniyada** kelardi. 2026-07-30 dagi rasm siqish
  sessiyasi uni o'tkazib yuborgan. `vintage-chit-krem-atirgul.jpg` ga aylantirildi
  (800×1422, sifat 55) — **220 KB, ya'ni −89%**; vizual farq ko'rinmaydi (naqsh mayda va
  bir xil). Kirill harfli va bo'sh joyli fayl nomi ham yo'qoldi — bu CI `source` ro'yxati
  tuzog'i bilan birga xavfli juftlik edi. **Eski PNG o'chirilmadi** — `sayt-eski/index.html`
  unga ishora qiladi (CLAUDE.md: `sayt-eski/` o'chirilmasin).

  **Natija:** sahifaning umumiy og'irligi ~4.93 MB → ~3.13 MB (−37%), birinchi chizishni
  to'sib turadigan narsa qolmadi. **Versiyalar:** `script.js?v=20→21`,
  `telegram-app/app.js?v=52→53`. **O'lchov usuli:** `curl` bilan har resursning jonli
  hajmi va vaqti, brauzerda `PerformanceNavigationTiming` + `fetch(cache:'reload')`.
  **Tekshirilmagani:** sekin mobil tarmoq — band shu sabab ochiq qoladi

- [2026-07-30] **Sprint 8 rasman boshlandi — zaxira oqimi production'da end-to-end sinaldi va sinov
  ikkita jiddiy DEPLOY teshigini ochib berdi.**

  **1. Zaxira oqimi sinovi (production, haqiqiy baza).** Sinalgani: haqiqiy sayt buyurtmasi `#LM-3011`
  zaxirani to'g'ri kamaytirgani tasdiqlandi (`ik-1402` 50→48 va boshqalar); zaxiradan ortiq buyurtma
  rad etiladi va sabab aniq son bilan qaytadi ("faqat 5 rulon qoldi"); **race condition** — 2 buyurtma
  ayni paytda oxirgi 1 rulonga yuborildi, birinchisi oldi, ikkinchisiga "tugadi" qaytdi, zaxira 0 bo'ldi
  (−1 EMAS, ya'ni atomik `UPDATE ... WHERE stock >= qty` haqiqatan himoya qilyapti); `made` mahsulot
  (`stock IS NULL` = cheksiz) 500 ta buyurtmada ham tugamadi; `restoreStock` SQL tranzaksiyada sinaldi
  (0→1, `ROLLBACK` bilan qaytarildi). Sinov buyurtmalari (`#LM-3012`, `#LM-3013`) o'chirildi va zaxira
  baseline'ga qaytarildi — production bazasida sinov chiqindisi qolmadi. Ruxsat darvozalari alohida
  tekshirildi: 6 ta himoyalangan endpoint tokensiz **401** qaytaradi.

  **2. Sinov davomida topilgan deploy teshiklari** (tafsilot `sprint-1.md`da, tuzatish `c6350a1`):
  CI landing PWA fayllarini serverga umuman chiqarmayotgan ekan, va Mini App uchun deploy qadami
  butunlay yo'q ekan — Mini App **27-iyuldan beri** eskirgan turgan (`app.js?v=47`, jonli kod `v52`).
  Ya'ni oxirgi uch sessiyaning BUTUN Mini App ishi (PWA, mahsulot rasmi UI, logistika narxi qatori,
  zaxira ko'rsatkichi) foydalanuvchilarga umuman yetib bormagan. Bu Sprint 8 ning asosiy qiymati:
  band sifatida rejalashtirilmagan, sinov paytida qo'lga tushgan.

  **3. Deploy tuzatilgandan keyin ikkinchi qatlam nuqson** (tafsilot `sprint-5.md`da, tuzatish `5ffe1f0`):
  fayllar joyiga yetib borgandan keyin ham jonli saytda service worker ro'yxatdan o'tmadi — `pwa.js`
  `load` hodisasiga bog'liq edi. Tuzatilgandan keyin jonli saytda yakuniy holat: `scope:
  https://lolamarket.uz/`, `active: true`, kesh `lolamarket-web-v1` yaratildi.

  **Founder qo'lda bajardi:** nginx'ga `/sw.js` va `/manifest.json` uchun no-cache qoidalari qo'shildi
  (kanonik nusxa serverda: `/etc/nginx/sites-available/lolamarket`) — bu `sprint-5.md`dagi 2026-07-28
  "ochiq ish"ni yopadi; Cloudflare keshi tozalandi.

  **Hali qilinmagan (founder qo'lda bajarishi kerak, agentda imkon yo'q):** sotuvchining botga mahsulot
  rasmini yuborishi; admin panel moderatsiyasida rasm + zaxira ko'rinishini tekshirish; Mini App'dan
  (Telegram imzosi bilan) buyurtma berish.

- [2026-07-30] _(shu kunning erta yozuvi — yuqoridagi sinovdan OLDINGI holat)_ Sprint 8 hali rasman boshlanmagan, lekin "Sahifalar yuklanish tezligi (3 soniyadan kam)" bandiga tegishli tayyorgarlik ko'rildi: bir nechta og'ir landing rasmi siqildi (masalan `Photo/Main/hero-fabrics.jpg` 7.8MB PNG → 413KB JPEG, tafsilot `sprint-5.md`da) va landing PWA'ga aylantirildi (service worker, offline sahifa — shu ham `sprint-5.md`da). Haqiqiy sahifa yuklanish tezligi hali o'lchanmagan/sinalmagan, band ochiq qoladi

---

## Qarorlar

- [2026-08-25] Qaror (founder, uch band): **(A) masalalar GitHub Issues'da**
  (`furqattukhsanov/1-dars`), tashqi PR'lar triage yuzasi EMAS; **(B) triage
  teglari standart nomlari bilan** (`needs-triage`, `needs-info`,
  `ready-for-agent`, `ready-for-human`, `wontfix`) — o'zbekcha muqobil
  o'ylab topilmadi, skill'lar kutgan lug'at bilan bir xil turishi uchun;
  **(C) repo bitta kontekstli** — `CONTEXT-MAP.md` kerak emas, domen
  hujjatlari ildizdagi `CONTEXT.md` + `docs/adr/` da yashaydi (ikkalasi hali
  yaratilmagan, skill'lar kerak bo'lganda o'zi ochadi). ⚠️ ADR yozilganda
  `CLAUDE.md` dagi mavjud arxitektura qarorlari bilan zid kelmasin —
  bu ogohlantirish `docs/agents/domain.md` ning o'zida ham yozilgan.

- [2026-08-20] Qaror: **`/api/order-status` IDOR'i imzo emas, `authUser` +
  egalik bilan yopildi.** Xulosa hujjatning dastlabki rejasi imzo qo'yishni
  (`orderStatusSig`, `productPhotoSig` naqshi) taklif qilgandi. Amalda `authUser`
  tanlandi: (1) u CLAUDE.md tamoyiliga to'g'ridan-to'g'ri mos — endpointni faqat
  Mini App chaqiradi, ya'ni initData majburiy bo'lishi ATAYLAB; (2) egalikka
  bog'lash (`WHERE id=$1 AND tg_user_id=$2`) imzodan kuchliroq — imzo faqat «bu ID'ni
  bilaman» ni isbotlaydi, egalik esa «bu buyurtma MENIKI» ni. Bahs/profil endpointlari
  allaqachon shu naqshda (`WHERE tg_user_id=$auth`), ya'ni order-status ularga
  moslashtirildi, yangi naqsh o'ylab topilmadi. Hujjatdagi imzo-reja qatori shu bilan
  ESKIRDI (kod — haqiqatga birlamchi manba).

- [2026-08-19] Qaror: **mutatsiya QO'LLANGANINI tasdiqlamasdan uning
  natijasiga ishonilmaydi.** Bugun Test 16 ni sinash uchun qilingan
  ikkinchi mutatsiya (`?v=49` → `?v=50`) **umuman tegmadi**: hisobot
  yozuvi qo'shilgach `loyiha-panel.html` da qatorlar 13 taga surilgan va
  qattiq yozilgan qator raqami endi boshqa qatorni ko'rsatardi. Test
  YASHIL qoldi va bu «qorovul ko'r» degan **NOTO'G'RI xulosaga** olib
  kelayotgandi — aslida qorovul sog'lom, tekshiruvning O'ZI bo'sh
  ketgandi. Endi mutatsiya qatorni RAQAM bilan emas, MAZMUN bilan topadi
  va o'zgarish sodir bo'lganini `assert` qiladi (o'zgarmasa — to'xtaydi).
  ⚠️ **Yashil test ikki xil ma'noda bo'ladi: «nuqson yo'q» va «men
  hech narsani sinamadim»** — ikkinchisi birinchisiga o'xshab ko'rinadi.
  Bu `tekshiruv-xatolari` darsining aynan takrori: «tekshirdim» ≠
  «to'g'ri narsani tekshirdim». Qayta o'lchandi: mutatsiya mazmun bo'yicha
  qo'llangach Test 16 **QIZIL** bo'ldi, ya'ni qorovul tirik

- [2026-08-19] Qaror: **`git push` — hisobotchining ishi EMAS.** Agent
  `git add` va `git commit` gacha boradi, push'ni founder o'zi bajaradi.
  Sabab: push tashqi dunyoga chiqadi va CI orqali **production deploy'ini**
  ishga tushiradi, ya'ni u hisobotning texnik davomi emas, ALOHIDA QAROR.
  Bir xil tugma ostida ikki xil og'irlikdagi amal turmasin: commit'ni
  qaytarish arzon, production'ga chiqqan kodni qaytarish qimmat

- [2026-08-19] Qaror: **dars ISH BAJARUVCHINING KO'RSATMASIGA yoziladi,
  ish natijasining hisobotiga emas.** `git checkout` xatosi 2026-08-07
  dagi Test 17 yozuvida allaqachon ogohlantirilgan edi va shunga qaramay
  2026-08-19 da takrorlandi — chunki ogohlantirish HISOBOTDA turgan,
  AGENT TA'RIFIDA esa turmagan. Agent har chaqirilganda o'z ta'rifini
  o'qiydi, eski sprint yozuvlarini emas. Dars: **hujjatning to'g'ri
  bo'lishi yetarli emas, u O'QILADIGAN joyda turishi ham kerak** —
  «yozilgan qoida himoya emas» oilasining qo'shnisi

- [2026-08-19] Qaror: **agent xatti-harakati testga tushmaydi, shuning
  uchun u TA'RIFDA qulflanadi.** «Da'voni o'lcha», «`git checkout`
  ishlatma», «o'zgarishni qaytar» — bularning hech biri `test.js` bilan
  qo'riqlanmaydi (test kodni o'qiydi, agentni emas). Bu prompt matni va
  «mavjud yo'lni sana» bandlari bilan bitta oilada: **test yozib
  bo'lmaydigan joyda qadam QO'LDA bajariladi va ta'rifga yoziladi.**
  Shuning uchun bu qoidalar uchun qorovul test QO'SHILMADI va bu
  kamchilik emas, TANLOV

- [2026-08-19] Qaror: **vaqt bilan eskiradigan qiymat shablonga
  QOTIRILMAYDI.** `Co-Authored-By` dagi model nomi ta'rifda qotib
  yozilgan edi va eskirganda hech narsa qichqirmadi — na test qizil
  bo'ldi, na jurnalda iz qoldi; nuqson faqat odam ko'rgach tuzatildi.
  Bunday qiymat yo muhitdan olinadi, yo umuman yozilmaydi.
  `ALERT_CHAT_ID` va `BANNER_VERSION` darslari bilan bitta oila

- [2026-08-19] Qaror: **qorovul QOIDANI NUSXALAMAYDI — manbadagi funksiyani
  CHAQIRADI.** Test 46 deep-link prefiksini o'zi tekshirmaydi, serverning
  O'Z `manbaBelgisi()` funksiyasini chaqiradi. Qoida testga ko'chirilsa ikki
  haqiqat manbai paydo bo'lardi va server o'zgargan kuni qorovul ESKI qoidani
  qo'riqlab yashil qolaverardi — ya'ni u aynan qoida o'zgargan paytda,
  eng kerak bo'lgan payt, ko'r bo'lardi. `PRECACHE` va `HISTORY_INVENTORY`
  qarorlari bilan bitta oila

- [2026-08-19] Qaror: **satr qidiradigan test YETARLI EMAS bo'lgan joyda
  XATTI-HARAKAT sinaladi.** Test 47 `sortProducts` ni manbadan ajratib olib
  HAQIQIY ro'yxatda yurgizadi (3 holat). Sabab: «sana bo'yicha saralayapman»
  degan kod ham, teskari tartibda saralaydigan kod ham AYNI satrlarni o'z
  ichiga oladi — matn tekshiruvi ikkalasini ham yashil deb o'qirdi. Buni
  hisobotchining M4 mutatsiyasi tasdiqladi: `return 1` → `return -1`
  (sanasiz kartochka oxiriga emas, boshiga) — matn O'ZGARMADI, test QIZIL

- [2026-08-19] Qaror: **qorovul kodi TAKRORLANMASIN — bitta funksiyada
  tursin.** Izoh tozalash `test.js` da yetti joyda qo'lda takrorlangan va
  oltitasi Test 39 ni ko'r qilgan eski naqshda qolgan edi: nuqson bitta
  nusxada tuzatilgan, qolgan oltitasi esa tuzatilmagan holda yashab yurgan.
  Endi bitta `jsSofi`. Dars: **takrorlangan qorovul kodi qorovulning eng
  zaif joyi** — u yashil bo'lib turadi va qamrov TUYG'USINI beradi

- [2026-08-19] Qaror: **qorovul ro'yxati QO'LDA yozilmaydi va nomga emas,
  TUZILMAGA qaraydi.** Test 44 nishonlarni ikkala yuzning manbasidan yig'adi
  (244 ta), dinamik nishonni esa o'ram funksiyaning PARAMETR indeksi orqali
  topadi. Nomga qaraydigan birinchi variant shovqinli edi — serverga
  yuboriladigan `action: 'request_image'` va tab kaliti `'new'` ni ham nishon
  deb o'qigan. Sabab: **shovqinli qorovul uzoq yashamaydi** — yolg'on qizil
  beradi va bir kun o'chiriladi, ya'ni natija qorovul umuman yo'qligi bilan
  bir xil bo'lardi

- [2026-08-19] Qaror: **mutatsiyani QAYTARISH `git` bilan EMAS, zaxiradan
  bo'ladi.** Hisobotchi bugun `git checkout index.html` ishlatib commit
  QILINMAGAN tahrirni o'chirib yubordi (tiklandi, diff bayt-bayt
  solishtirildi). Bu 2026-08-07 dagi Test 17 yozuvida ALLAQACHON
  ogohlantirilgan edi — ya'ni yozilgan ogohlantirish uni bajarilgan
  qilmadi. Tartib: (1) zaxira mutatsiyadan OLDIN scratchpad'ga,
  (2) mutatsiya, (3) qaytarish NUSXADAN. `git checkout` ishchi nusxadagi
  tahrirni tanimaydi — u faqat commit qilinganini biladi

- [2026-08-07] Qaror: **`PRECACHE` ro'yxati testda QO'LDA sanalmaydi — `sw.js`
  ning O'ZIDAN o'qiladi.** Qo'lda yozilgan ro'yxat ikkinchi haqiqat manbai
  bo'lardi va u jimgina eskirardi: yangi fayl `PRECACHE` ga qo'shilsa test
  buni sezmay, "yashil" qolaverardi — ya'ni qorovul aynan yangi fayl
  qo'shilgan paytda, eng kerak bo'lgan payt, ko'r bo'lardi. Bu `to_status`
  ga CHECK qo'yilmagani va Test 16 ning HTML larni o'zi skanerlashi bilan
  bitta oila: **bir xil ro'yxat ikki joyda takrorlanmasin — ikkinchi ro'yxat
  himoya emas, kelajakdagi tuzoq.**

- [2026-08-07] Qaror: **`PRECACHE` da `?v=` YO'QLIGI endi test bilan
  QULFLANDI.** Bu istisno CLAUDE.md da yozilgan edi, lekin u tushuntirish
  edi — qorovul emas. Xavf teskari yo'nalishda: kimdir "izchillik uchun"
  `?v=` qo'shsa, `sw.js` keshdan `ignoreSearch`siz qidirgani uchun so'rov
  keshdagi yozuvga UMUMAN mos kelmay qolardi va offline rejim butunlay
  o'lardi — sinovsiz sezilmaydigan nuqson. Endi bunday o'zgarish testda
  darrov qizil bo'ladi va sababini o'zi tushuntiradi.

- [2026-08-07] Qaror: **test YASHIL bo'lgani u ishlayotganini isbotlamaydi —
  qorovul MUTATSIYA bilan sinaladi.** Test 17 oltita ataylab buzilgan holatda
  tekshirildi va oltitasi ham ushlandi. Sabab loyihaning takroriy darsidan
  keladi: Test 10c qo'shilishiga sabab bo'lgan qoida O'SHA commitning o'zida
  buzilgan holda qolgan edi, ya'ni **hech kim buzib ko'rmagan qorovul —
  qorovul emas, taxmin.** Yangi qorovul testi qo'shilganda shu tartib
  saqlansin.

- [2026-08-07] Qaror: **mutatsiyadan keyin fayl `git checkout` bilan
  TIKLANMAYDI — zaxiradan tiklanadi.** Test 17 ni sinash uchun `sw.js` va
  `offline.js` ataylab buzilgan payt ishchi katalogda commit QILINMAGAN
  tahrirlar turgandi (`test.js`, `CLAUDE.md`): `git checkout` ularni
  savolsiz o'chirib yuborardi va ish yo'qolardi. Shuning uchun fayllar avval
  scratchpad ga nusxalandi, keyin undan qaytarildi. Bu "Almashtirishni
  QO'LGA KIRITMASDAN eskisini o'chirma" qoidasining aynan o'sha oilasi:
  **qaytarish yo'li amal boshlanishidan OLDIN mavjud bo'lsin.**

- [2026-08-06] Qaror: **`telegram.org` preconnect'iga `crossorigin`
  QO'YILMADI — chunki skriptning o'zida ham u yo'q.** Preconnect brauzerda
  ulanishni CORS bo'yicha ALOHIDA hovuzda saqlaydi: `crossorigin` li
  preconnect va `crossorigin` siz skript BOSHQA-BOSHQA ulanish ochadi, ya'ni
  preconnect butunlay behuda ketadi (bu preconnect'ning eng ko'p uchraydigan
  xatosi). Shu sabab shrift preconnect'ida `crossorigin` BOR va u to'g'ri —
  shrift CORS bilan olinadi; `telegram.org` skripti esa CORS'siz olinadi.
  Ikki qator bir xil ko'rinadi, lekin QARAMA-QARSHI, shuning uchun sabab
  kod izohiga yozildi va kelajakda "izchillik uchun" tenglashtirilmasin.
  Mos kelishi tekshirildi, taxmin qilinmadi (`mos_keladimi: true`).

- [2026-08-06] Qaror: **`admin/` ga preconnect QO'SHILMADI.** U
  `telegram.org` ni umuman ishlatmaydi — preconnect u yerda foydasiz
  ulanish ochib, qolgan resurslardan ulush olardi. Umumiy qoida:
  preconnect faqat sahifa HAQIQATAN boradigan domenga qo'yiladi.

- [2026-08-06] Qaror: **preconnect uchun "200 ms tejaldi" DEB YOZILMAYDI —
  o'lchangani ulanish NARXI, yutuq emas.** Sovuq ulanish 5 marta o'lchandi
  (DNS ~4 + TCP ~100 + TLS ~100 ms), lekin tejovning O'ZI izolyatsiya
  qilinmadi: skript `&lt;head&gt;` da turgani uchun preload skaneri uni baribir
  erta topadi va oldin/keyin farqini issiq ulanish hovuzi ostida brauzerda
  ajratib bo'lmadi. Ya'ni haqiqiy yutuq 200 ms dan kichik bo'lishi mumkin.
  Bu bugungi «hujjatdagi raqam — tekshirilmagan da'vo» qoidasining
  BEVOSITA qo'llanishi: bugun yozilgan o'lchanmagan raqam ertaga dalil
  bo'lib qoladi va navbatdagi bandni noto'g'ri ustuvorlashtiradi.

- [2026-08-06] Qaror: **hujjatdagi raqam ham TEKSHIRILMAGAN DA'VO bo'lishi
  mumkin — ish boshlashdan oldin o'sha raqamning O'ZI o'lchansin.** "Shriftlar
  250 KB / 13 ta `woff2`" ikki hujjatda turgan va ustuvorlikni belgilagan edi;
  o'lchaganda u barcha `unicode-range` subsetlarining yig'indisi ekani, brauzer
  esa faqat latin subsetini olishi ma'lum bo'ldi — haqiqiy raqam 131 KB / 3
  fayl, ya'ni ikki barobar kichik. Qoida: optimizatsiya bandi ochilganda
  BIRINCHI qadam — bazaviy raqamni o'z usuling bilan qayta o'lchash, va
  kamida IKKI mustaqil usul bilan (bu yerda `curl` bilan yig'ish va brauzer
  `performance` yozuvlari bir xil javob berdi). Bu `sayt-eski/` darsining
  (2026-08-06) aynan takrori: hujjatga yozilgan sabab haqiqatdek ko'rinadi

- [2026-08-06] Qaror: **`opsz` o'qi TASHLANMADI, bitta qiymatga QOTIRILDI —
  va qaysi qiymatga qotirish TAXMIN emas O'LCHOV bilan tanlandi.** O'qni
  butunlay olib tashlash (`wght@600..800`) va bitta qiymatga qotirish
  (`opsz,wght@24,600..800`) AYNI hajm beradi — ikkalasi ham 40 KB. Demak tanlov
  bayt haqida emas, KO'RINISH haqida edi: o'lchov `opsz` haqiqatan ishlayotganini
  ko'rsatdi (bir xil matnning px boshiga kengligi 14px da 11.74, 24px da 11.58,
  48px da 11.20, 96px da 10.45 — 11% farq), ya'ni o'qni tashlash ko'rinishni
  o'zgartirardi. Qiymat esa Bricolage HAQIQATAN qaysi o'lchamlarda chizilishini
  sanab tanlandi: mobil'da 14–24px (belgi og'irligi bo'yicha o'rtacha 16.3px),
  desktopda 15–38px (o'rtacha 21.9px) — ikkala uchning o'rtasi sifatida **24**.
  Qoida: o'zgaruvchan shriftda o'qni qotirish uning qiymatini KO'ZDAN
  KECHIRMASDAN qilinmasin

- [2026-08-06] Qaror: **bayt tejovi "tezlik yaxshilandi" deb YOZILMAYDI —
  o'lchanmagan da'vo hujjatga kirmaydi.** 35 KB tejaldi, lekin 2026-08-05
  yakuniy o'lchovi landing tarmoq kengligiga bog'liq bo'lishdan chiqqanini
  ko'rsatgan edi (sekin va tez 3G ustma-ust tushdi), ya'ni bayt qirqishning
  sekundomerdagi ta'siri kutilmaydi. Shuning uchun band `[x]` qilindi, lekin
  tezlik haqida hech narsa da'vo qilinmadi. Bu loyihaning "jimgina yolg'on"
  oilasidan: to'g'ri raqam noto'g'ri xulosaga bog'lansa, hujjat ishonchini
  yo'qotadi

- [2026-08-05] Qaror: **rasm sifati foizga emas, KO'ZGA qarab tanlanadi — mato
  suratida bu sozlama biznes qarori.** q=80 mayda naqshli matolarda deyarli foyda
  bermadi (`7a30c608` −3%), q=72 esa −21% gacha berdi; ikkalasi asl JPEG bilan
  yonma-yon ko'rildi va tola/naqsh qirralarida farq sezilmadi, shundan keyingina
  q=72 tanlandi. Sabab: LolaMarket xaridori matoni QO'LDA ushlab ko'rmaydi, u faqat
  rasmga qarab baholaydi — ya'ni "bir necha KB tejash" bu yerda sifatdan ustun
  QO'YILMAYDI. Qoida: yangi rasm to'plami qo'shilganda sifat kamida ikki qiymatda
  sinalsin va ko'z bilan solishtirilsin

- [2026-08-05] Qaror: **rasm formati o'zgarganda rasm CHIZILADIGAN HAR BIR YO'L
  qamraladi — bittasi qolsa optimizatsiya o'z ichidan yeyiladi.** `script.js` dagi
  `product()` `getAttribute('src')` bilan har doim JPEG zaxirasini olardi, ya'ni
  kartochka WebP ko'rsatsa ham mahsulot ochilganda / savatga solinganda AYNAN
  o'sha rasm ikkinchi formatda qaytadan yuklanardi. `<picture>` bilan ishlaganda
  JS tomonda `currentSrc` olinadi (`src` faqat zaxira, chunki `lazy` rasmda
  `currentSrc` boshida bo'sh). Bu `a6962d1` dagi "bir xil rasm ikki joyda" qarorining
  kengaytmasi: u yerda ikkinchi yo'l HTML'da edi, bu yerda JS'da

- [2026-08-05] Qaror: **service worker keshi versiyasi rasm/statik fayl formati
  o'zgarganda MAJBURIY oshiriladi (`sw.js` → `CACHE_VERSION`).** `cacheFirst`
  strategiyasida eski `.jpg` yozuvlari keshda qolib, qaytgan foydalanuvchida
  butun optimizatsiyani bekor qilardi — sinovda aynan shu ko'rindi (11 ta ortiqcha
  JPEG). Muhimi shundaki, bu ko'rsatma `sw.js` faylining O'ZIDA yozib qo'yilgan
  edi, lekin `v1` hamon turgan — ya'ni **faylga yozilgan ko'rsatma, xuddi CLAUDE.md
  qoidasi kabi, tekshirilmasa bajarilmaydi.** Bu bugungi Test 10c darsining takrori.
  Hozircha qorovul QO'YILMADI (ochiq qarz): deploy'da versiya oshganini tekshiradigan
  test yo'q, ya'ni bu qaror hozir niyat darajasida

  ✅ **[2026-08-07] QARZ YOPILDI — Test 17.** Qorovul qo'yildi: `PRECACHE`
  ro'yxati va undagi fayllar tarkibining `sha256` i `CACHE_VERSION` bilan
  bog'landi, ya'ni fayl o'zgarib versiya qolsa test QIZIL bo'ladi. Qaror
  endi niyat emas — tekshiriladigan shart. Tafsilot: yuqoridagi 2026-08-07
  yozuvi

- [2026-08-05] Qaror: **tezlik bandi production o'lchovi bilan YOPILDI, lekin
  o'lchovning chegarasi hujjatda ochiq yozildi.** Sekin 3G'da olti o'lchov
  (2.0–2.6 s) mezondan o'tdi, shuning uchun band `[x]`. Chegara: ketma-ket `curl`
  brauzerning parallel yuklashini va JS bajarilishini qamramaydi — raqamga
  ishonish sababi shuki, bazaviy 10.14 s ham AYNI usulda olingan, ya'ni
  o'zgarishning KATTALIGI to'g'ri o'lchangan. Bitta o'lchov emas, oltitasi
  olindi — aks holda "omadli urinish" bilan band yopilgan bo'lardi. Bu 5-avgust
  ertalabidagi "qulay o'lchovni tanlab band yopilmaydi" qarorining teskari
  tomoni: o'sha kuni qulay raqam RAD ETILGAN edi, bugun esa noqulay usul
  ATAYLAB saqlanib qolindi

- [2026-08-05] Qaror: **rasm AVIF emas, WebP ga o'tkaziladi va eski JPEG
  O'CHIRILMAYDI — `<picture>` ichida zaxira bo'lib qoladi.** AVIF kichikroq bo'lardi,
  lekin ikkinchi format ikkinchi fayl to'plami degani va foyda WebP ustiga oz
  qo'shadi, holbuki eng katta yutuq formatdan emas, `srcset` dan keldi: banner
  konteyneri 1180px, telefonda ~400 CSS px, ya'ni asosiy isrof 1400px rasmni
  telefonga yuborish edi. Shu sabab mobil uchun alohida 800px nusxa qo'shildi
  (342 KB → 88 KB). JPEG zaxira eski Safari uchun qoldirildi — u yerda WebP `<source>`
  e'tiborsiz qolib, `<img>` ishlaydi

- [2026-08-05] Qaror: **rasmni `<picture>` ga o'rasangiz, uning konteynerini
  `style.css` dagi `picture { display:block; height:100% }` ro'yxatiga QO'SHISH shart.**
  Sabab: `<picture>` rasm bilan quti orasiga kiradi va `inline` / `height:auto` bo'ladi,
  ya'ni rasmdagi `height: 100%` tayanchini yo'qotadi va blok balandligi nolga tushadi.
  Bu turdagi buzilish xato bermaydi va rasm ham yo'qolmaydi — ekranda shunchaki bo'sh
  joy qoladi, ya'ni JIMGINA chiqadi. Qoida izoh sifatida `style.css` ning o'ziga,
  o'sha qoidaning ustiga yozildi

- [2026-08-05] Qaror: **bir xil rasm ikki joyda ishlatilsa, ikkalasi ham birga
  `<picture>` ga o'tkaziladi — bittasi qolsa optimizatsiya TESKARI ishlaydi.**
  `d7928cec…` rasmi banner slaydi va `tx-4402` kartochkasida bir xil; faqat bannerni
  o'ragan bo'lsak, brauzer aynan bir rasmni ikki formatda ikki marta yuklab olardi
  (243 KB, avvalgi 147 KB o'rniga) va o'zgarish o'sha rasm uchun holatni
  yomonlashtirardi

- [2026-08-05] Qaror: **tezlik mezoni endi "tez 3G" emas, SEKIN 3G bo'yicha
  baholanadi, va o'lchov tarmoq darajasida (`curl --limit-rate`) olinadi.** Sabab:
  tez 3G'da landing 2.66 s bilan mezondan o'tadi, sekin 3G'da esa 10.1 s — ya'ni
  qulay o'lchovni tanlab band `[x]` qilinsa, hujjat rost gapirib turib yolg'on
  xulosa berardi. LolaMarket foydalanuvchisi Marg'ilon/Namangandagi ustaxonada
  telefondan kiradi, ofis Wi-Fi'sidan emas. Brauzer paneli FCP'si esa o'lchov
  MANBAI sifatida rad etildi — tab `hidden` bo'lganda u yolg'on ko'rsatadi
  (xotiradagi "tezlik o'lchash usuli" darsi)

- [2026-08-03] Qaror: **himoya faqat FUNKSIYAda emas, QAMROVda ham bo'lsin — inventar test
  bilan qotiriladi.** Test 12b manba kodini skanerlab, har bir `UPDATE orders SET status`
  yozuvi tarix chaqiruvi bilan birga ekanini tekshiradi va aniq ro'yxat bilan solishtiradi;
  yangi yozuv nuqtasi qo'shilsa test qizil bo'ladi. Sabab: unutilgan yozuv nuqtasi hech
  narsani BUZMAYDI — hamma test yashil qolaveradi va tarixda jimgina teshik paydo bo'ladi,
  keyin esa unga qarab qaror qabul qilinadi. Bu 8-avgustdagi "ulanish ham sinaladi"
  qarorining keyingi qadami: endi ulanish EMAS, ulanishlarning TO'LIQLIGI qamalyapti
- [2026-08-03] Qaror: **buyurtma holati o'zgarishi va uning tarixi BITTA tranzaksiyada.**
  `recordStatusChange()` `pool` qabul qilmaydi (imzoning o'zi noto'g'ri ishlatishni
  qiyinlashtiradi) va xatoni yutmaydi — tarix yozilmasa butun o'tish ROLLBACK bo'ladi.
  Ya'ni "holat o'zgardi, tarix yo'q" holati umuman yuzaga kelmaydi. Narxi ochiq tan olinadi:
  tarix jadvali buzilsa buyurtma oqimi ham to'xtaydi. Sabab — jimgina teshikli tarix eng
  yomon variant: u "ba'zan to'g'ri" bo'ladi va yolg'onligi bilinmaydi
- [2026-08-03] Qaror: **backfill tarix o'rniga o'tkazilmaydi.** Eski 13 buyurtmaning oraliq
  qadamlari hech qayerda saqlanmagan va ularni tiklab bo'lmaydi, shuning uchun har biriga
  bitta qator yoziladi — `from_status=NULL`, `actor_kind='system'` va ochiq izoh bilan, ya'ni
  bu yozuv haqiqiy o'tish EMASLIGI ko'rinib turadi. Taxmin qilingan oraliq holatlarni yozish
  "o'ylab topilgan raqam ko'rsatilmasin" qoidasining aynan buzilishi bo'lardi, faqat panelda
  emas, BAHS hal qilinadigan joyda
- [2026-08-03] Qaror: **bir xil ro'yxat ikki jadvalda takrorlanmaydi** — `to_status` da CHECK
  ATAYLAB qo'yilmadi, chunki qiymat `orders` ning o'zidan keladi va u yerda allaqachon
  tekshirilgan. Aynan shu naqsh o'sha kuni `review_hide` da tishlagan edi. CHECK faqat
  qiymat SHU jadvalda tug'ilganda qo'yiladi (`actor_kind`)
- [2026-08-03] Qaror: **funksiyaning O'ZI sinalgani yetarli emas — ULANISH ham sinaladi.**
  `recalcRating()` alohida sinalgan va o'tgan edi, lekin uni `hideReview()` chaqirishini
  hech narsa tekshirmasdi; chaqiruv yo'qolsa butun to'plam yashil qolardi va reyting
  jimgina yolg'onga aylanardi. Bundan keyin "A funksiyasi B ni chaqiradi" degan invariant
  ham, va kerak bo'lsa CHAQIRUV TARTIBI ham (bugun: qayta hisoblash `COMMIT` dan oldin,
  ya'ni bitta tranzaksiyada) test bilan qamaladi. Sabab: birlik testlari qismlarni
  tekshiradi, nuqson esa ko'pincha qismlar ORASIDA yashaydi — bu Sprint 8 ning takrorlanib
  turgan darsi (deploy, `Content-Type`, endi test)
- [2026-08-02] Qaror: **foydalanuvchi matni qabul qiladigan oqim HUJUM YUKI bilan ham
  sinaladi, faqat oddiy matn bilan emas.** Buyurtma va bahs oqimlari bir necha marta
  uchidan-uchiga sinalgan va "ishlaydi" deb yozilgan edi, lekin izoh/manzil/sabab
  maydonlariga har doim oddiy matn kiritilgandi — shuning uchun saqlanuvchi XSS
  hamma sinovlardan o'tib ketdi. Bundan keyin matn maydoni bor oqim sinovida kamida
  bitta `<img src=x onerror=...>` shaklidagi yuk bo'ladi, va natija "sahifa ochildi"
  emas, **yaratilgan TEG soni** bilan o'lchanadi (0 bo'lishi kerak)
- [2026-08-01] Qaror: **sinov chiqindisi tozalangani MUSTAQIL manbadan tasdiqlanadi.** 2026-07-30
  dagi "sinov o'z chiqindisini o'zi tozalaydi" qarorining davomi: tozalash amali bajarilgani
  yetarli emas, natija ochiq API'dan qayta o'qib solishtiriladi (bugun: Tola 12, Junli mato 49
  boshlang'ich holatiga qaytgani ko'rildi). Sabab: bu "CI yashil edi, fayllar esa serverga
  chiqmagandi" darsining aynan o'zi — amal muvaffaqiyatli tugagani natija to'g'ri ekanini
  ANGLATMAYDI; yarim tozalangan sinov esa zaxira sonini jimgina noto'g'ri qoldiradi
- [2026-07-30] Qaror: **production bazasida o'tkazilgan sinov o'z chiqindisini o'zi tozalaydi.** Sinov
  buyurtmalari (`#LM-3012`, `#LM-3013`) sinovdan keyin o'chirildi va zaxira baseline'ga qaytarildi.
  Sabab: bazada haqiqiy buyurtmalar bilan aralashgan sinov qatorlari komissiya hisobotini va zaxira
  sonini soxtalashtiradi — keyinchalik qaysi qator haqiqiy ekanini ajratib bo'lmay qoladi
- [2026-07-30] Qaror: **"deploy qilindi" degan gap jonli tekshiruvsiz yozilmaydi.** 2026-07-28 va
  2026-07-30 da PWA "deploy qilindi" deb yozilgan edi, aslida fayllar serverga umuman chiqmagan.
  Sabab: CI muvaffaqiyatli tugashi fayl yetib borganini ANGLATMAYDI — `source` ro'yxati aynan sanab
  o'tadi, unga tushmagan fayl jimgina tushib qoladi. Endi tekshiruv CI ning o'zida avtomatik
  (`sprint-1.md`dagi qarorga qarang)
- [2026-07-31] Qaror: **frontendda `window.addEventListener('load', ...)` ishlatilmaydi** (CLAUDE.md ga
  yozildi). `load` barcha rasm va shrift yuklangandan keyin otiladi, ustiga skript o'sha hodisadan
  KEYIN ishga tushsa listener umuman otilmaydi. Sabab: bu tuzoq ikki marta zarar keltirdi — `pwa.js`
  service worker'ni ro'yxatdan o'tkazmadi (`5ffe1f0`), `script.js` esa butun ekranni yopib turgan
  loader'ni ochmay turdi. Ikkalasi ham JIMGINA sindi, konsolda xato yo'q edi — aynan shuning uchun
  uzoq sezilmadi. O'rniga: `DOMContentLoaded`, yoki skript `defer` bo'lsa to'g'ridan-to'g'ri chaqirish;
  haqiqatan `load` kerak bo'lsa avval `document.readyState` tekshiriladi
- [2026-07-31] Qaror: **tashqi skript `<head>`da `defer`siz turmaydi, va sahifadagi skriptlar `defer`
  bo'lsa HAMMASI birdan bo'ladi** (CLAUDE.md ga yozildi). Sabab: `telegram-web-app.js` 114 KB ni
  uchinchi domendan kutib HTML tahlilini ~613 ms to'xtatib turardi. Ikkinchi yarmi ham majburiy —
  bitta skript `defer`siz qolsa u parse paytida, ya'ni `defer`liklardan OLDIN ishlaydi va yuklanish
  TARTIBI buziladi (`script.js` / `app.js` `window.Telegram`ni topa olmay qoladi)
- [2026-07-31] Qaror: **tashqi xizmat bergan `Content-Type` shundoq uzatilmaydi — tur o'zimizda
  aniqlanadi.** `/api/product-photo` Telegram CDN'i bergan sarlavhani uzatardi, u esa
  `application/octet-stream` bo'lib kelardi. Sabab ikkita: (1) brauzer `<img>` ichida turni o'zi
  sezgani uchun nuqson KO'RINMAYDI, faqat Cloudflare rasm optimizatsiyasi jimgina o'chib qoladi;
  (2) oddiy `qiymat || fallback` naqshi bu yerda yaramaydi — `application/octet-stream` "truthy",
  ya'ni u fallback'ni bosib o'tadi, shuning uchun umumiy tur ATAYLAB yaroqsiz deb hisoblanadi
  (`usableMime()`). Bundan keyin proksi qilingan har qanday faylda tur manbadan emas, fayl
  kengaytmasidan olinadi
- [2026-07-31] Qaror: **"haqiqiy Telegram bilan sinalmagan" kod sinalgan hisoblanmaydi.** Sotuvchining
  botga rasm yuborish oqimi 2026-07-30 da soxta ma'lumot bilan sinalgan va ishlaydi deb yozilgan edi;
  haqiqiy Telegram bilan o'tkazilganda esa `Content-Type` nuqsoni chiqdi. Sabab: soxta ma'lumot
  o'zimiz kutgan shaklda keladi, tashqi xizmat esa kutmagan shaklda — nuqsonlar aynan shu farqda
  yashiringan bo'ladi. Bu "CI yashil edi, fayllar esa serverga chiqmagandi" darsining aynan o'zi
