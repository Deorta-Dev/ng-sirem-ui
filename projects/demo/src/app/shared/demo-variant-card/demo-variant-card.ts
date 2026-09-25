import { Component, input } from '@angular/core';
import { CodeViewer } from '../code-viewer/code-viewer';

/**
 * Card de variante para el catálogo demo.
 *
 * Estructura pedida:
 *  Card > Título + descripción + marco estilo Iframe
 *  (solo el componente, sin nav/header) + CodeMirror HTML + TS/Data.
 *
 * ```html
 * <app-demo-variant-card
 *   title="Variante primaria"
 *   description="Uso principal…"
 *   [htmlCode]="html1"
 *   [tsCode]="ts1">
 *   <sirem-button variant="primary">Guardar</sirem-button>
 * </app-demo-variant-card>
 * ```
 */
@Component({
  selector: 'app-demo-variant-card',
  standalone: true,
  imports: [CodeViewer],
  template: `
    <section class="mb-10 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-visible p-6">
      <div class="mb-4">
        <h2 class="text-lg font-bold text-slate-900">{{ title() }}</h2>
        @if (description()) {
          <p class="mt-1 text-sm text-slate-600">{{ description() }}</p>
        }
      </div>

      <!-- Marco estilo Iframe: SOLO la variante, sin nav/header/descripción dentro.
           overflow-visible para no recortar menús/popups del componente. -->
      <div>
        <div class="rounded-xl border border-slate-200 overflow-visible">
          <div class="flex items-center gap-1.5 rounded-t-xl bg-slate-100 px-3 py-2" aria-hidden="true">
            <span class="h-2.5 w-2.5 rounded-full bg-red-400"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
            <span class="ml-2 truncate text-xs text-slate-500">preview — solo el componente</span>
          </div>
          <div class="preview-body rounded-b-xl bg-slate-50 p-8 flex flex-wrap items-center justify-center gap-4 min-h-[360px]">
            <ng-content />
          </div>
        </div>
      </div>

      <!-- Código necesario para implementarlo -->
      <div class="grid gap-4 mt-4 md:grid-cols-2">
        <div>
          <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">HTML</p>
          <app-code-viewer [code]="htmlCode()" language="html" />
        </div>
        <div>
          <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">TS / Data</p>
          <app-code-viewer [code]="tsCode()" language="typescript" />
        </div>
      </div>
    </section>
  `,
})
export class DemoVariantCard {
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly htmlCode = input<string>('');
  readonly tsCode = input<string>('');
}
