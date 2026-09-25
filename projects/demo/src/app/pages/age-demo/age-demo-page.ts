import { Component } from '@angular/core';
import { SiremAgePipe } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-age-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremAgePipe],
  template: `
    <app-demo-page-layout title="Age" category="Pipes" subtitle="siremAge — años desde fecha ISO.">
      <app-demo-variant-card title="Adulto" description="Sufijo plural." [htmlCode]="h1" [tsCode]="t">
        <p class="text-2xl font-bold text-slate-900">{{ '1990-05-01' | siremAge }}</p>
      </app-demo-variant-card>
      <app-demo-variant-card title="Inválida" description="Raya en vez de NaN." [htmlCode]="h2" [tsCode]="t">
        <p class="text-2xl font-bold text-slate-900">{{ 'no-fecha' | siremAge }}</p>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class AgeDemoPage {
  readonly h1 = '<p>{{ \'1990-05-01\' | siremAge }}</p>';
  readonly h2 = '<p>{{ \'no-fecha\' | siremAge }}</p>';
  readonly t = "import { SiremAgePipe } from 'deorta-sirem-ui';";
}
