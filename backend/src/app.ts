import express, { Application } from "express";
import cors from "cors";
import healthRouter from "./routes/health.routes";

const app: Application = express();

// Middleware pour parser le JSON dans le body des requêtes
app.use(express.json());

// Middleware CORS pour autoriser le frontend (on verra la config plus tard)
app.use(cors());

// Préfixe commun pour toutes les routes de l'API
const API_PREFIX = "/api";

// Routes de santé (healthcheck)
// Résultat final : GET http://localhost:4000/api/health
app.use(`${API_PREFIX}`, healthRouter);

export default app;
