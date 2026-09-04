import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Gauge, Sparkles } from 'lucide-react';

const BCP47_LANGUAGE_CODES = {
  english: 'en-IN',
  hindi: 'hi-IN',
  kannada: 'kn-IN',
  telugu: 'te-IN',
  tamil: 'ta-IN',
  marathi: 'mr-IN',
  bengali: 'bn-IN',
  malayalam: 'ml-IN',
  gujarati: 'gu-IN',
  punjabi: 'pa-IN',
};

function getVoiceLang(language) {
  if (!language) return 'en-US';
  const key = language.trim().toLowerCase();
  return BCP47_LANGUAGE_CODES[key] || 'en-US';
}

export default function AudioPlayer({ audioDataUri, correctedSentence, language = 'English' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [playbackError, setPlaybackError] = useState(false);

  const audioRef = useRef(null);
  const isSpeechSynthesisMode = !audioDataUri;

  // Cleanup speech synthesis on unmount or sentence change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setPlaybackError(false);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [audioDataUri, correctedSentence, playbackRate]);

  // SpeechSynthesis Playback Handler
  const speakWithSpeechSynthesis = () => {
    if (!window.speechSynthesis || !correctedSentence) {
      setPlaybackError(true);
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(correctedSentence);
    const targetLangCode = getVoiceLang(language);
    utterance.lang = targetLangCode;
    utterance.rate = playbackRate;

    // Pick best available voice matching target language
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.startsWith(targetLangCode.split('-')[0]) || v.lang === targetLangCode);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setPlaybackError(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    utterance.onerror = (err) => {
      console.warn('SpeechSynthesis error:', err);
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const togglePlay = () => {
    if (isSpeechSynthesisMode) {
      speakWithSpeechSynthesis();
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error('Playback error:', err);
          // If HTML5 audio playback fails, try fallback to SpeechSynthesis
          speakWithSpeechSynthesis();
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e) => {
    if (isSpeechSynthesisMode) return;
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleReplay = () => {
    if (isSpeechSynthesisMode) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      speakWithSpeechSynthesis();
      return;
    }

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => speakWithSpeechSynthesis());
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 0.75, 1.25];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIndex];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
    if (isPlaying && isSpeechSynthesisMode) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const formatSeconds = (sec) => {
    if (isNaN(sec)) return '0:00';
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card audio-player-card">
      <div className="audio-header">
        <div className="card-title-group">
          <Volume2 size={20} className="card-icon audio-icon" />
          <h2 className="card-title">Listen to Native Pronunciation</h2>
        </div>
        <span className="audio-voice-badge">
          <Sparkles size={12} />
          {audioDataUri ? 'AI Native Voice' : 'Native Accent Synthesis'}
        </span>
      </div>

      {!isSpeechSynthesisMode && (
        <audio
          ref={audioRef}
          src={audioDataUri}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={() => setPlaybackError(true)}
          preload="auto"
        />
      )}

      <div className="audio-player-controls">
        {/* Play/Pause Main Button */}
        <button
          id="play-correction-audio-btn"
          type="button"
          className={`btn-audio-play ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause Audio' : 'Play Correction Audio'}
          title={isPlaying ? 'Pause' : 'Play Pronunciation'}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} className="play-icon-offset" />}
          <span>{isPlaying ? 'Pause' : 'Play Correction'}</span>
        </button>

        {/* Replay Button */}
        <button
          type="button"
          className="btn-audio-aux"
          onClick={handleReplay}
          title="Replay from start"
          aria-label="Replay audio"
        >
          <RotateCcw size={16} />
        </button>

        {/* Speed Modifier Button */}
        <button
          type="button"
          className="btn-audio-speed"
          onClick={cyclePlaybackRate}
          title="Change playback speed"
          aria-label={`Playback speed: ${playbackRate}x`}
        >
          <Gauge size={14} />
          <span>{playbackRate}x</span>
        </button>

        {/* Scrubber / Progress Bar */}
        {!isSpeechSynthesisMode ? (
          <div className="audio-scrubber-group">
            <span className="audio-timestamp">{formatSeconds(currentTime)}</span>
            <input
              type="range"
              className="audio-scrub-slider"
              min="0"
              max={duration || 1}
              step="0.01"
              value={currentTime}
              onChange={handleSeek}
              aria-label="Audio progress slider"
            />
            <span className="audio-timestamp">{formatSeconds(duration)}</span>
          </div>
        ) : (
          <div className="audio-synthesis-indicator">
            <span className={`synth-dot ${isPlaying ? 'active' : ''}`} />
            <span className="synth-label">{isPlaying ? 'Speaking corrected sentence...' : `Ready in ${language}`}</span>
          </div>
        )}
      </div>

      {playbackError && (
        <p className="audio-error-text">
          Failed to play audio. Please click play again.
        </p>
      )}
    </div>
  );
}
