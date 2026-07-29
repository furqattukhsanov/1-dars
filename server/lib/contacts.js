const fs = require('fs');
const { CONTACTS_FILE } = require('../config');

// ============ KONTAKTLAR (telefon ulashish) — fayl bazasi ============
// Kichik va kam o'zgaradigan ma'lumot, shuning uchun alohida jadval emas,
// oddiy JSON fayl.

function loadContacts() {
  try {
    return JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function saveContact(userId, phone) {
  const data = loadContacts();
  data[String(userId)] = { phone, savedAt: Date.now() };
  try {
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(data));
  } catch (e) {
    console.error('contacts.json yozishda xato:', e.message);
  }
}

module.exports = { loadContacts, saveContact };
