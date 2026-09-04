import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Validates and retrieves the OpenAI API key
 * @returns {string}
 */
export function getApiKey() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    return null;
  }
  return apiKey;
}

/**
 * Shared OpenAI SDK Instance
 */
export const openai = new OpenAI({
  apiKey: getApiKey() || 'placeholder_for_initialization',
});

/**
 * Model Configuration with defaults and environment overrides
 */
export const AI_MODELS = {
  STT: process.env.OPENAI_STT_MODEL || 'whisper-1',
  LLM: process.env.OPENAI_LLM_MODEL || 'gpt-4o-mini',
  TTS: process.env.OPENAI_TTS_MODEL || 'tts-1',
  TTS_VOICE: process.env.OPENAI_TTS_VOICE || 'alloy',
};
