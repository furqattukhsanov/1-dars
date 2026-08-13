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
    { num: 4, nom: "Asosiy funksiya",           dars: "Dars 11", holat: "jarayonda",  sana: "2026-08-13" },
    { num: 5, nom: "Mobil / PWA",               dars: "Dars 12", holat: "jarayonda",  sana: "2026-08-13" },
    { num: 6, nom: "Integratsiyalar",           dars: "Dars 13", holat: "jarayonda",  sana: "2026-07-22" },
    { num: 7, nom: "Admin panel",               dars: "Dars 14", holat: "tugadi",  sana: "2026-08-13" },
    { num: 8, nom: "Sifat tekshiruvi",          dars: "Dars 15", holat: "jarayonda", sana: "2026-08-07" },
    { num: 9, nom: "Production + launch",       dars: "Dars 16", holat: "jarayonda", sana: "2026-08-06" },
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
  updatedEl.textContent = "Yangilanish: 2026-08-13 (MAHSULOT EKRANI QAYTA TARTIBLANDI — RASM 2.1 BAROBAR KATTALASHDI VA ENDI BOSILSA TOLIQ EKRANDA OCHILADI. Founder: rasm kichikroq hamda orqada koringandek tuyuladi. QAROR DIDDAN EMAS, OLCHOVDAN TUGILDI — 375x812 da: hero 248px, korinadigani 226px = ekranning 27.8%, katalog kartochkasidagi AYNI rasm esa 164x230px, yani MAHSULOTGA KIRGAN SARI RASM KICHRAYARDI (230 → 226). Ikkinchi sabab: mato TIK suratga olinadi (3:4), hero esa YOTIQ 3:2 edi va naqshning yupqa tasmasini qirqardi. Uchinchisi orqada hissini tushuntiradi: surat tepadan shisha header, pastdan shisha kartochka bilan siqilgan va kartochka ORQASIDAN korinib turardi. TAVSIYALAR QUIZ ORQALI BERILDI — tort savol ASCII maketlar bilan taklif qilindi va founder torttasida ham Tavsiya variantini tanladi: 4:5 toliq kenglikdagi hero (469px, ekranning 57.7%, shaffof header OSTIDAN otadi); rasm ustida faqat ikki gradient, kartochka esa QATTIQ OQ SIRT boldi; NOM RASM USTIDA — ilgari u bitta ekranda IKKI MARTA yozilardi (header + kartochka), endi kartochka togridan-togri narxdan boshlanadi va header dagi nom skroll rasmdan pastga tushganda qaytadi; rasmga bosilsa TOLIQ EKRAN + zoom (pinch, ikki marta bosish 1↔2.5, chegara 4x, surish rasm chetida toxtaydi). ZOOM BRAUZERNING OZINIKI EMAS VA BOLA OLMASDI: Mini App da touch-action manipulation va overflow hidden sahifa masshtabini butunlay ochiradi (ekran sahifa emas, ilova), yani brauzer ozi kattalashtiradi degan taxmin JIMGINA ISHLAMAYDIGAN TUGMA bolardi. TUZOQLAR: .pd-hero ga flex none — bu AYNI SHU KUNDA yozilgan flex ustunda siqiladigan blok qoidasi (uch marta tishlagan), aspect-ratio bola siqilishidan KAFOLAT BERMAYDI. Rasm slaydi endi BITTA joyda chiziladi (detailMedia) — ilgari videosiz mahsulotda rasm hero divining style ida edi, yani bosilsa kattalashsin amalini IKKI joyga yozish kerak bolardi va bittasi ertami-kech esdan chiqardi. Naqsh bilan chizilgan mahsulotda zoom amali UMUMAN qoyilmaydi — bosilganda hech narsa qilmaydigan tugma bolmasin. Qongiroq tugmasi mahsulot ekranida YASHIRILADI — rasm header ostidan otgani uchun u sevimli tugmasi bilan AYNI nuqtada ustma-ust tushardi. OLCHANDI, KOZ BILAN QARALMADI: hero 469px / 57.7%; nom bloki hero chegarasidan CHIQMAYDI (0px); 3 qatorli uzun nomda ham nuqtalar bilan toqnashmaydi; rasmsiz mahsulotda zoom OCHILMAYDI; videoli galereyada 2 slayd va video slaydi zoom ochmaydi; pinch 100→200px = ANIQ 2x, chegara 4x, surish chetda aniq (187.5 / 344) toxtadi; header qorovuli 393px chegarada ikki tomonga ham togri ishladi. 60 TEST YASHIL — VA RAQAM MUSTAQIL QAYTA OLCHANDI: ish hisobotida 48 test deb yozilgan edi va XATO chiqdi, chunki worktree da server/node_modules yoq edi va pg topilmagani uchun yurish 6-chi qadamda YIQILARDI, yani yashil deb sanalgan raqam toliq bolmagan yurishdan olingan. Kesh: telegram-app/styles.css v25, telegram-app/app.js v81, panel.js v17, Test 16 jadvali birga. PRODUCTIONDA VA FOUNDER TELEFONDA TASDIQLADI (b651722, CI success): lolamarket.uz/mini-app/ da v25/v81 va ikkala fayl repodagi bilan hash boyicha bayt-baytga mos; founder Telegram ichida ochib kordi — hammasi joyida, yani skroll bilan header qaytishi, ikki barmoq bilan kattalashtirish va rasmning Telegram paneli bilan toqnashmasligi JONLI tekshirildi. Servis restarti kerak emas — faqat frontend. Brauzerda bu uchtasini tekshirib bolmagan edi: panel yashirin bolgani uchun skroll hodisasi tabiiy otilmaydi va CSS otishlari kadr olmaydi. Sayt (script.js) ATAYLAB tegilmagan — u yerda mahsulot yon oynada ochiladi, bu ekranning juftligi yoq.)";




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
