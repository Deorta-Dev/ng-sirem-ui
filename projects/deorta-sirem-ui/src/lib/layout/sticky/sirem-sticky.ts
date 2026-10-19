import { isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  DestroyRef,
  Directive,
  DOCUMENT,
  effect,
  ElementRef,
  forwardRef,
  inject,
  InjectionToken,
  input,
  numberAttribute,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';

/**
 * Aspecto que puede adoptar una barra (topbar, navbar o page-header):
 *
 * - `default`: el aspecto propio del componente.
 * - `elevated`: superficie + sombra, despegada del contenido.
 * - `glass`: superficie translúcida con desenfoque (cristal).
 * - `flat`: sin fondo, borde ni sombra; se funde con la página.
 *
 * Se usa en `appearance` (aspecto normal) y `stickyAppearance` (al quedar
 * fija), de modo que una barra puede cambiar de piel al pegarse.
 */
export type SiremStickyAppearance = 'default' | 'elevated' | 'glass' | 'flat';

/** Elemento que limita la fijación (o selector CSS que lo resuelve). */
export type SiremStickyBoundary = HTMLElement | ElementRef<HTMLElement> | string;

/**
 * Token con la instancia de `SiremSticky` del elemento. Los componentes del
 * host (topbar, navbar, page-header) lo inyectan para saber si están fijos.
 */
export const SIREM_STICKY_STATE = new InjectionToken<SiremSticky>('SIREM_STICKY_STATE');

/** Convierte `''`/`null` en `null` y el resto en número (para `siremStickyLimit`). */
function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Contenedor de scroll más cercano, o `null` si el scroll es el de la ventana. */
function findScrollParent(el: HTMLElement): HTMLElement | null {
  let parent = el.parentElement;
  while (parent) {
    const style = getComputedStyle(parent);
    const overflow = style.overflowY || style.overflow;
    if (overflow && /(auto|scroll|overlay)/.test(overflow)) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

/**
 * Convierte cualquier elemento o componente en **sticky** (`position: sticky`),
 * de forma abierta o acotada a un límite.
 *
 * El comportamiento vive aquí y no en cada componente: cualquier pieza
 * (`<sirem-topbar>`, `<sirem-page-header>`, una tarjeta, un `<div>`…) se fija
 * aplicando `siremSticky`, sin sacarla del flujo y sin compensar huecos como
 * haría `position: fixed`.
 *
 * ## Modos
 * - **Abierto** (por defecto): se fija en `siremStickyOffset` hasta que su
 *   contenedor termina (comportamiento nativo de `sticky`).
 * - **Con límite numérico**: `[siremStickyLimit]="160"` deja que recorra como
 *   mucho 160 px fija; después se suelta y sigue con el contenido.
 * - **Con límite por componente**: `[siremStickyBoundary]="ref"` (elemento,
 *   `ElementRef` o selector CSS) usa el borde inferior de ese elemento como
 *   tope: la pieza se despega hasta él y después lo acompaña.
 *
 * Si hay límite y boundary, gana el más restrictivo. La directiva pone las
 * clases `sirem-sticky` (activa) y `sirem-sticky--stuck` (pegada) en el host
 * y emite `siremStickyChange` al pegarse/soltarse. Expone `stuck` y
 * `exportAs="siremSticky"` para leerlas desde la plantilla.
 *
 * ## Uso
 * ```html
 * <!-- Abierto -->
 * <sirem-topbar siremSticky [siremStickyOffset]="8" />
 *
 * <!-- Hasta 160 px de recorrido -->
 * <sirem-page-header
 *   siremSticky
 *   [siremStickyLimit]="160"
 *   (siremStickyChange)="pinned.set($event)"
 * />
 *
 * <!-- Limitado por otro componente (el borde inferior de #fin) -->
 * <sirem-navbar siremSticky [siremStickyBoundary]="fin" />
 * <div #fin>Fin del área fija</div>
 * ```
 *
 * Nota: el elemento no debe tener un ancestro con `overflow: hidden/clip`
 * entre él y su contenedor de scroll, porque el `sticky` quedaría recortado.
 */
@Directive({
  selector: '[siremSticky]',
  standalone: true,
  exportAs: 'siremSticky',
  providers: [
    { provide: SIREM_STICKY_STATE, useExisting: forwardRef(() => SiremSticky) },
  ],
  host: {
    '[class.sirem-sticky]': 'siremSticky()',
    '[class.sirem-sticky--stuck]': 'stuck()',
    '[style.position]': 'siremSticky() ? "sticky" : null',
    '[style.zIndex]': 'siremSticky() ? siremStickyZIndex() : null',
  },
})
export class SiremSticky {
  /** Activa la fijación (`position: sticky`). */
  readonly siremSticky = input(true, { transform: booleanAttribute });
  /** Separación con el borde superior del contenedor de scroll, en px. */
  readonly siremStickyOffset = input(0, { transform: numberAttribute });
  /**
   * Recorrido máximo fijo, en px, antes de soltarse. `null` (defecto) = sin
   * límite. Ejemplo: `[siremStickyLimit]="160"`.
   */
  readonly siremStickyLimit = input<number | null, unknown>(null, {
    transform: toNumberOrNull,
  });
  /**
   * Elemento cuyo **borde inferior** limita la fijación: la pieza se despega
   * hasta él y después lo acompaña. Admite elemento, `ElementRef` o selector
   * CSS (`'#fin'`). `null` (defecto) = sin límite por componente.
   */
  readonly siremStickyBoundary = input<SiremStickyBoundary | null>(null);
  /** `z-index` mientras está fija. */
  readonly siremStickyZIndex = input(30, { transform: numberAttribute });

  /** `true` mientras la pieza está fijada (o acompañando a su límite). */
  readonly stuck = signal(false);
  /** Se emite al fijarse (`true`) y al soltarse (`false`). */
  readonly siremStickyChange = output<boolean>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private scroller: HTMLElement | null | undefined;
  private boundaryEl: HTMLElement | null = null;
  /** Posición natural del host dentro del contenido desplazable. */
  private naturalTop: number | null = null;
  /** Último `top` aplicado, para no escribir el estilo en cada scroll. */
  private lastTop = Number.NaN;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.document.addEventListener('scroll', this.measure, {
      capture: true,
      passive: true,
    });
    this.document.defaultView?.addEventListener('resize', this.onResize, {
      passive: true,
    });

    // Reacciona a cambios de configuración (y resuelve el boundary cuando
    // ya existe en el DOM).
    effect(() => {
      this.siremSticky();
      this.siremStickyOffset();
      this.siremStickyLimit();
      this.siremStickyZIndex();
      this.naturalTop = null;
      this.measure();
    });

    // Primer cálculo tras el layout inicial (por si la página arranca con scroll).
    this.timer = setTimeout(this.measure, 0);

    this.destroyRef.onDestroy(() => {
      this.document.removeEventListener('scroll', this.measure, { capture: true });
      this.document.defaultView?.removeEventListener('resize', this.onResize);
      if (this.timer) clearTimeout(this.timer);
      this.host.nativeElement.style.removeProperty('top');
    });
  }

  /** Recalcula la posición fija, el límite y el estado «pegado». */
  private readonly measure = (): void => {
    const el = this.host.nativeElement;

    if (!this.siremSticky()) {
      el.style.removeProperty('top');
      this.lastTop = Number.NaN;
      this.setStuck(false);
      return;
    }

    if (this.scroller === undefined) {
      this.scroller = findScrollParent(el);
    }

    this.boundaryEl = this.resolveBoundary(this.siremStickyBoundary());

    const view = this.document.defaultView;
    const scrollTop = this.scroller
      ? this.scroller.scrollTop
      : (view?.scrollY ?? this.document.scrollingElement?.scrollTop ?? 0);
    const base = this.scroller ? this.scroller.getBoundingClientRect().top : 0;
    let rect = el.getBoundingClientRect();

    // Posición natural dentro del contenido. Se refresca al volver arriba y
    // al redimensionar, para absorber cambios de layout.
    if (this.naturalTop === null || scrollTop === 0) {
      this.naturalTop = rect.top - base + scrollTop;
    }

    const offset = this.siremStickyOffset();
    let top = offset;
    let released = false;

    // Límite numérico: tras recorrer `limit` px fija, empieza a soltarse.
    const limit = this.siremStickyLimit();
    if (limit !== null && this.naturalTop !== null) {
      const travel = scrollTop - (this.naturalTop - offset);
      if (travel > limit) {
        top -= travel - limit;
        released = true;
      }
    }

    // Límite por componente: al llegar su borde inferior, la pieza lo acompaña.
    if (this.boundaryEl) {
      const boundaryTop =
        this.boundaryEl.getBoundingClientRect().bottom - rect.height - base;
      top = Math.min(top, boundaryTop);
    }

    if (top !== this.lastTop) {
      this.lastTop = top;
      el.style.top = `${top}px`;
      // El rect anterior es de antes de mover la caja: se relee para saber si
      // ha quedado realmente en la línea (si no, el estado bailaría un frame).
      rect = el.getBoundingClientRect();
    }

    const pinned =
      scrollTop > 0.5 &&
      !released &&
      Math.abs(rect.top - (base + top)) <= 1 &&
      rect.bottom > base + 1;

    this.setStuck(pinned);
  };

  private readonly onResize = (): void => {
    // El contenedor de scroll puede cambiar al redimensionar/recomponer.
    this.scroller = undefined;
    this.naturalTop = null;
    this.measure();
  };

  private setStuck(value: boolean): void {
    if (this.stuck() === value) return;
    this.stuck.set(value);
    this.siremStickyChange.emit(value);
  }

  /** Resuelve el boundary a un elemento real del DOM. */
  private resolveBoundary(value: SiremStickyBoundary | null): HTMLElement | null {
    if (!value) return null;
    if (typeof value === 'string') {
      return this.document.querySelector<HTMLElement>(value);
    }
    if (value instanceof ElementRef) {
      return value.nativeElement as HTMLElement;
    }
    if (value instanceof HTMLElement) {
      return value;
    }
    // Componente con `elementRef` propio.
    const withRef = value as { elementRef?: ElementRef<HTMLElement> };
    return withRef.elementRef?.nativeElement ?? null;
  }
}
