import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremBadge,
  SiremButton,
  SiremCard,
  SiremDataTable,
  SiremInput,
  SiremModal,
  SiremMoneyPipe,
  SiremPageHeader,
  SiremStatCard,
  SiremSwitch,
  type SiremBadgeTone,
  type SiremModalAction,
  type SiremSelectOption,
  type SiremTableColumn,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import {
  CONCEPTOS_RETENCION,
  PROVEEDORES,
  type ErpConceptoRetencion,
  type ErpProveedor,
} from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Fila dinámica del cálculo de retenciones. */
type FilaRetencion = {
  id: string;
  concepto: string;
  tarifa: number;
  base: number;
  valor: number;
};

/** Registro del historial de retenciones practicadas. */
type RetencionRegistro = {
  id: number;
  numero: string;
  fecha: string;
  proveedor: string;
  concepto: string;
  valor: number;
};

/** Aplicabilidad de cada tributo según la configuración del proveedor. */
type Aplicacion = { nombre: string; aplica: boolean; tone: SiremBadgeTone };

/** Busca un concepto de retención por su identificador. */
function conceptoPorId(id: string): ErpConceptoRetencion | null {
  return CONCEPTOS_RETENCION.find((c) => c.id === id) ?? null;
}

/** Convierte un concepto + base gravable en fila de cálculo. */
function aFila(c: ErpConceptoRetencion, base: number): FilaRetencion {
  return {
    id: c.id,
    concepto: c.nombre,
    tarifa: c.tarifa,
    base,
    valor: Math.round((base * c.tarifa) / 100),
  };
}

/**
 * Gestión de retenciones: ReteFuente, ReteICA y ReteIVA calculados sobre
 * la base gravable según la configuración tributaria del proveedor.
 */
@Component({
  selector: 'app-retenciones-demo-page',
  standalone: true,
  imports: [
    PageDemoShell,
    SiremBadge,
    SiremButton,
    SiremCard,
    SiremDataTable,
    SiremInput,
    SiremModal,
    SiremMoneyPipe,
    SiremPageHeader,
    SiremStatCard,
    SiremSwitch,
  ],
  template: `
    <app-page-demo-shell label="Gestión de retenciones" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header
            title="Gestión de retenciones"
            subtitle="ReteFuente, ReteICA y ReteIVA según la configuración del proveedor"
          >
            <div slot="actions" class="flex gap-2">
              <sirem-button size="sm" [disabled]="totalRetener() <= 0" (pressed)="registrar()">
                Registrar retención
              </sirem-button>
            </div>
          </sirem-page-header>

          <sirem-card
            title="Configuración tributaria del proveedor"
            subtitle="Tributos que aplican según su régimen"
          >
            <sirem-input-field [strictOptions]="true"
              label="Proveedor"
              placeholder="Seleccionar proveedor"
              [options]="proveedorOptions"
              [(value)]="proveedor"
            />
            <div class="mt-4 flex flex-wrap items-center gap-2">
              @for (app of aplicaciones(); track app.nombre) {
                <sirem-badge
                  [tone]="app.tone"
                  [label]="app.nombre + (app.aplica ? ': aplica' : ': no aplica')"
                >
                  {{ app.nombre }}
                </sirem-badge>
              }
              <span class="text-sm text-slate-500 dark:text-slate-400">
                Concepto predeterminado:
                <span class="font-semibold text-slate-900 dark:text-slate-100">
                  {{ proveedorSel()?.concepto ?? '—' }}
                </span>
              </span>
            </div>
          </sirem-card>

          <sirem-card title="Calcular retención">
            <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <sirem-input-field [strictOptions]="true"
                label="Concepto"
                placeholder="Seleccionar concepto"
                [options]="conceptoOptions"
                [(value)]="concepto"
              />
              <sirem-input-field
                label="Base gravable"
                type="number"
                placeholder="0"
                hint="Valor antes de retener"
                [(value)]="base"
              />
              <div class="flex items-end pb-1">
                <sirem-switch-field
                  label="Cálculo automático"
                  description="Suma ReteICA y ReteIVA si el proveedor los tiene activos."
                  [(checked)]="automatico"
                />
              </div>
            </div>
          </sirem-card>

          <div class="grid gap-5 lg:grid-cols-[17rem_1fr]">
            <sirem-stat-card
              label="Total a retener"
              [value]="totalRetener() | siremMoney"
              variant="tint"
              color="brand"
            />
            <sirem-data-table
              [columns]="cols"
              [rows]="filas()"
              emptyText="Ingresa una base gravable para calcular las retenciones."
              (rowClicked)="abrir($event)"
            />
          </div>

          <sirem-card
            title="Historial de retenciones"
            subtitle="Prácticas registradas en la sesión"
          >
            @if (historial().length) {
              <sirem-data-table [columns]="colsHistorial" [rows]="historial()" />
            } @else {
              <p class="text-sm text-slate-500 dark:text-slate-400">
                Aún no se han registrado retenciones en esta sesión.
              </p>
            }
          </sirem-card>
        </div>

        <sirem-modal
          [(open)]="detalleAbierto"
          [title]="detalle()?.concepto ?? 'Retención'"
          size="sm"
          [actions]="accionesDetalle"
          (actionPressed)="detalleAbierto.set(false)"
        >
          @if (detalle(); as fila) {
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {{ proveedorSel()?.nombre ?? '—' }} · NIT {{ proveedorSel()?.nit ?? '—' }}
            </p>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {{ fila.concepto }} · tarifa {{ fila.tarifa }}% · base {{ fila.base | siremMoney }}
            </p>
            <p class="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
              Valor retenido {{ fila.valor | siremMoney }}
            </p>
            <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Se practica sobre la factura del proveedor y se reporta en el formulario de
              retenciones del periodo.
            </p>
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class RetencionesDemoPage {
  private readonly toast = inject(DynamicToastService);

  readonly proveedor = signal<string | number | null>('1');
  readonly concepto = signal<string | number | null>('serv');
  readonly base = signal<string | number | (string | number)[] | null>(2_450_000);
  readonly automatico = signal(true);
  readonly historial = signal<RetencionRegistro[]>([]);

  readonly proveedorOptions: SiremSelectOption[] = PROVEEDORES.map((p) => ({
    value: String(p.id),
    label: p.nombre,
  }));

  readonly conceptoOptions: SiremSelectOption[] = CONCEPTOS_RETENCION.map((c) => ({
    value: c.id,
    label: c.nombre + ' (' + c.tarifa + '%)',
  }));

  readonly cols: SiremTableColumn[] = [
    { key: 'concepto', label: 'Concepto' },
    { key: 'tarifa', label: 'Tarifa %', kind: 'number', align: 'right' },
    { key: 'base', label: 'Base', kind: 'currency', align: 'right' },
    { key: 'valor', label: 'Valor retenido', kind: 'currency', align: 'right' },
  ];

  readonly colsHistorial: SiremTableColumn[] = [
    { key: 'numero', label: 'Registro', subKey: 'fecha' },
    { key: 'proveedor', label: 'Proveedor' },
    { key: 'concepto', label: 'Concepto' },
    { key: 'valor', label: 'Valor retenido', kind: 'currency', align: 'right' },
  ];

  readonly proveedorSel = computed<ErpProveedor | null>(
    () => PROVEEDORES.find((p) => String(p.id) === String(this.proveedor() ?? '')) ?? null,
  );

  readonly conceptoSel = computed<ErpConceptoRetencion | null>(
    () => CONCEPTOS_RETENCION.find((c) => c.id === String(this.concepto() ?? '')) ?? null,
  );

  /** Base gravable como número; 0 si el campo está vacío o no es válido. */
  readonly baseGravable = computed(() => {
    const v = this.base();
    const n = typeof v === 'number' ? v : Array.isArray(v) ? Number(v[0]) : Number(v ?? 0);
    return Number.isFinite(n) && n > 0 ? n : 0;
  });

  /** Badges ReteFuente / ReteICA / ReteIVA del proveedor seleccionado. */
  readonly aplicaciones = computed<Aplicacion[]>(() => {
    const p = this.proveedorSel();
    return [
      { nombre: 'ReteFuente', aplica: !!p?.retefuente, tone: p?.retefuente ? 'success' : 'neutral' },
      { nombre: 'ReteICA', aplica: !!p?.reteica, tone: p?.reteica ? 'success' : 'neutral' },
      { nombre: 'ReteIVA', aplica: !!p?.reteiva, tone: p?.reteiva ? 'success' : 'neutral' },
    ];
  });

  /** Retenciones aplicables: concepto elegido + extras automáticos. */
  readonly filas = computed<FilaRetencion[]>(() => {
    const p = this.proveedorSel();
    const c = this.conceptoSel();
    const base = this.baseGravable();
    if (!p || !c || base <= 0) return [];

    const filas: FilaRetencion[] = [aFila(c, base)];
    if (this.automatico()) {
      const ica = conceptoPorId('ica');
      const iva = conceptoPorId('iva');
      if (p.reteica && c.aplica !== 'ReteICA' && ica) filas.push(aFila(ica, base));
      if (p.reteiva && c.aplica !== 'ReteIVA' && iva) filas.push(aFila(iva, base));
    }
    return filas;
  });

  readonly totalRetener = computed(() =>
    this.filas().reduce((acc, fila) => acc + fila.valor, 0),
  );

  readonly detalleAbierto = signal(false);
  private readonly seleccion = signal<FilaRetencion | null>(null);

  readonly detalle = computed(() => this.seleccion());

  readonly accionesDetalle: SiremModalAction[] = [{ label: 'Cerrar', variant: 'secondary' }];

  /** Abre el detalle de la fila seleccionada en el modal. */
  abrir(fila: Record<string, unknown>): void {
    const filaSel = this.filas().find((f) => f.id === fila['id']);
    if (!filaSel) return;
    this.seleccion.set(filaSel);
    this.detalleAbierto.set(true);
  }

  /** Registra la retención en el historial local y notifica con toast. */
  registrar(): void {
    const p = this.proveedorSel();
    const total = this.totalRetener();
    if (!p || total <= 0) return;

    const numero = 'RT-00' + (87 + this.historial().length);
    const registro: RetencionRegistro = {
      id: this.historial().length + 1,
      numero,
      fecha: '2026-10-01',
      proveedor: p.nombre,
      concepto: this.conceptoSel()?.nombre ?? '—',
      valor: total,
    };
    this.historial.update((h) => [registro, ...h]);
    this.toast.success({
      title: 'Retención ' + numero + ' registrada',
      description: this.formato(total) + ' descontados a ' + p.nombre + '.',
      duration: 4_000,
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
      name: 'retenciones.html',
      language: 'html',
      code: `<sirem-page-header
  title="Gestión de retenciones"
  subtitle="ReteFuente, ReteICA y ReteIVA según la configuración del proveedor">
  <div slot="actions" class="flex gap-2">
    <sirem-button size="sm" [disabled]="totalRetener() <= 0" (pressed)="registrar()">
      Registrar retención
    </sirem-button>
  </div>
</sirem-page-header>

<sirem-card title="Configuración tributaria del proveedor"
  subtitle="Tributos que aplican según su régimen">
  <sirem-input-field [strictOptions]="true" label="Proveedor" placeholder="Seleccionar proveedor"
    [options]="proveedorOptions" [(value)]="proveedor" />
  <div class="mt-4 flex flex-wrap items-center gap-2">
    @for (app of aplicaciones(); track app.nombre) {
      <sirem-badge [tone]="app.tone">{{ app.nombre }}</sirem-badge>
    }
    <span class="text-sm">Concepto predeterminado: {{ proveedorSel()?.concepto ?? '—' }}</span>
  </div>
</sirem-card>

<sirem-card title="Calcular retención">
  <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
    <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Concepto" [options]="conceptoOptions" [(value)]="concepto" />
    <sirem-input-field label="Base gravable" type="number" [(value)]="base" />
    <sirem-switch-field label="Cálculo automático" [(checked)]="automatico" />
  </div>
</sirem-card>

<div class="grid gap-5 lg:grid-cols-[17rem_1fr]">
  <sirem-stat-card label="Total a retener" [value]="totalRetener() | siremMoney" variant="tint" />
  <sirem-data-table [columns]="cols" [rows]="filas()" (rowClicked)="abrir($event)" />
</div>

<sirem-card title="Historial de retenciones">
  <sirem-data-table [columns]="colsHistorial" [rows]="historial()" />
</sirem-card>

<sirem-modal [(open)]="detalleAbierto" [title]="detalle()?.concepto ?? 'Retención'"
  size="sm" [actions]="accionesDetalle" (actionPressed)="detalleAbierto.set(false)">
  @if (detalle(); as fila) {
    <p class="text-sm">{{ proveedorSel()?.nombre }}</p>
    <p class="text-sm">{{ fila.concepto }} · tarifa {{ fila.tarifa }}%</p>
    <p class="text-sm">Base {{ fila.base | siremMoney }} → retenido {{ fila.valor | siremMoney }}</p>
  }
</sirem-modal>`,
    },
    {
      name: 'retenciones.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremBadge, SiremDataTable, SiremInput, SiremModal, SiremSwitch,
  type ErpConceptoRetencion, type ErpProveedor,
  type SiremBadgeTone, type SiremModalAction, type SiremTableColumn,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { CONCEPTOS_RETENCION, PROVEEDORES } from '../../data/erp-mock';

type FilaRetencion = { id: string; concepto: string; tarifa: number; base: number; valor: number };
type RetencionRegistro = { id: number; numero: string; fecha: string;
  proveedor: string; concepto: string; valor: number };
type Aplicacion = { nombre: string; aplica: boolean; tone: SiremBadgeTone };

function conceptoPorId(id: string): ErpConceptoRetencion | null {
  return CONCEPTOS_RETENCION.find(c => c.id === id) ?? null;
}

function aFila(c: ErpConceptoRetencion, base: number): FilaRetencion {
  return { id: c.id, concepto: c.nombre, tarifa: c.tarifa, base,
           valor: Math.round((base * c.tarifa) / 100) };
}

export class RetencionesPage {
  private readonly toast = inject(DynamicToastService);

  readonly proveedor = signal<string | number | null>('1');
  readonly concepto = signal<string | number | null>('serv');
  readonly base = signal<string | number | (string | number)[] | null>(2_450_000);
  readonly automatico = signal(true);
  readonly historial = signal<RetencionRegistro[]>([]);

  readonly proveedorOptions = PROVEEDORES.map(p => ({ value: String(p.id), label: p.nombre }));
  readonly conceptoOptions = CONCEPTOS_RETENCION.map(c =>
    ({ value: c.id, label: c.nombre + ' (' + c.tarifa + '%)' }));

  readonly cols: SiremTableColumn[] = [
    { key: 'concepto', label: 'Concepto' },
    { key: 'tarifa', label: 'Tarifa %', kind: 'number', align: 'right' },
    { key: 'base', label: 'Base', kind: 'currency', align: 'right' },
    { key: 'valor', label: 'Valor retenido', kind: 'currency', align: 'right' },
  ];

  readonly proveedorSel = computed<ErpProveedor | null>(() =>
    PROVEEDORES.find(p => String(p.id) === String(this.proveedor() ?? '')) ?? null);

  readonly conceptoSel = computed<ErpConceptoRetencion | null>(() =>
    CONCEPTOS_RETENCION.find(c => c.id === String(this.concepto() ?? '')) ?? null);

  readonly baseGravable = computed(() => {
    const v = this.base();
    const n = typeof v === 'number' ? v : Array.isArray(v) ? Number(v[0]) : Number(v ?? 0);
    return Number.isFinite(n) && n > 0 ? n : 0;
  });

  readonly aplicaciones = computed<Aplicacion[]>(() => {
    const p = this.proveedorSel();
    return [
      { nombre: 'ReteFuente', aplica: !!p?.retefuente, tone: p?.retefuente ? 'success' : 'neutral' },
      { nombre: 'ReteICA', aplica: !!p?.reteica, tone: p?.reteica ? 'success' : 'neutral' },
      { nombre: 'ReteIVA', aplica: !!p?.reteiva, tone: p?.reteiva ? 'success' : 'neutral' },
    ];
  });

  readonly filas = computed<FilaRetencion[]>(() => {
    const p = this.proveedorSel();
    const c = this.conceptoSel();
    const base = this.baseGravable();
    if (!p || !c || base <= 0) return [];
    const filas: FilaRetencion[] = [aFila(c, base)];
    if (this.automatico()) {
      const ica = conceptoPorId('ica');
      const iva = conceptoPorId('iva');
      if (p.reteica && c.aplica !== 'ReteICA' && ica) filas.push(aFila(ica, base));
      if (p.reteiva && c.aplica !== 'ReteIVA' && iva) filas.push(aFila(iva, base));
    }
    return filas;
  });

  readonly totalRetener = computed(() =>
    this.filas().reduce((acc, fila) => acc + fila.valor, 0));

  readonly detalleAbierto = signal(false);
  private readonly seleccion = signal<FilaRetencion | null>(null);
  readonly detalle = computed(() => this.seleccion());
  readonly accionesDetalle: SiremModalAction[] = [{ label: 'Cerrar', variant: 'secondary' }];

  abrir(fila: Record<string, unknown>): void {
    const filaSel = this.filas().find(f => f.id === fila['id']);
    if (!filaSel) return;
    this.seleccion.set(filaSel);
    this.detalleAbierto.set(true);
  }

  registrar(): void {
    const p = this.proveedorSel();
    const total = this.totalRetener();
    if (!p || total <= 0) return;
    const numero = 'RT-00' + (87 + this.historial().length);
    this.historial.update(h => [{ id: h.length + 1, numero, fecha: '2026-10-01',
      proveedor: p.nombre, concepto: this.conceptoSel()?.nombre ?? '—', valor: total }, ...h]);
    this.toast.success({ title: 'Retención ' + numero + ' registrada',
      description: this.formato(total) + ' descontados a ' + p.nombre + '.', duration: 4_000 });
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
