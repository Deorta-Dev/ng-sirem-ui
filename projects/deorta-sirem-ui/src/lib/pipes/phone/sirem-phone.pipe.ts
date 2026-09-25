import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formatea un teléfono colombiano de 10 dígitos en bloques 3-3-4.
 *
 * Uso: `{{ '3001112233' | siremPhone }}` → `300 111 2233`
 */
@Pipe({
  name: 'siremPhone',
  standalone: true,
})
export class SiremPhonePipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    const digits = String(value ?? '').replace(/[^0-9]/g, '');
    if (digits.length !== 10) return String(value ?? '—');
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
}
