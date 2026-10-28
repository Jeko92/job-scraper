import { JobCardSkeleton } from '@/components/jobs/job-card-skeleton';

const SKELETON_CARDS = 3;

const bar = 'animate-pulse rounded-pill bg-line';

/** Same layout as the saved page, so nothing jumps when the jobs arrive. */
export default function SavedLoading() {
  return (
    <main aria-busy="true" className="flex-1 px-4 pb-12 sm:px-8">
      <span className="sr-only">Loading saved jobs</span>
      <div
        aria-hidden="true"
        className="mx-auto flex w-full max-w-4xl flex-col gap-4"
      >
        <div className="flex flex-col gap-2 rounded-tile border border-line bg-surface p-6 sm:p-8">
          <div className={`${bar} h-10 w-48`} />
          <div className={`${bar} h-5 w-20`} />
        </div>
        {Array.from({ length: SKELETON_CARDS }, (_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}
