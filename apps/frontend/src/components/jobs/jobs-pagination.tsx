'use client';

import type { JobsQuery } from '@job-scraper/shared';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@/components/ui/pagination';
import { getPageWindow, jobsPageHref } from '@/lib/jobs/search-params';

interface JobsPaginationProps {
  query: JobsQuery;
  page: number;
  totalPages: number;
}

/** Previous, numbered pages and Next as links; compact on phones. */
export function JobsPagination({
  query,
  page,
  totalPages,
}: JobsPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent className="gap-1">
        <PaginationItem>
          <StepLink
            direction="previous"
            href={page > 1 ? jobsPageHref(query, page - 1) : null}
          />
        </PaginationItem>

        {getPageWindow(page, totalPages).map((item, index) =>
          item === 'ellipsis' ? (
            // Two ellipses can appear, so the position keeps the key unique.
            <PaginationItem
              key={`ellipsis-${String(index)}`}
              className="hidden sm:block"
            >
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item} className="hidden sm:block">
              <PageLink
                href={jobsPageHref(query, item)}
                isActive={item === page}
                ariaLabel={`Page ${String(item)}`}
              >
                {item}
              </PageLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem className="px-2 text-sm text-ink-muted sm:hidden">
          Page {page} of {totalPages}
        </PaginationItem>

        <PaginationItem>
          <StepLink
            direction="next"
            href={page < totalPages ? jobsPageHref(query, page + 1) : null}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

interface PageLinkProps {
  href: string;
  isActive?: boolean;
  size?: 'icon' | 'default';
  ariaLabel: string;
  children: ReactNode;
}

/**
 * Same look as the shadcn `PaginationLink`, but rendered as Next's `Link`
 * so moving between pages stays a client-side navigation.
 */
function PageLink({
  href,
  isActive = false,
  size = 'icon',
  ariaLabel,
  children,
}: PageLinkProps) {
  return (
    <Button
      variant={isActive ? 'outline' : 'ghost'}
      size={size}
      nativeButton={false}
      className="text-ink"
      render={
        <Link
          href={href}
          aria-label={ariaLabel}
          aria-current={isActive ? 'page' : undefined}
        />
      }
    >
      {children}
    </Button>
  );
}

interface StepLinkProps {
  direction: 'previous' | 'next';
  /** null on the first or last page: the step is shown disabled. */
  href: string | null;
}

function StepLink({ direction, href }: StepLinkProps) {
  const isPrevious = direction === 'previous';
  const label = isPrevious ? 'Previous' : 'Next';
  const content = (
    <>
      {isPrevious && <ChevronLeftIcon data-icon="inline-start" />}
      <span className="hidden sm:block">{label}</span>
      {!isPrevious && <ChevronRightIcon data-icon="inline-end" />}
    </>
  );

  if (href === null) {
    return (
      <Button
        variant="ghost"
        disabled
        aria-label={`Go to ${label.toLowerCase()} page`}
      >
        {content}
      </Button>
    );
  }
  return (
    <PageLink
      href={href}
      size="default"
      ariaLabel={`Go to ${label.toLowerCase()} page`}
    >
      {content}
    </PageLink>
  );
}
