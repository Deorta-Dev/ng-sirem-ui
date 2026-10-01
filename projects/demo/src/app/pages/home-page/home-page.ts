import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATALOG, SECTIONS, sectionOf } from '../../data/catalog';
import { ThemeToggle } from '../../shared/theme-toggle/theme-toggle';

/**
 * Índice del catálogo SIREM UI agrupado en 5 secciones
 * (componentes, directivas, pipes, interceptores, páginas).
 */
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, ThemeToggle],
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
        <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-5 md:px-8">
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900">SIREM UI — Catálogo</h1>
            <p class="mt-1 text-sm text-slate-600">
              {{ total() }} demos · variantes en Card + marco estilo Iframe + CodeMirror HTML/TS.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <input
              type="search"
              placeholder="Filtrar…"
              [value]="filter()"
              (input)="filter.set($any($event.target).value)"
              class="w-64 border px-3 py-2 text-sm outline-none transition focus-visible:ring-2"
              style="
                border-radius: var(--sirem-radius-md);
                border-color: var(--sirem-border);
                background: var(--sirem-surface);
                color: var(--sirem-text);
              "
              aria-label="Filtrar componentes"
            />
            <app-theme-toggle />
          </div>
        </div>
      </header>
      <main class="px-4 py-8 md:px-8">
        @for (sec of sections(); track sec.id) {
          @if (bySection(sec.id).length) {
            <h2 class="mb-1 mt-10 text-lg font-extrabold text-slate-900">{{ sec.title }}</h2>
            <p class="mb-3 text-sm text-slate-500">{{ sec.hint }}</p>
            @for (cat of categoriesOf(sec.id); track cat) {
              @if (showCategoryLabel(sec.id)) {
                <h3 class="mb-3 mt-6 text-sm font-bold uppercase tracking-widest text-slate-500">
                  {{ cat }}
                </h3>
              }
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                @for (c of bySectionCategory(sec.id, cat); track c.slug) {
                  <a
                    [routerLink]="['/demo', c.slug]"
                    class="group border p-5 transition hover:-translate-y-0.5"
                    style="
                      border-radius: var(--sirem-radius-lg);
                      border-color: var(--sirem-border-soft);
                      background: var(--sirem-surface);
                      box-shadow: var(--sirem-shadow-xs);
                    "
                  >
                    <p class="font-mono text-xs text-slate-400">{{ c.selector }}</p>
                    <h4 class="mt-1 text-base font-bold text-slate-900 group-hover:underline">
                      {{ c.name }}
                    </h4>
                    <p class="mt-1 text-sm text-slate-600">{{ c.description }}</p>
                    <span
                      class="mt-3 inline-block text-sm font-semibold"
                      style="color: var(--sirem-tint-text)"
                    >
                      Ver demo →
                    </span>
                  </a>
                }
              </div>
            }
          }
        }
        @if (filtered().length === 0) {
          <p class="mt-10 text-center text-sm text-slate-500">
            Sin resultados para “{{ filter() }}”.
          </p>
        }
      </main>
    </div>
  `,
})
export class HomePage {
  readonly filter = signal('');
  readonly total = computed(() => CATALOG.length);
  readonly sections = computed(() => SECTIONS);

  filtered() {
    const q = this.filter().trim().toLowerCase();
    if (!q) return CATALOG;
    return CATALOG.filter((c) =>
      `${c.name} ${c.selector} ${c.category} ${sectionOf(c)}`.toLowerCase().includes(q),
    );
  }

  bySection(id: string) {
    return this.filtered().filter((c) => sectionOf(c) === id);
  }

  categoriesOf(sectionId: string) {
    return [...new Set(this.bySection(sectionId).map((c) => c.category))];
  }

  bySectionCategory(sectionId: string, cat: string) {
    return this.bySection(sectionId).filter((c) => c.category === cat);
  }

  showCategoryLabel(sectionId: string) {
    return sectionId === 'componentes' || sectionId === 'paginas';
  }
}
