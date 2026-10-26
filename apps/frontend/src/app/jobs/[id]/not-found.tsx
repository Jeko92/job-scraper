import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SEARCH_HREF } from '@/lib/routes';
import { cn } from '@/lib/utils';

export default function JobNotFound() {
  return (
    <main className="flex-1 px-4 pb-12 sm:px-8">
      <Card className="mx-auto w-full max-w-3xl items-center gap-3 rounded-card p-10 text-center ring-line">
        <h1 className="font-heading text-2xl text-ink">Job not found</h1>
        <p className="text-sm text-ink-muted">
          It may have been removed or the link is wrong.
        </p>
        <Link
          href={SEARCH_HREF}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'mt-2 h-11 rounded-pill px-5 font-semibold text-ink',
          )}
        >
          Back to search
        </Link>
      </Card>
    </main>
  );
}
