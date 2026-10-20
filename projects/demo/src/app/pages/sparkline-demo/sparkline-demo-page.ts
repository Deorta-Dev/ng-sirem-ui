import { Component } from '@angular/core';
import { SiremSparkline } from '@deorta-dev/ng-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-sparkline-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremSparkline],
  template: `
    <app-demo-page-layout
      title="Sparkline"
      category="Datos"
      subtitle="sirem-sparkline — minigráfico sin ejes para KPIs dentro de una tarjeta."
    >
      <app-demo-variant-card
        title="Barras con valor destacado"
        description="'highlight' marca la barra actual (en tinta o lima según el tono)."
        [htmlCode]="h1"
        [tsCode]="t1"
      >
        <div style="width: min(260px, 100%)">
          <sirem-sparkline [data]="costes" [highlight]="3" [height]="56" label="Costes" />
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Línea de tendencia"
        description="'variant='line'' para series suaves, con tono lima."
        [htmlCode]="h2"
        [tsCode]="t2"
      >
        <div style="width: min(260px, 100%)">
          <sirem-sparkline
            variant="line"
            tone="accent"
            [data]="ahorro"
            [height]="56"
            label="Ahorro"
          />
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Tonos"
        description="neutral (tinta), accent (lima), sage y danger."
        [htmlCode]="h3"
        [tsCode]="t3"
      >
        <div style="display: grid; gap: 1rem; width: min(320px, 100%)">
          <sirem-sparkline [data]="costes" [highlight]="2" tone="neutral" label="Neutral" />
          <sirem-sparkline [data]="costes" [highlight]="2" tone="accent" label="Acento" />
          <sirem-sparkline [data]="costes" [highlight]="2" tone="sage" label="Salvia" />
          <sirem-sparkline [data]="costes" [highlight]="2" tone="danger" label="Peligro" />
        </div>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class SparklineDemoPage {
  readonly costes = [4, 9, 6, 12, 8, 10];
  readonly ahorro = [2, 4, 3, 7, 6, 11];

  readonly t1 = `readonly costes = [4, 9, 6, 12, 8, 10];`;
  readonly t2 = `readonly ahorro = [2, 4, 3, 7, 6, 11];`;
  readonly t3 = `readonly costes = [4, 9, 6, 12, 8, 10];`;

  readonly h1 = '<sirem-sparkline [data]="costes" [highlight]="3" [height]="56" label="Costes" />';
  readonly h2 =
    '<sirem-sparkline variant="line" tone="accent" [data]="ahorro" [height]="56" label="Ahorro" />';
  readonly h3 = `<sirem-sparkline [data]="costes" [highlight]="2" tone="neutral" label="Neutral" />
<sirem-sparkline [data]="costes" [highlight]="2" tone="accent" label="Acento" />
<sirem-sparkline [data]="costes" [highlight]="2" tone="sage" label="Salvia" />
<sirem-sparkline [data]="costes" [highlight]="2" tone="danger" label="Peligro" />`;
}
