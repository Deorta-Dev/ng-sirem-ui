import { Component, signal } from '@angular/core';
import { SiremClickOutsideDirective, SiremButton } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-click-outside-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremClickOutsideDirective, SiremButton],
  template: `
    <app-demo-page-layout title="Click Outside" category="Directivas" subtitle="(siremClickOutside) — detecta clics fuera del elemento.">
      <app-demo-variant-card title="Cerrar al salir" description="Abre el panel y pulsa fuera." [htmlCode]="h1" [tsCode]="t">
        <sirem-button size="sm" (pressed)="open.set(true)">Abrir panel</sirem-button>
        @if (open()) {
          <div (siremClickOutside)="open.set(false); fuera.set(fuera() + 1)"
            class="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-700">
            Panel abierto — pulsa fuera de este recuadro para cerrarlo.
          </div>
        }
        <span class="text-sm text-slate-600 w-full text-center">Cierres por fuera: {{ fuera() }}</span>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class ClickOutsideDemoPage {
  readonly open = signal(false);
  readonly fuera = signal(0);
  readonly h1 = `<sirem-button size="sm" (pressed)="open.set(true)">Abrir panel</sirem-button>
@if (open()) {
  <div (siremClickOutside)="open.set(false)"
    class="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-700">
    Panel abierto — pulsa fuera de este recuadro para cerrarlo.
  </div>
}`;
  readonly t = `import { signal } from '@angular/core';
import { SiremClickOutsideDirective, SiremButton } from 'deorta-sirem-ui';

readonly open = signal(false);`;
}
