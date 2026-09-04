/**
 * Standardized Application Error Class
 */
export class AppError extends Error {
  /**
   * @param {string} code - Error code identifier (e.g. NO_AUDIO, NO_SPEECH, LLM_FAILED)
   * @param {string} message - User-friendly error message
   * @param {number} statusCode - HTTP status code (default: 400)
   * @param {any} [details] - Optional technical details for internal logging
   */
  constructor(code, message, statusCode = 400, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Centralized Error Handling Middleware for Express
 */
export function errorHandler(err, req, res, next) {
  // Check if response already sent
  if (res.headersSent) {
    return next(err);
  }

  // Handle Multer upload limits
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'AUDIO_TOO_LARGE',
        message: 'The uploaded audio file is too large. Maximum allowed size is 25MB.',
      },
    });
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Handle OpenAI API Specific Errors
  if (err?.status || err?.error) {
    const status = err.status || 500;
    const message = err.message || 'Error communicating with AI service.';

    if (status === 401) {
      console.error('[OpenAI Auth Error]: Invalid API Key configuration.');
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Server configuration error: OpenAI API authentication failed. Please check backend API key.',
        },
      });
    }

    if (status === 429) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'AI service rate limit exceeded or quota exhausted. Please try again in a few moments.',
        },
      });
    }

    return res.status(status >= 400 && status < 600 ? status : 500).json({
      success: false,
      error: {
        code: 'STT_FAILED',
        message: message || 'Failed to process audio with AI services.',
      },
    });
  }

  // Generic Unhandled Server Errors
  console.error('[Unhandled Server Error]:', err);
  return res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: 'An unexpected internal server error occurred. Please try again.',
    },
  });
}
