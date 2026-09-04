import { openai, AI_MODELS, getApiKey } from './openai.js';
import { AppError } from '../middleware/errorHandler.js';
import { evaluateLinguistically } from './linguisticFallback.js';

/**
 * System instruction prompt for the Language Tutor LLM
 */
function buildSystemPrompt(targetLanguage) {
  return `You are an expert, encouraging AI Language Tutor specializing in ${targetLanguage}.
Your job is to analyze a learner's spoken sentence in ${targetLanguage}.

Instructions:
1. Carefully analyze grammar, vocabulary, word choice, and sentence structure.
2. Identify genuine grammar and vocabulary issues while preserving the learner's intended meaning.
3. Generate a natural, corrected sentence in ${targetLanguage}.
4. CRITICAL RULE FOR CORRECT SENTENCES: If the learner's sentence is already grammatically and lexically correct, do NOT invent mistakes or make stylistic changes. Set mistakes to an empty list [], assign high scores (90-100), and praise their accuracy.
5. For each genuine mistake, specify:
   - "original": the exact incorrect word or phrase from the learner's transcript
   - "correction": the corrected word or phrase
   - "type": "grammar", "vocabulary", "word_order", "spelling", or "punctuation"
   - "explanation": a concise, learner-friendly explanation without overly dense linguistic jargon
6. Assign a grammarScore (integer 0-100) and vocabularyScore (integer 0-100).
7. Provide concise, constructive pedagogical feedback and warm encouragement.
8. Assess the difficulty level of the sentence ("beginner", "intermediate", or "advanced").

You MUST return your response as a valid JSON object matching this schema:
{
  "correctedSentence": string,
  "grammarScore": number (0-100),
  "vocabularyScore": number (0-100),
  "mistakes": [
    {
      "original": string,
      "correction": string,
      "type": string,
      "explanation": string
    }
  ],
  "feedback": string,
  "encouragement": string,
  "difficulty": "beginner" | "intermediate" | "advanced"
}`;
}

/**
 * Analyzes learner sentence transcript using OpenAI LLM with automatic Zero-Failure Linguistic Fallback
 * @param {string} transcript - Spoken sentence transcribed by STT
 * @param {string} targetLanguage - Target learning language (e.g. English, Hindi, Kannada, Telugu)
 * @returns {Promise<object>} Structured evaluation object
 */
export async function analyzeTranscript(transcript, targetLanguage = 'English') {
  if (!transcript || !transcript.trim()) {
    throw new AppError('NO_SPEECH', 'Transcript is empty. Please speak a sentence to evaluate.', 400);
  }

  // If OpenAI API key is missing, immediately use the intelligent linguistic analyzer
  if (!getApiKey()) {
    console.warn('[LLM Notice]: OpenAI API Key is not configured. Utilizing Intelligent Linguistic Engine.');
    return evaluateLinguistically(transcript, targetLanguage);
  }

  const systemPrompt = buildSystemPrompt(targetLanguage);
  const userPrompt = `Target Language: ${targetLanguage}\nLearner's Spoken Sentence:\n"${transcript}"\n\nAnalyze this sentence now and return the structured JSON assessment.`;

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODELS.LLM,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2, // Low temperature for consistent grading
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new AppError('LLM_INVALID_RESPONSE', 'AI model returned an empty response.', 500);
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseErr) {
      console.error('[LLM JSON Parse Error]: Raw content:', content);
      return evaluateLinguistically(transcript, targetLanguage);
    }

    // Sanitize and validate fields
    const sanitized = {
      correctedSentence: typeof parsed.correctedSentence === 'string' && parsed.correctedSentence.trim()
        ? parsed.correctedSentence.trim()
        : transcript,
      grammarScore: typeof parsed.grammarScore === 'number'
        ? Math.max(0, Math.min(100, Math.round(parsed.grammarScore)))
        : 80,
      vocabularyScore: typeof parsed.vocabularyScore === 'number'
        ? Math.max(0, Math.min(100, Math.round(parsed.vocabularyScore)))
        : 80,
      mistakes: Array.isArray(parsed.mistakes)
        ? parsed.mistakes.map((m) => ({
            original: String(m.original || ''),
            correction: String(m.correction || ''),
            type: String(m.type || 'grammar'),
            explanation: String(m.explanation || ''),
          }))
        : [],
      feedback: typeof parsed.feedback === 'string' && parsed.feedback.trim()
        ? parsed.feedback.trim()
        : 'Good effort! Keep practicing speaking in your target language.',
      encouragement: typeof parsed.encouragement === 'string' && parsed.encouragement.trim()
        ? parsed.encouragement.trim()
        : 'Every sentence brings you closer to fluency!',
      difficulty: ['beginner', 'intermediate', 'advanced'].includes(parsed.difficulty)
        ? parsed.difficulty
        : 'beginner',
    };

    return sanitized;
  } catch (err) {
    // If OpenAI API quota is exhausted (429) or connection error, gracefully fallback
    if (err.status === 429 || err.code === 'insufficient_quota' || err.status === 401 || err.status >= 500) {
      console.warn(`[LLM Notice]: Cloud API returned ${err.status || err.message}. Gracefully switching to Intelligent Linguistic Engine.`);
      return evaluateLinguistically(transcript, targetLanguage);
    }

    if (err instanceof AppError) throw err;

    console.warn('[LLM Fallback Triggered]:', err.message);
    return evaluateLinguistically(transcript, targetLanguage);
  }
}

