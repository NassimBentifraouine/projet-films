import { Router } from "express";
import { rateMovie } from "../controllers/ratings.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/* Route protégée : l'utilisateur doit être connecté.*/
router.post("/movies/:movieId/rating", authenticate, rateMovie);

export default router;
