import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton,
  SiremCard,
  SiremChart,
  SiremDataTable,
  SiremInput, SiremModal,
  SiremPageHeader,
  SiremSelectOption,
  SiremStatCard,
  SiremTableColumn,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import {
  CUENTAS_TESORERIA,
  DOCUMENTOS_VENTA,
  FACTURAS_COMPRA,
  ORDENES_COMPRA,
} from '../../data/erp-mock';
import { themeMode } from '../../shared/theme/theme';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Periodos disponibles en el selector de la cabecera. */
type Periodo = 'semana' | 'mes' | 'trimestre';

/** Tramo del eje X: una categoría con su ventana de fechas. */
type Rango = { label: string; desde: string; hasta: string };

/** Partida proyectada del cash flow. */
type Partida = {
  id: string;
  concepto: string;
  fecha: string;
  tipo: 'Ingreso' | 'Egreso';
  valor: number;
  origen: 'Ventas' | 'Compras';
};

const ETIQUETAS: Record<Periodo, { label: string; detalle: string }> = {
  semana: { label: 'Semana (19–25 oct)', detalle: 'Semana del 19 al 25 de octubre de 2026' },
  mes: { label: 'Mes (octubre 2026)', detalle: 'Octubre de 2026' },
  trimestre: { label: 'Trimestre (ago–oct)', detalle: 'Trimestre de agosto a octubre de 2026' },
};

/** Ventana de cada periodo: son las categorías del gráfico. */
const VENTANAS: Record<Periodo, Rango[]> = {
  semana: [
    { label: 'Lun 19', desde: '2026-10-19', hasta: '2026-10-19' },
    { label: 'Mar 20', desde: '2026-10-20', hasta: '2026-10-20' },
    { label: 'Mié 21', desde: '2026-10-21', hasta: '2026-10-21' },
    { label: 'Jue 22', desde: '2026-10-22', hasta: '2026-10-22' },
    { label: 'Vie 23', desde: '2026-10-23', hasta: '2026-10-23' },
    { label: 'Sáb 24', desde: '2026-10-24', hasta: '2026-10-24' },
    { label: 'Dom 25', desde: '2026-10-25', hasta: '2026-10-25' },
  ],
  mes: [
    { label: 'Sem. 1', desde: '2026-10-01', hasta: '2026-10-07' },
    { label: 'Sem. 2', desde: '2026-10-08', hasta: '2026-10-14' },
    { label: 'Sem. 3', desde: '2026-10-15', hasta: '2026-10-21' },
    { label: 'Sem. 4', desde: '2026-10-22', hasta: '2026-10-28' },
    { label: 'Sem. 5', desde: '2026-10-29', hasta: '2026-10-31' },
  ],
  trimestre: [
    { label: 'Agosto', desde: '2026-08-01', hasta: '2026-08-31' },
    { label: 'Septiembre', desde: '2026-09-01', hasta: '2026-09-30' },
    { label: 'Octubre', desde: '2026-10-01', hasta: '2026-10-31' },
  ],
};

/** Saldo de las cuentas COP al inicio de la proyección. */
const SALDO_INICIAL = CUENTAS_TESORERIA.filter((c) => c.moneda === 'COP').reduce(
  (acc, c) => acc + c.saldo,
  0,
);

function esPeriodo(valor: string): valor is Periodo {
  return valor === 'semana' || valor === 'mes' || valor === 'trimestre';
}

/**
 * Partidas que entran y salen de caja: saldos por cobrar de las facturas
 * de venta (ingresos) y facturas de compra más órdenes en borrador
 * (egresos), fechadas por su vencimiento o entrega.
 */
function partidasBase(): Partida[] {
  const ingresos: Partida[] = DOCUMENTOS_VENTA.filter((d) => d.saldo > 0).map((d) => ({
    id: 'V' + d.id,
    concepto: d.numero + ' · ' + d.tercero,
    fecha: d.vence,
    tipo: 'Ingreso',
    valor: d.saldo,
    origen: 'Ventas',
  }));

  const facturas: Partida[] = FACTURAS_COMPRA.map((f) => ({
    id: 'F' + f.id,
    concepto: f.numero + ' · ' + f.proveedor,
    fecha: f.vence,
    tipo: 'Egreso',
    valor: f.total,
    origen: 'Compras',
  }));

  const ordenes: Partida[] = ORDENES_COMPRA.filter((o) => o.estado === 'Borrador').map((o) => ({
    id: 'O' + o.id,
    concepto: o.numero + ' · ' + o.proveedor,
    fecha: o.entrega,
    tipo: 'Egreso',
    valor: o.total,
    origen: 'Compras',
  }));

  return [...ingresos, ...facturas, ...ordenes];
}

const BASE: Partida[] = partidasBase();

/**
 * Flujo de caja: proyecta ingresos y egresos por periodo (semana, mes o
 * trimestre) a partir de la cartera por cobrar y las cuentas por pagar.
 * El gráfico combina barras dobles con la línea de saldo acumulado y la
 * tabla detalla las partidas de la ventana elegida.
 */
@Component({
  selector: 'app-flujo-de-caja-demo-page',
  standalone: true,
  imports: [
    PageDemoShell,
    SiremButton,
    SiremCard,
    SiremChart,
    SiremDataTable,
    SiremInput, SiremModal,
    SiremPageHeader,
    SiremStatCard,
  ],
  template: `
    <app-page-demo-shell label="Flujo de caja" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header
            title="Flujo de caja (cash flow)"
            subtitle="Proyección de ingresos y egresos a partir de la cartera por cobrar y las cuentas por pagar"
          >
            <div slot="actions" class="flex flex-wrap items-end gap-3">
              <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Periodo" [options]="periodoOptions" [(value)]="periodo" />
              <sirem-button size="sm" variant="secondary" (pressed)="exportar()">
                <i slot="icon" class="fi fi-rr-download" aria-hidden="true"></i>
                Exportar proyección
              </sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Saldo inicial" [value]="cop(saldoInicial)" variant="tint" color="info" />
            <sirem-stat-card label="Ingresos proyectados" [value]="cop(ingresosTotal())" variant="tint" color="success" />
            <sirem-stat-card label="Egresos proyectados" [value]="cop(egresosTotal())" variant="tint" color="danger" />
            <sirem-stat-card label="Saldo final" [value]="cop(saldoFinal())" variant="tint" color="brand" />
          </div>

          <sirem-card title="Proyección de flujo" [subtitle]="etiquetaPeriodo()">
            <sirem-chart [option]="chartOption()" [height]="300" [dark]="isDark()" />
            @if (ultimoExporte(); as archivo) {
              <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Última exportación: <span class="font-semibold">{{ archivo }}</span>
              </p>
            }
          </sirem-card>

          <sirem-card title="Detalle de partidas" subtitle="Movimientos que componen el periodo seleccionado">
            <sirem-data-table
              [columns]="cols"
              [rows]="partidas()"
              emptyText="Sin partidas proyectadas en este periodo."
              (rowClicked)="abrirDetalle($event)"
            />
          </sirem-card>
        </div>

        <sirem-modal
          [(open)]="detalleAbierto"
          [title]="detalle()?.concepto ?? 'Partida'"
          size="md"
        >
          @if (detalle(); as p) {
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Fecha en caja</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ p.fecha }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Origen: {{ p.origen }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Valor</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {{ p.tipo === 'Ingreso' ? '+' : '−' }} {{ cop(p.valor) }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ p.tipo }}</p>
              </div>
            </div>
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class FlujoDeCajaDemoPage {
  private readonly toast = inject(DynamicToastService);

  readonly periodo = signal<string | number | null>('mes');
  readonly detalleAbierto = signal(false);
  readonly detalle = signal<Partida | null>(null);
  readonly ultimoExporte = signal<string | null>(null);

  readonly saldoInicial = SALDO_INICIAL;

  readonly periodoOptions: SiremSelectOption[] = Object.entries(ETIQUETAS).map(([value, v]) => ({
    value,
    label: v.label,
  }));

  readonly cols: SiremTableColumn[] = [
    { key: 'concepto', label: 'Concepto' },
    { key: 'fecha', label: 'Fecha', kind: 'date' },
    { key: 'tipo', label: 'Tipo', kind: 'badge', badgeTones: { Ingreso: 'success', Egreso: 'warning' } },
    { key: 'valor', label: 'Valor', kind: 'currency', align: 'right' },
    { key: 'origen', label: 'Origen' },
  ];

  /** Tramos del periodo elegido (categorías del eje X). */
  readonly rangos = computed<Rango[]>(() => {
    const valor = String(this.periodo() ?? 'mes');
    return VENTANAS[esPeriodo(valor) ? valor : 'mes'];
  });

  readonly etiquetaPeriodo = computed(() => {
    const valor = String(this.periodo() ?? 'mes');
    return (esPeriodo(valor) ? ETIQUETAS[valor] : ETIQUETAS.mes).detalle;
  });

  /** Partidas que caen dentro de la ventana del periodo. */
  readonly partidas = computed<Partida[]>(() => {
    const rangos = this.rangos();
    return BASE.filter((p) => rangos.some((r) => p.fecha >= r.desde && p.fecha <= r.hasta));
  });

  /** Series del gráfico: ingresos, egresos y saldo acumulado por tramo. */
  readonly serie = computed(() => {
    const rangos = this.rangos();
    let acumulado = SALDO_INICIAL;
    const ingresos: number[] = [];
    const egresos: number[] = [];
    const saldo: number[] = [];

    for (const r of rangos) {
      const enRango = this.partidas().filter((p) => p.fecha >= r.desde && p.fecha <= r.hasta);
      const ing = enRango
        .filter((p) => p.tipo === 'Ingreso')
        .reduce((acc, p) => acc + p.valor, 0);
      const egr = enRango
        .filter((p) => p.tipo === 'Egreso')
        .reduce((acc, p) => acc + p.valor, 0);
      ingresos.push(ing);
      egresos.push(egr);
      acumulado += ing - egr;
      saldo.push(acumulado);
    }

    return { categorias: rangos.map((r) => r.label), ingresos, egresos, saldo };
  });

  readonly ingresosTotal = computed(() => this.serie().ingresos.reduce((a, b) => a + b, 0));
  readonly egresosTotal = computed(() => this.serie().egresos.reduce((a, b) => a + b, 0));
  readonly saldoFinal = computed(() => SALDO_INICIAL + this.ingresosTotal() - this.egresosTotal());

  readonly chartOption = computed(() => {
    const s = this.serie();
    return {
      tooltip: { trigger: 'axis' as const, axisPointer: { type: 'shadow' as const } },
      legend: { bottom: 0, itemWidth: 14, itemHeight: 14, icon: 'roundRect' as const },
      grid: { left: 8, right: 8, top: 24, bottom: 32, containLabel: true },
      xAxis: { type: 'category' as const, data: s.categorias },
      yAxis: [
        { type: 'value' as const, name: 'Movimiento' },
        { type: 'value' as const, name: 'Saldo' },
      ],
      series: [
        {
          name: 'Ingresos',
          type: 'bar' as const,
          data: s.ingresos,
          barWidth: '26%',
          itemStyle: { borderRadius: [6, 6, 0, 0] },
        },
        {
          name: 'Egresos',
          type: 'bar' as const,
          data: s.egresos,
          barWidth: '26%',
          itemStyle: { borderRadius: [6, 6, 0, 0] },
        },
        {
          name: 'Saldo acumulado',
          type: 'line' as const,
          data: s.saldo,
          yAxisIndex: 1,
          smooth: true,
          symbol: 'circle' as const,
          symbolSize: 8,
          lineStyle: { width: 3 },
        },
      ],
    };
  });

  isDark(): boolean {
    return themeMode() === 'dark';
  }

  /** Genera el XLSX de la proyección y lo anuncia con toast. */
  exportar(): void {
    this.ultimoExporte.set('cash-flow-2026-10.xlsx');
    this.toast.success({
      title: 'Proyección exportada',
      description: 'Archivo cash-flow-2026-10.xlsx generado.',
      duration: 3_500,
    });
  }

  abrirDetalle(fila: Record<string, unknown>): void {
    this.detalle.set(this.partidas().find((p) => p.id === fila['id']) ?? null);
    if (this.detalle()) this.detalleAbierto.set(true);
  }

  /** Formato COP con separador de miles. */
  cop(valor: number): string {
    return '$' + String(Math.round(valor)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'flujo-de-caja.html',
      language: 'html',
      code: `<sirem-page-header
  title="Flujo de caja (cash flow)"
  subtitle="Proyección de ingresos y egresos a partir de la cartera por cobrar y las cuentas por pagar">
  <div slot="actions" class="flex flex-wrap items-end gap-3">
    <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Periodo" [options]="periodoOptions" [(value)]="periodo" />
    <sirem-button size="sm" variant="secondary" (pressed)="exportar()">Exportar proyección</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Saldo inicial" [value]="cop(saldoInicial)" variant="tint" color="info" />
  <sirem-stat-card label="Ingresos proyectados" [value]="cop(ingresosTotal())" variant="tint" color="success" />
  <sirem-stat-card label="Egresos proyectados" [value]="cop(egresosTotal())" variant="tint" color="danger" />
  <sirem-stat-card label="Saldo final" [value]="cop(saldoFinal())" variant="tint" color="brand" />
</div>

<sirem-card title="Proyección de flujo" [subtitle]="etiquetaPeriodo()">
  <sirem-chart [option]="chartOption()" [height]="300" [dark]="isDark()" />
</sirem-card>

<sirem-card title="Detalle de partidas" subtitle="Movimientos que componen el periodo seleccionado">
  <sirem-data-table [columns]="cols" [rows]="partidas()"
    emptyText="Sin partidas proyectadas en este periodo."
    (rowClicked)="abrirDetalle($event)" />
</sirem-card>

<sirem-modal [(open)]="detalleAbierto" [title]="detalle()?.concepto ?? 'Partida'" size="md">
  @if (detalle(); as p) {
    <p class="text-sm font-semibold">{{ p.fecha }} · {{ p.origen }}</p>
    <p class="text-sm">{{ p.tipo === 'Ingreso' ? '+' : '−' }} {{ cop(p.valor) }}</p>
  }
</sirem-modal>`,
    },
    {
      name: 'flujo-de-caja.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import { SiremChart, SiremDataTable, SiremModal, SiremInput, SiremTableColumn } from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import {
  CUENTAS_TESORERIA, DOCUMENTOS_VENTA, FACTURAS_COMPRA, ORDENES_COMPRA,
} from '../../data/erp-mock';
import { themeMode } from '../../shared/theme/theme';

type Periodo = 'semana' | 'mes' | 'trimestre';
type Rango = { label: string; desde: string; hasta: string };
type Partida = {
  id: string; concepto: string; fecha: string;
  tipo: 'Ingreso' | 'Egreso'; valor: number; origen: 'Ventas' | 'Compras';
};

const VENTANAS: Record<Periodo, Rango[]> = {
  semana: [
    { label: 'Lun 19', desde: '2026-10-19', hasta: '2026-10-19' },
    { label: 'Mar 20', desde: '2026-10-20', hasta: '2026-10-20' },
    { label: 'Mié 21', desde: '2026-10-21', hasta: '2026-10-21' },
    { label: 'Jue 22', desde: '2026-10-22', hasta: '2026-10-22' },
    { label: 'Vie 23', desde: '2026-10-23', hasta: '2026-10-23' },
    { label: 'Sáb 24', desde: '2026-10-24', hasta: '2026-10-24' },
    { label: 'Dom 25', desde: '2026-10-25', hasta: '2026-10-25' },
  ],
  mes: [
    { label: 'Sem. 1', desde: '2026-10-01', hasta: '2026-10-07' },
    { label: 'Sem. 2', desde: '2026-10-08', hasta: '2026-10-14' },
    { label: 'Sem. 3', desde: '2026-10-15', hasta: '2026-10-21' },
    { label: 'Sem. 4', desde: '2026-10-22', hasta: '2026-10-28' },
    { label: 'Sem. 5', desde: '2026-10-29', hasta: '2026-10-31' },
  ],
  trimestre: [
    { label: 'Agosto', desde: '2026-08-01', hasta: '2026-08-31' },
    { label: 'Septiembre', desde: '2026-09-01', hasta: '2026-09-30' },
    { label: 'Octubre', desde: '2026-10-01', hasta: '2026-10-31' },
  ],
};

const SALDO_INICIAL = CUENTAS_TESORERIA
  .filter(c => c.moneda === 'COP')
  .reduce((acc, c) => acc + c.saldo, 0);

function esPeriodo(valor: string): valor is Periodo {
  return valor === 'semana' || valor === 'mes' || valor === 'trimestre';
}

/** Saldo por cobrar + facturas y órdenes por pagar, fechados por pago. */
const BASE: Partida[] = [
  ...DOCUMENTOS_VENTA.filter(d => d.saldo > 0).map(d => ({
    id: 'V' + d.id, concepto: d.numero + ' · ' + d.tercero, fecha: d.vence,
    tipo: 'Ingreso' as const, valor: d.saldo, origen: 'Ventas' as const,
  })),
  ...FACTURAS_COMPRA.map(f => ({
    id: 'F' + f.id, concepto: f.numero + ' · ' + f.proveedor, fecha: f.vence,
    tipo: 'Egreso' as const, valor: f.total, origen: 'Compras' as const,
  })),
  ...ORDENES_COMPRA.filter(o => o.estado === 'Borrador').map(o => ({
    id: 'O' + o.id, concepto: o.numero + ' · ' + o.proveedor, fecha: o.entrega,
    tipo: 'Egreso' as const, valor: o.total, origen: 'Compras' as const,
  })),
];

export class FlujoDeCajaPage {
  private readonly toast = inject(DynamicToastService);

  readonly periodo = signal<string | number | null>('mes');
  readonly detalleAbierto = signal(false);
  readonly detalle = signal<Partida | null>(null);
  readonly ultimoExporte = signal<string | null>(null);
  readonly saldoInicial = SALDO_INICIAL;

  readonly rangos = computed<Rango[]>(() => {
    const valor = String(this.periodo() ?? 'mes');
    return VENTANAS[esPeriodo(valor) ? valor : 'mes'];
  });

  readonly partidas = computed(() => {
    const rangos = this.rangos();
    return BASE.filter(p => rangos.some(r => p.fecha >= r.desde && p.fecha <= r.hasta));
  });

  readonly serie = computed(() => {
    let acumulado = SALDO_INICIAL;
    const ingresos: number[] = [];
    const egresos: number[] = [];
    const saldo: number[] = [];
    for (const r of this.rangos()) {
      const enRango = this.partidas().filter(p => p.fecha >= r.desde && p.fecha <= r.hasta);
      const ing = enRango.filter(p => p.tipo === 'Ingreso').reduce((a, p) => a + p.valor, 0);
      const egr = enRango.filter(p => p.tipo === 'Egreso').reduce((a, p) => a + p.valor, 0);
      ingresos.push(ing);
      egresos.push(egr);
      acumulado += ing - egr;
      saldo.push(acumulado);
    }
    return { categorias: this.rangos().map(r => r.label), ingresos, egresos, saldo };
  });

  readonly ingresosTotal = computed(() => this.serie().ingresos.reduce((a, b) => a + b, 0));
  readonly egresosTotal = computed(() => this.serie().egresos.reduce((a, b) => a + b, 0));
  readonly saldoFinal = computed(() => SALDO_INICIAL + this.ingresosTotal() - this.egresosTotal());

  readonly chartOption = computed(() => {
    const s = this.serie();
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { bottom: 0, itemWidth: 14, itemHeight: 14, icon: 'roundRect' },
      grid: { left: 8, right: 8, top: 24, bottom: 32, containLabel: true },
      xAxis: { type: 'category', data: s.categorias },
      yAxis: [{ type: 'value', name: 'Movimiento' }, { type: 'value', name: 'Saldo' }],
      series: [
        { name: 'Ingresos', type: 'bar', data: s.ingresos, barWidth: '26%',
          itemStyle: { borderRadius: [6, 6, 0, 0] } },
        { name: 'Egresos', type: 'bar', data: s.egresos, barWidth: '26%',
          itemStyle: { borderRadius: [6, 6, 0, 0] } },
        { name: 'Saldo acumulado', type: 'line', data: s.saldo, yAxisIndex: 1,
          smooth: true, symbol: 'circle', symbolSize: 8, lineStyle: { width: 3 } },
      ],
    };
  });

  isDark() { return themeMode() === 'dark'; }

  exportar(): void {
    this.ultimoExporte.set('cash-flow-2026-10.xlsx');
    this.toast.success({
      title: 'Proyección exportada',
      description: 'Archivo cash-flow-2026-10.xlsx generado.',
      duration: 3_500,
    });
  }

  abrirDetalle(fila: Record<string, unknown>): void {
    this.detalle.set(this.partidas().find(p => p.id === fila['id']) ?? null);
    if (this.detalle()) this.detalleAbierto.set(true);
  }

  cop(valor: number): string {
    return '$' + String(Math.round(valor)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
  }
}`,
    },
  ];
}
