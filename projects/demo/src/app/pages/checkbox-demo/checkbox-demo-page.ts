import { Component, signal } from '@angular/core';
import { SiremCheckbox } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-checkbox-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremCheckbox],
  template: `
    <app-demo-page-layout title="Checkbox" category="Formularios" subtitle="sirem-checkbox-field — casilla con descripción.">
      <app-demo-variant-card title="Con label" description="Aceptación simple." [htmlCode]="h1" [tsCode]="t">
        <sirem-checkbox-field label="Acepto términos" [(checked)]="a" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con descripción" description="Detalle legal o clínico." [htmlCode]="h2" [tsCode]="t">
        <sirem-checkbox-field label="Consentimiento informado" description="Autorizo el examen visual." [(checked)]="b" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Disabled" description="Bloqueado en on/off." [htmlCode]="h3" [tsCode]="t">
        <sirem-checkbox-field label="Verificado" [disabled]="true" [(checked)]="c" />
        <sirem-checkbox-field label="Pendiente" [disabled]="true" [(checked)]="d" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class CheckboxDemoPage {
  readonly a = signal(false); readonly b = signal(true); readonly c = signal(true); readonly d = signal(false);
  readonly h1 = '<sirem-checkbox-field label="Acepto términos" [(checked)]="a" />';
  readonly h2 = '<sirem-checkbox-field label="Consentimiento informado"\n  description="Autorizo el examen visual." [(checked)]="b" />';
  readonly h3 = '<sirem-checkbox-field label="Verificado" [disabled]="true" [(checked)]="c" />\n<sirem-checkbox-field label="Pendiente" [disabled]="true" [(checked)]="d" />';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremCheckbox } from 'deorta-sirem-ui';\n\nreadonly a = signal(false);\nreadonly b = signal(true);\nreadonly c = signal(true);\nreadonly d = signal(false);";
}
