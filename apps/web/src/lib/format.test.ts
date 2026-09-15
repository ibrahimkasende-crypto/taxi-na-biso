import { describe, expect, it } from 'vitest';
import { formatFareCdf } from '@openride/ui';

describe('formatFareCdf', () => {
  it('affiche 15 000 FC à partir de 1 500 000 centimes', () => {
    const formatted = formatFareCdf(1_500_000).replace(/\u00a0|\u202f/g, ' ');
    expect(formatted).toBe('15 000 FC');
  });

  it('arrondit sans décimales', () => {
    expect(formatFareCdf(100)).toBe('1 FC');
  });
});
