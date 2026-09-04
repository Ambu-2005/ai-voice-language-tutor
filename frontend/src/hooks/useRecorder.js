import { useState, useRef, useEffect, useCallback } from 'react';

// BCP-47 speech recognition language code mapping for Indian Languages
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

function getSpeechLang(language) {
  if (!language) return 'en-US';
  const key = language.trim().toLowerCase();
  return BCP47_LANGUAGE_CODES[key] || 'en-US';
}

/**
 * Custom React hook for recording audio via MediaRecorder & Web Speech Recognition
 */
export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recorderError, setRecorderError] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');

  const mediaRecorderRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const recognizedTextRef = useRef('');
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

  // Helper to release hardware mic tracks and speech recognition
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      speechRecognitionRef.current = null;
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
   * Starts recording learner speech & activates client-side Web Speech Recognition
   */
  const startRecording = useCallback(async (language = 'English') => {
    setRecorderError(null);
    setAudioBlob(null);
    setRecognizedText('');
    recognizedTextRef.current = '';

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
            const level = Math.min(100, Math.round((average / 128) * 100));
            setAudioLevel(level);
            animationFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      } catch (audioCtxErr) {
        console.warn('AudioContext volume metering not available:', audioCtxErr);
      }

      // 4. Initialize MediaRecorder
      let mimeType = 'audio/webm;codecs=opus';
      if (typeof MediaRecorder !== 'undefined') {
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          if (MediaRecorder.isTypeSupported('audio/webm')) {
            mimeType = 'audio/webm';
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
            mimeType = 'audio/ogg';
          } else {
            mimeType = '';
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

        recorder.start(100);
      }

      // 5. Initialize Web Speech Recognition in parallel (Client-side free STT fallback)
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        try {
          const recognition = new SpeechRecognitionClass();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = getSpeechLang(language);

          recognition.onresult = (event) => {
            let fullTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
              fullTranscript += event.results[i][0].transcript + ' ';
            }
            const trimmed = fullTranscript.trim();
            recognizedTextRef.current = trimmed;
            setRecognizedText(trimmed);
          };

          recognition.onerror = (recErr) => {
            console.warn('[Web Speech Recognition non-fatal]:', recErr.error);
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (recInitErr) {
          console.warn('SpeechRecognition initialization notice:', recInitErr);
        }
      }

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
   * Stops recording and returns the Audio Blob and client-recognized speech text
   * @returns {Promise<{ blob: Blob, recognizedText: string }>}
   */
  const stopRecording = useCallback(() => {
    return new Promise((resolve, reject) => {
      const recorder = mediaRecorderRef.current;
      const durationMs = Date.now() - (startTimeRef.current || 0);

      // Stop speech recognition
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }

      if (!recorder || recorder.state === 'inactive') {
        cleanupStream();
        setIsRecording(false);
        const finalClientText = recognizedTextRef.current.trim();
        if (finalClientText) {
          resolve({ blob: null, recognizedText: finalClientText });
          return;
        }
        const err = new Error('No active recording found.');
        err.code = 'EMPTY_AUDIO';
        reject(err);
        return;
      }

      recorder.onstop = () => {
        cleanupStream();
        setIsRecording(false);

        const finalClientText = recognizedTextRef.current.trim();

        // Check if recording is too short (< 300ms) and no speech recognized
        if (durationMs < 300 && !finalClientText) {
          const err = new Error('Recording was too short. Please speak a complete sentence.');
          err.code = 'EMPTY_AUDIO';
          setRecorderError(err);
          reject(err);
          return;
        }

        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });

        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        resolve({
          blob: blob.size > 0 ? blob : null,
          recognizedText: finalClientText,
        });
      };

      try {
        recorder.stop();
      } catch (err) {
        cleanupStream();
        setIsRecording(false);
        const finalClientText = recognizedTextRef.current.trim();
        if (finalClientText) {
          resolve({ blob: null, recognizedText: finalClientText });
        } else {
          reject(err);
        }
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
    setRecognizedText('');
    recognizedTextRef.current = '';
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
    recognizedText,
    recorderError,
    startRecording,
    stopRecording,
    resetRecording,
  };
}

