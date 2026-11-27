import { TILE_H, TILE_W, tiles, type Tile } from './grid';
import { tileSourceRect, type Rect } from './crop';

export type RenderedTile = { tile: Tile; blob: Blob };

export function tileSourceCanvasSize(src: Rect): { w: number; h: number } {
  return { w: Math.ceil(src.w), h: Math.ceil(src.h) };
}

/**
 * Gera os pedaços em 1080×1440, um de cada vez. Nunca cria um canvas da foto
 * inteira (o Safari do iPhone limita canvas a ~16,7 MP).
 */
export async function renderTiles(
  bmp: ImageBitmap,
  crop: Rect,
  rows: number,
  sharpen: boolean,
  onProgress?: (done: number, total: number) => void,
): Promise<RenderedTile[]> {
  const { default: createPica } = await import('pica');
  const pica = createPica({ features: ['js', 'wasm', 'ww'] });
  const list = tiles(rows).sort((a, b) => a.postIndex - b.postIndex);
  const out: RenderedTile[] = [];

  const dest = document.createElement('canvas');
  dest.width = TILE_W;
  dest.height = TILE_H;

  for (const tile of list) {
    const r = tileSourceRect(crop, tile.row, tile.col, rows);
    const size = tileSourceCanvasSize(r);
    const src = document.createElement('canvas');
    src.width = size.w;
    src.height = size.h;
    const ctx = src.getContext('2d')!;
    ctx.drawImage(bmp, r.x, r.y, r.w, r.h, 0, 0, size.w, size.h);

    await pica.resize(src, dest, {
      filter: 'lanczos3',
      unsharpAmount: sharpen ? 80 : 0,
      unsharpRadius: 0.6,
      unsharpThreshold: 2,
    });
    const blob = await pica.toBlob(dest, 'image/jpeg', 0.95);
    out.push({ tile, blob });

    src.width = src.height = 0; // libera memória no iOS
    onProgress?.(out.length, list.length);
  }
  return out;
}
