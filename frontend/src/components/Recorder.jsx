import React from 'react';
import { Mic, Square, Sparkles, Volume2, AlertCircle } from 'lucide-react';
import RecordingTimer from './RecordingTimer';

export default function Recorder({
  isRecording,
  recordingTime,
  audioLevel,
  recordingState, // 'idle' | 'recording' | 'processing' | 'success' | 'error'
  recognizedText = '',
  onStart,
  onStop,
  onReset,
  selectedLanguage,
}) {
  const isProcessing = recordingState === 'processing';

  // Generate visualizer bars dynamically based on live audio level
  const visualizerBars = [0.3, 0.6, 0.9, 1.2, 0.8, 1.4, 1.0, 0.7, 1.3, 0.5, 0.9, 0.4];

  return (
    <div className={`recorder-card ${isRecording ? 'is-recording-mode' : ''}`}>
      <div className="recorder-top-bar">
        <div className="recorder-status-tag">
          {isRecording ? (
            <span className="status-pill recording">
              <span className="status-dot-pulse" />
              Recording Audio
            </span>
          ) : isProcessing ? (
            <span className="status-pill processing">
              <Sparkles size={14} className="spin-icon" />
              Analyzing with AI
            </span>
          ) : (
            <span className="status-pill idle">
              <Mic size={14} />
              Ready to Practice
            </span>
          )}
        </div>

        <RecordingTimer seconds={recordingTime} isRecording={isRecording} />
      </div>

      {/* Main Microphone Action Sphere */}
      <div className="recorder-visualizer-container">
        {/* Animated Pulse Waves during recording */}
        {isRecording && (
          <>
            <div
              className="mic-pulse-ring ring-1"
              style={{ transform: `scale(${1 + audioLevel * 0.008})`, opacity: 0.7 }}
            />
            <div
              className="mic-pulse-ring ring-2"
              style={{ transform: `scale(${1 + audioLevel * 0.014})`, opacity: 0.4 }}
            />
            <div
              className="mic-pulse-ring ring-3"
              style={{ transform: `scale(${1 + audioLevel * 0.02})`, opacity: 0.2 }}
            />
          </>
        )}

        <button
          id="main-record-toggle-btn"
          type="button"
          className={`mic-hero-button ${isRecording ? 'recording' : ''} ${isProcessing ? 'disabled' : ''}`}
          onClick={isRecording ? onStop : onStart}
          disabled={isProcessing}
          aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
          title={isRecording ? 'Click to Stop Recording' : `Click to record your ${selectedLanguage} sentence`}
        >
          {isRecording ? (
            <Square size={36} className="mic-hero-icon stop-icon" />
          ) : (
            <Mic size={40} className="mic-hero-icon mic-icon" />
          )}
        </button>
      </div>

      {/* Dynamic Soundwave Visualizer Bars */}
      {isRecording && (
        <div className="audio-wave-visualizer" aria-hidden="true">
          {visualizerBars.map((multiplier, idx) => {
            const height = Math.max(6, Math.min(48, Math.round((audioLevel * multiplier * 0.6) + 6)));
            return (
              <div
                key={idx}
                className="wave-bar"
                style={{
                  height: `${height}px`,
                  opacity: Math.max(0.3, audioLevel / 100),
                }}
              />
            );
          })}
        </div>
      )}

      {/* Live speech preview if speech recognition captured words */}
      {isRecording && recognizedText && (
        <div className="live-speech-preview">
          <span className="live-speech-dot" />
          <p className="live-speech-text">"{recognizedText}"</p>
        </div>
      )}

      {/* Instructional text & Action Buttons */}
      <div className="recorder-controls-area">
        {!isRecording && !isProcessing && (
          <p className="recorder-instruction">
            Press the microphone button and speak a sentence in <strong>{selectedLanguage}</strong>.
          </p>
        )}

        {isRecording && (
          <p className="recorder-instruction active">
            Speaking in <strong>{selectedLanguage}</strong>... Click <strong>Stop</strong> when you finish.
          </p>
        )}

        <div className="recorder-btn-group">
          {!isRecording ? (
            <button
              id="start-recording-btn"
              type="button"
              className="btn btn-primary btn-record-start"
              onClick={onStart}
              disabled={isProcessing}
            >
              <Mic size={18} />
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              id="stop-recording-btn"
              type="button"
              className="btn btn-danger btn-record-stop"
              onClick={onStop}
            >
              <Square size={18} />
              <span>Stop & Analyze</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
