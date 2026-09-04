import React, { useState } from 'react';
import { MessageSquareQuote, Copy, Check, Volume2 } from 'lucide-react';

export default function TranscriptCard({ transcript, language = 'English' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!transcript) return null;

  return (
    <div className="card transcript-card">
      <div className="card-header">
        <div className="card-title-group">
          <MessageSquareQuote size={20} className="card-icon transcript-icon" />
          <h2 className="card-title">Your sentence</h2>
        </div>
        <div className="card-header-actions">
          <span className="badge badge-language">{language}</span>
          <button
            type="button"
            className="btn-icon-small"
            onClick={handleCopy}
            title="Copy transcript"
            aria-label="Copy transcript text"
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="transcript-body">
        <p className="transcript-text" id="user-transcript-display">
          "{transcript}"
        </p>
      </div>
    </div>
  );
}
