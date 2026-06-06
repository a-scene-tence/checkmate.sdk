const CACHE_NAME = 'checkmate-v8';

// 반드시 존재해야 하는 핵심 자산 (실패 시 설치 중단)
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './favicon.png'
];

// 있으면 캐시, 없어도 설치 계속 (선택적 자산)
const OPTIONAL_ASSETS = [
  './apple-touch-icon.png'
];

// 설치: 핵심 자산 캐시
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // 핵심 자산 먼저 (실패 시 설치 중단)
      return cache.addAll(CORE_ASSETS).then(() => {
        // 선택적 자산 (실패해도 설치 계속)
        return Promise.allSettled(
          OPTIONAL_ASSETS.map(url => cache.add(url).catch(() => {}))
        );
      });
    }).then(() => self.skipWaiting())
  );
});

// 활성화: 이전 캐시 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: 네트워크 우선, 실패 시 캐시 fallback
self.addEventListener('fetch', e => {
  // 외부 CDN 요청은 네트워크 우선
  if (!e.request.url.startsWith(self.location.origin)) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    fetch(e.request).then(response => {
      // 네트워크 성공 → 캐시 업데이트 후 반환
      if (response && response.status === 200 && response.type !== 'opaque') {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      }
      return response;
    }).catch(() => {
      // 오프라인 → 캐시에서 반환
      return caches.match(e.request);
    })
  );
});
