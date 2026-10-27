import { BookOpen, MessagesSquare, Sparkles } from 'lucide-react';

import { LogoMark } from '@/components/brand/logo';
import { overline } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { LandingSection } from './landing-section';

const PERKS = [
  {
    icon: Sparkles,
    title: 'Modern matching',
    text: 'Your profile is matched against every role we find, so you see what fits instead of scrolling through what does not.',
    className: '',
  },
  {
    icon: BookOpen,
    title: 'Guides for every step',
    text: 'Practical resources help you with applications, first conversations and salary negotiations.',
    className: '',
  },
  {
    icon: MessagesSquare,
    title: 'A community on the same path',
    text: 'Swap notes with people who also apply directly, from the first message to the signed contract.',
    className: 'lg:col-span-3',
  },
];

export function PerksSection() {
  return (
    <LandingSection
      id="perks"
      chip="Why JobScraper"
      title={
        <>
          Built for one thing.{' '}
          <span className="text-ink-muted">
            Getting you hired, the direct way.
          </span>
        </>
      }
    >
      <div className="grid gap-2 lg:grid-cols-3">
        <FocusCard />
        {PERKS.map(({ icon: Icon, title, text, className }) => (
          <div
            key={title}
            className={cn(
              'flex flex-col gap-4 rounded-card border border-line bg-bg p-6',
              className,
            )}
          >
            <span className="inline-flex size-10 items-center justify-center rounded-chip bg-highlight text-on-highlight">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="text-xl leading-7 font-medium text-ink">{title}</h3>
            <p className="text-ink-muted">{text}</p>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}

/** Large signature-blue card for the single-focus pitch. */
function FocusCard() {
  return (
    <div className="relative flex min-h-64 flex-col justify-between gap-8 overflow-hidden rounded-card bg-linear-to-br from-highlight to-highlight/70 p-6 text-on-highlight lg:col-span-2 lg:row-span-2 lg:p-8">
      <p className={overline}>Single focus</p>
      {/* Raised medallion: the one neumorphic accent on the page. */}
      <span
        aria-hidden="true"
        className="absolute top-6 right-6 inline-flex size-28 items-center justify-center rounded-full bg-highlight shadow-[10px_10px_24px_rgb(11_15_87/0.25),-10px_-10px_24px_rgb(255_255_255/0.3)] lg:size-36"
      >
        <LogoMark tone="on-highlight" className="size-16 lg:size-20" />
      </span>
      <div className="flex max-w-md flex-col gap-3">
        <h3 className="font-heading text-[2rem] leading-10 font-normal">
          Career pages, nothing else.
        </h3>
        <p>
          JobScraper only finds roles at companies directly, and every part of
          it is built for that.
        </p>
      </div>
    </div>
  );
}
