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
    { num: 8, nom: "Sifat tekshiruvi",          dars: "Dars 15", holat: "jarayonda", sana: "2026-08-05" },
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
  updatedEl.textContent = "Yangilanish: 2026-08-06 (C3 TUGADI — CSP script-src dan 'unsafe-inline' OLIB TASHLANDI, KOD TOMONI TAYYOR VA TEST BILAN QULFLANDI. Bu C1/C2 ning davomi va YAKUNI. ASOSIY KUZATUV NUQSONLARNING O'ZIDAN MUHIMROQ: uchala topilma ham \"TUGADI\" deb yozilgan ishdan keyin chiqdi va sababi bitta — QAMROVNI RO'YXAT BELGILAGAN EDI. Supurish qaysi fayllarni sanasa o'shalar tekshirilgan, qidiruv naqshi qaysi hodisa nomlarini sanasa o'shalar topilgan; ikkala ro'yxat ham to'liq emas edi va buni HECH NARSA ko'rsatmasdi — na test, na xato, na belgi. UCHTA TOPILMA: (1) ildizdagi offline.html da inline onclick=location.reload() va inline skript bloki — telegram-app dagi EGIZAGI C2 da tuzatilgan, ildizdagisi supurish ro'yxatiga UMUMAN kirmagan; yangi offline.js ga chiqarildi, sw.js dagi PRECACHE ga ./offline.js qo'shildi va CACHE_VERSION v2 dan v3 ga oshirildi — ikkinchi qadam MAJBURIY, aks holda keshda eski ro'yxat qolib offline.js aynan OFLAYN holatda yuklanmasdi, ya'ni tuzatish O'ZI TUZATAYOTGAN holatda ishlamas edi. (2) loyiha-panel.html dagi 49 qatorlik inline skript bloki — yangi panel.js ga chiqarildi; bu DEPLOY QILINADIGAN sahifa, ya'ni CSP unga ham tegadi. (3) index.html narx filtridagi 2 ta onkeydown Enter ishlovchisi — C1 supurishi ko'rmagan, chunki o'sha qidiruv naqshi faqat click, input, change, submit va error hodisalarini sanardi; script.js ga UCHINCHI delegatsiya qatlami qo'shildi — data-enter, data-action va data-submit yonida. keydown ham click EMAS: mavjud tinglovchilarning hech biri uni ko'rmasdi, bu C2 dagi \"submit hodisasi click emas\" topilmasining AYNAN takrori. QOROVUL — Test 15: 18 ta deploy qilinadigan frontend faylini skanerlab uch narsani qidiradi — inline hodisa atributi, inline skript bloki va javascript: URL; istisnolar ro'yxati deepStrictEqual bilan AYNAN solishtiriladi, ya'ni istisno YO'QOLSA ham test qizil bo'ladi, faqat qo'shilganda emas. DALIL — HAMMASI O'LCHANDI, \"test yashil\" deb qabul qilinmadi: qorovulning o'zi 5 mutatsiya bilan sinaldi va beshtasida ham QIZIL berdi (inline hodisa qaytarish, inline skript qo'shish, javascript: URL, istisno ro'yxatini o'chirish, nishon fayl nomini o'zgartirish — ya'ni qamrov JIMGINA qisqarishi ham tutiladi). Sahifalar HAQIQIY yangi CSP sarlavhasi ostida chizildi: \"CSP ni brauzerda sinab bo'lmaydi\" degan taxmin NOTO'G'RI bo'lib chiqdi — kanonik CSP ni javobga qo'yadigan kichik Node statik serveri yozildi. Landing: CSP buzilishi 0, Enter ikkala narx maydonida applyPrice ni chaqirdi (1 va 2), 'a' bosilganda otilmadi (2 da qoldi), onkeydown atributi 0 ta. Oflayn sahifa: online hodisasi hint'ni ko'rsatdi (hidden true dan false ga), \"Qayta urinish\" tugmasi sahifani QAYTA YUKLADI — belgi yo'qolishi bilan o'lchandi, inline skript 0, onclick 0. Panel: 11 kartochka, bar 45%, panel.js tashqi skript, begona svg onload 0 ta; ESKI NUSXA O'SHA CSP OSTIDA 0 KARTOCHKA BERDI — ya'ni \"C3 nimani o'ldirardi\" savoliga ham taxmin bilan emas O'LCHOV bilan javob berildi. Mini App: 27 ta data-action, 27 tasi otildi, o'lik tugma 0. Admin: kirish tugmasi \"Kirish\" dan \"...\" ga o'tdi — josus usuli admin'da ishlamaydi, shuning uchun TA'SIR o'lchandi. Toza yorliqda beshala sahifa: CSP buzilishi 0 ta. npm test — 31 test PASS, node --check uchala JS da toza. deploy.yml: source ro'yxatiga offline.js va panel.js QO'LDA qo'shildi (CI faqat sanab o'tilgan fayllarni chiqaradi) va deploy tekshiruviga check /offline.js hamda check /panel.js kiritildi — ular yetib bormasa nuqson JIMGINA chiqardi, chunki nginx yo'q faylga try_files bilan HTML va HTTP 200 qaytaradi. YO'L-YO'LAKAY TOPILGAN ALOHIDA NUQSON: shu panelning hisobot matnida xom svg onload namunasi turgan edi — proza deb yozilgan, brauzer esa HAQIQIY teg deb ochgan va ortidagi butun hisobot o'sha teg ichiga tushib KO'RINMAY QOLGAN; eski nusxa chizib O'LCHANDI va matn haqiqatan yutilgani tasdiqlandi, endi kichik va katta belgilar &lt; va &gt; bilan yoziladi va buni ham Test 15 qo'riqlaydi. ATAYLAB QOLDIRILGANI: sayt-eski/index.html:69 dagi onsubmit — founder qarori (\"kerakmas, unut\"), Test 15 istisnolar ro'yxatidagi YAGONA yozuv; style-src dagi 'unsafe-inline' ga TEGILMADI, bu boshqa va ancha katta qarz (kodda yuzlab inline style atributi). OCHIQ QOLGANI: Cloudflare paneldagi CSP qiymatini FOUNDER almashtiradi — yagona qolgan qadam, tartibi docs/xavfsizlik-sarlavhalari.md da; DEPLOY OLDIN, CSP KEYIN, aks holda yangi fayllar yetib bormasdan oflayn sahifa va panel bir muddat ishlamay turadi. DARS: yozilgan qoida himoya emas — uni tekshiradigan test himoya; endi qamrovni ro'yxat emas TEST belgilaydi.)";



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
