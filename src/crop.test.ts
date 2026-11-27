import { describe, it, expect } from 'vitest';
import { gridAspect } from './grid';
import {
  initialCrop, clampCrop, panCrop, zoomCrop, resizeCropForRows,
  tileSourceRect, upscaleFactor, qualityLevel, type Rect,
} from './crop';

const inside = (c: Rect, w: number, h: number) =>
  c.x >= -1e-9 && c.y >= -1e-9 && c.x + c.w <= w + 1e-9 && c.y + c.h <= h + 1e-9;

describe('crop', () => {
  it('initialCrop', () => {
    expect(initialCrop(3000, 4000, 3)).toEqual({ x: 0, y: 0, w: 3000, h: 4000 });
    const c = initialCrop(4000, 3000, 2);
    expect(c.w / c.h).toBeCloseTo(1.125);
    expect(c.h).toBe(3000);
    expect(c.x + c.w / 2).toBeCloseTo(2000);
  });

  it('clampCrop mantém dentro e na proporção', () => {
    const a = gridAspect(3);
    const c1 = clampCrop({ x: -500, y: 0, w: 1500, h: 2000 }, 3000, 4000, a);
    expect(c1.x).toBe(0);
    const c2 = clampCrop({ x: 0, y: 0, w: 9000, h: 12000 }, 3000, 4000, a);
    expect(inside(c2, 3000, 4000)).toBe(true);
    expect(c2.w / c2.h).toBeCloseTo(a, 6);
  });

  it('zoomCrop respeita limites', () => {
    const a = gridAspect(3);
    const c = initialCrop(3000, 4000, 3);
    const zin = zoomCrop(c, 100, 1500, 2000, 3000, 4000, a);
    expect(zin.w).toBeGreaterThanOrEqual(3000 / 8 - 1e-9);
    expect(zin.w / zin.h).toBeCloseTo(a, 6);
    const zout = zoomCrop(c, 0.01, 1500, 2000, 3000, 4000, a);
    expect(zout.w).toBeLessThanOrEqual(3000 + 1e-9);
    expect(inside(zout, 3000, 4000)).toBe(true);
  });

  it('panCrop não sai da foto', () => {
    const a = gridAspect(3);
    const c = zoomCrop(initialCrop(3000, 4000, 3), 2, 1500, 2000, 3000, 4000, a);
    const p = panCrop(c, 99999, -99999, 3000, 4000, a);
    expect(inside(p, 3000, 4000)).toBe(true);
    expect(p.x + p.w).toBeCloseTo(3000);
    expect(p.y).toBeCloseTo(0);
  });

  it('resizeCropForRows mantém centro', () => {
    const r = resizeCropForRows(initialCrop(3000, 4000, 3), 1, 3000, 4000);
    expect(r.w / r.h).toBeCloseTo(2.25, 6);
    expect(r.y + r.h / 2).toBeCloseTo(2000);
    expect(inside(r, 3000, 4000)).toBe(true);
  });

  it('tileSourceRect', () => {
    const t = tileSourceRect({ x: 0, y: 0, w: 3000, h: 4000 }, 2, 2, 3);
    expect(t.x).toBeCloseTo(2000);
    expect(t.y).toBeCloseTo(2666.667, 2);
    expect(t.w).toBeCloseTo(1000);
    expect(t.h).toBeCloseTo(1333.333, 2);
  });

  it('upscale e nível', () => {
    expect(upscaleFactor({ x: 0, y: 0, w: 3000, h: 4000 })).toBeCloseTo(1.08);
    expect(qualityLevel(1)).toBe('ok');
    expect(qualityLevel(1.2)).toBe('moderate');
    expect(qualityLevel(1.51)).toBe('strong');
    expect(qualityLevel(upscaleFactor(initialCrop(600, 800, 3)))).toBe('strong');
  });
});

describe('clampRectToImage', () => {
  it('corta excesso de ponto flutuante na borda', async () => {
    const { clampRectToImage } = await import('./crop');
    const r = clampRectToImage({ x: 2000, y: 2666.6666666666665, w: 1000.0000000000005, h: 1333.3333333333337 }, 3000, 4000);
    expect(r.x + r.w).toBeLessThanOrEqual(3000);
    expect(r.y + r.h).toBeLessThanOrEqual(4000);
    expect(r.w).toBeCloseTo(1000);
  });
});
