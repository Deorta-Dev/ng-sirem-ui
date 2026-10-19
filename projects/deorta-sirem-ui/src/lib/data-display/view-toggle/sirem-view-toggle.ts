import { Component, input, model } from '@angular/core';

/** Vistas rápidas del switch por defecto. */
export type SiremViewMode = 'table' | 'cards';

/** Opción del selector de vistas. */
export interface SiremViewToggleItem {
  /** Valor que emite la opción. */
  value: string;
  /** Texto visible. */
  label: string;
  /** Clase de icono opcional (p. ej. `fi fi-rr-calendar-day`). */
  icon?: string;
}

export type SiremViewToggleSize = 'sm' | 'md';

/**
 * Selector de vista en pastillas.
 *
 * - Sin `items` es el switch fijo **Tabla ⇄ Tarjetas**.
 * - Con `items` sirve para cualquier conjunto de vistas excluyentes
 *   (Día / Semana / Mes / Agenda en `sirem-agenda`).
 *
 * La opción activa se resalta con una ficha sobre el riel gris. Doble vía con
 * `[(view)]`; si el valor actual no está entre los `items`, se resalta el
 * primero (así nunca queda el grupo sin estado visible).
 *
 * Uso:
 * ```html
 * <sirem-view-toggle [(view)]="vista" />
 *
 * <sirem-view-toggle
 *   [items]="[{ value: 'day', label: 'Día', icon: 'fi fi-rr-calendar-day' }]"
 *   [view]="modo()"
 *   (viewChange)="modo.set($event)"
 * />
 * ```
 */
@Component({
  selector: 'sirem-view-toggle',
  standalone: true,
  styleUrl: './sirem-view-toggle.scss',
  template: `
    <div
      role="group"
      [attr.aria-label]="ariaLabel()"
      class="sirem-view-toggle"
      [class.sirem-view-toggle--sm]="size() === 'sm'"
    >
      @if (items(); as entries) {
        @for (item of entries; track item.value) {
          <button
            type="button"
            (click)="view.set(item.value)"
            [attr.aria-pressed]="isActive(item.value)"
            class="sirem-view-toggle__btn"
            [class.sirem-view-toggle__btn--active]="isActive(item.value)"
          >
            @if (item.icon) {
              <i [class]="item.icon" aria-hidden="true"></i>
            }
            {{ item.label }}
          </button>
        }
      } @else {
        <button
          type="button"
          (click)="view.set('table')"
          [attr.aria-pressed]="isActive('table')"
          class="sirem-view-toggle__btn"
          [class.sirem-view-toggle__btn--active]="isActive('table')"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 3.5h12M2 8h12M2 12.5h12" /></svg>
          Tabla
        </button>
        <button
          type="button"
          (click)="view.set('cards')"
          [attr.aria-pressed]="isActive('cards')"
          class="sirem-view-toggle__btn"
          [class.sirem-view-toggle__btn--active]="isActive('cards')"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" /><rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" /></svg>
          Tarjetas
        </button>
      }
    </div>
  `,
})
export class SiremViewToggle {
  /**
   * Valor activo (doble vía). Con `items` puede ser cualquier texto;
   * sin `items` los valores son `table` y `cards`.
   */
  readonly view = model<string>('table');
  /** Vistas a mostrar; `null` deja el switch Tabla/Tarjetas. */
  readonly items = input<SiremViewToggleItem[] | null>(null);
  readonly size = input<SiremViewToggleSize>('md');
  readonly ariaLabel = input('Cambiar vista');

  /** La opción activa; si el valor no existe, la primera de `items`. */
  isActive(value: string): boolean {
    const current = this.view();
    const entries = this.items();
    if (entries && !entries.some((entry) => entry.value === current)) {
      return entries[0]?.value === value;
    }
    return current === value;
  }
}
