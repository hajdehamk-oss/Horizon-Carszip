import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { verifyAdminToken } from "./admin.js";

const router = Router();

const uploadDir = "/tmp/uploads";
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch {}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Nur Bilddateien erlaubt"));
  },
});

router.post("/upload/vehicle-image", (req, res) => {
  if (!verifyAdminToken(req as Parameters<typeof verifyAdminToken>[0])) {
    return res.status(401).json({ error: "Nicht autorisiert" });
  }

  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Kein Bild hochgeladen" });
    }
    const url = `/api/uploads/${req.file.filename}`;
    res.json({ url });
  });
});

export default router;
