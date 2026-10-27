import Link from 'next/link';

import { statusActionClass, StatusCard } from '@/components/layout/status-card';
import { buttonVariants } from '@/components/ui/button';
import { SEARCH_HREF } from '@/lib/routes';
import { cn } from '@/lib/utils';

export default function JobNotFound() {
  return (
    <main className="flex-1 px-4 pb-12 sm:px-8">
      <StatusCard
        title="Job not found"
        message="It may have been removed or the link is wrong."
        action={
          <Link
            href={SEARCH_HREF}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              statusActionClass,
            )}
          >
            Back to search
          </Link>
        }
        className="mx-auto w-full max-w-3xl"
      />
    </main>
  );
}
