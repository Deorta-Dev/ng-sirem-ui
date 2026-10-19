import { Component, input, model } from '@angular/core';

/** Interruptor booleano (sincronización Xubio, estado activo…). */
@Component({
  selector: 'sirem-switch-field',
  standalone: true,
  styleUrl: './sirem-switch.scss',
  template: `
    <label class="sirem-switch">
      <button
        type="button"
        role="switch"
        [attr.aria-checked]="checked()"
        [attr.aria-label]="label() || 'Interruptor'"
        [disabled]="disabled()"
        (click)="checked.set(!checked())"
        class="sirem-switch__track"
        [class.sirem-switch__track--on]="checked()"
      >
        <span
          class="sirem-switch__thumb"
          aria-hidden="true"
        ></span>
      </button>
      <span>
        @if (label()) {
          <span class="sirem-switch__label">{{ label() }}</span>
        }
        @if (description()) {
          <span class="sirem-switch__description">{{ description() }}</span>
        }
      </span>
    </label>
  `,
})
export class SiremSwitch {
  /** Estado activado, con enlace de dos vías. */
  readonly checked = model(false);
  /** Texto del interruptor. */
  readonly label = input('');
  /** Línea secundaria bajo la etiqueta. */
  readonly description = input('');
  /** Deshabilita el interruptor. */
  readonly disabled = input(false);
}
