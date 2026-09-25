import { Component, computed, HostListener, input, model, output, signal } from '@angular/core';

/** Resultado seleccionable de la paleta (paciente, factura, placa, acción…). */
export interface SiremPaletteItem {
  label: string;
  hint?: string;
  group?: string;
}

/**
 * Buscador global estilo paleta de comandos (equivale a `SearchPalettesComponent`).
 * Se abre con `Ctrl+K` / `Cmd+K` desde cualquier vista; filtra por texto,
 * navega con ↑↓ + Enter y se cierra con Escape.
 *
 * Uso:
 * ```html
 * <sirem-search-palette [(open)]="paleta" [items]="resultados" (selected)="ir($event)" />
 * ```
 */
@Component({
  selector: 'sirem-search-palette',
  standalone: true,
  styleUrl: './sirem-search-palette.scss',
  template: `
    @if (open()) {
      <div class="sirem-palette">
        <div
          class="sirem-palette__backdrop"
          (click)="close()"
          aria-hidden="true"
        ></div>
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Búsqueda global"
          class="sirem-palette__panel"
        >
          <div class="sirem-palette__bar">
            <span aria-hidden="true" class="sirem-palette__icon">⌕</span>
            <input
              type="text"
              [value]="query()"
              (input)="onQuery($event)"
              [placeholder]="placeholder()"
              aria-label="Buscar"
              class="sirem-palette__input"
            />
            <kbd
              class="sirem-palette__kbd"
            >
              ESC
            </kbd>
          </div>
          <ul role="listbox" aria-label="Resultados" class="sirem-palette__list">
            @for (item of filtered(); track item.label + item.group; let i = $index) {
              <li role="option" [attr.aria-selected]="i === active()">
                <button
                  type="button"
                  (click)="choose(item)"
                  (mouseenter)="active.set(i)"
                  class="sirem-palette__option"
                  [class.sirem-palette__option--active]="i === active()"
                >
                  <span class="sirem-palette__label">{{ item.label }}</span>
                  @if (item.group) {
                    <span class="sirem-palette__group">{{ item.group }}</span>
                  }
                  @if (item.hint) {
                    <span class="sirem-palette__hint">{{ item.hint }}</span>
                  }
                </button>
              </li>
            } @empty {
              <li class="sirem-palette__empty">
                Sin resultados para “{{ query() }}”.
              </li>
            }
          </ul>
        </div>
      </div>
    }
  `,
})
export class SiremSearchPalette {
  readonly items = input<SiremPaletteItem[]>([]);
  readonly placeholder = input('Buscar pacientes, facturas, placas…');
  readonly open = model(false);

  readonly selected = output<SiremPaletteItem>();

  readonly query = signal('');
  readonly active = signal(0);

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.items();
    const list = q ? all.filter((i) => i.label.toLowerCase().includes(q)) : all;
    return list.slice(0, 30);
  });

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.open.set(true);
      return;
    }
    if (!this.open()) return;
    if (event.key === 'Escape') this.close();
    else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.active.update((i) => Math.min(i + 1, this.filtered().length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.active.update((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      const item = this.filtered()[this.active()];
      if (item) this.choose(item);
    }
  }

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.active.set(0);
  }

  choose(item: SiremPaletteItem): void {
    this.selected.emit(item);
    this.close();
  }

  close(): void {
    this.open.set(false);
    this.query.set('');
    this.active.set(0);
  }
}
