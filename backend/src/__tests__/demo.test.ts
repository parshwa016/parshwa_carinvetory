import { describe, it, expect } from 'vitest';
import { calculateDiscount } from '../utils/demo';

describe('calculateDiscount TDD Demo', () => {
  it('should give 10% discount to ADMIN users', () => {
    const result = calculateDiscount(100, 'ADMIN');
    expect(result).toBe(90);
  });

  it('should give 0% discount to standard USERs', () => {
    const result = calculateDiscount(100, 'USER');
    expect(result).toBe(100);
  });
});

