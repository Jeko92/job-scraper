import { JobCardSkeleton } from '@/components/jobs/job-card-skeleton';
import { cn } from '@/lib/utils';

const DEFAULT_LINES = 3;
export const MARKET_PULSE_LINES = 6;

const bar = 'rounded-pill bg-line';

interface LineSkeletonProps {
  className?: string;
}

export function LineSkeleton({ className }: LineSkeletonProps) {
  return (
    <div aria-hidden="true" className={cn(bar, 'animate-pulse', className)} />
  );
}

interface TileSkeletonProps {
  lines?: number;
  className?: string;
}

export function TileSkeleton({
  lines = DEFAULT_LINES,
  className,
}: TileSkeletonProps) {
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
