export type Orientation = 'portrait' | 'landscape';

export const TILE_W = 1080;
export const TILE_H = 1440;
export const COLS = 3;

/** Quadrada conta como em pé. */
export function orientationOf(w: number, h: number): Orientation {
  return w > h ? 'landscape' : 'portrait';
}

export function rowRange(o: Orientation): { min: 1; max: number; default: number } {
  return o === 'portrait' ? { min: 1, max: 4, default: 3 } : { min: 1, max: 2, default: 2 };
}

/** Largura / altura do mosaico inteiro. */
export function gridAspect(rows: number): number {
  return (COLS * TILE_W) / (rows * TILE_H);
}

export type Tile = { row: number; col: number; postIndex: number; fileName: string };

/**
 * Pedaços em ordem de leitura. O post mais recente fica no canto superior
 * esquerdo, então o primeiro a postar (01) é o canto inferior direito.
 */
export function tiles(rows: number): Tile[] {
  const total = rows * COLS;
  const width = String(total).length < 2 ? 2 : String(total).length;
  const out: Tile[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < COLS; col++) {
      const postIndex = total - (row * COLS + col);
      out.push({ row, col, postIndex, fileName: `${String(postIndex).padStart(width, '0')}.jpg` });
    }
  }
  return out;
}
