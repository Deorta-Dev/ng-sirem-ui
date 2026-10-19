import { Component, input, model } from '@angular/core';

/** Área de texto multilínea (observaciones, notas clínicas…). */
@Component({
  selector: 'sirem-textarea-field',
  standalone: true,
  styleUrl: './sirem-textarea.scss',
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
      <textarea
        [value]="value() ?? ''"
        (input)="onInput($event)"
        [placeholder]="placeholder()"
        [rows]="rows()"
        [disabled]="disabled()"
        [required]="required()"
        [attr.aria-invalid]="!!error()"
        [class]="box()"
      ></textarea>
      @if (error()) {
        <span role="alert" class="sirem-field__error">{{ error() }}</span>
      } @else if (hint()) {
        <span class="sirem-field__hint">{{ hint() }}</span>
      }
    </label>
  `,
})
export class SiremTextarea {
  /** Texto del área, con enlace de dos vías. */
  readonly value = model<string | null>(null);
  /** Etiqueta visible sobre el control. */
  readonly label = input('');
  /** Texto de ayuda que aparece mientras el campo está vacío. */
  readonly placeholder = input('');
  /** Nota de ayuda bajo el campo; la sustituye `error` cuando lo hay. */
  readonly hint = input('');
  /** Mensaje de error. Con texto, el campo se marca en rojo y se anuncia. */
  readonly error = input('');
  /** Número de líneas visibles (alto inicial). */
  readonly rows = input(3);
  /** Marca el campo como obligatorio (`aria-required` e indicador visual). */
  readonly required = input(false);
  /** Deshabilita el control: no se puede enfocar ni editar. */
  readonly disabled = input(false);

  box(): string {
    return `sirem-field__box sirem-textarea${this.error() ? ' sirem-field__box--error' : ''}`;
  }

  onInput(event: Event): void {
    this.value.set((event.target as HTMLTextAreaElement).value);
  }
}
