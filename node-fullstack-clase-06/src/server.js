import express from "express";
import cors from "cors";
import * as yup from "yup";

const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: { code: "ROUTE_NOT_FOUND", message: "Route not found" },
  });
};

const errorHandler = (error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      error: { code: "INVALID_JSON", message: "Malformed JSON body" },
    });
  }

  const status = error.status ?? 500;

  if (status >= 500) console.error(error);

  res.status(status).json({
    error: {
      code: error.code ?? "INTERNAL_ERROR",
      message: status >= 500 ? "Unexpected server error" : error.message,
    },
  });
};

const requestLogger = (req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
};

const createUserSchema = yup
  .object({
    name: yup.string().trim().min(2).required(),
    email: yup.string().trim().lowercase().email().required(),
    password: yup.string().trim().min(8).required(),
  })
  .noUnknown(true);

const updateUserSchema = yup
  .object({
    name: yup.string().trim().min(2),
    email: yup.string().trim().lowercase().email(),
    password: yup.string().trim().min(8),
  })
  .noUnknown(true)
  .test(
    "at-least-one",
    "At least one field is required",
    (value) => Object.keys(value ?? {}).length > 0,
  );

const validateBody = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.validate(req.body ?? {}, {
      abortEarly: false,
      stripUnknown: false,
    });
    next();
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) return next(error);

    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
        details: error.errors,
      },
    });
  }
};

class Server {
  #app;
  #port;
  #httpServer;
  #nextId = 3;
  #users = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      password: "jdoe1234",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      password: "smith.j987",
    },
  ];

  constructor({ port = 3000 } = {}) {
    this.#app = express();
    this.#port = port;

    this.#middleware();
    this.#registerRoutes();
    this.#registerErrorHandlers();
  }

  get app() {
    return this.#app;
  }

  #sendNotFound(req, res) {
    res.status(404).json({
      error: { code: "USER_NOT_FOUND", message: "User not found" },
    });
  }

  #findUserById(id) {
    return this.#users.find((user) => user.id === Number(id)) ?? null;
  }

  #registerRoutes() {
    this.#app.get("/api/health", (req, res) => {
      res.json({ status: "ok" });
    });
    
    this.#app.get("/api/users", (req, res) => {
      res.json({ data: this.#users.map(toPublicUser) });
    });

    this.#app.get("/api/users/search", (req, res) => {
      const search = String(req.query.keywords ?? "").trim().toLowerCase();

      const users = this.#users.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search),
      );

      res.json({ data: users.map(toPublicUser) });
    });

    this.#app.get("/api/users/:id", (req, res) => {
      const id = parseInt(req.params.id, 10);
      const user = this.#findUserById(id);

      if (!user) {
        return this.#sendNotFound(req, res);
      }

      res.json({ data: toPublicUser(user) });
    });

    this.#app.post("/api/users", validateBody(createUserSchema), (req, res) => {
      const user = { id: this.#nextId++, ...req.body };

      this.#users.push(user);

      res
        .status(201)
        .location(`/api/users/${user.id}`)
        .json({ data: toPublicUser(user) });
    });

    this.#app.patch(
      "/api/users/:id",
      validateBody(updateUserSchema),
      (req, res) => {
        const user = this.#findUserById(req.params.id);

        if (!user) return this.#sendNotFound(req, res);

        Object.assign(user, req.body);

        res.json({ data: toPublicUser(user) });
      },
    );

    this.#app.delete("/api/users/:id", (req, res) => {
      const index = this.#users.findIndex(
        (user) => user.id === Number(req.params.id),
      );

      if (index === -1) return this.#sendNotFound(req, res);

      this.#users.splice(index, 1);

      res.status(204).send();
    });
  }

  #registerErrorHandlers() {
    this.#app.use(notFoundHandler);
    this.#app.use(errorHandler);
  }

  #middleware() {
    this.#app.use(
      cors({
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      }),
    );
    this.#app.use(express.json());
    this.#app.use(requestLogger);
  }

  start() {
    this.#httpServer = this.#app.listen(this.#port, () => {
      console.log(`API escuchando en http://localhost:${this.#port}`);
    });

    return this;
  }

  async stop() {
    if (!this.#httpServer) return;

    await new Promise((resolve, reject) => {
      this.#httpServer.close((error) => (error ? reject(error) : resolve()));
    });

    this.#httpServer = undefined;
  }
}

export default Server;
