import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton,
  SiremCard,
  SiremCodeEditor,
  SiremDataTable,
  SiremEmptyState,
  SiremInput, SiremModal,
  SiremPageHeader,
  SiremSearchField,
  SiremSelectOption,
  SiremStatCard,
  SiremTableColumn,
  SiremTimeline,
  SiremTimelineItem,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import {
  DOCUMENTOS_VENTA,
  type ErpDocumentoVenta,
  type ErpEstadoDian,
} from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Estados que la DIAN devuelve en el acuse del XML UBL 2.1. */
const ESTADOS_DIAN: ErpEstadoDian[] = [
  'Borrador',
  'Validada',
  'Transmitida',
  'Aceptada',
  'Rechazada',
];

/**
 * Facturación electrónica: generación y transmisión de facturas, notas
 * crédito y notas débito en XML/UBL 2.1 con validación previa a la DIAN.
 */
@Component({
  selector: 'app-facturacion-electronica-demo-page',
  standalone: true,
  imports: [
    DecimalPipe,
    PageDemoShell,
    SiremButton,
    SiremCard,
    SiremCodeEditor,
    SiremDataTable,
    SiremEmptyState,
    SiremInput, SiremModal,
    SiremPageHeader,
    SiremSearchField,
    SiremStatCard,
    SiremTimeline,
  ],
  template: `
    <app-page-demo-shell label="Facturación electrónica" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header
            title="Facturación electrónica"
            subtitle="Documentos UBL 2.1 · validación previa y transmisión a la DIAN"
          >
            <div slot="actions" class="flex gap-2">
              <sirem-button size="sm" variant="secondary">Importar XML</sirem-button>
              <sirem-button size="sm">Nueva factura</sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Facturado del mes" [value]="facturadoMes()" variant="solid" />
            <sirem-stat-card label="Aceptadas" [value]="porEstado('Aceptada')" color="success" />
            <sirem-stat-card label="Pendientes" [value]="porEstado('Borrador') + porEstado('Validada')" color="warning" />
            <sirem-stat-card label="Rechazadas" [value]="porEstado('Rechazada')" color="danger" [delta]="-12.5" />
          </div>

          <div class="grid gap-3 md:grid-cols-[1fr_12rem_13rem]">
            <sirem-search-field
              placeholder="Buscar por número, cliente o NIT…"
              [(value)]="q"
            />
            <sirem-input-field [strictOptions]="true"
              label="Tipo"
              placeholder="Todos"
              [options]="tipoOptions"
              [(value)]="tipo"
            />
            <sirem-input-field [strictOptions]="true"
              label="Estado DIAN"
              placeholder="Todos"
              [options]="estadoOptions"
              [(value)]="estado"
            />
          </div>

          @if (filtrados().length) {
            <sirem-data-table [columns]="cols" [rows]="filtrados()" (rowClicked)="abrir($event)" />
          } @else {
            <sirem-empty-state
              title="Sin documentos"
              description="Ningún documento coincide con los filtros actuales."
            />
          }

          <sirem-card title="Traza de validación" subtitle="Últimos eventos del documento seleccionado">
            @if (traza().length) {
              <sirem-timeline [items]="traza()" />
            } @else {
              <p class="text-sm text-slate-500">Selecciona una fila para ver su traza DIAN.</p>
            }
          </sirem-card>
        </div>

        <sirem-modal
          [(open)]="detalleAbierto"
          [title]="detalle()?.numero ?? 'Documento'"
          size="lg"
          [actions]="acciones"
          (actionPressed)="accion($event.label)"
        >
          @if (detalle(); as doc) {
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500">Tercero</p>
                <p class="text-sm font-semibold text-slate-900">{{ doc.tercero }}</p>
                <p class="text-xs text-slate-500">NIT {{ doc.nit }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500">Estado DIAN</p>
                <p class="text-sm font-semibold text-slate-900">{{ doc.estadoDian }}</p>
                <p class="text-xs text-slate-500">Cufe: {{ cufe(doc) }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500">Total</p>
                <p class="text-sm font-semibold text-slate-900">{{ doc.total | number: '1.0-0' }} COP</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500">Vencimiento</p>
                <p class="text-sm font-semibold text-slate-900">{{ doc.vence }}</p>
              </div>
            </div>

            <p class="mb-2 mt-5 text-xs uppercase tracking-wide text-slate-500">Vista previa XML</p>
            <sirem-code-editor [code]="xml(doc)" language="html" [readonly]="true" [height]="200" />
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class FacturacionElectronicaDemoPage {
  private readonly toasts = inject(DynamicToastService);

  /** Copia editable de los documentos (la demo muta el estado local). */
  readonly docs = signal<ErpDocumentoVenta[]>(DOCUMENTOS_VENTA.map((d) => ({ ...d })));

  readonly q = signal('');
  readonly tipo = signal<string | number | null>(null);
  readonly estado = signal<string | number | null>(null);

  readonly detalleAbierto = signal(false);
  readonly seleccion = signal<ErpDocumentoVenta | null>(null);

  readonly tipoOptions: SiremSelectOption[] = [
    { value: 'Factura', label: 'Factura de venta' },
    { value: 'Nota crédito', label: 'Nota crédito' },
    { value: 'Nota débito', label: 'Nota débito' },
  ];

  readonly estadoOptions: SiremSelectOption[] = ESTADOS_DIAN.map((e) => ({ value: e, label: e }));

  readonly cols: SiremTableColumn[] = [
    { key: 'numero', label: 'Documento', subKey: 'fecha' },
    { key: 'tercero', label: 'Tercero', subKey: 'nit' },
    { key: 'tipo', label: 'Tipo', kind: 'badge', badgeTones: { Factura: 'info', 'Nota crédito': 'warning', 'Nota débito': 'neutral' } },
    { key: 'total', label: 'Total', kind: 'currency', align: 'right' },
    { key: 'saldo', label: 'Saldo', kind: 'currency', align: 'right' },
    {
      key: 'estadoDian',
      label: 'Estado DIAN',
      kind: 'badge',
      badgeTones: {
        Borrador: 'neutral',
        Validada: 'info',
        Transmitida: 'info',
        Aceptada: 'success',
        Rechazada: 'danger',
      },
    },
  ];

  readonly filtrados = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const tipo = this.tipo();
    const estado = this.estado();
    return this.docs().filter((doc) => {
      const coincide = !texto || `${doc.numero} ${doc.tercero} ${doc.nit}`.toLowerCase().includes(texto);
      return coincide && (!tipo || doc.tipo === tipo) && (!estado || doc.estadoDian === estado);
    });
  });

  readonly facturadoMes = computed(() => {
    const total = this.docs()
      .filter((d) => d.fecha.startsWith('2026-09') && d.tipo === 'Factura')
      .reduce((acc, d) => acc + d.total, 0);
    return total;
  });

  readonly detalle = computed(() => this.seleccion());

  readonly acciones = [
    { label: 'Rechazar', variant: 'secondary' as const },
    { label: 'Transmitir a la DIAN' },
  ];

  porEstado(estado: ErpEstadoDian): number {
    return this.docs().filter((d) => d.estadoDian === estado).length;
  }

  abrir(fila: Record<string, unknown>): void {
    const doc = this.docs().find((d) => d.id === fila['id']);
    if (!doc) return;
    this.seleccion.set(doc);
    this.detalleAbierto.set(true);
  }

  /** Transmite el documento o lo rechaza, con toast de confirmación. */
  accion(label: string): void {
    const doc = this.seleccion();
    if (!doc) return;

    if (label === 'Transmitir a la DIAN') {
      if (doc.estadoDian === 'Borrador') {
        doc.estadoDian = 'Validada';
        this.toasts.info({
          title: `${doc.numero} validada`,
          description: 'Superó las reglas de negocio; lista para transmitir.',
          duration: 3_000,
        });
      } else {
        doc.estadoDian = 'Transmitida';
        this.toasts.success({
          title: `${doc.numero} transmitida`,
          description: 'Enviada al servicio web de la DIAN, esperando acuse.',
          duration: 3_500,
        });
      }
    } else {
      doc.estadoDian = 'Rechazada';
      this.toasts.error({
        title: `${doc.numero} rechazada`,
        description: 'Se marca para corrección antes de volver a enviar.',
        duration: 3_500,
      });
    }

    this.docs.update((docs) => [...docs]);
    this.detalleAbierto.set(false);
  }

  /** Traza simulada de la DIAN según el estado actual del documento. */
  traza(): SiremTimelineItem[] {
    const doc = this.seleccion();
    if (!doc) return [];
    const orden = ESTADOS_DIAN.slice(0, ESTADOS_DIAN.indexOf(doc.estadoDian) + 1);
    const tonos: Record<ErpEstadoDian, SiremTimelineItem['tone']> = {
      Borrador: 'neutral',
      Validada: 'info',
      Transmitida: 'info',
      Aceptada: 'success',
      Rechazada: 'danger',
    };
    return orden.map((estado) => ({
      title: estado,
      description: descripcionEstado(estado),
      time: doc.fecha,
      tone: tonos[estado],
    }));
  }

  /** CUFE simulado derivado del número de documento. */
  cufe(doc: ErpDocumentoVenta): string {
    return `2.48.9${doc.id}45010987654${String(doc.id).padStart(3, '0')}`;
  }

  /** Fragmento de XML UBL 2.1 para la vista previa. */
  xml(doc: ErpDocumentoVenta): string {
    return [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">`,
      `  <CustomizationID>10</CustomizationID>`,
      `  <ID>${doc.numero}</ID>`,
      `  <IssueDate>${doc.fecha}</IssueDate>`,
      `  <InvoiceTypeCode>01</InvoiceTypeCode>`,
      `  <AccountingSupplierParty>…</AccountingSupplierParty>`,
      `  <AccountingCustomerParty>`,
      `    <RegistrationName>${doc.tercero}</RegistrationName>`,
      `    <CompanyID>${doc.nit}</CompanyID>`,
      `  </AccountingCustomerParty>`,
      `  <LegalMonetaryTotal>`,
      `    <PayableAmount currencyID="COP">${doc.total}</PayableAmount>`,
      `  </LegalMonetaryTotal>`,
      `  <cac:UBLVersionID>2.1</cac:UBLVersionID>`,
      `</Invoice>`,
    ].join('\n');
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'facturacion-electronica.html',
      language: 'html',
      code: `<sirem-page-header
  title="Facturación electrónica"
  subtitle="Documentos UBL 2.1 · validación previa y transmisión a la DIAN">
  <div slot="actions" class="flex gap-2">
    <sirem-button size="sm" variant="secondary">Importar XML</sirem-button>
    <sirem-button size="sm">Nueva factura</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Facturado del mes" [value]="facturadoMes()" variant="solid" />
  <sirem-stat-card label="Aceptadas" [value]="porEstado('Aceptada')" color="success" />
  <sirem-stat-card label="Pendientes" [value]="pendientes()" color="warning" />
  <sirem-stat-card label="Rechazadas" [value]="porEstado('Rechazada')" color="danger" [delta]="-12.5" />
</div>

<div class="grid gap-3 md:grid-cols-[1fr_12rem_13rem]">
  <sirem-search-field placeholder="Buscar por número, cliente o NIT…" [(value)]="q" />
  <sirem-input-field [strictOptions]="true" label="Tipo" placeholder="Todos" [options]="tipoOptions" [(value)]="tipo" />
  <sirem-input-field [strictOptions]="true" label="Estado DIAN" placeholder="Todos" [options]="estadoOptions" [(value)]="estado" />
</div>

@if (filtrados().length) {
  <sirem-data-table [columns]="cols" [rows]="filtrados()" (rowClicked)="abrir($event)" />
} @else {
  <sirem-empty-state title="Sin documentos" description="Ningún documento coincide con los filtros." />
}

<sirem-modal [(open)]="detalleAbierto" [title]="detalle()?.numero ?? 'Documento'"
  size="lg" [actions]="acciones" (actionPressed)="accion($event.label)">
  @if (detalle(); as doc) {
    <sirem-code-editor [code]="xml(doc)" language="html" [readonly]="true" />
  }
</sirem-modal>`,
    },
    {
      name: 'facturacion-electronica.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremDataTable,
  SiremModal,
  SiremInput,
  SiremStatCard,
  type ErpDocumentoVenta,
  type ErpEstadoDian,
  type SiremTableColumn,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';

const ESTADOS_DIAN: ErpEstadoDian[] = [
  'Borrador', 'Validada', 'Transmitida', 'Aceptada', 'Rechazada',
];

export class FacturacionElectronicaPage {
  private readonly toasts = inject(DynamicToastService);

  readonly docs = signal<ErpDocumentoVenta[]>(DOCUMENTOS.map(d => ({ ...d })));
  readonly q = signal('');
  readonly tipo = signal<string | number | null>(null);
  readonly estado = signal<string | number | null>(null);
  readonly seleccion = signal<ErpDocumentoVenta | null>(null);
  readonly detalleAbierto = signal(false);

  readonly cols: SiremTableColumn[] = [
    { key: 'numero', label: 'Documento', subKey: 'fecha' },
    { key: 'tercero', label: 'Tercero', subKey: 'nit' },
    { key: 'tipo', label: 'Tipo', kind: 'badge',
      badgeTones: { Factura: 'info', 'Nota crédito': 'warning', 'Nota débito': 'neutral' } },
    { key: 'total', label: 'Total', kind: 'currency', align: 'right' },
    { key: 'estadoDian', label: 'Estado DIAN', kind: 'badge',
      badgeTones: { Borrador: 'neutral', Validada: 'info', Transmitida: 'info',
                    Aceptada: 'success', Rechazada: 'danger' } },
  ];

  readonly filtrados = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const tipo = this.tipo();
    const estado = this.estado();
    return this.docs().filter(doc => {
      const coincide = !texto ||
        (doc.numero + ' ' + doc.tercero + ' ' + doc.nit).toLowerCase().includes(texto);
      return coincide && (!tipo || doc.tipo === tipo) && (!estado || doc.estadoDian === estado);
    });
  });

  abrir(fila: Record<string, unknown>): void {
    const doc = this.docs().find(d => d.id === fila['id']);
    if (!doc) return;
    this.seleccion.set(doc);
    this.detalleAbierto.set(true);
  }

  /** Borrador pasa por validación; el resto se envía al web service. */
  accion(label: string): void {
    const doc = this.seleccion();
    if (!doc) return;

    if (label === 'Transmitir a la DIAN') {
      if (doc.estadoDian === 'Borrador') {
        doc.estadoDian = 'Validada';
        this.toasts.info({ title: doc.numero + ' validada', duration: 3_000 });
      } else {
        doc.estadoDian = 'Transmitida';
        this.toasts.success({ title: doc.numero + ' transmitida', duration: 3_500 });
      }
    } else {
      doc.estadoDian = 'Rechazada';
      this.toasts.error({ title: doc.numero + ' rechazada', duration: 3_500 });
    }

    this.docs.update(docs => [...docs]);
    this.detalleAbierto.set(false);
  }
}`,
    },
  ];
}

/** Texto de apoyo de la traza DIAN. */
function descripcionEstado(estado: ErpEstadoDian): string {
  const textos: Record<ErpEstadoDian, string> = {
    Borrador: 'Generado localmente, aún no validado.',
    Validada: 'Reglas de negocio DIAN superadas.',
    Transmitida: 'Enviado al servicio web, esperando acuse.',
    Aceptada: 'Acuse positivo recibido y archivado.',
    Rechazada: 'Acuse con observaciones: corregir y reenviar.',
  };
  return textos[estado];
}
