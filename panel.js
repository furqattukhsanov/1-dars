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
  updatedEl.textContent = "Yangilanish: 2026-08-16, to'qqizinchi commit (SAYTNING TAGIGA TO'LIQ FOOTER QO'SHILDI — HAVOLALARI SAHIFA EMAS, OYNA OCHADI. Ish FAQAT SAYTGA tegdi, Mini App'ga TEGILMADI (u yerda pastda navigatsiya turadi). NAMUNA: founder Uzum marketning footer'ini ko'rsatdi va bo'limlarni quiz orqali berdi — ikki ustun («Biz haqimizda»: Topshirish punktlari, Loyiha haqida, Vakansiyalar, Hamkor bo'lish; «Foydalanuvchilarga»: Biz bilan bog'lanish, Savol-Javob, Yetkazish va to'lov, Ommaviy oferta va maxfiylik). «Tadbirkorlarga» ustuni founder tomonidan TANLANMADI va o'zboshimchalik bilan qo'shilmadi. 🔴 QATORLAR HAVOLA EMAS, TUGMA — VA BU MAJBURIY TANLOV: sayt bitta sahifadan iborat, ya'ni /vakansiyalar kabi manzil YO'Q va oddiy <a href> qo'yilsa har qator 404 berardi; har qator data-action orqali savat/profil bilan BITTA mexanizmda oyna ochadi (drawerView='info', INFO_TOPICS jadvali). Founder qarori: «kerak bo'lishi shartlarini ham qo'y keyin ichini to'ldiramiz» — shakl bugun, mazmun keyin, lekin bo'shligi KO'RINIB tursin. ⚠️ BO'SH BO'LIM BO'SHLIGINI AYTADI, «TEZ ORADA» DEMAYDI: matn «Bu bo'lim matni hali yozilmagan» + bog'lanish tugmasi; sana va'da qilinmadi, chunki bajarilmagan va'da yo'q matndan yomonroq (NULL reyting va ALERT_CHAT_ID darslari bilan bitta oila). «YETKAZISH VA TO'LOV» — YAGONA TO'LIQ BO'LIM, chunki mazmuni allaqachon kodda bor; ⚠️ foiz PREPAY_RATE dan O'QILADI (serverdan keladi), matnga qo'lda yozilmadi — stavka o'zgargan kuni sahifa jimgina yolg'on gapirardi (komissiya 10→12% o'tishida ayni tuzoq bo'lgan). ⚠️ «TOPSHIRISH PUNKTLARI» YANGI RO'YXAT CHIZMAYDI — profildagi «Mening manzilim» ochadigan AYNI ko'rinishni ochadi (openPoints → drawerView='address'); ikkinchi nusxa ATAYLAB qilinmadi (CLAUDE.md: mavjud funksiya ustiga ikkinchi yo'l qo'shilmaydi), aks holda nuqta nomlari va koordinatalari vaqt o'tib ajralib ketardi. Farqi yangi addrFrom o'zgaruvchisida: sarlavha footer'dan kelinganda «Topshirish punktlari», profildan kelinganda «Mening manzilim»; nuqta tanlangandan keyin footer yo'lida oyna YOPILADI — profilga «qaytarish» mumkin emas, chunki foydalanuvchi u yerda umuman bo'lmagan va KIRMAGAN odam u yerda bo'sh karta bilan «Hisobdan chiqish» tugmasini ko'rardi. QR BLOKI founder so'ragan («Telegram botda xarid qilish qulayroq», o'rtasida lolaning shaffof logosi): QR INLINE SVG (tashqi fayl CSP va ?v= bilan yana bitta bog'liqlik bo'lardi), tashqi npm paket ishlatilmadi — kodlagich qo'lda yozildi (byte mode, ECC H); rang CSS klassida va fill=\"currentColor\", chunki fill=\"var(...)\" SVG prezentatsiya atributida jimgina QORA berardi. 🔴 DEEP-LINK PAYLOAD'I web_footer EMAS, sayt_footer — VA BU FARQ O'LCHOVDAN CHIQDI: quiz javobida web_footer yozilgan edi, server/routes/webhook.js → manbaBelgisi() esa web_ bilan boshlanadigan payloadni RAD ETADI (u saytga kirish kodi uchun band) va uni ATAYLAB JIM tashlaydi — alert ham chiqmaydi, ya'ni asl variant bilan QR panelda «NOL ODAM KELTIRDI» bo'lib turardi: raqam yo'q emas, YOLG'ON. Serverning O'Z funksiyasida sinaldi: sayt_footer → qabul, sayt_hamkor → qabul, web_footer → null. ✅ QR HISOBOTCHI TOMONIDAN MUSTAQIL QAYTA O'QILDI (da'voga emas, o'lchovga ishonish): index.html dagi <path d> ning O'ZIDAN 37×37 modul to'ri qayta yig'ildi (355 yugurish, 709 qora modul), server/lib/png.js bilan PNG ga chizildi va macOS Vision bilan dekodlandi → https://t.me/lolamarketbot?start=sayt_footer, ya'ni belgidagi manzil yonidagi href bilan bir xil; markazi yopilgan holda ham o'qildi — 22% (sahifadagi holat), 28% va hatto 34%. 🔴 TELEFONDA TOPILGAN JIMGINA NUQSON: .footer-top bloki AYNI paytda .container ham edi va padding: 32px 0 8px QISQARTMASI uning yon to'ldirmasini NOLGA tushirgan (.container 154-qatorda, keyingi qoida uni bosib o'tardi) — o'lchov: chap chegara 0px, QR kartochkasi 375px ekranda 360px joy egallagan, ustunlar ekran chetiga yopishgan; konsolda xato YO'Q edi, nuqsonni faqat getBoundingClientRect() ko'rsatdi. Endi padding-top va padding-bottom ALOHIDA yoziladi. IKKI TIL — 22 ta yangi kalit (uz+ru). ⚠️ INFO_TOPICS da matn kaliti SATR emas, t('...') CHAQIRUVI: Test 20 ishlatilishni t('kalit') shakli bo'yicha sanaydi, satr bo'lib yotsa kalitlar «o'lik» ro'yxatiga tushardi va bir kun «ishlatilmayapti» deb o'chirilardi — o'shanda bo'lim matn o'rniga KALIT NOMINI ko'rsatardi. ⚠️ RAQAM TEKSHIRILDI VA HISOBOTDAGI IKKITA DA'VO TUZATILDI: (1) «24 ta yangi kalit» → aslida 22 (271−249); (2) «o'lik ro'yxat 23 → 16 ga qaytdi» → HEAD da u ALLAQACHON 16 edi va 16 ligicha qoldi, ya'ni ish o'lik ro'yxatni QISQARTIRMADI, O'SMASLIGINI ta'minladi. SINALGANI: 80 TEST YASHIL (mustaqil yurgizildi va sanaldi). ⚠️ Son O'ZGARMADI va bu safar bu KAMCHILIK — bu ishga YANGI QOROVUL QO'SHILMADI (HEAD da ham 80 edi, o'lchandi): data-action nomlari va deep-link sayt_ prefiksi test bilan qulflanmagan, ikkalasi ham JIMGINA sinadigan turdan; qarz sifatida sprint-4 «Qarorlar» ga yozildi. ⚠️ TEKSHIRUV KO'Z BILAN EMAS, O'LCHOV BILAN: 1280px da uch ustun 338/338/360, 375px da bitta ustun, gorizontal siljish 0, kesilish yo'q, havola bo'yi 40px (barmoq uchun); CSS tokenlari ham tekshirildi — 19 tasi style.css da MAVJUD (aniqlanmagan token jimgina yo'qoladi). 🔴 JONLI SAYTDA HALI KO'RILMAGAN. DEPLOY: faqat STATIK — server kodiga TEGILMADI, servis restarti va migratsiya KERAK EMAS. Kesh: style.css 62 → 63 (index.html va admin/index.html birga), script.js 51 → 52, panel.js 44 → 45, Test 16 jadvali birga. Hujjat: docs/sprintlar/sprint-4.md)";

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
