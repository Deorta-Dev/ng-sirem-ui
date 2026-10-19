import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton,
  SiremDataTable,
  SiremEmptyState,
  SiremInput, SiremModal,
  SiremMoneyPipe,
  SiremPageHeader,
  SiremSearchField,
  SiremStatCard,
  type SiremModalAction,
  type SiremSelectOption,
  type SiremTableColumn,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import {
  ORDENES_COMPRA,
  PRODUCTOS,
  type ErpEstadoOrden,
  type ErpOrdenCompra,
} from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Estados del ciclo de vida de una orden de compra. */
const ESTADOS_ORDEN: ErpEstadoOrden[] = ['Borrador', 'Enviada', 'Recibida', 'Facturada'];

/** Línea de producto mostrada en el detalle de la orden. */
type LineaOrden = {
  sku: string;
  nombre: string;
  cantidad: number;
  costo: number;
  subtotal: number;
};

/**
 * Órdenes de compra: solicitudes formales al proveedor, recepción de la
 * mercancía y conversión en factura de compra al llegar a bodega.
 */
@Component({
  selector: 'app-ordenes-compra-demo-page',
  standalone: true,
  imports: [
    PageDemoShell,
    SiremButton,
    SiremDataTable,
    SiremEmptyState,
    SiremInput, SiremModal,
    SiremMoneyPipe,
    SiremPageHeader,
    SiremSearchField,
    SiremStatCard,
  ],
  template: `
    <app-page-demo-shell label="Órdenes de compra" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header
            title="Órdenes de compra"
            subtitle="Solicitudes formales al proveedor, recepción y facturación"
          >
            <div slot="actions" class="flex gap-2">
              <sirem-button size="sm" (pressed)="nuevaOrden()">Nueva orden de compra</sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Órdenes abiertas" [value]="abiertas()" color="info" />
            <sirem-stat-card
              label="Valor comprometido"
              [value]="valorComprometido() | siremMoney"
              variant="tint"
            />
            <sirem-stat-card
              label="Recibidas este mes"
              [value]="recibidasMes()"
              color="warning"
            />
            <sirem-stat-card label="Facturadas" [value]="facturadas()" color="success" />
          </div>

          <div class="grid gap-3 md:grid-cols-[1fr_13rem]">
            <sirem-search-field
              label="Buscar"
              placeholder="Número de orden o proveedor…"
              [(value)]="q"
            />
            <sirem-input-field [strictOptions]="true"
              label="Estado"
              placeholder="Todos"
              [options]="estadoOptions"
              [(value)]="estado"
            />
          </div>

          @if (filtradas().length) {
            <sirem-data-table [columns]="cols" [rows]="filtradas()" (rowClicked)="abrir($event)" />
          } @else {
            <sirem-empty-state
              title="Sin órdenes"
              description="Ninguna orden de compra coincide con los filtros actuales."
            />
          }
        </div>

        <sirem-modal
          [(open)]="detalleAbierto"
          [title]="detalle()?.numero ?? 'Orden de compra'"
          size="lg"
          [actions]="acciones()"
          (actionPressed)="accion($event.label)"
        >
          @if (detalle(); as oc) {
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Proveedor
                </p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {{ oc.proveedor }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Solicitada el {{ oc.fecha }}
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Entrega pactada
                </p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {{ oc.entrega }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  {{ oc.items }} ítems · {{ oc.estado }}
                </p>
              </div>
            </div>

            <p class="mb-2 mt-5 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Líneas de la orden
            </p>
            <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table class="w-full text-left text-sm">
                <thead
                  class="text-xs uppercase text-slate-500 dark:text-slate-400"
                >
                  <tr>
                    <th scope="col" class="px-3 py-2">SKU</th>
                    <th scope="col" class="px-3 py-2">Producto</th>
                    <th scope="col" class="px-3 py-2 text-right">Cant.</th>
                    <th scope="col" class="px-3 py-2 text-right">Costo</th>
                    <th scope="col" class="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                  @for (linea of lineas(); track $index) {
                    <tr class="text-slate-700 dark:text-slate-300">
                      <td class="px-3 py-2 font-mono text-xs">{{ linea.sku }}</td>
                      <td class="px-3 py-2">{{ linea.nombre }}</td>
                      <td class="px-3 py-2 text-right">{{ linea.cantidad }}</td>
                      <td class="px-3 py-2 text-right">{{ linea.costo | siremMoney }}</td>
                      <td class="px-3 py-2 text-right font-semibold">
                        {{ linea.subtotal | siremMoney }}
                      </td>
                    </tr>
                  }
                </tbody>
                <tfoot
                  class="border-t border-slate-200 font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100"
                >
                  <tr>
                    <td colspan="4" class="px-3 py-2 text-right">Total orden</td>
                    <td class="px-3 py-2 text-right">{{ oc.total | siremMoney }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class OrdenesCompraDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia editable: la demo muta el estado de las órdenes en memoria. */
  readonly ordenes = signal<ErpOrdenCompra[]>(ORDENES_COMPRA.map((d) => ({ ...d })));

  readonly q = signal('');
  readonly estado = signal<string | number | null>(null);
  readonly detalleAbierto = signal(false);
  private readonly seleccion = signal<ErpOrdenCompra | null>(null);

  readonly estadoOptions: SiremSelectOption[] = ESTADOS_ORDEN.map((e) => ({
    value: e,
    label: e,
  }));

  readonly cols: SiremTableColumn[] = [
    { key: 'numero', label: 'Orden', subKey: 'fecha' },
    { key: 'proveedor', label: 'Proveedor' },
    { key: 'entrega', label: 'Entrega', kind: 'date' },
    { key: 'items', label: 'Ítems', kind: 'number', align: 'right' },
    { key: 'total', label: 'Total', kind: 'currency', align: 'right' },
    {
      key: 'estado',
      label: 'Estado',
      kind: 'badge',
      badgeTones: {
        Borrador: 'neutral',
        Enviada: 'info',
        Recibida: 'warning',
        Facturada: 'success',
      },
    },
  ];

  /** Filtrado por texto (orden/proveedor) y estado. */
  readonly filtradas = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const estado = this.estado();
    return this.ordenes().filter((oc) => {
      const coincide =
        !texto || `${oc.numero} ${oc.proveedor}`.toLowerCase().includes(texto);
      return coincide && (!estado || oc.estado === estado);
    });
  });

  readonly abiertas = computed(
    () => this.ordenes().filter((oc) => oc.estado === 'Borrador' || oc.estado === 'Enviada').length,
  );

  readonly valorComprometido = computed(() =>
    this.ordenes().reduce((acc, oc) => acc + oc.total, 0),
  );

  readonly recibidasMes = computed(
    () =>
      this.ordenes().filter((oc) => oc.estado === 'Recibida' && oc.fecha.startsWith('2026-09'))
        .length,
  );

  readonly facturadas = computed(() => this.porEstado('Facturada'));

  readonly detalle = computed(() => this.seleccion());

  /** Recepción y facturación se habilitan solo si el estado lo permite. */
  readonly acciones = computed<SiremModalAction[]>(() => {
    const oc = this.detalle();
    return [
      {
        label: 'Recibir mercancía',
        variant: 'secondary',
        disabled: !oc || oc.estado === 'Recibida' || oc.estado === 'Facturada',
      },
      { label: 'Convertir en factura de compra', disabled: !oc || oc.estado !== 'Recibida' },
    ];
  });

  /** Líneas simuladas con productos de catálogo (costos ajustados al total). */
  readonly lineas = computed<LineaOrden[]>(() => {
    const oc = this.seleccion();
    if (!oc) return [];
    const bruto = Array.from({ length: oc.items }, (_, i) => ({
      producto: PRODUCTOS[(oc.id + i) % PRODUCTOS.length],
      cantidad: 1 + ((oc.id + i * 3) % 4),
    }));
    const unidades = bruto.reduce((acc, l) => acc + l.cantidad, 0);
    return bruto.map((l) => {
      const subtotal = Math.round((oc.total * l.cantidad) / unidades);
      return {
        sku: l.producto.sku,
        nombre: l.producto.nombre,
        cantidad: l.cantidad,
        costo: Math.round(subtotal / l.cantidad),
        subtotal,
      };
    });
  });

  porEstado(estado: ErpEstadoOrden): number {
    return this.ordenes().filter((oc) => oc.estado === estado).length;
  }

  abrir(fila: Record<string, unknown>): void {
    const oc = this.ordenes().find((d) => d.id === fila['id']);
    if (!oc) return;
    this.seleccion.set(oc);
    this.detalleAbierto.set(true);
  }

  /** Recibe la mercancía en bodega o convierte la orden en factura de compra. */
  accion(label: string): void {
    const oc = this.seleccion();
    if (!oc) return;

    if (label === 'Recibir mercancía') {
      oc.estado = 'Recibida';
      this.toast.success({
        title: oc.numero + ' recibida',
        description: 'Mercancía descargada y verificada en Bodega Bogotá.',
        duration: 3_500,
      });
    } else {
      oc.estado = 'Facturada';
      const factura = 'FP-302' + (21 + oc.id);
      this.toast.success({
        title: 'Factura de compra ' + factura,
        description: 'Orden ' + oc.numero + ' convertida y dada de baja en inventario.',
        duration: 4_000,
      });
    }

    this.ordenes.update((ordenes) => [...ordenes]);
    this.detalleAbierto.set(false);
  }

  nuevaOrden(): void {
    this.toast.info({
      title: 'Nueva orden de compra',
      description: 'Selecciona el proveedor y agrega los productos a solicitar.',
      duration: 3_000,
    });
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'ordenes-compra.html',
      language: 'html',
      code: `<sirem-page-header
  title="Órdenes de compra"
  subtitle="Solicitudes formales al proveedor, recepción y facturación">
  <div slot="actions" class="flex gap-2">
    <sirem-button size="sm" (pressed)="nuevaOrden()">Nueva orden de compra</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Órdenes abiertas" [value]="abiertas()" color="info" />
  <sirem-stat-card label="Valor comprometido" [value]="valorComprometido() | siremMoney" variant="tint" />
  <sirem-stat-card label="Recibidas este mes" [value]="recibidasMes()" color="warning" />
  <sirem-stat-card label="Facturadas" [value]="facturadas()" color="success" />
</div>

<div class="grid gap-3 md:grid-cols-[1fr_13rem]">
  <sirem-search-field label="Buscar" placeholder="Número de orden o proveedor…" [(value)]="q" />
  <sirem-input-field [strictOptions]="true" label="Estado" placeholder="Todos"
    [options]="estadoOptions" [(value)]="estado" />
</div>

<sirem-data-table [columns]="cols" [rows]="filtradas()" (rowClicked)="abrir($event)" />

<sirem-modal [(open)]="detalleAbierto" [title]="detalle()?.numero ?? 'Orden de compra'"
  size="lg" [actions]="acciones()" (actionPressed)="accion($event.label)">
  @if (detalle(); as oc) {
    <p class="text-sm font-semibold">{{ oc.proveedor }} · entrega {{ oc.entrega }}</p>
    <table class="w-full text-sm">
      <tbody>
        @for (linea of lineas(); track $index) {
          <tr>
            <td>{{ linea.sku }} {{ linea.nombre }}</td>
            <td class="text-right">{{ linea.cantidad }}</td>
            <td class="text-right">{{ linea.subtotal | siremMoney }}</td>
          </tr>
        }
      </tbody>
    </table>
  }
</sirem-modal>`,
    },
    {
      name: 'ordenes-compra.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremDataTable, SiremModal, SiremInput,
  type ErpEstadoOrden, type ErpOrdenCompra,
  type SiremModalAction, type SiremTableColumn,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { ORDENES_COMPRA, PRODUCTOS } from '../../data/erp-mock';

const ESTADOS_ORDEN: ErpEstadoOrden[] = ['Borrador', 'Enviada', 'Recibida', 'Facturada'];

type LineaOrden = { sku: string; nombre: string; cantidad: number; costo: number; subtotal: number };

export class OrdenesCompraPage {
  private readonly toast = inject(DynamicToastService);

  readonly ordenes = signal<ErpOrdenCompra[]>(ORDENES_COMPRA.map(d => ({ ...d })));
  readonly q = signal('');
  readonly estado = signal<string | number | null>(null);
  readonly detalleAbierto = signal(false);
  private readonly seleccion = signal<ErpOrdenCompra | null>(null);

  readonly estadoOptions = ESTADOS_ORDEN.map(e => ({ value: e, label: e }));

  readonly cols: SiremTableColumn[] = [
    { key: 'numero', label: 'Orden', subKey: 'fecha' },
    { key: 'proveedor', label: 'Proveedor' },
    { key: 'entrega', label: 'Entrega', kind: 'date' },
    { key: 'items', label: 'Ítems', kind: 'number', align: 'right' },
    { key: 'total', label: 'Total', kind: 'currency', align: 'right' },
    { key: 'estado', label: 'Estado', kind: 'badge',
      badgeTones: { Borrador: 'neutral', Enviada: 'info',
                    Recibida: 'warning', Facturada: 'success' } },
  ];

  readonly filtradas = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const estado = this.estado();
    return this.ordenes().filter(oc => {
      const coincide = !texto || (oc.numero + ' ' + oc.proveedor).toLowerCase().includes(texto);
      return coincide && (!estado || oc.estado === estado);
    });
  });

  readonly abiertas = computed(() =>
    this.ordenes().filter(oc => oc.estado === 'Borrador' || oc.estado === 'Enviada').length);

  readonly valorComprometido = computed(() =>
    this.ordenes().reduce((acc, oc) => acc + oc.total, 0));

  readonly facturadas = computed(() =>
    this.ordenes().filter(oc => oc.estado === 'Facturada').length);

  readonly detalle = computed(() => this.seleccion());

  readonly acciones = computed<SiremModalAction[]>(() => {
    const oc = this.detalle();
    return [
      { label: 'Recibir mercancía', variant: 'secondary',
        disabled: !oc || oc.estado === 'Recibida' || oc.estado === 'Facturada' },
      { label: 'Convertir en factura de compra', disabled: !oc || oc.estado !== 'Recibida' },
    ];
  });

  readonly lineas = computed<LineaOrden[]>(() => {
    const oc = this.seleccion();
    if (!oc) return [];
    const bruto = Array.from({ length: oc.items }, (_, i) => ({
      producto: PRODUCTOS[(oc.id + i) % PRODUCTOS.length],
      cantidad: 1 + ((oc.id + i * 3) % 4),
    }));
    const unidades = bruto.reduce((acc, l) => acc + l.cantidad, 0);
    return bruto.map(l => {
      const subtotal = Math.round((oc.total * l.cantidad) / unidades);
      return { sku: l.producto.sku, nombre: l.producto.nombre, cantidad: l.cantidad,
               costo: Math.round(subtotal / l.cantidad), subtotal };
    });
  });

  abrir(fila: Record<string, unknown>): void {
    const oc = this.ordenes().find(d => d.id === fila['id']);
    if (!oc) return;
    this.seleccion.set(oc);
    this.detalleAbierto.set(true);
  }

  accion(label: string): void {
    const oc = this.seleccion();
    if (!oc) return;
    if (label === 'Recibir mercancía') {
      oc.estado = 'Recibida';
      this.toast.success({ title: oc.numero + ' recibida',
        description: 'Mercancía descargada y verificada en bodega.', duration: 3_500 });
    } else {
      oc.estado = 'Facturada';
      this.toast.success({ title: 'Factura de compra FP-302' + (21 + oc.id),
        description: 'Orden convertida y dada de baja en inventario.', duration: 4_000 });
    }
    this.ordenes.update(ordenes => [...ordenes]);
    this.detalleAbierto.set(false);
  }
}`,
    },
  ];
}
