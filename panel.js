/* LolaMarket — sprint progress paneli.
   Ilgari bu kod `loyiha-panel.html` ichida inline `<script>` blokida
   turardi. CSP dan `'unsafe-inline'` olinganda (C3) u jimgina o'lardi:
   sprint kartochkalari umuman chizilmasdi, progress bar bo'sh qolardi.
   Faylni `hisobotchi` agenti yangilaydi — sprint holati va sana shu yerda. */

  const sprintlar = [
    { num: 0, nom: "Dizayn va ekranlar",        dars: "Dars 7",  holat: "tugadi",  sana: "2026-07-29" },
    { num: 1, nom: "Telegram Mini App MVP",     dars: "Dars 8",  holat: "tugadi",  sana: "2026-07-31" },
    { num: 2, nom: "Ma'lumotlar bazasi / Backend", dars: "Dars 9",  holat: "tugadi", sana: "2026-07-23" },
    { num: 3, nom: "Foydalanuvchilar + rollar", dars: "Dars 10", holat: "tugadi", sana: "2026-08-16" },
    { num: 4, nom: "Asosiy funksiya",           dars: "Dars 11", holat: "jarayonda",  sana: "2026-08-19" },
    { num: 5, nom: "Mobil / PWA",               dars: "Dars 12", holat: "jarayonda",  sana: "2026-08-13" },
    { num: 6, nom: "Integratsiyalar",           dars: "Dars 13", holat: "jarayonda",  sana: "2026-07-22" },
    { num: 7, nom: "Admin panel",               dars: "Dars 14", holat: "tugadi",  sana: "2026-08-18" },
    { num: 8, nom: "Sifat tekshiruvi",          dars: "Dars 15", holat: "jarayonda", sana: "2026-08-19" },
    { num: 9, nom: "Production + launch",       dars: "Dars 16", holat: "jarayonda", sana: "2026-08-14" },
    { num: 10, nom: "AI kiyim rasmi",           dars: "Dars 17", holat: "tugadi", sana: "2026-08-16" },
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
  updatedEl.textContent = "Yangilanish: 2026-08-19, birinchi commit (UCHTA QOROVUL QARZI YOPILDI VA «ENG YANGI» HAQIQIY SANAGA O'TDI — 82 → 86 test. Ish IKKI BANDDAN iborat va ikkalasi ham QOLDIQ ro'yxatidagi ochiq qarzlar edi, yangi funksiya emas. 1) QOROVUL QARZLARI: 2026-08-16 (footer) va 2026-08-17 (saralash varag'i) ishlarida test soni O'ZGARMAGAN edi va ikkala hisobotda bu KAMCHILIK deb yozilgandi — endi yopildi. TEST 44 — data-action nishoni TIRIK bo'lsin (244 nishon, 2 yuz): tugma window[nom] orqali chaqiriladi va nom noto'g'ri bo'lsa dispatcher JIM qaytadi (aynan shu 2026-08-14 da «Hisobdan chiqish» bilan bo'lgan — tugma tug'ilganidan beri o'lik edi). Ro'yxat QO'LDA yozilmaydi, ikkala yuzning HTML+JS manbasidan yig'iladi; uch qatlam — statik atributlar, obyekt maydoni action: 'nom', va DINAMIK data-action=\"${X}\". ⚠️ Dinamik qatlam NOM O'XSHASHLIGIGA emas, TUZILMAGA qaraydi: o'ram funksiyaning nechanchi PARAMETRI nishon yozayotgani aniqlanib, chaqiruvda AYNAN o'sha pozitsiyadagi argument olinadi — birinchi variant nomga qarardi va SHOVQINLI edi (serverga yuboriladigan action: 'request_image' va segTabs tab kaliti 'new' ni ham nishon deb o'qigan); shovqinli qorovul uzoq yashamaydi, u yolg'on qizil beradi va bir kun o'chiriladi. reloadHome istisnosi oq ro'yxatda EMAS, DISPATCHER KODIDA tekshiriladi. TEST 45 — saralash varag'i va yashirish (6 hidden element): SORT_KEYS ↔ varaq qiymatlari ikkala yuzda; saytda hidden atributi bilan turgan HAR BIR element uchun CSS da [hidden] { display: none } qatori TALAB qilinadi; Mini App'da .hidden qoidasi. TEST 46 — deep-link belgisi SERVERDAN o'tsin: qoida testga NUSXALANMAYDI, serverning O'Z manbaBelgisi() funksiyasi CHAQIRILADI (aks holda server o'zgarganda qorovul eski qoidani qo'riqlab yashil qolardi); bu 2026-08-16 dagi sayt_ prefiksi qarzini yopadi. 🔴 TOPILGAN HAQIQIY NUQSON — KO'RINISH TO'G'RI, KOD YOLG'ON: .search-x (qidiruv × tugmasi) da index.html'da hidden atributi va script.js'da x.hidden = !v turardi, lekin .search-x { display: flex } (style.css:1348) IKKALASINI ham bekor qilardi — × HECH QACHON yashirilmagan. Founder 2026-08-17 da «x turaversin» degani uchun EKRANDAGI natija to'g'ri edi, KOD esa boshqa narsani da'vo qilardi. ⚠️ TUZATISH YO'NALISHI MUHIM: ko'rinishga TEGILMADI, kod QARORGA moslashtirildi (hidden va x.hidden olib tashlandi, sabab izohda) — teskarisi, ya'ni kodni «tuzatib» [hidden] qatorini qo'shish, founder qarorini JIMGINA bekor qilardi. 2) LATENT NUQSON QOROVULNING O'ZIDA: test.js da izoh tozalash YETTI joyda qo'lda takrorlangan va OLTITASIDA blok izoh BIRINCHI olinardi — bu Test 39 ni bir marta ko'r qilgan naqshning aynan o'zi (qator izohidagi /* blok boshi deb o'qilib, undan keyingi butun kod yutilardi). Hammasi bitta o'tishli holat mashinasiga (jsSofi) o'tkazildi, 10 chaqiruv. ⚠️ YO'L-YO'LAKAY jsSofi ning O'ZIDA nuqson topildi: REGEX LITERAL hisobga olinmagan edi — /\\/\\//g kabi ifodaning oxiridagi ikki qiya chiziq QATOR IZOHI deb o'qilib, telegram-app/app.js YARIM o'qilardi va Test 25 bekorga qizarardi; endi regexmi yoki bo'lishmi — oldingi ma'noli belgi hal qiladi. Ta'sirlangan 6 test qayta sinaldi: nuqson KODDA bo'lsa qizil, faqat IZOHDA bo'lsa yashil — 6/6 to'g'ri. Dars: TAKRORLANGAN QOROVUL KODI QOROVULNING ENG ZAIF JOYI — u yashil bo'lib turadi va qamrov TUYG'USINI beradi. 3) «ENG YANGI» HAQIQIY SANAGA O'TDI: ilgari u «Yangi» YORLIG'I bo'yicha edi va yorliq QO'LDA qo'yiladi, sanaga umuman bog'liq emas — ya'ni tugma O'Z NOMINI BAJARMASDI. products.created_at bazada ALLAQACHON bor edi (db/001, 64-qator) — ya'ni YANGI MIGRATSIYA KERAK EMAS, faqat /api/products uni qaytarmasdi. Uch joy o'zgardi: SELECT ga p.created_at, VM ga createdAt, ikkala yuzda new tarmog'i. ⚠️ ZAXIRA ATAYLAB QOLDIRILDI: statik fayllar CI bilan AVTOMATIK chiqadi, backend esa QO'LDA ko'tariladi — oraliqda yangi sayt ESKI serverdan javob oladi va createdAt kelmaydi; o'shanda saralash buzilmaydi, eski yorliq usuliga qaytadi. Qaror BUTUN RO'YXAT bo'yicha (some), juftlik bo'yicha EMAS — aks holda taqqoslash TRANZITIVLIGI buzilib sort aniqlanmagan tartib berardi. Yorliq O'ZI ham QOLADI, u boshqa ish qiladi (ko'zga tashlanadigan belgi). TEST 47 — MATN emas, XATTI-HARAKAT sinovi: sortProducts manbadan ajratib olinib HAQIQIY ro'yxatda yurgiziladi (sana bor / sana yo'q / aralash), chunki «sana bo'yicha saralayapman» degan kod ham, teskari tartibda saralaydigan kod ham AYNI satrlarni o'z ichiga oladi. SINALGANI: 86 TEST PASS, 0 XATO — hisobotchi MUSTAQIL o'lchadi: git stash bilan HEAD da 82, ishchi nusxada 86 (^✅ Test satrlari sanaldi), ya'ni +4 yangi raqam. ⚠️ Ish jarayonidagi 16 mutatsiya hisobotchi tomonidan QAYTA o'lchanmadi; hisobotchining O'Z 4 mutatsiyasi esa yurgizildi va 4 tasi ham USHLANDI: M1 data-action=\"clearSearch\" → clearSearchXX (Test 44 qizil), M2 sayt saralashi eski yorliq usuliga qaytarildi (Test 47 qizil), M3 SELECT dan p.created_at olib tashlandi (qizil), M4 sanasiz kartochka OXIRIGA emas BOSHIGA — return 1 → return -1 (qizil). M4 muhim: u NOZIK tartib nuqsoni va uni faqat xatti-harakat sinovi tutadi. ⚠️ HISOBOTCHINING O'ZI XATO QILDI VA U YOZIB QO'YILADI: mutatsiyani qaytarishda git checkout index.html ishlatilgan va u commit QILINMAGAN tahrirni (hidden olib tashlash + ?v=57) o'chirib yuborgan — bu 2026-08-07 dagi Test 17 yozuvida ALLAQACHON ogohlantirilgan xatoning aynan o'zi, ya'ni yozilgan ogohlantirish uni bajarilgan qilmadi. Tahrir qo'lda tiklandi, diff bayt-bayt solishtirildi, qolgan mutatsiyalar scratchpad zaxirasidan qaytarildi. Tartib: zaxira mutatsiyadan OLDIN, qaytarish esa git bilan EMAS, NUSXADAN. Kesh: script.js 55 → 57, telegram-app/app.js 100 → 101, panel.js 47 → 48 (Test 16 jadvali birga). 🔴 DEPLOY: STATIK + BACKEND — server/routes/catalog.js o'zgardi, ya'ni rsync (--no-owner --no-group SHART) + servis restart TALAB QILINADI; MIGRATSIYA KERAK EMAS (created_at db/001 dan beri bor). Backend ko'tarilmasa «Eng yangi» ZAXIRA rejimda, ya'ni eski yorliq usulida ishlab turaveradi va buni HECH NARSA KO'RSATMAYDI — nuqson jimgina bo'ladi. 🔴 Jonli saytda hali ko'rilmagan, founder tasdiqlamagan. Hujjat: docs/sprintlar/sprint-8.md (Test 44–47) va docs/sprintlar/sprint-4.md)";


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
