import React from 'react';
import { Check } from 'lucide-react';

/**
 * StepProgress — reusable 3-step onboarding stepper
 * @param {number} currentStep - 1, 2, or 3
 * @param {string[]} labels - optional custom labels for each step
 */
const defaultLabels = ['Create Group', 'Invite Members', 'Add Accounts'];

export default function StepProgress({ currentStep = 1, labels = defaultLabels }) {
  const getState = (n) => {
    if (n < currentStep) return 'done';
    if (n === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="step-progress" role="progressbar" aria-valuenow={currentStep} aria-valuemax={3}>
      {[1, 2, 3].map((n, i) => {
        const state = getState(n);
        return (
          <React.Fragment key={n}>
            <div className="step-node">
              <div className={`step-circle ${state}`}>
                {state === 'done' ? <Check size={14} strokeWidth={3} /> : n}
              </div>
              <span className={`step-label ${state}`}>{labels[i]}</span>
            </div>
            {i < 2 && (
              <div className={`step-connector ${state === 'done' ? 'filled' : state === 'active' ? 'partial' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
