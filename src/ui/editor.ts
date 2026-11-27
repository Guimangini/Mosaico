import { COLS, gridAspect, orientationOf, rowRange } from '../grid';
import {
  clampCrop, initialCrop, panCrop, qualityLevel, resizeCropForRows,
  upscaleFactor, zoomCrop, type Rect,
} from '../crop';

export type EditorState = { bmp: ImageBitmap; rows: number; crop: Rect; sharpen: boolean };

const DISPLAY_MAX_SIDE = 1600;

export function newEditorState(bmp: ImageBitmap): EditorState {
  const rows = rowRange(orientationOf(bmp.width, bmp.height)).default;
  return { bmp, rows, crop: initialCrop(bmp.width, bmp.height, rows), sharpen: false };
}

export function formatFactor(f: number): string {
  return `${f.toFixed(2).replace('.', ',')}x`;
}

const QUALITY_TEXT = {
  ok: 'A foto tem resolução de sobra.',
  moderate: 'Ampliação pequena, a qualidade continua boa.',
  strong: 'Qualidade no limite: use menos linhas ou um recorte maior.',
} as const;

export function mountEditor(
  root: HTMLElement,
  state: EditorState,
  onNext: (s: EditorState) => void,
  onChangePhoto?: () => void,
): void {
  const { bmp } = state;
  const imgW = bmp.width;
  const imgH = bmp.height;
  const range = rowRange(orientationOf(imgW, imgH));

  root.innerHTML = `
    <section class="screen editor">
      <header class="bar">
        <button class="link" data-act="change">Trocar foto</button>
        <h1>Ajustar</h1>
        <span class="bar-spacer"></span>
      </header>
      <div class="stage"><canvas class="photo" aria-label="Foto com a área do mosaico"></canvas></div>
      <p class="hint">Arraste o quadro para escolher a parte da foto. Use dois dedos para aumentar ou diminuir.</p>
      <div class="controls">
        <fieldset class="field">
          <legend>Linhas</legend>
          <div class="segmented" role="radiogroup"></div>
        </fieldset>
        <label class="field">
          <span>Tamanho do recorte</span>
          <input type="range" class="size" min="0" max="1" step="0.001">
        </label>
        <label class="field switch">
          <span>Realçar nitidez</span>
          <input type="checkbox" class="sharpen" role="switch">
        </label>
        <p class="quality" aria-live="polite"><strong class="factor"></strong> <span class="qtext"></span></p>
        <button class="primary" data-act="next">Ver prévia</button>
      </div>
    </section>`;

  const $ = <T extends Element>(s: string) => root.querySelector(s) as T;
  const canvas = $<HTMLCanvasElement>('canvas.photo');
  const stage = $<HTMLDivElement>('.stage');
  const seg = $<HTMLDivElement>('.segmented');
  const size = $<HTMLInputElement>('input.size');
  const sharpen = $<HTMLInputElement>('input.sharpen');
  const quality = $<HTMLParagraphElement>('.quality');
  const factorEl = $<HTMLElement>('.factor');
  const qtext = $<HTMLElement>('.qtext');

  // Cópia reduzida só para exibir; o corte final usa a foto original.
  const k = Math.min(1, DISPLAY_MAX_SIDE / Math.max(imgW, imgH));
  const display = document.createElement('canvas');
  display.width = Math.round(imgW * k);
  display.height = Math.round(imgH * k);
  const dctx = display.getContext('2d')!;
  dctx.imageSmoothingQuality = 'high';
  dctx.drawImage(bmp, 0, 0, display.width, display.height);

  let s = 1; // px de tela por px da foto
  const aspect = () => gridAspect(state.rows);
  const maxW = () => initialCrop(imgW, imgH, state.rows).w;

  for (let r = range.min; r <= range.max; r++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `3×${r}`;
    b.dataset.rows = String(r);
    b.setAttribute('role', 'radio');
    b.onclick = () => {
      state.rows = r;
      state.crop = resizeCropForRows(state.crop, r, imgW, imgH);
      update();
    };
    seg.appendChild(b);
  }

  sharpen.checked = state.sharpen;
  sharpen.onchange = () => { state.sharpen = sharpen.checked; };

  size.oninput = () => {
    const v = Number(size.value);
    const w = maxW() * (1 / 8 + (7 / 8) * v);
    const c = state.crop;
    state.crop = clampCrop(
      { x: c.x + c.w / 2 - w / 2, y: c.y + c.h / 2 - w / aspect() / 2, w, h: w / aspect() },
      imgW, imgH, aspect(),
    );
    update(false);
  };

  function layout() {
    const availW = stage.clientWidth;
    const availH = Math.max(240, window.innerHeight * 0.55);
    s = Math.min(availW / imgW, availH / imgH);
    const cssW = imgW * s;
    const cssH = imgH * s;
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    draw();
  }

  function draw() {
    const ctx = canvas.getContext('2d')!;
    const sx = canvas.width / imgW;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(display, 0, 0, canvas.width, canvas.height);

    const c = state.crop;
    const x = c.x * sx, y = c.y * sx, w = c.w * sx, h = c.h * sx;

    ctx.save();
    ctx.fillStyle = 'rgba(16, 38, 31, 0.62)';
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.rect(x, y, w, h);
    ctx.fill('evenodd');

    const dpr = window.devicePixelRatio || 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    for (let i = 1; i < COLS; i++) {
      ctx.moveTo(x + (w * i) / COLS, y);
      ctx.lineTo(x + (w * i) / COLS, y + h);
    }
    for (let i = 1; i < state.rows; i++) {
      ctx.moveTo(x, y + (h * i) / state.rows);
      ctx.lineTo(x + w, y + (h * i) / state.rows);
    }
    ctx.stroke();

    ctx.strokeStyle = '#F2C230';
    ctx.lineWidth = 2.5 * dpr;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }

  function update(syncSlider = true) {
    for (const b of seg.querySelectorAll('button')) {
      b.setAttribute('aria-checked', String(Number(b.dataset.rows) === state.rows));
    }
    if (syncSlider) {
      const v = (state.crop.w / maxW() - 1 / 8) / (7 / 8);
      size.value = String(Math.max(0, Math.min(1, v)));
    }
    const f = upscaleFactor(state.crop);
    const level = qualityLevel(f);
    quality.dataset.level = level;
    factorEl.textContent = f <= 1 ? 'Sem ampliação' : `Ampliação ${formatFactor(f)}`;
    qtext.textContent = QUALITY_TEXT[level];
    draw();
  }

  // Gestos: 1 dedo move o quadro, 2 dedos mudam o tamanho.
  const pointers = new Map<number, { x: number; y: number }>();
  let lastDist = 0;

  const dist = () => {
    const [a, b] = [...pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  const toPhoto = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s };
  };

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) lastDist = dist();
  });
  canvas.addEventListener('pointermove', (e) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    if (pointers.size === 1) {
      state.crop = panCrop(state.crop, (cur.x - prev.x) / s, (cur.y - prev.y) / s, imgW, imgH, aspect());
      pointers.set(e.pointerId, cur);
      update();
    } else if (pointers.size === 2) {
      pointers.set(e.pointerId, cur);
      const d = dist();
      if (lastDist > 0 && d > 0) {
        const c = state.crop;
        // Afastar os dedos aumenta o quadro.
        state.crop = zoomCrop(c, lastDist / d, c.x + c.w / 2, c.y + c.h / 2, imgW, imgH, aspect());
        update();
      }
      lastDist = d;
    }
  });
  const end = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    lastDist = pointers.size === 2 ? dist() : 0;
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = toPhoto(e as unknown as PointerEvent);
    state.crop = zoomCrop(state.crop, e.deltaY > 0 ? 0.92 : 1 / 0.92, p.x, p.y, imgW, imgH, aspect());
    update();
  }, { passive: false });

  $<HTMLButtonElement>('[data-act="next"]').onclick = () => onNext(state);
  const change = $<HTMLButtonElement>('[data-act="change"]');
  if (onChangePhoto) change.onclick = onChangePhoto; else change.hidden = true;

  new ResizeObserver(layout).observe(stage);
  layout();
  update();
}
