import { Component, input, model } from '@angular/core';

/** Casilla de verificación con etiqueta y descripción opcional. */
@Component({
  selector: 'sirem-checkbox-field',
  standalone: true,
  styleUrl: './sirem-checkbox.scss',
  template: `
    <label class="sirem-check">
      <input
        type="checkbox"
        [checked]="checked()"
        (change)="onChange($event)"
        [disabled]="disabled()"
        [required]="required()"
        [attr.aria-label]="label() || null"
        class="sirem-check__box"
      />
      <span>
        @if (label()) {
          <span class="sirem-check__label">{{ label() }}</span>
        }
        @if (description()) {
          <span class="sirem-check__description">{{ description() }}</span>
        }
      </span>
    </label>
  `,
})
export class SiremCheckbox {
  /** Estado marcado, con enlace de dos vías. */
  readonly checked = model(false);
  /** Texto de la casilla. */
  readonly label = input('');
  /** Línea secundaria bajo la etiqueta. */
  readonly description = input('');
  /** Marca el campo como obligatorio (`aria-required` e indicador visual). */
  readonly required = input(false);
  /** Deshabilita la casilla: no se puede marcar ni enfocar. */
  readonly disabled = input(false);

  onChange(event: Event): void {
    this.checked.set((event.target as HTMLInputElement).checked);
  }
}
