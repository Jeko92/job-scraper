import { JobCardSkeleton } from '@/components/jobs/job-card-skeleton';

const SKELETON_CARDS = 3;
const SKELETON_FILTER_ROWS = 4;

const bar = 'animate-pulse rounded-pill bg-line';

/** Same layout as the search page, so nothing jumps when the jobs arrive. */
export default function SearchLoading() {
  return (
    <main aria-busy="true" className="flex-1 px-4 pb-12 sm:px-8">
      <span className="sr-only">Loading jobs</span>
      <div
        aria-hidden="true"
        className="grid items-start gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]"
      >
        <div className="flex flex-col gap-6 rounded-tile border border-line bg-surface p-6">
          <div className={`${bar} h-8 w-28`} />
          <div className="hidden flex-col gap-4 lg:flex">
            {Array.from({ length: SKELETON_FILTER_ROWS }, (_, index) => (
              <div key={index} className={`${bar} h-5 w-3/4`} />
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-tile border border-line bg-surface p-6 sm:p-8">
            <div className={`${bar} h-10 w-48`} />
          </div>
          {Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <JobCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
