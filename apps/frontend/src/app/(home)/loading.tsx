import {
  JobsSliderSkeleton,
  MARKET_PULSE_LINES,
  TileSkeleton,
} from '@/components/home/home-skeletons';

export default function HomeLoading() {
  return (
    <main
      aria-busy="true"
      className="flex flex-1 flex-col gap-2 px-4 pb-8 sm:px-8"
    >
      <span className="sr-only">Loading your overview</span>
      <div className="flex flex-wrap gap-2">
        <TileSkeleton className="flex-[2_1_34rem]" />
        <TileSkeleton className="flex-[1_1_20rem]" />
      </div>
      <div
        aria-hidden="true"
        className="flex flex-col gap-5 rounded-tile border border-line bg-surface p-6 sm:p-8"
      >
        <JobsSliderSkeleton />
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        <TileSkeleton />
        <TileSkeleton />
      </div>
      <TileSkeleton lines={MARKET_PULSE_LINES} />
    </main>
  );
}
