import React from 'react';
import { AlertTriangle, CheckCircle, ArrowRight, BookMarked } from 'lucide-react';

export default function MistakesList({ mistakes = [] }) {
  if (!Array.isArray(mistakes) || mistakes.length === 0) {
    return (
      <div className="card mistakes-card flawless-sentence">
        <div className="flawless-content">
          <div className="flawless-icon-wrapper">
            <CheckCircle size={32} className="flawless-icon" />
          </div>
          <div className="flawless-text-group">
            <h3 className="flawless-title">No Mistakes Found!</h3>
            <p className="flawless-desc">
              Your sentence is grammatically correct, natural, and well-structured. Excellent job!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card mistakes-card">
      <div className="card-header">
        <div className="card-title-group">
          <AlertTriangle size={20} className="card-icon mistakes-icon" />
          <h2 className="card-title">Mistakes & Corrections</h2>
        </div>
        <span className="badge badge-warning">
          {mistakes.length} {mistakes.length === 1 ? 'Correction' : 'Corrections'}
        </span>
      </div>

      <div className="mistakes-list">
        {mistakes.map((item, index) => (
          <div key={index} className="mistake-item">
            <div className="mistake-item-header">
              <span className="mistake-number">#{index + 1}</span>
              <span className="mistake-type-tag">
                {item.type ? item.type.replace('_', ' ') : 'grammar'}
              </span>
            </div>

            <div className="mistake-diff-row">
              <div className="diff-pill diff-original">
                <span className="diff-label">Original:</span>
                <span className="diff-text strike">{item.original}</span>
              </div>

              <ArrowRight size={16} className="diff-arrow" />

              <div className="diff-pill diff-correction">
                <span className="diff-label">Corrected:</span>
                <span className="diff-text highlight">{item.correction}</span>
              </div>
            </div>

            {item.explanation && (
              <div className="mistake-explanation-row">
                <BookMarked size={14} className="explanation-icon" />
                <p className="mistake-explanation">{item.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
