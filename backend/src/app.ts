import express, { Application } from "express";
import cors from "cors";
import path from "path";
import healthRouter from "./routes/health.routes";
import moviesRouter from "./routes/movies.routes";
import authRouter from "./routes/auth.routes";
import watchlistRouter from "./routes/watchlist.routes";
import ratingsRouter from "./routes/ratings.routes";
import historyRouter from "./routes/history.routes";
import adminRouter from "./routes/admin.routes";

const app: Application = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: false
  })
);

const uploadsPath = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

const API_PREFIX = "/api";

app.use(API_PREFIX, healthRouter);
app.use(API_PREFIX, authRouter);
app.use(API_PREFIX, watchlistRouter);
app.use(API_PREFIX, ratingsRouter);
app.use(API_PREFIX, historyRouter);
app.use(API_PREFIX, adminRouter);
app.use(API_PREFIX, moviesRouter);

export default app;
