// ===== Among Bomb — Service Worker =====
// YENİ SÜRÜM YAYINLARKEN TEK YAPMAN GEREKEN: aşağıdaki CACHE_VERSION'ı değiştir (v1 -> v2 -> v3 ...)
// ve bu sw.js dosyasını oyun dosyalarıyla birlikte sunucuya tekrar yükle.
// Oyuncunun hiçbir şey yapmasına gerek yok — bir sonraki açılışta otomatik güncellenir.
const CACHE_VERSION = 'v1';
const CACHE_NAME = 'among-bomb-' + CACHE_VERSION;

// Offline'da da açılabilsin diye önbelleğe alınacak temel dosyalar.
// Dosya adların farklıysa burayı kendine göre düzenle.
const CORE_ASSETS = [
  './',
  './Among_Bomb-10-1.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

// Kurulum: yeni sürüm, eski sekmelerin kapanmasını beklemeden hemen devreye girsin
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch(() => {}) // offline ilk kurulumda hata verirse sessizce geç
  );
});

// Aktivasyon: önceki sürümlerin önbelleğini temizle, açık sekmeleri hemen yeni SW'ye bağla
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((n) => n.startsWith('among-bomb-') && n !== CACHE_NAME)
          .map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

// Ağ öncelikli: internet varsa HER ZAMAN sunucudaki en güncel dosyayı getir ve önbelleği tazele.
// Sadece bağlantı yoksa (offline) en son önbelleğe alınmış sürümü göster.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
