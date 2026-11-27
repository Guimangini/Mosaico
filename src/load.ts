export const LOAD_ERROR = 'Não consegui abrir essa foto. Tente um JPG ou PNG.';

export async function loadImage(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error(LOAD_ERROR);
  }
}
