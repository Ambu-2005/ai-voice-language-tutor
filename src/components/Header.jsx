import React from 'react';
import { Mic, BarChart3, Sparkles, Volume2 } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, sessionCount = 0 }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand" onClick={() => setActiveTab('tutor')} role="button" tabIndex={0}>
          <div className="brand-icon-wrapper">
            <Mic className="brand-icon" size={24} />
            <span className="brand-pulse-dot"></span>
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">AI Voice Language Tutor</h1>
              <span className="brand-badge">
                <Sparkles size={12} />
                <span>AI Powered</span>
              </span>
            </div>
            <p className="brand-subtitle">
              Real-time Speech Recognition, Grammar Diagnostics & Spoken Feedback
            </p>
          </div>
        </div>

        <nav className="header-nav">
          <button
            id="nav-tutor-btn"
            className={`nav-tab-btn ${activeTab === 'tutor' ? 'active' : ''}`}
            onClick={() => setActiveTab('tutor')}
            aria-label="Practice Tutor Mode"
          >
            <Volume2 size={18} />
            <span>Tutor</span>
          </button>

          <button
            id="nav-progress-btn"
            className={`nav-tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
            aria-label="View Progress and Analytics"
          >
            <BarChart3 size={18} />
            <span>Progress</span>
            {sessionCount > 0 && <span className="nav-counter-badge">{sessionCount}</span>}
          </button>
        </nav>
      </div>
    </header>
  );
}
