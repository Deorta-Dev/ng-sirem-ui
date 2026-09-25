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
  readonly checked = model(false);
  readonly label = input('');
  readonly description = input('');
  readonly required = input(false);
  readonly disabled = input(false);

  onChange(event: Event): void {
    this.checked.set((event.target as HTMLInputElement).checked);
  }
}
