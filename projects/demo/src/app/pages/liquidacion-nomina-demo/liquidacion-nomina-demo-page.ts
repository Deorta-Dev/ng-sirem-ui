import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton, SiremDataTable, SiremEmptyState, SiremFieldGroup, SiremInput, SiremModal,
  SiremPageHeader, SiremSelectOption, SiremStatCard, SiremTableColumn,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { LIQUIDACION_NOMINA, type ErpLiquidacion } from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Fila derivada: valores de la liquidación escalados por periodo. */
type LiquidacionFila = {
  id: number;
  empleado: string;
  cargo: string;
  salario: number;
  otros: number;
  deducciones: number;
  neto: number;
};

/**
 * Liquidación de nómina: devengados (salario, horas extras y comisiones)
 * frente a deducciones (salud, pensión y retención) con neto a pagar.
 */
@Component({
  selector: 'app-liquidacion-nomina-demo-page',
  standalone: true,
  imports: [
    PageDemoShell, SiremButton, SiremDataTable, SiremEmptyState, SiremFieldGroup,
    SiremInput, SiremModal, SiremPageHeader, SiremStatCard,
  ],
  template: `
    <app-page-demo-shell label="Liquidación de nómina" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header title="Liquidación de nómina" subtitle="Devengados y deducciones con neto a pagar por periodo">
            <div slot="actions" class="flex flex-wrap items-end gap-3">
              <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Periodo" [options]="periodoOptions" [(value)]="periodo" />
              <sirem-button size="sm" (pressed)="generarNomina()">Generar nómina</sirem-button>
            </div>
          </sirem-page-header>

          @if (loteGenerado()) {
            <div class="flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-800 dark:text-emerald-200">
              <i class="fi fi-rr-check-circle" aria-hidden="true"></i>
              <span>Liquidaciones generadas y listas para transmitir a la DIAN.</span>
            </div>
          }

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Total devengado" [value]="cop(totalDevengado())" />
            <sirem-stat-card label="Total deducciones" [value]="cop(totalDeducciones())" color="danger" />
            <sirem-stat-card label="Neto a pagar" [value]="cop(netoTotal())" color="success" />
            <sirem-stat-card label="Empleados en la nómina" [value]="totalEmpleados" color="info" />
          </div>

          @if (filas().length) {
            <sirem-data-table [columns]="cols" [rows]="filas()" (rowClicked)="abrir($event)" />
          } @else {
            <sirem-empty-state title="Sin liquidaciones" description="No hay liquidaciones para el periodo seleccionado." />
          }
        </div>

        <sirem-modal [(open)]="detalleAbierto" [title]="detalle()?.empleado ?? 'Liquidación'"
          [actions]="acciones" (actionPressed)="accion($event.label)">
          @if (detalle(); as l) {
            <div class="flex flex-col gap-4">
              <sirem-field-group title="Devengados" [description]="etiquetaPeriodo()">
                <div class="col-span-12 flex justify-between text-sm"><span>Salario</span><span class="font-semibold">{{ cop(esc(l.salario)) }}</span></div>
                <div class="col-span-12 flex justify-between text-sm"><span>Horas extras</span><span class="font-semibold">{{ cop(esc(l.horasExtras)) }}</span></div>
                <div class="col-span-12 flex justify-between text-sm"><span>Comisiones</span><span class="font-semibold">{{ cop(esc(l.comisiones)) }}</span></div>
              </sirem-field-group>

              <sirem-field-group title="Deducciones">
                <div class="col-span-12 flex justify-between text-sm"><span>Salud</span><span class="font-semibold">− {{ cop(esc(l.salud)) }}</span></div>
                <div class="col-span-12 flex justify-between text-sm"><span>Pensión</span><span class="font-semibold">− {{ cop(esc(l.pension)) }}</span></div>
                <div class="col-span-12 flex justify-between text-sm"><span>Retención en la fuente</span><span class="font-semibold">− {{ cop(esc(l.retencion)) }}</span></div>
              </sirem-field-group>

              <div class="rounded-xl border border-slate-200 p-4 text-center dark:border-slate-700">
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Neto a pagar</p>
                <p class="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{{ cop(esc(l.neto)) }}</p>
              </div>
            </div>
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class LiquidacionNominaDemoPage {
  private readonly toast = inject(DynamicToastService);

  readonly periodo = signal<string | number | null>('mes');
  readonly loteGenerado = signal(false);

  readonly detalleAbierto = signal(false);
  readonly seleccion = signal<ErpLiquidacion | null>(null);
  readonly detalle = computed(() => this.seleccion());

  readonly periodoOptions: SiremSelectOption[] = [
    { value: 'q1', label: 'Quincena 1' },
    { value: 'q2', label: 'Quincena 2' },
    { value: 'mes', label: 'Mes completo' },
  ];

  readonly totalEmpleados = LIQUIDACION_NOMINA.length;

  readonly cols: SiremTableColumn[] = [
    { key: 'empleado', label: 'Empleado', subKey: 'cargo' },
    { key: 'salario', label: 'Salario', kind: 'currency' },
    { key: 'otros', label: 'Otros devengos', kind: 'currency' },
    { key: 'deducciones', label: 'Deducciones', kind: 'currency' },
    { key: 'neto', label: 'Neto', kind: 'currency', align: 'right' },
  ];

  readonly acciones = [{ label: 'Ver soporte' }];

  /** Factor del periodo seleccionado: quincenas 0.5, mes completo 1. */
  readonly factor = computed(() => (this.periodo() === 'mes' ? 1 : 0.5));

  readonly etiquetaPeriodo = computed(
    () => this.periodoOptions.find((o) => o.value === this.periodo())?.label ?? 'Periodo',
  );

  /** Filas de la tabla con los valores escalados por el periodo. */
  readonly filas = computed<LiquidacionFila[]>(() => {
    const f = this.factor();
    return LIQUIDACION_NOMINA.map((l) => ({
      id: l.id,
      empleado: l.empleado,
      cargo: l.cargo,
      salario: Math.round(l.salario * f),
      otros: Math.round((l.horasExtras + l.comisiones) * f),
      deducciones: Math.round((l.salud + l.pension + l.retencion) * f),
      neto: Math.round(l.neto * f),
    }));
  });

  readonly totalDevengado = computed(() =>
    this.suma((l) => l.salario + l.horasExtras + l.comisiones),
  );
  readonly totalDeducciones = computed(() => this.suma((l) => l.salud + l.pension + l.retencion));
  readonly netoTotal = computed(() => this.suma((l) => l.neto));

  /** Suma un concepto de todas las liquidaciones aplicando el factor. */
  private suma(concepto: (l: ErpLiquidacion) => number): number {
    return Math.round(LIQUIDACION_NOMINA.reduce((acc, l) => acc + concepto(l), 0) * this.factor());
  }

  /** Escala un valor del periodo seleccionado. */
  esc(valor: number): number {
    return Math.round(valor * this.factor());
  }

  cop(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(valor);
  }

  generarNomina(): void {
    this.loteGenerado.set(true);
    this.toast.success({
      title: 'Nómina generada',
      description: this.totalEmpleados + ' liquidaciones listas para transmitir a la DIAN.',
      duration: 4_000,
    });
  }

  abrir(fila: Record<string, unknown>): void {
    const liq = LIQUIDACION_NOMINA.find((l) => l.id === fila['id']);
    if (!liq) return;
    this.seleccion.set(liq);
    this.detalleAbierto.set(true);
  }

  /** Descarga el soporte PDF de la liquidación seleccionada. */
  accion(label: string): void {
    const liq = this.seleccion();
    this.detalleAbierto.set(false);
    if (!liq || label !== 'Ver soporte') return;
    this.toast.info({
      title: 'Soporte de liquidación',
      description: 'Descargando el PDF con el desglose de ' + liq.empleado + '.',
      duration: 3_500,
    });
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'liquidacion-nomina.html',
      language: 'html',
      code: `<sirem-page-header title="Liquidación de nómina" subtitle="Devengados y deducciones con neto a pagar por periodo">
  <div slot="actions" class="flex flex-wrap items-end gap-3">
    <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Periodo" [options]="periodoOptions" [(value)]="periodo" />
    <sirem-button size="sm" (pressed)="generarNomina()">Generar nómina</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Total devengado" [value]="cop(totalDevengado())" />
  <sirem-stat-card label="Total deducciones" [value]="cop(totalDeducciones())" color="danger" />
  <sirem-stat-card label="Neto a pagar" [value]="cop(netoTotal())" color="success" />
  <sirem-stat-card label="Empleados en la nómina" [value]="totalEmpleados" color="info" />
</div>

@if (filas().length) {
  <sirem-data-table [columns]="cols" [rows]="filas()" (rowClicked)="abrir($event)" />
} @else {
  <sirem-empty-state title="Sin liquidaciones" description="No hay liquidaciones para el periodo." />
}

<sirem-modal [(open)]="detalleAbierto" [title]="detalle()?.empleado ?? 'Liquidación'"
  [actions]="acciones" (actionPressed)="accion($event.label)">
  @if (detalle(); as l) {
    <sirem-field-group title="Devengados" [description]="etiquetaPeriodo()">
      <div class="col-span-12 flex justify-between text-sm"><span>Salario</span><span class="font-semibold">{{ cop(esc(l.salario)) }}</span></div>
      <div class="col-span-12 flex justify-between text-sm"><span>Horas extras</span><span class="font-semibold">{{ cop(esc(l.horasExtras)) }}</span></div>
      <div class="col-span-12 flex justify-between text-sm"><span>Comisiones</span><span class="font-semibold">{{ cop(esc(l.comisiones)) }}</span></div>
    </sirem-field-group>
    <sirem-field-group title="Deducciones">
      <div class="col-span-12 flex justify-between text-sm"><span>Salud</span><span class="font-semibold">− {{ cop(esc(l.salud)) }}</span></div>
      <div class="col-span-12 flex justify-between text-sm"><span>Pensión</span><span class="font-semibold">− {{ cop(esc(l.pension)) }}</span></div>
      <div class="col-span-12 flex justify-between text-sm"><span>Retención en la fuente</span><span class="font-semibold">− {{ cop(esc(l.retencion)) }}</span></div>
    </sirem-field-group>
    <p class="mt-4 text-center text-2xl font-bold text-slate-900 dark:text-slate-100">
      Neto {{ cop(esc(l.neto)) }}
    </p>
  }
</sirem-modal>`,
    },
    {
      name: 'liquidacion-nomina.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton, SiremDataTable, SiremEmptyState, SiremFieldGroup, SiremModal,
  SiremPageHeader, SiremInput, SiremSelectOption, SiremStatCard, SiremTableColumn,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { LIQUIDACION_NOMINA, type ErpLiquidacion } from '../../data/erp-mock';

type LiquidacionFila = {
  id: number; empleado: string; cargo: string; salario: number;
  otros: number; deducciones: number; neto: number;
};

export class LiquidacionNominaPage {
  private readonly toast = inject(DynamicToastService);

  readonly periodo = signal<string | number | null>('mes');
  readonly loteGenerado = signal(false);
  readonly seleccion = signal<ErpLiquidacion | null>(null);
  readonly detalleAbierto = signal(false);
  readonly detalle = computed(() => this.seleccion());

  readonly periodoOptions: SiremSelectOption[] = [
    { value: 'q1', label: 'Quincena 1' }, { value: 'q2', label: 'Quincena 2' },
    { value: 'mes', label: 'Mes completo' },
  ];
  readonly totalEmpleados = LIQUIDACION_NOMINA.length;

  readonly cols: SiremTableColumn[] = [
    { key: 'empleado', label: 'Empleado', subKey: 'cargo' },
    { key: 'salario', label: 'Salario', kind: 'currency' },
    { key: 'otros', label: 'Otros devengos', kind: 'currency' },
    { key: 'deducciones', label: 'Deducciones', kind: 'currency' },
    { key: 'neto', label: 'Neto', kind: 'currency', align: 'right' },
  ];

  readonly acciones = [{ label: 'Ver soporte' }];

  /** Factor del periodo seleccionado: quincenas 0.5, mes completo 1. */
  readonly factor = computed(() => (this.periodo() === 'mes' ? 1 : 0.5));
  readonly etiquetaPeriodo = computed(
    () => this.periodoOptions.find(o => o.value === this.periodo())?.label ?? 'Periodo',
  );

  readonly filas = computed<LiquidacionFila[]>(() => {
    const f = this.factor();
    return LIQUIDACION_NOMINA.map(l => ({
      id: l.id, empleado: l.empleado, cargo: l.cargo,
      salario: Math.round(l.salario * f),
      otros: Math.round((l.horasExtras + l.comisiones) * f),
      deducciones: Math.round((l.salud + l.pension + l.retencion) * f),
      neto: Math.round(l.neto * f),
    }));
  });

  readonly totalDevengado = computed(() => this.suma(l => l.salario + l.horasExtras + l.comisiones));
  readonly totalDeducciones = computed(() => this.suma(l => l.salud + l.pension + l.retencion));
  readonly netoTotal = computed(() => this.suma(l => l.neto));

  private suma(concepto: (l: ErpLiquidacion) => number): number {
    return Math.round(LIQUIDACION_NOMINA.reduce((acc, l) => acc + concepto(l), 0) * this.factor());
  }

  esc(valor: number): number {
    return Math.round(valor * this.factor());
  }

  cop(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(valor);
  }

  generarNomina(): void {
    this.loteGenerado.set(true);
    this.toast.success({
      title: 'Nómina generada',
      description: this.totalEmpleados + ' liquidaciones listas para transmitir a la DIAN.',
      duration: 4_000,
    });
  }

  abrir(fila: Record<string, unknown>): void {
    const liq = LIQUIDACION_NOMINA.find(l => l.id === fila['id']);
    if (!liq) return;
    this.seleccion.set(liq);
    this.detalleAbierto.set(true);
  }

  accion(label: string): void {
    const liq = this.seleccion();
    this.detalleAbierto.set(false);
    if (!liq || label !== 'Ver soporte') return;
    this.toast.info({
      title: 'Soporte de liquidación',
      description: 'Descargando el PDF con el desglose de ' + liq.empleado + '.',
      duration: 3_500,
    });
  }
}`,
    },
  ];
}
