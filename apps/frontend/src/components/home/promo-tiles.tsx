import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { PLACEHOLDER_HREF } from '@/lib/routes';
import { cn } from '@/lib/utils';

const pill = 'h-11 rounded-pill px-5 font-semibold';

const title =
  'font-heading text-[1.875rem] leading-9 font-normal tracking-tight';

export function PromoTiles() {
  return (
    <div className="grid gap-2 lg:grid-cols-2">
      <section
        aria-labelledby="weekly-digest"
        className="flex flex-wrap items-center justify-between gap-5 rounded-tile bg-surface-alt p-8 text-on-alt"
      >
        <div className="flex flex-[1_1_18rem] flex-col gap-2">
          <span className="self-start rounded-pill bg-on-alt px-2.5 text-xs leading-5 font-semibold text-surface-alt">
            New
          </span>
          <h2 id="weekly-digest" className={title}>
            Your matches, every Monday
          </h2>
          <p className="text-[15px] leading-[22px] text-on-alt-muted">
            A short weekly email with the new roles that fit you best.
          </p>
        </div>
        <Link
          href={PLACEHOLDER_HREF}
          className={cn(
            buttonVariants(),
            pill,
            'bg-surface text-ink hover:bg-surface/90',
          )}
        >
          Turn on weekly digest
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Link>
      </section>

      <section
        aria-labelledby="missing-company"
        className="flex flex-wrap items-center justify-between gap-5 rounded-tile border border-line bg-surface p-8 text-ink"
      >
        <div className="flex flex-[1_1_18rem] flex-col gap-2">
          <h2 id="missing-company" className={title}>
            Missing a company?
          </h2>
          <p className="text-[15px] leading-[22px] text-ink-muted">
            Send us a career page and we start reading it. Or invite a friend
            who is job hunting too.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={PLACEHOLDER_HREF} className={cn(buttonVariants(), pill)}>
            Suggest a company
          </Link>
          <Link
            href={PLACEHOLDER_HREF}
            className={cn(buttonVariants({ variant: 'outline' }), pill)}
          >
            Invite a friend
          </Link>
        </div>
      </section>
    </div>
  );
}
