import { JobCardSkeleton } from '@/components/jobs/job-card-skeleton';

const SKELETON_CARDS = 3;

export default function SearchLoading() {
  return (
    <main aria-busy="true" className="flex-1 px-4 pb-12 sm:px-8">
      <div className="flex flex-col gap-4">
        <div className="h-10 w-48 animate-pulse rounded-pill bg-line" />
        {Array.from({ length: SKELETON_CARDS }, (_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}
