const fs = require('fs');
const path = require('path');

// ============ ROUTER'DAN YO'LLAR RO'YXATI ============
// Ro'yxat server.js ning O'ZIDAN o'qiladi, qo'lda yozilmaydi.
// Sabab: qo'lda yozilgan ro'yxat eskiradi — yangi endpoint qo'shilganda
// uni ro'yxatga qo'shish unutiladi va tekshiruvlar uni ko'rmay qoladi.

function readRoutes(file = path.join(__dirname, '..', 'server.js')) {
  const src = fs.readFileSync(file, 'utf8');
  const found = new Set();
  // Router shakli: if (path === '/api/...') {
  for (const m of src.matchAll(/path\s*===\s*'(\/api\/[^']+)'/g)) found.add(m[1]);
  return [...found].sort();
}

module.exports = { readRoutes };
