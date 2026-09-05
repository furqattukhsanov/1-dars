/* ====================================================
   IKKI TILLILIK — uz / ru (2026-08-13, C3)

   Mini App boshidan ikki tilli edi (`STR[S.lang]`), sayt esa faqat
   o'zbekcha. Bazada `name_ru` / `business_name_ru` allaqachon bor va
   ulardan foydalanilmasdi.

   ⚠️ HTML O'ZBEKCHA QOLADI va bu ATAYLAB: sahifa manbasidagi matn — SEO
   uchun ko'rinadigan yagona tarkib, asosiy bozor esa o'zbek tilida qidiradi.
   Ruscha tarjima `data-i18n` orqali TEPASIGA qo'yiladi, ya'ni birinchi
   chizilishda hech narsa "sakramaydi" va tarjima yuklanmasa ham sayt
   to'liq ishlaydi.

   ⚠️ MAHSULOT MATNI TARJIMA QILINMAYDI — u BAZADAN keladi (`{uz, ru}`).
   `ruYoq` bo'lsa o'zbekchasiga qaytadi: o'lchandi (2026-08-13) — 22
   e'londan faqat 11 tasida `name.ru` bor, ya'ni "hammasi to'lgan" degan
   eski yozuv YOLG'ON edi. Zaxirasiz qilinsa yarim katalog RUS TILIDA
   BO'SH nom bilan chiqardi.
   ==================================================== */

/* Tarjima jadvali. Kalitlar BO'LIMLAR bo'yicha guruhlangan — yangi matn
   qo'shilganda qayerga tushishi ko'rinib tursin. Ikkala til ham TO'LIQ
   bo'lishi shart: qorovul (`server/test.js` → Test 20) `t('...')` bilan
   chaqirilgan har bir kalit ikkala jadvalda ham borligini tekshiradi. */
const STR = {
  uz: {
    // ---- Header / navigatsiya ----
    searchPh: 'Mato yoki ishlab chiqaruvchi',
    clear: 'Tozalash',
    priceFilterAria: "Saralash va narx filtri",
    login: 'Kirish',
    profile: 'Profil',
    favorites: 'Saralanganlar',
    cart: 'Savat',
    catalog: 'Katalog',
    // ---- Katalog / filtr ----
    priceLabel: "Narx, so'm / rulon",
    priceMin: 'Eng kam',
    priceMax: "Eng ko'p",
    priceBad: "Eng kam narx eng ko'pdan katta bo'lmasin",
    // ---- Saralash varag'i (referens: Shop "Sort by") ----
    sortTitle: 'Saralash',
    sortRec: 'Tavsiya etilgan',
    sortNew: 'Eng yangi',
    sortAsc: 'Arzondan → qimmatga',
    sortDesc: 'Qimmatdan → arzonga',
    sheetReset: 'Tozalash',
    sheetDone: 'Tayyor',
    close: 'Yopish',
    nothingFound: 'Hech narsa topilmadi',
    nothingFoundSub: "Boshqa so'z bilan qidiring yoki filtrni o'zgartiring.",
    catAll: 'Barchasi',
    verifiedNote: '— LolaMarket tomonidan tekshirilgan ishlab chiqaruvchi',
    bTavsiya: 'Tavsiya', bKamQoldi: 'Kam qoldi', bHunarmand: 'Hunarmand', bYangi: 'Yangi',
    // ---- Banner ----
    // Matn Mini App'dagi `AD_SLIDES` bilan AYNAN bir xil (2026-08-16).
    // ⚠️ Sarlavhadagi `\n` — qator uzilishi va u SHART: founder qaroriga
    // ko'ra sarlavha har doim ikki qator (`style.css` → `.ad-title`
    // `white-space: pre-line`). Mini App'da o'sha joyda `<br>` turadi;
    // bu yerda `<br>` yaramaydi, chunki tarjima `textContent` bilan yoziladi.
    // ⚠️ `aria-label` sarlavhadan ALOHIDA yozilgan: ekran o'quvchi uchun
    // "Bepul yetkazib berish" o'zi qayerga olib borishini aytmaydi, ko'z
    // esa buni chipdan va rasm ostidagi katalogdan tushunadi.
    ad1t: "Matolarni AI bilan\njonlantiring",
    ad1tag: "Sinab ko'rish",
    ad1aria: "Matolarni AI bilan jonlantiring — katalogga o'tish",
    ad2t: '24/7 buyurtma\nberishingiz mumkin',
    ad3t: 'Bepul yetkazib\nberish',
    ad3tag: 'Ilk 3 ta buyurtma',
    ad3aria: "Bepul yetkazib berish — katalogga o'tish",
    // ⚠️ Bannerga EMAS, pastdagi «CTA — Telegram bot» bo'limiga tegishli
    // (`index.html` → `.cta-title`). Banner matni almashtirilganda shu
    // kalit ham banner bilan birga o'chib ketishiga oz qolgan edi.
    tgOrder: 'Telegram orqali ham buyurtma bering',
    catIkat: 'Ikat va adras',
    catSuzani: "So'zana",
    catSilk: 'Ipak',
    catCotton: 'Paxta',
    catWool: 'Jun',
    catLinen: "Zig'ir",
    // ---- Zaxira holati ----
    stIn: 'Sotuvda', stLow: 'Kam qoldi', stMade: 'Buyurtmaga', stOut: 'Tugadi',
    // ---- Mahsulot ----
    product: 'Mahsulot',
    unitPrice: '1 dona rulon narxi',
    unitPricePanel: '1 dona panel narxi',
    addToCart: "Savatga qo'shish",
    specWidth: 'Eni', specWeight: 'Zichlik', specComp: 'Tarkibi',
    mediaPhoto: 'Rasm', mediaVideo: 'Video',
    mediaPrev: 'Oldingi', mediaNext: 'Keyingi',
    specLead: 'Yetkazish muddati', specMoq: 'Minimal buyurtma',
    specLen: 'Rulon uzunligi',
    days: 'kun', pcs: 'dona',
    // ---- Bozor tadqiqoti funksiyalari (2026-09-05) ----
    sampleBtn: "Namuna so'rash",
    sampleSent: "So'rov yuborildi — siz bilan bog'lanamiz",
    sampleErr: "So'rov yuborilmadi — qaytadan urinib ko'ring",
    stockAlertBtn: 'Kelganda xabar berish',
    stockAlertOn: 'Xabar beramiz — obuna qabul qilindi',
    stockAlertErr: "Obuna bo'lmadi — qaytadan urinib ko'ring",
    needLoginFirst: 'Avval saytga kiring',
    reorderBtn: 'Qayta buyurtma',
    reorderDone: 'Mahsulotlar savatga qo\'shildi',
    reorderNone: 'Bu buyurtmadagi matolar hozir mavjud emas',
    revPhotoAdd: 'Rasm biriktirish (ixtiyoriy)',
    revPhotoOn: 'Rasm tanlandi ✓',
    revPhotoBig: 'Rasm juda katta — 4 MB gacha bo\'lsin',
    reviews: 'Sharhlar',
    noReviews: "Hali sharh yo'q",
    noReviewsSub: 'Sharhni faqat shu matoni sotib olgan xaridor yoza oladi.',
    reviewsCount: 'sharh',
    decrease: 'Kamaytirish', increase: "Ko'paytirish",
    // ---- Mahsulot sahifasi (2026-08-16) ----
    pdpBack: 'Katalogga qaytish',
    pdpDesc: 'Mahsulot tavsifi',
    pdpCat: 'Toifa',
    pdpSimilar: "O'xshash matolar",
    pdpSeller: 'Ishlab chiqaruvchi',
    pdpSellerMore: 'Shu ishlab chiqaruvchining matolari',
    pdpVerified: 'LolaMarket tasdiqlagan',
    pdpSafe: "Himoyalangan to'lov",
    pdpSafeSub: "Mato mos kelmasa — buyurtma bo'yicha murojaat qilasiz, pul qaytariladi.",
    pdpAllReviews: "Hamma sharhlarni ko'rish",
    pdpFavAdd: "Saralanganlarga qo'shish",
    pdpFavOn: 'Saralanganlarda',
    pdpNoSpecs: "Ishlab chiqaruvchi bu mato bo'yicha qo'shimcha tavsif bermagan.",
    pdpCopyLink: 'Havolani nusxalash',
    pdpLinkCopied: 'Havola nusxalandi',
    pdpLinkCopyErr: "Havolani nusxalab bo'lmadi — manzil qatoridan ko'chiring",
    // ---- Savat / buyurtma ----
    total: 'Jami',
    order: 'Buyurtma berish',
    checkout: 'Buyurtmani rasmiylashtirish',
    sending: 'Yuborilmoqda…',
    send: 'Yuborish',
    sendDispute: 'Murojaat yuborish',
    submitOrder: 'Buyurtmani yuborish',
    orderAccepted: 'Buyurtma qabul qilindi',
    btsHint: 'BTS Pochta orqali yetkaziladi — sizga eng qulay nuqtani tanlang.',
    // ---- Profil ----
    myOrders: 'Mening buyurtmalarim',
    myAddr: 'Mening manzilim',
    myAddrNone: 'Doimiy olish nuqtasi tanlanmagan',
    myAddrHint: "Tanlansa, buyurtma berishda shu nuqta oldindan qo'yiladi",
    myAddrPick: 'Kartadan tanlash',
    myAddrChange: "O'zgartirish",
    myAddrSaved: 'Manzil saqlandi',
    myAddrErr: "Manzil saqlanmadi — qayta urinib ko'ring",
    myAddrClose: 'Yopish',
    workHoursL: 'Ish vaqti',
    mapApprox: 'Belgi tuman markazi aniqligida — aniq joyni BTS bilan tekshiring',
    mapOff: "Karta yuklanmadi — nuqtani ro'yxatdan tanlang",
    mapLoading: 'Karta yuklanmoqda…',
    pickSelect: 'Tanlash',
    contactT: "Biz bilan bog'lanish",
    contactCall: "Qo'ng'iroq qilish",
    contactTg: 'Telegram orqali yozish',
    contactSub: "Qo'ng'iroq yoki Telegram",
    contactTgWay: 'Telegram orqali',
    phoneCopied: "Raqam nusxalandi — qo'ng'iroq ochilmasa, qo'lda tering",
    phoneCopyErr: "Raqamni nusxalab bo'lmadi — uni qo'lda ko'chiring",
    noOrders: "Hozircha buyurtma yo'q. Katalogdan mato tanlab birinchi buyurtmangizni bering.",
    ordersNone: "Hozircha buyurtma yo'q",
    ordersCount: 'buyurtma',
    toProfile: 'Profilga qaytish',
    logout: 'Hisobdan chiqish',
    loggedOut: 'Hisobdan chiqdingiz',
    buyer: 'Xaridor',
    loading: 'Yuklanmoqda…',
    // ---- Sharh ----
    rateFabric: 'Matoni baholang',
    reviewThanks: "Rahmat! Sharhingiz qo'shildi",
    // ---- Bahs ----
    problemTitle: "Muammo bo'yicha murojaat",
    // ---- AI ----
    aiTitle: 'AI kiyim rasmi',
    aiSub: 'Mahsulot suratidan chiziladi',
    aiGo: 'Rasmni chizish',
    aiLoginCta: 'Kirish — rasm chizish uchun',
    aiPicked: '{m} tadan {n} tasi tanlandi',
    aiWaitMsg: "Mo'jiza tayyor bo'lmoqda… ✨",
    aiNote: 'AI tasavvuri — haqiqiy mahsulot emas',
    aiNoPhoto: "Bu mahsulotda surat yo'q, shuning uchun rasm chizib bo'lmaydi",
    aiNoCredit: "Kredit qoldig'i tugadi — yangi rasm chizib bo'lmaydi.",
    aiBadText: "Matnda ruxsat etilmagan belgi bor — faqat harf, raqam, vergul va chiziqcha",
    aiBusy: 'AI xizmati hozir band. Kreditingiz qaytarildi — bir necha daqiqadan keyin urinib ko\'ring',
    aiBlocked: 'AI bu so\'rov bo\'yicha rasm chizishdan bosh tortdi. Kreditingiz qaytarildi — javoblarni o\'zgartirib ko\'ring',
    aiNoAuth: 'Sessiya tugagan — rasm chizish uchun qaytadan kiring',
    aiError: 'Hozir generatsiya qilib bo\'lmadi, birozdan keyin urinib ko\'ring',
    aiRetry: 'Qayta urinish',
    aiAgain: 'Boshqacha chizish',
    aiShare: 'Ulashish',
    aiOtherCut: 'Boshqa fason',
    aiOtherCutHint: 'Yangi fason — {n} credit',
    aiCreditsUnlimited: 'Lola credit: ∞ Cheksiz',
    aiCreditsLeft: '{n} credit qoldi · Bitta rasm — {c} credit',
    aiTextQ: "Yana nima qo'shilsin? (ixtiyoriy)",
    aiTextPh: 'masalan: oltin tugma, qora yoqa',
    // ---- Telegram orqali kirish ----
    tgLogin: 'Telegram orqali kirish',
    tgLoginSub: "Parol ham, SMS ham kerak emas. Kirsangiz — buyurtmalaringiz bir joyda turadi va holat o'zgarishi haqidagi xabar Telegram'ga keladi.",
    tgPrivacy: "Biz faqat ismingiz va Telegram'dagi nomingizni ko'ramiz. Yozishmalaringizga kirish imkonimiz yo'q.",
    tgConfirm: "Telegram'da tasdiqlang",
    tgStart: '«Boshlash»',
    tgOpen: 'Telegramni ochish',
    cancel: 'Bekor qilish',
    cancelShort: 'Bekor',
    backToCart: 'Savatga qaytish',
    // ---- Buyurtma qatori ----
    sellerReply: 'Ishlab chiqaruvchi javobi:',
    refundLabel: 'Qaytariladi:',
    disputeBtn: "Muammo bo'yicha murojaat",
    rateBtn: '★ Baholash',
    gotItBtn: '📦 Buyurtmani oldim',
    gotItAsk: "Buyurtmani qo'lingizga oldingizmi? Tasdiqlagach matoni baholash ochiladi.",
    gotItDone: 'Rahmat! Endi matoni baholashingiz mumkin',
    gotItErr: 'Tasdiqlash yuborilmadi',
    // ---- Bo'sh holatlar ----
    favEmpty: "Saralanganlar bo'sh",
    favEmptySub: "Yoqqan matolarni yurakcha tugmasi bilan belgilang — keyin shu yerdan topasiz.",
    cartEmpty: "Savat bo'sh",
    cartEmptySub: "Katalogdan mato tanlang — buyurtmangizni shu yerda rasmiylashtirasiz.",
    // ---- Checkout ----
    deliveryEst: 'Yetkazish (taxminiy)',
    payNow: "Hozir to'lanadi",
    payLater: "Mato tayyor bo'lgach",
    deliveryNote: "Yetkazish BTS nuqtasida to'g'ridan-to'g'ri to'lanadi, yuqoridagi jamiga kirmaydi.",
    tgLoginHint: 'Telegram orqali kiring',
    fName: 'Ismingiz *',
    fPhone: 'Telefon *',
    fPhoneHint: "Buyurtmani tasdiqlash uchun shu raqamga bog'lanamiz.",
    fCompany: 'Kompaniya',
    fBts: 'BTS olish nuqtasi *',
    btsPick: '— Nuqtani tanlang —',
    fComment: 'Izoh',
    orderDone: 'Buyurtmangiz qabul qilindi',
    orderWord: 'Buyurtma',
    reviewPh: 'Sifati haqida qisqacha yozing (ixtiyoriy)',
    coHintIn: "Buyurtma holati Telegram'dagi hisobingizga xabar bo'lib keladi — to'lov hozir olinmaydi.",
    coHintOut: "Buyurtma Telegram orqali bizga yetib boradi — to'lov hozir olinmaydi.",
    doneHintIn: "Tez orada ko'rsatilgan telefon raqamingizga bog'lanamiz. Holat o'zgarganda Telegram'ga xabar keladi.",
    doneHintOut: "Tez orada ko'rsatilgan telefon raqamingizga bog'lanamiz. Buyurtma holatini Telegram bot orqali ham kuzatishingiz mumkin.",
    openBot: 'Botni ochish',
    // ---- Sharh / bahs formasi ----
    reviewHint: 'Faqat siz olgan mato haqida — bahoyingiz boshqa xaridorlarga yordam beradi.',
    disputeHint: "Muammoni tanlang. Yuborgach botda sizdan rasm so'raladi — dalil moderator qarorini tezlashtiradi.",
    // ---- Sotuvchi kabineti ----
    sCabinet: 'Sotuvchi kabineti',
    sVerified: 'tasdiqlangan',
    sMyProducts: "E'lonlarim",
    sOrders: 'Buyurtmalar',
    sIncoming: 'Kelgan buyurtmalar',
    sActive: 'Faol', sHidden: 'Yashirilgan',
    sNoProducts: "Hali e'lon yo'q",
    sNoHidden: "Yashirilgan e'lon yo'q",
    sNoProductsSub: "Pastdagi tugma bilan birinchi e'loningizni qo'shing. Rasm Telegram bot orqali so'raladi.",
    sEdit: 'Tahrirlash', sHide: 'Yashirish', sShow: "Ko'rsatish",
    sNew: "Yangi e'lon", sEditTitle: "E'lonni tahrirlash",
    sStock: 'Zaxira', sStockUnlimited: 'cheksiz',
    sImgWaiting: "Botga rasm yuboring — e'lon rasmsiz katalogda ko'rinmaydi",
    sImgAdd: "Rasm qo'shish",
    sImgRequested: "Telegram botga o'ting — rasm so'raldi",
    sVidOn: 'Video qo’shilgan',
    sVidWaiting: 'Botga video yuboring — MP4, 30 soniyagacha',
    sVidAdd: "Video qo'shish",
    sVidReplace: 'Videoni almashtirish',
    sVidRequested: "Telegram botga o'ting — video so'raldi",
    stPublished: 'Katalogda', stPending: 'Moderatsiyada', stRejected: 'Rad etilgan', stDraft: 'Yashirilgan',
    sName: 'Nomi', sPrice: "Narxi (so'm)", sMoq: 'Minimal buyurtma',
    sWidth: 'Eni (masalan: 1.5 m)', sLen: 'Rulon uzunligi (masalan: 40 m)',
    sStockField: "Zaxira (bo'sh = cheksiz)", sType: 'Turi', sComp: 'Tarkibi',
    sFormHint: "Saqlangach e'lon moderatsiyaga yuboriladi va tekshiruvdan keyin katalogda ko'rinadi. Rasm Telegram bot orqali so'raladi.",
    sSave: 'Saqlash',
    sSaved: 'Saqlandi — moderatsiyaga yuborildi',
    sHiddenToast: 'Yashirildi', sShownToast: 'Moderatsiyaga yuborildi',
    sNeedName: 'Nomini kiriting', sNeedPrice: 'Narxini kiriting', sBadStock: "Zaxira noto'g'ri",
    sNoOrdersTab: "Bu bo'limda buyurtma yo'q",
    sTabNew: 'Yangi', sTabProgress: 'Jarayonda', sTabDone: 'Yakunlangan',
    sPrepaid: "Oldindan to'langan", sYourPart: 'Sizning ulushingiz',
    sPrepay: 'Oldindan', sRest: 'qolgani',
    sPickup: 'Yetkazish', sTracking: 'Kuzatuv',
    sAccept: 'Qabul qilish', sReject: 'Rad etish', sShip: "Jo'natdim",
    sTrackingPh: 'BTS kuzatuv raqami',
    sConfirmReject: "Buyurtma rad etilsinmi? Bu amalni qaytarib bo'lmaydi.",
    sNeedTracking: 'Kuzatuv raqamini kiriting',
    sAccepted: 'Qabul qilindi', sRejected: 'Rad etildi', sShipped: "Jo'natildi",
    sDispute: 'Xaridor murojaati',
    sDisputeMine: 'Sizning javobingiz',
    sDisputePh: "Nima bo'lganini tushuntiring",
    sDisputeSend: 'Javobni yuborish',
    sDisputeShort: 'Javob juda qisqa', sDisputeSent: 'Javob yuborildi',
    sExpired: 'Sessiya tugagan — qaytadan kiring',
    sForbidden: 'Bu amal uchun sotuvchi huquqi kerak',
    sFailed: 'Amal bajarilmadi',
    // ---- Footer ----
    fAbout: 'Biz haqimizda',
    fForUsers: 'Foydalanuvchilarga',
    fPoints: 'Topshirish punktlari',
    fProject: 'Loyiha haqida',
    fJobs: 'Vakansiyalar',
    fPartner: "Hamkor bo'lish",
    fFaq: 'Savol-Javob',
    fDelivery: "Yetkazish va to'lov",
    fLegal: 'Ommaviy oferta va maxfiylik',
    fQrTitle: 'Telegram botda xarid qilish qulayroq.',
    fQrSub: "Kamerani QR kodga yo'naltiring — LolaMarket boti ochiladi.",
    fSocial: 'LolaMarket ijtimoiy tarmoqlarda',
    // Bo'sh bo'limlar. ⚠️ Matn "tez orada" DEB VA'DA BERMAYDI — sana
    // aytilsa u tekshirilmagan da'vo bo'lardi (CLAUDE.md). Aytilayotgani
    // faqat shu: bu yerda nima bo'lishi va hozir kim javob berishi.
    fSoonTitle: "Bu bo'lim matni hali yozilmagan",
    fSoonAsk: 'Savolingiz bo\'lsa — bevosita bizga yozing, javob beramiz.',
    fAboutBody: "LolaMarket — O'zbekistondagi to'qima materiallar uchun B2B platforma: ishlab chiqaruvchi mato e'lonini qo'yadi, xaridor to'g'ridan-to'g'ri buyurtma beradi.",
    fJobsBody: "Jamoaga qo'shilmoqchi bo'lsangiz — Telegram orqali yozing, tajribangizni ko'ramiz.",
    fFaqBody: "Savollarga hozircha jonli javob beramiz — ro'yxat yig'ilgach shu yerga chiqadi.",
    fLegalBody: "Shartlarni hujjat tayyor bo'lgunicha bevosita so'rab olishingiz mumkin.",
    // Yetkazish matni RAQAMLARNI KODDAN oladi — qo'lda yozilsa stavka
    // o'zgargan kuni sahifa jimgina yolg'on gapirardi.
    fDeliveryPay: "To'lov ikki bosqichda: buyurtma berilganda {pct}%, qolgani matoni topshirish punktida olganingizda.",
    fDeliveryBts: 'Mato BTS Pochta orqali siz tanlagan topshirish punktiga boradi — uyga yetkazish yo\'q.',
    fDeliveryMore: "To'liq shartlar matni tayyorlanmoqda.",
    fPickPoint: 'Nuqtani tanlash',
  },
  ru: {
    searchPh: 'Ткань или производитель',
    clear: 'Очистить',
    priceFilterAria: 'Сортировка и фильтр по цене',
    login: 'Войти',
    profile: 'Профиль',
    favorites: 'Избранное',
    cart: 'Корзина',
    catalog: 'Каталог',
    priceLabel: 'Цена, сум / рулон',
    priceMin: 'От',
    priceMax: 'До',
    priceBad: 'Минимум не может быть больше максимума',
    sortTitle: 'Сортировка',
    sortRec: 'Рекомендуемые',
    sortNew: 'Сначала новые',
    sortAsc: 'От дешёвых → к дорогим',
    sortDesc: 'От дорогих → к дешёвым',
    sheetReset: 'Сбросить',
    sheetDone: 'Готово',
    close: 'Закрыть',
    nothingFound: 'Ничего не найдено',
    nothingFoundSub: 'Попробуйте другой запрос или измените фильтр.',
    catAll: 'Все',
    verifiedNote: '— производитель проверен LolaMarket',
    bTavsiya: 'Рекомендуем', bKamQoldi: 'Мало осталось', bHunarmand: 'Ремесленник', bYangi: 'Новинка',
    ad1t: 'Оживите ткани\nс помощью AI',
    ad1tag: 'Попробовать',
    ad1aria: 'Оживите ткани с помощью AI — перейти в каталог',
    ad2t: 'Принимаем\nзаказы 24/7',
    ad3t: 'Доставка —\nбесплатно',
    ad3tag: 'Первые 3 заказа',
    ad3aria: 'Бесплатная доставка — перейти в каталог',
    tgOrder: 'Заказывайте и через Telegram',
    catIkat: 'Икат и адрас',
    catSuzani: 'Сюзане',
    catSilk: 'Шёлк',
    catCotton: 'Хлопок',
    catWool: 'Шерсть',
    catLinen: 'Лён',
    stIn: 'В продаже', stLow: 'Мало осталось', stMade: 'Под заказ', stOut: 'Закончилось',
    product: 'Товар',
    unitPrice: 'Цена за рулон',
    unitPricePanel: 'Цена за панель',
    addToCart: 'В корзину',
    specWidth: 'Ширина', specWeight: 'Плотность', specComp: 'Состав',
    mediaPhoto: 'Фото', mediaVideo: 'Видео',
    mediaPrev: 'Назад', mediaNext: 'Вперёд',
    specLead: 'Срок поставки', specMoq: 'Минимальный заказ',
    specLen: 'Длина рулона',
    days: 'дн.', pcs: 'шт.',
    // ---- Bozor tadqiqoti funksiyalari (2026-09-05) ----
    sampleBtn: 'Запросить образец',
    sampleSent: 'Запрос отправлен — мы свяжемся с вами',
    sampleErr: 'Не удалось отправить запрос — попробуйте ещё раз',
    stockAlertBtn: 'Сообщить о поступлении',
    stockAlertOn: 'Сообщим — подписка принята',
    stockAlertErr: 'Не удалось подписаться — попробуйте ещё раз',
    needLoginFirst: 'Сначала войдите на сайт',
    reorderBtn: 'Повторить заказ',
    reorderDone: 'Товары добавлены в корзину',
    reorderNone: 'Ткани из этого заказа сейчас недоступны',
    revPhotoAdd: 'Прикрепить фото (по желанию)',
    revPhotoOn: 'Фото выбрано ✓',
    revPhotoBig: 'Фото слишком большое — до 4 МБ',
    reviews: 'Отзывы',
    noReviews: 'Пока нет отзывов',
    noReviewsSub: 'Отзыв может оставить только покупатель этой ткани.',
    reviewsCount: 'отз.',
    decrease: 'Уменьшить', increase: 'Увеличить',
    pdpBack: 'Вернуться в каталог',
    pdpDesc: 'Описание товара',
    pdpCat: 'Категория',
    pdpSimilar: 'Похожие ткани',
    pdpSeller: 'Производитель',
    pdpSellerMore: 'Другие ткани производителя',
    pdpVerified: 'Проверено LolaMarket',
    pdpSafe: 'Защищённая оплата',
    pdpSafeSub: 'Если ткань не подошла — оформляете обращение по заказу, деньги возвращаются.',
    pdpAllReviews: 'Смотреть все отзывы',
    pdpFavAdd: 'В избранное',
    pdpFavOn: 'В избранном',
    pdpNoSpecs: 'Производитель не добавил описание для этой ткани.',
    pdpCopyLink: 'Скопировать ссылку',
    pdpLinkCopied: 'Ссылка скопирована',
    pdpLinkCopyErr: 'Не удалось скопировать — скопируйте из адресной строки',
    total: 'Итого',
    order: 'Оформить заказ',
    checkout: 'Оформление заказа',
    sending: 'Отправляем…',
    send: 'Отправить',
    sendDispute: 'Отправить обращение',
    submitOrder: 'Отправить заказ',
    orderAccepted: 'Заказ принят',
    btsHint: 'Доставка через BTS Pochta — выберите удобный пункт выдачи.',
    myOrders: 'Мои заказы',
    myAddr: 'Мой адрес',
    myAddrNone: 'Постоянный пункт выдачи не выбран',
    myAddrHint: 'Выбранный пункт будет подставлен при оформлении заказа',
    myAddrPick: 'Выбрать на карте',
    myAddrChange: 'Изменить',
    myAddrSaved: 'Адрес сохранён',
    myAddrErr: 'Адрес не сохранён — попробуйте ещё раз',
    myAddrClose: 'Закрыть',
    workHoursL: 'Часы работы',
    mapApprox: 'Метка с точностью до центра района — уточните адрес в BTS',
    mapOff: 'Карта не загрузилась — выберите пункт из списка',
    mapLoading: 'Карта загружается…',
    pickSelect: 'Выбрать',
    contactT: 'Связаться с нами',
    contactCall: 'Позвонить',
    contactTg: 'Написать в Telegram',
    contactSub: 'Звонок или Telegram',
    contactTgWay: 'Через Telegram',
    phoneCopied: 'Номер скопирован — если звонок не открылся, наберите вручную',
    phoneCopyErr: 'Не удалось скопировать номер — скопируйте вручную',
    noOrders: 'Пока заказов нет. Выберите ткань в каталоге и оформите первый заказ.',
    ordersNone: 'Заказов пока нет',
    ordersCount: 'заказов',
    toProfile: 'Назад в профиль',
    logout: 'Выйти',
    loggedOut: 'Вы вышли из аккаунта',
    buyer: 'Покупатель',
    loading: 'Загрузка…',
    rateFabric: 'Оцените ткань',
    reviewThanks: 'Спасибо! Отзыв добавлен',
    problemTitle: 'Обращение по проблеме',
    aiTitle: 'AI-изображение одежды',
    aiSub: 'Рисуется по фото товара',
    aiGo: 'Нарисовать',
    aiLoginCta: 'Войдите, чтобы нарисовать',
    aiPicked: 'Выбрано {n} из {m}',
    aiWaitMsg: 'Чудо уже создаётся… ✨',
    aiNote: 'Представление AI — это не реальный товар',
    aiNoPhoto: 'У этого товара нет фото, поэтому изображение не построить',
    aiNoCredit: 'Остаток кредитов исчерпан — новое изображение не построить.',
    aiBadText: 'В тексте недопустимый символ — только буквы, цифры, запятая и дефис',
    aiBusy: 'Сервис AI сейчас перегружен. Кредит возвращён — попробуйте через несколько минут',
    aiBlocked: 'AI отказался рисовать по этому запросу. Кредит возвращён — попробуйте изменить ответы',
    aiNoAuth: 'Сессия истекла — войдите снова, чтобы нарисовать',
    aiError: 'Сейчас не удалось сгенерировать, попробуйте чуть позже',
    aiRetry: 'Повторить',
    aiAgain: 'Нарисовать иначе',
    aiShare: 'Поделиться',
    aiOtherCut: 'Другой фасон',
    aiOtherCutHint: 'Новый фасон — {n} credit',
    aiCreditsUnlimited: 'Lola credit: ∞ Безлимит',
    aiCreditsLeft: 'Осталось {n} credit · Одно изображение — {c} credit',
    aiTextQ: 'Что ещё добавить? (необязательно)',
    aiTextPh: 'например: золотые пуговицы, чёрный воротник',
    tgLogin: 'Вход через Telegram',
    tgLoginSub: 'Ни пароля, ни SMS. После входа все заказы будут в одном месте, а об изменении статуса придёт уведомление в Telegram.',
    tgPrivacy: 'Мы видим только ваше имя и ник в Telegram. Доступа к вашей переписке у нас нет.',
    tgConfirm: 'Подтвердите в Telegram',
    tgStart: '«Начать»',
    tgOpen: 'Открыть Telegram',
    cancel: 'Отмена',
    cancelShort: 'Отмена',
    backToCart: 'Вернуться в корзину',
    sellerReply: 'Ответ производителя:',
    refundLabel: 'К возврату:',
    disputeBtn: 'Обращение по проблеме',
    rateBtn: '★ Оценить',
    gotItBtn: '📦 Заказ получен',
    gotItAsk: 'Вы получили заказ? После подтверждения откроется оценка ткани.',
    gotItDone: 'Спасибо! Теперь можно оценить ткань',
    gotItErr: 'Не удалось отправить подтверждение',
    favEmpty: 'В избранном пусто',
    favEmptySub: 'Отмечайте понравившиеся ткани сердечком — они появятся здесь.',
    cartEmpty: 'Корзина пуста',
    cartEmptySub: 'Выберите ткань в каталоге — заказ оформляется здесь.',
    deliveryEst: 'Доставка (примерно)',
    payNow: 'К оплате сейчас',
    payLater: 'Когда ткань готова',
    deliveryNote: 'Доставка оплачивается напрямую в пункте BTS и не входит в сумму выше.',
    tgLoginHint: 'Войдите через Telegram',
    fName: 'Ваше имя *',
    fPhone: 'Телефон *',
    fPhoneHint: 'Мы свяжемся по этому номеру для подтверждения заказа.',
    fCompany: 'Компания',
    fBts: 'Пункт выдачи BTS *',
    btsPick: '— Выберите пункт —',
    fComment: 'Комментарий',
    orderDone: 'Ваш заказ принят',
    orderWord: 'Заказ',
    reviewPh: 'Кратко о качестве (необязательно)',
    coHintIn: 'Статус заказа придёт уведомлением в ваш Telegram — оплата сейчас не списывается.',
    coHintOut: 'Заказ придёт к нам через Telegram — оплата сейчас не списывается.',
    doneHintIn: 'Скоро свяжемся по указанному номеру. При изменении статуса придёт уведомление в Telegram.',
    doneHintOut: 'Скоро свяжемся по указанному номеру. Статус заказа можно отслеживать и через Telegram-бот.',
    openBot: 'Открыть бот',
    reviewHint: 'Только о купленной вами ткани — ваша оценка поможет другим покупателям.',
    disputeHint: 'Выберите проблему. После отправки бот попросит фото — доказательство ускорит решение модератора.',
    sCabinet: 'Кабинет продавца',
    sVerified: 'проверен',
    sMyProducts: 'Мои объявления',
    sOrders: 'Заказы',
    sIncoming: 'Входящие заказы',
    sActive: 'Активные', sHidden: 'Скрытые',
    sNoProducts: 'Пока нет объявлений',
    sNoHidden: 'Скрытых объявлений нет',
    sNoProductsSub: 'Добавьте первое объявление кнопкой ниже. Фото запросит Telegram-бот.',
    sEdit: 'Изменить', sHide: 'Скрыть', sShow: 'Показать',
    sNew: 'Новое объявление', sEditTitle: 'Редактирование объявления',
    sStock: 'Остаток', sStockUnlimited: 'без ограничений',
    sImgWaiting: 'Отправьте фото боту — без фото объявление не появится в каталоге',
    sImgAdd: 'Добавить фото',
    sImgRequested: 'Перейдите в Telegram-бот — фото запрошено',
    sVidOn: 'Видео добавлено',
    sVidWaiting: 'Отправьте видео боту — MP4, до 30 секунд',
    sVidAdd: 'Добавить видео',
    sVidReplace: 'Заменить видео',
    sVidRequested: 'Перейдите в Telegram-бот — видео запрошено',
    stPublished: 'В каталоге', stPending: 'На модерации', stRejected: 'Отклонено', stDraft: 'Скрыто',
    sName: 'Название', sPrice: 'Цена (сум)', sMoq: 'Минимальный заказ',
    sWidth: 'Ширина (напр.: 1.5 м)', sLen: 'Длина рулона (напр.: 40 м)',
    sStockField: 'Остаток (пусто = без ограничений)', sType: 'Тип', sComp: 'Состав',
    sFormHint: 'После сохранения объявление отправится на модерацию и появится в каталоге после проверки. Фото запросит Telegram-бот.',
    sSave: 'Сохранить',
    sSaved: 'Сохранено — отправлено на модерацию',
    sHiddenToast: 'Скрыто', sShownToast: 'Отправлено на модерацию',
    sNeedName: 'Введите название', sNeedPrice: 'Введите цену', sBadStock: 'Неверный остаток',
    sNoOrdersTab: 'В этом разделе заказов нет',
    sTabNew: 'Новые', sTabProgress: 'В работе', sTabDone: 'Завершённые',
    sPrepaid: 'Предоплачено', sYourPart: 'Ваша доля',
    sPrepay: 'Предоплата', sRest: 'остаток',
    sPickup: 'Доставка', sTracking: 'Трек-номер',
    sAccept: 'Принять', sReject: 'Отклонить', sShip: 'Отправлено',
    sTrackingPh: 'Трек-номер BTS',
    sConfirmReject: 'Отклонить заказ? Это действие нельзя отменить.',
    sNeedTracking: 'Введите трек-номер',
    sAccepted: 'Принято', sRejected: 'Отклонено', sShipped: 'Отправлено',
    sDispute: 'Обращение покупателя',
    sDisputeMine: 'Ваш ответ',
    sDisputePh: 'Объясните, что произошло',
    sDisputeSend: 'Отправить ответ',
    sDisputeShort: 'Ответ слишком короткий', sDisputeSent: 'Ответ отправлен',
    sExpired: 'Сессия истекла — войдите снова',
    sForbidden: 'Нужны права продавца',
    sFailed: 'Действие не выполнено',
    // ---- Footer ----
    fAbout: 'О нас',
    fForUsers: 'Пользователям',
    fPoints: 'Пункты выдачи',
    fProject: 'О проекте',
    fJobs: 'Вакансии',
    fPartner: 'Стать партнёром',
    fFaq: 'Вопрос-ответ',
    fDelivery: 'Доставка и оплата',
    fLegal: 'Оферта и конфиденциальность',
    fQrTitle: 'В Telegram-боте покупать удобнее.',
    fQrSub: 'Наведите камеру на QR-код — откроется бот LolaMarket.',
    fSocial: 'LolaMarket в соцсетях',
    fSoonTitle: 'Текст этого раздела ещё не написан',
    fSoonAsk: 'Есть вопрос — напишите нам напрямую, ответим.',
    fAboutBody: 'LolaMarket — B2B платформа для текстильных материалов в Узбекистане: производитель размещает ткань, покупатель заказывает напрямую.',
    fJobsBody: 'Хотите в команду — напишите в Telegram, посмотрим ваш опыт.',
    fFaqBody: 'Пока отвечаем на вопросы напрямую — список появится здесь, когда соберётся.',
    fLegalBody: 'До публикации документов условия можно уточнить напрямую.',
    fDeliveryPay: 'Оплата в два этапа: {pct}% при оформлении заказа, остальное — при получении ткани в пункте выдачи.',
    fDeliveryBts: 'Ткань едет через BTS Pochta в выбранный вами пункт выдачи — доставки до двери нет.',
    fDeliveryMore: 'Полный текст условий готовится.',
    fPickPoint: 'Выбрать пункт',
  },
};

/** Joriy til. `localStorage` da saqlanadi — qaytib kelgan foydalanuvchi
    tanlovini qayta qilmasin. Standart — o'zbekcha (HTML ham shunday). */
let LANG = (function () {
  try {
    const v = localStorage.getItem('lm_lang');
    return v === 'ru' ? 'ru' : 'uz';
  } catch (_) { return 'uz'; }
})();

/** Tarjima. Kalit topilmasa KALITNING O'ZI qaytadi — jimgina bo'sh joy
    qolgandan ko'ra ko'rinib turgani yaxshi (qorovul: Test 20). */
function t(k) {
  const tbl = STR[LANG] || STR.uz;
  return (tbl && tbl[k] !== undefined) ? tbl[k] : (STR.uz[k] !== undefined ? STR.uz[k] : k);
}

/** Bazadan kelgan `{uz, ru}` maydonidan joriy tilni oladi.
    ⚠️ Zaxira SHART — yuqoridagi izohga qara. */
function L(obj) {
  if (!obj || typeof obj !== 'object') return obj || '';
  return obj[LANG] || obj.uz || obj.ru || '';
}

/* Bitta tugma — ikki til. Uchinchi til qo'shilsa bu yerda ro'yxatga
   aylantiriladi; hozir esa tanlov oynasi ortiqcha bosish bo'lardi. */
function toggleLang() {
  setLang(LANG === 'ru' ? 'uz' : 'ru');
}

function setLang(v) {
  const yangi = v === 'ru' ? 'ru' : 'uz';
  if (yangi === LANG) return;
  LANG = yangi;
  try { localStorage.setItem('lm_lang', LANG); } catch (_) {}
  applyLang();
  // Ochiq oyna ham qayta chiziladi — aks holda til almashardi, oynadagi
  // matn esa eski tilda qolardi va sabab ko'rinmasdi.
  if (isOpen()) renderDrawer();
  // Katalog kartochkalari bazadan kelgan nom bilan qayta chiziladi
  if (catalogMeta) mergeCatalog(Object.keys(catalogMeta).map((k) => catalogMeta[k]));
  // Mahsulot sahifasi ham — u kartochkalardan nom oladi, ya'ni yuqoridagi
  // qatordan KEYIN chizilishi shart.
  if (pdpId) renderPdp();
}

/** `data-i18n` belgilangan hamma elementni joriy tilga keltiradi.
    Uch xil joy qoplanadi: matn, `placeholder` va `aria-label`. */
function applyLang() {
  document.documentElement.setAttribute('lang', LANG);
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    el.setAttribute('placeholder', t(el.dataset.i18nPh));
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  // Til tugmasi JORIY tilni ko'rsatadi (bosilsa ikkinchisiga o'tadi).
  // ⚠️ Bayroq emoji `aria-hidden` — ekran o'quvchi uni "Uzbekistan flag" deb
  // o'qib, yonidagi "UZ" bilan takrorlanmasin. Tugmaning o'z `aria-label`i
  // ikki tilda ("Til / Язык") va u O'ZGARMAYDI: u tugmaning VAZIFASINI
  // aytadi, joriy holatini emas.
  const tugma = document.getElementById('lang-toggle');
  if (tugma) {
    const bayroq = tugma.querySelector('.lang-flag');
    const kod = tugma.querySelector('.lang-code');
    if (bayroq) bayroq.textContent = LANG === 'ru' ? '🇷🇺' : '🇺🇿';
    if (kod) kod.textContent = LANG === 'ru' ? 'RU' : 'UZ';
  }
  refreshAuthUi();
  // Saralash chipi `t()` dan yozilgan — til almashganda u ham yangilansin.
  // ⚠️ Birinchi chaqiruv (pastda, sahifa ochilganda) `sortKey`/`priceMin`
  // e'lonidan KEYIN turadi — undan oldinga ko'chirilsa `let` TDZ xatosi.
  paintPriceState();
}

/* ── data-action delegatsiyasi ──
   HTML'dagi onclick="fn(...)" o'rniga data-action/data-arg ishlatiladi —
   funksiyalar qachon e'lon qilinishidan qat'i nazar ishlaydi (delegatsiya
   qo'shilgan payt emas, bosilgan payt chaqiriladi). */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) {
    // Kartochkaning bo'sh joyiga bosilsa mahsulot detali ochiladi. Tugmalar
    // (savat, yurakcha) yuqoridagi `closest` da ushlanadi va bu yergacha
    // yetib kelmaydi — ya'ni ular avvalgidek ishlayveradi.
    const card = e.target.closest('.product-card');
    if (card && card.dataset.id) openDetail(card.dataset.id);
    return;
  }
  const action = el.dataset.action;
  const arg = el.dataset.arg;

  if (action === 'reloadHome') {
    e.preventDefault();
    location.reload();
    return;
  }

  const fn = window[action];
  if (typeof fn !== 'function') return;
  if (arg === undefined) { fn(); return; }
  // Raqamli arg (masalan adGo'dagi banner indeksi) satr emas, son bo'lishi kerak
  fn(/^-?\d+$/.test(arg) ? Number(arg) : arg);
});

/* Forma yuborish uchun alohida qatlam: `submit` `click` emas, ya'ni yuqoridagi
   tinglovchi uni ko'rmaydi. Funksiya HODISANING O'ZINI oladi — `submitOrder`
   ichida `preventDefault()` chaqiriladi, aks holda sahifa qayta yuklanardi. */
document.addEventListener('submit', (e) => {
  const form = e.target.closest('[data-submit]');
  if (!form) return;
  const fn = window[form.dataset.submit];
  if (typeof fn === 'function') fn(e);
});

/* Enter bosilishi — uchinchi qatlam. `keydown` ham `click` emas, ya'ni yuqoridagi
   tinglovchilarning hech biri uni ko'rmaydi. Narx filtrining ikkala maydonida
   ilgari `onkeydown="if(event.key==='Enter')applyPrice()"` turardi va u C1
   supurishidan O'TIB KETGAN edi — o'sha qidiruv faqat click/input/change/submit/
   error hodisalarini sanagan, ya'ni "hammasini qamradim" degan xulosa qidiruv
   ro'yxati qanchalik to'liq bo'lsa shunchalik to'g'ri bo'lgan. Endi qamrovni
   hodisa nomlari ro'yxati emas, Test 15 belgilaydi. */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const el = e.target.closest('[data-enter]');
  if (!el) return;
  const fn = window[el.dataset.enter];
  if (typeof fn === 'function') fn();
});

/* ── Page loader ──
   DIQQAT: bu yerda ilgari `window.addEventListener('load', ...)` turardi.
   `load` hodisasi BARCHA rasm/shrift yuklanib bo'lgandan keyin otiladi, loader
   esa `position: fixed; inset: 0` bilan butun sahifani yopib turadi — ya'ni
   foydalanuvchi hero rasmi (300 KB) va uchinchi domendagi skript tugagunicha
   faqat spinner ko'rardi. Sekin mobil internetda bu 3 soniyadan oshib ketardi.
   Endi DOM tayyor bo'lishi kifoya: tarkib chizilgan, rasmlar o'z navbatida
   kelaveradi. (Xuddi shu tuzoq `pwa.js`da ham bor edi — commit 5ffe1f0.) */
function hidePageLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  loader.classList.add('hide');
  loader.addEventListener('transitionend', () => loader.remove(), { once: true });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', hidePageLoader, { once: true });
} else {
  // `defer` skript shu holatda ishga tushadi (readyState === 'interactive')
  hidePageLoader();
}

/* ── Telegram Mini App init ── */
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
}

/* ── Scroll fade-up ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = (i * 0.06) + 's';
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ====================================================
   REKLAMA BANNERI — karusel (Mini App bilan bir xil naqsh, 2026-08-16)

   Ilgari slaydlar ustma-ust turib `opacity` bilan almashardi va barmoq bilan
   surish QO'LDA hisoblanardi (`touchstart`/`touchend` orasidagi masofa). Endi
   slaydlar yonma-yon yotadi va surishni BRAUZERNING O'ZI qiladi (`overflow-x`
   + `scroll-snap`, `style.css` → `.ad-banner`): barmoq ortidan yuradi,
   inersiyasi bor. Ya'ni qo'l bilan yozilgan surish kodi ortiqcha bo'lib
   qoldi va o'chirildi.

   Cheksiz aylanish uchun ikki chetga KLON qo'yiladi: [oxirgi, 1, 2, 3,
   birinchi]. Foydalanuvchi klonga yetganda `adSettle()` uni sezdirmasdan
   haqiqiy nusxaga "sakratadi" — mazmun bir xil, ko'z ilg'amaydi.
   Klonlar HTML da emas, shu yerda yasaladi: `index.html` da uchta slayd
   qoladi, ya'ni bir xil matn manbada uch marta emas, bir marta yoziladi
   (JS ishlamasa ham banner o'qiladigan holda qoladi, faqat aylanmaydi).
   ==================================================== */

const adBanner = document.getElementById('ad-banner');
const AD_DELAY = 5000;

let adIndex = 0;    // KO'RINIB turgan HAQIQIY slayd (0..adCount-1)
let adCount = 0;    // haqiqiy slaydlar soni — klonlar bunga kirmaydi
let adTimer = null;
let adPaused = false;

/* ⚠️ `behavior: 'smooth'` FAQAT brauzer uni bilganda beriladi. Sabab
   `mountPdMedia` da o'lchangan (2026-08-13): qo'llab-quvvatlanmagan muhitda
   so'rov JIMGINA yutiladi — u yerda nuqta o'lik tugmaga aylanardi, bu yerda
   esa karusel umuman almashmay qolardi va buni hech narsa ko'rsatmasdi.
   `scrollBehavior` CSS xususiyati borligi `scrollTo` ning `behavior` ni
   bilishini bildiradi; yo'q bo'lsa to'g'ridan-to'g'ri qiymat beriladi —
   silliq emas, lekin ISHLAYDI. */
const AD_SMOOTH = 'scrollBehavior' in document.documentElement.style;

/* Slaydning skrollerdagi snap nuqtasi. `k` — mantiqiy o'rin (−1 = oxirgi
   klon, 0..n−1 haqiqiy, n = birinchi klon), DOM dagi element esa `k + 1`.
   `offsetLeft` skrollerning chetidan o'lchanadi (`.ad-banner` `position:
   relative`), snap chizig'i esa `scroll-padding` da — shuning uchun
   `paddingLeft` ayiriladi. */
function adPos(k) {
  const slide = adBanner.children[k + 1];
  if (!slide) return 0;
  const pad = parseFloat(getComputedStyle(adBanner).paddingLeft) || 0;
  return slide.offsetLeft - pad;
}

function adScrollTo(k, smooth) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const left = adPos(k);
  if (smooth && AD_SMOOTH && !reduce) adBanner.scrollTo({ left, behavior: 'smooth' });
  else adBanner.scrollLeft = left;
}

/* Skroll to'xtaganda chaqiriladi: qaysi slaydda turganimizni HISOBLAYDI va
   klonda to'xtagan bo'lsak haqiqiy nusxaga sakraydi. */
function adSettle() {
  const step = adPos(1) - adPos(0);      // slayd eni + oraliq
  if (!step) return;
  const k = Math.round(adBanner.scrollLeft / step) - 1;
  if (k >= adCount) { adScrollTo(0, false); adIndex = 0; }
  else if (k < 0) { adScrollTo(adCount - 1, false); adIndex = adCount - 1; }
  else adIndex = k;
}

function adStart() {
  if (adTimer) clearInterval(adTimer);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  adTimer = setInterval(() => {
    // Sichqoncha ustida, fokusda, barmoq tekkanda yoki tab ko'rinmay
    // qolganda — turaveradi: o'qilayotgan slayd ko'z oldidan qochmasin.
    if (adPaused || document.hidden) return;
    adScrollTo(adIndex + 1, true);       // `adCount` bo'lsa klon — `adSettle` qaytaradi
  }, AD_DELAY);
}

/* Banner bosilganda boradigan joy (`data-action` orqali chaqiriladi).
   ⚠️ Uchala slayd ham KATALOGGA olib boradi va bu Mini App'dan farq qiladi:
   u yerda 1-slayd `tab('ai')` ga tushadi, saytda esa AI ekrani YO'Q — AI
   bloki har mahsulotning o'z sahifasida yashaydi (`aiSection`, `pdpHtml`
   ichida). Ya'ni saytda AI ga yagona yo'l mato tanlashdan o'tadi va banner
   aynan o'sha qadamga olib boradi. Havolani "AI ochiladi" deb ko'rsatish
   soxta tugma bo'lardi.
   ⚠️ Ilgari shu yerda `adGoCat(cat)` ham turardi (kategoriya chipini bosib,
   keyin katalogga tushardi) — u faqat eski "ipak kolleksiya" slaydi uchun
   edi va o'sha slayd bilan birga o'chdi. */
function adGoCatalog() {
  document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function mountAdBanner() {
  if (!adBanner) return;
  const slaydlar = [...adBanner.querySelectorAll('.ad-slide')];
  adCount = slaydlar.length;
  if (adCount < 2) return;

  // Klon ekran o'quvchisiga ko'rinmaydi va Tab bilan tanlanmaydi — aks holda
  // bir xil sarlavha ikki marta o'qilardi va Tab bir joyda ikki marta to'xtardi.
  const bosh = slaydlar[0].cloneNode(true);
  const oxir = slaydlar[adCount - 1].cloneNode(true);
  for (const klon of [bosh, oxir]) {
    klon.setAttribute('aria-hidden', 'true');
    klon.querySelectorAll('.ad-hit').forEach((h) => { h.tabIndex = -1; });
  }
  adBanner.append(bosh);
  adBanner.prepend(oxir);

  adIndex = 0;
  adScrollTo(0, false);          // birinchi HAQIQIY slayd, klon emas
  adStart();

  // ⚠️ `scrollend` ISHLATILMAYDI — hamma brauzerda yo'q (Mini App tomonida
  // sabab iOS WebView edi). O'rniga `scroll` + 120 ms tinchlik = "to'xtadi".
  let settleT = null;
  adBanner.addEventListener('scroll', () => {
    clearTimeout(settleT);
    settleT = setTimeout(adSettle, 120);
  }, { passive: true });

  adBanner.addEventListener('mouseenter', () => { adPaused = true; });
  adBanner.addEventListener('mouseleave', () => { adPaused = false; });
  adBanner.addEventListener('focusin', () => { adPaused = true; });
  adBanner.addEventListener('focusout', () => { adPaused = false; });
  adBanner.addEventListener('touchstart', () => { adPaused = true; }, { passive: true });
  adBanner.addEventListener('touchend', () => { adPaused = false; }, { passive: true });
}

// `script.js` `defer` bilan yuklanadi, ya'ni bu yerga yetganda DOM tayyor.
// ⚠️ `window.addEventListener('load', ...)` ISHLATILMAYDI: u BARCHA rasm
// yuklangandan keyin otiladi va sekin tarmoqda banner soniyalab qotib turardi.
mountAdBanner();

/* ====================================================
   QIDIRUV VA FILTRLASH
   Kategoriya va qidiruv birgalikda qo'llanadi.
   ==================================================== */

const chipsWrap = document.getElementById('chips');
const grid = document.getElementById('product-grid');

let activeCat = 'all';
let searchQ = '';
// Narx oralig'i filtri — null = o'sha tomon cheklanmagan (Mini App'dagi
// `inPriceRange` bilan bir xil qoida)
let priceMin = null;
let priceMax = null;

function applyFilter() {
  if (!grid) return;
  const q = searchQ.trim().toLowerCase();
  let shown = 0;

  grid.querySelectorAll('.product-card').forEach((card) => {
    const okCat = activeCat === 'all' || card.dataset.cat === activeCat;
    const okQ = !q
      || (card.dataset.name || '').toLowerCase().indexOf(q) !== -1
      || (card.dataset.supplier || '').toLowerCase().indexOf(q) !== -1;
    const ok = okCat && okQ && okPrice(card);
    card.classList.toggle('is-hidden', !ok);
    if (ok) shown++;
  });

  const empty = document.getElementById('no-result');
  if (empty) empty.hidden = shown > 0;
}

/* ====================================================
   NARX ORALIG'I FILTRI

   Narx kartochkaning `data-price` atributidan o'qiladi — JS'da mahsulotlar
   ro'yxati takrorlanmaydi (index.html bitta manba).
   ==================================================== */

function okPrice(card) {
  if (priceMin === null && priceMax === null) return true;
  const v = Number(card.dataset.price);
  // Narxi noma'lum mahsulot filtr yoqilganda ko'rsatilmaydi — uni "arzon"
  // deb ko'rsatish xaridorni chalg'itadi
  if (!Number.isFinite(v)) return false;
  if (priceMin !== null && v < priceMin) return false;
  if (priceMax !== null && v > priceMax) return false;
  return true;
}

// "700 000" ham, "700000" ham qabul qilinadi; bo'sh = chegara yo'q
function parsePriceInput(v) {
  const digits = String(v).replace(/\D/g, '');
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

function somGroup(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

/* ====================================================
   SARALASH (2026-08-17)

   Referens — Shop ilovasining "Sort by" varag'i: Recommended · Newest ·
   Lowest → Highest Price · Highest → Lowest Price, pastda Reset · Done.
   Bizda: `rec` — katalogning o'z tartibi (HTML/`sort_order`, ya'ni
   sotuvchi/adminning "tavsiya" tartibi), `new` — "Yangi" belgili
   mahsulotlar oldinda (`/api/products` `created_at` QAYTARMAYDI, shuning
   uchun boshqa manba yo'q — o'ylab topilmaydi), `asc`/`desc` — narx.

   Tartib CSS `order` bilan beriladi, DOM ko'chirilmaydi: kartochkalar
   ustidagi kuzatuvchilar (`fade-up`), savat/saralangan tugmalari va
   `productEl()` qidiruvi tegilmaydi. `rec` da `order` bo'shatiladi —
   HTML tartibi o'z-o'zidan qaytadi.
   ==================================================== */
const SORT_KEYS = ['rec', 'new', 'asc', 'desc'];
let sortKey = 'rec';

function cardIsNew(card) {
  const b = card.querySelector('.badge-pill');
  if (!b) return false;
  return b.dataset.badgeKey === 'bYangi' || b.textContent.trim() === BADGE_UZ.bYangi;
}

function applySort() {
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.product-card'));
  if (sortKey === 'rec') { cards.forEach((c) => { c.style.order = ''; }); return; }

  const idx = cards.map((card, i) => {
    const price = Number(card.dataset.price);
    const p = Number.isFinite(price) ? price : null;
    const c = Number(card.dataset.created);
    return { card, i, p, c: Number.isFinite(c) ? c : null, isNew: cardIsNew(card) };
  });

  /* «Eng yangi» — HAQIQIY sana bo'yicha (`products.created_at`, serverdan
     `createdAt` bo'lib keladi). Ilgari u «Yangi» YORLIG'I bo'yicha edi, ya'ni
     tugma o'z nomini bajarmasdi: yorliq qo'lda qo'yiladi va sanaga bog'liq
     emas.
     ⚠️ Zaxira ATAYLAB qoldirilgan: statik fayllar CI bilan avtomatik
     chiqadi, backend esa QO'LDA ko'tariladi — ya'ni oraliqda yangi sayt eski
     serverdan javob olishi mumkin va u paytda `createdAt` UMUMAN kelmaydi.
     O'shanda saralash buzilmaydi, eski (yorliq) usuliga qaytadi.
     Qaror BUTUN ro'yxat bo'yicha qabul qilinadi, juftlik bo'yicha emas —
     aks holda taqqoslash tranzitivligi buzilib, tartib tasodifiy bo'lardi. */
  const sanaBor = idx.some((x) => x.c !== null);

  idx.sort((a, b) => {
    if (sortKey === 'new') {
      if (!sanaBor) return (b.isNew - a.isNew) || (a.i - b.i);
      // Sanasi yo'q kartochka OXIRIDA — u "eng yangi" ham, "eng eski" ham emas
      if (a.c === null && b.c === null) return a.i - b.i;
      if (a.c === null) return 1;
      if (b.c === null) return -1;
      return (b.c - a.c) || (a.i - b.i);
    }
    // Narxi noma'lum kartochka ikkala yo'nalishda ham OXIRIDA — u "eng
    // arzon" ham, "eng qimmat" ham emas.
    if (a.p === null && b.p === null) return a.i - b.i;
    if (a.p === null) return 1;
    if (b.p === null) return -1;
    return (sortKey === 'asc' ? a.p - b.p : b.p - a.p) || (a.i - b.i);
  });
  idx.forEach((x, n) => { x.card.style.order = String(n + 1); });
}

function sortLabel(key) {
  return { rec: t('sortRec'), new: t('sortNew'), asc: t('sortAsc'), desc: t('sortDesc') }[key] || '';
}

function clearSort() {
  sortKey = 'rec';
  applySort();
  paintPriceState();
}

/* ── Varaq (bottom-sheet): ochish / yopish / qo'llash ──
   Varaq — QORALAMA: radio va inputlar unda o'zgaradi, katalog esa faqat
   "Tayyor" bosilganda yangilanadi (Mini App'dagi narx varag'i bilan bitta
   qoida — yozayotganda ro'yxat har harfda sakramaydi). Ochilganda qoralama
   qo'llangan holatdan to'ldiriladi, ya'ni yopib qaytganda o'zgartirilmagan
   tanlov ko'rinadi. */
function openSortSheet() {
  const sh = document.getElementById('sort-sheet');
  const s = document.getElementById('sort-scrim');
  if (!sh || !s) return;
  const radio = sh.querySelector(`input[name="sort"][value="${sortKey}"]`);
  if (radio) radio.checked = true;
  const lo = document.getElementById('price-min');
  const hi = document.getElementById('price-max');
  if (lo) lo.value = priceMin === null ? '' : somGroup(priceMin);
  if (hi) hi.value = priceMax === null ? '' : somGroup(priceMax);
  const err = document.getElementById('price-err');
  if (err) err.textContent = '';

  s.hidden = false;
  requestAnimationFrame(() => s.classList.add('show'));
  sh.classList.add('open');
  sh.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  paintFilterBtn();
}

function closeSortSheet() {
  const sh = document.getElementById('sort-sheet');
  const s = document.getElementById('sort-scrim');
  if (!sh || !s) return;
  sh.classList.remove('open');
  sh.setAttribute('aria-hidden', 'true');
  s.classList.remove('show');
  setTimeout(() => { s.hidden = true; }, 240);
  document.body.style.overflow = '';
  paintFilterBtn();
}

function sortSheetOpen() {
  return !!document.getElementById('sort-sheet')?.classList.contains('open');
}

// "Tayyor" — qoralamani qo'llaydi va yopadi
function applySortSheet() {
  const lo = parsePriceInput(document.getElementById('price-min')?.value ?? '');
  const hi = parsePriceInput(document.getElementById('price-max')?.value ?? '');
  const err = document.getElementById('price-err');

  if (lo !== null && hi !== null && lo > hi) {
    if (err) err.textContent = t('priceBad');
    return;
  }
  if (err) err.textContent = '';

  const picked = document.querySelector('#sort-sheet input[name="sort"]:checked')?.value;
  sortKey = SORT_KEYS.includes(picked) ? picked : 'rec';
  priceMin = lo;
  priceMax = hi;
  applyFilter();
  applySort();
  paintPriceState();
  closeSortSheet();
}

// "Tozalash" — hammasini boshlang'ich holatga qaytaradi va yopadi
// (Mini App'dagi `clearPriceFilter` bilan bitta xulq).
function resetSortSheet() {
  sortKey = 'rec';
  priceMin = null;
  priceMax = null;
  applyFilter();
  applySort();
  paintPriceState();
  closeSortSheet();
}

// Chipdagi × — faqat narxni olib tashlaydi (saralash qoladi)
function clearPrice() {
  priceMin = null;
  priceMax = null;
  applyFilter();
  paintPriceState();
}

// Tugmaning holati: varaq ochiq YOKI biror filtr/saralash yoqilgan bo'lsa
// yoniq ko'rinadi.
function paintFilterBtn() {
  const btn = document.getElementById('filter-btn');
  if (!btn) return;
  const ochiq = sortSheetOpen();
  btn.classList.toggle('is-on', ochiq || priceMin !== null || priceMax !== null || sortKey !== 'rec');
  btn.setAttribute('aria-expanded', ochiq ? 'true' : 'false');
}

/* Faol holat chiplari (chiplar ostida): narx oralig'i + saralash.
   Bittasi ham yo'q bo'lsa blok umuman ko'rinmaydi; bor bo'lsa blok
   MAJBURAN ochiladi — varaq yopiq turganda xaridor natijalar nega
   kamayganini yoki tartib nega boshqacha ekanini ko'rishi kerak
   ("jimgina yolg'on" oilasidan: filtr ishlab turibdi, izi esa yo'q). */
function paintPriceState() {
  const box = document.getElementById('price-filter');
  const chip = document.getElementById('price-chip');
  const label = document.getElementById('price-chip-label');
  const sChip = document.getElementById('sort-chip');
  const sLabel = document.getElementById('sort-chip-label');
  paintFilterBtn();
  if (!box || !chip || !label) return;

  const priceOn = priceMin !== null || priceMax !== null;
  const sortOn = sortKey !== 'rec';

  if (priceOn) {
    if (priceMin !== null && priceMax !== null) {
      label.textContent = `${somGroup(priceMin)} – ${somGroup(priceMax)} so'm`;
    } else if (priceMin !== null) {
      label.textContent = `${somGroup(priceMin)} so'mdan yuqori`;
    } else {
      label.textContent = `${somGroup(priceMax)} so'mgacha`;
    }
  }
  chip.hidden = !priceOn;

  if (sChip && sLabel) {
    if (sortOn) sLabel.textContent = sortLabel(sortKey);
    sChip.hidden = !sortOn;
  }

  box.hidden = !(priceOn || sortOn);
}

if (chipsWrap) {
  chipsWrap.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    chipsWrap.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
    activeCat = chip.dataset.cat;
    applyFilter();
  });
}

/* ⚠️ Tozalash (×) tugmasi DOIM turadi — founder qarori 2026-08-17
   («x turaversin»). Ilgari bu yerda `x.hidden = !v` turardi va HTML'da ham
   `hidden` atributi bor edi, lekin `.search-x { display: flex }` ikkalasini
   ham BEKOR QILARDI — ya'ni kod «yashiraman» deb turib hech qachon
   yashirmasdi. Ko'rinish to'g'ri edi, KOD yolg'on gapirardi: keyingi odam
   uni «tuzatib» `[hidden]` qatorini qo'shsa, founder qarori jimgina bekor
   bo'lardi (Test 45 shu tekshiruvda topdi). */
function onSearch(v) {
  searchQ = v;
  applyFilter();
}

function clearSearch() {
  const inp = document.getElementById('search-inp');
  if (inp) inp.value = '';
  onSearch('');
  inp?.focus();
}

/* ── `input` delegatsiyasi ──
   Yuqoridagi delegatsiya faqat `click` ni ushlaydi. `input` alohida hodisa,
   shuning uchun o'z tinglovchisi bor. Nima uchun to'g'ridan-to'g'ri
   `addEventListener` emas: sharh matni maydoni DINAMIK chiziladi (oyna har
   ochilganda qaytadan), ya'ni bir marta biriktirilgan tinglovchi keyingi
   nusxada yo'q bo'lardi. `data-input` qiymati — global funksiya nomi,
   unga maydon qiymati uzatiladi.

   ⚠️ IKKINCHI argument — `data-arg` (2026-08-13). Maydon QAYSI narsaga
   tegishli ekanini bilish kerak bo'lgan joy paydo bo'ldi: AI erkin matni
   mahsulotga bog'langan (`setAiText(qiymat, productId)`). Mini App
   delegatsiyasi buni ALLAQACHON shunday qiladi, ya'ni bu yerda yangi
   konvensiya emas — ikki yuza o'rtasidagi FARQ yopildi.
   Farq jimgina zarar keltirgan edi: `data-arg` uzatilmagani uchun matn
   `aiText[undefined]` ga yozilardi va xaridor yozgan izoh so'rovga UMUMAN
   tushmasdi — konsolda xato yo'q, tugma ishlaydi, natija esa boshqa.
   Bitta argument oladigan eski chaqiruvlar (`onSearch`, `onReviewBody`,
   `onDisputeComment`) ortiqcha argumentni shunchaki e'tiborsiz qoldiradi. */
document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-input]');
  if (!el) return;
  const fn = window[el.dataset.input];
  if (typeof fn === 'function') fn(e.target.value, el.dataset.arg);
});

/* ── `change` delegatsiyasi ──
   `<select>` uchun. Zamonaviy brauzerlar tanlovda `input` ni ham otadi,
   ya'ni yuqoridagi qatlam KO'PINCHA yetardi — lekin `change` bu element
   uchun kanonik hodisa va hamma joyda otiladi. BTS nuqtasi buyurtmaning
   yetkazish manzili, ya'ni "ko'pincha ishlaydi" yetarli emas. */
document.addEventListener('change', (e) => {
  const el = e.target.closest('[data-change]');
  if (!el) return;
  const fn = window[el.dataset.change];
  if (typeof fn === 'function') fn(e.target.value);
});

/* ====================================================
   TELEGRAM ORQALI KIRISH

   Nega deep-link (bir martalik kod), Login Widget emas:
     * widget BotFather'da domen sozlashni talab qiladi va ba'zi ichki
       brauzerlarda (Instagram, Telegram) ochilmaydi;
     * deep-link telefonda bir bosishda ishlaydi — Telegram ochiladi,
       "Boshlash" bosiladi, sayt esa tasdiqni kutib turadi.

   Telegram ID brauzerda HECH QACHON yasalmaydi: uni Telegram to'g'ridan-to'g'ri
   bot webhook'iga yuboradi. Sessiya HttpOnly cookie'da — bu yerdagi JS uni
   o'qiy olmaydi, faqat so'rovlar bilan birga ketadi.
   ==================================================== */

/** Kirgan foydalanuvchi: { name, username, phone, role } yoki null */
let me = null;
/** 'idle' | 'waiting' | 'error' */
let loginState = 'idle';
let loginErr = '';
let loginSession = null;   // { code, verifier, url }
let loginTimer = null;
let loginDeadline = 0;
/** Kirishdan keyin qaytadigan ko'rinish — checkout'dan kirilganda kerak */
let afterLoginView = null;
/** null — hali yuklanmoqda, [] — buyurtma yo'q */
let myOrders = null;

function apiJson(path, opts) {
  return fetch(path, Object.assign({ credentials: 'same-origin' }, opts || {}))
    .then((r) => r.json().catch(() => null));
}

// ============ TRAFIK O'LCHOVI (2026-08-18) ============
// Qaysi ekran ochilgani va qaysi mato ko'rilgani serverga yoziladi
// (`POST /api/track` → `traffic_events`, db/028). Panelda shundan
// "eng ko'p ko'rilgan mato" va "ko'rish → savat → buyurtma" chiqadi.
//
// ⚠️ `credentials: 'omit'` — ATAYLAB, `apiJson` dan farqi shu. Beacon
// kimlikni bilishi SHART EMAS, ya'ni cookie ham yubormasin: shunda
// "bu endpoint kimligingizni yozmaydi" degan gap kod bilan TASDIQLANADI,
// va'da bo'lib qolmaydi.
//
// ⚠️ `keepalive: true` — sahifa yopilayotganda ham so'rov yetib boradi.
// Busiz oxirgi ko'rish (odam matoni ochib, keyin chiqib ketsa) yo'qolardi
// va bu aynan eng qiziq hodisa.
//
// ⚠️ Xato JIM yutiladi va bu YAGONA joy: o'lchov vositasi o'lchayotgan
// narsani sindirmasin. Server tomonda esa xato KO'RINADI (`console.error`
// → alert), ya'ni nosozlik ko'zdan qolmaydi.
const TRACK_SRC = (new URLSearchParams(location.search).get('src') || '').slice(0, 32);
let trackOxirgi = '';

function track(kind, screen, product) {
  // Bir xil ko'rinish qayta chizilsa (savatda son o'zgardi, sharh keldi)
  // BU YANGI KO'RISH EMAS. Shusiz raqam qayta chizish soniga aylanib,
  // eng ko'p tahrirlangan ekran eng ommabop bo'lib ko'rinardi.
  const kalit = `${kind}|${screen}|${product || ''}`;
  if (kind === 'view') {
    if (kalit === trackOxirgi) return;
    trackOxirgi = kalit;
  }
  try {
    fetch('/api/track', {
      method: 'POST',
      // 2026-08-23: cookie YUBORILADI — kirgan xaridorning ko'rish/savat
      // amali shaxsiy lentaga (db/029) ism bilan tushsin (founder qarori).
      // Trafik sonining o'zi hamon anonim (`traffic_events`, serverda).
      credentials: 'same-origin',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind,
        screen,
        product: product || null,
        face: 'web',
        // Tashqi havola — serverda faqat HOSTi saqlanadi (db/028).
        ref: document.referrer || null,
        src: TRACK_SRC || null,
      }),
    }).catch(() => {});
  } catch (e) { /* eski brauzer — o'lchov yo'q, sayt ishlayveradi */ }
}

function onLogin() {
  if (me) {
    drawerView = 'profile';
    loadMyOrders();
  } else {
    drawerView = 'login';
    loginState = 'idle';
    loginErr = '';
  }
  renderDrawer();
  openDrawerEl();
}

function startLogin() {
  // Oyna BOSILGAN ZAHOTI ochiladi — so'rovdan keyin ochilsa brauzer uni
  // popup deb bloklaydi. Manzil javob kelgach qo'yiladi.
  const win = window.open('', '_blank');
  loginState = 'waiting';
  loginErr = '';
  loginSession = null;
  renderDrawer();

  apiJson('/api/auth/web/start', { method: 'POST' })
    .then((d) => {
      if (!d || !d.ok || !d.url) throw new Error('start');
      loginSession = d;
      loginDeadline = Date.now() + (d.expiresIn || 600) * 1000;
      if (win && !win.closed) win.location.href = d.url;
      renderDrawer();   // havola tugmasi ko'rinsin (oyna bloklangan bo'lsa ham)
      pollLogin();
    })
    .catch(() => {
      if (win && !win.closed) win.close();
      loginState = 'error';
      loginErr = "Ulanib bo'lmadi. Internetni tekshiring va qaytadan urinib ko'ring.";
      renderDrawer();
    });
}

/** Navbatdagi so'rovni 2 soniyadan keyin rejalashtiradi */
function pollLogin() {
  clearTimeout(loginTimer);
  loginTimer = setTimeout(pollLoginNow, 2000);
}

function pollLoginNow() {
  clearTimeout(loginTimer);
  if (loginState !== 'waiting' || !loginSession) return;
  if (Date.now() > loginDeadline) {
    loginState = 'error';
    loginErr = "Kod muddati tugadi — qaytadan urinib ko'ring.";
    loginSession = null;
    renderDrawer();
    return;
  }
  const q = `code=${encodeURIComponent(loginSession.code)}&verifier=${encodeURIComponent(loginSession.verifier)}`;
  apiJson('/api/auth/web/poll?' + q)
    .then((d) => {
      if (d && d.status === 'confirmed') return onLoggedIn(d.user);
      if (d && d.status === 'expired') {
        loginState = 'error';
        loginErr = "Kod muddati tugadi — qaytadan urinib ko'ring.";
        loginSession = null;
        renderDrawer();
        return;
      }
      pollLogin();
    })
    .catch(() => pollLogin());
}

function cancelLogin() {
  clearTimeout(loginTimer);
  loginState = 'idle';
  loginSession = null;
  renderDrawer();
}

function onLoggedIn(user) {
  clearTimeout(loginTimer);
  me = user || null;
  loginState = 'idle';
  loginSession = null;
  refreshAuthUi();
  showToast(me && me.name ? `Xush kelibsiz, ${firstName(me.name)}!` : 'Kirdingiz');
  loadAiCredits();
  loadSellerMe();
  // Checkout'dan kirgan bo'lsa — formaga qaytamiz, savat yo'qolmaydi
  if (afterLoginView === 'checkout' && cartCount()) {
    afterLoginView = null;
    drawerView = 'checkout';
    renderDrawer();
    return;
  }
  // AI blokidan kirgan bo'lsa — AYNI mahsulotga qaytamiz, aks holda xaridor
  // profilga tushib qolib, qaysi matoni ko'rayotganini qaytadan qidirardi.
  // Mahsulot sahifasi kirish oynasi ortida OCHIQ turgan edi, ya'ni uni
  // qaytadan ochish emas, ustidagi oynani yopish kifoya.
  if (afterLoginView === 'detail' && pdpId && product(pdpId)) {
    afterLoginView = null;
    if (isOpen()) closeCart();
    renderPdp();
    return;
  }
  afterLoginView = null;
  drawerView = 'profile';
  renderDrawer();
  // Telegram'dan qaytgan foydalanuvchi natijani darhol ko'rsin
  if (!isOpen()) openDrawerEl();
  loadMyOrders();
}

/* Telegram'dan sahifaga qaytilganda tasdiqni kutib o'tirmaymiz — darhol
   so'raymiz (fon tab'da taymer sekinlashadi). */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && loginState === 'waiting' && loginSession) pollLoginNow();
});

function logout() {
  apiJson('/api/auth/web/logout', { method: 'POST' }).catch(() => {});
  me = null;
  myOrders = null;
  // Sharh va bahslar ham tozalanadi — ular AVVALGI hisobning ma'lumoti.
  // Qolib ketsa keyingi kirgan odam begona bahs matnini ko'rib qolardi.
  myReviews = [];
  myDisputes = [];
  // Kredit qoldig'i ham AVVALGI hisobniki — qolib ketsa keyingi kirgan odam
  // begona balansni ko'rib turardi. Rasm holatlari ham tozalanadi: "kredit
  // tugadi" yozuvi yangi hisobda jimgina yolg'on bo'lardi.
  aiCredits = null;
  Object.keys(aiImages).forEach((k) => { delete aiImages[k]; });
  // Sotuvchi holati ham AVVALGI hisobniki — qolib ketsa keyingi kirgan odam
  // begona e'lon va buyurtmalarni ko'rib qolardi.
  sellerMe = null; sProducts = []; sOrders = []; sEditId = null;
  Object.keys(sTracking).forEach((k) => { delete sTracking[k]; });
  Object.keys(sDispReply).forEach((k) => { delete sDispReply[k]; });
  refreshAuthUi();
  drawerView = 'login';
  loginState = 'idle';
  renderDrawer();
  showToast(t('loggedOut'));
}

/** Kirishdan keyin buyurtma formasiga qaytish uchun */
function loginFromCheckout() {
  afterLoginView = 'checkout';
  drawerView = 'login';
  loginState = 'idle';
  renderDrawer();
}

function loadMyOrders() {
  myOrders = null;
  // Sharhlar ham yuklanadi — profildagi buyurtma qatori "Baholash" tugmasini
  // ko'rsatishdan oldin qaysi mahsulot allaqachon baholanganini bilishi kerak
  loadMyReviews();
  // Bahslar ham: qatorda "murojaat" tugmasi yoki ochiq bahs holati
  // ko'rsatiladi — ikkinchi marta bahs ochib bo'lmaydi (server 409 beradi)
  loadMyDisputes();
  apiJson('/api/web/orders')
    .then((d) => {
      myOrders = d && d.ok && Array.isArray(d.orders) ? d.orders : [];
    })
    .catch(() => { myOrders = []; })
    .then(() => {
      // Ikkala ko'rinish ham buyurtmaga qaraydi: ro'yxat 'orders' da,
      // profildagi qatorning ostidagi yozuvi ('3 buyurtma · Yo'lda') esa
      // 'profile' da — biri qolib ketsa u "Yuklanmoqda…" da qotib qolardi.
      if (isOpen() && (drawerView === 'profile' || drawerView === 'orders')) renderDrawer();
    });
}

function firstName(name) {
  return String(name || '').trim().split(/\s+/)[0] || '';
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

/** Header va mobil nav tugmasi — kirgan bo'lsa ism ko'rsatiladi */
function refreshAuthUi() {
  const txt = document.querySelector('.login-txt');
  if (txt) txt.textContent = me ? (firstName(me.name) || 'Profil') : 'Kirish';
  const btn = document.getElementById('login-btn');
  if (btn) {
    btn.classList.toggle('is-in', !!me);
    btn.setAttribute('aria-label', me ? 'Profil' : 'Kirish');
  }
  const mBtn = document.getElementById('m-tab-login');
  if (mBtn) {
    mBtn.classList.toggle('is-in', !!me);
    mBtn.setAttribute('aria-label', me ? 'Profil' : 'Kirish');
  }
}

/* Til sahifa ochilishi bilan qo'llanadi. Skript `defer` — DOM tayyor, ya'ni
   `DOMContentLoaded` kutilmaydi (CLAUDE.md: `load` ishlatilmaydi).
   ⚠️ O'zbekcha bo'lsa ham chaqiriladi: `data-lang-btn` tugmasi va `lang`
   atributi to'g'ri holatga kelishi kerak. */
applyLang();

/* Sahifa ochilganda sessiyani tiklaymiz — cookie serverda tekshiriladi */
apiJson('/api/auth/web/me')
  .then((d) => {
    if (!d || !d.ok) return;
    // To'lov sozlamalari — faqat SHAKLI to'g'ri bo'lsa qabul qilinadi.
    // `!= null` tekshiruvining O'ZI yetarli emas: bo'sh satr yoki `0` ham
    // "keldi" bo'lib ko'rinardi va zaxira qiymatni bosib o'tardi
    // (CLAUDE.md — "sozlama qiymati bo'sh emasligi uni haqiqiy qilmaydi").
    if (Number.isFinite(d.prepayRate) && d.prepayRate > 0 && d.prepayRate <= 1) {
      PREPAY_RATE = d.prepayRate;
    }
    if (Number.isFinite(d.deliveryFee) && d.deliveryFee >= 0) {
      DELIVERY_FEE_ESTIMATE = d.deliveryFee;
    }
    // ⚠️ Bu yerda ham `renderDrawer()` chaqirilMAYDI — `setBtsPoint` dagi
    // bilan bitta sabab: checkout ochiq bo'lsa xaridor yozgan maydonlar
    // o'chib ketardi. Faqat raqamlar joyida almashtiriladi.
    paintCheckoutTotals();
    // AI sozlamasi — kalitlar SERVERDAN (`aiClientConfig`). Kirmagan
    // foydalanuvchi ham oladi: bo'lim ko'rinadi, tugma o'rniga "Kirish".
    // ⚠️ Tafsilot oynasi ALLAQACHON ochiq bo'lsa u qayta chiziladi: bu so'rov
    // asinxron, ya'ni sekin tarmoqda xaridor mahsulotni sozlama kelgunicha
    // ochib ulgurishi mumkin va o'shanda AI bloki JIMGINA yo'q bo'lardi
    // (xato yo'q, sabab ko'rinmaydi). Checkout va boshqa ko'rinishlarga
    // TEGILMAYDI — u yerda xaridor yozayotgan maydonlar o'chib ketardi.
    // Karta kaliti — AYNI kanaldan (`mapsClientConfig`). Kelmasa `null` da
    // qoladi: manzil bo'limi ishlayveradi, faqat kartasiz (ro'yxat bilan).
    mapsKey = (d.mapsEnabled && typeof d.mapsKey === 'string' && d.mapsKey) ? d.mapsKey : null;
    aiCfg = readAiConfig(d);
    if (aiCfg && pdpId) renderPdpAi();
    if (d.user) {
      me = d.user;
      refreshAuthUi();
      loadAiCredits();
      loadSellerMe();
    }
  })
  .catch(() => { /* server yo'q — sayt kirishsiz ham to'liq ishlaydi */ });

/* ── Kirish va profil ekranlari ── */
function loginHtml() {
  if (loginState === 'waiting') {
    return `
      <div class="auth-wrap">
        <div class="auth-spinner" aria-hidden="true"></div>
        <div class="drawer-empty-title">${t('tgConfirm')}</div>
        <div class="drawer-empty-sub">
          Ochilgan botda <b>${t('tgStart')}</b> (Start) tugmasini bosing — shundan keyin
          bu sahifa o'zi profilingizga o'tadi.
        </div>
        ${loginSession
          ? `<a class="btn-tg" href="${loginSession.url}" target="_blank" rel="noopener">${t('tgOpen')}</a>`
          : ''}
        <button class="auth-ghost" data-action="cancelLogin">${t('cancel')}</button>
      </div>`;
  }

  return `
    <div class="auth-wrap">
      <div class="auth-badge" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M21.7 4.2 2.9 11.4c-1 .4-1 1.2-.1 1.5l4.7 1.5 1.8 5.4c.2.6.4.8 1 .4l2.6-2.1 4.7 3.5c.9.5 1.4.2 1.6-.8l3-14c.2-1-.4-1.4-1.5-1.1zM8.7 14.1 17.3 8c.4-.3.8-.1.5.2l-7.1 6.5-.3 3z"/></svg>
      </div>
      <div class="drawer-empty-title">${t('tgLogin')}</div>
      <div class="drawer-empty-sub">
        ${t('tgLoginSub')}
      </div>
      ${loginErr ? `<div class="co-err" style="margin-top:2px">${esc(loginErr)}</div>` : ''}
      <button class="btn-tg" data-action="startLogin">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M21.7 4.2 2.9 11.4c-1 .4-1 1.2-.1 1.5l4.7 1.5 1.8 5.4c.2.6.4.8 1 .4l2.6-2.1 4.7 3.5c.9.5 1.4.2 1.6-.8l3-14c.2-1-.4-1.4-1.5-1.1zM8.7 14.1 17.3 8c.4-.3.8-.1.5.2l-7.1 6.5-.3 3z"/></svg>
        ${t('tgLogin')}
      </button>
      <div class="co-hint" style="text-align:center;max-width:290px">
        ${t('tgPrivacy')}
      </div>
    </div>`;
}

/* Yorliq `{uz, ru}` shaklida va `L()` bilan o'qiladi — bu jadval STR'da
   TURMAYDI, chunki kalitlari BAZADAGI `orders.status` qiymatlari (ular bilan
   birga o'zgaradi), tarjima jadvali esa UI matnlari uchun. Ilgari yorliqlar
   faqat o'zbekcha edi va ruscha saytda buyurtma holati o'zbekcha chiqardi. */
const ORDER_STATUS = {
  pending:   { label: { uz: 'Kutilmoqda',    ru: 'В ожидании'  }, tone: 'wait' },
  confirmed: { label: { uz: 'Tasdiqlandi',   ru: 'Подтверждён' }, tone: 'ok'   },
  shipped:   { label: { uz: "Yo'lda",        ru: 'В пути'      }, tone: 'ok'   },
  delivered: { label: { uz: 'Yetkazildi',    ru: 'Доставлен'   }, tone: 'ok'   },
  completed: { label: { uz: 'Yakunlandi',    ru: 'Завершён'    }, tone: 'ok'   },
  disputed:  { label: { uz: 'Bahsli',        ru: 'Спорный'     }, tone: 'warn' },
  refunded:  { label: { uz: 'Qaytarildi',    ru: 'Возвращён'   }, tone: 'warn' },
  cancelled: { label: { uz: 'Bekor qilindi', ru: 'Отменён'     }, tone: 'warn' },
};

/** Holat yorlig'i — noma'lum holatda BAZADAGI qiymatning o'zi ko'rinadi
    (jimgina bo'sh joy qoldirmaslik uchun; `t()` bilan bitta mulohaza). */
function statusLabel(status) {
  const st = ORDER_STATUS[status];
  return st ? L(st.label) : String(status || '');
}

/* ── Profil surati — Telegram avatari (2026-08-13, founder) ──
   Sayt kanalida kimlik HttpOnly cookie'da yuradi, ya'ni `<img src>` ham
   ishlardi. Shunday bo'lsa ham `fetch` tanlandi va sabab bor: surat YO'Q
   bo'lganda server 404 qaytaradi, `<img>` esa buni "singan rasm" belgisi
   bilan ko'rsatardi — bosh harflarga toza qaytish imkoni bo'lmasdi.

   ⚠️ BIR MARTA so'raladi (`avaHolat`): profil oynasi har ochilganda
   chizilyapti, holat kuzatilmasa har ochilishda yangi so'rov ketardi.
   Surat yo'qligi ham eslab qolinadi. */
let avaUrl = null;
let avaHolat = 'nomalum';        // nomalum | yuklanmoqda | bor | yoq

/* 🔴 `URL.createObjectURL` ISHLATILMAYDI — u JIMGINA ishlamaydi.
   Birinchi variant aynan shunday yozilgan edi va production'da avatar
   o'rniga "singan rasm" belgisi chiqdi (founder telefonda ko'rsatdi).
   Sabab konsolda emas, SARLAVHADA edi: saytning CSP siyosatida
   `img-src 'self' data: https://cdn.lolamarket.uz` turadi va `blob:`
   u yerda YO'Q, ya'ni brauzer rasmni bloklaydi.

   `data:` esa ro'yxatda ALLAQACHON bor — shuning uchun tuzatish
   nginx'ga tegmaydi (CSP'ni kengaytirish yangi ruxsat ochish bo'lardi,
   holbuki mavjud ruxsat yetarli). Avatar kichik (≤160px), ya'ni base64
   qilib inline qo'yish arzon.

   ⚠️ Bu CLAUDE.md dagi karta bandi bilan BITTA OILA: «CSP qo'llanganda
   `api-maps.yandex.ru` qo'shilmasa karta JIMGINA o'ladi». Naqsh bir xil —
   yangi TASHQI SXEMA (blob:, https://…) ishlatilganda CSP ro'yxati
   tekshirilsin. Qorovul: `server/test.js` → Test 25. */
function blobToDataUrl(b) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = () => rej(new Error('rasm o\'qilmadi'));
    fr.readAsDataURL(b);
  });
}

async function mountAvatar() {
  if (avaHolat !== 'nomalum') return;
  avaHolat = 'yuklanmoqda';
  try {
    const r = await fetch('/api/me/photo', { credentials: 'same-origin' });
    if (!r.ok) { avaHolat = 'yoq'; return; }
    avaUrl = await blobToDataUrl(await r.blob());
    avaHolat = 'bor';
    const el = document.getElementById('profile-ava');
    if (el) el.innerHTML = `<img src="${esc(avaUrl)}" alt="">`;
  } catch (e) {
    // Avatar bezak — tarmoq uzilishi bosh harflarni qoldiradi, xolos.
    avaHolat = 'yoq';
  }
}

function profileHtml() {
  const u = me || {};

  return `
    <div class="profile-card">
      <div class="profile-ava" id="profile-ava" aria-hidden="true">${
        // Surat serverdan kelgan bo'lsa — o'sha, aks holda bosh harflar.
        // ⚠️ Bosh harflar ZAXIRA sifatida QOLADI: surat kelmasa bo'sh doira
        // turardi va "yuklanmadi" bilan "avatari yo'q" ajralmasdi.
        avaUrl ? `<img src="${esc(avaUrl)}" alt="">` : esc(initials(u.name))
      }</div>
      <div class="profile-main">
        <div class="profile-name">${esc(u.name || 'Xaridor')}</div>
        ${u.username ? `<div class="profile-sub">@${esc(u.username)}</div>` : ''}
        ${u.phone ? `<div class="profile-sub">${esc(u.phone)}</div>` : ''}
      </div>
    </div>

    <div class="p-rows">
      ${myOrdersRowHtml()}
      ${myAddressHtml()}
      ${contactHtml()}
    </div>

    ${sellerMe && sellerMe.seller ? `
    <button class="s-enter" data-action="openSellerCabinet">
      <span class="s-enter-txt">
        <span class="s-enter-main">${t('sCabinet')}</span>
        <span class="s-enter-sub">${esc(L(sellerMe.seller.name))}${sellerMe.seller.verified ? ` · ${t('sVerified')}` : ''}</span>
      </span>
      <svg class="p-row-chev" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>` : ''}

    <button class="auth-ghost" style="margin-top:12px;width:100%" data-action="logout">${t('logout')}</button>

    <div class="p-foot">
      <img src="Photo/logo/lola-mark.png" width="40" height="40" alt="" loading="lazy">
      <span>© 2026 LolaMarket</span>
    </div>`;
}

/* ── Profil: "Mening buyurtmalarim" ──
   Ro'yxat profil ekranida CHIZILMAYDI — alohida ko'rinishda ochiladi
   (founder, 2026-08-13: "buyurtmalar tarixi profilni ochganda uzun turibdi,
   boshqa ma'lumotlarni ko'rib bo'lmayapti").
   ⚠️ Sabab TAXMIN emas, ESKI TARTIB O'LCHANDI (375×812, oyna tanasi 750px):
   uchta buyurtma bloki 500px egallardi (bitta qator 98px, ichida bahs va
   ikki baholash qatori bo'lgani 259px), "Mening manzilim" qatori tepasi
   723px da — ya'ni ekran chegarasidan 27px oldin boshlanib, "Biz bilan
   bog'lanish" BUTUNLAY pastda qolardi; jami 1047px. Buyurtma soni o'sishi
   bilan bo'limlar yanada pastga siljiydi, ya'ni nuqson vaqt bilan YOMONLASHAR
   edi. Qator "Mening manzilim" va "Biz bilan bog'lanish" bilan BITTA
   mexanizm: bir xil shakl — bir xil ochilish (o'sha kunning qarori,
   CLAUDE.md).

   ⚠️ Ostidagi yozuv BAZADAN keladi: yuklanmagan bo'lsa "Yuklanmoqda…",
   bo'sh bo'lsa "buyurtma yo'q". O'ylab topilgan son ko'rsatilmaydi. */
function myOrdersRowHtml() {
  let sub;
  if (myOrders === null) {
    sub = t('loading');
  } else if (!myOrders.length) {
    sub = t('ordersNone');
  } else {
    // `/api/web/orders` `created_at DESC` bilan qaytaradi — [0] ENG YANGISI.
    sub = `${myOrders.length} ${t('ordersCount')} · ${esc(statusLabel(myOrders[0].status))}`;
  }
  return `
    <button class="p-row" data-action="openOrdersView">
      <span class="p-row-ico" aria-hidden="true">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M6.2 2h11.6a1 1 0 0 1 1 1v18.1a.6.6 0 0 1-.9.5L15 20l-2.6 1.6a.8.8 0 0 1-.8 0L9 20l-2.9 1.6a.6.6 0 0 1-.9-.5V3a1 1 0 0 1 1-1zm2 5.2a1 1 0 0 0 0 2h7.6a1 1 0 0 0 0-2H8.2zm0 4.1a1 1 0 0 0 0 2h7.6a1 1 0 0 0 0-2H8.2zm0 4.1a1 1 0 0 0 0 2h4.3a1 1 0 0 0 0-2H8.2z"/>
        </svg>
      </span>
      <span class="p-row-main">
        <span class="p-row-label">${t('myOrders')}</span>
        <span class="p-row-sub">${sub}</span>
      </span>
      <svg class="p-row-chev" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>`;
}

/** Profildan buyurtmalar ro'yxatiga o'tish (`openAddrPicker` bilan bitta naqsh) */
function openOrdersView() {
  drawerView = 'orders';
  renderDrawer();
  openDrawerEl();
}

/* Ro'yxatning O'ZI. Qaytish tugmasi SHART: oynaning sarlavhasida "orqaga"
   yo'q, ya'ni tugmasiz yagona chiqish yo'li — butun oynani yopish bo'lardi
   va foydalanuvchi profilga qaytish uchun uni qaytadan ochishga majbur
   bo'lardi (sharh va bahs formalaridagi naqsh bilan bir xil). */
function ordersViewHtml() {
  const body = myOrders === null
    ? `<div class="co-hint" style="text-align:center;padding:14px 0">${t('loading')}</div>`
    : !myOrders.length
      ? `<div class="co-hint" style="text-align:center;padding:14px 0">${t('noOrders')}</div>`
      : `<div class="order-list">${myOrders.map(orderRowHtml).join('')}</div>`;

  return `${body}
    <button class="auth-ghost" style="margin-top:12px;width:100%" data-action="backToProfile">${t('toProfile')}</button>`;
}

/* ── Profil: "Mening manzilim" ──
   Doimiy BTS olish nuqtasi. Tanlansa bazada saqlanadi (`/api/pickup-point`)
   va checkout uni oldindan qo'yadi.

   ⚠️ Nuqta tanlanmagan bo'lsa SOXTA manzil ko'rsatilmaydi — blok
   "tanlanmagan" deb turadi (`NULL` reyting qoidasi bilan bitta oila:
   yo'qlik ko'rinsin, jimgina yolg'on gapirmasin). */
/* Qator shakli (2026-08-13, founder namunasi): to'liq manzil, ish vaqti va
   karta bir bosishda — tanlash oynasida; qatorda esa xaridorga kerak
   bo'ladigan yagona javob turadi — "qaysi nuqta". */
function myAddressHtml() {
  const p = btsById(btsPoint);
  return `
    <button class="p-row" data-action="openAddrPicker">
      <span class="p-row-ico" aria-hidden="true">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M12 2a7.4 7.4 0 0 0-7.4 7.4C4.6 14.8 12 22 12 22s7.4-7.2 7.4-12.6A7.4 7.4 0 0 0 12 2zm0 10.1a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4z"/>
        </svg>
      </span>
      <span class="p-row-main">
        <span class="p-row-label">${t('myAddr')}</span>
        <span class="p-row-sub">${p ? esc(p.name) : t('myAddrNone')}</span>
      </span>
      <svg class="p-row-chev" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>`;
}

/* ── Profil: "Biz bilan bog'lanish" ──
   🔴 **`tel:` HAR JOYDA ISHLAYDI DEB O'YLAMANG** (2026-08-13, founder
   "qo'ng'iroq tugmasi ishlamayapti" deganidan keyin tuzatildi). Bu yerda
   ilgari "`tel:` ni WebView ham, brauzer ham o'zi to'g'ri boshqaradi" deb
   yozilgandi — TEKSHIRILMAGAN DA'VO edi va noto'g'ri chiqdi:
     * kompyuter brauzerida telefon ilovasi ro'yxatdan o'tmagan bo'lsa
       bosish JIMGINA hech narsa qilmaydi;
     * Telegram WebView'i `http(s)` dan boshqa sxemani ko'pincha umuman
       ochmaydi.
   Ikkala holatda ham xato YO'Q, konsol TOZA, tugma esa o'lik — ya'ni
   nuqsonni faqat odam bosib ko'rgandagina sezadi.

   YECHIM muhitni ANIQLASHGA tayanmaydi (aniqlash yana bir tekshirilmagan
   taxmin bo'lardi): havola `tel:` bo'lib QOLADI — qayerda ishlasa, o'sha
   yerda ishlayveradi — va bosilganda raqam BUZILMASDAN buferga ham
   nusxalanadi. Qo'ng'iroq ochilsa nusxa xalaqit bermaydi, ochilmasa
   foydalanuvchi raqamni qo'lda tera oladi. `preventDefault` CHAQIRILMAYDI:
   u native qo'ng'iroqni o'ldirardi. */
/* Profildagi qator — "Mening manzilim" bilan BIR XIL yo'l: bosilsa ALOHIDA
   ko'rinish ochiladi (founder 2026-08-13). Ilgari bo'lim joyida ochilardi;
   ikki bo'limning ikki xil ochilishi qaysi biri "ichkariga olib kirishini"
   taxmin qildirardi. */
function contactHtml() {
  return `
    <button class="p-row" data-action="openContactView">
      <span class="p-row-ico" aria-hidden="true">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.2c-5.1 0-9.2 3.5-9.2 7.9 0 2.4 1.2 4.6 3.2 6.1L4.9 21l4.3-1.8c.9.2 1.8.3 2.8.3 5.1 0 9.2-3.5 9.2-7.9s-4.1-7.9-9.2-7.9z"/></svg>
      </span>
      <span class="p-row-main">
        <span class="p-row-label">${t('contactT')}</span>
        <span class="p-row-sub">${t('contactSub')}</span>
      </span>
      <svg class="p-row-chev" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>`;
}

/* Ikki yo'l — alohida ko'rinishda (manzil tanlash bilan bitta mexanizm). */
function contactWaysHtml() {
  return `
    <div class="contact-ways" id="contact-ways">
      <a class="way way-phone" href="tel:${SUPPORT.tel}" data-action="copySupportPhone">
        <span class="way-ico" aria-hidden="true">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 2.5a1.9 1.9 0 0 1 2.5.8l1.4 2.6a1.9 1.9 0 0 1-.4 2.3L8.6 9.6a14.6 14.6 0 0 0 5.8 5.8l1.4-1.5a1.9 1.9 0 0 1 2.3-.4l2.6 1.4a1.9 1.9 0 0 1 .8 2.5l-.8 1.7a2.4 2.4 0 0 1-2.7 1.3A19.6 19.6 0 0 1 3.6 5.2a2.4 2.4 0 0 1 1.3-2.7z"/></svg>
        </span>
        <span class="way-main">
          <span class="way-val is-mono">${SUPPORT.telLabel}</span>
          <span class="way-sub">${t('contactCall')}</span>
        </span>
        <span class="way-go" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </a>
      <a class="way way-tg" href="${SUPPORT.tgUrl}" target="_blank" rel="noopener">
        <span class="way-ico" aria-hidden="true">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M21 4L2.5 11.5l6 2 2 6.5L15 15l5-11z"/></svg>
        </span>
        <span class="way-main">
          <span class="way-val">${t('contactTgWay')}</span>
          <span class="way-sub">@${SUPPORT.tgUser}</span>
        </span>
        <span class="way-go" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </a>
    </div>`;
}

/** Profildan aloqa ko'rinishiga o'tish (`openAddrPicker` bilan bitta naqsh) */
function openContactView() {
  drawerView = 'contact';
  renderDrawer();
  openDrawerEl();
}

/* ── Footer bo'limlari ("Loyiha haqida", "Vakansiyalar", ...) ──
   Sayt bitta sahifadan iborat, ya'ni bu bo'limlar ALOHIDA MANZIL emas —
   savat/profil bilan bitta oynada ochiladi. Matn tayyor bo'lgach shu
   jadvalning O'ZI to'ldiriladi, boshqa joyga tegilmaydi.

   ⚠️ Bo'sh bo'lim BO'SHLIGINI AYTADI. "Tez orada" deb sana va'da
   qilinmaydi — bajarilmagan va'da yo'q matndan yomonroq (CLAUDE.md:
   jimgina yolg'on). Har bo'limda bog'lanish tugmasi turadi: matn yo'q
   bo'lsa ham javob beradigan odam bor. */
/* ⚠️ Matn KALIT NOMI bilan emas, `t('...')` CHAQIRUVI bilan olinadi.
   Sabab qorovulda: Test 20 kalit ishlatilganini `t('kalit')` shakli
   bo'yicha sanaydi — kalitlar massivda satr bo'lib yotsa, ular "o'lik"
   ro'yxatiga tushardi va bir kun kelib "ishlatilmayapti" deb
   o'chirilardi. O'shanda bo'lim matn o'rniga KALIT NOMINI ko'rsatardi. */
const INFO_TOPICS = {
  about:    { title: 'fProject',  soon: true,  body: () => [t('fAboutBody')] },
  jobs:     { title: 'fJobs',     soon: true,  body: () => [t('fJobsBody')] },
  faq:      { title: 'fFaq',      soon: true,  body: () => [t('fFaqBody')] },
  legal:    { title: 'fLegal',    soon: true,  body: () => [t('fLegalBody')] },
  /* "Yetkazish va to'lov" — YAGONA to'liq bo'lim, chunki uning mazmuni
     allaqachon kodda bor. Foizi `PREPAY_RATE` dan O'QILADI (u serverdan
     keladi): qo'lda yozilsa stavka o'zgargan kuni sahifa jimgina yolg'on
     gapirardi va buni hech narsa ko'rsatmasdi. */
  delivery: {
    title: 'fDelivery', soon: false,
    body: () => [
      t('fDeliveryBts'),
      t('fDeliveryPay').replace('{pct}', String(Math.round(PREPAY_RATE * 100))),
      t('fDeliveryMore'),
    ],
  },
};

let infoTopic = 'about';

function openInfo(topic) {
  infoTopic = INFO_TOPICS[topic] ? topic : 'about';
  drawerView = 'info';
  renderDrawer();
  openDrawerEl();
}

function infoHtml() {
  const cfg = INFO_TOPICS[infoTopic] || INFO_TOPICS.about;
  const lines = cfg.body()
    .map((s) => `<p class="info-p">${esc(s)}</p>`)
    .join('');

  return `
    <div class="info-view">
      ${cfg.soon ? `<div class="info-soon">${esc(t('fSoonTitle'))}</div>` : ''}
      ${lines}
      ${infoTopic === 'delivery' ? `
        <button class="info-cta" data-action="openPoints">${esc(t('fPickPoint'))}</button>
      ` : ''}
      <div class="info-ask">
        <span class="info-ask-txt">${esc(t('fSoonAsk'))}</span>
        <button class="info-cta" data-action="openContactView">${esc(t('contactT'))}</button>
      </div>
    </div>`;
}

/* Matnni buferga nusxalash. Ikki yo'l ATAYLAB: `navigator.clipboard`
   xavfsiz kontekst (HTTPS) va ruxsat talab qiladi hamda Telegram
   WebView'ida mavjud bo'lmasligi mumkin — o'shanda eski `execCommand`
   yo'li ishlaydi. Ikkalasi ham yiqilsa `false` qaytadi va CHAQIRUVCHI
   buni foydalanuvchiga aytadi (jimgina "nusxalandi" deyish — yolg'on). */
function copyText(matn) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(matn).then(() => true).catch(() => legacyCopy(matn));
  }
  return Promise.resolve(legacyCopy(matn));
}
function legacyCopy(matn) {
  try {
    const ta = document.createElement('textarea');
    ta.value = matn;
    ta.setAttribute('readonly', '');
    // Ekrandan tashqarida emas, KO'RINMAS: `display:none` bo'lsa tanlab
    // bo'lmaydi, ekrandan tashqariga chiqarilsa iOS sahifani sakratadi.
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, matn.length);
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch (e) {
    return false;
  }
}

/* Qo'ng'iroq qatori bosilganda. ⚠️ `preventDefault` YO'Q — havola o'z
   ishini qilaveradi (qayerda `tel:` ishlasa, telefon o'sha yerda ochiladi),
   bu faqat USTIGA qo'shiladigan zaxira. */
function copySupportPhone() {
  copyText(SUPPORT.tel).then((ok) => {
    showToast(ok ? t('phoneCopied') : t('phoneCopyErr'));
  });
}

/* ── Manzil tanlash ko'rinishi (karta + ro'yxat) ──
   Karta va ro'yxat BIRGA turadi, ular bir-birining o'rnini bosmaydi:
   karta "qayerdaligini ko'rsatadi", ro'yxat esa kalitsiz ham, karta
   yiqilganda ham ishlaydigan YAGONA ishonchli yo'l. */
function addressPickerHtml() {
  const rows = BTS_POINTS.map((p) => {
    const on = p.id === btsPoint;
    return `
      <button class="addr-opt${on ? ' is-on' : ''}" data-action="pickAddrPoint" data-arg="${p.id}">
        <span class="addr-opt-main">
          <span class="addr-opt-name">${esc(p.name)}</span>
          <span class="addr-opt-sub">${esc(p.addr)} · ${esc(p.hours)}</span>
        </span>
        <span class="addr-opt-dot" aria-hidden="true"></span>
      </button>`;
  }).join('');

  return `
    ${mapsKey ? `
      <div id="addr-map" class="addr-map">${t('mapLoading')}</div>
      <div class="addr-approx">${t('mapApprox')}</div>
    ` : ''}
    <div class="addr-opts">${rows}</div>`;
}

/* Ko'rinish QAYERDAN ochilgani. Faqat ikki qiymat: `'profile'` (standart)
   va `'footer'`. Sabab pastda — `pickAddrPoint` ning qaytish yo'li shunga
   qarab tanlanadi. */
let addrFrom = 'profile';

/** Profildan manzil tanlashga o'tish */
function openAddrPicker() {
  addrFrom = 'profile';
  drawerView = 'address';
  renderDrawer();
  openDrawerEl();
}

/* Footer'dagi "Topshirish punktlari" — AYNI ko'rinish, ikkinchi nusxa EMAS
   (CLAUDE.md: mavjud funksiyaning ustiga ikkinchi yo'l qo'shilmaydi).
   Farqi bitta: bu yerga profildan emas, sahifa tagidan kelinadi, ya'ni
   nuqta tanlangandan keyin profilga "qaytarish" mumkin emas — u yerda
   foydalanuvchi umuman bo'lmagan. Kirmagan odam uchun esa profil
   ko'rinishi bo'sh karta va "Hisobdan chiqish" tugmasini ko'rsatardi. */
function openPoints() {
  addrFrom = 'footer';
  drawerView = 'address';
  renderDrawer();
  openDrawerEl();
}

/** Tanlangandan keyin profilga qaytiladi — oyna yopilmaydi */
function backToProfile() {
  drawerView = 'profile';
  renderDrawer();
}

/* ⚠️ Bu yerda BUTUN ko'rinish qayta chizilMAYDI: karta o'chib qaytadan
   yuklanardi va ekran har bosishda sakrardi (checkout formasidagi
   `paintBtsInfo` bilan bitta mulohaza). Faqat ro'yxatdagi belgi va
   kartadagi nuqta yangilanadi, so'ng kelingan joyga qaytiladi. */
function pickAddrPoint(id) {
  if (!btsById(id)) return;
  setBtsPoint(id);
  paintAddrMarkers();
  savePickupPoint(id);
  if (addrFrom === 'footer') { closeCart(); return; }
  backToProfile();
}

/* ── Manzilni serverga saqlash ──
   ⚠️ Xato YUTILMAYDI: xaridor aynan "manzilimni saqlayapman" deb turibdi,
   ya'ni jimgina muvaffaqiyatsizlik keyingi kirishda YOLG'ON bo'lib
   chiqardi — u manzilini topmasdi va sababini bilmasdi.
   Kirmagan foydalanuvchida so'rov UMUMAN yuborilmaydi: tanlov
   `localStorage` da qoladi va checkout uni baribir ishlatadi. */
function savePickupPoint(id) {
  if (!me) return;
  apiJson('/api/pickup-point', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pointId: id }),
  })
    .then((d) => {
      if (!d || !d.ok) throw new Error((d && d.error) || 'saqlanmadi');
      showToast(t('myAddrSaved'));
    })
    .catch((e) => {
      // Birinchi argument — alert guruhlash kaliti (CLAUDE.md).
      console.error('pickupPoint saqlanmadi:', e.message);
      showToast(t('myAddrErr'));
    });
}

/* ── Yandex karta ──
   ⚠️ Skript DINAMIK yuklanadi, `<head>` da turmaydi: CLAUDE.md qoidasi
   (tashqi skript HTML tahlilini to'xtatmasin) va ko'pchilik foydalanuvchi
   bu oynani umuman ochmaydi.

   ⚠️ Til skript manziliga yoziladi va keyin o'zgarmaydi — Yandex uni
   yuklashda oladi. Til almashtirilsa karta eski tilda qolaveradi; buni
   tuzatish sahifani qayta yuklashni talab qilardi. */
let ymapsPromise = null;
function loadYmaps() {
  if (ymapsPromise) return ymapsPromise;
  if (!mapsKey) return Promise.reject(new Error("kalit yo'q"));
  ymapsPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://api-maps.yandex.ru/2.1/?apikey=' + encodeURIComponent(mapsKey) +
      '&lang=' + (LANG === 'ru' ? 'ru_RU' : 'en_US');
    s.async = true;
    s.onload = () => {
      if (window.ymaps && window.ymaps.ready) window.ymaps.ready(() => resolve(window.ymaps));
      else reject(new Error('ymaps topilmadi'));
    };
    // Yiqilgan urinish ESLAB QOLINMAYDI — aks holda bir marta uzilgan
    // tarmoq kartani sessiya oxirigacha o'lik qoldirardi.
    s.onerror = () => { ymapsPromise = null; reject(new Error('skript yuklanmadi')); };
    document.head.appendChild(s);
  });
  return ymapsPromise;
}

let addrMap = null;
let addrMarkers = {};

function mountAddrMap() {
  const box = document.getElementById('addr-map');
  if (!box || !mapsKey) return;
  addrMap = null;
  addrMarkers = {};
  loadYmaps()
    .then((ymaps) => {
      // Kutish paytida ko'rinish almashgan bo'lishi mumkin.
      if (!document.body.contains(box)) return;
      box.textContent = '';
      const sel = btsById(btsPoint);
      addrMap = new ymaps.Map(box, {
        center: sel ? [sel.lat, sel.lng] : [41.3111, 69.2797],
        zoom: sel ? 12 : 6,
        // `geolocationControl` — "menga eng yaqini qaysi" savoliga tayyor
        // javob: xaridor o'z joyini bir bosishda ko'radi.
        controls: ['zoomControl', 'geolocationControl'],
      }, { suppressMapOpenBlock: true });

      BTS_POINTS.forEach((p) => {
        // ⚠️ XOM HEX ATAYLAB: `iconColor` CSS ga emas, Yandex Maps JS API siga
        // uzatiladi — u `var(--pom-700)` ni tushunmaydi va belgi rangini
        // JIMGINA yo'qotardi. Qolgan hamma joyda token ishlatiladi (Test 26).
        const m = new ymaps.Placemark([p.lat, p.lng], { hintContent: p.name },
          { preset: 'islands#dotIcon', iconColor: '#7a140d' });
        m.events.add('click', () => pickAddrPoint(p.id));
        addrMarkers[p.id] = m;
        addrMap.geoObjects.add(m);
      });
      paintAddrMarkers();
    })
    .catch((e) => {
      // Xato yutilmaydi, lekin xaridor tiqilib qolmaydi — ro'yxat yonida.
      console.error('Karta yuklanmadi:', e.message);
      if (document.body.contains(box)) box.textContent = t('mapOff');
    });
}

function paintAddrMarkers() {
  Object.keys(addrMarkers).forEach((id) => {
    const on = id === btsPoint;
    addrMarkers[id].options.set({
      preset: on ? 'islands#circleIcon' : 'islands#dotIcon',
      // XOM HEX ATAYLAB — Yandex API parametri (yuqoridagi izoh).
      iconColor: on ? '#7a140d' : '#9b8f88',
    });
  });
}

// Sharh faqat mato yetib kelgandan keyin — server bilan bir xil ro'yxat
// (server/routes/reviews.js → REVIEW_ALLOWED_ORDER_STATUS)
const REVIEW_OK_STATUS = ['delivered', 'completed'];

/* Bahs faqat mato yo'lga chiqqandan keyin — server bilan BIR XIL ro'yxat
   (server/routes/disputes.js → DISPUTE_ALLOWED_ORDER_STATUS). Undan oldingi
   muammo "buyurtma" muammosi (bekor qilish), bahs emas. */
const DISPUTE_OK_STATUS = ['shipped', 'delivered', 'completed'];

/* Bahs sabablari — kalitlar SERVERDAGI `DISPUTE_REASONS` bilan bir xil
   bo'lishi SHART (`server/routes/disputes.js`). Server `enum` bilan
   tekshiradi: kalit mos kelmasa xaridor formani to'ldirib bo'lgach 400
   xato ko'rardi. */
const DISPUTE_REASONS = {
  not_delivered: 'Mato yetib kelmadi',
  damaged:       'Mato shikastlangan',
  wrong_item:    'Boshqa mato keldi',
  quality:       'Sifat mos emas',
  quantity:      'Miqdor kam chiqdi',
  other:         'Boshqa muammo',
};
const DISPUTE_STATUS = {
  open:     "Ko'rib chiqilmoqda",
  resolved: 'Hal qilindi',
  rejected: 'Rad etildi',
  closed:   'Yopildi',
};

/** buyurtma id → tarix ochiqmi */
const openHistory = {};
/** serverdan kelgan bahslar (kirgan bo'lsa) */
let myDisputes = [];

function disputeOf(orderId) {
  return myDisputes.find((d) => d.orderId === orderId) || null;
}

function toggleHistory(orderId) {
  openHistory[orderId] = !openHistory[orderId];
  if (drawerView === 'orders') renderDrawer();
}

function loadMyDisputes() {
  if (!me) { myDisputes = []; return; }
  apiJson('/api/disputes')
    .then((d) => { myDisputes = d && d.ok && Array.isArray(d.data) ? d.data : []; })
    .catch(() => { myDisputes = []; })
    .then(() => { if (isOpen() && drawerView === 'orders') renderDrawer(); });
}

function orderRowHtml(o) {
  const st = ORDER_STATUS[o.status] || { tone: 'wait' };
  const items = REVIEW_OK_STATUS.includes(o.status) ? (o.items || []) : [];
  const hist = Array.isArray(o.history) ? o.history : [];
  const open = openHistory[o.id];
  const disp = disputeOf(o.id);

  return `
    <div class="order-row">
      <div class="order-row-top">
        <span class="order-row-id">${esc(o.id)}</span>
        <span class="order-tag ${st.tone}">${esc(statusLabel(o.status))}</span>
      </div>
      <div class="order-row-bot">
        <span>${esc(o.date || '')}</span>
        <span class="order-row-sum">${o.total === null ? '' : money(o.total)}</span>
      </div>

      <!-- Holat tarixi — BAZADAGI haqiqiy yozuvlar (order_status_history).
           Qadamlar ro'yxati oldindan chizilmaydi: "1-2-3-4" ko'rinishidagi
           progress hali bo'lmagan qadamni ham ko'rsatib, buyurtma qayerdaligi
           haqida yolg'on gapirardi. Tarix yo'q bo'lsa blok umuman yo'q. -->
      ${hist.length ? `
      <button class="order-hist-btn" data-action="toggleHistory" data-arg="${esc(o.id)}" aria-expanded="${open ? 'true' : 'false'}">
        ${open ? 'Tarixni yashirish' : `Holat tarixi (${hist.length})`}
      </button>
      ${open ? `
      <ol class="order-hist">
        ${hist.map((h) => `<li class="order-hist-line"><span class="order-hist-dot"></span>
            <span class="order-hist-txt">${esc(statusLabel(h.status))}</span>
            <span class="order-hist-date">${esc(h.date || '')}</span></li>`).join('')}
      </ol>` : ''}` : ''}

      <!-- «Buyurtmani oldim» — faqat yo'ldagi (shipped) buyurtmada. Bosish
           shipped → delivered o'tishini yozadi (server: handleOrderDelivered),
           shundan keyin baholash tugmalari ochiladi. -->
      ${o.status === 'shipped' ? `<button class="order-got-btn" data-action="confirmDelivered" data-arg="${esc(o.id)}">${t('gotItBtn')}</button>` : ''}

      <!-- «Qayta buyurtma» (db/030, SwatchOn reorder darsi) — faqat YOPIQ
           buyurtmada: ochiq buyurtmada takrorlash dublikat tug'dirardi. -->
      ${['delivered', 'completed', 'cancelled', 'refunded'].includes(o.status)
        ? `<button class="order-reorder-btn" data-action="reorderOrder" data-arg="${esc(o.id)}">🔁 ${t('reorderBtn')}</button>` : ''}

      <!-- Bahs: ochilgan bo'lsa holati, bo'lmasa tugma -->
      ${disp ? `
      <div class="order-disp">
        <div class="order-disp-top">
          <b>Bahs #${esc(String(disp.id))}</b>
          <span class="order-disp-st ${disp.status === 'open' ? 'warn' : 'ok'}">${esc(DISPUTE_STATUS[disp.status] || disp.status)}</span>
        </div>
        <div class="order-disp-reason">${esc(disp.reason || '')}</div>
        ${disp.sellerResponse ? `<div class="order-disp-reply"><b>${t('sellerReply')}</b> ${esc(disp.sellerResponse)}</div>` : ''}
        ${disp.refundAmount ? `<div class="order-disp-reply"><b>${t('refundLabel')}</b> ${money(disp.refundAmount)}</div>` : ''}
      </div>`
        : DISPUTE_OK_STATUS.includes(o.status)
        ? `<button class="order-disp-btn" data-action="openDispute" data-arg="${esc(o.id)}">${t('disputeBtn')}</button>`
        : ''}

      ${items.length ? `
      <div class="order-rev">
        ${items.map((it) => {
          const done = reviewOf(o.id, it.id);
          return `
        <div class="order-rev-line">
          <span class="order-rev-name">${esc(it.name || it.id)}</span>
          ${done
            ? `<span class="order-rev-done">${starsHtml(done.stars, 'sm')} Baholandi</span>`
            : `<button class="order-rev-btn" data-action="openReview" data-arg="${esc(o.id)}|${esc(it.id)}">${t('rateBtn')}</button>`}
        </div>`;
        }).join('')}
      </div>` : ''}
    </div>`;
}

/* ====================================================
   MAHSULOT SAHIFASI VA SHARHLAR (sayt)

   Landing'da 2026-07-31 gacha mahsulot detali umuman yo'q edi — kartochkadan
   to'g'ridan-to'g'ri savatga qo'shilardi. O'shanda detal DRAWER ichida
   ochilardi (430px o'ng panel), 2026-08-16 dan esa u TO'LIQ SAHIFA
   (founder qarori, Uzum referensi): rasm chapda, sotib olish qutisi o'ngda,
   pastida tavsif, sharhlar va o'xshash matolar.

   ⚠️ «To'liq sahifa» YANGI HTML FAYL DEGANI EMAS va bu ATAYLAB shunday.
   Yangi ildiz fayli `deploy.yml` dagi `source` ro'yxatiga qo'lda qo'shilishi
   kerak bo'lardi, unutilsa esa nginx yo'q faylga `try_files ... /index.html`
   bilan HTML va **HTTP 200** qaytaradi — ya'ni sahifa yo'qligi tekshiruvda
   ham SOG'LOM ko'rinardi (CLAUDE.md dagi soft-200 tuzog'i). Shuning uchun
   sahifa `index.html` ICHIDA yashaydi (`#pdp`), katalog esa vaqtincha
   yashiriladi. Manzil qatori baribir o'zgaradi (`#/mahsulot/<id>`) —
   brauzerning «orqaga» tugmasi va havola ulashish shundan ishlaydi.

   ⚠️ Drawer'dagi eski `detail` ko'rinishi OLIB TASHLANDI, saqlab
   qolinmadi: bitta narsaga ikkita yo'l qolsa ular vaqt o'tib bir-biridan
   ajralib ketardi va qaysi biri haqiqat ekani ko'rinmasdi (CLAUDE.md —
   «mavjud funksiyaning ustiga ikkinchi yo'l»).

   Ma'lumot ikki manbadan qo'shiladi:
     * kartochkaning `data-*` atributlari — nom, narx, sotuvchi, rasm.
       Doim bor, tarmoqqa bog'liq emas;
     * `/api/products` — reyting, zaxira, tafsilotlar (eni, zichlik, tarkib),
       sotuvchi shahri va reytingi. Kelmasa sahifa baribir ochiladi, faqat
       qo'shimcha qatorlarsiz.
   ==================================================== */

/** Ochiq mahsulot sahifasining id'si; `null` — sahifa yopiq */
let pdpId = null;
/** Sharhlar to'liq ochilganmi (boshida faqat dastlabki nechtasi ko'rinadi) */
let pdpAllReviews = false;
/** mahsulot id → API'dagi to'liq yozuv; null — hali yuklanmagan */
let catalogMeta = null;
let catalogMetaTried = false;
/** mahsulot id → sharhlar massivi (yuklangandan keyin) */
const reviewsCache = {};
/** o'z sharhlarim (kirgan bo'lsa) — "allaqachon baholaganman" ni bilish uchun */
let myReviews = [];

function openDetail(id) {
  if (!product(id)) return;
  // Savat/profil oynasi ochiq bo'lsa yopiladi: sahifa almashayotganda
  // ustida osilib turgan panel qaysi mahsulot ochilganini yashirardi.
  if (isOpen()) closeCart();
  const yangi = pdpId !== id;
  pdpId = id;
  if (yangi) pdpAllReviews = false;
  pdpPush(id);
  renderPdp();
  // Yangi sahifa ochilganda skroll TEPADAN boshlanadi. Usiz katalogning
  // o'rtasidan bosgan odam mahsulot sahifasining o'rtasiga tushardi va
  // rasm ham, nom ham ekrandan tashqarida qolardi.
  window.scrollTo(0, 0);
  // ⚠️ Qadalgan qator skroll TIKLANGANDAN KEYIN hisoblanadi. `renderPdp`
  // ichidagi chaqiruv sahifa hali ESKI joyida turganda bo'ladi, ya'ni
  // o'xshash mato kartochkasidan yangi mahsulot ochilganda qator "ko'rinsin"
  // deb qolar, header esa surilgan holatda turardi — yangi mahsulotning
  // suratini bosib. Skroll hodisasiga tayanib bo'lmaydi: `scrollY` 0 dan 0
  // ga o'zgarsa hodisa UMUMAN otilmaydi.
  pdpBarSync();
  loadCatalogMeta();
  loadReviews(id);
}

function loadCatalogMeta() {
  if (catalogMeta || catalogMetaTried) return;
  catalogMetaTried = true;
  apiJson('/api/products')
    .then((d) => {
      const list = d && typeof d === 'object' && 'ok' in d ? (d.ok ? d.data : null) : d;
      if (!Array.isArray(list)) return;
      catalogMeta = {};
      list.forEach((p) => { catalogMeta[p.id] = p; });
      mergeCatalog(list);
      // Sahifa ochiq bo'lsa TO'LIQ qayta chiziladi: aynan shu javob bilan
      // reyting, zaxira, o'lchovlar va sotuvchi shahri birinchi marta
      // keladi, ya'ni o'zgaradigan joy bitta blok emas.
      if (pdpId) renderPdp();
    })
    .catch(() => { /* detal data-* atributlari bilan ishlayveradi */ })
    // Savat/saralanganlarni tozalash SO'ROV TUGAGACH bo'ladi — muvaffaqiyatda
    // ham, xatoda ham. Sabab pastda, `settleCatalog()` izohida.
    .then(settleCatalog);
}

/* ====================================================
   KATALOGNI BAZA BILAN BIRLASHTIRISH (2026-08-12)

   2026-08-12 gacha saytdagi katalog `index.html` ichiga QO'LDA yozilgan 12 ta
   kartochkadan iborat edi, Mini App esa o'shanda ham `/api/products` dan
   o'qirdi. Natijada sotuvchi e'lon qo'shsa u Mini App'da chiqar, saytda esa
   HECH QACHON ko'rinmasdi — o'lchandi: bazada 22 ta nashr etilgan e'lon,
   saytda 12 ta. Teskarisi ham bor edi: `ik-9001` saytda turardi, bazada esa
   yo'q — xaridor uni savatga solib buyurtma bersa server rad etardi.

   Yechim — ALMASHTIRISH emas, BIRLASHTIRISH:
     * HTML'dagi kartochkalar joyida qoladi. Ular SEO uchun ham, tarmoq sekin
       bo'lganda darhol chiziladigan tarkib uchun ham kerak — katalog butunlay
       JS'ga o'tkazilsa qidiruv tizimi bo'sh sahifa ko'rardi;
     * bazada bor, HTML'da yo'q e'lon — gridga QO'SHILADI;
     * ikkalasida bor e'lonning narxi va zaxirasi bazadagiga TENGLASHTIRILADI;
     * HTML'da bor, bazada yo'q kartochka — OLIB TASHLANADI (`ik-9001` toifasi).

   Kartochka DOM'ga haqiqiy `.product-card` bo'lib tushadi, shuning uchun
   filtr, qidiruv, narx oralig'i, savat, saralanganlar va detal oynasi
   qo'shimcha kodsiz ishlayveradi — ularning hammasi `data-*` atributlarini
   o'qiydi (`product()`), alohida ro'yxatni emas.
   ==================================================== */

/** Zaxira chegarasi — Mini App'dagi `LOW_STOCK` bilan bir xil qiymat */
const LOW_STOCK = 5;
/* Zaxira yorliqlari — endi TILGA bog'liq, shuning uchun jadval emas FUNKSIYA:
   ilgari modul yuklanganda bir marta hisoblanardi va til almashganda eski
   tilda qotib qolardi. */
function stockTxt(k) {
  return { in: t('stIn'), low: t('stLow'), made: t('stMade'), out: t('stOut') }[k] || '';
}
/* HTML kartochkasidagi o'zbekcha belgi matnini tarjima KALITIGA bog'laydi.
   Kartochkalar SEO uchun HTML da qo'lda yozilgan, ya'ni ularda `data-badge`
   yo'q — matnning o'zidan kalit topiladi va `dataset` ga yoziladi (bir marta). */
const BADGE_UZ = {
  bTavsiya: 'Tavsiya', bKamQoldi: 'Kam qoldi', bHunarmand: 'Hunarmand', bYangi: 'Yangi',
};

/** `badge_tone` → mavjud CSS sinfi */
const BADGE_TONE = { primary: 'tone-primary', teal: 'tone-teal', saffron: 'tone-saffron', neutral: 'tone-neutral' };

/** zaxirasi tugagan mahsulot id'lari — savat tugmasi o'rniga "Tugadi" chiqadi */
const soldOutIds = new Set();

/* Zaxira ko'rinishi — Mini App'dagi `stockView()` bilan AYNAN bir xil qoida
   (`telegram-app/app.js`). `stock === null` CHEKSIZ degani: `made`
   mahsulotlar va sotuvchi son kiritmagan e'lonlar. */
function stockView(p) {
  const n = p.stock;
  if (n === null || n === undefined) {
    const k = stockTxt(p.stockKey) ? p.stockKey : 'made';
    return { txt: stockTxt(k), key: k, soldOut: false };
  }
  if (n <= 0) return { txt: stockTxt('out'), key: 'out', soldOut: true };
  if (n <= LOW_STOCK) return { txt: `${stockTxt('low')} · ${n}`, key: 'low', soldOut: false };
  return { txt: stockTxt('in'), key: 'in', soldOut: false };
}

/* Rasm manzili.

   ⚠️ Bazadagi eski e'lonlarda `img` — `assets/products/textile-01.jpg`, ya'ni
   NISBIY yo'l. U Mini App uchun yozilgan va serverda `/mini-app/assets/...`
   ostida yotadi; sayt ildizida esa bunday fayl YO'Q. Nisbiy yo'l shundoq
   qo'yilsa `lolamarket.uz/assets/products/textile-01.jpg` so'raladi va nginx
   `try_files ... /index.html` bilan **HTTP 200 va HTML** qaytaradi — ya'ni
   rasm sindi, lekin holat kodi sog'lom ko'rinadi (CLAUDE.md dagi o'sha
   soft-200 tuzog'i; 2026-08-12 da `curl` bilan o'lchandi:
   `200 text/html`). Shuning uchun nisbiy yo'l Mini App papkasiga
   yo'naltiriladi — fayl HAQIQATAN o'sha yerda (`200 image/jpeg`).

   Sotuvchi qo'shgan yangi e'lonlarda `img` allaqachon to'liq manzil bo'ladi:
   `https://cdn.lolamarket.uz/...` (R2) yoki `/api/product-photo?...`
   (Telegram proksi) — ular tegilmaydi. */
function apiImgUrl(u) {
  const s = String(u || '');
  if (!s) return '';
  if (/^(https?:)?\/\//.test(s) || s.charAt(0) === '/') return s;
  // Mutlaq yo'l — nisbiy emas: nisbiysi joriy sahifa manziliga bog'lanadi va
  // katalog ildizdan boshqa yo'lda ochilsa jimgina sinardi.
  return '/mini-app/' + s.replace(/^\.?\//, '');
}

/** API yozuvidan kartochka HTML'i — HTML'dagi qo'lda yozilgan kartochka bilan
    bir xil tuzilma (`data-*`, `act-<id>`, `fav-<id>`), aks holda savat va
    saralanganlar bu kartochkalarni ko'rmasdi. */
function apiCardHtml(p) {
  const name = L(p.name) || p.id;
  const supplier = L(p.supplier) || '';
  const img = apiImgUrl(p.img);
  const st = stockView(p);
  // Belgi: sotuvchi bergani ustun, bo'lmasa zaxira holati (faqat diqqat
  // talab qiladigani — "Sotuvda" har kartochkada takrorlansa shovqin bo'ladi)
  const badgeTxt = L(p.badge) || (st.key === 'low' || st.key === 'out' || st.key === 'made' ? st.txt : '');
  const badgeCls = BADGE_TONE[p.badgeTone] || (st.key === 'out' ? 'tone-neutral' : st.key === 'low' ? 'tone-saffron' : 'tone-teal');

  return `
    <article class="product-card fade-up" data-id="${esc(p.id)}" data-name="${esc(name)}" data-price="${esc(String(p.price))}" data-supplier="${esc(supplier)}" data-cat="${esc(p.catKey || '')}"${p.createdAt ? ` data-created="${esc(String(p.createdAt))}"` : ''}>
      <div class="product-media"${p.video ? ` data-video="${esc(p.video)}"${p.videoPoster ? ` data-poster="${esc(p.videoPoster)}"` : ''}` : ''}>
        ${img ? `<img src="${esc(img)}" alt="${esc(name)}" loading="lazy" />` : ''}
        ${badgeTxt ? `<span class="badge-pill ${badgeCls}">${esc(badgeTxt)}</span>` : ''}
        <button class="fav-btn" data-fav="${esc(p.id)}" data-action="toggleFav" data-arg="${esc(p.id)}" aria-label="Saralanganlarga qo'shish" aria-pressed="false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 20.8s-6.9-4.3-9-8a5.2 5.2 0 0 1-.5-3.7A4.8 4.8 0 0 1 6.3 5.5c1.9 0 3.4 1 4.3 2.3.4.6 1 .6 1.4 0 .9-1.3 2.4-2.3 4.3-2.3a4.8 4.8 0 0 1 3.8 3.6 5.2 5.2 0 0 1-.5 3.7c-2.1 3.7-9 8-9 8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <div class="product-body">
        <div class="product-name">${esc(name)}</div>
        <div class="product-supplier">
          <span>${esc(supplier)}</span>
          ${p.verified ? `<span class="verified" title="LolaMarket tomonidan tasdiqlangan ishlab chiqaruvchi" aria-label="LolaMarket tomonidan tasdiqlangan ishlab chiqaruvchi"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.6 1.5-.9 2.9.9 2.9-2.6 1.5-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8L3 16.3l.9-2.9L3 10.5l2.6-1.5 1-2.8 3 .2z"/><path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>` : ''}
        </div>
        <div class="product-price">
          <span class="price-label">${t(p.unit === 'panel' ? 'unitPricePanel' : 'unitPrice')}</span>
          <span class="price-value">${money(Number(p.price) || 0)}</span>
        </div>
        <div class="card-action" data-act="${esc(p.id)}"></div>
      </div>
    </article>`;
}

/* Yangi kartochka HTML'dagilar bilan bir xil imkoniyatga ega bo'lsin:
   ko'rinish animatsiyasi va klaviatura bilan ochilishi. Init blokidagi
   sozlash faqat sahifa yuklanganda mavjud kartochkalar ustidan yurgan.

   ⚠️ `reveal = false` — kartochka DARHOL ko'rinsin, kuzatuvchini kutmasin.
   `.fade-up` `opacity: 0` dan boshlanadi va uni `IntersectionObserver`
   yoqadi; mahsulot sahifasidagi "o'xshash matolar" esa sahifa bilan BIRGA
   chiziladi va o'sha onda ekrandan pastda bo'ladi, ya'ni kuzatuvchi
   otilmaydi. O'lchandi (2026-08-16): to'rtala nusxa ham `opacity: 0` da
   qolgan — DOM'da bor, o'lchamlari to'g'ri (394px), konsol jim, lekin
   bo'lim KO'ZGA BO'SH ko'rinardi. Aynan shu sabab uni faqat rasmga
   olganda ko'rdim, DOM tekshiruvi esa "4 ta kartochka bor" deb
   yashil javob bergandi. */
function equipCard(card, reveal) {
  if (reveal === false) card.classList.remove('fade-up');
  else observer.observe(card);
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', (card.dataset.name || 'Mahsulot') + ' — batafsil');
  card.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (e.target !== card) return;
    e.preventDefault();
    openDetail(card.dataset.id);
  });
}

function mergeCatalog(list) {
  if (!grid || !Array.isArray(list) || !list.length) return;

  const seen = new Set();
  const added = [];

  list.forEach((p) => {
    if (!p || !p.id) return;
    seen.add(p.id);
    if (stockView(p).soldOut) soldOutIds.add(p.id); else soldOutIds.delete(p.id);

    const el = productEl(p.id);
    if (!el) { added.push(apiCardHtml(p)); return; }

    // ---- Allaqachon HTML'da bor: narxni bazadagiga tenglashtiramiz ----
    // Ko'rsatilgan narx bazadagidan ajralib ketmasin. Buyurtma summasini
    // baribir server hisoblaydi (`submitOrder` izohi), ya'ni eskirgan narx
    // xaridorga BOSHQA raqam va'da qilib, checkout'da uchinchisini
    // ko'rsatardi.
    const price = Number(p.price) || 0;
    if (price && Number(el.dataset.price) !== price) {
      el.dataset.price = String(price);
      const box = el.querySelector('.price-value');
      if (box) box.textContent = money(price);
    }

    // ---- Nom va sotuvchi — JORIY TILDA (2026-08-13, C3) ----
    // ⚠️ Bu qadam sinovda TOPILDI va usiz til almashtirish yarim ishlardi:
    // sahifa chetlari ruschaga o'tar, kartochkalar esa o'zbekcha nom bilan
    // qolardi — ya'ni "til almashdi" degan taassurot YOLG'ON bo'lardi.
    // `data-name` ham yangilanadi, chunki qidiruv aynan shundan o'qiydi
    // (`applyFilter`) — aks holda rus tilida yozib qidirgan odam hech narsa
    // topmasdi.
    const nom = L(p.name);
    if (nom && el.dataset.name !== nom) {
      el.dataset.name = nom;
      const t1 = el.querySelector('.product-name');
      if (t1) t1.textContent = nom;
    }
    // Belgi ("Tavsiya", "Kam qoldi") — HTML kartochkasida qattiq yozilgan,
    // shuning uchun til almashganda u ham yangilanadi. Bazadan kelgan belgi
    // ustun; bo'lmasa HTML dagi o'zbekcha matn kalitga MOSLANADI.
    const belgi = el.querySelector('.badge-pill');
    if (belgi) {
      const bz = L(p.badge) || BADGE_UZ[belgi.dataset.badgeKey || ''] || '';
      if (!belgi.dataset.badgeKey) {
        const topildi = Object.keys(BADGE_UZ).find((k) => BADGE_UZ[k] === belgi.textContent.trim());
        if (topildi) belgi.dataset.badgeKey = topildi;
      }
      const kalit = belgi.dataset.badgeKey;
      const matn = L(p.badge) || (kalit ? t(kalit) : '');
      if (matn) belgi.textContent = matn;
    }

    const sup = L(p.supplier);
    if (sup && el.dataset.supplier !== sup) {
      el.dataset.supplier = sup;
      // ⚠️ `.product-supplier` ICHIDA tasdiqlangan belgisi (`.verified`) ham
      // bor — butun blokka `textContent` berilsa u O'CHIB KETARDI. Shuning
      // uchun faqat BIRINCHI `<span>` almashtiriladi.
      const t2 = el.querySelector('.product-supplier span:not(.verified)');
      if (t2) t2.textContent = sup;
    }
  });

  // ---- Bazada yo'q kartochkalarni olib tashlaymiz ----
  // Aynan `ik-9001` toifasi: kartochka savat tugmasi bilan turadi, lekin
  // buyurtma serverda rad etiladi. Bu qadam nuqsonni O'ZI TUZATADIGAN
  // qiladi — kelajakda e'lon bazadan olinsa saytda qolib ketmaydi.
  grid.querySelectorAll('.product-card[data-id]').forEach((el) => {
    if (!seen.has(el.dataset.id)) el.remove();
  });

  if (added.length) {
    const box = document.createElement('div');
    box.innerHTML = added.join('');
    [...box.children].forEach((card) => { grid.appendChild(card); equipCard(card); });
  }

  renderAllCardActions();
  renderAllFavBtns();
  applyFilter();
}

/* Katalog so'rovi tugagach (muvaffaqiyat ham, xato ham) bir marta chaqiriladi.

   Savat va saralanganlar `localStorage` da yotadi va ilgari sahifa
   yuklanayotganda DOM'ga qarab tozalanardi. Endi bu MUMKIN EMAS: o'sha
   ondagi DOM'da faqat HTML'dagi kartochkalar bor, sotuvchi e'lonlari esa
   hali kelmagan — ya'ni tozalash xaridorning savatidagi haqiqiy mahsulotni
   "yo'q ekan" deb tashlab yuborardi. Shuning uchun tozalash katalog
   joyiga tushgandan KEYINGA suriladi. */
function settleCatalog() {
  let changed = false;
  Object.keys(cart).forEach((id) => {
    if (!productEl(id)) { delete cart[id]; changed = true; }
  });
  const keepFavs = favs.filter((id) => productEl(id));
  if (keepFavs.length !== favs.length) { favs = keepFavs; saveFavs(); }
  if (changed) saveCart();

  updateBadge();
  updateFavBadge();
  if (isOpen()) renderDrawer();

  /* Manzilda mahsulot havolasi bo'lsa (`#/mahsulot/<id>`) — o'sha sahifa
     ochiladi. AYNAN SHU YERDA, chunki kartochkalar hozirgina joyiga tushdi:
     ilgariroq urinilsa `product()` bazadan kelgan e'lonni topa olmasdi va
     ulashilgan havola jimgina katalogni ochib qo'yardi. */
  const havola = pdpFromUrl();
  if (havola && !pdpId && product(havola)) openDetail(havola);
}

function loadReviews(id) {
  if (reviewsCache[id] !== undefined) return;
  apiJson('/api/reviews?productId=' + encodeURIComponent(id))
    .then((d) => {
      const list = d && d.ok ? d.data : null;
      if (!Array.isArray(list)) return;
      reviewsCache[id] = list;
      if (pdpId === id) renderPdpReviews();
    })
    .catch(() => { /* sharhsiz ham detal ishlaydi */ });
}

function loadMyReviews() {
  if (!me) { myReviews = []; return; }
  apiJson('/api/reviews?mine=1')
    .then((d) => { myReviews = d && d.ok && Array.isArray(d.data) ? d.data : []; })
    .catch(() => { myReviews = []; })
    .then(() => { if (isOpen() && drawerView === 'orders') renderDrawer(); });
}

function starsHtml(n, cls) {
  const full = Math.max(0, Math.min(5, Math.floor(n)));
  return `<span class="stars ${cls || ''}" aria-label="${full} yulduz">${
    '★'.repeat(full)}<span class="stars-empty">${'☆'.repeat(5 - full)}</span></span>`;
}

/* ====================================================
   AI KIYIM RASMI — SAYTDA (2026-08-13, C1)

   Mini App'dagi bo'lim (`telegram-app/app.js` → `aiImageSection`) saytga
   olib o'tildi. Endpointlar AYNI: `/api/ai/image`, `/api/ai/my`. Ikki
   kanalning yagona farqi KIMLIKDA:
     * Mini App — imzolangan `initData` header'da;
     * sayt — HttpOnly cookie sessiyasi, ya'ni bu yerda hech qanday header
       qo'shilmaydi, faqat `credentials: 'same-origin'` (`apiJson` shuni
       qiladi).
   Server ikkalasini `requestUser()` bilan BITTA shaklga keltiradi
   (CLAUDE.md — "kimlik ikki kanalda bitta nuqtadan").

   ⚠️ SAVOL KALITLARI SERVERDAN keladi (`/api/auth/web/me` → `aiClientConfig`)
   va bu yerda QO'LDA yozilmaydi. Yorliqlar (o'zbekcha matn) esa frontendda —
   Mini App'dagi bilan bir xil bo'linish. Sabab: kalit ikki joyda yozilsa
   ular ajralib ketardi va sayt xaridori serverning oq ro'yxatidan
   o'tmaydigan javob yuborib, tugmani bosgach 400 xato ko'rardi — ustiga bu
   PULLIK so'rov (db/014 darsi).

   ⚠️ AVTOMATIK YUKLASH YO'Q — bu qaror Mini App'dan ko'chdi va sabab
   XARAJATDA: bitta rasm ~$0.04 va 2 Lola credit. Kirish nuqtasi doim TUGMA.
   ==================================================== */

/** Serverdan kelgan sozlama. `null` — hali kelmagan yoki AI o'chiq */
let aiCfg = null;
/** productId → { state: 'loading'|'done'|'error'|... , url } */
const aiImages = {};
/** productId → { guruh: kalit } */
const aiChoices = {};
/** productId → erkin matn (faqat combo) */
const aiText = {};
/** productId → "boshqa fason" varianti (0 = birinchi) */
const aiVariant = {};
/** { balance, cost, unlimited } — serverdan. `null` bo'lsa qator CHIZILMAYDI */
let aiCredits = null;

/* Yorliqlar — kalitlar serverdan, matn shu yerda (Mini App bilan bir xil).
   ⚠️ Yorliq topilmasa kalitning O'ZI chiziladi: jimgina yo'qolib qolgandan
   ko'ra "notanish kalit" ko'rinib turgani yaxshi. */
/* ⚠️ Savol va javob yorliqlari IKKI TILDA (2026-08-13). Dastlab bu yerda
   faqat o'zbekchasi turardi va rus tilida AI bloki YARIM tarjima bo'lib
   qolardi: sarlavha va tugma ruscha, savollar esa o'zbekcha. Bu jonli
   saytda o'lchab topildi, kod o'qib emas.
   Yorliqlar Mini App'dagi (`telegram-app/app.js` → `STR.*.aiQ` / `aiO`)
   bilan AYNI — ikki yuzada bir xil savol boshqacha nomlanmasin. */
const AI_Q = {
  uz: {
    kiyim: "Nima tikilsin?", uslub: "Qayerga?", dizayn: "Dizayn yo'nalishi",
    rang: "Qo'shimcha rang", qoshimcha: "Qo'shimcha material",
  },
  ru: {
    kiyim: 'Что сшить?', uslub: 'Куда?', dizayn: 'Направление дизайна',
    rang: 'Дополнительный цвет', qoshimcha: 'Доп. материал',
  },
};
const AI_O = {
  uz: {
    koylak_milliy: 'Milliy ko\'ylak', koylak: 'Ko\'ylak', kostyum: 'Kostyum',
    palto: 'Palto', yubka: 'Yubka', romol: 'Ro\'mol',
    kundalik: 'Kundalik', bayram: 'Bayram / to\'y', ish: 'Ish',
    neoklassika: 'Neoklassika', zamonaviy: 'Zamonaviy',
    minimalistik: 'Minimalistik', combo: 'Combo',
    oq: 'Oq', qora: 'Qora', bej: 'Bej', kok: 'Ko\'k',
    yashil: 'Yashil', bordo: 'Bordo', oltin: 'Oltin',
    yoq: 'Yo\'q', charm: 'Charm', jinsi: 'Jinsi',
    bahmal: 'Bahmal', dantel: 'Dantel', trikotaj: 'Trikotaj',
  },
  ru: {
    koylak_milliy: 'Нац. платье', koylak: 'Платье', kostyum: 'Костюм',
    palto: 'Пальто', yubka: 'Юбка', romol: 'Платок',
    kundalik: 'Повседневно', bayram: 'Праздник / свадьба', ish: 'Работа',
    neoklassika: 'Неоклассика', zamonaviy: 'Современный',
    minimalistik: 'Минимализм', combo: 'Комбо',
    oq: 'Белый', qora: 'Чёрный', bej: 'Бежевый', kok: 'Синий',
    yashil: 'Зелёный', bordo: 'Бордовый', oltin: 'Золотой',
    yoq: 'Нет', charm: 'Кожа', jinsi: 'Джинса',
    bahmal: 'Бархат', dantel: 'Кружево', trikotaj: 'Трикотаж',
  },
};

/* Yorliqni joriy tilda beradi. Topilmasa KALITNING O'ZI qaytadi —
   serverdan yangi kalit kelsa u jimgina yo'qolib qolmasin. */
function aiLabel(jadval, k) {
  const tbl = jadval[LANG] || jadval.uz;
  return (tbl && tbl[k]) || jadval.uz[k] || k;
}

/** Serverdan kelgan AI sozlamasini SHAKLI bo'yicha qabul qiladi.
    ⚠️ `!= null` yetarli emas (CLAUDE.md — "sozlama qiymati bo'sh emasligi
    uni haqiqiy qilmaydi"): bo'sh obyekt kelsa bo'lim savolsiz chizilib,
    tugma bosilgach server 400 berardi. Shakl noto'g'ri bo'lsa `aiCfg` `null`
    qoladi va bo'lim UMUMAN ko'rsatilmaydi. */
function readAiConfig(d) {
  if (!d || !d.aiImageEnabled) return null;
  const g = d.aiImageChoices;
  if (!g || typeof g !== 'object' || !Object.keys(g).length) return null;
  const toza = {};
  Object.keys(g).forEach((k) => { if (Array.isArray(g[k]) && g[k].length) toza[k] = g[k]; });
  if (Object.keys(toza).length !== Object.keys(g).length) return null;
  const combo = d.aiComboChoices && typeof d.aiComboChoices === 'object' ? d.aiComboChoices : null;
  return {
    keys: toza,
    comboKeys: combo,
    textMax: Number.isInteger(d.aiComboTextMax) && d.aiComboTextMax > 0 ? d.aiComboTextMax : 60,
    variantMax: Number.isInteger(d.aiVariantMax) && d.aiVariantMax > 0 ? d.aiVariantMax : 0,
  };
}

/** Kredit qatori. `null` bo'lsa UMUMAN chizilmaydi — CLAUDE.md: ma'lumot
    bazadan kelmasa blok ko'rsatilmaydi (o'ylab topilgan raqam qo'yilmaydi). */
function aiCreditLine() {
  if (!aiCredits) return '';
  const matn = aiCredits.unlimited
    ? t('aiCreditsUnlimited')
    : t('aiCreditsLeft').replace('{n}', aiCredits.balance).replace('{c}', aiCredits.cost);
  return `<div class="ai-count" style="margin-top:8px">✦ ${esc(matn)}</div>`;
}

/* "Boshqa fason" tugmasi. Chegaraga yetganda UMUMAN chizilmaydi (o'chirilgan
   holda qoldirilmaydi): bosilmaydigan tugma xaridorga nima qilish kerakligini
   aytmaydi, yo'q tugma esa savol tug'dirmaydi. Narx tugmaning O'ZIDA — bu
   YANGI kesh kaliti, ya'ni yangi rasm va yangi kredit. */
function aiOtherCutBtn(id) {
  const joriy = aiVariant[id] || 0;
  if (!aiCfg || !aiCfg.variantMax || joriy >= aiCfg.variantMax) return '';
  const narx = aiCredits && aiCredits.cost;
  return `<button class="ai-ghost" data-action="otherCutAiImage" data-arg="${esc(id)}">✦ ${
    esc(t('aiOtherCut') + (narx ? ` · ${t('aiOtherCutHint').replace('{n}', narx)}` : ''))}</button>`;
}

/** Mahsulot tafsilotidagi AI bloki. Bo'sh satr = blok umuman yo'q. */
function aiSection(id) {
  if (!aiCfg) return '';
  const head = `<div class="pd-sec-title">${t('aiTitle')}</div>`;
  const st = aiImages[id];

  // Holat 1 — savollar.
  // ⚠️ Zaxira javob ATAYLAB YO'Q: hammasi tanlanmaguncha tugma o'chiq turadi.
  // Sabab pulda — oldindan to'ldirilgan javob bilan xaridor o'zi tanlamagan
  // narsani chizdirib yuborardi.
  if (!st) {
    const tanlov = aiChoices[id] || {};
    // Combo savollari SHARTLI: `dizayn = combo` tanlanmaguncha chizilmaydi
    // va majburiy ham emas.
    const combo = tanlov.dizayn === 'combo' && aiCfg.comboKeys;
    const guruhlar = Object.keys(aiCfg.keys).concat(combo ? Object.keys(aiCfg.comboKeys) : []);
    const kalitlar = (g) => aiCfg.keys[g] || (aiCfg.comboKeys && aiCfg.comboKeys[g]) || [];

    const savollar = guruhlar.map((guruh, i) => `
      <div class="ai-q">
        <span class="ai-q-num">${i + 1}</span>
        <span class="ai-q-label">${esc(aiLabel(AI_Q, guruh))}</span>
      </div>
      <div class="ai-chips">
        ${kalitlar(guruh).map((k) => `
          <button class="ai-chip${tanlov[guruh] === k ? ' on' : ''}" data-action="pickAiChoice" data-arg="${esc(id)}|${esc(guruh)}|${esc(k)}">${esc(aiLabel(AI_O, k))}</button>`).join('')}
      </div>`).join('');

    // Erkin matn (faqat combo). Belgilar ro'yxati bu yerda TAKRORLANMAYDI —
    // tekshiruv faqat serverda (`cleanComboText`); `maxlength` ham serverdan.
    const matnBlok = combo ? `
      <div class="ai-q" style="margin-top:12px">
        <span class="ai-q-num">✎</span>
        <span class="ai-q-label">${t('aiTextQ')}</span>
      </div>
      <input class="ai-text" type="text" data-input="setAiText" data-arg="${esc(id)}"
             value="${esc(aiText[id] || '')}" maxlength="${aiCfg.textMax}"
             placeholder="${t('aiTextPh')}" />` : '';

    const nechta = guruhlar.filter((g) => tanlov[g]).length;
    const tayyor = nechta === guruhlar.length;

    // ⚠️ Kirmagan foydalanuvchiga bo'lim BARIBIR ko'rsatiladi, faqat tugma
    // o'rniga "Kirish" turadi. Blokni butunlay yashirish oson yo'l edi, lekin
    // o'shanda funksiya kirmagan odam uchun MAVJUD EMASday ko'rinardi va u
    // nima uchun kirishi kerakligini bilmasdi.
    const cta = me
      ? `<button class="ai-cta" data-action="askAiImage" data-arg="${esc(id)}"${tayyor ? '' : ' disabled'}>${tayyor ? '✦ ' : ''}${t('aiGo')}</button>`
      : `<button class="ai-cta" data-action="loginForAi">${t('aiLoginCta')}</button>`;

    return `${head}
      <div class="ai-card">
        <div class="ai-lead">
          <span class="ai-lead-icon">🧵</span>
          <span>${t('aiSub')}</span>
        </div>
        ${savollar}
        ${matnBlok}
        ${tayyor || !me ? '' : `<div class="ai-count">${esc(t('aiPicked').replace('{m}', guruhlar.length).replace('{n}', nechta))}</div>`}
        ${me ? aiCreditLine() : ''}
        ${cta}
      </div>`;
  }

  // Holat 2 — yuklanmoqda: 3:4 skelet (rasm chiqadigan joyning o'zi) ichida
  // tikuv choki "tikilib boradi", pastda ~30 soniyaga mo'ljallangan sekin
  // to'ladigan chiziq. Chiziq 92% da to'xtaydi — javob kelganda blok butunlay
  // almashadi, ya'ni "100% bo'ldi-yu hech narsa chiqmadi" holati bo'lmaydi.
  if (st.state === 'loading') {
    return `${head}
      <div class="ai-wait">
        <div class="ai-skel" aria-hidden="true">
          <svg class="ai-stitch" viewBox="0 0 132 44" fill="none">
            <path class="ai-stitch-path" d="M6 30 C 30 10, 52 38, 78 20 S 114 26, 126 14" />
            <path class="ai-needle" d="M112 22 L127 13 L124 19 Z" />
          </svg>
        </div>
        <div class="ai-wait-msg">${t('aiWaitMsg')}</div>
        <div class="ai-bar30"><span></span></div>
      </div>`;
  }

  // Holat 3 — surat yo'q. Bu XATO EMAS, shuning uchun qayta urinish tugmasi
  // ham YO'Q: qayta bosish natijani o'zgartirmasdi va kredit yeyilardi.
  if (st.state === 'nophoto') {
    return `${head}<div class="ai-msg ai-msg-plain">${t('aiNoPhoto')}</div>`;
  }

  // Holat 4 — kredit tugadi. ⚠️ "Ertaga yangilanadi" DEYILMAYDI: kredit
  // qoldiq, u o'zi tiklanmaydi va bunday xabar jimgina yolg'on bo'lardi.
  if (st.state === 'nocredit') {
    return `${head}<div class="ai-msg ai-msg-warn">${t('aiNoCredit')}</div>`;
  }

  if (st.state === 'badtext') {
    return `${head}
      <div class="ai-msg ai-msg-warn">
        ${t('aiBadText')}
        <button class="ai-ghost" data-action="resetAiImage" data-arg="${esc(id)}">${t('aiAgain')}</button>
      </div>`;
  }

  // Provayder band — bu NOSOZLIK EMAS: server allaqachon uch marta urinib
  // ko'rgan va kredit qaytarilgan. Shuning uchun qayta urinish MA'NOLI.
  if (st.state === 'busy') {
    return `${head}
      <div class="ai-msg ai-msg-warn">
        ${t('aiBusy')}
        <button class="ai-ghost" data-action="askAiImage" data-arg="${esc(id)}">${t('aiRetry')}</button>
      </div>`;
  }

  // Model rad etdi. ⚠️ Tugma "qayta urinish" EMAS: ayni javoblar ayni rad
  // javobini beradi. Yagona foydali harakat — javoblarni o'zgartirish.
  if (st.state === 'blocked') {
    return `${head}
      <div class="ai-msg ai-msg-warn">
        ${t('aiBlocked')}
        <button class="ai-ghost" data-action="resetAiImage" data-arg="${esc(id)}">${t('aiAgain')}</button>
      </div>`;
  }

  // Kirish talab qilindi (sessiya eskirgan). Alohida holat: umumiy xato
  // ko'rsatilsa xaridor qayta-qayta bosib, hech qachon kirmasdi.
  if (st.state === 'noauth') {
    return `${head}
      <div class="ai-msg ai-msg-warn">
        ${t('aiNoAuth')}
        <button class="ai-ghost" data-action="loginForAi">${t('login')}</button>
      </div>`;
  }

  // Texnik xato. ⚠️ Zaxira sifatida "namunaviy rasm" ATAYLAB ko'rsatilmaydi:
  // u AI ishlamayotganini yashirardi ("jimgina yolg'on yo'qlikdan yomonroq").
  if (st.state === 'error') {
    return `${head}
      <div class="ai-msg ai-msg-err">
        ${t('aiError')}
        <button class="ai-ghost" data-action="askAiImage" data-arg="${esc(id)}">${t('aiRetry')}</button>
      </div>`;
  }

  // Natija. ⚠️ Yorliq rasm bilan BITTA blokda va uning ICHIDA turadi —
  // pastda alohida qatorda emas: skrinshot olinganda kadrdan chiqib ketmasin.
  // `fresh` bir MARTALIK: o'qilgach o'chiriladi, ya'ni keyingi qayta
  // chizishlar (savat ochildi, filtr o'zgardi) animatsiyani takrorlamaydi.
  const yangi = st.fresh; st.fresh = false;
  return `${head}
    <figure class="ai-figure${yangi ? ' ai-reveal' : ''}">
      <img src="${esc(st.url)}" alt="AI kiyim rasmi" loading="lazy" />
      <figcaption class="ai-note"><span>⚠️</span><span>${t('aiNote')}</span></figcaption>
    </figure>
    <div class="ai-acts">
      ${aiOtherCutBtn(id)}
      <button class="ai-ghost" data-action="resetAiImage" data-arg="${esc(id)}">${t('aiAgain')}</button>
      <button class="ai-ghost" data-action="shareAiImage" data-arg="${esc(st.url)}">${t('aiShare')}</button>
    </div>
    ${aiCreditLine()}`;
}

/* AI blokini qayta chizish — foydalanuvchi boshqa mahsulotga o'tib ketgan
   bo'lsa hech narsa qilmaydi (`loadReviews` dagi bilan bir xil naqsh).
   ⚠️ BUTUN sahifa emas, faqat AI bloki: sahifa qayta yozilsa galereya
   boshiga qaytardi va o'ynab turgan video uzilardi. */
function repaintDetail(id) {
  if (pdpId === id) renderPdpAi();
}

/* Chip bosilganda. Argument `id|guruh|kalit` — delegatsiya bitta `data-arg`
   beradi, shuning uchun `|` bilan kodlanadi (`qtyStep` dagi bilan ayni
   konvensiya).
   ⚠️ Bu yerda TEKSHIRUV yo'q: serverdan kelmagan kalit umuman chizilmaydi,
   server esa har so'rovda o'z oq ro'yxatidan mustaqil o'tkazadi. */
function pickAiChoice(arg) {
  const [id, guruh, kalit] = String(arg).split('|');
  if (!id || !guruh || !kalit) return;
  aiChoices[id] = Object.assign({}, aiChoices[id] || {}, { [guruh]: kalit });
  // ⚠️ Javob o'zgarsa variant NOLGA qaytadi. Aks holda xaridor "palto" dan
  // "ko'ylak" ga o'tganda darrov 3-fason so'ralgan bo'lardi — ya'ni u
  // so'ramagan variant uchun kredit ketardi va sababi ko'rinmasdi.
  delete aiVariant[id];
  repaintDetail(id);
}

/* Erkin matn. ⚠️ Bu yerda QAYTA CHIZISH YO'Q: `renderDrawer()` butun tanani
   qayta yozadi va har harfda kursor maydondan uchib ketardi (saytdagi boshqa
   matn maydonlari ham shu naqshda — `onReviewBody`, `onDisputeComment`). */
function setAiText(qiymat, id) {
  aiText[String(id)] = String(qiymat || '');
}

/* "Boshqacha chizish" — natijani tozalaydi va savollarga QAYTARADI.
   Javoblar SAQLANADI: xaridor odatda bittasini o'zgartirmoqchi bo'ladi. */
function resetAiImage(id) {
  delete aiImages[String(id)];
  // Variant ham nolga qaytadi — aks holda tekin bo'lishi kerak bo'lgan
  // qaytish jimgina pullik variantda qolib ketardi.
  delete aiVariant[String(id)];
  repaintDetail(String(id));
}

/* "Boshqa fason" — javoblar SAQLANADI, faqat variant raqami oshadi va darrov
   yangi so'rov ketadi. Savollarga QAYTARILMAYDI: xaridor javoblaridan
   mamnun, unga yoqmagani — chizilgan fason.
   ⚠️ Chegara SERVERDAN kelgan qiymat bilan tekshiriladi va bu YAGONA
   tekshiruv emas: server ham mustaqil o'tkazadi. Bu yerdagisi xatoni pul
   sarflanadigan yo'ldan OLDIN ushlaydi. */
function otherCutAiImage(id) {
  const key = String(id);
  const keyingi = (aiVariant[key] || 0) + 1;
  if (!aiCfg || !aiCfg.variantMax || keyingi > aiCfg.variantMax) return;
  aiVariant[key] = keyingi;
  askAiImage(key);
}

/* Kirish — AI blokidan. Kirgandan keyin AYNI mahsulot tafsilotiga qaytadi
   (`afterLoginView`), aks holda xaridor profilga tushib qolib, qaysi matoni
   ko'rayotganini qaytadan qidirardi. */
function loginForAi() {
  afterLoginView = 'detail';
  drawerView = 'login';
  loginState = 'idle';
  loginErr = '';
  renderDrawer();
}

/* Tugma bosilganda. Kimlik cookie sessiyasidan — brauzer hech qanday ID
   yubormaydi (CLAUDE.md: `tg_user_id` klientdan olinmaydi), server uni
   `requestUser()` bilan o'zi aniqlaydi. */
function askAiImage(id) {
  const key = String(id);
  aiImages[key] = { state: 'loading' };
  repaintDetail(key);

  fetch('/api/ai/image', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: key,
      // Matn va variant HAR DOIM yuboriladi — server `dizayn = combo`
      // bo'lmasa matnni, `variant = 0` bo'lsa variantni O'ZI tashlaydi.
      // Klientda ikkinchi tekshiruv yozilmadi: u serverdagi qoidaning
      // nusxasi bo'lardi.
      choices: Object.assign({}, aiChoices[key] || {}, {
        matn: aiText[key] || '',
        variant: aiVariant[key] || 0,
      }),
    }),
  })
    .then((r) => r.json().catch(() => null).then((j) => ({ r, j })))
    .then(({ r, j }) => {
      if (j && j.data && j.data.credits) aiCredits = j.data.credits;
      if (r.status === 401) {
        // Sessiya eskirgan yoki umuman kirilmagan.
        aiImages[key] = { state: 'noauth' };
      } else if (r.status === 429 && j && j.error === 'no_credit') {
        if (j.credits) aiCredits = Object.assign({}, aiCredits || {}, j.credits);
        aiImages[key] = { state: 'nocredit' };
      } else if (r.status === 400 && j && j.error === 'bad_choices') {
        aiImages[key] = { state: 'badtext' };
      } else if (j && j.error === 'ai_busy') {
        aiImages[key] = { state: 'busy' };
      } else if (r.status === 422 && j && j.error === 'ai_blocked') {
        aiImages[key] = { state: 'blocked' };
      } else if (r.status === 422 && j && j.error === 'no_source_photo') {
        aiImages[key] = { state: 'nophoto' };
      } else if (j && j.ok && j.data && j.data.image) {
        // `fresh` — rasm HOZIR chizildi: birinchi chizishda ochilish
        // animatsiyasi o'ynaydi, keyingi qayta chizishlarda o'ynamaydi
        // (galereyadan kelgan eski rasmlar ham animatsiyasiz).
        aiImages[key] = { state: 'done', url: j.data.image, fresh: true };
        konfetti();
      } else {
        aiImages[key] = { state: 'error' };
      }
    })
    .catch(() => { aiImages[key] = { state: 'error' }; })
    .then(() => repaintDetail(key));
}

/* Ulashish — rasm Telegram'da yoki CDN'da yashaydi, ya'ni bu deyarli tekin
   kanal. Mini App'dagi `openTelegramLink` bu yerda yo'q: saytda oddiy
   `window.open` ishlaydi. */
function shareAiImage(url) {
  const s = String(url || '');
  const toliq = s.indexOf('http') === 0 ? s : location.origin + s;
  window.open(
    'https://t.me/share/url?url=' + encodeURIComponent(toliq) +
    '&text=' + encodeURIComponent('AI bilan chizilgan — lolamarket.uz'),
    '_blank'
  );
}

/* Kredit qoldig'ini so'raymiz — SO'RALMASDAN ko'rsatiladi, ya'ni xaridor
   chegarani u TUGAGANDA emas, pul sarflashdan OLDIN ko'radi.
   ⚠️ Xato bo'lsa JIM o'tadi va kredit qatori umuman chizilmaydi: bu yerda
   o'ylab topilgan raqam ko'rsatishdan ko'ra hech narsa ko'rsatmagan yaxshi. */
function loadAiCredits() {
  if (!me || !aiCfg || aiCredits) return;
  apiJson('/api/ai/my')
    .then((d) => {
      if (d && d.ok && d.data && d.data.credits) {
        aiCredits = d.data.credits;
        if (pdpId) renderPdpAi();
      }
    })
    .catch(() => { /* kredit qatori chizilmaydi — nuqson emas */ });
}

/* ====================================================
   SOTUVCHI KABINETI — SAYTDA (2026-08-13, C2)

   Mini App'dagi kabinet (`telegram-app/app.js`) saytga olib o'tildi.
   Endpointlar AYNI: `/api/me`, `/api/seller/products`, `/api/seller/orders`,
   `/api/seller/dispute`, `/api/products` (POST).

   ⚠️ SERVER TOMONI AVVAL TUZATILDI: `requireSeller()` (`lib/auth.js`) ham
   `authUser()` da edi, ya'ni BITTA funksiya beshta endpointni Mini App bilan
   cheklab turardi va sayt sotuvchisi kabinetni umuman ocholmasdi. Bu C1
   dagi AYNI tuzoq — shuning uchun Test 3f uni endi avtomatik qamraydi:
   ro'yxat shu fayldagi `fetch('/api/...')` chaqiruvlaridan yig'iladi.

   ⚠️ ROL SERVERDA ANIQLANADI (`/api/me` → `role` + `seller`). Kabinet
   tugmasi shu javobga qarab chiziladi, lekin bu FAQAT KO'RINISH: har bir
   endpoint rolni mustaqil qayta tekshiradi (tugmani yashirish himoya emas —
   CLAUDE.md, Dars 11).

   ⚠️ RASM YUKLASH SAYTGA QO'SHILMADI va bu ATAYLAB: rasm bot orqali
   so'raladi (`awaiting_image` → Telegram xabari). Saytga fayl yuklashni
   qo'shish yangi yuza, yangi validatsiya va yangi saqlash yo'li demak edi —
   mavjud, ishlab turgan yo'l esa bepul. Sotuvchi baribir Telegram'da.
   ==================================================== */

/** `/api/me` javobi: { role, isAdmin, seller } — `null` bo'lsa hali so'ralmagan */
let sellerMe = null;
/** sotuvchining e'lonlari va buyurtmalari */
let sProducts = [];
let sOrders = [];
let sLoading = false;
let sProdTab = 'active';     // 'active' | 'hidden'
let sOrdTab = 'new';         // 'new' | 'progress' | 'done'
/** orderId → kuzatuv raqami; disputeId → javob matni */
const sTracking = {};
const sDispReply = {};
/** tahrirlanayotgan e'lon id'si; `null` — yangi e'lon */
let sEditId = null;
let pfCat = 'silk';

/* Mahsulot holati — Mini App'dagi `P_STATUS` bilan AYNI ma'no.
   Ranglar mavjud tokenlardan; yangi rang o'ylab topilmadi. */
const P_STATUS = {
  published: { key: 'stPublished', cls: 'ok' },
  pending:   { key: 'stPending', cls: 'wait' },
  rejected:  { key: 'stRejected', cls: 'bad' },
  draft:     { key: 'stDraft', cls: 'off' },
};

/* Buyurtma yorliqlari — Mini App'dagi `ORD_GROUP` bilan AYNI guruhlash */
const ORD_GROUP = {
  new: ['pending'],
  progress: ['confirmed', 'shipped'],
  done: ['delivered', 'cancelled', 'completed', 'refunded'],
};

const P_CATS = [
  { k: 'silk', uz: 'Ipak', ru: 'Шёлк' }, { k: 'ikat', uz: 'Ikat', ru: 'Икат' },
  { k: 'suzani', uz: "So'zana", ru: 'Сюзане' }, { k: 'cotton', uz: 'Paxta', ru: 'Хлопок' },
  { k: 'wool', uz: 'Jun', ru: 'Шерсть' }, { k: 'linen', uz: "Zig'ir", ru: 'Лён' },
];

/* Sotuvchi so'rovi. Kimlik cookie sessiyasidan — `apiJson` bilan AYNI
   naqsh, faqat bu yerda xato YUTILMAYDI: kabinet yozuv amallari qiladi
   (e'lon o'zgartirish, buyurtma qabul qilish) va ular jimgina muvaffaqiyatsiz
   bo'lsa sotuvchi buyurtmani qabul qildim deb o'ylab qolardi. */
function sellerFetch(path, opts) {
  return fetch(path, Object.assign({ credentials: 'same-origin' }, opts || {}, {
    headers: Object.assign({ 'Content-Type': 'application/json' }, (opts && opts.headers) || {}),
  }))
    .then((r) => r.json().catch(() => null).then((j) => {
      if (r.status === 401) throw new Error(t('sExpired'));
      if (r.status === 403) throw new Error(t('sForbidden'));
      if (!j || !j.ok) throw new Error((j && j.error) || t('sFailed'));
      return j.data;
    }));
}

/* "Men kimman" — rol serverdan. Xato bo'lsa JIM o'tadi va kabinet tugmasi
   umuman chizilmaydi: xaridor uchun bu blok mavjud emas, ya'ni "yuklab
   bo'lmadi" va "sotuvchi emassiz" o'rtasida farq yo'q. */
function loadSellerMe() {
  if (!me) return;
  apiJson('/api/me')
    .then((d) => {
      if (!d || !d.ok || !d.data) return;
      sellerMe = d.data;
      // Doimiy olish nuqtasi BAZADAN — u Mini App'da yoki boshqa
      // qurilmada tanlangan bo'lishi mumkin.
      // ⚠️ Haqiqat manbai — BAZA: server "tanlanmagan" desa, brauzerdagi
      // eski qiymat uni bosib turmaydi, aks holda boshqa qurilmada
      // o'chirilgan tanlov bu yerda tirilib qolardi.
      if (d.data.pickupPointId !== undefined) {
        setBtsPoint(btsById(d.data.pickupPointId) ? d.data.pickupPointId : null);
      }
      if (isOpen() && drawerView === 'profile') renderDrawer();
    })
    .catch(() => { /* kabinet tugmasi chizilmaydi */ });
}

/** E'lonlar va buyurtmalar — ikkalasi birga, kabinet ochilganda */
function loadSellerData() {
  sLoading = true;
  return Promise.all([
    sellerFetch('/api/seller/products').catch(() => []),
    sellerFetch('/api/seller/orders').catch(() => []),
  ]).then(([p, o]) => {
    sProducts = Array.isArray(p) ? p : [];
    sOrders = Array.isArray(o) ? o : [];
    sLoading = false;
    if (isOpen() && drawerView.indexOf('seller') === 0) renderDrawer();
  });
}

function openSellerCabinet() {
  drawerView = 'seller-products';
  renderDrawer();
  openDrawerEl();
  loadSellerData();
}

function sellerTab(k) {
  drawerView = k === 'orders' ? 'seller-orders' : 'seller-products';
  renderDrawer();
}

function setSProdTab(k) { sProdTab = k === 'hidden' ? 'hidden' : 'active'; renderDrawer(); }
function setSOrdTab(k) { sOrdTab = ORD_GROUP[k] ? k : 'new'; renderDrawer(); }

/** Kabinet sarlavhasi — ikkala ro'yxat uchun bitta yorliq qatori */
function sellerTabsHtml(active) {
  const yangi = sOrders.filter((o) => ORD_GROUP.new.includes(o.statusKey)).length;
  return `
    <div class="s-tabs">
      <button class="s-tab${active === 'products' ? ' on' : ''}" data-action="sellerTab" data-arg="products">${t('sMyProducts')}</button>
      <button class="s-tab${active === 'orders' ? ' on' : ''}" data-action="sellerTab" data-arg="orders">${t('sOrders')}${yangi ? ` · ${yangi}` : ''}</button>
    </div>`;
}

/* ── Video holati (sotuvchining O'Z kabineti) ──
   Uch holat va ular ATAYLAB ajratilgan: video BOR · oyna OCHIQ (kutilmoqda) ·
   yo'l YOPIQ. Uchinchisida tugma chiziladi, birinchi ikkitasida MATN — chunki
   oyna allaqachon ochiq bo'lsa tugma ikkinchi yo'l bo'lardi va sotuvchini
   "yana bir marta so'rash" kerakdek his qildirardi (CLAUDE.md: mavjud
   funksiyaga ikkinchi yo'l qo'shilmasin).

   ⚠️ Rasmdan farqi bor: rasmsiz e'lon katalogda UMUMAN ko'rinmaydi, video esa
   IXTIYORIY. Shuning uchun bu blok ogohlantirish (`warn`) emas — video yo'q
   bo'lishi nuqson emas. */
function videoNoteHtml(p) {
  // ⚠️ ESKI BACKEND — BLOK UMUMAN CHIZILMAYDI. CI faqat frontendni chiqaradi
  // (`server/` qo'lda rsync qilinadi), ya'ni "yangi frontend + eski backend"
  // oynasi HAR DOIM bo'ladi. O'shanda `awaitingVideo` `undefined` bo'lib
  // tugma chizilardi, `request_video` esa eski backendda amal sifatida
  // tanilmay tahrirlash yo'liga tushib 400 qaytarardi — ya'ni O'LIK TUGMA.
  // `renderUsers`/`renderGrowth` bilan bitta qoida: maydon yo'q bo'lsa blok
  // yo'q, nol yoki taxmin ko'rsatilmaydi.
  if (p.awaitingVideo === undefined) return '';
  // Oyna OCHIQ — tugma yo'q: yo'l allaqachon bor, tugma uni ikkilantirardi.
  if (p.awaitingVideo) return `<div class="s-note info">🎬 ${t('sVidWaiting')}</div>`;
  // Video BOR — almashtirish yo'li ochiladi. Bu ham bo'shliq edi: video
  // qabul qilingach oyna yopiladi va sotuvchi yomon videoni butun e'lonni
  // qayta yaratmasdan almashtira olmasdi.
  const yorliq = p.video ? t('sVidReplace') : t('sVidAdd');
  return `<div class="s-note info">
    <span>${p.video ? `✅ ${t('sVidOn')}` : ''}</span>
    <button class="s-mini" data-action="requestProductVideo" data-arg="${esc(p.id)}">${yorliq}</button>
  </div>`;
}

/* ── E'lonlarim ──
   ⚠️ Bu ro'yxat sotuvchi API'sidan XOM keladi va `vm()` chegarasidan
   O'TMAYDI (u Mini App'da), shuning uchun har bir matn chizish joyida
   `esc()` dan o'tkaziladi — CLAUDE.md dagi XSS qoidasi. */
function sellerProductsHtml() {
  const active = sProducts.filter((p) => p.status !== 'draft');
  const hidden = sProducts.filter((p) => p.status === 'draft');
  const list = sProdTab === 'hidden' ? hidden : active;

  const cards = sLoading
    ? `<div class="co-hint" style="text-align:center;padding:14px 0">${t('loading')}</div>`
    : !list.length
      ? `<div class="pd-rev-empty">
           <div class="pd-rev-empty-t">${sProdTab === 'hidden' ? t('sNoHidden') : t('sNoProducts')}</div>
           <div class="pd-rev-empty-s">${t('sNoProductsSub')}</div>
         </div>`
      : list.map((p) => {
        const st = P_STATUS[p.status] || P_STATUS.draft;
        const nom = L(p.name) || p.id;
        return `
        <div class="s-card">
          <div class="s-row">
            <div class="s-thumb">${p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy" />` : ''}</div>
            <div class="s-info">
              <div class="s-name">${esc(nom)}</div>
              <div class="s-meta">${money(p.price)} · min ${esc(String(p.moq || 1))}</div>
              <div class="s-meta${p.stock === 0 ? ' is-out' : ''}">${t('sStock')}: ${p.stock == null ? t('sStockUnlimited') : esc(String(p.stock))}</div>
              <div class="s-status ${esc(st.cls)}">${esc(t(st.key))}</div>
            </div>
          </div>
          ${p.status === 'rejected' && p.rejectReason
            ? `<div class="s-note bad">${esc(p.rejectReason)}</div>` : ''}
          ${!p.img
            ? `<div class="s-note warn">
                 ${p.awaitingImage
                   ? t('sImgWaiting')
                   : `<button class="s-mini" data-action="requestProductImage" data-arg="${esc(p.id)}">${t('sImgAdd')}</button>`}
               </div>` : ''}
          ${videoNoteHtml(p)}
          <div class="s-acts">
            <button class="s-btn" data-action="editProduct" data-arg="${esc(p.id)}">${t('sEdit')}</button>
            <button class="s-btn ghost" data-action="toggleProductArg" data-arg="${esc(p.id)}|${p.status === 'draft' ? 'show' : 'hide'}">${p.status === 'draft' ? t('sShow') : t('sHide')}</button>
          </div>
        </div>`;
      }).join('');

  return `
    ${sellerTabsHtml('products')}
    <div class="s-subtabs">
      <button class="s-subtab${sProdTab === 'active' ? ' on' : ''}" data-action="setSProdTab" data-arg="active">${t('sActive')} ${active.length}</button>
      <button class="s-subtab${sProdTab === 'hidden' ? ' on' : ''}" data-action="setSProdTab" data-arg="hidden">${t('sHidden')} ${hidden.length}</button>
    </div>
    ${cards}
    <button class="pd-add" style="margin-top:16px" data-action="newProductForm">+ ${t('sNew')}</button>`;
}

/* ── E'lon formasi ──
   Qiymatlar saqlash paytida DOM'dan o'qiladi (Mini App bilan ayni naqsh):
   har harfda `renderDrawer()` chaqirilsa kursor maydondan uchib ketardi. */
function sellerFormHtml() {
  const p = sEditId ? sProducts.find((x) => String(x.id) === String(sEditId)) : null;
  const nom = p ? L(p.name) : '';
  return `
    <div class="s-form">
      <label class="s-lbl">${t('sName')}</label>
      <input class="s-inp" id="pf-name" value="${esc(nom)}" placeholder="Marg'ilon ipak ikat" />

      <label class="s-lbl">${t('sPrice')}</label>
      <input class="s-inp mono" id="pf-price" type="number" inputmode="numeric" value="${p ? esc(String(p.price)) : ''}" />

      <label class="s-lbl">${t('sMoq')}</label>
      <input class="s-inp mono" id="pf-moq" type="number" inputmode="numeric" value="${p ? esc(String(p.moq || 1)) : '1'}" />

      <label class="s-lbl">${t('sWidth')}</label>
      <input class="s-inp" id="pf-width" value="${p && p.width ? esc(String(p.width)) : ''}" placeholder="1.5 m" />

      <label class="s-lbl">${t('sLen')}</label>
      <input class="s-inp" id="pf-len" value="${p && p.rollLength ? esc(String(p.rollLength)) : ''}" placeholder="40 m" />

      <label class="s-lbl">${t('sStockField')}</label>
      <input class="s-inp mono" id="pf-stock" type="number" inputmode="numeric" min="0" placeholder="cheksiz" value="${p && p.stock != null ? esc(String(p.stock)) : ''}" />

      ${p ? '' : `
      <label class="s-lbl">${t('sType')}</label>
      <div class="s-cats">
        ${P_CATS.map((c) => `<button class="s-cat${pfCat === c.k ? ' on' : ''}" data-action="pickPfCat" data-arg="${esc(c.k)}">${esc(L(c))}</button>`).join('')}
      </div>`}

      <label class="s-lbl">${t('sComp')}</label>
      <textarea class="s-inp" id="pf-comp" rows="2" placeholder="100% tut ipagi"></textarea>

      <div class="s-note warn" style="margin-top:14px">
        ${t('sFormHint')}
      </div>

      <div class="s-acts" style="margin-top:16px">
        <button class="s-btn ghost" data-action="sellerTab" data-arg="products">${t('cancel')}</button>
        <button class="pd-add" style="flex:1.4" data-action="saveProduct">${t('sSave')}</button>
      </div>
    </div>`;
}

function pickPfCat(k) { pfCat = String(k); renderDrawer(); }

/* ⚠️ `String()` ataylab: delegatsiya sof raqamli `data-arg` ni `Number` ga
   aylantiradi, forma esa `String(x.id) === String(sEditId)` bilan qidiradi.
   Bugungi id lar `p-…` prefiksli, lekin raqamli id paydo bo'lgan kuni forma
   JIMGINA bo'sh ochilardi (PATCH esa to'g'ri id bilan ketaverardi). */
function editProduct(id) {
  sEditId = String(id);
  drawerView = 'seller-form';
  renderDrawer();
}

function newProductForm() {
  sEditId = null;
  pfCat = 'silk';
  drawerView = 'seller-form';
  renderDrawer();
}

function saveProduct() {
  const val = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const name = val('pf-name');
  const price = parseInt(val('pf-price'), 10);
  const moq = parseInt(val('pf-moq'), 10) || 1;
  const comp = val('pf-comp');
  // Bo'sh satr ham ATAYLAB yuboriladi: server "maydon kelganmi" ga qaraydi
  // (`widthSent`, stock darsi) — bo'sh kelsa qiymat tozalanadi, kelmasa
  // (eski keshlangan klient) mavjud qiymat tegilmaydi.
  const width = val('pf-width');
  const rollLen = val('pf-len');
  // Bo'sh qoldirilsa CHEKSIZ (null). `0` esa haqiqiy qiymat — "tugadi".
  const stockRaw = val('pf-stock');
  const stock = stockRaw === '' ? null : parseInt(stockRaw, 10);

  if (name.length < 2) return showToast(t('sNeedName'));
  if (!Number.isInteger(price) || price < 1) return showToast(t('sNeedPrice'));
  if (stock !== null && (!Number.isInteger(stock) || stock < 0)) return showToast(t('sBadStock'));

  const so4rov = sEditId
    ? sellerFetch('/api/seller/products', {
      method: 'PATCH',
      body: JSON.stringify({ id: sEditId, name_uz: name, price, moq, comp_uz: comp, stock, width, roll_length: rollLen }),
    })
    : sellerFetch('/api/products', {
      method: 'POST',
      body: JSON.stringify({ name_uz: name, price, moq, comp_uz: comp, stock, cat_key: pfCat || 'silk', width, roll_length: rollLen }),
    });

  so4rov
    .then(() => loadSellerData())
    .then(() => {
      showToast(t('sSaved'));
      drawerView = 'seller-products';
      renderDrawer();
    })
    .catch((e) => showToast(e.message));
}

function toggleProductArg(arg) {
  const [id, action] = String(arg).split('|');
  sellerFetch('/api/seller/products', { method: 'PATCH', body: JSON.stringify({ id, action }) })
    .then(() => loadSellerData())
    .then(() => showToast(action === 'hide' ? t('sHiddenToast') : t('sShownToast')))
    .catch((e) => showToast(e.message));
}

function requestProductImage(id) {
  sellerFetch('/api/seller/products', { method: 'PATCH', body: JSON.stringify({ id: String(id), action: 'request_image' }) })
    .then(() => loadSellerData())
    .then(() => showToast(t('sImgRequested')))
    .catch((e) => showToast(e.message));
}

function requestProductVideo(id) {
  sellerFetch('/api/seller/products', { method: 'PATCH', body: JSON.stringify({ id: String(id), action: 'request_video' }) })
    .then(() => loadSellerData())
    .then(() => showToast(t('sVidRequested')))
    .catch((e) => showToast(e.message));
}

/* ── Kelgan buyurtmalar ──
   ⚠️ `buyerName`, `address`, `comment` va bahs sababini XARIDOR yozadi,
   chiziladigan joy esa SOTUVCHI ekrani — ya'ni bu yerda `esc()` shart
   (CLAUDE.md: saqlanuvchi XSS aynan shu yo'l bilan ishlaydi). */
function sellerOrdersHtml() {
  const counts = {
    new: sOrders.filter((o) => ORD_GROUP.new.includes(o.statusKey)).length,
    progress: sOrders.filter((o) => ORD_GROUP.progress.includes(o.statusKey)).length,
    done: sOrders.filter((o) => ORD_GROUP.done.includes(o.statusKey)).length,
  };
  const list = sOrders.filter((o) => ORD_GROUP[sOrdTab].includes(o.statusKey));

  const cards = sLoading
    ? `<div class="co-hint" style="text-align:center;padding:14px 0">${t('loading')}</div>`
    : !list.length
      ? `<div class="pd-rev-empty"><div class="pd-rev-empty-t">${t('sNoOrdersTab')}</div></div>`
      : list.map((o) => {
        const yangi = o.statusKey === 'pending';
        const joNatish = o.statusKey === 'confirmed';
        return `
        <div class="s-card">
          <div class="s-ord-top">
            <div>
              <div class="s-ord-id">${esc(o.id)}</div>
              <div class="s-ord-date">${esc(L(o.date) || o.date || '')}</div>
            </div>
            ${o.prepay ? `<span class="s-paid">${t('sPrepaid')}</span>` : ''}
          </div>

          ${(o.items || []).map((it) => `
            <div class="s-line">
              <span>${esc(it.name || '')} · ${esc(String(it.qty))}</span>
              <span class="mono">${money(it.unitPrice * it.qty)}</span>
            </div>`).join('')}

          <div class="s-ord-foot">
            <div>${t('sYourPart')}: <b class="mono">${money(o.sellerTotal)}</b></div>
            ${o.prepay ? `<div>${t('sPrepay')}: <b class="mono">${money(o.prepay)}</b> · ${t('sRest')} <span class="mono">${money(o.rest || 0)}</span></div>` : ''}
            <div>${t('buyer')}: <b>${esc(o.buyerName || '—')}</b></div>
            <div>${t('sPickup')}: <b>${esc(o.address || '—')}</b></div>
            ${o.tracking ? `<div>${t('sTracking')}: <b class="mono">${esc(o.tracking)}</b></div>` : ''}
            ${o.comment ? `<div class="s-comment">"${esc(o.comment)}"</div>` : ''}
          </div>

          ${yangi ? `
          <div class="s-acts">
            <button class="s-btn danger" data-action="sellerOrderArg" data-arg="${esc(o.id)}|reject">${t('sReject')}</button>
            <button class="pd-add" style="flex:1" data-action="sellerOrderArg" data-arg="${esc(o.id)}|accept">${t('sAccept')}</button>
          </div>` : ''}

          ${joNatish ? `
          <div style="margin-top:11px">
            <input class="s-inp mono" data-input="setSTracking" data-arg="${esc(o.id)}"
                   value="${esc(sTracking[o.id] || '')}" placeholder="${t('sTrackingPh')}" />
            <button class="pd-add" style="width:100%;margin-top:8px" data-action="sellerOrderArg" data-arg="${esc(o.id)}|ship">${t('sShip')}</button>
          </div>` : ''}

          ${o.dispute ? sellerDisputeHtml(o.dispute) : ''}
        </div>`;
      }).join('');

  return `
    ${sellerTabsHtml('orders')}
    <div class="s-subtabs">
      <button class="s-subtab${sOrdTab === 'new' ? ' on' : ''}" data-action="setSOrdTab" data-arg="new">${t('sTabNew')} ${counts.new}</button>
      <button class="s-subtab${sOrdTab === 'progress' ? ' on' : ''}" data-action="setSOrdTab" data-arg="progress">${t('sTabProgress')} ${counts.progress}</button>
      <button class="s-subtab${sOrdTab === 'done' ? ' on' : ''}" data-action="setSOrdTab" data-arg="done">${t('sTabDone')} ${counts.done}</button>
    </div>
    ${cards}`;
}

/* Bahs bloki. Javob bir marta yozilgach o'zgartirilmaydi — moderator ko'rgan
   matn o'sha holicha qolsin. */
function sellerDisputeHtml(d) {
  return `
    <div class="s-dispute">
      <div class="s-dispute-t">⚖️ ${t('sDispute')}</div>
      <div class="s-dispute-body">${esc(d.reason || '')}</div>
      ${d.sellerResponse
        ? `<div class="s-dispute-mine"><b>${t('sDisputeMine')}:</b> ${esc(d.sellerResponse)}</div>`
        : `<textarea class="s-inp" rows="3" data-input="setSDispReply" data-arg="${esc(String(d.id))}"
              placeholder="${t('sDisputePh')}">${esc(sDispReply[d.id] || '')}</textarea>
           <button class="pd-add" style="width:100%;margin-top:7px" data-action="sendDisputeReply" data-arg="${esc(String(d.id))}">${t('sDisputeSend')}</button>`}
    </div>`;
}

function setSTracking(v, orderId) { sTracking[String(orderId)] = String(v || ''); }
function setSDispReply(v, disputeId) { sDispReply[String(disputeId)] = String(v || ''); }

function sendDisputeReply(disputeId) {
  const key = String(disputeId);
  const text = (sDispReply[key] || '').trim();
  if (text.length < 3) return showToast(t('sDisputeShort'));
  sellerFetch('/api/seller/dispute', {
    method: 'POST',
    body: JSON.stringify({ disputeId, response: text }),
  })
    .then(() => { delete sDispReply[key]; return loadSellerData(); })
    .then(() => showToast(t('sDisputeSent')))
    .catch((e) => showToast(e.message));
}

function sellerOrderArg(arg) {
  const [orderId, action] = String(arg).split('|');
  // ⚠️ Rad etish QAYTARIB BO'LMAYDI (zaxira qaytadi, xaridorga xabar ketadi) —
  // shuning uchun tasdiq so'raladi. Mini App'da Telegram'ning o'z dialogi
  // ishlatiladi, saytda esa oddiy `confirm` yetarli.
  if (action === 'reject' && !window.confirm(t('sConfirmReject'))) return;
  const tracking = action === 'ship' ? (sTracking[orderId] || '').trim() : undefined;
  if (action === 'ship' && !tracking) return showToast(t('sNeedTracking'));

  sellerFetch('/api/seller/orders', {
    method: 'POST',
    body: JSON.stringify({ orderId, action, tracking }),
  })
    .then(() => { if (action === 'ship') delete sTracking[orderId]; return loadSellerData(); })
    .then(() => showToast(action === 'accept' ? t('sAccepted') : action === 'reject' ? t('sRejected') : t('sShipped')))
    .catch((e) => showToast(e.message));
}

/* ══ KARTOCHKA USTIDA 3 SONIYA — IKKINCHI MEDIA (2026-08-13, founder) ══
   "sichqoncha mahsulot ustida 3 sekund tursa, ikkinchi media bo'lsa
   ko'rsatilsin — video bo'lsa ham".

   ⚠️ FAQAT SICHQONCHALI qurilmada armlanadi (`hover: hover`). Sensorli
   ekranda "hover" barmoq bosilgan payt ham hosil bo'ladi va u yerda
   `mouseleave` KELMASLIGI mumkin: video ochilib qolib, foydalanuvchi
   uni yopa olmasdi. Telegram Desktop'dagi Mini App'da esa sichqoncha
   BOR — shuning uchun ayni mantiq u yerda ham ishlaydi.

   ⚠️ Video KECHIKIB yuklanadi (`src` faqat 3 soniyadan keyin qo'yiladi).
   Kartochka bilan birga yuklansa katalog ochilishida o'nlab video fayl
   tortilardi — bu bir necha MB (o'lchandi: e'londagi ikkita video 2.13 MB
   va 1.76 MB).

   ⚠️ Chiqishda video O'CHIRILADI (`src` bo'shatiladi va tugun olib
   tashlanadi). Faqat `pause()` qilinsa, katalogni kezib chiqqan
   foydalanuvchida o'nlab dekodlangan video xotirada qolardi. */
const HOVER_MEDIA_MS = 3000;

function hoverMediaArm() {
  if (!window.matchMedia || !window.matchMedia('(hover: hover)').matches) return;

  let timer = null;
  let ochiq = null;                 // hozir video ko'rsatilayotgan `.product-media`

  function yop() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (!ochiq) return;
    const v = ochiq.querySelector('.media-hover');
    if (v) { v.pause(); v.removeAttribute('src'); v.load(); v.remove(); }
    ochiq = null;
  }

  document.addEventListener('mouseover', (e) => {
    const box = e.target.closest && e.target.closest('.product-media[data-video]');
    if (!box || box === ochiq) return;
    yop();
    timer = setTimeout(() => {
      timer = null;
      // Sichqoncha shu orada chiqib ketgan bo'lishi mumkin — DOM'dan
      // so'raymiz, taxmin qilmaymiz.
      if (!box.isConnected || !box.matches(':hover')) return;
      const v = document.createElement('video');
      v.className = 'media-hover';
      v.src = box.dataset.video;
      if (box.dataset.poster) v.poster = box.dataset.poster;
      // `muted` SHART: ovozli avtomatik o'ynatishni brauzer bloklaydi va
      // video jimgina ochilmay qolardi.
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
      v.setAttribute('aria-hidden', 'true');
      box.appendChild(v);
      ochiq = box;
      // Ba'zi brauzerlar `play()` rad etadi (energiya tejash rejimi) —
      // o'shanda muqova ko'rinib turaveradi, xato tashlanmaydi.
      const pr = v.play();
      if (pr && pr.catch) pr.catch(() => {});
    }, HOVER_MEDIA_MS);
  });

  document.addEventListener('mouseout', (e) => {
    const box = e.target.closest && e.target.closest('.product-media[data-video]');
    if (!box) return;
    // `mouseout` ichki elementga o'tganda ham otiladi — kartochkaning
    // O'ZIDAN chiqilganini tekshiramiz, aks holda video pastdagi tugmaga
    // sichqoncha borishi bilan yopilardi.
    if (e.relatedTarget && box.contains(e.relatedTarget)) return;
    yop();
  });

  // Sahifa ko'rinmay qolsa ham to'xtatamiz — ko'rinmaydigan video
  // batareya va trafik yeydi.
  document.addEventListener('visibilitychange', () => { if (document.hidden) yop(); });
}

hoverMediaArm();

/* ── Mahsulot media ro'yxati — YAGONA manba ──
   Galereya SLAYDLAR SONIGA bog'lanmagan: u shu ro'yxatni chizadi, xolos.
   Ilgari `mediaHtml` da ikkita slayd QO'LDA yozilgan edi ("1-rasm,
   2-video"), ya'ni uchinchi rasm paydo bo'lgan kuni chizish, eskizlar,
   nuqtalar va strelkalar — to'rtala joy alohida tuzatilishi kerak bo'lardi.

   🔴 BUGUNGI HOLAT: bazada mahsulotga BITTA rasm saqlanadi
   (`products.img` / `img_file_id` / `img_r2_key`) + ixtiyoriy bitta video,
   ya'ni ro'yxatda amalda 1–2 element bo'ladi. Founder qarori (2026-08-16):
   haqiqiy suratlar qo'yilganda mahsulotda 3–4 rasm bo'ladi.
   ⚠️ Shu qatordagi `m.images` — KELAJAKKA QOLDIRILGAN JOY va u hozircha
   HECH QAYERDA to'ldirilmaydi: `/api/products` bunday maydon QAYTARMAYDI.
   Ya'ni bu "ishlayotgan funksiya" emas, TAYYOR ULANISH NUQTASI. Rasm
   ustuni qo'shilganda (migratsiya + sotuvchi formasi + `productRowToVM`)
   o'zgaradigan yagona frontend joyi — mana shu funksiya. */
function mediaList(p, m) {
  const list = [];
  const rasmlar = (m && Array.isArray(m.images) && m.images.length)
    ? m.images.map(apiImgUrl).filter(Boolean)
    : (p.img ? [p.img] : []);
  rasmlar.forEach((src) => list.push({ tur: 'img', src, eskiz: src }));
  if (m && m.video) {
    // Muqova yo'q bo'lsa birinchi rasmga tushamiz — qora to'rtburchak
    // "video buzuq" degan taassurot berardi.
    list.push({ tur: 'video', src: m.video, eskiz: m.videoPoster || rasmlar[0] || '' });
  }
  return list;
}

/* Media galereya.

   ⚠️ Media BITTA bo'lsa eskizlar, nuqtalar va strelkalar UMUMAN chizilmaydi:
   bitta slayd uchun ular shovqindan boshqa narsa emas. Bu `NULL` reyting
   qoidasi bilan bitta oila — yo'q narsa uchun bo'sh idish ko'rsatilmaydi.

   Slaydlar CSS `scroll-snap` bilan suriladi, JS bilan emas: barmoq harakati
   brauzerning O'ZINIKI bo'lib qoladi (inersiya, chekka qarshiligi) va uni
   qo'lda takrorlash har doim yomonroq chiqadi. JS faqat nuqtalarni holatga
   moslashtiradi. */
function mediaHtml(p, m) {
  const media = mediaList(p, m);
  // Umuman rasm yo'q — bo'sh kulrang quti. Yiqilmaydi, yolg'on ham gapirmaydi.
  if (!media.length) return `<div class="pdp-stage"><div class="pd-img pd-img-none"></div></div>`;

  const slayd = (x, i) => (x.tur === 'video'
    ? `<video class="pd-vid" src="${esc(x.src)}" poster="${esc(x.eskiz)}"
              controls preload="none" playsinline
              aria-label="${esc(t('mediaVideo'))}"></video>`
    : `<img class="pd-img" src="${esc(x.src)}" alt="${esc(p.name)}"${i ? ' loading="lazy"' : ''}
             data-action="openZoom" data-arg="${esc(x.src)}" />`);

  if (media.length === 1) {
    return `<div class="pdp-stage">${slayd(media[0], 0)}</div>`;
  }

  const yorliq = (x, i) => (x.tur === 'video' ? t('mediaVideo') : `${t('mediaPhoto')} ${i + 1}`);

  return `
    <div class="pd-media">
      <div class="pdp-thumbs">
        ${media.map((x, i) => `
        <button class="pdp-thumb${i ? '' : ' is-on'}" data-slide="${i}" aria-label="${esc(yorliq(x, i))}">
          ${x.eskiz ? `<img src="${esc(x.eskiz)}" alt="" />` : ''}
          ${x.tur === 'video' ? `<span class="pdp-thumb-play" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>
          </span>` : ''}
        </button>`).join('')}
      </div>
      <div class="pdp-stage">
        <div class="pd-slides" id="pd-slides">
          ${media.map(slayd).join('')}
        </div>
        <button class="pdp-arrow prev" data-step="-1" aria-label="${esc(t('mediaPrev'))}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
        </button>
        <button class="pdp-arrow next" data-step="1" aria-label="${esc(t('mediaNext'))}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
        </button>
        <div class="pd-dots" id="pd-dots">
          ${media.map((x, i) => `
          <button class="pd-dot${i ? '' : ' is-on'}" data-slide="${i}" aria-label="${esc(yorliq(x, i))}"></button>`).join('')}
        </div>
      </div>
    </div>`;
}

/* Galereya HTML bilan birga "jonlanmaydi" — tugunlar DOM'ga tushgandan keyin
   ulanadi (`mountAddrMap` bilan bir xil naqsh: har qayta chizishda tugun
   YANGI bo'ladi, shuning uchun listener ham qaytadan ulanadi).

   ⚠️ Boshqaruvchilar UCH XIL (nuqta, eskiz, strelka) va ular BITTA tinglovchi
   bilan qamraladi — har biriga alohida tinglovchi yozilsa yangi boshqaruvchi
   qo'shilganda uni ulash unutilardi va tugma jimgina o'lik bo'lardi. */
function mountPdMedia() {
  const slides = document.getElementById('pd-slides');
  const dots = document.getElementById('pd-dots');
  if (!slides || !dots) return;
  const gal = slides.closest('.pd-media') || dots.parentNode;

  const nuqtalar = [...gal.querySelectorAll('.pd-dot')];
  const eskizlar = [...gal.querySelectorAll('.pdp-thumb')];
  const oldinga = gal.querySelector('.pdp-arrow.next');
  const orqaga = gal.querySelector('.pdp-arrow.prev');
  // Slaydlarning O'ZI sanaladi, nuqtalar emas: nuqta faqat KO'RSATKICH va
  // ular bir kun boshqacha chizilsa (masalan ko'p slaydda "1/4" yozuvi
  // bilan) sanoq jimgina noto'g'ri bo'lib qolardi.
  const slaydlar = [...slides.children];
  let joriy = 0;

  /* Holatni BITTA funksiya belgilaydi va uni IKKI manba chaqiradi: nuqta
     bosilishi va barmoq bilan surish (`scroll`).

     ⚠️ Nuqta bosilganda `scroll` hodisasi KUTILMAYDI — 2026-08-13 da o'lchandi:
     dasturiy `scrollLeft` berilganda hodisa otilmasligi mumkin va o'shanda
     nuqta surilib turgan slaydni ko'rsatmay qolardi, video esa ko'rinmagan
     holda ovoz chiqarib o'ynayverardi. Ya'ni ASOSIY javob hech qachon
     hodisaga bog'lanmaydi; `scroll` faqat barmoq bilan surishni QO'SHIMCHA
     ravishda qamraydi. */
  function sync(i) {
    joriy = i;
    nuqtalar.forEach((d, k) => d.classList.toggle('is-on', k === i));
    eskizlar.forEach((d, k) => d.classList.toggle('is-on', k === i));
    // Strelka chekkada o'chiriladi: bosilganda hech narsa qilmaydigan tugma
    // "sindi" degan taassurot beradi (`pd-dot` dagi o'sha dars).
    if (orqaga) orqaga.disabled = i <= 0;
    if (oldinga) oldinga.disabled = i >= slaydlar.length - 1;
    // KO'RINMAYDIGAN video to'xtatiladi. ⚠️ Ilgari bu yerda "1-slayd video"
    // deb QO'LDA yozilgan edi; uchinchi rasm qo'shilgan kuni video 2- yoki
    // 3-o'ringa surilar va ko'rinmagan holda ovoz chiqarib o'ynayverardi.
    // Endi tekshiruv o'rinni emas, TURNI biladi.
    slaydlar.forEach((el, k) => {
      if (k !== i && el.tagName === 'VIDEO' && !el.paused) el.pause();
    });
  }

  slides.addEventListener('scroll', () => {
    sync(Math.round(slides.scrollLeft / Math.max(1, slides.clientWidth)));
  }, { passive: true });

  gal.addEventListener('click', (e) => {
    const b = e.target.closest('[data-slide], [data-step]');
    if (!b || !gal.contains(b)) return;
    const i = b.dataset.step !== undefined
      ? joriy + Number(b.dataset.step)
      : Number(b.dataset.slide);
    if (i < 0 || i >= slaydlar.length) return;
    // ⚠️ `behavior: 'smooth'` ISHLATILMAYDI va bu O'LCHANGAN qaror
    // (2026-08-13): silliq surish bajarilmaydigan muhitda so'rov jimgina
    // yutiladi va nuqta BUTUNLAY o'lik tugmaga aylanadi. To'g'ridan-to'g'ri
    // qiymat berish har joyda ishlaydi; barmoq bilan surishning silliqligi
    // esa tizimning o'zidan keladi va bunga bog'liq emas.
    slides.scrollLeft = slides.clientWidth * i;
    sync(i);
  });

  sync(0);
}

/* ── Sotib olish qutisidagi amal (savatga / miqdor) ──
   ALOHIDA funksiya, chunki u BUTUN sahifadan mustaqil qayta chiziladi:
   "+" bosilganda butun `#pdp` qayta yozilsa galereya boshiga qaytardi va
   o'ynab turgan video uzilardi (tugun almashadi). Kartochkadagi
   `renderCardAction()` bilan bir xil naqsh — faqat o'z qutisi. */
/* ── Namuna so'rovi va «kelganda xabar ber» (db/030) ──
   Ikkalasi ham sessiya ichida bir martalik: bosilgach tugma o'rnini
   tasdiq matni bosadi. Server tomonda ham idempotent (obuna UNIQUE juftlik,
   namuna so'rovi esa founder/sotuvchiga alohida xabar bo'lib boradi). */
const stockAlertOk = new Set();
const sampleSentIds = new Set();

function stockAlert(id) {
  apiJson('/api/stock-alert', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: id }),
  }).then((d) => {
    if (!d || d.ok !== true) throw new Error((d && d.error) || '');
    stockAlertOk.add(id);
    renderPdpAct();
    showToast(t('stockAlertOn'));
  }).catch((e) => {
    showToast(/unauthorized/.test(String(e.message)) ? t('needLoginFirst') : t('stockAlertErr'));
  });
}

function sampleRequest(id) {
  apiJson('/api/sample-request', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: id }),
  }).then((d) => {
    if (!d || d.ok !== true) throw new Error((d && d.error) || '');
    sampleSentIds.add(id);
    // Tugma joyida tasdiq matni — butun sahifani qayta chizish shart emas
    document.querySelectorAll('.pdp-sample').forEach((b) => {
      const div = document.createElement('div');
      div.className = 'pdp-note sample-done';
      div.textContent = `✂️ ${t('sampleSent')}`;
      b.replaceWith(div);
    });
    showToast(t('sampleSent'));
  }).catch((e) => {
    showToast(/unauthorized/.test(String(e.message)) ? t('needLoginFirst') : t('sampleErr'));
  });
}

function pdpActHtml(id) {
  const qty = cart[id] || 0;
  if (soldOutIds.has(id)) {
    // «Kelganda xabar ber» (db/030) — tugagan mato o'lik nuqta bo'lmasin.
    // Obuna serverda; shu sessiyada bosilgani `stockAlertOk` da turadi,
    // shunda qayta chizishda tugma «obuna qabul qilindi» holatida qoladi.
    return `<button class="pd-add is-out" type="button" disabled>${esc(stockTxt('out'))}</button>
      ${stockAlertOk.has(id)
        ? `<div class="pdp-note stock-alert-done">🔔 ${t('stockAlertOn')}</div>`
        : `<button class="pdp-ghost stock-alert-btn" data-action="stockAlert" data-arg="${esc(id)}">🔔 ${t('stockAlertBtn')}</button>`}`;
  }
  if (!qty) {
    return `<button class="pd-add" data-action="addFromDetail" data-arg="${esc(id)}">${t('addToCart')}</button>`;
  }
  return `
    <div class="qty-row">
      <button class="qty-circle qty-minus" data-action="qtyStepDetail" data-arg="${esc(id)}|-1" aria-label="${t('decrease')}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>
      </button>
      <span class="qty-num">${qty} ${t('pcs')}</span>
      <button class="qty-circle qty-plus" data-action="qtyStepDetail" data-arg="${esc(id)}|1" aria-label="${t('increase')}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>
    </div>`;
}

/** Sharhlar ro'yxati — boshida faqat shuncha tasi ko'rinadi */
const PDP_REV_HEAD = 3;

function pdpReviewsHtml(id) {
  const list = reviewsCache[id];
  // Yuklanmoqda — "sharh yo'q" DEYILMAYDI, aks holda yuklanish paytida
  // yolg'on gap ko'rsatilardi.
  if (list === undefined) return `<div class="pd-rev-wait"></div>`;
  if (!list.length) {
    return `
      <div class="pd-rev-empty">
        <div class="pd-rev-empty-t">${t('noReviews')}</div>
        <div class="pd-rev-empty-s">${t('noReviewsSub')}</div>
      </div>`;
  }
  // Ro'yxat uzun bo'lsa boshi ko'rsatiladi: sharhlar ostidagi "o'xshash
  // matolar" 30 ta sharh ortida ko'milib qolmasin. Tugma FAQAT haqiqatan
  // yashiringan sharh bo'lganda chiziladi va uning ichida ANIQ son turadi —
  // "hammasi" so'zi nechtaligini aytmaydi.
  const ochiq = pdpAllReviews || list.length <= PDP_REV_HEAD;
  const ko = ochiq ? list : list.slice(0, PDP_REV_HEAD);
  return `
    <div class="pdp-revs">
      ${ko.map((r) => `
        <div class="pd-rev">
          <div class="pd-rev-top">${starsHtml(r.stars)}<span class="pd-rev-date">${esc(L(r.date))}</span></div>
          ${r.body ? `<div class="pd-rev-body">${esc(r.body)}</div>` : ''}
          ${(r.photos || []).length ? `
          <div class="pd-rev-photos">
            ${r.photos.map((u) => `<img class="pd-rev-photo" src="${esc(u)}" loading="lazy" alt="">`).join('')}
          </div>` : ''}
          <div class="pd-rev-who">${esc(r.author || '—')}</div>
        </div>`).join('')}
    </div>
    ${ochiq ? '' : `
      <button class="pdp-more" data-action="showAllReviews">
        ${t('pdpAllReviews')} · ${list.length}
      </button>`}`;
}

/* ── O'xshash matolar ──
   Manba — KATALOGNING O'ZI (DOM'dagi kartochkalar), yangi so'rov yo'q:
   `mergeCatalog` allaqachon bazadagi hamma e'lonni gridga qo'ygan.

   ⚠️ Kartochka QAYTA CHIZILMAYDI — katalogdagi tugun NUSXALANADI
   (`cloneNode`). Founder qarori (2026-08-16): "o'xshash matolar kartochkasi
   o'zgarmasin, qanday holatda bo'lsa shunda chiqsin". Nusxalash buni
   TA'RIF bo'yicha kafolatlaydi: yengil variant qayta yozilsa u vaqt o'tib
   katalognikidan ajralib ketardi (belgi, zaxira holati, tasdiqlangan
   nishoni, savat tugmasi — har biri alohida unutilishi mumkin bo'lgan joy).

   Buni MUMKIN qilgan narsa — `id="act-<id>"` / `id="fav-<id>"` ning
   `data-*` ga ko'chishi (`cardBoxes()` izohi): `id` bilan ikkinchi nusxa
   hujjatda takror `id` hosil qilib, jimgina yangilanmay qolardi. */
/* IKKI QATOR (founder qarori, 2026-08-16). Son ENG KENG ekrandagi ikki
   qatorga qarab olinadi (4 ustun × 2 = 8); torroq ekranda ortiqchasi CSS
   bilan yashiriladi (`style.css` → `.pdp-sim …:nth-child`). Teskarisi —
   ekranga qarab JS da sanash — resize'da qator yarim bo'sh qolardi, chunki
   `pdpMountSimilar` faqat sahifa ochilganda bir marta ishlaydi. */
const PDP_SIM_MAX = 8;

/* Tavsiya UCH POG'ONA bilan yig'iladi va bu O'LCHOVDAN kelib chiqqan
   (2026-08-16): jonli katalogda toifalar taqsimoti
   `ipak 13 · paxta 4 · zig'ir 3 · so'zana 2 · jun 1 · ikat 1` —
   ya'ni faqat toifaga tayanilsa **jun va ikat matolarida bo'lim UMUMAN
   chizilmasdi** (o'zidan boshqa hech kim yo'q). Bu "bo'sh idish"
   emas, tavsiyaning butunlay yo'qligi edi.

   Pog'onalar: (1) ayni toifa, (2) ayni ishlab chiqaruvchi, (3) narxi
   eng yaqin. Har pog'ona faqat YETMAGANINI to'ldiradi, ya'ni toifa
   to'la bo'lsa qolgani umuman ishlamaydi va tartib o'zgarmaydi. */
function pdpMountSimilar() {
  const box = document.getElementById('pdp-sim');
  if (!box || !pdpId) return;
  const bu = productEl(pdpId);
  if (!bu) return;
  const cat = bu.dataset.cat || '';
  const sotuvchi = bu.dataset.supplier || '';
  const narx = Number(bu.dataset.price) || 0;

  const hammasi = [...document.querySelectorAll('.product-grid .product-card[data-id]')]
    .filter((el) => el.dataset.id !== pdpId);

  const yaqin = [];
  const olingan = new Set();
  const qo = (list) => list.forEach((el) => {
    if (yaqin.length >= PDP_SIM_MAX || olingan.has(el.dataset.id)) return;
    olingan.add(el.dataset.id);
    yaqin.push(el);
  });

  if (cat) qo(hammasi.filter((el) => el.dataset.cat === cat));
  if (sotuvchi) qo(hammasi.filter((el) => el.dataset.supplier === sotuvchi));
  // Narxi noma'lum bo'lsa (0) bu pog'ona ma'nosini yo'qotadi — hammasi
  // "eng yaqin" bo'lib chiqardi, ya'ni tartib tasodifiy bo'lardi.
  if (narx) {
    qo(hammasi
      .filter((el) => Number(el.dataset.price) > 0)
      .sort((a, b) => Math.abs(Number(a.dataset.price) - narx) - Math.abs(Number(b.dataset.price) - narx)));
  }

  // Bitta ham o'xshashi bo'lmasa BO'LIM UMUMAN chizilmaydi — bo'sh
  // sarlavha "yuklanmadi" degan taassurot berardi.
  const sec = box.closest('.pdp-sec');
  if (!yaqin.length) { if (sec) sec.remove(); return; }

  yaqin.forEach((el) => {
    const nusxa = el.cloneNode(true);
    // Katalog filtri yashirgan bo'lsa ham bu yerda ko'rinsin: bu ro'yxat
    // qidiruv natijasi emas, tavsiya.
    nusxa.classList.remove('is-hidden');
    box.appendChild(nusxa);
    // Hodisa tinglovchilari `cloneNode` bilan KO'CHMAYDI — klaviatura bilan
    // ochish qaytadan ulanadi. Ko'rinish animatsiyasi esa ATAYLAB
    // o'chiriladi (`equipCard` izohi): u kuzatuvchiga bog'liq va bu yerda
    // kartochkalar ko'rinmay qolardi.
    equipCard(nusxa, false);
  });
}

/* ── Ishlab chiqaruvchi kartochkasi ──
   Logotip BAZADA YO'Q, shuning uchun o'ylab topilmaydi: nomning birinchi
   harfidan monogramma chiziladi (bu ma'lumot emas, TIPOGRAFIYA).
   Reyting `sellers.rating` dan keladi va `null` bo'lsa qator UMUMAN
   chizilmaydi — "baholanmagan" ≠ "yomon baholangan". */
function pdpSellerHtml(p, m) {
  const nom = p.supplier || '';
  if (!nom) return '';
  const shahar = m ? L(m.city) : '';
  const reyting = m && m.sellerRating != null ? m.sellerRating : null;
  return `
    <div class="pdp-card pdp-seller">
      <div class="pdp-card-t">${t('pdpSeller')}</div>
      <div class="pdp-seller-row">
        <span class="pdp-seller-mono" aria-hidden="true">${esc(nom.trim().charAt(0) || '?')}</span>
        <span class="pdp-seller-txt">
          <span class="pdp-seller-name">${esc(nom)}</span>
          ${shahar ? `<span class="pdp-seller-city">${esc(shahar)}</span>` : ''}
        </span>
      </div>
      ${reyting != null
        ? `<div class="pdp-seller-rate">${starsHtml(reyting, 'sm')}<b>${esc(String(reyting))}</b></div>`
        : ''}
      <button class="pdp-ghost" data-action="sellerProducts" data-arg="${esc(nom)}">${t('pdpSellerMore')}</button>
    </div>`;
}

/* ── Tavsif ──
   Bazada ERKIN MATNLI tavsif ustuni YO'Q, shuning uchun bu blok o'ylab
   topilgan gap yozmaydi: u faqat sotuvchi kiritgan o'lchov qatorlarini
   ko'rsatadi. Hech biri bo'lmasa — buni AYTADI, bo'sh joy qoldirmaydi
   (bo'sh idish "yuklanmadi" degan taassurot berardi). */
function pdpSpecsHtml(id, m) {
  const bu = productEl(id);
  const catKey = bu ? bu.dataset.cat : '';
  const catNom = catKey ? t('cat' + catKey.charAt(0).toUpperCase() + catKey.slice(1)) : '';
  const specs = [
    [t('specWidth'), m && m.width],
    // Rulon uzunligi (db/030, founder tanlovi) — NULL bo'lsa qator yo'q
    [t('specLen'), m && m.rollLength],
    [t('specWeight'), m && m.weight],
    [t('specComp'), m ? L(m.comp) : ''],
    [t('pdpCat'), catNom && catNom.indexOf('cat') !== 0 ? catNom : ''],
    [t('specMoq'), m && m.moq ? m.moq + ' ' + t('pcs') : null],
    [t('specLead'), m && m.lead ? m.lead + ' ' + t('days') : null],
  ].filter(([, v]) => v);

  return `
    <div class="pdp-sec">
      <h2 class="pdp-sec-title">${t('pdpDesc')}</h2>
      ${specs.length
        ? `<div class="pd-specs">
             ${specs.map(([k, v]) => `
             <div class="pd-spec"><span>${esc(k)}</span><b>${esc(String(v))}</b></div>`).join('')}
           </div>`
        : `<p class="pdp-empty">${t('pdpNoSpecs')}</p>`}
    </div>`;
}

/* ── Yuqoridagi qadalgan qator (`.pdp-bar`) ──
   Sotib olish qutisi ekrandan chiqib ketganda paydo bo'ladi: surat, nom,
   reyting, narx va AYNI "Savatga" tugmasi. Founder qarori (2026-08-16):
   quti sahifa bo'ylab qadalib yurmasin, lekin narx va tugma yo'qolib ham
   qolmasin — ya'ni qator qutining O'RNINI bosadi, unga QO'SHIMCHA emas.

   ⚠️ Tugma QAYTA YOZILMAYDI — `pdpActHtml(id)` AYNI o'zi ishlatiladi.
   Nusxa yozilsa "savatda 3 dona" holati ikki joyda ikki xil chizilardi va
   bittasi vaqt o'tib jimgina eskirardi. Shu sababdan `renderPdpAct()`
   endi IKKALA idishni ham yangilaydi.
   ⚠️ Rasm `mediaList()` dan olinadi, `p.img` dan TO'G'RIDAN-TO'G'RI emas:
   galereya bir kun `m.images` ga o'tganda qatordagi surat sahifadagidan
   boshqa bo'lib qolmasin. */
function pdpBarHtml(id, p, m) {
  const rasm = (mediaList(p, m).find((x) => x.tur === 'img') || {}).src || '';
  return `
    <div class="pdp-bar" id="pdp-bar" aria-hidden="true">
      <div class="container pdp-bar-in">
        <div class="pdp-bar-id">
          ${rasm ? `<img class="pdp-bar-img" src="${esc(rasm)}" alt="">` : ''}
          <div class="pdp-bar-txt">
            <div class="pdp-bar-name">${esc(p.name)}</div>
            ${m && m.rating != null
              ? `<div class="pdp-bar-rate">${starsHtml(m.rating, 'sm')}<b>${esc(String(m.rating))}</b>
                   <span>· ${esc(String(m.reviews || 0))} ${t('reviewsCount')}</span></div>`
              : ''}
          </div>
        </div>
        <div class="pdp-bar-price">${money(p.price)}</div>
        <div class="pdp-bar-act" id="pdp-bar-act">${pdpActHtml(id)}</div>
      </div>
    </div>`;
}

/* Qatorning holati: KO'RSATISH SHARTI — sotib olish qutisi header ostiga
   to'liq kirib ketgani. Ya'ni quti ekranda turganda qator CHIQMAYDI —
   aks holda bitta narx va bitta tugma ikki marta ko'rinardi.

   ⚠️ `top` HAR SAFAR O'LCHANADI, `--header-h` dan olinmaydi: 880px dan tor
   ekranda qidiruv ikkinchi qatorga tushadi va header o'sha o'zgaruvchidan
   BALAND bo'ladi (`style.css` → "HEADER MOBILDA"). Qattiq yozilsa qator
   header ostiga kirib ketardi.
   ⚠️ Solishtirish tugunning O'Z `style.top` i bilan bo'ladi, o'zgaruvchi
   bilan emas: `#pdp` har ochilishda QAYTA yoziladi, ya'ni tugun YANGI va
   eslab qolingan qiymat unga hech qachon qo'yilmagan bo'lardi.

   🔴 Qator chiqqanda header yuqoriga suriladi (founder qarori: "mahsulot
   qadalganda tepadagi doim qadaladigani qadalmasin") va o'shanda qator
   `top: 0` ga o'tadi — ikkita qadalgan qator birga turmaydi.
   ⚠️ Header balandligi `offsetHeight` bilan olinadi, `getBoundingClientRect`
   BILAN EMAS. Sabab AYLANMA BOG'LIQLIK: rect header surilganda O'ZGARADI,
   ya'ni chegara qatorning O'Z holatiga bog'lanib qolardi — qator chiqadi →
   chegara siljiydi → qator yashirinadi → chegara qaytadi… `offsetHeight`
   esa oqimdagi o'lchov, u `transform` dan TA'SIRLANMAYDI (CSS tomonda
   `position` emas, `transform` tanlanganining sababi ham shu). */
function pdpBarSync() {
  const bar = document.getElementById('pdp-bar');
  // Qator yo'q (katalog) — header'ni surib qo'yadigan belgi ham qolmasin.
  // Bu O'ZINI TUZATADIGAN qator: `closePdp` allaqachon tozalaydi, lekin
  // belgi tanada, qator esa `#pdp` ichida yashaydi — ya'ni ular ALOHIDA
  // yo'l bilan yo'qoladi va bittasi qolib ketsa katalogda header BUTUNLAY
  // ko'rinmay qolardi.
  if (!bar) { document.body.classList.remove('pdp-bar-on'); return; }
  const nav = document.getElementById('nav');
  const navH = nav ? nav.offsetHeight : 0;

  const buy = document.querySelector('.pdp-buy');
  const kor = !!buy && buy.getBoundingClientRect().bottom < navH;

  const top = (kor ? 0 : navH) + 'px';
  if (bar.style.top !== top) bar.style.top = top;

  if (kor === bar.classList.contains('is-on')) return;
  bar.classList.toggle('is-on', kor);
  // Header'ni surish belgisi TANADA turadi: `#nav` `#pdp` dan tashqarida,
  // ya'ni qatorning o'z klassi unga yetib bormasdi.
  document.body.classList.toggle('pdp-bar-on', kor);
  // Ko'rinmaganda `visibility: hidden` (CSS) uni TAB tartibidan ham
  // chiqaradi; `aria-hidden` esa ekran o'quvchisiga aytadi.
  bar.setAttribute('aria-hidden', kor ? 'false' : 'true');
}

/* Tinglovchilar BIR MARTA ulanadi (sahifa emas, HUJJAT umri bo'yicha):
   `renderPdp` da ulansa har ochilishda yangi tinglovchi qo'shilib,
   yopilganda ham qolib ketardi. Qator yo'q bo'lsa `pdpBarSync` darhol
   qaytadi, ya'ni katalogda hech narsa hisoblanmaydi. */
let pdpBarRaf = 0;
function pdpBarTick() {
  if (pdpBarRaf) return;
  pdpBarRaf = requestAnimationFrame(() => { pdpBarRaf = 0; pdpBarSync(); });
}
window.addEventListener('scroll', pdpBarTick, { passive: true });
window.addEventListener('resize', pdpBarTick);

function pdpHtml(id) {
  const p = product(id);
  if (!p) return '';
  const m = catalogMeta ? catalogMeta[id] : null;
  const st = m ? stockView(m) : null;
  const fav = isFav(id);

  return `
    ${pdpBarHtml(id, p, m)}

    <div class="container">
      <button class="pdp-back" data-action="closePdp">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
        ${t('pdpBack')}
      </button>

      <div class="pdp-grid">
        <div class="pdp-gal">${mediaHtml(p, m)}</div>

        <div class="pdp-info">
          <h1 class="pdp-name">${esc(p.name)}</h1>
          ${m && m.rating != null
            ? `<div class="pdp-rating">${starsHtml(m.rating)}<b>${esc(String(m.rating))}</b>
                 <span class="pd-rating-n">· ${esc(String(m.reviews || 0))} ${t('reviewsCount')}</span></div>`
            : ''}
          <div class="pdp-sup">
            <span>${esc(p.supplier)}</span>
            ${m && m.verified
              ? `<span class="pdp-verified"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.6 1.5-.9 2.9.9 2.9-2.6 1.5-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8L3 16.3l.9-2.9L3 10.5l2.6-1.5 1-2.8 3 .2z"/><path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>${t('pdpVerified')}</span>`
              : ''}
          </div>
          ${m && L(m.comp) ? `<p class="pdp-lede">${esc(L(m.comp))}</p>` : ''}
        </div>

        <aside class="pdp-aside">
          <div class="pdp-card pdp-buy">
            <div class="pdp-price-label">${t(m && m.unit === 'panel' ? 'unitPricePanel' : 'unitPrice')}</div>
            <div class="pdp-price">${money(p.price)}</div>
            ${st ? `<div class="pd-stock ${esc(st.key)}">${esc(st.txt)}</div>` : ''}

            <div class="pdp-act" id="pdp-act">${pdpActHtml(id)}</div>

            <button class="pdp-fav${fav ? ' on' : ''}" id="pdp-fav" data-action="toggleFav" data-arg="${esc(id)}" aria-pressed="${fav ? 'true' : 'false'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 20.8s-6.9-4.3-9-8a5.2 5.2 0 0 1-.5-3.7A4.8 4.8 0 0 1 6.3 5.5c1.9 0 3.4 1 4.3 2.3.4.6 1 .6 1.4 0 .9-1.3 2.4-2.3 4.3-2.3a4.8 4.8 0 0 1 3.8 3.6 5.2 5.2 0 0 1-.5 3.7c-2.1 3.7-9 8-9 8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
              <span class="pdp-fav-txt">${fav ? t('pdpFavOn') : t('pdpFavAdd')}</span>
            </button>

            <button class="pdp-ghost pdp-share" data-action="copyProductLink">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></svg>
              ${t('pdpCopyLink')}
            </button>

            <!-- Namuna so'rovi (db/030): buyurtma EMAS, so'rov — shartlar
                 founder bilan kelishilgach buyurtma oqimiga ulanadi. -->
            ${sampleSentIds.has(id)
              ? `<div class="pdp-note sample-done">✂️ ${t('sampleSent')}</div>`
              : `<button class="pdp-ghost pdp-sample" data-action="sampleRequest" data-arg="${esc(id)}">✂️ ${t('sampleBtn')}</button>`}

            <div class="pdp-note">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h11v8H3zM14 11h4l3 3v2h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg>
              <span>${t('btsHint')}</span>
            </div>
            ${m && m.moq > 1 ? `
            <div class="pdp-note">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
              <span>${t('specMoq')}: <b>${esc(String(m.moq))} ${t('pcs')}</b></span>
            </div>` : ''}
          </div>

          <div class="pdp-card pdp-safe">
            <div class="pdp-safe-t">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7.5 3.2v5c0 4.4-3 8.3-7.5 9.6-4.5-1.3-7.5-5.2-7.5-9.6v-5z"/></svg>
              ${t('pdpSafe')}
            </div>
            <p class="pdp-safe-s">${t('pdpSafeSub')}</p>
          </div>

          ${pdpSellerHtml(p, m)}
        </aside>

        <div class="pdp-below">
          ${pdpSpecsHtml(id, m)}

          <div class="pdp-sec" id="pdp-ai">${aiSection(id)}</div>

          <div class="pdp-sec">
            <h2 class="pdp-sec-title">${t('reviews')}</h2>
            <div id="pdp-revs">${pdpReviewsHtml(id)}</div>
          </div>

          <div class="pdp-sec">
            <h2 class="pdp-sec-title">${t('pdpSimilar')}</h2>
            <div class="product-grid pdp-sim" id="pdp-sim"></div>
          </div>
        </div>
      </div>
    </div>`;
}

/* ── Sahifani chizish va ko'rsatish ──
   ⚠️ `#pdp` ochilganda katalog `hidden` bo'ladi, o'chirilmaydi: kartochkalar
   DOM'da qolishi SHART, chunki savat, saralanganlar, narx va "o'xshash
   matolar" hammasi o'sha `data-*` atributlaridan o'qiydi (`product()`). */
function renderPdp() {
  const box = document.getElementById('pdp');
  if (!box || !pdpId) return;
  const html = pdpHtml(pdpId);
  if (!html) { closePdp(); return; }

  box.innerHTML = html;
  box.hidden = false;
  document.body.classList.add('pdp-on');
  pdpTitle(pdpId);
  // Galereya nuqtalari va o'xshash matolar HTML bilan kelmaydi — tugunlar
  // DOM'da bo'lgandan keyin ulanadi (`mountAddrMap` bilan bir xil sabab).
  mountPdMedia();
  pdpMountSimilar();
  // Qadalgan qator ham shu yerda holatga keltiriladi: sahifa qayta
  // chizilganda (til almashuvi, sharh kelishi) tugun YANGI bo'ladi va
  // `top` i hali o'lchanmagan bo'ladi.
  pdpBarSync();
  // Mobil nav'dagi "Katalog" faol emas: foydalanuvchi katalogda EMAS.
  mNavActive('');
  // ⚠️ O'lchov AYNAN shu yerda, `openDetail()` da EMAS: brauzerning
  // "orqaga/oldinga" tugmasi PDP ni `openDetail` ni CHETLAB o'tib chizadi
  // (`popstate` ishlovchisi `renderPdp()` ni to'g'ridan-to'g'ri chaqiradi),
  // ya'ni o'sha yerga qo'yilganda tarixdan qaytgan ko'rishlar yo'qolardi.
  // `track()` ning o'zi takrorni ushlaydi.
  track('view', 'product', pdpId);
}

/* ── Sahifa sarlavhasi ──
   Mahsulot endi o'z manzilida yashaydi, ya'ni u brauzer TARIXIGA ham,
   xatcho'pga ham alohida yozuv bo'lib tushadi. Sarlavha o'zgarmasa
   o'nta ochiq ilova oynasi ham, tarixdagi o'nta qator ham BIR XIL
   ("LolaMarket — ulgurji matolar bozori…") bo'lib qolardi.
   ⚠️ Asl sarlavha bir marta eslab qolinadi va katalogga qaytilganda
   TIKLANADI: qattiq yozilsa `index.html` dagi matn bilan ikki nusxa
   bo'lardi va biri o'zgarganda ikkinchisi jimgina eskirardi. */
const PDP_TITLE_ASL = document.title;

function pdpTitle(id) {
  const p = id ? product(id) : null;
  document.title = p ? `${p.name} — LolaMarket` : PDP_TITLE_ASL;
}

/** Faqat sotib olish tugmasi — galereya va video tegilmaydi.
    IKKALA idish ham yangilanadi: quti va qadalgan qator (`pdpBarHtml`) —
    bittasi qolib ketsa "savatda 3 dona" bir joyda ko'rinib, ikkinchisida
    hamon "Savatga qo'shish" turardi. */
function renderPdpAct() {
  if (!pdpId) return;
  const html = pdpActHtml(pdpId);
  ['pdp-act', 'pdp-bar-act'].forEach((box) => {
    const el = document.getElementById(box);
    if (el) el.innerHTML = html;
  });
}

/** Faqat sharhlar bo'limi */
function renderPdpReviews() {
  const box = document.getElementById('pdp-revs');
  if (box && pdpId) box.innerHTML = pdpReviewsHtml(pdpId);
}

/** Faqat AI bloki */
function renderPdpAi() {
  const box = document.getElementById('pdp-ai');
  if (box && pdpId) box.innerHTML = aiSection(pdpId);
}

function showAllReviews() {
  pdpAllReviews = true;
  renderPdpReviews();
}

/* Havolani nusxalash. Manba — MANZIL QATORINING O'ZI (`location.href`),
   qo'lda yig'ilgan satr emas: yig'ilsa u manzil sxemasi o'zgargan kuni
   jimgina eskirib, ishlamaydigan havola berardi (aynan shu sxema bugun
   hash'dan haqiqiy yo'lga ko'chdi).
   ⚠️ Muvaffaqiyat JIMGINA taxmin qilinmaydi: `copyText()` yiqilsa xaridorga
   AYTILADI — "nusxalandi" deb yolg'on gapirgandan ko'ra. */
function copyProductLink() {
  copyText(location.href).then((ok) => {
    showToast(ok ? t('pdpLinkCopied') : t('pdpLinkCopyErr'));
  });
}

/* ── Rasmni kattalashtirish ──
   Mato sotilayotganda TEKSTURA mahsulotning o'zi, ya'ni kattalashtirish
   bezak emas. Telefonda qo'shimcha kod KERAK EMAS: saytda
   `user-scalable=no` YO'Q (`index.html` viewport'i tekshirildi), ya'ni
   to'liq ekrandagi rasmni barmoq bilan kattalashtirish brauzerning o'zida
   ishlaydi. Bu Mini App'dan farq qiladi — u yerda sahifa umuman
   skrollamaydi va shuning uchun o'z zoom'i bor (CLAUDE.md).
   Sichqonchada esa pinch yo'q, shuning uchun bosilganda 2x ga o'tadi va
   bosilgan NUQTA markazda qoladi. */
function openZoom(src) {
  if (!src) return;
  document.getElementById('zoom')?.remove();
  const box = document.createElement('div');
  box.className = 'zoom';
  box.id = 'zoom';
  box.innerHTML = `
    <button class="zoom-x" data-action="closeZoom" aria-label="${esc(t('myAddrClose'))}">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    <img class="zoom-img" src="${esc(src)}" alt="" />`;

  box.addEventListener('click', (e) => {
    const rasm = e.target.closest('.zoom-img');
    if (!rasm) { closeZoom(); return; }   // fon bosilsa — yopiladi
    const kattami = rasm.classList.toggle('is-2x');
    if (!kattami) { rasm.style.transformOrigin = ''; return; }
    // Bosilgan nuqta markazda qolsin — aks holda 2x har doim rasmning
    // o'rtasini ko'rsatib, xaridor qaragan joy ekrandan chiqib ketardi.
    const r = rasm.getBoundingClientRect();
    rasm.style.transformOrigin =
      `${((e.clientX - r.left) / r.width * 100).toFixed(1)}% ${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`;
  });

  document.body.appendChild(box);
  document.body.style.overflow = 'hidden';
}

function closeZoom() {
  document.getElementById('zoom')?.remove();
  // ⚠️ Skroll faqat BOSHQA oyna ochiq bo'lmasa tiklanadi: savat panelidan
  // ochilgan bo'lsa uni ham qulfdan chiqarib yuborardi.
  if (!isOpen()) document.body.style.overflow = '';
}

/** Sotuvchi nomi bo'yicha katalogni filtrlash — "do'kon sahifasi" YO'Q,
    shuning uchun mavjud qidiruv ishlatiladi (`applyFilter` `data-supplier`
    ni ham qidiradi). Ishlamaydigan havola qo'yishdan ko'ra shu. */
function sellerProducts(nom) {
  closePdp();
  const inp = document.getElementById('search-inp');
  if (inp) { inp.value = nom; onSearch(nom); }
  document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closePdp() {
  const box = document.getElementById('pdp');
  pdpId = null;
  pdpAllReviews = false;
  if (box) { box.hidden = true; box.innerHTML = ''; }
  document.body.classList.remove('pdp-on');
  // Qadalgan qator bilan birga header'ni surib turgan belgi ham ketadi —
  // aks holda katalogga qaytgan odam header'siz qolardi (belgi tanada,
  // qator esa `#pdp` ichida edi, ya'ni u O'ZI bilan ketmasdi).
  document.body.classList.remove('pdp-bar-on');
  pdpTitle(null);
  mNavActive('catalog');
  // Takror qorovuli bo'shatiladi (`closeCart()` dagi bilan bitta sabab):
  // matoni yopib qayta ochish — YANGI ko'rish, va aynan shu takrorlanuvchi
  // qiziqish "eng ko'p ko'rilgan mato" raqamining ma'nosi.
  trackOxirgi = '';
  // Manzil qatorida mahsulot yo'li qolib ketmasin — qolsa sahifa
  // yangilanganda katalog o'rniga o'sha mahsulot ochilardi.
  if (pdpFromUrl()) history.pushState({}, '', '/' + location.search);
}

/* ── Manzil qatori ──
   Mahsulot HAQIQIY yo'lda yashaydi: `lolamarket.uz/mahsulot/<id>`.

   Ilgari (2026-08-16 ning birinchi yarmida) bu yerda hash turardi
   (`#/mahsulot/<id>`) va sababi shu edi: hash serverga UMUMAN yuborilmaydi,
   ya'ni nginx'ga tegmaslik mumkin. Lekin o'sha xususiyatning O'ZI narx ham
   edi — server qaysi mato so'ralganini BILMAYDI, ya'ni Telegramga havola
   tashlanganda oldindan ko'rish har doim umumiy sayt tavsifini ko'rsatardi
   va Google mahsulotni hech qachon indekslamasdi.

   O'LCHANDI (2026-08-16), taxmin qilinmadi:
     `/mahsulot/ik-1402`  → `200 text/html` (nginx allaqachon index.html
       qaytaradi, ya'ni marshrutlash uchun nginx'ga TEGISH SHART EMAS);
     `/mahsulot/style.css` → `200 text/html` — 🔴 nisbiy yo'l shu yerda
       JIMGINA sinardi. Shuning uchun `index.html` dagi HAMMA yo'l mutlaqqa
       o'tkazildi (`/style.css`, `/Photo/…`) va `pwa.js` `/sw.js` ga.
   ⚠️ Yangi nisbiy yo'l qo'shilsa u AYNAN shu tuzoqqa tushadi — qorovul:
   `server/test.js` → Test 38. */
const PDP_PATH = '/mahsulot/';

/** Eski hash havolalari (`#/mahsulot/x`) — tarqab ketgan bo'lishi mumkin */
const PDP_HASH = '#/mahsulot/';

function pdpPush(id) {
  const yangi = PDP_PATH + encodeURIComponent(id);
  if (location.pathname === yangi) return;
  history.pushState({ pdp: id }, '', yangi);
}

/** Manzildan mahsulot id'sini oladi; mahsulot sahifasi bo'lmasa `null` */
function pdpFromUrl() {
  const p = location.pathname || '';
  if (p.indexOf(PDP_PATH) !== 0) return null;
  const xom = p.slice(PDP_PATH.length);
  if (!xom) return null;
  try { return decodeURIComponent(xom); } catch (_) { return xom; }
}

/* Eski hash havolasi kelsa — YANGI manzilga ko'chiriladi (`replaceState`,
   `push` EMAS: aks holda "orqaga" tugmasi o'sha hash'ga qaytib, cheksiz
   aylanib qolardi). Tarqalgan havola o'lmasin degan yagona sabab bilan
   turadi; yangi havola hech qachon hash bilan yasalmaydi. */
function pdpMigrateHash() {
  const h = location.hash || '';
  if (h.indexOf(PDP_HASH) !== 0) return;
  let id = h.slice(PDP_HASH.length);
  try { id = decodeURIComponent(id); } catch (_) { /* xom holicha */ }
  if (!id) return;
  history.replaceState({ pdp: id }, '', PDP_PATH + encodeURIComponent(id));
}
pdpMigrateHash();

/* Brauzerning "orqaga"/"oldinga" tugmasi. `pushState` bilan qo'yilgan holat
   shu yerda o'qiladi — aks holda orqaga bosgan foydalanuvchi manzil
   o'zgarganini ko'rar, ekran esa o'zgarmasdi. */
window.addEventListener('popstate', () => {
  const id = pdpFromUrl();
  if (!id) { if (pdpId) closePdp(); return; }
  if (id === pdpId) return;
  if (!product(id)) { closePdp(); return; }
  pdpId = id;
  pdpAllReviews = false;
  renderPdp();
  loadReviews(id);
  window.scrollTo(0, 0);
  // `openDetail` dagi bilan bitta sabab: qator skroll tiklangandan KEYIN
  // hisoblanadi, aks holda "orqaga" bosilgan sahifada header surilgan
  // holatda qolib ketardi.
  pdpBarSync();
});

function addFromDetail(id) {
  addToCart(id);
  renderPdpAct();
}

function setQtyDetail(id, d) {
  setQty(id, d);
  renderPdpAct();
}

/* ── data-action uchun ingichka o'ramlar ──
   Delegatsiya BITTA argument uzatadi, bu funksiyalar esa ikkitasini oladi
   (id va qadam). Shuning uchun ular `id|delta` shaklida kodlanadi — xuddi
   `openReview` dagi `orderId|productId` kabi, ya'ni yangi konvensiya emas.
   Asl funksiyalar imzosi ATAYLAB o'zgarmadi: ular domen amali, o'ram esa
   faqat transport. */
function qtyStep(arg) {
  const [id, d] = String(arg).split('|');
  setQty(id, Number(d));
}

function qtyStepDetail(arg) {
  const [id, d] = String(arg).split('|');
  setQtyDetail(id, Number(d));
}

/* ── Sharh yozish (saytda) ──
   Kimlik cookie sessiyasidan — brauzer hech qanday ID yubormaydi, server
   uni o'zi aniqlaydi (server/routes/reviews.js → reviewAuthor). */

let reviewTarget = null;   // { orderId, productId, productName }
let reviewStars = 5;
let reviewBody = '';
let reviewSending = false;
/** Biriktirilgan rasm — data-URL (db/030). Ozon darsi: kelgan matoning
    haqiqiy fotosi — eng kuchli ishonch signali. */
let reviewPhoto = null;

/** Shu buyurtmadagi shu mahsulotga sharh yozilganmi? */
function reviewOf(orderId, productId) {
  return myReviews.find((r) => r.orderId === orderId && r.productId === productId) || null;
}

function openReview(arg) {
  const [orderId, productId] = String(arg).split('|');
  const o = (myOrders || []).find((x) => x.id === orderId);
  const item = o && (o.items || []).find((i) => i.id === productId);
  if (!item) return;
  reviewTarget = { orderId, productId, productName: item.name || productId };
  reviewStars = 5;
  reviewBody = '';
  reviewSending = false;
  reviewPhoto = null;
  drawerView = 'review';
  renderDrawer();
}

function setReviewStars(n) {
  reviewStars = Number(n) || 5;
  renderDrawer();
}

function onReviewBody(v) { reviewBody = v; }

/* Fayl `change` delegatsiyasidan keladi — qiymat emas, faylning O'ZI kerak,
   shuning uchun maydon id orqali o'qiladi. 4 MB chegarasi server bilan
   bir xil (routes/reviews.js → MAX_REVIEW_PHOTO_BYTES): klientda katta
   fayl darhol rad etiladi, server esa baribir O'ZI tekshiradi. */
function onReviewPhoto() {
  const inp = document.getElementById('rv-photo-inp');
  const f = inp && inp.files && inp.files[0];
  if (!f) { reviewPhoto = null; renderDrawer(); return; }
  if (f.size > 4 * 1024 * 1024) { showToast(t('revPhotoBig')); inp.value = ''; return; }
  const rd = new FileReader();
  rd.onload = () => { reviewPhoto = String(rd.result || ''); renderDrawer(); };
  rd.readAsDataURL(f);
}

/* Sharh va bahs formalari FAQAT buyurtma qatoridan ochiladi, ya'ni qaytish
   joyi — buyurtmalar ro'yxati, profil EMAS: profilga qaytarilsa foydalanuvchi
   baholaganidan keyin ro'yxatni qaytadan ochishga majbur bo'lardi.
   ⚠️ Ilgari bu yerda `backToProfile` NING IKKINCHI, AYNI NUSXASI turardi
   (yuqorida, `pickAddrPoint` yonida ham bor). Ikkinchi e'lon birinchisini
   JIMGINA bekor qiladi — biri tahrirlansa hech narsa o'zgarmasdi va sabab
   ko'rinmasdi. Endi ikkita ALOHIDA nishon, ikkita ALOHIDA nom bilan. */
function backToOrders() {
  drawerView = 'orders';
  renderDrawer();
}

/* ── «Qayta buyurtma» (db/030) ──
   Buyurtmadagi matolar savatga qaytariladi. Faqat HOZIR mavjud (katalogda
   bor va tugamagan) matolar tushadi — yo'qolganiga jimgina «qo'shildi»
   deyilmaydi: bittasi ham tushmasa alohida xabar chiqadi. Miqdor eski
   buyurtmadan olinadi, lekin MOQ dan kam bo'lmaydi (server baribir rad
   etardi — xaridor sababini checkout oxirida emas, shu yerda ko'rsin). */
function reorderOrder(orderId) {
  const o = (myOrders || []).find((x) => x.id === orderId);
  if (!o) return;
  let qoshildi = 0;
  (o.items || []).forEach((it) => {
    if (!product(it.id) || soldOutIds.has(it.id)) return;
    const q = Math.max(Number(it.qty) || 1, moqOf(it.id));
    cart[it.id] = (cart[it.id] || 0) + q;
    qoshildi += 1;
    track('cart', 'cart', it.id);
  });
  if (!qoshildi) { showToast(t('reorderNone')); return; }
  saveCart();
  updateBadge();
  drawerView = 'cart';
  renderDrawer();
  showToast(t('reorderDone'));
}

function reviewFormHtml() {
  const nishon = reviewTarget;
  if (!nishon) return '';
  return `
    <div class="rv">
      <div class="rv-target">${esc(nishon.productName)}</div>
      <div class="rv-sub">${t('reviewHint')}</div>

      <div class="rv-stars">
        ${[1, 2, 3, 4, 5].map((n) => `
        <button class="rv-star ${n <= reviewStars ? 'on' : ''}" data-action="setReviewStars" data-arg="${n}" aria-label="${n} yulduz">★</button>`).join('')}
      </div>

      <textarea class="rv-text" rows="4" placeholder="${t('reviewPh')}"
        data-input="onReviewBody">${esc(reviewBody)}</textarea>

      <!-- Foto (ixtiyoriy, db/030). Fayl maydoni yashirin — label bosadi. -->
      <label class="rv-photo${reviewPhoto ? ' on' : ''}">
        <input id="rv-photo-inp" type="file" accept="image/*" data-change="onReviewPhoto">
        📷 ${reviewPhoto ? t('revPhotoOn') : t('revPhotoAdd')}
      </label>

      <div class="rv-btns">
        <button class="auth-ghost" data-action="backToOrders">${t('cancelShort')}</button>
        <button class="pd-add" data-action="submitReview" ${reviewSending ? 'disabled' : ''}>${reviewSending ? t('sending') : t('send')}</button>
      </div>
    </div>`;
}

function submitReview() {
  if (!reviewTarget || reviewSending) return;
  reviewSending = true;
  renderDrawer();
  const nishon = reviewTarget;
  apiJson('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: nishon.orderId,
      productId: nishon.productId,
      stars: reviewStars,
      body: reviewBody.trim() || undefined,
      photo: reviewPhoto || undefined,
    }),
  })
    .then((d) => {
      if (!d || d.ok !== true) throw new Error((d && d.error) || 'Sharh yuborilmadi');
      showToast(t('reviewThanks'));
      // Reyting serverda qayta hisoblandi — keshlarni bekor qilamiz, aks holda
      // xaridor o'z sharhini yozib, eski reytingni ko'rib turardi
      delete reviewsCache[nishon.productId];
      catalogMeta = null;
      catalogMetaTried = false;
      loadMyReviews();
      backToOrders();
    })
    .catch((e) => {
      reviewSending = false;
      renderDrawer();
      showToast(e.message || 'Sharh yuborilmadi');
    });
}

/* ====================================================
   BAHS OCHISH (xaridor tomoni, 2026-08-12)

   Sayt kafolat va'da qilardi, lekin muammoni bildiradigan MEXANIZM yo'q edi —
   xaridor faqat Mini App orqali bahs ocha olardi. Endpoint ham faqat
   Telegram initData'ni qabul qilardi; u `requestUser()` bilan ikkala kanalga
   ochildi (`server/lib/auth.js`).

   Dalil rasmi shu yerda YIG'ILMAYDI: bahs ochilgach bot xaridordan rasm
   so'raydi va Telegram faqat `file_id` ni beradi — fayl bizning serverga
   tushmaydi. Sayt xaridorida Telegram hisobi bor (kirish o'sha orqali
   bo'lgan), ya'ni bot xabari unga yetib boradi.
   ==================================================== */

let disputeTarget = null;      // { orderId }
let disputeReason = 'damaged';
let disputeComment = '';
let disputeSending = false;

function openDispute(orderId) {
  const o = (myOrders || []).find((x) => x.id === orderId);
  if (!o) return;
  disputeTarget = { orderId };
  disputeReason = 'damaged';
  disputeComment = '';
  disputeSending = false;
  drawerView = 'dispute';
  renderDrawer();
}

function setDisputeReason(k) {
  if (DISPUTE_REASONS[k]) disputeReason = k;
  renderDrawer();
}

function onDisputeComment(v) { disputeComment = v; }

function disputeFormHtml() {
  const nishon = disputeTarget;
  if (!nishon) return '';
  return `
    <div class="rv">
      <div class="rv-target">${t('orderWord')} ${esc(nishon.orderId)}</div>
      <div class="rv-sub">${t('disputeHint')}</div>

      <div class="dsp-reasons">
        ${Object.keys(DISPUTE_REASONS).map((k) => `
        <button class="dsp-reason ${k === disputeReason ? 'on' : ''}" data-action="setDisputeReason" data-arg="${esc(k)}">
          ${esc(DISPUTE_REASONS[k])}
        </button>`).join('')}
      </div>

      <textarea class="rv-text" rows="4" placeholder="Qisqacha tafsilot (ixtiyoriy)"
        data-input="onDisputeComment">${esc(disputeComment)}</textarea>

      <div class="rv-btns">
        <button class="auth-ghost" data-action="backToOrders">${t('cancelShort')}</button>
        <button class="pd-add" data-action="submitDispute" ${disputeSending ? 'disabled' : ''}>${disputeSending ? t('sending') : t('sendDispute')}</button>
      </div>
    </div>`;
}

function submitDispute() {
  if (!disputeTarget || disputeSending) return;
  disputeSending = true;
  renderDrawer();
  const nishon = disputeTarget;
  apiJson('/api/disputes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: nishon.orderId,
      reasonKey: disputeReason,
      comment: disputeComment.trim() || undefined,
    }),
  })
    .then((d) => {
      if (!d || d.ok !== true) throw new Error((d && d.error) || "Murojaat yuborilmadi");
      showToast("Murojaat qabul qilindi — botda rasm so'raladi");
      loadMyDisputes();
      backToOrders();
    })
    .catch((e) => {
      disputeSending = false;
      renderDrawer();
      showToast(e.message || 'Murojaat yuborilmadi');
    });
}

/* ── «Buyurtmani oldim» (2026-09-02) ──
   shipped → delivered o'tishining amaldagi yagona ishlaydigan yo'li —
   tafsilot serverda (`routes/orders.js` → `handleOrderDelivered`).
   `window.confirm` SHART: bosish sharh va sotuvchi payout yo'lini ochadi,
   ya'ni bu ko'rinish emas, pul oqimiga ta'sir qiladigan amal. */
function confirmDelivered(orderId) {
  if (!window.confirm(t('gotItAsk'))) return;
  apiJson('/api/order-delivered', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  })
    .then((d) => {
      if (!d || d.ok !== true) throw new Error((d && d.error) || t('gotItErr'));
      showToast(t('gotItDone'));
      // Ro'yxat SERVERDAN qayta yuklanadi — lokal holatni qo'lda tuzatish
      // o'rniga haqiqat manbai bazadan olinadi (tarix qatori ham yangilanadi).
      loadMyOrders();
    })
    .catch((e) => showToast(e.message || t('gotItErr')));
}

/* ── Toast ── */
let toastTimer = null;
function showToast(msg) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 2600);
}

/* ====================================================
   SAVAT
   Mahsulot ma'lumoti DOM'dagi data-* atributlaridan
   o'qiladi — yagona manba, JS'da takrorlanmaydi.
   ==================================================== */

const CART_KEY = 'lolamarket_web_cart';
const FAV_KEY = 'lolamarket_web_favs';

/** cart: { [id]: qty } */
let cart = loadCart();
/** favs: saralangan mahsulot id'lari */
let favs = loadFavs();
/** drawer holati: 'cart' | 'checkout' | 'done' | 'fav' */
let drawerView = 'cart';
let lastOrderId = '';

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
    const clean = {};
    Object.keys(raw).forEach((id) => {
      const qty = parseInt(raw[id], 10);
      if (qty > 0) clean[id] = Math.min(qty, 999);
    });
    return clean;
  } catch (e) {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) { /* private mode — jim o'tamiz */ }
}

/* DIQQAT: bu yerda ilgari `filter((id) => productEl(id))` turardi — DOM'da
   yo'q mahsulot darhol tashlab yuborilardi. Endi katalogning bir qismi
   `/api/products` dan KEYINROQ keladi, ya'ni o'sha tekshiruv xaridorning
   haqiqiy tanlovini o'chirib yuborardi. Tozalash `settleCatalog()` ga
   ko'chirildi — u so'rov tugagandan keyin ishlaydi. */
function loadFavs() {
  try {
    const raw = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((id) => typeof id === 'string') : [];
  } catch (e) {
    return [];
  }
}

function saveFavs() {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  } catch (e) { /* private mode */ }
}

function productEl(id) {
  return document.querySelector(`.product-card[data-id="${CSS.escape(id)}"]`);
}

function product(id) {
  const el = productEl(id);
  if (!el) return null;
  return {
    id,
    name: el.dataset.name,
    price: Number(el.dataset.price) || 0,
    supplier: el.dataset.supplier,
    // `currentSrc` — brauzer <picture> dan HAQIQATAN tanlagan manba (WebP),
    // `src` esa har doim JPEG zaxirasi. `src` olinsa tafsilot oynasi, savat va
    // saralanganlar AYNAN bir rasmni ikkinchi formatda qaytadan yuklardi.
    // `currentSrc` rasm yuklana boshlaguncha bo'sh bo'ladi (`loading="lazy"`),
    // shuning uchun zaxira sifatida `src` qoladi.
    img: el.querySelector('img')?.currentSrc
      || el.querySelector('img')?.getAttribute('src') || '',
  };
}

function money(n) {
  return n.toLocaleString('ru-RU').replace(/ /g, ' ') + " so'm";
}

/* ── To'lov sozlamalari ──
   Haqiqiy manba — SERVER (`/api/auth/web/me` javobi, `server/config.js`).
   Bu yerdagi qiymatlar javob kelmaguncha ishlatiladigan zaxira, ya'ni ular
   "taxmin", "haqiqat" emas. Sabab: `PREPAY_RATE` `.env` orqali o'zgarishi
   mumkin va o'zgargan kuni saytdagi qo'lda yozilgan raqam jimgina yolg'onga
   aylanardi — xaridor bir summani ko'rib, server boshqasini hisoblardi.

   ⚠️ Bularning hech biri hisob-kitob uchun ishonchli emas: buyurtma summasi
   HAR DOIM server tomonda qayta hisoblanadi (`routes/orders.js`). Bu faqat
   xaridorga NIMA KO'RSATILISHI. */
let DELIVERY_FEE_ESTIMATE = 25000;
let PREPAY_RATE = 0.5;

function prepayAmount(total) { return Math.round(total * PREPAY_RATE); }
function restAmount(total) { return total - prepayAmount(total); }

/* ── BTS olish nuqtalari ──
   Mini App'dagi `BTS_POINTS` bilan AYNAN bir xil ro'yxat
   (`telegram-app/app.js`). Vaqtinchalik: BTS integratsiyasi ulangach
   ikkalasi ham serverdan (`/api/bts-points`) o'qiydi.

   ⚠️ Ro'yxat ikki joyda turgani BILIB QILINGAN vaqtinchalik qaror, chunki
   uchinchi nusxa (server) hali yo'q. Nomlar o'zgarsa IKKALASI birga
   yangilansin — aks holda sayt va Mini App boshqa-boshqa nuqta nomini
   buyurtmaga yozib yuborardi. */
// 🔴 `lat`/`lng` — TUMAN/SHAHAR MARKAZI aniqligida, BTS eshigining aniq
// koordinatasi EMAS (2026-08-13). Ro'yxatning O'ZI namuna bo'lgani uchun
// aniq koordinata o'ylab topilgan raqam bo'lardi (CLAUDE.md taqiqi), va
// kartada u ayniqsa qimmatga tushardi: xarita ANIQ ko'rsatayotgandek
// tuyuladi, ya'ni yolg'on ishonch beradi. Shuning uchun karta ustida
// `mapApprox` ogohlantirishi DOIM turadi — u BTS'dan haqiqiy koordinata
// kelgan kuni olib tashlanadi.
const BTS_REGIONS = [
  { key: 'tas', name: 'Toshkent' },
  { key: 'far', name: "Farg'ona" },
  { key: 'sam', name: 'Samarqand' },
  { key: 'bux', name: 'Buxoro' },
  { key: 'and', name: 'Andijon' },
];
const BTS_POINTS = [
  { id: 'bts-112', lat: 41.2756, lng: 69.2044, region: 'tas', name: "BTS №112 — Chilonzor",         addr: "Bunyodkor ko'ch. 45",        hours: '9:00–19:00' },
  { id: 'bts-097', lat: 41.3556, lng: 69.2894, region: 'tas', name: "BTS №097 — Yunusobod",         addr: "Amir Temur ko'ch. 12",       hours: '9:00–18:00' },
  { id: 'bts-054', lat: 41.2232, lng: 69.22, region: 'tas', name: "BTS №054 — Sergeli",           addr: "Yangi Sergeli 8",            hours: '9:00–19:00' },
  { id: 'bts-021', lat: 41.3253, lng: 69.3346, region: 'tas', name: "BTS №021 — Mirzo Ulug'bek",    addr: "Mustaqillik ko'ch. 78",      hours: '9:00–18:00' },
  { id: 'bts-140', lat: 40.3894, lng: 71.7864, region: 'far', name: "BTS №140 — Farg'ona markaz",   addr: "Mustaqillik ko'ch. 24",      hours: '9:00–18:00' },
  { id: 'bts-146', lat: 40.4711, lng: 71.7244, region: 'far', name: "BTS №146 — Marg'ilon",         addr: "Toshkent ko'ch. 5",          hours: '9:00–18:00' },
  { id: 'bts-203', lat: 39.6547, lng: 66.9758, region: 'sam', name: "BTS №203 — Samarqand markaz",  addr: "Registon ko'ch. 3",          hours: '9:00–19:00' },
  { id: 'bts-311', lat: 39.7747, lng: 64.4286, region: 'bux', name: "BTS №311 — Buxoro markaz",     addr: "Bahouddin Naqshband 17",     hours: '9:00–18:00' },
  { id: 'bts-408', lat: 40.7821, lng: 72.3442, region: 'and', name: "BTS №408 — Andijon markaz",    addr: "Navoiy shoh ko'chasi 41",    hours: '9:00–18:00' },
];
function btsById(id) { return BTS_POINTS.find((p) => p.id === id) || null; }

/* ── Biz bilan bog'lanish ──
   LolaMarket qo'llab-quvvatlash kanallari (2026-08-13 founder qarori).

   ⚠️ AYNI blok Mini App'da ham bor (`telegram-app/app.js` → `SUPPORT`) —
   BTS ro'yxati bilan bitta naqsh: nusxa BILIB QILINGAN, chunki uchinchi
   manba (server) hali yo'q. Raqam yoki username o'zgarsa IKKALASI birga
   yangilansin, aks holda ikki yuzda ikki xil raqam turib qolardi.

   ⚠️ `tel` — moshina o'qiydigan shakl (probel va qavssiz), `telLabel` —
   odam o'qiydigan shakl. Bittasidan ikkinchisini yasash (probellarni olib
   tashlash) bir kun kelib jimgina buzilardi, shuning uchun ikkalasi
   ALOHIDA yoziladi. */
const SUPPORT = {
  tel: '+998939993996',
  telLabel: '+998 (93) 999-39-96',
  tgUser: 'furqattukhsanov',
  tgUrl: 'https://t.me/furqattukhsanov',
};

/* Yandex karta kaliti — SERVERDAN (`/api/auth/web/me` → `mapsClientConfig`).
   `null` = karta o'chiq: nuqta ro'yxatdan tanlanadi va funksiya to'liq
   ishlayveradi (karta tashqi xizmat, u yiqilsa manzil o'zgartirib
   bo'lmaydigan holat bo'lmasin). */
let mapsKey = null;

/* Tanlangan nuqta saqlanadi — B2B xaridor deyarli doim bitta nuqtadan oladi.
   Kalit Mini App'dagi bilan AYNAN bir xil va bu ATAYLAB: sayt ham, Mini App
   ham `lolamarket.uz` domenida, ya'ni `localStorage` ular orasida umumiy.
   Mini App'da nuqta tanlagan xaridor saytda uni to'ldirilgan holda topadi. */
const BTS_KEY = 'lolamarket_bts_point';
let btsPoint = (() => {
  try { return localStorage.getItem(BTS_KEY) || null; } catch (e) { return null; }
})();

/* ⚠️ Bu yerda `renderDrawer()` CHAQIRILMAYDI. Checkout — to'ldirilayotgan
   forma: uni qaytadan chizish xaridor allaqachon yozgan ism, telefon va
   izohni O'CHIRIB yuboradi (2026-08-12 da sinovda aynan shunday bo'ldi —
   uch maydon ham bo'shab qoldi). Tanlov `<select>` da o'zi ko'rinib turadi,
   shuning uchun faqat yonidagi izoh qatori almashtiriladi. */
function setBtsPoint(id) {
  btsPoint = btsById(id) ? id : null;
  try {
    // ⚠️ Bo'shatilganda kalit O'CHIRILADI, shunchaki yozilmay qo'yilmaydi
    // (2026-08-13). Ilgari `if (btsPoint)` sharti sababli eski qiymat
    // brauzerda qolib ketardi va sahifa qayta yuklanganda tanlov
    // TIRILARDI — ya'ni boshqa qurilmada o'chirilgan manzil bu yerda
    // o'zicha qaytib kelardi va buni hech narsa ko'rsatmasdi.
    if (btsPoint) localStorage.setItem(BTS_KEY, btsPoint);
    else localStorage.removeItem(BTS_KEY);
  } catch (e) { /* private mode */ }
  paintBtsInfo();
}

/* Xulosadagi raqamlarni JOYIDA yangilaydi — butun formani qayta chizmasdan.
   Sozlama serverdan kechroq kelsa (checkout allaqachon ochiq bo'lsa) shu
   chaqiriladi. Checkout ochiq bo'lmasa hech narsa qilmaydi. */
function paintCheckoutTotals() {
  const pct = document.getElementById('co-prepay-pct');
  if (!pct) return;
  const total = cartTotal();
  pct.textContent = Math.round(PREPAY_RATE * 100) + '%';
  document.getElementById('co-prepay-val').textContent = money(prepayAmount(total));
  document.getElementById('co-rest-val').textContent = money(restAmount(total));
  document.getElementById('co-delivery').textContent = money(DELIVERY_FEE_ESTIMATE);
}

function paintBtsInfo() {
  const sel = document.getElementById('co-bts');
  const old = sel?.parentElement?.querySelector('.co-bts-info, .co-hint');
  if (!old) return;
  const p = btsById(btsPoint);
  const box = document.createElement('div');
  if (p) {
    box.className = 'co-bts-info';
    box.textContent = `${p.addr} · Ish vaqti ${p.hours}`;
  } else {
    box.className = 'co-hint';
    box.textContent = t('btsHint');
  }
  old.replaceWith(box);
}

function cartCount() {
  return Object.values(cart).reduce((s, q) => s + q, 0);
}

function cartTotal() {
  return Object.keys(cart).reduce((s, id) => {
    const p = product(id);
    return p ? s + p.price * cart[id] : s;
  }, 0);
}

/* ── Savatga qo'shish ── */
function addToCart(id) {
  if (!product(id)) return;
  // Zaxirasi tugagan mahsulot savatga TUSHMAYDI. Tugmani yashirish yagona
  // qorovul emas: server ham `stock >= qty` shartida atomik tekshiradi
  // (`routes/orders.js` → `decrementStock`). Bu yerdagi tekshiruv xaridor
  // butun checkout'ni to'ldirib bo'lib "tugagan" xatosini ko'rmasligi uchun.
  if (soldOutIds.has(id)) { showToast("Bu mato hozircha tugagan"); return; }
  // Birinchi qo'shishda darrov MOQ dan boshlanadi — 1 dan boshlanib,
  // keyin "nega 5 ta bo'ldi" degan savol tug'ilmasin va checkout'da
  // kutilmagan rad javobi chiqmasin.
  const eng = moqOf(id);
  cart[id] = cart[id] ? cart[id] + 1 : eng;
  saveCart();
  updateBadge();
  renderCardAction(id);
  if (isOpen() && (drawerView === 'cart' || drawerView === 'fav')) renderDrawer();
  // Voronkaning ikkinchi pog'onasi. ⚠️ FAQAT birinchi qo'shish emas, HAR
  // qo'shish yoziladi — panel baribir TASHRIFCHI bo'yicha noyoblaydi
  // (`routes/admin.js` → `handleAdminTraffic` → voronka izohi), ya'ni bu
  // yerda saralash qilish o'lchovni ikki joyga bo'lib yuborardi.
  track('cart', 'cart', id);
}

/* ⚠️ Kartochka SAHIFADA BIR NECHTA joyda turishi mumkin (2026-08-16):
   katalogda va mahsulot sahifasidagi "o'xshash matolar" da AYNI kartochka
   ko'rinadi. Shuning uchun bu ikki funksiya `getElementById` dan
   `querySelectorAll` ga o'tkazildi va belgi `id` dan `data-*` ga ko'chdi:
   `id` hujjatda YAGONA bo'lishi shart, ya'ni ikkinchi nusxa jimgina
   yangilanmay qolardi — savatga qo'shilgan mato bir joyda "1 dona",
   ikkinchisida "Savatga" bo'lib turardi va qaysi biri haqiqat ekani
   ko'rinmasdi. */
function cardBoxes(attr, id) {
  return document.querySelectorAll(`[data-${attr}="${CSS.escape(id)}"]`);
}

/** Kartadagi tanlagich: qty 0 bo'lsa "Savatga", aks holda − N dona + */
function renderCardAction(id) {
  const boxes = cardBoxes('act', id);
  if (!boxes.length) return;
  const qty = cart[id] || 0;

  // Zaxira tugagan — "Savatga" o'rniga o'chirilgan holat. Miqdor tanlagichi
  // ham chizilmaydi: savatda turgan mahsulot tugab qolsa "+" bosish
  // xaridorni serverdagi xatoga olib borardi.
  const html = soldOutIds.has(id)
    ? `<button class="add-btn is-out" type="button" disabled>${esc(stockTxt('out'))}</button>`
    : !qty
    ? `<button class="add-btn" data-action="addToCart" data-arg="${esc(id)}">
         <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
         Savatga
       </button>`
    : `<div class="qty-row">
         <button class="qty-circle qty-minus" data-action="qtyStep" data-arg="${esc(id)}|-1" aria-label="${t('decrease')}">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>
         </button>
         <span class="qty-num">${qty} dona</span>
         <button class="qty-circle qty-plus" data-action="qtyStep" data-arg="${esc(id)}|1" aria-label="${t('increase')}">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
         </button>
       </div>`;

  boxes.forEach((box) => { box.innerHTML = html; });
}

/** Barcha kartalarni savat holatiga moslash */
function renderAllCardActions() {
  document.querySelectorAll('.product-card').forEach((el) => renderCardAction(el.dataset.id));
}

/* ====================================================
   SARALANGANLAR
   ==================================================== */

function isFav(id) {
  return favs.indexOf(id) !== -1;
}

function toggleFav(id) {
  if (!product(id)) return;
  const i = favs.indexOf(id);
  if (i === -1) favs.push(id); else favs.splice(i, 1);
  saveFavs();
  renderFavBtn(id, i === -1);
  renderPdpFav(id);
  updateFavBadge();
  if (drawerView === 'fav' && isOpen()) renderDrawer();
}

/* Mahsulot sahifasidagi yurakcha — kartochkanikidan ALOHIDA yangilanadi.
   Sabab texnik: kartochkadagi tugma `id="fav-<id>"` bilan yashaydi va
   sahifada ikkinchi marta shu `id` ni ishlatib bo'lmaydi (`getElementById`
   birinchisini topib, ikkinchisi jimgina yangilanmay qolardi). */
function renderPdpFav(id) {
  const btn = document.getElementById('pdp-fav');
  if (!btn || pdpId !== id) return;
  const on = isFav(id);
  btn.classList.toggle('on', on);
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  const txt = btn.querySelector('.pdp-fav-txt');
  if (txt) txt.textContent = on ? t('pdpFavOn') : t('pdpFavAdd');
}

/** Kartadagi yurakcha holati; `pulse` — endigina qo'shilganda urib qo'yadi.
    Kartochka bir nechta joyda turishi mumkin — `cardBoxes()` izohiga qara. */
function renderFavBtn(id, pulse) {
  const on = isFav(id);
  cardBoxes('fav', id).forEach((btn) => {
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? "Saralanganlardan olib tashlash" : "Saralanganlarga qo'shish");
    if (pulse) {
      btn.classList.remove('pulse');
      void btn.offsetWidth; // animatsiyani qayta ishga tushirish
      btn.classList.add('pulse');
    }
  });
}

function renderAllFavBtns() {
  document.querySelectorAll('.product-card').forEach((el) => renderFavBtn(el.dataset.id, false));
}

/* Son ko'rsatilmaydi — faqat yurakcha to'ladi */
function updateFavBadge() {
  const btn = document.getElementById('fav-btn');
  if (btn) btn.classList.toggle('on', favs.length > 0);
}

function openFav() {
  drawerView = 'fav';
  renderDrawer();
  openDrawerEl();
}

/** Saralanganlardan savatga — yurakchada qoladi, faqat savatga qo'shiladi */
function favToCart(id) {
  addToCart(id);
  if (drawerView === 'fav') renderDrawer();
}

/* Mahsulotning eng kam buyurtmasi (MOQ). Manba — BAZA (`/api/products`);
   kelmagan bo'lsa 1, ya'ni cheklov "bor" deb TAXMIN qilinmaydi.
   ⚠️ Bu YAGONA tekshiruv emas: server ham har buyurtmada mustaqil
   tekshiradi (`routes/orders.js` — `qty < moq` bo'lsa rad etadi). Bu
   yerdagisi xaridor butun checkout'ni to'ldirib bo'lib, oxirida rad
   javobini olmasligi uchun. */
function moqOf(id) {
  const m = catalogMeta ? catalogMeta[id] : null;
  const n = m ? Number(m.moq) : 1;
  return Number.isFinite(n) && n > 1 ? n : 1;
}

function setQty(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  // MOQ dan pastga tushirilmaydi: "−" bilan 1 ga tushirib bo'lgan xaridor
  // buyurtma yuborganda serverdan rad javobini olardi va sababi faqat
  // o'sha yerda ko'rinardi. Chegaradan pastga bosilsa qator butunlay
  // olib tashlanadi — 3 dona MOQ da "2 dona" degan holat MAVJUD EMAS.
  const eng = moqOf(id);
  if (cart[id] < eng) delete cart[id];
  if (cart[id] < 1) delete cart[id];
  if (!cart[id]) track('cart_remove', 'cart', id);   // shaxsiy lenta (db/029)
  saveCart();
  updateBadge();
  renderCardAction(id);
  renderDrawer();
}

function removeLine(id) {
  delete cart[id];
  track('cart_remove', 'cart', id);   // shaxsiy lenta (db/029)
  saveCart();
  updateBadge();
  renderCardAction(id);
  renderDrawer();
}

function updateBadge() {
  const n = cartCount();
  // Header'dagi va mobil nav'dagi sanoq — ikkalasi ham birga yangilanadi
  ['cart-count', 'm-cart-count'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = n;
    el.hidden = n === 0;
  });
}

/* ── Mobil pastki nav (faqat telefonda ko'rinadi) ──
   Yangi ekran yaratmaydi — mavjud drawer'larni ochadi, shuning uchun
   sahifa tuzilmasi va SEO o'zgarmaydi. */
function mNav(what) {
  if (what === 'catalog') {
    closeCart();
    // Mahsulot sahifasi ochiq bo'lsa "Katalog" AVVAL uni yopadi — aks holda
    // tugma bosilar, ekran esa o'zgarmasdi (katalog sahifa ortida yashirin).
    if (pdpId) closePdp();
    document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (what === 'fav')   openFav();
  else if (what === 'cart')    openCart();
  else if (what === 'login')   onLogin();
  mNavActive(what);
}

function mNavActive(what) {
  const map = { catalog: 'm-tab-catalog', fav: 'm-tab-fav', cart: 'm-tab-cart' };
  Object.values(map).forEach((id) => document.getElementById(id)?.classList.remove('is-active'));
  document.getElementById(map[what])?.classList.add('is-active');
}

/* ── Drawer ochish/yopish ── */
function isOpen() {
  return document.getElementById('drawer')?.classList.contains('open');
}

function openCart() {
  drawerView = 'cart';
  renderDrawer();
  openDrawerEl();
}

/** Panelni ochish — savat va saralanganlar uchun umumiy */
function openDrawerEl() {
  const d = document.getElementById('drawer');
  const s = document.getElementById('scrim');
  if (!d || !s) return;
  s.hidden = false;
  requestAnimationFrame(() => s.classList.add('show'));
  d.classList.add('open');
  d.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // ⚠️ IKKINCHI o'lchov nuqtasi va u SHART. `openCart()` avval
  // `renderDrawer()` ni chaqiradi, `.open` klassi esa SHU YERDA qo'yiladi —
  // ya'ni chizish paytida tortma hali YOPIQ va u yerdagi tekshiruv
  // hodisani tashlab yuborardi. Natijada tortmaning BIRINCHI ochilishi
  // hech qachon sanalmasdi: "Savat" ekrani faqat ochiq tortma ichida
  // ko'rinish almashtirilgandagina yozilardi. Nuqson brauzerda o'lchab
  // topildi (2026-08-18) — kod "to'g'ri" ko'rinardi.
  // Takrorni `track()` ning o'zi to'sadi, ya'ni ikkita nuqta ikki marta
  // yozmaydi.
  track('view', drawerView, null);
}

function closeCart() {
  const d = document.getElementById('drawer');
  const s = document.getElementById('scrim');
  if (!d || !s) return;
  d.classList.remove('open');
  d.setAttribute('aria-hidden', 'true');
  s.classList.remove('show');
  setTimeout(() => { s.hidden = true; }, 240);
  document.body.style.overflow = '';
  // Takror qorovulini bo'shatamiz: savatni yopib QAYTA ochish — YANGI
  // ko'rish. Bo'shatilmasa ayni ekranga qayta kirish umuman sanalmasdi.
  trackOxirgi = '';
  // muvaffaqiyat ekranidan keyin savat ko'rinishiga qaytamiz
  if (drawerView === 'done') drawerView = 'cart';
  // Panel yopilgach mobil nav'da "Katalog" yana faol bo'ladi — LEKIN ostida
  // mahsulot sahifasi turgan bo'lsa emas: u yerda foydalanuvchi katalogda
  // emas va yonib turgan "Katalog" qaerdaligi haqida yolg'on gapirardi.
  mNavActive(pdpId ? '' : 'catalog');
}

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  // Tartib MUHIM: kattalashtirilgan rasm eng USTDA turadi, ya'ni Escape
  // avval uni yopadi. Aks holda ostidagi savat yopilib, rasm ekranda
  // osilib qolardi.
  if (document.getElementById('zoom')) { closeZoom(); return; }
  if (sortSheetOpen()) { closeSortSheet(); return; }
  if (isOpen()) closeCart();
});

/* ── Drawer render ── */
function renderDrawer() {
  const body = document.getElementById('drawer-body');
  const foot = document.getElementById('drawer-foot');
  const title = document.getElementById('drawer-title');
  if (!body || !foot || !title) return;

  // ⚠️ O'lchov shu yerda, `drawerView = '...'` yozilgan 25 ta joyda EMAS:
  // ro'yxatni qo'lda yuritish kerak bo'lardi va yangi ko'rinish qo'shilganda
  // u jimgina o'lchanmay qolardi. `renderDrawer` — hammasi o'tadigan yagona
  // nuqta (`lib/auth.js` → `requestUser` bilan bitta mulohaza).
  //
  // ⚠️ Tortma YOPIQ bo'lsa hisoblanmaydi: u fon holatida ham qayta
  // chiziladi (savat soni o'zgarganda), ya'ni odam ko'rmagan ekran
  // "ko'rilgan" bo'lib yozilardi.
  if (isOpen()) track('view', drawerView, null);

  if (drawerView === 'done') {
    title.textContent = t('orderAccepted');
    body.innerHTML = doneHtml();
    foot.hidden = true;
    return;
  }

  if (drawerView === 'checkout') {
    title.textContent = t('checkout');
    body.innerHTML = checkoutHtml();
    foot.hidden = true;
    return;
  }

  if (drawerView === 'login') {
    title.textContent = t('login');
    body.innerHTML = loginHtml();
    foot.hidden = true;
    return;
  }

  if (drawerView === 'profile') {
    title.textContent = t('profile');
    body.innerHTML = profileHtml();
    foot.hidden = true;
    // Surat DOM tayyor bo'lgandan keyin qo'yiladi (o'zi bir marta so'raydi).
    mountAvatar();
    return;
  }

  if (drawerView === 'orders') {
    title.textContent = t('myOrders');
    body.innerHTML = ordersViewHtml();
    foot.hidden = true;
    return;
  }

  if (drawerView === 'address') {
    // Sarlavha KIRISH NUQTASIGA qarab: profildan kelinganda bu "mening
    // manzilim", footer'dan kelinganda esa oddiy ro'yxat — o'sha yerda
    // bosilgan so'z bilan bir xil bo'lsin, aks holda foydalanuvchi
    // "Topshirish punktlari" ni bosib "Mening manzilim" ni ko'rardi.
    title.textContent = t(addrFrom === 'footer' ? 'fPoints' : 'myAddr');
    body.innerHTML = addressPickerHtml();
    foot.hidden = true;
    // Karta HTML bilan birga kelmaydi — `#addr-map` tuguni DOM'ga
    // tushgandan keyin chiziladi, ya'ni mount aynan shu yerda bo'lishi
    // kerak (har qayta chizishda tugun YANGI bo'ladi).
    mountAddrMap();
    return;
  }

  if (drawerView === 'contact') {
    title.textContent = t('contactT');
    body.innerHTML = contactWaysHtml();
    foot.hidden = true;
    return;
  }

  // Footer bo'limlari — sarlavha ham, matn ham BITTA jadvaldan
  // (`INFO_TOPICS`), ya'ni yangi bo'lim qo'shilganda bu yerga tegilmaydi.
  if (drawerView === 'info') {
    title.textContent = t((INFO_TOPICS[infoTopic] || INFO_TOPICS.about).title);
    body.innerHTML = infoHtml();
    foot.hidden = true;
    return;
  }

  /* `detail` ko'rinishi bu yerda ATAYLAB YO'Q: mahsulot 2026-08-16 dan
     to'liq sahifada ochiladi (`#pdp`), oynada emas. Ikkalasi qoldirilsa
     bitta narsaning ikki nusxasi bo'lardi va vaqt o'tib ular ajralib
     ketardi — CLAUDE.md dagi «ikkinchi yo'l» qoidasi. */

  // Sotuvchi kabineti (2026-08-13, C2). Uchta ko'rinish bitta oynada —
  // saytda alohida sahifa yo'q, savat/checkout/profil bilan bir xil naqsh.
  if (drawerView === 'seller-products') {
    title.textContent = t('sMyProducts');
    body.innerHTML = sellerProductsHtml();
    foot.hidden = true;
    return;
  }

  if (drawerView === 'seller-form') {
    title.textContent = sEditId ? t('sEditTitle') : t('sNew');
    body.innerHTML = sellerFormHtml();
    foot.hidden = true;
    return;
  }

  if (drawerView === 'seller-orders') {
    title.textContent = t('sIncoming');
    body.innerHTML = sellerOrdersHtml();
    foot.hidden = true;
    return;
  }

  if (drawerView === 'review') {
    title.textContent = t('rateFabric');
    body.innerHTML = reviewFormHtml();
    foot.hidden = true;
    return;
  }

  if (drawerView === 'dispute') {
    title.textContent = t('problemTitle');
    body.innerHTML = disputeFormHtml();
    foot.hidden = true;
    return;
  }

  if (drawerView === 'fav') {
    title.textContent = t('favorites');
    foot.hidden = true;
    body.innerHTML = favs.length
      ? favs.map(favLineHtml).join('')
      : `<div class="drawer-empty">
           <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 20.8s-6.9-4.3-9-8a5.2 5.2 0 0 1-.5-3.7A4.8 4.8 0 0 1 6.3 5.5c1.9 0 3.4 1 4.3 2.3.4.6 1 .6 1.4 0 .9-1.3 2.4-2.3 4.3-2.3a4.8 4.8 0 0 1 3.8 3.6 5.2 5.2 0 0 1-.5 3.7c-2.1 3.7-9 8-9 8z"/></svg>
           <div class="drawer-empty-title">${t('favEmpty')}</div>
           <div class="drawer-empty-sub">${t('favEmptySub')}</div>
         </div>`;
    return;
  }

  title.textContent = t('cart');
  const ids = Object.keys(cart);

  if (!ids.length) {
    body.innerHTML = `
      <div class="drawer-empty">
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1 11.5H7z"/><path d="M9 8V6.2a3 3 0 0 1 6 0V8"/></svg>
        <div class="drawer-empty-title">${t('cartEmpty')}</div>
        <div class="drawer-empty-sub">${t('cartEmptySub')}</div>
      </div>`;
    foot.hidden = true;
    return;
  }

  body.innerHTML = ids.map(lineHtml).join('');
  document.getElementById('cart-total').textContent = money(cartTotal());
  foot.hidden = false;
}

/* ⚠️ `p.img` ham `esc()` dan o'tadi (2026-08-12). Ilgari u xom qo'yilardi va
   xavfsiz edi — rasm manzili `index.html` da qo'lda yozilgan bo'lardi. Endi
   katalog BAZADAN keladi, ya'ni qiymat tashqi manba bo'lib qoldi. Qochirilmasa
   tirnoq atributdan chiqib ketadi: `src="x" onerror="..."` — sinovda aynan
   shunday bo'lgani ko'rildi. Bu oddiy atribut, shuning uchun `esc()` yetarli
   (CSS `url()` ichida bo'lganda `cssUrl()` kerak bo'lardi — CLAUDE.md). */
function lineHtml(id) {
  const p = product(id);
  if (!p) return '';
  const qty = cart[id];
  return `
    <div class="cart-line">
      <img class="cart-line-img" src="${esc(p.img)}" alt="" loading="lazy" />
      <div class="cart-line-main">
        <div class="cart-line-top">
          <div class="cart-line-name">${esc(p.name)}</div>
          <button class="line-x" data-action="removeLine" data-arg="${esc(id)}" aria-label="O'chirish">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div class="cart-line-sup">${esc(p.supplier)}</div>
        <div class="cart-line-bot">
          <div class="qty">
            <button class="qty-btn" data-action="qtyStep" data-arg="${esc(id)}|-1" aria-label="${t('decrease')}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>
            </button>
            <span class="qty-val">${qty} dona</span>
            <button class="qty-btn" data-action="qtyStep" data-arg="${esc(id)}|1" aria-label="${t('increase')}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
          <span class="cart-line-price">${money(p.price * qty)}</span>
        </div>
      </div>
    </div>`;
}

function favLineHtml(id) {
  const p = product(id);
  if (!p) return '';
  const inCart = cart[id] || 0;
  return `
    <div class="fav-line">
      <img class="fav-line-img" src="${esc(p.img)}" alt="" loading="lazy" />
      <div class="fav-line-main">
        <div class="cart-line-top">
          <div class="cart-line-name">${esc(p.name)}</div>
          <button class="line-x" data-action="toggleFav" data-arg="${esc(id)}" aria-label="Saralanganlardan olib tashlash">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div class="cart-line-sup">${esc(p.supplier)}</div>
        <div class="fav-line-price">${money(p.price)}</div>
        <div class="fav-line-act">
          ${inCart
            ? `<button class="fav-add in-cart" data-action="openCart">Savatda — ${inCart} dona</button>`
            : `<button class="fav-add" data-action="favToCart" data-arg="${esc(id)}">
                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                 Savatga
               </button>`}
        </div>
      </div>
    </div>`;
}

/* ── Checkout ── */
function goCheckout() {
  if (!cartCount()) return;
  drawerView = 'checkout';
  renderDrawer();
  document.getElementById('drawer-body')?.scrollTo(0, 0);
}

function backToCart() {
  drawerView = 'cart';
  renderDrawer();
}

function checkoutHtml() {
  const lines = Object.keys(cart).map((id) => {
    const p = product(id);
    return p
      ? `<div class="co-sum-row"><span>${esc(p.name)} · ${cart[id]} dona</span><span>${money(p.price * cart[id])}</span></div>`
      : '';
  }).join('');

  return `
    <button class="co-back" data-action="backToCart">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6l-6 6 6 6"/></svg>
      ${t('backToCart')}
    </button>

    <div class="co-sum" style="margin-top:12px">
      ${lines}
      <div class="co-sum-row" style="margin-top:9px;padding-top:9px;border-top:1px solid var(--border-hair);color:var(--text-muted);font-size:13px">
        <span>${t('deliveryEst')}</span><span id="co-delivery">${money(DELIVERY_FEE_ESTIMATE)}</span>
      </div>
      <div class="co-sum-row" style="font-weight:700;color:var(--text-strong)">
        <span>${t('total')}</span><span>${money(cartTotal())}</span>
      </div>

      <!-- Oldindan to'lov — Mini App bilan bir xil bo'linish (2026-08-12).
           Ilgari saytda faqat "Jami" turardi va xaridor butun summani hozir
           to'laydi deb o'ylardi; Mini App esa AYNI buyurtma uchun 50% ni
           ko'rsatardi. Ikki kanal bir narsaga ikki xil narx aytmasin. -->
      <div class="co-sum-row co-prepay" style="margin-top:9px;padding-top:9px;border-top:1px solid var(--border-hair)">
        <span>${t('payNow')} <b class="co-prepay-tag" id="co-prepay-pct">${esc(String(Math.round(PREPAY_RATE * 100)))}%</b></span>
        <span class="co-prepay-val" id="co-prepay-val">${money(prepayAmount(cartTotal()))}</span>
      </div>
      <div class="co-sum-row" style="color:var(--text-muted);font-size:13px">
        <span>${t('payLater')}</span><span id="co-rest-val">${money(restAmount(cartTotal()))}</span>
      </div>
    </div>
    <div style="font-size:11px;color:var(--text-subtle);line-height:1.4;margin-top:-4px">${t('deliveryNote')}</div>

    ${me ? '' : `
      <div class="co-login">
        <div class="co-login-txt">
          <b>${t('tgLoginHint')}</b> — ism va telefon o'zi to'ladi, buyurtma
          holati esa botga xabar bo'lib keladi.
        </div>
        <button type="button" class="co-login-btn" data-action="loginFromCheckout">${t('login')}</button>
      </div>`}

    <form id="co-form" data-submit="submitOrder" style="margin-top:16px" novalidate>
      <div class="co-field">
        <label class="co-label" for="co-name">${t('fName')}</label>
        <input class="co-input" id="co-name" type="text" autocomplete="name" placeholder="Ism familiya" value="${me && me.name ? esc(me.name) : ''}" required />
      </div>
      <div class="co-field">
        <label class="co-label" for="co-phone">${t('fPhone')}</label>
        <input class="co-input" id="co-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+998 90 123 45 67" value="${me && me.phone ? esc(me.phone) : ''}" required />
        <div class="co-hint">${t('fPhoneHint')}</div>
      </div>
      <div class="co-field">
        <label class="co-label" for="co-company">${t('fCompany')}</label>
        <input class="co-input" id="co-company" type="text" autocomplete="organization" placeholder="Ixtiyoriy" />
      </div>
      <!-- Manzil ERKIN MATN emas, ro'yxatdan tanlanadi (2026-08-12).
           Ilgari bu oddiy matn maydoni edi va xaridor "Chilonzor" yoki
           "BTS 112" kabi har xil yozardi — logistika esa aynan qaysi nuqta
           ekanini topa olmasdi. Mini App boshidan ro'yxatdan tanlatadi,
           sayt esa ortda qolgandi. -->
      <div class="co-field">
        <label class="co-label" for="co-bts">${t('fBts')}</label>
        <select class="co-input co-select" id="co-bts" data-change="setBtsPoint" required>
          <option value=""${btsPoint ? '' : ' selected'}>${t('btsPick')}</option>
          ${BTS_REGIONS.map((r) => {
            const inRegion = BTS_POINTS.filter((p) => p.region === r.key);
            if (!inRegion.length) return '';
            return `<optgroup label="${esc(r.name)}">${inRegion.map((p) => `
              <option value="${esc(p.id)}"${btsPoint === p.id ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}</optgroup>`;
          }).join('')}
        </select>
        ${(() => {
          const p = btsById(btsPoint);
          return p
            ? `<div class="co-bts-info">${esc(p.addr)} · Ish vaqti ${esc(p.hours)}</div>`
            : `<div class="co-hint">${t('btsHint')}</div>`;
        })()}
      </div>
      <div class="co-field">
        <label class="co-label" for="co-comment">${t('fComment')}</label>
        <textarea class="co-area" id="co-comment" placeholder="Muddat yoki boshqa talablar (ixtiyoriy)"></textarea>
      </div>

      <div class="co-err" id="co-err" hidden></div>

      <button class="btn-order" type="submit" id="co-submit" style="margin-top:16px">
        ${t('submitOrder')}
      </button>
      <div class="co-hint" style="text-align:center;margin-top:10px">
        ${me
          ? t('coHintIn')
          : t('coHintOut')}
      </div>
    </form>`;
}

// Ilgari shu yerda nextOrderId() bor edi — buyurtma raqamini brauzerda
// localStorage sanog'idan yasardi. Endi raqam faqat serverdan (order_seq)
// keladi: brauzerda yasalgan raqam bazada mavjud bo'lmagan buyurtmaga
// ishora qilardi va admin panelda hech qachon topilmasdi.

function submitOrder(e) {
  e.preventDefault();

  const name = val('co-name');
  const phone = val('co-phone');
  const company = val('co-company');
  const comment = val('co-comment');
  const err = document.getElementById('co-err');
  const btn = document.getElementById('co-submit');

  // Manzil endi ro'yxatdan keladi. Tanlangan nuqta `<select>` ning O'ZIDAN
  // o'qiladi, `btsPoint` o'zgaruvchisidan emas: `change` hodisasi otilmay
  // qolgan (yoki brauzer avtomatik to'ldirgan) holatda ikkalasi ajralib
  // ketishi mumkin, forma esa ekranda ko'rinib turgan qiymatni yuborishi
  // shart — xaridor nimani ko'rgan bo'lsa, o'sha ketsin.
  const point = btsById(document.getElementById('co-bts')?.value || btsPoint);
  const address = point ? `${point.name}, ${point.addr}` : '';

  const digits = phone.replace(/\D/g, '');
  if (!name) return showErr(err, 'Ismingizni kiriting.');
  if (digits.length < 9) return showErr(err, "Telefon raqamini to'liq kiriting.");
  if (!point) return showErr(err, 'BTS olish nuqtasini tanlang.');
  if (!cartCount()) return showErr(err, "Savat bo'sh.");
  if (err) err.hidden = true;

  // Serverga faqat mahsulot ID va miqdor ketadi. Nom/narx/jami YUBORILMAYDI —
  // ularni server bazadan oladi, aks holda narxni brauzer dikta qilardi.
  const items = Object.keys(cart).map((id) => ({ id, qty: cart[id] }));

  btn.disabled = true;
  btn.textContent = 'Yuborilmoqda…';

  // credentials — sessiya cookie'si bilan ketsin: server shundan xaridorning
  // Telegram ID'sini biladi va buyurtmani uning hisobiga bog'laydi.
  fetch('/api/web-orders', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    // `pickupPointId` — Mini App yuboradigan AYNI maydon (`telegram-app/app.js`).
    // Server uni hozircha o'qimaydi (`address` matnidan foydalanadi), lekin
    // ikki kanal bir xil shaklda yuborsa BTS integratsiyasi ulanganda faqat
    // server tomoni o'zgaradi.
    body: JSON.stringify({ items, buyerName: name, phone, company, address, comment, pickupPointId: point.id }),
  })
    .then((r) => r.json().catch(() => null))
    .then((d) => {
      // Buyurtma raqami SERVERDAN keladi — u bazadagi haqiqiy yozuvning raqami.
      // Ilgari raqam brauzerda o'ylab topilardi va bazada hech narsa qolmasdi:
      // xaridor "qabul qilindi" ekranini ko'rar, admin panelda esa buyurtma
      // umuman ko'rinmasdi (2026-07-29 dagi nosozlik).
      if (!d || !d.ok || !d.orderId) throw new Error(d && d.error ? d.error : 'server');
      lastOrderId = d.orderId;
      cart = {};
      saveCart();
      updateBadge();
      renderAllCardActions();
      drawerView = 'done';
      renderDrawer();
      // Profil ro'yxati eskirmasin — kirgan bo'lsa qaytadan o'qiymiz
      if (me) loadMyOrders();
    })
    .catch((e) => {
      btn.disabled = false;
      btn.textContent = t('submitOrder');
      // Server aniq sabab aytgan bo'lsa (MOQ, telefon, tugagan mahsulot) — o'shani
      // ko'rsatamiz. Aks holda umumiy tarmoq xatosi.
      showErr(err, e.message && e.message !== 'server'
        ? e.message
        : "Yuborib bo'lmadi. Internetni tekshiring yoki Telegram bot orqali buyurtma bering.");
    });
}

function doneHtml() {
  return `
    <div class="drawer-done">
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16 10"/></svg>
      <div class="drawer-done-title">${t('orderDone')}</div>
      <div class="order-id">${lastOrderId}</div>
      <div class="drawer-done-sub" style="margin-top:6px">
        ${me
          ? t('doneHintIn')
          : t('doneHintOut')}
      </div>
      ${me
        ? `<button class="cta-bot-btn" style="margin-top:16px;height:44px;font-size:14px;background:var(--grad-pom);color:var(--pom-100)" data-action="onLogin">
             ${t('myOrders')}
           </button>`
        : `<a class="cta-bot-btn" style="margin-top:16px;height:44px;font-size:14px;background:var(--grad-pom);color:var(--pom-100)" href="https://t.me/lolamarketbot" target="_blank" rel="noopener">
             ${t('openBot')}
           </a>`}
    </div>`;
}

/* ── Yordamchilar ── */
function val(id) {
  return (document.getElementById(id)?.value || '').trim();
}

function showErr(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* ── Konfetti (2026-08-13) ───────────────────────────────────────────
   AI rasmi tayyor bo'lganda "quiz javobi to'g'ri" hissini beradi.

   ⚠️ NIMA UCHUN O'ZIMIZ CHIZAMIZ: Telegram'ning quizdagi konfettisi Mini
   App'ga BERILMAGAN — jonli SDK'da (`window.Telegram.WebApp`) faqat
   `HapticFeedback` ning uchta metodi bor, konfetti metodi yo'q (2026-08-13
   da production'da o'qib tekshirildi). Shuning uchun effekt sahifada
   chiziladi va u ikkala kanalda — saytda ham, Mini App'da ham — bir xil
   ishlaydi. Telegram'ning HAQIQIY konfettisi alohida yo'l bilan keladi:
   server tayyor rasmni foydalanuvchi chatiga `message_effect_id` bilan
   yuboradi (`server/routes/ai.js`).

   Uslub JS'da qo'yiladi (`el.style.x = ...`), shablon satriga
   INTERPOLATSIYA QILINMAYDI — CLAUDE.md: atribut ichida boshqa til
   boshlansa `esc()` yaramaydi. Bu yerda umuman HTML yig'ilmaydi.

   Element hodisa tugagach O'ZINI o'chiradi: qolib ketsa har chizishda
   yangi qatlam yig'ilib borardi. */
const KONFETTI_RANG = ['#C9362D', '#E84B40', '#7A140D', '#F4C049', '#EFE3D0'];

function konfetti() {
  // Harakatni kamaytirishni so'ragan foydalanuvchida UMUMAN chizilmaydi.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const qatlam = document.createElement('div');
  qatlam.className = 'konfetti';
  qatlam.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < 42; i++) {
    const b = document.createElement('i');
    b.style.left = (Math.random() * 100) + '%';
    b.style.background = KONFETTI_RANG[i % KONFETTI_RANG.length];
    b.style.animationDelay = (Math.random() * 0.5).toFixed(2) + 's';
    b.style.animationDuration = (1.6 + Math.random() * 1.1).toFixed(2) + 's';
    // Har bo'lak o'z yo'nalishida uchadi va o'z tezligida aylanadi.
    b.style.setProperty('--x', (Math.random() * 160 - 80).toFixed(0) + 'px');
    b.style.setProperty('--r', (Math.random() * 900 - 450).toFixed(0) + 'deg');
    if (i % 3 === 0) b.style.borderRadius = '50%';
    qatlam.appendChild(b);
  }

  document.body.appendChild(qatlam);
  setTimeout(() => qatlam.remove(), 3200);
}

/* ── Katalogni bazadan yuklash ──
   Ilgari bu so'rov faqat mahsulot detali ochilganda ketardi (u paytda undan
   olinadigan narsa tafsilotlar edi). Endi katalogning O'ZI shunga bog'liq:
   sotuvchi e'lonlari, narxlar va zaxira shu javobdan keladi, shuning uchun
   so'rov sahifa ochilishi bilan boshlanadi. */
loadCatalogMeta();

/* ── Boshlang'ich holat ──
   Saqlangan savat/saralanganlar bilan qaytgan mehmon darhol o'z holatini ko'radi */
updateBadge();
renderAllCardActions();
updateFavBadge();
renderAllFavBtns();

/* ── Birinchi ko'rish ──
   ⚠️ Havola TO'G'RIDAN-TO'G'RI matoga kelgan bo'lsa (`/mahsulot/<id>`)
   "katalog" YOZILMAYDI: odam katalogni ko'rmagan, va yozilsa har bir
   ulashilgan havola katalogga bittadan soxta ko'rish qo'shib borardi.
   Mato ko'rishini `renderPdp()` o'zi yozadi. */
if (!pdpFromUrl()) track('view', 'katalog', null);

/* Kartochka endi bosiladigan element — klaviatura bilan ham ochilsin.
   Atributlar HTML'da 12 marta takrorlanmaydi: kartochka qo'shilganda
   unutilishi mumkin bo'lgan narsa shu yerda bir joyda beriladi. */
document.querySelectorAll('.product-card[data-id]').forEach((card) => {
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', (card.dataset.name || 'Mahsulot') + " — batafsil");
  card.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    // Fokus ichkaridagi tugmada bo'lsa (savat/yurakcha) — o'sha tugma ishlasin
    if (e.target !== card) return;
    e.preventDefault();
    openDetail(card.dataset.id);
  });
});
