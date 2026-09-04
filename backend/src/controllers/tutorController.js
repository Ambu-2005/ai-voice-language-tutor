import { transcribeAudio } from '../services/transcriptionService.js';
import { analyzeTranscript } from '../services/llmService.js';
import { generateSpeechAudio } from '../services/ttsService.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Orchestrates complete end-to-end Voice Language Tutor pipeline
 * Flow: Audio Upload -> STT -> Transcript -> LLM Evaluation -> TTS Audio -> Response
 * POST /api/tutor/analyze
 */
export async function handleAnalyzeRecording(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError(
        'NO_AUDIO',
        'No audio recording received. Please record your voice and try again.',
        400
      );
    }

    const language = req.body?.language || 'English';

    // 1. Convert Speech to Text
    const transcript = await transcribeAudio(req.file, language);

    // 2. Perform Intelligent LLM Analysis on Grammar, Vocabulary, Mistakes & Feedback
    const analysis = await analyzeTranscript(transcript, language);

    // 3. Generate Spoken Audio for the Corrected Sentence (Non-fatal if TTS fails)
    let audio = null;
    try {
      audio = await generateSpeechAudio(analysis.correctedSentence);
    } catch (ttsErr) {
      console.warn('[TTS Non-Fatal Warning]:', ttsErr.message);
    }

    // 4. Return Full Structured Payload
    return res.status(200).json({
      success: true,
      data: {
        transcript,
        analysis,
        audio,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Evaluates a direct text input (fallback / manual typing option for accessibility)
 * POST /api/tutor/analyze-text
 */
export async function handleAnalyzeText(req, res, next) {
  try {
    const { text, language = 'English' } = req.body;
    if (!text || !text.trim()) {
      throw new AppError('NO_SPEECH', 'Please enter a sentence to evaluate.', 400);
    }

    const analysis = await analyzeTranscript(text.trim(), language);
    let audio = null;
    try {
      audio = await generateSpeechAudio(analysis.correctedSentence);
    } catch (ttsErr) {
      console.warn('[TTS Non-Fatal Warning]:', ttsErr.message);
    }

    return res.status(200).json({
      success: true,
      data: {
        transcript: text.trim(),
        analysis,
        audio,
      },
    });
  } catch (err) {
    next(err);
  }
}
