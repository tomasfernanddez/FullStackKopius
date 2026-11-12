# Tarea 011: sitio completo con Express, Handlebars y Railway

> [!IMPORTANT]
> **Objetivo:** convertir el template **Road Trip** en un sitio renderizado en el servidor con Express y Handlebars, alimentado por datos que decide el controlador, y desplegarlo en Railway con una URL pública.

## 7.1 El template

El template de ejemplo se descarga desde este [link](https://github.com/aduartekopiustech/node-fullstack-clase-05/blob/main/docs/template/templated-roadtrip.zip). Es solo el punto de partida visual: el objetivo es convertirlo en vistas y alimentarlo desde el controlador, no analizarlo archivo por archivo.

Mapa de conversión:

| Original                        | Destino                                       |
| ------------------------------- | --------------------------------------------- |
| `index.html`                    | `src/views/home.handlebars` + layout          |
| `generic.html`                  | `src/views/post.handlebars`                   |
| `elements.html`                 | `src/views/elements.handlebars`               |
| Header + nav + footer repetidos | `src/views/partials/`                         |
| Secciones de post               | `{{#each posts}}` + partial `post-card`       |
| `images/**`                     | `public/images/**`                            |
| `assets/**`                     | `public/assets/**`                            |
| Formulario de contacto          | Partial `contact-form` + ruta `POST /contact` |

> [!NOTE]
> Si reutilizás el diseño, conservá la atribución a TEMPLATED y Unsplash que ya trae el footer.

## 7.2 Preparar el proyecto

**Paso 1 — Crear el proyecto**

```bash
npm init -y
npm install express@5 express-handlebars@9
```

Agregar a `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js"
  },
  "engines": {
    "node": ">=22.23.4"
  }
}
```

> [!NOTE]
> `"engines"` ayuda al build de Railway a elegir una versión compatible. `express-handlebars@9` requiere Node 22.23.4 o superior.

**Paso 2 — Copiar los assets**

```bash
mkdir -p public
cp -R template/assets public/assets
cp -R template/images public/images
```

Reemplazá `template/` por la carpeta donde descomprimiste el template. Copiá la carpeta `assets` completa (incluye `fonts/`): si falta, los íconos se ven como cuadrados.

**Paso 3 — Crear la estructura de vistas**

```bash
mkdir -p src/views/layouts src/views/partials src/data
```

**Paso 4 — Construir el layout**

Tomá el `<head>`, el header, la navegación, el footer y los `<script>` de `index.html`. Dejá un `{{{body}}}` en el medio. Reemplazá las rutas relativas por absolutas:

```handlebars
<link rel="stylesheet" href="/assets/css/main.css" />
...
<script src="/assets/js/jquery.min.js"></script>
<script src="/assets/js/main.js"></script>
```

**Paso 5 — Extraer los partials**

| Partial                   | Contenido                                                  |
| ------------------------- | ---------------------------------------------------------- |
| `header.handlebars`       | `<header id="header">` con logo y botón de menú            |
| `nav.handlebars`          | `<nav id="menu">` con los links, generados desde `nav`     |
| `footer.handlebars`       | `<footer id="footer">` con contacto, íconos y copyright    |
| `post-card.handlebars`    | Una sección de post: título, fecha, resumen, imagen, botón |
| `contact-form.handlebars` | Formulario con `name`, `email`, `message` y errores        |

**Paso 6 — Convertir las vistas**

- `home.handlebars`: banner + `{{#each posts}}` con `post-card`.
- `post.handlebars`: detalle de un post, con `{{post.title}}`, `{{formatDate post.date}}` y `{{#each post.body}}<p>{{this}}</p>{{/each}}`.
- `elements.handlebars`: la página de referencia, con el mismo layout.
- `404.handlebars` y `500.handlebars`: mensajes claros, con navegación y estilos.

**Paso 7 — Armar los datos**

`src/data/site.data.js` exporta `site`, `nav` y `posts`. Cada post debe tener, como mínimo:

```javascript
{
  slug: "atacama",
  title: "Atacama en cuatro días",
  date: "2026-10-30",
  image: "banner2.jpg",
  summary: "Salares, geisers y noches sin luz.",
  body: [
    "Primer párrafo...",
    "Segundo párrafo..."
  ]
}
```

**Paso 8 — Conectar las rutas**

Ver la sección 7.4. El controlador pasa el contexto; la vista solo lo muestra.

## 7.3 El contrato de datos

| Clave     | Tipo            | Origen              | Consumidor             |
| --------- | --------------- | ------------------- | ---------------------- |
| `site`    | `object`        | `site.data.js`      | Layout, footer         |
| `nav`     | `array<object>` | `site.data.js`      | Partial `nav`          |
| `section` | `string`        | Cada handler        | Clase activa del menú  |
| `posts`   | `array<object>` | `site.data.js`      | `home.handlebars`      |
| `post`    | `object`        | Búsqueda por `slug` | `post.handlebars`      |
| `contact` | `object?`       | `POST /contact`     | Partial `contact-form` |

> [!IMPORTANT]
> Si cambiás un título en `site.data.js` y la página no cambia, el problema está en el controlador (no está pasando el dato) o en la vista (no está interpolando la clave correcta). No en Handlebars.

## 7.4 Rutas

| Método | Ruta           | Acción                                           | Estado        |
| ------ | -------------- | ------------------------------------------------ | ------------- |
| `GET`  | `/`            | Renderiza `home` con banner y todos los posts    | `200`         |
| `GET`  | `/posts/:slug` | Busca el post por `slug`; si no existe, `next()` | `200` / `404` |
| `GET`  | `/elements`    | Renderiza la página de referencia                | `200`         |
| `POST` | `/contact`     | Valida el formulario y responde con feedback     | `200` / `422` |
| `GET`  | `/api/health`  | Responde JSON con el estado del servidor         | `200`         |
| `*`    | cualquiera     | Middleware final de 404                          | `404`         |

Ejemplo del formulario:

```javascript
app.post("/contact", (request, response) => {
  const { name = "", email = "", message = "" } = request.body;
  const errors = [];

  if (name.trim().length < 2) errors.push("El nombre es obligatorio.");
  if (!email.includes("@")) errors.push("El email no es válido.");
  if (message.trim().length < 10) errors.push("El mensaje es demasiado corto.");

  if (errors.length > 0) {
    return response.status(422).render("home", {
      title: "Inicio",
      section: "home",
      site,
      nav,
      posts,
      contact: { name, email, message, errors },
    });
  }

  response.render("home", {
    title: "Inicio",
    section: "home",
    site,
    nav,
    posts,
    contact: { name, email, message, errors: [], sent: true },
  });
});
```

> [!TIP]
> Si querés evitar el reenvío duplicado del formulario al recargar, usá el patrón **POST/Redirect/GET**: guardá el resultado y redirigí con `response.redirect(303, "/?sent=1")`. Después leés `request.query.sent` en el `GET /`.

El formulario del template tiene `action="#"`. Cambialo:

```handlebars
<form action="/contact" method="post">
  <div class="field half first">
    <label for="name">Name</label>
    <input
      id="name"
      name="name"
      type="text"
      placeholder="Name"
      value="{{contact.name}}"
      required
    />
  </div>
  <div class="field half">
    <label for="email">Email</label>
    <input
      id="email"
      name="email"
      type="email"
      placeholder="Email"
      value="{{contact.email}}"
      required
    />
  </div>
  <div class="field">
    <label for="message">Message</label>
    <textarea
      id="message"
      name="message"
      rows="6"
      placeholder="Message"
      required
    >{{contact.message}}</textarea>
  </div>

  {{#if contact.errors.length}}
    <ul class="error-list">
      {{#each contact.errors}}
        <li>{{this}}</li>
      {{/each}}
    </ul>
  {{/if}}

  <ul class="actions">
    <li><input value="Send Message" class="button alt" type="submit" /></li>
  </ul>
</form>
```

## 7.5 Adaptar los recursos estáticos

El template trae rutas relativas. Si no las corregís, en `/` funcionan y en `/posts/<slug>` dan `404`.

1. **HTML y CSS:** usá `/assets/...` en el layout y en los partials.
2. **Imágenes de fondo:** el `main.js` del template arma `url(images/<bg>)`. Cambialo a `url(/images/<bg>)`.
3. **Fuentes:** copiá `assets` completo; si falta `fonts/`, Font Awesome muestra cuadrados.

> [!WARNING]
> `<base href="/" />` también resuelve las rutas relativas, pero afecta todos los links y formularios del documento. Si lo usás, igual tenés que reescribir los `href` a las rutas reales.

> [!IMPORTANT]
> No copies `index.html` a `public/`. El HTML tiene que pasar por `res.render()`; si no, perdés los datos del controlador y el ejercicio deja de ser SSR.

## 7.6 Desplegar en Railway

Railway detecta el proyecto como Node.js con **Railpack**, instala las dependencias (usa `npm ci` cuando existe `package-lock.json`) y arranca con `npm start`. No necesitás Dockerfile.

### Antes de desplegar

1. El servidor escucha en `process.env.PORT`:

```javascript
const PORT = Number(process.env.PORT ?? 3000);
```

2. El servidor escucha en `0.0.0.0`, no en `localhost`.
3. `npm start` existe y funciona en local.
4. `.gitignore` excluye `node_modules`, `.env` y la carpeta temporal del template.
5. `package-lock.json` está commiteado (build reproducible).
6. Las rutas de vistas y assets son absolutas (`import.meta.dirname`), no relativas al directorio de ejecución.

```gitignore
node_modules/
.env
.DS_Store
```

### Opción A — Desde GitHub

1. Subí el proyecto a un repositorio de GitHub.
2. En Railway: **New Project → Deploy from GitHub repo**.
3. Elegí el repositorio y autorizá el acceso.
4. Si subiste un repositorio que contiene varias carpetas (por ejemplo, todo `nodejs/` con las clases), configurá **Settings → Root Directory** con `node-fullstack-clase-05`. Sin eso, Railway no encuentra el `package.json`.
5. En **Variables**, agregá solo lo necesario:
   - `NODE_ENV=production`
   - **No definas `PORT`**: Railway lo inyecta.
6. Esperá el build. Revisá **Deploy Logs**.
7. En **Settings → Networking → Public Networking**, click en **Generate Domain**.
8. Abrí la URL generada y verificá que carguen el HTML y los assets.

### Opción B — Con la CLI

```bash
npm install -g @railway/cli
railway login
railway init
railway up
railway domain
```

- `railway init` crea el proyecto.
- `railway up` empaqueta y despliega la carpeta actual. Ejecutalo **desde `node-fullstack-clase-05/`**, no desde la raíz del monorepo.
- `railway domain` genera la URL pública.

> [!NOTE]
> Cada push a la rama conectada vuelve a desplegar automáticamente. Si desplegás con la CLI, cada `railway up` crea un nuevo deployment.

### Verificación

- La URL pública responde `200` y muestra la home.
- `/assets/css/main.css` y `/images/banner.jpg` responden `200` (Network del navegador).
- `/posts/atacama` responde `200` y muestra el post.
- `/posts/no-existe` responde `404` con la vista de error.
- `/api/health` responde JSON.
- `railway logs` no muestra errores de arranque.

### Problemas frecuentes

| Síntoma                                   | Causa probable                                               | Solución                                                  |
| ----------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------- |
| "Application failed to respond"           | El servidor escucha en `localhost` o en un puerto fijo       | Usar `process.env.PORT` y `0.0.0.0`                       |
| Build falla con "start command not found" | No existe `npm start`                                        | Agregar el script `start` en `package.json`               |
| "Cannot find package.json"                | Root Directory incorrecto en un monorepo                     | Configurar `node-fullstack-clase-05` como Root Directory  |
| 502 / deploy en crash loop                | Excepción al arrancar (vista faltante, ruta mal armada)      | Leer **Deploy Logs**, reproducir con `npm start` en local |
| HTML carga sin estilos                    | `express.static` apunta a una carpeta inexistente            | Usar ruta absoluta con `import.meta.dirname`              |
| Estilos cargan, imágenes de fondo no      | `main.js` arma `url(images/...)` relativo                    | Parchear a `url(/images/...)` o usar `<base href="/" />`  |
| Algunas páginas dan 404 en assets         | Rutas relativas (`assets/...`) en rutas con varios segmentos | Usar `/assets/...` y `/images/...`                        |
| Vistas no encontradas                     | `app.set("views", ...)` relativo al cwd                      | Usar ruta absoluta                                        |
| El formulario responde 500                | Falta `express.urlencoded()`                                 | Registrarlo antes de las rutas                            |
| Los íconos se ven como cuadrados          | No se copió `assets/fonts/`                                  | Copiar la carpeta completa                                |

## 7.7 Criterios de aceptación

- [ ] `npm run dev` inicia el servidor en el puerto 3000 (o en `PORT`).
- [ ] `npm start` funciona sin `--watch`.
- [ ] `GET /` responde `200`, `text/html` y muestra el banner y los cuatro posts.
- [ ] Los cuatro posts provienen de un array del controlador, no de HTML repetido.
- [ ] `GET /posts/:slug` responde `200` para cada slug existente.
- [ ] `GET /posts/no-existe` responde `404` con una vista legible y el layout completo.
- [ ] `GET /elements` responde `200` y comparte layout y navegación.
- [ ] Todas las vistas comparten `layouts/main.handlebars`.
- [ ] Header, navegación y footer existen **solo** en partials.
- [ ] Los nombres y títulos se interpolan con doble llave (`{{ }}`).
- [ ] Un post con `<script>` en el título se muestra escapado, sin ejecutarse.
- [ ] `POST /contact` valida los campos y responde con feedback visible.
- [ ] `/assets/...` y `/images/...` responden `200` en todas las rutas.
- [ ] No aparece `{{` ni `}}` en el navegador.
- [ ] `/api/health` responde JSON.
- [ ] El servidor escucha en `0.0.0.0` y en `process.env.PORT`.
- [ ] La aplicación está desplegada en Railway y la URL pública funciona.

## 7.8 Desafíos

1. **Partial `post-card` con parámetros.** Pasá `post` e `index` y mostrá "Primer post" con `{{#if @first}}`.
2. **Helper `eq` para la navegación.** Marcá la sección activa con `@root.section`.
3. **Helper `formatDate`.** Mostrá fechas legibles en español.
4. **Ruta `/api/posts`.** Devolvé el mismo array en JSON y compará SSR con API.
5. **Página 404 personalizada.** Reutilizá el layout y agregá un link a la home.
6. **Patrón POST/Redirect/GET.** Evitá el reenvío del formulario al recargar.
7. **Un partial por componente.** Extraé el banner y el formulario de contacto.
8. **Variables de entorno.** Mové el nombre del sitio y el año a `process.env` con valores por defecto.
9. **Healthcheck.** Configurá `/api/health` como healthcheck en Railway y verificá que el deploy lo consulte.
10. **Accesibilidad.** Agregá `alt` a las imágenes, `label` a los campos y foco visible en los links.
