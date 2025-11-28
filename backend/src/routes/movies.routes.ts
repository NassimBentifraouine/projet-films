import { Router } from "express";
import { getMovies, getMovieById } from "../controllers/movies.controller";

const router = Router();

router.get("/movies", getMovies);

router.get("/movies/:id", getMovieById);

export default router;
