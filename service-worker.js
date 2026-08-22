/* =========================================================
   LABMZ — SERVICE WORKER
   Laboratório de Aprendizagem de Biologia e Química
   de Moçambique

   Versão: 3.0
========================================================= */

"use strict";


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const CACHE_NAME = "labmz-v3";

const BASE_PATH = "/LABMZ/";


/* =========================================================
   ARQUIVOS ESSENCIAIS
========================================================= */

const CORE_FILES = [

    `${BASE_PATH}`,

    `${BASE_PATH}index.html`,

    `${BASE_PATH}style.css`,

    `${BASE_PATH}app.js`,

    `${BASE_PATH}manifest.json`,

    `${BASE_PATH}icons/icon-192.png`,

    `${BASE_PATH}icons/icon-512.png`

];


/* =========================================================
   INSTALAÇÃO DO SERVICE WORKER
========================================================= */

self.addEventListener(
    "install",
    function (event) {

        console.log(
            "[LABMZ] Instalando Service Worker..."
        );


        event.waitUntil(

            caches
                .open(CACHE_NAME)

                .then(
                    function (cache) {

                        console.log(
                            "[LABMZ] Guardando arquivos essenciais..."
                        );


                        return cache.addAll(
                            CORE_FILES
                        );

                    }
                )

        );


        /*
         * Ativa imediatamente a nova versão
         * do Service Worker.
         */

        self.skipWaiting();

    }
);


/* =========================================================
   ATIVAÇÃO DO SERVICE WORKER
========================================================= */

self.addEventListener(
    "activate",
    function (event) {

        console.log(
            "[LABMZ] Ativando Service Worker..."
        );


        event.waitUntil(

            caches
                .keys()

                .then(
                    function (cacheNames) {

                        return Promise.all(

                            cacheNames.map(
                                function (cacheName) {

                                    /*
                                     * Apagar caches antigos
                                     * do LABMZ.
                                     */

                                    if (
                                        cacheName !==
                                        CACHE_NAME
                                    ) {

                                        console.log(
                                            "[LABMZ] Removendo cache antigo:",
                                            cacheName
                                        );


                                        return caches.delete(
                                            cacheName
                                        );

                                    }

                                }
                            )

                        );

                    }
                )

        );


        /*
         * Assume imediatamente o controle
         * das páginas abertas.
         */

        self.clients.claim();

    }
);


/* =========================================================
   INTERCEPTAÇÃO DAS REQUISIÇÕES
========================================================= */

self.addEventListener(
    "fetch",
    function (event) {


        /*
         * Trabalhar apenas com requisições GET.
         */

        if (
            event.request.method !==
            "GET"
        ) {

            return;

        }


        /*
         * Ignorar extensões de outros domínios.
         */

        const requestURL =
            new URL(
                event.request.url
            );


        if (
            requestURL.origin !==
            self.location.origin
        ) {

            return;

        }


        event.respondWith(

            caches
                .match(
                    event.request
                )

                .then(
                    function (cachedResponse) {


                        /*
                         * Se já existe no cache,
                         * utilizar imediatamente.
                         */

                        if (
                            cachedResponse
                        ) {

                            return cachedResponse;

                        }


                        /*
                         * Caso contrário,
                         * procurar na Internet.
                         */

                        return fetch(
                            event.request
                        )

                        .then(
                            function (networkResponse) {


                                /*
                                 * Verificar se a resposta
                                 * é válida.
                                 */

                                if (
                                    !networkResponse ||
                                    networkResponse.status !== 200 ||
                                    networkResponse.type === "opaque"
                                ) {

                                    return networkResponse;

                                }


                                /*
                                 * Fazer uma cópia da resposta
                                 * para guardar no cache.
                                 */

                                const responseClone =
                                    networkResponse.clone();


                                caches
                                    .open(
                                        CACHE_NAME
                                    )

                                    .then(
                                        function (cache) {

                                            cache.put(
                                                event.request,
                                                responseClone
                                            );

                                        }
                                    );


                                return networkResponse;

                            }
                        )

                        .catch(
                            function () {


                                /*
                                 * Se o utilizador estiver offline
                                 * e estiver tentando abrir uma página,
                                 * mostrar o início do LABMZ.
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
                                 * Para outros recursos,
                                 * retornar uma resposta simples.
                                 */

                                return new Response(
                                    "",
                                    {
                                        status: 503,
                                        statusText:
                                            "LABMZ Offline"
                                    }
                                );

                            }
                        );

                    }
                )

        );

    }
);


/* =========================================================
   MENSAGEM PARA FORÇAR ATUALIZAÇÃO
========================================================= */

self.addEventListener(
    "message",
    function (event) {

        if (
            event.data &&
            event.data.action ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }

    }
);


/* =========================================================
   FIM DO SERVICE WORKER
========================================================= */
