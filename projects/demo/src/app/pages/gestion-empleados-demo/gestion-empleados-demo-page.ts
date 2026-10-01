import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton, SiremDataTable, SiremDate, SiremEmptyState, SiremFieldGroup,
  SiremInput, SiremModal, SiremPageHeader, SiremSearchField, SiremSelect,
  SiremSelectOption, SiremStatCard, SiremTableColumn,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { EMPLEADOS, type ErpEmpleado } from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Opciones de select a partir de sus etiquetas (value = label). */
const opciones = (...valores: string[]): SiremSelectOption[] =>
  valores.map((v) => ({ value: v, label: v }));

/**
 * Gestión de empleados: ficha técnica con datos personales, salariales
 * y prestacionales (EPS, fondo de pensiones y ARL) de la nómina.
 */
@Component({
  selector: 'app-gestion-empleados-demo-page',
  standalone: true,
  imports: [
    PageDemoShell, SiremButton, SiremDataTable, SiremDate, SiremEmptyState,
    SiremFieldGroup, SiremInput, SiremModal, SiremPageHeader, SiremSearchField,
    SiremSelect, SiremStatCard,
  ],
  template: `
    <app-page-demo-shell label="Gestión de empleados" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header title="Gestión de empleados" subtitle="Ficha técnica · datos personales, salariales y prestacionales">
            <div slot="actions" class="flex gap-2">
              <sirem-button size="sm" (pressed)="nuevoEmpleado()">Nuevo empleado</sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Empleados activos" [value]="activos()" />
            <sirem-stat-card label="Nómina mensual" [value]="cop(nominaMensual())" color="info" />
            <sirem-stat-card label="En licencia" [value]="licencias()" color="warning" />
            <sirem-stat-card label="Ingreso promedio" [value]="cop(ingresoPromedio())" color="success" />
          </div>

          <div class="grid gap-3 md:grid-cols-[1fr_13rem]">
            <sirem-search-field placeholder="Buscar por nombre o documento…" [(value)]="q" />
            <sirem-select-field label="Estado" placeholder="Todos" [options]="estadoOptions" [(value)]="estado" />
          </div>

          @if (filas().length) {
            <sirem-data-table [columns]="cols" [rows]="filas()" (rowClicked)="abrir($event)" />
          } @else {
            <sirem-empty-state title="Sin empleados" description="Ningún empleado coincide con los filtros actuales." />
          }
        </div>

        <sirem-modal [(open)]="fichaAbierta" [title]="seleccion()?.nombre ?? 'Ficha del empleado'"
          size="lg" [actions]="acciones" (actionPressed)="accion($event.label)">
          @if (seleccion(); as emp) {
            <div class="flex flex-col gap-4">
              <sirem-field-group title="Datos personales" description="Identificación y antigüedad en la firma.">
                <sirem-input-field class="col-span-12 sm:col-span-6" label="Nombre completo" [value]="emp.nombre" [readonly]="true" />
                <sirem-input-field class="col-span-12 sm:col-span-6" label="Documento" [value]="emp.documento" [readonly]="true" />
                <sirem-date-field class="col-span-12 sm:col-span-6" label="Fecha de ingreso" [(value)]="ingreso" />
              </sirem-field-group>
              <sirem-field-group title="Datos salariales y prestacionales" description="Salario y entidades vigentes del colaborador.">
                <sirem-input-field class="col-span-12 sm:col-span-6" label="Salario mensual (COP)" type="number" [(value)]="salario" />
                <sirem-select-field class="col-span-12 sm:col-span-6" label="EPS" [options]="epsOptions" [(value)]="eps" />
                <sirem-select-field class="col-span-12 sm:col-span-6" label="Fondo de pensiones" [options]="pensionOptions" [(value)]="fondo" />
                <sirem-select-field class="col-span-12 sm:col-span-6" label="ARL" [options]="arlOptions" [(value)]="arl" />
              </sirem-field-group>
            </div>
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class GestionEmpleadosDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia editable: la demo guarda los cambios de la ficha en memoria. */
  readonly empleados = signal<ErpEmpleado[]>(EMPLEADOS.map((e) => ({ ...e })));

  readonly q = signal('');
  readonly estado = signal<string | number | null>(null);

  readonly fichaAbierta = signal(false);
  readonly seleccion = signal<ErpEmpleado | null>(null);

  /** Borrador de edición de la ficha abierta. */
  readonly ingreso = signal<string | null>(null);
  readonly salario = signal<string | number | (string | number)[] | null>(null);
  readonly eps = signal<string | number | null>(null);
  readonly fondo = signal<string | number | null>(null);
  readonly arl = signal<string | number | null>(null);

  readonly estadoOptions = opciones('Activo', 'Licencia', 'Retirado');
  readonly epsOptions = opciones('Sanitas', 'Sura', 'Nueva EPS', 'Compensar');
  readonly pensionOptions = opciones('Porvenir', 'Colpensiones', 'Skandia', 'Protección');
  readonly arlOptions = opciones('Positiva', 'Sura', 'Colmena');

  readonly cols: SiremTableColumn[] = [
    { key: 'avatar', label: 'Empleado', kind: 'avatar' },
    { key: 'documento', label: 'Documento' },
    { key: 'cargo', label: 'Cargo', subKey: 'eps' },
    { key: 'salario', label: 'Salario', kind: 'currency', align: 'right' },
    { key: 'estado', label: 'Estado', kind: 'badge',
      badgeTones: { Activo: 'success', Licencia: 'warning', Retirado: 'neutral' } },
  ];

  readonly acciones = [
    { label: 'Cancelar', variant: 'secondary' as const }, { label: 'Guardar ficha' },
  ];

  /** Filtro por búsqueda (nombre/documento) y estado. */
  readonly filas = computed<Record<string, unknown>[]>(() => {
    const texto = this.q().trim().toLowerCase();
    const estado = this.estado();
    return this.empleados()
      .filter((e) => {
        const coincide = !texto || (e.nombre + ' ' + e.documento).toLowerCase().includes(texto);
        return coincide && (!estado || e.estado === estado);
      })
      .map((e): Record<string, unknown> => ({ ...e, avatar: { name: e.nombre } }));
  });

  readonly activos = computed(() => this.empleados().filter((e) => e.estado === 'Activo').length);
  readonly licencias = computed(() => this.empleados().filter((e) => e.estado === 'Licencia').length);
  readonly nominaMensual = computed(() => this.empleados().reduce((acc, e) => acc + e.salario, 0));
  readonly ingresoPromedio = computed(() => {
    const lista = this.empleados();
    return lista.length ? Math.round(lista.reduce((acc, e) => acc + e.salario, 0) / lista.length) : 0;
  });

  /** Formato COP sin decimales para las tarjetas KPI. */
  cop(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(valor);
  }

  nuevoEmpleado(): void {
    this.toast.info({
      title: 'Nuevo empleado',
      description: 'Se abre el formulario de ingreso de personal en blanco.',
      duration: 3_000,
    });
  }

  /** Abre la ficha y carga el borrador de edición con sus datos. */
  abrir(fila: Record<string, unknown>): void {
    const emp = this.empleados().find((e) => e.id === fila['id']);
    if (!emp) return;
    this.seleccion.set(emp);
    this.ingreso.set(emp.fechaIngreso);
    this.salario.set(emp.salario);
    this.eps.set(emp.eps);
    this.fondo.set(emp.fondoPension);
    this.arl.set(emp.arl);
    this.fichaAbierta.set(true);
  }

  /** Guarda la ficha en la copia local o cancela, con toast de estado. */
  accion(label: string): void {
    const emp = this.seleccion();
    this.fichaAbierta.set(false);
    if (!emp || label !== 'Guardar ficha') return;

    const actualizado: ErpEmpleado = {
      ...emp,
      salario: Number(this.salario() ?? emp.salario),
      eps: String(this.eps() ?? emp.eps),
      fondoPension: String(this.fondo() ?? emp.fondoPension),
      arl: String(this.arl() ?? emp.arl),
      fechaIngreso: this.ingreso() ?? emp.fechaIngreso,
    };
    this.empleados.update((lista) => lista.map((e) => (e.id === emp.id ? actualizado : e)));
    this.seleccion.set(actualizado);
    this.toast.success({
      title: 'Ficha actualizada',
      description: actualizado.nombre + ' · datos prestacionales guardados.',
      duration: 3_500,
    });
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'gestion-empleados.html',
      language: 'html',
      code: `<sirem-page-header title="Gestión de empleados" subtitle="Ficha técnica · datos personales y prestacionales">
  <div slot="actions" class="flex gap-2">
    <sirem-button size="sm" (pressed)="nuevoEmpleado()">Nuevo empleado</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Empleados activos" [value]="activos()" />
  <sirem-stat-card label="Nómina mensual" [value]="cop(nominaMensual())" color="info" />
  <sirem-stat-card label="En licencia" [value]="licencias()" color="warning" />
  <sirem-stat-card label="Ingreso promedio" [value]="cop(ingresoPromedio())" color="success" />
</div>

<div class="grid gap-3 md:grid-cols-[1fr_13rem]">
  <sirem-search-field placeholder="Buscar por nombre o documento…" [(value)]="q" />
  <sirem-select-field label="Estado" placeholder="Todos" [options]="estadoOptions" [(value)]="estado" />
</div>

@if (filas().length) {
  <sirem-data-table [columns]="cols" [rows]="filas()" (rowClicked)="abrir($event)" />
} @else {
  <sirem-empty-state title="Sin empleados" description="Ningún empleado coincide con los filtros." />
}

<sirem-modal [(open)]="fichaAbierta" [title]="seleccion()?.nombre ?? 'Ficha del empleado'"
  size="lg" [actions]="acciones" (actionPressed)="accion($event.label)">
  @if (seleccion(); as emp) {
    <div class="flex flex-col gap-4">
      <sirem-field-group title="Datos personales">
        <sirem-input-field class="col-span-12 sm:col-span-6" label="Nombre completo" [value]="emp.nombre" [readonly]="true" />
        <sirem-input-field class="col-span-12 sm:col-span-6" label="Documento" [value]="emp.documento" [readonly]="true" />
        <sirem-date-field class="col-span-12 sm:col-span-6" label="Fecha de ingreso" [(value)]="ingreso" />
      </sirem-field-group>
      <sirem-field-group title="Datos salariales y prestacionales">
        <sirem-input-field class="col-span-12 sm:col-span-6" label="Salario mensual (COP)" type="number" [(value)]="salario" />
        <sirem-select-field class="col-span-12 sm:col-span-6" label="EPS" [options]="epsOptions" [(value)]="eps" />
        <sirem-select-field class="col-span-12 sm:col-span-6" label="Fondo de pensiones" [options]="pensionOptions" [(value)]="fondo" />
        <sirem-select-field class="col-span-12 sm:col-span-6" label="ARL" [options]="arlOptions" [(value)]="arl" />
      </sirem-field-group>
    </div>
  }
</sirem-modal>`,
    },
    {
      name: 'gestion-empleados.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremDataTable, SiremDate, SiremEmptyState, SiremFieldGroup, SiremInput,
  SiremModal, SiremSelect, SiremSelectOption, SiremTableColumn,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { EMPLEADOS, type ErpEmpleado } from '../../data/erp-mock';

const opciones = (...valores: string[]): SiremSelectOption[] =>
  valores.map(v => ({ value: v, label: v }));

export class GestionEmpleadosPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia editable: la demo guarda los cambios de la ficha en memoria. */
  readonly empleados = signal<ErpEmpleado[]>(EMPLEADOS.map(e => ({ ...e })));
  readonly q = signal('');
  readonly estado = signal<string | number | null>(null);
  readonly fichaAbierta = signal(false);
  readonly seleccion = signal<ErpEmpleado | null>(null);

  /** Borrador de edición de la ficha abierta. */
  readonly ingreso = signal<string | null>(null);
  readonly salario = signal<string | number | (string | number)[] | null>(null);
  readonly eps = signal<string | number | null>(null);
  readonly fondo = signal<string | number | null>(null);
  readonly arl = signal<string | number | null>(null);

  readonly estadoOptions = opciones('Activo', 'Licencia', 'Retirado');
  readonly epsOptions = opciones('Sanitas', 'Sura', 'Nueva EPS', 'Compensar');
  readonly pensionOptions = opciones('Porvenir', 'Colpensiones', 'Skandia', 'Protección');
  readonly arlOptions = opciones('Positiva', 'Sura', 'Colmena');

  readonly cols: SiremTableColumn[] = [
    { key: 'avatar', label: 'Empleado', kind: 'avatar' },
    { key: 'documento', label: 'Documento' },
    { key: 'cargo', label: 'Cargo', subKey: 'eps' },
    { key: 'salario', label: 'Salario', kind: 'currency', align: 'right' },
    { key: 'estado', label: 'Estado', kind: 'badge',
      badgeTones: { Activo: 'success', Licencia: 'warning', Retirado: 'neutral' } },
  ];

  readonly acciones = [
    { label: 'Cancelar', variant: 'secondary' as const }, { label: 'Guardar ficha' },
  ];

  /** Filtro por búsqueda (nombre/documento) y estado. */
  readonly filas = computed<Record<string, unknown>[]>(() => {
    const texto = this.q().trim().toLowerCase();
    const estado = this.estado();
    return this.empleados()
      .filter(e => {
        const coincide = !texto || (e.nombre + ' ' + e.documento).toLowerCase().includes(texto);
        return coincide && (!estado || e.estado === estado);
      })
      .map(e => ({ ...e, avatar: { name: e.nombre } }));
  });

  readonly activos = computed(() => this.empleados().filter(e => e.estado === 'Activo').length);
  readonly licencias = computed(() => this.empleados().filter(e => e.estado === 'Licencia').length);
  readonly nominaMensual = computed(() => this.empleados().reduce((acc, e) => acc + e.salario, 0));
  readonly ingresoPromedio = computed(() => {
    const lista = this.empleados();
    return lista.length ? Math.round(lista.reduce((acc, e) => acc + e.salario, 0) / lista.length) : 0;
  });

  nuevoEmpleado(): void {
    this.toast.info({ title: 'Nuevo empleado', description: 'Formulario de ingreso en blanco.', duration: 3_000 });
  }

  cop(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(valor);
  }

  abrir(fila: Record<string, unknown>): void {
    const emp = this.empleados().find(e => e.id === fila['id']);
    if (!emp) return;
    this.seleccion.set(emp);
    this.ingreso.set(emp.fechaIngreso);
    this.salario.set(emp.salario);
    this.eps.set(emp.eps);
    this.fondo.set(emp.fondoPension);
    this.arl.set(emp.arl);
    this.fichaAbierta.set(true);
  }

  /** Guarda la ficha en la copia local o cancela, con toast de estado. */
  accion(label: string): void {
    const emp = this.seleccion();
    this.fichaAbierta.set(false);
    if (!emp || label !== 'Guardar ficha') return;

    const actualizado: ErpEmpleado = {
      ...emp,
      salario: Number(this.salario() ?? emp.salario),
      eps: String(this.eps() ?? emp.eps),
      fondoPension: String(this.fondo() ?? emp.fondoPension),
      arl: String(this.arl() ?? emp.arl),
      fechaIngreso: this.ingreso() ?? emp.fechaIngreso,
    };
    this.empleados.update(lista => lista.map(e => (e.id === emp.id ? actualizado : e)));
    this.seleccion.set(actualizado);
    this.toast.success({
      title: 'Ficha actualizada',
      description: actualizado.nombre + ' · datos prestacionales guardados.',
      duration: 3_500,
    });
  }
}`,
    },
  ];
}
