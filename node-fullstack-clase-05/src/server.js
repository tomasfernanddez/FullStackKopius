import app from "./app.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = "0.0.0.0";

app.listen(PORT, HOST, (error) => {
  if (error) {
    console.error(`No se pudo iniciar el servidor: ${error.message}`);
    process.exit(1);
  }

  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});