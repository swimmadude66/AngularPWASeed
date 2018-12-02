workbox.skipWaiting();
workbox.clientsClaim();

var apiSync = new workbox.backgroundSync.Plugin('api_queue', {
    maxRetentionTime: 24 * 60 // Retry for max of 24 Hours
});


workbox.routing.registerRoute(
    /\/api\//i,
    workbox.strategies.networkOnly({
        plugins: [
            apiSync,
            new workbox.expiration.Plugin({
                maxAgeSeconds: 86400,
                purgeOnQuotaError: true // don't use up storage we need elsewhere
            })
        ]
    }),
    'POST'
);

workbox.routing.registerRoute(
    /index\.html$/i,
    workbox.strategies.networkFirst({ 
        networkTimeoutSeconds: 5, 
        cacheName: 'index-cache',
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [200],
            }),
            new workbox.expiration.Plugin({
                maxEntries: 1, // THERE CAN BE ONLY ONE
                purgeOnQuotaError: false // we need this
            })
        ]
    }), 
    'GET'
);

workbox.routing.registerRoute(
    /\/api\/.+/i, 
    workbox.strategies.networkFirst({ 
        networkTimeoutSeconds: 5, 
        cacheName: 'api-cache',
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [200]
            }),
        ]
    }), 
    'GET'
);

workbox.routing.registerRoute(
    /\/[0-9]+\..*?\.min\.js$/i, 
    workbox.strategies.networkFirst({ 
        networkTimeoutSeconds: 5, 
        cacheName: 'bundle-cache',
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [200]
            }),
            new workbox.expiration.Plugin({
                maxAgeSeconds: 86400,
                purgeOnQuotaError: true // Will refetch on page load
            })
        ]
    }), 
    'GET'
);

workbox.routing.registerRoute(
    /^.*font.*\.((svg)|(woff(2?))|(eot)|(ttf))$/i, 
    workbox.strategies.staleWhileRevalidate({ 
        cacheName: 'font-cache', 
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [200],
            }),
            new workbox.expiration.Plugin({
                maxAgeSeconds: 86400,
                purgeOnQuotaError: true // they are fonts, get rid of them for more important stuff
            })
        ] 
    }), 
    'GET'
);

workbox.routing.registerRoute(
    /^.*\/app\/.*\.((ico)|(jpg)|(png)|(svg))$/i, 
    workbox.strategies.staleWhileRevalidate({ 
        cacheName: 'asset-cache', 
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [200],
            }),
            new workbox.expiration.Plugin({
                maxAgeSeconds: 86400,
                purgeOnQuotaError: true // they are images, get rid of them for more important stuff
            })
        ] 
    }), 
    'GET'
);

workbox.routing.registerNavigationRoute('/index.html'); // always serve index, just like when the internet is live

self.addEventListener('fetch', function() {}); // empty fetch so google will prompt for install

self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
