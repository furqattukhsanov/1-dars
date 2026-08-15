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
    { num: 4, nom: "Asosiy funksiya",           dars: "Dars 11", holat: "jarayonda",  sana: "2026-08-15" },
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
  updatedEl.textContent = "Yangilanish: 2026-08-15 (REKLAMA BANNERI QAYTA DIZAYN QILINDI — yangi fon rasmlari, yangi tipografiya va KARUSEL mexanikasi; founder bilan LOKALDA bosqichma-bosqich ko'rib chiqildi. Dizayn briefi yozildi (docs/dizayn-tizimi/banner-dizayn-brief.md — ish materiali, deploy'ga chiqmaydi) va uchala fon rasmi Gemini bilan qayta chizildi: atlas / paxta-adras / ikat. O'LCHANDI, hujjatdan ko'chirilmadi: 1200×338, WebP 13–22 KB, JPEG 26–40 KB. Fon endi background-image EMAS, <picture>: WebP asosiy + JPEG zaxira, yig'indida 102 KB → 56 KB (~1.8x yengil); AD_SLIDES.img KENGAYTMASIZ asos (assets/ads/ad-1), .webp/.jpg ni chizish kodi o'zi qo'shadi — bittasi esdan chiqsa brauzerning bir qismi bo'sh joy ko'rardi. .ad-slide picture { display:block } qoidasi BIRGA qo'shildi (CLAUDE.md <picture> bandi — loyihada 3 marta tishlagan). FOUNDER TAHRIRLARI: sarlavha HAR DOIM ikki qator (uch slayd bir xil balandlikda tursin); qo'shimcha so'z sarlavha USTIDA emas — OXIRGI SO'ZDAN KEYIN chip bo'lib, urg'u rangida fon va oq matn (eyebrow → tag); 1-slayd yorlig'i «AI xizmati» → «Sinab ko'rish» (ru «Попробовать»); pastdagi 3 nuqta va strelka BUTUNLAY olib tashlandi; banner KARUSEL bo'ldi («qolgan bannerlar yonida ko'rinib tursin»), qo'shni slayd cheti ikki marta kamaytirildi 18 → 10 → 6px («chalg'itadi», keyin «yana ozgina»). KARUSEL — SURISHNI BRAUZER QILADI, JS EMAS: overflow-x auto + scroll-snap, inersiya bepul keladi; cheksiz aylanish uchun ikki chetga KLON ([n-1, ...haqiqiy, 0]), skroll to'xtaganda haqiqiysiga sezdirmasdan sakraydi. scrollend ISHLATILMAYDI — iOS WebView'da YO'Q, o'rniga scroll + 120 ms tinchlik: unga tayanilsa karusel aynan Telegram ichida klonda qotib qolardi, brauzerda esa hammasi joyida ko'rinardi. Yon foyda MEXANIKADAN: surishdan keyin click UMUMAN kelmaydi, ya'ni «surish bosish deb hisoblanmasin» uchun yozilgan qo'l kodi (adSwiped, 45px chegara) butunlay ortiqcha bo'ldi. BEKOR QILINGAN 2026-08-14 QARORLARI (sprint-4.md da belgilandi, o'chirilmadi): touch-action pan-y → pan-x pan-y (faqat pan-x sahifa skrollini, faqat pan-y karuselni o'ldiradi); nuqtalar va ular uchun 44px tegish maydoni; adSwiped; aspect-ratio 32/9 .ad-banner dan .ad-slide ga ko'chdi, flex:none skrollerda qoldi. SINOV PAYTIDA TUTILGAN NUQSON — UNI KO'Z KO'RMADI: CSS izohida ortiqcha */ qolib .ad-banner qoidasi BUTUNLAY o'chib qolgandi, banner «biroz boshqacha» ko'rinardi va konsol toza edi; topilishiga yagona sabab — getBoundingClientRect() bilan O'LCHASH. Test 32 kengaytirildi (ikkala kengaytma diskda + chizishda ishlatilishi, <picture>, display:block, flex 0 0 100%, scroll-snap, klon tartibi, data-arg). Kesh: styles.css 35→36, app.js 95→96, panel.js 36→37, Test 16 jadvali birga. SINALGANI: 74 TEST YASHIL (hisobotchi mustaqil qayta yurgizdi); lokal brauzerda 375px: uchala slayd, o'lchamlar getBoundingClientRect bilan, cheksiz aylanish IKKI tomonga, slayd bosilganda AI ekraniga o'tish va qaytganda 1-slayddan boshlanish. TEKSHIRILMAGANI: jonli Mini App'da (Telegram WebView) hali KO'RILMAGAN — 120 ms settle ning haqiqiy iOS inersiyasi bilan xatti-harakati faqat brauzerda o'lchangan. BRIEF ENDI QISMAN ESKIRGAN: unda o'ng 35% «strelka + nuqtalar joyi» deb yozilgan, ular esa olib tashlandi — ish materiali eskiradi, kod haqiqat manbai (reklama-banner-spec.md bilan bitta holat). OCHIQ QOLDI: 2-slayd matni hamon «24/7 buyurtma berishingiz mumkin» — founder javob bermadi, O'ZGARTIRILMADI. Hujjat: docs/sprintlar/sprint-4.md (amalga oshirish + qarorlar), docs/sprintlar/sprint-0.md (dizayn briefi))";




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
