import { Component, signal } from '@angular/core';
import { SiremSwitch } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-switch-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremSwitch],
  template: `
    <app-demo-page-layout title="Switch" category="Formularios" subtitle="sirem-switch-field — interruptor on/off.">
      <app-demo-variant-card title="Off / On" description="Doble vía con checked." [htmlCode]="h1" [tsCode]="t">
        <sirem-switch-field label="Recordatorios" [(checked)]="a" />
        <sirem-switch-field label="Telemedicina" [(checked)]="b" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con descripción" description="Contexto bajo el label." [htmlCode]="h2" [tsCode]="t">
        <sirem-switch-field label="Consentimiento" description="Autoriza tratamiento de datos." [(checked)]="c" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Disabled" description="No interactuable." [htmlCode]="h3" [tsCode]="t">
        <sirem-switch-field label="Bloqueado" [disabled]="true" [(checked)]="d" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class SwitchDemoPage {
  readonly a = signal(false); readonly b = signal(true); readonly c = signal(false); readonly d = signal(true);
  readonly h1 = '<sirem-switch-field label="Recordatorios" [(checked)]="a" />\n<sirem-switch-field label="Telemedicina" [(checked)]="b" />';
  readonly h2 = '<sirem-switch-field label="Consentimiento"\n  description="Autoriza tratamiento de datos." [(checked)]="c" />';
  readonly h3 = '<sirem-switch-field label="Bloqueado" [disabled]="true" [(checked)]="d" />';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremSwitch } from 'deorta-sirem-ui';\n\nreadonly a = signal(false);\nreadonly b = signal(true);\nreadonly c = signal(false);\nreadonly d = signal(true);";
}
