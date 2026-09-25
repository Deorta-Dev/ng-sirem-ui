import { signal } from '@angular/core';

export type SiremThemeMode = 'light' | 'dark';

const KEY = 'sirem-theme';

function initial(): SiremThemeMode {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    /* storage no disponible */
  }
  return document.documentElement.dataset['theme'] === 'dark' ? 'dark' : 'light';
}

/** Tema actual de la demo (persistido en localStorage). */
export const themeMode = signal<SiremThemeMode>(
  typeof document === 'undefined' ? 'light' : initial(),
);

function apply(mode: SiremThemeMode): void {
  document.documentElement.dataset['theme'] = mode;
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* storage no disponible */
  }
}

// Aplica el tema guardado en cuanto carga el módulo (evita parpadeo).
if (typeof document !== 'undefined') apply(themeMode());

export function setTheme(mode: SiremThemeMode): void {
  themeMode.set(mode);
  apply(mode);
}

export function toggleTheme(): void {
  setTheme(themeMode() === 'dark' ? 'light' : 'dark');
}
