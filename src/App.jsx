import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LanguageSelector from './components/LanguageSelector';
import Recorder from './components/Recorder';
import TranscriptCard from './components/TranscriptCard';
import FeedbackCard from './components/FeedbackCard';
import ScoreCard from './components/ScoreCard';
import MistakesList from './components/MistakesList';
import AudioPlayer from './components/AudioPlayer';
import Loading from './components/Loading';
import ErrorMessage from './components/ErrorMessage';
import ProgressDashboard from './components/ProgressDashboard';
import { useRecorder } from './hooks/useRecorder';
import { analyzeRecording, analyzeText } from './services/api';
import { getSessions, saveSession } from './utils/storage';
import { RotateCcw, Keyboard, Mic, Sparkles } from 'lucide-react';
import './App.css';

export default function App() {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [recordingState, setRecordingState] = useState('idle'); // idle | recording | processing | success | error
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [audioDataUri, setAudioDataUri] = useState(null);
  const [appError, setAppError] = useState(null);
  const [activeTab, setActiveTab] = useState('tutor'); // 'tutor' | 'progress'
  const [sessions, setSessions] = useState([]);
  
  // Accessibility / Text Input Fallback Mode
  const [textMode, setTextMode] = useState(false);
  const [manualText, setManualText] = useState('');

  const {
    isRecording,
    recordingTime,
    audioLevel,
    recorderError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useRecorder();

  // Load saved learning sessions on mount
  useEffect(() => {
    setSessions(getSessions());
  }, []);

  // Update recording state when hook triggers error
  useEffect(() => {
    if (recorderError) {
      setRecordingState('error');
      setAppError(recorderError);
    }
  }, [recorderError]);

  /**
   * Starts microphone recording
   */
  const handleStart = async () => {
    setAppError(null);
    setTranscript('');
    setAnalysis(null);
    setAudioDataUri(null);

    try {
      await startRecording();
      setRecordingState('recording');
    } catch (err) {
      setRecordingState('error');
      setAppError(err);
    }
  };

  /**
   * Stops microphone recording and runs AI Pipeline (STT -> LLM -> TTS)
   */
  const handleStop = async () => {
    try {
      setRecordingState('processing');
      const blob = await stopRecording();

      const result = await analyzeRecording(blob, selectedLanguage);

      setTranscript(result.transcript);
      setAnalysis(result.analysis);
      setAudioDataUri(result.audio);
      setRecordingState('success');

      // Persist session to localStorage
      const saved = saveSession({
        language: selectedLanguage,
        transcript: result.transcript,
        analysis: result.analysis,
      });

      if (saved) {
        setSessions(getSessions());
      }
    } catch (err) {
      console.error('Pipeline processing error:', err);
      setRecordingState('error');
      setAppError(err);
    }
  };

  /**
   * Submits typed text sentence (Accessibility / Fallback)
   */
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualText.trim() || recordingState === 'processing') return;

    setAppError(null);
    setRecordingState('processing');

    try {
      const result = await analyzeText(manualText.trim(), selectedLanguage);

      setTranscript(result.transcript);
      setAnalysis(result.analysis);
      setAudioDataUri(result.audio);
      setRecordingState('success');

      // Save to sessions
      const saved = saveSession({
        language: selectedLanguage,
        transcript: result.transcript,
        analysis: result.analysis,
      });

      if (saved) {
        setSessions(getSessions());
      }
    } catch (err) {
      console.error('Text submission error:', err);
      setRecordingState('error');
      setAppError(err);
    }
  };

  /**
   * Resets current session state for another attempt
   */
  const handleTryAgain = () => {
    resetRecording();
    setTranscript('');
    setAnalysis(null);
    setAudioDataUri(null);
    setAppError(null);
    setManualText('');
    setRecordingState('idle');
  };

  return (
    <div className="app-layout">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sessionCount={sessions.length}
      />

      <main className="main-content">
        <div className="content-container">
          {/* View 1: Progress & Analytics Dashboard */}
          {activeTab === 'progress' && (
            <ProgressDashboard
              sessions={sessions}
              onSessionsChange={setSessions}
              onBackToTutor={() => setActiveTab('tutor')}
            />
          )}

          {/* View 2: Main Voice Tutor Workspace */}
          {activeTab === 'tutor' && (
            <div className="tutor-workspace">
              {/* Language Selection */}
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onSelectLanguage={(lang) => {
                  setSelectedLanguage(lang);
                  handleTryAgain();
                }}
                disabled={isRecording || recordingState === 'processing'}
              />

              {/* Mode Toggle: Voice vs Keyboard */}
              <div className="mode-toggle-bar">
                <button
                  type="button"
                  className={`mode-pill ${!textMode ? 'active' : ''}`}
                  onClick={() => setTextMode(false)}
                  disabled={isRecording || recordingState === 'processing'}
                >
                  <Mic size={14} />
                  <span>Voice Microphone</span>
                </button>
                <button
                  type="button"
                  className={`mode-pill ${textMode ? 'active' : ''}`}
                  onClick={() => setTextMode(true)}
                  disabled={isRecording || recordingState === 'processing'}
                >
                  <Keyboard size={14} />
                  <span>Type Sentence (Accessibility)</span>
                </button>
              </div>

              {/* Input Area: Voice Recorder OR Text Input */}
              {!textMode ? (
                <Recorder
                  isRecording={isRecording}
                  recordingTime={recordingTime}
                  audioLevel={audioLevel}
                  recordingState={recordingState}
                  onStart={handleStart}
                  onStop={handleStop}
                  onReset={handleTryAgain}
                  selectedLanguage={selectedLanguage}
                />
              ) : (
                <div className="card manual-input-card">
                  <form onSubmit={handleManualSubmit}>
                    <label htmlFor="manual-sentence-input" className="manual-input-label">
                      Type your sentence in <strong>{selectedLanguage}</strong>:
                    </label>
                    <div className="manual-input-row">
                      <input
                        id="manual-sentence-input"
                        type="text"
                        className="manual-text-input"
                        placeholder={`e.g. Yesterday I go to market and buyed fruits.`}
                        value={manualText}
                        onChange={(e) => setManualText(e.target.value)}
                        disabled={recordingState === 'processing'}
                      />
                      <button
                        id="submit-text-btn"
                        type="submit"
                        className="btn btn-primary"
                        disabled={!manualText.trim() || recordingState === 'processing'}
                      >
                        <Sparkles size={16} />
                        <span>Analyze</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Loading State Animation */}
              {recordingState === 'processing' && <Loading />}

              {/* Error Message Box */}
              {appError && (
                <ErrorMessage
                  error={appError}
                  onRetry={handleTryAgain}
                  onDismiss={() => setAppError(null)}
                />
              )}

              {/* Success Results Showcase */}
              {recordingState === 'success' && analysis && (
                <section className="results-section" aria-label="Analysis Results">
                  {/* Action Bar (Try Again / Practice Another) */}
                  <div className="results-actions-top">
                    <span className="results-badge">
                      <Sparkles size={14} />
                      AI Evaluation Complete
                    </span>
                    <button
                      id="try-again-btn"
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleTryAgain}
                    >
                      <RotateCcw size={14} />
                      <span>Try Another Sentence</span>
                    </button>
                  </div>

                  {/* 1. Learner Transcript */}
                  <TranscriptCard
                    transcript={transcript}
                    language={selectedLanguage}
                  />

                  {/* 2. AI Corrected Sentence & Pedagogical Feedback */}
                  <FeedbackCard
                    correctedSentence={analysis.correctedSentence}
                    feedback={analysis.feedback}
                    encouragement={analysis.encouragement}
                    difficulty={analysis.difficulty}
                  />

                  {/* 3. Text-to-Speech Pronunciation Player */}
                  <AudioPlayer
                    audioDataUri={audioDataUri}
                    correctedSentence={analysis.correctedSentence}
                  />

                  {/* 4. Assessment Scores (Grammar & Vocabulary Gauges) */}
                  <ScoreCard
                    grammarScore={analysis.grammarScore}
                    vocabularyScore={analysis.vocabularyScore}
                  />

                  {/* 5. Itemized Mistakes & Explanations */}
                  <MistakesList mistakes={analysis.mistakes} />
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <p>
            AI Voice Language Tutor • Built with OpenAI STT, Structured LLM Outputs & TTS
          </p>
        </div>
      </footer>
    </div>
  );
}
