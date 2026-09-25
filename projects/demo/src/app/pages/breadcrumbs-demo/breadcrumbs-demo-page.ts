import { Component } from '@angular/core';
import { SiremBreadcrumbs } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-breadcrumbs-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremBreadcrumbs],
  template: `
    <app-demo-page-layout title="Breadcrumbs" category="Layout" subtitle="sirem-breadcrumbs — migas por niveles.">
      <app-demo-variant-card title="Dos niveles" description="Inicio + sección actual." [htmlCode]="h1" [tsCode]="t">
        <sirem-breadcrumbs [items]="dos" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Cuatro niveles" description="Navegación profunda; último sin link." [htmlCode]="h2" [tsCode]="t">
        <sirem-breadcrumbs [items]="cuatro" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class BreadcrumbsDemoPage {
  readonly dos = [{ label: 'Inicio', link: '/' }, { label: 'Pacientes' }];
  readonly cuatro = [
    { label: 'Inicio', link: '/' },
    { label: 'Pacientes', link: '/demo/data-table' },
    { label: 'HC-2026-001', link: '/demo/card' },
    { label: 'Evolución' },
  ];
  readonly h1 = '<sirem-breadcrumbs [items]="dos" />';
  readonly h2 = '<sirem-breadcrumbs [items]="cuatro" />  <!-- último sin link = actual -->';
  readonly t = "import { SiremBreadcrumbs } from 'deorta-sirem-ui';\n\nreadonly dos = [{ label: 'Inicio', link: '/' }, { label: 'Pacientes' }];\n\nreadonly cuatro = [\n  { label: 'Inicio', link: '/' },\n  { label: 'Pacientes', link: '/demo/data-table' },\n  { label: 'HC-2026-001', link: '/demo/card' },\n  { label: 'Evolución' },\n];";
}
