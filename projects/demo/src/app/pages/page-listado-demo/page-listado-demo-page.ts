import { Component, computed, signal } from '@angular/core';
import {
  SiremButton,
  SiremDataTable,
  SiremEmptyState,
  SiremPageHeader,
  SiremSearchField,
  SiremTableColumn,
} from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-page-listado-demo-page',
  standalone: true,
  imports: [
    DemoPageLayout,
    DemoVariantCard,
    SiremButton,
    SiremDataTable,
    SiremEmptyState,
    SiremPageHeader,
    SiremSearchField,
  ],
  template: `
    <app-demo-page-layout title="Página: Listado" category="Páginas" subtitle="Header + buscador + tabla con filtro en vivo.">
      <app-demo-variant-card title="Vista completa" description="Filtra por nombre o documento." [htmlCode]="h1" [tsCode]="t">
        <div class="flex w-full flex-col gap-3">
          <sirem-page-header title="Pacientes" subtitle="Óptica Norte">
            <div slot="actions" class="flex gap-2">
              <sirem-button size="sm" variant="secondary">Exportar</sirem-button>
              <sirem-button size="sm">Nuevo</sirem-button>
            </div>
          </sirem-page-header>
          <sirem-search-field placeholder="Buscar por nombre o documento…" [(value)]="q" />
          @if (filtrados().length) {
            <sirem-data-table [columns]="cols" [rows]="filtrados()" />
          } @else {
            <sirem-empty-state title="Sin pacientes" description="Prueba con otro criterio." />
          }
        </div>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class PageListadoDemoPage {
  readonly q = signal('');

  readonly cols: SiremTableColumn[] = [
    { key: 'nombre', label: 'Paciente', subKey: 'doc' },
    { key: 'estado', label: 'Estado', kind: 'badge', badgeTones: { Activa: 'success' } },
    { key: 'total', label: 'Total', kind: 'currency', align: 'right' },
  ];

  readonly rows = [
    { id: 1, nombre: 'María Torres', doc: 'CC 1020', estado: 'Activa', total: 250000 },
    { id: 2, nombre: 'Juan Pérez', doc: 'CC 1031', estado: 'Activa', total: 180000 },
  ];

  readonly filtrados = computed(() => {
    const q = this.q().trim().toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter((r) => `${r.nombre} ${r.doc}`.toLowerCase().includes(q));
  });

  readonly h1 = `<sirem-page-header title="Pacientes" subtitle="Óptica Norte">
  <div slot="actions" class="flex gap-2">
    <sirem-button size="sm" variant="secondary">Exportar</sirem-button>
    <sirem-button size="sm">Nuevo</sirem-button>
  </div>
</sirem-page-header>
<sirem-search-field placeholder="Buscar por nombre o documento…" [(value)]="q" />
<sirem-data-table [columns]="cols" [rows]="filtrados()" />`;
  readonly t = `import { computed, signal } from '@angular/core';
import { SiremDataTable, SiremTableColumn } from 'deorta-sirem-ui';

readonly q = signal('');
readonly cols: SiremTableColumn[] = [
  { key: 'nombre', label: 'Paciente', subKey: 'doc' },
  { key: 'estado', label: 'Estado', kind: 'badge', badgeTones: { Activa: 'success' } },
  { key: 'total', label: 'Total', kind: 'currency', align: 'right' },
];
readonly filtrados = computed(() => {
  const q = this.q().trim().toLowerCase();
  if (!q) return this.rows;
  return this.rows.filter((r) => (r.nombre + ' ' + r.doc).toLowerCase().includes(q));
});`;
}
