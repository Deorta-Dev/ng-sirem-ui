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
  SiremTimeline,
  type SiremModalAction,
  type SiremSelectOption,
  type SiremTableColumn,
  type SiremTimelineItem,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import {
  FACTURAS_COMPRA,
  type ErpEstadoRadian,
  type ErpFacturaCompra,
} from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Estados que Radian devuelve en el acuse de una factura de compra. */
const ESTADOS_RADIAN: ErpEstadoRadian[] = [
  'Recibida',
  'Acuse enviado',
  'Aceptada',
  'Rechazada',
];

/**
 * Facturas de proveedores (Radian): recepción de facturas electrónicas,
 * acuse de recibo y aceptación/rechazo con traza del documento.
 */
@Component({
  selector: 'app-facturas-proveedores-demo-page',
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
    SiremTimeline,
  ],
  template: `
    <app-page-demo-shell label="Facturas de proveedores" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header
            title="Facturas de proveedores (Radian)"
            subtitle="Recepción de facturas electrónicas con acuse de recibo y aceptación"
          >
            <div slot="actions" class="flex gap-2">
              <sirem-button size="sm" variant="secondary" (pressed)="importarXml()">
                Importar XML
              </sirem-button>
              <sirem-button size="sm" (pressed)="nuevaFacturaManual()">
                Nueva factura manual
              </sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Recibidas" [value]="recibidas()" />
            <sirem-stat-card label="Acuses enviados" [value]="acusesEnviados()" color="info" />
            <sirem-stat-card label="Aceptadas" [value]="aceptadas()" color="success" />
            <sirem-stat-card label="Rechazadas" [value]="rechazadas()" color="danger" />
          </div>

          <div class="grid gap-3 md:grid-cols-[1fr_13rem]">
            <sirem-search-field
              label="Buscar"
              placeholder="Número, proveedor o NIT…"
              [(value)]="q"
            />
            <sirem-input-field [strictOptions]="true"
              label="Estado Radian"
              placeholder="Todos"
              [options]="estadoOptions"
              [(value)]="estado"
            />
          </div>

          @if (filtrados().length) {
            <sirem-data-table [columns]="cols" [rows]="filtrados()" (rowClicked)="abrir($event)" />
          } @else {
            <sirem-empty-state
              title="Sin facturas"
              description="Ninguna factura coincide con los filtros actuales."
            />
          }
        </div>

        <sirem-modal
          [(open)]="detalleAbierto"
          [title]="detalle()?.numero ?? 'Factura'"
          size="lg"
          [actions]="acciones()"
          (actionPressed)="accion($event.label)"
        >
          @if (detalle(); as fac) {
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Proveedor
                </p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {{ fac.proveedor }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">NIT {{ fac.nit }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Estado Radian
                </p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {{ fac.estado }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Recibida el {{ fac.fecha }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Total
                </p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {{ fac.total | siremMoney }}
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Vencimiento
                </p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {{ fac.vence }}
                </p>
              </div>
            </div>

            <p class="mb-2 mt-5 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Traza Radian
            </p>
            <sirem-timeline [items]="traza()" />
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class FacturasProveedoresDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia editable: la demo muta el estado Radian en memoria. */
  readonly docs = signal<ErpFacturaCompra[]>(FACTURAS_COMPRA.map((d) => ({ ...d })));

  readonly q = signal('');
  readonly estado = signal<string | number | null>(null);
  readonly detalleAbierto = signal(false);
  private readonly seleccion = signal<ErpFacturaCompra | null>(null);

  readonly estadoOptions: SiremSelectOption[] = ESTADOS_RADIAN.map((e) => ({
    value: e,
    label: e,
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
  ];

  /** Filtrado por texto (número/proveedor/NIT) y estado Radian. */
  readonly filtrados = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const estado = this.estado();
    return this.docs().filter((fac) => {
      const coincide =
        !texto || `${fac.numero} ${fac.proveedor} ${fac.nit}`.toLowerCase().includes(texto);
      return coincide && (!estado || fac.estado === estado);
    });
  });

  readonly detalle = computed(() => this.seleccion());

  /** Acuse/rechazo quedan bloqueados cuando el documento ya cerró. */
  readonly acciones = computed<SiremModalAction[]>(() => {
    const fac = this.detalle();
    const cerrada = fac ? fac.estado === 'Aceptada' || fac.estado === 'Rechazada' : false;
    return [
      { label: 'Rechazar', variant: 'secondary', disabled: cerrada },
      { label: 'Aceptar y acusar', disabled: cerrada },
    ];
  });

  /** Conteos por estado Radian, recalculados con cada cambio de datos. */
  readonly recibidas = computed(() => this.docs().length);
  readonly acusesEnviados = computed(() => this.porEstado('Acuse enviado'));
  readonly aceptadas = computed(() => this.porEstado('Aceptada'));
  readonly rechazadas = computed(() => this.porEstado('Rechazada'));

  porEstado(estado: ErpEstadoRadian): number {
    return this.docs().filter((d) => d.estado === estado).length;
  }

  abrir(fila: Record<string, unknown>): void {
    const fac = this.docs().find((d) => d.id === fila['id']);
    if (!fac) return;
    this.seleccion.set(fac);
    this.detalleAbierto.set(true);
  }

  /** Acepta con acuse o rechaza la factura, con toast de confirmación. */
  accion(label: string): void {
    const fac = this.seleccion();
    if (!fac) return;

    if (label === 'Aceptar y acusar') {
      fac.estado = 'Aceptada';
      this.toast.success({
        title: fac.numero + ' aceptada',
        description: 'Acuse de recibo enviado al proveedor.',
        duration: 3_500,
      });
    } else {
      fac.estado = 'Rechazada';
      this.toast.error({
        title: fac.numero + ' rechazada',
        description: 'Se notificó el rechazo al proveedor para su corrección.',
        duration: 3_500,
      });
    }

    this.docs.update((docs) => [...docs]);
    this.detalleAbierto.set(false);
  }

  /** Traza simulada de Radian según el estado actual de la factura. */
  traza(): SiremTimelineItem[] {
    const fac = this.seleccion();
    if (!fac) return [];

    const items: SiremTimelineItem[] = [
      {
        title: 'Documento recibido',
        description: 'XML UBL 2.1 cargado desde el buzón del proveedor.',
        time: fac.fecha,
        tone: 'neutral',
      },
    ];
    if (fac.estado !== 'Recibida') {
      items.push({
        title: 'Acuse de recibo',
        description: 'Acuse automático enviado al proveedor.',
        time: fac.fecha,
        tone: 'info',
      });
    }
    if (fac.estado === 'Aceptada') {
      items.push({
        title: 'Aceptación',
        description: 'La factura queda registrada en compras.',
        time: fac.fecha,
        tone: 'success',
      });
    } else if (fac.estado === 'Rechazada') {
      items.push({
        title: 'Rechazo',
        description: 'Acuse con observaciones: corregir y volver a enviar.',
        time: fac.fecha,
        tone: 'danger',
      });
    }
    return items;
  }

  importarXml(): void {
    this.toast.info({
      title: 'Importar XML',
      description: 'Selecciona los XML descargados de Radian para procesarlos en lote.',
      duration: 3_000,
    });
  }

  nuevaFacturaManual(): void {
    this.toast.info({
      title: 'Factura manual',
      description: 'Se abrirá el formulario con los datos del proveedor precargados.',
      duration: 3_000,
    });
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'facturas-proveedores.html',
      language: 'html',
      code: `<sirem-page-header
  title="Facturas de proveedores (Radian)"
  subtitle="Recepción de facturas electrónicas con acuse de recibo y aceptación">
  <div slot="actions" class="flex gap-2">
    <sirem-button size="sm" variant="secondary" (pressed)="importarXml()">Importar XML</sirem-button>
    <sirem-button size="sm" (pressed)="nuevaFacturaManual()">Nueva factura manual</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Recibidas" [value]="recibidas()" />
  <sirem-stat-card label="Acuses enviados" [value]="acusesEnviados()" color="info" />
  <sirem-stat-card label="Aceptadas" [value]="aceptadas()" color="success" />
  <sirem-stat-card label="Rechazadas" [value]="rechazadas()" color="danger" />
</div>

<div class="grid gap-3 md:grid-cols-[1fr_13rem]">
  <sirem-search-field label="Buscar" placeholder="Número, proveedor o NIT…" [(value)]="q" />
  <sirem-input-field [strictOptions]="true" label="Estado Radian" placeholder="Todos"
    [options]="estadoOptions" [(value)]="estado" />
</div>

<sirem-data-table [columns]="cols" [rows]="filtrados()" (rowClicked)="abrir($event)" />

<sirem-modal [(open)]="detalleAbierto" [title]="detalle()?.numero ?? 'Factura'"
  size="lg" [actions]="acciones()" (actionPressed)="accion($event.label)">
  @if (detalle(); as fac) {
    <p class="text-sm font-semibold">{{ fac.proveedor }} · NIT {{ fac.nit }}</p>
    <p class="text-sm">{{ fac.total | siremMoney }} · vence {{ fac.vence }}</p>
    <sirem-timeline [items]="traza()" />
  }
</sirem-modal>`,
    },
    {
      name: 'facturas-proveedores.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremDataTable, SiremModal, SiremInput, SiremTimeline,
  type ErpEstadoRadian, type ErpFacturaCompra,
  type SiremModalAction, type SiremTableColumn, type SiremTimelineItem,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { FACTURAS_COMPRA } from '../../data/erp-mock';

const ESTADOS_RADIAN: ErpEstadoRadian[] = [
  'Recibida', 'Acuse enviado', 'Aceptada', 'Rechazada',
];

export class FacturasProveedoresPage {
  private readonly toast = inject(DynamicToastService);

  readonly docs = signal<ErpFacturaCompra[]>(FACTURAS_COMPRA.map(d => ({ ...d })));
  readonly q = signal('');
  readonly estado = signal<string | number | null>(null);
  readonly detalleAbierto = signal(false);
  private readonly seleccion = signal<ErpFacturaCompra | null>(null);

  readonly estadoOptions = ESTADOS_RADIAN.map(e => ({ value: e, label: e }));

  readonly cols: SiremTableColumn[] = [
    { key: 'numero', label: 'Factura', subKey: 'fecha' },
    { key: 'proveedor', label: 'Proveedor', subKey: 'nit' },
    { key: 'vence', label: 'Vence', kind: 'date' },
    { key: 'total', label: 'Total', kind: 'currency', align: 'right' },
    { key: 'estado', label: 'Estado Radian', kind: 'badge',
      badgeTones: { Recibida: 'neutral', 'Acuse enviado': 'info',
                    Aceptada: 'success', Rechazada: 'danger' } },
  ];

  readonly filtrados = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const estado = this.estado();
    return this.docs().filter(fac => {
      const coincide = !texto ||
        (fac.numero + ' ' + fac.proveedor + ' ' + fac.nit).toLowerCase().includes(texto);
      return coincide && (!estado || fac.estado === estado);
    });
  });

  readonly detalle = computed(() => this.seleccion());

  readonly recibidas = computed(() => this.docs().length);
  readonly acusesEnviados = computed(() => this.porEstado('Acuse enviado'));
  readonly aceptadas = computed(() => this.porEstado('Aceptada'));
  readonly rechazadas = computed(() => this.porEstado('Rechazada'));

  readonly acciones = computed<SiremModalAction[]>(() => {
    const fac = this.detalle();
    const cerrada = fac ? fac.estado === 'Aceptada' || fac.estado === 'Rechazada' : false;
    return [
      { label: 'Rechazar', variant: 'secondary', disabled: cerrada },
      { label: 'Aceptar y acusar', disabled: cerrada },
    ];
  });

  porEstado(estado: ErpEstadoRadian): number {
    return this.docs().filter(d => d.estado === estado).length;
  }

  abrir(fila: Record<string, unknown>): void {
    const fac = this.docs().find(d => d.id === fila['id']);
    if (!fac) return;
    this.seleccion.set(fac);
    this.detalleAbierto.set(true);
  }

  accion(label: string): void {
    const fac = this.seleccion();
    if (!fac) return;
    if (label === 'Aceptar y acusar') {
      fac.estado = 'Aceptada';
      this.toast.success({ title: fac.numero + ' aceptada',
        description: 'Acuse de recibo enviado al proveedor.', duration: 3_500 });
    } else {
      fac.estado = 'Rechazada';
      this.toast.error({ title: fac.numero + ' rechazada',
        description: 'Se notificó el rechazo al proveedor.', duration: 3_500 });
    }
    this.docs.update(docs => [...docs]);
    this.detalleAbierto.set(false);
  }

  traza(): SiremTimelineItem[] {
    const fac = this.seleccion();
    if (!fac) return [];
    const items: SiremTimelineItem[] = [
      { title: 'Documento recibido', time: fac.fecha, tone: 'neutral' },
    ];
    if (fac.estado !== 'Recibida') {
      items.push({ title: 'Acuse de recibo', time: fac.fecha, tone: 'info' });
    }
    if (fac.estado === 'Aceptada') {
      items.push({ title: 'Aceptación', time: fac.fecha, tone: 'success' });
    } else if (fac.estado === 'Rechazada') {
      items.push({ title: 'Rechazo', time: fac.fecha, tone: 'danger' });
    }
    return items;
  }
}`,
    },
  ];
}
