import { Component, signal } from '@angular/core';
import { SiremRadioGroup } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-radio-group-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremRadioGroup],
  template: `
    <app-demo-page-layout title="Radio Group" category="Formularios" subtitle="sirem-radio-group-field — opciones excluyentes.">
      <app-demo-variant-card title="Horizontal" description="Por defecto en línea." [htmlCode]="h1" [tsCode]="t">
        <sirem-radio-group-field label="Género" [options]="genero" [(value)]="a" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Vertical + hint" description="Lista apilada con ayuda." [htmlCode]="h2" [tsCode]="t">
        <sirem-radio-group-field label="Régimen" [options]="regimen" orientation="vertical" hint="Según afiliación." [(value)]="b" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Disabled" description="Bloquea todo el grupo." [htmlCode]="h3" [tsCode]="t">
        <sirem-radio-group-field label="Sede" [options]="sedes" [disabled]="true" [(value)]="c" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class RadioGroupDemoPage {
  readonly a = signal(null); readonly b = signal(null); readonly c = signal('norte');
  readonly genero = [{ value: 'f', label: 'F' }, { value: 'm', label: 'M' }];
  readonly regimen = [{ value: 'c', label: 'Contributivo' }, { value: 's', label: 'Subsidiado' }];
  readonly sedes = [{ value: 'norte', label: 'Norte' }, { value: 'sur', label: 'Sur' }];
  readonly h1 = '<sirem-radio-group-field label="Género" [options]="genero" [(value)]="a" />';
  readonly h2 = '<sirem-radio-group-field label="Régimen" [options]="regimen"\n  orientation="vertical" hint="Según afiliación." [(value)]="b" />';
  readonly h3 = '<sirem-radio-group-field label="Sede" [options]="sedes"\n  [disabled]="true" [(value)]="c" />';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremRadioGroup } from 'deorta-sirem-ui';\n\nreadonly a = signal(null);\nreadonly b = signal(null);\nreadonly c = signal('norte');\nreadonly genero = [{ value: 'f', label: 'F' }, { value: 'm', label: 'M' }];\nreadonly regimen = [{ value: 'c', label: 'Contributivo' }, { value: 's', label: 'Subsidiado' }];\nreadonly sedes = [{ value: 'norte', label: 'Norte' }, { value: 'sur', label: 'Sur' }];";
}
