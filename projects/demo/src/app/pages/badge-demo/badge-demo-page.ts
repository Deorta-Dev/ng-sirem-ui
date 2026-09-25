import { Component } from '@angular/core';
import { SiremBadge } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-badge-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremBadge],
  template: `
    <app-demo-page-layout title="Badge" category="Datos" subtitle="sirem-badge — tonos y punto de estado.">
      <app-demo-variant-card title="Tonos" description="Cinco tonos semánticos." [htmlCode]="h1" [tsCode]="t">
        <sirem-badge tone="neutral">Neutral</sirem-badge>
        <sirem-badge tone="info">Info</sirem-badge>
        <sirem-badge tone="success">Éxito</sirem-badge>
        <sirem-badge tone="warning">Aviso</sirem-badge>
        <sirem-badge tone="danger">Peligro</sirem-badge>
      </app-demo-variant-card>
      <app-demo-variant-card title="Con punto" description="Dot de estado para listados." [htmlCode]="h2" [tsCode]="t">
        <sirem-badge tone="success" dot>Activo</sirem-badge>
        <sirem-badge tone="danger" dot>Inactivo</sirem-badge>
        <sirem-badge tone="warning" dot>Pendiente</sirem-badge>
      </app-demo-variant-card>
      <app-demo-variant-card title="Estados de historia" description="Uso típico en tablas clínicas." [htmlCode]="h3" [tsCode]="t">
        <sirem-badge tone="info">En consulta</sirem-badge>
        <sirem-badge tone="success">Facturada</sirem-badge>
        <sirem-badge tone="neutral">Anulada</sirem-badge>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class BadgeDemoPage {
  readonly h1 = '<sirem-badge tone="neutral">Neutral</sirem-badge>\n<sirem-badge tone="info">Info</sirem-badge>\n<sirem-badge tone="success">Éxito</sirem-badge>\n<sirem-badge tone="warning">Aviso</sirem-badge>\n<sirem-badge tone="danger">Peligro</sirem-badge>';
  readonly h2 = '<sirem-badge tone="success" dot>Activo</sirem-badge>\n<sirem-badge tone="danger" dot>Inactivo</sirem-badge>\n<sirem-badge tone="warning" dot>Pendiente</sirem-badge>';
  readonly h3 = '<sirem-badge tone="info">En consulta</sirem-badge>\n<sirem-badge tone="success">Facturada</sirem-badge>\n<sirem-badge tone="neutral">Anulada</sirem-badge>';
  readonly t = "import { SiremBadge } from 'deorta-sirem-ui';";
}
