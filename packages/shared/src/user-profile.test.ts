import { describe, expect, it } from 'vitest';

import { updateUserProfileSchema } from './user-profile';

describe('updateUserProfileSchema', () => {
  it('rejects duplicate skill slugs', () => {
    const result = updateUserProfileSchema.safeParse({
      skills: [{ slug: 'typescript' }, { slug: 'typescript' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown remote preference', () => {
    const result = updateUserProfileSchema.safeParse({
      preferences: { remotePreference: 'SOMETIMES' },
    });
    expect(result.success).toBe(false);
  });
});
