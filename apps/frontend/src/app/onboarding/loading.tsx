import { OnboardingCard } from '@/components/onboarding/onboarding-card';

const bar = 'animate-pulse rounded-pill bg-line';

export default function OnboardingLoading() {
  return (
    <main
      aria-busy="true"
      className="flex flex-1 items-center justify-center p-6"
    >
      <span className="sr-only">Loading your profile</span>
      <OnboardingCard className="space-y-8">
        <div aria-hidden="true" className="space-y-8">
          <div className={`${bar} h-7 w-32`} />
          <div className="space-y-3">
            <div className={`${bar} h-10 w-56`} />
            <div className={`${bar} h-5 w-72`} />
          </div>
          <div className={`${bar} h-4 w-80`} />
          <div className={`${bar} h-9 w-32`} />
        </div>
      </OnboardingCard>
    </main>
  );
}
