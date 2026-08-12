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
    { num: 5, nom: "Mobil / PWA",               dars: "Dars 12", holat: "jarayonda",  sana: "2026-07-30" },
    { num: 6, nom: "Integratsiyalar",           dars: "Dars 13", holat: "jarayonda",  sana: "2026-07-22" },
    { num: 7, nom: "Admin panel",               dars: "Dars 14", holat: "tugadi",  sana: "2026-08-08" },
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
  updatedEl.textContent = "Yangilanish: 2026-08-13 (AI KIYIM RASMI ENDI SAYTDA HAM — VA ASOSIY TOPILMA FUNKSIYANING OZIDA EMAS, U KIMGA YETIB BORGANIDA EDI. AI rasm funksiyasi 2026-08-07 dan beri ishlab turardi, lekin FAQAT Telegram Mini App ichida: lolamarket.uz xaridori uni umuman kormasdi. Sabab kodda aniq turardi — routes/ai.js kimlikni authUser() bilan olardi, u esa faqat imzolangan initData ni biladi, yani sayt xaridori bir xil tugmani bosib JIMGINA HTTP 401 olardi. ENG NOQULAY QISMI SHU: bu naqshning oldini oladigan qoida CLAUDE.md ga BIR KUN OLDIN, 2026-08-12 da yozilgan edi — osha kuni u bahs ochish uchun tuzatilgan, AI endpointi esa eski holida qolib ketgan. Yani qoida yozilgani uni bajarilgan qilmadi va loyihaning oz darsi yana tasdiqlandi: YOZILGAN QOIDA HIMOYA EMAS, UNI TEKSHIRADIGAN TEST HIMOYA. Shuning uchun bu safar tuzatish bilan BIRGA qorovul yozildi — TEST 3f: u script.js dan saytning OZ /api/ chaqiruvlarini (yol + METOD) yigadi, server.js routeridan handler nomini topadi va routes/ dagi funksiya TANASINI ochib oqiydi; tanada authUser( bolib requestUser( yoki webSessionUser( bolmasa test QIZIL boladi. Royxat QOLDA yozilmaydi — saytga yangi fetch qoshilsa u avtomatik qamraladi, aks holda qorovulning ozi eskirardi. Test 5 mutatsiya bilan sinaldi va 5 tasi ham ushlandi, ustiga sinovning ozi IKKITA TESHIK ochdi: (a) IZOHDAGI requestUser() sozi qorovulni aldardi — endi tahlildan oldin izohlar olib tashlanadi; (b) oram funksiyaning NOMIGA ishonish yetarli emas edi — reviewAuthor ning cookie yoli ochirilganda ham test yashil qolardi, endi oramning ICHI ochib koriladi. IKKINCHI TOSIQ SOZLAMA EDI: AI savol kalitlari /api/auth/telegram javobining ICHIDA qolda yigilardi, yani sayt bu blokni umuman olmasdi va savollarni chizishning iloji yoq edi. Uni ikkinchi endpointga NUSXA kochirish esa db/014 naqshining ozi bolardi — bir xil royxat ikki joyda jimgina ajralib ketadi va farq KORINMAYDI. Shuning uchun aiClientConfig() yozildi: bayroq, savol kalitlari, combo kalitlari va ikkita chegara BITTA funksiyadan chiqadi va uni ikkala kanal ham chaqiradi, yani yangi savol guruhi qoshilsa u AVTOMATIK ikkalasiga boradi. Saytga AI bloki qoshildi — olchandi, taxmin emas: +432 qator va 13 yangi funksiya, Mini Appdagi HAMMA holat qoplandi (savollar, combo shoxi, kutish, provayder band, model rad etdi, kredit tugadi, surat yoq, texnik xato, natija). KIRMAGAN FOYDALANUVCHIDA BLOK YASHIRILMAYDI — tugma orniga Kirish turadi va kirgandan keyin xaridor AYNI mahsulotga qaytadi: yashirilgan funksiya mavjud bolmagan funksiya bilan bir xil korinadi va xaridor nima uchun kirishi kerakligini bilmasdi. YOL-YOLAKAY HAQIQIY NUQSON TOPILDI va u kodni oqib emas, BRAUZERDA olchab korindi: saytning input delegatsiyasi data-arg ni UZATMASDI (Mini App uzatadi), yani AI erkin matni aiText[undefined] ga yozilardi va XARIDOR YOZGAN IZOH SOROVGA UMUMAN TUSHMASDI — konsolda xato yoq, tugma ishlaydi, faqat natija boshqa chiqadi. Ikkinchi jimgina nuqson poyga edi: /api/auth/web/me asinxron, yani sekin tarmoqda xaridor mahsulotni sozlama kelgunicha ochib ulgurardi va AI bloki JIMGINA yoq bolardi — endi sozlama kelganda ochiq tafsilot oynasi qayta chiziladi, LEKIN faqat detail: checkoutga tegilsa xaridor yozayotgan telefon va manzil ochib ketardi. 54 test PASS va raqam IKKI MUSTAQIL usul bilan olindi (manbadagi grep = 54, npm test chiqishi = 54; HEAD da 53 edi). Kesh majburiy oshirildi: style.css v40 dan 41 ga IKKALA HTML da birga, script.js v30 dan 31 ga, panel.js v11 dan 12 ga — va TEST 16 AMALDA USHLADI, jadval yangilanmagan holatda test qizil boldi. XAVFSIZLIK: sayt yoli cookie bilan ishlaydi, lekin sessiya cookiesi SameSite=Lax va CORS aniq ALLOWED_ORIGIN da, yani CSRF yuzasi ochilmadi. HALOL CHEGARA — SAYTDA HALI BIRONTA HAQIQIY RASM CHIZILMAGAN: brauzer sinovi stub server bilan otkazildi, chunki lokalda Postgres ham, Gemini kaliti ham yoq. Tasdiqlangani — sayt togri sorov yuboradi va javobning har turini togri chizadi (olti xato holati alohida olchandi); tasdiqlanmagani — haqiqiy backend shu sorovni qabul qilib rasm qaytarishi. Sozlama esa OYLAB TOPILMADI: stub uni haqiqiy aiClientConfig() dan oldi va sayt yuborgan sorov tanasi serverning haqiqiy normalizeChoices() idan otkazildi. DEPLOY HALI QILINMAGAN — server/ CI orqali CHIQMAYDI, qolda rsync va servis restart kerak va uni founder bajaradi; sprint faylidagi DEPLOY DALILI bolimi ATAYLAB BOSH qoldirildi va deploydan keyin toldiriladi. Tartib ikkala yonalishda ham xavfsiz: eski backend + yangi frontend bolsa sozlama kelmaydi, aiCfg null qoladi va blok umuman chizilmaydi — yani olik tugma paydo bolmaydi.)";



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
