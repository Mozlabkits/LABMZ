```javascript
"use strict";

/* =====================================================
   LABMZ — SERVICE WORKER
   Versão 5
===================================================== */

const CACHE_NAME = "LABMZ-v5";


/* =====================================================
   CAMINHO BASE DO LABMZ
===================================================== */

const BASE_PATH = new URL(
    "./",
    self.location
).pathname;


/* =====================================================
   INSTALAÇÃO
===================================================== */

self.addEventListener("install", function (event) {

    event.waitUntil(

        caches.open(CACHE_NAME).then(function (cache) {

            return cache.addAll([

                BASE_PATH,
                BASE_PATH + "index.html",
                BASE_PATH + "style.css",
                BASE_PATH + "app.js",
                BASE_PATH + "manifest.json"

            ]);

        })

    );

    /*
     * Faz o novo Service Worker assumir
     * imediatamente.
     */

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

                        return caches.delete(
                            cacheName
                        );

                    }

                    return null;

                })

            );

        })

    );

    /*
     * Assume imediatamente o controle
     * das páginas abertas.
     */

    self.clients.claim();

});


/* =====================================================
   REQUISIÇÕES
===================================================== */

self.addEventListener("fetch", function (event) {

    /*
     * Trabalhar apenas com pedidos GET.
     */

    if (event.request.method !== "GET") {

        return;

    }


    event.respondWith(

        caches.match(
            event.request
        ).then(function (cachedResponse) {

            /*
             * Se já estiver no cache,
             * utilizar a versão armazenada.
             */

            if (cachedResponse) {

                return cachedResponse;

            }


            /*
             * Caso contrário, buscar na rede.
             */

            return fetch(
                event.request
            )

            .then(function (networkResponse) {

                /*
                 * Guardar apenas respostas válidas
                 * do próprio LABMZ.
                 */

                if (

                    networkResponse &&

                    networkResponse.status === 200 &&

                    new URL(
                        event.request.url
                    ).origin === self.location.origin

                ) {

                    const responseClone =
                        networkResponse.clone();


                    caches.open(
                        CACHE_NAME
                    ).then(function (cache) {

                        cache.put(
                            event.request,
                            responseClone
                        );

                    });

                }


                return networkResponse;

            })

            .catch(function () {

                /*
                 * Se estiver offline, tentar
                 * entregar a página inicial.
                 */

                return caches.match(
                    BASE_PATH + "index.html"
                );

            });

        })

    );

});
```
