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
    { num: 4, nom: "Asosiy funksiya",           dars: "Dars 11", holat: "jarayonda",  sana: "2026-08-14" },
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
  updatedEl.textContent = "Yangilanish: 2026-08-14 (REPO TARTIBLASH — dizayn-tizim ish materiallari production'dan olindi: telegram-app/_ds/lolamarket-design-system-.../ (8 fayl, ~40K) docs/dizayn-tizimi/ ga git mv qilindi. Sabab: deploy.yml Mini App'ni telegram-app/* bilan BUTUNLAY serverga ko'chiradi, ya'ni ichki ish materiallari lolamarket.uz/mini-app/_ds/... da hammaga ochiq turardi; hech narsa unga havola qilmasdi — ko'chirish xavfsiz. DIQQAT: serverdagi eski /var/www/lolamarket/mini-app/_ds/ rsync bilan O'CHMAYDI — qo'lda olib tashlash kerak (sayt-eski darsi). Yo'l-yo'lakay: chips-variantlar.html lokal demo o'chirildi (dizayn tanlangan, production'da — 16479d8); CLAUDE.md Fayl tuzilmasi tuzatildi — prd-lolamarket.md qatori olib tashlandi (bunday fayl hech qachon mavjud bo'lmagan, haqiqiysi texnik-topshiriq.md), docs/dizayn-tizimi/ qo'shildi, sprintlar 0..10. Photo/ dagi 9 rasmga founder ko'rsatmasi bilan ATAYLAB tegilmadi. Kesh: panel.js 28 → 29, Test 16 jadvali birga. 67 test yashil. DEPLOY: statik, servis restarti kerak emas.) || OLDINGI YOZUV (2026-08-14): SAYT HAM OSTKI CHIZIQ CHIP DIZAYNIGA OTDI — IKKALA YUZ BITTA KORINISH qoidasi TIKLANDI, founder qarori; ertalabki alohida qaror kutilmoqda bandi shu kuniyoq yopildi. style.css dagi .chip Mini App .cat-chip bilan AYNAN bir xil retseptda: --text-muted matn, .active da --pom-700 + qalin + ikat rombi, yangi .chip-line elementi (gradient chiziq, scaleX 0→1). .chips ga touch-action: pan-x + overscroll-behavior-x: contain ham qoshildi — Mini App dagi qimirlash tuzatishi saytda YOQ edi, ayni nuqson bu yerda ham yashab turgan. Izohda ikkala tuzoq hujjatlandi: chiziq ::after emas (44x44 tap-maydon qoidasi band qilgan), saytda JS kerak emas (klass almashadi, markup qayta chizilmaydi). index.html da 7 chip matni ichki span data-i18n ga kochirildi va sababi muhim: applyLang() textContent yozadi — atribut tashqi tugmada tursa til almashtirilganda chiziq spani JIMGINA OCHIB ketardi; brauzerda tekshirildi, ruschada 7 chiziq ham omon. || SHU KUNNING OLDINGI ISHLARI: (1) chiplar qatori barmoq ostida qimirlashi tuzatildi (touch-action: pan-x); (2) founder 3 lokal variantdan OSTKI CHIZIQ (B) ni Mini App uchun tanladi — .cat-line alohida element (global button::after 44x44 tap-maydonni band qilgan), app.js da focusCatChip() tanlangan chipni markazlaydi va katalogga qaytganda skroll boshiga qaytish nuqsoni ham tuzaldi; (3) CLAUDE.md ga CSP qoidasi va hr agenti hujjati kirdi. || Kesh: style.css 53 → 54 (index.html va admin/index.html da BIR XIL raqam), telegram-app/styles.css 32 → 33, panel.js 27 → 28, Test 16 jadvali birga. Tekshirildi: 67 test yashil, mobil + desktop skrinshot, filtr ishlaydi, ranglar tokendan (Test 26). DEPLOY: faqat statik, servis restarti kerak emas. Lokal demo (_ds/chips-variantlar.html) ATAYLAB commitdan tashqarida.)";




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
