import { Component, signal } from '@angular/core';
import { SiremDate } from '@deorta-dev/ng-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-date-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremDate],
  template: `
    <app-demo-page-layout title="Date" category="Formularios" subtitle="sirem-date-field — fecha con calendario popup.">
      <app-demo-variant-card title="Vacío" description="Placeholder dd/mm/aaaa." [htmlCode]="h1" [tsCode]="t">
        <sirem-date-field label="Nacimiento" [(value)]="a" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con valor" description="ISO yyyy-MM-dd." [htmlCode]="h2" [tsCode]="t">
        <sirem-date-field label="Cita" [(value)]="b" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Rango y error" description="min/max y validación." [htmlCode]="h3" [tsCode]="t">
        <sirem-date-field label="Control" min="2026-01-01" max="2026-12-31" [(value)]="c" />
        <sirem-date-field label="Cirugía" error="Fecha fuera de agenda." [(value)]="d" />
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Escritura manual con máscara y auto-posicionamiento"
        description="Escribe dígitos continuamente: la máscara aplica el formato dd/mm/aaaa. Al ingresar una fecha válida, el calendario popup se sitúa y enfoca automáticamente en ella."
        [htmlCode]="h4"
        [tsCode]="t4"
      >
        <div class="flex flex-col gap-2 w-full max-w-sm">
          <sirem-date-field label="Fecha de consulta" [(value)]="manualDate" />
          <p class="text-xs text-slate-500">
            Valor ISO sincronizado: <b>{{ manualDate() || '—' }}</b>
          </p>
        </div>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class DateDemoPage {
  readonly a = signal(null); readonly b = signal('2026-09-24'); readonly c = signal(null); readonly d = signal(null);
  readonly manualDate = signal<string | null>('2026-12-15');
  readonly h1 = '<sirem-date-field label="Nacimiento" [(value)]="a" />';
  readonly h2 = '<sirem-date-field label="Cita" [(value)]="b" />  <!-- ISO yyyy-MM-dd -->';
  readonly h3 = '<sirem-date-field label="Control" min="2026-01-01" max="2026-12-31" [(value)]="c" />\n<sirem-date-field label="Cirugía" error="Fecha fuera de agenda." [(value)]="d" />';
  readonly h4 = '<sirem-date-field label="Fecha de consulta" [(value)]="manualDate" />';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremDate } from '@deorta-dev/ng-sirem-ui';\n\nreadonly a = signal(null);\nreadonly b = signal('2026-09-24');\nreadonly c = signal(null);\nreadonly d = signal(null);";
  readonly t4 = "import { signal } from '@angular/core';\nimport { SiremDate } from '@deorta-dev/ng-sirem-ui';\n\nreadonly manualDate = signal<string | null>('2026-12-15');";
}
