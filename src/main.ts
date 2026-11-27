import '@fontsource-variable/bricolage-grotesque';
import './style.css';
import { loadImage } from './load';
import { mountEditor, newEditorState, type EditorState } from './ui/editor';
import { mountPreview } from './ui/preview';

const root = document.getElementById('app')!;

function showPicker(error?: string) {
  root.innerHTML = `
    <section class="screen picker">
      <div class="mat-hero" aria-hidden="true">
        ${Array.from({ length: 9 }, (_, i) => `<span>${String(9 - i).padStart(2, '0')}</span>`).join('')}
      </div>
      <h1 class="title">Mosaico</h1>
      <p class="lead">Corta uma foto em pedaços para formar uma imagem só na grade do seu perfil do Instagram.</p>
      <label class="primary file">
        Escolher foto
        <input type="file" accept="image/*" hidden>
      </label>
      <p class="error" role="alert">${error ?? ''}</p>
      <p class="fine">A foto fica no seu celular. Nada é enviado para a internet.</p>
    </section>`;
  const input = root.querySelector<HTMLInputElement>('input[type=file]')!;
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const bmp = await loadImage(file);
      showEditor(newEditorState(bmp));
    } catch (e) {
      showPicker((e as Error).message);
    }
  };
}

function showEditor(state: EditorState) {
  mountEditor(root, state, (s) => showPreview(s), () => showPicker());
}

function showPreview(state: EditorState) {
  mountPreview(root, state, () => showEditor(state));
}

showPicker();
