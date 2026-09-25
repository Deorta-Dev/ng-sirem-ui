import { Component } from '@angular/core';
import { SiremPhonePipe } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-phone-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremPhonePipe],
  template: `
    <app-demo-page-layout title="Phone" category="Pipes" subtitle="siremPhone — 10 dígitos en bloques 3-3-4.">
      <app-demo-variant-card title="Móvil" description="Formato de contacto." [htmlCode]="h1" [tsCode]="t">
        <p class="text-2xl font-bold text-slate-900">{{ '3001112233' | siremPhone }}</p>
      </app-demo-variant-card>
      <app-demo-variant-card title="No válido" description="Devuelve el valor intacto." [htmlCode]="h2" [tsCode]="t">
        <p class="text-2xl font-bold text-slate-900">{{ '601234' | siremPhone }}</p>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class PhoneDemoPage {
  readonly h1 = '<p>{{ \'3001112233\' | siremPhone }}</p>';
  readonly h2 = '<p>{{ \'601234\' | siremPhone }}</p>';
  readonly t = "import { SiremPhonePipe } from 'deorta-sirem-ui';";
}
