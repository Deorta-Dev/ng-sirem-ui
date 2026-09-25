import { Component } from '@angular/core';
import { SiremMoneyPipe } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-money-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremMoneyPipe],
  template: `
    <app-demo-page-layout title="Money" category="Pipes" subtitle="siremMoney — moneda es-CO sin decimales.">
      <app-demo-variant-card title="COP por defecto" description="Formato de facturación." [htmlCode]="h1" [tsCode]="t">
        <p class="text-2xl font-bold text-slate-900">{{ 250000 | siremMoney }}</p>
        <p class="text-sm text-slate-600 w-full text-center">{{ 180500 | siremMoney }} · {{ 0 | siremMoney }}</p>
      </app-demo-variant-card>
      <app-demo-variant-card title="Otra moneda" description="Código ISO como argumento." [htmlCode]="h2" [tsCode]="t">
        <p class="text-2xl font-bold text-slate-900">{{ 99 | siremMoney:'USD' }}</p>
      </app-demo-variant-card>
      <app-demo-variant-card title="Inválido" description="Muestra raya en vez de romper." [htmlCode]="h3" [tsCode]="t">
        <p class="text-2xl font-bold text-slate-900">{{ null | siremMoney }}</p>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class MoneyDemoPage {
  readonly h1 = '<p class="text-2xl font-bold">{{ 250000 | siremMoney }}</p>';
  readonly h2 = '<p>{{ 99 | siremMoney:\'USD\' }}</p>';
  readonly h3 = '<p>{{ null | siremMoney }}</p>';
  readonly t = "import { SiremMoneyPipe } from 'deorta-sirem-ui';";
}
