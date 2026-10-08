import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from '@/app/page';

import { LOGIN_HREF, SIGNUP_HREF } from './cta-links';
import { NAV_ITEMS } from './site-header';

describe('HomePage', () => {
  it('renders a single main heading', () => {
    render(<HomePage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('links the calls to action to sign-up and login', () => {
    render(<HomePage />);
    const hrefs = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));
    expect(hrefs).toContain(SIGNUP_HREF);
    expect(hrefs).toContain(LOGIN_HREF);
  });

  it('points every nav anchor at a section on the page', () => {
    const { container } = render(<HomePage />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    for (const item of NAV_ITEMS) {
      expect(
        within(nav)
          .getByRole('link', { name: item.label })
          .getAttribute('href'),
      ).toBe(`#${item.id}`);
      expect(container.querySelector(`section#${item.id}`)).not.toBeNull();
    }
  });
});
