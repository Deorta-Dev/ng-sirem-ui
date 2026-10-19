import { Component, input, output } from '@angular/core';

/** Tamaño del chip de fecha. */
export type SiremDateChipSize = 'md' | 'lg';

/**
 * Chip de fecha grande (referencia Bento): inicial del día de la semana arriba
 * y el número destacado debajo. Se usa en fila, como selector rápido de días.
 *
 * - `active` pinta el chip con tinta y texto claro (día seleccionado).
 * - `dot` muestra un punto de estado (p. ej. día con eventos) cuando no está activo.
 * - Emite `pressed` al pulsarlo; el estado lo controla el consumidor.
 *
 * Uso:
 * ```html
 * <sirem-date-chip weekday="L" day="19" [active]="true" (pressed)="sel('19')" />
 * <sirem-date-chip weekday="V" day="23" [dot]="true" (pressed)="sel('23')" />
 * ```
 */
@Component({
  selector: 'sirem-date-chip',
  standalone: true,
  styleUrl: './sirem-date-chip.scss',
  template: `
    <button
      type="button"
      class="sirem-date-chip"
      [class.sirem-date-chip--active]="active()"
      [class.sirem-date-chip--lg]="size() === 'lg'"
      [attr.aria-pressed]="active()"
      [attr.aria-label]="ariaLabel()"
      (click)="pressed.emit()"
    >
      @if (weekday()) {
        <span class="sirem-date-chip__weekday">{{ weekday() }}</span>
      }
      <span class="sirem-date-chip__day">{{ day() }}</span>
      @if (dot() && !active()) {
        <span class="sirem-date-chip__dot" aria-hidden="true"></span>
      }
    </button>
  `,
})
export class SiremDateChip {
  /** Número del día (texto o número; admite sufijos como `12+`). */
  readonly day = input.required<string | number>();
  /** Inicial/abreviatura de la semana (`L`, `Ma`, `Mié`…). */
  readonly weekday = input<string | null>(null);
  /** Día seleccionado. */
  readonly active = input(false);
  /** Punto de estado (día con eventos o recordatorio). */
  readonly dot = input(false);
  /** Tamaño: `md` (defecto) o `lg`. */
  readonly size = input<SiremDateChipSize>('md');
  /** Nombre accesible cuando `day` y `weekday` no bastan. */
  readonly ariaLabel = input<string | null>(null);

  /** Se emite al pulsar el chip. */
  readonly pressed = output<void>();
}
