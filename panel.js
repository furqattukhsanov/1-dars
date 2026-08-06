/* LolaMarket — sprint progress paneli.
   Ilgari bu kod `loyiha-panel.html` ichida inline `<script>` blokida
   turardi. CSP dan `'unsafe-inline'` olinganda (C3) u jimgina o'lardi:
   sprint kartochkalari umuman chizilmasdi, progress bar bo'sh qolardi.
   Faylni `hisobotchi` agenti yangilaydi — sprint holati va sana shu yerda. */

  const sprintlar = [
    { num: 0, nom: "Dizayn va ekranlar",        dars: "Dars 7",  holat: "tugadi",  sana: "2026-07-29" },
    { num: 1, nom: "Telegram Mini App MVP",     dars: "Dars 8",  holat: "tugadi",  sana: "2026-07-31" },
    { num: 2, nom: "Ma'lumotlar bazasi / Backend", dars: "Dars 9",  holat: "tugadi", sana: "2026-07-23" },
    { num: 3, nom: "Foydalanuvchilar + rollar", dars: "Dars 10", holat: "tugadi", sana: "2026-07-29" },
    { num: 4, nom: "Asosiy funksiya",           dars: "Dars 11", holat: "jarayonda",  sana: "2026-08-02" },
    { num: 5, nom: "Mobil / PWA",               dars: "Dars 12", holat: "jarayonda",  sana: "2026-07-30" },
    { num: 6, nom: "Integratsiyalar",           dars: "Dars 13", holat: "jarayonda",  sana: "2026-07-22" },
    { num: 7, nom: "Admin panel",               dars: "Dars 14", holat: "tugadi",  sana: "2026-08-02" },
    { num: 8, nom: "Sifat tekshiruvi",          dars: "Dars 15", holat: "jarayonda", sana: "2026-08-07" },
    { num: 9, nom: "Production + launch",       dars: "Dars 16", holat: "jarayonda", sana: "2026-08-06" },
    { num: 10, nom: "AI kiyim g'oyalari",       dars: "Dars 17", holat: "jarayonda", sana: "2026-08-06" },
  ];

  const badgeLabels = {
    kutilmoqda: "⏳ kutilmoqda",
    jarayonda:  "🔄 jarayonda",
    tugadi:     "✅ tugadi",
  };

  const container = document.getElementById("sprints");
  const barEl     = document.getElementById("bar");
  const percentEl = document.getElementById("percent");
  const countEl   = document.getElementById("count");
  const updatedEl = document.getElementById("updated");

  const tugaganlar = sprintlar.filter(s => s.holat === "tugadi").length;
  const foiz = Math.round((tugaganlar / sprintlar.length) * 100);

  barEl.style.width = foiz + "%";
  percentEl.textContent = foiz + "%";
  countEl.textContent = tugaganlar + " / " + sprintlar.length + " sprint";
  updatedEl.textContent = "Yangilanish: 2026-08-07 (SERVICE WORKER KESHI ENDI QOROVUL OSTIDA — Test 17 yozildi va 5-avgustda ATAYLAB ochiq qoldirilgan qarz YOPILDI. NIMA UCHUN TEST 16 YETARLI EMAS EDI: u HTML dagi ?v= versiyalarini qo'riqlaydi, service worker keshi esa BUTUNLAY boshqa mexanizm — PRECACHE ro'yxatidagi fayllar ATAYLAB ?v= siz yuradi, chunki sw.js keshdan ignoreSearch'siz qidiradi va versiyali so'rov keshdagi yozuvni TOPA OLMASDI. Ya'ni ular uchun yagona eskirish dastagi — CACHE_VERSION, va Test 16 unga umuman qaramaydi. Qorovulning ko'r nuqtasi qorovul yo'qligidan YOMONROQ: u qamrov TUYG'USINI beradi. XAVF KONKRET VA JIMGINA: offline.js tahrirlanib CACHE_VERSION o'sha joyda qolsa, activate eski keshni o'chirmaydi va qaytib kelgan foydalanuvchida ESKI offline.html/offline.js ABADIY qolib ketadi — aynan internet uzilgan paytda, ya'ni tuzatish O'ZI KERAK BO'LGAN HOLATDA ishlamaydi. Bu nazariy emas: 5-avgustda aynan shu tuzoq ko'ringan (kesh tozalanmagan holatda 11 ta ortiqcha JPEG tortilardi). TEST NIMA QILADI: ro'yxat QO'LDA yozilmaydi — PRECACHE ning O'ZI sw.js dan o'qiladi, ya'ni ro'yxatga yangi fayl qo'shilsa avtomatik qamraladi (Test 16 va Test 10c bilan bitta naqsh, qamrov jimgina eskirmaydi). Besh qorovul: (a) CACHE_VERSION jadvaldagi qiymatga mos; (b) PRECACHE ro'yxati + undagi HAR BIR faylning tarkibi sha256 bilan jadvalga solishtiriladi — ro'yxatning O'ZI ham hisobga olinadi, chunki fayl qo'shilishi yoki olib tashlanishi ham keshni eskirtiradi, holbuki fayllar TARKIBI o'zgarmagan bo'lishi mumkin; (c) PRECACHE yozuvida ?v= bo'lmasin — yuqoridagi istisno shu bilan QULFLANADI, aks holda kelajakda kimdir 'izchillik uchun' versiya qo'shib offline rejimni butunlay o'ldirardi; (d) ro'yxatdagi har bir fayl diskda mavjud; (e) CACHE_VERSION nomi yoki shakli o'zgarsa test O'ZI qichqiradi — qorovul JIMGINA ishlamay qolmasligi uchun. DALIL — TEST YASHIL BO'LGANI ISBOT EMAS, 6 TA MUTATSIYA BILAN SINALDI VA 6 TASI HAM USHLANDI: M1 offline.js o'zgardi versiya qoldi (hash mos kelmadi), M2 CACHE_VERSION v3 dan v4 ga o'tdi jadval yangilanmadi, M3 PRECACHE ga ?v=2 qo'shildi, M4 PRECACHE da mavjud bo'lmagan fayl, M5 CACHE_VERSION nomi o'zgartirildi, M6 PRECACHE dan fayl olib tashlandi (fayllar TARKIBI o'zgarmagan holda). node test.js — 34 test PASS (raqam SANALDI, oldingi yozuvdagi 33 ustiga +1). MUTATSIYADAN QAYTISH USULI HAM QAROR: fayllar git checkout bilan TIKLANMADI — ishchi katalogda commit qilinmagan tahrirlar turgandi (test.js, CLAUDE.md) va checkout ularni savolsiz o'chirib yuborardi; avval scratchpad ga nusxalandi, keyin undan qaytarildi. Bu 'almashtirishni qo'lga kiritmasdan eskisini o'chirma' qoidasining aynan o'sha oilasi: qaytarish yo'li amal boshlanishidan OLDIN mavjud bo'lsin. YO'L-YO'LAKAY UCHTA DA'VO JONLI SERVERDAN TEKSHIRILDI, IKKITASI ESKIRGAN CHIQDI: lolamarket-notify servisi active va oxirgi ishga tushish 2026-08-06 06:38:03, /opt/lolamarket-notify/lib/order-history.js joyida (3-avgust) — ya'ni Sprint 9 dagi 'restart HALI BAJARILMAGAN' va Sprint 8 dagi 'kod hali serverga ko'chirilmagan' yozuvlari eskirgan edi, ikkalasi ham yangilandi (yozuvlar O'CHIRILMADI — ular o'sha kunning haqiqiy holati, eskirgani USTIGA qo'shildi). CSP jonli sarlavhada tasdiqlandi: script-src 'self' https://telegram.org https://static.cloudflareinsights.com — unsafe-inline YO'Q, ya'ni C3 yopiq. HSTS esa hamon max-age=2592000 (30 kun) — founder bandi OCHIQ qoladi va bu ataylab yozildi. DARS: bu bandning butun mavjudlik sababi shu — 'har deploy'da bu raqamni oshiring' ko'rsatmasi sw.js faylining O'ZIDA yozilgan edi va shunga qaramay raqam v1 da qotib qolgandi. YOZILGAN QOIDA HIMOYA EMAS — UNI TEKSHIRADIGAN TEST HIMOYA, va hech kim buzib ko'rmagan qorovul qorovul emas, TAXMIN.) | Oldingi: 2026-08-06 (SPRINT 8 NING OXIRGI OCHIQ TEZLIK BANDI YOPILDI — telegram.org ga preconnect qo'shildi. O'zgarish jismonan ikkita qator: index.html va telegram-app/index.html ga bittadan link rel=preconnect href=https://telegram.org. admin/ ga ATAYLAB qo'shilmadi — u telegram.org ni umuman ishlatmaydi, ya'ni u yerda preconnect faqat behuda ulanish ochardi. ASOS O'LCHANGAN, TAXMIN EMAS: sovuq ulanish curl bilan 5 marta o'lchandi — DNS ~4 ms, TCP ~100 ms, TLS ~100 ms, ya'ni ULANISHNING O'ZI ~200 ms turadi va bu SOF KECHIKISH, bayt emas. Aynan shu sabab bandning mantiqi bor: 5-avgust o'lchoviga ko'ra landing ham, Mini App ham tarmoq kengligiga bog'liq EMAS — ikkalasining ham vaqtini ulanish kechikishi belgilaydi, ya'ni shrift bandidan farqli o'laroq bu band TO'G'RI o'lchamga tegadi. QARORNING ENG NOZIK JOYI — crossorigin QO'YILMADI: pastdagi skriptda (script defer src=https://telegram.org/js/...) crossorigin atributi yo'q, ya'ni u CORS'siz olinadi. Preconnect'ga crossorigin qo'yilsa brauzer BOSHQA ulanish ochadi, skript esa undan foydalanmaydi va preconnect BUTUNLAY BEHUDA ketadi — bu preconnect'ning eng ko'p uchraydigan xatosi. Shrift preconnect'ida esa crossorigin BOR va u TO'G'RI, chunki shrift CORS bilan olinadi. Ikki qator bir xil ko'rinadi, lekin QARAMA-QARSHI — shuning uchun sabab kod izohiga yozib qo'yildi, kelajakda \"izchillik uchun\" tenglashtirilmasin. TASDIQLANGANI: ikkala sahifada preconnect chizildi, skriptning crossorigin i yo'qligi va preconnect'niki bilan MOS kelishi tekshirildi (mos_keladimi: true), window.Telegram.WebApp mavjud, Mini App'da 27 ta [data-action] joyida; npm test — 33 test PASS. HALOL CHEGARA, ATAYLAB YOZILDI: \"200 ms tejaldi\" DEB YOZILMAYDI — o'lchangani ulanish NARXI, tejovning O'ZI EMAS. Skript allaqachon head da turibdi va brauzerning preload skaneri uni baribir erta topadi, ya'ni haqiqiy yutuq 200 ms dan KICHIK bo'lishi mumkin; sovuq ulanishli oldin/keyin o'lchovini brauzerda ajratib bo'lmadi, chunki ulanish hovuzi issiq. Shuning uchun bu yerda faqat NARX yozilgan, YUTUQ emas. BIRGA KIRGAN IKKINCHI O'ZGARISH: CLAUDE.md ga yangi qoida — \"HUJJATDAGI RAQAM — TEKSHIRILMAGAN DA'VO\": optimizatsiya yoki tuzatish bandi ochilganda bazaviy raqamning O'ZI qayta o'lchansin, undan ish BOSHLANMASIN, chunki raqam bandning kattaligini va navbatdagi o'rnini belgilaydi — noto'g'ri bo'lsa ish noto'g'ri narsaga yo'naltiriladi. Qoida ichiga bir kunda topilgan UCH dalil yozildi: \"shriftlar 250 KB / 13 woff2\" → aslida 131 KB / 3 fayl; \"sayt-eski/ o'chirilmasin, demo/ va admin/ bog'liq\" → demo/ repoda umuman yo'q va admin/ ildizdagi CSS ni ishlatadi; \"32 test\" → 33. Amaliy talab: raqam IKKI MUSTAQIL usul bilan olinsa ishonchli. Ikkala o'zgarish mustaqil, bitta commitda — founder ataylab shunday qildi.)";



  sprintlar.forEach(s => {
    const card = document.createElement("div");
    card.className = "sprint-card " + s.holat;
    card.innerHTML = `
      <div class="sprint-num">${s.num}</div>
      <div class="sprint-info">
        <div class="sprint-name">${s.nom}</div>
        <div class="sprint-dars-label">${s.dars}</div>
      </div>
      <span class="sprint-badge badge-${s.holat}">${badgeLabels[s.holat]}</span>
    `;
    container.appendChild(card);
  });
