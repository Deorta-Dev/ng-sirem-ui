import { Component, signal } from '@angular/core';
import { SiremSearchField } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-search-field-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremSearchField],
  template: `
    <app-demo-page-layout title="Search Field" category="Formularios" subtitle="sirem-search-field — búsqueda con estado.">
      <app-demo-variant-card title="Vacío" description="Placeholder de búsqueda." [htmlCode]="h1" [tsCode]="t">
        <sirem-search-field placeholder="Buscar pacientes…" [(value)]="a" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con texto y label" description="Filtro activo." [htmlCode]="h2" [tsCode]="t">
        <sirem-search-field label="Pacientes" [(value)]="b" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Error y disabled" description="Sin resultados y bloqueado." [htmlCode]="h3" [tsCode]="t">
        <sirem-search-field error="Sin coincidencias." [(value)]="c" />
        <sirem-search-field [disabled]="true" [(value)]="d" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class SearchFieldDemoPage {
  readonly a = signal(''); readonly b = signal('María'); readonly c = signal('zzz'); readonly d = signal('');
  readonly h1 = '<sirem-search-field placeholder="Buscar pacientes…" [(value)]="a" />';
  readonly h2 = '<sirem-search-field label="Pacientes" [(value)]="b" />';
  readonly h3 = '<sirem-search-field error="Sin coincidencias." [(value)]="c" />\n<sirem-search-field [disabled]="true" [(value)]="d" />';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremSearchField } from 'deorta-sirem-ui';\n\nreadonly a = signal('');\nreadonly b = signal('María');\nreadonly c = signal('zzz');\nreadonly d = signal('');";
}
