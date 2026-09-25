import { Component } from '@angular/core';
import { SiremAutofocusDirective, SiremInput } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-autofocus-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremAutofocusDirective, SiremInput],
  template: `
    <app-demo-page-layout title="Autofocus" category="Directivas" subtitle="siremAutofocus — enfoca al aparecer en vista.">
      <app-demo-variant-card title="Básico" description="El campo ya viene enfocado (prueba con Tab)." [htmlCode]="h1" [tsCode]="t">
        <sirem-input-field label="Buscar" placeholder="Ya estoy enfocado" siremAutofocus [(value)]="q" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con retraso" description="Espera 600 ms (útil tras abrir modales)." [htmlCode]="h2" [tsCode]="t">
        <sirem-input-field label="Nombres" siremAutofocus [siremAutofocusDelay]="600" [(value)]="n" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class AutofocusDemoPage {
  q = '';
  n = '';
  readonly h1 = '<sirem-input-field label="Buscar"\n  placeholder="Ya estoy enfocado" siremAutofocus [(value)]="q" />';
  readonly h2 = '<sirem-input-field label="Nombres" siremAutofocus\n  [siremAutofocusDelay]="600" [(value)]="n" />';
  readonly t = `import { SiremAutofocusDirective, SiremInput } from 'deorta-sirem-ui';

q = '';
n = '';`;
}
