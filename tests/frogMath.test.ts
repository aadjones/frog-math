import { describe, it, expect } from 'vitest';
import { reachablePads, gcd } from '../src/frogMath';

describe('frogMath', () => {
  it('reachablePads with hop=3 out of 10', () => {
    expect(Array.from(reachablePads(3, 10))).toEqual([0, 3, 6, 9]);
  });
  it('gcd works', () => {
    expect(gcd(21, 14)).toBe(7);
  });
}); 