import { Card } from '@/components/ui/card';

const bar = 'rounded-pill bg-line';

export function JobCardSkeleton() {
  return (
    <Card
      aria-hidden="true"
      className="animate-pulse gap-6 rounded-card p-6 ring-line"
    >
      <div className="flex justify-between gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <div className={`${bar} h-6 w-2/3`} />
          <div className={`${bar} h-4 w-1/2`} />
        </div>
        <div className={`${bar} h-4 w-16`} />
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className={`${bar} h-4 w-1/3`} />
        <div className={`${bar} h-9 w-24`} />
      </div>
    </Card>
  );
}
