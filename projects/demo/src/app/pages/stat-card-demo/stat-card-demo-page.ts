import { Component } from '@angular/core';
import { SiremStatCard } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-stat-card-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremStatCard],
  template: `
    <app-demo-page-layout title="Stat Card" category="Datos" subtitle="sirem-stat-card — KPI con delta, icono y variante a color pleno.">
      <app-demo-variant-card title="Básico" description="Etiqueta + valor, sin delta." [htmlCode]="h1" [tsCode]="t">
        <sirem-stat-card label="Pacientes" value="1.240" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con delta" description="Positivo sube, negativo baja." [htmlCode]="h2" [tsCode]="t">
        <sirem-stat-card label="Ventas mes" value="$18,5 M" [delta]="12.4" />
        <sirem-stat-card label="Glosa" value="3,1 %" [delta]="-0.8" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con icono" description="Slot icon para énfasis visual." [htmlCode]="h3" [tsCode]="t">
        <sirem-stat-card label="Citas hoy" value="32" [delta]="5">
          <i slot="icon" class="fi fi-rr-calendar"></i>
        </sirem-stat-card>
      </app-demo-variant-card>
      <app-demo-variant-card title="Full color" description="variant=solid con cinco colores." [htmlCode]="h4" [tsCode]="t">
        <sirem-stat-card label="Citas hoy" value="32" variant="solid" color="brand" />
        <sirem-stat-card label="Urgencias" value="7" variant="solid" color="danger" />
        <sirem-stat-card label="Recaudo" value="$18,5 M" variant="solid" color="success" />
        <sirem-stat-card label="Glosa" value="3,1 %" variant="solid" color="warning" />
        <sirem-stat-card label="Telemedicina" value="12" variant="solid" color="info" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class StatCardDemoPage {
  readonly h1 = '<sirem-stat-card label="Pacientes" value="1.240" />';
  readonly h2 = '<sirem-stat-card label="Ventas mes" value="$18,5 M" [delta]="12.4" />\n<sirem-stat-card label="Glosa" value="3,1 %" [delta]="-0.8" />';
  readonly h3 = '<sirem-stat-card label="Citas hoy" value="32" [delta]="5">\n  <i slot="icon" class="fi fi-rr-calendar"></i>\n</sirem-stat-card>';
  readonly h4 = '<sirem-stat-card label="Citas hoy" value="32" variant="solid" color="brand" />\n<sirem-stat-card label="Urgencias" value="7" variant="solid" color="danger" />\n<sirem-stat-card label="Recaudo" value="$18,5 M" variant="solid" color="success" />\n<sirem-stat-card label="Glosa" value="3,1 %" variant="solid" color="warning" />\n<sirem-stat-card label="Telemedicina" value="12" variant="solid" color="info" />';
  readonly t = "import { SiremStatCard } from 'deorta-sirem-ui';";
}
