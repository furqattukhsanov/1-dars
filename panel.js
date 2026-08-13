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
  updatedEl.textContent = "Yangilanish: 2026-08-13 (VIDEONI OCHIRISH AMALI — OLDINGI COMMIT OCHIB QOYGAN TESHIK YOPILDI. Media galereya bilan video XARIDORGA korina boshladi, olib tashlash yoli esa YOQ edi: nomaqbul video chiqsa faqat BUTUN elonni rad etish qolardi, yani sotuvchi aybsiz mahsuloti bilan birga jazolanardi. Endi mahsulot OCHMAYDI — faqat video maydonlari tozalanadi va sotuvchiga sabab bilan xabar ketadi. Amal panel → Telegram tasdiq yolidan otadi (2026-07-27 qoidasi): panel faqat sorov yaratadi, brauzerda tekshirildi — tugma bosilganda hech qanday sorov ketmadi, avval tasdiq oynasi chiqdi. TARTIB: BAZA birinchi, keyin R2, keyin CDN purge — bazadan ketishi bilan video ilovada korinmay qoladi, yani eng muhim natija BIRINCHI qadamda qolga kiritiladi; kalitlar WITH ... FOR UPDATE bilan OCHIRISHDAN OLDIN olinadi, chunki RETURNING ustunlar NULL qilingandan KEYIN oqiydi va kalitlar yoqolib R2 dagi obyekt abadiy qolib ketardi. NATIJA HALOL AYTILADI: R2 ochirish yoki purge yiqilsa amal bekor qilinmaydi (video allaqachon korinmaydi), lekin admin javobida ANIQ yoziladi — CDN keshi tozalanmadi, havola bilan hamon ochilishi mumkin, qolda purge qiling. Sabab 2026-08-09 OLCHOVI: R2 dan ochirilgan obyekt cdn.lolamarket.uz da cf-cache-status HIT bilan berilaveradi, yani ochirish faylni internetdan olib tashlamaydi va jimgina ochirildi deyish moderatorni ish tugadi deb oylatib qoyardi. CF_API_TOKEN va CF_ZONE_ID shakli boyicha tekshiriladi va IXTIYORIY — process.exit YOQ (R2, AI va karta kalitlari naqshi). TEST 23 — bu ishning eng muhim qismi: ADMIN_ACTIONS kalitlarini migratsiyadagi CHECK royxati bilan solishtiradi, migratsiya fayli QOLDA korsatilmaydi — db/ dagi cheklovni belgilaydigan ENG KATTA raqamli fayl topiladi, yani kelajakdagi migratsiya ham avtomatik qamraladi; sabab db/014 darsi, review_hide CHECKka qoshilmagani uchun sharh yashirish productionda JIMGINA ishlamagan. 60 TEST YASHIL (edi 59), raqam mustaqil qayta olchandi; Test 23 besh mutatsiya bilan sinaldi va beshtasi ham ushlandi; migratsiya pglitede BAJARILDI va PRODUCTIONDA ISHGA TUSHIRILDI — jonli cheklov video_remove ni oz ichiga olgani tasdiqlandi. Kesh: admin/admin.js v24, panel.js v15, Test 16 birga. HALOL CHEGARA: CF_API_TOKEN va CF_ZONE_ID .env da YOQ, yani purge OCHIQ va ochirilgan video CDN keshida qolishi mumkin — admin buni HAR SAFAR xabarda koradi, jimgina qolmaydi; C bosqichi (sotuvchi oz videosini kabinetda korishi) hamon ochiq; DEPLOY QILINMAGAN.)";




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
