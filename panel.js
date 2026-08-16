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
  updatedEl.textContent = "Yangilanish: 2026-08-16, to'rtinchi commit (AI RASM «JAVOBDA RASM YO'Q (IMAGE_OTHER)» NUQSONINING SABABI TOPILDI — VA U 2026-08-13 DA ALLAQACHON «YOPILGAN» BAND EDI. Ish taxmindan emas, IKKI O'LCHOVDAN boshlandi. BIRINCHISI — JONLI JURNAL (nginx access.log + journalctl, 7-16 avgust): 126 muvaffaqiyat, 89 nosozlik, 14 rad etish, 4 kvota; IMAGE_OTHER 7-avgustda 1 ta, 9-avgustdan keyin kuniga 2-21 ta, ya'ni nosozlik funksiya bilan tug'ilmagan — U O'SGAN. IKKINCHISI — BOSHQARILADIGAN TAJRIBA jonli Gemini API'da (~73 so'rov, ~$1.3 kredit; o'lchovning NARXI ataylab yozildi): to'liq prompt + mato surati 0/5, SODDA prompt + AYNI surat 5/5, to'liq prompt SURATSIZ 5/5. Ya'ni na rasm, na prompt ALOHIDA aybdor — ikkalasi BIRGA kelganda model talablarni bajara olmay javobni bo'sh qaytaradi. UCHTA GIPOTEZA RAD ETILDI va bu yozib qo'yilishi shart, aks holda keyingi odam ayni yo'ldan qayta yurardi: (1) aspectRatio '3:4' — 3:4 bilan ham, 3:4 siz ham 0/5; (2) UZUNLIK — yiqilgan promptlar o'rtacha 1957 belgi, o'tganlari 1988, ya'ni yiqilganlari hatto QISQAROQ; (3) TASODIFIYLIK — 9 kombinatsiyadan 6 tasi HAR SAFAR yiqildi, 3 tasi HAR SAFAR o'tdi. Jonli ~30% aynan shundan: bu «ba'zan ishlamaydi» EMAS, «ba'zi tanlovlar HECH QACHON ishlamaydi» — o'rtacha foiz nosozlikning SHAKLINI yashirib turgan edi. 17 banddan sakkiztasini birma-bir olib tashlash rasmni qaytardi, ya'ni prompt CHEGARAGA TIRAB QO'YILGAN: qaysi talab olinishi muhim emas, YUKNI kamaytirish muhim. YO'L-YO'LAKAY TOPILGAN IKKINCHI NUQSON ENG QIMMATI: 2026-08-13 da qo'shilgan «bo'sh javobda 3 marta qayta urinish» tsikli AYNI promptni qayta yuborardi, ya'ni FOYDASIZ edi. Kodda «prompt determinstik bo'lsa ham qayta urinish foydali, chunki ayni prompt ayni javobni BERMAYDI» degan TEKSHIRILMAGAN DA'VO izoh bo'lib turgan va o'lchov uni rad etdi (ayni prompt + ayni surat → 5/5 bir xil IMAGE_OTHER). Jurnal ham UCH KUN shuni aytib turgan va O'QILMAGAN: «qayta urinish yordam berdi» yozuvi asbob qo'yilganidan beri BIR MARTA HAM chiqmagan — ya'ni tsikl bo'sh javobni uch marta QAYTA SOTIB OLARDI (vaqt + kredit). TUZATISH: PROMPT_DARAJA_MAX = 2 (lib/ai.js) — endi har qayta urinish PROMPTNI YENGILLASHTIRADI: 0 = to'liq, 1 = fason bandisiz, 2 = sahna bandisiz ham. Daraja tartibi bisekt natijasidan olindi. O'LCHANDI: 3/9 → 9/9. Provayder bandligi (503) darajani OSHIRMAYDI — u yerda prompt aybdor emas. IKKI SHART QAT'IY: (1) ODOB (kiyinish odobi) HECH QAYSI darajada tashlanmaydi — u sifat emas, TALAB: odobsiz rasm chiqqandan ko'ra rasm chiqmagani yaxshi; (2) 0-DARAJA bugungi promptning BAYT-MA-BAYT o'zi, shuning uchun PROMPT_VERSION oshirilMADI va bazadagi butun rasm keshi TEGILMADI — tuzatish o'zi bilan birga kesh eskirishini olib kelmasin. QOROVUL — TEST 14q ga 7-BAND: u qolgan bandlardan BOSHQA narsani tekshiradi — ular «qayta urinildimi» ni, bu esa «qayta urinishning MA'NOSI bormi» ni (darajalar [0,1,2]; 0-daraja o'zgarmagan; har daraja yukni kamaytiradi; ODOB hamma darajada qoladi va ro'yxat qo'lda emas, PROMPT_DARAJA_MAX dan yuriladi). 3 MUTATSIYA BILAN SINALDI, 3 TASI HAM USHLANDI. Sinov yo'l-yo'lakay eski teshik ochdi: tsikl testlaridagi tanlov obyektida uslub:'neoklassika' (aslida dizayn qiymati) turgan — soxta post promptni qurmagani uchun ko'rinmasdi. IKKINCHI ISH — MINI APP TAFSILOTLAR JADVALIDA «null» SO'ZI TURARDI (telegram-app/app.js): bazadan bo'sh kelgan mahsulotda ekranda «Zichlik null», «Yetkazish muddati null kun» va bo'sh «Tarkibi» chizilardi. Endi qiymati yo'q QATOR umuman chizilmaydi, hammasi bo'sh bo'lsa butun blok tushadi. O'rniga «—» ham, «0 kun» ham QO'YILMADI: «aytilmagan» ≠ «nol» (NULL reyting qoidasi). 🔴 Eng qimmat qismi nuqsonning O'ZI emas, TARQALMAGANI — saytda (script.js → specs) ayni tekshiruv ALLAQACHON bor va IZOHI HAM YOZILGAN edi, ya'ni qoida bir yuzda o'rganilib ikkinchisiga ko'chirilmagan (authUser() va avatar CSP naqshlari bilan bitta oila). YONIDA: width/weight vm() ning esc() chegarasidan CHETDA qolgan va xom holda innerHTML ga tushardi — bugun ularni yozadigan endpoint YO'Q, ya'ni hujum yo'li ochilmagan edi, lekin himoya «kim yozadi» ga emas, QAYERGA CHIQADI ga qarab qo'yiladi. CLAUDE.md ga yangi qoida: «QAYTA URINISH SO'ROVNI O'ZGARTIRSIN — aks holda u qayta urinish EMAS». Kesh: telegram-app/app.js v97 → v98, panel.js v40 → v41, Test 16 jadvali birga. SINALGANI: 75 TEST YASHIL (hisobotchi mustaqil qayta yurgizdi va sanadi). ⚠️ DEPLOY ESLATMASI: bu commit SERVER kodiga tegadi — statik rsync YETARLI EMAS, servis restart kerak, va rsync --no-owner --no-group bilan. Migratsiya YO'Q. ⚠️ CLAUDE.md da oldingi sessiyadan qolgan «rsync -a lokal UID ni raqam bo'yicha ko'chiradi» bandi ham shu commitga tushdi — u boshqa sessiyaniki, lekin ayni faylda edi. Hujjat: docs/sprintlar/sprint-10.md (AI rasm), docs/sprintlar/sprint-4.md (Mini App tafsilotlari))";





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
