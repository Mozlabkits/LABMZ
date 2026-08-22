const CACHE_NAME = "labmz-v2";

const FILES_TO_CACHE = [

```
"./",
"./index.html",
"./style.css",
"./app.js",
"./manifest.json",

"./Biologia/index.html",

"./Biologia/celula/index.html",
"./Biologia/celula/animal/index.html",
"./Biologia/celula/vegetal/index.html",
"./Biologia/celula/procariotica/index.html",
"./Biologia/celula/eucariotica/index.html",
"./Biologia/celula/estrutura/index.html",
"./Biologia/celula/funcoes/index.html",
"./Biologia/celula/exercicios/index.html",
"./Biologia/celula/quiz/index.html",

"./Quimica/index.html",
"./Quimica/materia/index.html",
"./Quimica/atomo/index.html",
"./Quimica/elementos/index.html",
"./Quimica/tabela-periodica/index.html",
"./Quimica/ligacoes/index.html",
"./Quimica/reacoes/index.html",
"./Quimica/exercicios/index.html",
"./Quimica/quiz/index.html"
```

];

self.addEventListener("install", event => {

```
event.waitUntil(

    caches.open(CACHE_NAME)

        .then(cache => {

            return cache.addAll(FILES_TO_CACHE);

        })

);

self.skipWaiting();
```

});

self.addEventListener("activate", event => {

```
event.waitUntil(

    caches.keys()

        .then(cacheNames => {

            return Promise.all(

                cacheNames

                    .filter(name => name !== CACHE_NAME)

                    .map(name => caches.delete(name))

            );

        })

);

self.clients.claim();
```

});

self.addEventListener("fetch", event => {

```
event.respondWith(

    caches.match(event.request)

        .then(cachedResponse => {

            if (cachedResponse) {

                return cachedResponse;

            }

            return fetch(event.request)

                .then(networkResponse => {

                    return networkResponse;

                })

                .catch(() => {

                    return caches.match("./index.html");

                });

        })

);
```

});
