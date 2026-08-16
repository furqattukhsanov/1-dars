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
  updatedEl.textContent = "Yangilanish: 2026-08-16, oltinchi commit (MAHSULOT SAHIFASIDA QADALGAN QUTI OLIB TASHLANDI, O'XSHASH MATOLAR KATALOG O'LCHAMIGA QAYTDI. Uchala o'zgarish ham founder shikoyati/qarori bo'yicha; ish FAQAT SAYTGA tegdi, Mini App'ga TEGILMADI. 1) QUTI QADALMAYDI: founder «webda scroll qilsam shu qadalib pastga tushayabdi» dedi va .pdp-aside dan position:sticky OLIB TASHLANDI. Narx va tugma esa yo'qolmadi — o'rnini yangi .pdp-bar bosadi: yuqorida ingichka qator (surat, nom, reyting, narx va AYNI «Savatga» tugmasi), u FAQAT sotib olish qutisi ekrandan chiqib ketganda ko'rinadi va sahifa mazmunini bosib turmaydi. Muqobili — qadalishni saqlab faqat kesishmani tuzatish — RAD ETILDI: kechagi commitda aynan shunday qilingan edi (tor ekranda position:static) va nuqson KENG ekranda qolgan edi, ya'ni tuzatish nuqsonning bir yuzini yopib ikkinchisini ochiq qoldirardi. ⚠️ TUGMA NUSXALANMADI — ikkala joy ham pdpActHtml() dan oziqlanadi va renderPdpAct() IKKALA idishni yangilaydi; nusxa yozilsa ekran o'z ustidan JIMGINA yolg'on gapirardi: bir joyda «savatda 2 dona», ikkinchisida hamon «Savatga qo'shish». ⚠️ QATORNING top I JS DA O'LCHANADI (pdpBarSync), --header-h dan OLINMAYDI va sabab o'lchov: 880px dan tor ekranda qidiruv ikkinchi qatorga tushadi va header o'sha o'zgaruvchidan baland bo'ladi — 700px da 115px, 375px da 162px; qattiq yozilsa qator header ostiga kirib UMUMAN ko'rinmay qolardi (CSS dagi qiymat faqat ZAXIRA). position:fixed, sticky EMAS — qator #pdp ichida yashaydi va sticky bo'lsa sahifa oxirida yuqoriga chiqib ketardi; tinglovchilar HUJJAT umri bo'yicha bir marta ulanadi, renderPdp da ulansa har ochilishda yangisi qo'shilardi. 2) O'XSHASH MATOLAR IKKI QATOR VA KATALOG O'LCHAMIDA: founder «kartochkalar pastda ezilib o'z hajmini yo'qotayotgan edi, shunaqa yo'qotmasin hech qachon» + «2 qator bo'lib tursin» dedi. Pastki qator endi UCHALA ustunni egallaydi («below below side» → «below below below»). 🔴 O'LCHANDI (1280px): o'xshash mato kartochkasi 179×394 edi, AYNI kartochka katalogda 264×501 — ya'ni tavsiya kartochkasi kengligining UCHDAN BIRINI yo'qotardi; endi 264×501, harfma-harf bir xil. .pdp-sim ustunlar sonini QAYTA YOZMAYDI — u .product-grid dan keladi, ya'ni «kartochka o'z hajmini yo'qotmasin» qoidasi BITTA joyda turadi (ikkita mustaqil ro'yxat BTS_POINTS kabi jimgina ajralib ketardi). Ko'rinadigan kartochka soni ham ustunga bog'landi: 2/3/4 ustun → 4/6/8, ya'ni HAR DOIM ikki qator; PDP_SIM_MAX 4 → 8 va u eng katta songa TENG. Ortiqchasi DOM'da qoladi va faqat yashiriladi — pdpMountSimilar sahifa ochilganda BIR marta ishlaydi, ya'ni ekran kengaysa qator qayta chizilmasdan to'ladi. 3) VARAQA NISHONI FONSIZ BELGIGA O'TDI (founder: «admin panelnikidek qilgin»): index.html rel=icon → /Photo/logo/lola-mark.png; ilgari assets/pwa/icon-192.png turardi va u to'q qizil KVADRAT — varaqa tasmasida qora dog'day ko'rinardi. ⚠️ apple-touch-icon ATAYLAB kvadrat bo'lib QOLDI: iOS uy ekranida fonsiz PNG ni oq fonga qo'yadi va anor belgi rangsiz ko'rinardi — ikki nishon ikki xil ish qiladi, bir xillashtirilmasin (2026-08-14 dagi «ikki yuz bir xil ko'rinishi SHART EMAS» mulohazasining takrori). Photo/ deploy.yml source ro'yxatida ALLAQACHON bor (tekshirildi) va fayl diskda mavjud. YANGI QOROVULLAR — 7 MUTATSIYA, 7 TASI USHLANDI: TEST 40 — .pdp-sim da grid-template-columns qayta yozilmasin + ikki qator pog'onalari (4/6/8) + PDP_SIM_MAX eng katta pog'onaga teng bo'lsin; TEST 41 — sotib olish tugmasi HAMMA idishda yangilansin, idishlar ro'yxati qo'lda yozilmaydi va manbadan yig'iladi (2 ta: pdp-act, pdp-bar-act), ya'ni uchinchi joy qo'shilsa avtomatik qamraladi; TEST 37 izohi yangi maydon tuzilmasiga moslandi (u kechagi commitda aynan qadalgan quti uchun yozilgan edi). SINALGANI: 80 TEST YASHIL — raqam runner chiqishidan MUSTAQIL sanaldi (^✅ Test satrlari, takrorsiz; yakuniy «Hammasi PASS» qatori bu naqshga tushmaydi). ⚠️ Ish yozuvida raqam KELMAGAN edi («butun to'plam yashil»), shuning uchun zanjir git tarixidan tiklandi va TEKSHIRILDI: 5cd89cf → 75, e174291 → 77, 2a93153 (HEAD, Test 39 qo'shilgan) → 78, bugun 2 ta → 80; ya'ni oldingi hisobotlardagi raqamlar TO'G'RI bo'lib chiqdi. ⚠️ TEKSHIRUV KO'Z BILAN EMAS, O'LCHOV BILAN: brauzer paneli render qilmadi (document.hidden), ya'ni skrinshotga ishonib bo'lmasdi — getBoundingClientRect() bilan 1280/900/700/500/375/320px kengliklarda o'lchandi, gorizontal skroll yo'q; bu CLAUDE.md dagi «flex ustunda ko'z bilan qarash yetarli emas» bandining amaliyoti. 🔴 JONLI SAYTDA HALI KO'RILMAGAN. DEPLOY: faqat STATIK — server kodiga TEGILMADI, servis restarti va migratsiya KERAK EMAS. Kesh: style.css 60 → 61 (index.html va admin/index.html birga), script.js 49 → 50, panel.js 42 → 43, Test 16 jadvalidagi sha256 lar birga. CLAUDE.md ga ikkita yangi qoida yozildi (quti qadalmaydi + qator top i o'lchanadi; varaqa nishoni fonsiz). Hujjat: docs/sprintlar/sprint-4.md)";

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
