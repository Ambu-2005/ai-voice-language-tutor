import fs from 'fs';
import { openai, AI_MODELS, getApiKey } from './openai.js';
import { AppError } from '../middleware/errorHandler.js';

// ISO-639-1 language code mapping for Indian Languages
const LANGUAGE_CODES = {
  english: 'en',
  hindi: 'hi',
  kannada: 'kn',
  telugu: 'te',
  tamil: 'ta',
  marathi: 'mr',
  bengali: 'bn',
  malayalam: 'ml',
  gujarati: 'gu',
  punjabi: 'pa',
};

/**
 * Normalizes language name to ISO-639-1 code if available
 * @param {string} language
 * @returns {string|undefined}
 */
export function getLanguageCode(language) {
  if (!language) return undefined;
  const normalized = language.trim().toLowerCase();
  return LANGUAGE_CODES[normalized] || (normalized.length === 2 ? normalized : undefined);
}

/**
 * Checks if transcribed text represents silence or common hallucinated empty audio artifacts
 * @param {string} text
 * @returns {boolean}
 */
function isNoSpeechTranscript(text) {
  if (!text || !text.trim()) return true;
  const clean = text.trim().toLowerCase();
  const hallucinatedArtifacts = [
    '[silence]',
    '(silence)',
    '[blank_audio]',
    'thank you.',
    'thank you for watching!',
    'thank you for watching.',
    'subtitles by the amara.org community',
    'you',
    '.',
    '...',
  ];
  return hallucinatedArtifacts.includes(clean);
}

/**
 * Transcribes audio file using OpenAI Audio Transcription API
 * @param {Express.Multer.File} file - Multer uploaded file object
 * @param {string} [targetLanguage] - Target language selected by learner
 * @returns {Promise<string>} Cleaned transcript string
 */
export async function transcribeAudio(file, targetLanguage) {
  if (!file || !file.path) {
    throw new AppError('NO_AUDIO', 'No audio file provided in the request.', 400);
  }

  // Validate file size
  if (file.size === 0) {
    throw new AppError('EMPTY_AUDIO', 'The recorded audio is empty. Please speak into your microphone and try again.', 400);
  }

  // Check audio size limit (25MB OpenAI limit)
  if (file.size > 25 * 1024 * 1024) {
    throw new AppError('AUDIO_TOO_LARGE', 'Audio recording exceeds the 25MB maximum limit.', 400);
  }

  // Check if API key is present
  if (!getApiKey()) {
    throw new AppError(
      'SERVER_ERROR',
      'OpenAI API Key is missing on the server. Please set OPENAI_API_KEY in backend/.env.',
      500
    );
  }

  try {
    const fileStream = fs.createReadStream(file.path);
    const langCode = getLanguageCode(targetLanguage);

    const transcriptionParams = {
      file: fileStream,
      model: AI_MODELS.STT,
      ...(langCode ? { language: langCode } : {}),
      temperature: 0.0,
      response_format: 'json',
    };

    let response;
    try {
      response = await openai.audio.transcriptions.create(transcriptionParams);
    } catch (apiErr) {
      // Fallback to whisper-1 if custom/newer model is not available
      if (AI_MODELS.STT !== 'whisper-1' && (apiErr.status === 404 || apiErr.status === 400)) {
        console.warn(`[STT Warning]: Model ${AI_MODELS.STT} failed. Retrying with whisper-1...`);
        const retryStream = fs.createReadStream(file.path);
        response = await openai.audio.transcriptions.create({
          ...transcriptionParams,
          file: retryStream,
          model: 'whisper-1',
        });
      } else {
        throw apiErr;
      }
    }

    const transcript = response?.text?.trim() || '';

    // Validate if meaningful speech was captured
    if (isNoSpeechTranscript(transcript)) {
      throw new AppError(
        'NO_SPEECH',
        'No speech was detected in the recording. Please speak clearly and try again.',
        400
      );
    }

    return transcript;
  } catch (err) {
    if (err instanceof AppError) throw err;

    console.error('[Transcription Error]:', err);
    throw new AppError(
      'STT_FAILED',
      err.message || 'Speech-to-Text transcription failed. Please try again.',
      500,
      err
    );
  } finally {
    // Always clean up uploaded temporary file from server disk
    if (file.path && fs.existsSync(file.path)) {
      fs.unlink(file.path, (unlinkErr) => {
        if (unlinkErr) console.error(`Failed to delete temp file ${file.path}:`, unlinkErr);
      });
    }
  }
}
