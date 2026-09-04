import React, { useState, useEffect } from 'react';
import { Mic, BrainCircuit, Volume2, Sparkles } from 'lucide-react';

const STEPS = [
  { id: 1, text: 'Transcribing your voice...', icon: Mic, subtext: 'Converting speech audio into text with high accuracy' },
  { id: 2, text: 'Analyzing your sentence...', icon: BrainCircuit, subtext: 'Evaluating grammar, vocabulary, and sentence structure' },
  { id: 3, text: 'Preparing your correction & spoken audio...', icon: Volume2, subtext: 'Synthesizing native speaker pronunciation and feedback' },
];

export default function Loading() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStepIndex(1), 1600);
    const timer2 = setTimeout(() => setCurrentStepIndex(2), 3400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const activeStep = STEPS[currentStepIndex] || STEPS[0];
  const StepIcon = activeStep.icon;

  return (
    <div className="card loading-card" aria-live="polite" aria-busy="true">
      <div className="loading-orbit-container">
        <div className="loading-glow-backdrop" />
        <div className="loading-spinner-ring" />
        <div className="loading-center-icon">
          <StepIcon size={28} className="pulse-icon" />
        </div>
      </div>

      <div className="loading-info-group">
        <div className="loading-title-row">
          <Sparkles size={16} className="sparkle-spin" />
          <h3 className="loading-step-title">{activeStep.text}</h3>
        </div>
        <p className="loading-step-subtext">{activeStep.subtext}</p>
      </div>

      <div className="loading-progress-track">
        {STEPS.map((step, idx) => (
          <div
            key={step.id}
            className={`loading-progress-segment ${
              idx === currentStepIndex ? 'active' : idx < currentStepIndex ? 'completed' : ''
            }`}
          />
        ))}
      </div>
    </div>
  );
}
