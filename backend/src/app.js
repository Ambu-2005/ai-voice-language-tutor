import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tutorRoutes from './routes/tutorRoutes.js';
import { errorHandler, AppError } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Allowed Origins for CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman) or matched origins
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new AppError('NETWORK_ERROR', 'CORS policy rejected this origin.', 403));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
