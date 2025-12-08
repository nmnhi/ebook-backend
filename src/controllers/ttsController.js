import { synthesizeSpeech } from "../services/ttsService.js";

export const handleTTS = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'text' field"
      });
    }

    const audioBuffer = await synthesizeSpeech(text);

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", "inline; filename=tts.wav");

    return res.send(audioBuffer);
  } catch (error) {
    console.error("TTS Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate speech"
    });
  }
};
