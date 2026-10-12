import { cn } from '@/lib/utils';

import { SectionChip } from './section-chip';

const STEPS = [
  {
    title: 'Create your profile',
    tags: ['Industries', 'Skills', 'Questionnaire'],
    text: 'Tell JobScraper what you are good at and where you want to go.',
  },
  {
    title: 'AI hunts companies',
    tags: ['Discovery', 'Competitors', 'Research'],
    text: 'Agents find matching companies and read their career pages.',
  },
  {
    title: 'Runners match jobs',
    tags: ['Matching', 'Alerts', 'Cover letters'],
    text: 'Only suitable jobs reach you, ready to apply.',
  },
  {
    title: 'Advisors guide you',
    tags: ['Tracking', 'Trends', 'Skills'],
    text: 'See your progress and what to learn next.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6"
    >
      <div className="mb-12 flex flex-col items-start gap-5">
        <SectionChip>How it works</SectionChip>
        <h2 className="max-w-2xl text-4xl font-light tracking-tight text-ink sm:text-5xl">
          Four steps.
          <span className="text-ink/45"> Zero portal scrolling.</span>
        </h2>
      </div>

      <ol className="grid gap-6 md:grid-cols-4 md:gap-2">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex flex-col">
            <p className="mb-2 text-sm text-ink/60">Step {index + 1}</p>
            <div
              aria-hidden="true"
              className="h-14 rounded-2xl bg-linear-to-r from-brand to-brand-soft"
              style={{ opacity: 1 - index * 0.15 }}
            />
            <span
              aria-hidden="true"
              className="mx-auto hidden h-10 w-px bg-ink/30 md:block"
            />
            <div className="mt-4 flex flex-1 flex-col gap-4 rounded-3xl border border-black/5 bg-white/70 p-5 md:mt-0">
              <h3
                className={cn(
                  'self-start rounded-full px-4 py-2 text-sm',
                  index === 0
                    ? 'bg-brand-strong text-white'
                    : 'border border-black/5 bg-white text-ink shadow-sm',
                )}
              >
                {step.title}
              </h3>
              <p className="text-sm text-ink/60">{step.text}</p>
              <ul className="mt-auto flex flex-wrap gap-2">
                {step.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-black/10 px-3 py-1 text-xs text-ink/70"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
