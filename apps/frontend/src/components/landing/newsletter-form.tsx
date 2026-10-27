'use client';

import { type SubmitEvent, useState } from 'react';

import { field } from '@/lib/styles';
import { cn } from '@/lib/utils';

/** UI only: nothing is sent or stored until the backend has an endpoint. */
export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="flex flex-col gap-4">
      {!submitted && (
        <form
          onSubmit={handleSubmit}
          className="grid gap-3 sm:grid-cols-[1fr_auto]"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={cn(
              field,
              'h-16 w-full text-lg outline-none placeholder:text-ink-muted focus-visible:ring-3 focus-visible:ring-focus/50',
            )}
          />
          <button
            type="submit"
            className="inline-flex h-16 items-center justify-center rounded-pill bg-primary px-8 text-lg font-semibold text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-focus/50"
          >
            Sign me up
          </button>
        </form>
      )}
      <p role="status" className="text-lg">
        {submitted &&
          'Thanks! The newsletter isn’t live yet, so we haven’t saved your address.'}
      </p>
    </div>
  );
}
