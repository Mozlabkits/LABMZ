```javascript
"use strict";

/* =========================================================
   LABMZ — SERVICE WORKER
   Versão 6
   Atualização rápida + funcionamento offline
   ========================================================= */

const CACHE_NAME = "LABMZ-v6";

const BASE_PATH = "/LABMZ/";


/* =========================================================
   RECURSOS ESSENCIAIS
   ========================================================= */

const RECURSOS_ESSENCIAIS = [
    BASE_PATH,
    BASE_PATH + "index.html",
    BASE_PATH + "style.css",
    BASE_PATH + "app.js",
    BASE_PATH + "manifest.json"
];


/* =========================================================
   INSTALAÇÃO
   ========================================================= */

self.addEventListener("install", function (event) {

    console.log(
        "[LABMZ] Instalando Service Worker:",
        CACHE_NAME
    );

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(function (cache) {

                return Promise.all(

                    RECURSOS_ESSENCIAIS.map(function (url) {

                        return fetch(
                            new Request(url, {
                                cache: "no-store"
                            })
                        )

                        .then(function (response) {

                            if (
                                !response ||
                                response.status !== 200
                            ) {

                                throw new Error(
                                    "Falha ao carregar: " + url
                                );

                            }

                            return cache.put(url, response);

                        });

                    })

                );

            })

            .then(function () {

                console.log(
                    "[LABMZ] Recursos essenciais atualizados."
                );

                return self.skipWaiting();

            })

    );

});


/* =========================================================
   ATIVAÇÃO
   ========================================================= */

self.addEventListener("activate", function (event) {

    console.log(
        "[LABMZ] Ativando Service Worker:",
        CACHE_NAME
    );

    event.waitUntil(

        caches.keys()

            .then(function (cacheNames) {

                return Promise.all(

                    cacheNames.map(function (cacheName) {

                        if (
                            cacheName.startsWith("LABMZ-") &&
                            cacheName !== CACHE_NAME
                        ) {

                            console.log(
                                "[LABMZ] Eliminando cache antigo:",
                                cacheName
                            );

                            return caches.delete(cacheName);

                        }

                        return Promise.resolve();

                    })

                );

            })

            .then(function () {

                console.log(
                    "[LABMZ] Cache antigo eliminado."
                );

                return self.clients.claim();

            })

    );

});


/* =========================================================
   FUNÇÃO — ATUALIZAR CACHE
   ========================================================= */

function atualizarCache(request, response) {

    if (
        !response ||
        response.status !== 200 ||
        response.type === "opaque"
    ) {

        return;

    }

    caches.open(CACHE_NAME)

        .then(function (cache) {

            cache.put(
                request,
                response.clone()
            );

        });

}


/* =========================================================
   REQUISIÇÕES
   ========================================================= */

self.addEventListener("fetch", function (event) {

    if (event.request.method !== "GET") {

        return;

    }


    const url = new URL(event.request.url);


    /*
     * Apenas recursos do próprio LABMZ.
     */

    if (url.origin !== self.location.origin) {

        return;

    }


    /* =====================================================
       HTML
       NETWORK FIRST
       ===================================================== */

    if (
        event.request.mode === "navigate" ||
        event.request.destination === "document"
    ) {

        event.respondWith(

            fetch(
                new Request(event.request, {
                    cache: "no-store"
                })
            )

            .then(function (networkResponse) {

                atualizarCache(
                    event.request,
                    networkResponse
                );

                return networkResponse;

            })

            .catch(function () {

                return caches.match(
                    event.request
                )

                .then(function (cachedResponse) {

                    if (cachedResponse) {

                        return cachedResponse;

                    }

                    return caches.match(
                        BASE_PATH + "index.html"
                    );

                });

            })

        );

        return;

    }


    /* =====================================================
       CSS / JAVASCRIPT / MANIFEST
       NETWORK FIRST
       ===================================================== */

    if (
        event.request.destination === "style" ||
        event.request.destination === "script" ||
        event.request.destination === "manifest"
    ) {

        event.respondWith(

            fetch(
                new Request(event.request, {
                    cache: "no-store"
                })
            )

            .then(function (networkResponse) {

                atualizarCache(
                    event.request,
                    networkResponse
                );

                return networkResponse;

            })

            .catch(function () {

                return caches.match(
                    event.request
                );

            })

        );

        return;

    }


    /* =====================================================
       IMAGENS / OUTROS RECURSOS
       CACHE FIRST + ATUALIZAÇÃO
       ===================================================== */

    event.respondWith(

        caches.match(event.request)

            .then(function (cachedResponse) {

                const networkRequest = fetch(
                    event.request
                )

                .then(function (networkResponse) {

                    atualizarCache(
                        event.request,
                        networkResponse
                    );

                    return networkResponse;

                })

                .catch(function () {

                    return cachedResponse;

                });


                /*
                 * Se existir cache:
                 * entrega imediatamente.
                 */

                if (cachedResponse) {

                    return cachedResponse;

                }


                /*
                 * Se não existir cache:
                 * utiliza a rede.
                 */

                return networkRequest;

            })

            .catch(function () {

                return new Response(

                    "LABMZ — Recurso temporariamente indisponível.",

                    {
                        status: 503,
                        statusText: "Offline",
                        headers: {
                            "Content-Type":
                                "text/plain; charset=utf-8"
                        }
                    }

                );

            })

    );

});


/* =========================================================
   MENSAGEM DE ATUALIZAÇÃO
   ========================================================= */

self.addEventListener("message", function (event) {

    if (!event.data) {

        return;

    }


    if (event.data === "ATUALIZAR_LABMZ") {

        console.log(
            "[LABMZ] Pedido manual de atualização recebido."
        );

        self.skipWaiting();

    }

});


/* =========================================================
   FIM
   ========================================================= */

console.log(
    "[LABMZ] Service Worker carregado:",
    CACHE_NAME
);
```
