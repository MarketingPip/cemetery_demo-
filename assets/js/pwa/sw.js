/**
 * JFA PWA Toolkit
 * https://github.com/jfadev/jfa-pwa-toolkit
 * license that can be found in the LICENSE file.
 *
 * @author Jordi Fernandes Alves <jfadev@gmail.com>
 * @version 0.1
 */

// Main Service Worker:
// --------------------
try{
// Import Workbox lib (https://developers.google.com/web/tools/workbox/)
importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js");

if (workbox) {
    // Workbox configs
    workbox.core.setCacheNameDetails({
        prefix: PWA_CONFIG.app.name,
        suffix: PWA_CONFIG.app.version
    });

    // Import PreCache Service Worker
    if (PWA_CONFIG.precache.active) {
        importScripts(PWA_ROOT + '/sw/precache-sw.js');
    }

    // Import Cache Images Service Worker
    if (PWA_CONFIG.cache.images.active) {
        importScripts(PWA_ROOT + '/sw/cache-images-sw.js');
    }

    // Import Cache Statics (js, css, json) Service Worker
    if (PWA_CONFIG.cache.statics.active) {
        importScripts(PWA_ROOT + '/sw/cache-statics-sw.js');
    }

    // Import Cache Fonts Service Worker
    if (PWA_CONFIG.cache.fonts.active) {
        importScripts(PWA_ROOT + '/sw/cache-fonts-sw.js');
    }

    // Import Cache Routes Network Only Service Worker
    if (PWA_CONFIG.cache.routes.networkonly.active) {
        importScripts(PWA_ROOT + '/sw/cache-routes-networkonly-sw.js');
    }

    // Import Cache Routes Stale While Revalidate Service Worker
    if (PWA_CONFIG.cache.routes.stalewhilerevalidate.active) {
        importScripts(PWA_ROOT + '/sw/cache-routes-stalewhilerevalidate-sw.js');
    }

    // Import Cache Routes Network First Service Worker
    if (PWA_CONFIG.cache.routes.networkfirst.active) {
        importScripts(PWA_ROOT + '/sw/cache-routes-networkfirst-sw.js');
    }

    // Import Cache Routes Cache First Service Worker
    if (PWA_CONFIG.cache.routes.cachefirst.active) {
        importScripts(PWA_ROOT + '/sw/cache-routes-cachefirst-sw.js');
    }

    // Import Cache Routes Cache Only Service Worker
    if (PWA_CONFIG.cache.routes.cacheonly.active) {
        importScripts(PWA_ROOT + '/sw/cache-routes-cacheonly-sw.js');
    }

    // Import Cache Custom Script Service Worker
    if (PWA_CONFIG.cache.custom.active) {
        importScripts(PWA_CONFIG.cache.custom.script);
    }



 const CACHE = "pwabuilder-page";


const offlineFallbackPage = PWA_CONFIG.sw.offline_route;

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(offlineFallbackPage))
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {

        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});

    
} else {
    console.error('PWA: Workbox didn\'t load.');
}

// Import Push Service Worker
if (PWA_CONFIG.push.active) {
    importScripts(PWA_ROOT + '/sw/push-sw.js');
}

// Import Notificationclick Service Worker
if (PWA_CONFIG.push.notification.notificationclick.active) {
    importScripts(PWA_ROOT + '/sw/notificationclick-sw.js');
}
}catch(err){
console.log(err.message);
}
