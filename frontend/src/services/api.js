const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Normalizes error responses from the backend or network
 * @param {Response} response
 * @returns {Promise<never>}
 */
async function handleApiError(response) {
  let errorData;
  try {
    errorData = await response.json();
  } catch (e) {
    errorData = {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: `Network response error (${response.status}: ${response.statusText})`,
      },
    };
  }

  const code = errorData?.error?.code || 'SERVER_ERROR';
  const message = errorData?.error?.message || 'An unexpected error occurred while communicating with the server.';
  
  const error = new Error(message);
  error.code = code;
  error.status = response.status;
  throw error;
}

/**
 * Health check endpoint call
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) await handleApiError(res);
    return await res.json();
  } catch (err) {
    console.error('[API Health Check Failed]:', err);
    throw err;
  }
}

/**
 * Submits recorded audio blob to the full analysis pipeline
 * POST /api/tutor/analyze
 * @param {Blob} audioBlob - Audio recording blob
 * @param {string} language - Target language (e.g. English, Hindi, Kannada, Telugu)
 * @param {string} [clientTranscript] - Optional client-side speech transcript fallback
 * @returns {Promise<{ transcript: string, analysis: object, audio: string|null }>}
 */
export async function analyzeRecording(audioBlob, language = 'English', clientTranscript = '') {
  if (!audioBlob && !clientTranscript) {
    const error = new Error('No audio recording provided.');
    error.code = 'NO_AUDIO';
    throw error;
  }

  const formData = new FormData();
  if (audioBlob) {
    // Determine suitable file extension from blob type
    const mimeType = audioBlob.type || 'audio/webm';
    let ext = 'webm';
    if (mimeType.includes('mp4')) ext = 'mp4';
    else if (mimeType.includes('ogg')) ext = 'ogg';
    else if (mimeType.includes('wav')) ext = 'wav';
    else if (mimeType.includes('mpeg') || mimeType.includes('mp3')) ext = 'mp3';

    formData.append('audio', audioBlob, `recording-${Date.now()}.${ext}`);
  }
  formData.append('language', language);
  if (clientTranscript) {
    formData.append('clientTranscript', clientTranscript);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/tutor/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      // If server STT failed but client transcript is present, smoothly fall back to text analysis
      if (clientTranscript) {
        console.warn('[STT Fallback]: Server STT returned error. Using client speech transcript fallback...');
        return await analyzeText(clientTranscript, language);
      }
      await handleApiError(res);
    }

    const data = await res.json();
    return data.data;
  } catch (err) {
    // If network or server error occurs on audio upload, try client transcript fallback
    if (clientTranscript && err.code !== 'NO_SPEECH') {
      console.warn('[STT Fallback]: Network/STT issue encountered. Fallback to client transcript:', err.message);
      return await analyzeText(clientTranscript, language);
    }

    if (!err.code) {
      err.code = 'NETWORK_ERROR';
      err.message = 'Unable to reach backend server. Please make sure the backend is running at ' + API_BASE_URL;
    }
    throw err;
  }
}

/**
 * Submits typed text to the LLM tutor analysis endpoint (Accessibility / Direct Input Fallback)
 * POST /api/tutor/analyze-text
 * @param {string} text - Sentence text
 * @param {string} language - Target language
 */
export async function analyzeText(text, language = 'English') {
  if (!text || !text.trim()) {
    const error = new Error('Please enter a sentence to analyze.');
    error.code = 'NO_SPEECH';
    throw error;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/tutor/analyze-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim(), language }),
    });

    if (!res.ok) {
      await handleApiError(res);
    }

    const data = await res.json();
    return data.data;
  } catch (err) {
    if (!err.code) {
      err.code = 'NETWORK_ERROR';
      err.message = 'Unable to reach backend server. Please check backend connection.';
    }
    throw err;
  }
}
