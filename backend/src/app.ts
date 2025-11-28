import express, { Application } from "express";
import cors from "cors";
import healthRouter from "./routes/health.routes";
import moviesRouter from "./routes/movies.routes";

const app: Application = express();

app.use(express.json());

app.use(cors());

const API_PREFIX = "/api";

app.use(API_PREFIX, healthRouter);

app.use(API_PREFIX, moviesRouter);

export default app;
