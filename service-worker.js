/* =========================================================
   LABMZ — SERVICE WORKER
   Laboratório de Aprendizagem de Biologia e Química
   de Moçambique

   Versão: 5.0
========================================================= */

"use strict";


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const CACHE_NAME = "labmz-v5";

const BASE_PATH = "/LABMZ/";


/* =========================================================
   ARQUIVOS PRINCIPAIS
========================================================= */

const CORE_FILES = [
    `${BASE_PATH}`,
    `${BASE_PATH}index.html`,
    `${BASE_PATH}style.css`,
    `${BASE_PATH}app.js`,
    `${BASE_PATH}manifest.json`
];


/* =========================================================
   INSTALAÇÃO
========================================================= */

self.addEventListener("install", function (event) {

    console.log(
        "[LABMZ] Instalando Service Worker v5..."
    );

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(function (cache) {

                console.log(
                    "[LABMZ] Guardando arquivos principais..."
                );

                /*
                 * Adiciona os arquivos um por um.
                 *
                 * Se algum arquivo não existir,
                 * isso não impede a instalação
                 * completa do Service Worker.
                 */

                return Promise.all(

                    CORE_FILES.map(function (file) {

                        return cache.add(file)

                            .then(function () {

                                console.log(
                                    "[LABMZ] Arquivo armazenado:",
                                    file
                                );

                            })

                            .catch(function (error) {

                                console.warn(
                                    "[LABMZ] Não foi possível armazenar:",
                                    file,
                                    error
                                );

                            });

                    })

                );

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

    console.log(
        "[LABMZ] Ativando Service Worker v5..."
    );

    event.waitUntil(

        caches.keys()

            .then(function (cacheNames) {

                return Promise.all(

                    cacheNames.map(function (cacheName) {

                        if (
                            cacheName.startsWith("labmz-") &&
                            cacheName !== CACHE_NAME
                        ) {

                            console.log(
                                "[LABMZ] Removendo cache antigo:",
                                cacheName
                            );

                            return caches.delete(
                                cacheName
                            );

                        }

                        return Promise.resolve();

                    })

                );

            })

            .then(function () {

                console.log(
                    "[LABMZ] Service Worker v5 ativo."
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
     * Trabalhar apenas com GET.
     */

    if (
        event.request.method !== "GET"
    ) {

        return;

    }


    /*
     * Identificar a URL.
     */

    const requestURL =
        new URL(
            event.request.url
        );


    /*
     * Ignorar outros domínios.
     */

    if (
        requestURL.origin !==
        self.location.origin
    ) {

        return;

    }


    event.respondWith(

        caches.match(
            event.request
        )

        .then(function (cachedResponse) {

            /*
             * Se estiver no cache,
             * utilizar imediatamente.
             */

            if (cachedResponse) {

                return cachedResponse;

            }


            /*
             * Caso contrário,
             * procurar na Internet.
             */

            return fetch(
                event.request
            )

            .then(function (networkResponse) {

                /*
                 * Verificar resposta.
                 */

                if (
                    !networkResponse ||
                    networkResponse.status !== 200 ||
                    networkResponse.type === "opaque"
                ) {

                    return networkResponse;

                }


                /*
                 * Guardar cópia no cache.
                 */

                const responseClone =
                    networkResponse.clone();


                caches.open(
                    CACHE_NAME
                )

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
                 * Se estiver offline e for
                 * uma navegação, abrir o index.
                 */

                if (
                    event.request.mode ===
                    "navigate"
                ) {

                    return caches.match(
                        `${BASE_PATH}index.html`
                    );

                }


                /*
                 * Para outros recursos.
                 */

                return new Response(
                    "",
                    {
                        status: 503,
                        statusText:
                            "LABMZ Offline"
                    }
                );

            });

        })

    );

});


/* =========================================================
   MENSAGEM PARA ATUALIZAÇÃO
========================================================= */

self.addEventListener("message", function (event) {

    if (
        event.data &&
        event.data.action ===
        "SKIP_WAITING"
    ) {

        self.skipWaiting();

    }

});


/* =========================================================
   FIM DO SERVICE WORKER v5
========================================================= */
