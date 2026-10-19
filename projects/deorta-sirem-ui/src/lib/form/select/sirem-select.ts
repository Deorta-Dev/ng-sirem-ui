import { Component, input, model } from '@angular/core';

/** Opción de un desplegable: valor interno y texto visible. */
export interface SiremSelectOption {
  value: string | number;
  label: string;
}

/**
 * Selector desplegable (especialidad, estado civil, tipo de documento…)
 * sobre un `<select>` nativo.
 *
 * Alternativa recomendada: `sirem-input-field` con `[strictOptions]="true"`
 * comparte el look & feel del resto de campos, filtra al escribir y admite
 * opciones remotas. Mantén `sirem-select-field` cuando necesites el control
 * nativo (envío de formulario sin JS o teclado/selector del sistema).
 *
 * ```html
 * <sirem-select-field label="EPS" [options]="eps" [(value)]="epsSel" />
 * <sirem-input-field label="EPS" [options]="eps" [strictOptions]="true" [(value)]="epsSel" />
 * ```
 */
@Component({
  selector: 'sirem-select-field',
  standalone: true,
  styleUrl: './sirem-select.scss',
  template: `
    <label class="sirem-field">
      @if (label()) {
        <span class="sirem-field__label">
          {{ label() }}
          @if (required()) {
            <span class="sirem-field__required" aria-hidden="true">*</span>
          }
        </span>
      }
      <select
        [value]="value() ?? ''"
        (change)="onChange($event)"
        [disabled]="disabled()"
        [required]="required()"
        [attr.aria-invalid]="!!error()"
        [class]="box()"
      >
        <option value="" disabled>{{ placeholder() }}</option>
        @for (opt of options(); track opt.value) {
          <option [value]="opt.value">{{ opt.label }}</option>
        }
      </select>
      @if (error()) {
        <span role="alert" class="sirem-field__error">{{ error() }}</span>
      } @else if (hint()) {
        <span class="sirem-field__hint">{{ hint() }}</span>
      }
    </label>
  `,
})
export class SiremSelect {
  /** Valor seleccionado, con enlace de dos vías. */
  readonly value = model<string | number | null>(null);
  /** Opciones del desplegable (valor y texto). */
  readonly options = input<SiremSelectOption[]>([]);
  /** Etiqueta visible sobre el control. */
  readonly label = input('');
  /** Texto que se muestra mientras no hay selección. */
  readonly placeholder = input('Seleccionar…');
  /** Nota de ayuda bajo el campo; la sustituye `error` cuando lo hay. */
  readonly hint = input('');
  /** Mensaje de error. Con texto, el campo se marca en rojo y se anuncia. */
  readonly error = input('');
  /** Marca el campo como obligatorio (`aria-required` e indicador visual). */
  readonly required = input(false);
  /** Deshabilita el control: no se puede enfocar ni editar. */
  readonly disabled = input(false);

  box(): string {
    return `sirem-field__box sirem-select${this.error() ? ' sirem-field__box--error' : ''}`;
  }

  onChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.value.set(v === '' ? null : v);
  }
}
