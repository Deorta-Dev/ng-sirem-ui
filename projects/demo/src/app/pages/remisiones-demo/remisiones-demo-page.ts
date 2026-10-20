import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremBadgeTone,
  SiremButton,
  SiremCard,
  SiremConfirmDialog,
  SiremDataTable,
  SiremEmptyState,
  SiremInput, SiremModal,
  SiremModalAction,
  SiremPageHeader,
  SiremSearchField,
  SiremSelectOption,
  SiremStatCard,
  SiremTableColumn,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import {
  PRODUCTOS,
  REMISIONES,
  type ErpEstadoRemision,
  type ErpRemision,
} from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Estados de una remisión de mercancía. */
const ESTADOS: ErpEstadoRemision[] = ['Pendiente', 'Despachada', 'Anulada'];

/** Línea referencial del detalle de la remisión. */
type LineaRemision = { sku: string; nombre: string; cantidad: number; valor: number };

/**
 * Remisiones (albaranes): documentos de entrega que descuentan
 * inventario al despachar sin obligación contable inmediata; el asiento
 * llega cuando se factura.
 */
@Component({
  selector: 'app-remisiones-demo-page',
  standalone: true,
  imports: [
    DecimalPipe,
    PageDemoShell,
    SiremButton,
    SiremCard,
    SiremConfirmDialog,
    SiremDataTable,
    SiremEmptyState,
    SiremInput, SiremModal,
    SiremPageHeader,
    SiremSearchField,
    SiremStatCard,
  ],
  template: `
    <app-page-demo-shell label="Remisiones (albaranes)" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header
            title="Remisiones (albaranes)"
            subtitle="Documentos de entrega que descuentan inventario sin obligación contable inmediata"
          >
            <div slot="actions" class="flex gap-2">
              <sirem-button size="sm" variant="secondary" (pressed)="nuevaRemision()">
                Nueva remisión
              </sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Remisiones abiertas" [value]="porEstado('Pendiente')" color="warning" />
            <sirem-stat-card label="Despachadas del mes" [value]="porEstado('Despachada')" color="success" />
            <sirem-stat-card label="Unidades en tránsito" [value]="unidadesTransito()" />
            <sirem-stat-card label="Anuladas" [value]="porEstado('Anulada')" color="danger" />
          </div>

          <sirem-card
            title="Qué hace este documento"
            subtitle="Descuenta existencias de la bodega al despachar, pero no genera asiento contable hasta que se factura."
          >
            <p class="text-sm text-slate-600 dark:text-slate-300">
              Al anular una remisión la mercancía vuelve a la bodega de origen y el documento queda
              trazado como inefectivo. La factura de venta es la que finalmente reconoce el ingreso.
            </p>
          </sirem-card>

          <div class="grid gap-3 md:grid-cols-[1fr_13rem]">
            <sirem-search-field placeholder="Buscar por número, cliente o bodega…" [(value)]="q" />
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
              title="Sin remisiones"
              description="Ninguna remisión coincide con los filtros actuales."
            />
          }
        </div>

        <sirem-modal
          [(open)]="detalleAbierto"
          [title]="detalle()?.numero ?? 'Remisión'"
          size="lg"
          [actions]="acciones()"
          (actionPressed)="accion($event.label)"
        >
          @if (detalle(); as rem) {
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Cliente</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ rem.cliente }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Bodega</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ rem.bodega }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Fecha</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ rem.fecha }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Valor · Estado</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {{ rem.valor | number: '1.0-0' }} COP · {{ rem.estado }}
                </p>
              </div>
            </div>

            <p class="mb-2 mt-5 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Líneas despachadas
            </p>
            <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table class="w-full text-left text-sm">
                <thead
                  class="text-xs uppercase text-slate-500 dark:text-slate-400"
                >
                  <tr>
                    <th scope="col" class="px-3 py-2">SKU</th>
                    <th scope="col" class="px-3 py-2">Producto</th>
                    <th scope="col" class="px-3 py-2 text-right">Cantidad</th>
                    <th scope="col" class="px-3 py-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (linea of lineas(); track linea.sku) {
                    <tr>
                      <td class="px-3 py-2 font-mono text-xs">{{ linea.sku }}</td>
                      <td class="px-3 py-2">{{ linea.nombre }}</td>
                      <td class="px-3 py-2 text-right">{{ linea.cantidad }}</td>
                      <td class="px-3 py-2 text-right font-semibold">{{ linea.valor | number: '1.0-0' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </sirem-modal>

        <sirem-confirm-dialog
          [(open)]="confirmarAbierto"
          variant="danger"
          title="Anular remisión"
          [message]="'¿Anular la remisión ' + (detalle()?.numero ?? '') + '?'"
          detail="Se repone la mercancía en la bodega de origen y el documento queda inefectivo."
          confirmLabel="Sí, anular"
          cancelLabel="Cancelar"
          (confirmed)="anular()"
        />
      </main>
    </app-page-demo-shell>
  `,
})
export class RemisionesDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia editable: la demo anula documentos en memoria. */
  readonly remisiones = signal<ErpRemision[]>(REMISIONES.map((r) => ({ ...r })));

  readonly q = signal('');
  readonly estado = signal<string | number | null>(null);

  readonly detalleAbierto = signal(false);
  readonly confirmarAbierto = signal(false);
  readonly seleccion = signal<ErpRemision | null>(null);

  readonly estadoOptions: SiremSelectOption[] = ESTADOS.map((e) => ({ value: e, label: e }));

  readonly tonos: Record<string, SiremBadgeTone> = {
    Pendiente: 'warning',
    Despachada: 'success',
    Anulada: 'neutral',
  };

  readonly cols: SiremTableColumn[] = [
    { key: 'numero', label: 'Remisión', subKey: 'fecha' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'bodega', label: 'Bodega' },
    { key: 'items', label: 'Ítems', kind: 'number', align: 'right' },
    { key: 'valor', label: 'Valor', kind: 'currency', align: 'right' },
    { key: 'estado', label: 'Estado', kind: 'badge', badgeTones: this.tonos },
  ];

  readonly filtradas = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const estado = this.estado();
    return this.remisiones().filter((r) => {
      const coincide =
        !texto || (r.numero + ' ' + r.cliente + ' ' + r.bodega).toLowerCase().includes(texto);
      return coincide && (!estado || r.estado === estado);
    });
  });

  readonly unidadesTransito = computed(() =>
    this.remisiones()
      .filter((r) => r.estado === 'Despachada')
      .reduce((acc, r) => acc + r.items, 0),
  );

  /** 3 líneas armadas con productos del catálogo compartido. */
  readonly lineas = computed<LineaRemision[]>(() => {
    const rem = this.seleccion();
    if (!rem) return [];
    const base = rem.id % PRODUCTOS.length;
    return [0, 1, 2].map((paso) => {
      const producto = PRODUCTOS[(base + paso) % PRODUCTOS.length];
      const cantidad = Math.max(1, Math.round(rem.items / 3) + paso);
      return { sku: producto.sku, nombre: producto.nombre, cantidad, valor: cantidad * producto.precioDetal };
    });
  });

  readonly detalle = computed(() => this.seleccion());

  /** La anulación solo se ofrece mientras el documento no esté anulado. */
  readonly acciones = computed<SiremModalAction[]>(() => [
    { label: 'Anular remisión', variant: 'danger', disabled: this.detalle()?.estado === 'Anulada' },
  ]);

  porEstado(estado: ErpEstadoRemision): number {
    return this.remisiones().filter((r) => r.estado === estado).length;
  }

  nuevaRemision(): void {
    this.toast.info({
      title: 'Nueva remisión',
      description: 'Se creó el borrador RM-02193 para despacho desde Bodega Bogotá.',
      duration: 3_000,
    });
  }

  abrir(fila: Record<string, unknown>): void {
    const rem = this.remisiones().find((r) => r.id === fila['id']);
    if (!rem) return;
    this.seleccion.set(rem);
    this.detalleAbierto.set(true);
  }

  accion(label: string): void {
    if (label !== 'Anular remisión') return;
    this.confirmarAbierto.set(true);
  }

  /** Anula la remisión, repone existencias y avisa con toast. */
  anular(): void {
    const rem = this.seleccion();
    if (!rem) return;

    rem.estado = 'Anulada';
    this.remisiones.update((docs) => [...docs]);
    this.detalleAbierto.set(false);
    this.toast.success({
      title: rem.numero + ' anulada',
      description: 'Se repusieron ' + rem.items + ' unidades en ' + rem.bodega + '.',
      duration: 3_000,
    });
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'remisiones.html',
      language: 'html',
      code: `<sirem-page-header
  title="Remisiones (albaranes)"
  subtitle="Documentos de entrega que descuentan inventario sin obligación contable inmediata">
  <div slot="actions" class="flex gap-2">
    <sirem-button size="sm" variant="secondary" (pressed)="nuevaRemision()">Nueva remisión</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Remisiones abiertas" [value]="porEstado('Pendiente')" color="warning" />
  <sirem-stat-card label="Despachadas del mes" [value]="porEstado('Despachada')" color="success" />
  <sirem-stat-card label="Unidades en tránsito" [value]="unidadesTransito()" />
  <sirem-stat-card label="Anuladas" [value]="porEstado('Anulada')" color="danger" />
</div>

<sirem-card
  title="Qué hace este documento"
  subtitle="Descuenta existencias de la bodega al despachar, pero no genera asiento contable hasta que se factura.">
  <p class="text-sm text-slate-600 dark:text-slate-300">Al anular, la mercancía vuelve a la bodega.</p>
</sirem-card>

<div class="grid gap-3 md:grid-cols-[1fr_13rem]">
  <sirem-search-field placeholder="Buscar por número, cliente o bodega…" [(value)]="q" />
  <sirem-input-field [strictOptions]="true" label="Estado" placeholder="Todos" [options]="estadoOptions" [(value)]="estado" />
</div>

@if (filtradas().length) {
  <sirem-data-table [columns]="cols" [rows]="filtradas()" (rowClicked)="abrir($event)" />
} @else {
  <sirem-empty-state title="Sin remisiones" description="Ninguna remisión coincide con los filtros." />
}

<sirem-modal [(open)]="detalleAbierto" [title]="detalle()?.numero ?? 'Remisión'"
  size="lg" [actions]="acciones()" (actionPressed)="accion($event.label)">
  @if (detalle(); as rem) {
    <p class="text-sm font-semibold">{{ rem.cliente }} · {{ rem.bodega }} · {{ rem.estado }}</p>
    <table class="w-full text-sm">
      <tbody>
        @for (linea of lineas(); track linea.sku) {
          <tr>
            <td>{{ linea.sku }}</td>
            <td>{{ linea.nombre }}</td>
            <td class="text-right">{{ linea.cantidad }}</td>
            <td class="text-right">{{ linea.valor | number: '1.0-0' }}</td>
          </tr>
        }
      </tbody>
    </table>
  }
</sirem-modal>

<sirem-confirm-dialog [(open)]="confirmarAbierto" variant="danger"
  title="Anular remisión" [message]="'¿Anular ' + (detalle()?.numero ?? '') + '?'"
  confirmLabel="Sí, anular" (confirmed)="anular()" />`,
    },
    {
      name: 'remisiones.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremBadgeTone, SiremDataTable, SiremModal, SiremModalAction, SiremInput,
  SiremSelectOption, SiremTableColumn,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { PRODUCTOS, REMISIONES, type ErpEstadoRemision, type ErpRemision } from '../../data/erp-mock';

const ESTADOS: ErpEstadoRemision[] = ['Pendiente', 'Despachada', 'Anulada'];

export class RemisionesPage {
  private readonly toast = inject(DynamicToastService);

  readonly remisiones = signal<ErpRemision[]>(REMISIONES.map(r => ({ ...r })));
  readonly q = signal('');
  readonly estado = signal<string | number | null>(null);
  readonly seleccion = signal<ErpRemision | null>(null);
  readonly detalleAbierto = signal(false);
  readonly confirmarAbierto = signal(false);

  readonly estadoOptions: SiremSelectOption[] = ESTADOS.map(e => ({ value: e, label: e }));

  readonly tonos: Record<string, SiremBadgeTone> = {
    Pendiente: 'warning', Despachada: 'success', Anulada: 'neutral',
  };

  readonly cols: SiremTableColumn[] = [
    { key: 'numero', label: 'Remisión', subKey: 'fecha' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'bodega', label: 'Bodega' },
    { key: 'items', label: 'Ítems', kind: 'number', align: 'right' },
    { key: 'valor', label: 'Valor', kind: 'currency', align: 'right' },
    { key: 'estado', label: 'Estado', kind: 'badge', badgeTones: this.tonos },
  ];

  readonly filtradas = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const estado = this.estado();
    return this.remisiones().filter(r => {
      const coincide = !texto ||
        (r.numero + ' ' + r.cliente + ' ' + r.bodega).toLowerCase().includes(texto);
      return coincide && (!estado || r.estado === estado);
    });
  });

  readonly unidadesTransito = computed(() =>
    this.remisiones().filter(r => r.estado === 'Despachada')
      .reduce((acc, r) => acc + r.items, 0),
  );

  readonly lineas = computed(() => {
    const rem = this.seleccion();
    if (!rem) return [];
    const base = rem.id % PRODUCTOS.length;
    return [0, 1, 2].map(paso => {
      const p = PRODUCTOS[(base + paso) % PRODUCTOS.length];
      const cantidad = Math.max(1, Math.round(rem.items / 3) + paso);
      return { sku: p.sku, nombre: p.nombre, cantidad, valor: cantidad * p.precioDetal };
    });
  });

  readonly acciones = computed<SiremModalAction[]>(() => [
    { label: 'Anular remisión', variant: 'danger', disabled: this.detalle()?.estado === 'Anulada' },
  ]);

  porEstado(estado: ErpEstadoRemision): number {
    return this.remisiones().filter(r => r.estado === estado).length;
  }

  abrir(fila: Record<string, unknown>): void {
    const rem = this.remisiones().find(r => r.id === fila['id']);
    if (!rem) return;
    this.seleccion.set(rem);
    this.detalleAbierto.set(true);
  }

  accion(label: string): void {
    if (label === 'Anular remisión') this.confirmarAbierto.set(true);
  }

  anular(): void {
    const rem = this.seleccion();
    if (!rem) return;
    rem.estado = 'Anulada';
    this.remisiones.update(docs => [...docs]);
    this.detalleAbierto.set(false);
    this.toast.success({
      title: rem.numero + ' anulada',
      description: 'Se repusieron ' + rem.items + ' unidades en ' + rem.bodega + '.',
      duration: 3_000,
    });
  }
}`,
    },
  ];
}
