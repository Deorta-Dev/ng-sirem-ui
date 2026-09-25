import { Component, signal } from '@angular/core';
import { SiremDataTable, SiremTableColumn } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-data-table-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremDataTable],
  template: `
    <app-demo-page-layout title="Data Table" category="Datos" subtitle="sirem-data-table — listados ordenables y seleccionables.">
      <app-demo-variant-card title="Texto y moneda" description="Columnas tipadas con formato COP." [htmlCode]="h1" [tsCode]="t">
        <sirem-data-table [columns]="cols" [rows]="rows" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Badge + avatar" description="Estados y responsables." [htmlCode]="h2" [tsCode]="t">
        <sirem-data-table [columns]="cols2" [rows]="rows2" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Seleccionable" description="Checkbox con doble vía." [htmlCode]="h3" [tsCode]="t2">
        <sirem-data-table [columns]="cols" [rows]="rows" [selectable]="true" [(selection)]="sel" />
        <span class="text-sm text-slate-600">Seleccionados: {{ sel().length }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card title="Dos líneas" description="subKey pinta detalle tenue bajo el valor." [htmlCode]="h5" [tsCode]="t">
        <sirem-data-table [columns]="cols3" [rows]="rows3" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Vacía" description="emptyText personalizable." [htmlCode]="h4" [tsCode]="t">
        <sirem-data-table [columns]="cols" [rows]="[]" emptyText="Sin pacientes con ese filtro." />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class DataTableDemoPage {
  readonly sel = signal<Record<string, unknown>[]>([]);
  readonly cols: SiremTableColumn[] = [
    { key: 'nombre', label: 'Paciente' },
    { key: 'doc', label: 'Documento' },
    { key: 'total', label: 'Total', kind: 'currency', align: 'right' },
  ];
  readonly rows = [
    { id: 1, nombre: 'María Torres', doc: 'CC 1020', total: 250000 },
    { id: 2, nombre: 'Juan Pérez', doc: 'CC 1031', total: 180000 },
  ];
  readonly cols2: SiremTableColumn[] = [
    { key: 'paciente', label: 'Paciente', kind: 'avatar' },
    { key: 'estado', label: 'Estado', kind: 'badge', badgeTones: { Activa: 'success', Pendiente: 'warning' } },
  ];
  readonly rows2 = [
    { id: 1, paciente: { name: 'María Torres' }, estado: 'Activa' },
    { id: 2, paciente: { name: 'Juan Pérez' }, estado: 'Pendiente' },
  ];
  readonly cols3: SiremTableColumn[] = [
    { key: 'nombre', label: 'Paciente', subKey: 'doc' },
    { key: 'cita', label: 'Cita', kind: 'date', subKey: 'sede' },
    { key: 'total', label: 'Total', kind: 'currency', align: 'right', subKey: 'estadoPago' },
  ];
  readonly rows3 = [
    { id: 1, nombre: 'María Torres', doc: 'CC 1020 · Sura', cita: '2026-09-24', sede: 'Sede Norte', total: 250000, estadoPago: 'Pagada' },
    { id: 2, nombre: 'Juan Pérez', doc: 'CC 1031 · Sanitas', cita: '2026-09-25', sede: 'Sede Sur', total: 180000, estadoPago: 'Pendiente' },
  ];
  readonly h1 = '<sirem-data-table [columns]="cols" [rows]="rows" />  <!-- kind currency -->';
  readonly h2 = '<sirem-data-table [columns]="cols2" [rows]="rows2" />  <!-- avatar + badge -->';
  readonly h3 = '<sirem-data-table [columns]="cols" [rows]="rows" [selectable]="true" [(selection)]="sel" />';
  readonly h4 = '<sirem-data-table [columns]="cols" [rows]="[]" emptyText="Sin pacientes con ese filtro." />';
  readonly h5 = '<sirem-data-table [columns]="cols3" [rows]="rows3" />';
  readonly t = `import { signal } from '@angular/core';
import { SiremDataTable, SiremTableColumn } from 'deorta-sirem-ui';

readonly cols: SiremTableColumn[] = [
  { key: 'nombre', label: 'Paciente' },
  { key: 'doc', label: 'Documento' },
  { key: 'total', label: 'Total', kind: 'currency', align: 'right' },
];
readonly rows = [
  { id: 1, nombre: 'María Torres', doc: 'CC 1020', total: 250000 },
  { id: 2, nombre: 'Juan Pérez', doc: 'CC 1031', total: 180000 },
];
readonly cols2: SiremTableColumn[] = [
  { key: 'paciente', label: 'Paciente', kind: 'avatar' },
  { key: 'estado', label: 'Estado', kind: 'badge', badgeTones: { Activa: 'success', Pendiente: 'warning' } },
];
readonly rows2 = [
  { id: 1, paciente: { name: 'María Torres' }, estado: 'Activa' },
  { id: 2, paciente: { name: 'Juan Pérez' }, estado: 'Pendiente' },
];
readonly cols3: SiremTableColumn[] = [
  { key: 'nombre', label: 'Paciente', subKey: 'doc' },
  { key: 'cita', label: 'Cita', kind: 'date', subKey: 'sede' },
  { key: 'total', label: 'Total', kind: 'currency', align: 'right', subKey: 'estadoPago' },
];
readonly rows3 = [
  { id: 1, nombre: 'María Torres', doc: 'CC 1020 · Sura', cita: '2026-09-24', sede: 'Sede Norte', total: 250000, estadoPago: 'Pagada' },
  { id: 2, nombre: 'Juan Pérez', doc: 'CC 1031 · Sanitas', cita: '2026-09-25', sede: 'Sede Sur', total: 180000, estadoPago: 'Pendiente' },
];`;
  readonly t2 = "import { signal } from '@angular/core';\n\nreadonly sel = signal<Record<string, unknown>[]>([]);";
}
