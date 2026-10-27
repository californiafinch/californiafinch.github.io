/* 敬言馆主 Service Worker：静态资源缓存优先，页面网络优先 */
const CACHE_NAME = 'jingyan-2026-10-27';
const PRECACHE = ['/', '/css/app.css', '/js/app.js'];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE).catch(function () {});
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // 只接管本站请求，第三方资源（图床、CDN、音乐）交回浏览器
  if (url.origin !== location.origin) return;

  const isHTML = request.mode === 'navigate';

  if (isHTML) {
    // 页面：网络优先，离线时回退缓存
    event.respondWith(
      fetch(request).then(function (response) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(request, copy); });
        return response;
      }).catch(function () {
        return caches.match(request).then(function (hit) {
          return hit || caches.match('/');
        });
      })
    );
    return;
  }

  // 静态资源：缓存优先，命中后后台更新
  event.respondWith(
    caches.match(request).then(function (hit) {
      if (hit) {
        fetch(request).then(function (response) {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(request, copy); });
          }
        }).catch(function () {});
        return hit;
      }
      return fetch(request).then(function (response) {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(request, copy); });
        }
        return response;
      });
    })
  );
});
