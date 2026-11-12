import express from "express";
import path from "node:path";
import { engine } from "express-handlebars";
import { site, nav, posts } from "./data/site.data.js";

const app = express();

const viewsDir = path.join(import.meta.dirname, "views");
const publicDir = path.join(import.meta.dirname, "..", "public");

app.engine(
  "handlebars",
  engine({
    layoutsDir: path.join(viewsDir, "layouts"),
    partialsDir: path.join(viewsDir, "partials"),
    defaultLayout: "main",
    extname: ".handlebars",
    helpers: {
      eq: (a, b) => a === b,
      add: (a, b) => a + b,
      formatDate: (value) =>
        new Intl.DateTimeFormat("es-AR", {
          dateStyle: "long",
          timeZone: "UTC",
        }).format(new Date(value)),
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

  response.render("post", { title: post.title, section: "posts", site, nav, post });
});

app.get("/elements", (request, response) => {
  response.render("elements", {
    title: "Elementos",
    section: "elements",
    site,
    nav,
  });
});

app.post("/contact", (request, response) => {
  const { name = "", email = "", message = "" } = request.body;
  const errors = [];

  if (name.trim().length < 2) errors.push("El nombre es obligatorio.");
  if (!email.includes("@")) errors.push("El email no es válido.");
  if (message.trim().length < 10) errors.push("El mensaje es demasiado corto.");

  if (errors.length > 0) {
    return response.status(422).render("home", {
      title: "Inicio", section: "home", site, nav, posts,
      contact: { name, email, message, errors },
    });
  }

  response.render("home", {
    title: "Inicio", section: "home", site, nav, posts,
    contact: { name: "", email: "", message: "", errors: [], sent: true },
  });
});

app.get("/api/health", (request, response) => {
  response.json({ status: "ok", uptime: process.uptime() });
});

app.use((request, response) => {
  response.status(404).render("404", { title: "Página no encontrada", section: "404", site, nav });
});

app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).render("500", { title: "Error del servidor", section: "500", site, nav });
});

export default app;