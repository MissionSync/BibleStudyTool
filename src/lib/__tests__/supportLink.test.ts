import { describe, expect, it } from 'vitest';
import { stripeSupportLinkFromEnv } from '../supportLink';

describe('stripeSupportLinkFromEnv', () => {
  it('returns a trimmed payment link', () => {
    expect(stripeSupportLinkFromEnv('  https://buy.stripe.com/test  ')).toBe(
      'https://buy.stripe.com/test',
    );
  });

  it('returns an empty string when unset, empty, or whitespace', () => {
    expect(stripeSupportLinkFromEnv(undefined)).toBe('');
    expect(stripeSupportLinkFromEnv(null)).toBe('');
    expect(stripeSupportLinkFromEnv('')).toBe('');
    expect(stripeSupportLinkFromEnv('   ')).toBe('');
  });
});
