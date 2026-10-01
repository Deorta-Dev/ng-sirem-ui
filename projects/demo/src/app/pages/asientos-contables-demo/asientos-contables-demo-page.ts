import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremBadge, SiremButton, SiremDataTable, SiremEmptyState, SiremModal, SiremModalAction,
  SiremPageHeader, SiremSearchField, SiremSelect, SiremSelectOption, SiremStatCard, SiremTableColumn,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { ASIENTOS, type ErpAsiento, totalesAsiento } from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Origen de generación del comprobante de diario. */
const ORIGENES: ErpAsiento['origen'][] = ['Ventas', 'Compras', 'Tesorería', 'Manual'];

/** Estados contables del comprobante. */
const ESTADOS: ErpAsiento['estado'][] = ['Borrador', 'Publicado'];

/** Asientos contables: comprobantes de diario con cuadre DEBE = HABER. */
@Component({
  selector: 'app-asientos-contables-demo-page',
  standalone: true,
  imports: [
    DecimalPipe, PageDemoShell, SiremBadge, SiremButton, SiremDataTable, SiremEmptyState,
    SiremModal, SiremPageHeader, SiremSearchField, SiremSelect, SiremStatCard,
  ],
  template: `
    <app-page-demo-shell label="Asientos contables" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header title="Asientos contables" subtitle="Comprobantes de diario automáticos y manuales con cuadre DEBE = HABER">
            <div slot="actions" class="flex gap-2">
              <sirem-button size="sm" variant="secondary" (pressed)="asientoManual()">Asiento manual</sirem-button>
              <sirem-button size="sm" (pressed)="nuevoAsiento()">Nuevo asiento</sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Asientos del periodo" [value]="asientos().length" />
            <sirem-stat-card label="Total debe" [value]="totalDebe()" color="info" />
            <sirem-stat-card label="Total haber" [value]="totalHaber()" color="success" />
            <sirem-stat-card label="En borrador" [value]="enBorrador()" color="warning" />
          </div>

          <div class="grid gap-3 md:grid-cols-[1fr_11rem_11rem]">
            <sirem-search-field placeholder="Buscar por número o concepto…" [(value)]="q" />
            <sirem-select-field label="Origen" placeholder="Todos" [options]="origenOptions" [(value)]="origen" />
            <sirem-select-field label="Estado" placeholder="Todos" [options]="estadoOptions" [(value)]="estado" />
          </div>

          @if (filtrados().length) {
            <sirem-data-table [columns]="cols" [rows]="filtrados()" (rowClicked)="abrir($event)" />
          } @else {
            <sirem-empty-state title="Sin asientos" description="Ningún comprobante coincide con los filtros actuales." />
          }
        </div>

        <sirem-modal [(open)]="detalleAbierto" [title]="detalleTitulo()" size="lg" [actions]="acciones()" (actionPressed)="accion($event.label)">
          @if (detalle(); as asiento) {
            <dl class="grid gap-3 sm:grid-cols-3">
              <div><dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Concepto</dt><dd class="text-sm font-semibold text-slate-900 dark:text-white">{{ asiento.concepto }}</dd></div>
              <div><dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Fecha</dt><dd class="text-sm font-semibold text-slate-900 dark:text-white">{{ asiento.fecha }}</dd></div>
              <div><dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Origen</dt><dd class="text-sm font-semibold text-slate-900 dark:text-white">{{ asiento.origen }}</dd></div>
            </dl>

            <p class="mb-2 mt-5 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Líneas del comprobante</p>
            <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <th class="px-3 py-2 text-left font-medium">Cuenta</th>
                    <th class="px-3 py-2 text-left font-medium">Nombre</th>
                    <th class="px-3 py-2 text-right font-medium">Debe</th>
                    <th class="px-3 py-2 text-right font-medium">Haber</th>
                  </tr>
                </thead>
                <tbody>
                  @for (linea of asiento.lineas; track $index) {
                    <tr class="border-t border-slate-100 dark:border-slate-800">
                      <td class="px-3 py-2 font-mono text-xs">{{ linea.cuenta }}</td>
                      <td class="px-3 py-2 text-slate-700 dark:text-slate-300">{{ linea.nombre }}</td>
                      <td class="px-3 py-2 text-right">{{ linea.debe | number: '1.0-0' }}</td>
                      <td class="px-3 py-2 text-right">{{ linea.haber | number: '1.0-0' }}</td>
                    </tr>
                  }
                </tbody>
                <tfoot>
                  <tr class="border-t border-slate-200 font-semibold dark:border-slate-700 dark:text-white">
                    <td class="px-3 py-2" colspan="2">Totales</td>
                    <td class="px-3 py-2 text-right">{{ totales().debe | number: '1.0-0' }}</td>
                    <td class="px-3 py-2 text-right">{{ totales().haber | number: '1.0-0' }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="mt-3 flex flex-wrap items-center gap-3">
              <sirem-badge [tone]="totales().cuadrado ? 'success' : 'danger'">{{ totales().cuadrado ? 'Cuadrado' : 'Descuadrado' }}</sirem-badge>
              <span class="text-xs text-slate-500 dark:text-slate-400">DEBE {{ totales().debe | number: '1.0-0' }} = HABER {{ totales().haber | number: '1.0-0' }} COP</span>
            </div>
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class AsientosContablesDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia editable de los asientos (publicar cambia el estado local). */
  readonly asientos = signal<ErpAsiento[]>(ASIENTOS.map((a) => ({ ...a })));
  readonly q = signal('');
  readonly origen = signal<string | number | null>(null);
  readonly estado = signal<string | number | null>(null);
  readonly detalleAbierto = signal(false);
  readonly seleccion = signal<ErpAsiento | null>(null);

  readonly origenOptions: SiremSelectOption[] = ORIGENES.map((o) => ({ value: o, label: o }));
  readonly estadoOptions: SiremSelectOption[] = ESTADOS.map((e) => ({ value: e, label: e }));

  readonly cols: SiremTableColumn[] = [
    { key: 'numero', label: 'Comprobante', subKey: 'fecha' },
    { key: 'concepto', label: 'Concepto' },
    { key: 'origen', label: 'Origen', kind: 'badge', badgeTones: { Ventas: 'info', Compras: 'warning', 'Tesorería': 'neutral', Manual: 'neutral' } },
    { key: 'estado', label: 'Estado', kind: 'badge', badgeTones: { Borrador: 'warning', Publicado: 'success' } },
    { key: 'total', label: 'Total haber', kind: 'currency', align: 'right' },
  ];

  /** Filas con el haber total calculado con la helper del mock. */
  readonly filtrados = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const origen = this.origen();
    const estado = this.estado();
    return this.asientos()
      .filter((a) => {
        const coincide = !texto || (a.numero + ' ' + a.concepto).toLowerCase().includes(texto);
        return coincide && (!origen || a.origen === origen) && (!estado || a.estado === estado);
      })
      .map((a) => ({
        id: a.id, numero: a.numero, fecha: a.fecha, concepto: a.concepto,
        origen: a.origen, estado: a.estado, total: totalesAsiento(a.lineas).haber,
      }));
  });

  readonly totalDebe = computed(() => this.asientos().reduce((acc, a) => acc + totalesAsiento(a.lineas).debe, 0));
  readonly totalHaber = computed(() => this.asientos().reduce((acc, a) => acc + totalesAsiento(a.lineas).haber, 0));
  readonly enBorrador = computed(() => this.asientos().filter((a) => a.estado === 'Borrador').length);

  readonly detalle = computed(() => this.seleccion());
  readonly detalleTitulo = computed(() => {
    const a = this.seleccion();
    return a ? a.numero + ' · ' + a.concepto : 'Comprobante de diario';
  });
  readonly totales = computed(() => totalesAsiento(this.seleccion()?.lineas ?? []));

  /** Cerrar / publicar según cuadre y estado real del comprobante. */
  readonly acciones = computed<SiremModalAction[]>(() => {
    const a = this.seleccion();
    const cuadrado = totalesAsiento(a?.lineas ?? []).cuadrado;
    return [
      { label: 'Cerrar', variant: 'secondary' },
      { label: 'Publicar', disabled: !a || !cuadrado || a.estado === 'Publicado' },
    ];
  });

  abrir(fila: Record<string, unknown>): void {
    const asiento = this.asientos().find((a) => a.id === fila['id']);
    if (!asiento) return;
    this.seleccion.set(asiento);
    this.detalleAbierto.set(true);
  }

  accion(label: string): void {
    if (label === 'Cerrar') {
      this.detalleAbierto.set(false);
      return;
    }
    this.publicar();
  }

  /** Publica el comprobante si cuadra; si no, avisa con toast de error. */
  private publicar(): void {
    const asiento = this.seleccion();
    if (!asiento) return;

    if (!totalesAsiento(asiento.lineas).cuadrado) {
      this.toast.error({ title: 'Asiento descuadrado', description: 'El debe no coincide con el haber.', duration: 4_000 });
      return;
    }
    if (asiento.estado === 'Publicado') return;

    this.asientos.update((list) => list.map((a) => (a.id === asiento.id ? { ...a, estado: 'Publicado' } : a)));
    this.seleccion.set({ ...asiento, estado: 'Publicado' });
    this.detalleAbierto.set(false);
    this.toast.success({ title: asiento.numero + ' publicado', description: 'Impactado en libro mayor.', duration: 3_500 });
  }

  /** Cabecera: avisos informativos de los flujos de generación. */
  asientoManual(): void {
    this.toast.info({ title: 'Asiento manual en borrador', description: 'Se abrirá un comprobante con líneas en cero.', duration: 3_000 });
  }

  nuevoAsiento(): void {
    this.toast.info({ title: 'Generación automática activa', description: 'Ventas, compras y tesorería crean sus comprobantes solos.', duration: 3_000 });
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'asientos-contables.html',
      language: 'html',
      code: `<sirem-page-header title="Asientos contables"
  subtitle="Comprobantes de diario automáticos y manuales con cuadre DEBE = HABER">
  <div slot="actions" class="flex gap-2">
    <sirem-button size="sm" variant="secondary" (pressed)="asientoManual()">Asiento manual</sirem-button>
    <sirem-button size="sm" (pressed)="nuevoAsiento()">Nuevo asiento</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Asientos del periodo" [value]="asientos().length" />
  <sirem-stat-card label="Total debe" [value]="totalDebe()" color="info" />
  <sirem-stat-card label="Total haber" [value]="totalHaber()" color="success" />
  <sirem-stat-card label="En borrador" [value]="enBorrador()" color="warning" />
</div>

<div class="grid gap-3 md:grid-cols-[1fr_11rem_11rem]">
  <sirem-search-field placeholder="Buscar por número o concepto…" [(value)]="q" />
  <sirem-select-field label="Origen" placeholder="Todos" [options]="origenOptions" [(value)]="origen" />
  <sirem-select-field label="Estado" placeholder="Todos" [options]="estadoOptions" [(value)]="estado" />
</div>

@if (filtrados().length) {
  <sirem-data-table [columns]="cols" [rows]="filtrados()" (rowClicked)="abrir($event)" />
} @else {
  <sirem-empty-state title="Sin asientos" description="Ningún comprobante coincide con los filtros." />
}

<sirem-modal [(open)]="detalleAbierto" [title]="detalleTitulo()" size="lg"
  [actions]="acciones" (actionPressed)="accion($event.label)">
  @if (detalle(); as asiento) {
    <table class="w-full text-sm">
      <thead>
        <tr><th>Cuenta</th><th>Nombre</th><th class="text-right">Debe</th><th class="text-right">Haber</th></tr>
      </thead>
      <tbody>
        @for (linea of asiento.lineas; track $index) {
          <tr>
            <td>{{ linea.cuenta }}</td>
            <td>{{ linea.nombre }}</td>
            <td class="text-right">{{ linea.debe | number: '1.0-0' }}</td>
            <td class="text-right">{{ linea.haber | number: '1.0-0' }}</td>
          </tr>
        }
      </tbody>
    </table>
    <sirem-badge [tone]="totales().cuadrado ? 'success' : 'danger'">
      {{ totales().cuadrado ? 'Cuadrado' : 'Descuadrado' }}
    </sirem-badge>
  }
</sirem-modal>`,
    },
    {
      name: 'asientos-contables.component.ts',
      language: 'typescript',
      code: `import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { SiremBadge, SiremDataTable, SiremModal, SiremStatCard, type SiremModalAction, type SiremTableColumn } from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { ASIENTOS, type ErpAsiento, totalesAsiento } from '../../data/erp-mock';

export class AsientosContablesPage {
  private readonly toast = inject(DynamicToastService);

  readonly asientos = signal<ErpAsiento[]>(ASIENTOS.map(a => ({ ...a })));
  readonly q = signal('');
  readonly seleccion = signal<ErpAsiento | null>(null);
  readonly detalleAbierto = signal(false);

  readonly cols: SiremTableColumn[] = [
    { key: 'numero', label: 'Comprobante', subKey: 'fecha' },
    { key: 'concepto', label: 'Concepto' },
    { key: 'origen', label: 'Origen', kind: 'badge',
      badgeTones: { Ventas: 'info', Compras: 'warning', 'Tesorería': 'neutral', Manual: 'neutral' } },
    { key: 'estado', label: 'Estado', kind: 'badge',
      badgeTones: { Borrador: 'warning', Publicado: 'success' } },
    { key: 'total', label: 'Total haber', kind: 'currency', align: 'right' },
  ];

  readonly filtrados = computed(() =>
    this.asientos().map(a => ({ ...a, total: totalesAsiento(a.lineas).haber })),
  );

  readonly totales = computed(() => totalesAsiento(this.seleccion()?.lineas ?? []));

  readonly acciones = computed<SiremModalAction[]>(() => {
    const a = this.seleccion();
    const cuadrado = totalesAsiento(a?.lineas ?? []).cuadrado;
    return [
      { label: 'Cerrar', variant: 'secondary' },
      { label: 'Publicar', disabled: !a || !cuadrado || a.estado === 'Publicado' },
    ];
  });

  /** Publica si cuadra; si no, toast de error. */
  publicar(): void {
    const a = this.seleccion();
    if (!a) return;
    if (!totalesAsiento(a.lineas).cuadrado) {
      this.toast.error({ title: 'Asiento descuadrado', description: 'El debe no coincide con el haber.', duration: 4_000 });
      return;
    }
    this.asientos.update(list =>
      list.map(x => (x.id === a.id ? { ...x, estado: 'Publicado' } : x)),
    );
    this.toast.success({ title: a.numero + ' publicado', description: 'Impactado en libro mayor.', duration: 3_500 });
  }
}`,
    },
  ];
}
