import { Component, computed, signal } from '@angular/core';
import {
  SiremButton,
  SiremDataTable,
  SiremEmptyState,
  SiremPageHeader,
  SiremSearchField,
  SiremTableColumn,
} from 'deorta-sirem-ui';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

@Component({
  selector: 'app-page-listado-demo-page',
  standalone: true,
  imports: [
    PageDemoShell,
    SiremButton,
    SiremDataTable,
    SiremEmptyState,
    SiremPageHeader,
    SiremSearchField,
  ],
  template: `
    <app-page-demo-shell label="Página de listado" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-slate-950">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
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
      </main>
    </app-page-demo-shell>
  `,
})
export class PageListadoDemoPage {
  readonly q = signal('');

  readonly cols: SiremTableColumn[] = [
    { key: 'nombre', label: 'Paciente', subKey: 'doc' },
    {
      key: 'estado',
      label: 'Estado',
      kind: 'badge',
      badgeTones: { Activa: 'success' },
    },
    { key: 'total', label: 'Total', kind: 'currency', align: 'right' },
  ];

  readonly rows = [
    {
      id: 1,
      nombre: 'María Torres',
      doc: 'CC 1020',
      estado: 'Activa',
      total: 250000,
    },
    {
      id: 2,
      nombre: 'Juan Pérez',
      doc: 'CC 1031',
      estado: 'Activa',
      total: 180000,
    },
  ];

  readonly filtrados = computed(() => {
    const q = this.q().trim().toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter((row) => `${row.nombre} ${row.doc}`.toLowerCase().includes(q));
  });

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'page-listado.html',
      language: 'html',
      code: `<main class="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
  <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
    <sirem-page-header title="Pacientes" subtitle="Óptica Norte">
      <div slot="actions" class="flex gap-2">
        <sirem-button size="sm" variant="secondary">Exportar</sirem-button>
        <sirem-button size="sm">Nuevo</sirem-button>
      </div>
    </sirem-page-header>

    <sirem-search-field
      placeholder="Buscar por nombre o documento…"
      [(value)]="q"
    />

    @if (filtrados().length) {
      <sirem-data-table [columns]="cols" [rows]="filtrados()" />
    } @else {
      <sirem-empty-state
        title="Sin pacientes"
        description="Prueba con otro criterio."
      />
    }
  </div>
</main>`,
    },
    {
      name: 'page-listado.component.ts',
      language: 'typescript',
      code: `import { computed, signal } from '@angular/core';
import {
  SiremDataTable,
  SiremSearchField,
  type SiremTableColumn,
} from 'deorta-sirem-ui';

export class PageListadoPage {
  readonly q = signal('');

  readonly cols: SiremTableColumn[] = [
    { key: 'nombre', label: 'Paciente', subKey: 'doc' },
    {
      key: 'estado',
      label: 'Estado',
      kind: 'badge',
      badgeTones: { Activa: 'success' },
    },
    { key: 'total', label: 'Total', kind: 'currency', align: 'right' },
  ];

  readonly rows = [
    { id: 1, nombre: 'María Torres', doc: 'CC 1020', estado: 'Activa', total: 250000 },
    { id: 2, nombre: 'Juan Pérez', doc: 'CC 1031', estado: 'Activa', total: 180000 },
  ];

  readonly filtrados = computed(() => {
    const q = this.q().trim().toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter((row) =>
      (row.nombre + ' ' + row.doc).toLowerCase().includes(q),
    );
  });
}`,
    },
  ];
}
