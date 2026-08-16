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
    { num: 4, nom: "Asosiy funksiya",           dars: "Dars 11", holat: "jarayonda",  sana: "2026-08-16" },
    { num: 5, nom: "Mobil / PWA",               dars: "Dars 12", holat: "jarayonda",  sana: "2026-08-13" },
    { num: 6, nom: "Integratsiyalar",           dars: "Dars 13", holat: "jarayonda",  sana: "2026-07-22" },
    { num: 7, nom: "Admin panel",               dars: "Dars 14", holat: "tugadi",  sana: "2026-08-13" },
    { num: 8, nom: "Sifat tekshiruvi",          dars: "Dars 15", holat: "jarayonda", sana: "2026-08-07" },
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
  updatedEl.textContent = "Yangilanish: 2026-08-16, sakkizinchi commit (QADALGAN QATOR CHIQQANDA HEADER YUQORIGA SURILADI — IKKITA QADALGAN QATOR BIRGA TURMAYDI. Ish FAQAT SAYTGA tegdi, Mini App'ga TEGILMADI. FOUNDER SHIKOYATI (skrinshot bilan): «mahsulot qadalganda tepadagi doim qadaladigani qadalmasin» — kechagi commitda qo'shilgan .pdp-bar header'ning OSTIDA turardi, ya'ni ekranning yuqorisini IKKITA qadalgan qator egallardi: 1280px da 64+61=125px, telefonda (375px) 162+61=223px; ekranning eng qimmat joyida mato emas, BOSHQARUV turardi. YECHIM — bittasi ikkinchisining O'RNINI bosadi: qator ko'ringanda tanaga pdp-bar-on belgisi qo'yiladi va CSS header'ni suradi (body.pdp-bar-on #nav { transform: translateY(-100%) }), qator esa top:0 ga o'tadi; yashiringanda header qaytadi, o'tish silliq (#nav ga transition:transform qo'shildi). ⚠️ position:static EMAS, transform — sabab harakat emas: (a) #nav ustida backdrop-filter bor va position almashtirilsa paint qatlami qayta yig'iladi (sakrash), (b) transform oqimdagi joyni ham, offsetHeight ni ham TEGMASDAN qoldiradi. 🔴 AYLANMA BOG'LIQLIK OCHILDI VA U ENG NOZIK QISM: pdpBarSync() ilgari chegarani getBoundingClientRect().bottom dan olardi, header esa endi qatorning holatiga qarab SURILADI — qator chiqadi → header suriladi → chegara siljiydi → qator yashirinadi → header qaytadi… ekran HAR KADRDA miltillardi. Endi balandlik offsetHeight dan olinadi: u oqimdagi o'lchov va transform dan TA'SIRLANMAYDI, ya'ni chegara qat'iy (CSS tomonda transform tanlanganining sababi ham shu). IKKITA JIMGINA NUQSON TOPILDI VA YOPILDI — ikkalasi ham AYNI sessiyada yozilgan kodda edi va ularni TEST emas, JONLI TEKSHIRUV topdi: (a) KATALOGGA QAYTGAN ODAM HEADERSIZ QOLARDI — closePdp() pdp-bar-on belgisini o'chirmasdi; sabab tuzilishda: belgi TANADA, qator esa #pdp ICHIDA yashaydi, ya'ni ular ALOHIDA yo'l bilan yo'qoladi va bittasi qolib ketsa qidiruv, savat, kirish — hammasi ko'rinmas bo'lardi (konsolda xato yo'q, DOM to'liq, element ekrandan tashqarida); pdpBarSync() ga if(!bar) shohbasida ZAXIRA tozalash ham qo'shildi; (b) O'XSHASH MATODAN YANGI MAHSULOT OCHILGANDA header surilgan holatda qolardi — openDetail va popstate da qator skroll TIKLANMASDAN OLDIN hisoblanardi, endi pdpBarSync() window.scrollTo(0,0) dan KEYIN chaqiriladi; ⚠️ skroll hodisasiga tayanib bo'lmaydi, scrollY 0 dan 0 ga «o'zgarsa» hodisa UMUMAN otilmaydi. QOROVUL — TEST 41 KENGAYDI (1 band → 4 band), 4 YANGI MUTATSIYA, 4 TASI USHLANDI (bu funksiya bo'yicha jami 11/11): 2-band chegara offsetHeight dan olinsin va pdpBarSync ichida header uchun getBoundingClientRect BO'LMASIN; 3-band closePdp() pdp-bar-on ni o'chirsin VA pdpBarSync da if(!bar) zaxira tozalashi bo'lsin; 4-band CSS tomonda body.pdp-bar-on #nav qoidasi haqiqatan header'ni yuqoridan olib tashlasin. ⚠️ 4-band USLUBNI emas, NATIJANI so'raydi — translateY(-100%) ham, position:static ham qabul qilinadi: test maqsadni qulflaydi, amalga oshirishni emas, aks holda kelajakdagi to'g'ri yechim testni qizil qilib himoyani to'siqqa aylantirardi. SINALGANI: 80 TEST YASHIL — raqam runner chiqishidan MUSTAQIL sanaldi (^✅ Test satrlari, takrorsiz). ⚠️ Son O'ZGARMADI va bu TO'G'RI: yangi test raqami qo'shilmadi, mavjud Test 41 kengaydi. ⚠️ RAQAM TEKSHIRILDI VA OLDINGI YOZUVDA XATO TOPILDI: bir oldingi yozuv o'zini «oltinchi commit» deb ataydi, git log --since=2026-08-16 esa o'sha paytda YETTI ta commit ko'rsatadi — 2a93153 (og: meta tuzatishi) alohida sanalmay, beshinchining yozuviga qo'shib yuborilgan edi; yozuvlar tuzatilmadi (tarix qayta yozilmaydi), lekin BU YERDAGI raqam GIT dan olindi. ⚠️ TEKSHIRUV KO'Z BILAN EMAS, O'LCHOV BILAN (1280px va 375px): header surilgani (navTop 0 → -64 / -162), qator top:0 ga o'tgani, pdpBarSync() ketma-ket chaqirilganda holat O'ZGARMAGANI (tebranish yo'q — aylanma bog'liqlik haqiqatan uzilgan), katalogga qaytganda header tiklangani, o'xshash kartochkadan yangi mahsulot ochilganda holat to'g'ri bo'lgani. 🔴 JONLI SAYTDA HALI KO'RILMAGAN. DEPLOY: faqat STATIK — server kodiga TEGILMADI, servis restarti va migratsiya KERAK EMAS. Kesh: style.css 61 → 62 (index.html va admin/index.html birga), script.js 50 → 51, panel.js 43 → 44, Test 16 jadvalidagi sha256 lar birga (style.css 0a32cbfbbbce, script.js 5d49be2ec8f6). CLAUDE.md dagi MAVJUD band kengaytirildi — yangi qoida ochilmadi, bu o'sha qadalgan qator bandining davomi. Hujjat: docs/sprintlar/sprint-4.md)";

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
