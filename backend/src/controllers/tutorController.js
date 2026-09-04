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
    const language = req.body?.language || 'English';
    const clientTranscript = req.body?.clientTranscript?.trim();

    if (!req.file && !clientTranscript) {
      throw new AppError(
        'NO_AUDIO',
        'No audio recording or speech transcript received. Please record your voice and try again.',
        400
      );
    }

    let transcript = clientTranscript || '';

    // 1. Convert Speech to Text via Server STT (Whisper) if file provided
    if (req.file) {
      try {
        const serverTranscript = await transcribeAudio(req.file, language);
        if (serverTranscript && serverTranscript.trim()) {
          transcript = serverTranscript.trim();
        }
      } catch (sttErr) {
        console.warn('[STT Fallback Notice]: Server STT failed:', sttErr.message);
        // If server STT failed (e.g. 429 quota) but client captured speech via Web Speech API, use client transcript
        if (!transcript) {
          throw sttErr;
        }
      }
    }

    if (!transcript) {
      throw new AppError('NO_SPEECH', 'No speech could be recognized. Please try speaking again clearly.', 400);
    }

    // 2. Perform Intelligent LLM / Linguistic Analysis on Grammar, Vocabulary, Mistakes & Feedback
    const analysis = await analyzeTranscript(transcript, language);

    // 3. Generate Spoken Audio for the Corrected Sentence (Non-fatal if TTS fails or quota exceeded)
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
