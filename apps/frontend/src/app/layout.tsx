import './globals.css';

import type { Metadata } from 'next';
import { DM_Sans, Fraunces } from 'next/font/google';
import { cookies } from 'next/headers';

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { isTheme, THEME_COOKIE } from '@/lib/theme';
import { cn } from '@/lib/utils';

const fraunces = Fraunces({
  variable: '--font-heading',
  subsets: ['latin'],
  fallback: ['ui-serif', 'Georgia', 'serif'],
});

const dmSans = DM_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  fallback: ['Noto Sans', 'ui-sans-serif', 'system-ui'],
});

export const metadata: Metadata = {
  title: {
    default: 'JobScraper: AI-assisted job sourcing',
    template: '%s · JobScraper',
  },
  description: 'JobScraper: AI-assisted job sourcing',
  openGraph: {
    title: 'JobScraper',
    description: 'JobScraper: AI-assisted job sourcing',
    type: 'website',
  },
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const theme = (await cookies()).get(THEME_COOKIE)?.value;

  return (
    <html
      lang="en"
      className={cn(
        fraunces.variable,
        dmSans.variable,
        'h-full antialiased',
        theme === 'dark' && 'dark',
      )}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {!isTheme(theme) && (
          <script
            dangerouslySetInnerHTML={{
              __html: `if(matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.classList.add('dark')`,
            }}
          />
        )}
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
