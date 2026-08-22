/* =========================================================
   LABMZ — SERVICE WORKER
   Laboratório de Aprendizagem de Biologia e Química
   de Moçambique

   Versão: 4.0
========================================================= */

"use strict";


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const CACHE_NAME = "labmz-v4";

const BASE_PATH = "/LABMZ/";


/* =========================================================
   ARQUIVOS ESSENCIAIS DO LABMZ
========================================================= */

const CORE_FILES = [
    `${BASE_PATH}`,
    `${BASE_PATH}index.html`,
    `${BASE_PATH}style.css`,
    `${BASE_PATH}app.js`,
    `${BASE_PATH}manifest.json`,
    `${BASE_PATH}service-worker.js`,
    `${BASE_PATH}icons/icon-192.png`,
    `${BASE_PATH}icons/icon-512.png`
];


/* =========================================================
   INSTALAÇÃO
========================================================= */

self.addEventListener("install", function (event) {

    console.log("[LABMZ] Instalando Service Worker v4...");

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(function (cache) {

                console.log(
                    "[LABMZ] Guardando arquivos essenciais..."
                );

                return cache.addAll(CORE_FILES);

            })

    );

    /*
     * Ativa imediatamente a nova versão.
     */

    self.skipWaiting();

});


/* =========================================================
   ATIVAÇÃO
========================================================= */

self.addEventListener("activate", function (event) {

    console.log("[LABMZ] Ativando Service Worker v4...");

    event.waitUntil(

        caches.keys()

            .then(function (cacheNames) {

                return Promise.all(

                    cacheNames.map(function (cacheName) {

                        /*
                         * Remove caches antigos do LABMZ.
                         */

                        if (
                            cacheName.startsWith("labmz-") &&
                            cacheName !== CACHE_NAME
                        ) {

                            console.log(
                                "[LABMZ] Removendo cache antigo:",
                                cacheName
                            );

                            return caches.delete(cacheName);
                        }

                        return Promise.resolve();

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


/* =========================================================
   INTERCEPTAÇÃO DAS REQUISIÇÕES
========================================================= */

self.addEventListener("fetch", function (event) {

    /*
     * Trabalhar apenas com requisições GET.
     */

    if (event.request.method !== "GET") {
        return;
    }


    /*
     * Identificar a URL solicitada.
     */

    const requestURL = new URL(event.request.url);


    /*
     * Ignorar recursos de outros domínios.
     */

    if (requestURL.origin !== self.location.origin) {
        return;
    }


    event.respondWith(

        caches.match(event.request)

            .then(function (cachedResponse) {

                /*
                 * Se estiver no cache,
                 * entregar imediatamente.
                 */

                if (cachedResponse) {

                    return cachedResponse;
                }


                /*
                 * Se não estiver no cache,
                 * procurar na Internet.
                 */

                return fetch(event.request)

                    .then(function (networkResponse) {

                        /*
                         * Verificar se a resposta é válida.
                         */

                        if (
                            !networkResponse ||
                            networkResponse.status !== 200 ||
                            networkResponse.type === "opaque"
                        ) {

                            return networkResponse;
                        }


                        /*
                         * Fazer uma cópia para o cache.
                         */

                        const responseClone =
                            networkResponse.clone();


                        caches.open(CACHE_NAME)

                            .then(function (cache) {

                                cache.put(
                                    event.request,
                                    responseClone
                                );

                            });


                        return networkResponse;

                    })

                    .catch(function () {

                        /*
                         * Se estiver offline e for uma
                         * navegação, mostrar o index.html.
                         */

                        if (
                            event.request.mode === "navigate"
                        ) {

                            return caches.match(
                                `${BASE_PATH}index.html`
                            );

                        }


                        /*
                         * Para outros recursos,
                         * retornar erro 503.
                         */

                        return new Response(
                            "",
                            {
                                status: 503,
                                statusText: "LABMZ Offline"
                            }
                        );

                    });

            })

    );

});


/* =========================================================
   MENSAGEM PARA FORÇAR ATUALIZAÇÃO
========================================================= */

self.addEventListener("message", function (event) {

    if (
        event.data &&
        event.data.action === "SKIP_WAITING"
    ) {

        self.skipWaiting();

    }

});


/* =========================================================
   FIM DO SERVICE WORKER
========================================================= */
