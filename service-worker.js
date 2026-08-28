const CACHE_NAME = "LABMZ-v3";

const APP_SHELL = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json"
];

/* INSTALAÇÃO */
self.addEventListener("install", function (event) {

    event.waitUntil(

        caches.open(CACHE_NAME).then(function (cache) {

            return cache.addAll(APP_SHELL);

        })

    );

    self.skipWaiting();

});


/* ATIVAÇÃO */
self.addEventListener("activate", function (event) {

    event.waitUntil(

        caches.keys().then(function (cacheNames) {

            return Promise.all(

                cacheNames.map(function (cacheName) {

                    if (cacheName !== CACHE_NAME) {

                        return caches.delete(cacheName);

                    }

                })

            );

        })

    );

    self.clients.claim();

});


/* FUNCIONAMENTO OFFLINE */
self.addEventListener("fetch", function (event) {

    if (event.request.method !== "GET") {

        return;

    }

    event.respondWith(

        caches.match(event.request).then(function (cachedResponse) {

            if (cachedResponse) {

                return cachedResponse;

            }

            return fetch(event.request).then(function (networkResponse) {

                return networkResponse;

            }).catch(function () {

                return caches.match("./index.html");

            });

        })

    );

});
