import { JobCardSkeleton } from '@/components/jobs/job-card-skeleton';
import { cn } from '@/lib/utils';

import {
  cardsRow,
  homeMain,
  summaryTile,
  welcomeRow,
  welcomeTile,
} from './home-layout';

const DEFAULT_LINES = 3;
const MARKET_PULSE_LINES = 6;

const bar = 'rounded-pill bg-line';

interface TileSkeletonProps {
  lines?: number;
  className?: string;
}

function TileSkeleton({ lines = DEFAULT_LINES, className }: TileSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex animate-pulse flex-col gap-4 rounded-tile border border-line bg-surface p-8',
        className,
      )}
    >
      <div className={cn(bar, 'h-7 w-1/3')} />
      {Array.from({ length: lines }, (_, index) => (
        <div key={index} className={cn(bar, 'h-4 w-3/4')} />
      ))}
    </div>
  );
}

export function WelcomeRowSkeleton() {
  return (
    <div className={welcomeRow}>
      <TileSkeleton className={cn(welcomeTile, 'min-h-76')} />
      <TileSkeleton className={cn(summaryTile, 'min-h-76')} />
    </div>
  );
}

export function JobsSliderSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <JobCardSkeleton />
      <div className="hidden sm:block">
        <JobCardSkeleton />
      </div>
      <div className="hidden lg:block">
        <JobCardSkeleton />
      </div>
    </div>
  );
}

export function CardsRowSkeleton() {
  return (
    <div className={cardsRow}>
      <TileSkeleton className="min-h-100" />
      <TileSkeleton className="min-h-100" />
    </div>
  );
}

export function MarketPulseSkeleton() {
  return <TileSkeleton lines={MARKET_PULSE_LINES} className="min-h-80" />;
}

export function HomeOverviewSkeleton() {
  return (
    <main aria-busy="true" className={homeMain}>
      <span className="sr-only">Loading your overview</span>
      <WelcomeRowSkeleton />
      <div
        aria-hidden="true"
        className="rounded-tile border border-line bg-surface p-6 sm:p-8"
      >
        <JobsSliderSkeleton />
      </div>
      <CardsRowSkeleton />
      <MarketPulseSkeleton />
    </main>
  );
}
