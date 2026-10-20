import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremDataTable, SiremEmptyState, SiremFieldGroup, SiremInput, SiremList, type SiremListItem,
  SiremModal, type SiremModalAction, SiremPageHeader, type SiremSelectOption, SiremStatCard, SiremSwitch, type SiremTableColumn,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { ALERTAS_SALUD, EMPRESAS_CLIENTES, type ErpAlerta } from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/**
 * Panel de salud del portafolio: alertas contables, bancarias y fiscales
 * por severidad, con resolución de alertas y estado de cada cliente.
 */
@Component({
  selector: 'app-salud-clientes-demo-page',
  standalone: true,
  imports: [
    PageDemoShell, SiremDataTable, SiremEmptyState, SiremFieldGroup, SiremInput, SiremList,
    SiremModal, SiremPageHeader, SiremStatCard, SiremSwitch,
  ],
  template: `
    <app-page-demo-shell label="Salud de clientes" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          <sirem-page-header title="Salud de clientes"
            subtitle="Alertas contables, bancarias y fiscales de todo el portafolio" />

          <div class="grid gap-3 md:grid-cols-[13rem_1fr] md:items-center">
            <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Severidad" [options]="severidadOptions" [(value)]="severidad" />
            <sirem-switch-field label="Ocultar resueltas"
              description="Muestra solo las alertas pendientes de atender"
              [(checked)]="ocultarResueltas" />
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <sirem-stat-card label="Facturas vencidas" [value]="alertasVencidas()"
              variant="tint" color="danger" />
            <sirem-stat-card label="Conciliación desajustada" [value]="alertasConciliacion()"
              variant="tint" color="warning" />
            <sirem-stat-card label="Documentos sin transmitir" [value]="alertasDian()"
              variant="tint" color="info" />
          </div>

          <sirem-data-table [columns]="colsEmpresas" [rows]="empresas" />

          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-slate-900 dark:text-white">Alertas del portafolio</h2>
            <span class="text-xs text-slate-500 dark:text-slate-400">{{ visibles().length }} visibles</span>
          </div>

          @if (visibles().length) {
            <sirem-list [items]="itemsAlertas()" (itemPressed)="abrirAlerta($event)" />
          } @else {
            <sirem-empty-state title="Sin alertas"
              description="No hay alertas que coincidan con el filtro seleccionado." />
          }
        </div>

        <sirem-modal [(open)]="alertaAbierta" [title]="alertaTitulo()"
          [actions]="acciones" (actionPressed)="accion($event.label)">
          @if (alertaSel(); as a) {
            <sirem-field-group title="Detalle de la alerta" [description]="a.empresa">
              <div class="col-span-12 sm:col-span-6 flex justify-between text-sm">
                <span>Tipo</span><span class="font-semibold">{{ a.tipo }}</span>
              </div>
              <div class="col-span-12 sm:col-span-6 flex justify-between text-sm">
                <span>Severidad</span><span class="font-semibold">{{ a.severidad }}</span>
              </div>
              <div class="col-span-12 sm:col-span-6 flex justify-between text-sm">
                <span>Fecha</span><span class="font-semibold">{{ a.fecha }}</span>
              </div>
              <div class="col-span-12 sm:col-span-6 flex justify-between text-sm">
                <span>Estado</span><span class="font-semibold">{{ a.resuelta ? 'Resuelta' : 'Pendiente' }}</span>
              </div>
              <div class="col-span-12 text-sm text-slate-500 dark:text-slate-400">{{ a.detalle }}</div>
            </sirem-field-group>
          }
        </sirem-modal>
      </main>
    </app-page-demo-shell>
  `,
})
export class SaludClientesDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Copia editable: resolver una alerta cambia el estado local. */
  readonly alertas = signal<ErpAlerta[]>(ALERTAS_SALUD.map((a) => ({ ...a })));
  readonly severidad = signal<string | number | null>('Todas');
  readonly ocultarResueltas = signal(true);
  readonly alertaAbierta = signal(false);
  readonly alertaSel = signal<ErpAlerta | null>(null);

  readonly empresas = EMPRESAS_CLIENTES;

  readonly severidadOptions: SiremSelectOption[] = ['Todas', 'Alta', 'Media', 'Baja']
    .map((v) => ({ value: v, label: v }));

  readonly colsEmpresas: SiremTableColumn[] = [
    { key: 'nombre', label: 'Cliente', subKey: 'sector' },
    { key: 'vencidas', label: 'Vencidas', kind: 'currency', align: 'right' },
    { key: 'descuadres', label: 'Descuadres', kind: 'number', align: 'right' },
    { key: 'pendientesDian', label: 'Pendientes DIAN', kind: 'number', align: 'right' },
    { key: 'salud', label: 'Salud', kind: 'badge',
      badgeTones: { Sana: 'success', 'Atención': 'warning', Crítica: 'danger' } },
  ];

  readonly acciones: SiremModalAction[] = [
    { label: 'Cerrar', variant: 'secondary' },
    { label: 'Marcar como resuelta', variant: 'primary' },
  ];

  /** Alertas que pasan el filtro de severidad y el ocultar resueltas. */
  readonly visibles = computed(() => {
    const sel = this.severidad();
    const ocultar = this.ocultarResueltas();
    return this.alertas().filter((a) =>
      (!ocultar || !a.resuelta) && (!sel || sel === 'Todas' || a.severidad === sel),
    );
  });

  readonly itemsAlertas = computed<SiremListItem[]>(() =>
    this.visibles().map((a) => ({
      title: a.tipo,
      subtitle: a.empresa + ' · ' + a.detalle,
      badge: a.severidad,
      badgeTone: a.severidad === 'Alta' ? 'danger' : a.severidad === 'Media' ? 'warning' : 'info',
      chevron: true,
      value: a,
    })),
  );

  readonly alertasVencidas = computed(() => this.pendientesPorTipo('Facturas vencidas'));
  readonly alertasConciliacion = computed(() => this.pendientesPorTipo('Conciliación desajustada'));
  readonly alertasDian = computed(() => this.pendientesPorTipo('Documentos sin transmitir'));

  readonly alertaTitulo = computed(() => {
    const a = this.alertaSel();
    return a ? a.tipo + ' · ' + a.empresa : 'Alerta del portafolio';
  });

  /** Alertas sin resolver de un tipo (base de las tarjetas KPI). */
  private pendientesPorTipo(tipo: ErpAlerta['tipo']): number {
    return this.alertas().filter((a) => !a.resuelta && a.tipo === tipo).length;
  }

  abrirAlerta(item: SiremListItem): void {
    const alerta = item.value as ErpAlerta | null;
    if (!alerta) return;
    this.alertaSel.set(alerta);
    this.alertaAbierta.set(true);
  }

  accion(label: string): void {
    if (label === 'Cerrar') {
      this.alertaAbierta.set(false);
      return;
    }
    this.resolver();
  }

  /** Marca la alerta seleccionada como resuelta, con toast de estado. */
  private resolver(): void {
    const alerta = this.alertaSel();
    this.alertaAbierta.set(false);
    if (!alerta) return;

    if (alerta.resuelta) {
      this.toast.info({
        title: 'Ya resuelta',
        description: 'Esta alerta ya fue atendida por la firma.',
        duration: 3_000,
      });
      return;
    }

    const resuelta: ErpAlerta = { ...alerta, resuelta: true };
    this.alertas.update((lista) => lista.map((a) => (a.id === resuelta.id ? resuelta : a)));
    this.alertaSel.set(resuelta);
    this.toast.success({
      title: 'Alerta resuelta',
      description: 'Se retiró del panel de salud del cliente.',
      duration: 3_500,
    });
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'salud-clientes.html',
      language: 'html',
      code: `<sirem-page-header title="Salud de clientes"
  subtitle="Alertas contables, bancarias y fiscales de todo el portafolio" />

<div class="grid gap-3 md:grid-cols-[13rem_1fr] md:items-center">
  <sirem-input-field [strictOptions]="true" placeholder="Seleccionar…" label="Severidad" [options]="severidadOptions" [(value)]="severidad" />
  <sirem-switch-field label="Ocultar resueltas"
    description="Muestra solo las alertas pendientes de atender"
    [(checked)]="ocultarResueltas" />
</div>

<div class="grid gap-3 sm:grid-cols-3">
  <sirem-stat-card label="Facturas vencidas" [value]="alertasVencidas()"
    variant="tint" color="danger" />
  <sirem-stat-card label="Conciliación desajustada" [value]="alertasConciliacion()"
    variant="tint" color="warning" />
  <sirem-stat-card label="Documentos sin transmitir" [value]="alertasDian()"
    variant="tint" color="info" />
</div>

<sirem-data-table [columns]="colsEmpresas" [rows]="empresas" />

<h2 class="text-sm font-semibold">Alertas del portafolio</h2>

@if (visibles().length) {
  <sirem-list [items]="itemsAlertas()" (itemPressed)="abrirAlerta($event)" />
} @else {
  <sirem-empty-state title="Sin alertas"
    description="No hay alertas que coincidan con el filtro seleccionado." />
}

<sirem-modal [(open)]="alertaAbierta" [title]="alertaTitulo()"
  [actions]="acciones" (actionPressed)="accion($event.label)">
  @if (alertaSel(); as a) {
    <sirem-field-group title="Detalle de la alerta" [description]="a.empresa">
      <div class="col-span-12 sm:col-span-6 flex justify-between text-sm">
        <span>Severidad</span><span class="font-semibold">{{ a.severidad }}</span>
      </div>
      <div class="col-span-12 sm:col-span-6 flex justify-between text-sm">
        <span>Estado</span><span class="font-semibold">{{ a.resuelta ? 'Resuelta' : 'Pendiente' }}</span>
      </div>
      <div class="col-span-12 text-sm">{{ a.detalle }}</div>
    </sirem-field-group>
  }
</sirem-modal>`,
    },
    {
      name: 'salud-clientes.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremDataTable, SiremList, type SiremListItem, SiremModal, type SiremModalAction,
  SiremInput, type SiremSelectOption, SiremStatCard, SiremSwitch, type SiremTableColumn,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { ALERTAS_SALUD, EMPRESAS_CLIENTES, type ErpAlerta } from '../../data/erp-mock';

export class SaludClientesPage {
  private readonly toast = inject(DynamicToastService);

  readonly alertas = signal<ErpAlerta[]>(ALERTAS_SALUD.map(a => ({ ...a })));
  readonly severidad = signal<string | number | null>('Todas');
  readonly ocultarResueltas = signal(true);
  readonly alertaAbierta = signal(false);
  readonly alertaSel = signal<ErpAlerta | null>(null);

  readonly severidadOptions: SiremSelectOption[] =
    ['Todas', 'Alta', 'Media', 'Baja'].map(v => ({ value: v, label: v }));

  readonly visibles = computed(() => {
    const sel = this.severidad();
    const ocultar = this.ocultarResueltas();
    return this.alertas().filter(a =>
      (!ocultar || !a.resuelta) && (!sel || sel === 'Todas' || a.severidad === sel),
    );
  });

  readonly itemsAlertas = computed<SiremListItem[]>(() =>
    this.visibles().map(a => ({
      title: a.tipo,
      subtitle: a.empresa + ' · ' + a.detalle,
      badge: a.severidad,
      chevron: true,
      value: a,
    })),
  );

  readonly alertasVencidas = computed(() => this.pendientesPorTipo('Facturas vencidas'));

  private pendientesPorTipo(tipo: ErpAlerta['tipo']): number {
    return this.alertas().filter(a => !a.resuelta && a.tipo === tipo).length;
  }

  abrirAlerta(item: SiremListItem): void {
    const alerta = item.value as ErpAlerta | null;
    if (!alerta) return;
    this.alertaSel.set(alerta);
    this.alertaAbierta.set(true);
  }

  /** Marca la alerta seleccionada como resuelta, con toast de estado. */
  resolver(): void {
    const alerta = this.alertaSel();
    this.alertaAbierta.set(false);
    if (!alerta || alerta.resuelta) return;

    const resuelta: ErpAlerta = { ...alerta, resuelta: true };
    this.alertas.update(lista => lista.map(a => (a.id === resuelta.id ? resuelta : a)));
    this.alertaSel.set(resuelta);
    this.toast.success({
      title: 'Alerta resuelta',
      description: 'Se retiró del panel de salud del cliente.',
      duration: 3_500,
    });
  }
}`,
    },
  ];
}
