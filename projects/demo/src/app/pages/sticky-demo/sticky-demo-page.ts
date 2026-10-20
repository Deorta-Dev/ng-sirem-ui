import { Component, signal } from '@angular/core';
import { SiremSticky } from '@deorta-dev/ng-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-sticky-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremSticky],
  template: `
    <app-demo-page-layout
      title="Sticky"
      category="Directivas"
      subtitle="siremSticky — fija cualquier elemento, de forma abierta o con límite."
    >
      <app-demo-variant-card
        title="Abierto"
        description="La cabecera se queda arriba mientras su panel siga visible. Emite el estado con (siremStickyChange)."
        [htmlCode]="h1"
        [tsCode]="t"
      >
        <div class="h-64 w-full overflow-auto rounded-xl border border-slate-300">
          <div
            siremSticky
            #st="siremSticky"
            class="z-10 flex items-center justify-between bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
          >
            <span>Cabecera fija</span>
            <span class="text-xs font-normal opacity-80">stuck: {{ st.stuck() }}</span>
          </div>
          <div class="space-y-3 p-4 text-sm text-slate-600">
            @for (i of items; track i) {
              <p>Contenido de la sección {{ i }}: la cabecera permanece arriba.</p>
            }
          </div>
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Con límite"
        description="[siremStickyLimit]='160': se fija 160 px y después suelta para seguir con el contenido."
        [htmlCode]="h2"
        [tsCode]="t"
      >
        <div class="h-64 w-full overflow-auto rounded-xl border border-slate-300">
          <div
            siremSticky
            [siremStickyLimit]="160"
            class="z-10 flex items-center justify-between bg-sky-700 px-4 py-3 text-sm font-semibold text-white"
          >
            <span>Cabecera con límite</span>
            <span class="text-xs font-normal opacity-80">recorrido 160 px</span>
          </div>
          <div class="space-y-3 p-4 text-sm text-slate-600">
            @for (i of items; track i) {
              <p>Contenido de la sección {{ i }}: tras 160 px la cabecera se suelta.</p>
            }
          </div>
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Con boundary"
        description="[siremStickyBoundary]='fin': el borde inferior de #fin marca hasta dónde puede acompañar."
        [htmlCode]="h3"
        [tsCode]="t"
      >
        <div class="h-64 w-full overflow-auto rounded-xl border border-slate-300">
          <div
            siremSticky
            #st2="siremSticky"
            [siremStickyBoundary]="fin"
            class="z-10 flex items-center justify-between bg-emerald-700 px-4 py-3 text-sm font-semibold text-white"
          >
            <span>Cabecera con boundary</span>
            <span class="text-xs font-normal opacity-80">stuck: {{ st2.stuck() }}</span>
          </div>
          <div class="space-y-3 p-4 text-sm text-slate-600">
            @for (i of items; track i) {
              <p>Contenido de la sección {{ i }}: la cabecera acompaña hasta #fin.</p>
            }
          </div>
          <div #fin class="mx-4 mb-4 rounded-lg border border-emerald-700 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            Fin del área fija
          </div>
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Evento de estado"
        description="(siremStickyChange) avisa al fijarse y al soltarse; útil para cambiar la piel del host."
        [htmlCode]="h4"
        [tsCode]="t"
      >
        <p class="text-sm text-slate-600">
          Estado recibido:
          <strong class="font-semibold text-slate-900">{{ pinned() ? 'fijado' : 'suelto' }}</strong>
          · cambios: {{ changes() }}
        </p>
        <div class="h-56 w-full overflow-auto rounded-xl border border-slate-300">
          <div
            siremSticky
            (siremStickyChange)="onStuck($event)"
            class="z-10 bg-amber-600 px-4 py-3 text-sm font-semibold text-white"
          >
            Escucha de siremStickyChange
          </div>
          <div class="space-y-3 p-4 text-sm text-slate-600">
            @for (i of items; track i) {
              <p>Desplaza para fijar y soltar esta cabecera.</p>
            }
          </div>
        </div>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class StickyDemoPage {
  readonly items = Array.from({ length: 14 }, (_, i) => i + 1);
  readonly pinned = signal(false);
  readonly changes = signal(0);

  onStuck(value: boolean): void {
    this.pinned.set(value);
    this.changes.update((n) => n + 1);
  }

  readonly h1 = `<div class="h-64 overflow-auto rounded-xl border">
  <div siremSticky #st="siremSticky"
    class="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
    <span>Cabecera fija</span>
    <span class="text-xs opacity-80">stuck: {{ st.stuck() }}</span>
  </div>
  <div class="space-y-3 p-4">…contenido…</div>
</div>`;

  readonly h2 = `<div siremSticky [siremStickyLimit]="160"
  class="bg-sky-700 px-4 py-3 text-white">
  Cabecera con límite de 160 px
</div>`;

  readonly h3 = `<div siremSticky [siremStickyBoundary]="fin"
  class="bg-emerald-700 px-4 py-3 text-white">
  Cabecera con boundary
</div>
<!-- …contenido… -->
<div #fin class="rounded-lg border px-4 py-3">Fin del área fija</div>`;

  readonly h4 = `<div siremSticky (siremStickyChange)="onStuck($event)"
  class="bg-amber-600 px-4 py-3 text-white">
  Escucha de siremStickyChange
</div>`;

  readonly t = `import { signal } from '@angular/core';
import { SiremSticky } from '@deorta-dev/ng-sirem-ui';

readonly pinned = signal(false);

onStuck(value: boolean): void {
  this.pinned.set(value);
}`;
}
