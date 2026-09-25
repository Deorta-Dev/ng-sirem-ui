import { Component } from '@angular/core';
import { SiremFiIcon } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-fi-icon-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremFiIcon],
  template: `
    <app-demo-page-layout title="Fi Icon" category="Iconos" subtitle="sirem-fi-icon — Flaticon UIcons por peso.">
      <app-demo-variant-card title="Pesos" description="Regular, bold y solid." [htmlCode]="h1" [tsCode]="t">
        <sirem-fi-icon name="rr-user" />
        <sirem-fi-icon name="br-user" />
        <sirem-fi-icon name="sr-user" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Tamaños" description="size en px." [htmlCode]="h2" [tsCode]="t">
        <sirem-fi-icon name="rr-bell" [size]="16" />
        <sirem-fi-icon name="rr-bell" [size]="24" />
        <sirem-fi-icon name="rr-bell" [size]="32" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con significado" description="label expone rol img." [htmlCode]="h3" [tsCode]="t">
        <sirem-fi-icon name="rr-calendar" label="Agenda" />
        <span class="text-sm text-slate-600">Uicons by <a class="underline" href="https://www.flaticon.com/uicons">Flaticon</a></span>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class FiIconDemoPage {
  readonly h1 = '<sirem-fi-icon name="rr-user" />\n<sirem-fi-icon name="br-user" />\n<sirem-fi-icon name="sr-user" />';
  readonly h2 = '<sirem-fi-icon name="rr-bell" [size]="16" />\n<sirem-fi-icon name="rr-bell" [size]="24" />\n<sirem-fi-icon name="rr-bell" [size]="32" />';
  readonly h3 = '<sirem-fi-icon name="rr-calendar" label="Agenda" />';
  readonly t = "import { SiremFiIcon } from 'deorta-sirem-ui';";
}
