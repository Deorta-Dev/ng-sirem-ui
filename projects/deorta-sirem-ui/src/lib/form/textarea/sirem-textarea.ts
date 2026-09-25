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
  readonly value = model<string | null>(null);
  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly rows = input(3);
  readonly required = input(false);
  readonly disabled = input(false);

  box(): string {
    return `sirem-field__box sirem-textarea${this.error() ? ' sirem-field__box--error' : ''}`;
  }

  onInput(event: Event): void {
    this.value.set((event.target as HTMLTextAreaElement).value);
  }
}
