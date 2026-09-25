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
  readonly value = model<string | number | null>(null);
  readonly options = input<SiremSelectOption[]>([]);
  readonly label = input('');
  readonly hint = input('');
  readonly groupName = input('sirem-radio');
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly required = input(false);
  readonly disabled = input(false);
}
