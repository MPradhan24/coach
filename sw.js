// Offline support. App files: serve from cache, refresh in the background
// (so a new deploy shows up on the next launch). Images: cache-first.
// Bump VERSION when the file list changes.
const VERSION = 'v1';
const SHELL = `coach-shell-${VERSION}`;
const IMAGES = 'coach-img-v1';

const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'icons/icon-192.png', 'icons/icon-512.png',
  'js/app.js', 'js/lib/util.js', 'js/lib/store.js', 'js/lib/schedule.js', 'js/lib/streaks.js',
  'js/lib/progression.js', 'js/lib/targets.js', 'js/lib/timer.js', 'js/lib/milestones.js',
  'js/data/exercises.js', 'js/data/program.js', 'js/data/quotes.js', 'js/data/food.js',
  'js/ui/common.js', 'js/ui/onboarding.js', 'js/ui/today.js', 'js/ui/workout.js', 'js/ui/plan.js',
  'js/ui/food.js', 'js/ui/progress.js', 'js/ui/settings.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== IMAGES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  if (url.pathname.includes('/img/')) {
    e.respondWith(caches.open(IMAGES).then(async (c) => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok) c.put(e.request, res.clone());
      return res;
    }));
    return;
  }

  e.respondWith(caches.open(SHELL).then(async (c) => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then((res) => { if (res.ok) c.put(e.request, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || Response.error();
  }));
});
