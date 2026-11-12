# Tarea 012 · API REST de usuarios

API REST con Express 5, CORS y validación con Yup. La configuración de Express
(middlewares, CORS, rutas, errores y `listen`) vive en la clase `Server` (`src/Server.js`).

## Cómo levantarla

```bash
npm install
npm run dev
```

Queda escuchando en `http://localhost:3000`.

## Datos en memoria

Los usuarios se guardan en un array dentro de la instancia de `Server`.
**Al reiniciar el proceso, los datos vuelven al estado inicial**: todo lo creado,
modificado o eliminado se pierde.

## Pruebas con curl

(pega acá la lista de pruebas de la sección 9.4 del README de la clase)