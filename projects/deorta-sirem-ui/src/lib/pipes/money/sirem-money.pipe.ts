import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formatea un valor como moneda es-CO sin decimales.
 *
 * Uso: `{{ 250000 | siremMoney }}` → `$ 250.000`
 */
@Pipe({
  name: 'siremMoney',
  standalone: true,
})
export class SiremMoneyPipe implements PipeTransform {
  transform(value: number | string | null | undefined, currencyCode = 'COP'): string {
    const n = typeof value === 'string' ? Number(value) : (value ?? NaN);
    if (typeof n !== 'number' || Number.isNaN(n)) return '—';
    try {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return String(value ?? '—');
    }
  }
}
