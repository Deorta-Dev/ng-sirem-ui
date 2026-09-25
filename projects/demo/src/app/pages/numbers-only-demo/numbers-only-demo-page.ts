import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiremNumbersOnlyDirective } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-numbers-only-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, FormsModule, SiremNumbersOnlyDirective],
  template: `
    <app-demo-page-layout title="Numbers Only" category="Directivas" subtitle="siremNumbersOnly — solo dígitos en inputs nativos.">
      <app-demo-variant-card title="Documento" description="Escribe letras: se rechazan." [htmlCode]="h1" [tsCode]="t">
        <input siremNumbersOnly [(ngModel)]="doc" placeholder="CC sin puntos"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <span class="text-sm text-slate-600 w-full">Modelo: {{ doc || '—' }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card title="Con decimal" description="Un punto y hasta 2 decimales." [htmlCode]="h2" [tsCode]="t">
        <input siremNumbersOnly siremNumbersAllowDecimal [(ngModel)]="peso" placeholder="0.00"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <span class="text-sm text-slate-600 w-full">Modelo: {{ peso || '—' }}</span>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class NumbersOnlyDemoPage {
  doc = '';
  peso = '';
  readonly h1 = `<input siremNumbersOnly [(ngModel)]="doc" placeholder="CC sin puntos"
  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />`;
  readonly h2 = `<input siremNumbersOnly siremNumbersAllowDecimal [(ngModel)]="peso" placeholder="0.00"
  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />`;
  readonly t = `import { FormsModule } from '@angular/forms';
import { SiremNumbersOnlyDirective } from 'deorta-sirem-ui';

doc = '';
peso = '';`;
}
