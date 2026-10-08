import {
  Bell,
  Globe,
  type LucideIcon,
  Radar,
  TrendingUp,
  UserRound,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { SectionChip } from './section-chip';

interface FeatureCardProps {
  icon: LucideIcon;
  stage: string;
  title: string;
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
  visual?: React.ReactNode;
}

function FeatureCard({
  icon: Icon,
  stage,
  title,
  children,
  dark = false,
  className,
  visual,
}: FeatureCardProps) {
  return (
    <article
      className={cn(
        'flex flex-col gap-6 overflow-hidden rounded-card border p-7 sm:p-8',
        dark
          ? 'border-transparent bg-ink text-white'
          : 'border-black/5 bg-white/70 text-ink',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-brand to-brand-soft text-white">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs',
            dark ? 'bg-white/10 text-white/70' : 'bg-surface-warm text-ink/60',
          )}
        >
          {stage}
        </span>
      </div>
      <div className="grid gap-2">
        <h3 className="text-2xl font-light tracking-tight">{title}</h3>
        <p className={dark ? 'text-white/65' : 'text-ink/60'}>{children}</p>
      </div>
      {visual}
    </article>
  );
}

// Fictional sample data for the card visuals.
const SAMPLE_COMPANIES = [
  { name: 'Nordlicht Software', meta: '120 employees · Hamburg' },
  { name: 'Elbwerk Robotics', meta: 'Competitor · 85 employees' },
  { name: 'Kranich Health', meta: 'Competitor · 300 employees' },
];

const TREND_BARS = [38, 52, 44, 66, 58, 80, 92];

function CompaniesVisual() {
  return (
    <ul className="mt-auto grid gap-2">
      {SAMPLE_COMPANIES.map((company) => (
        <li
          key={company.name}
          className="flex items-center gap-3 rounded-2xl bg-surface-warm p-3"
        >
          <Globe className="size-4 text-brand" aria-hidden="true" />
          <span className="text-sm font-medium">{company.name}</span>
          <span className="ml-auto hidden text-xs text-ink/50 sm:inline">
            {company.meta}
          </span>
        </li>
      ))}
    </ul>
  );
}

function NotificationVisual() {
  return (
    <div className="mt-auto flex items-center gap-3 rounded-2xl bg-white p-3 text-ink">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
        <Bell className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 text-sm">
        <p className="font-medium">Cover letter ready</p>
        <p className="truncate text-ink/55">Junior Data Analyst · Berlin</p>
      </div>
      <span className="ml-auto text-xs text-ink/45">now</span>
    </div>
  );
}

function TrendVisual() {
  return (
    <div className="mt-auto flex h-28 items-end gap-2 rounded-2xl bg-surface-warm p-4">
      {TREND_BARS.map((height, index) => (
        <span
          // The bars never reorder, so the index is a stable key.
          key={index}
          style={{ height: `${String(height)}%` }}
          className="flex-1 rounded-lg bg-linear-to-t from-brand-soft to-brand"
        />
      ))}
    </div>
  );
}

export function FeaturesBento() {
  return (
    <section
      id="features"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6"
    >
      <div className="mb-10 flex flex-col items-start gap-5">
        <SectionChip>Features</SectionChip>
        <h2 className="max-w-2xl text-4xl font-light tracking-tight text-ink sm:text-5xl">
          From profile to offer,
          <span className="text-ink/45"> with AI doing the legwork.</span>
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <FeatureCard icon={UserRound} stage="Stage 1" title="Your profile">
          Pick your industries and skills once. Changing direction? A short
          questionnaire shows you where you fit.
        </FeatureCard>

        <FeatureCard
          icon={Radar}
          stage="Stage 2"
          title="Hunt & gather"
          className="lg:col-span-2"
          visual={<CompaniesVisual />}
        >
          AI finds companies that match your interests, expands to their
          competitors and turns each career site into structured, timestamped
          data that every job seeker on the platform benefits from.
        </FeatureCard>

        <FeatureCard
          icon={Bell}
          stage="Stage 3"
          title="Runners"
          dark
          className="lg:col-span-2"
          visual={<NotificationVisual />}
        >
          Runners match new openings in the background and notify you. You get a
          suggested cover letter, the application link and company insights like
          headcount and competitors. You stay in the loop for every step.
        </FeatureCard>

        <FeatureCard
          icon={TrendingUp}
          stage="Stage 4"
          title="Advisors"
          visual={<TrendVisual />}
        >
          Track found and applied jobs, get feedback on your progress, spot job
          trends and see which skills to learn next.
        </FeatureCard>
      </div>
    </section>
  );
}
