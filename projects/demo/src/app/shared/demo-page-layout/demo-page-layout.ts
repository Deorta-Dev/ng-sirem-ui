import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

/**
 * Layout de página demo: header del catálogo + contenido.
 * El preview aislado vive dentro de cada `app-demo-variant-card`
 * (marco estilo iframe con solo el componente).
 */
@Component({
  selector: 'app-demo-page-layout',
  standalone: true,
  imports: [RouterLink, ThemeToggle],
  template: `
    <div class="min-h-screen bg-slate-100">
      <header class="border-b border-slate-200 bg-white">
        <div class="flex items-center gap-3 px-4 md:px-8 py-3">
          <a routerLink="/" class="text-sm font-semibold text-slate-600 hover:text-slate-900">← Catálogo</a>
          <span class="text-slate-300">/</span>
          <span class="text-sm text-slate-500">{{ category() }}</span>
          <span class="ml-auto"><app-theme-toggle /></span>
        </div>
      </header>
      <main class="px-4 md:px-8 py-8">
        <h1 class="text-2xl font-extrabold text-slate-900">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="mt-1 text-sm text-slate-600">{{ subtitle() }}</p>
        }
        <div class="mt-6">
          <ng-content />
        </div>
      </main>
    </div>
  `,
})
export class DemoPageLayout {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly category = input<string>('');
}
