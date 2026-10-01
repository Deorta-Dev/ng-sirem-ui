import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremBadge, SiremBadgeTone, SiremButton, SiremCard, SiremConfirmDialog,
  SiremDataTable, SiremInput, SiremModal, SiremPageHeader, SiremSelect, SiremSelectOption,
  SiremStatCard, SiremTableColumn, SiremTextarea,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { BODEGAS, PRODUCTOS, type ErpProducto, stockTotal } from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Ajuste manual del inventario con su motivo y observación. */
type Ajuste = {
  id: number;
  numero: string;
  fecha: string;
  motivo: string;
  producto: string;
  sku: string;
  /** Cantidad con signo: negativa en salidas, positiva en entradas. */
  cantidad: number;
  observacion: string;
};

/** Valor crudo de un `sirem-input-field` (trae texto o número). */
type ValorCampo = string | number | (string | number)[] | null;

const MOTIVOS: string[] = ['Pérdida', 'Robo', 'Conteo físico', 'Entrada por compra', 'Devolución'];
/** Motivos que descuentan existencia (el conteo físico es diferencia hacia abajo). */
const MOTIVOS_SALIDA: string[] = ['Pérdida', 'Robo', 'Conteo físico'];
const MOTIVO_TONES: Record<string, SiremBadgeTone> = {
  Pérdida: 'danger', Robo: 'danger', 'Conteo físico': 'info',
  'Entrada por compra': 'success', 'Devolución': 'neutral',
};

/** Historial previo de la demo: el siguiente consecutivo es AJ-0042. */
const AJUSTES_SEMILLA: Ajuste[] = [
  { id: 39, numero: 'AJ-0039', fecha: '2026-09-08', motivo: 'Conteo físico', producto: 'Papel carta (paq. 500)', sku: 'SKU-1002', cantidad: -12, observacion: 'Diferencia de conteo en el estante B4.' },
  { id: 40, numero: 'AJ-0040', fecha: '2026-09-16', motivo: 'Entrada por compra', producto: 'Resma reciclada 75 g', sku: 'SKU-1007', cantidad: 50, observacion: 'Compra local pendiente de factura.' },
  { id: 41, numero: 'AJ-0041', fecha: '2026-09-24', motivo: 'Pérdida', producto: 'Tinta recargable cyan', sku: 'SKU-1005', cantidad: -6, observacion: 'Cartucho dañado durante el traslado.' },
];

function numero(v: ValorCampo): number {
  if (Array.isArray(v)) return Number(v[0] ?? 0);
  return Number(v ?? 0);
}

/**
 * Ajustes de inventario: entradas y salidas manuales por pérdida, robo o
 * conteo físico, con validación de existencia, confirmación y bitácora.
 */
@Component({
  selector: 'app-ajustes-inventario-demo-page',
  standalone: true,
  imports: [PageDemoShell, SiremBadge, SiremButton, SiremCard, SiremConfirmDialog,
    SiremDataTable, SiremInput, SiremModal, SiremPageHeader, SiremSelect, SiremStatCard,
    SiremTextarea],
  template: `
    <app-page-demo-shell label="Ajustes de inventario" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header title="Ajustes de inventario" subtitle="Entradas o salidas manuales por pérdida, robo o conteo físico">
            <div slot="actions">
              <sirem-button size="sm" (pressed)="nuevoAjuste()">
                <i slot="icon" class="fi fi-rr-plus" aria-hidden="true"></i>
                Nuevo ajuste
              </sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Ajustes del mes" [value]="ajustesMes()" />
            <sirem-stat-card label="Unidades retiradas" [value]="retiradas()" color="danger" />
            <sirem-stat-card label="Unidades ingresadas" [value]="ingresadas()" color="success" />
            <sirem-stat-card label="Último motivo" [value]="ultimoMotivo()" color="info" />
          </div>

          <sirem-card title="Registrar ajuste" subtitle="La cantidad se aplica con signo según el motivo">
            <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <sirem-select-field label="Motivo" [options]="motivoOptions" [(value)]="motivoSel" />
              <sirem-select-field label="Producto" [options]="productoOptions()" [(value)]="skuSel" />
              <sirem-input-field label="Cantidad" type="number" placeholder="Ej. 6" [error]="errorCantidad()" [(value)]="cantidad" />
            </div>

            <sirem-textarea-field class="mt-3 block w-full" label="Observación" [rows]="2"
              placeholder="Describe el hallazgo, la ubicación o el documento soporte…" [(value)]="observacion" />

            <div class="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
              <span class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Impacto estimado</span>
              <sirem-badge [tone]="tonoImpacto()">{{ impactoTexto() }}</sirem-badge>
              <span class="text-sm text-slate-600 dark:text-slate-300">
                Existencia {{ existencia() }} → {{ existenciaResultante() }} und.
                <span class="text-slate-400 dark:text-slate-500">({{ bodegaDestino() }})</span>
              </span>
            </div>

            <div class="mt-4 flex justify-end">
              <sirem-button [disabled]="!puedeRegistrar()" (pressed)="registrar()">Registrar ajuste</sirem-button>
            </div>
          </sirem-card>

          <sirem-data-table [columns]="cols" [rows]="historial()" emptyText="Sin ajustes registrados en el periodo." (rowClicked)="abrirAjuste($event)" />
        </div>

        <sirem-confirm-dialog [(open)]="confirmAbierto" title="Confirmar ajuste"
          [message]="mensajeConfirmacion()" [detail]="detalleConfirmacion()"
          [variant]="esSalida() ? 'danger' : 'primary'" confirmLabel="Registrar ajuste"
          (confirmed)="confirmado()" />

        <sirem-modal [(open)]="detalleAbierto" title="Detalle del ajuste" size="sm">
          @if (ajusteSel(); as a) {
            <dl class="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
              <div><dt class="text-slate-500 dark:text-slate-400">Número</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ a.numero }}</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Fecha</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ a.fecha }}</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Motivo</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ a.motivo }}</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Producto</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ a.producto }} · {{ a.sku }}</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Cantidad</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ a.cantidad }} und.</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Observación</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ a.observacion }}</dd></div>
            </dl>
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class AjustesInventarioDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia local: los ajustes descuentan o suman existencias del catálogo. */
  readonly productos = signal<ErpProducto[]>(PRODUCTOS.map((p) => ({ ...p })));
  readonly historial = signal<Ajuste[]>([...AJUSTES_SEMILLA]);
  readonly consecutivo = signal(41);

  readonly motivoSel = signal<string | number | null>(MOTIVOS[0]);
  readonly skuSel = signal<string | number | null>(PRODUCTOS[0].sku);
  readonly cantidad = signal<ValorCampo>(null);
  readonly observacion = signal<string | null>(null);
  readonly confirmAbierto = signal(false);

  readonly motivoOptions: SiremSelectOption[] = MOTIVOS.map((m) => ({ value: m, label: m }));
  readonly productoOptions = computed<SiremSelectOption[]>(() =>
    this.productos().map((p) => ({ value: p.sku, label: p.sku + ' · ' + p.nombre })),
  );

  readonly cols: SiremTableColumn[] = [
    { key: 'fecha', label: 'Fecha', kind: 'date' },
    { key: 'motivo', label: 'Motivo', kind: 'badge', badgeTones: MOTIVO_TONES },
    { key: 'producto', label: 'Producto', subKey: 'observacion' },
    { key: 'cantidad', label: 'Cantidad', kind: 'number', align: 'right' },
  ];

  readonly producto = computed(() => this.productos().find((p) => p.sku === String(this.skuSel() ?? '')) ?? null);
  readonly existencia = computed(() => {
    const p = this.producto();
    return p ? stockTotal(p) : 0;
  });

  readonly esSalida = computed(() => MOTIVOS_SALIDA.includes(String(this.motivoSel() ?? '')));
  readonly cantidadNum = computed(() => numero(this.cantidad()));

  readonly errorCantidad = computed(() => {
    const raw = this.cantidad();
    if (raw === null || raw === '') return '';
    const n = numero(raw);
    if (n <= 0) return 'Debe ser mayor que 0.';
    if (this.esSalida() && n > this.existencia()) {
      return 'Existencia insuficiente: solo hay ' + this.existencia() + ' und.';
    }
    return '';
  });

  readonly impacto = computed(() => (this.esSalida() ? -this.cantidadNum() : this.cantidadNum()));
  readonly impactoTexto = computed(() => {
    const n = this.impacto();
    return (n >= 0 ? '+' + n : String(n)) + ' und.';
  });
  readonly tonoImpacto = computed<SiremBadgeTone>(() =>
    this.impacto() < 0 ? 'danger' : this.impacto() > 0 ? 'success' : 'neutral');
  readonly existenciaResultante = computed(() => this.existencia() + this.impacto());
  readonly puedeRegistrar = computed(
    () => this.errorCantidad() === '' && this.cantidadNum() > 0 && this.producto() !== null);

  readonly ajustesMes = computed(() => this.historial().length);
  readonly retiradas = computed(
    () => this.historial().reduce((acc, a) => acc + (a.cantidad < 0 ? Math.abs(a.cantidad) : 0), 0));
  readonly ingresadas = computed(
    () => this.historial().reduce((acc, a) => acc + (a.cantidad > 0 ? a.cantidad : 0), 0));
  readonly ultimoMotivo = computed(() => {
    const lista = this.historial();
    return lista.length ? lista[0].motivo : '—';
  });

  readonly mensajeConfirmacion = computed(() => {
    const p = this.producto();
    if (!p) return '¿Registrar el ajuste?';
    return '¿Registrar un ajuste de ' + this.impactoTexto() + ' por ' +
      String(this.motivoSel() ?? '') + ' en ' + p.sku + '?';
  });
  readonly detalleConfirmacion = computed(
    () => 'Existencia resultante: ' + this.existenciaResultante() +
      ' und. El cambio queda en la bitácora del periodo.');

  /** Detalle del ajuste seleccionado en la bitácora. */
  readonly detalleAbierto = signal(false);
  readonly ajusteSel = signal<Ajuste | null>(null);

  /** Bodega de destino de los ajustes (la principal). */
  bodegaDestino(): string {
    return BODEGAS[0].nombre;
  }

  /** Abre la ficha del ajuste pulsado en la bitácora del periodo. */
  abrirAjuste(fila: Record<string, unknown>): void {
    const ajuste = this.historial().find((a) => a.id === fila['id']);
    if (!ajuste) return;
    this.ajusteSel.set(ajuste);
    this.detalleAbierto.set(true);
  }

  /** Limpia el formulario para capturar un ajuste nuevo. */
  nuevoAjuste(): void {
    this.motivoSel.set(MOTIVOS[0]);
    this.skuSel.set(PRODUCTOS[0].sku);
    this.cantidad.set(null);
    this.observacion.set(null);
    this.confirmAbierto.set(false);
  }

  /** Abre la confirmación (danger en salidas, primary en entradas). */
  registrar(): void {
    if (!this.puedeRegistrar()) return;
    this.confirmAbierto.set(true);
  }

  /** Confirma el ajuste: bitácora + existencia + toast. */
  confirmado(): void {
    const p = this.producto();
    if (!p || !this.puedeRegistrar()) return;

    const motivo = String(this.motivoSel() ?? MOTIVOS[0]);
    const impacto = this.impacto();
    const id = this.consecutivo() + 1;
    const numeroAjuste = 'AJ-' + String(id).padStart(4, '0');

    this.historial.update((lista) => [{
      id, numero: numeroAjuste, fecha: '2026-09-30', motivo,
      producto: p.nombre, sku: p.sku, cantidad: impacto,
      observacion: this.observacion() ?? 'Sin observación.',
    }, ...lista]);
    this.consecutivo.set(id);
    this.productos.update((lista) => lista.map((x) => x.id === p.id
      ? { ...x, stock: this.aplicarStock(x, impacto) }
      : x));

    this.cantidad.set(null);
    this.observacion.set(null);
    this.confirmAbierto.set(false);
    this.toast.success({
      title: numeroAjuste + ' registrado',
      description: impacto + ' unidades · ' + motivo + ' · ' + p.sku + '.',
      duration: 4_000,
    });
  }

  /** Suma entradas en la bodega principal y reparte las salidas entre bodegas. */
  private aplicarStock(p: ErpProducto, delta: number): Record<string, number> {
    const stock = { ...p.stock };
    if (delta > 0) {
      stock[BODEGAS[0].id] = (stock[BODEGAS[0].id] ?? 0) + delta;
      return stock;
    }
    let restante = -delta;
    for (const b of BODEGAS) {
      if (restante <= 0) break;
      const disponible = stock[b.id] ?? 0;
      const quitar = Math.min(disponible, restante);
      stock[b.id] = disponible - quitar;
      restante -= quitar;
    }
    return stock;
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'ajustes-inventario.html',
      language: 'html',
      code: `<sirem-page-header title="Ajustes de inventario"
  subtitle="Entradas o salidas manuales por pérdida, robo o conteo físico">
  <div slot="actions">
    <sirem-button size="sm" (pressed)="nuevoAjuste()">
      <i slot="icon" class="fi fi-rr-plus" aria-hidden="true"></i>
      Nuevo ajuste
    </sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Ajustes del mes" [value]="ajustesMes()" />
  <sirem-stat-card label="Unidades retiradas" [value]="retiradas()" color="danger" />
  <sirem-stat-card label="Unidades ingresadas" [value]="ingresadas()" color="success" />
  <sirem-stat-card label="Último motivo" [value]="ultimoMotivo()" color="info" />
</div>

<sirem-card title="Registrar ajuste" subtitle="La cantidad se aplica con signo según el motivo">
  <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
    <sirem-select-field label="Motivo" [options]="motivoOptions" [(value)]="motivoSel" />
    <sirem-select-field label="Producto" [options]="productoOptions" [(value)]="skuSel" />
    <sirem-input-field label="Cantidad" type="number" placeholder="Ej. 6"
      [error]="errorCantidad" [(value)]="cantidad" />
  </div>

  <sirem-textarea-field class="mt-3 block w-full" label="Observación" [rows]="2"
    placeholder="Describe el hallazgo o el documento soporte…" [(value)]="observacion" />

  <div class="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200
    px-3 py-2 dark:border-slate-700">
    <span class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Impacto estimado</span>
    <sirem-badge [tone]="tonoImpacto()">{{ impactoTexto() }}</sirem-badge>
    <span class="text-sm text-slate-600 dark:text-slate-300">
      Existencia {{ existencia() }} → {{ existenciaResultante() }} und.
    </span>
  </div>

  <div class="mt-4 flex justify-end">
    <sirem-button [disabled]="!puedeRegistrar()" (pressed)="registrar()">Registrar ajuste</sirem-button>
  </div>
</sirem-card>

<sirem-data-table [columns]="cols" [rows]="historial()" emptyText="Sin ajustes registrados en el periodo." (rowClicked)="abrirAjuste($event)" />

<sirem-confirm-dialog [(open)]="confirmAbierto" title="Confirmar ajuste"
  [message]="mensajeConfirmacion()" [detail]="detalleConfirmacion()"
  [variant]="esSalida() ? 'danger' : 'primary'" confirmLabel="Registrar ajuste"
  (confirmed)="confirmado()" />

<sirem-modal [(open)]="detalleAbierto" title="Detalle del ajuste" size="sm">
  @if (ajusteSel(); as a) {
    <dl class="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
      <div><dt class="text-slate-500 dark:text-slate-400">Número</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ a.numero }}</dd></div>
      <div><dt class="text-slate-500 dark:text-slate-400">Fecha</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ a.fecha }}</dd></div>
      <div><dt class="text-slate-500 dark:text-slate-400">Motivo</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ a.motivo }}</dd></div>
      <div><dt class="text-slate-500 dark:text-slate-400">Producto</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ a.producto }} · {{ a.sku }}</dd></div>
      <div><dt class="text-slate-500 dark:text-slate-400">Cantidad</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ a.cantidad }} und.</dd></div>
      <div><dt class="text-slate-500 dark:text-slate-400">Observación</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ a.observacion }}</dd></div>
    </dl>
  }
</sirem-modal>`,
    },
    {
      name: 'ajustes-inventario.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremBadge, SiremButton, SiremCard, SiremConfirmDialog, SiremDataTable,
  SiremInput, SiremModal, SiremPageHeader, SiremSelect, SiremStatCard, SiremTextarea,
  type SiremBadgeTone, type SiremSelectOption,
  type SiremTableColumn,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { BODEGAS, PRODUCTOS, type ErpProducto, stockTotal } from '../../data/erp-mock';

type Ajuste = {
  id: number; numero: string; fecha: string; motivo: string; producto: string;
  sku: string; cantidad: number; observacion: string;
};
type ValorCampo = string | number | (string | number)[] | null;

const MOTIVOS: string[] = ['Pérdida', 'Robo', 'Conteo físico', 'Entrada por compra', 'Devolución'];
const MOTIVOS_SALIDA: string[] = ['Pérdida', 'Robo', 'Conteo físico'];
const MOTIVO_TONES: Record<string, SiremBadgeTone> = {
  Pérdida: 'danger', Robo: 'danger', 'Conteo físico': 'info',
  'Entrada por compra': 'success', 'Devolución': 'neutral',
};
const AJUSTES_SEMILLA: Ajuste[] = [
  { id: 41, numero: 'AJ-0041', fecha: '2026-09-24', motivo: 'Pérdida',
    producto: 'Tinta recargable cyan', sku: 'SKU-1005', cantidad: -6,
    observacion: 'Cartucho dañado durante el traslado.' },
];

function numero(v: ValorCampo): number {
  if (Array.isArray(v)) return Number(v[0] ?? 0);
  return Number(v ?? 0);
}

@Component({
  selector: 'app-ajustes-inventario-page',
  standalone: true,
  imports: [SiremPageHeader, SiremButton, SiremStatCard, SiremCard, SiremSelect,
    SiremInput, SiremTextarea, SiremBadge, SiremDataTable, SiremConfirmDialog,
    SiremModal],
  templateUrl: './ajustes-inventario.html',
})
export class AjustesInventarioPage {
  private readonly toast = inject(DynamicToastService);

  readonly productos = signal<ErpProducto[]>(PRODUCTOS.map(p => ({ ...p })));
  readonly historial = signal<Ajuste[]>([...AJUSTES_SEMILLA]);
  readonly consecutivo = signal(41);

  readonly motivoSel = signal<string | number | null>(MOTIVOS[0]);
  readonly skuSel = signal<string | number | null>(PRODUCTOS[0].sku);
  readonly cantidad = signal<ValorCampo>(null);
  readonly observacion = signal<string | null>(null);
  readonly confirmAbierto = signal(false);

  readonly motivoOptions: SiremSelectOption[] = MOTIVOS.map(m => ({ value: m, label: m }));
  readonly productoOptions = computed<SiremSelectOption[]>(() =>
    this.productos().map(p => ({ value: p.sku, label: p.sku + ' · ' + p.nombre })));

  readonly cols: SiremTableColumn[] = [
    { key: 'fecha', label: 'Fecha', kind: 'date' },
    { key: 'motivo', label: 'Motivo', kind: 'badge', badgeTones: MOTIVO_TONES },
    { key: 'producto', label: 'Producto', subKey: 'observacion' },
    { key: 'cantidad', label: 'Cantidad', kind: 'number', align: 'right' },
  ];

  readonly producto = computed(
    () => this.productos().find(p => p.sku === String(this.skuSel() ?? '')) ?? null);
  readonly existencia = computed(() => {
    const p = this.producto();
    return p ? stockTotal(p) : 0;
  });
  readonly esSalida = computed(() => MOTIVOS_SALIDA.includes(String(this.motivoSel() ?? '')));
  readonly cantidadNum = computed(() => numero(this.cantidad()));

  readonly errorCantidad = computed(() => {
    const raw = this.cantidad();
    if (raw === null || raw === '') return '';
    const n = numero(raw);
    if (n <= 0) return 'Debe ser mayor que 0.';
    if (this.esSalida() && n > this.existencia()) {
      return 'Existencia insuficiente: solo hay ' + this.existencia() + ' und.';
    }
    return '';
  });

  readonly impacto = computed(() => (this.esSalida() ? -this.cantidadNum() : this.cantidadNum()));
  readonly impactoTexto = computed(() => {
    const n = this.impacto();
    return (n >= 0 ? '+' + n : String(n)) + ' und.';
  });
  readonly tonoImpacto = computed<SiremBadgeTone>(() =>
    this.impacto() < 0 ? 'danger' : this.impacto() > 0 ? 'success' : 'neutral');
  readonly existenciaResultante = computed(() => this.existencia() + this.impacto());
  readonly puedeRegistrar = computed(
    () => this.errorCantidad() === '' && this.cantidadNum() > 0 && this.producto() !== null);

  readonly ajustesMes = computed(() => this.historial().length);
  readonly retiradas = computed(
    () => this.historial().reduce((acc, a) => acc + (a.cantidad < 0 ? Math.abs(a.cantidad) : 0), 0));
  readonly ingresadas = computed(
    () => this.historial().reduce((acc, a) => acc + (a.cantidad > 0 ? a.cantidad : 0), 0));
  readonly ultimoMotivo = computed(() => {
    const lista = this.historial();
    return lista.length ? lista[0].motivo : '—';
  });

  readonly mensajeConfirmacion = computed(() => {
    const p = this.producto();
    if (!p) return '¿Registrar el ajuste?';
    return '¿Registrar un ajuste de ' + this.impactoTexto() + ' por ' +
      String(this.motivoSel() ?? '') + ' en ' + p.sku + '?';
  });
  readonly detalleConfirmacion = computed(
    () => 'Existencia resultante: ' + this.existenciaResultante() +
      ' und. El cambio queda en la bitácora del periodo.');

  readonly detalleAbierto = signal(false);
  readonly ajusteSel = signal<Ajuste | null>(null);

  abrirAjuste(fila: Record<string, unknown>): void {
    const ajuste = this.historial().find(a => a.id === fila['id']);
    if (!ajuste) return;
    this.ajusteSel.set(ajuste);
    this.detalleAbierto.set(true);
  }

  nuevoAjuste(): void {
    this.motivoSel.set(MOTIVOS[0]);
    this.skuSel.set(PRODUCTOS[0].sku);
    this.cantidad.set(null);
    this.observacion.set(null);
    this.confirmAbierto.set(false);
  }

  registrar(): void {
    if (!this.puedeRegistrar()) return;
    this.confirmAbierto.set(true);
  }

  confirmado(): void {
    const p = this.producto();
    if (!p || !this.puedeRegistrar()) return;

    const motivo = String(this.motivoSel() ?? MOTIVOS[0]);
    const impacto = this.impacto();
    const id = this.consecutivo() + 1;
    const numeroAjuste = 'AJ-' + String(id).padStart(4, '0');

    this.historial.update(lista => [{
      id, numero: numeroAjuste, fecha: '2026-09-30', motivo,
      producto: p.nombre, sku: p.sku, cantidad: impacto,
      observacion: this.observacion() ?? 'Sin observación.',
    }, ...lista]);
    this.consecutivo.set(id);
    this.productos.update(lista => lista.map(x => x.id === p.id
      ? { ...x, stock: this.aplicarStock(x, impacto) }
      : x));

    this.cantidad.set(null);
    this.observacion.set(null);
    this.confirmAbierto.set(false);
    this.toast.success({
      title: numeroAjuste + ' registrado',
      description: impacto + ' unidades · ' + motivo + ' · ' + p.sku + '.',
      duration: 4_000,
    });
  }

  private aplicarStock(p: ErpProducto, delta: number): Record<string, number> {
    const stock = { ...p.stock };
    if (delta > 0) {
      stock[BODEGAS[0].id] = (stock[BODEGAS[0].id] ?? 0) + delta;
      return stock;
    }
    let restante = -delta;
    for (const b of BODEGAS) {
      if (restante <= 0) break;
      const disponible = stock[b.id] ?? 0;
      const quitar = Math.min(disponible, restante);
      stock[b.id] = disponible - quitar;
      restante -= quitar;
    }
    return stock;
  }
}`,
    },
  ];
}
