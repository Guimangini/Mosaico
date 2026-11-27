import { describe, it, expect } from 'vitest';
import { canShareFiles } from './save';

describe('save', () => {
  const f = new File(['x'], '01.jpg', { type: 'image/jpeg' });

  it('sem canShare → false', () => {
    expect(canShareFiles([f], {} as Navigator)).toBe(false);
    expect(canShareFiles([f], undefined)).toBe(false);
  });

  it('canShare true → true', () => {
    expect(canShareFiles([f], { canShare: () => true } as unknown as Navigator)).toBe(true);
  });

  it('canShare que lança erro → false', () => {
    const nav = { canShare: () => { throw new TypeError('x'); } } as unknown as Navigator;
    expect(canShareFiles([f], nav)).toBe(false);
  });
});
