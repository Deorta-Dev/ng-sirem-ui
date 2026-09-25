import { Pipe, PipeTransform } from '@angular/core';

/**
 * Calcula la edad en años desde una fecha de nacimiento ISO.
 *
 * Uso: `{{ '1990-05-01' | siremAge }}` → `35 años`
 */
@Pipe({
  name: 'siremAge',
  standalone: true,
})
export class SiremAgePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    const d = value instanceof Date ? value : new Date(String(value ?? ''));
    if (!value || Number.isNaN(d.getTime())) return '—';
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    if (age < 0) return '—';
    return `${age} ${age === 1 ? 'año' : 'años'}`;
  }
}
