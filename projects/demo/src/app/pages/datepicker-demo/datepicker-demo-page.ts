import { Component, signal } from '@angular/core';
import { SiremDatepicker } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-datepicker-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremDatepicker],
  template: `
    <app-demo-page-layout title="Datepicker" category="Formularios" subtitle="sirem-datepicker-field — fecha nativa.">
      <app-demo-variant-card title="Simple" description="Input type=date." [htmlCode]="h1" [tsCode]="t">
        <sirem-datepicker-field label="Cita" [(value)]="a" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Hint y error" description="Ayuda y validación." [htmlCode]="h2" [tsCode]="t">
        <sirem-datepicker-field label="Control" hint="Lun–Vie 8–17h." [(value)]="b" />
        <sirem-datepicker-field label="Cirugía" error="Quirófano ocupado." [(value)]="c" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class DatepickerDemoPage {
  readonly a = signal(null); readonly b = signal(null); readonly c = signal(null);
  readonly h1 = '<sirem-datepicker-field label="Cita" [(value)]="a" />';
  readonly h2 = '<sirem-datepicker-field label="Control" hint="Lun–Vie 8–17h." [(value)]="b" />\n<sirem-datepicker-field label="Cirugía" error="Quirófano ocupado." [(value)]="c" />';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremDatepicker } from 'deorta-sirem-ui';\n\nreadonly a = signal(null);\nreadonly b = signal(null);\nreadonly c = signal(null);";
}
