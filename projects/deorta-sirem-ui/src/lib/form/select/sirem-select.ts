import { Component, input, model } from '@angular/core';

export interface SiremSelectOption {
  value: string | number;
  label: string;
}

/** Selector desplegable (especialidad, estado civil, tipo de documento…). */
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
  readonly value = model<string | number | null>(null);
  readonly options = input<SiremSelectOption[]>([]);
  readonly label = input('');
  readonly placeholder = input('Seleccionar…');
  readonly hint = input('');
  readonly error = input('');
  readonly required = input(false);
  readonly disabled = input(false);

  box(): string {
    return `sirem-field__box sirem-select${this.error() ? ' sirem-field__box--error' : ''}`;
  }

  onChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.value.set(v === '' ? null : v);
  }
}
