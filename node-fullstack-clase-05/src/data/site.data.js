export const site = {
  name: "Road Trip",
  tagline: "Historias de ruta por Sudamérica",
  year: new Date().getFullYear(),
};

export const nav = [
  { id: "home", href: "/", label: "Inicio" },
  { id: "posts", href: "/posts/atacama", label: "Posts" },
  { id: "elements", href: "/elements", label: "Elementos" },
];

export const posts = [
  {
    slug: "atacama",
    title: "Atacama en cuatro días",
    date: "2026-10-30",
    image: "banner2.jpg",
    summary: "Salares, geisers y noches sin luz.",
    body: [
      "Llegamos a San Pedro de Atacama después de doce horas de ruta...",
      "El segundo día salimos a las cuatro de la mañana...",
      "Cerramos el viaje en el Valle de la Luna...",
    ],
  },
  // ...patagonia, norte, costa (4 en total)
];