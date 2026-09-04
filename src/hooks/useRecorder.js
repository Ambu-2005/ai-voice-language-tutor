import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Custom React hook for recording audio via MediaRecorder with audio-meter and track cleanup
 */
export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recorderError, setRecorderError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  // Helper to cleanup audio context and visualizer loop
  const cleanupAudioAnalyser = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Helper to release hardware mic tracks
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    cleanupAudioAnalyser();
  }, [cleanupAudioAnalyser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupStream();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [cleanupStream, audioUrl]);

  /**
   * Starts recording learner speech
   */
  const startRecording = useCallback(async () => {
    setRecorderError(null);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
    audioChunksRef.current = [];

    // 1. Verify Browser Support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err = new Error('Your browser does not support microphone audio recording.');
      err.code = 'BROWSER_UNSUPPORTED';
      setRecorderError(err);
      throw err;
    }

    if (typeof MediaRecorder === 'undefined') {
      const err = new Error('MediaRecorder API is not available in this browser environment.');
      err.code = 'BROWSER_UNSUPPORTED';
      setRecorderError(err);
      throw err;
    }

    try {
      // 2. Request mic permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // 3. Audio Level Visualizer setup (Web Audio API)
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;

          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateVolume = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            // Normalize to 0-100 percentage
            const level = Math.min(100, Math.round((average / 128) * 100));
            setAudioLevel(level);
            animationFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      } catch (audioCtxErr) {
        console.warn('AudioContext volume metering not available:', audioCtxErr);
      }

      // 4. Select best supported audio MIME type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = ''; // Let browser use default
        }
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(100); // collect slice every 100ms
      startTimeRef.current = Date.now();
      setIsRecording(true);

      // Start recording timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      cleanupStream();
      let appErr;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        appErr = new Error('Microphone access was denied. Please allow microphone permissions in your browser settings.');
        appErr.code = 'MIC_PERMISSION_DENIED';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        appErr = new Error('No microphone hardware detected on your device.');
        appErr.code = 'NO_AUDIO';
      } else {
        appErr = new Error(err.message || 'Failed to start microphone recording.');
        appErr.code = 'MIC_ERROR';
      }
      setRecorderError(appErr);
      throw appErr;
    }
  }, [cleanupStream, audioUrl]);

  /**
   * Stops recording and returns the Audio Blob
   * @returns {Promise<Blob>}
   */
  const stopRecording = useCallback(() => {
    return new Promise((resolve, reject) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        cleanupStream();
        setIsRecording(false);
        const err = new Error('No active recording found.');
        err.code = 'EMPTY_AUDIO';
        reject(err);
        return;
      }

      const durationMs = Date.now() - (startTimeRef.current || 0);

      recorder.onstop = () => {
        cleanupStream();
        setIsRecording(false);

        // Check if recording is too short (< 400ms)
        if (durationMs < 400 || audioChunksRef.current.length === 0) {
          const err = new Error('Recording was too short. Please hold the record button and speak a complete sentence.');
          err.code = 'EMPTY_AUDIO';
          setRecorderError(err);
          reject(err);
          return;
        }

        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });

        if (blob.size === 0) {
          const err = new Error('Recorded audio file is empty.');
          err.code = 'EMPTY_AUDIO';
          setRecorderError(err);
          reject(err);
          return;
        }

        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        resolve(blob);
      };

      try {
        recorder.stop();
      } catch (err) {
        cleanupStream();
        setIsRecording(false);
        reject(err);
      }
    });
  }, [cleanupStream]);

  /**
   * Resets recorder state
   */
  const resetRecording = useCallback(() => {
    cleanupStream();
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setAudioLevel(0);
    setRecorderError(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }, [cleanupStream, audioUrl]);

  return {
    isRecording,
    recordingTime,
    audioBlob,
    audioUrl,
    audioLevel,
    recorderError,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
