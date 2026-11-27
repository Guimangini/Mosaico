export const LOAD_ERROR = 'Não consegui abrir essa foto. Tente um JPG ou PNG.';

export async function loadImage(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch (err) {
    // Navegadores antigos não conhecem 'from-image' e lançam TypeError;
    // o padrão deles já respeita a orientação EXIF.
    if (err instanceof TypeError) {
      try {
        return await createImageBitmap(file);
      } catch {
        /* cai na mensagem abaixo */
      }
    }
    throw new Error(LOAD_ERROR);
  }
}
