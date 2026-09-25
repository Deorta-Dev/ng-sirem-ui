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
  readonly checked = model(false);
  readonly label = input('');
  readonly description = input('');
  readonly disabled = input(false);
}
