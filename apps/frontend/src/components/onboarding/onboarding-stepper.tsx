'use client';

import { Check } from 'lucide-react';

import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper';

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

interface OnboardingStepperProps {
  step: Step;
  onJump: (step: Step) => void;
}

export function OnboardingStepper({ step, onJump }: OnboardingStepperProps) {
  // The Stepper counts from 1.
  const current = PHASES.findIndex((phase) => phase.steps.includes(step)) + 1;

  return (
    <Stepper
      value={current}
      onValueChange={(value) => {
        const target = PHASES[value - 1]?.steps[0];
        // Only finished phases can be revisited.
        if (target && value < current) {
          onJump(target);
        }
      }}
      indicators={{ completed: <Check className="size-3.5" /> }}
    >
      <StepperNav>
        {PHASES.map((phase, index) => {
          const value = index + 1;
          return (
            <StepperItem
              key={phase.title}
              step={value}
              disabled={value > current}
            >
              <StepperTrigger className="flex-col gap-1.5 sm:flex-row sm:gap-2.5">
                <StepperIndicator className="data-[state=inactive]:border data-[state=inactive]:border-line data-[state=inactive]:bg-surface data-[state=inactive]:text-ink-muted">
                  {value}
                </StepperIndicator>
                <StepperTitle className="text-xs text-ink-muted group-data-[state=active]/step:text-ink sm:text-sm">
                  {phase.title}
                </StepperTitle>
              </StepperTrigger>
              {value < PHASES.length && (
                <StepperSeparator className="mx-2 bg-line group-data-[state=completed]/step:bg-primary" />
              )}
            </StepperItem>
          );
        })}
      </StepperNav>
    </Stepper>
  );
}
