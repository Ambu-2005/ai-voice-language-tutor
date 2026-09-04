import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, AlertCircle, Gauge } from 'lucide-react';

export default function AudioPlayer({ audioDataUri, correctedSentence }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [playbackError, setPlaybackError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);

  // Initialize audio when URI changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setPlaybackError(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [audioDataUri, playbackRate]);

  const togglePlay = () => {
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
          setPlaybackError(true);
          setIsPlaying(false);
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
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setPlaybackError(true));
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
  };

  const formatSeconds = (sec) => {
    if (isNaN(sec)) return '0:00';
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If no audio returned by backend (TTS failure fallback)
  if (!audioDataUri) {
    return (
      <div className="card audio-player-card audio-unavailable">
        <div className="audio-header">
          <div className="card-title-group">
            <VolumeX size={20} className="card-icon" />
            <h2 className="card-title">Listen to Correction</h2>
          </div>
        </div>
        <div className="audio-unavailable-box">
          <AlertCircle size={18} className="text-muted" />
          <span>Spoken pronunciation audio is currently unavailable. You can still read the text correction above.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card audio-player-card">
      <div className="audio-header">
        <div className="card-title-group">
          <Volume2 size={20} className="card-icon audio-icon" />
          <h2 className="card-title">Listen to Correction</h2>
        </div>
        <span className="audio-voice-badge">AI Native Speaker</span>
      </div>

      <audio
        ref={audioRef}
        src={audioDataUri}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => setPlaybackError(true)}
        preload="auto"
      />

      <div className="audio-player-controls">
        {/* Play/Pause Main Button */}
        <button
          id="play-correction-audio-btn"
          type="button"
          className={`btn-audio-play ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause Audio' : 'Play Correction Audio'}
          title={isPlaying ? 'Pause' : 'Play Correction'}
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

        {/* Progress scrub bar */}
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
      </div>

      {playbackError && (
        <p className="audio-error-text">
          <AlertCircle size={14} /> Failed to play audio. Please click replay.
        </p>
      )}
    </div>
  );
}
