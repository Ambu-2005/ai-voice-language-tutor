import React from 'react';

/**
 * Formats seconds into mm:ss
 */
function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function RecordingTimer({ seconds = 0, isRecording = false }) {
  return (
    <div className={`recording-timer-badge ${isRecording ? 'recording-active' : ''}`} aria-live="polite">
      <span className="timer-live-dot" />
      <span className="timer-digits">{formatTime(seconds)}</span>
      <span className="timer-status-text">{isRecording ? 'REC' : 'STANDBY'}</span>
    </div>
  );
}
