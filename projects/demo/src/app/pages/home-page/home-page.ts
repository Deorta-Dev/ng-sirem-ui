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
    <div class="min-h-screen bg-slate-100">
      <header class="border-b border-slate-200 bg-white">
        <div class="flex flex-wrap items-center justify-between gap-3 px-4 md:px-8 py-5">
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900">SIREM UI — Catálogo</h1>
            <p class="mt-1 text-sm text-slate-600">
              {{ total() }} demos · variantes en Card + marco estilo Iframe + CodeMirror HTML/TS.
            </p>
          </div>
          <input
            type="search"
            placeholder="Filtrar…"
            [value]="filter()"
            (input)="filter.set($any($event.target).value)"
            class="w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            aria-label="Filtrar componentes"
          />
          <app-theme-toggle />
        </div>
      </header>
      <main class="px-4 md:px-8 py-8">
        @for (sec of sections(); track sec.id) {
          @if (bySection(sec.id).length) {
            <h2 class="mb-1 mt-10 text-lg font-extrabold text-slate-900">{{ sec.title }}</h2>
            <p class="mb-3 text-sm text-slate-500">{{ sec.hint }}</p>
            @for (cat of categoriesOf(sec.id); track cat) {
              @if (showCategoryLabel(sec.id)) {
                <h3 class="mb-3 mt-6 text-sm font-bold uppercase tracking-widest text-slate-500">{{ cat }}</h3>
              }
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                @for (c of bySectionCategory(sec.id, cat); track c.slug) {
                  <a
                    [routerLink]="['/demo', c.slug]"
                    class="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <p class="text-xs font-mono text-slate-400">{{ c.selector }}</p>
                    <h4 class="mt-1 text-base font-bold text-slate-900 group-hover:underline">{{ c.name }}</h4>
                    <p class="mt-1 text-sm text-slate-600">{{ c.description }}</p>
                    <span class="mt-3 inline-block text-sm font-semibold text-blue-700">Ver demo →</span>
                  </a>
                }
              </div>
            }
          }
        }
        @if (filtered().length === 0) {
          <p class="mt-10 text-center text-sm text-slate-500">Sin resultados para “{{ filter() }}”.</p>
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
    return sectionId === 'componentes';
  }
}
