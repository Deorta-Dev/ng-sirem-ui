import { Component } from '@angular/core';
import { SiremTimeline, SiremTimelineItem } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-timeline-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremTimeline],
  template: `
    <app-demo-page-layout title="Timeline" category="Datos" subtitle="sirem-timeline — eventos con tonos y hora.">
      <app-demo-variant-card title="Tres eventos" description="Flujo típico de atención." [htmlCode]="h1" [tsCode]="t">
        <sirem-timeline [items]="base" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con tonos" description="Semántica por evento." [htmlCode]="h2" [tsCode]="t">
        <sirem-timeline [items]="tonos" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Vacía" description="Sin items muestra estado neutro." [htmlCode]="h3" [tsCode]="t">
        <sirem-timeline [items]="[]" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class TimelineDemoPage {
  readonly base = [
    { title: 'Registro creado', description: 'Recepción genera la HC.', time: '08:10' },
    { title: 'Examen', description: 'Agudeza visual y RX.', time: '08:40' },
    { title: 'Diagnóstico', description: 'Miopía leve, control anual.', time: '09:05' },
  ];
  readonly tonos: SiremTimelineItem[] = [
    { title: 'Cita confirmada', time: '08:00', tone: 'info' },
    { title: 'Atención completada', time: '09:00', tone: 'success' },
    { title: 'Pago pendiente', time: '10:00', tone: 'warning' },
    { title: 'Cita cancelada', time: '11:00', tone: 'danger' },
  ];
  readonly h1 = '<sirem-timeline [items]="base" />';
  readonly h2 = '<sirem-timeline [items]="tonos" />';
  readonly h3 = '<sirem-timeline [items]="[]" />';
  readonly t = `import { SiremTimeline, SiremTimelineItem } from 'deorta-sirem-ui';

readonly base = [
  { title: 'Registro creado', description: 'Recepción genera la HC.', time: '08:10' },
  { title: 'Examen', description: 'Agudeza visual y RX.', time: '08:40' },
  { title: 'Diagnóstico', description: 'Miopía leve, control anual.', time: '09:05' },
];
readonly tonos: SiremTimelineItem[] = [
  { title: 'Cita confirmada', time: '08:00', tone: 'info' },
  { title: 'Atención completada', time: '09:00', tone: 'success' },
  { title: 'Pago pendiente', time: '10:00', tone: 'warning' },
  { title: 'Cita cancelada', time: '11:00', tone: 'danger' },
];`;
}
