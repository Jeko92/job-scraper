import { StepShell } from './common/step-shell';

interface WelcomeStepProps {
  firstName: string | null;
  onStart: () => void;
}

export function WelcomeStep({ firstName, onStart }: WelcomeStepProps) {
  return (
    <StepShell
      tag="Onboarding"
      title={`Hi ${firstName ?? 'there'} 👋`}
      subtitle="Let's tailor your job matches."
      nextLabel="Let's start"
      onNext={onStart}
    >
      <p className="text-sm text-ink-muted">
        Only 2 questions are required · the rest is optional · ~1 min
      </p>
    </StepShell>
  );
}
