import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadImage, LOAD_ERROR } from './load';

const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });

describe('loadImage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('navegador antigo que rejeita a opção: tenta de novo sem opções', async () => {
    const bmp = { width: 10, height: 10 };
    const fn = vi.fn((_f: Blob, opts?: object) =>
      opts ? Promise.reject(new TypeError('bad enum')) : Promise.resolve(bmp));
    vi.stubGlobal('createImageBitmap', fn);
    await expect(loadImage(file)).resolves.toBe(bmp);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('arquivo que não decodifica: mensagem amigável', async () => {
    vi.stubGlobal('createImageBitmap', () => Promise.reject(new DOMException('x', 'InvalidStateError')));
    await expect(loadImage(file)).rejects.toThrow(LOAD_ERROR);
  });
});
