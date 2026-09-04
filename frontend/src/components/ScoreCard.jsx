import React from 'react';
import { CheckCircle2, BookOpen, Gauge } from 'lucide-react';

function getScoreGrade(score) {
  if (score >= 90) return { label: 'Excellent', colorClass: 'score-excellent' };
  if (score >= 75) return { label: 'Good', colorClass: 'score-good' };
  if (score >= 60) return { label: 'Fair', colorClass: 'score-fair' };
  return { label: 'Needs Practice', colorClass: 'score-needs-work' };
}

export default function ScoreCard({ grammarScore = 0, vocabularyScore = 0 }) {
  const grammarGrade = getScoreGrade(grammarScore);
  const vocabGrade = getScoreGrade(vocabularyScore);

  return (
    <div className="card scores-card">
      <div className="card-header">
        <div className="card-title-group">
          <Gauge size={20} className="card-icon score-icon" />
          <h2 className="card-title">Assessment Scores</h2>
        </div>
      </div>

      <div className="scores-grid">
        {/* Grammar Score Meter */}
        <div className="score-item">
          <div className="score-item-top">
            <div className="score-label-group">
              <CheckCircle2 size={16} className="score-type-icon grammar" />
              <span className="score-name">Grammar Accuracy</span>
            </div>
            <span className={`score-badge ${grammarGrade.colorClass}`}>
              {grammarGrade.label}
            </span>
          </div>

          <div className="score-number-row">
            <span className="score-value" id="grammar-score-value">{grammarScore}</span>
            <span className="score-max">/ 100</span>
          </div>

          <div className="score-bar-track">
            <div
              className={`score-bar-fill ${grammarGrade.colorClass}`}
              style={{ width: `${Math.min(100, Math.max(5, grammarScore))}%` }}
            />
          </div>
        </div>

        {/* Vocabulary Score Meter */}
        <div className="score-item">
          <div className="score-item-top">
            <div className="score-label-group">
              <BookOpen size={16} className="score-type-icon vocabulary" />
              <span className="score-name">Vocabulary & Phrasing</span>
            </div>
            <span className={`score-badge ${vocabGrade.colorClass}`}>
              {vocabGrade.label}
            </span>
          </div>

          <div className="score-number-row">
            <span className="score-value" id="vocab-score-value">{vocabularyScore}</span>
            <span className="score-max">/ 100</span>
          </div>

          <div className="score-bar-track">
            <div
              className={`score-bar-fill ${vocabGrade.colorClass}`}
              style={{ width: `${Math.min(100, Math.max(5, vocabularyScore))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
