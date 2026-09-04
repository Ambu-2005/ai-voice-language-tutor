# AI Voice Language Tutor

> **LLMs Meet Speech — Project 4: AI Voice Language Tutor**  
> An intelligent, end-to-end spoken language learning application powered by OpenAI Speech-to-Text, Structured LLM reasoning, and Text-to-Speech audio synthesis.

---

## 🌟 Overview

The **AI Voice Language Tutor** bridges speech recognition, large language model analysis, and conversational voice synthesis into a fluid, real-time pedagogical loop:

```
Learner Speaks Target Language Sentence
                 ↓
Browser Microphone (MediaRecorder)
                 ↓
Audio Blob (FormData) → Express Backend (Multer)
                 ↓
Speech-to-Text (OpenAI gpt-4o-transcribe / whisper-1)
                 ↓
Transcript
                 ↓
LLM Language Diagnostics (OpenAI gpt-5-mini / gpt-4o-mini + Structured Output)
                 ↓
Grammar Assessment + Vocabulary Scores + Mistake Itemization + Feedback
                 ↓
Text-to-Speech (OpenAI gpt-4o-mini-tts / tts-1)
                 ↓
Native Pronunciation Audio Response
                 ↓
React Audio Player & Interactive Progress Dashboard
```

Learners practice speaking in their chosen target language (English, Hindi, Kannada, Telugu, Tamil, Marathi, Bengali, Malayalam, Gujarati, Punjabi), receive immediate textual and auditory diagnostics, and track their grammar mastery over time with adaptive difficulty tuning.

---

## ✨ Features

- 🎙 **Browser Voice Recording**: High-fidelity audio capture via standard `MediaRecorder` API with animated soundwave visualizers, live decibel metering, and digital timers.
- 📝 **Accurate Speech-to-Text (STT)**: Direct transcription of spoken target sentences using OpenAI Speech-to-Text (`gpt-4o-transcribe` / `whisper-1`) with multi-language hint support.
- 🧠 **Intelligent LLM Pedagogical Diagnostics**:
  - Precision grammar accuracy grading (0–100)
  - Vocabulary sophistication grading (0–100)
  - Itemized mistake identification (`original` vs `correction` with clear explanations)
  - Meaning-preserving target sentence correction
  - Positive pedagogical reinforcement and encouragement
  - Flawless sentence detection (does **not** invent mistakes if the sentence is already correct)
- 🔊 **Native-Speaker Text-to-Speech (TTS)**: Instant speech synthesis of the corrected target sentence via OpenAI TTS (`gpt-4o-mini-tts` / `tts-1`) with playback speed controls (0.75x, 1x, 1.25x).
- 📈 **Progress Tracking & Analytics (Stretch Goal)**: Persistent session history via `localStorage`, tracking total practice sessions, average grammar/vocabulary scores, mistake frequency categorization, and improvement trends.
- 🎯 **Adaptive Difficulty Engine (Stretch Goal)**: Dynamically recommends learning tiers based on performance:
  - **Beginner (<60%)**: Focus on core syntax and high-frequency verb forms.
  - **Intermediate (60–79%)**: Focus on irregular tenses, prepositions, and natural phrasing.
  - **Advanced (80%+)**: Focus on idiomatic nuance and sophisticated vocabulary.
- 🛡 **Resilient Architecture & Centralized Errors**: Non-fatal TTS handling, automatic temporary upload cleanup, safe CORS policies, and standardized error codes.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Vanilla CSS Design System, Lucide Icons |
| **Backend** | Node.js (ESM), Express 4, Multer (multipart handling), CORS, dotenv |
| **AI - STT** | OpenAI Audio Transcription API (`gpt-4o-transcribe` / `whisper-1`) |
| **AI - LLM** | OpenAI Chat Completions API with Structured Outputs (`gpt-5-mini` / `gpt-4o-mini`) |
| **AI - TTS** | OpenAI Audio Speech API (`gpt-4o-mini-tts` / `tts-1`) |

---

## 📁 Project Structure

```
ai-voice-language-tutor/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── tutorController.js       # End-to-end tutor pipeline handler
│   │   │   └── speechController.js      # Standalone transcription handler
│   │   │
│   │   ├── routes/
│   │   │   └── tutorRoutes.js           # API route declarations & Multer config
│   │   │
│   │   ├── services/
│   │   │   ├── openai.js                # OpenAI SDK client & model configuration
│   │   │   ├── transcriptionService.js  # STT audio processing & disk cleanup
│   │   │   ├── llmService.js            # Structured Output prompt & grammar diagnostics
│   │   │   ├── linguisticFallback.js    # Zero-failure linguistic rule engine for Indian languages
│   │   │   └── ttsService.js            # TTS speech synthesis (resilient/non-fatal)
│   │   │
│   │   ├── middleware/
│   │   │   └── errorHandler.js          # AppError class & centralized error handler
│   │   │
│   │   ├── app.js                       # Express app configuration & CORS
│   │   └── server.js                    # HTTP server startup & graceful shutdown
│   │
│   ├── tests/
│   │   └── pipeline.test.js             # Automated backend integration tests
│   │
│   ├── uploads/                         # Temporary disk cache (auto-cleaned)
│   ├── .env.example                     # Backend environment template
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg                  # Brand microphone icon
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx               # Navigation, brand & session counter
│   │   │   ├── LanguageSelector.jsx     # 10 Indian language selector chips
│   │   │   ├── Recorder.jsx             # Mic button, pulse rings & live visualizer
│   │   │   ├── RecordingTimer.jsx       # Formatted mm:ss recording timer
│   │   │   ├── TranscriptCard.jsx       # User spoken sentence display
│   │   │   ├── FeedbackCard.jsx         # AI correction, feedback & encouragement
│   │   │   ├── ScoreCard.jsx            # Grammar & vocabulary visual score meters
│   │   │   ├── MistakesList.jsx         # Itemized diffs & learner-friendly explanations
│   │   │   ├── AudioPlayer.jsx          # Native TTS & Web Speech playback
│   │   │   ├── Loading.jsx              # Multi-step animated processing screen
│   │   │   ├── ErrorMessage.jsx         # Actionable error alert & retry handling
│   │   │   └── ProgressDashboard.jsx    # Analytics, history & adaptive difficulty
│   │   │
│   │   ├── services/
│   │   │   └── api.js                   # Frontend API client & FormData builder
│   │   │
│   │   ├── hooks/
│   │   │   └── useRecorder.js           # MediaRecorder & Web Speech Recognition hook
│   │   │
│   │   ├── utils/
│   │   │   └── storage.js               # LocalStorage persistence & analytics metrics
│   │   │
│   │   ├── App.jsx                      # Main application state orchestrator
│   │   ├── App.css                      # Component styling & glassmorphism theme
│   │   ├── index.css                    # CSS variables & typography
│   │   └── main.jsx                     # React entrypoint
│   │
│   ├── index.html                       # HTML5 shell with Google Fonts
│   ├── vite.config.js                   # Vite build configuration
│   ├── .env.example                     # Frontend environment template
│   ├── .gitignore
│   └── package.json
├── package.json                         # Root orchestrator scripts (run dev, build, test)
└── README.md
```

---

## ⚙️ Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **OpenAI API Key**: With access to Audio & Chat models
- **Web Browser**: Chrome, Edge, Firefox, Safari, or Brave with microphone permissions enabled

---

## 🚀 Installation & Setup

### 1. Clone or Open the Repository
```bash
cd ai-voice-language-tutor
```

### 2. Configure Environment Variables

#### Backend Environment:
Create `backend/.env` based on `backend/.env.example`:
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env` and add your OpenAI API Key:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
PORT=5000
CLIENT_URL=http://localhost:5173

# Optional Model Overrides:
OPENAI_STT_MODEL=whisper-1
OPENAI_LLM_MODEL=gpt-4o-mini
OPENAI_TTS_MODEL=tts-1
OPENAI_TTS_VOICE=alloy
```

#### Frontend Environment:
Create `.env` in the root:
```env
VITE_API_URL=http://localhost:5000
```

---

### 3. Install Dependencies & Start Servers

#### Start the Backend:
```bash
cd backend
npm install
npm run dev
```
*The backend API will start at `http://localhost:5000`.*

#### Start the Frontend (in a new terminal at the project root):
```bash
npm install
npm run dev
```
*The Vite frontend dev server will launch at `http://localhost:5173`.*

---

## 🔌 API Endpoints Reference

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Returns backend operational status.
- **Response**:
```json
{
  "success": true,
  "message": "AI Voice Language Tutor API is running",
  "timestamp": "2026-09-04T09:50:00.000Z"
}
```

---

### 2. End-to-End Voice Analysis
- **Endpoint**: `POST /api/tutor/analyze`
- **Content-Type**: `multipart/form-data`
- **Request Fields**:
  - `audio` *(File, required)*: Recorded audio Blob (`.webm`, `.mp4`, `.wav`, `.mp3`)
  - `language` *(String, optional)*: Target language (e.g. `"English"`, `"Hindi"`, `"Kannada"`, `"Telugu"`)
- **Success Response (HTTP 200)**:
```json
{
  "success": true,
  "data": {
    "transcript": "Yesterday I go to market and buyed fruits.",
    "analysis": {
      "correctedSentence": "Yesterday, I went to the market and bought fruits.",
      "grammarScore": 65,
      "vocabularyScore": 80,
      "mistakes": [
        {
          "original": "go",
          "correction": "went",
          "type": "grammar",
          "explanation": "Use the past tense 'went' because the action happened yesterday."
        },
        {
          "original": "buyed",
          "correction": "bought",
          "type": "grammar",
          "explanation": "The past tense of 'buy' is irregularly formed as 'bought'."
        }
      ],
      "feedback": "Good attempt! Focus on irregular past-tense verb forms.",
      "encouragement": "Every sentence you practice brings you closer to fluency!",
      "difficulty": "beginner"
    },
    "audio": "data:audio/mp3;base64,SUQzBAAAAA..."
  }
}
```

---

### 3. Text Analysis (Accessibility / Direct Input)
- **Endpoint**: `POST /api/tutor/analyze-text`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "text": "I goes to college every day.",
  "language": "English"
}
```

---

### 4. Standalone Transcription
- **Endpoint**: `POST /api/speech/transcribe`
- **Content-Type**: `multipart/form-data`
- **Request Fields**: `audio` *(File)*, `language` *(String)*

---

## 🧠 LLM Approach & Prompt Engineering

The system prompt strictly instructs the LLM to act as an encouraging, expert language tutor with the following pedagogical constraints:

1. **Meaning Preservation**: Correct syntax and vocabulary without rewriting the learner's intended context.
2. **No False Corrections**: If the learner's sentence is already correct (e.g., *"I went to college yesterday."*), the LLM assigns high scores (95-100), sets `mistakes: []`, and praises accuracy without forcing stylistic edits.
3. **Structured JSON Output**: Guarantees deterministic serialization into typed fields for client UI consumption.
4. **Actionable Explanations**: Explains the root cause of each mistake in simple, accessible language suitable for non-native learners.

---

## 🛡️ Error Handling Architecture

The backend implements centralized error handling returning consistent, user-friendly JSON payloads:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

### Handled Error Codes:
| Error Code | Trigger Scenario | Frontend User Experience |
| :--- | :--- | :--- |
| `MIC_PERMISSION_DENIED` | Browser microphone permission blocked | Alert banner with browser permission prompt instructions |
| `NO_AUDIO` / `EMPTY_AUDIO`| Recording was shorter than 400ms or empty | Friendly warning to hold record button and speak a sentence |
| `AUDIO_TOO_LARGE` | Uploaded audio exceeds 25MB | File size limit alert |
| `INVALID_AUDIO` | Non-audio file format uploaded | Format compatibility alert |
| `NO_SPEECH` | Recording contained only background silence | Prompt to speak clearly and retry |
| `STT_FAILED` | OpenAI Speech-to-Text API glitch | Retryable error banner |
| `LLM_FAILED` | OpenAI LLM service error | Retryable error banner |
| `TTS_FAILED` | TTS speech synthesis quota/network error | Non-fatal: text correction displayed with audio fallback badge |
| `RATE_LIMITED` | OpenAI API rate limit exceeded | Cooling-off advisory |
| `NETWORK_ERROR` | Backend server unreachable | Server connectivity troubleshooting tip |

---

## 🧪 Testing Checklist & Verification

Run the automated backend test suite:
```bash
cd backend
npm test
```

### Verified Test Cases:
- [x] **Test 1 — Grammar Correction**: `"I goes to college every day."` $\to$ Corrected to *"I go to college every day."* (Grammar mistake detected).
- [x] **Test 2 — Multiple Irregular Verbs**: `"Yesterday I go to market and buyed fruits."` $\to$ Corrected to *"Yesterday, I went to the market and bought fruits."*
- [x] **Test 3 — Lexical Collocation**: `"I am doing a mistake."` $\to$ Corrected to *"I am making a mistake."*
- [x] **Test 4 — Already Correct Sentence**: `"I went to college yesterday."` $\to$ Preserved without unnecessary modification, `mistakes: []`, high score awarded.
- [x] **Test 5 — Missing Audio**: Triggers `NO_AUDIO` HTTP 400 validation error.
- [x] **Test 6 — Empty Recording / Short Click**: Triggers `EMPTY_AUDIO` validation error.
- [x] **Test 7 — Microphone Denied**: MediaRecorder hook catches `NotAllowedError` and maps to `MIC_PERMISSION_DENIED`.
- [x] **Test 8 — STT Failure Resilience**: Safe exception handling returning `STT_FAILED`.
- [x] **Test 9 — LLM Failure Resilience**: Centralized catch returning `LLM_FAILED`.
- [x] **Test 10 — TTS Failure Resilience**: Non-fatal fallback allows full text correction display.
- [x] **Test 11 — Silence / Noise**: Returns `NO_SPEECH` asking the user to speak clearly.

---

## 🚢 Deployment Guide

### Deploying the Backend (Render / Railway / Node Host)

1. **Deploy to Render / Railway**:
   - Build Command: `npm install`
   - Start Command: `node src/server.js`
   - Root Directory: `backend`
2. **Set Environment Variables on Backend Host**:
   ```env
   OPENAI_API_KEY=sk-...
   PORT=5000
   CLIENT_URL=https://your-frontend-app.vercel.app
   NODE_ENV=production
   ```

### Deploying the Frontend (Vercel)

1. **Import Repository into Vercel**:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
2. **Set Frontend Environment Variables on Vercel**:
   ```env
   VITE_API_URL=https://your-backend-app.onrender.com
   ```

---

## 🔒 Security Best Practices

- **Zero Client-Side Secrets**: The `OPENAI_API_KEY` exists strictly in the Node.js backend runtime and is **never** bundled or exposed to client JavaScript.
- **Strict Upload Limits & Cleansing**: Uploaded audio is constrained to 25MB and automatically deleted from the server disk via `fs.unlink()` immediately following transcription.
- **CORS Hardening**: Cross-Origin Resource Sharing is locked down to authorized frontend origins.

---

## 🤖 AI Assistance Disclosure

AI coding assistants were utilized during development for architecture brainstorming, interface styling, unit test scaffolding, and documentation. All code was designed, implemented, tested, and reviewed to ensure rigorous adherence to full-stack software engineering best practices.
