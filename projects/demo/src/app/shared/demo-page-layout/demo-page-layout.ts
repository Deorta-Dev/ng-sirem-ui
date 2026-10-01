import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoGlossary } from '../demo-glossary/demo-glossary';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

/**
 * Layout de página demo: header del catálogo + contenido.
 * El preview aislado vive dentro de cada `app-demo-variant-card`
 * (marco estilo iframe con solo el componente).
 * Al final incluye siempre el glosario de API, resuelto por el slug de la ruta.
 */
@Component({
  selector: 'app-demo-page-layout',
  standalone: true,
  imports: [RouterLink, ThemeToggle, DemoGlossary],
  template: `
    <div class="min-h-screen" style="background: var(--sirem-page-bg)">
      <header
        class="sticky top-0 z-30 border-b"
        style="
          border-color: var(--sirem-border-soft);
          background: var(--sirem-surface-glass-strong);
          backdrop-filter: blur(18px) saturate(1.4);
          -webkit-backdrop-filter: blur(18px) saturate(1.4);
        "
      >
        <div class="flex items-center gap-3 px-4 py-3 md:px-8">
          <a
            routerLink="/"
            class="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
          >
            ← Catálogo
          </a>
          <span class="text-slate-300">/</span>
          <span class="text-sm text-slate-500">{{ category() }}</span>
          <span class="ml-auto"><app-theme-toggle /></span>
        </div>
      </header>
      <main class="px-4 py-8 md:px-8">
        <h1 class="text-2xl font-extrabold text-slate-900">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="mt-1 text-sm text-slate-600">{{ subtitle() }}</p>
        }
        <div class="mt-6">
          <ng-content />
        </div>
      </main>

      <app-demo-glossary />
    </div>
  `,
})
export class DemoPageLayout {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly category = input<string>('');
}
