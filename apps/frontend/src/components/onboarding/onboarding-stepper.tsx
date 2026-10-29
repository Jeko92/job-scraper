'use client';

import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { Step } from './onboarding-state';

interface Phase {
  title: string;
  steps: Step[];
}

// The 9 questions grouped into 4 phases, so the stepper stays readable.
const PHASES: Phase[] = [
  { title: 'Basics', steps: ['essentials'] },
  {
    title: 'Preferences',
    steps: ['seniority', 'employment', 'workSetup', 'relocate'],
  },
  { title: 'Experience', steps: ['experienceYears', 'skills', 'industries'] },
  { title: 'Review', steps: ['review'] },
];

type PhaseState = 'done' | 'current' | 'upcoming';

interface OnboardingStepperProps {
  step: Step;
  onJump: (step: Step) => void;
}

/**
 * A progress indicator, not tabs: an ordered list with the current phase
 * marked. Finished phases are buttons to jump back to.
 */
export function OnboardingStepper({ step, onJump }: OnboardingStepperProps) {
  const current = PHASES.findIndex((phase) => phase.steps.includes(step));

  return (
    <nav aria-label="Onboarding progress">
      <ol className="flex w-full items-center">
        {PHASES.map((phase, index) => {
          const state: PhaseState =
            index < current
              ? 'done'
              : index === current
                ? 'current'
                : 'upcoming';
          const content = (
            <PhaseLabel state={state} index={index} phase={phase} />
          );
          const target = phase.steps[0];

          return (
            <li
              key={phase.title}
              aria-current={state === 'current' ? 'step' : undefined}
              className="flex items-center justify-center not-last:flex-1"
            >
              {state === 'done' && target ? (
                <button
                  type="button"
                  className={cn(LABEL_CLASS, 'cursor-pointer')}
                  onClick={() => {
                    onJump(target);
                  }}
                >
                  {content}
                </button>
              ) : (
                <span className={LABEL_CLASS}>{content}</span>
              )}
              {index < PHASES.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'mx-2 h-0.5 flex-1 rounded-sm',
                    state === 'done' ? 'bg-primary' : 'bg-line',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const LABEL_CLASS =
  'inline-flex flex-col items-center gap-1.5 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex-row sm:gap-2.5';

interface PhaseLabelProps {
  state: PhaseState;
  index: number;
  phase: Phase;
}

function PhaseLabel({ state, index, phase }: PhaseLabelProps) {
  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full text-xs',
          state === 'upcoming'
            ? 'border border-line bg-surface text-ink-muted'
            : 'bg-primary text-primary-foreground',
        )}
      >
        {state === 'done' ? <Check className="size-3.5" /> : index + 1}
      </span>
      <span
        className={cn(
          'text-xs leading-none font-medium sm:text-sm',
          state === 'current' ? 'text-ink' : 'text-ink-muted',
        )}
      >
        {phase.title}
        {state === 'done' && <span className="sr-only">, done</span>}
      </span>
    </>
  );
}
