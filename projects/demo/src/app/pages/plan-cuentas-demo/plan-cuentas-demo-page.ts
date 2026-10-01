import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton,
  SiremDataTable,
  SiremEmptyState,
  SiremInput,
  SiremModal,
  SiremPageHeader,
  SiremSearchField,
  SiremSelect,
  SiremSelectOption,
  SiremStatCard,
  SiremTableColumn,
  SiremTimeline,
  SiremTimelineItem,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { CUENTAS_PUC, type ErpCuentaPuc, type ErpTipoCuentaPuc } from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Tipos del PUC disponibles en el filtro y en el formulario. */
const TIPOS: ErpTipoCuentaPuc[] = ['Activo', 'Pasivo', 'Patrimonio', 'Ingreso', 'Gasto'];

/** Plan Único de Cuentas: catálogo contable jerárquico y personalizable. */
@Component({
  selector: 'app-plan-cuentas-demo-page',
  standalone: true,
  imports: [
    PageDemoShell, SiremButton, SiremDataTable, SiremEmptyState, SiremInput, SiremModal,
    SiremPageHeader, SiremSearchField, SiremSelect, SiremStatCard, SiremTimeline,
  ],
  template: `
    <app-page-demo-shell label="Plan Único de Cuentas" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header title="Plan Único de Cuentas" subtitle="Catálogo PUC jerárquico, personalizable y preconfigurado">
            <div slot="actions" class="flex gap-2">
              <sirem-button size="sm" variant="secondary" (pressed)="importarPuc()">Importar PUC</sirem-button>
              <sirem-button size="sm" (pressed)="nuevaAbierta.set(true)">Nueva cuenta</sirem-button>
            </div>
          </sirem-page-header>

          <div class="grid gap-3 sm:grid-cols-3">
            <sirem-stat-card label="Cuentas configuradas" [value]="cuentas().length" />
            <sirem-stat-card label="Cuentas de movimiento" [value]="enMovimiento()" color="info" />
            <sirem-stat-card label="Grupos (nivel 1)" [value]="grupos()" color="success" />
          </div>

          <div class="grid gap-3 md:grid-cols-[1fr_13rem]">
            <sirem-search-field placeholder="Buscar por código o nombre…" [(value)]="q" />
            <sirem-select-field label="Tipo de cuenta" placeholder="Todos" [options]="tipoOptions" [(value)]="tipo" />
          </div>

          @if (filtradas().length) {
            <sirem-data-table [columns]="cols" [rows]="filtradas()" (rowClicked)="abrir($event)" />
          } @else {
            <sirem-empty-state title="Sin cuentas" description="Ninguna cuenta del plan coincide con los filtros actuales." />
          }
        </div>

        <sirem-modal [(open)]="detalleAbierto" [title]="detalleTitulo()" [actions]="accionesDetalle" (actionPressed)="detalleAbierto.set(false)">
          @if (detalle(); as cuenta) {
            <dl class="grid gap-3 sm:grid-cols-2">
              <div><dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Código</dt><dd class="font-mono text-sm font-semibold text-slate-900 dark:text-white">{{ cuenta.codigo }}</dd></div>
              <div><dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Nombre</dt><dd class="text-sm font-semibold text-slate-900 dark:text-white">{{ cuenta.nombre }}</dd></div>
              <div><dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Nivel / tipo</dt><dd class="text-sm font-semibold text-slate-900 dark:text-white">Nivel {{ cuenta.nivel }} · {{ cuenta.tipo }}</dd></div>
              <div><dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Naturaleza</dt><dd class="text-sm font-semibold text-slate-900 dark:text-white">{{ cuenta.naturaleza }} · {{ cuenta.movimiento ? 'Movimiento' : 'Saldo' }}</dd></div>
            </dl>
            <p class="mb-2 mt-5 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Historial de movimientos</p>
            <sirem-timeline [items]="historial()" />
          }
        </sirem-modal>

        <sirem-modal [(open)]="nuevaAbierta" title="Nueva cuenta" [actions]="accionesNueva" (actionPressed)="accionNueva($event.label)">
          <div class="grid gap-3 sm:grid-cols-2">
            <sirem-input-field label="Código" placeholder="1105-10" [(value)]="nuevoCodigo" />
            <sirem-input-field label="Nombre" placeholder="Bancos locales" [(value)]="nuevoNombre" />
            <sirem-select-field label="Tipo" placeholder="Seleccionar…" [options]="tipoOptions" [(value)]="nuevoTipo" />
            <sirem-select-field label="Naturaleza" placeholder="Seleccionar…" [options]="naturalezaOptions" [(value)]="nuevaNaturaleza" />
          </div>
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class PlanCuentasDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia editable del plan (la demo agrega cuentas sin tocar el mock). */
  readonly cuentas = signal<ErpCuentaPuc[]>(CUENTAS_PUC.map((c) => ({ ...c })));
  readonly q = signal('');
  readonly tipo = signal<string | number | null>(null);
  readonly detalleAbierto = signal(false);
  readonly nuevaAbierta = signal(false);
  readonly seleccion = signal<ErpCuentaPuc | null>(null);
  readonly nuevoCodigo = signal('');
  readonly nuevoNombre = signal('');
  readonly nuevoTipo = signal<string | number | null>(null);
  readonly nuevaNaturaleza = signal<string | number | null>(null);

  readonly tipoOptions: SiremSelectOption[] = TIPOS.map((t) => ({ value: t, label: t }));
  readonly naturalezaOptions: SiremSelectOption[] = [
    { value: 'Débito', label: 'Débito' },
    { value: 'Crédito', label: 'Crédito' },
  ];

  readonly cols: SiremTableColumn[] = [
    { key: 'codigo', label: 'Código', subKey: 'nombre' },
    { key: 'nivel', label: 'Nivel', kind: 'badge', align: 'center', badgeTones: { '1': 'info', '2': 'info', '3': 'neutral' } },
    { key: 'tipo', label: 'Tipo', kind: 'badge', badgeTones: { Activo: 'info', Pasivo: 'warning', Patrimonio: 'neutral', Ingreso: 'success', Gasto: 'danger' } },
    { key: 'naturaleza', label: 'Naturaleza', kind: 'badge', badgeTones: { Débito: 'info', Crédito: 'warning' } },
    { key: 'movimiento', label: 'Movimiento', kind: 'badge', badgeTones: { Sí: 'success', No: 'neutral' } },
  ];

  /** Filas tipadas para la tabla: el booleano de movimiento pasa a texto. */
  readonly filtradas = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const tipo = this.tipo();
    return this.cuentas()
      .filter((c) => {
        const coincide = !texto || (c.codigo + ' ' + c.nombre).toLowerCase().includes(texto);
        return coincide && (!tipo || c.tipo === tipo);
      })
      .map((c) => ({
        id: c.id, codigo: c.codigo, nombre: c.nombre, nivel: c.nivel,
        tipo: c.tipo, naturaleza: c.naturaleza, movimiento: c.movimiento ? 'Sí' : 'No',
      }));
  });

  readonly enMovimiento = computed(() => this.cuentas().filter((c) => c.movimiento).length);
  readonly grupos = computed(() => this.cuentas().filter((c) => c.nivel === 1).length);
  readonly detalle = computed(() => this.seleccion());
  readonly detalleTitulo = computed(() => {
    const c = this.seleccion();
    return c ? 'Cuenta ' + c.codigo : 'Detalle de cuenta';
  });

  readonly accionesDetalle = [{ label: 'Cerrar', variant: 'secondary' as const }];
  readonly accionesNueva = [{ label: 'Cancelar', variant: 'secondary' as const }, { label: 'Guardar' }];

  abrir(fila: Record<string, unknown>): void {
    const cuenta = this.cuentas().find((c) => c.id === fila['id']);
    if (!cuenta) return;
    this.seleccion.set(cuenta);
    this.detalleAbierto.set(true);
  }

  /** Historial simulado de la cuenta seleccionada. */
  historial(): SiremTimelineItem[] {
    const c = this.seleccion();
    if (!c) return [];
    return [
      { title: 'Apertura del periodo', description: 'Saldo inicial de enero cargado en ' + c.nombre + '.', time: '2026-01-01', tone: 'success' },
      { title: 'Asiento CE-00841', description: 'Movimiento de facturación registrado sobre la cuenta.', time: '2026-09-28', tone: 'info' },
      { title: 'Ajuste por depreciación', description: 'Reclasificación mensual aplicada en el libro mayor.', time: '2026-09-30', tone: 'info' },
      { title: 'Balance de prueba', description: 'La cuenta queda incluida en el informe de septiembre.', time: '2026-09-30', tone: 'neutral' },
    ];
  }

  /** Importa el sector oficial del PUC con toast informativo. */
  importarPuc(): void {
    this.toast.info({
      title: 'Importando PUC DIAN…',
      description: 'Cargando el catálogo oficial de cuentas del sector.',
      duration: 3_000,
    });
  }

  accionNueva(label: string): void {
    if (label === 'Cancelar') {
      this.nuevaAbierta.set(false);
      return;
    }
    this.guardar();
  }

  /** Valida y agrega la cuenta al plan con confirmación. */
  guardar(): void {
    const codigo = this.nuevoCodigo().trim();
    const nombre = this.nuevoNombre().trim();
    if (!codigo || !nombre) {
      this.toast.error({
        title: 'Faltan datos',
        description: 'El código y el nombre de la cuenta son obligatorios.',
        duration: 3_000,
      });
      return;
    }

    const crudo = this.nuevoTipo();
    const tipo: ErpTipoCuentaPuc = TIPOS.includes(crudo as ErpTipoCuentaPuc) ? (crudo as ErpTipoCuentaPuc) : 'Activo';
    const naturaleza = this.nuevaNaturaleza() === 'Crédito' ? 'Crédito' : 'Débito';
    const id = Math.max(0, ...this.cuentas().map((c) => c.id)) + 1;

    this.cuentas.update((list) => [...list, { id, codigo, nombre, nivel: 3, tipo, naturaleza, movimiento: true }]);
    this.nuevoCodigo.set('');
    this.nuevoNombre.set('');
    this.nuevoTipo.set(null);
    this.nuevaNaturaleza.set(null);
    this.nuevaAbierta.set(false);
    this.toast.success({
      title: 'Cuenta ' + codigo + ' creada',
      description: 'Disponible en el plan de cuentas.',
      duration: 3_500,
    });
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'plan-cuentas.html',
      language: 'html',
      code: `<sirem-page-header title="Plan Único de Cuentas"
  subtitle="Catálogo PUC jerárquico, personalizable y preconfigurado">
  <div slot="actions" class="flex gap-2">
    <sirem-button size="sm" variant="secondary" (pressed)="importarPuc()">Importar PUC</sirem-button>
    <sirem-button size="sm" (pressed)="nuevaAbierta.set(true)">Nueva cuenta</sirem-button>
  </div>
</sirem-page-header>

<div class="grid gap-3 sm:grid-cols-3">
  <sirem-stat-card label="Cuentas configuradas" [value]="cuentas().length" />
  <sirem-stat-card label="Cuentas de movimiento" [value]="enMovimiento()" color="info" />
  <sirem-stat-card label="Grupos (nivel 1)" [value]="grupos()" color="success" />
</div>

<div class="grid gap-3 md:grid-cols-[1fr_13rem]">
  <sirem-search-field placeholder="Buscar por código o nombre…" [(value)]="q" />
  <sirem-select-field label="Tipo de cuenta" placeholder="Todos" [options]="tipoOptions" [(value)]="tipo" />
</div>

@if (filtradas().length) {
  <sirem-data-table [columns]="cols" [rows]="filtradas()" (rowClicked)="abrir($event)" />
} @else {
  <sirem-empty-state title="Sin cuentas" description="Ninguna cuenta coincide con los filtros." />
}

<sirem-modal [(open)]="nuevaAbierta" title="Nueva cuenta"
  [actions]="accionesNueva" (actionPressed)="accionNueva($event.label)">
  <div class="grid gap-3 sm:grid-cols-2">
    <sirem-input-field label="Código" placeholder="1105-10" [(value)]="nuevoCodigo" />
    <sirem-input-field label="Nombre" placeholder="Bancos locales" [(value)]="nuevoNombre" />
    <sirem-select-field label="Tipo" [options]="tipoOptions" [(value)]="nuevoTipo" />
    <sirem-select-field label="Naturaleza" [options]="naturalezaOptions" [(value)]="nuevaNaturaleza" />
  </div>
</sirem-modal>`,
    },
    {
      name: 'plan-cuentas.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import { SiremDataTable, SiremModal, SiremSelect, SiremStatCard, type SiremTableColumn } from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { CUENTAS_PUC, type ErpCuentaPuc, type ErpTipoCuentaPuc } from '../../data/erp-mock';

const TIPOS: ErpTipoCuentaPuc[] = ['Activo', 'Pasivo', 'Patrimonio', 'Ingreso', 'Gasto'];

export class PlanCuentasPage {
  private readonly toast = inject(DynamicToastService);

  readonly cuentas = signal<ErpCuentaPuc[]>(CUENTAS_PUC.map(c => ({ ...c })));
  readonly q = signal('');
  readonly tipo = signal<string | number | null>(null);
  readonly seleccion = signal<ErpCuentaPuc | null>(null);
  readonly detalleAbierto = signal(false);

  readonly cols: SiremTableColumn[] = [
    { key: 'codigo', label: 'Codigo', subKey: 'nombre' },
    { key: 'nivel', label: 'Nivel', kind: 'badge', align: 'center',
      badgeTones: { '1': 'info', '2': 'info', '3': 'neutral' } },
    { key: 'tipo', label: 'Tipo', kind: 'badge',
      badgeTones: { Activo: 'info', Pasivo: 'warning', Patrimonio: 'neutral',
                    Ingreso: 'success', Gasto: 'danger' } },
    { key: 'movimiento', label: 'Movimiento', kind: 'badge',
      badgeTones: { Si: 'success', No: 'neutral' } },
  ];

  readonly filtradas = computed(() => {
    const texto = this.q().trim().toLowerCase();
    const tipo = this.tipo();
    return this.cuentas()
      .filter(c => {
        const ok = !texto || (c.codigo + ' ' + c.nombre).toLowerCase().includes(texto);
        return ok && (!tipo || c.tipo === tipo);
      })
      .map(c => ({ ...c, movimiento: c.movimiento ? 'Si' : 'No' }));
  });

  abrir(fila: Record<string, unknown>): void {
    const cuenta = this.cuentas().find(c => c.id === fila['id']);
    if (!cuenta) return;
    this.seleccion.set(cuenta);
    this.detalleAbierto.set(true);
  }

  guardar(codigo: string, nombre: string, tipo: ErpTipoCuentaPuc): void {
    const id = Math.max(0, ...this.cuentas().map(c => c.id)) + 1;
    this.cuentas.update(list => [
      ...list,
      { id, codigo, nombre, nivel: 3, tipo, naturaleza: 'Débito', movimiento: true },
    ]);
    this.toast.success({
      title: 'Cuenta ' + codigo + ' creada',
      description: 'Disponible en el plan de cuentas.',
      duration: 3_500,
    });
  }
}`,
    },
  ];
}
