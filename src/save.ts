import type { RenderedTile } from './render';

export function canShareFiles(files: File[], nav: Navigator | undefined = globalThis.navigator): boolean {
  try {
    return !!nav?.canShare?.({ files });
  } catch {
    return false;
  }
}

/** Abre o menu de compartilhar do celular; se não der, baixa um .zip. */
export async function saveTiles(items: RenderedTile[]): Promise<'shared' | 'zip'> {
  const files = items.map(
    ({ tile, blob }) => new File([blob], tile.fileName, { type: 'image/jpeg' }),
  );

  if (canShareFiles(files)) {
    try {
      await navigator.share({ files });
      return 'shared';
    } catch (err) {
      // Cancelar o menu não é erro.
      if (err instanceof DOMException && err.name === 'AbortError') return 'shared';
      // Qualquer outra falha cai no zip.
    }
  }

  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  for (const f of files) zip.file(f.name, f);
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mosaico.zip';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return 'zip';
}
