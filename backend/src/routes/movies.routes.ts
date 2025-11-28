import { Router } from "express";
import { getMovies, getMovieById } from "../controllers/movies.controller";

const router = Router();

// GET /api/movies
router.get("/movies", getMovies);

// GET /api/movies/:id
router.get("/movies/:id", getMovieById);

export default router;
