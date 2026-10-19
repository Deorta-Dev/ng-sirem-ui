import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton,
  SiremDataTable,
  SiremEmptyState,
  SiremInput, SiremModal,
  SiremPageHeader,
  SiremSearchField,
  SiremSelectOption,
  SiremStatCard,
  SiremTableColumn,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { MOVIMIENTOS_BANCARIOS, type ErpMovimientoBancario } from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Etiqueta de conciliación que se muestra en el badge de estado. */
function etiquetaEstado(m: ErpMovimientoBancario): 'Conciliado' | 'Pendiente' {
  return m.conciliado ? 'Conciliado' : 'Pendiente';
}

/**
 * Conciliación bancaria: importa extractos (Excel/CSV), filtra los
 * movimientos y empareja los seleccionados con comprobantes del
 * sistema (RC-004xx). Los pendientes se cuentan como diferencia.
 */
@Component({
  selector: 'app-conciliacion-bancaria-demo-page',
  standalone: true,
  imports: [
    PageDemoShell,
    SiremButton,
    SiremDataTable,
    SiremEmptyState,
    SiremInput, SiremModal,
    SiremPageHeader,
    SiremSearchField,
    SiremStatCard,
  ],
  template: `
    <app-page-demo-shell label="Conciliación bancaria" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header
            title="Conciliación bancaria"
            subtitle="Importa extractos en Excel/CSV y empareja los movimientos con los comprobantes del sistema"
          >
            <div slot="actions" class="flex flex-wrap gap-2">
              <sirem-button size="sm" variant="secondary" (pressed)="importarExtracto()">
                <i slot="icon" class="fi fi-rr-upload" aria-hidden="true"></i>
                Importar extracto (CSV)
              </sirem-button>
              <sirem-button
                size="sm"
                [disabled]="seleccion().length === 0"
                (pressed)="conciliarSeleccionados()"
              >
                <i slot="icon" class="fi fi-rr-check" aria-hidden="true"></i>
                Conciliar seleccionados
              </sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Movimientos" [value]="total()" variant="tint" color="brand" />
            <sirem-stat-card label="Conciliados" [value]="conciliados()" variant="tint" color="success" />
            <sirem-stat-card label="Pendientes" [value]="pendientes()" variant="tint" color="warning" />
            <sirem-stat-card label="Diferencia" [value]="cop(diferencia())" variant="tint" color="danger" />
          </div>

          <div class="grid gap-3 md:grid-cols-[1fr_13rem]">
            <sirem-search-field
              label="Buscar movimiento"
              placeholder="Descripción o referencia…"
              [(value)]="q"
            />
            <sirem-input-field [strictOptions]="true"
              label="Estado"
              placeholder="Todos"
              [options]="estadoOptions"
              [(value)]="estado"
            />
          </div>

          @if (ultimoExtracto(); as archivo) {
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Último extracto importado:
              <span class="font-semibold text-slate-700 dark:text-slate-300">{{ archivo }}</span>
              · 7 movimientos leídos.
            </p>
          }

          @if (!pendientes()) {
            <sirem-empty-state
              title="Sin pendientes"
              description="Todos los movimientos del extracto ya están emparejados con comprobantes."
            />
          } @else if (filtrados().length) {
            <sirem-data-table
              [columns]="cols"
              [rows]="filtrados()"
              [selectable]="true"
              [(selection)]="seleccion"
              (rowClicked)="abrirDetalle($event)"
            />
          } @else {
            <sirem-empty-state
              title="Sin movimientos"
              description="Ningún movimiento coincide con los filtros actuales."
            />
          }
        </div>

        <sirem-modal
          [(open)]="detalleAbierto"
          [title]="'Movimiento · ' + (detalle()?.referencia ?? '')"
          size="md"
        >
          @if (detalle(); as m) {
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Fecha</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ m.fecha }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Valor operación {{ m.referencia }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Valor</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ cop(m.valor) }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Comprobante: {{ m.comprobante ?? 'Sin emparejar' }}
                </p>
              </div>
              <div class="sm:col-span-2">
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Descripción</p>
                <p class="text-sm text-slate-700 dark:text-slate-300">{{ m.descripcion }}</p>
              </div>
            </div>
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class ConciliacionBancariaDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia editable: conciliar cambia estado y comprobante en memoria. */
  readonly movimientos = signal<ErpMovimientoBancario[]>(
    MOVIMIENTOS_BANCARIOS.map((m) => ({ ...m })),
  );

  readonly q = signal('');
  readonly estado = signal<string | number | null>(null);
  readonly seleccion = signal<unknown[]>([]);
  readonly detalleAbierto = signal(false);
  readonly detalle = signal<ErpMovimientoBancario | null>(null);
  readonly ultimoExtracto = signal<string | null>(null);

  readonly estadoOptions: SiremSelectOption[] = [
    { value: 'Conciliado', label: 'Conciliados' },
    { value: 'Pendiente', label: 'Pendientes' },
  ];

  readonly cols: SiremTableColumn[] = [
    { key: 'fecha', label: 'Fecha', kind: 'date' },
    { key: 'descripcion', label: 'Descripción', subKey: 'referencia' },
    { key: 'valor', label: 'Valor', kind: 'currency', align: 'right' },
    { key: 'comprobante', label: 'Comprobante' },
    {
      key: 'estado',
      label: 'Estado',
      kind: 'badge',
      badgeTones: { Conciliado: 'success', Pendiente: 'warning' },
    },
  ];

  readonly total = computed(() => this.movimientos().length);
  readonly conciliados = computed(() => this.movimientos().filter((m) => m.conciliado).length);
  readonly pendientes = computed(() => this.total() - this.conciliados());

  /** Valor absoluto de los movimientos todavía sin emparejar. */
  readonly diferencia = computed(() =>
    this.movimientos()
      .filter((m) => !m.conciliado)
      .reduce((acc, m) => acc + Math.abs(m.valor), 0),
  );

  /** Movimientos visibles: búsqueda + filtro por estado de conciliación. */
  readonly filtrados = computed<Record<string, unknown>[]>(() => {
    const texto = this.q().trim().toLowerCase();
    const estadoSel = this.estado();
    return this.movimientos()
      .filter((m) => {
        const coincide =
          !texto || (m.descripcion + ' ' + m.referencia).toLowerCase().includes(texto);
        return coincide && (!estadoSel || etiquetaEstado(m) === estadoSel);
      })
      .map((m) => ({ ...m, estado: etiquetaEstado(m) }));
  });

  /** Registra el extracto importado y avisa con toast informativo. */
  importarExtracto(): void {
    this.ultimoExtracto.set('bancolombia_sep.csv');
    this.toast.info({
      title: 'Extracto importado',
      description: '7 movimientos leídos de bancolombia_sep.csv.',
      duration: 4_000,
    });
  }

  abrirDetalle(fila: Record<string, unknown>): void {
    const movimiento = this.movimientos().find((m) => m.id === fila['id']);
    if (!movimiento) return;
    this.detalle.set(movimiento);
    this.detalleAbierto.set(true);
  }

  /** Empareja la selección con recibos RC-004xx y limpia el marcado. */
  conciliarSeleccionados(): void {
    const ids = new Set(this.seleccion().map((v) => Number(v)));
    if (!ids.size) return;

    let folio = this.siguienteFolio();
    let hechos = 0;
    let omitidos = 0;

    const lista = this.movimientos().map((m) => {
      if (!ids.has(m.id)) return m;
      if (m.conciliado) {
        omitidos++;
        return m;
      }
      const comprobante = 'RC-004' + folio;
      folio++;
      hechos++;
      return { ...m, conciliado: true, comprobante };
    });

    this.movimientos.set(lista);
    this.seleccion.set([]);

    if (hechos) {
      this.toast.success({
        title: hechos + ' movimientos conciliados',
        description: 'Emparejados con comprobantes del sistema.',
        duration: 4_000,
      });
    } else {
      this.toast.info({
        title: 'Sin movimientos nuevos',
        description: 'Todos los seleccionados ya estaban conciliados.',
        duration: 4_000,
      });
    }

    if (omitidos) {
      this.toast.info({
        title: omitidos + ' movimientos omitidos',
        description: 'Ya tenían comprobante, se conservaron tal cual.',
        duration: 4_000,
      });
    }
  }

  /** Próximo folio de recibo de caja a partir de los RC ya usados. */
  private siguienteFolio(): number {
    const folios = this.movimientos()
      .map((m) => Number((m.comprobante ?? '').replace('RC-004', '')))
      .filter((n) => Number.isFinite(n) && n > 0);
    return folios.length ? Math.max(...folios) + 1 : 1;
  }

  /** Formato COP con separador de miles. */
  cop(valor: number): string {
    return '$' + String(Math.round(valor)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'conciliacion-bancaria.html',
      language: 'html',
      code: `<sirem-page-header
  title="Conciliación bancaria"
  subtitle="Importa extractos en Excel/CSV y empareja los movimientos con los comprobantes del sistema">
  <div slot="actions" class="flex flex-wrap gap-2">
    <sirem-button size="sm" variant="secondary" (pressed)="importarExtracto()">Importar extracto (CSV)</sirem-button>
    <sirem-button size="sm" [disabled]="seleccion().length === 0" (pressed)="conciliarSeleccionados()">
      Conciliar seleccionados
    </sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Movimientos" [value]="total()" variant="tint" color="brand" />
  <sirem-stat-card label="Conciliados" [value]="conciliados()" variant="tint" color="success" />
  <sirem-stat-card label="Pendientes" [value]="pendientes()" variant="tint" color="warning" />
  <sirem-stat-card label="Diferencia" [value]="cop(diferencia())" variant="tint" color="danger" />
</div>

<div class="grid gap-3 md:grid-cols-[1fr_13rem]">
  <sirem-search-field label="Buscar movimiento" placeholder="Descripción o referencia…" [(value)]="q" />
  <sirem-input-field [strictOptions]="true" label="Estado" placeholder="Todos" [options]="estadoOptions" [(value)]="estado" />
</div>

@if (ultimoExtracto(); as archivo) {
  <p class="text-xs text-slate-500 dark:text-slate-400">Último extracto importado: {{ archivo }}</p>
}

@if (!pendientes()) {
  <sirem-empty-state title="Sin pendientes"
    description="Todos los movimientos del extracto ya están emparejados con comprobantes." />
} @else if (filtrados().length) {
  <sirem-data-table [columns]="cols" [rows]="filtrados()" [selectable]="true"
    [(selection)]="seleccion" (rowClicked)="abrirDetalle($event)" />
} @else {
  <sirem-empty-state title="Sin movimientos" description="Ningún movimiento coincide con los filtros." />
}

<sirem-modal [(open)]="detalleAbierto" [title]="'Movimiento · ' + (detalle()?.referencia ?? '')" size="md">
  @if (detalle(); as m) {
    <p class="text-sm font-semibold">{{ m.descripcion }}</p>
    <p class="text-sm text-slate-500">{{ m.fecha }} · {{ cop(m.valor) }}</p>
    <p class="text-sm text-slate-500">Comprobante: {{ m.comprobante ?? 'Sin emparejar' }}</p>
  }
</sirem-modal>`,
    },
    {
      name: 'conciliacion-bancaria.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import { SiremDataTable, SiremModal, SiremInput, SiremTableColumn } from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { MOVIMIENTOS_BANCARIOS, type ErpMovimientoBancario } from '../../data/erp-mock';

function etiquetaEstado(m: ErpMovimientoBancario): 'Conciliado' | 'Pendiente' {
  return m.conciliado ? 'Conciliado' : 'Pendiente';
}

export class ConciliacionBancariaPage {
  private readonly toast = inject(DynamicToastService);

  readonly movimientos = signal<ErpMovimientoBancario[]>(MOVIMIENTOS_BANCARIOS.map(m => ({ ...m })));
  readonly q = signal('');
  readonly estado = signal<string | number | null>(null);
  readonly seleccion = signal<unknown[]>([]);
  readonly detalleAbierto = signal(false);
  readonly detalle = signal<ErpMovimientoBancario | null>(null);
  readonly ultimoExtracto = signal<string | null>(null);

  readonly cols: SiremTableColumn[] = [
    { key: 'fecha', label: 'Fecha', kind: 'date' },
    { key: 'descripcion', label: 'Descripción', subKey: 'referencia' },
    { key: 'valor', label: 'Valor', kind: 'currency', align: 'right' },
    { key: 'comprobante', label: 'Comprobante' },
    { key: 'estado', label: 'Estado', kind: 'badge',
      badgeTones: { Conciliado: 'success', Pendiente: 'warning' } },
  ];

  readonly total = computed(() => this.movimientos().length);
  readonly conciliados = computed(() => this.movimientos().filter(m => m.conciliado).length);
  readonly pendientes = computed(() => this.total() - this.conciliados());
  readonly diferencia = computed(() =>
    this.movimientos().filter(m => !m.conciliado).reduce((acc, m) => acc + Math.abs(m.valor), 0));

  readonly filtrados = computed<Record<string, unknown>[]>(() => {
    const texto = this.q().trim().toLowerCase();
    const estadoSel = this.estado();
    return this.movimientos()
      .filter(m => {
        const coincide = !texto || (m.descripcion + ' ' + m.referencia).toLowerCase().includes(texto);
        return coincide && (!estadoSel || etiquetaEstado(m) === estadoSel);
      })
      .map(m => ({ ...m, estado: etiquetaEstado(m) }));
  });

  importarExtracto(): void {
    this.ultimoExtracto.set('bancolombia_sep.csv');
    this.toast.info({
      title: 'Extracto importado',
      description: '7 movimientos leídos de bancolombia_sep.csv.',
      duration: 4_000,
    });
  }

  abrirDetalle(fila: Record<string, unknown>): void {
    const movimiento = this.movimientos().find(m => m.id === fila['id']);
    if (!movimiento) return;
    this.detalle.set(movimiento);
    this.detalleAbierto.set(true);
  }

  /** Empareja la selección con recibos RC-004xx y limpia el marcado. */
  conciliarSeleccionados(): void {
    const ids = new Set(this.seleccion().map(v => Number(v)));
    if (!ids.size) return;
    let folio = this.siguienteFolio();
    let hechos = 0;
    let omitidos = 0;
    const lista = this.movimientos().map(m => {
      if (!ids.has(m.id)) return m;
      if (m.conciliado) { omitidos++; return m; }
      const comprobante = 'RC-004' + folio;
      folio++;
      hechos++;
      return { ...m, conciliado: true, comprobante };
    });
    this.movimientos.set(lista);
    this.seleccion.set([]);
    if (hechos) {
      this.toast.success({ title: hechos + ' movimientos conciliados',
        description: 'Emparejados con comprobantes del sistema.', duration: 4_000 });
    }
    if (omitidos) {
      this.toast.info({ title: omitidos + ' movimientos omitidos',
        description: 'Ya tenían comprobante, se conservaron tal cual.', duration: 4_000 });
    }
  }

  private siguienteFolio(): number {
    const folios = this.movimientos()
      .map(m => Number((m.comprobante ?? '').replace('RC-004', '')))
      .filter(n => Number.isFinite(n) && n > 0);
    return folios.length ? Math.max(...folios) + 1 : 1;
  }
}`,
    },
  ];
}
