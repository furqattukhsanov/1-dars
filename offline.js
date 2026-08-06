/* LolaMarket landing — offline sahifa xatti-harakati.
   Ilgari bu kod `offline.html` ichida inline turardi (skript bloki + tugmada
   `onclick`). CSP dan `'unsafe-inline'` olinganda ikkalasi ham jimgina
   o'lardi: tugma bosilmasdi, aloqa tiklanganda sahifa yangilanmasdi.
   ⚠️ Fayl `sw.js` dagi PRECACHE ro'yxatida turishi SHART — aks holda u
   aynan kerak bo'lgan paytda, ya'ni offline holatda, yuklanmaydi.
   ⚠️ Bu faylga `?v=` QO'YILMAYDI: `sw.js` keshdan `ignoreSearch`siz qidiradi,
   versiya qo'shilsa so'rov keshdagi yozuvga mos kelmay qolardi. */

document.getElementById('retry').addEventListener('click', function () {
  location.reload();
});

// Internet qaytishi bilan avtomatik qayta yuklaymiz.
addEventListener('online', function () {
  document.getElementById('hint').hidden = false;
  location.reload();
});
