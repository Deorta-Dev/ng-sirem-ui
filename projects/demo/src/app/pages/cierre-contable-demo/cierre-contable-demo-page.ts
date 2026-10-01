import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremBadge, SiremButton, SiremConfirmDialog, SiremDataTable, SiremEmptyState, SiremModal,
  SiremModalAction, SiremMoneyPipe, SiremPageHeader, SiremSelect, SiremSelectOption,
  SiremStatCard, SiremTableColumn, SiremTimeline, SiremTimelineItem,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { PERIODOS, type ErpEstadoPeriodo, type ErpPeriodo } from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Estados filtrables de un periodo contable. */
const ESTADOS: ErpEstadoPeriodo[] = ['Abierto', 'En cierre', 'Cerrado'];

/** Cierre contable: bloqueo de periodos y asiento de cierre anual. */
@Component({
  selector: 'app-cierre-contable-demo-page',
  standalone: true,
  imports: [
    PageDemoShell, SiremBadge, SiremButton, SiremConfirmDialog, SiremDataTable, SiremEmptyState,
    SiremModal, SiremPageHeader, SiremMoneyPipe, SiremSelect, SiremStatCard, SiremTimeline,
  ],
  template: `
    <app-page-demo-shell label="Cierre contable" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header title="Cierre contable" subtitle="Bloqueo de periodos fiscales y asiento de cierre de resultados">
            <div slot="actions" class="flex gap-2">
              <sirem-button size="sm" variant="secondary" (pressed)="cierreAnual()">Cierre anual</sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Periodos cerrados" [value]="cerrados()" color="success" />
            <sirem-stat-card label="Periodo abierto" [value]="periodoAbierto()" />
            <sirem-stat-card label="Utilidad del ejercicio" [value]="utilidadEjercicio() | siremMoney" variant="tint" />
            <sirem-stat-card label="Asientos de cierre" [value]="asientosCierre()" color="info" />
          </div>

          <div class="grid gap-3 md:grid-cols-[13rem_1fr]">
            <sirem-select-field label="Estado del periodo" placeholder="Todos" [options]="estadoOptions" [(value)]="estado" />
            <p class="self-end text-xs text-slate-500 dark:text-slate-400">
              Un periodo cerrado queda en solo lectura: sus asientos no admiten movimientos.
            </p>
          </div>

          @if (filas().length) {
            <sirem-data-table [columns]="cols" [rows]="filas()" (rowClicked)="abrir($event)" />
          } @else {
            <sirem-empty-state title="Sin periodos" description="Ningún periodo coincide con el filtro seleccionado." />
          }
        </div>

        <sirem-modal [(open)]="detalleAbierto" [title]="detalleTitulo()" [actions]="acciones()" (actionPressed)="accion($event.label)">
          @if (detalle(); as periodo) {
            <dl class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Ingresos</dt><dd class="text-sm font-semibold text-slate-900 dark:text-white">{{ periodo.ingresos | siremMoney }}</dd></div>
              <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Gastos</dt><dd class="text-sm font-semibold text-slate-900 dark:text-white">{{ periodo.gastos | siremMoney }}</dd></div>
              <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Resultado</dt><dd class="text-sm font-semibold text-slate-900 dark:text-white">{{ periodo.ingresos - periodo.gastos | siremMoney }}</dd></div>
            </dl>

            <div class="mt-4 flex items-center justify-between gap-3">
              <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Pasos del cierre</p>
              @if (periodo.estado === 'Cerrado') {
                <sirem-badge tone="neutral">Solo lectura</sirem-badge>
              }
            </div>
            <sirem-timeline [items]="pasosCierre()" />
          }
        </sirem-modal>

        <sirem-confirm-dialog
          [(open)]="confirmarAbierto"
          title="Cerrar periodo"
          message="Se bloquearán los asientos del periodo y no se podrán realizar más movimientos."
          detail="Se generará el asiento de cierre de resultados CE-00850."
          confirmLabel="Cerrar periodo"
          cancelLabel="Cancelar"
          variant="danger"
          (confirmed)="confirmarCierre()"
        />
      </main>
    </app-page-demo-shell>
  `,
})
export class CierreContableDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia editable de los periodos (cerrar cambia el estado local). */
  readonly periodos = signal<ErpPeriodo[]>(PERIODOS.map((p) => ({ ...p })));
  readonly estado = signal<string | number | null>(null);
  readonly detalleAbierto = signal(false);
  readonly confirmarAbierto = signal(false);
  readonly seleccion = signal<ErpPeriodo | null>(null);
  readonly asientosCierre = signal(3);

  readonly estadoOptions: SiremSelectOption[] = ESTADOS.map((e) => ({ value: e, label: e }));

  readonly cols: SiremTableColumn[] = [
    { key: 'label', label: 'Periodo' },
    { key: 'estado', label: 'Estado', kind: 'badge', badgeTones: { Abierto: 'success', 'En cierre': 'warning', Cerrado: 'neutral' } },
    { key: 'asientos', label: 'Asientos', kind: 'number', align: 'right' },
    { key: 'ingresos', label: 'Ingresos', kind: 'currency', align: 'right' },
    { key: 'gastos', label: 'Gastos', kind: 'currency', align: 'right' },
  ];

  readonly filas = computed(() => {
    const estado = this.estado();
    return this.periodos()
      .filter((p) => !estado || p.estado === estado)
      .map((p) => ({
        id: p.id, label: p.label, estado: p.estado,
        asientos: p.asientos, ingresos: p.ingresos, gastos: p.gastos,
      }));
  });

  readonly cerrados = computed(() => this.periodos().filter((p) => p.estado === 'Cerrado').length);
  readonly periodoAbierto = computed(() => this.periodos().find((p) => p.estado === 'Abierto')?.label ?? 'Ninguno');
  readonly utilidadEjercicio = computed(() => this.periodos().reduce((total, p) => total + p.ingresos - p.gastos, 0));

  readonly detalle = computed(() => this.seleccion());
  readonly detalleTitulo = computed(() => {
    const p = this.seleccion();
    return p ? 'Cierre de ' + p.label : 'Cierre de periodo';
  });

  readonly acciones = computed<SiremModalAction[]>(() => [
    { label: 'Ver detalle', variant: 'secondary' },
    { label: 'Cerrar periodo', disabled: this.seleccion()?.estado === 'Cerrado' },
  ]);

  abrir(fila: Record<string, unknown>): void {
    const periodo = this.periodos().find((p) => p.id === fila['id']);
    if (!periodo) return;
    this.seleccion.set(periodo);
    this.detalleAbierto.set(true);
  }

  /** Pasos del cierre recorridos según el estado del periodo. */
  pasosCierre(): SiremTimelineItem[] {
    const p = this.seleccion();
    if (!p) return [];
    const pasos: SiremTimelineItem[] = [
      { title: 'Validación de saldos', description: 'Saldos de cierre conciliados con el libro mayor.', time: p.label, tone: 'success' },
      { title: 'Asientos de ajuste', description: 'Depreciaciones y provisiones del periodo aplicadas.', time: p.label, tone: 'success' },
      { title: 'Asiento de cierre de resultados', description: 'Ingresos y gastos trasladados a resultados.', time: p.label, tone: 'info' },
      { title: 'Bloqueo del periodo', description: 'El periodo queda en solo lectura.', time: p.label, tone: 'info' },
    ];
    const avance = p.estado === 'Cerrado' ? 4 : p.estado === 'En cierre' ? 3 : 1;
    return pasos.slice(0, avance);
  }

  accion(label: string): void {
    const periodo = this.seleccion();
    if (!periodo) return;

    if (label === 'Ver detalle') {
      this.toast.info({ title: 'Mayor de ' + periodo.label, description: 'Abriendo el libro mayor del periodo seleccionado.', duration: 3_000 });
      return;
    }
    if (periodo.estado === 'Cerrado') return;
    this.confirmarAbierto.set(true);
  }

  /** Cierra el periodo, incrementa los cierres y confirma con toast. */
  confirmarCierre(): void {
    const periodo = this.seleccion();
    if (!periodo || periodo.estado === 'Cerrado') return;

    this.periodos.update((lista) => lista.map((p): ErpPeriodo => (p.id === periodo.id ? { ...p, estado: 'Cerrado' } : p)));
    this.seleccion.set({ ...periodo, estado: 'Cerrado' });
    this.asientosCierre.update((n) => n + 1);
    this.toast.success({
      title: periodo.label + ' cerrado',
      description: 'Periodo bloqueado · asiento de cierre CE-00850 generado.',
      duration: 4_000,
    });
  }

  /** Cierra el ejercicio anterior con toast de confirmación. */
  cierreAnual(): void {
    this.toast.success({
      title: 'Resultados de 2025 cerrados',
      description: 'Asiento de cierre anual generado y periodo bloqueado.',
      duration: 4_500,
    });
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'cierre-contable.html',
      language: 'html',
      code: `<sirem-page-header title="Cierre contable"
  subtitle="Bloqueo de periodos fiscales y asiento de cierre de resultados">
  <div slot="actions" class="flex gap-2">
    <sirem-button size="sm" variant="secondary" (pressed)="cierreAnual()">Cierre anual</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Periodos cerrados" [value]="cerrados()" color="success" />
  <sirem-stat-card label="Periodo abierto" [value]="periodoAbierto()" />
  <sirem-stat-card label="Utilidad del ejercicio" [value]="utilidadEjercicio() | siremMoney" variant="tint" />
  <sirem-stat-card label="Asientos de cierre" [value]="asientosCierre()" color="info" />
</div>

<div class="grid gap-3 md:grid-cols-[13rem_1fr]">
  <sirem-select-field label="Estado del periodo" placeholder="Todos"
    [options]="estadoOptions" [(value)]="estado" />
</div>

<sirem-data-table [columns]="cols" [rows]="filas()" (rowClicked)="abrir($event)" />

<sirem-modal [(open)]="detalleAbierto" [title]="detalleTitulo()"
  [actions]="acciones" (actionPressed)="accion($event.label)">
  @if (detalle(); as periodo) {
    <p>Ingresos {{ periodo.ingresos | siremMoney }}</p>
    <p>Gastos {{ periodo.gastos | siremMoney }}</p>
    @if (periodo.estado === 'Cerrado') {
      <sirem-badge tone="neutral">Solo lectura</sirem-badge>
    }
    <sirem-timeline [items]="pasosCierre()" />
  }
</sirem-modal>

<sirem-confirm-dialog [(open)]="confirmarAbierto" title="Cerrar periodo"
  message="Se bloquearán los asientos del periodo y no se podrán realizar más movimientos."
  detail="Se generará el asiento de cierre de resultados CE-00850."
  confirmLabel="Cerrar periodo" variant="danger" (confirmed)="confirmarCierre()" />`,
    },
    {
      name: 'cierre-contable.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import { SiremConfirmDialog, SiremDataTable, SiremModal, SiremMoneyPipe, SiremStatCard, SiremTimeline,
  type SiremModalAction, type SiremTableColumn } from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { PERIODOS, type ErpPeriodo } from '../../data/erp-mock';

export class CierreContablePage {
  private readonly toast = inject(DynamicToastService);

  readonly periodos = signal<ErpPeriodo[]>(PERIODOS.map(p => ({ ...p })));
  readonly seleccion = signal<ErpPeriodo | null>(null);
  readonly confirmarAbierto = signal(false);
  readonly asientosCierre = signal(3);

  readonly cols: SiremTableColumn[] = [
    { key: 'label', label: 'Periodo' },
    { key: 'estado', label: 'Estado', kind: 'badge',
      badgeTones: { Abierto: 'success', 'En cierre': 'warning', Cerrado: 'neutral' } },
    { key: 'asientos', label: 'Asientos', kind: 'number', align: 'right' },
    { key: 'ingresos', label: 'Ingresos', kind: 'currency', align: 'right' },
    { key: 'gastos', label: 'Gastos', kind: 'currency', align: 'right' },
  ];

  readonly cerrados = computed(() => this.periodos().filter(p => p.estado === 'Cerrado').length);

  readonly acciones = computed<SiremModalAction[]>(() => [
    { label: 'Ver detalle', variant: 'secondary' },
    { label: 'Cerrar periodo', disabled: this.seleccion()?.estado === 'Cerrado' },
  ]);

  /** Bloquea el periodo y confirma con toast. */
  confirmarCierre(): void {
    const p = this.seleccion();
    if (!p || p.estado === 'Cerrado') return;

    this.periodos.update(lista =>
      lista.map((x): ErpPeriodo => (x.id === p.id ? { ...x, estado: 'Cerrado' } : x)),
    );
    this.seleccion.set({ ...p, estado: 'Cerrado' });
    this.asientosCierre.update(n => n + 1);
    this.toast.success({
      title: p.label + ' cerrado',
      description: 'Periodo bloqueado · asiento de cierre CE-00850 generado.',
      duration: 4_000,
    });
  }
}`,
    },
  ];
}
