<div align="center">

<a href="https://nodejs.org/en" target="_blank"><img src="https://user-images.githubusercontent.com/3438503/260495760-ca5d8c24-b382-43d9-8fbe-d905b4b208f0.png" width="260" alt="Logo de Node.js" /></a>

# Clase 5 de NodeJS

### Kopius · The Academy · Cohort 05 · M3

**WebServer: HTTP nativo, Express y Handlebars**

![Node.js](https://img.shields.io/badge/Node.js-24.x-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)

</div>

---

## CONTENIDO

1. [Objetivo](#1-objetivos-y-requisitos)
2. [WebServer: Fundamentos](#2-fundamentos-de-un-webserver)
   - [El modelo cliente-servidor](#21-el-modelo-cliente-servidor)
   - [El recorrido de una petición](#22-el-recorrido-de-una-petición)
   - [Anatomía de la petición y la respuesta](#23-anatomía-de-la-petición-y-la-respuesta)
   - [Métodos HTTP](#24-métodos-http)
   - [Códigos de estado](#25-códigos-de-estado)
   - [Headers y tipos MIME](#26-headers-y-tipos-mime)
   - [Puertos, localhost y 0.0.0.0](#27-puertos-localhost-y-0000)
   - [Contenido estático y dinámico](#28-contenido-estático-y-dinámico)
3. [Servidor HTTP nativo](#3-servidor-http-nativo)
   - [createServer](#31-createserver)
   - [request y response](#32-request-y-response)
   - [Primer servidor](#33-primer-servidor)
   - [Routing manual](#34-routing-manual)
   - [Leer el body](#35-leer-el-body)
   - [Servir archivos estáticos a mano](#36-servir-archivos-estáticos-a-mano)
   - [Escuchar y cerrar](#37-escuchar-y-cerrar)
   - [Errores comunes](#38-errores-comunes)
4. [Express](#4-express)
   - [Qué es Express](#41-qué-es-express)
   - [Instalación](#42-instalación)
   - [Primera aplicación](#43-primera-aplicación)
   - [Routing, parámetros y query](#44-routing-parámetros-y-query)
   - [Middleware](#45-middleware)
   - [Servir contenido estático](#46-servir-contenido-estático)
   - [404 y manejo de errores](#47-404-y-manejo-de-errores)
   - [HTTP nativo vs Express](#48-http-nativo-vs-express)
5. [Handlebars](#5-handlebars)
   - [Qué es un motor de plantillas](#51-qué-es-un-motor-de-plantillas)
   - [Instalación y configuración](#52-instalación-y-configuración)
   - [Layout, vistas y partials](#53-layout-vistas-y-partials)
   - [Interpolar datos desde el controlador](#54-interpolar-datos-desde-el-controlador)
   - [Expresiones y escape](#55-expresiones-y-escape)
   - [Bloques e iteración](#56-bloques-e-iteración)
   - [Partials con parámetros](#57-partials-con-parámetros)
   - [Helpers](#58-helpers)
   - [Otras cosas que se pueden hacer](#59-otras-cosas-que-se-pueden-hacer)
   - [runtimeOptions y prototipos](#510-runtimeoptions-y-prototipos)
6. [Arquitectura del proyecto](#6-arquitectura-del-proyecto)
7. [Referencias](#referencias)

---

## 1. Objetivos

Esta clase tiene como objetivo ser el puente entre "escribir scripts" y "publicar un sitio". Empezamos por el protocolo HTTP, seguimos con el servidor nativo de Node, después con Express y terminamos renderizando HTML en el servidor con Handlebars. Handlebars se usa como herramienta didáctica para entender el renderizado del lado del servidor (SSR), no como una obligación para todos los proyectos.:

**Que vamos a ver:**

- Explicar el ciclo **request/response** y qué responsabilidad tiene cada parte.
- Levantar un servidor con `node:http` y responder distintas rutas a mano.
- Reconocer qué trabajo automatiza Express y cuál sigue siendo tu responsabilidad.
- Servir un sitio con contenido estático de forma segura y con caché.
- Renderizar vistas dinámicas con Handlebars, layouts, partials y helpers.
- Pasar datos desde el controlador a la vista y entender el contrato entre ambos.
- Desplegar la aplicación en Railway.

**Requisitos:**

- Node.js 26 LTS y npm.
- Un navegador con herramientas de desarrollo.
- Cuenta de GitHub (para desplegar desde un repositorio).
- Cuenta de Railway (el plan gratuito alcanza para la tarea).

> [!IMPORTANT]
> Usaremos **ES Modules**. El archivo `package.json` debe contener `"type": "module"`. Todos los ejemplos asumen esa configuración.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 2. WebServer: Fundamentos

Un **servidor web** es un proceso que:

1. Se queda escuchando en un puerto TCP.
2. Recibe peticiones HTTP.
3. Decide qué hacer con cada petición.
4. Devuelve una respuesta HTTP.

El navegador es el **cliente**. No hay magia: hay un contrato de texto (HTTP) sobre una conexión TCP.

### 2.1 El modelo cliente-servidor

```text
Navegador (cliente)                         Node.js (servidor)
       │                                          │
       │  GET /posts/atacama HTTP/1.1             │
       │  Host: localhost:3000                    │
       ├─────────────────────────────────────────>│
       │                                          │  busca la ruta
       │                                          │  arma el HTML
       │  200 OK                                  │
       │  Content-Type: text/html; charset=utf-8  │
       │  <html>...</html>                        │
       │<─────────────────────────────────────────┤
```

El servidor **no recuerda** quién sos entre peticiones. HTTP es un protocolo **sin estado** (_stateless_). Cada petición debe traer toda la información necesaria: ruta, método, headers y, si corresponde, body.

> [!NOTE]
> Que HTTP no tenga estado no significa que la aplicación no pueda tenerlo. Las sesiones, cookies y tokens (por ejemplo, JWT) son mecanismos que construimos **por encima** de HTTP para recordar identidad.

### 2.2 El recorrido de una petición

1. El navegador resuelve el dominio con **DNS** (`localhost` se resuelve directo a la máquina local).
2. Abre una conexión **TCP** contra el host y el puerto.
3. Envía la petición HTTP: método, ruta, versión, headers y body opcional.
4. El servidor recibe la petición y la procesa:
   - ¿La ruta existe?
   - ¿El método está permitido?
   - ¿Necesita leer datos del body o de la URL?
   - ¿Qué respuesta corresponde?
5. El servidor envía la respuesta: estado, headers y body.
6. El navegador interpreta el `Content-Type` y hace algo con el body:
   - HTML → lo renderiza.
   - CSS → lo aplica.
   - JSON → lo entrega al JavaScript.
   - Imagen → la muestra.

### 2.3 Anatomía de la petición y la respuesta

**Petición:**

| Parte   | Ejemplo                  | Responsabilidad                          |
| ------- | ------------------------ | ---------------------------------------- |
| Método  | `GET`                    | Intención de la operación                |
| Ruta    | `/posts/atacama?lang=es` | Recurso solicitado + parámetros          |
| Versión | `HTTP/1.1`               | Formato del protocolo                    |
| Headers | `Accept: text/html`      | Metadatos de la petición                 |
| Body    | `{"name":"Ana"}`         | Datos enviados (no en `GET` normalmente) |

**Respuesta:**

| Parte   | Ejemplo                   | Responsabilidad           |
| ------- | ------------------------- | ------------------------- |
| Estado  | `200`                     | Resultado de la operación |
| Headers | `Content-Type: text/html` | Cómo interpretar el body  |
| Body    | `<!doctype html>...`      | Contenido enviado         |

> [!WARNING]
> El estado y el body deben ser coherentes. Un `404` con un body que dice "todo bien" confunde al cliente, a los logs y a los buscadores.

### 2.4 Métodos HTTP

| Método   | Uso típico                              | Seguro | Idempotente |
| -------- | --------------------------------------- | ------ | ----------- |
| `GET`    | Leer un recurso                         | Sí     | Sí          |
| `HEAD`   | Igual que `GET`, sin body               | Sí     | Sí          |
| `POST`   | Crear un recurso o enviar un formulario | No     | No          |
| `PUT`    | Reemplazar un recurso completo          | No     | Sí          |
| `PATCH`  | Modificar parcialmente un recurso       | No     | No siempre  |
| `DELETE` | Eliminar un recurso                     | No     | Sí          |

**Seguro** significa que no debería modificar el estado del servidor. **Idempotente** significa que repetir la misma petición produce el mismo resultado final.

> [!IMPORTANT]
> Esta clase usa `GET` para páginas y `POST` para el formulario de contacto. En la próxima clase verás `POST`, `PUT`, `PATCH` y `DELETE` aplicados a una API REST completa.

### 2.5 Códigos de estado

| Rango | Significado        | Ejemplos habituales                                            |
| ----- | ------------------ | -------------------------------------------------------------- |
| `2xx` | Éxito              | `200 OK`, `201 Created`, `204 No Content`                      |
| `3xx` | Redirección        | `301 Moved Permanently`, `303 See Other`, `304 Not Modified`   |
| `4xx` | Error del cliente  | `400 Bad Request`, `404 Not Found`, `422 Unprocessable Entity` |
| `5xx` | Error del servidor | `500 Internal Server Error`, `502 Bad Gateway`                 |

En la tarea vas a usar, como mínimo:

- `200` para páginas encontradas.
- `404` para recursos inexistentes.
- `422` o `400` para un formulario inválido.
- `500` para un error inesperado del servidor.

### 2.6 Headers y tipos MIME

Los headers describen la petición o la respuesta. Los más importantes al servir un sitio:

| Header           | Para qué sirve                                             |
| ---------------- | ---------------------------------------------------------- |
| `Content-Type`   | Indica el tipo de contenido y su codificación              |
| `Content-Length` | Tamaño del body en bytes                                   |
| `Cache-Control`  | Cuánto tiempo puede cachear el cliente o un proxy          |
| `ETag`           | Identificador de versión del recurso (validación de caché) |
| `Last-Modified`  | Última modificación del recurso                            |
| `Location`       | Destino de una redirección                                 |
| `Set-Cookie`     | Envía una cookie al cliente                                |

El `Content-Type` se expresa con un **MIME type**:

| Extensión | MIME type          |
| --------- | ------------------ |
| `.html`   | `text/html`        |
| `.css`    | `text/css`         |
| `.js`     | `text/javascript`  |
| `.json`   | `application/json` |
| `.png`    | `image/png`        |
| `.jpg`    | `image/jpeg`       |
| `.svg`    | `image/svg+xml`    |
| `.woff2`  | `font/woff2`       |

> [!WARNING]
> Si el `Content-Type` no es correcto, el navegador puede descargar el archivo en lugar de aplicarlo, o interpretarlo mal. Un CSS servido como `text/plain` no se aplica. Siempre que envíes texto, agregá `charset=utf-8`.

### 2.7 Puertos, localhost y 0.0.0.0

- Un **puerto** identifica un proceso dentro de una máquina. El puerto `3000` no es especial: es una convención para desarrollo.
- `localhost` y `127.0.0.1` significan "esta máquina". Solo aceptan conexiones locales.
- `0.0.0.0` significa "todas las interfaces de red". Es lo que necesitás cuando el servidor corre dentro de un contenedor o en un hosting.

> [!WARNING]
> Si en desarrollo escuchás en `localhost` y después desplegás en Railway, el healthcheck del hosting no va a poder entrar al contenedor. Escuchá en `0.0.0.0` y leé el puerto desde `process.env.PORT`. Este es el error número uno al desplegar.

Si el puerto está ocupado, el sistema devuelve `EADDRINUSE`. Cambiá el puerto o detené el proceso que lo está usando.

### 2.8 Contenido estático y dinámico

| Tipo         | Origen                                        | Ejemplo                               |
| ------------ | --------------------------------------------- | ------------------------------------- |
| **Estático** | Un archivo en disco que no cambia por request | `main.css`, `banner.jpg`, `main.js`   |
| **Dinámico** | Se genera en cada petición                    | HTML con los posts del día, un perfil |

Un sitio renderizado en el servidor (SSR) combina ambos:

```text
GET /posts/atacama
        │
        ▼
  Express busca el post en los datos
        │
        ▼
  Handlebars combina layout + vista + datos
        │
        ▼
  HTML final  ──>  navegador
        │
        └── además pide /assets/css/main.css y /images/banner2.jpg
            (esos sí son estáticos)
```

La diferencia clave: el HTML **se arma por request**; los assets **se leen de disco tal como están**.

> [!NOTE]
> Servir un sitio estático completo (los `.html` tal cual) también es válido, pero no permite interpolar datos. En esta clase el objetivo es el paso siguiente: que el HTML se genere con información que decide el controlador.

### 2.9 Por qué Node.js

Node ejecuta JavaScript en un **event loop** de un solo hilo. Las operaciones de red y de disco no bloquean el hilo: se delegan y se retoman cuando terminan. Por eso un servidor Node puede atender muchas conexiones concurrentes con muy poca memoria, siempre que **no** hagas trabajo pesado sincrónico dentro de un handler.

> [!WARNING]
> `readFileSync`, `statSync` o un bucle enorme dentro de un request bloquean el event loop y frenan a todos los clientes. En un servidor, preferí las versiones asíncronas (`fs/promises`, streams) o delegá el trabajo pesado a un proceso aparte.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 3. Servidor HTTP nativo

Node incluye el módulo `node:http`. No requiere instalación y no es un framework: es la implementación del protocolo.

### 3.1 createServer

```javascript
import { createServer } from "node:http";

const server = createServer((request, response) => {
  // se ejecuta una vez por cada petición
});

server.listen(3000, () => {
  console.log("Servidor escuchando en http://localhost:3000");
});
```

`createServer` devuelve un objeto `http.Server`, que es un `EventEmitter`. El callback se llama **una vez por petición** y recibe dos objetos: la petición y la respuesta.

### 3.2 request y response

**`request` (`http.IncomingMessage`)** — es un stream de lectura:

| Propiedad / método    | Qué aporta                                 |
| --------------------- | ------------------------------------------ |
| `request.method`      | `GET`, `POST`, etc.                        |
| `request.url`         | Ruta **con** query string: `/posts?page=2` |
| `request.headers`     | Objeto con los headers (en minúsculas)     |
| `request.httpVersion` | Versión del protocolo                      |
| `request.on("data")`  | Fragmentos del body (stream)               |
| `request.on("end")`   | Fin del body                               |

**`response` (`http.ServerResponse`)** — es un stream de escritura:

| Propiedad / método     | Qué hace                                    |
| ---------------------- | ------------------------------------------- |
| `response.statusCode`  | Código de estado                            |
| `response.setHeader()` | Define un header                            |
| `response.writeHead()` | Define estado y headers en una sola llamada |
| `response.write()`     | Escribe una parte del body                  |
| `response.end()`       | Termina la respuesta (obligatorio)          |
| `response.headersSent` | Indica si los headers ya se enviaron        |

> [!IMPORTANT]
> `request.url` incluye el query string. Comparar `request.url === "/"` falla cuando la URL es `/?lang=es`. Para trabajar con la ruta y los parámetros, construí un `URL`:
>
> ```javascript
> const url = new URL(request.url, `http://${request.headers.host}`);
> console.log(url.pathname, url.searchParams.get("lang"));
> ```

### 3.3 Primer servidor

```javascript
// src/native-server.js
import { createServer } from "node:http";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";

const routes = new Map();

routes.set("GET /", (request, response) => {
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.end(`<!doctype html>
<html lang="es">
  <head><meta charset="utf-8" /><title>Mi primer WebServer</title></head>
  <body><h1>Mi primer WebServer</h1></body>
</html>`);
});

routes.set("GET /api/health", (request, response) => {
  response.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
});

const server = createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const handler = routes.get(`${request.method} ${url.pathname}`);

  if (handler) {
    handler(request, response);
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not Found");
});

server.on("error", (error) => {
  console.error(`No se pudo iniciar el servidor: ${error.message}`);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
```

Ejecutarlo:

```bash
node src/native-server.js
# o, para reiniciar al guardar:
node --watch src/native-server.js
```

Probarlo:

```bash
curl -i http://localhost:3000/
curl -i http://localhost:3000/api/health
curl -i http://localhost:3000/no-existe
```

> [!NOTE]
> `server.listen()` en Node **no** recibe el error en el callback. Los errores de arranque (por ejemplo, `EADDRINUSE`) se emiten como evento `error`. Por eso usamos `server.on("error", ...)`. Express 5 sí cambia esta firma en `app.listen()`; lo veremos más adelante.

### 3.4 Routing manual

Sin framework, el routing es una decisión tuya. Podés usar un `Map` para rutas exactas y expresiones regulares para rutas con parámetros:

```javascript
const matchUser = url.pathname.match(/^\/users\/(\d+)$/);

if (request.method === "GET" && matchUser) {
  const id = Number(matchUser[1]);
  const user = users.find((item) => item.id === id);

  if (!user) {
    response.writeHead(404, {
      "Content-Type": "application/json; charset=utf-8",
    });
    response.end(JSON.stringify({ error: "User not found" }));
    return;
  }

  response.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(user));
  return;
}
```

Ya se ven los problemas que Express va a resolver:

- Rutas con parámetros → expresiones regulares a mano.
- Métodos → condicionales anidados.
- Headers → repetidos en cada respuesta.
- JSON → `JSON.stringify` en todos lados.
- 404 y 405 → lógica dispersa.
- Caché y archivos estáticos → ni hablar.

### 3.5 Leer el body

El body no viene "listo" en una propiedad: es un stream. Hay que consumirlo por partes:

```javascript
async function readJsonBody(request, limit = 1_000_000) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;

    if (size > limit) {
      throw new Error("Body demasiado grande");
    }

    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}
```

Uso:

```javascript
if (request.method === "POST" && url.pathname === "/api/users") {
  try {
    const body = await readJsonBody(request);
    // validar body...
    response.writeHead(201, {
      "Content-Type": "application/json; charset=utf-8",
    });
    response.end(JSON.stringify({ id: 1, ...body }));
  } catch (error) {
    response.writeHead(400, {
      "Content-Type": "application/json; charset=utf-8",
    });
    response.end(JSON.stringify({ error: error.message }));
  }
}
```

> [!WARNING]
> Nunca aceptes un body sin límite. Un cliente malicioso puede enviar gigabytes y agotar la memoria del servidor. El límite y la validación son parte del contrato, no un detalle opcional.

> [!NOTE]
> `JSON.parse` lanza una excepción si el texto no es JSON válido. Por eso el `try/catch` está alrededor de **todo** el procesamiento, no solo del `await`.

### 3.6 Servir archivos estáticos a mano

Servir un archivo es: encontrar el archivo, decidir el MIME, abrir un stream y volcarlo a la respuesta. También hay que evitar que un cliente pida `../../.env`:

```javascript
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";

const PUBLIC_DIR = join(import.meta.dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

async function tryServeStatic(request, response, pathname) {
  let relative;

  try {
    relative = decodeURIComponent(pathname);
  } catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad Request");
    return true;
  }

  const filePath = join(PUBLIC_DIR, normalize(relative));

  // Defensa contra path traversal: el archivo debe quedar dentro de PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR + sep)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return true;
  }

  try {
    const info = await stat(filePath);

    if (!info.isFile()) {
      return false;
    }

    response.writeHead(200, {
      "Content-Type":
        MIME_TYPES[extname(filePath)] ?? "application/octet-stream",
      "Content-Length": info.size,
    });

    createReadStream(filePath).pipe(response);
    return true;
  } catch {
    return false; // no existe: que decida la capa siguiente
  }
}
```

Y en el handler principal:

```javascript
if (
  request.method === "GET" &&
  (await tryServeStatic(request, response, url.pathname))
) {
  return;
}
```

Esto funciona, pero todavía le falta: `index.html` para `/`, `ETag`, `Last-Modified`, `Cache-Control`, `Range` para videos, `304 Not Modified`, compresión, `HEAD`, y protección de dotfiles. **Ese es exactamente el trabajo que hace `express.static`.**

> [!IMPORTANT]
> La moraleja no es "no uses `node:http`". Es que un framework no reemplaza al protocolo: lo organiza. Express usa `node:http` por debajo; vos seguís siendo responsable de las decisiones.

### 3.7 Escuchar y cerrar

```javascript
const server = createServer(handler);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    console.log(`${signal} recibido: cerrando servidor...`);
    server.close(() => process.exit(0));
  });
}
```

- `SIGINT` es `Ctrl+C`.
- `SIGTERM` es la señal que envía un hosting (Railway incluido) cuando reemplaza o detiene un contenedor.

Cerrar ordenadamente evita cortar peticiones en curso y es la base de un despliegue sin errores.

### 3.8 Errores comunes

| Error                                    | Causa                                              | Solución                                     |
| ---------------------------------------- | -------------------------------------------------- | -------------------------------------------- |
| `EADDRINUSE`                             | El puerto ya está ocupado                          | Cambiar `PORT` o detener el proceso anterior |
| El servidor "no responde"                | Falta `response.end()`                             | Terminar siempre la respuesta                |
| `ERR_STREAM_WRITE_AFTER_END`             | Se escribió después de `end()`                     | Hacer `return` después de responder          |
| `Cannot set headers after they are sent` | Se llamó `writeHead` dos veces                     | Verificar `response.headersSent` y retornar  |
| 404 en todo                              | Se comparó `request.url` con query string incluido | Usar `new URL(request.url, base).pathname`   |
| CSS no se aplica                         | `Content-Type` incorrecto                          | Enviar `text/css; charset=utf-8`             |
| El body llega vacío                      | No se consumió el stream                           | Leer con `for await` o usar `express.json()` |

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 4. Express

### 4.1 Qué es Express

**Express** es un framework web minimalista para Node.js. No implementa HTTP: lo usa. Lo que agrega es una capa de organización:

- **Routing** declarativo: `app.get("/posts/:slug", handler)`.
- **Middleware** encadenable: funciones que procesan la petición en orden.
- **Helpers de respuesta**: `res.send()`, `res.json()`, `res.status()`, `res.render()`.
- **Contenido estático** con `express.static()`.
- **Motor de vistas** conectable (Handlebars, Pug, EJS).
- **Manejo de errores** centralizado.

La documentación oficial lo define como "infraestructura web mínima y flexible". Esa flexibilidad es la razón por la que existen miles de formas de estructurar una aplicación Express: el framework no te impone una arquitectura.

> [!NOTE]
> Express 5 es la versión actual. En esta clase usamos `express@5` y verificamos las diferencias con Express 4 en la sección 4.8.

### 4.2 Instalación

```bash
mkdir node-fullstack-clase-05
cd node-fullstack-clase-05
npm init -y
npm install express@5
```

`package.json` mínimo:

```json
{
  "name": "node-fullstack-clase-05",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "express": "^5.3.0"
  }
}
```

> [!IMPORTANT]
> `npm start` es el comando que Railway va a ejecutar. Si no existe, el despliegue falla. Definilo desde el primer día.

### 4.3 Primera aplicación

```javascript
// src/server.js
import express from "express";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.get("/", (request, response) => {
  response.send("<h1>Inicio</h1>");
});

app.get("/about", (request, response) => {
  response.send("<h1>Acerca de</h1>");
});

app.use((request, response) => {
  response.status(404).send("Not Found");
});

app.listen(PORT, "0.0.0.0", (error) => {
  if (error) {
    console.error(`No se pudo iniciar el servidor: ${error.message}`);
    process.exit(1);
  }

  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
```

Comparación directa:

| HTTP nativo               | Express                                    |
| ------------------------- | ------------------------------------------ |
| `request.url`             | `app.get("/ruta", handler)`                |
| `writeHead(200)`          | `response.status(200)`                     |
| `response.end(body)`      | `response.send(body)`                      |
| `JSON.stringify` + header | `response.json(object)`                    |
| Comparar método y ruta    | `app.post("/ruta", handler)`               |
| MIME a mano               | `express.static()` / `response.sendFile()` |
| Routing con `if`/regex    | `request.params`                           |

### 4.4 Routing, parámetros y query

```javascript
app.get("/posts/:slug", (request, response) => {
  const { slug } = request.params; // /posts/atacama → "atacama"
  const page = request.query.page ?? "1"; // /posts/atacama?page=2 → "2"

  response.json({ slug, page });
});
```

| Fuente       | Dónde vive        | Ejemplo                         |
| ------------ | ----------------- | ------------------------------- |
| Ruta         | `request.params`  | `/posts/:slug` → `{ slug }`     |
| Query string | `request.query`   | `?page=2&sort=asc`              |
| Body JSON    | `request.body`    | requiere `express.json()`       |
| Body de form | `request.body`    | requiere `express.urlencoded()` |
| Headers      | `request.headers` | `request.headers["user-agent"]` |

Para leer bodies hay que registrar el middleware **antes** de las rutas:

```javascript
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
```

> [!WARNING]
> En Express 5, `request.body` es `undefined` si no registraste el middleware correspondiente. En Express 4 era `{}` por defecto. Si un handler hace `request.body.name`, va a lanzar un error.

También podés agrupar rutas con `express.Router()`:

```javascript
import { Router } from "express";

const postsRouter = Router();

postsRouter.get("/", (request, response) => {
  response.render("posts", { posts });
});

postsRouter.get("/:slug", (request, response, next) => {
  const post = posts.find((item) => item.slug === request.params.slug);
  if (!post) return next();
  response.render("post", { post });
});

app.use("/posts", postsRouter);
```

### 4.5 Middleware

Un middleware es una función con esta forma:

```javascript
function middleware(request, response, next) {
  // hacer algo
  next(); // pasar al siguiente middleware o ruta
}
```

Características:

- Se ejecutan **en el orden en que se registran**.
- Pueden terminar la respuesta o llamar a `next()`.
- Pueden modificar `request` y `response`.
- Si reciben un error como primer argumento, se convierten en **error handlers**.

```javascript
app.use((request, response, next) => {
  const startedAt = Date.now();

  response.on("finish", () => {
    console.log(
      `${request.method} ${request.url} → ${response.statusCode} (${Date.now() - startedAt} ms)`,
    );
  });

  next();
});
```

Ese middleware es un logger mínimo. En producción se usa `morgan` u otra herramienta, pero entender el mecanismo es lo importante.

**Error handler** (siempre cuatro argumentos):

```javascript
app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).render("500", { message: "Algo salió mal" });
});
```

> [!IMPORTANT]
> Express 5 detecta automáticamente las promesas rechazadas en handlers `async` y las envía al error handler. En Express 4 había que envolver todo en `try/catch` o llamar a `next(error)`. Igual conviene escribir `try/catch` cuando necesitás transformar el error.

### 4.6 Servir contenido estático

#### Qué significa "servir estático"

Servir contenido estático es entregar un archivo del disco sin transformarlo. El servidor no ejecuta la plantilla ni consulta datos: busca el archivo, decide su MIME y lo envía.

La diferencia con SSR:

| Pregunta                     | Estático                   | Dinámico (SSR)                          |
| ---------------------------- | -------------------------- | --------------------------------------- |
| ¿De dónde sale el contenido? | Archivo en disco           | Datos + plantilla                       |
| ¿Cambia entre requests?      | No                         | Sí                                      |
| ¿Quién arma el HTML?         | El autor del archivo       | El controlador + el motor de plantillas |
| Ejemplos                     | CSS, JS, imágenes, fuentes | Home con posts, perfil, detalle         |

#### Cómo funciona `express.static()`

`express.static(root, options)` devuelve un middleware que:

1. Recibe la petición (`GET` o `HEAD`).
2. Toma la ruta de la URL y la resuelve contra el directorio `root`.
3. Rechaza intentos de salir del directorio (`../`).
4. Verifica que el archivo exista y sea un archivo.
5. Infiere el `Content-Type` por la extensión.
6. Agrega `Content-Length`, `ETag`, `Last-Modified` y `Cache-Control`.
7. Responde con un stream del archivo (o `304` si el cliente ya lo tiene).
8. Si no encuentra el archivo, llama a `next()` para que sigan las rutas.

```text
GET /assets/css/main.css
        │
        ▼
  express.static("public")
        │  busca public/assets/css/main.css
        ▼
  ¿existe? ── no ──> next() ──> rutas ──> 404
        │ sí
        ▼
  Content-Type: text/css; charset=utf-8
  Content-Length + ETag + Last-Modified
        │
        ▼
  stream del archivo ──> navegador
```

#### Estructura y URLs

```text
proyecto/
├── public/
│   ├── assets/
│   │   ├── css/main.css
│   │   ├── js/main.js
│   │   └── fonts/...
│   └── images/
│       └── banner.jpg
└── src/
    └── server.js
```

```javascript
import express from "express";
import path from "node:path";

const app = express();
const publicDir = path.join(import.meta.dirname, "..", "public");

app.use(express.static(publicDir));
```

| Archivo en disco             | URL pública            |
| ---------------------------- | ---------------------- |
| `public/assets/css/main.css` | `/assets/css/main.css` |
| `public/images/banner.jpg`   | `/images/banner.jpg`   |
| `public/assets/js/main.js`   | `/assets/js/main.js`   |

> [!IMPORTANT]
> El nombre del directorio **no** forma parte de la URL. `public/` es una convención, no una ruta mágica. Si montás `app.use("/static", express.static(publicDir))`, la URL pasa a ser `/static/assets/css/main.css`.

#### Ruta absoluta, no relativa

`express.static("public")` se resuelve contra el **directorio desde donde se lanzó el proceso**, no contra el archivo. Si ejecutás el servidor desde otra carpeta, deja de encontrar los assets.

Usá una ruta absoluta:

```javascript
import path from "node:path";

const publicDir = path.join(import.meta.dirname, "..", "public");
app.use(express.static(publicDir));
```

`import.meta.dirname` existe desde Node 20.11 / 21.2 y devuelve el directorio del módulo actual. Es la versión ESM de `__dirname`.

#### Opciones útiles

| Opción         | Default        | Para qué sirve                                  |
| -------------- | -------------- | ----------------------------------------------- |
| `index`        | `"index.html"` | Archivo que se sirve al pedir un directorio     |
| `extensions`   | `false`        | Prueba extensiones: `/about` → `about.html`     |
| `maxAge`       | `0`            | Tiempo de caché del cliente (`"1h"`, `"7d"`)    |
| `immutable`    | `false`        | Le dice al cliente que el archivo nunca cambia  |
| `etag`         | `true`         | Genera `ETag` para validación                   |
| `lastModified` | `true`         | Envía `Last-Modified`                           |
| `fallthrough`  | `true`         | Si no encuentra el archivo, llama a `next()`    |
| `dotfiles`     | `"ignore"`     | Qué hacer con archivos ocultos (`.env`, `.git`) |
| `setHeaders`   | —              | Función para agregar headers propios            |

```javascript
app.use(
  express.static(publicDir, {
    maxAge: "1h",
    etag: true,
    lastModified: true,
  }),
);
```

> [!WARNING]
> No uses `maxAge` largo en desarrollo: el navegador va a seguir mostrando el CSS viejo. En producción, un `maxAge` alto combinado con nombres de archivo versionados (`main.abc123.css`) es la estrategia habitual. Si no versionás los nombres, usá valores cortos.

> [!NOTE]
> Para un prefijo de assets que debe responder `404` en lugar de caer a las rutas de la aplicación, usá `fallthrough: false`:
>
> ```javascript
> app.use(
>   "/assets",
>   express.static(path.join(publicDir, "assets"), { fallthrough: false }),
> );
> ```

#### Qué NO servir con `express.static`

- La raíz del proyecto (`node_modules`, `.env`, `.git`).
- El código fuente (`src/`).
- Archivos con datos privados.

`express.static` protege contra path traversal, pero no decide qué es público. Esa decisión es tuya: exponé solo una carpeta de assets.

> [!IMPORTANT]
> `express.static` atiende `GET` y `HEAD`. No reemplaza rutas dinámicas ni formularios. Un `POST /contact` nunca lo va a manejar el middleware estático: sigue de largo y lo resuelve tu ruta.

### 4.7 404 y manejo de errores

El orden importa. Un 404 es simplemente el **último middleware** cuando ninguna ruta respondió:

```javascript
// 1) estáticos
app.use(express.static(publicDir));

// 2) rutas
app.get("/", homeHandler);
app.get("/posts/:slug", postHandler);

// 3) 404
app.use((request, response) => {
  response.status(404).render("404", { title: "No encontrado" });
});

// 4) errores
app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).render("500", { title: "Error" });
});
```

> [!NOTE]
> En Express 5, `app.get("*")` ya no es válido: los comodines deben tener nombre (`/*splat`) o usar `/{*splat}` para incluir la raíz. Para el 404 no necesitás comodín: `app.use()` sin ruta captura todos los métodos y rutas.

> [!WARNING]
> Si el error handler no tiene exactamente cuatro parámetros (`error, request, response, next`), Express lo trata como un middleware normal y nunca lo ejecuta como manejador de errores.

### 4.8 HTTP nativo vs Express

| Aspecto              | `node:http`                        | Express                                   |
| -------------------- | ---------------------------------- | ----------------------------------------- |
| Instalación          | Incluido                           | `npm install express@5`                   |
| Routing              | Manual (`if`, regex, `Map`)        | Declarativo (`app.get`, `Router`)         |
| Parámetros de ruta   | Parseo manual                      | `request.params`                          |
| Query string         | `new URL(...).searchParams`        | `request.query`                           |
| Body JSON            | Stream + `JSON.parse`              | `express.json()`                          |
| Body de formulario   | Stream + parseo manual             | `express.urlencoded()`                    |
| Estáticos            | Implementación propia              | `express.static()`                        |
| Vistas               | Concatenación de strings           | `res.render()` + motor de plantillas      |
| Errores              | `try/catch` por handler            | Middleware de errores + propagación async |
| Curva de aprendizaje | Baja, pero mucho código repetitivo | Media, pero mucho menos repetitivo        |
| Control              | Total                              | Total en las decisiones, delegando HTTP   |

> [!IMPORTANT]
> Express no es "más moderno" que `node:http`: es una abstracción. Saber qué pasa abajo te permite depurar cuando la abstracción falla. Ese es el objetivo de empezar por el servidor nativo.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 5. Handlebars

### 5.1 Qué es un motor de plantillas

Un motor de plantillas convierte **datos + plantilla** en texto (normalmente HTML). En SSR, el servidor hace ese trabajo en cada request y envía HTML ya armado.

```text
Controlador                    Plantilla                     HTML final
{ title, posts }      +    home.handlebars       →    <h1>...</h1>...
```

Ventajas de este enfoque:

- El HTML llega listo: mejor primera carga y SEO.
- Los datos viven en el servidor: no hay que exponer una API solo para pintar una página.
- La plantilla queda separada de la lógica.

Desventajas:

- Cada cambio de datos requiere una request nueva (salvo que agregues JavaScript del lado del cliente).
- El servidor hace más trabajo por request.
- La interactividad rica necesita JavaScript aparte.

> [!NOTE]
> Handlebars es **lógica mínima**: no ejecuta JavaScript arbitrario. Eso es una virtud: la lógica de negocio vive en el controlador y en los helpers, no en la vista.

### 5.2 Instalación y configuración

```bash
npm install express-handlebars@9
```

`express-handlebars@9` requiere Node 22.23.4 o superior y trae `handlebars@4.7` como dependencia.

Configuración:

```javascript
// src/app.js
import express from "express";
import path from "node:path";
import { engine } from "express-handlebars";

const app = express();
const viewsDir = path.join(import.meta.dirname, "views");

app.engine(
  "handlebars",
  engine({
    layoutsDir: path.join(viewsDir, "layouts"),
    partialsDir: path.join(viewsDir, "partials"),
    defaultLayout: "main",
    extname: ".handlebars",
    helpers: {
      eq: (a, b) => a === b,
      formatDate: (value) =>
        new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(
          new Date(value),
        ),
    },
  }),
);

app.set("view engine", "handlebars");
app.set("views", viewsDir);
```

| Opción           | Para qué sirve                                          |
| ---------------- | ------------------------------------------------------- |
| `layoutsDir`     | Carpeta de layouts                                      |
| `partialsDir`    | Carpeta de partials (puede ser un array)                |
| `defaultLayout`  | Layout por defecto (`"main"`)                           |
| `extname`        | Extensión de las plantillas (`.handlebars` por defecto) |
| `helpers`        | Helpers disponibles en todas las vistas                 |
| `runtimeOptions` | Opciones del runtime de Handlebars (ver 5.10)           |

> [!IMPORTANT]
> `app.engine("handlebars", ...)` registra el motor con ese nombre. `app.set("view engine", "handlebars")` hace que `res.render("home")` busque `views/home.handlebars`. Si usás `extname: ".hbs"`, registrá el motor como `".hbs"` y seteá el view engine igual.

### 5.3 Layout, vistas y partials

```text
src/views/
├── layouts/
│   └── main.handlebars
├── partials/
│   ├── header.handlebars
│   ├── nav.handlebars
│   ├── footer.handlebars
│   └── post-card.handlebars
├── home.handlebars
├── post.handlebars
└── 404.handlebars
```

**Layout** (`layouts/main.handlebars`): el esqueleto común. `{{{body}}}` es el hueco donde se inserta la vista.

```handlebars
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{title}} · {{site.name}}</title>
    <link rel="stylesheet" href="/assets/css/main.css" />
  </head>
  <body>
    {{> header}}

    <main>
      {{{body}}}
    </main>

    {{> footer}}

    <script src="/assets/js/jquery.min.js"></script>
    <script src="/assets/js/main.js"></script>
  </body>
</html>
```

**Vista** (`home.handlebars`): solo el contenido de esa página.

```handlebars
<h1>{{title}}</h1>

{{#if posts.length}}
  {{#each posts}}
    {{> post-card post=this}}
  {{/each}}
{{else}}
  <p>Todavía no hay posts publicados.</p>
{{/if}}
```

**Partial** (`partials/post-card.handlebars`): un fragmento reutilizable.

```handlebars
<article class="box">
  <header>
    <h2>{{post.title}}</h2>
    <p>{{formatDate post.date}}</p>
  </header>
  <div class="content">{{post.summary}}</div>
  <footer>
    <a href="/posts/{{post.slug}}" class="button alt">Leer más</a>
  </footer>
</article>
```

Reglas de nombres de partials:

| Archivo                                     | Se invoca como          |
| ------------------------------------------- | ----------------------- |
| `views/partials/header.handlebars`          | `{{> header}}`          |
| `views/partials/components/card.handlebars` | `{{> components/card}}` |

> [!WARNING]
> Un partial que no existe lanza un error de render. Si querés un fallback, usá la sintaxis de partial block: `{{#> post-card}}Sin datos{{/post-card}}`.

### 5.4 Interpolar datos desde el controlador

El controlador decide **qué** datos recibe la vista. `res.render(vista, contexto)`:

```javascript
app.get("/", (request, response) => {
  response.render("home", {
    title: "Inicio",
    section: "home",
    site: { name: "Road Trip", tagline: "Historias de ruta" },
    posts: [
      {
        slug: "atacama",
        title: "Atacama en cuatro días",
        date: "2026-10-30",
        summary: "Salares, geisers y noches sin luz.",
        image: "banner2.jpg",
      },
    ],
  });
});
```

Contrato de datos:

| Clave     | Tipo            | Uso en la plantilla                              |
| --------- | --------------- | ------------------------------------------------ |
| `title`   | `string`        | `<title>` y encabezado                           |
| `section` | `string`        | Estado activo de la navegación (`@root.section`) |
| `site`    | `object`        | Nombre, tagline, año                             |
| `posts`   | `array<object>` | `{{#each}}` + partial `post-card`                |
| `post`    | `object`        | Vista de detalle                                 |
| `message` | `string?`       | Feedback del formulario                          |

> [!IMPORTANT]
> La vista no inventa datos. Si una clave no está en el contexto, Handlebars renderiza vacío (no lanza un error). Eso hace que un error de contrato sea silencioso: revisá la vista y el controlador juntos.

`res.render` también acepta opciones de render en el mismo objeto:

```javascript
response.render("home", { title: "Inicio", layout: "alternate" });
response.render("print", { title: "Imprimible", layout: false });
```

> [!NOTE]
> `layout: false` renderiza la vista sin layout. Es útil para fragmentos, impresión o respuestas que se consumen por JavaScript.

### 5.5 Expresiones y escape

```handlebars
{{title}}                 {{! escapa HTML }}
{{{htmlContent}}}         {{! NO escapa: solo para HTML de confianza }}
{{user.name}}             {{! ruta con punto }}
{{this}}                  {{! contexto actual }}
{{@root.site.name}}       {{! contexto raíz del render }}
{{../title}}              {{! contexto padre dentro de un bloque }}
```

`{{value}}` escapa `&`, `<`, `>`, `"`, `'`, `` ` `` y `=`. Eso evita que un dato se interprete como HTML:

| Dato                        | `{{value}}`                  | `{{{value}}}`     |
| --------------------------- | ---------------------------- | ----------------- |
| `<b>Hola</b>`               | `&lt;b&gt;Hola&lt;/b&gt;`    | `<b>Hola</b>`     |
| `<script>alert(1)</script>` | Texto visible, sin ejecución | Ejecuta el script |

> [!WARNING]
> Usá triple llave **solo** con contenido que controlás (por ejemplo, el `body` del layout). Nunca con datos que vienen del usuario, de un formulario o de una API externa. El escape de Handlebars protege el contexto HTML; no protege otros contextos como atributos sin comillas o JavaScript inline.

### 5.6 Bloques e iteración

#### `#each`

```handlebars
{{#each posts}}
  <article>
    <h2>{{this.title}}</h2>
    <p>Posición: {{@index}}</p>
    {{#if @first}}<span>Primero</span>{{/if}}
    {{#if @last}}<span>Último</span>{{/if}}
  </article>
{{else}}
  <p>No hay posts.</p>
{{/each}}
```

| Variable | Significado                     |
| -------- | ------------------------------- |
| `@index` | Índice del elemento actual      |
| `@first` | `true` en el primer elemento    |
| `@last`  | `true` en el último elemento    |
| `@key`   | Clave cuando se itera un objeto |

#### Iterar objetos

```handlebars
{{#each social}}
  <a href="{{this.url}}">{{@key}}</a>
{{/each}}
```

#### `#if`, `#unless`, `#with`

```handlebars
{{#if user}}
  <p>Hola {{user.name}}</p>
{{else}}
  <p>Invitado</p>
{{/if}}

{{#unless posts.length}}
  <p>Sin contenido todavía.</p>
{{/unless}}

{{#with banner}}
  <h1>{{title}}</h1>
  <p>{{subtitle}}</p>
{{/with}}
```

#### Block params

```handlebars
{{#each posts as |post index|}}
  <p>{{index}} — {{post.title}}</p>
{{/each}}
```

Los block params evitan depender de `this` y hacen la plantilla más legible cuando hay anidamiento.

#### `../` y `@root`

```handlebars
{{#each posts}}
  <p>{{../site.name}}</p>
  <p>{{@root.site.name}}</p>
{{/each}}
```

> [!NOTE]
> `../` sube un nivel de contexto. `@root` siempre apunta al contexto raíz del render, incluso dentro de partials y bloques anidados. Para datos globales (nombre del sitio, sección activa), `@root` es más robusto.

### 5.7 Partials con parámetros

Un partial hereda el contexto actual. También puede recibir contexto posicional o parámetros con nombre:

```handlebars
{{! contexto completo }}
{{> post-card}}

{{! contexto posicional: dentro del partial, this es el post }}
{{> post-card post}}

{{! parámetros con nombre: post e index quedan disponibles dentro }}
{{> post-card post=this index=@index}}
```

```handlebars
{{! partials/post-card.handlebars }}
<article>
  <h2>{{post.title}}</h2>
  <span>{{index}}</span>
</article>
```

> [!IMPORTANT]
> Elegí una convención y sostenela. Si el partial recibe `post=post`, dentro usás `post.title`. Si recibe el contexto posicional, dentro usás `title`. Mezclar ambas formas en el mismo proyecto produce errores difíciles de leer.

### 5.8 Helpers

#### Helpers incorporados

| Helper                   | Uso                                        |
| ------------------------ | ------------------------------------------ |
| `{{#if condition}}`      | Condicional                                |
| `{{#unless condition}}`  | Condicional invertido                      |
| `{{#each collection}}`   | Iteración                                  |
| `{{#with object}}`       | Cambia el contexto                         |
| `{{lookup array index}}` | Accede a un índice de forma dinámica       |
| `{{log value}}`          | Imprime en la consola del servidor (debug) |

#### Helpers propios

Se registran en la configuración del engine y quedan disponibles en todas las vistas:

```javascript
helpers: {
  eq: (a, b) => a === b,
  upper: (value) => String(value ?? "").toUpperCase(),
  formatDate: (value) =>
    new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(new Date(value)),
  json: (value) => JSON.stringify(value, null, 2),
}
```

Uso:

```handlebars
{{upper site.name}}

{{#if (eq section "home")}}
  <a href="/" class="active">Inicio</a>
{{/if}}

{{formatDate post.date}}
```

> [!NOTE]
> `(eq section "home")` es una **subexpresión**: se evalúa primero y su resultado se pasa a `#if`. Handlebars no trae `eq` por defecto; por eso lo registramos.

#### Helper para la navegación

```handlebars
<nav>
  <ul>
    {{#each nav}}
      <li>
        <a href="{{href}}" class="{{#if (eq id @root.section)}}active{{/if}}">
          {{label}}
        </a>
      </li>
    {{/each}}
  </ul>
</nav>
```

`@root.section` garantiza que el partial lea la sección activa aunque esté dentro de un `each`.

### 5.9 Otras cosas que se pueden hacer

| Funcionalidad            | Sintaxis / mecanismo                                      | Cuándo usarla                                   |
| ------------------------ | --------------------------------------------------------- | ----------------------------------------------- |
| Comentarios              | `{{! comentario }}` o `{{!-- con {{ }} --}}`              | Documentar la plantilla sin enviarlo al cliente |
| Control de espacios      | `{{~value~}}`                                             | Evitar espacios o saltos indeseados en el HTML  |
| Subexpresiones           | `{{#if (eq a b)}}`                                        | Componer helpers                                |
| Partial blocks           | `{{#> card}}fallback{{/card}}`                            | Fallback si el partial no existe                |
| Partials inline          | `{{#*inline "nombre"}}...{{/inline}}`                     | Definir un partial dentro de la vista           |
| Partials dinámicos       | `{{> (lookup . "partialName")}}`                          | Elegir el partial en tiempo de render           |
| Acceso por índice        | `{{lookup ../images @index}}`                             | Asociar arrays paralelos                        |
| Objetos anidados         | `{{site.author.name}}`                                    | Datos jerárquicos                               |
| Listas de listas         | `{{#each posts}}{{#each this.tags}}...{{/each}}{{/each}}` | Anidamiento                                     |
| Helpers de formato       | `{{formatDate post.date}}`                                | Fechas, moneda, mayúsculas                      |
| Serialización para debug | `{{json data}}`                                           | Inspeccionar el contexto                        |
| Precompilación           | `handlebars.precompile()`                                 | Enviar plantillas al cliente o cachear          |

> [!NOTE]
> Handlebars permite precompilar plantillas a funciones JavaScript. `express-handlebars` compila y cachea las plantillas en el servidor; en producción también cachea los archivos leídos de disco. No necesitás configurar nada para el caso de esta clase.

### 5.10 runtimeOptions y prototipos

Handlebars bloquea por defecto el acceso a propiedades y métodos que vienen del **prototipo** del objeto. Es una defensa contra acceso accidental a métodos internos.

```javascript
engine({
  runtimeOptions: {
    allowProtoPropertiesByDefault: false,
    allowProtoMethodsByDefault: false,
  },
});
```

Si pasás una instancia de una clase (por ejemplo, un modelo de ORM) y la plantilla intenta `{{user.name}}`, podés recibir un error del tipo _"access has been denied"_. La solución correcta no es habilitar los prototipos: es **pasar objetos planos**.

```javascript
// Mal: la vista recibe una instancia con métodos y prototipo
response.render("user", { user: userModel });

// Bien: el controlador arma un DTO plano
response.render("user", {
  user: { id: userModel.id, name: userModel.name, email: userModel.email },
});
```

> [!IMPORTANT]
> El controlador es el lugar donde se transforman los datos para la vista. Ese objeto plano es el **contrato** entre backend y plantilla.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 6. Arquitectura del proyecto

```text
node-fullstack-clase-05/
├── public/
│   ├── assets/
│   │   ├── css/main.css
│   │   ├── css/font-awesome.min.css
│   │   ├── fonts/...
│   │   └── js/*.js
│   └── images/*.jpg
├── src/
│   ├── data/
│   │   └── site.data.js
│   ├── views/
│   │   ├── layouts/main.handlebars
│   │   ├── partials/
│   │   │   ├── header.handlebars
│   │   │   ├── nav.handlebars
│   │   │   ├── footer.handlebars
│   │   │   └── post-card.handlebars
│   │   ├── home.handlebars
│   │   ├── post.handlebars
│   │   ├── elements.handlebars
│   │   ├── 404.handlebars
│   │   └── 500.handlebars
│   ├── app.js
│   └── server.js
├── package.json
└── README.md
```

| Archivo / carpeta | Responsabilidad                                                   |
| ----------------- | ----------------------------------------------------------------- |
| `src/server.js`   | Lee `PORT`, escucha en `0.0.0.0` y cierra ordenadamente           |
| `src/app.js`      | Crea la app, registra motor de vistas, estáticos, rutas y errores |
| `src/data/`       | Datos del sitio (posts, navegación, configuración)                |
| `src/views/`      | Plantillas Handlebars                                             |
| `public/`         | Assets estáticos: CSS, JS, imágenes, fuentes                      |
| `package.json`    | Dependencias y scripts (`dev`, `start`)                           |

Separar `app.js` de `server.js` tiene una ventaja concreta: `app.js` se puede importar en un test sin abrir un puerto. `server.js` es el único que conoce el entorno de ejecución.

```javascript
// src/app.js
import express from "express";
import path from "node:path";
import { engine } from "express-handlebars";
import { nav, posts, site } from "./data/site.data.js";

const app = express();
const viewsDir = path.join(import.meta.dirname, "views");
const publicDir = path.join(import.meta.dirname, "..", "public");

app.engine(
  "handlebars",
  engine({
    layoutsDir: path.join(viewsDir, "layouts"),
    partialsDir: path.join(viewsDir, "partials"),
    defaultLayout: "main",
    helpers: {
      eq: (a, b) => a === b,
      formatDate: (value) =>
        new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(
          new Date(value),
        ),
    },
  }),
);

app.set("view engine", "handlebars");
app.set("views", viewsDir);

app.use(express.static(publicDir));
app.use(express.urlencoded({ extended: false }));

app.get("/", (request, response) => {
  response.render("home", {
    title: "Inicio",
    section: "home",
    site,
    nav,
    posts,
  });
});

app.get("/posts/:slug", (request, response, next) => {
  const post = posts.find((item) => item.slug === request.params.slug);

  if (!post) {
    return next();
  }

  response.render("post", {
    title: post.title,
    section: "posts",
    site,
    nav,
    post,
  });
});

app.get("/elements", (request, response) => {
  response.render("elements", {
    title: "Elements",
    section: "elements",
    site,
    nav,
  });
});

app.use((request, response) => {
  response
    .status(404)
    .render("404", { title: "No encontrado", section: "404", site, nav });
});

app.use((error, request, response, next) => {
  console.error(error);
  response
    .status(500)
    .render("500", { title: "Error", section: "500", site, nav });
});

export default app;
```

```javascript
// src/server.js
import app from "./app.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = "0.0.0.0";

const server = app.listen(PORT, HOST, (error) => {
  if (error) {
    console.error(`No se pudo iniciar el servidor: ${error.message}`);
    process.exit(1);
  }

  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    console.log(`${signal} recibido: cerrando servidor...`);
    server.close(() => process.exit(0));
  });
}
```

> [!NOTE]
> `app.listen()` en Express 5 recibe el error de arranque en el callback. En Node nativo, `server.listen()` no; por eso en `native-server.js` usamos `server.on("error", ...)`.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## Referencias

- [Node.js — sitio oficial en español](https://nodejs.org/es)
- [Node.js — Anatomía de una transacción HTTP](https://nodejs.org/learn/http/anatomy-of-an-http-transaction)
- [Node.js — módulo `http` (API)](https://nodejs.org/api/http.html)
- [Node.js — Event Loop](https://nodejs.org/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [Express — documentación oficial](https://expressjs.com/)
- [Express — instalación](https://expressjs.com/en/5x/starter/installing.html)
- [Express — routing](https://expressjs.com/en/5x/guide/routing.html)
- [Express — middleware](https://expressjs.com/en/5x/guide/using-middleware.html)
- [Express — servir archivos estáticos](https://expressjs.com/en/5x/starter/static-files.html)
- [Express — manejo de errores](https://expressjs.com/en/5x/guide/error-handling.html)
- [Express — migración a v5](https://expressjs.com/en/guide/migrating-5.html)
- [`express` — npm](https://www.npmjs.com/package/express)
- [`express-handlebars` — npm](https://www.npmjs.com/package/express-handlebars)
- [`handlebars` — npm](https://www.npmjs.com/package/handlebars)
- [Handlebars — guía](https://handlebarsjs.com/guide/)
- [Handlebars — expresiones](https://handlebarsjs.com/guide/expressions.html)
- [Handlebars — built-in helpers](https://handlebarsjs.com/guide/builtin-helpers.html)
- [Handlebars — partials](https://handlebarsjs.com/guide/partials.html)
- [Handlebars — seguridad](https://handlebarsjs.com/guide/security.html)
- [Railway — sitio oficial](https://railway.com/)
- [Railway — documentación](https://docs.railway.com/)
- [Railway — deploy de una app Express](https://docs.railway.com/guides/express)
- [Railway — build and start commands](https://docs.railway.com/builds/build-and-start-commands)
- [Railway — public networking](https://docs.railway.com/networking/public-networking)

## Mentor

**Ariel Duarte** · Kopius · The Academy

<sub>[⬆ Volver al índice](#contenido)</sub>
