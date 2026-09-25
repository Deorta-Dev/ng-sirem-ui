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
  readonly value = model<string | null>(null);
  readonly label = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly min = input<string | null>(null);
  readonly max = input<string | null>(null);
  readonly required = input(false);
  readonly disabled = input(false);

  box(): string {
    return `sirem-field__box sirem-datepicker${this.error() ? ' sirem-field__box--error' : ''}`;
  }

  onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value || null);
  }
}
