/* ============================================================
   LolaMarket Telegram Mini App — dizayndan to'liq implement
   ============================================================ */

// ============ TO'QIMA PATTERNLAR (CSS gradient) ============
const PATTERNS = {
  adras:      "repeating-linear-gradient(96deg,#E84B40 0 16px,#EFA91F 16px 27px,#119DAB 27px 42px,#FBF6EC 42px 48px,#571814 48px 58px,#54D7E1 58px 70px)",
  adrasCool:  "repeating-linear-gradient(94deg,#119DAB 0 15px,#0C656F 15px 26px,#54D7E1 26px 40px,#FBF6EC 40px 46px,#232842 46px 58px)",
  adrasWarm:  "repeating-linear-gradient(92deg,#E84B40 0 14px,#7C201A 14px 24px,#EFA91F 24px 38px,#FBF6EC 38px 44px,#F46A5F 44px 56px)",
  ikat:       "radial-gradient(circle at 20% 30%,rgba(232,75,64,.55) 0 9%,transparent 10%),radial-gradient(circle at 70% 60%,rgba(17,157,171,.55) 0 9%,transparent 10%),repeating-linear-gradient(45deg,#FBF6EC 0 14px,#F1E4CE 14px 28px)",
  suzani:     "radial-gradient(circle at 50% 50%,#E84B40 0 5%,transparent 6%),radial-gradient(circle at 0% 0%,#119DAB 0 5%,transparent 6%),radial-gradient(circle at 100% 100%,#119DAB 0 5%,transparent 6%),radial-gradient(circle at 0% 100%,#EFA91F 0 5%,transparent 6%),radial-gradient(circle at 100% 0%,#EFA91F 0 5%,transparent 6%),#1B1E3C",
  herringbone:"repeating-linear-gradient(45deg,#0C656F 0 4px,#119DAB 4px 8px),repeating-linear-gradient(-45deg,rgba(255,255,255,.06) 0 4px,transparent 4px 8px)",
  weave:      "repeating-linear-gradient(0deg,rgba(23,26,48,.05) 0 3px,transparent 3px 6px),repeating-linear-gradient(90deg,rgba(23,26,48,.06) 0 3px,transparent 3px 6px),#E9D9BE",
  plain:      "linear-gradient(135deg,#F46A5F,#E84B40)",
};
const PSIZES = {
  suzani: "34px 34px",
  ikat: "60px 60px,60px 60px,40px 40px",
  herringbone: "16px 16px,16px 16px",
  weave: "6px 6px,6px 6px,auto",
};
function pSize(k) { return PSIZES[k] || 'auto'; }

// ============ MATNLAR (ikki tillilik) ============
const STR = {
  uz: { brand: "LolaMarket", miniApp: "mini ilova", greetSub: "Bugun qanday matolar kerak?",
    searchPh: "Mato yoki kategoriya qidiring", cats: "Kategoriyalar", all: "Barchasi", featured: "Tavsiya etiladi",
    verifiedMills: "28 tasdiqlangan fabrika · har bir buyurtmada escrow", catalog: "Katalog", filter: "Filtr", sort: "Saralash",
    day: "kun", addCart: "Savatga qo'shish", order: "Buyurtma berish", specs: "Tafsilotlar", width: "Eni", weight: "Zichlik",
    comp: "Tarkibi", leadTime: "Yetkazish muddati", minOrder: "Minimal buyurtma (MOQ)", supplierL: "Yetkazib beruvchi",
    verified: "Tasdiqlangan", reviews: "sharh", message: "Xabar yuborish", qty: "Miqdor", cart: "Savat", cartEmpty: "Savat bo'sh",
    cartEmptySub: "Katalogdan mato tanlang", browse: "Katalogga o'tish", subtotal: "Oraliq jami", delivery: "Yetkazish",
    deliveryCalc: "Alohida hisoblanadi", total: "Jami", checkout: "Rasmiylashtirish", checkoutT: "Buyurtma berish",
    address: "Yetkazib berish manzili", changeAddr: "O'zgartirish", payment: "To'lov usuli", commentL: "Izoh",
    commentPh: "Buyurtma uchun izoh (ixtiyoriy)", summary: "Buyurtma tarkibi", placeOrder: "Buyurtmani tasdiqlash",
    orders: "Buyurtmalarim", active: "Faol", past: "Tarix", noActive: "Faol buyurtma yo'q", track: "Kuzatish", reorder: "Qayta buyurtma",
    profile: "Profil", editP: "Tahrirlash", ordersCount: "buyurtma", settings: "Sozlamalar", language: "Til", notifications: "Bildirishnomalar",
    help: "Yordam markazi", logout: "Chiqish", search: "Qidiruv", recent: "So'nggi qidiruvlar", noResults: "Hech narsa topilmadi",
    noResultsSub: "Boshqa so'z bilan urinib ko'ring", resultsN: "natija topildi", tabHome: "Bosh", tabCatalog: "Katalog",
    tabCart: "Savat", tabOrders: "Buyurtma", tabProfile: "Profil", added: "Savatga qo'shildi 🌷", liked: "Sevimlilarga qo'shildi",
    orderPlaced: "Buyurtma qabul qilindi", orderPlacedSub: "Marg'ilon Ipak Co. 24 soat ichida javob beradi",
    viewOrders: "Buyurtmalarni ko'rish", continue: "Xaridni davom ettirish", escrowNote: "To'lov yetkazilgunga qadar escrow hisobida saqlanadi",
    items: "tur", panelU: "dona", mU: "m", product: "Mahsulot", noProducts: "Mahsulot topilmadi", madeBy: "Ishlab chiqildi",
    tgVerified: "Telegram orqali tasdiqlangan", tgNotConnected: "Telegram orqali ochilganda profil avtomatik aniqlanadi", tgUserFallback: "Telegram foydalanuvchisi",
    shareContact: "Telefon raqamni ulashish", contactPending: "Raqam so'ralmoqda, biroz kuting…", contactDone: "Telefon raqami yangilandi",
    perUnit: "1 dona rulon narxi" },
  ru: { brand: "LolaMarket", miniApp: "мини-приложение", greetSub: "Какие ткани нужны сегодня?",
    searchPh: "Поиск ткани или категории", cats: "Категории", all: "Все", featured: "Рекомендуем",
    verifiedMills: "28 проверенных фабрик · эскроу на каждый заказ", catalog: "Каталог", filter: "Фильтр", sort: "Сортировка",
    day: "дн.", addCart: "В корзину", order: "Оформить заказ", specs: "Характеристики", width: "Ширина", weight: "Плотность",
    comp: "Состав", leadTime: "Срок поставки", minOrder: "Мин. заказ (MOQ)", supplierL: "Поставщик",
    verified: "Проверен", reviews: "отзыв.", message: "Написать", qty: "Количество", cart: "Корзина", cartEmpty: "Корзина пуста",
    cartEmptySub: "Выберите ткань в каталоге", browse: "В каталог", subtotal: "Подытог", delivery: "Доставка",
    deliveryCalc: "Рассчитывается отдельно", total: "Итого", checkout: "Оформить", checkoutT: "Оформление заказа",
    address: "Адрес доставки", changeAddr: "Изменить", payment: "Способ оплаты", commentL: "Комментарий",
    commentPh: "Комментарий к заказу (необязательно)", summary: "Состав заказа", placeOrder: "Подтвердить заказ",
    orders: "Мои заказы", active: "Активные", past: "История", noActive: "Нет активных заказов", track: "Отследить", reorder: "Повторить",
    profile: "Профиль", editP: "Изменить", ordersCount: "заказов", settings: "Настройки", language: "Язык", notifications: "Уведомления",
    help: "Центр помощи", logout: "Выйти", search: "Поиск", recent: "Недавние поиски", noResults: "Ничего не найдено",
    noResultsSub: "Попробуйте другой запрос", resultsN: "результатов", tabHome: "Главная", tabCatalog: "Каталог",
    tabCart: "Корзина", tabOrders: "Заказы", tabProfile: "Профиль", added: "Добавлено в корзину 🌷", liked: "Добавлено в избранное",
    orderPlaced: "Заказ принят", orderPlacedSub: "Маргилан Силк ответит в течение 24 часов",
    viewOrders: "Посмотреть заказы", continue: "Продолжить покупки", escrowNote: "Платёж хранится на эскроу до доставки",
    items: "поз.", panelU: "шт", mU: "м", product: "Товар", noProducts: "Товары не найдены", madeBy: "Разработано",
    tgVerified: "Подтверждено через Telegram", tgNotConnected: "При открытии через Telegram профиль определится автоматически", tgUserFallback: "Пользователь Telegram",
    shareContact: "Поделиться номером телефона", contactPending: "Запрашивается номер, подождите…", contactDone: "Номер телефона обновлён",
    perUnit: "Цена за 1 рулон" },
};

// ============ MAHSULOTLAR ============
const PRODUCTS = [
  { id:'ik-1402', pattern:'adras',      img:'assets/products/textile-01.jpg', price:850000, unit:'rulon', moq:1, lead:28, rating:4.9, reviews:42,  verified:true,  stockKey:'in',   catKey:'silk',   badgeTone:'primary',
    name:{ uz:"Marg'ilon ipak ikat", ru:"Шёлковый икат" }, supplier:{ uz:"Marg'ilon Ipak Co.", ru:"Маргилан Силк" }, city:{ uz:"Marg'ilon", ru:"Маргилан" },
    width:"0.9 m", weight:"90 g/m²", comp:{ uz:"100% tut ipagi", ru:"100% тутовый шёлк" }, badge:{ uz:"Tavsiya", ru:"Хит" } },
  { id:'ad-0890', pattern:'adrasWarm',  img:'assets/products/textile-02.jpg', price:730000, unit:'rulon', moq:1, lead:32, rating:4.7, reviews:28,  verified:true,  stockKey:'low',  catKey:'ikat',   badgeTone:'saffron',
    name:{ uz:"Qo'lbola adras", ru:"Ручной адрас" }, supplier:{ uz:"Buxoro Looms", ru:"Бухара Лумс" }, city:{ uz:"Buxoro", ru:"Бухара" },
    width:"1.0 m", weight:"150 g/m²", comp:{ uz:"50% ipak / 50% paxta", ru:"50% шёлк / 50% хлопок" }, badge:{ uz:"Kam qoldi", ru:"Мало" } },
  { id:'sz-3310', pattern:'suzani',     img:'assets/products/textile-03.jpg', price:890000, unit:'rulon', moq:1, lead:45, rating:5.0, reviews:17,  verified:true,  stockKey:'made', catKey:'suzani', badgeTone:'teal',
    name:{ uz:"So'zana panel — anor", ru:"Сюзане — гранат" }, supplier:{ uz:"Nurota Atelier", ru:"Нурата Ателье" }, city:{ uz:"Nurota", ru:"Нурата" },
    width:"1.4 × 1.8 m", weight:"—", comp:{ uz:"Paxta asos, ipak ip", ru:"Хлопок, шёлковая нить" }, badge:{ uz:"Hunarmand", ru:"Ручная" } },
  { id:'ck-2201', pattern:'adrasCool',  img:'assets/products/textile-04.jpg', price:700000, unit:'rulon', moq:1, lead:21, rating:4.6, reviews:51,  verified:false, stockKey:'in',   catKey:'cotton', badgeTone:'neutral',
    name:{ uz:"Paxta adras — indigo", ru:"Хлопковый адрас — индиго" }, supplier:{ uz:"O'sh Textile", ru:"Ош Текстиль" }, city:{ uz:"O'sh", ru:"Ош" },
    width:"1.5 m", weight:"180 g/m²", comp:{ uz:"100% paxta", ru:"100% хлопок" }, badge:null },
  { id:'hb-7740', pattern:'herringbone',img:'assets/products/textile-05.jpg', price:870000, unit:'rulon', moq:1, lead:35, rating:4.8, reviews:33,  verified:true,  stockKey:'in',   catKey:'wool',   badgeTone:'teal',
    name:{ uz:"Junli mato — yelkacha", ru:"Шерсть — ёлочка" }, supplier:{ uz:"Almati Weaving", ru:"Алматы Вивинг" }, city:{ uz:"Almati", ru:"Алматы" },
    width:"1.5 m", weight:"320 g/m²", comp:{ uz:"70% jun / 30% PES", ru:"70% шерсть / 30% ПЭ" }, badge:{ uz:"Yangi", ru:"Новинка" } },
  { id:'lk-5512', pattern:'weave',      img:'assets/products/textile-06.jpg', price:750000, unit:'rulon', moq:1, lead:24, rating:4.5, reviews:22,  verified:true,  stockKey:'in',   catKey:'linen',  badgeTone:'neutral',
    name:{ uz:"Zig'ir mato — natural", ru:"Лён — натуральный" }, supplier:{ uz:"Shymkent Mills", ru:"Шымкент Миллс" }, city:{ uz:"Shymkent", ru:"Шымкент" },
    width:"1.4 m", weight:"200 g/m²", comp:{ uz:"100% zig'ir", ru:"100% лён" }, badge:null },
  { id:'ik-9001', pattern:'ikat',       img:'assets/products/textile-07.jpg', price:900000, unit:'rulon', moq:1, lead:30, rating:4.9, reviews:19,  verified:true,  stockKey:'in',   catKey:'ikat',   badgeTone:'primary',
    name:{ uz:"Kelinlik ikat — za'faron", ru:"Свадебный икат — шафран" }, supplier:{ uz:"Marg'ilon Ipak Co.", ru:"Маргилан Силк" }, city:{ uz:"Marg'ilon", ru:"Маргилан" },
    width:"0.9 m", weight:"110 g/m²", comp:{ uz:"100% tut ipagi", ru:"100% тутовый шёлк" }, badge:{ uz:"Tavsiya", ru:"Хит" } },
  { id:'pl-3320', pattern:'plain',      img:'assets/products/textile-08.jpg', price:700000, unit:'rulon', moq:1, lead:18, rating:4.4, reviews:64,  verified:false, stockKey:'in',   catKey:'cotton', badgeTone:'neutral',
    name:{ uz:"Sodda to'qima — marjon", ru:"Простое плетение — коралл" }, supplier:{ uz:"Farg'ona Fabric", ru:"Фергана Фабрик" }, city:{ uz:"Farg'ona", ru:"Фергана" },
    width:"1.6 m", weight:"160 g/m²", comp:{ uz:"65% paxta / 35% PES", ru:"65% хлопок / 35% ПЭ" }, badge:null },
  { id:'tx-4401', pattern:'suzani',     img:'assets/products/textile-09.jpg', price:880000, unit:'rulon', moq:1, lead:40, rating:4.8, reviews:14,  verified:true,  stockKey:'made', catKey:'suzani', badgeTone:'saffron',
    name:{ uz:"Zar naqsh so'zana panel", ru:"Сюзане с золотым узором" }, supplier:{ uz:"Qarshi Hunarmand", ru:"Карши Хунармад" }, city:{ uz:"Qarshi", ru:"Карши" },
    width:"1.3 × 1.7 m", weight:"—", comp:{ uz:"Paxta asos, ipak ip", ru:"Хлопок, шёлковая нить" }, badge:{ uz:"Yangi", ru:"Новинка" } },
  { id:'tx-4402', pattern:'ikat',       img:'assets/products/textile-10.jpg', price:860000, unit:'rulon', moq:1, lead:26, rating:4.7, reviews:23,  verified:true,  stockKey:'in',   catKey:'silk',   badgeTone:'primary',
    name:{ uz:"Gulli ipak — lola", ru:"Шёлк с цветами — тюльпан" }, supplier:{ uz:"Andijon Ipak Uyi", ru:"Андижан Силк Хаус" }, city:{ uz:"Andijon", ru:"Андижан" },
    width:"1.1 m", weight:"95 g/m²", comp:{ uz:"100% tut ipagi", ru:"100% тутовый шёлк" }, badge:null },
  { id:'tx-4403', pattern:'plain',      img:'assets/products/textile-11.jpg', price:710000, unit:'rulon', moq:1, lead:19, rating:4.5, reviews:37,  verified:false, stockKey:'in',   catKey:'cotton', badgeTone:'neutral',
    name:{ uz:"Chit mato — sariq gul", ru:"Ситец — жёлтый цветок" }, supplier:{ uz:"Namangan Chit", ru:"Наманган Читтекс" }, city:{ uz:"Namangan", ru:"Наманган" },
    width:"1.5 m", weight:"140 g/m²", comp:{ uz:"100% paxta", ru:"100% хлопок" }, badge:null },
  { id:'tx-4404', pattern:'weave',      img:'assets/products/textile-12.png', price:760000, unit:'rulon', moq:1, lead:27, rating:4.6, reviews:20,  verified:true,  stockKey:'low',  catKey:'linen',  badgeTone:'teal',
    name:{ uz:"Vintage chit — krem atirgul", ru:"Винтажный ситец — кремовая роза" }, supplier:{ uz:"Xiva Tekstil", ru:"Хива Текстиль" }, city:{ uz:"Xiva", ru:"Хива" },
    width:"1.4 m", weight:"175 g/m²", comp:{ uz:"70% zig'ir / 30% paxta", ru:"70% лён / 30% хлопок" }, badge:{ uz:"Kam qoldi", ru:"Мало" } },
];

const CATS = [
  { key:'all',    label:{ uz:"Barchasi", ru:"Все" } },
  { key:'ikat',   label:{ uz:"Ikat va adras", ru:"Икат и адрас" } },
  { key:'suzani', label:{ uz:"So'zana", ru:"Сюзане" } },
  { key:'silk',   label:{ uz:"Ipak", ru:"Шёлк" } },
  { key:'cotton', label:{ uz:"Paxta", ru:"Хлопок" } },
  { key:'wool',   label:{ uz:"Jun", ru:"Шерсть" } },
  { key:'linen',  label:{ uz:"Zig'ir", ru:"Лён" } },
];

const ORDERS = [
  { id:'#LM-2041', date:{ uz:"18-iyun", ru:"18 июня" },   items:[{id:'ik-1402',qty:300}],               statusKey:'production' },
  { id:'#LM-2038', date:{ uz:"10-iyun", ru:"10 июня" },   items:[{id:'hb-7740',qty:250},{id:'pl-3320',qty:1000}], statusKey:'shipped' },
  { id:'#LM-1990', date:{ uz:"22-may", ru:"22 мая" },     items:[{id:'ck-2201',qty:800}],               statusKey:'delivered' },
  { id:'#LM-1804', date:{ uz:"30-aprel", ru:"30 апреля" },items:[{id:'lk-5512',qty:600}],               statusKey:'delivered' },
];

const PAY = [
  { key:'escrow', label:{ uz:"Escrow — xavfsiz to'lov", ru:"Эскроу — защищённый платёж" },  sub:{ uz:"Tavsiya etiladi · yetkazilgach ozod etiladi", ru:"Рекомендуется · после доставки" } },
  { key:'bank',   label:{ uz:"Bank o'tkazmasi", ru:"Банковский перевод" },           sub:{ uz:"FOB / CIF · 30% oldindan", ru:"FOB / CIF · 30% предоплата" } },
  { key:'click',  label:{ uz:"Click / Payme", ru:"Click / Payme" },             sub:{ uz:"Tezkor to'lov", ru:"Быстрая оплата" } },
];

const RECENT_SEARCHES = {
  uz: ["adras","ipak","so'zana","jun","Marg'ilon"],
  ru: ["адрас","шёлк","сюзане","шерсть","Маргилан"],
};

const COMPANY = {
  name:{ uz:"Muazzamxon Tekstil MChJ", ru:"ООО «Muazzamxon Tekstil»" },
  role:{ uz:"Xaridor · B2B", ru:"Покупатель · B2B" },
  addr:{ uz:"Toshkent, Yunusobod t., Amir Temur ko'ch. 12", ru:"Ташкент, Юнусабадский р-н, ул. Амира Темура 12" },
  since:{ uz:"2024 yildan beri", ru:"с 2024 года" },
  phone:"+998 90 123 45 67",
  email:"savdo@muazzamxon.uz", initials:"MT",
};

// ============ HOLAT ============
const S = {
  screen: 'home',
  history: [],
  selectedId: 'ik-1402',
  cart: [],
  qty: 300,
  search: '',
  cat: 'all',
  pay: 'escrow',
  ordersTab: 'active',
  liked: { 'ik-9001': true },
  lang: 'uz',
  notif: true,
  comment: '',
  tgUser: null,
  tgPhone: null,
};

// ============ YORDAMCHILAR ============
function money(n) {
  const v = Math.round(Number(n));
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
}
function num(n) { return Number(n).toLocaleString('en-US'); }
function uShort(u) { return (u === 'panel' || u === 'rulon') ? STR[S.lang].panelU : STR[S.lang].mU; }
function step(p) { return 1; }

function byId(id) { return PRODUCTS.find(x => x.id === id); }

const BADGE_COLORS = {
  primary: ['var(--color-primary)','#fff'],
  teal:    ['var(--teal-50)','var(--teal-700)'],
  saffron: ['var(--saffron-50)','var(--saffron-700)'],
  neutral: ['var(--ink-100)','var(--ink-700)'],
};
const STOCK_COLOR = { in:'var(--success-500)', low:'var(--saffron-500)', made:'var(--teal-500)' };
const STOCK_TXT   = { in:{ uz:'Sotuvda', ru:'В наличии' }, low:{ uz:'Kam qoldi', ru:'Мало осталось' }, made:{ uz:'Buyurtmaga', ru:'Под заказ' } };
const STATUS_TXT  = { production:{ uz:'Ishlab chiqarilmoqda', ru:'В производстве' }, shipped:{ uz:"Yo'lda", ru:'В пути' }, delivered:{ uz:'Yetkazildi', ru:'Доставлено' }, pending:{ uz:'Tasdiq kutilmoqda', ru:'Ожидает' } };
const STATUS_COL  = {
  saffron: ['var(--saffron-50)','var(--saffron-700)'],
  teal:    ['var(--teal-50)','var(--teal-700)'],
  success: ['var(--success-100)','#0E6B47'],
  neutral: ['var(--ink-100)','var(--ink-700)'],
};
const STATUS_TONE = { production:'saffron', shipped:'teal', delivered:'success', pending:'neutral' };

function vm(p) {
  const [bbg,bfg] = BADGE_COLORS[p.badgeTone] || BADGE_COLORS.neutral;
  const L = S.lang;
  return {
    ...p,
    name: p.name[L], supplier: p.supplier[L], city: p.city[L], comp: p.comp[L],
    badge: p.badge ? p.badge[L] : null,
    bg: PATTERNS[p.pattern] || PATTERNS.plain,
    bgSize: pSize(p.pattern),
    bgStyle: p.img
      ? `background-image:url('${p.img}');background-size:cover;background-position:center`
      : `background:${PATTERNS[p.pattern] || PATTERNS.plain};background-size:${pSize(p.pattern)}`,
    priceLabel: money(p.price),
    unitLabel: '/' + uShort(p.unit),
    perUnitLabel: STR[L].perUnit,
    moqLabel: num(p.moq) + ' ' + uShort(p.unit),
    leadLabel: p.lead + ' ' + STR[L].day,
    stockTxt: STOCK_TXT[p.stockKey][L],
    stockCol: STOCK_COLOR[p.stockKey],
    badgeShow: !!p.badge,
    badgeBg: bbg, badgeFg: bfg,
    liked: !!S.liked[p.id],
    heartFill: S.liked[p.id] ? 'var(--color-primary)' : 'none',
    heartStroke: S.liked[p.id] ? 'var(--color-primary)' : 'var(--text-body)',
    meta: p.city[L] + ' · MOQ ' + num(p.moq) + uShort(p.unit) + ' · ' + p.lead + ' ' + STR[L].day,
  };
}

function cartTotal() { return S.cart.reduce((s,c) => s + byId(c.id).price * c.qty, 0); }
function cartCount() { return S.cart.length; }

// ============ NAVIGATSIYA ============
function navigate(screen) {
  if (S.screen !== screen) S.history.push(S.screen);
  S.screen = screen;
  render();
  const w = document.getElementById('screen-wrap');
  if (w) w.scrollTop = 0;
}
function goBack() {
  const prev = S.history.pop() || 'home';
  S.screen = prev;
  render();
}
function tab(k) {
  S.screen = k;
  S.history = [];
  render();
}

// ============ SAVAT ============
function addToCart(id, qty) {
  const line = S.cart.find(x => x.id === id);
  if (line) line.qty += qty;
  else S.cart.push({ id, qty });
  showToast(STR[S.lang].added);
  render();
}
function incCart(id) {
  const p = byId(id);
  const line = S.cart.find(x => x.id === id);
  if (line) { line.qty += step(p); render(); }
}
function decCart(id) {
  const p = byId(id);
  const line = S.cart.find(x => x.id === id);
  if (line) { line.qty = Math.max(p.moq, line.qty - step(p)); render(); }
}
function removeCart(id) {
  S.cart = S.cart.filter(x => x.id !== id);
  render();
}

// ============ MAHSULOT OCHISH ============
function openProduct(id) {
  const p = byId(id);
  S.selectedId = id;
  S.qty = p ? p.moq : 300;
  if (S.screen !== 'detail') S.history.push(S.screen);
  S.screen = 'detail';
  render();
  const w = document.getElementById('screen-wrap');
  if (w) w.scrollTop = 0;
}

function incQty() {
  const p = byId(S.selectedId);
  S.qty += step(p);
  const el = document.getElementById('detail-qty');
  if (el) el.textContent = num(S.qty) + ' ' + uShort(p.unit);
  const el2 = document.getElementById('main-btn-sub');
  if (el2) el2.textContent = money(p.price * S.qty);
}
function decQty() {
  const p = byId(S.selectedId);
  S.qty = Math.max(p.moq, S.qty - step(p));
  const el = document.getElementById('detail-qty');
  if (el) el.textContent = num(S.qty) + ' ' + uShort(p.unit);
  const el2 = document.getElementById('main-btn-sub');
  if (el2) el2.textContent = money(p.price * S.qty);
}

// ============ TOAST ============
let _toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.add('hidden'), 2000);
}

// ============ HEADER ============
function updateHeader() {
  const sc = S.screen;
  const T = STR[S.lang];
  const titles = {
    home:T.brand, catalog:T.catalog, detail:T.product,
    search:T.search, cart:T.cart, checkout:T.checkoutT,
    orders:T.orders, profile:T.profile, success:T.checkoutT,
  };

  document.getElementById('btn-back').classList.toggle('hidden', !['detail','checkout'].includes(sc));
  document.getElementById('header-brand').style.display = sc === 'home' ? 'flex' : 'none';
  document.getElementById('btn-header-search').classList.toggle('hidden', !['catalog','orders','cart'].includes(sc));

  const titleEl = document.getElementById('header-title');
  const subEl   = document.getElementById('header-sub');
  if (sc === 'home') {
    titleEl.textContent = T.brand;
    subEl.style.display = 'block';
    subEl.textContent   = T.miniApp;
  } else if (sc === 'detail' && S.selectedId) {
    const p = byId(S.selectedId);
    titleEl.textContent = p ? p.name[S.lang] : T.product;
    subEl.style.display = 'block';
    subEl.textContent   = p ? p.city[S.lang] : '';
  } else {
    titleEl.textContent = titles[sc] || T.brand;
    subEl.style.display = 'none';
  }
}

// ============ NAVIGATSIYA PANELI ============
function updateNav() {
  const sc = S.screen;
  const T = STR[S.lang];
  const TAB_SCREENS = ['home','catalog','search','cart','orders','profile'];
  const showTabBar = TAB_SCREENS.includes(sc);
  const showMainBtn = sc === 'detail' || sc === 'checkout';

  document.getElementById('app-nav').classList.toggle('hidden', !showTabBar);
  document.getElementById('main-btn-bar').classList.toggle('hidden', !showMainBtn);

  document.querySelector('#nav-home .nav-label').textContent    = T.tabHome;
  document.querySelector('#nav-catalog .nav-label').textContent = T.tabCatalog;
  document.querySelector('#nav-cart .nav-label').textContent    = T.tabCart;
  document.querySelector('#nav-orders .nav-label').textContent  = T.tabOrders;

  if (showTabBar) {
    const navMap = { home:0, catalog:1, cart:2, orders:3 };
    const lensIdx = navMap[sc] ?? null;
    const lensEl = document.getElementById('nav-lens');
    const showLens = lensIdx !== null;
    lensEl.classList.toggle('hidden', !showLens);
    if (showLens) {
      lensEl.style.left = `calc(7px + ${lensIdx} * ((100% - 14px) / 4))`;
    }

    const activeColor = '#ffe9db';
    const inactiveColor = 'rgba(122,20,13,.5)';
    document.getElementById('nav-home').style.color    = (sc==='home')    ? activeColor : inactiveColor;
    document.getElementById('nav-catalog').style.color = (sc==='catalog' || sc==='detail') ? activeColor : inactiveColor;
    document.getElementById('nav-cart').style.color    = (sc==='cart' || sc==='checkout')  ? activeColor : inactiveColor;
    document.getElementById('nav-orders').style.color  = (sc==='orders')  ? activeColor : inactiveColor;
    document.getElementById('nav-profile').classList.toggle('active', sc === 'profile');

    const badge = document.getElementById('cart-badge');
    const cnt = cartCount();
    badge.classList.toggle('hidden', cnt === 0);
    if (cnt > 0) badge.textContent = cnt;
  }

  if (showMainBtn) {
    const p = byId(S.selectedId);
    if (sc === 'detail' && p) {
      document.getElementById('main-btn-label').textContent = T.addCart;
      document.getElementById('main-btn-sub').textContent   = money(p.price * S.qty);
    } else if (sc === 'checkout') {
      document.getElementById('main-btn-label').textContent = T.placeOrder;
      document.getElementById('main-btn-sub').textContent   = money(cartTotal());
    }
  }
}

// ============ EKRAN: BOSH SAHIFA ============
function renderHome() {
  const T = STR[S.lang];
  const featured = ['ik-1402','ik-9001','sz-3310','hb-7740'].map(id => vm(byId(id)));
  return `
  <div style="padding:10px 16px 28px;display:flex;flex-direction:column;gap:14px">
    <div>
      <div style="font-family:var(--font-display);font-size:19px;font-weight:800;color:var(--text-strong);letter-spacing:-.02em;line-height:1.15">Salom, ${S.tgUser?.first_name || 'Maryam'} 🌷</div>
      <div style="font-size:12.5px;color:var(--text-muted);margin-top:1px">${T.greetSub}</div>
    </div>

    <div style="display:flex;align-items:center;gap:9px;margin-top:2px">
      <button onclick="tab('search')" style="flex:1;min-width:0;display:flex;align-items:center;gap:10px;height:48px;padding:0 16px;border:1px solid rgba(255,255,255,.7);border-radius:var(--radius-md);background:rgba(255,255,255,.55);backdrop-filter:blur(20px) saturate(170%);-webkit-backdrop-filter:blur(20px) saturate(170%);box-shadow:0 8px 22px -10px rgba(81,1,0,.22),0 1px 2px rgba(23,26,48,.06),inset 0 1px 0 rgba(255,255,255,.9);cursor:pointer;color:var(--text-subtle);font-size:14.5px;font-family:var(--font-sans)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${T.searchPh}</span>
      </button>
      <button onclick="tab('catalog')" style="flex:none;width:48px;height:48px;border-radius:var(--radius-md);background:linear-gradient(150deg,#7a140d,#510100);border:1px solid rgba(255,229,210,.25);box-shadow:0 6px 16px -6px rgba(81,1,0,.6),inset 0 1px 0 rgba(255,229,210,.22);display:flex;align-items:center;justify-content:center;color:#ffe5d2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
      </button>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:2px">
      <span style="font-family:var(--font-display);font-size:17px;font-weight:700;color:var(--text-strong)">${T.featured}</span>
      <button onclick="tab('catalog')" style="font-size:13px;font-weight:600;color:var(--teal-600);background:none;border:none;cursor:pointer">${T.all} ›</button>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      ${featured.map(p => homeCard(p)).join('')}
    </div>
  </div>`;
}

// ============ EKRAN: KATALOG ============
function renderCatalog() {
  const T = STR[S.lang];
  const prods = (S.cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.catKey === S.cat)).map(vm);
  return `
  <div style="padding:14px 16px 28px;display:flex;flex-direction:column;gap:14px">
    <div style="display:flex;gap:9px">
      <button style="flex:1;display:flex;align-items:center;justify-content:center;gap:7px;height:40px;border-radius:var(--radius-md);border:1px solid rgba(255,255,255,.7);background:rgba(255,255,255,.55);backdrop-filter:blur(20px) saturate(170%);-webkit-backdrop-filter:blur(20px) saturate(170%);font-size:13.5px;font-weight:600;color:var(--text-body);box-shadow:0 8px 22px -10px rgba(81,1,0,.18),inset 0 1px 0 rgba(255,255,255,.9)">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>${T.filter}
      </button>
      <button style="flex:1;display:flex;align-items:center;justify-content:center;gap:7px;height:40px;border-radius:var(--radius-md);border:1px solid rgba(255,255,255,.7);background:rgba(255,255,255,.55);backdrop-filter:blur(20px) saturate(170%);-webkit-backdrop-filter:blur(20px) saturate(170%);font-size:13.5px;font-weight:600;color:var(--text-body);box-shadow:0 8px 22px -10px rgba(81,1,0,.18),inset 0 1px 0 rgba(255,255,255,.9)">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M8 4v16m0 0l-3-3m3 3l3-3M16 20V4m0 0l-3 3m3-3l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>${T.sort}
      </button>
    </div>

    <div style="display:flex;gap:9px;overflow-x:auto;margin:0 -16px;padding:2px 16px;scrollbar-width:none">
      ${CATS.map(c => {
        const active = c.key === S.cat;
        return `<button onclick="selectCat('${c.key}')" style="flex:none;height:34px;padding:0 15px;border-radius:999px;font-size:13px;font-weight:600;white-space:nowrap;cursor:pointer;border:1px solid ${active ? 'transparent' : 'var(--border-hair)'};background:${active ? 'var(--ink-900)' : 'var(--glass-fill)'};color:${active ? '#fff' : 'var(--text-body)'}">${c.label[S.lang]}</button>`;
      }).join('')}
    </div>

    ${prods.length === 0
      ? `<div style="text-align:center;padding:40px;color:var(--text-muted)">${T.noProducts}</div>`
      : `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${prods.map(p => productCard(p)).join('')}</div>`}
  </div>`;
}

// ============ EKRAN: DETAIL ============
function renderDetail() {
  const T = STR[S.lang];
  const p = vm(byId(S.selectedId));
  if (!p) return '';
  return `
  <div style="display:flex;flex-direction:column">
    <div style="position:relative;height:248px;${p.bgStyle}">
      ${p.badgeShow ? `<span style="position:absolute;top:14px;left:16px;display:inline-flex;align-items:center;height:26px;padding:0 12px;border-radius:999px;font-size:12px;font-weight:600;background:${p.badgeBg};color:${p.badgeFg}">${p.badge}</span>` : ''}
      <button onclick="toggleLike('${p.id}')" style="position:absolute;top:12px;right:14px;width:38px;height:38px;border-radius:50%;border:1px solid var(--glass-border);background:var(--glass-fill-strong);backdrop-filter:var(--blur-md);-webkit-backdrop-filter:var(--blur-md);display:flex;align-items:center;justify-content:center;color:${p.heartStroke};box-shadow:var(--glass-highlight)">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="${p.heartFill}"><path d="M12 21s-7-4.5-9.2-8.4C1.2 9.6 2.6 6 6 6c2 0 3.2 1.2 4 2.3C10.8 7.2 12 6 14 6c3.4 0 4.8 3.6 3.2 6.6C19 16.5 12 21 12 21z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
      </button>
    </div>

    <div style="margin-top:-22px;border-radius:28px 28px 0 0;background:var(--glass-fill-strong);backdrop-filter:var(--blur-lg);-webkit-backdrop-filter:var(--blur-lg);border-top:1px solid var(--glass-border);box-shadow:var(--glass-highlight);padding:20px 16px 32px;display:flex;flex-direction:column;gap:16px">
      <div>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
          <h1 style="font-family:var(--font-display);font-size:23px;font-weight:800;color:var(--text-strong);letter-spacing:-.02em;line-height:1.15;margin:0">${p.name}</h1>
          <span style="display:inline-flex;align-items:center;gap:4px;flex:none;font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--text-body)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#EFA91F"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 21.4l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>${p.rating}
            <span style="color:var(--text-subtle);font-weight:500">· ${p.reviews} ${T.reviews}</span>
          </span>
        </div>
        <div style="display:flex;align-items:baseline;gap:4px;margin-top:10px">
          <span style="font-family:var(--font-mono);font-size:30px;font-weight:600;color:var(--text-strong);letter-spacing:-.02em">${money(p.price)}</span>
          <span style="font-size:15px;color:var(--text-muted)">/${uShort(p.unit)}</span>
          <span style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--text-body)"><span style="width:7px;height:7px;border-radius:50%;background:${p.stockCol}"></span>${p.stockTxt}</span>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:var(--radius-md);background:rgba(255,255,255,.6);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.14)">
        <span style="flex:none;width:42px;height:42px;border-radius:12px;background:linear-gradient(150deg,#7a140d,#510100);color:#ffe9db;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:16px">${p.supplier[0]}</span>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:5px;font-size:14px;font-weight:700;color:var(--text-strong)">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.supplier}</span>
            ${p.verified ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="#7a140d"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.6 1.5-.9 2.9.9 2.9-2.6 1.5-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8L3 16.3l.9-2.9L3 10.5l2.6-1.5 1-2.8 3 .2z"/><path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}
          </div>
          <div style="font-size:12px;color:var(--text-muted)">${p.city} · ${T.verified}</div>
        </div>
        <button style="display:flex;align-items:center;gap:6px;height:34px;padding:0 13px;border-radius:var(--radius-sm);border:1px solid var(--glass-border);background:var(--glass-fill-strong);font-size:12.5px;font-weight:600;color:var(--text-strong);cursor:pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v11H8l-4 3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>${T.message}
        </button>
      </div>

      <div>
        <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7a140d;margin-bottom:10px">${T.specs}</div>
        <div style="border:1px solid var(--border-hair);border-radius:var(--radius-md);overflow:hidden">
          ${[[T.width, p.width],[T.weight, p.weight],[T.comp, p.comp],[T.leadTime, p.leadLabel],[T.minOrder, p.moqLabel]].map(([k,v],i) => `
          <div style="display:flex;justify-content:space-between;padding:11px 14px;background:${i%2===0?'var(--glass-fill)':'rgba(240,243,252,.45)'};${i>0?'border-top:1px solid var(--border-hair)':''}" >
            <span style="font-size:13px;color:var(--text-muted)">${k}</span>
            <span style="font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--text-strong);text-align:right">${v}</span>
          </div>`).join('')}
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-radius:var(--radius-md);background:rgba(255,255,255,.6);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.14)">
        <span style="font-size:14px;font-weight:700;color:var(--text-strong)">${T.qty}</span>
        <div style="display:flex;align-items:center;gap:14px">
          <button onclick="decQty()" style="width:36px;height:36px;border-radius:50%;border:1px solid var(--glass-border);background:var(--glass-fill-strong);display:flex;align-items:center;justify-content:center;color:var(--text-strong);box-shadow:var(--glass-highlight);cursor:pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
          </button>
          <span id="detail-qty" style="font-family:var(--font-mono);font-size:16px;font-weight:600;color:var(--text-strong);min-width:80px;text-align:center">${num(S.qty)} ${uShort(byId(S.selectedId).unit)}</span>
          <button onclick="incQty()" style="width:36px;height:36px;border-radius:50%;border:1px solid transparent;background:linear-gradient(150deg,#8f1a10,#510100);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:var(--shadow-sm);cursor:pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-muted)">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style="flex:none;color:#7a140d"><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        ${T.escrowNote}
      </div>
    </div>
  </div>`;
}

// ============ EKRAN: QIDIRUV ============
function renderSearch() {
  const T = STR[S.lang];
  const q = S.search.trim().toLowerCase();
  const results = q ? PRODUCTS.filter(p => (p.name[S.lang]+p.supplier[S.lang]+p.city[S.lang]).toLowerCase().includes(q)).map(vm) : [];
  const hasSearch = q.length > 0;
  return `
  <div style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:16px">
    <div style="display:flex;align-items:center;gap:10px;height:48px;padding:0 16px;border:1px solid #7a140d;border-radius:var(--radius-md);background:var(--glass-fill-strong);backdrop-filter:var(--blur-md);-webkit-backdrop-filter:var(--blur-md);box-shadow:0 0 0 4px rgba(122,20,13,.2),var(--glass-highlight)">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="color:var(--text-subtle)"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <input id="search-inp" type="text" value="${S.search}" placeholder="${T.searchPh}" oninput="onSearch(this.value)" autocomplete="off" style="flex:1;border:none;outline:none;background:transparent;font-family:var(--font-sans);font-size:15px;color:var(--text-strong)">
      ${S.search ? `<button onclick="clearSearch()" style="color:var(--text-subtle);background:none;border:none;display:flex;align-items:center;cursor:pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>` : ''}
    </div>

    ${hasSearch ? `
      <div style="display:flex;flex-direction:column;gap:11px">
        ${results.length === 0 ? `
          <div style="text-align:center;padding:40px 20px;display:flex;flex-direction:column;align-items:center;gap:8px">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style="color:var(--ink-300)"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <div style="font-size:15px;font-weight:700;color:var(--text-strong)">${T.noResults}</div>
            <div style="font-size:13px;color:var(--text-muted)">${T.noResultsSub}</div>
          </div>
        ` : `
          <div style="font-size:12.5px;color:var(--text-muted);font-weight:600">${results.length} ${T.resultsN}</div>
          ${results.map(p => searchRow(p)).join('')}
        `}
      </div>
    ` : `
      <div>
        <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-subtle);margin-bottom:11px">${T.recent}</div>
        <div style="display:flex;flex-wrap:wrap;gap:9px;margin-bottom:24px">
          ${RECENT_SEARCHES[S.lang].map(r => `
            <button onclick="pickSearch('${r}')" style="display:flex;align-items:center;gap:7px;height:36px;padding:0 14px;border-radius:999px;border:1px solid var(--glass-border-soft);background:var(--glass-fill);font-family:var(--font-sans);font-size:13.5px;font-weight:500;color:var(--text-body);cursor:pointer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style="color:var(--text-subtle)"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>${r}
            </button>
          `).join('')}
        </div>
        <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7a140d;margin-bottom:11px">${T.featured}</div>
        ${PRODUCTS.slice(0,3).map(p => searchRow(vm(p))).join('')}
      </div>
    `}
  </div>`;
}

function searchRow(p) {
  return `
  <div onclick="openProduct('${p.id}')" style="display:flex;gap:12px;align-items:center;cursor:pointer;padding:10px;border-radius:var(--radius-md);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.12)">
    <span style="flex:none;width:60px;height:60px;border-radius:var(--radius-sm);${p.bgStyle}"></span>
    <div style="flex:1;min-width:0">
      <div style="font-family:var(--font-display);font-size:14.5px;font-weight:700;color:var(--text-strong);line-height:1.2">${p.name}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${p.supplier} · ${p.city}</div>
      <div style="margin-top:4px"><span style="font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--text-strong)">${p.priceLabel}</span><span style="font-size:11px;color:var(--text-muted)">/${uShort(p.unit)}</span></div>
    </div>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--text-subtle)"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>`;
}

// ============ EKRAN: SAVAT ============
function renderCart() {
  const T = STR[S.lang];
  if (S.cart.length === 0) return `
  <div style="padding:60px 24px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center">
    <span style="width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,.6);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.55);display:flex;align-items:center;justify-content:center;color:var(--ink-300)">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M3 6h18" stroke="currentColor" stroke-width="1.7"/><path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
    </span>
    <div style="font-size:16px;font-weight:700;color:var(--text-strong)">${T.cartEmpty}</div>
    <div style="font-size:13px;color:var(--text-muted)">${T.cartEmptySub}</div>
    <button onclick="tab('catalog')" style="margin-top:6px;height:42px;padding:0 22px;border-radius:var(--radius-md);border:none;background:linear-gradient(135deg,#8f1a10,#510100);color:#ffe9db;font-size:14px;font-weight:600;cursor:pointer;box-shadow:var(--shadow-sm)">${T.browse}</button>
  </div>`;

  return `
  <div style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:13px">
    ${S.cart.map(c => {
      const p = vm(byId(c.id));
      return `
      <div style="display:flex;gap:12px;padding:12px;border-radius:var(--radius-md);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.12)">
        <span style="flex:none;width:64px;height:64px;border-radius:var(--radius-sm);${p.bgStyle}"></span>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column">
          <div style="display:flex;justify-content:space-between;gap:8px">
            <div style="font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--text-strong);line-height:1.2">${p.name}</div>
            <button onclick="removeCart('${p.id}')" style="flex:none;color:var(--text-subtle);background:none;border:none;cursor:pointer;width:22px;height:22px;display:flex;align-items:center;justify-content:center">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div style="font-size:11.5px;color:var(--text-muted);margin-top:1px">${p.supplier}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:8px">
            <div style="display:flex;align-items:center;gap:10px">
              <button onclick="decCart('${p.id}')" style="width:28px;height:28px;border-radius:8px;border:1px solid var(--glass-border);background:var(--glass-fill-strong);display:flex;align-items:center;justify-content:center;color:var(--text-strong);cursor:pointer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
              </button>
              <span style="font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--text-strong);min-width:60px;text-align:center">${num(c.qty)} ${uShort(p.unit)}</span>
              <button onclick="incCart('${p.id}')" style="width:28px;height:28px;border-radius:8px;border:1px solid var(--glass-border);background:var(--glass-fill-strong);display:flex;align-items:center;justify-content:center;color:var(--text-strong);cursor:pointer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
              </button>
            </div>
            <span style="font-family:var(--font-mono);font-size:15px;font-weight:600;color:var(--text-strong)">${money(p.price * c.qty)}</span>
          </div>
        </div>
      </div>`;
    }).join('')}

    <div style="padding:16px;border-radius:var(--radius-lg);background:var(--glass-fill-strong);backdrop-filter:var(--blur-md);-webkit-backdrop-filter:var(--blur-md);border:1px solid var(--glass-border);box-shadow:var(--glass-shadow)">
      <div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--text-muted);margin-bottom:8px"><span>${T.subtotal}</span><span style="font-family:var(--font-mono);font-weight:600;color:var(--text-body)">${money(cartTotal())}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--text-muted);margin-bottom:10px"><span>${T.delivery}</span><span style="font-size:12.5px">${T.deliveryCalc}</span></div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;padding-top:10px;border-top:1px solid var(--border-hair)">
        <span style="font-size:15px;font-weight:700;color:var(--text-strong)">${T.total}</span>
        <span style="font-family:var(--font-mono);font-size:21px;font-weight:600;color:var(--text-strong)">${money(cartTotal())}</span>
      </div>
      <button onclick="navigate('checkout')" style="margin-top:14px;width:100%;height:50px;border-radius:var(--radius-md);border:none;background:linear-gradient(135deg,#8f1a10,#510100);color:#ffe9db;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 10px 26px -10px rgba(81,1,0,.55),inset 0 1px 0 rgba(255,229,210,.2)">${T.checkout}</button>
    </div>
  </div>`;
}

// ============ EKRAN: CHECKOUT ============
function renderCheckout() {
  const T = STR[S.lang];
  return `
  <div style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:16px">
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px">
        <span style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7a140d">${T.address}</span>
        <button style="font-size:12.5px;font-weight:600;color:var(--teal-600);background:none;border:none;cursor:pointer">${T.changeAddr}</button>
      </div>
      <div style="display:flex;gap:12px;padding:14px;border-radius:var(--radius-md);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.12)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--color-primary);margin-top:2px"><path d="M12 21s-6-5.7-6-10a6 6 0 0 1 12 0c0 4.3-6 10-6 10z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="11" r="2.2" stroke="currentColor" stroke-width="2"/></svg>
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--text-strong)">${COMPANY.name[S.lang]}</div>
          <div style="font-size:13px;color:var(--text-muted);line-height:1.45;margin-top:2px">${COMPANY.addr[S.lang]}</div>
        </div>
      </div>
    </div>

    <div>
      <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7a140d;margin-bottom:9px">${T.payment}</div>
      <div style="display:flex;flex-direction:column;gap:9px">
        ${PAY.map(o => {
          const sel = S.pay === o.key;
          return `<button onclick="setPay('${o.key}')" style="display:flex;align-items:center;gap:12px;width:100%;text-align:left;cursor:pointer;padding:13px 14px;border-radius:var(--radius-md);background:rgba(255,255,255,.55);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1.5px solid ${sel ? '#7a140d' : 'var(--border-hair)'};transition:border-color 200ms">
            <div style="flex:none;width:20px;height:20px;border-radius:50%;border:2px solid ${sel ? '#7a140d' : 'var(--ink-300)'};display:flex;align-items:center;justify-content:center">
              <div style="width:9px;height:9px;border-radius:50%;background:${sel ? '#7a140d' : 'transparent'}"></div>
            </div>
            <div style="flex:1">
              <div style="font-size:14px;font-weight:700;color:var(--text-strong)">${o.label[S.lang]}</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:1px">${o.sub[S.lang]}</div>
            </div>
          </button>`;
        }).join('')}
      </div>
    </div>

    <div>
      <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7a140d;margin-bottom:9px">${T.commentL}</div>
      <textarea id="checkout-comment" oninput="S.comment=this.value" placeholder="${T.commentPh}" rows="3" style="width:100%;resize:none;padding:12px 14px;border:1px solid var(--border-hair);border-radius:var(--radius-md);background:var(--glass-fill-strong);font-family:var(--font-sans);font-size:14px;color:var(--text-strong);outline:none;box-shadow:var(--glass-highlight)">${S.comment || ''}</textarea>
    </div>

    <div>
      <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7a140d;margin-bottom:9px">${T.summary}</div>
      <div style="padding:14px 16px;border-radius:var(--radius-md);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.12)">
        ${S.cart.map(c => {
          const p = byId(c.id);
          return `<div style="display:flex;justify-content:space-between;gap:10px;font-size:13px;margin-bottom:8px"><span style="color:var(--text-body)">${p.name[S.lang]} · ${num(c.qty)} ${uShort(p.unit)}</span><span style="font-family:var(--font-mono);font-weight:600;color:var(--text-strong);flex:none">${money(p.price * c.qty)}</span></div>`;
        }).join('')}
        <div style="display:flex;justify-content:space-between;align-items:baseline;padding-top:10px;border-top:1px solid var(--border-hair)">
          <span style="font-size:14.5px;font-weight:700;color:var(--text-strong)">${T.total}</span>
          <span style="font-family:var(--font-mono);font-size:19px;font-weight:600;color:var(--text-strong)">${money(cartTotal())}</span>
        </div>
      </div>
    </div>
  </div>`;
}

// ============ EKRAN: MUVAFFAQIYAT ============
function renderSuccess() {
  const T = STR[S.lang];
  return `
  <div style="padding:50px 28px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px">
    <span style="width:88px;height:88px;border-radius:50%;background:linear-gradient(155deg,#a51f13 0%,#7a140d 48%,#480100 100%);display:flex;align-items:center;justify-content:center;color:#ffe9db;box-shadow:0 14px 34px -10px rgba(81,1,0,.5);animation:pop var(--dur-slow) var(--ease-spring)">
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </span>
    <div style="font-family:var(--font-display);font-size:23px;font-weight:800;color:var(--text-strong);letter-spacing:-.02em">${T.orderPlaced}</div>
    <div style="font-size:14px;color:var(--text-muted);line-height:1.55;max-width:280px">${T.orderPlacedSub}</div>
    <div style="font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--text-strong);padding:8px 16px;border-radius:999px;background:rgba(255,255,255,.62);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.55)">#LM-2042</div>
    <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:300px;margin-top:14px">
      <button onclick="tab('orders')" style="height:50px;border-radius:var(--radius-md);border:none;background:linear-gradient(135deg,#8f1a10,#510100);color:#ffe9db;font-size:15px;font-weight:600;cursor:pointer;box-shadow:var(--shadow-sm)">${T.viewOrders}</button>
      <button onclick="tab('home')" style="height:50px;border-radius:var(--radius-md);border:1px solid var(--glass-border);background:var(--glass-fill-strong);color:var(--text-strong);font-size:15px;font-weight:600;cursor:pointer">${T.continue}</button>
    </div>
  </div>`;
}

// ============ EKRAN: BUYURTMALAR ============
function renderOrders() {
  const T = STR[S.lang];
  const activeOrders = ORDERS.filter(o => o.statusKey !== 'delivered');
  const pastOrders   = ORDERS.filter(o => o.statusKey === 'delivered');
  const list = S.ordersTab === 'active' ? activeOrders : pastOrders;

  return `
  <div style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:14px">
    <div style="display:flex;gap:4px;padding:4px;border-radius:var(--radius-md);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55)">
      <button onclick="setOrdersTab('active')" style="flex:1;height:36px;border:none;border-radius:var(--radius-sm);font-size:13.5px;font-weight:600;cursor:pointer;background:${S.ordersTab==='active'?'var(--surface-solid)':'transparent'};color:${S.ordersTab==='active'?'var(--text-strong)':'var(--text-muted)'};box-shadow:${S.ordersTab==='active'?'0 3px 8px -3px rgba(81,1,0,.3)':'none'}">${T.active}</button>
      <button onclick="setOrdersTab('past')" style="flex:1;height:36px;border:none;border-radius:var(--radius-sm);font-size:13.5px;font-weight:600;cursor:pointer;background:${S.ordersTab==='past'?'var(--surface-solid)':'transparent'};color:${S.ordersTab==='past'?'var(--text-strong)':'var(--text-muted)'};box-shadow:${S.ordersTab==='past'?'0 3px 8px -3px rgba(81,1,0,.3)':'none'}">${T.past}</button>
    </div>

    ${list.length === 0 ? `<div style="text-align:center;padding:40px;color:var(--text-muted)">${T.noActive}</div>` :
    list.map(o => {
      const tone = STATUS_TONE[o.statusKey];
      const [sbg,sfg] = STATUS_COL[tone];
      const lines = o.items.map(it => { const p = byId(it.id); return { name:p.name[S.lang], bg:PATTERNS[p.pattern], bgSize:pSize(p.pattern), qty:it.qty, unit:uShort(p.unit), total:p.price*it.qty }; });
      const total = o.items.reduce((s,it) => s + byId(it.id).price * it.qty, 0);
      return `
      <div style="padding:14px;border-radius:var(--radius-lg);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.12)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:11px">
          <span style="font-family:var(--font-mono);font-size:13.5px;font-weight:600;color:var(--text-strong)">${o.id}</span>
          <span style="display:inline-flex;align-items:center;height:24px;padding:0 11px;border-radius:999px;font-size:11.5px;font-weight:600;background:${sbg};color:${sfg}">${STATUS_TXT[o.statusKey][S.lang]}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="position:relative;flex:none;width:52px;height:52px;border-radius:var(--radius-sm);background:${lines[0].bg};background-size:${lines[0].bgSize}">
            ${lines.length>1 ? `<span style="position:absolute;right:-6px;bottom:-6px;min-width:24px;height:24px;padding:0 6px;border-radius:999px;background:var(--ink-900);color:#fff;font-family:var(--font-mono);font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;border:2px solid #fff">+${lines.length-1}</span>` : ''}
          </span>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:700;color:var(--text-strong);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${lines[0].name}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${lines.length} ${T.items} · ${o.date[S.lang]}</div>
          </div>
          <span style="font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--text-strong)">${money(total)}</span>
        </div>
        <div style="display:flex;gap:9px;margin-top:13px">
          <button style="flex:1;height:38px;border-radius:var(--radius-sm);border:1px solid var(--glass-border);background:var(--glass-fill-strong);font-size:13px;font-weight:600;color:var(--text-strong);cursor:pointer">${T.track}</button>
          <button style="flex:1;height:38px;border-radius:var(--radius-sm);border:1px solid var(--border-hair);background:transparent;font-size:13px;font-weight:600;color:var(--teal-600);cursor:pointer">${T.reorder}</button>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

// ============ TELEGRAM PROFIL KARTASI ============
function renderTgCard() {
  const T = STR[S.lang];
  const u = S.tgUser;
  if (!u) {
    return `
    <div style="display:flex;align-items:center;gap:10px;padding:13px 14px;border-radius:var(--radius-lg);background:rgba(255,255,255,.45);border:1px dashed var(--glass-border);color:var(--text-muted);font-size:12px">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--text-subtle)"><path d="M21 4L2.5 11.5l6 2 2 6.5L15 15l5-11z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
      ${T.tgNotConnected}
    </div>`;
  }
  const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ') || T.tgUserFallback;
  const avatar = u.photo_url
    ? `<img src="${u.photo_url}" style="width:48px;height:48px;border-radius:14px;object-fit:cover;flex:none" alt="">`
    : `<span style="flex:none;width:48px;height:48px;border-radius:14px;background:linear-gradient(150deg,#37AEE2,#1E96C8);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:18px">${fullName[0].toUpperCase()}</span>`;
  return `
  <div style="display:flex;align-items:center;gap:12px;padding:14px;border-radius:var(--radius-lg);background:var(--glass-fill-strong);backdrop-filter:var(--blur-md);-webkit-backdrop-filter:var(--blur-md);border:1px solid var(--glass-border);box-shadow:var(--glass-shadow)">
    ${avatar}
    <div style="flex:1;min-width:0">
      <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--text-strong);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${fullName}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:1px">${u.username ? '@' + u.username : ''}</div>
    </div>
    <span style="flex:none;display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 10px;border-radius:999px;background:rgba(55,174,226,.13);color:#1E96C8;font-size:11px;font-weight:600;white-space:nowrap">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M21 4L2.5 11.5l6 2 2 6.5L15 15l5-11z"/></svg>${T.tgVerified}
    </span>
  </div>`;
}

// ============ EKRAN: PROFIL ============
function renderProfile() {
  const T = STR[S.lang];
  return `
  <div style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:14px">
    ${renderTgCard()}
    <div style="display:flex;align-items:center;gap:14px;padding:18px;border-radius:var(--radius-lg);background:var(--glass-fill-strong);backdrop-filter:var(--blur-md);-webkit-backdrop-filter:var(--blur-md);border:1px solid var(--glass-border);box-shadow:var(--glass-shadow)">
      <span style="flex:none;width:58px;height:58px;border-radius:18px;background:linear-gradient(150deg,#7a140d,#510100);color:#ffe9db;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:22px">${COMPANY.initials}</span>
      <div style="flex:1;min-width:0">
        <div style="font-family:var(--font-display);font-size:17px;font-weight:700;color:var(--text-strong);letter-spacing:-.01em">${COMPANY.name[S.lang]}</div>
        <div style="font-size:12.5px;color:var(--text-muted);margin-top:2px">${COMPANY.role[S.lang]} · ${COMPANY.since[S.lang]}</div>
      </div>
      <button style="flex:none;width:36px;height:36px;border-radius:10px;border:1px solid var(--glass-border);background:var(--glass-fill);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-body)">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 20h4L18 10l-4-4L4 16v4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 6l4 4" stroke="currentColor" stroke-width="2"/></svg>
      </button>
    </div>

    <div style="display:flex;flex-direction:column;border:1px solid rgba(255,255,255,.55);border-radius:var(--radius-md);overflow:hidden;background:rgba(255,255,255,.6);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);box-shadow:0 5px 16px -12px rgba(81,1,0,.12)">
      <div style="display:flex;align-items:center;gap:12px;padding:14px;border-bottom:1px solid var(--border-hair)">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--text-muted)"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        <span style="flex:1;font-size:14px;color:var(--text-body)">${S.tgPhone || COMPANY.phone}</span>
        ${(!S.tgPhone && inTelegram) ? `<button onclick="shareContact()" style="flex:none;font-size:12px;font-weight:600;color:var(--teal-600);background:none;border:none;cursor:pointer">${T.shareContact}</button>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:12px;padding:14px">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--text-muted)"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M4 7l8 6 8-6" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        <span style="font-size:14px;color:var(--text-body)">${COMPANY.email}</span>
      </div>
    </div>

    <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-subtle);margin-top:4px">${T.settings}</div>
    <div style="display:flex;flex-direction:column;border:1px solid rgba(255,255,255,.55);border-radius:var(--radius-md);overflow:hidden;background:rgba(255,255,255,.6);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);box-shadow:0 5px 16px -12px rgba(81,1,0,.12)">
      <div style="display:flex;align-items:center;gap:12px;padding:13px 14px;border-bottom:1px solid var(--border-hair)">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--text-muted)"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18A14 14 0 0 1 12 3z" stroke="currentColor" stroke-width="2"/></svg>
        <span style="flex:1;font-size:14px;font-weight:600;color:var(--text-strong)">${T.language}</span>
        <span style="display:flex;align-items:center;background:var(--ink-50,var(--ink-100));border-radius:999px;padding:3px;gap:2px">
          <button onclick="setLangUi('uz')" style="border:none;cursor:pointer;height:26px;padding:0 12px;border-radius:999px;font-size:12px;font-weight:700;font-family:var(--font-mono);background:${S.lang==='uz'?'var(--ink-900)':'transparent'};color:${S.lang==='uz'?'#fff':'var(--text-muted)'}">UZ</button>
          <button onclick="setLangUi('ru')" style="border:none;cursor:pointer;height:26px;padding:0 12px;border-radius:999px;font-size:12px;font-weight:700;font-family:var(--font-mono);background:${S.lang==='ru'?'var(--ink-900)':'transparent'};color:${S.lang==='ru'?'#fff':'var(--text-muted)'}">RU</button>
        </span>
      </div>
      <div style="display:flex;align-items:center;gap:12px;padding:13px 14px;border-bottom:1px solid var(--border-hair)">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--text-muted)"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M10 21a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <span style="flex:1;font-size:14px;font-weight:600;color:var(--text-strong)">${T.notifications}</span>
        <span onclick="toggleNotif()" style="cursor:pointer;width:44px;height:26px;border-radius:999px;background:${S.notif?'#7a140d':'var(--ink-200)'};position:relative;flex:none;transition:background var(--dur-base) var(--ease-out)"><span style="position:absolute;top:3px;${S.notif?'right':'left'}:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:var(--shadow-sm);transition:left var(--dur-base) var(--ease-out),right var(--dur-base) var(--ease-out)"></span></span>
      </div>
      <div style="display:flex;align-items:center;gap:12px;padding:13px 14px">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--text-muted)"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.7-2.5 2-2.5 2M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <span style="flex:1;font-size:14px;font-weight:600;color:var(--text-strong)">${T.help}</span>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--text-subtle)"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>
    <button style="height:46px;border-radius:var(--radius-md);border:1px solid var(--danger-100);background:transparent;color:var(--danger-500);cursor:pointer;font-size:14px;font-weight:600;margin-top:2px">${T.logout}</button>
    <div style="text-align:center;font-size:11px;color:var(--text-subtle);margin-top:6px">${T.madeBy} Furqat Tukhsanov</div>
  </div>`;
}

// ============ MAHSULOT KARTA — KATALOG (badge + supplier/verified + meta) ============
function productCard(p) {
  return `
  <div onclick="openProduct('${p.id}')" style="cursor:pointer;background:var(--glass-fill);backdrop-filter:var(--blur-lg);-webkit-backdrop-filter:var(--blur-lg);border:1px solid var(--glass-border-soft);border-radius:var(--radius-lg);box-shadow:0 6px 16px -12px rgba(81,1,0,.16),0 1px 2px rgba(23,26,48,.04);overflow:hidden;display:flex;flex-direction:column">
    <div style="position:relative;height:230px;${p.bgStyle}">
      ${p.badgeShow ? `<span style="position:absolute;top:8px;left:8px;display:inline-flex;align-items:center;height:21px;padding:0 8px;border-radius:999px;font-size:10.5px;font-weight:600;background:${p.badgeBg};color:${p.badgeFg}">${p.badge}</span>` : ''}
    </div>
    <div style="padding:10px 11px 11px;display:flex;flex-direction:column;gap:6px">
      <div style="font-family:var(--font-display);font-size:13.5px;font-weight:700;color:var(--text-strong);line-height:1.2;letter-spacing:-.01em">${p.name}</div>
      <div style="display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:var(--text-strong);line-height:1.3">
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.supplier}</span>
        ${p.verified ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="#7a140d" style="flex:none"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.6 1.5-.9 2.9.9 2.9-2.6 1.5-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8L3 16.3l.9-2.9L3 10.5l2.6-1.5 1-2.8 3 .2z"/><path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:1px">
        <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:var(--pom-700)">${p.perUnitLabel}</span>
        <span style="font-family:var(--font-mono);font-size:15.5px;font-weight:600;color:var(--text-strong)">${p.priceLabel}</span>
      </div>
      ${catalogQtyControl(p)}
    </div>
  </div>`;
}

// ============ KATALOG/BOSH KARTOCHKASI — SAVAT MIQDOR BOSHQARUVI ============
function catalogQtyControl(p) {
  const line = S.cart.find(x => x.id === p.id);
  const btnBg = 'background:linear-gradient(150deg,#7a140d,#510100)';
  if (!line) {
    return `
    <div style="width:100%;height:36px;display:flex;align-items:center;justify-content:flex-end">
      <button onclick="event.stopPropagation();catalogInc('${p.id}')" style="flex:none;width:32px;height:32px;border-radius:10px;border:none;${btnBg};color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px -4px rgba(81,1,0,.55);cursor:pointer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
      </button>
    </div>`;
  }
  return `
  <div onclick="event.stopPropagation()" style="width:100%;height:36px;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;padding:3px;border-radius:11px;background:var(--pom-100);border:1px solid rgba(122,20,13,.12)">
    <button onclick="catalogDec('${p.id}')" style="flex:none;width:30px;height:30px;border-radius:8px;border:none;${btnBg};color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
    </button>
    <span style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:var(--pom-800)">${num(line.qty)} ${uShort(p.unit)}</span>
    <button onclick="catalogInc('${p.id}')" style="flex:none;width:30px;height:30px;border-radius:8px;border:none;${btnBg};color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
    </button>
  </div>`;
}
function catalogInc(id) {
  const p = byId(id);
  const line = S.cart.find(x => x.id === id);
  if (line) { line.qty += step(p); }
  else { S.cart.push({ id, qty: p.moq }); showToast(STR[S.lang].added); }
  render();
}
function catalogDec(id) {
  const p = byId(id);
  const line = S.cart.find(x => x.id === id);
  if (!line) return;
  if (line.qty <= p.moq) { S.cart = S.cart.filter(x => x.id !== id); }
  else { line.qty = Math.max(p.moq, line.qty - step(p)); }
  render();
}

// ============ MAHSULOT KARTA — BOSH SAHIFA (badge + like, supplier/meta yo'q) ============
function homeCard(p) {
  return `
  <div onclick="openProduct('${p.id}')" style="cursor:pointer;background:var(--glass-fill);backdrop-filter:var(--blur-lg);-webkit-backdrop-filter:var(--blur-lg);border:1px solid var(--glass-border-soft);border-radius:var(--radius-lg);box-shadow:0 6px 16px -12px rgba(81,1,0,.16),0 1px 2px rgba(23,26,48,.04);overflow:hidden;display:flex;flex-direction:column">
    <div style="position:relative;height:230px;${p.bgStyle}">
      ${p.badgeShow ? `<span style="position:absolute;top:9px;left:9px;display:inline-flex;align-items:center;height:22px;padding:0 9px;border-radius:999px;font-size:11px;font-weight:600;background:${p.badgeBg};color:${p.badgeFg}">${p.badge}</span>` : ''}
      <button onclick="event.stopPropagation();toggleLike('${p.id}')" style="position:absolute;top:9px;right:9px;width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,.6);background:rgba(255,255,255,.42);backdrop-filter:blur(10px) saturate(160%);-webkit-backdrop-filter:blur(10px) saturate(160%);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px -2px rgba(23,26,48,.28),inset 0 1px 0 rgba(255,255,255,.8)">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="${p.heartFill}" style="color:${p.heartStroke}"><path d="M12 20.8s-6.9-4.3-9-8a5.2 5.2 0 0 1-.5-3.7A4.8 4.8 0 0 1 6.3 5.5c1.9 0 3.4 1 4.3 2.3.4.6 1 .6 1.4 0 .9-1.3 2.4-2.3 4.3-2.3a4.8 4.8 0 0 1 3.8 3.6 5.2 5.2 0 0 1-.5 3.7c-2.1 3.7-9 8-9 8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
      </button>
    </div>
    <div style="padding:11px 12px 12px;display:flex;flex-direction:column;gap:6px">
      <div style="font-family:var(--font-display);font-size:14.5px;font-weight:700;color:var(--text-strong);line-height:1.2;letter-spacing:-.01em">${p.name}</div>
      <div style="font-size:11.5px;font-weight:700;color:var(--text-strong);line-height:1.3">${p.city}</div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:1px">
        <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:var(--pom-700)">${p.perUnitLabel}</span>
        <span style="font-family:var(--font-mono);font-size:16px;font-weight:600;color:var(--text-strong)">${p.priceLabel}</span>
      </div>
      ${catalogQtyControl(p)}
    </div>
  </div>`;
}

// ============ INTERAKSIYALAR ============
function setLangUi(l) {
  S.lang = l;
  render();
}
function toggleNotif() {
  S.notif = !S.notif;
  document.getElementById('screen-wrap').innerHTML = renderProfile();
}
function toggleLike(id) {
  S.liked[id] = !S.liked[id];
  if (S.liked[id]) showToast(STR[S.lang].liked);
  render();
}
function selectCat(c) { S.cat = c; document.getElementById('screen-wrap').innerHTML = renderCatalog(); }
function setPay(p) { S.pay = p; document.getElementById('screen-wrap').innerHTML = renderCheckout(); }
function setOrdersTab(t) { S.ordersTab = t; document.getElementById('screen-wrap').innerHTML = renderOrders(); }
function onSearch(v) {
  S.search = v;
  document.getElementById('screen-wrap').innerHTML = renderSearch();
  const inp = document.getElementById('search-inp');
  if (inp) { inp.focus(); const l=inp.value.length; inp.setSelectionRange(l,l); }
}
function clearSearch() { S.search=''; document.getElementById('screen-wrap').innerHTML=renderSearch(); document.getElementById('search-inp')?.focus(); }
function pickSearch(v) { S.search=v; document.getElementById('screen-wrap').innerHTML=renderSearch(); }

function sendOrderNotify() {
  try {
    const items = S.cart.map(c => {
      const p = byId(c.id);
      return { name: p.name[S.lang], qty: `${num(c.qty)} ${uShort(p.unit)}`, price: money(p.price * c.qty) };
    });
    const payOpt = PAY.find(o => o.key === S.pay);
    const tgUser = S.tgUser?.username;
    fetch('/api/telegram-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyerName: COMPANY.name[S.lang],
        tgUser: tgUser || undefined,
        address: COMPANY.addr[S.lang],
        payment: payOpt ? payOpt.label[S.lang] : S.pay,
        comment: S.comment || '',
        items,
        total: money(cartTotal()),
      }),
    }).catch(() => {});
  } catch (e) {}
}

function mainBtnAction() {
  if (S.screen === 'detail') {
    addToCart(S.selectedId, S.qty);
    tab('cart');
  } else if (S.screen === 'checkout') {
    sendOrderNotify();
    S.cart = [];
    S.screen = 'success';
    S.history = [];
    S.comment = '';
    render();
  }
}

// ============ ASOSIY RENDER ============
function render() {
  updateHeader();
  updateNav();

  const map = {
    home: renderHome, catalog: renderCatalog, detail: renderDetail,
    search: renderSearch, cart: renderCart, checkout: renderCheckout,
    success: renderSuccess, orders: renderOrders, profile: renderProfile,
  };
  const fn = map[S.screen];
  if (fn) document.getElementById('screen-wrap').innerHTML = fn();
}

// ============ TELEGRAM ORQALI RO'YXATDAN O'TISH ============
function loadTgUser() {
  try {
    const live = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (live) {
      localStorage.setItem('lolamarket_tg_user', JSON.stringify(live));
      return live;
    }
    const cached = localStorage.getItem('lolamarket_tg_user');
    return cached ? JSON.parse(cached) : null;
  } catch (e) { return null; }
}

function shareContact() {
  if (!window.Telegram?.WebApp?.requestContact) return;
  Telegram.WebApp.requestContact((shared) => {
    if (!shared) return;
    showToast(STR[S.lang].contactPending);
    pollForPhone();
  });
}
function pollForPhone(attempt) {
  attempt = attempt || 0;
  const uid = S.tgUser?.id;
  if (!uid || attempt > 6) return;
  fetch(`/api/telegram-contact?uid=${uid}`)
    .then((r) => r.json())
    .then((d) => {
      if (d && d.phone) {
        S.tgPhone = d.phone;
        localStorage.setItem('lolamarket_tg_phone', d.phone);
        showToast(STR[S.lang].contactDone);
        render();
      } else {
        setTimeout(() => pollForPhone(attempt + 1), 1200);
      }
    })
    .catch(() => {});
}

// ============ ISHGA TUSHIRISH ============
const inTelegram = !!(window.Telegram?.WebApp?.initData);
if (window.Telegram?.WebApp) {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
}
document.documentElement.classList.toggle('in-telegram', inTelegram);
S.tgUser = loadTgUser();
S.tgPhone = localStorage.getItem('lolamarket_tg_phone') || null;
render();
