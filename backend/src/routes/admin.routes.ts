import { Router, Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { createMovie, updateMovie, deleteMovie } from "../controllers/adminMovies.controller";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 Mo max
  }
});

router.post("/admin/movies", authenticate, requireAdmin, createMovie);
router.put("/admin/movies/:id", authenticate, requireAdmin, updateMovie);
router.delete("/admin/movies/:id", authenticate, requireAdmin, deleteMovie);

router.post(
  "/admin/upload/poster",
  authenticate,
  requireAdmin,
  upload.single("poster"),
  (req: Request, res: Response): void => {
    if (!req.file) {
      res.status(400).json({ error: "Aucun fichier reçu." });
      return;
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    res.status(201).json({
      message: "Affiche uploadée avec succès.",
      url: fileUrl
    });
  }
);

export default router;
