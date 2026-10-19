import {
  ApplicationRef,
  Directive,
  ElementRef,
  Injector,
  TemplateRef,
  ViewRef,
  afterNextRender,
  booleanAttribute,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { siremOverlayLayer } from './sirem-overlay-layer';
import {
  computeOverlayPosition,
  type SiremOverlayPlacement,
  type SiremOverlayPositionResult,
} from './sirem-overlay-position';

/** Clase que se aplica al nodo proyectado para estilarlo como panel. */
const PANEL_CLASS = 'sirem-overlay-panel';

/**
 * Lado del panel que mira al disparador. Ahí se ancla el `scale` de entrada
 * para que el panel «salga» del componente y no de la esquina de la pantalla.
 */
function enterOrigin(placement: SiremOverlayPlacement): string {
  const side = placement.startsWith('inline-start')
    ? 'inline-start'
    : placement.startsWith('inline-end')
      ? 'inline-end'
      : placement.split('-')[0];
  switch (side) {
    case 'top':
      return 'center bottom';
    case 'bottom':
      return 'center top';
    case 'left':
    case 'inline-start':
      return 'right center';
    case 'right':
    case 'inline-end':
      return 'left center';
    default:
      return 'center';
  }
}

/** Evento que abre el overlay. */
export type SiremOverlayTriggerType =
  | 'click'
  | 'dblclick'
  | 'contextmenu'
  | 'longpress'
  | 'hover'
  | 'manual';

/**
 * Abre un overlay (menú contextual, lista de opciones, ficha de detalle,
 * sub-elementos de un sidebar o navbar) en una **capa superior**, de forma
 * que ningún `overflow: hidden` de un ancestro lo recorte.
 *
 * ## Contenido
 * Admite **cualquier componente**: se pasa un `<ng-template>` y dentro se
 * pueden proyectar `sirem-card`, `sirem-list`, `sirem-chart`… o lo que haga
 * falta. El panel se mide y se reposiciona con su tamaño real.
 *
 * ## Eventos
 * `siremOverlayTrigger` elige cómo se abre:
 * - `click` (defecto) · `dblclick` · `longpress` (mantener pulsado)
 * - `contextmenu` (clic derecho; el panel sale **bajo el puntero** y el menú
 *   del navegador no aparece)
 * - `hover` (entra el puntero y se queda un momento)
 * - `manual` (solo con `[(open)]`, para abrir desde código)
 *
 * Se pueden pilingar varios overlays en el mismo elemento, cada uno con su
 * evento: un clic abre el menú y mantener pulsado abre la ficha.
 *
 * ## Colocación
 * `siremOverlayPlacement` acepta `top`, `bottom`, `left`, `right`,
 * `inline-start`, `inline-end` y las variantes `-start`, `-center`, `-end`.
 * El panel **nunca toca los bordes**: se voltea al lado con más hueco, se
 * desplaza en el eje cruzado y, si aun así no cabe, se acota para que el
 * contenido desplace en lugar de salirse.
 *
 * @example
 * ```html
 * <button
 *   [siremOverlay]="menu"
 *   siremOverlayPlacement="bottom-start"
 *   siremOverlayTrigger="click"
 * >
 *   Acciones <i class="fi fi-rr-angle-small-down"></i>
 * </button>
 *
 * <button
 *   [siremOverlay]="detail"
 *   siremOverlayTrigger="longpress"
 *   [siremOverlayLongPressMs]="600"
 * >
 *   Mantener para el detalle
 * </button>
 *
 * <div [siremOverlay]="menu" siremOverlayTrigger="contextmenu">
 *   Clic derecho para el menú contextual
 * </div>
 *
 * <ng-template #menu>
 *   <sirem-card title="Opciones">…</sirem-card>
 * </ng-template>
 * ```
 */
@Directive({
  selector: '[siremOverlay]',
  host: {
    '[attr.aria-expanded]': 'open()',
    '[attr.aria-haspopup]':
      'siremOverlay() ? (siremOverlayTrigger() === "contextmenu" ? "menu" : "true") : null',
  },
})
export class SiremOverlayTrigger {
  /** Plantilla con el contenido del panel. `null` desactiva la directiva. */
  readonly siremOverlay = input<TemplateRef<unknown> | null>(null);
  /** Contexto que recibe la plantilla al instanciarse. */
  readonly siremOverlayData = input<unknown>(null);
  /** Evento que abre el panel. */
  readonly siremOverlayTrigger = input<SiremOverlayTriggerType>('click');
  /** Lado y alineación deseada. */
  readonly siremOverlayPlacement = input<SiremOverlayPlacement>('bottom-start');
  /** Separación en px respecto al disparador. */
  readonly siremOverlayOffset = input(8, { transform: numberAttribute });
  /** Margen que el panel deja siempre contra los bordes del viewport. */
  readonly siremOverlayViewportPadding = input(8, { transform: numberAttribute });
  /** Milisegundos que hay que mantener pulsado (`longpress`). */
  readonly siremOverlayLongPressMs = input(500, { transform: numberAttribute });
  /** Espera con el puntero encima antes de abrir (`hover`). */
  readonly siremOverlayHoverDelayMs = input(250, { transform: numberAttribute });
  /**
   * Espera tras salir el puntero del disparador antes de cerrar (`hover`).
   * Da tiempo a entrar en el panel, que vive fuera del elemento.
   */
  readonly siremOverlayHoverHideDelayMs = input(200, { transform: numberAttribute });
  /** Retardo antes de abrir con `click`; util como antirrebote. `0` abre ya. */
  readonly siremOverlayClickDelayMs = input(0, { transform: numberAttribute });
  /** Voltea al lado opuesto cuando el preferido no cabe. */
  readonly siremOverlayFlip = input(true, { transform: booleanAttribute });
  /** Desplaza en el eje cruzado para no invadir el borde opuesto. */
  readonly siremOverlayShift = input(true, { transform: booleanAttribute });
  /** Iguala el ancho del panel al del disparador (combos y selectores). */
  readonly siremOverlayMatchTriggerWidth = input(false, { transform: booleanAttribute });
  /** Cierra al pulsar fuera del panel. */
  readonly siremOverlayCloseOnOutsideClick = input(true, { transform: booleanAttribute });
  /** Cierra con la tecla Escape. */
  readonly siremOverlayCloseOnEscape = input(true, { transform: booleanAttribute });
  /** Reposiciona al hacer scroll o redimensionar; con `false`, se cierra. */
  readonly siremOverlayRepositionOnScroll = input(true, { transform: booleanAttribute });

  /** Estado de apertura, controlable con dos vías. */
  readonly open = model(false);

  /** Se emite cuando el panel se abre. */
  readonly opened = output<void>();
  /** Se emite cuando el panel se cierra. */
  readonly closed = output<void>();

  /** Geometría del último reposicionamiento; `null` si está cerrado. */
  readonly position = signal<SiremOverlayPositionResult | null>(null);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly appRef = inject(ApplicationRef);

  private viewRef: ViewRef | null = null;
  private panelEl: HTMLElement | null = null;
  private detachTimer: ReturnType<typeof setTimeout> | null = null;
  private detachHandler: (() => void) | null = null;
  private pressTimer: ReturnType<typeof setTimeout> | null = null;
  private clickTimer: ReturnType<typeof setTimeout> | null = null;
  private hoverTimer: ReturnType<typeof setTimeout> | null = null;
  /** Punto del viewport donde se pulsó con el botón derecho (`contextmenu`). */
  private anchorPoint: { x: number; y: number } | null = null;
  /** `true` mientras el panel está en la transición de salida. */
  private closing = false;

  constructor() {
    // `open` es la única fuente de verdad: el clic y el control externo pasan
    // por aquí, así no hay dos caminos que se desincronicen.
    effect(() => {
      if (this.open()) {
        // Reabrir durante la transición de salida (frecuente con `hover`)
        // debe retomar el panel, no montar otro encima ni quedarse sin él.
        if (this.closing) this.cancelUnmount();
        else if (!this.panelEl) this.mount();
      } else if (this.panelEl) {
        this.unmountWithTransition();
      }
    });

    const el = this.host.nativeElement;
    el.addEventListener('click', this.onClick);
    el.addEventListener('dblclick', this.onDblClick);
    el.addEventListener('pointerdown', this.onPointerDown);
    el.addEventListener('pointerup', this.onPointerUp);
    el.addEventListener('pointerleave', this.onPointerLeave);
    el.addEventListener('pointerenter', this.onPointerEnter);
    el.addEventListener('contextmenu', this.onContextMenu);
  }

  /** `true` solo cuando hay un panel realmente en el DOM. */
  isOpen(): boolean {
    return this.panelEl !== null;
  }

  // ------------------------------------------------------------------ API

  toggle(): void {
    this.open() ? this.close() : this.show();
  }

  show(): void {
    if (!this.siremOverlay()) return;
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }

  // ---------------------------------------------------------------- eventos

  private readonly onClick = (event: MouseEvent) => {
    if (this.siremOverlayTrigger() !== 'click') return;
    event.preventDefault();
    event.stopPropagation();
    if (this.open()) {
      this.close();
      return;
    }
    // Un retardo > 0 acts as debounce, useful when several controls open
    // the same overlay.
    const delay = this.siremOverlayClickDelayMs();
    if (delay > 0) {
      this.clearClick();
      this.clickTimer = setTimeout(() => this.show(), delay);
      return;
    }
    this.show();
  };

  private clearClick(): void {
    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
      this.clickTimer = null;
    }
  }

  private readonly onDblClick = (event: MouseEvent) => {
    if (this.siremOverlayTrigger() !== 'dblclick') return;
    event.preventDefault();
    event.stopPropagation();
    // Un doble clic llega tras dos clics: se anula el antirrebote pendiente
    // para que no se abra dos veces.
    this.clearClick();
    this.toggle();
  };

  private readonly onContextMenu = (event: MouseEvent) => {
    const trigger = this.siremOverlayTrigger();
    // Con `manual` el clic derecho también se anula: el panel lo gobierna el
    // consumidor y el menú del navegador no debe salir por encima.
    if (trigger === 'manual') {
      event.preventDefault();
      return;
    }
    if (trigger !== 'contextmenu' || !this.siremOverlay()) return;
    event.preventDefault();
    event.stopPropagation();
    // Un menú contextual sale bajo el puntero, no pegado a la caja del
    // disparador: se guarda el punto y el motor ancla ahí (0×0 de tamaño).
    // El teclado (Menú / Mayús+F10) dispara `contextmenu` sin coordenadas
    // útiles (0,0): en ese caso se ancla al centro del elemento.
    const hostRect = this.host.nativeElement.getBoundingClientRect();
    this.anchorPoint =
      event.clientX !== 0 || event.clientY !== 0
        ? { x: event.clientX, y: event.clientY }
        : {
            x: hostRect.left + hostRect.width / 2,
            y: hostRect.top + hostRect.height / 2,
          };
    // Reabrir en plena transición de salida reutiliza el panel que aún vive
    // (`cancelUnmount`), así que hay que reanclarlo al punto nuevo.
    if (this.closing) this.reposition();
    this.toggle();
  };

  private readonly onPointerDown = (event: PointerEvent) => {
    // Solo el botón principal: el derecho pertenece a `contextmenu`.
    if (event.button !== 0) return;
    if (this.siremOverlayTrigger() !== 'longpress' || !this.siremOverlay()) return;
    this.clearPress();
    this.pressTimer = setTimeout(() => this.show(), this.siremOverlayLongPressMs());
  };

  private readonly onPointerUp = () => this.clearPress();

  private clearPress(): void {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
  }

  private readonly onPointerEnter = () => {
    if (this.siremOverlayTrigger() !== 'hover' || !this.siremOverlay()) return;
    this.clearHover();
    this.hoverTimer = setTimeout(() => this.show(), this.siremOverlayHoverDelayMs());
  };

  private readonly onPointerLeave = () => {
    this.clearPress();
    if (this.siremOverlayTrigger() !== 'hover' || !this.open()) return;
    this.clearHover();
    // Margen para que el puntero llegue al panel, que está en otra capa.
    this.hoverTimer = setTimeout(
      () => this.close(),
      this.siremOverlayHoverHideDelayMs(),
    );
  };

  private clearHover(): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
  }

  // ------------------------------------------------------------ ciclo de vida

  /** Crea la vista, la inserta en la capa y la posiciona. */
  private mount(): void {
    const template = this.siremOverlay();
    if (!template || this.panelEl) return;

    // Se crea la vista fuera del contenedor del disparador y se adjunta a la
    // aplicación, de modo que podemos mover su nodo a la capa superior.
    const viewRef = template.createEmbeddedView(
      {
        $implicit: this.siremOverlayData(),
        siremOverlayData: this.siremOverlayData(),
      },
      this.injector,
    );
    this.appRef.attachView(viewRef);
    this.viewRef = viewRef;

    const node = (viewRef.rootNodes as unknown[]).find(
      (n): n is HTMLElement => n instanceof HTMLElement,
    );
    if (!node) {
      this.destroyView();
      this.open.set(false);
      return;
    }

    this.panelEl = node;
    node.classList.add(PANEL_CLASS);
    siremOverlayLayer().appendChild(node);

    this.reposition();
    this.listen();

    afterNextRender(
      () => {
        if (this.panelEl !== node) return;
        node.classList.add(`${PANEL_CLASS}--visible`);
        // Segunda pasada: ya con el panel pintado y con su tamaño real.
        // Es la que garantiza que ningún borde (incluido el inferior) se corte.
        this.reposition();
      },
      { injector: this.injector },
    );

    this.opened.emit();
  }

  /** Quita el panel respetando la transición de salida. */
  private unmountWithTransition(): void {
    const node = this.panelEl;
    this.clearPress();
    this.clearHover();
    this.clearClick();
    this.unlisten();
    if (!node) return;

    node.classList.remove(`${PANEL_CLASS}--visible`);
    this.closing = true;
    this.closed.emit();

    this.detachHandler = () => this.destroyView();
    node.addEventListener('transitionend', this.detachHandler, { once: true });
    this.detachTimer = setTimeout(() => this.destroyView(), 180);
  }

  /**
   * Reabre un panel que sigue en la transición de salida: se anula la
   * retirada programada y se recupera tal cual (misma vista y posición).
   */
  private cancelUnmount(): void {
    const node = this.panelEl;
    if (!node || !this.closing) return;

    if (this.detachTimer) {
      clearTimeout(this.detachTimer);
      this.detachTimer = null;
    }
    if (this.detachHandler) {
      node.removeEventListener('transitionend', this.detachHandler);
      this.detachHandler = null;
    }
    this.closing = false;
    node.classList.add(`${PANEL_CLASS}--visible`);
    this.listen();
    this.opened.emit();
  }

  /** Quita el panel del DOM de inmediato (sin transición). */
  destroyView(): void {
    if (this.detachTimer) {
      clearTimeout(this.detachTimer);
      this.detachTimer = null;
    }
    if (this.panelEl && this.detachHandler) {
      this.panelEl.removeEventListener('transitionend', this.detachHandler);
    }
    this.detachHandler = null;
    this.closing = false;
    this.clearPress();
    this.clearHover();
    this.clearClick();
    // El punto del clic derecho solo vale para esta apertura.
    this.anchorPoint = null;
    this.panelEl?.remove();
    this.panelEl = null;
    this.position.set(null);
    if (this.viewRef) {
      this.appRef.detachView(this.viewRef);
      this.viewRef.destroy();
      this.viewRef = null;
    }
  }

  ngOnDestroy(): void {
    // El panel vive en la capa de overlays, fuera del árbol de la vista: si
    // el disparador se destruye con él abierto (navegación, *ngIf…), hay que
    // retirarlo a mano o quedaría flotando sobre la nueva vista.
    this.destroyView();
  }

  // ---------------------------------------------------------- posicionamiento

  /**
   * Mide el disparador y el panel, y recalcula la posición. Se invoca al
   * abrir, tras el primer pintado y ante scroll o redimensionado.
   */
  reposition(): void {
    const panel = this.panelEl;
    if (!panel) return;

    const pad = this.siremOverlayViewportPadding();
    const hostRect = this.host.nativeElement.getBoundingClientRect();
    // `contextmenu` ancla al punto pulsado (0×0) para que el menú salga bajo
    // el puntero; el resto de eventos se anclan a la caja del disparador.
    const anchor =
      this.siremOverlayTrigger() === 'contextmenu' && this.anchorPoint
        ? { top: this.anchorPoint.y, left: this.anchorPoint.x, width: 0, height: 0 }
        : {
            top: hostRect.top,
            left: hostRect.left,
            width: hostRect.width,
            height: hostRect.height,
          };
    const result = computeOverlayPosition(
      {
        trigger: anchor,
        overlay: { width: panel.offsetWidth, height: panel.offsetHeight },
        viewport: { width: window.innerWidth, height: window.innerHeight },
      },
      {
        placement: this.siremOverlayPlacement(),
        offset: this.siremOverlayOffset(),
        viewportPadding: pad,
        flip: this.siremOverlayFlip(),
        shift: this.siremOverlayShift(),
        matchTriggerWidth: this.siremOverlayMatchTriggerWidth(),
        direction: document.dir === 'rtl' ? 'rtl' : 'ltr',
      },
    );

    this.position.set(result);
    panel.style.maxWidth = `${result.maxWidth}px`;
    panel.style.maxHeight = `${result.maxHeight}px`;
    if (this.siremOverlayMatchTriggerWidth()) {
      panel.style.minWidth = `${hostRect.width}px`;
    }
    panel.style.setProperty('--sirem-overlay-origin', enterOrigin(result.placement));
    panel.style.transform = `translate3d(${result.x}px, ${result.y}px, 0)`;

    this.clampIntoViewport(panel, pad, result.x, result.y);
  }

  /**
   * Red de seguridad: con el panel ya pintado y acotado, se vuelve a medir y
   * se corrige la posición contra el viewport real. Una sola medición no
   * basta: el alto natural puede cambiar cuando se aplica `max-height`, y la
   * diferencia es justo lo que dejaba el panel cortado por abajo.
   */
  private clampIntoViewport(panel: HTMLElement, pad: number, x: number, y: number): void {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let w = panel.offsetWidth;
    let h = panel.offsetHeight;

    if (h > vh - pad * 2) {
      panel.style.maxHeight = `${vh - pad * 2}px`;
      h = panel.offsetHeight;
    }
    if (w > vw - pad * 2) {
      panel.style.maxWidth = `${vw - pad * 2}px`;
      w = panel.offsetWidth;
    }

    // `x` e `y` son los que acaba de calcular `computeOverlayPosition`: se
    // usan directamente y no se releen del `transform`, porque el navegador
    // lo normaliza a `matrix`/`matrix3d` y al releer se perdía la posición.

    const maxX = Math.max(pad, vw - w - pad);
    const maxY = Math.max(pad, vh - h - pad);
    const cx = Math.min(Math.max(pad, x), maxX);
    const cy = Math.min(Math.max(pad, y), maxY);

    if (cx !== x || cy !== y) {
      panel.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    }
  }

  // --------------------------------------------------------- global listeners

  private readonly onDocumentPointerDown = (event: Event) => {
    if (!this.siremOverlayCloseOnOutsideClick()) return;
    const target = event.target as Node;
    if (this.panelEl?.contains(target) || this.host.nativeElement.contains(target)) return;
    this.close();
  };

  private readonly onDocumentKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !this.isOpen()) return;
    if (!this.siremOverlayCloseOnEscape()) return;
    this.close();
  };

  private readonly onPanelPointerEnter = () => this.clearHover();

  private readonly onPanelPointerLeave = () => {
    if (this.siremOverlayTrigger() !== 'hover' || !this.open()) return;
    this.clearHover();
    this.hoverTimer = setTimeout(
      () => this.close(),
      this.siremOverlayHoverHideDelayMs(),
    );
  };

  private readonly onViewportChange = () => {
    if (!this.isOpen()) return;
    if (this.siremOverlayRepositionOnScroll()) this.reposition();
    else this.close();
  };

  private listen(): void {
    document.addEventListener('pointerdown', this.onDocumentPointerDown, true);
    document.addEventListener('keydown', this.onDocumentKeydown, true);
    window.addEventListener('resize', this.onViewportChange);
    window.addEventListener('scroll', this.onViewportChange, true);
    // `hover` necesita saber cuándo el puntero entra y sale del panel, que
    // vive en otra capa y no dispara eventos sobre el disparador.
    this.panelEl?.addEventListener('pointerenter', this.onPanelPointerEnter);
    this.panelEl?.addEventListener('pointerleave', this.onPanelPointerLeave);
  }

  private unlisten(): void {
    document.removeEventListener('pointerdown', this.onDocumentPointerDown, true);
    document.removeEventListener('keydown', this.onDocumentKeydown, true);
    window.removeEventListener('resize', this.onViewportChange);
    window.removeEventListener('scroll', this.onViewportChange, true);
    this.panelEl?.removeEventListener('pointerenter', this.onPanelPointerEnter);
    this.panelEl?.removeEventListener('pointerleave', this.onPanelPointerLeave);
  }
}
