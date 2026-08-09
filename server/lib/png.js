'use strict';

// ============ PNG: O'QISH, YOZISH, MIQYOSLASH ============
// Sof Node — TASHQI KUTUBXONA YO'Q. Loyihada `pg` dan boshqa ishlab chiqarish
// bog'liqligi yo'q va rasmga logo qo'yish uchun `sharp` kabi NATIV paket
// olib kelish deploy'ga yangi sinish nuqtasi qo'shardi (serverda `npm i`,
// nativ build, Node versiyasiga bog'liqlik). Bu yerda kerak bo'lgani atigi
// uchta amal: dekod, miqyoslash, kodlash — ular `zlib` ustida yoziladi.
//
// ⚠️ QAMROV ATAYLAB TOR: 8-bitli, interlace'siz PNG. Boshqasi kelsa xato
// TASHLANADI, jimgina noto'g'ri rasm qaytarilmaydi. Ikkala manba ham bizniki:
//   • `assets/lola-banner.png` — o'zimiz yasaganmiz (RGBA, 8-bit);
//   • Gemini javobi — `image/png` (2026-08-09 holatiga ko'ra).
// Manba kutilmagan shaklda kelsa, chaqiruvchi (`watermark.js`) xatoni ushlab
// ASL rasmni qaytaradi — ya'ni xaridor baribir to'lagan narsasini oladi.

const zlib = require('zlib');

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// Rang turi → kanallar soni. 3 (palitra) ATAYLAB yo'q: bizga hech qachon
// kelmaydi va uni qo'llab-quvvatlash PLTE/tRNS o'qishni talab qilardi.
const KANALLAR = { 0: 1, 2: 3, 4: 2, 6: 4 };

const CRC_JADVAL = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_JADVAL[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

// ---- DEKOD ----
// Natija: { width, height, data } — `data` har doim RGBA (4 bayt/piksel),
// ya'ni chaqiruvchi rang turini bilishi SHART EMAS. Bir joyda normallashtirish
// keyingi kodning hamma yerida shartni yo'q qiladi.
function decode(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 8 || !buf.subarray(0, 8).equals(SIGNATURE)) {
    throw new Error('png emas');
  }

  let ihdr = null;
  const idat = [];
  let off = 8;

  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const turi = buf.toString('ascii', off + 4, off + 8);
    const boshi = off + 8;
    if (boshi + len + 4 > buf.length) throw new Error(`png bo'lagi kesilgan (${turi})`);

    if (turi === 'IHDR') {
      ihdr = {
        width: buf.readUInt32BE(boshi),
        height: buf.readUInt32BE(boshi + 4),
        bitDepth: buf[boshi + 8],
        colorType: buf[boshi + 9],
        interlace: buf[boshi + 12],
      };
    } else if (turi === 'IDAT') {
      idat.push(buf.subarray(boshi, boshi + len));
    } else if (turi === 'IEND') {
      break;
    }

    off = boshi + len + 4;
  }

  if (!ihdr) throw new Error('png da IHDR yo\'q');
  if (ihdr.bitDepth !== 8) throw new Error(`png bitDepth=${ihdr.bitDepth} qo'llab-quvvatlanmaydi`);
  if (ihdr.interlace !== 0) throw new Error('png interlace qo\'llab-quvvatlanmaydi');
  const kanal = KANALLAR[ihdr.colorType];
  if (!kanal) throw new Error(`png colorType=${ihdr.colorType} qo'llab-quvvatlanmaydi`);
  if (!idat.length) throw new Error('png da IDAT yo\'q');

  const xom = zlib.inflateSync(Buffer.concat(idat));
  const { width: w, height: h } = ihdr;
  const satrBayt = w * kanal;
  const kutilgan = (satrBayt + 1) * h;
  if (xom.length < kutilgan) throw new Error('png tarkibi kesilgan');

  // Filtrni yechish: har satr oldida bitta filtr bayti turadi.
  const tekis = Buffer.allocUnsafe(satrBayt * h);
  for (let y = 0; y < h; y++) {
    const filtr = xom[y * (satrBayt + 1)];
    const src = (y * (satrBayt + 1)) + 1;
    const dst = y * satrBayt;
    const yuqori = dst - satrBayt;

    for (let i = 0; i < satrBayt; i++) {
      const x = xom[src + i];
      const a = i >= kanal ? tekis[dst + i - kanal] : 0;
      const b = y > 0 ? tekis[yuqori + i] : 0;
      const c = (y > 0 && i >= kanal) ? tekis[yuqori + i - kanal] : 0;
      let v;
      switch (filtr) {
        case 0: v = x; break;
        case 1: v = x + a; break;
        case 2: v = x + b; break;
        case 3: v = x + ((a + b) >> 1); break;
        case 4: v = x + paeth(a, b, c); break;
        default: throw new Error(`png filtr turi ${filtr} noma'lum`);
      }
      tekis[dst + i] = v & 0xff;
    }
  }

  // RGBA ga keltirish
  const data = Buffer.allocUnsafe(w * h * 4);
  for (let p = 0, n = w * h; p < n; p++) {
    const s = p * kanal;
    const d = p * 4;
    switch (ihdr.colorType) {
      case 0: data[d] = data[d + 1] = data[d + 2] = tekis[s]; data[d + 3] = 255; break;
      case 4: data[d] = data[d + 1] = data[d + 2] = tekis[s]; data[d + 3] = tekis[s + 1]; break;
      case 2: data[d] = tekis[s]; data[d + 1] = tekis[s + 1]; data[d + 2] = tekis[s + 2]; data[d + 3] = 255; break;
      default: data[d] = tekis[s]; data[d + 1] = tekis[s + 1]; data[d + 2] = tekis[s + 2]; data[d + 3] = tekis[s + 3];
    }
  }

  return { width: w, height: h, data };
}

// ---- KODLASH ----
// ⚠️ Filtr satr bo'yicha TANLANADI (eng kichik mutlaq yig'indi qoidasi).
// Filtrsiz (`0`) yozish osonroq bo'lardi, lekin fotosuratda hajm ikki-uch
// barobar oshardi — Telegram `sendPhoto` chegarasi esa 10 MB.
function encode({ width, height, data }) {
  if (!Buffer.isBuffer(data) || data.length !== width * height * 4) {
    throw new Error('png kodlash: data o\'lchami mos emas');
  }

  const satrBayt = width * 4;
  const xom = Buffer.allocUnsafe((satrBayt + 1) * height);
  const nomzod = Buffer.allocUnsafe(satrBayt);

  for (let y = 0; y < height; y++) {
    const src = y * satrBayt;
    const yuqori = src - satrBayt;
    let engYaxshi = 0;
    let engKichik = Infinity;
    let saqlangan = null;

    for (let f = 0; f <= 4; f++) {
      let yigindi = 0;
      for (let i = 0; i < satrBayt; i++) {
        const x = data[src + i];
        const a = i >= 4 ? data[src + i - 4] : 0;
        const b = y > 0 ? data[yuqori + i] : 0;
        const c = (y > 0 && i >= 4) ? data[yuqori + i - 4] : 0;
        let v;
        switch (f) {
          case 0: v = x; break;
          case 1: v = x - a; break;
          case 2: v = x - b; break;
          case 3: v = x - ((a + b) >> 1); break;
          default: v = x - paeth(a, b, c);
        }
        v &= 0xff;
        nomzod[i] = v;
        yigindi += v < 128 ? v : 256 - v;
      }
      if (yigindi < engKichik) {
        engKichik = yigindi;
        engYaxshi = f;
        saqlangan = Buffer.from(nomzod);
      }
    }

    xom[y * (satrBayt + 1)] = engYaxshi;
    saqlangan.copy(xom, y * (satrBayt + 1) + 1);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bitDepth
  ihdr[9] = 6;   // colorType: RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  return Buffer.concat([
    SIGNATURE,
    bolak('IHDR', ihdr),
    bolak('IDAT', zlib.deflateSync(xom, { level: 9 })),
    bolak('IEND', Buffer.alloc(0)),
  ]);
}

function bolak(turi, tana) {
  const bosh = Buffer.allocUnsafe(8);
  bosh.writeUInt32BE(tana.length, 0);
  bosh.write(turi, 4, 'ascii');
  const crc = Buffer.allocUnsafe(4);
  crc.writeUInt32BE(crc32(Buffer.concat([bosh.subarray(4), tana])), 0);
  return Buffer.concat([bosh, tana, crc]);
}

// ---- MIQYOSLASH ----
// Maydon (box) usuli: manbadagi bir necha piksel o'rtachasi olinadi.
// Eng yaqin qo'shni (nearest) usuli tezroq, lekin kichraytirishda matnni
// tishlatib yuborardi — bu yerda kichrayadigan narsa aynan MATN.
function resize(img, w, h) {
  if (w === img.width && h === img.height) return img;
  const out = Buffer.allocUnsafe(w * h * 4);
  const xNis = img.width / w;
  const yNis = img.height / h;

  for (let y = 0; y < h; y++) {
    const y0 = Math.floor(y * yNis);
    const y1 = Math.max(y0 + 1, Math.min(img.height, Math.ceil((y + 1) * yNis)));
    for (let x = 0; x < w; x++) {
      const x0 = Math.floor(x * xNis);
      const x1 = Math.max(x0 + 1, Math.min(img.width, Math.ceil((x + 1) * xNis)));
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const s = (sy * img.width + sx) * 4;
          const al = img.data[s + 3];
          // Alfa bilan OLDINDAN ko'paytirib o'rtachalanadi: aks holda to'liq
          // shaffof pikselning rangi ham hisobga qo'shilib, chekkalarda
          // "arvoh" hoshiya paydo bo'lardi.
          r += img.data[s] * al;
          g += img.data[s + 1] * al;
          b += img.data[s + 2] * al;
          a += al;
          n++;
        }
      }
      const d = (y * w + x) * 4;
      if (a === 0) {
        out[d] = out[d + 1] = out[d + 2] = out[d + 3] = 0;
      } else {
        out[d] = Math.round(r / a);
        out[d + 1] = Math.round(g / a);
        out[d + 2] = Math.round(b / a);
        out[d + 3] = Math.round(a / n);
      }
    }
  }

  return { width: w, height: h, data: out };
}

module.exports = { decode, encode, resize, crc32 };
