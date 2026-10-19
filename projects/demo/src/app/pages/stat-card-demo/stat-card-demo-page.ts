import { Component } from '@angular/core';
import { SiremSparkline, SiremStatCard } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-stat-card-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremSparkline, SiremStatCard],
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
      <app-demo-variant-card title="Full color" description="variant=solid con seis colores." [htmlCode]="h4" [tsCode]="t">
        <sirem-stat-card label="Citas hoy" value="32" variant="solid" color="brand" />
        <sirem-stat-card label="Ahorro" value="$7.860" variant="solid" color="accent" />
        <sirem-stat-card label="Urgencias" value="7" variant="solid" color="danger" />
        <sirem-stat-card label="Recaudo" value="$18,5 M" variant="solid" color="success" />
        <sirem-stat-card label="Glosa" value="3,1 %" variant="solid" color="warning" />
        <sirem-stat-card label="Telemedicina" value="12" variant="solid" color="info" />
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Pastel (tint)"
        description="variant=tint: fondo pastel del tono con el icono en chip."
        [htmlCode]="h5"
        [tsCode]="t"
      >
        <sirem-stat-card label="Pacientes" value="1.240" [delta]="4.8" variant="tint" color="brand">
          <i slot="icon" class="fi fi-rr-users"></i>
        </sirem-stat-card>
        <sirem-stat-card label="Ahorro" value="$990" [delta]="6.2" variant="tint" color="accent">
          <i slot="icon" class="fi fi-rr-piggy-bank"></i>
        </sirem-stat-card>
        <sirem-stat-card label="Citas hoy" value="32" [delta]="8.1" variant="tint" color="info">
          <i slot="icon" class="fi fi-rr-calendar"></i>
        </sirem-stat-card>
        <sirem-stat-card label="Facturado" value="$18,5 M" [delta]="12.4" variant="tint" color="success">
          <i slot="icon" class="fi fi-rr-wallet"></i>
        </sirem-stat-card>
        <sirem-stat-card label="Cartera" value="$4,2 M" [delta]="-2.1" variant="tint" color="warning">
          <i slot="icon" class="fi fi-rr-receipt"></i>
        </sirem-stat-card>
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Superficie glass"
        description="surface=glass para superponer sobre fondos con color."
        [htmlCode]="h6"
        [tsCode]="t"
      >
        <sirem-stat-card label="Facturado" value="$18,5 M" [delta]="12.4" surface="glass">
          <i slot="icon" class="fi fi-rr-wallet"></i>
        </sirem-stat-card>
      </app-demo-variant-card>
      <app-demo-variant-card
        title="KPI Bento compacto"
        description="size='sm' + deltaLabel vacío: el sparkline se ancla al pie con mt-auto."
        [htmlCode]="h7"
        [tsCode]="t7"
      >
        <div class="grid w-full grid-cols-2 gap-3">
          <sirem-stat-card
            size="sm"
            label="Business Costs"
            value="4.9k"
            [delta]="20.5"
            deltaLabel=""
            variant="tint"
            color="success"
          >
            <sirem-sparkline
              class="mt-auto pt-3"
              [data]="costes"
              [highlight]="3"
              tone="sage"
              [height]="30"
            />
          </sirem-stat-card>
          <sirem-stat-card
            size="sm"
            label="Saving Monthly"
            value="990"
            [delta]="12.4"
            deltaLabel=""
            variant="tint"
            color="accent"
          >
            <sirem-sparkline
              class="mt-auto pt-3"
              [data]="ahorro"
              [highlight]="4"
              tone="accent"
              [height]="30"
            />
          </sirem-stat-card>
        </div>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class StatCardDemoPage {
  readonly h1 = '<sirem-stat-card label="Pacientes" value="1.240" />';
  readonly h2 = '<sirem-stat-card label="Ventas mes" value="$18,5 M" [delta]="12.4" />\n<sirem-stat-card label="Glosa" value="3,1 %" [delta]="-0.8" />';
  readonly h3 = '<sirem-stat-card label="Citas hoy" value="32" [delta]="5">\n  <i slot="icon" class="fi fi-rr-calendar"></i>\n</sirem-stat-card>';
  readonly h4 = '<sirem-stat-card label="Citas hoy" value="32" variant="solid" color="brand" />\n<sirem-stat-card label="Ahorro" value="$7.860" variant="solid" color="accent" />\n<sirem-stat-card label="Urgencias" value="7" variant="solid" color="danger" />\n<sirem-stat-card label="Recaudo" value="$18,5 M" variant="solid" color="success" />\n<sirem-stat-card label="Glosa" value="3,1 %" variant="solid" color="warning" />\n<sirem-stat-card label="Telemedicina" value="12" variant="solid" color="info" />';
  readonly h5 = '<sirem-stat-card label="Pacientes" value="1.240" [delta]="4.8" variant="tint" color="brand">\n  <i slot="icon" class="fi fi-rr-users"></i>\n</sirem-stat-card>\n<sirem-stat-card label="Ahorro" value="$990" [delta]="6.2" variant="tint" color="accent">\n  <i slot="icon" class="fi fi-rr-piggy-bank"></i>\n</sirem-stat-card>\n<sirem-stat-card label="Citas hoy" value="32" [delta]="8.1" variant="tint" color="info">\n  <i slot="icon" class="fi fi-rr-calendar"></i>\n</sirem-stat-card>';
  readonly h6 = '<sirem-stat-card label="Facturado" value="$18,5 M" [delta]="12.4" surface="glass">\n  <i slot="icon" class="fi fi-rr-wallet"></i>\n</sirem-stat-card>';
  readonly t = "import { SiremStatCard } from 'deorta-sirem-ui';";
  readonly costes = [4, 7, 5, 9, 6];
  readonly ahorro = [2, 4, 6, 5, 9];
  readonly h7 =
    '<sirem-stat-card size="sm" label="Business Costs" value="4.9k"\n  [delta]="20.5" deltaLabel="" variant="tint" color="success">\n  <sirem-sparkline class="mt-auto pt-3" [data]="costes" [highlight]="3" tone="sage" />\n</sirem-stat-card>';
  readonly t7 =
    "import { SiremSparkline, SiremStatCard } from 'deorta-sirem-ui';\n\n" +
    'readonly costes = [4, 7, 5, 9, 6];\n' +
    'readonly ahorro = [2, 4, 6, 5, 9];';
}
