import { openai, AI_MODELS, getApiKey } from './openai.js';

/**
 * Generates natural spoken audio for the corrected sentence using OpenAI TTS
 * @param {string} text - The corrected sentence to synthesize
 * @returns {Promise<string|null>} Base64 audio data URI (or null if TTS fails non-fatally)
 */
export async function generateSpeechAudio(text) {
  if (!text || !text.trim()) {
    return null;
  }

  if (!getApiKey()) {
    console.warn('[TTS Warning]: OpenAI API Key is missing. Skipping audio generation.');
    return null;
  }

  try {
    let mp3Response;
    try {
      mp3Response = await openai.audio.speech.create({
        model: AI_MODELS.TTS,
        voice: AI_MODELS.TTS_VOICE,
        input: text.trim(),
        response_format: 'mp3',
      });
    } catch (apiErr) {
      // If custom/newer TTS model fails, try fallback to tts-1
      if (AI_MODELS.TTS !== 'tts-1' && (apiErr.status === 404 || apiErr.status === 400)) {
        console.warn(`[TTS Warning]: Model ${AI_MODELS.TTS} failed. Falling back to tts-1...`);
        mp3Response = await openai.audio.speech.create({
          model: 'tts-1',
          voice: AI_MODELS.TTS_VOICE,
          input: text.trim(),
          response_format: 'mp3',
        });
      } else {
        throw apiErr;
      }
    }

    const buffer = Buffer.from(await mp3Response.arrayBuffer());
    const base64Audio = buffer.toString('base64');
    return `data:audio/mp3;base64,${base64Audio}`;
  } catch (err) {
    // Non-fatal error handling: Log warning and return null
    // This guarantees the learner still receives grammar/vocab correction if TTS fails
    console.warn('[TTS Service Warning]: Text-to-Speech generation failed (non-fatal):', err.message);
    return null;
  }
}
