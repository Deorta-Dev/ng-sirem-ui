import { Component, signal } from '@angular/core';
import { SiremCalendar } from '@deorta-dev/ng-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-calendar-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremCalendar],
  template: `
    <app-demo-page-layout title="Calendar" category="Agenda" subtitle="sirem-calendar — small (máx 17rem) y medium (máx 23rem) con ancho tope definido.">
      <app-demo-variant-card title="Medium con eventos" description="Puntos de estado por día." [htmlCode]="h1" [tsCode]="t">
        <sirem-calendar size="medium" [events]="eventos" [(selected)]="sel" (dayPressed)="dia.set($event)" />
        <span class="text-sm text-slate-600">Día: {{ dia() }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card title="Small popup" description="Compacto para sirem-date-field." [htmlCode]="h2" [tsCode]="t">
        <sirem-calendar size="small" [events]="eventos" [(selected)]="sel2" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Large con leyenda" description="Etiquetas amplias tipo Google Calendar." [htmlCode]="h3" [tsCode]="t">
        <sirem-calendar size="large" [events]="eventos" [legend]="leyenda" [(selected)]="sel3" />
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Días no disponibles (rayado)"
        description="stripedDays pinta los días bloqueados con el patrón rayado del tema."
        [htmlCode]="h4"
        [tsCode]="t"
      >
        <sirem-calendar size="small" [stripedDays]="bloqueados" [(selected)]="sel4" />
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Variante plana (Bento)"
        description="variant='plain' quita el marco y la cabecera: círculos de acento en los días con eventos y rayado en los bloqueados, para incrustarlo sobre una tarjeta de color."
        [htmlCode]="h5"
        [tsCode]="t"
      >
        <div class="w-full max-w-sm rounded-3xl p-4" style="background: var(--sirem-surface-accent-soft)">
          <sirem-calendar
            variant="plain"
            size="small"
            [events]="eventos"
            [stripedDays]="bloqueados"
            [(selected)]="sel5"
          />
        </div>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class CalendarDemoPage {
  readonly sel = signal<string | null>(null);
  readonly sel2 = signal<string | null>(null);
  readonly sel3 = signal<string | null>(null);
  readonly sel4 = signal<string | null>(null);
  readonly sel5 = signal<string | null>(null);
  readonly dia = signal('');
  readonly eventos = [
    { date: '2026-09-24', label: 'Control María', color: '#26272b' },
    { date: '2026-09-25', label: 'Cirugía Juan', color: '#dc2626' },
  ];
  readonly leyenda = [{ label: 'Consulta', color: '#26272b' }, { label: 'Cirugía', color: '#dc2626' }];
  readonly bloqueados = ['2026-09-08', '2026-09-12', '2026-09-17'];
  readonly h1 = '<sirem-calendar size="medium" [events]="eventos"\n  [(selected)]="sel" (dayPressed)="dia.set($event)" />';
  readonly h2 = '<sirem-calendar size="small" [events]="eventos" [(selected)]="sel2" />';
  readonly h3 = '<sirem-calendar size="large" [events]="eventos"\n  [legend]="leyenda" [(selected)]="sel3" />';
  readonly h4 = '<sirem-calendar size="small" [stripedDays]="bloqueados" [(selected)]="sel4" />';
  readonly h5 =
    '<sirem-calendar variant="plain" size="small" [events]="eventos"\n  [stripedDays]="bloqueados" [(selected)]="sel5" />';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremCalendar } from '@deorta-dev/ng-sirem-ui';\n\nreadonly sel = signal<string | null>(null);\nreadonly dia = signal('');\nreadonly eventos = [\n  { date: '2026-09-24', label: 'Control María', color: '#26272b' },\n  { date: '2026-09-25', label: 'Cirugía Juan', color: '#dc2626' },\n];\nreadonly leyenda = [\n  { label: 'Consulta', color: '#26272b' },\n  { label: 'Cirugía', color: '#dc2626' },\n];\nreadonly bloqueados = ['2026-09-08', '2026-09-12', '2026-09-17'];";
}
