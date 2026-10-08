import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const SIGNUP_HREF = '/signup';
export const LOGIN_HREF = '/login';

const pill = 'h-11 rounded-full px-5 text-[0.95rem] font-medium';

interface CtaLinksProps {
  /** `inverted` is for use on the orange gradient background. */
  tone?: 'default' | 'inverted';
  className?: string;
}

export function CtaLinks({ tone = 'default', className }: CtaLinksProps) {
  const inverted = tone === 'inverted';

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <Link
        href={SIGNUP_HREF}
        className={cn(
          buttonVariants(),
          pill,
          'shadow-lg shadow-brand/25',
          inverted && 'bg-white text-ink shadow-black/10 hover:bg-white/90',
        )}
      >
        Get started free
        <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
      </Link>
      <Link
        href={LOGIN_HREF}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          pill,
          'bg-white/70',
          inverted &&
            'border-white/60 bg-transparent text-white hover:bg-white/15 hover:text-white',
        )}
      >
        Log in
      </Link>
    </div>
  );
}
