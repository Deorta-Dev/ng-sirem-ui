import {
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';

/** Estilo visual del botón (semántica de color). */
export type SiremButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'ghost'
  | 'danger';
/** Tamaño del botón; `md` iguala la altura de los campos. */
export type SiremButtonSize = 'sm' | 'md' | 'lg';

/**
 * Acción async del botón: se ejecuta al hacer clic y el botón muestra
 * el estado de progreso hasta que termina.
 */
export type SiremButtonAction = () => Observable<unknown> | Promise<unknown> | void;

/**
 * Botón base del design system SIREM (estética Bento: píldoras de esquinas
 * completamente redondeadas, sombras difusas y semántica de color; escala
 * compacta: el tamaño md mide h-10 (40px) como los campos).
 *
 * `variant="primary"` usa la tinta de marca; `variant="accent"` el acento
 * lima (siempre con texto tinta encima).
 *
 * Iconos por slots (cualquier contenido: `fi`, `sirem-duotone-icon`…):
 * ```html
 * <sirem-button variant="primary">
 *   <i slot="icon" class="fi fi-rr-check"></i>Guardar
 * </sirem-button>
 * <sirem-button variant="accent" iconOnly aria-label="Buscar">
 *   <i slot="icon" class="fi fi-rr-search"></i>
 * </sirem-button>
 * ```
 *
 * Uso:
 * ```html
 * <sirem-button variant="primary" size="md" (pressed)="guardar()">Guardar</sirem-button>
 * <sirem-button variant="accent" [action]="guardar$" [disabled]="formInvalido">
 *   Guardar historia
 * </sirem-button>
 * ```
 *
 * - `(pressed)` se emite en cada clic válido (compatibilidad).
 * - `[action]` recibe la función a ejecutar; si devuelve un Observable o una
 *   Promise, el botón muestra el spinner (`loading`) hasta que finaliza y
 *   emite `(finished)` con el último valor o `(failed)` con el error.
 * - `[(loading)]` también admite control externo manual.
 * - `[bordered]="false"` quita el borde (útil sobre superficies ya
 *   delimitadas, como la cabecera del sidebar).
 */
@Component({
  selector: 'sirem-button',
  standalone: true,
  styleUrl: './sirem-button.scss',
  template: `
    <button
      type="button"
      [disabled]="disabled() || loading()"
      [class]="classes()"
      [attr.aria-busy]="loading()"
      (click)="onClick()"
    >
      @if (loading()) {
        <svg
          class="sirem-btn__spinner"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25" stroke-width="3" />
          <path
            d="M22 12a10 10 0 0 0-10-10"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
      }
      <ng-content select="[slot='icon']" />
      <ng-content />
      <ng-content select="[slot='icon-end']" />
    </button>
  `,
})
export class SiremButton {
  /** Estilo visual: `primary`, `secondary`, `success`, `warning`, `ghost` o `danger`. */
  readonly variant = input<SiremButtonVariant>('primary');
  /** Tamaño: `sm` (2 rem), `md` (2.5 rem, igual que los campos) o `lg` (3 rem). */
  readonly size = input<SiremButtonSize>('md');
  /** Bloquea el botón: no emite `pressed` ni ejecuta `action`. */
  readonly disabled = input(false);
  /** Acción a ejecutar al hacer clic (puede devolver Observable/Promise). */
  readonly action = input<SiremButtonAction | null>(null);
  /** Solo icono (botón cuadrado sin etiqueta). Requiere `aria-label`. */
  readonly iconOnly = input(false, { transform: booleanAttribute });
  /** Estado de progreso; lo gestiona `action` o se controla desde fuera. */
  readonly loading = model(false);
  /** Dibuja el borde (defecto). `false` lo suprime sin cambiar el resto. */
  readonly bordered = input(true, { transform: booleanAttribute });

  /** Se emite al pulsar, antes de resolver `action`. */
  readonly pressed = output<void>();
  /** Último valor emitido al completar `action` con éxito. */
  readonly finished = output<unknown>();
  /** Error emitido si `action` falla. */
  readonly failed = output<unknown>();

  private readonly destroyRef = inject(DestroyRef);
  private current: Subscription | null = null;

  private readonly base = 'sirem-btn';

  private readonly variants: Record<SiremButtonVariant, string> = {
    primary: 'sirem-btn--primary',
    accent: 'sirem-btn--accent',
    secondary: 'sirem-btn--secondary',
    success: 'sirem-btn--success',
    warning: 'sirem-btn--warning',
    ghost: 'sirem-btn--ghost',
    danger: 'sirem-btn--danger',
  };

  private readonly sizes: Record<SiremButtonSize, string> = {
    sm: 'sirem-btn--sm',
    md: 'sirem-btn--md',
    lg: 'sirem-btn--lg',
  };

  private readonly iconOnlySizes: Record<SiremButtonSize, string> = {
    sm: 'sirem-btn--icon-only-sm',
    md: 'sirem-btn--icon-only-md',
    lg: 'sirem-btn--icon-only-lg',
  };

  readonly classes = computed(
    () =>
      `${this.base} ${this.variants[this.variant()]} ` +
      `${this.iconOnly() ? this.iconOnlySizes[this.size()] : this.sizes[this.size()]} ` +
      `${this.bordered() ? '' : 'sirem-btn--borderless'} ` +
      `${this.loading() ? 'sirem-btn--loading' : ''}`,
  );

  constructor() {
    this.destroyRef.onDestroy(() => this.current?.unsubscribe());
  }

  onClick(): void {
    if (this.disabled() || this.loading()) return;
    this.pressed.emit();
    const fn = this.action();
    if (!fn) return;
    let result: Observable<unknown> | Promise<unknown> | void;
    try {
      result = fn();
    } catch (err) {
      this.failed.emit(err);
      return;
    }
    if (result instanceof Promise) {
      this.trackPromise(result);
    } else if (result instanceof Observable) {
      this.trackObservable(result);
    }
  }

  private trackObservable(source: Observable<unknown>): void {
    this.current?.unsubscribe();
    this.loading.set(true);
    let last: unknown;
    this.current = source.subscribe({
      next: (v) => (last = v),
      error: (err) => {
        this.loading.set(false);
        this.failed.emit(err);
      },
      complete: () => {
        this.loading.set(false);
        this.finished.emit(last);
      },
    });
  }

  private trackPromise(source: Promise<unknown>): void {
    this.loading.set(true);
    source.then(
      (v) => {
        this.loading.set(false);
        this.finished.emit(v);
      },
      (err) => {
        this.loading.set(false);
        this.failed.emit(err);
      },
    );
  }
}
