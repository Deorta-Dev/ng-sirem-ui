import { Component, input, model } from '@angular/core';
import { SiremSelectOption } from '../select/sirem-select';

/** Grupo de opciones excluyentes (tipo de persona, régimen…). */
@Component({
  selector: 'sirem-radio-group-field',
  standalone: true,
  styleUrl: './sirem-radio-group.scss',
  template: `
    <fieldset>
      @if (label()) {
        <legend class="sirem-radio__legend">
          {{ label() }}
          @if (required()) {
            <span class="sirem-field__required" aria-hidden="true">*</span>
          }
        </legend>
      }
      <div class="sirem-radio__options" [class.sirem-radio__options--vertical]="orientation() === 'vertical'" [class.sirem-radio__options--horizontal]="orientation() === 'horizontal'">
        @for (opt of options(); track opt.value) {
          <label class="sirem-radio__option">
            <input
              type="radio"
              [name]="groupName()"
              [value]="opt.value"
              [checked]="value() === opt.value"
              (change)="value.set(opt.value)"
              [disabled]="disabled()"
              class="sirem-radio__input"
            />
            {{ opt.label }}
          </label>
        }
      </div>
      @if (hint()) {
        <p class="sirem-field__hint">{{ hint() }}</p>
      }
    </fieldset>
  `,
})
export class SiremRadioGroup {
  /** Opción seleccionada, con enlace de dos vías. */
  readonly value = model<string | number | null>(null);
  /** Opciones del grupo (valor y texto). */
  readonly options = input<SiremSelectOption[]>([]);
  /** Título del grupo; se asocia al `fieldset` como leyenda. */
  readonly label = input('');
  /** Nota de ayuda bajo el grupo. */
  readonly hint = input('');
  /** Nombre compartido por los radios para agruparlos en el DOM. */
  readonly groupName = input('sirem-radio');
  /** `horizontal` (fila) o `vertical` (columna). */
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  /** Marca el campo como obligatorio (`aria-required` e indicador visual). */
  readonly required = input(false);
  /** Deshabilita todas las opciones. */
  readonly disabled = input(false);
}
