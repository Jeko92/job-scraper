import { Menu } from 'lucide-react';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { LOGIN_HREF, SIGNUP_HREF } from './cta-links';
import { Logo } from './logo';

export const NAV_ITEMS = [
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'why', label: 'Why JobScraper' },
] as const;

const navPill =
  'rounded-full px-4 py-2 text-sm text-ink/70 transition-colors hover:bg-white hover:text-ink';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-surface-warm/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="JobScraper home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={navPill}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href={LOGIN_HREF}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'h-9 rounded-full px-4',
            )}
          >
            Log in
          </Link>
          <Link
            href={SIGNUP_HREF}
            className={cn(buttonVariants(), 'h-9 rounded-full px-4')}
          >
            Get started
          </Link>
        </div>

        {/* Mobile menu: native <details> so the page ships no client JS. */}
        <details className="group relative md:hidden">
          <summary
            aria-label="Open menu"
            className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-black/5 bg-white shadow-sm [&::-webkit-details-marker]:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </summary>
          <div className="absolute top-12 right-0 flex w-60 flex-col gap-1 rounded-3xl border border-black/5 bg-white p-3 shadow-xl">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="rounded-2xl px-4 py-3 text-sm text-ink hover:bg-surface-warm"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 grid gap-2 border-t border-black/5 pt-3">
              <Link
                href={LOGIN_HREF}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-10 rounded-full',
                )}
              >
                Log in
              </Link>
              <Link
                href={SIGNUP_HREF}
                className={cn(buttonVariants(), 'h-10 rounded-full')}
              >
                Get started
              </Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
