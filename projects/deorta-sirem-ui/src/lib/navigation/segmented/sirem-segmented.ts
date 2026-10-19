import { Component, input, model } from '@angular/core';

/** Opción del control segmentado. */
export interface SiremSegmentedItem {
  value: string;
  label: string;
  /** Clase CSS de icono opcional (p. ej. `fi fi-rr-grid`). */
  icon?: string;
  /** Texto pequeño bajo la etiqueta (p. ej. la fecha en un selector de día). */
  hint?: string;
}

export type SiremSegmentedSize = 'sm' | 'md';

/**
 * Control segmentado de pastillas (referencia Bento): un grupo de opciones
 * excluyentes donde la activa se resalta con un fondo tipo ficha.
 *
 * - `tone="accent"` resalta la opción activa con el acento lima.
 * - `stretch` reparte las opciones a lo ancho del contenedor.
 * - Doble vía con `[(value)]`; la primera opción queda activa si `value` es `null`.
 *
 * Uso:
 * ```html
 * <sirem-segmented [items]="divisas" [(value)]="divisa" ariaLabel="Divisa" />
 * <sirem-segmented tone="accent" size="sm" [items]="dias" [(value)]="dia" />
 * ```
 */
@Component({
  selector: 'sirem-segmented',
  standalone: true,
  styleUrl: './sirem-segmented.scss',
  template: `
    <div
      class="sirem-seg"
      [class.sirem-seg--accent]="tone() === 'accent'"
      [class.sirem-seg--sm]="size() === 'sm'"
      [class.sirem-seg--stretch]="stretch()"
      role="group"
      [attr.aria-label]="ariaLabel()"
    >
      @for (item of items(); track item.value) {
        <button
          type="button"
          class="sirem-seg__item"
          [class.sirem-seg__item--active]="isActive(item.value)"
          [attr.aria-pressed]="isActive(item.value)"
          (click)="select(item.value)"
        >
          @if (item.icon) {
            <i [class]="item.icon" aria-hidden="true"></i>
          }
          <span class="sirem-seg__text">
            <span class="sirem-seg__label">{{ item.label }}</span>
            @if (item.hint) {
              <span class="sirem-seg__hint">{{ item.hint }}</span>
            }
          </span>
        </button>
      }
    </div>
  `,
})
export class SiremSegmented {
  readonly items = input.required<SiremSegmentedItem[]>();
  /** Valor activo (doble vía). */
  readonly value = model<string | null>(null);
  readonly size = input<SiremSegmentedSize>('md');
  /** `accent` pinta la opción activa con el acento lima. */
  readonly tone = input<'default' | 'accent'>('default');
  /** Ocupa el 100 % del ancho, repartiendo las opciones. */
  readonly stretch = input(false);
  readonly ariaLabel = input<string | null>(null);

  /** La primera opción hace de activa por defecto. */
  isActive(value: string): boolean {
    return (this.value() ?? this.items()[0]?.value ?? null) === value;
  }

  select(value: string): void {
    this.value.set(value);
  }
}
