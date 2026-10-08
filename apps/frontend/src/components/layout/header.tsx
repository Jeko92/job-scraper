import Link from 'next/link';

import { ThemeToggle } from '@/components/theme-toggle';
import { buttonVariants } from '@/components/ui/button';
import { getThemeCookieMaxAge } from '@/lib/env';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-foreground">
          JobScraper
        </Link>
        <nav className="flex items-center gap-3">
          <ThemeToggle cookieMaxAge={getThemeCookieMaxAge()} />
          <Link href="/login" className={buttonVariants({ size: 'sm' })}>
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
