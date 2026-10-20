import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremBadgeTone,
  SiremButton,
  SiremCard,
  SiremChart,
  SiremDataTable,
  SiremEmptyState,
  SiremInput,
  SiremModal,
  SiremPageHeader,
  SiremSearchField,
  SiremSelectOption,
  SiremStatCard,
  SiremTableColumn,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import {
  bucketVencimiento,
  DOCUMENTOS_VENTA,
  type ErpBucket,
  type ErpDocumentoVenta,
} from '../../data/erp-mock';
import { themeMode } from '../../shared/theme/theme';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Rótulo que sustituye el bucket cuando la factura ya no debe nada. */
const PAGADA = 'Pagada';

/** Fila de cartera: documento + bucket de aging calculado. */
type FilaCartera = {
  id: number;
  numero: string;
  tercero: string;
  nit: string;
  fecha: string;
  vence: string;
  total: number;
  saldo: number;
  bucket: ErpBucket | typeof PAGADA;
};

/** Buckets de aging agrupados en las 4 tarjetas del panel. */
const AGING: { label: string; buckets: ErpBucket[] }[] = [
  { label: 'Por vencer', buckets: ['Por vencer'] },
  { label: '0-30 días', buckets: ['0-30'] },
  { label: '31-60 días', buckets: ['31-60'] },
  { label: '61-90 y 90+ días', buckets: ['61-90', '90+'] },
];

/**
 * Cuentas por cobrar: panel de aging, cobros parciales y estados de
 * cuenta. Cada fila abre el modal de registro de cobro y el badge pasa
 * a "Pagada" cuando el saldo llega a cero.
 */
@Component({
  selector: 'app-cuentas-por-cobrar-demo-page',
  standalone: true,
  imports: [
    DecimalPipe,
    PageDemoShell,
    SiremButton,
    SiremCard,
    SiremChart,
    SiremDataTable,
    SiremEmptyState,
    SiremInput,
    SiremModal,
    SiremPageHeader,
    SiremSearchField,
    SiremStatCard,
  ],
  template: `
    <app-page-demo-shell label="Cuentas por cobrar" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header
            title="Cuentas por cobrar"
            subtitle="Vencimientos, cobros parciales y estados de cuenta de la cartera"
          >
            <div slot="actions" class="flex gap-2">
              <sirem-button size="sm" variant="secondary" (pressed)="enviarEstados()">
                Enviar estados de cuenta
              </sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            @for (b of buckets(); track b.label) {
              <sirem-stat-card [label]="b.label" [value]="b.saldo" color="info" />
            }
          </div>

          <sirem-card title="Saldo por antigüedad" subtitle="Cartera abierta agrupada por bucket de vencimiento">
            <sirem-chart [option]="chartOption()" [height]="240" [dark]="isDark()" />
          </sirem-card>

          <div class="grid gap-3 md:grid-cols-[1fr_13rem]">
            <sirem-search-field placeholder="Buscar por número, tercero o NIT…" [(value)]="q" />
            <sirem-input-field [strictOptions]="true"
              label="Antigüedad"
              placeholder="Todos"
              [options]="bucketOptions"
              [(value)]="bucket"
            />
          </div>

          @if (filtradas().length) {
            <sirem-data-table [columns]="cols" [rows]="filtradas()" (rowClicked)="abrir($event)" />
          } @else {
            <sirem-empty-state
              title="Sin cartera"
              description="Ningún documento coincide con los filtros actuales."
            />
          }
        </div>

        <sirem-modal
          [(open)]="cobroAbierto"
          [title]="'Registrar cobro · ' + (seleccion()?.numero ?? '')"
          size="md"
          [actions]="acciones"
          (actionPressed)="accion($event.label)"
        >
          @if (seleccion(); as doc) {
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Tercero</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ doc.tercero }}</p>
                <p class="text-xs text-slate-500">NIT {{ doc.nit }} · vence {{ doc.vence }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Saldo actual</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {{ doc.saldo | number: '1.0-0' }} COP
                </p>
                <p class="text-xs text-slate-500">Total del documento: {{ doc.total | number: '1.0-0' }} COP</p>
              </div>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <sirem-input-field
                type="number"
                label="Valor a cobrar"
                placeholder="0"
                hint="Admite abonos parciales."
                [(value)]="cobro"
              />
              <div class="flex flex-col justify-end pb-1">
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Saldo resultante</p>
                <p class="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {{ saldoResultante() | number: '1.0-0' }} COP
                </p>
              </div>
            </div>
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class CuentasPorCobrarDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia editable: los cobros descuentan saldo en memoria. */
  readonly docs = signal<ErpDocumentoVenta[]>(DOCUMENTOS_VENTA.map((d) => ({ ...d })));

  readonly q = signal('');
  readonly bucket = signal<string | number | null>(null);
  readonly cobroAbierto = signal(false);
  readonly seleccion = signal<ErpDocumentoVenta | null>(null);
  readonly cobro = signal<string | number | (string | number)[] | null>(0);

  readonly bucketOptions: SiremSelectOption[] = [
    { value: 'Por vencer', label: 'Por vencer' },
    { value: '0-30', label: '0-30 días' },
    { value: '31-60', label: '31-60 días' },
    { value: '61-90', label: '61-90 días' },
    { value: '90+', label: 'Más de 90 días' },
  ];

  readonly tonos: Record<string, SiremBadgeTone> = {
    'Por vencer': 'info',
    '0-30': 'warning',
    '31-60': 'danger',
    '61-90': 'danger',
    '90+': 'danger',
    Pagada: 'success',
  };

  readonly cols: SiremTableColumn[] = [
    { key: 'numero', label: 'Documento' },
    { key: 'tercero', label: 'Tercero', subKey: 'nit' },
    { key: 'vence', label: 'Vence', kind: 'date' },
    { key: 'saldo', label: 'Saldo', kind: 'currency', align: 'right' },
    { key: 'bucket', label: 'Antigüedad', kind: 'badge', badgeTones: this.tonos },
  ];

  readonly acciones = [
    { label: 'Cancelar', variant: 'secondary' as const },
    { label: 'Registrar cobro' },
  ];

  /** Documentos con su bucket de aging (o "Pagada" si no debe nada). */
  readonly filas = computed<FilaCartera[]>(() =>
    this.docs().map((d) => ({
      id: d.id,
      numero: d.numero,
      tercero: d.tercero,
      nit: d.nit,
      fecha: d.fecha,
      vence: d.vence,
      total: d.total,
      saldo: d.saldo,
      bucket: d.saldo === 0 ? PAGADA : bucketVencimiento(d.vence),
    })),
  );

  readonly filtradas = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const bucketSel = this.bucket();
    return this.filas().filter((f) => {
      const coincide =
        !texto || (f.numero + ' ' + f.tercero + ' ' + f.nit).toLowerCase().includes(texto);
      return coincide && (!bucketSel || bucketVencimiento(f.vence) === bucketSel);
    });
  });

  /** Saldo agregado por cada grupo de aging (excluye lo ya pagado). */
  readonly buckets = computed(() =>
    AGING.map((grupo) => ({
      label: grupo.label,
      saldo: this.filas()
        .filter(
          (f) => f.saldo > 0 && f.bucket !== PAGADA && grupo.buckets.includes(f.bucket),
        )
        .reduce((acc, f) => acc + f.saldo, 0),
    })),
  );

  readonly chartOption = computed(() => ({
    tooltip: { trigger: 'axis' as const, axisPointer: { type: 'shadow' as const } },
    grid: { left: 8, right: 8, top: 24, bottom: 0, containLabel: true },
    xAxis: { type: 'category' as const, data: AGING.map((g) => g.label) },
    yAxis: { type: 'value' as const },
    series: [
      {
        name: 'Saldo',
        type: 'bar' as const,
        data: this.buckets().map((b) => b.saldo),
        barWidth: '45%',
        itemStyle: { borderRadius: 6 },
      },
    ],
  }));

  readonly saldoResultante = computed(() => {
    const doc = this.seleccion();
    if (!doc) return 0;
    const valor = Number(this.cobro()) || 0;
    return Math.max(0, doc.saldo - valor);
  });

  isDark(): boolean {
    return themeMode() === 'dark';
  }

  enviarEstados(): void {
    this.toast.success({
      title: 'Estados de cuenta enviados',
      description: '5 clientes recibieron su balance a la fecha.',
      duration: 3_500,
    });
  }

  abrir(fila: Record<string, unknown>): void {
    const doc = this.docs().find((d) => d.id === fila['id']);
    if (!doc) return;
    this.seleccion.set(doc);
    this.cobro.set(0);
    this.cobroAbierto.set(true);
  }

  accion(label: string): void {
    if (label === 'Registrar cobro') this.registrar();
    else this.cobroAbierto.set(false);
  }

  /** Aplica un cobro parcial o total y cierra con toast de saldo. */
  registrar(): void {
    const doc = this.seleccion();
    if (!doc) return;

    const valor = Number(this.cobro()) || 0;
    if (valor <= 0) {
      this.toast.error({
        title: 'Valor a cobrar inválido',
        description: 'Ingresa un valor mayor que cero para registrar el abono.',
        duration: 3_000,
      });
      return;
    }

    const restante = Math.max(0, doc.saldo - valor);
    this.docs.update((docs) =>
      docs.map((d) => (d.id === doc.id ? { ...d, saldo: restante } : d)),
    );
    this.seleccion.set(this.docs().find((d) => d.id === doc.id) ?? null);
    this.cobroAbierto.set(false);
    this.toast.success({
      title: 'Cobro registrado en ' + doc.numero,
      description:
        restante === 0
          ? 'Saldo liquidado: la factura pasa a Pagada.'
          : 'Saldo restante: ' + this.cop(restante) + ' COP.',
      duration: 3_500,
    });
  }

  /** Formato COP sin depender del locale del navegador. */
  private cop(valor: number): string {
    return String(Math.round(valor)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'cuentas-por-cobrar.html',
      language: 'html',
      code: `<sirem-page-header
  title="Cuentas por cobrar"
  subtitle="Vencimientos, cobros parciales y estados de cuenta de la cartera">
  <div slot="actions" class="flex gap-2">
    <sirem-button size="sm" variant="secondary" (pressed)="enviarEstados()">Enviar estados de cuenta</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  @for (b of buckets(); track b.label) {
    <sirem-stat-card [label]="b.label" [value]="b.saldo" color="info" />
  }
</div>

<sirem-card title="Saldo por antigüedad" subtitle="Cartera abierta agrupada por bucket de vencimiento">
  <sirem-chart [option]="chartOption()" [height]="240" [dark]="isDark()" />
</sirem-card>

<div class="grid gap-3 md:grid-cols-[1fr_13rem]">
  <sirem-search-field placeholder="Buscar por número, tercero o NIT…" [(value)]="q" />
  <sirem-input-field [strictOptions]="true" label="Antigüedad" placeholder="Todos" [options]="bucketOptions" [(value)]="bucket" />
</div>

@if (filtradas().length) {
  <sirem-data-table [columns]="cols" [rows]="filtradas()" (rowClicked)="abrir($event)" />
} @else {
  <sirem-empty-state title="Sin cartera" description="Ningún documento coincide con los filtros." />
}

<sirem-modal [(open)]="cobroAbierto" [title]="'Registrar cobro · ' + (seleccion()?.numero ?? '')"
  size="md" [actions]="acciones" (actionPressed)="accion($event.label)">
  @if (seleccion(); as doc) {
    <p class="text-sm font-semibold">{{ doc.tercero }} · saldo {{ doc.saldo | number: '1.0-0' }} COP</p>
    <sirem-input-field type="number" label="Valor a cobrar" placeholder="0"
      hint="Admite abonos parciales." [(value)]="cobro" />
    <p class="text-lg font-semibold">Saldo resultante: {{ saldoResultante() | number: '1.0-0' }} COP</p>
  }
</sirem-modal>`,
    },
    {
      name: 'cuentas-por-cobrar.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import { SiremChart, SiremDataTable, SiremModal, SiremInput, SiremTableColumn } from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import {
  bucketVencimiento, DOCUMENTOS_VENTA, type ErpBucket, type ErpDocumentoVenta,
} from '../../data/erp-mock';
import { themeMode } from '../../shared/theme/theme';

const PAGADA = 'Pagada';

const AGING = [
  { label: 'Por vencer', buckets: ['Por vencer'] },
  { label: '0-30 días', buckets: ['0-30'] },
  { label: '31-60 días', buckets: ['31-60'] },
  { label: '61-90 y 90+ días', buckets: ['61-90', '90+'] },
];

export class CuentasPorCobrarPage {
  private readonly toast = inject(DynamicToastService);

  readonly docs = signal<ErpDocumentoVenta[]>(DOCUMENTOS_VENTA.map(d => ({ ...d })));
  readonly q = signal('');
  readonly bucket = signal<string | number | null>(null);
  readonly cobroAbierto = signal(false);
  readonly seleccion = signal<ErpDocumentoVenta | null>(null);
  readonly cobro = signal<string | number | (string | number)[] | null>(0);

  readonly tonos: Record<string, 'neutral' | 'info' | 'success' | 'warning' | 'danger'> = {
    'Por vencer': 'info', '0-30': 'warning', '31-60': 'danger',
    '61-90': 'danger', '90+': 'danger', Pagada: 'success',
  };

  readonly cols: SiremTableColumn[] = [
    { key: 'numero', label: 'Documento' },
    { key: 'tercero', label: 'Tercero', subKey: 'nit' },
    { key: 'vence', label: 'Vence', kind: 'date' },
    { key: 'saldo', label: 'Saldo', kind: 'currency', align: 'right' },
    { key: 'bucket', label: 'Antigüedad', kind: 'badge', badgeTones: this.tonos },
  ];

  readonly filas = computed(() =>
    this.docs().map(d => ({
      ...d,
      bucket: d.saldo === 0 ? PAGADA : bucketVencimiento(d.vence),
    })),
  );

  readonly filtradas = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const sel = this.bucket();
    return this.filas().filter(f => {
      const coincide = !texto || (f.numero + ' ' + f.tercero + ' ' + f.nit).toLowerCase().includes(texto);
      return coincide && (!sel || bucketVencimiento(f.vence) === sel);
    });
  });

  readonly buckets = computed(() =>
    AGING.map(g => ({
      label: g.label,
      saldo: this.filas()
        .filter(f => f.saldo > 0 && (g.buckets as string[]).includes(f.bucket))
        .reduce((acc, f) => acc + f.saldo, 0),
    })),
  );

  readonly chartOption = computed(() => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: AGING.map(g => g.label) },
    yAxis: { type: 'value' },
    series: [{ name: 'Saldo', type: 'bar', data: this.buckets().map(b => b.saldo),
               barWidth: '45%', itemStyle: { borderRadius: 6 } }],
  }));

  readonly saldoResultante = computed(() => {
    const doc = this.seleccion();
    if (!doc) return 0;
    return Math.max(0, doc.saldo - (Number(this.cobro()) || 0));
  });

  isDark() { return themeMode() === 'dark'; }

  abrir(fila: Record<string, unknown>): void {
    const doc = this.docs().find(d => d.id === fila['id']);
    if (!doc) return;
    this.seleccion.set(doc);
    this.cobro.set(0);
    this.cobroAbierto.set(true);
  }

  accion(label: string): void {
    if (label === 'Registrar cobro') this.registrar();
    else this.cobroAbierto.set(false);
  }

  registrar(): void {
    const doc = this.seleccion();
    if (!doc) return;
    const valor = Number(this.cobro()) || 0;
    if (valor <= 0) {
      this.toast.error({ title: 'Valor a cobrar inválido', duration: 3_000 });
      return;
    }
    const restante = Math.max(0, doc.saldo - valor);
    this.docs.update(docs => docs.map(d => (d.id === doc.id ? { ...d, saldo: restante } : d)));
    this.cobroAbierto.set(false);
    this.toast.success({
      title: 'Cobro registrado en ' + doc.numero,
      description: restante === 0 ? 'Saldo liquidado: la factura pasa a Pagada.' : 'Saldo restante: ' + restante + ' COP.',
      duration: 3_500,
    });
  }
}`,
    },
  ];
}
