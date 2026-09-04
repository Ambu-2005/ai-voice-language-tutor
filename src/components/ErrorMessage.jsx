import React from 'react';
import { AlertCircle, RotateCcw, X, MicOff, WifiOff, VolumeX } from 'lucide-react';

const ERROR_METADATA = {
  MIC_PERMISSION_DENIED: {
    icon: MicOff,
    title: 'Microphone Permission Blocked',
    tip: 'Please click the lock/settings icon in your browser URL bar and allow microphone access.',
  },
  NO_SPEECH: {
    icon: AlertCircle,
    title: 'No Speech Detected',
    tip: 'No voice was heard. Please speak clearly into your microphone and try again.',
  },
  EMPTY_AUDIO: {
    icon: AlertCircle,
    title: 'Recording Was Too Short',
    tip: 'Please hold the recording button and speak a full sentence before stopping.',
  },
  NETWORK_ERROR: {
    icon: WifiOff,
    title: 'Connection Problem',
    tip: 'Could not connect to the tutor backend. Ensure the backend server is running.',
  },
  TTS_FAILED: {
    icon: VolumeX,
    title: 'Audio Playback Unavailable',
    tip: 'The text correction is ready, but speech synthesis is temporarily unavailable.',
  },
  RATE_LIMITED: {
    icon: AlertCircle,
    title: 'Service Rate Limit',
    tip: 'AI service request limit reached. Please wait a few moments before trying again.',
  },
};

export default function ErrorMessage({ error, onRetry, onDismiss }) {
  if (!error) return null;

  const code = error.code || 'SERVER_ERROR';
  const meta = ERROR_METADATA[code] || {
    icon: AlertCircle,
    title: 'Unable to Complete Request',
    tip: 'An unexpected issue occurred. Please check your connection and try again.',
  };
  const IconComponent = meta.icon;

  return (
    <div className="card error-card" role="alert">
      <div className="error-card-content">
        <div className="error-icon-wrapper">
          <IconComponent size={24} className="error-icon" />
        </div>

        <div className="error-details">
          <div className="error-header-row">
            <h3 className="error-title">{meta.title}</h3>
            <span className="badge badge-error-code">{code}</span>
          </div>

          <p className="error-message-text">{error.message || meta.tip}</p>
          {meta.tip && error.message !== meta.tip && (
            <p className="error-tip-text">💡 <strong>Tip:</strong> {meta.tip}</p>
          )}

          <div className="error-actions-row">
            {onRetry && (
              <button
                id="error-try-again-btn"
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onRetry}
              >
                <RotateCcw size={14} />
                <span>Try Again</span>
              </button>
            )}

            {onDismiss && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onDismiss}
              >
                <X size={14} />
                <span>Dismiss</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
