<div align="center">

<a href="https://nodejs.org/en" target="_blank"><img src="https://user-images.githubusercontent.com/3438503/260495760-ca5d8c24-b382-43d9-8fbe-d905b4b208f0.png" width="260" alt="Logo de Node.js" /></a>

# Clase 4 de NodeJS

### Kopius · The Academy · Cohort 05 · M3

**Peticiones HTTP: variables de entorno, Fetch API, Axios y el patrón Adapter**

![Node.js](https://img.shields.io/badge/Node.js-24.x-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)

</div>

---

## CONTENIDO

1. [Variables de entorno](#1-variables-de-entorno-environment-variables)
2. [Peticiones HTTP básicas](#2-peticiones-http-básicas)
3. [Fetch API](#3-fetch-api)
   - [Tarea 008: Cliente HTTP con Fetch API](#tarea-008-cliente-http-con-fetch-api)
4. [Axios](#4-axios)
   - [Diferencias entre Fetch API y Axios](#41-diferencias-entre-fetch-api-y-axios)
   - [Tarea 009: Implementar el patrón Adapter para Axios](#tarea-009-implementar-el-patrón-adapter-para-axios)
5. [Referencias](#referencias)

---

> [!NOTE]
> Esta clase continúa el recorrido de la [Clase 3](https://github.com/aduartekopiustech/node-fullstack-clase-03). Allí aprendimos **Promises**, **Async/Await**, **objetos**, **arrays** y el **patrón Adapter**. Ahora aplicamos todo eso a un escenario real: comunicarnos con servicios externos mediante peticiones HTTP.

---

## 1. Variables de entorno (Environment Variables)

Hasta ahora, la configuración de nuestras aplicaciones vivía dentro del código. Una URL, un puerto o una clave de acceso escritos directamente en un archivo funcionan en nuestra máquina, pero se convierten en un problema cuando el proyecto se ejecuta en otro entorno, se comparte con el equipo o se publica en un servidor.

Las **variables de entorno** (_environment variables_) son pares de clave y valor que el sistema operativo entrega a un proceso cuando se inicia. Permiten que una misma aplicación reciba configuración distinta sin modificar su código fuente.

| Problema                                             | Solución con variables de entorno                      |
| ---------------------------------------------------- | ------------------------------------------------------ |
| La URL de la API cambia entre desarrollo y producción | Cada entorno define su propio valor                    |
| Las credenciales no deben vivir en el repositorio     | Se cargan desde el entorno o desde un archivo ignorado |
| El puerto depende de la máquina o del hosting         | El entorno lo define (`PORT`)                          |
| El equipo necesita valores de referencia              | Se comparte un archivo `.env.example` sin secretos     |

> [!IMPORTANT]
> Las variables de entorno no son un lugar para reglas de negocio. Su responsabilidad es **configurar** la aplicación: dónde se conecta, con qué credenciales y en qué modo se ejecuta. La lógica vive en el código.

### Leer variables de entorno en Node.js

Node.js expone las variables de entorno a través del objeto global `process.env`. Cada variable se lee como una propiedad:

```javascript
console.log(process.env.NODE_ENV); // "development"
console.log(process.env.PORT); // "3000"
```

> [!WARNING]
> Los valores de `process.env` son **siempre strings**. Si necesitamos un número o un booleano, debemos convertirlo explícitamente.

```javascript
const port = Number(process.env.PORT ?? 3000);
const isProduction = process.env.NODE_ENV === "production";
```

También es posible definir variables al iniciar el proceso, sin ningún archivo:

```bash
NODE_ENV=production PORT=8080 node src/app.js
```

### El archivo `.env`

Escribir las variables en cada comando es incómodo durante el desarrollo. La convención es guardarlas en un archivo `.env` en la raíz del proyecto:

```bash
# .env
NODE_ENV=development
PORT=3000
REQRES_BASE_URL=https://reqres.in/api
```

El formato es simple:

- Una variable por línea, con la forma `CLAVE=valor`.
- Sin espacios alrededor del `=`.
- Las líneas que comienzan con `#` son comentarios.
- Si el valor contiene espacios, se puede escribir entre comillas.

Node.js puede leer ese archivo de forma nativa al iniciar el proceso con la opción `--env-file`:

```bash
node --env-file=.env src/app.js
```

La opción está disponible desde **Node.js 20.6**. En versiones recientes también existe `--env-file-if-exists`, que no falla si el archivo no está presente.

Una alternativa muy utilizada es la librería `dotenv`:

```bash
npm install dotenv
```

```javascript
// Debe ejecutarse antes de leer process.env
import "dotenv/config";
```

> [!NOTE]
> Si una variable existe tanto en el entorno real como en el archivo `.env`, **gana el valor del entorno**. El archivo es un complemento para el desarrollo, no un reemplazo de la configuración del sistema.

### No versionar secretos

El archivo `.env` contiene datos propios de cada entorno y, muchas veces, credenciales. **Nunca debe subirse al repositorio.**

```bash
# .gitignore
node_modules
.env
```

En su lugar, se versiona un archivo de ejemplo con las claves necesarias y valores vacíos o de demostración:

```bash
# .env.example
NODE_ENV=development
PORT=3000
REQRES_BASE_URL=https://reqres.in/api
```

Así, cualquier persona del equipo sabe qué variables necesita, sin recibir secretos reales. En la documentación del proyecto se indica copiar el ejemplo:

```bash
cp .env.example .env
```

### Centralizar la configuración

Leer `process.env` en cualquier archivo dispersa el conocimiento de la configuración por todo el proyecto. Es preferible tener un único módulo que lea, valide y exponga los valores con nombres claros.

**1. Crear el módulo de configuración**

```javascript
// src/config/env.config.js
const requiredVariables = ["REQRES_BASE_URL"];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  reqresBaseUrl: process.env.REQRES_BASE_URL.replace(/\/+$/, ""),
};

export default env;
```

Este módulo aporta tres beneficios:

1. **Valida al inicio**: si falta una variable obligatoria, el error aparece de inmediato y no cuando se realiza la primera petición.
2. **Normaliza los tipos**: `port` ya es un número, no un string.
3. **Concentra los valores por defecto**: el resto del código no repite `?? "fetch"`.

**2. Configurar los scripts**

```json
{
  "type": "module",
  "scripts": {
    "start": "node --env-file-if-exists=.env src/app.js",
    "dev": "node --env-file-if-exists=.env --watch src/app.js"
  }
}
```

Con esto, `npm start` carga automáticamente el archivo `.env`.

**Variables que utilizaremos en la clase**

| Variable          | Ejemplo                 | Uso                     |
| ----------------- | ----------------------- | ----------------------- |
| `REQRES_BASE_URL` | `https://reqres.in/api` | URL base de la API      |
| `PORT`            | `3000`                  | Puerto de la aplicación |
| `NODE_ENV`        | `development`           | Modo de ejecución       |

> [!TIP]
> **Desafío**
>
> Ejecutar la aplicación sin el archivo `.env` y comprobar qué ocurre. Luego, ejecutarla con `REQRES_BASE_URL=https://reqres.in/api npm start` para verificar que el valor del entorno tiene prioridad sobre el archivo.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 2. Peticiones HTTP básicas

**Objetivo**

Comprender cómo realizar peticiones HTTP desde Node.js utilizando **Fetch API** y **Axios**, interpretar respuestas JSON y aplicar el patrón de diseño **Adapter** para organizar y reutilizar nuestro código.

### ¿Qué es una petición HTTP?

Una petición HTTP es un mecanismo de comunicación que permite a una aplicación solicitar información o enviar datos a un servidor. El modelo se conoce como **cliente-servidor**: el cliente realiza una solicitud y el servidor devuelve una respuesta.

Cuando desarrollamos aplicaciones con Node.js, normalmente utilizamos peticiones HTTP para consumir servicios externos, conocidos como **APIs** (_Application Programming Interfaces_). Una API define qué recursos ofrece un servidor y cómo se accede a ellos.

```text
Cliente (Node.js)                         Servidor (API)
       │                                       │
       │  ── GET /api/users/2 ──────────────>  │
       │                                       │
       │  <── 200 OK + JSON ─────────────────  │
       │                                       │
```

Toda comunicación HTTP se compone de dos mensajes: la **request** (lo que envía el cliente) y la **response** (lo que devuelve el servidor).

### Anatomía de una petición

Una petición HTTP contiene, como mínimo:

| Componente        | Descripción                                                      |
| ----------------- | ---------------------------------------------------------------- |
| **Método**        | Indica la acción que queremos realizar (`GET`, `POST`, etc.)     |
| **URL**           | Identifica el recurso sobre el que se actúa                      |
| **Headers**       | Metadatos de la petición, como el formato del cuerpo             |
| **Body** (opcional) | Datos que enviamos al servidor                                 |

### Anatomía de una URL

Tomemos como ejemplo el endpoint de usuarios de [Reqres](https://reqres.in/):

```http
GET https://reqres.in/api/users/2?page=1
```

| Parte               | Valor                   | Descripción                                  |
| ------------------- | ----------------------- | -------------------------------------------- |
| **Protocolo**       | `https`                 | Comunicación cifrada                         |
| **Host**            | `reqres.in`             | Servidor que responde                        |
| **Base URL**        | `https://reqres.in/api` | Prefijo común de todos los endpoints         |
| **Path**            | `/users/2`              | Ruta del recurso                             |
| **Path parameter**  | `2`                     | Identificador del usuario dentro de la ruta  |
| **Query parameter** | `page=1`                | Parámetro opcional, comienza con `?`         |

Los **path parameters** forman parte de la ruta y suelen ser obligatorios (`/users/2`). Los **query parameters** son opcionales y modifican la consulta (`?page=2`). Varios query parameters se separan con `&`.

### Métodos HTTP

Los métodos HTTP más utilizados son:

| Método   | Descripción                               | Tiene body |
| -------- | ----------------------------------------- | ---------- |
| `GET`    | Obtener información de un servidor        | No         |
| `POST`   | Enviar información para crear un recurso  | Sí         |
| `PUT`    | Reemplazar o actualizar un recurso        | Sí         |
| `PATCH`  | Modificar parcialmente un recurso         | Sí         |
| `DELETE` | Eliminar un recurso                       | No         |

> [!NOTE]
> `GET`, `PUT` y `DELETE` son **idempotentes**: repetir la misma petición produce el mismo estado final en el servidor. `POST` no lo es: repetirlo puede crear recursos duplicados. Esta diferencia es clave al diseñar reintentos.

### Códigos de estado

El servidor responde con un código numérico que indica el resultado de la operación.

| Rango | Significado   | Ejemplos habituales                                  |
| ----- | ------------- | ---------------------------------------------------- |
| `2xx` | Éxito         | `200 OK`, `201 Created`, `204 No Content`            |
| `3xx` | Redirección   | `301 Moved Permanently`, `304 Not Modified`          |
| `4xx` | Error del cliente | `400 Bad Request`, `401 Unauthorized`, `404 Not Found` |
| `5xx` | Error del servidor | `500 Internal Server Error`, `503 Service Unavailable` |

Conocer los códigos permite distinguir entre un error de nuestra petición (`4xx`) y una falla del servicio (`5xx`). Esa diferencia cambia por completo la estrategia de manejo de errores.

### Headers y body

Los **headers** son metadatos que acompañan a la petición o a la respuesta. Los más relevantes al consumir APIs son:

| Header          | Ejemplo              | Uso                                             |
| --------------- | -------------------- | ----------------------------------------------- |
| `Content-Type`  | `application/json`   | Formato del body que enviamos                   |
| `Accept`        | `application/json`   | Formato de respuesta que esperamos              |
| `Authorization` | `Bearer <token>`     | Credenciales de acceso                          |

El **body** contiene los datos que enviamos al servidor. En APIs modernas suele estar en formato **JSON** (_JavaScript Object Notation_), un formato de texto con pares de clave y valor que puede convertirse fácilmente a objetos de JavaScript.

```javascript
const payload = { name: "Ada", job: "Engineer" };

const body = JSON.stringify(payload); // object → string
const data = JSON.parse(body); // string → object
```

> [!WARNING]
> El body viaja como **texto**. Por eso usamos `JSON.stringify()` antes de enviarlo. La respuesta también llega como texto y debe convertirse con `JSON.parse()` o con el método que provea la librería cliente.

### Consumir nuestra primera API de usuarios: Reqres

Nuestra API de prueba: https://reqres.in/api/users/2

#### Endpoint

```http
GET https://reqres.in/api/users/2
```

Analicemos sus componentes:

- **Base URL:** `https://reqres.in/api`
- **Endpoint:** `/users/2`
- **Path parameter:** `id`, identificador de usuario.

Podemos reemplazar `id` por `1`, `2`, etc.

#### Ejemplo de respuesta JSON

```json
{
  "data": {
    "id": 2,
    "email": "janet.weaver@reqres.in",
    "first_name": "Janet",
    "last_name": "Weaver",
    "avatar": "https://reqres.in/img/faces/2-image.jpg"
  },
  "support": {
    "url": "https://reqres.in/go/posthog",
    "text": "PostHog ingests and stores your analytics, errors, replays, and business data..."
  }
}
```

> [!NOTE]
> Reqres devuelve los datos del usuario dentro de la propiedad `data`. La respuesta también incluye metadatos como `support` y `_meta`. Al consumir una API real, siempre debemos revisar la forma exacta de la respuesta antes de escribir código.

#### Endpoints disponibles para practicar

| Método   | Endpoint        | Resultado esperado                          |
| -------- | --------------- | ------------------------------------------- |
| `GET`    | `/users?page=2` | Lista paginada de usuarios                  |
| `GET`    | `/users/2`      | Un usuario dentro de `data`                 |
| `POST`   | `/users`        | `201 Created` con el recurso creado         |
| `PUT`    | `/users/2`      | `200 OK` con el recurso reemplazado         |
| `PATCH`  | `/users/2`      | `200 OK` con los campos modificados         |
| `DELETE` | `/users/2`      | `204 No Content`, sin body                  |

> [!NOTE]
> La demo pública de Reqres tiene un límite diario bajo. Si se agota, conviene esperar o utilizar otra API de prueba mientras se practica.

#### Probar un endpoint sin escribir código

Antes de programar, conviene verificar manualmente que el endpoint responde como esperamos. `curl` está disponible en la mayoría de los sistemas:

```bash
curl https://reqres.in/api/users/2
```

También se puede abrir la URL en el navegador o utilizar herramientas como Postman o la extensión Thunder Client.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 3. Fetch API

La **Fetch API** es una interfaz nativa de JavaScript que permite realizar peticiones HTTP.

En las versiones modernas de Node.js podemos utilizar `fetch()` sin instalar dependencias adicionales. Está disponible de forma global desde **Node.js 18** y es estable a partir de **Node.js 21**.

La función `fetch()` devuelve una **Promise**, por lo que normalmente utilizamos `async/await` para trabajar con su resultado.

| Característica        | Detalle                                       |
| --------------------- | --------------------------------------------- |
| Origen                | API nativa del runtime                        |
| Instalación           | No requiere dependencias                      |
| Resultado             | Una `Promise` que resuelve a un `Response`    |
| Conversión a JSON     | Manual, con `response.json()`                 |
| Errores HTTP (4xx/5xx)| No rechaza; se verifica con `response.ok`     |

### Primera petición con `fetch()`

```javascript
// src/app.js
import env from "./config/env.config.js";

const getUserById = async (id) => {
  const response = await fetch(`${env.reqresBaseUrl}/users/${id}`);

  console.log(response.status); // 200
  console.log(response.ok); // true

  const body = await response.json();

  return body.data;
};

const main = async () => {
  try {
    const user = await getUserById(2);

    console.log(user);
  } catch (error) {
    console.error(error.message);
  }
};

main();
```

Paso a paso:

1. `fetch()` inicia la petición y devuelve una promesa.
2. `await` espera la respuesta, que es un objeto `Response`.
3. `response.json()` lee el body y lo convierte a un objeto de JavaScript.

### El objeto `Response`

| Propiedad o método | Descripción                                                         |
| ------------------ | ------------------------------------------------------------------- |
| `status`           | Código de estado HTTP, por ejemplo `200` o `404`                    |
| `ok`               | `true` cuando el estado está entre `200` y `299`                    |
| `headers`          | Headers de la respuesta                                             |
| `json()`           | Convierte el body a un objeto. Devuelve una promesa                 |
| `text()`           | Devuelve el body como texto                                         |
| `body`             | Stream con el contenido crudo de la respuesta                       |

> [!WARNING]
> El body se puede leer **una sola vez**. Si se llama dos veces a `response.json()`, la segunda produce un error. Si se necesita el contenido en dos lugares, se debe guardar el resultado en una variable.

### Manejo de errores

Este es el punto que más sorprende al comenzar con Fetch API.

```javascript
const response = await fetch(`${env.reqresBaseUrl}/users/9999`);

console.log(response.status); // 404
console.log(response.ok); // false
```

`fetch()` **solo rechaza la promesa cuando la petición no pudo completarse**, por ejemplo por un problema de red o porque el dominio no existe. Si el servidor responde `404` o `500`, la promesa se resuelve correctamente: el error HTTP está en la respuesta, no en la promesa.

Por eso siempre debemos verificar `response.ok`:

```javascript
const request = async (url, options) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response;
};
```

| Situación                        | ¿`fetch()` rechaza? | Cómo detectarlo            |
| -------------------------------- | ------------------- | -------------------------- |
| Fallo de red o DNS               | Sí                  | `try/catch`                |
| Timeout                          | Sí, con `AbortSignal` | `try/catch`              |
| `404 Not Found`                  | No                  | `response.ok === false`    |
| `500 Internal Server Error`      | No                  | `response.ok === false`    |

### Enviar datos con `POST`

```javascript
const createUser = async ({ name, job }) => {
  const response = await fetch(`${env.reqresBaseUrl}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ name, job }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
};
```

Los elementos nuevos respecto de un `GET`:

- `method`: indica la acción. Si se omite, el valor por defecto es `"GET"`.
- `headers`: declaran que el body está en formato JSON.
- `body`: contiene los datos serializados. Debe ser un string.

### Respuestas sin contenido

`DELETE` en Reqres responde `204 No Content`, es decir, **sin body**. Llamar a `response.json()` sobre una respuesta vacía produce un error.

```javascript
if (response.status === 204) {
  return null;
}
```

Este detalle será parte de la Tarea 008: el cliente HTTP debe poder convivir con respuestas que sí tienen body y con respuestas que no.

### Buenas prácticas al usar `fetch()`

| Práctica                                   | Motivo                                                 |
| ------------------------------------------ | ------------------------------------------------------ |
| Verificar `response.ok`                    | Los errores HTTP no rechazan la promesa                |
| No hardcodear la base URL                  | Debe venir de la configuración                         |
| Enviar `Accept` y `Content-Type`           | El servidor y el cliente acuerdan el formato           |
| Manejar respuestas `204`                   | No todas las respuestas tienen body                    |
| Definir un timeout con `AbortSignal.timeout()` | Evita esperas indefinidas                          |

```javascript
const response = await fetch(`${env.reqresBaseUrl}/users/2`, {
  signal: AbortSignal.timeout(5000),
});
```

> [!TIP]
> `AbortSignal.timeout(ms)` cancela la petición si tarda más de lo indicado y hace que `fetch()` rechace la promesa. Es la forma nativa de evitar que una petición quede esperando para siempre.

#### Tarea 008: Cliente HTTP con Fetch API

> [!IMPORTANT]
> **Objetivo**
>
> Construir un cliente HTTP basado en **Fetch API** que soporte todos los métodos vistos, utilizando **variables de entorno** para la configuración, un **adaptador** que aísle la librería HTTP y una **capa de servicio** que exponga operaciones del dominio de usuarios.
>
> Al finalizar, la aplicación deberá poder listar, consultar, crear, actualizar y eliminar usuarios, con manejo de errores mediante `async/await`.

**Escenario**

Nuestra aplicación necesita consumir la API de Reqres. Si mañana cambiamos la librería HTTP, la capa de servicio no debería modificarse. Para lograrlo, separamos responsabilidades en tres capas:

| Capa              | Responsabilidad                                                     |
| ----------------- | ------------------------------------------------------------------- |
| **Configuración** | Leer y validar las variables de entorno                             |
| **Adaptador**     | Traducir nuestras llamadas a la librería HTTP concreta              |
| **Servicio**      | Exponer operaciones del dominio y conocer la forma de los datos     |

**1. Crear la configuración**

Crear `src/config/env.config.js` con el módulo de configuración de la sección 1. Debe:

1. Validar que `REQRES_BASE_URL` esté definida.
2. Exportar `reqresBaseUrl`, `port` y `nodeEnv`.
3. Convertir `port` a número.

Crear también `.env.example` y agregar `.env` al `.gitignore`.

**2. Crear el adaptador de Fetch**

Crear `src/adapters/http/fetch.adapter.js`. Debe exportar un objeto con cinco funciones:

| Función             | Firma                                  | Resultado                                  |
| ------------------- | -------------------------------------- | ------------------------------------------ |
| `get`               | `get(path, options?)`                  | Body parseado                              |
| `post`              | `post(path, body, options?)`           | Body parseado                              |
| `put`               | `put(path, body, options?)`            | Body parseado                              |
| `patch`             | `patch(path, body, options?)`          | Body parseado                              |
| `delete`            | `delete(path, options?)`               | `null` cuando la respuesta es `204`        |

La ruta recibida será relativa a la base URL configurada. El adaptador deberá:

1. Construir la URL completa con `env.reqresBaseUrl`.
2. Enviar `Accept: application/json` siempre y `Content-Type: application/json` cuando la petición tenga body.
3. Rechazar un `Error` cuando `response.ok` sea `false`, incluyendo el código de estado.
4. Devolver `null` cuando el estado sea `204` y, en el resto de los casos, el body parseado.

> [!NOTE]
> Ningún módulo fuera del adaptador debe conocer `fetch()`. Esa es la esencia del patrón Adapter: la dependencia queda encerrada en un único lugar.

**3. Crear la capa de servicio**

Crear `src/services/user.service.js`. Debe exportar una **Factory Function** `createUserService(adapter)` que reciba el adaptador como dependencia y retorne un objeto con las operaciones del dominio:

| Función                      | Endpoint                          |
| ---------------------------- | --------------------------------- |
| `getUsers(page = 1)`         | `GET /users?page=<page>`          |
| `getUserById(id)`            | `GET /users/<id>`                 |
| `createUser(user)`           | `POST /users`                     |
| `updateUser(id, user)`       | `PUT /users/<id>`                 |
| `patchUser(id, user)`        | `PATCH /users/<id>`               |
| `deleteUser(id)`             | `DELETE /users/<id>`              |

Reglas:

1. La Factory Function debe validar que el cliente recibido implemente `get`, `post`, `put`, `patch` y `delete`. Si falta alguno, debe lanzar un `Error`.
2. Todas las funciones deben ser `async`.
3. Deben utilizar `await` sobre el adaptador.
4. `getUsers()` y `getUserById()` deben extraer la propiedad `data` de la respuesta.
5. `createUser()`, `updateUser()` y `patchUser()` deben retornar el objeto devuelto por la API.
6. El servicio no debe importar `fetch`, `axios` ni un adaptador concreto: lo recibe como parámetro.

> [!NOTE]
> El servicio depende de una **interfaz**, no de una implementación. Esa es la aplicación práctica del principio de inversión de dependencias: quien compone la aplicación decide qué adaptador entregar.

**4. Ejecutar desde `app.js`**

En `src/app.js`, importar el adaptador de Fetch y la Factory Function, y componer el servicio:

```javascript
import fetchAdapter from "./adapters/http/fetch.adapter.js";
import createUserService from "./services/user.service.js";

const userService = createUserService(fetchAdapter);
```

Luego, demostrar los seis métodos usando `userService`:

1. Listar la primera página de usuarios.
2. Consultar un usuario por `id`.
3. Crear un usuario con `name` y `job`.
4. Reemplazar un usuario con `PUT`.
5. Modificar parcialmente un usuario con `PATCH`.
6. Eliminar un usuario.

Cada operación debe ejecutarse dentro de un `try/catch` que informe el error y un `finally` que indique que el proceso terminó.

**Estructura esperada**

```text
node-fullstack-clase-04/
├── src/
│   ├── adapters/
│   │   └── http/
│   │       └── fetch.adapter.js
│   ├── config/
│   │   └── env.config.js
│   ├── services/
│   │   └── user.service.js
│   └── app.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

**Criterios de aceptación**

- La base URL se obtiene de una variable de entorno; no está escrita en el código.
- El adaptador es el único módulo que utiliza `fetch()`.
- El servicio recibe el adaptador como dependencia: no importa `fetch` ni el adaptador.
- El servicio no conoce headers, códigos de estado ni la forma en que se ejecuta la petición.
- Se implementan los métodos `GET`, `POST`, `PUT`, `PATCH` y `DELETE`.
- Los errores HTTP se detectan mediante `response.ok` y se propagan como `Error`.
- Las respuestas `204` no producen errores de parseo.
- La aplicación se ejecuta correctamente mediante `npm start`.

> [!TIP]
> **Desafío**
>
> Consultar un usuario inexistente, por ejemplo `getUserById(9999)`, y verificar que el error mostrado incluya el código `404`. Luego, agregar a cada petición un timeout con `AbortSignal.timeout()` y comprobar que el adaptador sigue funcionando con las operaciones exitosas.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 4. Axios

**Axios** es una librería externa que permite realizar peticiones HTTP desde Node.js y aplicaciones web.

Ofrece funcionalidades similares a Fetch API, pero incorpora características adicionales, como la transformación automática de respuestas JSON, configuración de instancias e interceptores.

### Instalación

```bash
npm install axios
```

A diferencia de Fetch API, Axios **debe instalarse como una dependencia**. Queda registrado en `package.json` y se instala junto con el proyecto en cualquier entorno.

### 4.1 Diferencias entre Fetch API y Axios

Ambas alternativas son válidas para desarrollar aplicaciones con Node.js. La elección depende del contexto: `fetch` no agrega dependencias y es suficiente para la mayoría de los casos; Axios ofrece una API más cómoda cuando se necesita configuración compartida o interceptores.

| Característica              | Fetch API             | Axios                          |
| --------------------------- | --------------------- | ------------------------------ |
| Instalación                 | No requiere           | `npm install axios`            |
| Peticiones HTTP             | Sí                    | Sí                             |
| Async/Await                 | Sí                    | Sí                             |
| Conversión JSON             | `response.json()`     | Automática                     |
| Errores HTTP                | Verificación manual   | Rechazo automático por defecto |
| Interceptores               | No integrados         | Sí                             |
| Configuración de parámetros | URL / `URLSearchParams` | `params`                     |

Diferencias que conviene retener:

1. **Respuesta**: `fetch` entrega un objeto `Response`; Axios entrega directamente un objeto con `data`, `status`, `headers` y `config`. El body ya viene parseado en `response.data`.
2. **Errores**: `fetch` resuelve la promesa aunque el estado sea `404`; Axios la **rechaza** para cualquier estado fuera del rango `2xx`. El error incluye `error.response.status`.
3. **Configuración**: Axios permite crear una instancia con `baseURL`, headers y timeout comunes a todas las peticiones.
4. **Interceptores**: Axios permite ejecutar lógica antes de enviar una petición o después de recibir una respuesta. `fetch` no los incluye.

### 4.2 Consumir Reqres con Axios

```javascript
// src/app.js
import axios from "axios";
import env from "./config/env.config.js";

const getUserById = async (id) => {
  const response = await axios.get(`${env.reqresBaseUrl}/users/${id}`, {
    headers: {
      Accept: "application/json",
    },
  });

  return response.data.data;
};

const main = async () => {
  try {
    const user = await getUserById(2);

    console.log(user);
  } catch (error) {
    console.error(error.message);
  }
};

main();
```

La respuesta de Axios tiene esta forma:

| Propiedad  | Descripción                                          |
| ---------- | ---------------------------------------------------- |
| `data`     | Body de la respuesta, ya convertido a objeto         |
| `status`   | Código de estado HTTP                                |
| `headers`  | Headers de la respuesta                              |
| `config`   | Configuración utilizada para realizar la petición    |
| `request`  | Petición que originó la respuesta                    |

> [!NOTE]
> Reqres envuelve los datos del usuario en `data`. Por eso el ejemplo accede a `response.data.data`: el primer `data` es de Axios y el segundo de la API. Revisar siempre la forma de la respuesta evita confusiones como esta.

#### Enviar datos y manejar errores

```javascript
const createUser = async ({ name, job }) => {
  const response = await axios.post(`${env.reqresBaseUrl}/users`, {
    name,
    job,
  });

  return response.data;
};
```

Con Axios no es necesario `JSON.stringify()` ni el header `Content-Type` para enviar un objeto JSON: la librería detecta el contenido, lo serializa y define el header automáticamente.

El manejo de errores se apoya en `try/catch`:

```javascript
try {
  await getUserById(9999);
} catch (error) {
  if (error.response) {
    // El servidor respondió con un estado fuera de 2xx
    console.error(error.response.status);
    console.error(error.response.data);
  } else if (error.request) {
    // La petición se envió, pero no hubo respuesta
    console.error("No response received");
  } else {
    // Falló la configuración de la petición
    console.error(error.message);
  }
}
```

| Tipo de error       | Cuándo ocurre                                | Dónde se encuentra          |
| ------------------- | -------------------------------------------- | --------------------------- |
| `error.response`    | El servidor respondió con `4xx` o `5xx`      | `status`, `data`, `headers` |
| `error.request`     | No se recibió respuesta                      | Objeto de la petición       |
| `error.message`     | Falló la configuración de la petición        | Texto descriptivo           |

#### Instancias e interceptores

Cuando todas las peticiones comparten configuración, conviene crear una **instancia**:

```javascript
// src/adapters/http/axios.client.js
import axios from "axios";
import env from "../../config/env.config.js";

const axiosClient = axios.create({
  baseURL: env.reqresBaseUrl,
  timeout: 5000,
  headers: {
    Accept: "application/json",
  },
});

export default axiosClient;
```

Con la instancia, cada llamada usa una ruta relativa:

```javascript
const response = await axiosClient.get("/users/2");
```

Los **interceptores** permiten ejecutar código alrededor de cada petición:

```javascript
axiosClient.interceptors.request.use((config) => {
  console.log(`${config.method.toUpperCase()} ${config.url}`);

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`Request failed: ${error.response?.status ?? "unknown"}`);

    return Promise.reject(error);
  },
);
```

> [!TIP]
> El interceptor de request recibe la configuración y debe retornarla. El de response recibe la respuesta o el error y debe devolver el valor que queremos propagar. Olvidar el `return` es el error más común al escribirlos.

#### Tarea 009: Implementar el patrón Adapter para Axios

> [!IMPORTANT]
> **Objetivo**
>
> Implementar un **adaptador de Axios** con la misma interfaz que el adaptador de Fetch de la Tarea 008 y reemplazar la implementación activa sin modificar la capa de servicio.
>
> Al finalizar, el servicio de usuarios deberá seguir funcionando exactamente igual, aunque por debajo la librería HTTP haya cambiado.

**Escenario**

La Tarea 008 dejó el proyecto organizado en tres capas. Ahora llega el momento de comprobar si la separación fue real: si el servicio conoce `fetch()`, el reemplazo fallará. Si solo conoce el contrato del adaptador, el cambio será transparente.

```text
app.js  →  createUserService(adapter)  →  adapters/http/fetch.adapter.js
                                       →  adapters/http/axios.adapter.js
```

**1. Crear el adaptador de Axios**

Crear `src/adapters/http/axios.adapter.js`. Debe exportar las mismas cinco funciones que el adaptador de Fetch, con las mismas firmas y el mismo formato de retorno:

| Función  | Debe retornar                                              |
| -------- | ---------------------------------------------------------- |
| `get`    | Body parseado                                              |
| `post`   | Body parseado                                              |
| `put`    | Body parseado                                              |
| `patch`  | Body parseado                                              |
| `delete` | `null` cuando la respuesta es `204`                        |

El adaptador deberá:

1. Crear una instancia de Axios con `baseURL` y `timeout` definidos.
2. Recibir rutas relativas, igual que el adaptador de Fetch.
3. Retornar `response.data`, no el objeto completo de Axios.
4. Retornar `null` cuando el estado sea `204`.
5. No exponer detalles de Axios hacia afuera.

> [!IMPORTANT]
> La interfaz es el contrato. Si el adaptador de Axios devuelve el objeto completo de Axios y el de Fetch devuelve solo el body, los dos adaptadores no son intercambiables y el servicio necesitaría dos versiones. La consistencia del contrato es lo que permite el reemplazo.

**2. Elegir el adaptador en el punto de composición**

En `src/app.js`, el servicio se crea con el adaptador elegido. No hay variable de entorno ni módulo intermediario: la decisión es explícita y vive en un único lugar.

```javascript
import axiosAdapter from "./adapters/http/axios.adapter.js";
import createUserService from "./services/user.service.js";

const userService = createUserService(axiosAdapter);
```

Para volver a Fetch API, se cambia el import y el argumento:

```javascript
import fetchAdapter from "./adapters/http/fetch.adapter.js";
import createUserService from "./services/user.service.js";

const userService = createUserService(fetchAdapter);
```

> [!NOTE]
> Este punto se conoce como **composition root**: el lugar donde se ensamblan las piezas de la aplicación. Los módulos de negocio no eligen sus dependencias: las reciben.

**3. Verificar que el servicio no cambia**

`src/services/user.service.js` no debe modificarse. Si aparece un `import` de `axios`, de `fetch` o de un adaptador concreto dentro del servicio, la dependencia está mal ubicada: el servicio solo debe conocer el contrato que recibe por parámetro.

**4. Verificar el reemplazo**

1. Ejecutar la aplicación con `fetchAdapter` y registrar los resultados de las seis operaciones.
2. Cambiar la composición en `app.js` a `axiosAdapter` y ejecutar nuevamente.
3. Comparar ambas salidas.

El comportamiento observable debe ser equivalente. Lo único que cambia es la librería que ejecuta las peticiones.

**Estructura esperada**

```text
node-fullstack-clase-04/
├── src/
│   ├── adapters/
│   │   └── http/
│   │       ├── axios.adapter.js
│   │       └── fetch.adapter.js
│   ├── config/
│   │   └── env.config.js
│   ├── services/
│   │   └── user.service.js
│   └── app.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

**Criterios de aceptación**

- Ambos adaptadores exponen la misma interfaz y el mismo formato de retorno.
- `src/services/user.service.js` no se modifica al cambiar de adaptador.
- El servicio no importa `axios` ni `fetch` directamente.
- La selección del adaptador está explícita en `app.js`; no depende de una variable de entorno.
- Las respuestas `204` retornan `null` en las dos implementaciones.
- Los errores HTTP se propagan como `Error` en ambos casos.

> [!TIP]
> **Desafío**
>
> Agregar un tercer adaptador basado en `node:https` o en una función simulada (_fake adapter_) que no realice peticiones de red. Pasarlo a `createUserService()` en `app.js` y verificar que el servicio sigue funcionando sin cambios. Si el servicio no se modifica, la abstracción está bien construida.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## Referencias

- 📘 [Reqres API](https://reqres.in/)
- 📘 [Fetch API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- 📘 [Response — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Response)
- 📘 [HTTP request methods — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
- 📘 [HTTP response status codes — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- 📘 [Axios Documentation](https://axios-http.com/docs/intro)
- 📘 [JavaScript Async/Await — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- 📘 [process.env — Node.js](https://nodejs.org/api/process.html#processenv)
- 📘 [--env-file — Node.js](https://nodejs.org/api/cli.html#--env-fileconfig)
- 🛠️ [Refactoring Guru — Adapter](https://refactoring.guru/design-patterns/adapter)

## Mentor

**Ariel Duarte** · Kopius · The Academy

<sub>[⬆ Volver al índice](#contenido)</sub>
