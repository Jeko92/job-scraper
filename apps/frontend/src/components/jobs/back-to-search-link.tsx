'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';

import { buttonVariants } from '@/components/ui/button';
import { SEARCH_HREF } from '@/lib/routes';
import { cn } from '@/lib/utils';

/** True when the previous history entry is this app's search page. */
function cameFromSearch(): boolean {
  // Older browsers have no Navigation API; they get the plain link.
  if (!('navigation' in window)) {
    return false;
  }
  const index = window.navigation.currentEntry?.index ?? 0;
  const previous = window.navigation.entries()[index - 1]?.url;
  if (!previous) {
    return false;
  }
  const url = new URL(previous);
  return url.origin === window.location.origin && url.pathname === SEARCH_HREF;
}

/** Goes back like the browser's Back button, so filters, page and scroll stay. */
export function BackToSearchLink() {
  const router = useRouter();

  function goBack(event: MouseEvent<HTMLAnchorElement>) {
    if (cameFromSearch()) {
      event.preventDefault();
      router.back();
    }
  }

  return (
    <Link
      href={SEARCH_HREF}
      onClick={goBack}
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        'w-fit rounded-pill text-ink-muted',
      )}
    >
      <ArrowLeft data-icon="inline-start" aria-hidden="true" />
      Back to search
    </Link>
  );
}
