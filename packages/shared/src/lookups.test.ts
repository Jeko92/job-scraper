import { describe, expect, it } from 'vitest';

import { locationsQuerySchema } from './locations';
import { DEFAULT_LOOKUP_LIMIT } from './lookup-query';
import { skillsQuerySchema } from './skills';

describe('lookup query schemas', () => {
  it('defaults the limit', () => {
    expect(skillsQuerySchema.parse({})).toEqual({
      limit: DEFAULT_LOOKUP_LIMIT,
    });
  });

  it('rejects a zero limit', () => {
    expect(skillsQuerySchema.safeParse({ limit: '0' }).success).toBe(false);
  });

  it('upper-cases the country code', () => {
    expect(locationsQuerySchema.parse({ countryCode: 'de' }).countryCode).toBe(
      'DE',
    );
  });
});
