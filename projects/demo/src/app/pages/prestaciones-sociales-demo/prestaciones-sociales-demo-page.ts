import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton, SiremDataTable, SiremEmptyState, SiremFieldGroup, SiremInput, SiremModal,
  SiremPageHeader, SiremSelectOption, SiremStatCard, SiremTableColumn,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { EMPLEADOS, PRESTACIONES, type ErpPrestacion } from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/**
 * Liquidación de prestaciones sociales: prima de servicios, cesantías,
 * intereses de cesantías y vacaciones por empleado y periodo.
 */
@Component({
  selector: 'app-prestaciones-sociales-demo-page',
  standalone: true,
  imports: [
    PageDemoShell, SiremButton, SiremDataTable, SiremEmptyState, SiremFieldGroup,
    SiremInput, SiremModal, SiremPageHeader, SiremStatCard,
  ],
  template: `
    <app-page-demo-shell label="Prestaciones sociales" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header title="Liquidación de prestaciones sociales" subtitle="Prima, cesantías, intereses de cesantías y vacaciones">
            <div slot="actions" class="flex gap-2">
              <sirem-button size="sm" (pressed)="calcularPeriodo()">Calcular periodo</sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 md:grid-cols-2">
            <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Empleado" [options]="empleadoOptions" [(value)]="empleadoSel" />
            <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Periodo" [options]="periodoOptions" [(value)]="periodo" />
          </div>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Prima de servicios" [value]="cop(prima())" />
            <sirem-stat-card label="Cesantías" [value]="cop(cesantias())" color="info" />
            <sirem-stat-card label="Intereses de cesantías" [value]="cop(intereses())" color="warning" />
            <sirem-stat-card label="Vacaciones" [value]="cop(vacaciones())" color="success" />
          </div>

          @if (filas().length) {
            <sirem-data-table [columns]="cols" [rows]="filas()" (rowClicked)="abrir($event)" />
          } @else {
            <sirem-empty-state title="Sin prestaciones" description="Este empleado no tiene prestaciones en el periodo seleccionado." />
          }
        </div>

        <sirem-modal [(open)]="detalleAbierto" [title]="detalle()?.concepto ?? 'Prestación'"
          [actions]="acciones" (actionPressed)="accion($event.label)">
          @if (detalle(); as p) {
            <sirem-field-group title="Detalle del cálculo" [description]="p.empleado + ' · periodo ' + p.periodo">
              <div class="col-span-12 flex justify-between text-sm"><span>Base</span><span class="font-semibold">{{ cop(p.base) }}</span></div>
              <div class="col-span-12 flex justify-between text-sm"><span>Días liquidados</span><span class="font-semibold">{{ p.dias }}</span></div>
              <div class="col-span-12 flex justify-between text-sm"><span>Tasa sobre la base</span><span class="font-semibold">{{ tasa(p) }} %</span></div>
              <div class="col-span-12 flex justify-between text-sm"><span>Valor</span><span class="font-semibold">{{ cop(p.valor) }}</span></div>
              <div class="col-span-12 flex justify-between text-sm"><span>Estado</span><span class="font-semibold">{{ p.estado }}</span></div>
            </sirem-field-group>
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class PrestacionesSocialesDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia editable: la demo cambia los estados en memoria. */
  readonly prestaciones = signal<ErpPrestacion[]>(PRESTACIONES.map((p) => ({ ...p })));

  readonly empleadoSel = signal<string | number | null>(EMPLEADOS[0]?.nombre ?? null);
  readonly periodo = signal<string | number | null>('2026 S1');

  readonly detalleAbierto = signal(false);
  readonly seleccion = signal<ErpPrestacion | null>(null);
  readonly detalle = computed(() => this.seleccion());

  readonly empleadoOptions: SiremSelectOption[] = EMPLEADOS.map((e) => ({
    value: e.nombre, label: e.nombre,
  }));
  readonly periodoOptions: SiremSelectOption[] = [
    { value: '2026 S1', label: '2026 S1' },
    { value: '2026 S2', label: '2026 S2' },
  ];

  readonly cols: SiremTableColumn[] = [
    { key: 'concepto', label: 'Concepto', subKey: 'periodo' },
    { key: 'base', label: 'Base', kind: 'currency' },
    { key: 'dias', label: 'Días', kind: 'number', align: 'right' },
    { key: 'valor', label: 'Valor', kind: 'currency', align: 'right' },
    { key: 'estado', label: 'Estado', kind: 'badge',
      badgeTones: { Calculado: 'neutral', Devengado: 'info', Pagado: 'success' } },
  ];

  readonly acciones = [{ label: 'Marcar como pagado' }];

  /** Prestaciones del empleado elegido (base de las tarjetas KPI). */
  readonly delEmpleado = computed(() =>
    this.prestaciones().filter((p) => p.empleado === this.empleadoSel()),
  );

  /** Filas de la tabla: empleado + periodo (el anual '2026' aplica a ambos semestres). */
  readonly filas = computed(() =>
    this.delEmpleado().filter((p) => this.coincidePeriodo(p)),
  );

  readonly prima = computed(() => this.sumaConcepto('Prima de servicios'));
  readonly cesantias = computed(() => this.sumaConcepto('Cesantías'));
  readonly intereses = computed(() => this.sumaConcepto('Intereses de cesantías'));
  readonly vacaciones = computed(() => this.sumaConcepto('Vacaciones'));

  private sumaConcepto(concepto: string): number {
    return this.delEmpleado()
      .filter((p) => p.concepto === concepto)
      .reduce((acc, p) => acc + p.valor, 0);
  }

  private coincidePeriodo(p: ErpPrestacion): boolean {
    const sel = String(this.periodo() ?? '');
    return p.periodo === sel || (p.periodo === '2026' && sel.startsWith('2026'));
  }

  cop(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(valor);
  }

  /** Porcentaje del valor generado sobre la base. */
  tasa(p: ErpPrestacion): number {
    return p.base > 0 ? Math.round((p.valor / p.base) * 1000) / 10 : 0;
  }

  abrir(fila: Record<string, unknown>): void {
    const prest = this.prestaciones().find((p) => p.id === fila['id']);
    if (!prest) return;
    this.seleccion.set(prest);
    this.detalleAbierto.set(true);
  }

  /** Marca la prestación seleccionada como pagada, con toast de estado. */
  accion(label: string): void {
    const prest = this.seleccion();
    this.detalleAbierto.set(false);
    if (!prest || label !== 'Marcar como pagado') return;

    if (prest.estado === 'Pagado') {
      this.toast.info({
        title: 'Ya pagada',
        description: prest.concepto + ' ya se encuentra pagada.',
        duration: 3_000,
      });
      return;
    }

    const pagada: ErpPrestacion = { ...prest, estado: 'Pagado' };
    this.prestaciones.update((lista) => lista.map((p) => (p.id === pagada.id ? pagada : p)));
    this.seleccion.set(pagada);
    this.toast.success({
      title: pagada.concepto + ' pagada',
      description: this.cop(pagada.valor) + ' consignados a ' + pagada.empleado + '.',
      duration: 4_000,
    });
  }

  /** Pasa los conceptos 'Calculado' a 'Devengado' con un recálculo. */
  calcularPeriodo(): void {
    this.prestaciones.update((lista) =>
      lista.map((p) => (p.estado === 'Calculado' ? { ...p, estado: 'Devengado' as const } : p)),
    );
    this.toast.info({
      title: 'Prestaciones recalculadas',
      description: 'Cesantías e intereses actualizados a 30/09/2026.',
      duration: 4_000,
    });
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'prestaciones-sociales.html',
      language: 'html',
      code: `<sirem-page-header title="Liquidación de prestaciones sociales"
  subtitle="Prima, cesantías, intereses de cesantías y vacaciones">
  <div slot="actions" class="flex gap-2">
    <sirem-button size="sm" (pressed)="calcularPeriodo()">Calcular periodo</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 md:grid-cols-2">
  <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Empleado" [options]="empleadoOptions" [(value)]="empleadoSel" />
  <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Periodo" [options]="periodoOptions" [(value)]="periodo" />
</div>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Prima de servicios" [value]="cop(prima())" />
  <sirem-stat-card label="Cesantías" [value]="cop(cesantias())" color="info" />
  <sirem-stat-card label="Intereses de cesantías" [value]="cop(intereses())" color="warning" />
  <sirem-stat-card label="Vacaciones" [value]="cop(vacaciones())" color="success" />
</div>

@if (filas().length) {
  <sirem-data-table [columns]="cols" [rows]="filas()" (rowClicked)="abrir($event)" />
} @else {
  <sirem-empty-state title="Sin prestaciones"
    description="Este empleado no tiene prestaciones en el periodo seleccionado." />
}

<sirem-modal [(open)]="detalleAbierto" [title]="detalle()?.concepto ?? 'Prestación'"
  [actions]="acciones" (actionPressed)="accion($event.label)">
  @if (detalle(); as p) {
    <sirem-field-group title="Detalle del cálculo" [description]="p.empleado + ' · periodo ' + p.periodo">
      <div class="col-span-12 flex justify-between text-sm"><span>Base</span><span class="font-semibold">{{ cop(p.base) }}</span></div>
      <div class="col-span-12 flex justify-between text-sm"><span>Días liquidados</span><span class="font-semibold">{{ p.dias }}</span></div>
      <div class="col-span-12 flex justify-between text-sm"><span>Tasa sobre la base</span><span class="font-semibold">{{ tasa(p) }} %</span></div>
      <div class="col-span-12 flex justify-between text-sm"><span>Valor</span><span class="font-semibold">{{ cop(p.valor) }}</span></div>
      <div class="col-span-12 flex justify-between text-sm"><span>Estado</span><span class="font-semibold">{{ p.estado }}</span></div>
    </sirem-field-group>
  }
</sirem-modal>`,
    },
    {
      name: 'prestaciones-sociales.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremDataTable, SiremEmptyState, SiremFieldGroup, SiremModal, SiremInput,
  SiremSelectOption, SiremStatCard, SiremTableColumn,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { EMPLEADOS, PRESTACIONES, type ErpPrestacion } from '../../data/erp-mock';

export class PrestacionesSocialesPage {
  private readonly toast = inject(DynamicToastService);

  readonly prestaciones = signal<ErpPrestacion[]>(PRESTACIONES.map(p => ({ ...p })));
  readonly empleadoSel = signal<string | number | null>(EMPLEADOS[0]?.nombre ?? null);
  readonly periodo = signal<string | number | null>('2026 S1');
  readonly seleccion = signal<ErpPrestacion | null>(null);
  readonly detalleAbierto = signal(false);
  readonly detalle = computed(() => this.seleccion());

  readonly empleadoOptions: SiremSelectOption[] =
    EMPLEADOS.map(e => ({ value: e.nombre, label: e.nombre }));
  readonly periodoOptions: SiremSelectOption[] = [
    { value: '2026 S1', label: '2026 S1' }, { value: '2026 S2', label: '2026 S2' },
  ];

  readonly cols: SiremTableColumn[] = [
    { key: 'concepto', label: 'Concepto', subKey: 'periodo' },
    { key: 'base', label: 'Base', kind: 'currency' },
    { key: 'dias', label: 'Días', kind: 'number', align: 'right' },
    { key: 'valor', label: 'Valor', kind: 'currency', align: 'right' },
    { key: 'estado', label: 'Estado', kind: 'badge',
      badgeTones: { Calculado: 'neutral', Devengado: 'info', Pagado: 'success' } },
  ];

  readonly acciones = [{ label: 'Marcar como pagado' }];

  readonly delEmpleado = computed(() =>
    this.prestaciones().filter(p => p.empleado === this.empleadoSel()),
  );
  readonly filas = computed(() => this.delEmpleado().filter(p => this.coincidePeriodo(p)));

  readonly prima = computed(() => this.sumaConcepto('Prima de servicios'));
  readonly cesantias = computed(() => this.sumaConcepto('Cesantías'));
  readonly intereses = computed(() => this.sumaConcepto('Intereses de cesantías'));
  readonly vacaciones = computed(() => this.sumaConcepto('Vacaciones'));

  private sumaConcepto(concepto: string): number {
    return this.delEmpleado().filter(p => p.concepto === concepto).reduce((acc, p) => acc + p.valor, 0);
  }

  /** El periodo anual '2026' se muestra en ambos semestres. */
  private coincidePeriodo(p: ErpPrestacion): boolean {
    const sel = String(this.periodo() ?? '');
    return p.periodo === sel || (p.periodo === '2026' && sel.startsWith('2026'));
  }

  cop(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(valor);
  }

  tasa(p: ErpPrestacion): number {
    return p.base > 0 ? Math.round((p.valor / p.base) * 1000) / 10 : 0;
  }

  abrir(fila: Record<string, unknown>): void {
    const prest = this.prestaciones().find(p => p.id === fila['id']);
    if (!prest) return;
    this.seleccion.set(prest);
    this.detalleAbierto.set(true);
  }

  accion(label: string): void {
    const prest = this.seleccion();
    this.detalleAbierto.set(false);
    if (!prest || label !== 'Marcar como pagado') return;

    const pagada: ErpPrestacion = { ...prest, estado: 'Pagado' };
    this.prestaciones.update(lista => lista.map(p => (p.id === pagada.id ? pagada : p)));
    this.seleccion.set(pagada);
    this.toast.success({
      title: pagada.concepto + ' pagada',
      description: this.cop(pagada.valor) + ' consignados a ' + pagada.empleado + '.',
      duration: 4_000,
    });
  }

  calcularPeriodo(): void {
    this.prestaciones.update(lista => lista.map(p =>
      p.estado === 'Calculado' ? { ...p, estado: 'Devengado' as const } : p,
    ));
    this.toast.info({
      title: 'Prestaciones recalculadas',
      description: 'Cesantías e intereses actualizados a 30/09/2026.',
      duration: 4_000,
    });
  }
}`,
    },
  ];
}
