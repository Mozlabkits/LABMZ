```javascript
"use strict";

/* =========================================================
   LABMZ — SERVICE WORKER
   Versão 5
   Sistema de atualização e cache estabilizado
   ========================================================= */

const CACHE_NAME = "LABMZ-v5";

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

    console.log("[LABMZ] Instalando Service Worker:", CACHE_NAME);

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(function (cache) {

                return cache.addAll(RECURSOS_ESSENCIAIS);

            })

            .then(function () {

                /*
                 * Ativa imediatamente a nova versão.
                 */

                return self.skipWaiting();

            })

    );

});


/* =========================================================
   ATIVAÇÃO
   ========================================================= */

self.addEventListener("activate", function (event) {

    console.log("[LABMZ] Ativando Service Worker:", CACHE_NAME);

    event.waitUntil(

        caches.keys()

            .then(function (cacheNames) {

                return Promise.all(

                    cacheNames.map(function (cacheName) {

                        /*
                         * Remove versões antigas do LABMZ.
                         */

                        if (
                            cacheName.startsWith("LABMZ-") &&
                            cacheName !== CACHE_NAME
                        ) {

                            console.log(
                                "[LABMZ] Removendo cache antigo:",
                                cacheName
                            );

                            return caches.delete(cacheName);

                        }

                    })

                );

            })

            .then(function () {

                /*
                 * Assume o controlo das páginas abertas.
                 */

                return self.clients.claim();

            })

    );

});


/* =========================================================
   REQUISIÇÕES
   ========================================================= */

self.addEventListener("fetch", function (event) {

    /*
     * Trabalhamos apenas com pedidos GET.
     */

    if (event.request.method !== "GET") {

        return;

    }


    /*
     * Apenas recursos do próprio LABMZ.
     */

    const url = new URL(event.request.url);


    if (url.origin !== self.location.origin) {

        return;

    }


    /* =====================================================
       PÁGINAS HTML
       NETWORK FIRST
       ===================================================== */

    if (
        event.request.mode === "navigate" ||
        event.request.destination === "document"
    ) {

        event.respondWith(

            fetch(event.request)

                .then(function (networkResponse) {

                    /*
                     * Guarda a versão mais recente da página.
                     */

                    if (
                        networkResponse &&
                        networkResponse.status === 200
                    ) {

                        const responseClone =
                            networkResponse.clone();

                        caches.open(CACHE_NAME)

                            .then(function (cache) {

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
                     * Sem Internet:
                     * utiliza a versão armazenada.
                     */

                    return caches.match(event.request)

                        .then(function (cachedResponse) {

                            if (cachedResponse) {

                                return cachedResponse;

                            }


                            /*
                             * Se a página não estiver no cache,
                             * tenta abrir a página inicial.
                             */

                            return caches.match(
                                BASE_PATH + "index.html"
                            );

                        });

                })

        );

        return;

    }


    /* =====================================================
       CSS / JS / IMAGENS / MANIFEST
       CACHE + ATUALIZAÇÃO DA REDE
       ===================================================== */

    event.respondWith(

        caches.match(event.request)

            .then(function (cachedResponse) {

                const networkRequest = fetch(event.request)

                    .then(function (networkResponse) {

                        if (
                            networkResponse &&
                            networkResponse.status === 200
                        ) {

                            const responseClone =
                                networkResponse.clone();

                            caches.open(CACHE_NAME)

                                .then(function (cache) {

                                    cache.put(
                                        event.request,
                                        responseClone
                                    );

                                });

                        }


                        return networkResponse;

                    });


                /*
                 * Se houver cache, entrega imediatamente.
                 * A rede atualiza o cache em segundo plano.
                 */

                if (cachedResponse) {

                    return cachedResponse;

                }


                /*
                 * Se não houver cache, espera pela rede.
                 */

                return networkRequest;

            })

            .catch(function () {

                /*
                 * Se não houver Internet nem cache,
                 * devolve uma resposta simples.
                 */

                return new Response(

                    "LABMZ — Recurso temporariamente indisponível.",

                    {
                        status: 503,
                        statusText: "Offline",
                        headers: {
                            "Content-Type": "text/plain; charset=utf-8"
                        }
                    }

                );

            })

    );

});


/* =========================================================
   MENSAGEM PARA ATUALIZAÇÃO
   ========================================================= */

self.addEventListener("message", function (event) {

    if (!event.data) {

        return;

    }


    if (event.data === "ATUALIZAR_LABMZ") {

        self.skipWaiting();

    }

});


/* =========================================================
   FIM DO SERVICE WORKER
   ========================================================= */

console.log(
    "[LABMZ] Service Worker carregado:",
    CACHE_NAME
);
```
