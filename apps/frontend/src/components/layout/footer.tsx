import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-4 inline-block text-xl font-bold text-foreground"
        >
          JobScraper
        </Link>
        <p className="text-sm text-muted-foreground">
          AI-assisted job sourcing for Job Seekers.
        </p>
        <p className="mt-6 text-xs text-muted-foreground/50">
          &copy; {currentYear} JobScraper
        </p>
      </div>
    </footer>
  );
}
