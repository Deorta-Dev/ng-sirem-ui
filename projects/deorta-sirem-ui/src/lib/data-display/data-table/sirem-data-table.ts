import { Component, computed, input, model, output, signal } from '@angular/core';
import { SiremAvatar } from '../avatar/sirem-avatar';
import { SiremBadge, SiremBadgeTone } from '../badge/sirem-badge';

export type SiremColumnKind = 'text' | 'number' | 'badge' | 'avatar' | 'date' | 'currency';

export interface SiremTableColumn {
  key: string;
  label: string;
  kind?: SiremColumnKind;
  align?: 'left' | 'center' | 'right';
  /** Mapa valor → tono (para kind 'badge'). */
  badgeTones?: Record<string, SiremBadgeTone>;
  /** Clave opcional para una segunda línea tenue bajo el valor (text/number/date/currency). */
  subKey?: string;
}

export interface SiremAvatarCell {
  name: string;
  src?: string | null;
}

type SortDir = 'asc' | 'desc' | null;

/**
 * Tabla estandarizada de listados (pacientes, terceros, facturas,
 * productos, amortizaciones…). Ordenable, con selección opcional,
 * scroll horizontal en móvil y celdas tipadas (avatar, badge, moneda…).
 *
 * Uso:
 * ```html
 * <sirem-data-table
 *   [columns]="cols"
 *   [rows]="pacientes"
 *   [selectable]="true"
 *   [(selection)]="seleccion"
 *   (rowClicked)="ver($event)"
 * />
 * ```
 */
@Component({
  selector: 'sirem-data-table',
  standalone: true,
  imports: [SiremAvatar, SiremBadge],
  styleUrl: './sirem-data-table.scss',
  template: `
    <div class="sirem-table-wrap">
      <table class="sirem-table">
        <thead>
          <tr class="sirem-table__head-row">
            @if (selectable()) {
              <th class="sirem-table__head-cell sirem-table__head-cell--check">
                <input
                  type="checkbox"
                  [checked]="allChecked()"
                  (change)="toggleAll($event)"
                  aria-label="Seleccionar todo"
                  class="sirem-table__check"
                />
              </th>
            }
            @for (col of columns(); track col.key) {
              <th
                class="sirem-table__head-cell"
                [class.sirem-table__head-cell--right]="col.align === 'right'"
                [class.sirem-table__head-cell--center]="col.align === 'center'"
              >
                @if (sortable()) {
                  <button
                    type="button"
                    (click)="sortBy(col.key)"
                    class="sirem-table__sort"
                    [attr.aria-label]="'Ordenar por ' + col.label"
                  >
                    {{ col.label }}
                    <span aria-hidden="true" class="sirem-table__arrow">{{ arrow(col.key) }}</span>
                  </button>
                } @else {
                  {{ col.label }}
                }
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of sortedRows(); track rowKey(row)) {
            <tr
              class="sirem-table__body-row"
              [class.sirem-table__body-row--clickable]="rowClickable()"
              (click)="onRow(row)"
            >
              @if (selectable()) {
                <td class="sirem-table__cell" (click)="$event.stopPropagation()">
                  <input
                    type="checkbox"
                    [checked]="isChecked(row)"
                    (change)="toggleRow(row, $event)"
                    [attr.aria-label]="'Seleccionar fila ' + rowKey(row)"
                    class="sirem-table__check"
                  />
                </td>
              }
              @for (col of columns(); track col.key) {
                <td
                  class="sirem-table__cell"
                  [class.sirem-table__cell--right]="col.align === 'right'"
                  [class.sirem-table__cell--center]="col.align === 'center'"
                  [class.sirem-table__cell--numeric]="col.kind === 'number' || col.kind === 'currency'"
                >
                  @switch (col.kind ?? 'text') {
                    @case ('avatar') {
                      @if (asAvatar(row[col.key]); as cell) {
                        <span class="sirem-table__avatar-cell">
                          <sirem-avatar [name]="cell.name" [src]="cell.src ?? null" size="sm" />
                          <span class="sirem-table__avatar-name">{{ cell.name }}</span>
                        </span>
                      }
                    }
                    @case ('badge') {
                      <sirem-badge [tone]="badgeTone(col, row[col.key])">
                        {{ row[col.key] }}
                      </sirem-badge>
                    }
                    @case ('date') {
                      {{ formatDate(row[col.key]) }}
                      @if (cellSub(col, row) !== null) {
                        <span class="sirem-table__sub">{{ cellSub(col, row) }}</span>
                      }
                    }
                    @case ('currency') {
                      {{ formatMoney(row[col.key]) }}
                      @if (cellSub(col, row) !== null) {
                        <span class="sirem-table__sub">{{ cellSub(col, row) }}</span>
                      }
                    }
                    @default {
                      @if (cellSub(col, row) !== null) {
                        <span class="sirem-table__primary">{{ row[col.key] }}</span>
                        <span class="sirem-table__sub">{{ cellSub(col, row) }}</span>
                      } @else {
                        {{ row[col.key] }}
                      }
                    }
                  }
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td
                [attr.colspan]="columns().length + (selectable() ? 1 : 0)"
                class="sirem-table__empty"
              >
                {{ emptyText() }}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class SiremDataTable {
  readonly columns = input.required<SiremTableColumn[]>();
  readonly rows = input.required<Record<string, unknown>[]>();
  readonly trackKey = input('id');
  readonly selectable = input(false);
  readonly sortable = input(true);
  readonly rowClickable = input(true);
  readonly emptyText = input('Sin registros.');
  readonly currencyCode = input('COP');

  /** Claves (`trackKey`) de las filas seleccionadas. */
  readonly selection = model<unknown[]>([]);
  readonly rowClicked = output<Record<string, unknown>>();

  private readonly sortKey = signal<string | null>(null);
  private readonly sortDir = signal<SortDir>(null);

  readonly sortedRows = computed(() => {
    const rows = [...this.rows()];
    const key = this.sortKey();
    const dir = this.sortDir();
    if (!key || !dir) return rows;
    const mul = dir === 'asc' ? 1 : -1;
    return rows.sort((a, b) => {
      const va = a[key];
      const vb = b[key];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * mul;
      return String(va).localeCompare(String(vb), 'es') * mul;
    });
  });

  readonly allChecked = computed(() => {
    const rows = this.sortedRows();
    if (!rows.length) return false;
    const sel = new Set(this.selection());
    return rows.every((r) => sel.has(this.rowKey(r)));
  });

  rowKey(row: Record<string, unknown>): unknown {
    return row[this.trackKey()] ?? JSON.stringify(row);
  }

  isChecked(row: Record<string, unknown>): boolean {
    return this.selection().includes(this.rowKey(row));
  }

  toggleRow(row: Record<string, unknown>, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const key = this.rowKey(row);
    this.selection.update((sel) => (checked ? [...sel, key] : sel.filter((k) => k !== key)));
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selection.set(checked ? this.sortedRows().map((r) => this.rowKey(r)) : []);
  }

  sortBy(key: string): void {
    if (this.sortKey() !== key) {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    } else if (this.sortDir() === 'asc') {
      this.sortDir.set('desc');
    } else {
      this.sortKey.set(null);
      this.sortDir.set(null);
    }
  }

  arrow(key: string): string {
    if (this.sortKey() !== key) return '↕';
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }

  onRow(row: Record<string, unknown>): void {
    if (this.rowClickable()) this.rowClicked.emit(row);
  }

  asAvatar(value: unknown): SiremAvatarCell | null {
    if (typeof value === 'string') return { name: value };
    if (value && typeof value === 'object' && 'name' in value) {
      const v = value as Record<string, unknown>;
      return {
        name: String(v['name'] ?? ''),
        src: typeof v['src'] === 'string' ? v['src'] : null,
      };
    }
    return null;
  }

  badgeTone(col: SiremTableColumn, value: unknown): SiremBadgeTone {
    const map = col.badgeTones ?? {};
    return map[String(value)] ?? 'neutral';
  }

  /** Segunda línea de la celda (`subKey`); null si no aplica. */
  cellSub(col: SiremTableColumn, row: Record<string, unknown>): string | null {
    if (!col.subKey) return null;
    const v = row[col.subKey];
    if (v === null || v === undefined || v === '') return null;
    return String(v);
  }

  formatDate(value: unknown): string {
    if (typeof value !== 'string' && !(value instanceof Date)) return String(value ?? '');
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  }

  formatMoney(value: unknown): string {
    if (typeof value !== 'number') return String(value ?? '');
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: this.currencyCode(),
      maximumFractionDigits: 0,
    }).format(value);
  }
}
