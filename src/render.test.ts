import { describe, it, expect } from 'vitest';
import { initialCrop, tileSourceRect } from './crop';
import { tileSourceCanvasSize } from './render';

describe('render', () => {
  it('foto de 48 MP com 1 linha não estoura o limite de canvas do iOS', () => {
    const s = tileSourceCanvasSize(tileSourceRect(initialCrop(8064, 6048, 1), 0, 0, 1));
    expect(s.w * s.h).toBeLessThanOrEqual(16_777_216);
  });

  it('tamanho do recorte arredonda para cima', () => {
    const s = tileSourceCanvasSize(tileSourceRect(initialCrop(3000, 4000, 3), 0, 0, 3));
    expect(s).toEqual({ w: 1000, h: 1334 });
  });
});
