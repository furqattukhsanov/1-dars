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
  updatedEl.textContent = "Yangilanish: 2026-08-13 (BIR COMMIT, TORT ISH OQIMI — SAYT MINI APP BILAN TENGLASHISHDA DAVOM ETMOQDA. C2 — SOTUVCHI KABINETI ENDI SAYTDA: kechagi C1 topilmasining AYNI OZI, faqat kengroq — requireSeller() (lib/auth.js) hamon authUser() da edi va BITTA FUNKSIYA BESHTA ENDPOINTNI qoriqlagani uchun butun kabinet sayt sotuvchisiga JIMGINA 401 berardi; handleMe va handleSubmitProduct ham osha holatda edi. Uchalasi requestUser() ga otkazildi, moderatsiya endpointlari esa ATAYLAB authUser() da qoldi (sayt ularni chaqirmaydi). Saytga qoshildi: kabinet uch korinishda (elonlar / forma / buyurtmalar), elon qoshish va tahrirlash, yashirish/korsatish, buyurtma qabul/rad/jonatish + kuzatuv raqami (raqamsiz sorov KETMAYDI), bahs javobi; rasm yuklash ATAYLAB yoq — bot orqali soraladi. ENG MUHIM TOPILMA QOROVULNING OZIDA: Test 3f faqat marshrut faylining ichini ochardi, requireSeller esa lib/auth.js da — natijada uni chaqiradigan handler ochiq endpoint deb sanalib mutatsiya JIMGINA otib ketdi. Endi tekshiruv modul chegarasidan otadi va mutatsiyalar ushlanadi. DARS: QOROVULNING OZI HAM MUTATSIYA BILAN SINALMASA QOROVUL EMAS. XSS sinovi: xaridor yozgan olti maydonga img-onerror qoyildi, hech biri bajarilmadi. C3 BOSHLANDI — SAYT IKKI TILLI (UZ/RU): headerda til almashtirgich, tanlov localStorage da, HTML ozbekcha QOLADI (SEO) va ruscha data-i18n atributlari orqali ustiga qoyiladi; JS matnlari t(kalit) bilan STR jadvalidan — Mini Appdagi naqshning ozi. Yangi TEST 20 tarjima kalitlarini qoriqlaydi: kalit yoq bolsa t() kalitning OZINI qaytaradi va foydalanuvchi tugmada sDisputeSend degan yozuvni koradi — sahifa buzilmaydi, xato chiqmaydi, JIMGINA nuqson; royxat qolda yozilmaydi, t() chaqiruvlari va data-i18n kalitlari KODDAN oqiladi. AI KUTISH HOLATI ATELYE USLUBIDA (ikkala kanal): 30 soniyagacha davom etadigan kutish jim spinner bilan turardi — endi 3:4 skelet (rasm chiqadigan joyning OZI) + shimmer, ichida SVG igna-chok animatsiyasi (chok tikilib boradi), matn Mojiza tayyor bolmoqda, va ~30 soniyalik HALOL progress-chiziq — u 92% da TOXTAYDI, chunki 100% ga yetkazish tayyor boldi-yu chiqmadi degan yolgon vada bolardi. Natija blurdan ochiladi + bir martalik uchqun (fresh bayrogi oqilgach ochiriladi — qayta chizishda takrorlanmaydi), Mini Appda haptic. PWA IKONKALARI BREND KVADRATIGA OTDI: marun fon + oq logo (yangi manba Photo/logo/lola-mark-white.png, alfa saqlangan), favicon va apple-touch-icon ham endi shu fayl; icon-192 PRECACHE da turgani uchun sw.js CACHE_VERSION v3 → v4 (bu qoidani Test 17 qoriqlaydi). Ikonkalar scp bilan chiqarilgan va jonli tasdiqlangan. Kesh: style.css v43 (ikkala HTML birga), script.js v33, telegram-app styles.css v22 / app.js v74, panel.js v13. 55 TEST PASS (edi 54). HALOL CHEGARA OZGARMADI: saytda hali bironta haqiqiy AI rasm chizilmagan (founder kirishi kerak), C2 haqiqiy backend bilan sinalmagan (stub), server/ deployi qolda — founder bajaradi.)";




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
