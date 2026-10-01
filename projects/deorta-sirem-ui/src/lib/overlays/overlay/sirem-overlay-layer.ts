/**
 * Capa de overlays: elemento compartido a pantalla completa.
 *
 * Se gestiona como singleton de módulo en lugar de por inyección de
 * dependencias, porque un provider a nivel de componente solo es visible
 * para ese componente y sus hijos de vista: la directiva se usa en
 * cualquier página y nunca vería un token definido en otro componente.
 *
 * La capa se crea bajo demanda y se inserta en `<body>`, de modo que
 * funciona aunque la app no monte `<sirem-overlay-viewport>`. Los estilos se
 * inyectan una sola vez por la misma razón: si vivieran en el `styleUrl` del
 * componente, no existirían cuando el componente no se usa.
 */

/** `z-index` por defecto de la capa. */
const DEFAULT_ZINDEX = 1200;

const STYLE_ID = 'sirem-overlay-styles';

const CSS = `
.sirem-overlay-layer {
  position: fixed;
  inset: 0;
  /* La capa no intercepta clics; solo los paneles con contenido lo hacen. */
  pointer-events: none;
  overflow: visible;
}
.sirem-overlay-panel {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  pointer-events: auto;
  /* Si el panel es más alto que el hueco disponible, scrollea él mismo. */
  overflow: auto;
  overscroll-behavior: contain;
  /* La directiva recalcula el alto maximo con la medicion real; este es
     el respaldo inicial, para que un panel alto nunca desborde la pantalla. */
  max-width: 100vw;
  max-height: 100vh;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.12s ease, visibility 0.12s;
}
.sirem-overlay-panel--visible {
  visibility: visible;
  opacity: 1;
}
.sirem-overlay__panel {
  min-width: 12rem;
  border-radius: var(--sirem-radius-lg, 1rem);
  border: 1px solid var(--sirem-border, #ccd2db);
  background: var(--sirem-surface, #ffffff);
  padding: 0.375rem;
  box-shadow: var(--sirem-shadow-md, 0 12px 28px rgb(15 23 42 / 0.14));
}
.sirem-overlay__item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.625rem;
  border: 0;
  border-radius: var(--sirem-radius-sm, 0.5rem);
  background: none;
  padding: 0.5rem 0.625rem;
  font-size: 0.875rem;
  font-family: inherit;
  text-align: left;
  color: var(--sirem-text-soft, #334155);
  cursor: pointer;
}
.sirem-overlay__item:hover:not(:disabled) {
  background: var(--sirem-surface-hover, #eceef1);
  color: var(--sirem-text, #0f172a);
}
.sirem-overlay__item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.sirem-overlay__item--active {
  background: var(--sirem-tint-bg, #eef6ff);
  color: var(--sirem-tint-text, #174fe1);
  font-weight: 600;
}
@media (prefers-reduced-motion: reduce) {
  .sirem-overlay-panel { transition: none; }
}
`;

let layer: HTMLElement | null = null;

function ensureStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

/** Devuelve la capa compartida, creándola la primera vez. */
export function siremOverlayLayer(): HTMLElement {
  // En SSR no hay `document`: se devuelve un dummy para no romper el render.
  if (typeof document === 'undefined') {
    return { appendChild: () => {}, style: {} } as unknown as HTMLElement;
  }
  ensureStyles();
  if (layer?.isConnected) return layer;

  layer = document.createElement('div');
  layer.className = 'sirem-overlay-layer';
  layer.style.zIndex = String(DEFAULT_ZINDEX);
  document.body.appendChild(layer);
  return layer;
}

/** Fija el `z-index` de la capa (lo usa `sirem-overlay-viewport`). */
export function setSiremOverlayZIndex(value: number): void {
  siremOverlayLayer().style.zIndex = String(value);
}
