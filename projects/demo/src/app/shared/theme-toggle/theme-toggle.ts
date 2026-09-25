import { Component } from '@angular/core';
import { themeMode, toggleTheme } from '../theme/theme';

/**
 * Interruptor light/dark de la demo. Persiste en localStorage
 * (`sirem-theme`) y fija `document.documentElement.dataset.theme`.
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button
      type="button"
      (click)="toggle()"
      [attr.aria-label]="isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      [attr.title]="isDark() ? 'Modo claro' : 'Modo oscuro'"
      class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >
      {{ isDark() ? '☀ Claro' : '☾ Oscuro' }}
    </button>
  `,
})
export class ThemeToggle {
  isDark() {
    return themeMode() === 'dark';
  }

  toggle(): void {
    toggleTheme();
  }
}
