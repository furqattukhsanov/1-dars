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
  updatedEl.textContent = "Yangilanish: 2026-08-16, beshinchi commit (MAHSULOT DETALI DRAWER'DAN TO'LIQ SAHIFAGA O'TDI — VA ENG QIMMAT NUQSONNI FOUNDER TOPDI, TEST EMAS. Ish FAQAT SAYTGA tegdi, Mini App'ga TEGILMADI — bu founder sharti edi va u 2026-08-13 dagi «shunday qilgin» darsining to'g'ridan-to'g'ri qo'llanilishi: Mini App'da mahsulot allaqachon o'z ekranida yashaydi, ya'ni ko'chiriladigan narsa yo'q. 1) SAHIFA: founder Uzum referensini berdi; eski drawer ko'rinishi (drawerView === 'detail') OLIB TASHLANDI — ikkinchi yo'l qoldirilmadi, aks holda ayni mahsulot ikki xil ko'rinishda ochilib har o'zgarish ikki joyda takrorlanardi. Tarkib: galereya (eskiz + strelka + nuqta), nom/reyting/tasdiqlangan nishoni, qadalgan sotib olish qutisi, kafolat, sotuvchi kartochkasi, tavsif jadvali, AI bloki, sharhlar, o'xshash matolar. ⚠️ Sahifa index.html ICHIDA yashaydi (#pdp), YANGI HTML FAYL EMAS — aks holda uni deploy.yml source ro'yxatiga QO'LDA qo'shish kerak bo'lardi va unutilsa nginx try_files tufayli HTTP 200 + HTML qaytarib, nosozlik SOG'LOM ko'rinardi. ⚠️ Referensdagi CHEGIRMA, TAYMER, BO'LIB TO'LASH va «307 kishi oldi» QO'YILMADI: bunday ma'lumot bazada YO'Q, ya'ni ko'rsatish TO'QISH bo'lardi — «o'ylab topilgan raqam ko'rsatilmasin» qoidasi paneldan tashqarida ham amal qiladi, chunki referens raqamning MANBAINI emas, faqat SHAKLINI keltiradi. 2) MANZIL HASH'DAN HAQIQIY YO'LGA: #/mahsulot/x → /mahsulot/x, eski hash havolalari replaceState bilan ko'chiriladi (tarqalgani o'lmasin). 🔴 SHU YERDA SOFT-200 TUZOG'I QAYTA CHIQDI: o'lchandi — /mahsulot/ik-1402 → 200 text/html (nginx ALLAQACHON beradi, ya'ni sahifa ishlashi uchun server qadami SHART EMAS), LEKIN /mahsulot/style.css → 200 text/html. Ya'ni sahifa bir pog'ona ichkarida ochilgani uchun har NISBIY yo'l CSS o'rniga HTML olib kelardi va HTTP kodi sog'lom ko'rinardi. Shuning uchun index.html dagi HAMMA nisbiy yo'l mutlaqqa o'tkazildi va pwa.js /sw.js ga — scope:'/' bilan, aks holda service worker qamrovi /mahsulot/ bo'lib qolib BOSH SAHIFA SW'SIZ qolardi. document.title ham mahsulot nomini oladi. 3) YANGI server/routes/pdp.js — og: meta (Telegram oldindan ko'rishi): robot HTML ni O'QIYDI, JS ni BAJARMAYDI, ya'ni buni frontendda qilib bo'lmaydi. 🔴 MODUL IXTIYORIY VA SHUNDAY QOLADI: nginx yo'naltirmasa sayt to'liq ishlaydi, faqat oldindan ko'rish umumiy bo'ladi — mahsulot sahifasini backend'ga BOG'LAB qo'yish butun katalogni bitta yiqilish nuqtasiga ulardi (backend o'lsa har bir mato 502). nginx snippet'i server/README.md ga ZAXIRA YO'LI bilan yozildi (error_page 502 = @static_index). WEB_ROOT shakl bo'yicha tekshiriladi — papkada index.html HAQIQATAN turganiga qaraladi, «bo'sh emas» yetarli emas (ALERT_CHAT_ID darsi), topilmasa QICHQIRIB o'chadi. index.html HAR SO'ROVDA diskdan o'qiladi, keshlanmaydi: deploy statik faylni almashtiradi-yu servisni qayta ishga tushirmaydi, ya'ni kesh qo'yilsa eski HTML FAQAT mahsulot sahifalarida tarqalib turardi va sababi hech qayerda ko'rinmasdi. 4) QOLGANLARI: rasmni kattalashtirish (to'liq ekran, desktopda 2x bosish; telefonda brauzerning O'Z pinch'i — saytda user-scalable=no YO'Q); havolani nusxalash tugmasi (mavjud copyText(), yiqilsa AYTADI); o'xshash matolar UCH POG'ONA bo'ldi (toifa → sotuvchi → narx yaqinligi) va sabab O'LCHOV: jonli katalogda jun 1 · ikat 1, ya'ni ilgari o'sha ikki matoda bo'lim UMUMAN chizilmasdi; MOQ endi savatga qo'shishda darrov MOQ dan boshlanadi va «−» undan pastga tushirmaydi (bugun zarari NOL — 24 mahsulotda ham moq=1 — lekin sotuvchi 5 qo'ygan kuni tishlardi); sellerRating /api/products ga qo'shildi (bazada BOR edi, hech qayerda ko'rsatilmasdi; NULL bo'lsa qator chizilmaydi). 5) KARTOCHKA id DAN data-* GA (act-<id>/fav-<id> → data-act/data-fav): «o'xshash matolar» katalog kartochkasini cloneNode bilan NUSXALAYDI (founder: «kartochka o'zgarmasin, qanday holatda bo'lsa»), ya'ni bitta kartochka sahifada IKKI JOYDA turadi va id TAKRORLANARDI — id global, getElementById ikkinchi nusxani ko'rmasdi. Qayta chizish varianti rad etildi: o'shanda kartochka MANTIG'I ikki joyda yashardi. TUZATILGAN NUQSONLAR — UCHALASI HAM O'LCHOV BILAN TOPILDI: (a) o'xshash kartochka rasmi aspect-ratio ni yo'qotib har birida boshqa balandlik olardi (kutilgan 136px, o'lchangan 242/290/323) — rasm oqimdan chiqarildi; (b) nusxalangan kartochkalar opacity:0 da QOTIB qolardi (IntersectionObserver nusxaga otilmaydi) — ⚠️ DOM tekshiruvi YASHIL edi, nuqson faqat RASMDA ko'rindi; (c) 🔴 UCHINCHISINI FOUNDER TOPDI: 1000px kenglikda qadalgan sotib olish qutisi «o'xshash matolar» USTIDA suzardi (o'lchandi: quti 668→968, pastki qator 32→968 — 300px kesishma) va SABAB sticky DA EMAS, MAYDON TUZILMASIDA edi — tor ekranda pastki qator ikkala ustunni egallaydi, ya'ni qadalgan quti o'z ustunidan CHIQIB ketardi. YANGI QOROVULLAR: TEST 37 — qadalgan quti ostidan qator o'tmasin: grid-template-areas ni MATRITSA qilib yoyadi va «side turgan ustunda boshqa qatorda below bormi» deb so'raydi, media bloklari orasidagi MEROSNI ham hisoblaydi (aynan shu nuqson edi — media bloki maydonlarni almashtirib position ni qoldirgan); 3 mutatsiya, 3 tasi ushlandi. TEST 38 — index.html da nisbiy yo'l qolmasin (izohlar tahlildan OLDIN tashlanadi: Test 3f da IZOH qorovulni aldagan edi) + pwa.js /sw.js ni MUTLAQ yo'l bilan ro'yxatdan o'tkazsin; 2 mutatsiya, ikkalasi ham ushlandi. ⚠️ Test 37 «ko'z bilan qarash yetarli emas» oilasidan: nuqson faqat SKROLL qilinganda va faqat MA'LUM kenglikda ko'rinadi — konsolda xato yo'q, overflow yo'q, o'lchamlar «to'g'ri». SINALGANI: 77 TEST YASHIL (hisobotchi mustaqil qayta yurgizdi va sanadi). ⚠️ Ish yozuvida 78 deb kelgan edi — farq shundan: test.js oxirida «Hammasi PASS» degan YAKUNIY ✅ qator ham chiqadi, ya'ni ✅ belgisini sanash testni emas, TEST + YAKUN ni sanaydi; tekshirildi — oldingi commit 75 ta edi, bugun 2 ta qo'shildi → 77. Bu «hujjatdagi raqam — TEKSHIRILMAGAN DA'VO» qoidasining aynan o'zi va u bir marta allaqachon tishlagan («32 test» → aslida 33 ta). Kesh: style.css v58 → v60, script.js v47 → v49, pwa.js v2 → v3, panel.js v41 → v42, Test 16 jadvalidagi sha256 lar birga; admin/index.html dagi style.css ham v60 ga ko'tarildi (u AYNI faylni chaqiradi — 2026-08-06 da bu 15 versiya orqada qolib ketgan edi). ⚠️ DEPLOY ESLATMASI: bu commit SERVER kodiga tegadi (routes/pdp.js, config.js, server.js) — statik rsync YETARLI EMAS, servis restart kerak, va rsync --no-owner --no-group bilan. Migratsiya YO'Q. og: meta uchun nginx qadami IXTIYORIY — bajarilmasa sayt baribir to'liq ishlaydi. Hujjat: docs/sprintlar/sprint-4.md)";

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
