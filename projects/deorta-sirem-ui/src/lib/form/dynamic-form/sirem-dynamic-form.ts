import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SiremButton } from '../../button/sirem-button';
import { SiremCheckbox } from '../checkbox/sirem-checkbox';
import { SiremDate } from '../date/sirem-date';
import { SiremImageUpload } from '../image-upload/sirem-image-upload';
import { SiremInput, SiremOptionsMapper } from '../input/sirem-input';
import { SiremRadioGroup } from '../radio-group/sirem-radio-group';
import { SiremSearchField } from '../search-field/sirem-search-field';
import { SiremSelectOption } from '../select/sirem-select';
import { SiremSwitch } from '../switch/sirem-switch';
import { SiremTextarea } from '../textarea/sirem-textarea';

export type SiremFieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'tel'
  | 'textarea'
  | 'select'
  | 'date'
  | 'switch'
  | 'checkbox'
  | 'radio'
  | 'image'
  | 'search';

export interface SiremFieldConfig {
  key: string;
  type: SiremFieldType;
  label?: string;
  placeholder?: string;
  hint?: string;
  /** Legado: columnas 1-12 (usar `column` en su lugar). */
  span?: number;
  /** Ancho estilo Lion: `["md-4"]`, `["md-6","lg-4"]`, `["md-12"]`… */
  column?: string[];
  required?: boolean;
  /** Alias Lion de `required`. */
  isRequired?: boolean;
  disabled?: boolean;
  /** Opciones estáticas (con `type: "text"` → autocompletado). */
  options?: SiremSelectOption[];
  /** Solo admite valores de la lista → se comporta como select. */
  strictOptions?: boolean;
  /** Alias de `strictOptions`. */
  isStrict?: boolean;
  /** Multi-selección con chips (`value` es un array). */
  multiple?: boolean;
  /** Alias de `multiple`. */
  isMultiple?: boolean;
  /** URL GET que devuelve `{ objects: [...] }`. */
  optionsEndpoint?: string;
  /** Alias de `optionsEndpoint`. */
  endpointOptions?: string;
  /** Query params del endpoint. */
  optionsParams?: Record<string, unknown>;
  /** Alias Lion: `optionsEndpointParams`. */
  optionsEndpointParams?: Record<string, unknown>;
  /** Convierte cada elemento remoto en `{ value, label }`. */
  optionsMapper?: SiremOptionsMapper;
  /** Icono inicial (clase `fi fi-rr-user`). */
  prefixIcon?: string;
  /** Icono final (clase `fi fi-rr-eye`). */
  suffixIcon?: string;
  rows?: number;
  min?: number | string;
  max?: number | string;
}

export interface SiremHtmlConfig {
  type: 'html';
  /** HTML de la celda/encabezado (se sanitiza al renderizar). */
  label: string;
}

export interface SiremGroupConfig {
  type: 'group';
  key?: string;
  label?: string;
  description?: string;
  column?: string[];
  children: SiremFormNode[];
}

export interface SiremTableConfig {
  type: 'table';
  key: string;
  column?: string[];
  /** Filas de celdas: encabezados `html` o campos (claves planas, admiten puntos). */
  tableChildren: SiremTableCell[][];
}

export type SiremTableCell = SiremFieldConfig | SiremHtmlConfig;
export type SiremFormNode = SiremFieldConfig | SiremGroupConfig | SiremTableConfig | SiremHtmlConfig;

/* Las clases sirem-col-* las genera sirem-dynamic-form.scss con @for. */
const COL_TOKEN = /^(sm|md|lg)-([1-9]|1[0-2])$|^([1-9]|1[0-2])$/;


/**
 * Formulario dinámico dirigido por configuración (equivale a `lo-form-dynamic`,
 * compatible con el JSON del form-builder de Lion).
 *
 * Nodos: campos, `group` (con `children`), `table` (con `tableChildren`:
 * celdas `html` o campos) y `html`. Las claves son planas y admiten puntos
 * (`"rx-use.esfera-od"`). Anchos con `column: ["md-4"]` (6 = mitad,
 * 12 = completa; en móvil todo ocupa 12).
 *
 * - `type: "text"` + `options` → autocompletado; + `strictOptions` → select;
 *   + `isMultiple` → multi-selección.
 * - `type: "select"` → `sirem-input-field` estricto (compatibilidad).
 * - `optionsEndpoint` (+ `optionsEndpointParams` + `optionsMapper`) →
 *   opciones remotas `{ objects: [...] }` (requiere `provideHttpClient()`).
 * - `[(values)]`: valores por `key`. `autosave`: `valueChanged` con antirrebote.
 */
@Component({
  selector: 'sirem-dynamic-form',
  standalone: true,
  styleUrl: './sirem-dynamic-form.scss',
  imports: [
    NgTemplateOutlet,
    SiremButton,
    SiremCheckbox,
    SiremDate,
    SiremImageUpload,
    SiremInput,
    SiremRadioGroup,
    SiremSearchField,
    SiremSwitch,
    SiremTextarea,
  ],
  template: `
    <form (submit)="onSubmit($event)" novalidate>
      <ng-container *ngTemplateOutlet="nodes; context: { $implicit: fields() }" />

      @if (showActions()) {
        <div class="sirem-form-actions">
          <sirem-button variant="secondary" (pressed)="cancelled.emit()">
            {{ cancelLabel() }}
          </sirem-button>
          <sirem-button variant="primary" [disabled]="!valid()" (pressed)="submit()">
            {{ submitLabel() }}
          </sirem-button>
        </div>
      }
    </form>

    <ng-template #nodes let-list>
      <div class="sirem-form-grid">
        @for (node of list; track $index) {
          <div [class]="colClass(node)">
            @if (isGroup(node)) {
              <section class="sirem-form-section">
                @if (node.label) {
                  <h3 class="sirem-form-section__title">{{ node.label }}</h3>
                }
                @if (node.description) {
                  <p class="sirem-form-section__description">{{ node.description }}</p>
                }
                <div class="sirem-form-section__body">
                  <ng-container *ngTemplateOutlet="nodes; context: { $implicit: node.children }" />
                </div>
              </section>
            } @else if (isTable(node)) {
              <div class="sirem-form-table-wrap">
                <table class="sirem-form-table">
                  @for (row of node.tableChildren; track $index) {
                    <tr class="sirem-form-table__row">
                      @for (cell of row; track $index) {
                        @if (isHtml(cell)) {
                          <th
                            [innerHTML]="safeHtml(cell)"
                            class="sirem-form-table__head"
                          ></th>
                        } @else {
                          <td class="sirem-form-table__cell">
                            <ng-container *ngTemplateOutlet="field; context: { $implicit: cell }" />
                          </td>
                        }
                      }
                    </tr>
                  }
                </table>
              </div>
            } @else if (isHtml(node)) {
              <div [innerHTML]="safeHtml(node)" class="sirem-form-html"></div>
            } @else {
              <ng-container *ngTemplateOutlet="field; context: { $implicit: node }" />
            }
          </div>
        }
      </div>
    </ng-template>

    <ng-template #field let-f>
      @switch (f.type) {
        @case ('textarea') {
          <sirem-textarea-field
            [label]="f.label ?? ''"
            [placeholder]="f.placeholder ?? ''"
            [hint]="f.hint ?? ''"
            [rows]="f.rows ?? 3"
            [required]="requiredOf(f)"
            [disabled]="!!f.disabled"
            [error]="errorOf(f)"
            [value]="textOf(f)"
            (valueChange)="setValue(f.key, $event)"
          />
        }
        @case ('date') {
          <sirem-date-field
            [label]="f.label ?? ''"
            [hint]="f.hint ?? ''"
            [min]="stringOrNull(f.min)"
            [max]="stringOrNull(f.max)"
            [required]="requiredOf(f)"
            [disabled]="!!f.disabled"
            [error]="errorOf(f)"
            [value]="textOrNull(f)"
            (valueChange)="setValue(f.key, $event)"
          />
        }
        @case ('switch') {
          <sirem-switch-field
            [label]="f.label ?? ''"
            [description]="f.hint ?? ''"
            [disabled]="!!f.disabled"
            [checked]="boolOf(f)"
            (checkedChange)="setValue(f.key, $event)"
          />
        }
        @case ('checkbox') {
          <sirem-checkbox-field
            [label]="f.label ?? ''"
            [description]="f.hint ?? ''"
            [required]="requiredOf(f)"
            [disabled]="!!f.disabled"
            [checked]="boolOf(f)"
            (checkedChange)="setValue(f.key, $event)"
          />
        }
        @case ('radio') {
          <sirem-radio-group-field
            [label]="f.label ?? ''"
            [hint]="f.hint ?? ''"
            [options]="f.options ?? []"
            [groupName]="'g-' + f.key"
            [required]="requiredOf(f)"
            [disabled]="!!f.disabled"
            [value]="optionOf(f)"
            (valueChange)="setValue(f.key, $event)"
          />
        }
        @case ('image') {
          <sirem-image-upload-field
            [label]="f.label ?? ''"
            [placeholder]="f.placeholder ?? 'Toca para subir una imagen'"
            [hint]="f.hint ?? ''"
            [required]="requiredOf(f)"
            [disabled]="!!f.disabled"
            [value]="textOrNull(f)"
            (valueChange)="setValue(f.key, $event)"
          />
        }
        @case ('search') {
          <sirem-search-field
            [label]="f.label ?? ''"
            [placeholder]="f.placeholder ?? 'Buscar…'"
            [disabled]="!!f.disabled"
            [error]="errorOf(f)"
            [value]="textOf(f)"
            (valueChange)="setValue(f.key, $event)"
          />
        }
        @default {
          <sirem-input-field
            [type]="inputType(f.type)"
            [label]="f.label ?? ''"
            [placeholder]="f.placeholder ?? ''"
            [hint]="f.hint ?? ''"
            [min]="numberOrNull(f.min)"
            [max]="numberOrNull(f.max)"
            [required]="requiredOf(f)"
            [disabled]="!!f.disabled"
            [error]="errorOf(f)"
            [options]="f.options ?? []"
            [optionsEndpoint]="endpointOf(f)"
            [optionsParams]="paramsOf(f)"
            [optionsMapper]="f.optionsMapper ?? null"
            [strictOptions]="strictOf(f)"
            [multiple]="multipleOf(f)"
            [prefixIcon]="f.prefixIcon ?? ''"
            [suffixIcon]="f.suffixIcon ?? ''"
            [value]="inputValue(f)"
            (valueChange)="setValue(f.key, $event)"
          />
        }
      }
    </ng-template>
  `,
})
export class SiremDynamicForm {
  readonly fields = input.required<SiremFormNode[]>();
  readonly values = model<Record<string, unknown>>({});
  /** Emite valores con ~400 ms de antirrebote (historias autoguardables). */
  readonly autosave = input(false);
  readonly showActions = input(true);
  readonly submitLabel = input('Guardar');
  readonly cancelLabel = input('Cancelar');

  readonly submitted = output<Record<string, unknown>>();
  readonly cancelled = output<void>();
  readonly valueChanged = output<Record<string, unknown>>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly attempted = signal(false);
  private debounce: ReturnType<typeof setTimeout> | null = null;

  private readonly leafFields = computed(() => collectLeaves(this.fields()));

  readonly valid = computed(() =>
    this.leafFields().every((f) => {
      if (!this.requiredOf(f)) return true;
      const v = this.values()[f.key];
      if (f.type === 'checkbox' || f.type === 'switch') return v === true;
      if (this.multipleOf(f)) return Array.isArray(v) && v.length > 0;
      return v !== null && v !== undefined && String(v).trim() !== '';
    }),
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.debounce) clearTimeout(this.debounce);
    });
  }

  // ---- tipos de nodo ----
  isGroup(node: SiremFormNode): node is SiremGroupConfig {
    return node.type === 'group';
  }

  isTable(node: SiremFormNode): node is SiremTableConfig {
    return node.type === 'table';
  }

  isHtml(node: SiremFormNode | SiremTableCell): node is SiremHtmlConfig {
    return node.type === 'html';
  }

  safeHtml(node: SiremHtmlConfig): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(node.label);
  }

  // ---- grilla ----
  colClass(node: SiremFormNode): string {
    const cols = (node as { column?: string[] }).column;
    if (cols?.length) {
      const mapped = cols
        .map((c) => c.trim().toLowerCase())
        .filter((c) => COL_TOKEN.test(c))
        .map((c) => `sirem-col-${c}`);
      if (mapped.length) {
        // Sin token base (p. ej. solo "md-4"): en móvil ocupa todo el ancho.
        const hasBase = mapped.some((c) => /sirem-col-\d+$/.test(c));
        return (hasBase ? '' : 'sirem-col-12 ') + mapped.join(' ');
      }
    }
    const span = (node as SiremFieldConfig).span;
    if (typeof span === 'number') {
      const n = Math.min(Math.max(Math.round(span), 1), 12);
      return n === 12 ? 'sirem-col-12' : `sirem-col-12 sirem-col-md-${n}`;
    }
    // Grupos y tablas ocupan todo el ancho; campos, la mitad en md+.
    if (node.type === 'group' || node.type === 'table') return 'sirem-col-12';
    return 'sirem-col-12 sirem-col-md-6';
  }

  // ---- normalización Lion ----
  requiredOf(f: SiremFieldConfig): boolean {
    return !!(f.required || f.isRequired);
  }

  strictOf(f: SiremFieldConfig): boolean {
    return !!(f.strictOptions || f.isStrict || f.type === 'select');
  }

  multipleOf(f: SiremFieldConfig): boolean {
    return !!(f.multiple || f.isMultiple);
  }

  endpointOf(f: SiremFieldConfig): string | null {
    return f.optionsEndpoint ?? f.endpointOptions ?? null;
  }

  paramsOf(f: SiremFieldConfig): Record<string, unknown> {
    return { ...(f.optionsParams ?? {}), ...(f.optionsEndpointParams ?? {}) };
  }

  errorOf(f: SiremFieldConfig): string {
    if (!this.attempted() || !this.requiredOf(f)) return '';
    const v = this.values()[f.key];
    const empty = Array.isArray(v)
      ? v.length === 0
      : v === null || v === undefined || String(v).trim() === '';
    return empty ? 'Este campo es obligatorio.' : '';
  }

  textOf(f: SiremFieldConfig): string {
    return String(this.values()[f.key] ?? '');
  }

  textOrNull(f: SiremFieldConfig): string | null {
    const v = this.values()[f.key];
    return typeof v === 'string' ? v : null;
  }

  scalarOf(f: SiremFieldConfig): string | number | null {
    const v = this.values()[f.key];
    return typeof v === 'string' || typeof v === 'number' ? v : null;
  }

  inputValue(f: SiremFieldConfig): string | number | (string | number)[] | null {
    if (this.multipleOf(f)) {
      const v = this.values()[f.key];
      return Array.isArray(v) ? (v as (string | number)[]) : null;
    }
    return this.scalarOf(f);
  }

  optionOf(f: SiremFieldConfig): string | number | null {
    const v = this.values()[f.key];
    return typeof v === 'string' || typeof v === 'number' ? v : null;
  }

  boolOf(f: SiremFieldConfig): boolean {
    return this.values()[f.key] === true;
  }

  stringOrNull(v: number | string | undefined): string | null {
    return v === undefined ? null : String(v);
  }

  numberOrNull(v: number | string | undefined): number | null {
    if (typeof v === 'number') return v;
    return null;
  }

  inputType(type: SiremFieldType): 'text' | 'number' | 'email' | 'password' | 'tel' {
    switch (type) {
      case 'number':
        return 'number';
      case 'email':
        return 'email';
      case 'password':
        return 'password';
      case 'tel':
        return 'tel';
      default:
        return 'text';
    }
  }

  setValue(key: string, value: unknown): void {
    this.values.update((vals) => ({ ...vals, [key]: value }));
    if (this.autosave()) {
      if (this.debounce) clearTimeout(this.debounce);
      this.debounce = setTimeout(() => this.valueChanged.emit(this.values()), 400);
    } else {
      this.valueChanged.emit(this.values());
    }
  }

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.submit();
  }

  submit(): void {
    this.attempted.set(true);
    if (this.valid()) this.submitted.emit(this.values());
  }
}

function collectLeaves(nodes: SiremFormNode[]): SiremFieldConfig[] {
  const out: SiremFieldConfig[] = [];
  for (const node of nodes) {
    if (node.type === 'group') {
      out.push(...collectLeaves(node.children ?? []));
    } else if (node.type === 'table') {
      for (const row of node.tableChildren ?? []) {
        for (const cell of row) {
          if (cell.type !== 'html') out.push(cell);
        }
      }
    } else if (node.type !== 'html') {
      out.push(node);
    }
  }
  return out;
}
