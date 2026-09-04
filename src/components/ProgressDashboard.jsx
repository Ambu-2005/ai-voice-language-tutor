import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Flame,
  Target,
  Sparkles,
  Layers,
} from 'lucide-react';
import { calculateStats, clearSessions, deleteSession } from '../utils/storage';

export default function ProgressDashboard({ sessions = [], onSessionsChange, onBackToTutor }) {
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const stats = calculateStats(sessions);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    const updated = deleteSession(id);
    if (onSessionsChange) onSessionsChange(updated);
  };

  const handleClearAll = () => {
    clearSessions();
    setConfirmClear(false);
    if (onSessionsChange) onSessionsChange([]);
  };

  const toggleExpand = (id) => {
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  const difficultyDetails = {
    beginner: {
      color: 'badge-beginner',
      title: '🌱 Beginner Level',
      desc: 'Focus on core sentence structure, basic verb tenses, and everyday vocabulary.',
    },
    intermediate: {
      color: 'badge-intermediate',
      title: '⚡ Intermediate Level',
      desc: 'Focus on irregular verb tenses, prepositions, connectors, and conversational naturalness.',
    },
    advanced: {
      color: 'badge-advanced',
      title: '🏆 Advanced Level',
      desc: 'Focus on idiomatic phrasing, subtle tone nuances, and advanced specialized vocabulary.',
    },
  };

  const currentDiff = difficultyDetails[stats.adaptiveDifficulty] || difficultyDetails.beginner;

  return (
    <div className="progress-dashboard">
      {/* Top Banner & Quick Navigation */}
      <div className="dashboard-header-row">
        <div>
          <h2 className="dashboard-title">Learner Progress & Analytics</h2>
          <p className="dashboard-subtitle">
            Track your speaking accuracy, grammar trends, and AI-adapted learning level over time.
          </p>
        </div>

        <div className="dashboard-top-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onBackToTutor}
          >
            <Sparkles size={14} />
            <span>Practice New Sentence</span>
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="card empty-dashboard-card">
          <div className="empty-dashboard-icon">
            <Target size={40} />
          </div>
          <h3>No Practice Sessions Yet</h3>
          <p>
            Record your first spoken sentence with the AI Tutor to start tracking your grammar accuracy and adaptive learning progress.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onBackToTutor}
          >
            Start First Session
          </button>
        </div>
      ) : (
        <>
          {/* Key Metrics Overview Cards */}
          <div className="dashboard-metrics-grid">
            <div className="metric-stat-card">
              <div className="metric-stat-icon sessions-icon">
                <Flame size={22} />
              </div>
              <div className="metric-stat-info">
                <span className="metric-stat-label">Total Sessions</span>
                <span className="metric-stat-value" id="total-sessions-stat">{stats.totalSessions}</span>
              </div>
            </div>

            <div className="metric-stat-card">
              <div className="metric-stat-icon grammar-icon">
                <CheckCircle2 size={22} />
              </div>
              <div className="metric-stat-info">
                <span className="metric-stat-label">Avg Grammar Score</span>
                <span className="metric-stat-value" id="avg-grammar-stat">{stats.averageGrammar}%</span>
              </div>
            </div>

            <div className="metric-stat-card">
              <div className="metric-stat-icon vocab-icon">
                <BookOpen size={22} />
              </div>
              <div className="metric-stat-info">
                <span className="metric-stat-label">Avg Vocabulary Score</span>
                <span className="metric-stat-value" id="avg-vocab-stat">{stats.averageVocabulary}%</span>
              </div>
            </div>

            <div className="metric-stat-card">
              <div className="metric-stat-icon overall-icon">
                <TrendingUp size={22} />
              </div>
              <div className="metric-stat-info">
                <span className="metric-stat-label">Overall Fluency</span>
                <span className="metric-stat-value" id="overall-fluency-stat">{stats.overallAverage}%</span>
              </div>
            </div>
          </div>

          {/* Adaptive Difficulty & AI Recommendation Banner */}
          <div className="card adaptive-difficulty-card">
            <div className="adaptive-header">
              <div className="adaptive-title-group">
                <Layers size={20} className="card-icon" />
                <h3 className="card-title">Adaptive Difficulty Guidance</h3>
              </div>
              <span className={`badge ${currentDiff.color}`}>{currentDiff.title}</span>
            </div>

            <div className="adaptive-body">
              <p className="adaptive-desc">{currentDiff.desc}</p>
              <div className="difficulty-tier-pills">
                <div className={`tier-pill ${stats.adaptiveDifficulty === 'beginner' ? 'current' : ''}`}>
                  <span className="tier-name">Beginner (&lt;60%)</span>
                </div>
                <div className={`tier-pill ${stats.adaptiveDifficulty === 'intermediate' ? 'current' : ''}`}>
                  <span className="tier-name">Intermediate (60–79%)</span>
                </div>
                <div className={`tier-pill ${stats.adaptiveDifficulty === 'advanced' ? 'current' : ''}`}>
                  <span className="tier-name">Advanced (80%+)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Common Mistake Breakdown */}
          {stats.commonMistakes.length > 0 && (
            <div className="card common-mistakes-card">
              <div className="card-header">
                <div className="card-title-group">
                  <Target size={20} className="card-icon" />
                  <h3 className="card-title">Mistake Frequency by Category</h3>
                </div>
              </div>

              <div className="mistake-categories-list">
                {stats.commonMistakes.map((item) => {
                  const maxCount = stats.commonMistakes[0]?.count || 1;
                  const percent = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={item.type} className="category-row">
                      <div className="category-meta">
                        <span className="category-name">{item.type.replace('_', ' ')}</span>
                        <span className="category-count">{item.count} {item.count === 1 ? 'time' : 'times'}</span>
                      </div>
                      <div className="category-track">
                        <div className="category-fill" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Practice History Session List */}
          <div className="card session-history-card">
            <div className="card-header">
              <div className="card-title-group">
                <Calendar size={20} className="card-icon" />
                <h3 className="card-title">Practice History ({sessions.length})</h3>
              </div>

              {!confirmClear ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => setConfirmClear(true)}
                >
                  <Trash2 size={12} />
                  <span>Clear History</span>
                </button>
              ) : (
                <div className="confirm-clear-group">
                  <span className="confirm-text">Are you sure?</span>
                  <button
                    type="button"
                    className="btn btn-danger btn-xs"
                    onClick={handleClearAll}
                  >
                    Yes, Clear
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs"
                    onClick={() => setConfirmClear(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="sessions-list">
              {sessions.map((session) => {
                const isExpanded = expandedSessionId === session.id;
                const dateFormatted = new Date(session.date).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={session.id}
                    className={`session-row-item ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleExpand(session.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="session-summary-header">
                      <div className="session-summary-left">
                        <span className="badge badge-language">{session.language}</span>
                        <span className="session-date">{dateFormatted}</span>
                        <p className="session-preview-sentence">"{session.transcript}"</p>
                      </div>

                      <div className="session-summary-right">
                        <div className="session-scores-mini">
                          <span className="score-mini grammar" title="Grammar Score">
                            G: {session.grammarScore}
                          </span>
                          <span className="score-mini vocab" title="Vocabulary Score">
                            V: {session.vocabularyScore}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-delete-session"
                          onClick={(e) => handleDelete(session.id, e)}
                          title="Delete session"
                          aria-label="Delete session"
                        >
                          <Trash2 size={14} />
                        </button>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="session-expanded-details">
                        <div className="expanded-field">
                          <span className="expanded-label">Target Correction:</span>
                          <p className="expanded-value-text highlight">
                            "{session.correctedSentence}"
                          </p>
                        </div>

                        {session.feedback && (
                          <div className="expanded-field">
                            <span className="expanded-label">Feedback:</span>
                            <p className="expanded-value-text">{session.feedback}</p>
                          </div>
                        )}

                        {session.mistakes?.length > 0 && (
                          <div className="expanded-field">
                            <span className="expanded-label">Mistakes ({session.mistakes.length}):</span>
                            <div className="expanded-mistakes-tags">
                              {session.mistakes.map((m, mIdx) => (
                                <span key={mIdx} className="mini-mistake-pill">
                                  <del>{m.original}</del> → <strong>{m.correction}</strong>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
