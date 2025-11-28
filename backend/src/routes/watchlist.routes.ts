import { Router } from "express";
import {
  getMyWatchlist,
  addToWatchlist,
  removeFromWatchlist
} from "../controllers/watchlist.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();


router.get("/me/watchlist", authenticate, getMyWatchlist);

router.post("/me/watchlist/:movieId", authenticate, addToWatchlist);

router.delete("/me/watchlist/:movieId", authenticate, removeFromWatchlist);

export default router;
