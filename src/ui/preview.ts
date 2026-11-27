import { COLS } from '../grid';
import { renderTiles, type RenderedTile } from '../render';
import { saveTiles } from '../save';
import type { EditorState } from './editor';

export function mountPreview(root: HTMLElement, state: EditorState, onBack: () => void): void {
  const total = state.rows * COLS;
  root.innerHTML = `
    <section class="screen preview">
      <header class="bar">
        <button class="link" data-act="back">Voltar</button>
        <h1>Prévia do perfil</h1>
        <span class="bar-spacer"></span>
      </header>
      <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="0">
        <div class="progress-fill"></div>
        <span class="progress-text">Cortando 0 de ${total}…</span>
      </div>
      <div class="grid" style="--rows:${state.rows}" hidden></div>
      <p class="hint post-hint" hidden>
        Poste na ordem dos números, de 01 a ${String(total).padStart(2, '0')}, sem outros posts no meio.
        Posts fixados no topo do perfil quebram o mosaico.
      </p>
      <p class="status" aria-live="polite"></p>
      <div class="controls">
        <button class="primary" data-act="save" disabled>Baixar ${total} fotos</button>
      </div>
    </section>`;

  const $ = <T extends Element>(s: string) => root.querySelector(s) as T;
  const progress = $<HTMLDivElement>('.progress');
  const fill = $<HTMLDivElement>('.progress-fill');
  const ptext = $<HTMLSpanElement>('.progress-text');
  const grid = $<HTMLDivElement>('.grid');
  const hint = $<HTMLParagraphElement>('.post-hint');
  const status = $<HTMLParagraphElement>('.status');
  const save = $<HTMLButtonElement>('[data-act="save"]');
  const urls: string[] = [];
  const abort = new AbortController();
  let items: RenderedTile[] = [];

  $<HTMLButtonElement>('[data-act="back"]').onclick = () => {
    abort.abort();
    urls.forEach(URL.revokeObjectURL);
    onBack();
  };

  renderTiles(state.bmp, state.crop, state.rows, state.sharpen, (done, n) => {
    fill.style.width = `${(done / n) * 100}%`;
    progress.setAttribute('aria-valuenow', String(done));
    ptext.textContent = `Cortando ${done} de ${n}…`;
  }, abort.signal)
    .then((result) => {
      if (abort.signal.aborted) return;
      items = result;
      // Grade em ordem de leitura, como no perfil.
      const byReading = [...result].sort((a, b) => a.tile.row - b.tile.row || a.tile.col - b.tile.col);
      for (const { tile, blob } of byReading) {
        const url = URL.createObjectURL(blob);
        urls.push(url);
        const cell = document.createElement('figure');
        cell.className = 'cell';
        cell.innerHTML = `<img alt="Pedaço ${tile.postIndex}" src="${url}"><figcaption>${tile.fileName.replace('.jpg', '')}</figcaption>`;
        grid.appendChild(cell);
      }
      progress.hidden = true;
      grid.hidden = false;
      hint.hidden = false;
      save.disabled = false;
    })
    .catch(() => {
      if (abort.signal.aborted) return;
      progress.hidden = true;
      status.textContent = 'Não deu para cortar a foto. Volte e tente com menos linhas ou outra foto.';
    });

  save.onclick = async () => {
    save.disabled = true;
    try {
      const how = await saveTiles(items);
      status.textContent = how === 'zip'
        ? 'Baixado como mosaico.zip.'
        : 'Pronto. Escolha "Salvar imagens" para mandar para a galeria.';
    } catch {
      status.textContent = 'Não deu para salvar. Tente de novo.';
    } finally {
      save.disabled = false;
    }
  };
}
