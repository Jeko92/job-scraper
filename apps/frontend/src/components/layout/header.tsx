import type { AuthUser } from '@job-scraper/shared';
import { Menu } from 'lucide-react';
import Link from 'next/link';

import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button, buttonVariants } from '@/components/ui/button';
import { logout } from '@/lib/auth/actions';
import { getSession } from '@/lib/auth/session';
import { getThemeCookieMaxAge } from '@/lib/env';
import { HOME_HREF, LOGIN_HREF, REGISTER_HREF } from '@/lib/routes';
import { cn } from '@/lib/utils';

import { AppNav } from './app-nav';
import { MenuDetails } from './menu-details';
import { PUBLIC_NAV_ITEMS } from './nav-items';

const INITIALS_LENGTH = 2;

const pillButton = 'h-9 rounded-pill px-4 font-semibold';

const roundIcon =
  'flex size-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-surface';

export async function Header() {
  const user = await getSession();
  const themeToggle = <ThemeToggle cookieMaxAge={getThemeCookieMaxAge()} />;

  return (
    <header className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-8">
        <Link
          href={HOME_HREF}
          aria-label="JobScraper home"
          className="text-ink"
        >
          <Logo />
        </Link>
        {user ? (
          <SignedInActions user={user} themeToggle={themeToggle} />
        ) : (
          <PublicActions themeToggle={themeToggle} />
        )}
      </div>
    </header>
  );
}

interface ActionsProps {
  themeToggle: React.ReactNode;
}

function PublicActions({ themeToggle }: ActionsProps) {
  return (
    <>
      <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
        {PUBLIC_NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="hidden items-center gap-2 md:flex">
        {themeToggle}
        <Link
          href={LOGIN_HREF}
          className={cn(buttonVariants({ variant: 'outline' }), pillButton)}
        >
          Log in
        </Link>
        <Link href={REGISTER_HREF} className={cn(buttonVariants(), pillButton)}>
          Sign up free
        </Link>
      </div>

      <MenuDetails className="relative md:hidden">
        <summary
          aria-label="Open menu"
          className={cn(
            roundIcon,
            'cursor-pointer list-none [&::-webkit-details-marker]:hidden',
          )}
        >
          <Menu className="size-5" aria-hidden="true" />
        </summary>
        <div className="absolute top-14 right-0 z-40 flex w-60 flex-col gap-1 rounded-card border border-line bg-surface p-3 shadow-xl">
          {PUBLIC_NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-chip px-3 py-2 text-sm text-ink hover:bg-bg"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 grid gap-2 border-t border-line pt-3">
            <Link
              href={LOGIN_HREF}
              className={cn(buttonVariants({ variant: 'outline' }), pillButton)}
            >
              Log in
            </Link>
            <Link
              href={REGISTER_HREF}
              className={cn(buttonVariants(), pillButton)}
            >
              Sign up free
            </Link>
            <div className="flex justify-center">{themeToggle}</div>
          </div>
        </div>
      </MenuDetails>
    </>
  );
}

interface SignedInActionsProps extends ActionsProps {
  user: AuthUser;
}

function SignedInActions({ user, themeToggle }: SignedInActionsProps) {
  return (
    <>
      <AppNav className="order-last mx-auto md:order-none md:mx-0" />

      <div className="flex items-center gap-2">
        {themeToggle}
        <details className="relative">
          <summary
            aria-label="Account menu"
            className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full bg-highlight text-sm font-semibold text-on-highlight [&::-webkit-details-marker]:hidden"
          >
            {user.username.slice(0, INITIALS_LENGTH).toUpperCase()}
          </summary>
          <div className="absolute top-14 right-0 z-40 flex w-48 flex-col gap-1 rounded-card border border-line bg-surface p-2 shadow-xl">
            <p className="truncate px-3 py-2 text-sm text-ink-muted">
              {user.username}
            </p>
            <form action={logout}>
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start rounded-chip px-3"
              >
                Log out
              </Button>
            </form>
          </div>
        </details>
      </div>
    </>
  );
}
