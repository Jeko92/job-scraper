import { CtaLinks } from './cta-links';
import { LogoMark } from './logo';

export function CtaSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="relative flex flex-col items-center gap-8 overflow-hidden rounded-card bg-linear-to-br from-brand via-brand to-brand-soft px-6 py-16 text-center text-white sm:py-20">
        <LogoMark className="absolute -bottom-16 -left-16 size-72 text-white/10" />
        <span className="relative flex size-20 items-center justify-center rounded-3xl bg-white/20 shadow-lg backdrop-blur">
          <LogoMark className="size-11 text-white" />
        </span>
        <h2 className="relative max-w-2xl text-4xl leading-tight font-light tracking-tight sm:text-5xl">
          Stop scrolling portals. Start finding companies.
        </h2>
        <p className="relative max-w-lg text-lg text-white/85">
          Create your profile in minutes and let JobScraper bring suitable jobs
          to you.
        </p>
        <CtaLinks tone="inverted" className="relative justify-center" />
      </div>
    </section>
  );
}
