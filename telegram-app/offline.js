/* LolaMarket Mini App — offline sahifa xatti-harakati.
   Ilgari bu kod `offline.html` ichida inline turardi (skript bloki + tugmada
   `onclick`). CSP dan `'unsafe-inline'` olinganda ikkalasi ham jimgina
   o'lardi: tugma bosilmasdi, aloqa tiklanganda sahifa yangilanmasdi.
   ⚠️ Fayl `sw.js` dagi PRECACHE ro'yxatida turishi SHART — aks holda u
   aynan kerak bo'lgan paytda, ya'ni offline holatda, yuklanmaydi. */

document.getElementById('retry').addEventListener('click', function () {
  location.reload();
});

// Internet qaytishi bilan avtomatik qayta yuklaymiz.
addEventListener('online', function () {
  document.getElementById('hint').hidden = false;
  location.reload();
});
