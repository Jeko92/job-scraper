import { Card } from '@/components/ui/card';

const SKELETON_SKILLS = 4;
const SKELETON_LINES = 3;

const bar = 'animate-pulse rounded-pill bg-line';

/** Same layout as the job detail page, so nothing jumps when the job arrives. */
export default function JobDetailLoading() {
  return (
    <main aria-busy="true" className="flex-1 px-4 pb-12 sm:px-8">
      <p role="status" className="sr-only">
        Loading job
      </p>
      <div
        aria-hidden="true"
        className="mx-auto flex w-full max-w-3xl flex-col gap-4"
      >
        <div className={`${bar} h-9 w-36`} />

        <div className="flex flex-col gap-6 rounded-tile border border-line bg-surface p-6 sm:p-8">
          <div className="flex flex-col gap-3">
            <div className={`${bar} h-10 w-3/4`} />
            <div className={`${bar} h-5 w-1/2`} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className={`${bar} h-4 w-28`} />
            <div className={`${bar} h-10 w-48`} />
          </div>
        </div>

        <Card className="gap-6 rounded-card p-6 ring-line">
          <div className={`${bar} h-6 w-24`} />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: SKELETON_SKILLS }, (_, index) => (
              <div key={index} className={`${bar} h-8 w-20`} />
            ))}
          </div>
          <div className={`${bar} h-6 w-36`} />
          {Array.from({ length: SKELETON_LINES }, (_, index) => (
            <div key={index} className={`${bar} h-4 w-full`} />
          ))}
        </Card>
      </div>
    </main>
  );
}
