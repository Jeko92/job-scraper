import type {
  JobListItem,
  JobsPreviewQuery,
  JobsPreviewResponse,
} from '@job-scraper/shared';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { parsePreviewQuery } from '@/lib/explore/query-url';
import type { RawSearchParams } from '@/lib/jobs/query-url';

import { ExploreFeed } from './explore-feed';
import { ExploreFilters } from './explore-filters';

const push = vi.hoisted(() =>
  vi.fn<(href: string, options?: { scroll?: boolean }) => void>(),
);

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

function makeJob(id: number, title: string): JobListItem {
  return {
    id: `00000000-0000-4000-8000-${String(id).padStart(12, '0')}`,
    title,
    company: {
      id: '10000000-0000-4000-8000-000000000000',
      name: 'Acme',
      domain: 'acme.test',
    },
    location: null,
    workplaceType: null,
    employmentType: null,
    salaryMin: null,
    salaryMax: null,
    salaryCurrency: null,
    postedAt: new Date().toISOString(),
    skills: [
      {
        id: '20000000-0000-4000-8000-000000000000',
        name: 'TypeScript',
        slug: 'typescript',
        required: true,
      },
    ],
    isSaved: false,
    match: null,
  };
}

/** Like `app/explore/page.tsx`: the feed inside the filters. */
function explorePage(result: JobsPreviewResponse, query: JobsPreviewQuery) {
  return (
    <ExploreFilters query={query}>
      <ExploreFeed result={result} />
    </ExploreFilters>
  );
}

function renderExplore(
  result: JobsPreviewResponse,
  query: JobsPreviewQuery = {},
) {
  const view = render(explorePage(result, query));

  /** Re-renders with the filters of the last pushed URL, like the server page. */
  function followPush() {
    const href = push.mock.lastCall?.[0];
    if (href === undefined) {
      throw new Error('router.push was not called');
    }
    const { searchParams } = new URL(href, 'http://localhost');
    const params: RawSearchParams = {};
    for (const key of searchParams.keys()) {
      params[key] = searchParams.getAll(key);
    }
    view.rerender(explorePage(result, parsePreviewQuery(params)));
  }

  return { followPush };
}

function filters() {
  return within(screen.getByRole('complementary', { name: 'Job filters' }));
}

/** Labels of the selected chips in one filter group, e.g. "Skills". */
function selectedChips(group: string): string[] {
  return within(filters().getByRole('group', { name: group }))
    .queryAllByRole('button', { name: /^Remove / })
    .map((chip) =>
      (chip.getAttribute('aria-label') ?? '').replace(/^Remove /, ''),
    );
}

function addChip(label: string): HTMLElement | null {
  return filters().queryByRole('button', { name: `Add ${label}` });
}

function clickFilterButton(name: string) {
  fireEvent.click(filters().getByRole('button', { name }));
}

describe('Explore page', () => {
  beforeEach(() => {
    push.mockClear();
  });

  describe('results', () => {
    it('shows the total, one card per job and the hidden rest', () => {
      renderExplore({
        items: [makeJob(1, 'Frontend Developer'), makeJob(2, 'Data Engineer')],
        total: 1234,
      });

      expect(
        screen.getByRole('heading', { level: 1, name: '1,234 open roles' }),
      ).toBeTruthy();
      const cards = screen.getAllByRole('listitem');
      expect(
        cards.map((card) => card.querySelector('h2')?.textContent),
      ).toEqual(['Frontend Developer', 'Data Engineer']);
      expect(
        screen.getByText(
          '1,232 more jobs waiting. Sign up free to see them all.',
        ),
      ).toBeTruthy();
    });

    it('sends prospects to sign-up from the cards and "Load more"', () => {
      renderExplore({ items: [makeJob(1, 'Frontend Developer')], total: 3 });

      const details = screen.getByRole('link', {
        name: 'Sign up to see Frontend Developer',
      });
      expect(details.getAttribute('href')).toBe('/register');
      const loadMore = screen.getByRole('link', { name: 'Load more' });
      expect(loadMore.getAttribute('href')).toBe('/register');
    });

    it('uses the singular and no count when every job is shown', () => {
      renderExplore({ items: [makeJob(1, 'Frontend Developer')], total: 1 });

      expect(
        screen.getByRole('heading', { level: 1, name: '1 open role' }),
      ).toBeTruthy();
      expect(
        screen.getByText('Sign up free to get new jobs matched to you.'),
      ).toBeTruthy();
    });

    it('shows a hint when no job matches', () => {
      renderExplore({ items: [], total: 0 }, { skill: ['go'] });

      expect(screen.getByText('No jobs match yet')).toBeTruthy();
      expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    });
  });

  describe('filters', () => {
    const result: JobsPreviewResponse = { items: [], total: 0 };

    it('starts with no chip selected', () => {
      renderExplore(result);

      expect(selectedChips('Skills')).toEqual([]);
      expect(selectedChips('Locations')).toEqual([]);
      expect(addChip('React')).toBeTruthy();
      expect(addChip('Berlin')).toBeTruthy();
    });

    it('selects an added skill and puts it into the URL', () => {
      const { followPush } = renderExplore(result);

      clickFilterButton('Add React');

      expect(push).toHaveBeenCalledExactlyOnceWith('/explore?skill=react', {
        scroll: false,
      });
      followPush();
      expect(selectedChips('Skills')).toEqual(['React']);
      expect(selectedChips('Locations')).toEqual([]);
      expect(addChip('React')).toBeNull();
    });

    it('marks the selected values and keeps them when adding another', () => {
      const { followPush } = renderExplore(result, {
        skill: ['react'],
        city: ['Berlin'],
      });

      expect(selectedChips('Skills')).toEqual(['React']);
      expect(selectedChips('Locations')).toEqual(['Berlin']);
      expect(addChip('React')).toBeNull();
      expect(addChip('Berlin')).toBeNull();
      expect(addChip('Munich')).toBeTruthy();

      clickFilterButton('Add Munich');

      expect(push).toHaveBeenCalledExactlyOnceWith(
        '/explore?skill=react&city=Berlin&city=Munich',
        { scroll: false },
      );
      followPush();
      expect(selectedChips('Skills')).toEqual(['React']);
      expect(selectedChips('Locations')).toEqual(['Berlin', 'Munich']);
    });

    it('unselects a removed value and drops its filter from the URL', () => {
      const { followPush } = renderExplore(result, {
        skill: ['react'],
        city: ['Berlin'],
      });

      clickFilterButton('Remove React');

      expect(push).toHaveBeenCalledExactlyOnceWith('/explore?city=Berlin', {
        scroll: false,
      });
      followPush();
      expect(selectedChips('Skills')).toEqual([]);
      expect(selectedChips('Locations')).toEqual(['Berlin']);
      expect(addChip('React')).toBeTruthy();
    });

    it('unselects all chips on reset', () => {
      const { followPush } = renderExplore(result, {
        skill: ['react', 'go'],
        city: ['Berlin'],
      });

      expect(selectedChips('Skills')).toEqual(['Go', 'React']);

      clickFilterButton('Reset');

      expect(push).toHaveBeenCalledExactlyOnceWith('/explore', {
        scroll: false,
      });
      followPush();
      expect(selectedChips('Skills')).toEqual([]);
      expect(selectedChips('Locations')).toEqual([]);
    });
  });
});
