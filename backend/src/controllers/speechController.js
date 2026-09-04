import { transcribeAudio } from '../services/transcriptionService.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Handles audio transcription only (useful for modular testing or STT-only queries)
 * POST /api/speech/transcribe
 */
export async function handleTranscribe(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError('NO_AUDIO', 'Audio recording file is required.', 400);
    }

    const language = req.body?.language || 'English';
    const transcript = await transcribeAudio(req.file, language);

    return res.status(200).json({
      success: true,
      transcript,
    });
  } catch (err) {
    next(err);
  }
}
