/* 注册 Service Worker（含版本号，便于更新缓存） */
(function () {
  if (!('serviceWorker' in navigator)) return;
  var VERSION = '2026-10-27';
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js?v=' + VERSION).then(function (reg) {
      if (reg.update) reg.update();
    }).catch(function () {});
  });
})();
