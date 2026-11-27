import { COLS, TILE_W, gridAspect } from './grid';

/** Retângulo em pixels da foto original. */
export type Rect = { x: number; y: number; w: number; h: number };

const MIN_FRACTION = 1 / 8;

/** Maior largura possível para a proporção dentro da foto. */
function maxWidth(imgW: number, imgH: number, aspect: number): number {
  return Math.min(imgW, imgH * aspect);
}

export function initialCrop(imgW: number, imgH: number, rows: number): Rect {
  const aspect = gridAspect(rows);
  const w = maxWidth(imgW, imgH, aspect);
  const h = w / aspect;
  return { x: (imgW - w) / 2, y: (imgH - h) / 2, w, h };
}

/** Corrige proporção, tamanho (mín. 1/8 do máximo) e posição dentro da foto. */
export function clampCrop(c: Rect, imgW: number, imgH: number, aspect: number): Rect {
  const max = maxWidth(imgW, imgH, aspect);
  const w = Math.min(max, Math.max(max * MIN_FRACTION, c.w));
  const h = w / aspect;
  const cx = c.x + c.w / 2;
  const cy = c.y + c.h / 2;
  const x = Math.min(imgW - w, Math.max(0, cx - w / 2));
  const y = Math.min(imgH - h, Math.max(0, cy - h / 2));
  return { x, y, w, h };
}

export function panCrop(c: Rect, dx: number, dy: number, imgW: number, imgH: number, aspect: number): Rect {
  return clampCrop({ ...c, x: c.x + dx, y: c.y + dy }, imgW, imgH, aspect);
}

/** scale > 1 aproxima (área menor), mantendo o ponto (cx, cy) no lugar. */
export function zoomCrop(
  c: Rect, scale: number, cx: number, cy: number, imgW: number, imgH: number, aspect: number,
): Rect {
  const max = maxWidth(imgW, imgH, aspect);
  const w = Math.min(max, Math.max(max * MIN_FRACTION, c.w / scale));
  const k = w / c.w;
  const h = w / aspect;
  const x = cx - (cx - c.x) * k;
  const y = cy - (cy - c.y) * k;
  return clampCrop({ x, y, w, h }, imgW, imgH, aspect);
}

export function resizeCropForRows(c: Rect, rows: number, imgW: number, imgH: number): Rect {
  const aspect = gridAspect(rows);
  const max = maxWidth(imgW, imgH, aspect);
  const w = Math.min(c.w, max);
  const h = w / aspect;
  const cx = c.x + c.w / 2;
  const cy = c.y + c.h / 2;
  return clampCrop({ x: cx - w / 2, y: cy - h / 2, w, h }, imgW, imgH, aspect);
}

export function tileSourceRect(c: Rect, row: number, col: number, rows: number): Rect {
  const w = c.w / COLS;
  const h = c.h / rows;
  return { x: c.x + col * w, y: c.y + row * h, w, h };
}

export function upscaleFactor(c: Rect): number {
  return (COLS * TILE_W) / c.w;
}

export type QualityLevel = 'ok' | 'moderate' | 'strong';

export function qualityLevel(f: number): QualityLevel {
  if (f <= 1.0) return 'ok';
  if (f <= 1.5) return 'moderate';
  return 'strong';
}

/** Remove excessos de ponto flutuante para o retângulo nunca passar da foto. */
export function clampRectToImage(r: Rect, imgW: number, imgH: number): Rect {
  const x = Math.max(0, r.x);
  const y = Math.max(0, r.y);
  return { x, y, w: Math.min(r.w, imgW - x), h: Math.min(r.h, imgH - y) };
}
