import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  addViewToHistory,
  getMyHistory
} from "../controllers/history.controller";

const router = Router();

router.post("/movies/:movieId/view", authenticate, addViewToHistory);

router.get("/me/history", authenticate, getMyHistory);

export default router;
