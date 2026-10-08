import './globals.css';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const description =
  'AI-assisted job sourcing for Job Seekers. JobScraper searches company career sites directly and brings suitable jobs to you.';

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

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
