import { Component, input, model } from '@angular/core';

/** Selector de fecha (citas, nacimiento, vencimientos…). Valor ISO `yyyy-MM-dd`. */
@Component({
  selector: 'sirem-datepicker-field',
  standalone: true,
  styleUrl: './sirem-datepicker.scss',
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
      <input
        type="date"
        [value]="value() ?? ''"
        (input)="onInput($event)"
        [disabled]="disabled()"
        [required]="required()"
        [attr.min]="min() ?? null"
        [attr.max]="max() ?? null"
        [attr.aria-invalid]="!!error()"
        [class]="box()"
      />
      @if (error()) {
        <span role="alert" class="sirem-field__error">{{ error() }}</span>
      } @else if (hint()) {
        <span class="sirem-field__hint">{{ hint() }}</span>
      }
    </label>
  `,
})
export class SiremDatepicker {
  /** Fecha elegida en ISO `yyyy-MM-dd`, con enlace de dos vías. */
  readonly value = model<string | null>(null);
  /** Etiqueta visible sobre el control. */
  readonly label = input('');
  /** Nota de ayuda bajo el campo; la sustituye `error` cuando lo hay. */
  readonly hint = input('');
  /** Mensaje de error. Con texto, el campo se marca en rojo y se anuncia. */
  readonly error = input('');
  /** Fecha mínima seleccionable, en ISO `yyyy-MM-dd`. */
  readonly min = input<string | null>(null);
  /** Fecha máxima seleccionable, en ISO `yyyy-MM-dd`. */
  readonly max = input<string | null>(null);
  /** Marca el campo como obligatorio (`aria-required` e indicador visual). */
  readonly required = input(false);
  /** Deshabilita el control: no se puede enfocar ni editar. */
  readonly disabled = input(false);

  box(): string {
    return `sirem-field__box sirem-datepicker${this.error() ? ' sirem-field__box--error' : ''}`;
  }

  onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value || null);
  }
}
