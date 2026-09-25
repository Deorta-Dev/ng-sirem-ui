import { Component } from '@angular/core';
import { SiremPageHeader, SiremButton } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-page-header-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremPageHeader, SiremButton],
  template: `
    <app-demo-page-layout title="Page Header" category="Datos" subtitle="sirem-page-header — título, subtítulo y acciones.">
      <app-demo-variant-card title="Solo título" description="Cabecera mínima." [htmlCode]="h1" [tsCode]="t">
        <sirem-page-header title="Pacientes" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con subtítulo" description="Contexto bajo el título." [htmlCode]="h2" [tsCode]="t">
        <sirem-page-header title="Pacientes" subtitle="1.240 registros · actualizados hoy" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con acciones" description="Slot actions para botones." [htmlCode]="h3" [tsCode]="t">
        <sirem-page-header title="Facturación" subtitle="Septiembre 2026">
          <div slot="actions" class="flex gap-2">
            <sirem-button size="sm" variant="secondary">Exportar</sirem-button>
            <sirem-button size="sm">Nueva factura</sirem-button>
          </div>
        </sirem-page-header>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class PageHeaderDemoPage {
  readonly h1 = '<sirem-page-header title="Pacientes" />';
  readonly h2 = '<sirem-page-header title="Pacientes"\n  subtitle="1.240 registros · actualizados hoy" />';
  readonly h3 = '<sirem-page-header title="Facturación" subtitle="Septiembre 2026">\n  <div slot="actions" class="flex gap-2">\n    <sirem-button size="sm" variant="secondary">Exportar</sirem-button>\n    <sirem-button size="sm">Nueva factura</sirem-button>\n  </div>\n</sirem-page-header>';
  readonly t = "import { SiremPageHeader, SiremButton } from 'deorta-sirem-ui';";
}
