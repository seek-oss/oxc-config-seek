import { describe, it, expect } from 'vitest';

describe('suite', () => {
  it.skip('skipped', () => {
    expect(1).toBe(1);
  });

  it('no assertions', () => {
    void 0;
  });

  it('duplicate', () => {
    expect(1).toBe(1);
  });

  it('duplicate', () => {
    expect(2).toBe(2);
  });
});
