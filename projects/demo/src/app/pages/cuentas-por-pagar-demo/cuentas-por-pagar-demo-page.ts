import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton,
  SiremDataTable,
  SiremDate,
  SiremEmptyState,
  SiremInput, SiremModal,
  SiremMoneyPipe,
  SiremPageHeader,
  SiremSearchField,
  SiremStatCard,
  type SiremModalAction,
  type SiremSelectOption,
  type SiremTableColumn,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import {
  CUENTAS_TESORERIA,
  FACTURAS_COMPRA,
  type ErpFacturaCompra,
} from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Estado local del pago de una factura de compra. */
type EstadoPago = 'Pendiente' | 'Programado' | 'Pagado';

/** Factura de compra con su situación de pago en tesorería. */
type FacturaPagar = ErpFacturaCompra & { estadoPago: EstadoPago };

const ESTADOS_PAGO: EstadoPago[] = ['Pendiente', 'Programado', 'Pagado'];

/** Fecha de corte del aging (hoy en la demo). */
const CORTE = '2026-09-30';

/** Estado de pago inicial según la antigüedad del documento. */
function estadoPagoInicial(id: number): EstadoPago {
  if (id === 2) return 'Programado';
  if (id === 5) return 'Pagado';
  return 'Pendiente';
}

/**
 * Cuentas por pagar: aging de facturas de compra, programación de pagos
 * desde tesorería y generación de comprobantes de egreso.
 */
@Component({
  selector: 'app-cuentas-por-pagar-demo-page',
  standalone: true,
  imports: [
    PageDemoShell,
    SiremButton,
    SiremDataTable,
    SiremDate,
    SiremEmptyState,
    SiremInput, SiremModal,
    SiremMoneyPipe,
    SiremPageHeader,
    SiremSearchField,
    SiremStatCard,
  ],
  template: `
    <app-page-demo-shell label="Cuentas por pagar" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header
            title="Cuentas por pagar"
            subtitle="Vencimientos, programación de pagos y comprobantes de egreso"
          >
            <div slot="actions" class="flex gap-2">
              <sirem-button size="sm" (pressed)="generarComprobante()">
                Generar comprobante de egreso
              </sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Por pagar total" [value]="porPagar() | siremMoney" />
            <sirem-stat-card
              label="Vencido"
              [value]="vencido() | siremMoney"
              color="danger"
              variant="tint"
            />
            <sirem-stat-card label="Por vencer" [value]="porVencer() | siremMoney" color="warning" />
            <sirem-stat-card
              label="Pagos programados"
              [value]="pagosProgramados()"
              color="info"
            />
          </div>

          <div class="grid gap-3 md:grid-cols-[1fr_13rem]">
            <sirem-search-field
              label="Buscar"
              placeholder="Número o proveedor…"
              [(value)]="q"
            />
            <sirem-input-field [strictOptions]="true"
              label="Estado de pago"
              placeholder="Todos"
              [options]="estadoOptions"
              [(value)]="estado"
            />
          </div>

          @if (filtradas().length) {
            <sirem-data-table [columns]="cols" [rows]="filtradas()" (rowClicked)="abrir($event)" />
          } @else {
            <sirem-empty-state
              title="Sin facturas"
              description="Ninguna cuenta por pagar coincide con los filtros actuales."
            />
          }
        </div>

        <sirem-modal
          [(open)]="detalleAbierto"
          [title]="tituloModal()"
          size="md"
          [actions]="acciones()"
          (actionPressed)="accion($event.label)"
        >
          @if (detalle(); as fac) {
            <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {{ fac.proveedor }} · NIT {{ fac.nit }}
              </p>
              <p class="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {{ fac.numero }} · vence {{ fac.vence }}
              </p>
              <p class="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                {{ fac.total | siremMoney }}
              </p>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <sirem-date-field label="Fecha de pago" [(value)]="fechaPago" />
              <sirem-input-field [strictOptions]="true"
                label="Cuenta origen"
                placeholder="Seleccionar cuenta"
                [options]="cuentaOptions"
                [(value)]="cuenta"
              />
            </div>

            <div class="mt-4 flex flex-wrap justify-between gap-2 text-sm">
              <span class="text-slate-500 dark:text-slate-400">
                Total a pagar:
                <span class="font-semibold text-slate-900 dark:text-slate-100">
                  {{ fac.total | siremMoney }}
                </span>
              </span>
              <span class="text-slate-500 dark:text-slate-400">
                Saldo de la cuenta:
                <span class="font-semibold text-slate-900 dark:text-slate-100">
                  {{ (cuentaActual()?.saldo ?? 0) | siremMoney }}
                </span>
              </span>
            </div>
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class CuentasPorPagarDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia editable: la demo muta el estado de pago en memoria. */
  readonly facturas = signal<FacturaPagar[]>(
    FACTURAS_COMPRA.map((d) => ({ ...d, estadoPago: estadoPagoInicial(d.id) })),
  );

  readonly q = signal('');
  readonly estado = signal<string | number | null>(null);
  readonly detalleAbierto = signal(false);
  readonly fechaPago = signal<string | null>('2026-10-05');
  readonly cuenta = signal<string | number | null>('1');
  private readonly seleccion = signal<FacturaPagar | null>(null);

  readonly estadoOptions: SiremSelectOption[] = ESTADOS_PAGO.map((e) => ({
    value: e,
    label: e,
  }));

  readonly cuentaOptions: SiremSelectOption[] = CUENTAS_TESORERIA.map((c) => ({
    value: String(c.id),
    label: c.nombre,
  }));

  readonly cols: SiremTableColumn[] = [
    { key: 'numero', label: 'Factura', subKey: 'fecha' },
    { key: 'proveedor', label: 'Proveedor', subKey: 'nit' },
    { key: 'vence', label: 'Vence', kind: 'date' },
    { key: 'total', label: 'Total', kind: 'currency', align: 'right' },
    {
      key: 'estado',
      label: 'Estado Radian',
      kind: 'badge',
      badgeTones: {
        Recibida: 'neutral',
        'Acuse enviado': 'info',
        Aceptada: 'success',
        Rechazada: 'danger',
      },
    },
    {
      key: 'estadoPago',
      label: 'Estado de pago',
      kind: 'badge',
      badgeTones: { Pendiente: 'warning', Programado: 'info', Pagado: 'success' },
    },
  ];

  /** Filtrado por texto (factura/proveedor) y estado de pago. */
  readonly filtradas = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const estado = this.estado();
    return this.facturas().filter((fac) => {
      const coincide =
        !texto || `${fac.numero} ${fac.proveedor} ${fac.nit}`.toLowerCase().includes(texto);
      return coincide && (!estado || fac.estadoPago === estado);
    });
  });

  /** Saldo pendiente de pago (excluye las ya pagadas). */
  readonly porPagar = computed(() =>
    this.facturas()
      .filter((fac) => fac.estadoPago !== 'Pagado')
      .reduce((acc, fac) => acc + fac.total, 0),
  );

  readonly vencido = computed(() =>
    this.facturas()
      .filter((fac) => fac.estadoPago !== 'Pagado' && fac.vence < CORTE)
      .reduce((acc, fac) => acc + fac.total, 0),
  );

  readonly porVencer = computed(() =>
    this.facturas()
      .filter((fac) => fac.estadoPago !== 'Pagado' && fac.vence >= CORTE)
      .reduce((acc, fac) => acc + fac.total, 0),
  );

  readonly pagosProgramados = computed(
    () => this.facturas().filter((fac) => fac.estadoPago === 'Programado').length,
  );

  readonly detalle = computed(() => this.seleccion());

  readonly tituloModal = computed(() => {
    const fac = this.detalle();
    return fac ? 'Programar pago · ' + fac.numero : 'Programar pago';
  });

  readonly cuentaActual = computed(() =>
    CUENTAS_TESORERIA.find((c) => String(c.id) === String(this.cuenta() ?? '')) ?? null,
  );

  /** Solo las facturas pendientes admiten programar un nuevo pago. */
  readonly acciones = computed<SiremModalAction[]>(() => {
    const fac = this.detalle();
    return [
      { label: 'Cancelar', variant: 'secondary' },
      { label: 'Programar pago', disabled: !fac || fac.estadoPago !== 'Pendiente' },
    ];
  });

  abrir(fila: Record<string, unknown>): void {
    const fac = this.facturas().find((d) => d.id === fila['id']);
    if (!fac) return;
    this.seleccion.set(fac);
    this.detalleAbierto.set(true);
  }

  /** Programa el pago de la factura seleccionada con toast de confirmación. */
  accion(label: string): void {
    const fac = this.seleccion();
    if (!fac) return;

    if (label !== 'Programar pago') {
      this.detalleAbierto.set(false);
      return;
    }

    const cuenta = this.cuentaActual();
    fac.estadoPago = 'Programado';
    this.facturas.update((docs) => [...docs]);
    this.toast.success({
      title: 'Pago programado',
      description:
        fac.numero +
        ' · ' +
        this.formato(fac.total) +
        ' el ' +
        (this.fechaPago() ?? '—') +
        ' desde ' +
        (cuenta?.nombre ?? 'tesorería') +
        '.',
      duration: 4_000,
    });
    this.detalleAbierto.set(false);
  }

  generarComprobante(): void {
    this.toast.success({
      title: 'Comprobante CE-00123 generado',
      description: 'Contabilizado en tesorería.',
      duration: 3_500,
    });
  }

  /** Formato es-CO sin decimales para los textos de toast. */
  private formato(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(valor);
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'cuentas-por-pagar.html',
      language: 'html',
      code: `<sirem-page-header
  title="Cuentas por pagar"
  subtitle="Vencimientos, programación de pagos y comprobantes de egreso">
  <div slot="actions" class="flex gap-2">
    <sirem-button size="sm" (pressed)="generarComprobante()">Generar comprobante de egreso</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Por pagar total" [value]="porPagar() | siremMoney" />
  <sirem-stat-card label="Vencido" [value]="vencido() | siremMoney" color="danger" variant="tint" />
  <sirem-stat-card label="Por vencer" [value]="porVencer() | siremMoney" color="warning" />
  <sirem-stat-card label="Pagos programados" [value]="pagosProgramados()" color="info" />
</div>

<div class="grid gap-3 md:grid-cols-[1fr_13rem]">
  <sirem-search-field label="Buscar" placeholder="Número o proveedor…" [(value)]="q" />
  <sirem-input-field [strictOptions]="true" label="Estado de pago" placeholder="Todos"
    [options]="estadoOptions" [(value)]="estado" />
</div>

<sirem-data-table [columns]="cols" [rows]="filtradas()" (rowClicked)="abrir($event)" />

<sirem-modal [(open)]="detalleAbierto" [title]="tituloModal()" size="md"
  [actions]="acciones()" (actionPressed)="accion($event.label)">
  @if (detalle(); as fac) {
    <p class="text-sm font-semibold">{{ fac.numero }} · {{ fac.total | siremMoney }}</p>
    <div class="grid gap-3 sm:grid-cols-2">
      <sirem-date-field label="Fecha de pago" [(value)]="fechaPago" />
      <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Cuenta origen" [options]="cuentaOptions" [(value)]="cuenta" />
    </div>
    <p class="mt-3 text-sm">Saldo de la cuenta: {{ (cuentaActual()?.saldo ?? 0) | siremMoney }}</p>
  }
</sirem-modal>`,
    },
    {
      name: 'cuentas-por-pagar.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremDataTable, SiremModal, SiremInput,
  type ErpFacturaCompra, type SiremModalAction, type SiremTableColumn,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { CUENTAS_TESORERIA, FACTURAS_COMPRA } from '../../data/erp-mock';

type EstadoPago = 'Pendiente' | 'Programado' | 'Pagado';
type FacturaPagar = ErpFacturaCompra & { estadoPago: EstadoPago };

const ESTADOS_PAGO: EstadoPago[] = ['Pendiente', 'Programado', 'Pagado'];
const CORTE = '2026-09-30';

function estadoPagoInicial(id: number): EstadoPago {
  if (id === 2) return 'Programado';
  if (id === 5) return 'Pagado';
  return 'Pendiente';
}

export class CuentasPorPagarPage {
  private readonly toast = inject(DynamicToastService);

  readonly facturas = signal<FacturaPagar[]>(
    FACTURAS_COMPRA.map(d => ({ ...d, estadoPago: estadoPagoInicial(d.id) })));
  readonly q = signal('');
  readonly estado = signal<string | number | null>(null);
  readonly detalleAbierto = signal(false);
  readonly fechaPago = signal<string | null>('2026-10-05');
  readonly cuenta = signal<string | number | null>('1');
  private readonly seleccion = signal<FacturaPagar | null>(null);

  readonly estadoOptions = ESTADOS_PAGO.map(e => ({ value: e, label: e }));
  readonly cuentaOptions = CUENTAS_TESORERIA.map(c => ({ value: String(c.id), label: c.nombre }));

  readonly cols: SiremTableColumn[] = [
    { key: 'numero', label: 'Factura', subKey: 'fecha' },
    { key: 'proveedor', label: 'Proveedor', subKey: 'nit' },
    { key: 'vence', label: 'Vence', kind: 'date' },
    { key: 'total', label: 'Total', kind: 'currency', align: 'right' },
    { key: 'estado', label: 'Estado Radian', kind: 'badge',
      badgeTones: { Recibida: 'neutral', 'Acuse enviado': 'info',
                    Aceptada: 'success', Rechazada: 'danger' } },
    { key: 'estadoPago', label: 'Estado de pago', kind: 'badge',
      badgeTones: { Pendiente: 'warning', Programado: 'info', Pagado: 'success' } },
  ];

  readonly filtradas = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const estado = this.estado();
    return this.facturas().filter(fac => {
      const coincide = !texto ||
        (fac.numero + ' ' + fac.proveedor + ' ' + fac.nit).toLowerCase().includes(texto);
      return coincide && (!estado || fac.estadoPago === estado);
    });
  });

  readonly porPagar = computed(() => this.facturas()
    .filter(fac => fac.estadoPago !== 'Pagado')
    .reduce((acc, fac) => acc + fac.total, 0));

  readonly vencido = computed(() => this.facturas()
    .filter(fac => fac.estadoPago !== 'Pagado' && fac.vence < CORTE)
    .reduce((acc, fac) => acc + fac.total, 0));

  readonly porVencer = computed(() => this.facturas()
    .filter(fac => fac.estadoPago !== 'Pagado' && fac.vence >= CORTE)
    .reduce((acc, fac) => acc + fac.total, 0));

  readonly pagosProgramados = computed(() =>
    this.facturas().filter(fac => fac.estadoPago === 'Programado').length);

  readonly detalle = computed(() => this.seleccion());

  readonly tituloModal = computed(() => {
    const fac = this.detalle();
    return fac ? 'Programar pago · ' + fac.numero : 'Programar pago';
  });

  readonly cuentaActual = computed(() =>
    CUENTAS_TESORERIA.find(c => String(c.id) === String(this.cuenta() ?? '')) ?? null);

  readonly acciones = computed<SiremModalAction[]>(() => {
    const fac = this.detalle();
    return [
      { label: 'Cancelar', variant: 'secondary' },
      { label: 'Programar pago', disabled: !fac || fac.estadoPago !== 'Pendiente' },
    ];
  });

  abrir(fila: Record<string, unknown>): void {
    const fac = this.facturas().find(d => d.id === fila['id']);
    if (!fac) return;
    this.seleccion.set(fac);
    this.detalleAbierto.set(true);
  }

  accion(label: string): void {
    const fac = this.seleccion();
    if (!fac) return;
    if (label !== 'Programar pago') {
      this.detalleAbierto.set(false);
      return;
    }
    const cuenta = this.cuentaActual();
    fac.estadoPago = 'Programado';
    this.facturas.update(docs => [...docs]);
    this.toast.success({ title: 'Pago programado',
      description: fac.numero + ' · ' + this.formato(fac.total) + ' el ' +
        (this.fechaPago() ?? '—') + ' desde ' + (cuenta?.nombre ?? 'tesorería') + '.',
      duration: 4_000 });
    this.detalleAbierto.set(false);
  }

  private formato(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(valor);
  }
}`,
    },
  ];
}
