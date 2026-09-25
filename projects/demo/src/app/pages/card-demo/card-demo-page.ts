import { Component } from '@angular/core';
import { SiremCard, SiremButton } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-card-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremCard, SiremButton],
  template: `
    <app-demo-page-layout title="Card" category="Datos" subtitle="sirem-card — contenedor con header, padding y footer.">
      <app-demo-variant-card title="Solo cuerpo" description="Tarjeta mínima sin título." [htmlCode]="h1" [tsCode]="t">
        <sirem-card><p class="text-sm text-slate-600">Contenido libre de la tarjeta.</p></sirem-card>
      </app-demo-variant-card>
      <app-demo-variant-card title="Con header" description="Título + subtítulo descriptivo." [htmlCode]="h2" [tsCode]="t">
        <sirem-card title="Historia clínica" subtitle="HC-2026-001 · María Torres">
          <p class="text-sm text-slate-600">Motivo de consulta y evolución.</p>
        </sirem-card>
      </app-demo-variant-card>
      <app-demo-variant-card title="Con footer" description="Slot footer para acciones." [htmlCode]="h3" [tsCode]="t">
        <sirem-card title="Factura" subtitle="FAC-1042 · $250.000">
          <p class="text-sm text-slate-600">Detalle de la factura.</p>
          <div slot="footer" class="flex gap-2">
            <sirem-button size="sm" variant="secondary">Cancelar</sirem-button>
            <sirem-button size="sm">Pagar</sirem-button>
          </div>
        </sirem-card>
      </app-demo-variant-card>
      <app-demo-variant-card title="Sin padding" description="padding=none para tablas o mapas." [htmlCode]="h4" [tsCode]="t">
        <sirem-card title="Listado" padding="none"><p class="p-4 text-sm text-slate-600">Aquí iría una tabla sin aire interno.</p></sirem-card>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class CardDemoPage {
  readonly h1 = '<sirem-card>\n  <p class="text-sm text-slate-600">Contenido libre de la tarjeta.</p>\n</sirem-card>';
  readonly h2 = '<sirem-card title="Historia clínica" subtitle="HC-2026-001 · María Torres">\n  <p class="text-sm text-slate-600">Motivo de consulta y evolución.</p>\n</sirem-card>';
  readonly h3 = '<sirem-card title="Factura" subtitle="FAC-1042 · $250.000">\n  <p class="text-sm text-slate-600">Detalle de la factura.</p>\n  <div slot="footer" class="flex gap-2">\n    <sirem-button size="sm" variant="secondary">Cancelar</sirem-button>\n    <sirem-button size="sm">Pagar</sirem-button>\n  </div>\n</sirem-card>';
  readonly h4 = '<sirem-card title="Listado" padding="none">\n  <p class="p-4 text-sm text-slate-600">Aquí iría una tabla sin aire interno.</p>\n</sirem-card>';
  readonly t = "import { SiremCard, SiremButton } from 'deorta-sirem-ui';";
}
