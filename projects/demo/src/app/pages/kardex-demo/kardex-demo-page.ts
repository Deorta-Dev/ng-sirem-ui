import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton, SiremDataTable, SiremEmptyState, SiremInput, SiremModal,
  SiremModalAction, SiremMoneyPipe, SiremPageHeader, SiremSelect, SiremSelectOption,
  SiremStatCard, SiremTableColumn,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { BODEGAS, PRODUCTOS, type ErpProducto, stockTotal } from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Tipos de movimiento del kárdex. */
type TipoMov = 'Entrada' | 'Salida' | 'Transferencia';

type MovBase = { id: number; fecha: string; tipo: TipoMov; documento: string; cantidad: number; costo: number };
type Movimiento = MovBase & { saldo: number };
/** Entradas manuales de la demo, anidadas al producto al que pertenecen. */
type MovExtra = MovBase & { productoId: number };
/** Valor crudo de un `sirem-input-field` (trae texto o número). */
type ValorCampo = string | number | (string | number)[] | null;

/** Bodega de destino de las entradas manuales de la demo. */
const BODEGA_ENTRADA = BODEGAS[0].id;

function numero(v: ValorCampo): number {
  if (Array.isArray(v)) return Number(v[0] ?? 0);
  return Number(v ?? 0);
}

function cop(valor: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
}

/** Variación del saldo: la transferencia entre bodegas no cambia el total. */
function deltaDe(m: MovBase): number {
  if (m.tipo === 'Entrada') return m.cantidad;
  if (m.tipo === 'Salida') return -m.cantidad;
  return 0;
}

/**
 * Movimientos base deterministas del SKU: cantidades proporcionales a la
 * existencia total con un sesgo por el índice del producto, para que cada
 * kárdex sea distinto pero estable entre renders.
 */
function movimientosBase(p: ErpProducto): MovBase[] {
  const st = stockTotal(p);
  const j = p.id % 3;
  const q = (pct: number): number => Math.max(1, Math.round((st * pct) / 100) + j);
  const semilla: [string, TipoMov, string, number][] = [
    ['2026-09-02', 'Entrada', 'OC', 25],
    ['2026-09-07', 'Salida', 'FV', 8],
    ['2026-09-11', 'Salida', 'FV', 6],
    ['2026-09-16', 'Transferencia', 'TR', 4],
    ['2026-09-22', 'Entrada', 'OC', 18],
    ['2026-09-28', 'Salida', 'FV', 7],
  ];
  return semilla.map(([fecha, tipo, prefijo, pct], idx) => ({
    id: p.id * 100 + idx, fecha, tipo,
    documento: prefijo + '-' + String(1200 + p.id * 10 + idx),
    cantidad: q(pct), costo: p.costo,
  }));
}

/**
 * Kárdex y movimientos: trazabilidad de entradas, salidas y transferencias
 * de cada SKU con saldo acumulado y costo promedio ponderado, más el
 * registro de entradas manuales.
 */
@Component({
  selector: 'app-kardex-demo-page',
  standalone: true,
  imports: [PageDemoShell, SiremButton, SiremDataTable, SiremEmptyState, SiremInput,
    SiremModal, SiremMoneyPipe, SiremPageHeader, SiremSelect, SiremStatCard],
  template: `
    <app-page-demo-shell label="Kárdex y movimientos" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header title="Kárdex y movimientos" subtitle="Trazabilidad de entradas, salidas y transferencias de cada SKU con costo promedio ponderado">
            <div slot="actions">
              <sirem-button size="sm" (pressed)="abrirEntrada()">
                <i slot="icon" class="fi fi-rr-plus" aria-hidden="true"></i>
                Registrar entrada
              </sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-[22rem_16rem]">
            <sirem-select-field label="Producto" [options]="productoOptions" [(value)]="skuSel" />
            <sirem-select-field label="Tipo de movimiento" placeholder="Todos" [options]="tipoOptions" [(value)]="tipoSel" />
          </div>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Saldo en unidades" [value]="saldoFinal()" />
            <sirem-stat-card label="Costo promedio ponderado" [value]="costoActual() | siremMoney" color="info" />
            <sirem-stat-card label="Valor del saldo" [value]="valorSaldo() | siremMoney" color="success" />
            <sirem-stat-card label="Movimientos del periodo" [value]="filtrados().length" color="warning" />
          </div>

          @if (filtrados().length) {
            <sirem-data-table [columns]="cols" [rows]="filtrados()" (rowClicked)="abrirMovimiento($event)" />
          } @else {
            <sirem-empty-state title="Sin movimientos" description="El filtro actual no tiene movimientos para este producto." />
          }
        </div>

        <sirem-modal [(open)]="entradaAbierto" title="Registrar entrada" size="sm" [actions]="accionesEntrada()" (actionPressed)="accion($event.label)">
          <div class="grid gap-3">
            <sirem-input-field label="Cantidad" type="number" placeholder="Ej. 20" hint="Unidades que ingresan a la bodega principal." [error]="errorCantidad()" [(value)]="cantidadEntrada" />
            <sirem-input-field label="Costo unitario" type="number" placeholder="Ej. 78000" prefixIcon="fi fi-rr-tag" [error]="errorCosto()" [(value)]="costoEntrada" />
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Destino: {{ bodegaEntrada }} · Total entrada
              <span class="font-semibold text-slate-900 dark:text-slate-100">{{ totalEntrada() | siremMoney }}</span>
            </p>
          </div>
        </sirem-modal>

        <sirem-modal [(open)]="movAbierto" [title]="movTitulo()" size="sm">
          @if (movSel(); as m) {
            <dl class="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
              <div><dt class="text-slate-500 dark:text-slate-400">Documento</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ m.documento }}</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Fecha</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ m.fecha }}</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Tipo</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ m.tipo }}</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Cantidad</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ m.cantidad }} und.</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Costo unitario</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ m.costo | siremMoney }}</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Saldo resultante</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ m.saldo }} und.</dd></div>
            </dl>
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class KardexDemoPage {
  private readonly toast = inject(DynamicToastService);

  readonly bodegaEntrada = BODEGAS[0].nombre;

  /** Copia local: las entradas manuales actualizan la existencia del SKU. */
  readonly productos = signal<ErpProducto[]>(PRODUCTOS.map((p) => ({ ...p })));
  readonly skuSel = signal<string | number | null>(PRODUCTOS[0].sku);
  readonly tipoSel = signal<string | number | null>(null);
  readonly entradaAbierto = signal(false);
  readonly cantidadEntrada = signal<ValorCampo>(null);
  readonly costoEntrada = signal<ValorCampo>(null);
  /** Movimientos añadidos por el usuario (se anidan al producto elegido). */
  readonly extras = signal<MovExtra[]>([]);

  readonly productoOptions: SiremSelectOption[] = PRODUCTOS.map((p) => ({
    value: p.sku, label: p.sku + ' · ' + p.nombre,
  }));
  readonly tipoOptions: SiremSelectOption[] = [
    { value: 'Entrada', label: 'Entrada' },
    { value: 'Salida', label: 'Salida' },
    { value: 'Transferencia', label: 'Transferencia' },
  ];

  readonly cols: SiremTableColumn[] = [
    { key: 'fecha', label: 'Fecha', kind: 'date', subKey: 'documento' },
    { key: 'tipo', label: 'Tipo', kind: 'badge', badgeTones: { Entrada: 'success', Salida: 'warning', Transferencia: 'info' } },
    { key: 'cantidad', label: 'Cantidad', kind: 'number', align: 'right' },
    { key: 'costo', label: 'Costo unitario', kind: 'currency', align: 'right' },
    { key: 'saldo', label: 'Saldo', kind: 'number', align: 'right' },
  ];

  readonly producto = computed(() => this.productos().find((p) => p.sku === String(this.skuSel() ?? '')) ?? null);

  /**
   * Movimientos del SKU elegido: base determinista + entradas manuales,
   * ordenados por fecha y con el saldo acumulado recalculado.
   */
  readonly movimientos = computed<Movimiento[]>(() => {
    const p = this.producto();
    if (!p) return [];
    const lista: MovBase[] = [...movimientosBase(p), ...this.extras().filter((m) => m.productoId === p.id)];
    lista.sort((a, b) => (a.fecha === b.fecha ? a.id - b.id : a.fecha.localeCompare(b.fecha)));

    const neto = lista.reduce((acc, m) => acc + deltaDe(m), 0);
    let saldo = Math.max(0, stockTotal(p) - neto);
    return lista.map((m) => {
      saldo += deltaDe(m);
      return { ...m, saldo };
    });
  });

  readonly filtrados = computed<Movimiento[]>(() => {
    const tipo = this.tipoSel();
    return this.movimientos().filter((m) => !tipo || m.tipo === tipo);
  });

  readonly saldoFinal = computed(() => {
    const lista = this.movimientos();
    return lista.length ? lista[lista.length - 1].saldo : 0;
  });
  readonly costoActual = computed(() => this.producto()?.costo ?? 0);
  readonly valorSaldo = computed(() => this.saldoFinal() * this.costoActual());

  readonly errorCantidad = computed(() => {
    const raw = this.cantidadEntrada();
    if (raw === null || raw === '') return '';
    return numero(raw) > 0 ? '' : 'Debe ser mayor que 0.';
  });
  readonly errorCosto = computed(() => {
    const raw = this.costoEntrada();
    if (raw === null || raw === '') return '';
    return numero(raw) > 0 ? '' : 'Debe ser mayor que 0.';
  });

  /** Detalle del movimiento seleccionado en la tabla. */
  readonly movAbierto = signal(false);
  readonly movSel = signal<Movimiento | null>(null);
  readonly movTitulo = computed(() => {
    const m = this.movSel();
    return m ? 'Movimiento ' + m.documento : 'Detalle del movimiento';
  });
  readonly entradaValida = computed(() => numero(this.cantidadEntrada()) > 0 && numero(this.costoEntrada()) > 0);
  readonly totalEntrada = computed(() => numero(this.cantidadEntrada()) * numero(this.costoEntrada()));

  readonly accionesEntrada = computed<SiremModalAction[]>(() => [
    { label: 'Cancelar', variant: 'secondary' },
    { label: 'Registrar entrada', disabled: !this.entradaValida() },
  ]);

  /** Abre el modal con el costo promedio vigente precargado. */
  abrirEntrada(): void {
    const p = this.producto();
    if (!p) return;
    this.cantidadEntrada.set(null);
    this.costoEntrada.set(p.costo);
    this.entradaAbierto.set(true);
  }

  accion(label: string): void {
    if (label === 'Registrar entrada') this.registrarEntrada();
  }

  /** Registra la entrada, suma existencias en la bodega principal y avisa. */
  registrarEntrada(): void {
    const p = this.producto();
    if (!p || !this.entradaValida()) return;

    const cantidad = numero(this.cantidadEntrada());
    const costo = numero(this.costoEntrada());
    const id = 9000 + this.extras().length;

    this.extras.update((lista) => [
      ...lista,
      { id, productoId: p.id, fecha: '2026-09-30', tipo: 'Entrada', documento: 'OC-' + String(7300 + id - 9000), cantidad, costo },
    ]);
    this.productos.update((lista) => lista.map((x) => x.id === p.id
      ? { ...x, stock: { ...x.stock, [BODEGA_ENTRADA]: (x.stock[BODEGA_ENTRADA] ?? 0) + cantidad } }
      : x));

    this.entradaAbierto.set(false);
    this.toast.success({
      title: 'Entrada registrada',
      description: p.sku + ' · ' + cantidad + ' unidades a ' + cop(costo) + '.',
      duration: 4_000,
    });
  }

  /** Abre la ficha del movimiento pulsado en la tabla del kárdex. */
  abrirMovimiento(fila: Record<string, unknown>): void {
    const mov = this.movimientos().find((m) => m.id === fila['id']);
    if (!mov) return;
    this.movSel.set(mov);
    this.movAbierto.set(true);
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'kardex.html',
      language: 'html',
      code: `<sirem-page-header title="Kárdex y movimientos"
  subtitle="Trazabilidad de entradas, salidas y transferencias de cada SKU con costo promedio ponderado">
  <div slot="actions">
    <sirem-button size="sm" (pressed)="abrirEntrada()">
      <i slot="icon" class="fi fi-rr-plus" aria-hidden="true"></i>
      Registrar entrada
    </sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-[22rem_16rem]">
  <sirem-select-field label="Producto" [options]="productoOptions" [(value)]="skuSel" />
  <sirem-select-field label="Tipo de movimiento" placeholder="Todos"
    [options]="tipoOptions" [(value)]="tipoSel" />
</div>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Saldo en unidades" [value]="saldoFinal()" />
  <sirem-stat-card label="Costo promedio ponderado" [value]="costoActual() | siremMoney" color="info" />
  <sirem-stat-card label="Valor del saldo" [value]="valorSaldo() | siremMoney" color="success" />
  <sirem-stat-card label="Movimientos del periodo" [value]="filtrados().length" color="warning" />
</div>

@if (filtrados().length) {
  <sirem-data-table [columns]="cols" [rows]="filtrados()" (rowClicked)="abrirMovimiento($event)" />
} @else {
  <sirem-empty-state title="Sin movimientos"
    description="El filtro actual no tiene movimientos para este producto." />
}

<sirem-modal [(open)]="entradaAbierto" title="Registrar entrada" size="sm"
  [actions]="accionesEntrada" (actionPressed)="accion($event.label)">
  <sirem-input-field label="Cantidad" type="number" placeholder="Ej. 20"
    hint="Unidades que ingresan a la bodega principal."
    [error]="errorCantidad" [(value)]="cantidadEntrada" />
  <sirem-input-field label="Costo unitario" type="number" placeholder="Ej. 78000"
    prefixIcon="fi fi-rr-tag" [error]="errorCosto" [(value)]="costoEntrada" />
</sirem-modal>

<sirem-modal [(open)]="movAbierto" [title]="movTitulo()" size="sm">
  @if (movSel(); as m) {
    <dl class="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
      <div><dt class="text-slate-500 dark:text-slate-400">Documento</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ m.documento }}</dd></div>
      <div><dt class="text-slate-500 dark:text-slate-400">Fecha</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ m.fecha }}</dd></div>
      <div><dt class="text-slate-500 dark:text-slate-400">Tipo</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ m.tipo }}</dd></div>
      <div><dt class="text-slate-500 dark:text-slate-400">Cantidad</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ m.cantidad }} und.</dd></div>
      <div><dt class="text-slate-500 dark:text-slate-400">Costo unitario</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ m.costo | siremMoney }}</dd></div>
      <div><dt class="text-slate-500 dark:text-slate-400">Saldo resultante</dt><dd class="font-semibold text-slate-900 dark:text-slate-100">{{ m.saldo }} und.</dd></div>
    </dl>
  }
</sirem-modal>`,
    },
    {
      name: 'kardex.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton, SiremDataTable, SiremEmptyState, SiremInput, SiremModal, SiremMoneyPipe,
  SiremPageHeader, SiremSelect, SiremStatCard,
  type SiremModalAction, type SiremSelectOption, type SiremTableColumn,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { BODEGAS, PRODUCTOS, type ErpProducto, stockTotal } from '../../data/erp-mock';

type TipoMov = 'Entrada' | 'Salida' | 'Transferencia';
type MovBase = { id: number; fecha: string; tipo: TipoMov; documento: string; cantidad: number; costo: number };
type Movimiento = MovBase & { saldo: number };
type MovExtra = MovBase & { productoId: number };
type ValorCampo = string | number | (string | number)[] | null;

const BODEGA_ENTRADA = BODEGAS[0].id;

function numero(v: ValorCampo): number {
  if (Array.isArray(v)) return Number(v[0] ?? 0);
  return Number(v ?? 0);
}

function cop(valor: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
}

function deltaDe(m: MovBase): number {
  if (m.tipo === 'Entrada') return m.cantidad;
  if (m.tipo === 'Salida') return -m.cantidad;
  return 0;
}

/** Movimientos base deterministas: cantidades proporcionales al stock. */
function movimientosBase(p: ErpProducto): MovBase[] {
  const st = stockTotal(p);
  const j = p.id % 3;
  const q = (pct: number): number => Math.max(1, Math.round((st * pct) / 100) + j);
  const semilla: [string, TipoMov, string, number][] = [
    ['2026-09-02', 'Entrada', 'OC', 25],
    ['2026-09-07', 'Salida', 'FV', 8],
    ['2026-09-11', 'Salida', 'FV', 6],
    ['2026-09-16', 'Transferencia', 'TR', 4],
    ['2026-09-22', 'Entrada', 'OC', 18],
    ['2026-09-28', 'Salida', 'FV', 7],
  ];
  return semilla.map(([fecha, tipo, prefijo, pct], idx) => ({
    id: p.id * 100 + idx, fecha, tipo,
    documento: prefijo + '-' + String(1200 + p.id * 10 + idx),
    cantidad: q(pct), costo: p.costo,
  }));
}

@Component({
  selector: 'app-kardex-page',
  standalone: true,
  imports: [SiremPageHeader, SiremButton, SiremSelect, SiremStatCard, SiremDataTable,
    SiremEmptyState, SiremModal, SiremInput, SiremMoneyPipe],
  templateUrl: './kardex.html',
})
export class KardexPage {
  private readonly toast = inject(DynamicToastService);

  readonly productos = signal<ErpProducto[]>(PRODUCTOS.map(p => ({ ...p })));
  readonly skuSel = signal<string | number | null>(PRODUCTOS[0].sku);
  readonly tipoSel = signal<string | number | null>(null);
  readonly entradaAbierto = signal(false);
  readonly cantidadEntrada = signal<ValorCampo>(null);
  readonly costoEntrada = signal<ValorCampo>(null);
  readonly extras = signal<MovExtra[]>([]);

  readonly productoOptions: SiremSelectOption[] = PRODUCTOS.map(p => ({
    value: p.sku, label: p.sku + ' · ' + p.nombre,
  }));
  readonly tipoOptions: SiremSelectOption[] = [
    { value: 'Entrada', label: 'Entrada' },
    { value: 'Salida', label: 'Salida' },
    { value: 'Transferencia', label: 'Transferencia' },
  ];

  readonly cols: SiremTableColumn[] = [
    { key: 'fecha', label: 'Fecha', kind: 'date', subKey: 'documento' },
    { key: 'tipo', label: 'Tipo', kind: 'badge',
      badgeTones: { Entrada: 'success', Salida: 'warning', Transferencia: 'info' } },
    { key: 'cantidad', label: 'Cantidad', kind: 'number', align: 'right' },
    { key: 'costo', label: 'Costo unitario', kind: 'currency', align: 'right' },
    { key: 'saldo', label: 'Saldo', kind: 'number', align: 'right' },
  ];

  readonly producto = computed(
    () => this.productos().find(p => p.sku === String(this.skuSel() ?? '')) ?? null);

  readonly movimientos = computed<Movimiento[]>(() => {
    const p = this.producto();
    if (!p) return [];
    const lista: MovBase[] = [...movimientosBase(p),
      ...this.extras().filter(m => m.productoId === p.id)];
    lista.sort((a, b) => (a.fecha === b.fecha ? a.id - b.id : a.fecha.localeCompare(b.fecha)));
    const neto = lista.reduce((acc, m) => acc + deltaDe(m), 0);
    let saldo = Math.max(0, stockTotal(p) - neto);
    return lista.map(m => {
      saldo += deltaDe(m);
      return { ...m, saldo };
    });
  });

  readonly filtrados = computed<Movimiento[]>(() => {
    const tipo = this.tipoSel();
    return this.movimientos().filter(m => !tipo || m.tipo === tipo);
  });

  readonly saldoFinal = computed(() => {
    const lista = this.movimientos();
    return lista.length ? lista[lista.length - 1].saldo : 0;
  });
  readonly costoActual = computed(() => this.producto()?.costo ?? 0);
  readonly valorSaldo = computed(() => this.saldoFinal() * this.costoActual());
  readonly entradaValida = computed(
    () => numero(this.cantidadEntrada()) > 0 && numero(this.costoEntrada()) > 0);

  readonly errorCantidad = computed(() => {
    const raw = this.cantidadEntrada();
    if (raw === null || raw === '') return '';
    return numero(raw) > 0 ? '' : 'Debe ser mayor que 0.';
  });
  readonly errorCosto = computed(() => {
    const raw = this.costoEntrada();
    if (raw === null || raw === '') return '';
    return numero(raw) > 0 ? '' : 'Debe ser mayor que 0.';
  });

  readonly movAbierto = signal(false);
  readonly movSel = signal<Movimiento | null>(null);
  readonly movTitulo = computed(() => {
    const m = this.movSel();
    return m ? 'Movimiento ' + m.documento : 'Detalle del movimiento';
  });

  readonly accionesEntrada = computed<SiremModalAction[]>(() => [
    { label: 'Cancelar', variant: 'secondary' },
    { label: 'Registrar entrada', disabled: !this.entradaValida() },
  ]);

  abrirEntrada(): void {
    const p = this.producto();
    if (!p) return;
    this.cantidadEntrada.set(null);
    this.costoEntrada.set(p.costo);
    this.entradaAbierto.set(true);
  }

  accion(label: string): void {
    if (label === 'Registrar entrada') this.registrarEntrada();
  }

  registrarEntrada(): void {
    const p = this.producto();
    if (!p || !this.entradaValida()) return;
    const cantidad = numero(this.cantidadEntrada());
    const costo = numero(this.costoEntrada());
    const id = 9000 + this.extras().length;

    this.extras.update(lista => [...lista, {
      id, productoId: p.id, fecha: '2026-09-30', tipo: 'Entrada',
      documento: 'OC-' + String(7300 + id - 9000), cantidad, costo,
    }]);
    this.productos.update(lista => lista.map(x => x.id === p.id
      ? { ...x, stock: { ...x.stock, [BODEGA_ENTRADA]: (x.stock[BODEGA_ENTRADA] ?? 0) + cantidad } }
      : x));

    this.entradaAbierto.set(false);
    this.toast.success({
      title: 'Entrada registrada',
      description: p.sku + ' · ' + cantidad + ' unidades a ' + cop(costo) + '.',
      duration: 4_000,
    });
  }

  abrirMovimiento(fila: Record<string, unknown>): void {
    const mov = this.movimientos().find(m => m.id === fila['id']);
    if (!mov) return;
    this.movSel.set(mov);
    this.movAbierto.set(true);
  }
}`,
    },
  ];
}
