import { describe, expect, it } from 'vitest';

import { isHelloResponse } from './hello';

describe('isHelloResponse', () => {
  it('accepts an object with a string message', () => {
    expect(isHelloResponse({ message: 'hello from backend' })).toBe(true);
  });

  it('accepts extra properties', () => {
    expect(isHelloResponse({ message: 'hi', extra: 1 })).toBe(true);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a string', 'hello from backend'],
    ['an empty object', {}],
    ['a non-string message', { message: 42 }],
    ['an array', ['hello from backend']],
  ])('rejects %s', (_label, value) => {
    expect(isHelloResponse(value)).toBe(false);
  });
});
