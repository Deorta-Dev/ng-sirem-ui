import { Component, computed, inject, input, model, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/** Opción elegible (permiso, rol, característica…). */
export interface SiremMultiSelectOption {
  value: string | number;
  label: string;
  hint?: string;
  /** Clase CSS del icono (p. ej. `fi fi-rr-eye`). */
  icon?: string;
  /** SVG inline (duotone / streamline). Prioridad sobre `icon`. */
  svg?: string;
  /** Grupo al que pertenece (para agrupar y buscar). */
  group?: string;
  disabled?: boolean;
}

/**
 * Selector de opciones múltiples con buscador, grupos e iconos.
 * Ideal para características, permisos y roles.
 *
 * Uso:
 * ```html
 * <sirem-multi-select label="Permisos" [options]="permisos" [(value)]="sel" />
 * <!-- [{ value: 'citas.crear', label: 'Crear citas', group: 'Agenda', icon: 'fi fi-rr-plus' }] -->
 * ```
 */
@Component({
  selector: 'sirem-multi-select',
  standalone: true,
  styleUrl: './sirem-multi-select.scss',
  template: `
    <div class="sirem-multi">
      @if (label()) {
        <label class="sirem-multi__label">{{ label() }}</label>
      }
      <div class="sirem-multi__search">
        <i class="fi fi-rr-search sirem-multi__search-icon" aria-hidden="true"></i>
        <input
          type="search"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
          [placeholder]="searchPlaceholder()"
          [disabled]="disabled()"
          [attr.aria-label]="searchPlaceholder()"
          class="sirem-multi__search-input"
        />
        @if (query()) {
          <button
            type="button"
            (click)="query.set('')"
            aria-label="Limpiar búsqueda"
            class="sirem-multi__clear"
          >
            ✕
          </button>
        }
      </div>

      <div class="sirem-multi__head">
        <span class="sirem-multi__count" role="status">
          {{ value().length }} de {{ options().length }} seleccionadas
        </span>
        @if (selectAll()) {
          <button
            type="button"
            (click)="toggleAll()"
            [disabled]="disabled() || !selectable().length"
            class="sirem-multi__all"
          >
            {{ allSelected() ? 'Quitar todas' : 'Elegir todas' }}
          </button>
        }
      </div>

      <div class="sirem-multi__list" [style.max-height.px]="maxHeight()" role="group" [attr.aria-label]="label() || 'Opciones'">
        @for (group of visibleGroups(); track group.name) {
          @if (group.name) {
            <p class="sirem-multi__group">{{ group.name }}</p>
          }
          @for (opt of group.options; track opt.value) {
            <label class="sirem-multi__option" [class.sirem-multi__option--disabled]="opt.disabled || disabled()">
              <input
                type="checkbox"
                [checked]="isChecked(opt.value)"
                [disabled]="opt.disabled || disabled()"
                (change)="toggle(opt)"
                class="sirem-multi__check"
              />
              @if (opt.svg) {
                <span class="sirem-multi__icon" [innerHTML]="safeSvg(opt.svg)" aria-hidden="true"></span>
              } @else if (opt.icon) {
                <i [class]="opt.icon + ' sirem-multi__icon'" aria-hidden="true"></i>
              }
              <span class="sirem-multi__texts">
                <span class="sirem-multi__option-label">{{ opt.label }}</span>
                @if (opt.hint) {
                  <span class="sirem-multi__hint">{{ opt.hint }}</span>
                }
              </span>
            </label>
          }
        } @empty {
          <p class="sirem-multi__empty">{{ emptyText() }}</p>
        }
      </div>

      @if (error()) {
        <span role="alert" class="sirem-multi__error">{{ error() }}</span>
      } @else if (hint()) {
        <span class="sirem-multi__foot">{{ hint() }}</span>
      }
    </div>
  `,
})
export class SiremMultiSelect {
  readonly options = input.required<SiremMultiSelectOption[]>();
  /** Valores seleccionados (doble vía). */
  readonly value = model<(string | number)[]>([]);
  readonly label = input('');
  readonly searchPlaceholder = input('Buscar opciones…');
  readonly emptyText = input('Sin coincidencias.');
  readonly hint = input('');
  readonly error = input('');
  readonly disabled = input(false);
  /** Muestra el botón elegir/quitar todas. */
  readonly selectAll = input(true);
  /** Alto máximo de la lista con scroll. */
  readonly maxHeight = input(280);
  /** Título para el grupo sin grupo. */
  readonly ungroupedTitle = input('');

  readonly query = signal('');

  private readonly sanitizer = inject(DomSanitizer);

  safeSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  readonly selectable = computed(() =>
    this.options().filter((o) => !o.disabled),
  );

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.options();
    return this.options().filter((o) =>
      `${o.label} ${o.hint ?? ''} ${o.group ?? ''}`.toLowerCase().includes(q),
    );
  });

  readonly visibleGroups = computed(() => {
    const groups = new Map<string, SiremMultiSelectOption[]>();
    for (const opt of this.filtered()) {
      const key = opt.group ?? '';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(opt);
    }
    return [...groups.entries()].map(([name, options]) => ({
      name: name || this.ungroupedTitle(),
      options,
    }));
  });

  readonly allSelected = computed(() => {
    const sel = new Set(this.value().map(String));
    const avail = this.selectable();
    return avail.length > 0 && avail.every((o) => sel.has(String(o.value)));
  });

  isChecked(value: string | number): boolean {
    return this.value().some((v) => String(v) === String(value));
  }

  toggle(opt: SiremMultiSelectOption): void {
    if (opt.disabled || this.disabled()) return;
    this.value.update((sel) =>
      sel.some((v) => String(v) === String(opt.value))
        ? sel.filter((v) => String(v) !== String(opt.value))
        : [...sel, opt.value],
    );
  }

  toggleAll(): void {
    if (this.disabled()) return;
    if (this.allSelected()) {
      const avail = new Set(this.selectable().map((o) => String(o.value)));
      this.value.update((sel) => sel.filter((v) => !avail.has(String(v))));
    } else {
      const sel = new Set(this.value().map(String));
      for (const o of this.selectable()) sel.add(String(o.value));
      const byKey = new Map(this.options().map((o) => [String(o.value), o.value]));
      this.value.set([...sel].map((k) => byKey.get(k) ?? k));
    }
  }
}
