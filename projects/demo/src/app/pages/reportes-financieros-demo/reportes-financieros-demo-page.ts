import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton, SiremDataTable, SiremEmptyState, SiremModal, SiremMoneyPipe, SiremPageHeader,
  SiremSelect, SiremSelectOption, SiremStatCard, SiremTableColumn,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { ASIENTOS, CLIENTES, CUENTAS_PUC, PERIODOS, PROVEEDORES } from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Activos totales fijo para la demo (no se recalcula por periodo). */
const ACTIVOS_TOTALES = 148_500_000;

/** Reportes financieros en tiempo real con pestañas por informe. */
@Component({
  selector: 'app-reportes-financieros-demo-page',
  standalone: true,
  imports: [
    PageDemoShell, SiremButton, SiremDataTable, SiremEmptyState, SiremModal, SiremMoneyPipe,
    SiremPageHeader, SiremSelect, SiremStatCard,
  ],
  template: `
    <app-page-demo-shell label="Reportes financieros" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header title="Reportes financieros en tiempo real" subtitle="Estado de resultados, balance, libro mayor, balances y auxiliares">
            <div slot="actions" class="flex items-end gap-2">
              <sirem-select-field label="Periodo" [options]="periodoOptions" [(value)]="periodo" />
              <sirem-button size="sm" (pressed)="exportar()">Exportar</sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Ingresos" [value]="ingresos() | siremMoney" color="success" />
            <sirem-stat-card label="Gastos" [value]="gastos() | siremMoney" color="danger" />
            <sirem-stat-card label="Utilidad del periodo" [value]="utilidad() | siremMoney" variant="tint" />
            <sirem-stat-card label="Activos totales" [value]="activos | siremMoney" color="info" />
          </div>

          <div role="tablist" aria-label="Reportes financieros" class="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
            @for (titulo of pestanas; track titulo; let i = $index) {
              <button
                type="button"
                role="tab"
                (click)="pestana.set(i)"
                [attr.aria-selected]="pestana() === i"
                [class]="pestana() === i
                  ? 'shrink-0 border-b-2 border-sirem-600 px-3 py-2 text-sm font-medium text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sirem-600 dark:text-white'
                  : 'shrink-0 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sirem-600 dark:hover:text-slate-300'"
              >
                {{ titulo }}
              </button>
            }
          </div>

          <p class="text-xs text-slate-500 dark:text-slate-400">Informe: {{ pestanas[pestana()] }} · periodo {{ periodoActual().label }}</p>

          @if (filas().length) {
            <sirem-data-table [columns]="columnasActivas()" [rows]="filas()" (rowClicked)="abrir($event)" />
          } @else {
            <sirem-empty-state title="Sin datos" description="Este informe no tiene movimientos en el periodo seleccionado." />
          }
        </div>

        <sirem-modal [(open)]="detalleAbierto" [title]="detalleTitulo()" [actions]="accionesDetalle" (actionPressed)="detalleAbierto.set(false)">
          <dl class="grid gap-3 sm:grid-cols-2">
            @for (par of entradas(); track par[0]) {
              <div><dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ par[0] }}</dt><dd class="text-sm font-semibold text-slate-900 dark:text-white">{{ par[1] }}</dd></div>
            }
          </dl>
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class ReportesFinancierosDemoPage {
  private readonly toast = inject(DynamicToastService);

  readonly pestanas = ['Estado de resultados', 'Balance general', 'Libro mayor', 'Balances de prueba', 'Auxiliares contables'];
  readonly pestana = signal(0);
  readonly periodo = signal<string | number | null>('2026-09');

  readonly periodoOptions: SiremSelectOption[] = PERIODOS.map((p) => ({ value: p.id, label: p.label }));
  readonly periodoActual = computed(() => PERIODOS.find((p) => p.id === this.periodo()) ?? PERIODOS[2]);
  readonly ingresos = computed(() => this.periodoActual().ingresos);
  readonly gastos = computed(() => this.periodoActual().gastos);
  readonly utilidad = computed(() => this.ingresos() - this.gastos());
  readonly activos = ACTIVOS_TOTALES;

  readonly columnas: SiremTableColumn[][] = [
    [{ key: 'cuenta', label: 'Cuenta' }, { key: 'debito', label: 'Débito', kind: 'currency', align: 'right' }, { key: 'credito', label: 'Crédito', kind: 'currency', align: 'right' }, { key: 'saldo', label: 'Saldo', kind: 'currency', align: 'right' }],
    [{ key: 'cuenta', label: 'Cuenta' }, { key: 'saldoDeudor', label: 'Saldo deudor', kind: 'currency', align: 'right' }, { key: 'saldoAcreedor', label: 'Saldo acreedor', kind: 'currency', align: 'right' }],
    [{ key: 'cuenta', label: 'Cuenta', subKey: 'fecha' }, { key: 'debe', label: 'Debe', kind: 'currency', align: 'right' }, { key: 'haber', label: 'Haber', kind: 'currency', align: 'right' }, { key: 'saldo', label: 'Saldo', kind: 'currency', align: 'right' }],
    [{ key: 'cuenta', label: 'Cuenta' }, { key: 'debe', label: 'Debe', kind: 'currency', align: 'right' }, { key: 'haber', label: 'Haber', kind: 'currency', align: 'right' }],
    [{ key: 'tercero', label: 'Tercero', subKey: 'cuenta' }, { key: 'debito', label: 'Débito', kind: 'currency', align: 'right' }, { key: 'credito', label: 'Crédito', kind: 'currency', align: 'right' }, { key: 'saldo', label: 'Saldo', kind: 'currency', align: 'right' }],
  ];

  readonly columnasActivas = computed(() => this.columnas[this.pestana()] ?? this.columnas[0]);

  readonly detalleAbierto = signal(false);
  readonly filaDetalle = signal<Record<string, unknown> | null>(null);
  readonly detalleTitulo = computed(
    () => String(this.filaDetalle()?.['cuenta'] ?? this.filaDetalle()?.['tercero'] ?? 'Detalle del informe'),
  );
  readonly entradas = computed(() =>
    Object.entries(this.filaDetalle() ?? ({} as Record<string, unknown>)).filter(([k]) => k !== 'id'),
  );
  readonly accionesDetalle = [{ label: 'Cerrar', variant: 'secondary' as const }];

  /** Abre el detalle de la fila seleccionada en un modal. */
  abrir(fila: Record<string, unknown>): void {
    this.filaDetalle.set(fila);
    this.detalleAbierto.set(true);
  }

  /** Filas deterministas derivadas de PUC y asientos según la pestaña. */
  readonly filas = computed<Record<string, unknown>[]>(() => {
    switch (this.pestana()) {
      case 1:
        return this.balanceGeneral();
      case 2:
        return this.libroMayor();
      case 3:
        return this.balancePrueba();
      case 4:
        return this.auxiliares();
      default:
        return this.estadoResultados();
    }
  });

  /** P&G: cuentas de movimiento de ingreso/gasto con saldo con signo. */
  private estadoResultados(): Record<string, unknown>[] {
    return CUENTAS_PUC.filter((c) => c.movimiento && (c.tipo === 'Ingreso' || c.tipo === 'Gasto')).map((c) => {
      const debito = this.sumaLinea(c.codigo, 'debe');
      const credito = this.sumaLinea(c.codigo, 'haber');
      return { id: 'pg-' + c.id, cuenta: c.codigo + ' ' + c.nombre, debito, credito, saldo: credito - debito };
    });
  }

  /** Balance general: saldos deudor/acreedor de las cuentas de balance. */
  private balanceGeneral(): Record<string, unknown>[] {
    const filas: Record<string, unknown>[] = [];
    for (const c of CUENTAS_PUC) {
      const esBalance = c.tipo === 'Activo' || c.tipo === 'Pasivo' || c.tipo === 'Patrimonio';
      if (!c.movimiento || !esBalance) continue;
      const debe = this.sumaLinea(c.codigo, 'debe');
      const haber = this.sumaLinea(c.codigo, 'haber');
      const saldoDeudor = Math.max(debe - haber, 0);
      const saldoAcreedor = Math.max(haber - debe, 0);
      if (!saldoDeudor && !saldoAcreedor) continue;
      filas.push({ id: 'bg-' + c.id, cuenta: c.codigo + ' ' + c.nombre, saldoDeudor, saldoAcreedor });
    }
    return filas;
  }

  /** Libro mayor: movimientos con saldo acumulado por cuenta. */
  private libroMayor(): Record<string, unknown>[] {
    const acumulado = new Map<string, number>();
    const filas: Record<string, unknown>[] = [];
    let indice = 0;
    for (const asiento of ASIENTOS) {
      for (const linea of asiento.lineas) {
        const saldo = (acumulado.get(linea.cuenta) ?? 0) + (linea.debe - linea.haber);
        acumulado.set(linea.cuenta, saldo);
        filas.push({
          id: 'lm-' + indice++, cuenta: linea.cuenta + ' ' + linea.nombre,
          fecha: asiento.fecha, debe: linea.debe, haber: linea.haber, saldo,
        });
      }
    }
    return filas;
  }

  /** Balances de prueba: totales agregados por cuenta. */
  private balancePrueba(): Record<string, unknown>[] {
    const mapa = new Map<string, Record<string, unknown>>();
    for (const asiento of ASIENTOS) {
      for (const linea of asiento.lineas) {
        const previa = mapa.get(linea.cuenta);
        if (previa) {
          previa['debe'] = (previa['debe'] as number) + linea.debe;
          previa['haber'] = (previa['haber'] as number) + linea.haber;
        } else {
          mapa.set(linea.cuenta, {
            id: 'bp-' + linea.cuenta, cuenta: linea.cuenta + ' ' + linea.nombre,
            debe: linea.debe, haber: linea.haber,
          });
        }
      }
    }
    return [...mapa.values()];
  }

  /** Auxiliares: tercero asociado de forma determinista a cada línea. */
  private auxiliares(): Record<string, unknown>[] {
    const terceros = [...CLIENTES.map((c) => c.nombre), ...PROVEEDORES.map((p) => p.nombre)];
    const filas: Record<string, unknown>[] = [];
    let indice = 0;
    for (const asiento of ASIENTOS) {
      for (const linea of asiento.lineas) {
        filas.push({
          id: 'aux-' + indice, tercero: terceros[indice % terceros.length],
          cuenta: linea.cuenta + ' ' + linea.nombre, debito: linea.debe,
          credito: linea.haber, saldo: linea.debe - linea.haber,
        });
        indice++;
      }
    }
    return filas;
  }

  /** Suma `debe`/`haber` de una cuenta en todos los asientos. */
  private sumaLinea(codigo: string, lado: 'debe' | 'haber'): number {
    return ASIENTOS.reduce(
      (total, a) => total + a.lineas.filter((l) => l.cuenta === codigo).reduce((s, l) => s + l[lado], 0),
      0,
    );
  }

  /** Exporta los cinco informes del periodo con toast de confirmación. */
  exportar(): void {
    this.toast.success({
      title: 'Reportes exportados',
      description: 'XLSX con 5 informes de ' + this.periodoActual().label + '.',
      duration: 3_500,
    });
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'reportes-financieros.html',
      language: 'html',
      code: `<sirem-page-header title="Reportes financieros en tiempo real"
  subtitle="Estado de resultados, balance, libro mayor, balances y auxiliares">
  <div slot="actions" class="flex items-end gap-2">
    <sirem-select-field label="Periodo" [options]="periodoOptions" [(value)]="periodo" />
    <sirem-button size="sm" (pressed)="exportar()">Exportar</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Ingresos" [value]="ingresos() | siremMoney" color="success" />
  <sirem-stat-card label="Gastos" [value]="gastos() | siremMoney" color="danger" />
  <sirem-stat-card label="Utilidad del periodo" [value]="utilidad() | siremMoney" variant="tint" />
  <sirem-stat-card label="Activos totales" [value]="activos | siremMoney" color="info" />
</div>

<div role="tablist" aria-label="Reportes financieros" class="flex gap-1 border-b border-slate-200 dark:border-slate-800">
  @for (titulo of pestanas; track titulo; let i = $index) {
    <button type="button" role="tab" (click)="pestana.set(i)" [attr.aria-selected]="pestana() === i"
      [class]="pestana() === i
        ? 'shrink-0 border-b-2 border-sirem-600 px-3 py-2 text-sm font-medium text-slate-900 dark:text-white'
        : 'shrink-0 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700'">
      {{ titulo }}
    </button>
  }
</div>

@if (filas().length) {
  <sirem-data-table [columns]="columnasActivas()" [rows]="filas()" (rowClicked)="abrir($event)" />
} @else {
  <sirem-empty-state title="Sin datos" description="Sin movimientos en el periodo." />
}`,
    },
    {
      name: 'reportes-financieros.component.ts',
      language: 'typescript',
      code: `import { Component, computed, signal } from '@angular/core';
import { SiremDataTable, SiremMoneyPipe, SiremSelect, type SiremTableColumn } from 'deorta-sirem-ui';
import { ASIENTOS, CUENTAS_PUC, PERIODOS } from '../../data/erp-mock';

export class ReportesFinancierosPage {
  readonly pestanas = [
    'Estado de resultados', 'Balance general', 'Libro mayor',
    'Balances de prueba', 'Auxiliares contables',
  ];
  readonly pestana = signal(0);
  readonly periodo = signal<string | number | null>('2026-09');

  readonly periodoActual = computed(() => PERIODOS.find(p => p.id === this.periodo()) ?? PERIODOS[2]);
  readonly utilidad = computed(() => this.periodoActual().ingresos - this.periodoActual().gastos);

  readonly columnas: SiremTableColumn[][] = [
    [{ key: 'cuenta', label: 'Cuenta' },
     { key: 'debito', label: 'Debito', kind: 'currency', align: 'right' },
     { key: 'credito', label: 'Credito', kind: 'currency', align: 'right' },
     { key: 'saldo', label: 'Saldo', kind: 'currency', align: 'right' }],
    [{ key: 'cuenta', label: 'Cuenta' },
     { key: 'saldoDeudor', label: 'Saldo deudor', kind: 'currency', align: 'right' },
     { key: 'saldoAcreedor', label: 'Saldo acreedor', kind: 'currency', align: 'right' }],
    // … libro mayor, balances de prueba y auxiliares
  ];

  readonly columnasActivas = computed(() => this.columnas[this.pestana()] ?? this.columnas[0]);

  readonly filas = computed<Record<string, unknown>[]>(() => {
    // Cada pestaña deriva sus filas de CUENTAS_PUC y ASIENTOS
    return CUENTAS_PUC.filter(c => c.movimiento).map(c => {
      const debe = this.sumaLinea(c.codigo, 'debe');
      const haber = this.sumaLinea(c.codigo, 'haber');
      return { id: c.id, cuenta: c.codigo + ' ' + c.nombre, saldo: haber - debe };
    });
  });

  private sumaLinea(codigo: string, lado: 'debe' | 'haber'): number {
    return ASIENTOS.reduce((total, a) =>
      total + a.lineas.filter(l => l.cuenta === codigo).reduce((s, l) => s + l[lado], 0), 0);
  }
}`,
    },
  ];
}
