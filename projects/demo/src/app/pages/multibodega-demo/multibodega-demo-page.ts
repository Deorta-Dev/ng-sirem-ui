import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremBadgeTone,
  SiremCardList,
  SiremCardListField,
  SiremDataTable,
  SiremEmptyState,
  SiremInput, SiremModal,
  SiremModalAction,
  SiremMoneyPipe,
  SiremPageHeader,
  SiremSearchField,
  SiremSelectOption,
  SiremStatCard,
  SiremTableColumn,
  SiremSegmented,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { BODEGAS, PRODUCTOS, type ErpProducto, stockTotal } from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/**
 * Multibodega: control de existencias por ubicación física o virtual
 * (principal, punto de venta y tránsito), con valor a costo, alerta de
 * stock bajo, ficha por producto y traslado entre bodegas.
 */
@Component({
  selector: 'app-multibodega-demo-page',
  standalone: true,
  imports: [PageDemoShell, SiremCardList, SiremDataTable, SiremEmptyState, SiremInput, SiremModal,
    SiremMoneyPipe, SiremPageHeader, SiremSearchField, SiremStatCard,
    SiremSegmented],
  template: `
    <app-page-demo-shell label="Multibodega" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header title="Multibodega" subtitle="Control de existencias en ubicaciones físicas o virtuales">
            <div slot="actions" class="w-full max-w-xs">
              <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Bodega" [options]="bodegaOptions" [(value)]="bodegaSel" />
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="SKUs en la bodega" [value]="resumen().skus" />
            <sirem-stat-card label="Unidades disponibles" [value]="resumen().unidades" color="info" />
            <sirem-stat-card label="Valor a costo" [value]="resumen().valor | siremMoney" color="success" />
            <sirem-stat-card label="Stock bajo" [value]="resumen().bajos" color="warning" />
          </div>

          <div class="flex flex-wrap items-end justify-between gap-3">
            <sirem-search-field class="w-full md:w-80" placeholder="Buscar por SKU o nombre…" [(value)]="q" />
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400" role="status">
              {{ filas().length }} de {{ productos.length }} referencias · {{ bodegaNombre() }}
            </span>
            <sirem-segmented [(value)]="vista" />
          </div>

          @if (filas().length) {
            @if (vista() === 'table') {
              <sirem-data-table [columns]="cols" [rows]="filas()" (rowClicked)="abrir($event)" />
            } @else {
              <sirem-card-list [items]="filas()" titleKey="nombre" badgeKey="estado"
                [badgeTones]="estadoTones" [fields]="campos" (itemPressed)="abrir($event)" />
            }
          } @else {
            <sirem-empty-state title="Sin productos" description="Ningún SKU coincide con la búsqueda en esta bodega." />
          }
        </div>

        <sirem-modal [(open)]="detalleAbierto" [title]="detalleTitulo()" size="lg"
          [actions]="acciones" (actionPressed)="accion($event.label)">
          @if (detalle(); as p) {
            <dl class="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div><dt class="text-slate-500 dark:text-slate-400">Categoría y unidad</dt>
                <dd class="font-semibold text-slate-900 dark:text-slate-100">{{ p.categoria }} · {{ p.unidad }} · mín. {{ p.minimo }}</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Costo promedio</dt>
                <dd class="font-semibold text-slate-900 dark:text-slate-100">{{ p.costo | siremMoney }}</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Precio mayorista</dt>
                <dd class="font-semibold text-slate-900 dark:text-slate-100">{{ p.precioMayor | siremMoney }}</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Precio detal</dt>
                <dd class="font-semibold text-slate-900 dark:text-slate-100">{{ p.precioDetal | siremMoney }}</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Existencia total</dt>
                <dd class="font-semibold text-slate-900 dark:text-slate-100">{{ totalDe(p) }} und.</dd></div>
              <div><dt class="text-slate-500 dark:text-slate-400">Stock mínimo</dt>
                <dd class="font-semibold text-slate-900 dark:text-slate-100">{{ p.minimo }} und. en todo el país</dd></div>
            </dl>

            <p class="mb-2 mt-5 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Existencias por bodega</p>
            <sirem-data-table [columns]="colsBodega" [rows]="existenciasPorBodega()" [sortable]="false" />
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class MultibodegaDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Bodegas y productos son solo lectura: esta pantalla no muta el catálogo. */
  readonly bodegas = BODEGAS;
  readonly productos: ErpProducto[] = PRODUCTOS;

  readonly q = signal('');
  readonly bodegaSel = signal<string | number | null>(BODEGAS[0].id);
  readonly vista = signal<string | null>('table');
  readonly detalleAbierto = signal(false);
  readonly seleccion = signal<ErpProducto | null>(null);

  readonly bodegaOptions: SiremSelectOption[] = BODEGAS.map((b) => ({
    value: b.id,
    label: b.nombre + ' · ' + b.ciudad,
  }));

  readonly cols: SiremTableColumn[] = [
    { key: 'sku', label: 'SKU' },
    { key: 'nombre', label: 'Producto', subKey: 'categoria' },
    { key: 'existencia', label: 'Existencia', kind: 'number', align: 'right' },
    { key: 'total', label: 'Total', kind: 'number', align: 'right' },
    { key: 'valor', label: 'Valor a costo', kind: 'currency', align: 'right' },
    { key: 'estado', label: 'Estado', kind: 'badge', badgeTones: { Bajo: 'danger', OK: 'success' } },
  ];

  readonly colsBodega: SiremTableColumn[] = [
    { key: 'bodega', label: 'Bodega' },
    { key: 'ciudad', label: 'Ciudad', subKey: 'tipo' },
    { key: 'existencia', label: 'Existencia', kind: 'number', align: 'right' },
  ];

  readonly estadoTones: Record<string, SiremBadgeTone> = { Bajo: 'danger', OK: 'success' };
  readonly campos: SiremCardListField[] = [
    { key: 'sku', label: 'SKU', icon: 'fi fi-rr-barcode' },
    { key: 'existencia', label: 'Existencia', icon: 'fi fi-rr-box' },
    { key: 'categoria', label: 'Categoría', icon: 'fi fi-rr-apps' },
  ];

  readonly bodegaId = computed(() => String(this.bodegaSel() ?? BODEGAS[0].id));
  readonly bodegaNombre = computed(() => BODEGAS.find((b) => b.id === this.bodegaId())?.nombre ?? 'Bodega');

  /** Filas de la bodega activa filtradas por SKU o nombre. */
  readonly filas = computed<Record<string, unknown>[]>(() => {
    const texto = this.q().trim().toLowerCase();
    const id = this.bodegaId();
    return this.productos
      .filter((p) => !texto || (p.sku + ' ' + p.nombre).toLowerCase().includes(texto))
      .map((p) => {
        const existencia = p.stock[id] ?? 0;
        return {
          id: p.id, sku: p.sku, nombre: p.nombre, categoria: p.categoria,
          existencia, total: stockTotal(p), valor: existencia * p.costo,
          estado: existencia < p.minimo ? 'Bajo' : 'OK',
        };
      });
  });

  /** Indicadores de la bodega activa (sin aplicar la búsqueda). */
  readonly resumen = computed(() => {
    const id = this.bodegaId();
    let skus = 0, unidades = 0, valor = 0, bajos = 0;
    for (const p of this.productos) {
      const existencia = p.stock[id] ?? 0;
      if (existencia > 0) skus += 1;
      unidades += existencia;
      valor += existencia * p.costo;
      if (existencia < p.minimo) bajos += 1;
    }
    return { skus, unidades, valor, bajos };
  });

  readonly detalle = computed(() => this.seleccion());
  readonly detalleTitulo = computed(() => {
    const p = this.seleccion();
    return p ? p.sku + ' · ' + p.nombre : 'Ficha de producto';
  });

  /** Existencias del producto de la ficha, una fila por bodega. */
  readonly existenciasPorBodega = computed<Record<string, unknown>[]>(() => {
    const p = this.detalle();
    if (!p) return [];
    return BODEGAS.map((b) => ({
      id: b.id, bodega: b.nombre, ciudad: b.ciudad, tipo: b.tipo, existencia: p.stock[b.id] ?? 0,
    }));
  });

  readonly acciones: SiremModalAction[] = [
    { label: 'Transferir a otra bodega', variant: 'secondary', icon: 'fi fi-rr-arrow-right-arrow-left' },
  ];

  /** Abre la ficha del producto seleccionado en tabla o en tarjeta. */
  abrir(fila: Record<string, unknown>): void {
    const producto = this.productos.find((p) => p.id === fila['id']);
    if (!producto) return;
    this.seleccion.set(producto);
    this.detalleAbierto.set(true);
  }

  /** Deja el traslado en borrador con un toast informativo. */
  accion(label: string): void {
    const producto = this.detalle();
    if (!producto || label !== 'Transferir a otra bodega') return;
    this.toast.info({
      title: 'Traslado en borrador',
      description: producto.sku + ' · desde ' + this.bodegaNombre() +
        '. Registra la transferencia para descontar la bodega de origen.',
      duration: 3_000,
    });
    this.detalleAbierto.set(false);
  }

  /** Existencia total del producto sumando todas las bodegas. */
  totalDe(producto: ErpProducto): number {
    return stockTotal(producto);
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'multibodega.html',
      language: 'html',
      code: `<sirem-page-header title="Multibodega"
  subtitle="Control de existencias en ubicaciones físicas o virtuales">
  <div slot="actions" class="w-full max-w-xs">
    <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Bodega" [options]="bodegaOptions" [(value)]="bodegaSel" />
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="SKUs en la bodega" [value]="resumen().skus" />
  <sirem-stat-card label="Unidades disponibles" [value]="resumen().unidades" color="info" />
  <sirem-stat-card label="Valor a costo" [value]="resumen().valor | siremMoney" color="success" />
  <sirem-stat-card label="Stock bajo" [value]="resumen().bajos" color="warning" />
</div>

<div class="flex flex-wrap items-end justify-between gap-3">
  <sirem-search-field class="w-full md:w-80" placeholder="Buscar por SKU o nombre…" [(value)]="q" />
  <sirem-segmented [(value)]="vista" />
</div>

@if (filas().length) {
  @if (vista() === 'table') {
    <sirem-data-table [columns]="cols" [rows]="filas()" (rowClicked)="abrir($event)" />
  } @else {
    <sirem-card-list [items]="filas()" titleKey="nombre" badgeKey="estado"
      [badgeTones]="estadoTones" [fields]="campos" (itemPressed)="abrir($event)" />
  }
} @else {
  <sirem-empty-state title="Sin productos"
    description="Ningún SKU coincide con la búsqueda en esta bodega." />
}

<sirem-modal [(open)]="detalleAbierto" [title]="detalleTitulo()" size="lg"
  [actions]="acciones" (actionPressed)="accion($event.label)">
  @if (detalle(); as p) {
    <p class="text-sm text-slate-500 dark:text-slate-400">
      {{ p.categoria }} · Costo {{ p.costo | siremMoney }} · {{ totalDe(p) }} und. en total
    </p>
    <sirem-data-table [columns]="colsBodega" [rows]="existenciasPorBodega()" />
  }
</sirem-modal>`,
    },
    {
      name: 'multibodega.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremCardList, SiremDataTable, SiremEmptyState, SiremModal, SiremMoneyPipe,
  SiremPageHeader, SiremSearchField, SiremInput, SiremStatCard, SiremSegmented,
  type SiremBadgeTone, type SiremCardListField, type SiremModalAction,
  type SiremSelectOption, type SiremTableColumn,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { BODEGAS, PRODUCTOS, type ErpProducto, stockTotal } from '../../data/erp-mock';

@Component({
  selector: 'app-multibodega-page',
  standalone: true,
  imports: [SiremPageHeader, SiremInput, SiremStatCard, SiremSearchField,
    SiremSegmented, SiremDataTable, SiremCardList, SiremEmptyState, SiremModal,
    SiremMoneyPipe],
  templateUrl: './multibodega.html',
})
export class MultibodegaPage {
  private readonly toast = inject(DynamicToastService);

  readonly bodegas = BODEGAS;
  readonly productos: ErpProducto[] = PRODUCTOS;

  readonly q = signal('');
  readonly bodegaSel = signal<string | number | null>(BODEGAS[0].id);
  readonly vista = signal<string | null>('table');
  readonly seleccion = signal<ErpProducto | null>(null);
  readonly detalleAbierto = signal(false);

  readonly bodegaOptions: SiremSelectOption[] = BODEGAS.map(b => ({
    value: b.id,
    label: b.nombre + ' · ' + b.ciudad,
  }));

  readonly cols: SiremTableColumn[] = [
    { key: 'sku', label: 'SKU' },
    { key: 'nombre', label: 'Producto', subKey: 'categoria' },
    { key: 'existencia', label: 'Existencia', kind: 'number', align: 'right' },
    { key: 'total', label: 'Total', kind: 'number', align: 'right' },
    { key: 'valor', label: 'Valor a costo', kind: 'currency', align: 'right' },
    { key: 'estado', label: 'Estado', kind: 'badge',
      badgeTones: { Bajo: 'danger', OK: 'success' } },
  ];

  readonly estadoTones: Record<string, SiremBadgeTone> = { Bajo: 'danger', OK: 'success' };
  readonly campos: SiremCardListField[] = [
    { key: 'sku', label: 'SKU', icon: 'fi fi-rr-barcode' },
    { key: 'existencia', label: 'Existencia', icon: 'fi fi-rr-box' },
    { key: 'categoria', label: 'Categoría', icon: 'fi fi-rr-apps' },
  ];

  readonly bodegaId = computed(() => String(this.bodegaSel() ?? BODEGAS[0].id));
  readonly bodegaNombre = computed(
    () => BODEGAS.find(b => b.id === this.bodegaId())?.nombre ?? 'Bodega');

  readonly filas = computed<Record<string, unknown>[]>(() => {
    const texto = this.q().trim().toLowerCase();
    const id = this.bodegaId();
    return this.productos
      .filter(p => !texto || (p.sku + ' ' + p.nombre).toLowerCase().includes(texto))
      .map(p => {
        const existencia = p.stock[id] ?? 0;
        return {
          id: p.id, sku: p.sku, nombre: p.nombre, categoria: p.categoria,
          existencia, total: stockTotal(p), valor: existencia * p.costo,
          estado: existencia < p.minimo ? 'Bajo' : 'OK',
        };
      });
  });

  readonly resumen = computed(() => {
    const id = this.bodegaId();
    let skus = 0, unidades = 0, valor = 0, bajos = 0;
    for (const p of this.productos) {
      const existencia = p.stock[id] ?? 0;
      if (existencia > 0) skus += 1;
      unidades += existencia;
      valor += existencia * p.costo;
      if (existencia < p.minimo) bajos += 1;
    }
    return { skus, unidades, valor, bajos };
  });

  readonly detalle = computed(() => this.seleccion());
  readonly detalleTitulo = computed(() => {
    const p = this.seleccion();
    return p ? p.sku + ' · ' + p.nombre : 'Ficha de producto';
  });

  readonly existenciasPorBodega = computed<Record<string, unknown>[]>(() => {
    const p = this.detalle();
    if (!p) return [];
    return BODEGAS.map(b => ({
      id: b.id, bodega: b.nombre, ciudad: b.ciudad, tipo: b.tipo,
      existencia: p.stock[b.id] ?? 0,
    }));
  });

  readonly acciones: SiremModalAction[] = [
    { label: 'Transferir a otra bodega', variant: 'secondary',
      icon: 'fi fi-rr-arrow-right-arrow-left' },
  ];

  abrir(fila: Record<string, unknown>): void {
    const producto = this.productos.find(p => p.id === fila['id']);
    if (!producto) return;
    this.seleccion.set(producto);
    this.detalleAbierto.set(true);
  }

  accion(label: string): void {
    const producto = this.detalle();
    if (!producto || label !== 'Transferir a otra bodega') return;
    this.toast.info({
      title: 'Traslado en borrador',
      description: producto.sku + ' · desde ' + this.bodegaNombre() +
        '. Registra la transferencia para descontar la bodega de origen.',
      duration: 3_000,
    });
    this.detalleAbierto.set(false);
  }

  totalDe(producto: ErpProducto): number {
    return stockTotal(producto);
  }
}`,
    },
  ];
}
