import Server from "./server.js";

const server = new Server({ port: Number(process.env.PORT ?? 3000) });

server.start();

const shutdown = async (signal) => {
  console.log(`\n${signal} recibido, cerrando servidor...`);
  await server.stop();
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));