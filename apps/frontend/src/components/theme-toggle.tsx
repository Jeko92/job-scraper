'use client';

import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { type Theme, THEME_COOKIE } from '@/lib/theme';

interface ThemeToggleProps {
  cookieMaxAge: number | undefined;
}

export function ThemeToggle({ cookieMaxAge }: ThemeToggleProps) {
  function toggleTheme() {
    const root = document.documentElement;
    const next: Theme = root.classList.contains('dark') ? 'light' : 'dark';
    root.classList.toggle('dark', next === 'dark');

    const maxAge =
      cookieMaxAge === undefined ? '' : `; max-age=${String(cookieMaxAge)}`;
    document.cookie = `${THEME_COOKIE}=${next}; path=/${maxAge}; SameSite=Lax`;
  }

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      aria-label="Toggle theme"
      onClick={toggleTheme}
    >
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  );
}
