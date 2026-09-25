import { Component, signal } from '@angular/core';
import { SiremMultiSelect } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-multi-select-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremMultiSelect],
  template: `
    <app-demo-page-layout title="Multi Select" category="Formularios" subtitle="sirem-multi-select — permisos, roles y características con grupos y buscador.">
      <app-demo-variant-card title="Permisos por grupos" description="Busca, filtra y elige varias." [htmlCode]="h1" [tsCode]="t">
        <sirem-multi-select label="Permisos del rol" [options]="permisos" [(value)]="sel" />
        <span class="text-sm text-slate-600 w-full">Elegidos: {{ sel().join(', ') || '—' }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card title="Características con iconos" description="Hints + iconos por opción." [htmlCode]="h2" [tsCode]="t">
        <sirem-multi-select label="Plan" [options]="planes" [(value)]="sel2" hint="Se facturan al cierre del mes." />
      </app-demo-variant-card>
      <app-demo-variant-card title="Sin elegir-todas" description="Solo selección manual." [htmlCode]="h3" [tsCode]="t">
        <sirem-multi-select label="Sedes" [options]="sedes" [(value)]="sel3" [selectAll]="false" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class MultiSelectDemoPage {
  readonly sel = signal<(string | number)[]>(['citas.crear']);
  readonly sel2 = signal<(string | number)[]>([]);
  readonly sel3 = signal<(string | number)[]>([]);
  readonly permisos = [
    { value: 'citas.crear', label: 'Crear citas', hint: 'Agenda', group: 'Agenda', icon: 'fi fi-rr-plus' },
    { value: 'citas.cancelar', label: 'Cancelar citas', group: 'Agenda', icon: 'fi fi-rr-cross' },
    { value: 'hc.ver', label: 'Ver historia', group: 'Clínica', icon: 'fi fi-rr-eye' },
    { value: 'hc.firmar', label: 'Firmar evolución', group: 'Clínica', icon: 'fi fi-rr-pen' },
    { value: 'fac.anular', label: 'Anular facturas', group: 'Cartera', icon: 'fi fi-rr-ban', disabled: true },
  ];
  readonly planes = [
    { value: 'tele', label: 'Telemedicina', hint: 'Consultas virtuales', icon: 'fi fi-rr-video' },
    { value: 'lab', label: 'Laboratorio', hint: 'Resultados en línea', icon: 'fi fi-rr-flask' },
  ];
  readonly sedes = [
    { value: 'norte', label: 'Sede Norte' },
    { value: 'sur', label: 'Sede Sur' },
  ];
  readonly h1 = '<sirem-multi-select label="Permisos del rol" [options]="permisos" [(value)]="sel" />\n<span class="text-sm text-slate-600 w-full">Elegidos: {{ sel().join(\', \') || \'—\' }}</span>';
  readonly h2 = '<sirem-multi-select label="Plan" [options]="planes"\n  [(value)]="sel2" hint="Se facturan al cierre del mes." />';
  readonly h3 = '<sirem-multi-select label="Sedes" [options]="sedes"\n  [(value)]="sel3" [selectAll]="false" />';
  readonly t = `import { signal } from '@angular/core';
import { SiremMultiSelect } from 'deorta-sirem-ui';

readonly sel = signal<(string | number)[]>(['citas.crear']);
readonly sel2 = signal<(string | number)[]>([]);
readonly sel3 = signal<(string | number)[]>([]);
readonly permisos = [
  { value: 'citas.crear', label: 'Crear citas', hint: 'Agenda', group: 'Agenda', icon: 'fi fi-rr-plus' },
  { value: 'citas.cancelar', label: 'Cancelar citas', group: 'Agenda', icon: 'fi fi-rr-cross' },
  { value: 'hc.ver', label: 'Ver historia', group: 'Clínica', icon: 'fi fi-rr-eye' },
  { value: 'hc.firmar', label: 'Firmar evolución', group: 'Clínica', icon: 'fi fi-rr-pen' },
  { value: 'fac.anular', label: 'Anular facturas', group: 'Cartera', icon: 'fi fi-rr-ban', disabled: true },
];
readonly planes = [
  { value: 'tele', label: 'Telemedicina', hint: 'Consultas virtuales', icon: 'fi fi-rr-video' },
  { value: 'lab', label: 'Laboratorio', hint: 'Resultados en línea', icon: 'fi fi-rr-flask' },
];
readonly sedes = [
  { value: 'norte', label: 'Sede Norte' },
  { value: 'sur', label: 'Sede Sur' },
];`;
}
