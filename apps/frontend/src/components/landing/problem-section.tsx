import { Ghost, Layers, Users } from 'lucide-react';

import { LandingSection } from './landing-section';

const PROBLEMS = [
  {
    icon: Layers,
    title: 'Overcrowded portals',
    text: 'A popular posting on a big portal draws a flood of applications within days. Yours lands somewhere in the pile.',
  },
  {
    icon: Ghost,
    title: 'Ghost postings',
    text: 'Some listings stay online long after the role is filled, or were never meant to be filled at all.',
  },
  {
    icon: Users,
    title: 'A saturated market',
    text: 'More people chase the same open roles. Searching where everyone else searches makes it harder to stand out.',
  },
];

export function ProblemSection() {
  return (
    <LandingSection
      id="problem"
      chip="The problem"
      title={
        <>
          Job portals are crowded.{' '}
          <span className="text-ink-muted">
            Good applications get lost in the noise.
          </span>
        </>
      }
    >
      <ul className="grid gap-2 md:grid-cols-3">
        {PROBLEMS.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex flex-col gap-4 rounded-card border border-line bg-bg p-6"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-chip bg-highlight text-on-highlight">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="text-xl leading-7 font-medium text-ink">{title}</h3>
            <p className="text-ink-muted">{text}</p>
          </li>
        ))}
      </ul>
    </LandingSection>
  );
}
