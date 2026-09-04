import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { handleAnalyzeRecording, handleAnalyzeText } from '../controllers/tutorController.js';
import { handleTranscribe } from '../controllers/speechController.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `audio-${uniqueSuffix}${ext}`);
  },
});

// Multer file filter to accept valid audio mime types
const fileFilter = (req, file, cb) => {
  const allowedMimePrefixes = ['audio/'];
  const allowedExtensions = ['.webm', '.mp4', '.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'];

  const isAudioMime = allowedMimePrefixes.some((prefix) => file.mimetype?.startsWith(prefix));
  const hasAudioExt = allowedExtensions.includes(path.extname(file.originalname).toLowerCase());

  if (isAudioMime || hasAudioExt || file.mimetype === 'application/octet-stream') {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'INVALID_AUDIO',
        'Invalid audio format. Please provide a supported audio format (e.g. WebM, MP3, WAV, MP4, OGG).',
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max limit
  },
});

/**
 * Health Check Endpoint
 * GET /api/health
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Voice Language Tutor API is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Main End-to-End Tutor Endpoint
 * POST /api/tutor/analyze
 */
router.post('/tutor/analyze', upload.single('audio'), handleAnalyzeRecording);

/**
 * Text-only Tutor Endpoint (Fallback / Accessibility)
 * POST /api/tutor/analyze-text
 */
router.post('/tutor/analyze-text', handleAnalyzeText);

/**
 * Standalone Transcription Endpoint
 * POST /api/speech/transcribe
 */
router.post('/speech/transcribe', upload.single('audio'), handleTranscribe);

export default router;
