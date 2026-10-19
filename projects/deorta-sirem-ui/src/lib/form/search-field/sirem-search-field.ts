import { Component, input, model } from '@angular/core';

/** Campo de búsqueda con lupa y botón limpiar (filtros de listados). */
@Component({
  selector: 'sirem-search-field',
  standalone: true,
  styleUrl: './sirem-search-field.scss',
  template: `
    <label class="sirem-field">
      @if (label()) {
        <span class="sirem-field__label">{{ label() }}</span>
      }
      <span class="sirem-search__wrap">
        <span aria-hidden="true" class="sirem-search__icon">
          <i class="fi fi-rr-search" aria-hidden="true"></i>
        </span>
        <input
          type="search"
          role="searchbox"
          [value]="value()"
          (input)="onInput($event)"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [attr.aria-label]="label() || placeholder()"
          [attr.aria-invalid]="!!error()"
          [class]="box()"
        />
        @if (value()) {
          <button
            type="button"
            (click)="value.set('')"
            aria-label="Limpiar búsqueda"
            class="sirem-search__clear"
          >
            <i class="fi fi-rr-trash" aria-hidden="true"></i>
          </button>
        }
      </span>
      @if (error()) {
        <span role="alert" class="sirem-field__error">{{ error() }}</span>
      }
    </label>
  `,
})
export class SiremSearchField {
  /** Texto de búsqueda, con enlace de dos vías. */
  readonly value = model<string>('');
  /** Etiqueta del buscador (a menudo solo accesible). */
  readonly label = input('');
  /** Texto de ejemplo dentro del campo. */
  readonly placeholder = input('Buscar…');
  /** Deshabilita el control: no se puede enfocar ni editar. */
  readonly disabled = input(false);
  /** Mensaje de error. Con texto, el campo se marca en rojo y se anuncia. */
  readonly error = input('');

  box(): string {
    return `sirem-field__box sirem-search${this.error() ? ' sirem-field__box--error' : ''}`;
  }

  onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
