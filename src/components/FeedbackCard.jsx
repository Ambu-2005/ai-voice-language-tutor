import React, { useState } from 'react';
import { Sparkles, HeartHandshake, Lightbulb, Copy, Check, Award } from 'lucide-react';

export default function FeedbackCard({
  correctedSentence,
  feedback,
  encouragement,
  difficulty = 'beginner',
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!correctedSentence) return;
    navigator.clipboard.writeText(correctedSentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const difficultyColors = {
    beginner: 'badge-beginner',
    intermediate: 'badge-intermediate',
    advanced: 'badge-advanced',
  };

  return (
    <div className="card feedback-card">
      <div className="card-header">
        <div className="card-title-group">
          <Sparkles size={20} className="card-icon correction-icon" />
          <h2 className="card-title">AI Correction</h2>
        </div>
        <div className="card-header-actions">
          <span className={`badge ${difficultyColors[difficulty] || 'badge-beginner'}`}>
            <Award size={12} />
            <span style={{ textTransform: 'capitalize' }}>{difficulty}</span>
          </span>
          <button
            type="button"
            className="btn-icon-small"
            onClick={handleCopy}
            title="Copy corrected sentence"
            aria-label="Copy corrected sentence"
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="feedback-body">
        <div className="corrected-sentence-box">
          <span className="corrected-label">Target Sentence</span>
          <p className="corrected-sentence-text" id="ai-corrected-sentence-display">
            "{correctedSentence}"
          </p>
        </div>

        {feedback && (
          <div className="feedback-section tutor-feedback">
            <div className="feedback-section-header">
              <Lightbulb size={16} className="feedback-icon" />
              <span className="feedback-section-title">Tutor Feedback</span>
            </div>
            <p className="feedback-text">{feedback}</p>
          </div>
        )}

        {encouragement && (
          <div className="feedback-section tutor-encouragement">
            <div className="feedback-section-header">
              <HeartHandshake size={16} className="encouragement-icon" />
              <span className="feedback-section-title">Encouragement</span>
            </div>
            <p className="encouragement-text">{encouragement}</p>
          </div>
        )}
      </div>
    </div>
  );
}
