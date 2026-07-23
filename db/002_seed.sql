-- LolaMarket seed — app.js PRODUCTS massividan avtomatik generatsiya qilingan.
-- Qayta ishga tushirsa dublikat bo'lmasin: avval tozalab, keyin joylaymiz.
TRUNCATE order_items, orders, products, sellers RESTART IDENTITY CASCADE;

-- Sotuvchilar
INSERT INTO sellers (id, business_name_uz, business_name_ru, city_uz, city_ru, is_verified) VALUES
  (1, 'Marg''ilon Ipak Co.', 'Маргилан Силк', 'Marg''ilon', 'Маргилан', true),
  (2, 'Buxoro Looms', 'Бухара Лумс', 'Buxoro', 'Бухара', true),
  (3, 'Nurota Atelier', 'Нурата Ателье', 'Nurota', 'Нурата', true),
  (4, 'O''sh Textile', 'Ош Текстиль', 'O''sh', 'Ош', false),
  (5, 'Almati Weaving', 'Алматы Вивинг', 'Almati', 'Алматы', true),
  (6, 'Shymkent Mills', 'Шымкент Миллс', 'Shymkent', 'Шымкент', true),
  (7, 'Farg''ona Fabric', 'Фергана Фабрик', 'Farg''ona', 'Фергана', false),
  (8, 'Qarshi Hunarmand', 'Карши Хунармад', 'Qarshi', 'Карши', true),
  (9, 'Andijon Ipak Uyi', 'Андижан Силк Хаус', 'Andijon', 'Андижан', true),
  (10, 'Namangan Chit', 'Наманган Читтекс', 'Namangan', 'Наманган', false),
  (11, 'Xiva Tekstil', 'Хива Текстиль', 'Xiva', 'Хива', true);
SELECT setval('sellers_id_seq', (SELECT MAX(id) FROM sellers));

-- Mahsulotlar
INSERT INTO products (id, seller_id, sort_order, cat_key, pattern, img, price, unit, moq, lead_days, rating, reviews, stock_key, badge_tone, width, weight, name_uz, name_ru, comp_uz, comp_ru, badge_uz, badge_ru) VALUES
  ('ik-1402', 1, 0, 'silk', 'adras', 'assets/products/textile-01.jpg', 850000, 'rulon', 1, 28, 4.9, 42, 'in', 'primary', '0.9 m', '90 g/m²', 'Marg''ilon ipak ikat', 'Шёлковый икат', '100% tut ipagi', '100% тутовый шёлк', 'Tavsiya', 'Хит'),
  ('ad-0890', 2, 1, 'ikat', 'adrasWarm', 'assets/products/textile-02.jpg', 730000, 'rulon', 1, 32, 4.7, 28, 'low', 'saffron', '1.0 m', '150 g/m²', 'Qo''lbola adras', 'Ручной адрас', '50% ipak / 50% paxta', '50% шёлк / 50% хлопок', 'Kam qoldi', 'Мало'),
  ('sz-3310', 3, 2, 'suzani', 'suzani', 'assets/products/textile-03.jpg', 890000, 'rulon', 1, 45, 5, 17, 'made', 'teal', '1.4 × 1.8 m', '—', 'So''zana panel — anor', 'Сюзане — гранат', 'Paxta asos, ipak ip', 'Хлопок, шёлковая нить', 'Hunarmand', 'Ручная'),
  ('ck-2201', 4, 3, 'cotton', 'adrasCool', 'assets/products/textile-04.jpg', 700000, 'rulon', 1, 21, 4.6, 51, 'in', 'neutral', '1.5 m', '180 g/m²', 'Paxta adras — indigo', 'Хлопковый адрас — индиго', '100% paxta', '100% хлопок', NULL, NULL),
  ('hb-7740', 5, 4, 'wool', 'herringbone', 'assets/products/textile-05.jpg', 870000, 'rulon', 1, 35, 4.8, 33, 'in', 'teal', '1.5 m', '320 g/m²', 'Junli mato — yelkacha', 'Шерсть — ёлочка', '70% jun / 30% PES', '70% шерсть / 30% ПЭ', 'Yangi', 'Новинка'),
  ('lk-5512', 6, 5, 'linen', 'weave', 'assets/products/textile-06.jpg', 750000, 'rulon', 1, 24, 4.5, 22, 'in', 'neutral', '1.4 m', '200 g/m²', 'Zig''ir mato — natural', 'Лён — натуральный', '100% zig''ir', '100% лён', NULL, NULL),
  ('ik-9001', 1, 6, 'ikat', 'ikat', 'assets/products/textile-07.jpg', 900000, 'rulon', 1, 30, 4.9, 19, 'in', 'primary', '0.9 m', '110 g/m²', 'Kelinlik ikat — za''faron', 'Свадебный икат — шафран', '100% tut ipagi', '100% тутовый шёлк', 'Tavsiya', 'Хит'),
  ('pl-3320', 7, 7, 'cotton', 'plain', 'assets/products/textile-08.jpg', 700000, 'rulon', 1, 18, 4.4, 64, 'in', 'neutral', '1.6 m', '160 g/m²', 'Sodda to''qima — marjon', 'Простое плетение — коралл', '65% paxta / 35% PES', '65% хлопок / 35% ПЭ', NULL, NULL),
  ('tx-4401', 8, 8, 'suzani', 'suzani', 'assets/products/textile-09.jpg', 880000, 'rulon', 1, 40, 4.8, 14, 'made', 'saffron', '1.3 × 1.7 m', '—', 'Zar naqsh so''zana panel', 'Сюзане с золотым узором', 'Paxta asos, ipak ip', 'Хлопок, шёлковая нить', 'Yangi', 'Новинка'),
  ('tx-4402', 9, 9, 'silk', 'ikat', 'assets/products/textile-10.jpg', 860000, 'rulon', 1, 26, 4.7, 23, 'in', 'primary', '1.1 m', '95 g/m²', 'Gulli ipak — lola', 'Шёлк с цветами — тюльпан', '100% tut ipagi', '100% тутовый шёлк', NULL, NULL),
  ('tx-4403', 10, 10, 'cotton', 'plain', 'assets/products/textile-11.jpg', 710000, 'rulon', 1, 19, 4.5, 37, 'in', 'neutral', '1.5 m', '140 g/m²', 'Chit mato — sariq gul', 'Ситец — жёлтый цветок', '100% paxta', '100% хлопок', NULL, NULL),
  ('tx-4404', 11, 11, 'linen', 'weave', 'assets/products/textile-12.png', 760000, 'rulon', 1, 27, 4.6, 20, 'low', 'teal', '1.4 m', '175 g/m²', 'Vintage chit — krem atirgul', 'Винтажный ситец — кремовая роза', '70% zig''ir / 30% paxta', '70% лён / 30% хлопок', 'Kam qoldi', 'Мало');
