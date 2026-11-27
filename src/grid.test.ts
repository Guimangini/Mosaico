import { describe, it, expect } from 'vitest';
import { orientationOf, rowRange, gridAspect, tiles } from './grid';

describe('grid', () => {
  it('orientationOf', () => {
    expect(orientationOf(3000, 4000)).toBe('portrait');
    expect(orientationOf(4000, 3000)).toBe('landscape');
    expect(orientationOf(2000, 2000)).toBe('portrait');
  });

  it('rowRange', () => {
    expect(rowRange('portrait')).toEqual({ min: 1, max: 4, default: 3 });
    expect(rowRange('landscape')).toEqual({ min: 1, max: 2, default: 2 });
  });

  it('gridAspect', () => {
    expect(gridAspect(3)).toBeCloseTo(0.75);
    expect(gridAspect(1)).toBeCloseTo(2.25);
    expect(gridAspect(4)).toBeCloseTo(0.5625);
  });

  it('tiles(3) ordem de postagem', () => {
    const t = tiles(3);
    expect(t).toHaveLength(9);
    const at = (r: number, c: number) => t.find((x) => x.row === r && x.col === c)!;
    expect(at(2, 2)).toMatchObject({ postIndex: 1, fileName: '01.jpg' });
    expect(at(0, 0)).toMatchObject({ postIndex: 9, fileName: '09.jpg' });
    expect(at(2, 0).postIndex).toBe(3);
    expect(t[0]).toMatchObject({ row: 0, col: 0 });
  });

  it('tiles(4) nomes únicos 01..12', () => {
    const names = tiles(4).map((x) => x.fileName).sort();
    expect(names).toHaveLength(12);
    expect(new Set(names).size).toBe(12);
    expect(names[0]).toBe('01.jpg');
    expect(names[11]).toBe('12.jpg');
  });
});
