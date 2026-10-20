import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremBadgeTone,
  SiremButton,
  SiremCardList,
  SiremDataTable,
  SiremEmptyState,
  SiremInput, SiremModal,
  SiremPageHeader,
  SiremSearchField,
  SiremSelectOption,
  SiremStatCard,
  SiremTableColumn,
  SiremSegmented,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import {
  COTIZACIONES,
  PRODUCTOS,
  type ErpCotizacion,
  type ErpEstadoCotizacion,
} from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Estados del pipeline comercial de una cotización. */
const ESTADOS: ErpEstadoCotizacion[] = [
  'Borrador',
  'Enviada',
  'Aceptada',
  'Rechazada',
  'Facturada',
];

/** Línea referencial que se muestra en el detalle de la cotización. */
type LineaCotizacion = { sku: string; nombre: string; cantidad: number; precio: number };

/**
 * Cotizaciones y presupuestos: pipeline de propuestas comerciales
 * convertibles a factura en un clic, con filtro por estado y vista
 * tabla/tarjetas.
 */
@Component({
  selector: 'app-cotizaciones-demo-page',
  standalone: true,
  imports: [
    DecimalPipe,
    PageDemoShell,
    SiremButton,
    SiremCardList,
    SiremDataTable,
    SiremEmptyState,
    SiremInput, SiremModal,
    SiremPageHeader,
    SiremSearchField,
    SiremStatCard,
    SiremSegmented,
  ],
  template: `
    <app-page-demo-shell label="Cotizaciones y presupuestos" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header
            title="Cotizaciones y presupuestos"
            subtitle="Pipeline de propuestas comerciales convertibles a factura en un clic"
          >
            <div slot="actions" class="flex gap-2">
              <sirem-button size="sm" variant="secondary" (pressed)="nuevaCotizacion()">
                Nueva cotización
              </sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Cotizadas del mes" [value]="cotizadasMes()" />
            <sirem-stat-card label="Aceptadas" [value]="porEstado('Aceptada')" color="success" />
            <sirem-stat-card label="Por vencer" [value]="porEstado('Enviada')" color="warning" />
            <sirem-stat-card label="Facturadas" [value]="porEstado('Facturada')" color="info" />
          </div>

          <div class="grid gap-3 md:grid-cols-[1fr_13rem]">
            <sirem-search-field placeholder="Buscar por número o cliente…" [(value)]="q" />
            <sirem-input-field [strictOptions]="true"
              label="Estado"
              placeholder="Todos"
              [options]="estadoOptions"
              [(value)]="estado"
            />
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ filtrados().length }} cotización(es) en pantalla
            </p>
            <sirem-segmented [(value)]="vista" />
          </div>

          @if (filtrados().length) {
            @if (vista() === 'table') {
              <sirem-data-table [columns]="cols" [rows]="filtrados()" (rowClicked)="abrir($event)" />
            } @else {
              <sirem-card-list
                [items]="filtrados()"
                titleKey="numero"
                subtitleKey="cliente"
                badgeKey="estado"
                [badgeTones]="tonos"
                [fields]="campos"
                (itemPressed)="abrir($event)"
              />
            }
          } @else {
            <sirem-empty-state
              title="Sin cotizaciones"
              description="Ninguna cotización coincide con los filtros actuales."
            />
          }
        </div>

        <sirem-modal
          [(open)]="detalleAbierto"
          [title]="detalle()?.numero ?? 'Cotización'"
          size="lg"
          [actions]="acciones"
          (actionPressed)="accion($event.label)"
        >
          @if (detalle(); as cot) {
            <div class="grid gap-3 sm:grid-cols-3">
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Cliente</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ cot.cliente }}</p>
                <p class="text-xs text-slate-500">Validez hasta {{ cot.validez }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Fecha</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ cot.fecha }}</p>
                <p class="text-xs text-slate-500">{{ cot.items }} ítems cotizados</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Total</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {{ cot.total | number: '1.0-0' }} COP
                </p>
                <p class="text-xs text-slate-500">Estado: {{ cot.estado }}</p>
              </div>
            </div>

            <p class="mb-2 mt-5 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Líneas (referenciales)
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
                    <th scope="col" class="px-3 py-2 text-right">Precio</th>
                    <th scope="col" class="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (linea of lineas(); track linea.sku) {
                    <tr>
                      <td class="px-3 py-2 font-mono text-xs">{{ linea.sku }}</td>
                      <td class="px-3 py-2">{{ linea.nombre }}</td>
                      <td class="px-3 py-2 text-right">{{ linea.cantidad }}</td>
                      <td class="px-3 py-2 text-right">{{ linea.precio | number: '1.0-0' }}</td>
                      <td class="px-3 py-2 text-right font-semibold">
                        {{ linea.cantidad * linea.precio | number: '1.0-0' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class CotizacionesDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia editable: la demo cambia estados en memoria. */
  readonly cots = signal<ErpCotizacion[]>(COTIZACIONES.map((c) => ({ ...c })));

  readonly q = signal('');
  readonly estado = signal<string | number | null>(null);
  readonly vista = signal<string | null>('table');

  readonly detalleAbierto = signal(false);
  readonly seleccion = signal<ErpCotizacion | null>(null);

  readonly estadoOptions: SiremSelectOption[] = ESTADOS.map((e) => ({ value: e, label: e }));

  readonly tonos: Record<string, SiremBadgeTone> = {
    Borrador: 'neutral',
    Enviada: 'info',
    Aceptada: 'success',
    Rechazada: 'danger',
    Facturada: 'info',
  };

  readonly cols: SiremTableColumn[] = [
    { key: 'numero', label: 'Cotización', subKey: 'fecha' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'items', label: 'Ítems', kind: 'number', align: 'right' },
    { key: 'total', label: 'Total', kind: 'currency', align: 'right' },
    { key: 'estado', label: 'Estado', kind: 'badge', badgeTones: this.tonos },
  ];

  readonly campos = [
    { key: 'fecha', label: 'Fecha', icon: 'fi fi-rr-calendar' },
    { key: 'total', label: 'Total COP', icon: 'fi fi-rr-tag' },
    { key: 'items', label: 'Ítems', icon: 'fi fi-rr-box' },
  ];

  readonly acciones = [
    { label: 'Rechazar', variant: 'secondary' as const },
    { label: 'Convertir a factura' },
  ];

  readonly filtrados = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const estado = this.estado();
    return this.cots().filter((c) => {
      const coincide = !texto || (c.numero + ' ' + c.cliente).toLowerCase().includes(texto);
      return coincide && (!estado || c.estado === estado);
    });
  });

  readonly cotizadasMes = computed(
    () => this.cots().filter((c) => c.fecha.startsWith('2026-09')).length,
  );

  /** Detalle: 3 líneas armadas con productos del catálogo compartido. */
  readonly lineas = computed<LineaCotizacion[]>(() => {
    const cot = this.seleccion();
    if (!cot) return [];
    const base = cot.id % PRODUCTOS.length;
    return [0, 1, 2].map((paso) => {
      const producto = PRODUCTOS[(base + paso) % PRODUCTOS.length];
      return { sku: producto.sku, nombre: producto.nombre, cantidad: paso + 1, precio: producto.precioDetal };
    });
  });

  readonly detalle = computed(() => this.seleccion());

  porEstado(estado: ErpEstadoCotizacion): number {
    return this.cots().filter((c) => c.estado === estado).length;
  }

  nuevaCotizacion(): void {
    this.toast.info({
      title: 'Nueva cotización',
      description: 'Se creó el borrador COT-0457 listo para cargar ítems.',
      duration: 3_000,
    });
  }

  abrir(fila: Record<string, unknown>): void {
    const cot = this.cots().find((c) => c.id === fila['id']);
    if (!cot) return;
    this.seleccion.set(cot);
    this.detalleAbierto.set(true);
  }

  /** Rechaza la propuesta o la convierte en factura, con toast de estado. */
  accion(label: string): void {
    const cot = this.seleccion();
    if (!cot) return;

    if (label === 'Convertir a factura') {
      cot.estado = 'Facturada';
      this.toast.success({
        title: cot.numero + ' convertida',
        description: 'Se creó la factura FV-10488 pendiente de validar.',
        duration: 3_500,
      });
    } else {
      cot.estado = 'Rechazada';
      this.toast.error({
        title: cot.numero + ' rechazada',
        description: 'El cliente descartó la propuesta; sale del pipeline comercial.',
        duration: 3_500,
      });
    }

    this.cots.update((cots) => [...cots]);
    this.detalleAbierto.set(false);
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'cotizaciones.html',
      language: 'html',
      code: `<sirem-page-header
  title="Cotizaciones y presupuestos"
  subtitle="Pipeline de propuestas comerciales convertibles a factura en un clic">
  <div slot="actions" class="flex gap-2">
    <sirem-button size="sm" variant="secondary" (pressed)="nuevaCotizacion()">Nueva cotización</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Cotizadas del mes" [value]="cotizadasMes()" />
  <sirem-stat-card label="Aceptadas" [value]="porEstado('Aceptada')" color="success" />
  <sirem-stat-card label="Por vencer" [value]="porEstado('Enviada')" color="warning" />
  <sirem-stat-card label="Facturadas" [value]="porEstado('Facturada')" color="info" />
</div>

<div class="grid gap-3 md:grid-cols-[1fr_13rem]">
  <sirem-search-field placeholder="Buscar por número o cliente…" [(value)]="q" />
  <sirem-input-field [strictOptions]="true" label="Estado" placeholder="Todos" [options]="estadoOptions" [(value)]="estado" />
</div>

<div class="flex flex-wrap items-center justify-between gap-3">
  <p class="text-sm text-slate-500 dark:text-slate-400">{{ filtrados().length }} cotización(es) en pantalla</p>
  <sirem-segmented [(value)]="vista" />
</div>

@if (filtrados().length) {
  @if (vista() === 'table') {
    <sirem-data-table [columns]="cols" [rows]="filtrados()" (rowClicked)="abrir($event)" />
  } @else {
    <sirem-card-list [items]="filtrados()" titleKey="numero" subtitleKey="cliente"
      badgeKey="estado" [badgeTones]="tonos" [fields]="campos" (itemPressed)="abrir($event)" />
  }
} @else {
  <sirem-empty-state title="Sin cotizaciones" description="Ninguna cotización coincide con los filtros." />
}

<sirem-modal [(open)]="detalleAbierto" [title]="detalle()?.numero ?? 'Cotización'"
  size="lg" [actions]="acciones" (actionPressed)="accion($event.label)">
  @if (detalle(); as cot) {
    <p class="text-sm font-semibold">{{ cot.cliente }} · {{ cot.total | number: '1.0-0' }} COP</p>
    <table class="w-full text-sm">
      <tbody>
        @for (linea of lineas(); track linea.sku) {
          <tr>
            <td>{{ linea.sku }}</td>
            <td>{{ linea.nombre }}</td>
            <td class="text-right">{{ linea.cantidad }}</td>
          </tr>
        }
      </tbody>
    </table>
  }
</sirem-modal>`,
    },
    {
      name: 'cotizaciones.component.ts',
      language: 'typescript',
      code: `import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremBadgeTone, SiremCardList, SiremDataTable, SiremEmptyState, SiremModal,
  SiremInput, SiremSelectOption, SiremTableColumn,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { COTIZACIONES, PRODUCTOS, type ErpCotizacion, type ErpEstadoCotizacion } from '../../data/erp-mock';

const ESTADOS: ErpEstadoCotizacion[] = ['Borrador', 'Enviada', 'Aceptada', 'Rechazada', 'Facturada'];

export class CotizacionesPage {
  private readonly toast = inject(DynamicToastService);

  readonly cots = signal<ErpCotizacion[]>(COTIZACIONES.map(c => ({ ...c })));
  readonly q = signal('');
  readonly estado = signal<string | number | null>(null);
  readonly vista = signal<string | null>('table');
  readonly seleccion = signal<ErpCotizacion | null>(null);
  readonly detalleAbierto = signal(false);

  readonly estadoOptions: SiremSelectOption[] = ESTADOS.map(e => ({ value: e, label: e }));

  readonly tonos: Record<string, SiremBadgeTone> = {
    Borrador: 'neutral', Enviada: 'info', Aceptada: 'success',
    Rechazada: 'danger', Facturada: 'info',
  };

  readonly cols: SiremTableColumn[] = [
    { key: 'numero', label: 'Cotización', subKey: 'fecha' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'items', label: 'Ítems', kind: 'number', align: 'right' },
    { key: 'total', label: 'Total', kind: 'currency', align: 'right' },
    { key: 'estado', label: 'Estado', kind: 'badge', badgeTones: this.tonos },
  ];

  readonly acciones = [
    { label: 'Rechazar', variant: 'secondary' as const },
    { label: 'Convertir a factura' },
  ];

  readonly filtrados = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const estado = this.estado();
    return this.cots().filter(c => {
      const coincide = !texto || (c.numero + ' ' + c.cliente).toLowerCase().includes(texto);
      return coincide && (!estado || c.estado === estado);
    });
  });

  readonly cotizadasMes = computed(
    () => this.cots().filter(c => c.fecha.startsWith('2026-09')).length,
  );

  readonly lineas = computed(() => {
    const cot = this.seleccion();
    if (!cot) return [];
    const base = cot.id % PRODUCTOS.length;
    return [0, 1, 2].map(paso => {
      const p = PRODUCTOS[(base + paso) % PRODUCTOS.length];
      return { sku: p.sku, nombre: p.nombre, cantidad: paso + 1, precio: p.precioDetal };
    });
  });

  porEstado(estado: ErpEstadoCotizacion): number {
    return this.cots().filter(c => c.estado === estado).length;
  }

  abrir(fila: Record<string, unknown>): void {
    const cot = this.cots().find(c => c.id === fila['id']);
    if (!cot) return;
    this.seleccion.set(cot);
    this.detalleAbierto.set(true);
  }

  accion(label: string): void {
    const cot = this.seleccion();
    if (!cot) return;

    if (label === 'Convertir a factura') {
      cot.estado = 'Facturada';
      this.toast.success({
        title: cot.numero + ' convertida',
        description: 'Se creó la factura FV-10488 pendiente de validar.',
        duration: 3_500,
      });
    } else {
      cot.estado = 'Rechazada';
      this.toast.error({ title: cot.numero + ' rechazada', duration: 3_500 });
    }

    this.cots.update(cots => [...cots]);
    this.detalleAbierto.set(false);
  }
}`,
    },
  ];
}
