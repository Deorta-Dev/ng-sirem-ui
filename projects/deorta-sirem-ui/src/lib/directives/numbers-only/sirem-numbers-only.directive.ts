import { Directive, ElementRef, booleanAttribute, inject, input } from '@angular/core';

/**
 * Restringe un `<input>` a dígitos (opcionalmente un decimal).
 * Útil para documentos, teléfonos y valores numéricos.
 *
 * Uso:
 * ```html
 * <input siremNumbersOnly [(ngModel)]="doc" />
 * <input siremNumbersOnly siremNumbersAllowDecimal [(ngModel)]="peso" />
 * ```
 */
@Directive({
  selector: 'input[siremNumbersOnly]',
  standalone: true,
  host: {
    '(input)': 'onInput($event)',
  },
})
export class SiremNumbersOnlyDirective {
  /** Permite un punto decimal (defecto false). */
  readonly siremNumbersAllowDecimal = input(false, { transform: booleanAttribute });

  private readonly el = inject(ElementRef<HTMLInputElement>);

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const clean = this.sanitize(input.value);
    if (clean !== input.value) {
      input.value = clean;
      input.dispatchEvent(new Event('input'));
    }
  }

  sanitize(raw: string): string {
    if (this.siremNumbersAllowDecimal()) {
      const neg = raw.startsWith('-');
      const parts = raw.replace(/[^0-9.]/g, '').split('.');
      const head = parts.shift() ?? '';
      const tail = parts.join('').slice(0, 2);
      return `${neg ? '-' : ''}${head}${parts.length || tail ? '.' : ''}${tail}`;
    }
    return raw.replace(/[^0-9]/g, '');
  }
}
