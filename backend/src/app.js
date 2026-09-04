import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tutorRoutes from './routes/tutorRoutes.js';
import { errorHandler, AppError } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Production-ready CORS Configuration supporting Vercel, Render, and Localhost
app.use(
  cors({
    origin: (origin, callback) => {
      // 1. Allow non-browser requests (e.g. curl, health checks, server-to-server)
      if (!origin) return callback(null, true);

      // 2. Allow any localhost or 127.0.0.1 port during development
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // 3. Allow any Vercel deployment (*.vercel.app), Render, or configured CLIENT_URL
      if (
        origin.endsWith('.vercel.app') ||
        origin.includes('vercel.app') ||
        origin.includes('onrender.com') ||
        process.env.CLIENT_URL === '*' ||
        (process.env.CLIENT_URL && origin.startsWith(process.env.CLIENT_URL.trim().replace(/\/+$/, '')))
      ) {
        return callback(null, true);
      }

      // 4. Fallback: Allow origin to guarantee zero network blockages for deployed learners
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', tutorRoutes);

// Root Index Route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'AI Voice Language Tutor API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: 'GET /api/health',
      analyzeVoice: 'POST /api/tutor/analyze',
      analyzeText: 'POST /api/tutor/analyze-text',
      transcribe: 'POST /api/speech/transcribe',
    },
  });
});

// 404 Not Found Handler
app.use((req, res, next) => {
  next(new AppError('SERVER_ERROR', `Endpoint ${req.method} ${req.originalUrl} not found.`, 404));
});

// Centralized Error Handler Middleware
app.use(errorHandler);

export default app;
