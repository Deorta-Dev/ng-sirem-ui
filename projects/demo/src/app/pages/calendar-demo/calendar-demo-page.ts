import { Component, signal } from '@angular/core';
import { SiremCalendar } from 'deorta-sirem-ui';
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
    </app-demo-page-layout>
  `,
})
export class CalendarDemoPage {
  readonly sel = signal<string | null>(null);
  readonly sel2 = signal<string | null>(null);
  readonly sel3 = signal<string | null>(null);
  readonly dia = signal('');
  readonly eventos = [
    { date: '2026-09-24', label: 'Control María', color: '#1d64f1' },
    { date: '2026-09-25', label: 'Cirugía Juan', color: '#dc2626' },
  ];
  readonly leyenda = [{ label: 'Consulta', color: '#1d64f1' }, { label: 'Cirugía', color: '#dc2626' }];
  readonly h1 = '<sirem-calendar size="medium" [events]="eventos"\n  [(selected)]="sel" (dayPressed)="dia.set($event)" />';
  readonly h2 = '<sirem-calendar size="small" [events]="eventos" [(selected)]="sel2" />';
  readonly h3 = '<sirem-calendar size="large" [events]="eventos"\n  [legend]="leyenda" [(selected)]="sel3" />';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremCalendar } from 'deorta-sirem-ui';\n\nreadonly sel = signal<string | null>(null);\nreadonly dia = signal('');\nreadonly eventos = [\n  { date: '2026-09-24', label: 'Control María', color: '#1d64f1' },\n  { date: '2026-09-25', label: 'Cirugía Juan', color: '#dc2626' },\n];\nreadonly leyenda = [\n  { label: 'Consulta', color: '#1d64f1' },\n  { label: 'Cirugía', color: '#dc2626' },\n];";
}
