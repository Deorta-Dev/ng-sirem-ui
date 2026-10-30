import {
  Component,
  ElementRef,
  HostListener,
  computed,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { SiremAutofocusDirective } from '../../directives/autofocus/sirem-autofocus.directive';

/** Sub-ítem o acción secundaria dentro de un resultado de la paleta. */
export interface SiremPaletteSubItem {
  /** Identificador único opcional. */
  id?: string | number;
  /** Texto del sub-ítem. */
  label: string;
  /** Icono opcional (clase de Flaticon UIcons, ej. 'fi fi-rr-eye'). */
  icon?: string;
  /** Descripción secundaria o aclaratoria. */
  description?: string;
  /** Contexto o badge adicional. */
  hint?: string;
  /** Datos adicionales asociados. */
  data?: unknown;
}

/** Configuración de badges para la paleta. */
export interface SiremPaletteBadge {
  /** Texto del badge. */
  label: string;
  /** Icono opcional. */
  icon?: string;
  /** Variante o estilo del badge. */
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'accent';
  /** Datos adicionales. */
  data?: unknown;
}

/** Disposición de los badges dentro de la paleta. */
export type SiremPaletteBadgePosition = 'above-title' | 'above-input' | 'below-input';

/** Disposición de los sub-ítems dentro del ítem. */
export type SiremPaletteSubItemsLayout = 'horizontal' | 'vertical';

/** Resultado seleccionable de la paleta (paciente, factura, placa, acción…). */
export interface SiremPaletteItem {
  /** Texto principal del resultado. */
  label: string;
  /** Icono del resultado (clase de Flaticon UIcons, ej. 'fi fi-rr-user'). */
  icon?: string;
  /** Descripción detallada bajo el título. */
  description?: string;
  /** Contexto secundario (ruta, tipo, sede…). */
  hint?: string;
  /** Sección a la que pertenece el resultado. */
  group?: string;
  /** Sub-ítems o acciones secundarias asociadas al ítem. */
  subItems?: SiremPaletteSubItem[];
  /**
   * Disposición de los sub-ítems ('horizontal' por defecto o 'vertical').
   * En horizontal, las flechas ← y → navegan entre los sub-ítems del ítem activo.
   */
  subItemsLayout?: SiremPaletteSubItemsLayout;
  /** Sub-ítem seleccionado activamente al confirmar. */
  selectedSubItem?: SiremPaletteSubItem;
  /** Datos arbitrarios asociados al ítem. */
  data?: unknown;
}

/**
 * Buscador global estilo paleta de comandos (`sirem-search-palette`).
 *
 * Se abre con `Ctrl+K` / `Cmd+K` desde cualquier vista. Admite:
 * - Iconos y descripciones personalizadas por ítem.
 * - Sub-ítems configurables con disposición horizontal o vertical por cada ítem.
 * - En sub-ítems horizontales, navegación gestual con flechas laterales (← y →).
 * - En sub-ítems verticales, navegación continua con flechas ↑ y ↓.
 * - El buscador recibe el foco automáticamente al abrirse la paleta.
 *
 * Uso:
 * ```html
 * <sirem-search-palette
 *   [(open)]="paleta"
 *   [items]="resultados"
 *   (selected)="ir($event)"
 *   (subItemSelected)="ejecutarSubAccion($event)"
 * />
 * ```
 */
@Component({
  selector: 'sirem-search-palette',
  standalone: true,
  imports: [SiremAutofocusDirective],
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
          @if (badges() && badges().length && badgePosition() === 'above-title') {
            <div class="sirem-palette__badges sirem-palette__badges--above-title">
              @for (badge of badges(); track badge.label + $index) {
                <span class="sirem-palette__badge" [class]="'sirem-palette__badge--' + (badge.variant ?? 'neutral')">
                  @if (badge.icon) {
                    <i [class]="badge.icon" aria-hidden="true"></i>
                  }
                  <span>{{ badge.label }}</span>
                </span>
              }
            </div>
          }

          @if (title()) {
            <span class="sirem-palette__title-island">
              <span>{{ title() }}</span>
            </span>
          }

          @if (badges() && badges().length && badgePosition() === 'above-input') {
            <div class="sirem-palette__badges sirem-palette__badges--above-input">
              @for (badge of badges(); track badge.label + $index) {
                <span class="sirem-palette__badge" [class]="'sirem-palette__badge--' + (badge.variant ?? 'neutral')">
                  @if (badge.icon) {
                    <i [class]="badge.icon" aria-hidden="true"></i>
                  }
                  <span>{{ badge.label }}</span>
                </span>
              }
            </div>
          }

          <div class="sirem-palette__bar">
            <span aria-hidden="true" class="sirem-palette__icon">⌕</span>
            <input
              type="text"
              [value]="query()"
              (input)="onQuery($event)"
              (keydown)="onInputKeydown($event)"
              (keyup)="onInputKeyup($event)"
              [placeholder]="placeholder()"
              aria-label="Buscar"
              class="sirem-palette__input"
              siremAutofocus
            />
            <kbd class="sirem-palette__kbd">ESC</kbd>
          </div>

          @if (badges() && badges().length && badgePosition() === 'below-input') {
            <div class="sirem-palette__badges sirem-palette__badges--below-input">
              @for (badge of badges(); track badge.label + $index) {
                <span class="sirem-palette__badge" [class]="'sirem-palette__badge--' + (badge.variant ?? 'neutral')">
                  @if (badge.icon) {
                    <i [class]="badge.icon" aria-hidden="true"></i>
                  }
                  <span>{{ badge.label }}</span>
                </span>
              }
            </div>
          }

          <ul
            #listContainer
            role="listbox"
            aria-label="Resultados"
            class="sirem-palette__list"
          >
            @for (item of filtered(); track item.label + (item.group ?? '') + $index; let i = $index) {
              <li
                role="option"
                [attr.aria-selected]="i === active() && activeSub() === null"
                class="sirem-palette__entry"
              >
                <div
                  class="sirem-palette__option"
                  [class.sirem-palette__option--active]="i === active() && activeSub() === null"
                  [attr.tabindex]="i === active() && activeSub() === null ? 0 : -1"
                  (click)="choose(item)"
                  (mouseenter)="setActive(i)"
                  (focus)="setActive(i)"
                >
                  @if (item.icon) {
                    <span class="sirem-palette__icon-wrapper" aria-hidden="true">
                      <i [class]="item.icon"></i>
                    </span>
                  }
                  <div class="sirem-palette__content">
                    <div class="sirem-palette__title-row">
                      <span class="sirem-palette__label">{{ item.label }}</span>
                      @if (item.group) {
                        <span class="sirem-palette__group">{{ item.group }}</span>
                      }
                      @if (item.hint) {
                        <span class="sirem-palette__hint">{{ item.hint }}</span>
                      }
                    </div>
                    @if (item.description) {
                      <span class="sirem-palette__description">{{ item.description }}</span>
                    }
                  </div>
                </div>

                @if (item.subItems && item.subItems.length) {
                  <div
                    class="sirem-palette__subitems"
                    [class.sirem-palette__subitems--vertical]="item.subItemsLayout === 'vertical'"
                    [class.sirem-palette__subitems--horizontal]="item.subItemsLayout !== 'vertical'"
                    role="group"
                    [attr.aria-label]="'Sub-elementos de ' + item.label"
                  >
                    @for (sub of item.subItems; track sub.label + $index; let j = $index) {
                      <button
                        type="button"
                        class="sirem-palette__subitem"
                        [class.sirem-palette__subitem--active]="i === active() && j === activeSub()"
                        [attr.tabindex]="i === active() && j === activeSub() ? 0 : -1"
                        (click)="chooseSubItem(item, sub, $event)"
                        (mouseenter)="setSubActive(i, j)"
                        (focus)="setSubActive(i, j)"
                      >
                        @if (sub.icon) {
                          <i [class]="sub.icon" aria-hidden="true"></i>
                        }
                        <span>{{ sub.label }}</span>
                        @if (sub.hint) {
                          <span class="sirem-palette__subitem-hint">{{ sub.hint }}</span>
                        }
                      </button>
                    }
                  </div>
                }
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
  /** Entradas buscables (título, sección, icono, ruta, descripción, sub-ítems). */
  readonly items = input<SiremPaletteItem[]>([]);
  /** Texto de ejemplo del buscador. */
  readonly placeholder = input('Buscar pacientes, facturas, placas…');
  /** Controla la visibilidad de la paleta, con enlace de dos vías. */
  readonly open = model(false);
  /** Título opcional en la isla superior de título. */
  readonly title = input<string>('');
  /** Badges opcionales a mostrar. */
  readonly badges = input<SiremPaletteBadge[]>([]);
  /** Posición de los badges ('above-title' | 'above-input' | 'below-input'). */
  readonly badgePosition = input<SiremPaletteBadgePosition>('above-input');

  /** Se emite con la entrada elegida. */
  readonly selected = output<SiremPaletteItem>();
  /** Se emite cuando se elige específicamente un sub-ítem. */
  readonly subItemSelected = output<{ item: SiremPaletteItem; subItem: SiremPaletteSubItem }>();
  /** Se emite cada vez que se presiona o suelta una tecla en el buscador, junto con el query actual. */
  readonly keyAction = output<{ action: 'keydown' | 'keyup'; event: KeyboardEvent; query: string }>();

  readonly query = signal('');
  readonly active = signal(0);
  readonly activeSub = signal<number | null>(null);

  private readonly listRef = viewChild<ElementRef<HTMLElement>>('listContainer');

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.items();
    const list = q
      ? all.filter(
          (i) =>
            i.label.toLowerCase().includes(q) ||
            (i.description && i.description.toLowerCase().includes(q)) ||
            (i.group && i.group.toLowerCase().includes(q)) ||
            (i.subItems &&
              i.subItems.some(
                (s) =>
                  s.label.toLowerCase().includes(q) ||
                  (s.description && s.description.toLowerCase().includes(q)),
              )),
        )
      : all;
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

    const list = this.filtered();
    if (!list.length) return;

    const currentItem = list[this.active()];
    const subItems = currentItem?.subItems ?? [];
    const isVerticalSub = currentItem?.subItemsLayout === 'vertical';

    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (isVerticalSub && subItems.length) {
        if (this.activeSub() === null) {
          this.activeSub.set(0);
        } else if (this.activeSub()! < subItems.length - 1) {
          this.activeSub.update((s) => s! + 1);
        } else {
          this.active.update((i) => Math.min(i + 1, list.length - 1));
          this.activeSub.set(null);
        }
      } else {
        this.active.update((i) => Math.min(i + 1, list.length - 1));
        this.activeSub.set(null);
      }
      this.scrollActiveIntoView();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (isVerticalSub && subItems.length && this.activeSub() !== null) {
        if (this.activeSub()! > 0) {
          this.activeSub.update((s) => s! - 1);
        } else {
          this.activeSub.set(null);
        }
      } else {
        if (this.active() > 0) {
          const prevItem = list[this.active() - 1];
          this.active.update((i) => i - 1);
          if (prevItem?.subItemsLayout === 'vertical' && prevItem.subItems?.length) {
            this.activeSub.set(prevItem.subItems.length - 1);
          } else {
            this.activeSub.set(null);
          }
        }
      }
      this.scrollActiveIntoView();
    } else if (event.key === 'ArrowRight') {
      if (!isVerticalSub && subItems.length) {
        event.preventDefault();
        if (this.activeSub() === null) {
          this.activeSub.set(0);
        } else if (this.activeSub()! < subItems.length - 1) {
          this.activeSub.update((s) => s! + 1);
        }
        this.scrollActiveIntoView();
      }
    } else if (event.key === 'ArrowLeft') {
      if (!isVerticalSub && this.activeSub() !== null) {
        event.preventDefault();
        if (this.activeSub()! > 0) {
          this.activeSub.update((s) => s! - 1);
        } else {
          this.activeSub.set(null);
        }
        this.scrollActiveIntoView();
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.activeSub() !== null && subItems[this.activeSub()!]) {
        this.chooseSubItem(currentItem, subItems[this.activeSub()!]);
      } else if (currentItem) {
        this.choose(currentItem);
      }
    }
  }

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.active.set(0);
    this.activeSub.set(null);
    this.scrollActiveIntoView();
  }

  onInputKeydown(event: KeyboardEvent): void {
    this.keyAction.emit({ action: 'keydown', event, query: this.query() });
  }

  onInputKeyup(event: KeyboardEvent): void {
    this.keyAction.emit({ action: 'keyup', event, query: this.query() });
  }

  setActive(index: number): void {
    this.active.set(index);
    this.activeSub.set(null);
    this.scrollActiveIntoView();
  }

  setSubActive(itemIndex: number, subIndex: number): void {
    this.active.set(itemIndex);
    this.activeSub.set(subIndex);
    this.scrollActiveIntoView();
  }

  private scrollActiveIntoView(): void {
    if (typeof setTimeout === 'undefined') return;
    setTimeout(() => {
      const list = this.listRef()?.nativeElement;
      if (!list) return;
      const activeEl = list.querySelector(
        '.sirem-palette__subitem--active, .sirem-palette__option--active, .sirem-palette__entry[aria-selected="true"]',
      ) as HTMLElement | null;
      if (activeEl && typeof activeEl.scrollIntoView === 'function') {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }, 0);
  }

  choose(item: SiremPaletteItem): void {
    this.selected.emit(item);
    this.close();
  }

  chooseSubItem(item: SiremPaletteItem, subItem: SiremPaletteSubItem, event?: Event): void {
    event?.stopPropagation();
    this.subItemSelected.emit({ item, subItem });
    this.selected.emit({ ...item, selectedSubItem: subItem });
    this.close();
  }

  close(): void {
    this.open.set(false);
    this.query.set('');
    this.active.set(0);
    this.activeSub.set(null);
  }
}
