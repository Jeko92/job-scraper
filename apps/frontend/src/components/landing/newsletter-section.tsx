import { overline } from '@/lib/styles';

import { NewsletterForm } from './newsletter-form';

/** Deliberately oversized sign-up that closes the page. */
export function NewsletterSection() {
  return (
    <section
      id="newsletter"
      aria-labelledby="newsletter-heading"
      className="px-4 sm:px-8"
    >
      <div className="flex flex-col gap-10 rounded-tile bg-linear-to-br from-highlight to-highlight/70 p-8 text-on-highlight sm:p-12 lg:p-16">
        <p className={overline}>Newsletter</p>
        <h2
          id="newsletter-heading"
          className="max-w-5xl font-heading text-[3.5rem] leading-none font-normal sm:text-[5rem] lg:text-[7rem]"
        >
          Don&apos;t miss the next role.
        </h2>
        <p className="max-w-2xl text-lg">
          New roles from career pages, tips for applying directly and launch
          news. Unsubscribe any time.
        </p>
        <div className="max-w-3xl">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
