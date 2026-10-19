import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremButton, SiremCardList, SiremCardListField, SiremEmptyState, SiremFieldGroup,
  SiremInput, SiremModal, type SiremModalAction, SiremPageHeader, SiremSearchField, type SiremSelectOption, SiremStatCard, SiremTimeline, type SiremTimelineItem,
  type SiremBadgeTone,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import {
  ALERTAS_SALUD, EMPRESAS_CLIENTES, type ErpEmpresa, type ErpSeveridad,
} from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/** Tono de la línea de tiempo según la severidad de la alerta. */
const tonoSeveridad = (sev: ErpSeveridad): 'danger' | 'warning' | 'info' =>
  sev === 'Alta' ? 'danger' : sev === 'Media' ? 'warning' : 'info';

/**
 * Portafolio de clientes de la firma contable: salud contable por
 * empresa, cartera vencida y salto al entorno de cada cliente.
 */
@Component({
  selector: 'app-portafolio-clientes-demo-page',
  standalone: true,
  imports: [
    PageDemoShell, SiremButton, SiremCardList, SiremEmptyState, SiremFieldGroup,
    SiremInput, SiremModal, SiremPageHeader, SiremSearchField, SiremStatCard,
    SiremTimeline,
  ],
  template: `
    <app-page-demo-shell label="Portafolio de clientes" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header title="Portafolio de clientes"
            subtitle="Salud contable, cartera vencida y alertas de cada empresa de la firma" />

          @if (ultimoAcceso(); as acceso) {
            <div role="status" class="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:text-emerald-200">
              <span>{{ acceso }}</span>
              <sirem-button size="sm" variant="secondary" (pressed)="ocultarAcceso()">Ocultar</sirem-button>
            </div>
          }

          <div class="grid gap-3 md:grid-cols-[1fr_12rem]">
            <sirem-search-field label="Buscar cliente" placeholder="Por nombre, NIT o contador…" [(value)]="q" />
            <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Salud" [options]="saludOptions" [(value)]="saludSel" />
          </div>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <sirem-stat-card label="Cartera vencida" [value]="cop(cartera())" />
            <sirem-stat-card label="Clientes sanos" [value]="sanos()" variant="tint" color="success" />
            <sirem-stat-card label="En atención" [value]="atencion()" variant="tint" color="warning" />
            <sirem-stat-card label="Críticos" [value]="critica()" variant="tint" color="danger" />
          </div>

          @if (filas().length) {
            <sirem-card-list
              [items]="filas()"
              titleKey="nombre"
              subtitleKey="nit"
              badgeKey="salud"
              [badgeTones]="tonos"
              [fields]="campos"
              (itemPressed)="abrir($event)"
            />
          } @else {
            <sirem-empty-state title="Sin clientes"
              description="Ninguna empresa coincide con la búsqueda o el filtro de salud." />
          }
        </div>

        <sirem-modal [(open)]="metricasAbierta" [title]="metricasTitulo()" size="lg"
          [actions]="acciones" (actionPressed)="accion($event.label)">
          @if (seleccionado(); as emp) {
            <sirem-field-group title="Indicadores" [description]="emp.nit + ' · ' + emp.sector">
              <div class="col-span-12 sm:col-span-6 flex justify-between text-sm">
                <span>Facturas vencidas</span><span class="font-semibold">{{ cop(emp.vencidas) }}</span>
              </div>
              <div class="col-span-12 sm:col-span-6 flex justify-between text-sm">
                <span>Descuadres bancarios</span><span class="font-semibold">{{ emp.descuadres }}</span>
              </div>
              <div class="col-span-12 sm:col-span-6 flex justify-between text-sm">
                <span>Pendientes DIAN</span><span class="font-semibold">{{ emp.pendientesDian }}</span>
              </div>
              <div class="col-span-12 sm:col-span-6 flex justify-between text-sm">
                <span>Cuentas por pagar</span><span class="font-semibold">{{ cop(emp.porPagar) }}</span>
              </div>
            </sirem-field-group>
            <p class="mb-2 mt-5 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Alertas de salud
            </p>
            <sirem-timeline [items]="alertasEmpresa()" />
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class PortafolioClientesDemoPage {
  private readonly toast = inject(DynamicToastService);

  readonly q = signal('');
  readonly saludSel = signal<string | number | null>('Todas');
  readonly metricasAbierta = signal(false);
  readonly seleccionado = signal<ErpEmpresa | null>(null);
  /** Banner con el último entorno al que se entró desde la demo. */
  readonly ultimoAcceso = signal<string | null>(null);

  readonly saludOptions: SiremSelectOption[] = ['Todas', 'Sana', 'Atención', 'Crítica']
    .map((v) => ({ value: v, label: v }));

  readonly tonos: Record<string, SiremBadgeTone> = {
    Sana: 'success',
    'Atención': 'warning',
    Crítica: 'danger',
  };

  readonly campos: SiremCardListField[] = [
    { key: 'sector', label: 'Sector' },
    { key: 'contador', label: 'Contador', icon: 'fi fi-rr-user' },
    { key: 'vencidasFmt', label: 'Vencidas', icon: 'fi fi-rr-wallet' },
  ];

  readonly acciones: SiremModalAction[] = [
    { label: 'Cerrar', variant: 'secondary' },
    { label: 'Entrar al entorno', variant: 'primary' },
  ];

  /** Clientes que pasan el filtro de búsqueda (nombre, NIT o contador) y de salud. */
  readonly filtradas = computed<ErpEmpresa[]>(() => {
    const texto = this.q().trim().toLowerCase();
    const salud = this.saludSel();
    return EMPRESAS_CLIENTES.filter((e) => {
      const coincide = !texto || (e.nombre + ' ' + e.nit + ' ' + e.contador).toLowerCase().includes(texto);
      return coincide && (!salud || salud === 'Todas' || e.salud === salud);
    });
  });

  /** Filas de la tarjetas con la cartera formateada para mostrar. */
  readonly filas = computed(() =>
    this.filtradas().map((e) => ({
      id: e.id,
      nombre: e.nombre,
      nit: e.nit,
      sector: e.sector,
      contador: e.contador,
      salud: e.salud,
      vencidasFmt: this.cop(e.vencidas),
    })),
  );

  readonly cartera = computed(() =>
    this.filtradas().reduce((acc, e) => acc + e.vencidas, 0),
  );
  readonly sanos = computed(() => this.filtradas().filter((e) => e.salud === 'Sana').length);
  readonly atencion = computed(() => this.filtradas().filter((e) => e.salud === 'Atención').length);
  readonly critica = computed(() => this.filtradas().filter((e) => e.salud === 'Crítica').length);

  readonly metricasTitulo = computed(() => {
    const emp = this.seleccionado();
    return emp ? 'Métricas de ' + emp.nombre : 'Métricas del cliente';
  });

  /** Alertas del portafolio filtradas por la empresa seleccionada. */
  readonly alertasEmpresa = computed<SiremTimelineItem[]>(() => {
    const emp = this.seleccionado();
    if (!emp) return [];
    return ALERTAS_SALUD
      .filter((a) => a.empresa === emp.nombre)
      .map((a) => ({
        title: a.tipo,
        description: a.detalle,
        time: a.fecha,
        tone: tonoSeveridad(a.severidad),
      }));
  });

  cop(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(valor);
  }

  abrir(fila: Record<string, unknown>): void {
    const emp = EMPRESAS_CLIENTES.find((e) => e.id === fila['id']);
    if (!emp) return;
    this.seleccionado.set(emp);
    this.metricasAbierta.set(true);
  }

  accion(label: string): void {
    if (label === 'Cerrar') {
      this.metricasAbierta.set(false);
      return;
    }
    this.entrarEntorno();
  }

  /** Simula el salto al entorno del cliente: toast + banner de acceso. */
  private entrarEntorno(): void {
    const emp = this.seleccionado();
    this.metricasAbierta.set(false);
    if (!emp) return;

    const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    this.ultimoAcceso.set('Último acceso al entorno de ' + emp.nombre + ' · ' + hora);
    this.toast.info({
      title: 'Contexto cambiado',
      description: 'Ahora ves el entorno de ' + emp.nombre + '.',
      duration: 3_500,
    });
  }

  ocultarAcceso(): void {
    this.ultimoAcceso.set(null);
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'portafolio-clientes.html',
      language: 'html',
      code: `<sirem-page-header title="Portafolio de clientes"
  subtitle="Salud contable, cartera vencida y alertas de cada empresa de la firma" />

@if (ultimoAcceso(); as acceso) {
  <div role="status" class="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm">
    <span>{{ acceso }}</span>
    <sirem-button size="sm" variant="secondary" (pressed)="ocultarAcceso()">Ocultar</sirem-button>
  </div>
}

<div class="grid gap-3 md:grid-cols-[1fr_12rem]">
  <sirem-search-field label="Buscar cliente" placeholder="Por nombre, NIT o contador…" [(value)]="q" />
  <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Salud" [options]="saludOptions" [(value)]="saludSel" />
</div>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <sirem-stat-card label="Cartera vencida" [value]="cop(cartera())" />
  <sirem-stat-card label="Clientes sanos" [value]="sanos()" variant="tint" color="success" />
  <sirem-stat-card label="En atención" [value]="atencion()" variant="tint" color="warning" />
  <sirem-stat-card label="Críticos" [value]="critica()" variant="tint" color="danger" />
</div>

<sirem-card-list [items]="filas()" titleKey="nombre" subtitleKey="nit" badgeKey="salud"
  [badgeTones]="tonos" [fields]="campos" (itemPressed)="abrir($event)" />

<sirem-modal [(open)]="metricasAbierta" [title]="metricasTitulo()" size="lg"
  [actions]="acciones" (actionPressed)="accion($event.label)">
  @if (seleccionado(); as emp) {
    <sirem-field-group title="Indicadores" [description]="emp.nit + ' · ' + emp.sector">
      <div class="col-span-12 sm:col-span-6 flex justify-between text-sm">
        <span>Facturas vencidas</span><span class="font-semibold">{{ cop(emp.vencidas) }}</span>
      </div>
      <div class="col-span-12 sm:col-span-6 flex justify-between text-sm">
        <span>Pendientes DIAN</span><span class="font-semibold">{{ emp.pendientesDian }}</span>
      </div>
    </sirem-field-group>
    <sirem-timeline [items]="alertasEmpresa()" />
  }
</sirem-modal>`,
    },
    {
      name: 'portafolio-clientes.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremCardList, SiremFieldGroup, SiremModal, type SiremModalAction, SiremInput,
  type SiremSelectOption, SiremStatCard, SiremTimeline, type SiremTimelineItem,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { ALERTAS_SALUD, EMPRESAS_CLIENTES, type ErpEmpresa } from '../../data/erp-mock';

export class PortafolioClientesPage {
  private readonly toast = inject(DynamicToastService);

  readonly q = signal('');
  readonly saludSel = signal<string | number | null>('Todas');
  readonly metricasAbierta = signal(false);
  readonly seleccionado = signal<ErpEmpresa | null>(null);
  readonly ultimoAcceso = signal<string | null>(null);

  readonly saludOptions: SiremSelectOption[] =
    ['Todas', 'Sana', 'Atención', 'Crítica'].map(v => ({ value: v, label: v }));

  readonly acciones: SiremModalAction[] = [
    { label: 'Cerrar', variant: 'secondary' },
    { label: 'Entrar al entorno', variant: 'primary' },
  ];

  readonly filtradas = computed<ErpEmpresa[]>(() => {
    const texto = this.q().trim().toLowerCase();
    const salud = this.saludSel();
    return EMPRESAS_CLIENTES.filter(e => {
      const coincide = !texto ||
        (e.nombre + ' ' + e.nit + ' ' + e.contador).toLowerCase().includes(texto);
      return coincide && (!salud || salud === 'Todas' || e.salud === salud);
    });
  });

  readonly filas = computed(() =>
    this.filtradas().map(e => ({ ...e, vencidasFmt: this.cop(e.vencidas) })),
  );

  readonly cartera = computed(() => this.filtradas().reduce((acc, e) => acc + e.vencidas, 0));
  readonly sanos = computed(() => this.filtradas().filter(e => e.salud === 'Sana').length);

  readonly alertasEmpresa = computed<SiremTimelineItem[]>(() => {
    const emp = this.seleccionado();
    if (!emp) return [];
    return ALERTAS_SALUD.filter(a => a.empresa === emp.nombre).map(a => ({
      title: a.tipo,
      description: a.detalle,
      time: a.fecha,
      tone: a.severidad === 'Alta' ? 'danger' : a.severidad === 'Media' ? 'warning' : 'info',
    }));
  });

  cop(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(valor);
  }

  abrir(fila: Record<string, unknown>): void {
    const emp = EMPRESAS_CLIENTES.find(e => e.id === fila['id']);
    if (!emp) return;
    this.seleccionado.set(emp);
    this.metricasAbierta.set(true);
  }

  /** Salto al entorno del cliente: toast + banner de último acceso. */
  entrarEntorno(): void {
    const emp = this.seleccionado();
    this.metricasAbierta.set(false);
    if (!emp) return;

    const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    this.ultimoAcceso.set('Último acceso al entorno de ' + emp.nombre + ' · ' + hora);
    this.toast.info({
      title: 'Contexto cambiado',
      description: 'Ahora ves el entorno de ' + emp.nombre + '.',
      duration: 3_500,
    });
  }
}`,
    },
  ];
}
