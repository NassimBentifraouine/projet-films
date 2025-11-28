import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/auth/register", register);

router.post("/auth/login", login);

router.get("/auth/me", authenticate, getMe);

export default router;
