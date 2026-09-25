import { HttpClient, HttpParams } from '@angular/common/http';
import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { SiremSelectOption } from '../select/sirem-select';

export type SiremInputType = 'text' | 'number' | 'email' | 'password' | 'tel' | 'url';

/** Convierte cada elemento de `objects` en una opción del listado. */
export type SiremOptionsMapper = (item: unknown) => SiremSelectOption;

/**
 * Campo de texto con autocompletado integrado (doble vía con `[(value)]`).
 *
 * - Sin `options`: input normal.
 * - Con `options`: combobox con sugerencias (permite texto libre).
 * - Con `strictOptions` (alias `isStrict`): se comporta como **select**
 *   (solo admite valores de la lista).
 * - Con `multiple` (alias `isMultiple`): multi-selección con chips
 *   (`value` pasa a ser un array).
 * - Con `optionsEndpoint`: las opciones se descargan por HTTP (GET) esperando
 *   `{ objects: [...] }` (también acepta un array directo) + `optionsParams`
 *   como query params + `optionsMapper` para convertir cada elemento.
 *   Requiere `provideHttpClient()` en la app consumidora.
 * - Con `optionsResponsePath` (`"items"`, `"result.objects"`…): la lista se
 *   extrae navegando ese path dentro de la respuesta en vez de `objects`.
 * - Sin `optionsMapper`, el mapeo por defecto entiende
 *   `label/name/nombre/code/value/id` como etiqueta y
 *   `value/valor/id/code` como valor (p. ej. `{ nombre, valor }` directo).
 *
 * Uso:
 * ```html
 * <sirem-input-field label="EPS" [options]="eps" [(value)]="epsVal" />
 * <sirem-input-field label="Lentes" [options]="lentes" strictOptions [(value)]="lente" />
 * <sirem-input-field label="Diagnósticos" optionsEndpoint="choices/choice"
 *   [optionsParams]="{ fieldKey: 'diagnoses' }" [optionsMapper]="mapDx"
 *   strictOptions multiple [(value)]="dx" />
 * <sirem-input-field label="EPS" optionsEndpoint="/api/eps"
 *   optionsResponsePath="result.objects" strictOptions [(value)]="eps" />
 * ```
 */
@Component({
  selector: 'sirem-input-field',
  standalone: true,
  styleUrl: './sirem-input.scss',
  template: `
    <div class="sirem-field">
      @if (label()) {
        <span class="sirem-field__label" [id]="labelId()">
          {{ label() }}
          @if (required()) {
            <span class="sirem-field__required" aria-hidden="true">*</span>
          }
        </span>
      }

      @if (!hasList()) {
        <div class="sirem-input__wrap">
          @if (prefixIcon()) {
            <i [class]="prefixIcon() + ' sirem-input__prefix'" aria-hidden="true"></i>
          }
          <input
            [type]="type()"
            [value]="textValue()"
            (input)="onInput($event)"
            [placeholder]="placeholder()"
            [disabled]="disabled()"
            [readOnly]="readonly()"
            [required]="required()"
            [attr.min]="min() ?? null"
            [attr.max]="max() ?? null"
            [attr.aria-invalid]="!!error()"
            [attr.aria-labelledby]="label() ? labelId() : null"
            [attr.aria-describedby]="hintId()"
            [class]="boxClass()"
            [style.padding-left.rem]="padLeft()"
            [style.padding-right.rem]="padRight()"
          />
          @if (suffixIcon()) {
            <i [class]="suffixIcon() + ' sirem-input__suffix'" [style.right.rem]="0.75" aria-hidden="true"></i>
          }
        </div>
      } @else {
        <div class="sirem-input__combo">
          @if (multipleEffective()) {
            <div
              [class]="boxClass() + ' sirem-input__multi'"
              (click)="focusBox()"
            >
              @if (prefixIcon()) {
                <i [class]="prefixIcon() + ' sirem-input__prefix-inline'" aria-hidden="true"></i>
              }
              @for (chip of chips(); track chip.value) {
                <span class="sirem-input__chip">
                  {{ chip.label }}
                  <button
                    type="button"
                    (click)="removeChip(chip.value, $event)"
                    [disabled]="disabled()"
                    [attr.aria-label]="'Quitar ' + chip.label"
                    class="sirem-input__chip-x"
                  >
                    ✕
                  </button>
                </span>
              }
              <input
                #filterInput
                [value]="text()"
                (input)="onFilter($event)"
                (focus)="ensureOpen()"
                (keydown)="onKeydown($event)"
                (blur)="onBlur()"
                [placeholder]="chips().length ? '' : placeholder()"
                [disabled]="disabled()"
                [readOnly]="readonly()"
                role="combobox"
                aria-autocomplete="list"
                [attr.aria-expanded]="open()"
                [attr.aria-controls]="listId()"
                [attr.aria-labelledby]="label() ? labelId() : null"
                [attr.aria-invalid]="!!error()"
                [style.padding-left.rem]="padLeft()"
                class="sirem-input__filter"
              />
            </div>
          } @else {
            @if (prefixIcon()) {
              <i [class]="prefixIcon() + ' sirem-input__prefix'" aria-hidden="true"></i>
            }
            <input
              [type]="type()"
              [value]="text()"
              (input)="onFilter($event)"
              (focus)="ensureOpen()"
              (keydown)="onKeydown($event)"
              (blur)="onBlur()"
              [placeholder]="placeholder()"
              [disabled]="disabled()"
              [readOnly]="readonly()"
              [required]="required()"
              [attr.min]="min() ?? null"
              [attr.max]="max() ?? null"
              role="combobox"
              aria-autocomplete="list"
              [attr.aria-expanded]="open()"
              [attr.aria-controls]="listId()"
              [attr.aria-labelledby]="label() ? labelId() : null"
              [attr.aria-invalid]="!!error() || !!strictError()"
              [attr.aria-describedby]="hintId()"
              [class]="boxClass()"
              [style.padding-left.rem]="padLeft()"
              [style.padding-right.rem]="padRight()"
            />
            @if (showClear()) {
              <button
                type="button"
                (mousedown)="$event.preventDefault()"
                (click)="clear()"
                [disabled]="disabled()"
                aria-label="Quitar selección"
                title="Quitar selección"
                class="sirem-input__clear"
              >
                <i class="fi fi-rr-trash" aria-hidden="true"></i>
              </button>
            }
            @if (strictEffective()) {
              <span aria-hidden="true" class="sirem-input__chev">
                <i class="fi fi-rr-angle-small-down" aria-hidden="true"></i>
              </span>
            }
            @if (suffixIcon()) {
              <i
                [class]="suffixIcon() + ' sirem-input__suffix'"
                [style.right.rem]="suffixRight()"
                aria-hidden="true"
              ></i>
            }
          }

          @if (open()) {
            <div class="sirem-input__backdrop" (click)="close()" aria-hidden="true"></div>
            <ul
              role="listbox"
              [id]="listId()"
              [attr.aria-label]="label() || 'Opciones'"
              class="sirem-input__panel"
            >
              @if (loading()) {
                <li class="sirem-input__state" aria-disabled="true">Cargando opciones…</li>
              } @else if (remoteError()) {
                <li class="sirem-input__state sirem-input__state--error" aria-disabled="true">
                  {{ remoteError() }}
                </li>
              } @else {
                @for (opt of suggestions(); track opt.value; let i = $index) {
                  <li role="option" [id]="listId() + '-' + i" [attr.aria-selected]="isSelected(opt)">
                    <button
                      type="button"
                      (mousedown)="$event.preventDefault()"
                      (click)="choose(opt)"
                      (mouseenter)="active.set(i)"
                      class="sirem-input__option-btn"
                      [class.sirem-input__option-btn--active]="i === active()"
                    >
                      <span class="sirem-input__option-label">{{ opt.label }}</span>
                      @if (isSelected(opt)) {
                        <span class="sirem-input__check" aria-hidden="true">
                          <i class="fi fi-rr-check" aria-hidden="true"></i>
                        </span>
                      }
                    </button>
                  </li>
                } @empty {
                  <li class="sirem-input__state" aria-disabled="true">
                    @if (strictEffective()) {
                      Sin coincidencias.
                    } @else {
                      Pulsa Enter para usar “{{ text() }}”.
                    }
                  </li>
                }
              }
            </ul>
          }
        </div>
      }

      @if (error() || strictError()) {
        <span role="alert" class="sirem-field__error">
          {{ error() || strictError() }}
        </span>
      } @else if (hint()) {
        <span [id]="hintId()" class="sirem-field__hint">{{ hint() }}</span>
      }
    </div>
  `,
})
export class SiremInput {
  readonly value = model<string | number | (string | number)[] | null>(null);
  readonly type = input<SiremInputType>('text');
  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly min = input<number | null>(null);
  readonly max = input<number | null>(null);

  /** Opciones estáticas del autocompletado. */
  readonly options = input<SiremSelectOption[]>([]);
  /** URL GET que devuelve `{ objects: [...] }` (o un array directo). */
  readonly optionsEndpoint = input<string | null>(null);
  /** Alias de `optionsEndpoint`. */
  readonly endpointOptions = input<string | null>(null);
  /** Query params del endpoint. */
  readonly optionsParams = input<Record<string, unknown>>({});
  /** Alias de `optionsParams` (formato Lion: `optionsEndpointParams`). */
  readonly optionsEndpointParams = input<Record<string, unknown> | null>(null);
  /**
   * Ruta por puntos hasta el array dentro de la respuesta
   * (p. ej. `"items"`, `"result.objects"`, `"data.items"`).
   * Sin definir acepta un array directo o `{ objects: [...] }`.
   */
  readonly optionsResponsePath = input<string | null>(null);
  /** Convierte cada elemento remoto en `{ value, label }`. */
  readonly optionsMapper = input<SiremOptionsMapper | null>(null);
  /** Solo admite valores de la lista → se comporta como select. */
  readonly strictOptions = input(false, { transform: booleanAttribute });
  /** Alias de `strictOptions`. */
  readonly isStrict = input(false, { transform: booleanAttribute });
  /** Multi-selección con chips (`value` es un array). */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Alias de `multiple`. */
  readonly isMultiple = input(false, { transform: booleanAttribute });
  /** Icono inicial (clase `fi fi-rr-user`). Reserva espacio a la izquierda. */
  readonly prefixIcon = input('');
  /** Icono final (clase `fi fi-rr-eye`). Reserva espacio a la derecha. */
  readonly suffixIcon = input('');

  private readonly http = inject(HttpClient, { optional: true });
  private readonly filterBox = viewChild<ElementRef<HTMLInputElement>>('filterInput');

  readonly open = signal(false);
  readonly text = signal('');
  readonly active = signal(0);
  readonly loading = signal(false);
  readonly remoteError = signal('');
  readonly strictError = signal('');
  private readonly remote = signal<SiremSelectOption[]>([]);
  private loadedKey: string | null = null;

  readonly strictEffective = computed(() => this.strictOptions() || this.isStrict());
  readonly multipleEffective = computed(() => this.multiple() || this.isMultiple());
  readonly endpointEffective = computed(() => this.optionsEndpoint() ?? this.endpointOptions());
  readonly paramsEffective = computed(() => ({
    ...this.optionsParams(),
    ...(this.optionsEndpointParams() ?? {}),
  }));
  /** Ruta normalizada (`"result.objects"` → `["result", "objects"]`). */
  readonly pathEffective = computed(() =>
    (this.optionsResponsePath() ?? '')
      .split('.')
      .map((p) => p.trim())
      .filter(Boolean),
  );

  readonly hasList = computed(
    () => this.options().length > 0 || !!this.endpointEffective(),
  );

  private readonly allOptions = computed(() => [
    ...this.options(),
    ...this.remote().filter(
      (r) => !this.options().some((o) => String(o.value) === String(r.value)),
    ),
  ]);

  readonly suggestions = computed(() => {
    const q = this.text().trim().toLowerCase();
    return this.allOptions().filter((o) => !q || o.label.toLowerCase().includes(q)).slice(0, 50);
  });

  /** Texto del input simple (sin lista). */
  readonly textValue = computed(() => {
    const v = this.value();
    return Array.isArray(v) ? '' : (v ?? '');
  });

  readonly chips = computed(() => {
    const v = this.value();
    if (!Array.isArray(v)) return [];
    const all = this.allOptions();
    return v.map((val) => {
      const found = all.find((o) => String(o.value) === String(val));
      return { value: val, label: found ? found.label : String(val) };
    });
  });

  constructor() {
    const v = this.value();
    if (!Array.isArray(v) && v !== null && v !== undefined) {
      const found = this.options().find((o) => String(o.value) === String(v));
      this.text.set(found ? found.label : String(v));
    }
  }

  boxClass(): string {
    const invalid = !!(this.error() || this.strictError());
    const sizing = this.multipleEffective() ? 'sirem-input__multi' : 'sirem-input';
    return `sirem-field__box ${sizing}${invalid ? ' sirem-field__box--error' : ''}`;
  }

  /** ✕ lateral con valor: quita el texto/selección (estricto y autocompletado). */
  readonly showClear = computed(() => {
    if (this.multipleEffective() || this.disabled() || this.readonly()) return false;
    if (!this.hasList()) return false;
    const v = this.value();
    const hasValue = v !== null && v !== undefined && !(typeof v === 'string' && v === '');
    return hasValue || this.text().trim() !== '';
  });

  /** Reserva espacio a la derecha para ✕ y ▾ sin tapar el texto. */
  readonly padRight = computed<number | null>(() => {
    if (!this.hasList() || this.multipleEffective()) {
      return this.suffixIcon() ? 2.5 : null;
    }
    let slots = 0;
    if (this.strictEffective()) slots++;
    if (this.showClear()) slots++;
    if (this.suffixIcon()) slots++;
    return slots ? 0.75 + slots * 1.25 : null;
  });

  readonly padLeft = computed<number | null>(() => (this.prefixIcon() ? 2.5 : null));

  /** Posición del sufijo contando chevrón y ✕ previos desde el borde. */
  readonly suffixRight = computed(() => {
    let n = 0;
    if (!this.multipleEffective()) {
      if (this.strictEffective()) n++;
      if (this.showClear()) n++;
    }
    return 0.75 + n * 1.25;
  });

  clear(): void {
    this.value.set(null);
    this.text.set('');
    this.strictError.set('');
    this.close();
  }

  labelId(): string {
    return `lbl-${this.label().replace(/\W+/g, '-').toLowerCase() || 'field'}`;
  }

  hintId(): string {
    return `hint-${this.label().replace(/\W+/g, '-').toLowerCase() || 'field'}`;
  }

  listId(): string {
    return `${this.hintId()}-opts`;
  }

  // ---- entrada sin lista ----
  onInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    this.value.set(
      this.type() === 'number' ? (el.value === '' ? null : Number(el.value)) : el.value,
    );
  }

  // ---- combobox ----
  ensureOpen(): void {
    if (this.disabled() || this.readonly()) return;
    this.loadRemote();
    this.open.set(true);
    this.active.set(0);
  }

  close(): void {
    this.open.set(false);
  }

  focusBox(): void {
    this.ensureOpen();
    this.filterBox()?.nativeElement.focus();
  }

  onFilter(event: Event): void {
    this.text.set((event.target as HTMLInputElement).value);
    this.strictError.set('');
    this.ensureOpen();
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.open() && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      this.ensureOpen();
      event.preventDefault();
      return;
    }
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.active.update((i) => Math.min(i + 1, this.suggestions().length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.active.update((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const opt = this.suggestions()[this.active()];
      if (opt) this.choose(opt);
      else if (!this.strictEffective() && this.text().trim()) this.commitFree(this.text().trim());
      else if (this.strictEffective()) this.revertStrict();
    }
  }

  onBlur(): void {
    if (!this.open()) {
      if (this.strictEffective()) this.revertStrict();
      return;
    }
    // El backdrop cierra el panel; si se sale con Tab, valida estricto.
    setTimeout(() => {
      if (this.strictEffective()) this.revertStrict();
    });
  }

  choose(opt: SiremSelectOption): void {
    this.strictError.set('');
    if (this.multipleEffective()) {
      const current = Array.isArray(this.value()) ? [...(this.value() as (string | number)[])] : [];
      if (!current.some((v) => String(v) === String(opt.value))) current.push(opt.value);
      this.value.set(current);
      this.text.set('');
    } else {
      this.value.set(opt.value);
      this.text.set(opt.label);
    }
    this.close();
  }

  commitFree(raw: string): void {
    if (this.multipleEffective()) {
      const current = Array.isArray(this.value()) ? [...(this.value() as (string | number)[])] : [];
      if (!current.some((v) => String(v) === raw)) current.push(raw);
      this.value.set(current);
      this.text.set('');
    } else {
      this.value.set(this.type() === 'number' && raw !== '' ? Number(raw) : raw);
    }
    this.close();
  }

  removeChip(val: string | number, event: Event): void {
    event.stopPropagation();
    if (!Array.isArray(this.value())) return;
    this.value.set((this.value() as (string | number)[]).filter((v) => String(v) !== String(val)));
  }

  isSelected(opt: SiremSelectOption): boolean {
    const v = this.value();
    if (Array.isArray(v)) return v.some((x) => String(x) === String(opt.value));
    return v !== null && v !== undefined && String(v) === String(opt.value);
  }

  private revertStrict(): void {
    if (this.multipleEffective()) {
      this.text.set('');
      return;
    }
    const v = this.value();
    if (v === null || v === undefined || v === '') {
      this.text.set('');
      this.strictError.set('');
      return;
    }
    const found = this.allOptions().find((o) => String(o.value) === String(v));
    if (found) {
      this.text.set(found.label);
      this.strictError.set('');
    } else if (this.text().trim() !== '') {
      // Texto libre no permitido en modo estricto: se revierte.
      const byLabel = this.allOptions().find(
        (o) => o.label.toLowerCase() === this.text().trim().toLowerCase(),
      );
      if (byLabel) {
        this.value.set(byLabel.value);
        this.text.set(byLabel.label);
        this.strictError.set('');
      } else {
        this.value.set(null);
        this.text.set('');
        this.strictError.set('Selecciona una opción válida de la lista.');
      }
    }
  }

  private loadRemote(): void {
    const url = this.endpointEffective();
    if (!url || this.loading()) return;
    const key = url + JSON.stringify(this.paramsEffective());
    if (this.loadedKey === key) return;
    if (!this.http) {
      this.remoteError.set('HttpClient no disponible: agrega provideHttpClient().');
      return;
    }
    this.loading.set(true);
    this.remoteError.set('');
    let params = new HttpParams();
    for (const [k, v] of Object.entries(this.paramsEffective())) {
      if (v !== null && v !== undefined) params = params.set(k, String(v));
    }
    this.http.get<unknown>(url, { params }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.loadedKey = key;
        const list = resolveResponseList(res, this.pathEffective());
        if (!Array.isArray(list)) {
          this.remoteError.set('El endpoint debe devolver { objects: [...] }.');
          return;
        }
        const map = this.optionsMapper() ?? defaultMapper;
        const mapped = list.map((item) => {
          try {
            return map(item);
          } catch {
            return { value: String(item), label: String(item) };
          }
        });
        this.remote.set(mapped);
        // Si ya había un valor remoto seleccionado, muestra su etiqueta.
        if (!this.multipleEffective()) {
          const v = this.value();
          const found = mapped.find((o) => String(o.value) === String(v));
          if (found && this.text() === String(v ?? '')) this.text.set(found.label);
        }
      },
      error: () => {
        this.loading.set(false);
        this.remoteError.set('No se pudieron cargar las opciones.');
      },
    });
  }
}

function defaultMapper(item: unknown): SiremSelectOption {
  if (item && typeof item === 'object') {
    const o = item as Record<string, unknown>;
    const label =
      o['label'] ?? o['name'] ?? o['nombre'] ?? o['code'] ?? o['value'] ?? o['id'];
    const value = o['value'] ?? o['valor'] ?? o['id'] ?? o['code'] ?? label;
    return { value: String(value ?? ''), label: String(label ?? '') };
  }
  return { value: String(item), label: String(item) };
}

/**
 * Extrae el array de opciones de la respuesta: con `path` navega
 * por puntos (`"result.objects"`); sin path acepta un array directo
 * o `{ objects: [...] }`. Devuelve `null` si no hay array válido.
 */
function resolveResponseList(res: unknown, path: string[]): unknown {
  if (!path.length) {
    if (Array.isArray(res)) return res;
    return (res as { objects?: unknown } | null)?.objects ?? null;
  }
  let node: unknown = res;
  for (const key of path) {
    if (!node || typeof node !== 'object') return null;
    node = (node as Record<string, unknown>)[key];
  }
  return Array.isArray(node) ? node : null;
}
