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
  },{
    slug: "villa-la-angostura",
    title: "Villa La Angostura entre lagos",
    date: "2026-10-15",
    image: "villaLaAngostura.jpg",
    summary: "Bosques de arrayanes, lagos y la Ruta de los Siete Lagos.",
    body: [
      "Llegamos a Villa La Angostura por la Ruta de los Siete Lagos, frenando en cada mirador para ver el agua cambiar de color.",
      "El segundo día cruzamos en lancha por el Nahuel Huapi hasta el Bosque de Arrayanes, con sus troncos color canela.",
      "Cerramos el viaje subiendo al Cerro Bayo para ver el pueblo y el lago desde arriba.",
    ],
  },{
    slug: "salinas-grandes",
    title: "Salinas Grandes de Jujuy",
    date: "2026-09-28",
    image: "salinasJujuy.jpg",
    summary: "Un desierto blanco a más de tres mil metros de altura.",
    body: [
      "Salimos temprano de Purmamarca y subimos por la Cuesta de Lipán, una ruta de curvas que pasa los cuatro mil metros.",
      "Al llegar, el blanco de la sal se extiende hasta el horizonte y el sol obliga a usar anteojos todo el tiempo.",
      "Antes de volver caminamos entre los piletones de agua, donde el cielo se refleja como en un espejo.",
    ],
  },{
    slug: "la-lucila-del-mar",
    title: "La Lucila del Mar sin apuro",
    date: "2026-01-18",
    image: "lucilaDelMar.jpg",
    summary: "Playas anchas, médanos y días tranquilos en la costa.",
    body: [
      "Elegimos La Lucila del Mar para escaparnos de las playas más concurridas de la costa atlántica.",
      "Pasamos los días entre la playa y los médanos, con caminatas largas por la orilla al atardecer.",
      "La última noche cenamos pescado frente al mar, escuchando las olas mientras bajaba el sol.",
    ],
  }
];