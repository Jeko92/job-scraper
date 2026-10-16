'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

import { APP_NAV_ITEMS } from './nav-items';

interface AppNavProps {
  className?: string;
}

export function AppNav({ className }: AppNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className={cn(
        'flex items-center gap-1 rounded-pill bg-primary p-1',
        className,
      )}
    >
      {APP_NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const active = href === pathname;
        return (
          <Link
            key={label}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-w-16 flex-col items-center gap-0.5 rounded-pill px-3 py-1.5 text-xs text-inverse-muted transition-colors hover:text-inverse',
              active && 'bg-inverse text-ink hover:text-ink',
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
