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
    { num: 4, nom: "Asosiy funksiya",           dars: "Dars 11", holat: "jarayonda",  sana: "2026-08-16" },
    { num: 5, nom: "Mobil / PWA",               dars: "Dars 12", holat: "jarayonda",  sana: "2026-08-13" },
    { num: 6, nom: "Integratsiyalar",           dars: "Dars 13", holat: "jarayonda",  sana: "2026-07-22" },
    { num: 7, nom: "Admin panel",               dars: "Dars 14", holat: "tugadi",  sana: "2026-08-13" },
    { num: 8, nom: "Sifat tekshiruvi",          dars: "Dars 15", holat: "jarayonda", sana: "2026-08-07" },
    { num: 9, nom: "Production + launch",       dars: "Dars 16", holat: "jarayonda", sana: "2026-08-14" },
    { num: 10, nom: "AI kiyim rasmi",           dars: "Dars 17", holat: "tugadi", sana: "2026-08-13" },
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
  updatedEl.textContent = "Yangilanish: 2026-08-16 (SAYTDAGI BANNER MINI APP'NIKI BILAN TENGLASHTIRILDI — dizayn, RASM va MATN, faqat BALANDLIK saytniki. Founder: «Mini appdagi banner dizaynindek webdagini ham o'zgartir, faqat o'lchamlarini mini appdikidek qilma, balandligini 20% ga qisqartir», keyin «dizayni hamda matnlarini ham o'zgartirmabsanu, + 10% balandligini katta qilgin». BIRINCHI URINISH YETARLI EMAS EDI: faqat MEXANIKA ko'chirilib, rasm va matn saytnikida qolgan edi va founder rad etdi — «falonchidek qil» topshirig'ining QAMROVI boshida so'ralmagani uchun (2026-08-13 dagi «shunday qilgin» bandining teskari yuzi: u yerda ORTIQCHA, bu yerda YETMAGAN ish chiqdi). YAKUNIY HOLAT: slaydlar ustma-ust opacity bilan emas, YONMA-YON — .ad-banner ning o'zi gorizontal skroller (overflow-x + scroll-snap), surishni brauzer qiladi va qo'lda yozilgan touchstart/touchend kodi O'CHDI; cheksiz aylanish ikki chetdagi KLON bilan, klonlar HTML da emas mountAdBanner() da yasaladi (matn manbada bir marta yoziladi, JS ishlamasa banner o'qiladigan holda qoladi); nuqtalar, ichki tugma va kichik matn o'chdi — ikki qatorli sarlavha + oxirgi so'zdan keyin chip; rasm va matn Mini App AD_SLIDES bilan AYNAN bir xil ikkala tilda (atlas/paxta-adras/ikat, «Matolarni AI bilan jonlantiring» + SINAB KO'RISH, «24/7 buyurtma berishingiz mumkin», «Bepul yetkazib berish» + ILK 3 TA BUYURTMA); oq parda (.ad-shade) O'CHDI — rasmlarning chap 65% i brief bo'yicha CHIZILGANDA allaqachon ochiq, parda uni yana oqartirardi. BALANDLIK IKKI QADAMDA: 220→176 (−20%) →193.6px, 26vw→20.8→22.88vw, 400→320→352px, telefonda 250→200→220px — o'lchandi, eskisining 0.88 i. RASMLAR assets/ads/ GA NUSXALANDI VA NUSXA MAJBURIY: landing HTML'i telegram-app/... yo'liga ishora qila olmaydi (serverda u mini-app/, havola 404 bo'lardi) — xavf BTS_POINTS bilan bitta oila, ikki nusxa JIMGINA ajralib ketadi va buni na konsol na test ko'rsatardi, shuning uchun TEST 32 GA 5-BAND qo'shildi: ikki nusxaning sha256 i solishtiriladi, ro'yxat AD_SLIDES dan olinadi (yangi slayd avtomatik qamraladi), IKKI MUTATSIYA bilan sinaldi va ikkalasi ham ushlandi; assets/ deploy source ro'yxatida ALLAQACHON bor (tekshirildi). TELEFONDA RASM KESILISHI O'LCHANDI VA TUZATILDI: Mini App rasmi 32:9, sayt slaydi undan baland — 375px da cover rasm enining atigi ~44% ini ko'rsatadi va standart center da o'ngdagi mato burmasi (slaydning butun xarakteri) kesilib, banner tekis bej quti bo'lib ko'rinardi; birinchi urinishda aynan shunday chiqdi va buni SCREENSHOT ko'rsatdi — object-position: 62% ga surildi (oyna 34.8–78.7%), uchala slaydda ko'z bilan tekshirildi. 1-SLAYD AI NI OCHMAYDI, KATALOGGA OLIB BORADI va bu ATAYLAB: saytda AI ekrani YO'Q, AI bloki har mahsulotning o'z sahifasida (aiSection → detailHtml), ya'ni «AI ochiladi» deb ko'rsatish soxta tugma bo'lardi; Mini App'da esa u tab('ai') ga tushadi — farq uslubda emas, ortidagi mavjudlikda («Hisobdan chiqish» bandi bilan bitta mulohaza). Telegram slaydi o'chdi, LEKIN botga yo'l yo'qolmadi — pastdagi «CTA — Telegram bot» bo'limi joyida va tgOrder kaliti o'sha bo'lim uchun saqlab qolindi (banner matnlari almashtirilganda u bilan birga o'chib ketishiga oz qolgan edi). Slayd <button> QILINMADI: sarlavha <h2> va u <button> ichida yaramaydi, sarlavhani tashlash esa landing SEO matnini kamaytirardi — bosish yuzasi ustidagi shaffof .ad-hit; qator uzilishi \\n + white-space: pre-line bilan (<br> yaramaydi — applyLang() matnni textContent bilan yozadi); behavior: 'smooth' faqat brauzer bilganda beriladi (AD_SMOOTH) — mountPdMedia ning 2026-08-13 darsi, qo'llab-quvvatlanmagan muhitda so'rov JIMGINA yutiladi; klon ekran o'quvchisiga ko'rinmaydi va Tab bilan tanlanmaydi. RASM OG'IRLIGI RAQAMI HISOBOTCHI TOMONIDAN QAYTA O'LCHANDI VA ANIQLASHTIRILDI: sessiyada «186 KB → 56 KB» deyilgan, qayta o'lchovda bu faqat TELEFON yo'liniki bo'lib chiqdi (eski 1-slayd srcset da ikki nusxa bor edi) — desktopda eski yo'l 268 KB edi, ya'ni haqiqiy yutuq telefonda 3.3x, desktopda 4.8x; raqam noto'g'ri emasdi, YO'L NOMI YOZILMAGANI uchun chala edi («hujjatdagi raqam — tekshirilmagan da'vo»). Eski Photo/Main/banner-mato* fayllari endi ishlatilmaydi, lekin Photo/ ga TEGILMADI (founder mulki); Photo/textile/d7928cec… esa hamon kerak — tx-4402 kartochkasida. Kesh: style.css 54→56, script.js 45→47, panel.js 37→38, admin/index.html birga, Test 16 jadvali birga. SINALGANI: 74 TEST YASHIL (hisobotchi mustaqil qayta yurgizdi); brauzerda O'LCHANDI — slayd balandligi eskisining 0.88 i (1280px va 375px), <picture> balandligi slayd balandligiga TENG (blok yopilmagan), matn .ad-copy dan chiqmagan, sahifada gorizontal skroll yo'q, qo'shni slayd cheti telefonda 6px / desktopda 14px; cheksiz aylanish beshta pozitsiyada, bosish beshta slaydda ham (klonlarda ham), rus tilida sarlavha 2 qator va chip joyida. TEKSHIRILMAGANI: avtomatik almashish (5 s) va silliq surish JONLI KO'RILMAGAN — brauzer panelida tab hidden turadi, u yerda scroll hodisasi UMUMAN otilmaydi va behavior:'smooth' bajarilmaydi (o'lchandi: 353→353 px, 1500 ms), mantiq faqat qo'lda chaqirib sinaldi; jonli lolamarket.uz da hali ko'rilmagan. Hujjat: docs/sprintlar/sprint-4.md)";




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
