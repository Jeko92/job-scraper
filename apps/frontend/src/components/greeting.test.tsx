import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Greeting } from './greeting';

describe('Greeting', () => {
  it('shows the frontend and the backend greeting', () => {
    render(<Greeting backendMessage="hello from backend" />);
    expect(screen.getByText('hello from frontend')).toBeDefined();
    expect(screen.getByText('hello from backend')).toBeDefined();
  });

  it('shows a fallback when the backend is unreachable', () => {
    render(<Greeting backendMessage={null} />);
    expect(screen.getByText('hello from frontend')).toBeDefined();
    expect(screen.getByText('Backend unreachable')).toBeDefined();
  });
});
