import Link from 'next/link';

import { Logo } from '@/components/brand/logo';
import { getSession } from '@/lib/auth/session';

import { APP_NAV_ITEMS, PUBLIC_NAV_ITEMS } from './nav-items';

export async function Footer() {
  const user = await getSession();
  const navItems = user ? APP_NAV_ITEMS : PUBLIC_NAV_ITEMS;

  return (
    <footer className="px-4 pb-8 sm:px-8">
      <div className="flex flex-col gap-8 rounded-tile border border-line bg-surface p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-3">
            <Logo className="text-ink" />
            <p className="text-sm text-ink-muted">
              Every open role, <span className="text-ink">found for you.</span>
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-ink-muted transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex flex-col gap-2 border-t border-line pt-6 text-sm text-ink-muted sm:flex-row sm:justify-between">
          <p>Built by a neuefische bootcamp team</p>
          <p>© {new Date().getFullYear()} JobScraper</p>
        </div>
      </div>
    </footer>
  );
}
