import express from "express";
import { handleTTS } from "../controllers/ttsController.js";

const router = express.Router();

// POST /api/tts
router.post("/tts", handleTTS);

export default router;
