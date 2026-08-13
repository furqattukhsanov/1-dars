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
  updatedEl.textContent = "Yangilanish: 2026-08-13 (IKKI SESSIYA BIRLASHTIRILDI — ikkalasi ham bir kunda, bir xil fayllarda ishlagan va origin/main da 13 fayl kesishdi. Konfliktlar QO'LDA hal qilindi, birorta tomonning ishi tashlanmadi. Yo'l-yo'lakay TEST RAQAMI TO'QNASHUVI topildi: ikkala sessiya ham Test 24 va Test 25 ni band qilgan edi — main dagilari joyida qoldi, bu sessiyanikilar 26/26b/27/28 ga ko'chirildi. || AVATAR: profil avatari PRODUCTIONDA UMUMAN CHIZILMAGAN, sabab kodda emas CSP sarlavhasida edi — img-src ro'yxatida blob: yo'q, avatar esa URL.createObjectURL bilan qo'yilgandi. Tuzatish: blob: o'rniga data: (u CSP da ALLAQACHON bor, ya'ni nginx ga tegilmadi). Nuqson turi loyihada tanish va eng yomon xili: konsolda xato YO'Q, fetch 200, kod ishlaydi — faqat rasm chizilmaydi. Qorovul Test 25. || TO'RT AGENT LOYIHANI BAHOLADI (PM, dizayner, marketolog, investor) va founder to'rt bandni tanladi. Sessiyaning eng qimmatli natijasi kod emas, UCH MARTA TAKRORLANGAN BITTA NAQSH: YOZILGAN QOIDA HIMOYA EMAS, UNI TEKSHIRADIGAN TEST HIMOYA — (1) video chegara qorovuli (videoRadSababi) catalog.js da sinov uchun ATAYLAB ochiq deb eksport qilingan, testi esa HECH QACHON yozilmagan; (2) brend rangi tokendan olinsin qoidasi styles.css da yozilgan, app.js uni 81 JOYDA buzardi (sanaldi, taxmin emas); (3) QOLDIQ xotirasidagi IKKI yozuv eskirgan edi va ular bo'yicha ish boshlanayozdi. || #3 ANALITIKA: db/025 — users.src, /start deep-link manba belgisi. Belgi BIRINCHI TEGINISHDA qulflanadi (COALESCE(users.src, EXCLUDED.src)); tartib teskari bo'lsa eng ko'p ESLATMA yuborgan kanal eng samarali ko'rinib qolardi va reklama byudjeti aynan shu yolg'onga qarab taqsimlanardi. src IS NULL kanallar ro'yxatiga QO'SHILMAYDI — u manba noma'lum degani, to'g'ridan-to'g'ri keldi degani EMAS. Panelda ikki blok: Qaysi kanaldan kelishdi va AI kiyim rasmi. || #5-C VIDEO: routes/seller.js javobida vid_ qatori 0 MARTA uchrardi — sotuvchi videosini yuborardi va taqdirini bilmasdi. Endi videoVM(r) va awaitingVideo qaytadi; request_video oynani QAYTA ochadi va bu yangi yo'l emas, mavjud bo'shliq (moderator videoni olib tashlagan e'lon ABADIY videosiz qolardi). Tugma faqat yo'l YOPIQ bo'lganda chiziladi. || #5-F: Test 26 video chegarasi (mp4/30s/12MB — chegara qiymatining O'ZI qabul qilinadi, tekshiruv R2 GA YUKLASHDAN OLDIN), Test 26b — R2 siz video null va TAXMINIY HAVOLA YASALMAYDI. || #6 YOPILDI: founder AI rasm va chat effektini jonli ko'rdi. Dalil turi ALOHIDA yozildi va u o'lchov EMAS, FOUNDER SO'ZI. || #7 DIZAYN QARZI: 81 xom rang tokenga o'tdi, Test 28 qulfladi va U DARROV ISH BERDI — index.html da ayni rang SVG fill= PREZENTATSIYA ATRIBUTIDA 11 marta turgan, u yerda esa var() UMUMAN ISHLAMAYDI va fill=var(--pom-700) JIMGINA QORA berardi, ya'ni tozalashning O'ZI belgini butun saytda qora qilib qo'yardi; to'g'ri yo'l fill=currentColor + rang CSS klassida. Yandex iconColor va KONFETTI_RANG ataylab istisno. Brend nomi tenglashtirildi (Mini App headerida JS kelguncha TELEGRAM MINI APP degan texnik atama ko'rinardi). user-scalable=no OLIB TASHLANMADI — O'LCHOV TAVSIYANI RAD ETDI: html va body ikkalasida overflow hidden, sahifa umuman skroll qilmaydi, ya'ni zoom qilgan foydalanuvchi qamalib qolardi. || YO'L-YO'LAKAY IKKI XATO TUZATILDI: (a) eski backendda video tugmasi O'LIK bo'lardi — CI faqat frontendni chiqaradi, ya'ni yangi frontend + eski backend oynasi HAR DOIM bo'ladi; endi maydon yo'q bo'lsa blok umuman chizilmaydi; (b) hisobotdagi db/025 dan oldin kod chiqsa BOT O'LADI degan baho MUBOLAG'A bo'lib chiqdi — pglite da o'lchandi: INSERT .catch() ichida, ya'ni webhook yiqilmaydi va saytga kirish ishlayveradi, LEKIN users yozuvi butunlay to'xtaydi va hisob JIMGINA yolg'on gapira boshlaydi. Deploy ko'rsatmasidagi mubolag'a ham tekshirilmagan da'vo. || SINALGANI: 67 test yashil (birlashtirishdan oldin: bu sessiyada 64, main da 63), 12 mutatsiya bilan sinaldi va 12 tasi ham ushlandi; db/025 pglite da HAQIQATAN bajarildi. Kesh birlashtirishdan keyin ikkala tomonnikidan YUQORI olindi: style.css 53, script.js 45, panel.js 24, admin.js 25, telegram-app/styles.css 30, app.js 87. || HALOL CHEGARA: db/025 SERVERDA ISHGA TUSHIRILMAGAN va u kod deploy'idan OLDIN bajarilishi shart; server/ rsync va restart founder zimmasida; manba belgisi jonli sinalmagan — haqiqiy t.me havolasi hali bosilmagan; avatar tuzatishi ham founder profilni ochib ko'rganda tasdiqlanadi. || AVATAR NUQSONINING IKKINCHI SABABI — BIRINCHI TUZATISH YARIM EDI. d7d10a2 (blob: → data:) productionga chiqdi va founder tekshirdi: SAYTDA ISHLADI, MINI APPDA YOQ. Aynan shu farq tashxis berdi — server yoli soglom (saytning ozi buni isbotlaydi), nuqson faqat Mini App tomonida. IKKINCHI SABAB, MUSTAQIL VA OLCHANDI: kodda const suratSrc = u.photo_url || _avaUrl turgan, yani initDataUnsafe.user.photo_url BIRINCHI POGONA edi; u esa Telegram CDN havolasi va Mini App CSP sining img-src royxatida Telegram domeni YOQ (jonli olchov, curl -sI mini-app: self, data:, cdn.lolamarket.uz, maps.yandex.net, yastatic.net, log.api-maps.yandex.ru). USTIGA U IKKINCHI ZARAR KELTIRGAN VA NUQSONNI IKKI BAROBAR QILGAN: photo_url bor bolgani uchun zaxira span id=tg-ava umuman chizilmasdi, mountAvatar() esa AYNAN osha id ni qidiradi va topmasa DARROV qaytadi — yani bizning /api/me/photo UMUMAN chaqirilmagan; ikkinchi pogona ochilmay qolgan, yani uch pogonali zaxira amalda BIR pogona edi. NEGA BIR YUZDA KORINMAGAN: saytda initData yoq → photo_url ham yoq → bizning yoldan yurgan → ishlagan. Bu CLAUDE.md dagi authUser() naqshining UCHINCHI TAKRORI: bir kanalda ishlab ikkinchisida jimgina oladigan yechim. ENG MUHIM QISMI — ISH YONALISHINI YANA TEKSHIRILMAGAN DAVO BELGILAB QOYDI: kodda oz qolim bilan yozilgan izohda photo_url FAQAT biriktirma menyusidan ochilganda keladi, yani bizdagi kirish nuqtalarida odatda YOQ deb turardi — bu hech qachon TEKSHIRILMAGAN va AMALDA U BOR EDI; yani davo faqat notogri bolib qolmadi, u photo_url ni birinchi pogona qilib qoyishni ham OQLAB turdi. Bu hujjatdagi raqam — tekshirilmagan davo qoidasining aynan ozi, faqat raqam emas MAVJUDLIK darajasida. TUZATISH: const suratSrc = _avaUrl — photo_url butunlay olib tashlandi, avatar endi IKKALA yuzda ham FAQAT /api/me/photo dan (data:), yani BITTA YOL; zaxira bosh harf oz joyida qoldi. TEST 25 GA 4-BAND: telegram-app/app.js da photo_url ishlatilmasin (izohlar tahlildan oldin olib tashlanadi — aks holda shu bandning OZIDAGI tushuntirish qorovulni aldardi). M4 mutatsiyasi bilan sinaldi: mutatsiya va jadvaldagi hash BIRGA yangilanib, TEST 16 YASHIL QOLGAN HOLDA — ushlagani AYNAN Test 25 boldi. HALOL CHEGARA VA U ENDI OGIRROQ: bu tuzatish ham brauzerda koz bilan KORILMADI. Ketma-ket IKKI MARTA mantiqiy xulosa bilan yuborildi va BIRINCHISI YETARLI BOLMADI — yani usulning ozi bir marta sinovdan otib yiqildi. Sabab tahlili jonli olchovga tayanadi (CSP sarlavhasi curl bilan oqildi, ikki yuz farqi founder tomonidan kuzatildi), lekin TUZATISHNING ISHLASHI hamon olchanmagan. Tasdiq faqat founder Mini App ni ochib avatarni korganda boladi. Kesh: telegram-app/app.js v87 (boshqa fayllar TEGILMAGAN — ozgarmagan). Test 16 jadvali birga, 63 TEST YASHIL. DEPLOY: faqat statik, restart kerak emas.)";




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
