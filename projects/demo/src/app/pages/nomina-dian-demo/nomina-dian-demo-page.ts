import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton, SiremDataTable, SiremEmptyState, SiremInput, SiremModal, SiremPageHeader,
  SiremSearchField, SiremSelectOption, SiremStatCard, SiremTableColumn,
  SiremTimeline, SiremTimelineItem,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import {
  DOCUMENTOS_NOMINA,
  type ErpDocumentoNomina,
  type ErpEstadoNominaDian,
} from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Estados del Documento Soporte de Pago de Nómina Electrónica. */
const ESTADOS: ErpEstadoNominaDian[] = [
  'Borrador', 'Validada', 'Transmitida', 'Aceptada', 'Rechazada',
];

/** Pasos completos de la traza según el estado del documento. */
const PASOS_POR_ESTADO: Record<ErpEstadoNominaDian, number> = {
  Borrador: 0, Validada: 1, Transmitida: 2, Aceptada: 4, Rechazada: 4,
};

const PASOS = ['Validación de reglas', 'Transmisión', 'Acuse', 'Respuesta'];

/**
 * Nómina electrónica DIAN: Documento Soporte de Pago de Nómina
 * Electrónica y notas de ajuste, con traza de validación y acuse.
 */
@Component({
  selector: 'app-nomina-dian-demo-page',
  standalone: true,
  imports: [
    PageDemoShell, SiremButton, SiremDataTable, SiremEmptyState, SiremInput, SiremModal,
    SiremPageHeader, SiremSearchField, SiremStatCard, SiremTimeline,
  ],
  template: `
    <app-page-demo-shell label="Nómina electrónica DIAN" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header title="Nómina electrónica DIAN" subtitle="Documento Soporte de Pago de Nómina Electrónica y notas de ajuste">
            <div slot="actions" class="flex gap-2">
              <sirem-button size="sm" variant="secondary" (pressed)="validarLote()">Validar lote</sirem-button>
              <sirem-button size="sm" (pressed)="transmitirLote()">Transmitir lote</sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Documentos" [value]="docs().length" />
            <sirem-stat-card label="Transmitidos" [value]="porEstado('Transmitida')" color="info" />
            <sirem-stat-card label="Aceptados" [value]="porEstado('Aceptada')" color="success" />
            <sirem-stat-card label="Pendientes" [value]="porEstado('Borrador') + porEstado('Validada')" color="warning" />
          </div>

          <div class="grid gap-3 md:grid-cols-[1fr_13rem]">
            <sirem-search-field placeholder="Buscar por número o periodo…" [(value)]="q" />
            <sirem-input-field [strictOptions]="true" label="Estado" placeholder="Todos" [options]="estadoOptions" [(value)]="estado" />
          </div>

          @if (filtrados().length) {
            <sirem-data-table [columns]="cols" [rows]="filtrados()" (rowClicked)="abrir($event)" />
          } @else {
            <sirem-empty-state title="Sin documentos" description="Ningún documento coincide con los filtros actuales." />
          }
        </div>

        <sirem-modal [(open)]="detalleAbierto" [title]="detalle()?.numero ?? 'Documento'"
          size="lg" [actions]="acciones" (actionPressed)="accion($event.label)">
          @if (detalle(); as doc) {
            <div class="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Periodo</p>
                <p class="font-semibold text-slate-900 dark:text-slate-100">{{ doc.periodo }} · {{ doc.fecha }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Empleados</p>
                <p class="font-semibold text-slate-900 dark:text-slate-100">{{ doc.empleados }} · {{ doc.estado }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Total nómina</p>
                <p class="font-semibold text-slate-900 dark:text-slate-100">{{ cop(doc.total) }}</p>
              </div>
            </div>

            <p class="mb-2 mt-5 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Traza DIAN</p>
            <sirem-timeline [items]="traza()" />
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class NominaDianDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia editable: la demo muta el estado local de los documentos. */
  readonly docs = signal<ErpDocumentoNomina[]>(DOCUMENTOS_NOMINA.map((d) => ({ ...d })));

  readonly q = signal('');
  readonly estado = signal<string | number | null>(null);

  readonly detalleAbierto = signal(false);
  readonly seleccion = signal<ErpDocumentoNomina | null>(null);
  readonly detalle = computed(() => this.seleccion());

  readonly estadoOptions: SiremSelectOption[] = ESTADOS.map((e) => ({ value: e, label: e }));

  readonly cols: SiremTableColumn[] = [
    { key: 'numero', label: 'Documento' },
    { key: 'periodo', label: 'Periodo', subKey: 'fecha' },
    { key: 'empleados', label: 'Empleados', kind: 'number', align: 'right' },
    { key: 'total', label: 'Total', kind: 'currency', align: 'right' },
    { key: 'estado', label: 'Estado', kind: 'badge',
      badgeTones: { Borrador: 'neutral', Validada: 'info', Transmitida: 'info', Aceptada: 'success', Rechazada: 'danger' } },
  ];

  readonly acciones = [
    { label: 'Rechazar', variant: 'secondary' as const },
    { label: 'Transmitir a la DIAN' },
  ];

  readonly filtrados = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const estado = this.estado();
    return this.docs().filter((d) => {
      const coincide = !texto || (d.numero + ' ' + d.periodo).toLowerCase().includes(texto);
      return coincide && (!estado || d.estado === estado);
    });
  });

  porEstado(estado: ErpEstadoNominaDian): number {
    return this.docs().filter((d) => d.estado === estado).length;
  }

  cop(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(valor);
  }

  abrir(fila: Record<string, unknown>): void {
    const doc = this.docs().find((d) => d.id === fila['id']);
    if (!doc) return;
    this.seleccion.set(doc);
    this.detalleAbierto.set(true);
  }

  /** Traza simulada: validación → transmisión → acuse → respuesta. */
  traza(): SiremTimelineItem[] {
    const doc = this.seleccion();
    if (!doc) return [];
    const hechos = PASOS_POR_ESTADO[doc.estado];
    const tonoFinal = doc.estado === 'Rechazada' ? 'danger' : 'success';
    const textos = [
      'Reglas de negocio de la DIAN superadas.',
      'Enviado al servicio web de nómina electrónica.',
      'Acuse recibido y archivado junto al XML.',
      doc.estado === 'Rechazada'
        ? 'Acuse con observaciones: corregir y reenviar.'
        : 'Respuesta de la DIAN archivada.',
    ];
    return PASOS.map((titulo, i) => ({
      title: titulo,
      description: i < hechos ? textos[i] : 'Pendiente.',
      time: i < hechos ? doc.fecha : undefined,
      tone: i < hechos ? (i === hechos - 1 ? tonoFinal : 'success') : 'neutral',
    }));
  }

  /** Rechaza, valida o transmite el documento seleccionado. */
  accion(label: string): void {
    const doc = this.seleccion();
    this.detalleAbierto.set(false);
    if (!doc) return;

    if (label === 'Rechazar') {
      doc.estado = 'Rechazada';
      this.toast.error({ title: doc.numero + ' rechazada', description: 'Se marca para corrección.', duration: 3_500 });
    } else if (doc.estado === 'Borrador') {
      doc.estado = 'Validada';
      this.toast.info({ title: doc.numero + ' validada', description: 'Superó las reglas de negocio.', duration: 3_000 });
    } else {
      doc.estado = 'Transmitida';
      this.toast.success({ title: doc.numero + ' transmitida', description: 'Enviada al web service, esperando acuse.', duration: 3_500 });
    }
    this.docs.update((docs) => [...docs]);
  }

  validarLote(): void {
    this.toast.info({
      title: 'Lote validado',
      description: this.porEstado('Borrador') + ' documento(s) en borrador superaron las reglas.',
      duration: 3_500,
    });
  }

  /** Transmite el lote pendiente y simula el acuse 900 ms después. */
  transmitirLote(): void {
    const aEnviar = this.docs().filter((d) => d.estado === 'Borrador' || d.estado === 'Validada');
    const enviadas = new Set([
      ...aEnviar,
      ...this.docs().filter((d) => d.estado === 'Transmitida'),
    ].map((d) => d.id));

    this.docs.update((docs) =>
      docs.map((d) =>
        aEnviar.some((x) => x.id === d.id) ? { ...d, estado: 'Transmitida' as const } : d,
      ),
    );
    this.toast.success({
      title: 'Lote transmitido',
      description: enviadas.size + ' documentos enviados al servicio de nómina electrónica.',
      duration: 4_000,
    });

    setTimeout(() => {
      this.docs.update((docs) =>
        docs.map((d) =>
          enviadas.has(d.id) && d.estado === 'Transmitida'
            ? { ...d, estado: 'Aceptada' as const }
            : d,
        ),
      );
    }, 900);
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'nomina-dian.html',
      language: 'html',
      code: `<sirem-page-header title="Nómina electrónica DIAN"
  subtitle="Documento Soporte de Pago de Nómina Electrónica y notas de ajuste">
  <div slot="actions" class="flex gap-2">
    <sirem-button size="sm" variant="secondary" (pressed)="validarLote()">Validar lote</sirem-button>
    <sirem-button size="sm" (pressed)="transmitirLote()">Transmitir lote</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Documentos" [value]="docs().length" />
  <sirem-stat-card label="Transmitidos" [value]="porEstado('Transmitida')" color="info" />
  <sirem-stat-card label="Aceptados" [value]="porEstado('Aceptada')" color="success" />
  <sirem-stat-card label="Pendientes" [value]="porEstado('Borrador') + porEstado('Validada')" color="warning" />
</div>

<div class="grid gap-3 md:grid-cols-[1fr_13rem]">
  <sirem-search-field placeholder="Buscar por número o periodo…" [(value)]="q" />
  <sirem-input-field [strictOptions]="true" label="Estado" placeholder="Todos" [options]="estadoOptions" [(value)]="estado" />
</div>

@if (filtrados().length) {
  <sirem-data-table [columns]="cols" [rows]="filtrados()" (rowClicked)="abrir($event)" />
} @else {
  <sirem-empty-state title="Sin documentos" description="Ningún documento coincide con los filtros." />
}

<sirem-modal [(open)]="detalleAbierto" [title]="detalle()?.numero ?? 'Documento'"
  size="lg" [actions]="acciones" (actionPressed)="accion($event.label)">
  @if (detalle(); as doc) {
    <p class="text-sm font-semibold">{{ doc.periodo }} · {{ doc.empleados }} empleados</p>
    <p class="text-xs text-slate-500 dark:text-slate-400">Estado: {{ doc.estado }} · {{ cop(doc.total) }}</p>
    <p class="mb-2 mt-4 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Traza DIAN</p>
    <sirem-timeline [items]="traza()" />
  }
</sirem-modal>`,
    },
    {
      name: 'nomina-dian.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremDataTable, SiremEmptyState, SiremModal, SiremInput, SiremSelectOption,
  SiremStatCard, SiremTableColumn, SiremTimeline, SiremTimelineItem,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import {
  DOCUMENTOS_NOMINA, type ErpDocumentoNomina, type ErpEstadoNominaDian,
} from '../../data/erp-mock';

const ESTADOS: ErpEstadoNominaDian[] = [
  'Borrador', 'Validada', 'Transmitida', 'Aceptada', 'Rechazada',
];
const PASOS_POR_ESTADO: Record<ErpEstadoNominaDian, number> = {
  Borrador: 0, Validada: 1, Transmitida: 2, Aceptada: 4, Rechazada: 4,
};
const PASOS = ['Validación de reglas', 'Transmisión', 'Acuse', 'Respuesta'];

export class NominaDianPage {
  private readonly toast = inject(DynamicToastService);

  readonly docs = signal<ErpDocumentoNomina[]>(DOCUMENTOS_NOMINA.map(d => ({ ...d })));
  readonly q = signal('');
  readonly estado = signal<string | number | null>(null);
  readonly seleccion = signal<ErpDocumentoNomina | null>(null);
  readonly detalleAbierto = signal(false);
  readonly detalle = computed(() => this.seleccion());

  readonly estadoOptions: SiremSelectOption[] = ESTADOS.map(e => ({ value: e, label: e }));

  readonly cols: SiremTableColumn[] = [
    { key: 'numero', label: 'Documento' },
    { key: 'periodo', label: 'Periodo', subKey: 'fecha' },
    { key: 'empleados', label: 'Empleados', kind: 'number', align: 'right' },
    { key: 'total', label: 'Total', kind: 'currency', align: 'right' },
    { key: 'estado', label: 'Estado', kind: 'badge',
      badgeTones: { Borrador: 'neutral', Validada: 'info', Transmitida: 'info',
                    Aceptada: 'success', Rechazada: 'danger' } },
  ];

  readonly acciones = [
    { label: 'Rechazar', variant: 'secondary' as const },
    { label: 'Transmitir a la DIAN' },
  ];

  readonly filtrados = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const estado = this.estado();
    return this.docs().filter(d => {
      const coincide = !texto || (d.numero + ' ' + d.periodo).toLowerCase().includes(texto);
      return coincide && (!estado || d.estado === estado);
    });
  });

  porEstado(estado: ErpEstadoNominaDian): number {
    return this.docs().filter(d => d.estado === estado).length;
  }

  cop(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(valor);
  }

  abrir(fila: Record<string, unknown>): void {
    const doc = this.docs().find(d => d.id === fila['id']);
    if (!doc) return;
    this.seleccion.set(doc);
    this.detalleAbierto.set(true);
  }

  traza(): SiremTimelineItem[] {
    const doc = this.seleccion();
    if (!doc) return [];
    const hechos = PASOS_POR_ESTADO[doc.estado];
    const tonoFinal = doc.estado === 'Rechazada' ? 'danger' : 'success';
    const textos = [
      'Reglas de negocio de la DIAN superadas.',
      'Enviado al servicio web de nómina electrónica.',
      'Acuse recibido y archivado junto al XML.',
      doc.estado === 'Rechazada'
        ? 'Acuse con observaciones: corregir y reenviar.'
        : 'Respuesta de la DIAN archivada.',
    ];
    return PASOS.map((titulo, i) => ({
      title: titulo,
      description: i < hechos ? textos[i] : 'Pendiente.',
      time: i < hechos ? doc.fecha : undefined,
      tone: i < hechos ? (i === hechos - 1 ? tonoFinal : 'success') : 'neutral',
    }));
  }

  /** Rechaza, valida o transmite el documento seleccionado. */
  accion(label: string): void {
    const doc = this.seleccion();
    this.detalleAbierto.set(false);
    if (!doc) return;

    if (label === 'Rechazar') {
      doc.estado = 'Rechazada';
      this.toast.error({ title: doc.numero + ' rechazada', duration: 3_500 });
    } else if (doc.estado === 'Borrador') {
      doc.estado = 'Validada';
      this.toast.info({ title: doc.numero + ' validada', duration: 3_000 });
    } else {
      doc.estado = 'Transmitida';
      this.toast.success({ title: doc.numero + ' transmitida', duration: 3_500 });
    }
    this.docs.update(docs => [...docs]);
  }

  validarLote(): void {
    this.toast.info({
      title: 'Lote validado',
      description: this.porEstado('Borrador') + ' documento(s) en borrador superaron las reglas.',
      duration: 3_500,
    });
  }

  /** Transmite el lote pendiente y simula el acuse 900 ms después. */
  transmitirLote(): void {
    const aEnviar = this.docs().filter(d => d.estado === 'Borrador' || d.estado === 'Validada');
    const enviadas = new Set([
      ...aEnviar,
      ...this.docs().filter(d => d.estado === 'Transmitida'),
    ].map(d => d.id));

    this.docs.update(docs => docs.map(d =>
      aEnviar.some(x => x.id === d.id) ? { ...d, estado: 'Transmitida' as const } : d,
    ));
    this.toast.success({
      title: 'Lote transmitido',
      description: enviadas.size + ' documentos enviados al servicio de nómina electrónica.',
      duration: 4_000,
    });

    setTimeout(() => {
      this.docs.update(docs => docs.map(d =>
        enviadas.has(d.id) && d.estado === 'Transmitida'
          ? { ...d, estado: 'Aceptada' as const }
          : d,
      ));
    }, 900);
  }
}`,
    },
  ];
}
