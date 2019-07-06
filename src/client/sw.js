
workbox.core.skipWaiting();
workbox.core.clientsClaim();

const noCorsPlugin = {
    requestWillFetch: ({event, request}) => {
        return new Request(request, {mode: 'no-cors'});
    }
};

self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {
    ignoreURLParametersMatching: [
        /^utm_/i
    ]
});

workbox.routing.registerNavigationRoute('index.html', {}); // always serve index, just like when the internet is live

workbox.routing.registerRoute(
    /^http:\/\/localhost(:[0-9]+)?\/browser-sync\//i,
    new workbox.strategies.NetworkOnly(),
    'GET'
);

workbox.routing.registerRoute(
    /\/(admin\/)?api\//i,
    new workbox.strategies.NetworkFirst({ 
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
    new workbox.strategies.NetworkFirst({ 
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
    /\/assets\//i, 
    new workbox.strategies.StaleWhileRevalidate({ 
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

workbox.routing.registerRoute(
    /\/fonts\//i, 
    new workbox.strategies.StaleWhileRevalidate({ 
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

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
workbox.routing.registerRoute(
    /^https:\/\/fonts\.googleapis\.com/i,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
    })
);

// Cache the underlying font files with a cache-first strategy for 1 year.
workbox.routing.registerRoute(
/^https:\/\/fonts\.gstatic\.com/i,
    new workbox.strategies.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200],
            }),
            new workbox.expiration.Plugin({
                maxAgeSeconds: 60 * 60 * 24 * 365,
                maxEntries: 30,
            }),
        ],
    })
);


// Catch-all for GETs to external resources to not make CORS requests
workbox.routing.registerRoute(
    /^http.*/i,
    new workbox.strategies.NetworkOnly({
        plugins: [
            noCorsPlugin
        ],
    }),
    'GET'
);

// This "catch" handler is triggered when any of the other routes throw an error
workbox.routing.setCatchHandler(({url, event, params}) => {
    const request = event.request;

    switch (request.destination) {
        case 'document':
            return caches.match('index.html');
        case 'image':
            return caches.match('assets/images/empty.png');
        default:
            return Response.error();
    }
});
