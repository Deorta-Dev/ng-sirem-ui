import { Component, signal } from '@angular/core';
import { SiremFieldGroup, SiremInput } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-field-group-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremFieldGroup, SiremInput],
  template: `
    <app-demo-page-layout title="Field Group" category="Formularios" subtitle="sirem-field-group — agrupador de campos.">
      <app-demo-variant-card title="Solo título" description="Sección mínima." [htmlCode]="h1" [tsCode]="t">
        <sirem-field-group title="Datos personales">
          <sirem-input-field label="Nombres" [(value)]="a" />
        </sirem-field-group>
      </app-demo-variant-card>
      <app-demo-variant-card title="Con descripción" description="Contexto de la sección." [htmlCode]="h2" [tsCode]="t">
        <sirem-field-group title="Contacto" description="Para enviar fórmula y recordatorios.">
          <sirem-input-field label="Teléfono" [(value)]="b" />
          <sirem-input-field label="Correo" [(value)]="c" />
        </sirem-field-group>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class FieldGroupDemoPage {
  readonly a = signal(''); readonly b = signal(''); readonly c = signal('');
  readonly h1 = '<sirem-field-group title="Datos personales">\n  <sirem-input-field label="Nombres" [(value)]="a" />\n</sirem-field-group>';
  readonly h2 = '<sirem-field-group title="Contacto"\n  description="Para enviar fórmula y recordatorios.">\n  <sirem-input-field label="Teléfono" [(value)]="b" />\n  <sirem-input-field label="Correo" [(value)]="c" />\n</sirem-field-group>';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremFieldGroup, SiremInput } from 'deorta-sirem-ui';\n\nreadonly a = signal('');\nreadonly b = signal('');\nreadonly c = signal('');";
}
