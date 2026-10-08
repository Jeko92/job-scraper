import './globals.css';

import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { cookies } from 'next/headers';

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { isTheme, THEME_COOKIE } from '@/lib/theme';
import { cn } from '@/lib/utils';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'JobScraper: AI-assisted job sourcing',
    template: '%s · JobScraper',
  },
  description,
  openGraph: {
    title: 'JobScraper',
    description,
    type: 'website',
  },
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const theme = (await cookies()).get(THEME_COOKIE)?.value;

  return (
    <html
      lang="en"
      className={cn(
        geistSans.variable,
        'h-full antialiased',
        theme === 'dark' && 'dark',
      )}
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
      <body className="flex min-h-full flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
