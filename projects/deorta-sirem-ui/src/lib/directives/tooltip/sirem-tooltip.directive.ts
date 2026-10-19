import {
  booleanAttribute,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type SiremTooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

const STYLE_ID = 'sirem-tooltip-styles';
const GAP = 8;

/*
 * El globo vive en `document.body` (para que ningún `overflow` lo recorte) y
 * es un elemento ajeno al componente, así que sus estilos van inyectados una
 * sola vez en el head, igual que hace la capa de overlays (`sirem-overlay-layer`).
 */
const STYLES = `
.sirem-tooltip {
  position: fixed;
  z-index: 1200;
  pointer-events: none;
  max-width: 16rem;
  padding: 0.3rem 0.55rem;
  border-radius: var(--sirem-radius-md, 1rem);
  background: #141518;
  color: #fff;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.25;
  white-space: nowrap;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.28);
  opacity: 0;
  transform: scale(0.96);
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.sirem-tooltip--visible {
  opacity: 1;
  transform: none;
}
.sirem-tooltip::after {
  content: '';
  position: absolute;
  width: 0.5rem;
  height: 0.5rem;
  background: inherit;
  transform: rotate(45deg);
}
.sirem-tooltip[data-placement='top']::after {
  bottom: -0.24rem;
  left: 50%;
  margin-left: -0.25rem;
}
.sirem-tooltip[data-placement='bottom']::after {
  top: -0.24rem;
  left: 50%;
  margin-left: -0.25rem;
}
.sirem-tooltip[data-placement='left']::after {
  right: -0.24rem;
  top: 50%;
  margin-top: -0.25rem;
}
.sirem-tooltip[data-placement='right']::after {
  left: -0.24rem;
  top: 50%;
  margin-top: -0.25rem;
}
@media (prefers-reduced-motion: reduce) {
  .sirem-tooltip {
    transition: none;
  }
}
`;

let uid = 0;

/**
 * Tooltip oscuro flotante con flecha (referencia Bento). Aparece al pasar el
 * ratón o al enfocar el elemento y se anuncia a lectores de pantalla vía
 * `aria-describedby` + `role="tooltip"`.
 *
 * Uso:
 * ```html
 * <button [siremTooltip]="'Shield'">…</button>
 * <span [siremTooltip]="'Bloqueado'" siremTooltipPlacement="right">…</span>
 * ```
 *
 * - `[siremTooltipDisabled]="true"` lo desactiva (p. ej. solo cuando el rail
 *   está colapsado).
 * - `[siremTooltipDelay]="0"` lo muestra sin retardo.
 * - Reposiciona en scroll/resize mientras está visible y se limpia al destruir.
 */
@Directive({
  selector: '[siremTooltip]',
  standalone: true,
  host: {
    '(pointerenter)': 'show()',
    '(pointerleave)': 'hide()',
    '(focus)': 'show()',
    '(blur)': 'hide()',
    '(keydown.escape)': 'hide()',
  },
})
export class SiremTooltipDirective {
  /** Texto del globo. `null`/vacío no muestra nada. */
  readonly siremTooltip = input<string | null>(null);
  /** Lado del elemento donde se coloca. */
  readonly siremTooltipPlacement = input<SiremTooltipPlacement>('top');
  /** Retardo de aparición en ms (0 = inmediato). */
  readonly siremTooltipDelay = input(120);
  /** Desactiva el tooltip sin quitar el atributo. */
  readonly siremTooltipDisabled = input(false, { transform: booleanAttribute });

  private readonly host = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly doc = inject(DOCUMENT);
  private tip: HTMLElement | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly id = `sirem-tooltip-${++uid}`;
  /** Reposiciona el globo mientras hay viewport moviéndose por debajo. */
  private readonly onViewportChange = () => this.position();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.detachViewport();
      if (this.timer) clearTimeout(this.timer);
      this.destroy();
    });
  }

  show(): void {
    if (this.siremTooltipDisabled() || !this.siremTooltip()) return;
    if (this.timer) clearTimeout(this.timer);
    const delay = this.siremTooltipDelay();
    if (delay <= 0) {
      this.render();
      return;
    }
    this.timer = setTimeout(() => this.render(), delay);
  }

  hide(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.detachViewport();
    this.tip?.classList.remove('sirem-tooltip--visible');
    this.host.removeAttribute('aria-describedby');
    // Se elimina tras la transición; si no hay, de inmediato.
    const node = this.tip;
    this.tip = null;
    if (node) setTimeout(() => node.remove(), 120);
  }

  private render(): void {
    if (this.tip) return;
    const text = this.siremTooltip();
    if (!text) return;
    this.ensureStyles();
    const tip = this.doc.createElement('div');
    tip.className = 'sirem-tooltip';
    tip.id = this.id;
    tip.setAttribute('role', 'tooltip');
    tip.dataset['placement'] = this.siremTooltipPlacement();
    tip.textContent = text;
    this.doc.body.appendChild(tip);
    this.tip = tip;
    this.host.setAttribute('aria-describedby', this.id);
    this.position();
    tip.classList.add('sirem-tooltip--visible');
    this.attachViewport();
  }

  /** Sigue al anfitrión mientras el globo está abierto (scroll/resize). */
  private attachViewport(): void {
    const view = this.doc.defaultView;
    if (!view) return;
    view.addEventListener('scroll', this.onViewportChange, true);
    view.addEventListener('resize', this.onViewportChange);
  }

  private detachViewport(): void {
    const view = this.doc.defaultView;
    if (!view) return;
    view.removeEventListener('scroll', this.onViewportChange, true);
    view.removeEventListener('resize', this.onViewportChange);
  }

  private position(): void {
    const tip = this.tip;
    if (!tip) return;
    const anchor = this.host.getBoundingClientRect();
    const box = tip.getBoundingClientRect();
    const placement = this.siremTooltipPlacement();
    let top = 0;
    let left = 0;
    if (placement === 'top' || placement === 'bottom') {
      left = anchor.left + anchor.width / 2 - box.width / 2;
      top = placement === 'top' ? anchor.top - box.height - GAP : anchor.bottom + GAP;
    } else {
      top = anchor.top + anchor.height / 2 - box.height / 2;
      left = placement === 'left' ? anchor.left - box.width - GAP : anchor.right + GAP;
    }
    const maxLeft = this.doc.defaultView?.innerWidth ?? 0;
    const maxTop = this.doc.defaultView?.innerHeight ?? 0;
    left = Math.max(GAP, Math.min(left, maxLeft - box.width - GAP));
    top = Math.max(GAP, Math.min(top, maxTop - box.height - GAP));
    tip.style.top = `${Math.round(top)}px`;
    tip.style.left = `${Math.round(left)}px`;
  }

  private ensureStyles(): void {
    if (this.doc.getElementById(STYLE_ID)) return;
    const style = this.doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = STYLES;
    this.doc.head.appendChild(style);
  }

  private destroy(): void {
    this.tip?.remove();
    this.tip = null;
  }
}
