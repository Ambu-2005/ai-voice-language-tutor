import React from 'react';
import { Globe } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { id: 'English', name: 'English', native: 'English', flag: '🇬🇧', hint: 'Universal' },
  { id: 'Hindi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳', hint: 'Devanagari' },
  { id: 'Kannada', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', hint: 'Dravidian' },
  { id: 'Telugu', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', hint: 'Dravidian' },
  { id: 'Spanish', name: 'Spanish', native: 'Español', flag: '🇪🇸', hint: 'Romance' },
  { id: 'French', name: 'French', native: 'Français', flag: '🇫🇷', hint: 'Romance' },
  { id: 'German', name: 'German', native: 'Deutsch', flag: '🇩🇪', hint: 'Germanic' },
  { id: 'Japanese', name: 'Japanese', native: '日本語', flag: '🇯🇵', hint: 'East Asian' },
];

export default function LanguageSelector({ selectedLanguage, onSelectLanguage, disabled = false }) {
  return (
    <div className="language-selector-section">
      <div className="section-label-row">
        <Globe size={16} className="section-icon" />
        <label htmlFor="language-select" className="section-label">
          Target Learning Language
        </label>
        <span className="section-helper-text">Select the language you want to speak</span>
      </div>

      <div className="language-chips-grid" role="radiogroup" aria-label="Target Learning Language">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.id;
          return (
            <button
              key={lang.id}
              id={`lang-btn-${lang.id.toLowerCase()}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              className={`language-chip ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectLanguage(lang.id)}
            >
              <span className="lang-flag" role="img" aria-label={lang.name}>
                {lang.flag}
              </span>
              <div className="lang-text-group">
                <span className="lang-name">{lang.name}</span>
                <span className="lang-native">{lang.native}</span>
              </div>
              {isSelected && <span className="lang-selected-indicator" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
