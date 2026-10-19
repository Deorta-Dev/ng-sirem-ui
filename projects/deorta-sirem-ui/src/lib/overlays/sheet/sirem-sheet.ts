import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';

/** Alturas predeterminadas del sheet. */
export type SiremSheetSize = 'sm' | 'md' | 'lg' | 'full';

const SIZES: readonly SiremSheetSize[] = ['sm', 'md', 'lg', 'full'];

/** Duración de la salida; debe cubrir `--sirem-duration-slow` (320 ms). */
const CLOSE_MS = 340;

/** Proporción del viewport de cada preset (debe coincidir con el `.scss`). */
const RATIOS: Record<Exclude<SiremSheetSize, 'full'>, number> = {
  sm: 0.42,
  md: 0.62,
  lg: 0.85,
};

/**
 * Hoja inferior (bottom sheet) redimensionable con presets y pantalla completa.
 *
 * ## Tamaños
 * `size` es doble vía con `sm` (42 dvh), `md` (62 dvh, defecto), `lg`
 * (85 dvh) y `full` (100 dvh). Las proporciones viven en el `.scss` y se
 * pueden afinar por CSS con `--sirem-sheet-h-{sm,md,lg,full}`.
 *
 * ## Redimensionar
 * Con `resizable` (defecto) hay un asidero sobre la cabecera:
 * - Arrastrarlo cambia el alto en vivo y, al soltar, **encaja** en el preset
 *   más cercano (o en `full` si se sube casi hasta arriba).
 * - Doble clic alterna pantalla completa.
 * - Con el foco: flechas arriba/abajo suben y bajan de preset, `Home`/`End`
 *   van al mínimo/`full` (si `maximizable`).
 *
 * ## Gestos sobre el contenido
 * Con `gestureResize` (desactivado por defecto; el contenido scrollea normal)
 * se puede cambiar el alto arrastrando **dentro del contenido**, en móvil y
 * con ratón:
 * - Hacia **arriba** crece, con tope en `full` (o en `lg` si no es
 *   `maximizable`). Solo se activa cuando el contenido ya está al final, así
 *   que un contenido largo primero scrollea.
 * - Hacia **abajo** encoge, y solo cuando el contenido está al principio
 *   (`scrollTop === 0`). En `full`, ese es el gesto para salir de pantalla
 *   completa sin usar el botón.
 *
 * ## Límites
 * - `maximizable` (defecto `true`): permite llegar a `full`.
 * - `minimizable` (defecto `true`): con `false` el sheet vive **siempre en
 *   `full`** y no se muestran ni el asidero ni el botón de restaurar.
 *
 * ## Pantalla completa
 * En `full` **el asidero desaparece**. Las acciones de la cabecera no se
 * mueven: en el mismo sitio de la derecha, maximizar pasa a ser **restaurar**
 * (vuelve al último tamaño no maximizado, o a `defaultSize`) y **cerrar**
 * sigue donde estaba.
 *
 * Uso:
 * ```html
 * <sirem-sheet
 *   [(open)]="detalle"
 *   [(size)]="tamano"
 *   title="Detalle del paciente"
 *   subtitle="HC-2026-001 · María Torres"
 * >
 *   …contenido…
 *   <div slot="footer">…acciones…</div>
 * </sirem-sheet>
 * ```
 */
@Component({
  selector: 'sirem-sheet',
  standalone: true,
  styleUrl: './sirem-sheet.scss',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
  template: `
    @if (mounted()) {
      <div class="sirem-sheet" [class.sirem-sheet--closing]="closing()">
        <div class="sirem-sheet__backdrop" (click)="onBackdrop()"></div>

        <section
          #panel
          class="sirem-sheet__panel"
          [class.sirem-sheet__panel--sm]="size() === 'sm'"
          [class.sirem-sheet__panel--md]="size() === 'md'"
          [class.sirem-sheet__panel--lg]="size() === 'lg'"
          [class.sirem-sheet__panel--full]="maximized()"
          [class.sirem-sheet__panel--dragging]="dragging()"
          [style.height.px]="dragHeight()"
          [style.maxWidth]="maxWidth()"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          [attr.aria-label]="title() ?? ariaLabel()"
        >
          @if (resizable() && !maximized()) {
            <div
              class="sirem-sheet__handle"
              role="separator"
              aria-orientation="horizontal"
              aria-label="Redimensionar el panel"
              tabindex="0"
              (pointerdown)="onHandleDown($event)"
              (pointermove)="onHandleMove($event)"
              (pointerup)="onHandleUp($event)"
              (pointercancel)="onHandleUp($event)"
              (dblclick)="toggleMaximize()"
              (keydown.arrow-up)="onArrow($event, 1)"
              (keydown.arrow-down)="onArrow($event, -1)"
              (keydown.home)="onHome($event)"
              (keydown.end)="onEnd($event)"
            >
              <span class="sirem-sheet__grip" aria-hidden="true"></span>
            </div>
          } @else {
            <!-- Sin control de tamaño (full o resizable=false) el hueco se
                 reserva igual: la cabecera no cambia de sitio. -->
            <div class="sirem-sheet__handle sirem-sheet__handle--spacer" aria-hidden="true"></div>
          }

          <header class="sirem-sheet__head">
            <div class="sirem-sheet__heading">
              @if (title()) {
                <h2 class="sirem-sheet__title">{{ title() }}</h2>
              }
              @if (subtitle()) {
                <p class="sirem-sheet__subtitle">{{ subtitle() }}</p>
              }
            </div>

            <ng-content select="[slot='header']" />

            <!-- Las acciones viven siempre arriba a la derecha: en full el
                 botón de maximizar se convierte en restaurar, sin mover cerrar. -->
            @if (showRestore()) {
              <button
                type="button"
                class="sirem-sheet__icon"
                (click)="restore()"
                aria-label="Restaurar tamaño"
                title="Restaurar tamaño"
              >
                <i class="fi fi-rr-compress" aria-hidden="true"></i>
              </button>
            } @else if (showMaximize()) {
              <button
                type="button"
                class="sirem-sheet__icon"
                (click)="maximize()"
                aria-label="Pantalla completa"
                title="Pantalla completa"
              >
                <i class="fi fi-rr-expand" aria-hidden="true"></i>
              </button>
            }
            @if (closable()) {
              <button
                type="button"
                class="sirem-sheet__icon"
                (click)="close()"
                aria-label="Cerrar"
                title="Cerrar"
              >
                <i class="fi fi-rr-cross-small" aria-hidden="true"></i>
              </button>
            }
          </header>

          <div
            #body
            class="sirem-sheet__body"
            [class.sirem-sheet__body--gesture]="gestureResize()"
            (touchstart)="onContentTouchStart($event)"
            (touchmove)="onContentTouchMove($event)"
            (touchend)="onContentTouchEnd()"
            (touchcancel)="onContentTouchEnd()"
            (pointerdown)="onContentPointerDown($event)"
            (pointermove)="onContentPointerMove($event)"
            (pointerup)="onContentPointerUp($event)"
            (pointercancel)="onContentPointerUp($event)"
          >
            <ng-content />
          </div>

          <div class="sirem-sheet__footer">
            <ng-content select="[slot='footer']" />
          </div>
        </section>
      </div>
    }
  `,
})
export class SiremSheet {
  /** Estado abierto (doble vía). */
  readonly open = model(false);
  /** Altura predeterminada activa (doble vía). */
  readonly size = model<SiremSheetSize>('md');

  /** Título de la cabecera y nombre accesible del panel. */
  readonly title = input<string | null>(null);
  /** Línea secundaria bajo el título. */
  readonly subtitle = input<string | null>(null);
  /** Nombre accesible cuando no hay `title`. */
  readonly ariaLabel = input<string | null>('Panel');

  /** Muestra el botón de cerrar. */
  readonly closable = input(true);
  /** Permite arrastrar el asidero para cambiar el alto. */
  readonly resizable = input(true);
  /**
   * Permite cambiar el alto con gestos verticales **dentro del contenido**
   * (móvil y ratón). Arriba agranda hasta `full`; abajo encoge, y solo si el
   * contenido está al principio (`scrollTop === 0`) para no robar el scroll.
   * Desactivado por defecto: el contenido scrollea normal.
   */
  readonly gestureResize = input(false);
  /** Permite llegar a pantalla completa. */
  readonly maximizable = input(true);
  /**
   * Permite encoger. Con `false` el sheet vive siempre en `full` y no se
   * muestran ni el asidero ni el botón de restaurar.
   */
  readonly minimizable = input(true);
  /** Cerrar al pulsar el fondo. */
  readonly backdropClose = input(true);
  /** Cerrar con `Escape`. */
  readonly closeOnEscape = input(true);
  /** Tamaño al que vuelve «restaurar» si aún no se eligió otro. */
  readonly defaultSize = input<SiremSheetSize>('md');
  /** Ancho máximo del panel (cualquier unidad CSS). */
  readonly maxWidth = input('100%');

  /** Se emite al cerrarse, antes de la animación de salida. */
  readonly closed = output<void>();
  /** Se emite con el nuevo tamaño al cambiar el alto (asidero, gesto o botón). */
  readonly resized = output<SiremSheetSize>();

  /** `true` cuando ocupa toda la pantalla. */
  readonly maximized = computed(() => this.size() === 'full');

  /** Restaurar solo tiene sentido si se puede encoger y ya está en `full`. */
  protected readonly showRestore = computed(() => this.minimizable() && this.maximized());
  /** Maximizar, si se puede y aún no está en `full`. */
  protected readonly showMaximize = computed(
    () => this.maximizable() && this.minimizable() && !this.maximized(),
  );

  protected readonly dragging = signal(false);
  /** Alto en px mientras se arrastra (luego vuelve al preset). */
  protected readonly dragHeight = signal<number | null>(null);

  /** Sigue montado durante la animación de salida. */
  protected readonly mounted = signal(false);
  /** `true` mientras se reproduce la salida (slide hacia abajo). */
  protected readonly closing = signal(false);
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly body = viewChild<ElementRef<HTMLElement>>('body');
  /** Último tamaño no maximizado: destino de `restore()`. */
  private readonly lastSize = signal<SiremSheetSize>('md');

  private startY = 0;
  private startHeight = 0;
  private startScroll = 0;
  private startAtBottom = true;
  private savedOverflow: string | null = null;

  /** Gesto de contenido armado (aún sin decidir si cambia el alto). */
  private gestureArmed = false;
  /** El gesto ya se ha quedado con el movimiento (bloquea el scroll). */
  private gestureClaimed = false;
  private gesturePointer: number | null = null;

  constructor() {
    // Sin `minimizable` el sheet vive siempre en `full`; si no, recuerda el
    // último tamaño «normal» para poder restaurar.
    effect(() => {
      const minimizable = this.minimizable();
      const size = this.size();
      if (!minimizable) {
        if (size !== 'full') this.size.set('full');
        return;
      }
      if (size !== 'full') this.lastSize.set(size);
    });

    // Entrada/salida: al cerrar se mantiene montado lo que dura el slide y
    // luego se desmonta. Reabrir durante la salida cancela la retirada.
    effect(() => {
      if (this.open()) {
        this.cancelClose();
        this.closing.set(false);
        this.mounted.set(true);
        return;
      }
      if (!this.mounted()) return;
      this.closing.set(true);
      this.cancelClose();
      this.closeTimer = setTimeout(() => {
        this.closeTimer = null;
        this.mounted.set(false);
        this.closing.set(false);
      }, CLOSE_MS);
    });

    // Bloquea el scroll de la página mientras el sheet está abierto.
    effect(() => {
      if (typeof document === 'undefined') return;
      if (this.open()) {
        this.savedOverflow ??= document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      } else if (this.savedOverflow !== null) {
        document.body.style.overflow = this.savedOverflow;
        this.savedOverflow = null;
      }
    });

    // Foco al panel al abrir (lectores de pantalla y teclado).
    effect(() => {
      if (!this.open()) return;
      const panel = this.panel()?.nativeElement;
      if (!panel) return;
      if (typeof requestAnimationFrame !== 'function') {
        panel.focus({ preventScroll: true });
        return;
      }
      requestAnimationFrame(() => panel.focus({ preventScroll: true }));
    });

    inject(DestroyRef).onDestroy(() => {
      this.cancelClose();
      if (this.savedOverflow !== null && typeof document !== 'undefined') {
        document.body.style.overflow = this.savedOverflow;
      }
    });
  }

  // ------------------------------------------------------------------ API

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.closed.emit();
  }

  maximize(): void {
    if (!this.maximizable() || !this.minimizable() || this.maximized()) return;
    this.setSize('full');
  }

  /** Vuelve al último tamaño no maximizado (o a `defaultSize`). */
  restore(): void {
    if (!this.minimizable() || !this.maximized()) return;
    const fallback = this.defaultSize();
    const target = this.lastSize() === 'full' ? fallback : this.lastSize();
    this.setSize(target === 'full' ? fallback : target);
  }

  toggleMaximize(): void {
    if (!this.minimizable()) return;
    if (this.maximized()) this.restore();
    else this.maximize();
  }

  // ------------------------------------------------------------- eventos

  protected onBackdrop(): void {
    if (this.backdropClose()) this.close();
  }

  protected onEscape(): void {
    if (this.open() && this.closeOnEscape()) this.close();
  }

  protected onArrow(event: Event, direction: 1 | -1): void {
    event.preventDefault();
    const index = SIZES.indexOf(this.size());
    const next = SIZES[Math.min(SIZES.length - 1, Math.max(0, index + direction))];
    if (next === 'full' && !this.maximizable()) return;
    this.setSize(next);
  }

  protected onHome(event: Event): void {
    event.preventDefault();
    this.setSize('sm');
  }

  protected onEnd(event: Event): void {
    event.preventDefault();
    if (!this.minimizable()) return;
    this.setSize(this.maximizable() ? 'full' : 'lg');
  }

  // ------------------------------------------------------ arrastre del asidero

  protected onHandleDown(event: PointerEvent): void {
    const panel = this.panel()?.nativeElement;
    if (!panel || event.button !== 0) return;
    event.preventDefault();
    this.startY = event.clientY;
    this.startHeight = panel.getBoundingClientRect().height;
    this.dragging.set(true);
    (event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
  }

  protected onHandleMove(event: PointerEvent): void {
    if (!this.dragging()) return;
    const viewport = typeof window === 'undefined' ? 0 : window.innerHeight;
    if (!viewport) return;
    const min = RATIOS.sm * viewport;
    const max = this.maxHeight(viewport);
    const next = Math.min(max, Math.max(min, this.startHeight + (this.startY - event.clientY)));
    this.dragHeight.set(Math.round(next));
  }

  protected onHandleUp(event: PointerEvent): void {
    if (!this.dragging()) return;
    this.dragging.set(false);
    (event.currentTarget as HTMLElement | null)?.releasePointerCapture?.(event.pointerId);
    const height = this.dragHeight() ?? this.startHeight;
    this.dragHeight.set(null);
    this.snap(height);
  }

  // ------------------------------------------------- gestos sobre el contenido

  /*
   * El gesto se «arma» al tocar y solo se queda con el movimiento cuando la
   * dirección tiene sentido. Mientras no se lo queda, el navegador scrollea el
   * contenido con normalidad: por eso no hace falta tocar `touch-action`.
   */

  protected onContentPointerDown(event: PointerEvent): void {
    if (event.pointerType === 'touch' || event.button !== 0) return;
    if (!this.beginGesture(event.clientY)) return;
    this.gesturePointer = event.pointerId;
    (event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
  }

  protected onContentPointerMove(event: PointerEvent): void {
    if (event.pointerType === 'touch' || this.gesturePointer === null) return;
    if (this.moveGesture(event.clientY)) event.preventDefault();
  }

  protected onContentPointerUp(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;
    (event.currentTarget as HTMLElement | null)?.releasePointerCapture?.(event.pointerId);
    this.gesturePointer = null;
    this.endGesture();
  }

  protected onContentTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) return;
    this.beginGesture(event.touches[0].clientY);
  }

  protected onContentTouchMove(event: TouchEvent): void {
    if (event.touches.length !== 1) return;
    if (this.moveGesture(event.touches[0].clientY) && event.cancelable) {
      event.preventDefault();
    }
  }

  protected onContentTouchEnd(): void {
    this.endGesture();
  }

  /** Prepara un gesto de contenido; `false` si está desactivado o no aplica. */
  private beginGesture(y: number): boolean {
    if (!this.gestureResize() || !this.minimizable()) return false;
    const panel = this.panel()?.nativeElement;
    if (!panel) return false;
    const body = this.body()?.nativeElement;
    this.startY = y;
    this.startHeight = panel.getBoundingClientRect().height;
    this.startScroll = body?.scrollTop ?? 0;
    this.startAtBottom =
      !body || body.scrollTop + body.clientHeight >= body.scrollHeight - 1;
    this.gestureArmed = true;
    this.gestureClaimed = false;
    return true;
  }

  /**
   * Aplica el desplazamiento del gesto. Devuelve `true` cuando el gesto se ha
   * quedado con el movimiento (y hay que bloquear el scroll del contenido).
   */
  private moveGesture(y: number): boolean {
    if (!this.gestureArmed) return false;
    const viewport = typeof window === 'undefined' ? 0 : window.innerHeight;
    if (!viewport) return false;

    const dy = y - this.startY;
    const min = RATIOS.sm * viewport;
    const max = this.maxHeight(viewport);

    if (!this.gestureClaimed) {
      if (Math.abs(dy) < 8) return false;
      const grows = dy < 0;
      // Arriba crece si el contenido ya llegó al final; abajo encoge si está
      // al principio. Así el scroll del contenido tiene prioridad.
      const canGrow = grows && this.startHeight < max - 2 && this.startAtBottom;
      const canShrink = !grows && this.startHeight > min + 2 && this.startScroll <= 0;
      if (!canGrow && !canShrink) {
        this.gestureArmed = false;
        return false;
      }
      this.gestureClaimed = true;
      this.dragging.set(true);
    }

    const next = Math.min(max, Math.max(min, this.startHeight - dy));
    this.dragHeight.set(Math.round(next));
    return true;
  }

  private endGesture(): void {
    if (!this.gestureArmed) return;
    this.gestureArmed = false;
    if (!this.gestureClaimed) return;
    this.gestureClaimed = false;
    this.dragging.set(false);
    const height = this.dragHeight() ?? this.startHeight;
    this.dragHeight.set(null);
    this.snap(height);
  }

  /** Alto máximo permitido: la pantalla si se puede maximizar; si no, `lg`. */
  private maxHeight(viewport: number): number {
    return this.maximizable() ? viewport : RATIOS.lg * viewport;
  }

  /** Encaja el alto soltado en el preset más cercano. */
  private snap(height: number): void {
    if (!this.minimizable()) return;
    const viewport = typeof window === 'undefined' ? 0 : window.innerHeight;
    if (!viewport) return;
    if (this.maximizable() && height > viewport * 0.93) {
      this.setSize('full');
      return;
    }
    let best: Exclude<SiremSheetSize, 'full'> = 'md';
    let distance = Number.POSITIVE_INFINITY;
    for (const size of ['sm', 'md', 'lg'] as const) {
      const delta = Math.abs(height - RATIOS[size] * viewport);
      if (delta < distance) {
        distance = delta;
        best = size;
      }
    }
    this.setSize(best);
  }

  private cancelClose(): void {
    if (this.closeTimer === null) return;
    clearTimeout(this.closeTimer);
    this.closeTimer = null;
  }

  private setSize(size: SiremSheetSize): void {
    if (this.size() === size) return;
    this.size.set(size);
    this.resized.emit(size);
  }
}
