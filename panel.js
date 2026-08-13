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
    { num: 9, nom: "Production + launch",       dars: "Dars 16", holat: "jarayonda", sana: "2026-08-13" },
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
  updatedEl.textContent = "Yangilanish: 2026-08-13 (AVATAR NUQSONINING IKKINCHI SABABI — BIRINCHI TUZATISH YARIM EDI. d7d10a2 (blob: → data:) productionga chiqdi va founder tekshirdi: SAYTDA ISHLADI, MINI APPDA YOQ. Aynan shu farq tashxis berdi — server yoli soglom (saytning ozi buni isbotlaydi), nuqson faqat Mini App tomonida. IKKINCHI SABAB, MUSTAQIL VA OLCHANDI: kodda const suratSrc = u.photo_url || _avaUrl turgan, yani initDataUnsafe.user.photo_url BIRINCHI POGONA edi; u esa Telegram CDN havolasi va Mini App CSP sining img-src royxatida Telegram domeni YOQ (jonli olchov, curl -sI mini-app: self, data:, cdn.lolamarket.uz, maps.yandex.net, yastatic.net, log.api-maps.yandex.ru). USTIGA U IKKINCHI ZARAR KELTIRGAN VA NUQSONNI IKKI BAROBAR QILGAN: photo_url bor bolgani uchun zaxira span id=tg-ava umuman chizilmasdi, mountAvatar() esa AYNAN osha id ni qidiradi va topmasa DARROV qaytadi — yani bizning /api/me/photo UMUMAN chaqirilmagan; ikkinchi pogona ochilmay qolgan, yani uch pogonali zaxira amalda BIR pogona edi. NEGA BIR YUZDA KORINMAGAN: saytda initData yoq → photo_url ham yoq → bizning yoldan yurgan → ishlagan. Bu CLAUDE.md dagi authUser() naqshining UCHINCHI TAKRORI: bir kanalda ishlab ikkinchisida jimgina oladigan yechim. ENG MUHIM QISMI — ISH YONALISHINI YANA TEKSHIRILMAGAN DAVO BELGILAB QOYDI: kodda oz qolim bilan yozilgan izohda photo_url FAQAT biriktirma menyusidan ochilganda keladi, yani bizdagi kirish nuqtalarida odatda YOQ deb turardi — bu hech qachon TEKSHIRILMAGAN va AMALDA U BOR EDI; yani davo faqat notogri bolib qolmadi, u photo_url ni birinchi pogona qilib qoyishni ham OQLAB turdi. Bu hujjatdagi raqam — tekshirilmagan davo qoidasining aynan ozi, faqat raqam emas MAVJUDLIK darajasida. TUZATISH: const suratSrc = _avaUrl — photo_url butunlay olib tashlandi, avatar endi IKKALA yuzda ham FAQAT /api/me/photo dan (data:), yani BITTA YOL; zaxira bosh harf oz joyida qoldi. TEST 25 GA 4-BAND: telegram-app/app.js da photo_url ishlatilmasin (izohlar tahlildan oldin olib tashlanadi — aks holda shu bandning OZIDAGI tushuntirish qorovulni aldardi). M4 mutatsiyasi bilan sinaldi: mutatsiya va jadvaldagi hash BIRGA yangilanib, TEST 16 YASHIL QOLGAN HOLDA — ushlagani AYNAN Test 25 boldi. HALOL CHEGARA VA U ENDI OGIRROQ: bu tuzatish ham brauzerda koz bilan KORILMADI. Ketma-ket IKKI MARTA mantiqiy xulosa bilan yuborildi va BIRINCHISI YETARLI BOLMADI — yani usulning ozi bir marta sinovdan otib yiqildi. Sabab tahlili jonli olchovga tayanadi (CSP sarlavhasi curl bilan oqildi, ikki yuz farqi founder tomonidan kuzatildi), lekin TUZATISHNING ISHLASHI hamon olchanmagan. Tasdiq faqat founder Mini App ni ochib avatarni korganda boladi. Kesh: telegram-app/app.js v87 (boshqa fayllar TEGILMAGAN — ozgarmagan). Test 16 jadvali birga, 63 TEST YASHIL. DEPLOY: faqat statik, restart kerak emas.)";




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
