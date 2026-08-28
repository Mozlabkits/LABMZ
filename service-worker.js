const CACHE_NAME = "LABMZ-v4";

/* =====================================================
   INSTALAÇÃO
===================================================== */

self.addEventListener("install", function (event) {

    event.waitUntil(

        caches.open(CACHE_NAME).then(function (cache) {

            return cache.addAll([

                "/LABMZ/",
                "/LABMZ/index.html",
                "/LABMZ/style.css",
                "/LABMZ/app.js",
                "/LABMZ/manifest.json"

            ]);

        })

    );

    self.skipWaiting();

});


/* =====================================================
   ATIVAÇÃO
===================================================== */

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


/* =====================================================
   REQUISIÇÕES
===================================================== */

self.addEventListener("fetch", function (event) {

    if (event.request.method !== "GET") {

        return;

    }


    event.respondWith(

        caches.match(event.request).then(function (cachedResponse) {

            if (cachedResponse) {

                return cachedResponse;

            }


            return fetch(event.request)

                .then(function (networkResponse) {

                    /* -------------------------------------
                       GUARDAR RECURSOS DO LABMZ NO CACHE
                    ------------------------------------- */

                    if (

                        networkResponse &&

                        networkResponse.status === 200 &&

                        new URL(event.request.url).origin ===
                        self.location.origin

                    ) {

                        const responseClone =
                            networkResponse.clone();

                        caches.open(CACHE_NAME).then(function (cache) {

                            cache.put(
                                event.request,
                                responseClone
                            );

                        });

                    }


                    return networkResponse;

                })

                .catch(function () {

                    /* -------------------------------------
                       SE ESTIVER OFFLINE
                    ------------------------------------- */

                    return caches.match(
                        "/LABMZ/index.html"
                    );

                });

        })

    );

});
