import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremBadge, SiremBreadcrumbs, SiremCard, SiremCardList, type SiremCardListField,
  SiremConfirmDialog, SiremList, type SiremListItem, SiremModal, SiremPageHeader,
  SiremSearchField, type SiremBadgeTone, type SiremCrumb,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { EMPRESAS_CLIENTES, type ErpEmpresa } from '../../data/erp-mock';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

/**
 * Consola de administrador con impersonation: entra al entorno de una
 * empresa del portafolio, opera bajo su contexto y sale con confirmación.
 */
@Component({
  selector: 'app-impersonation-demo-page',
  standalone: true,
  imports: [
    PageDemoShell, SiremBadge, SiremBreadcrumbs, SiremCard, SiremCardList,
    SiremConfirmDialog, SiremList, SiremModal, SiremPageHeader, SiremSearchField,
  ],
  template: `
    <app-page-demo-shell label="Impersonation" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] p-4 sm:p-6 lg:p-8">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
          @if (contexto(); as emp) {
            <div class="flex flex-wrap items-center justify-between gap-3 p-4"
              style="background: var(--sirem-tint-strong-bg); color: var(--sirem-tint-strong-text); border-radius: var(--sirem-radius-lg)">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <sirem-badge tone="warning">Impersonation</sirem-badge>
                  <span class="text-sm font-semibold">Vista de {{ emp.nombre }}</span>
                </div>
                <sirem-breadcrumbs [items]="migas()" />
              </div>
              <button type="button" (click)="salidaConfirm.set(true)"
                class="rounded-lg border border-current px-3 py-1.5 text-sm font-semibold transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current">
                Salir de la vista
              </button>
            </div>

            <sirem-card title="Entorno activo" [subtitle]="emp.nombre">
              <dl class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">NIT</dt>
                  <dd class="text-sm font-semibold text-slate-900 dark:text-white">{{ emp.nit }}</dd>
                </div>
                <div>
                  <dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Sector</dt>
                  <dd class="text-sm font-semibold text-slate-900 dark:text-white">{{ emp.sector }}</dd>
                </div>
                <div>
                  <dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Contador</dt>
                  <dd class="text-sm font-semibold text-slate-900 dark:text-white">{{ emp.contador }}</dd>
                </div>
                <div>
                  <dt class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Salud</dt>
                  <dd class="text-sm font-semibold text-slate-900 dark:text-white">
                    <sirem-badge [tone]="tonoSalud(emp.salud)">{{ emp.salud }}</sirem-badge>
                  </dd>
                </div>
              </dl>
            </sirem-card>
          } @else {
            <sirem-page-header title="Consola de administrador"
              subtitle="Vista multiempresa de la firma: entra a un entorno para operar en su nombre" />
          }

          <sirem-card-list
            [items]="empresas"
            titleKey="nombre"
            subtitleKey="nit"
            badgeKey="salud"
            [badgeTones]="tonos"
            [fields]="campos"
            (itemPressed)="abrirSelector()"
          />
        </div>

        <sirem-modal [(open)]="selectorAbierto" title="Entrar a un entorno">
          <sirem-search-field label="Buscar empresa" placeholder="Por nombre, NIT o contador…"
            [(value)]="busqueda" />
          <div class="mt-3">
            <sirem-list [items]="resultados()" emptyText="Sin empresas que coincidan."
              (itemPressed)="entrar($event)" />
          </div>
        </sirem-modal>

        <sirem-confirm-dialog [(open)]="salidaConfirm" title="Salir de la vista"
          message="Estás operando con los permisos de otra empresa."
          detail="Si dejaste cambios sin guardar en este entorno, se perderán al salir."
          confirmLabel="Salir" cancelLabel="Seguir aquí" variant="primary"
          (confirmed)="salir()" />
      </main>
    </app-page-demo-shell>
  `,
})
export class ImpersonationDemoPage {
  private readonly toast = inject(DynamicToastService);

  /** Entorno en el que está operando la consola (null = vista normal). */
  readonly contexto = signal<ErpEmpresa | null>(null);
  readonly busqueda = signal('');
  readonly selectorAbierto = signal(false);
  readonly salidaConfirm = signal(false);

  readonly empresas = EMPRESAS_CLIENTES;

  readonly tonos: Record<string, SiremBadgeTone> = {
    Sana: 'success',
    'Atención': 'warning',
    Crítica: 'danger',
  };

  readonly campos: SiremCardListField[] = [
    { key: 'sector', label: 'Sector' },
    { key: 'contador', label: 'Contador', icon: 'fi fi-rr-user' },
  ];

  readonly migas = computed<SiremCrumb[]>(() => {
    const emp = this.contexto();
    return [
      { label: 'Inicio', link: ['/'] },
      { label: 'Consola' },
      { label: emp ? emp.nombre : 'Entorno' },
    ];
  });

  /** Empresas que coinciden con la búsqueda (nombre, NIT o contador). */
  readonly resultados = computed<SiremListItem[]>(() => {
    const texto = this.busqueda().trim().toLowerCase();
    return EMPRESAS_CLIENTES
      .filter((e) => !texto || (e.nombre + ' ' + e.nit + ' ' + e.contador).toLowerCase().includes(texto))
      .map((e) => ({
        title: e.nombre,
        subtitle: e.nit + ' · ' + e.sector,
        badge: e.salud,
        badgeTone: this.tonoSalud(e.salud),
        chevron: true,
        value: e,
      }));
  });

  tonoSalud(salud: ErpEmpresa['salud']): SiremBadgeTone {
    return salud === 'Sana' ? 'success' : salud === 'Atención' ? 'warning' : 'danger';
  }

  /** Abre el selector de entornos con la búsqueda limpia. */
  abrirSelector(): void {
    this.busqueda.set('');
    this.selectorAbierto.set(true);
  }

  /** Entra al entorno elegido y avisa con toast de contexto cambiado. */
  entrar(item: SiremListItem): void {
    const emp = item.value as ErpEmpresa | null;
    if (!emp) return;
    this.selectorAbierto.set(false);

    if (this.contexto()?.id === emp.id) {
      this.toast.info({
        title: 'Ya estás en este entorno',
        description: emp.nombre + ' ya está activo en la consola.',
        duration: 3_000,
      });
      return;
    }

    this.contexto.set(emp);
    this.busqueda.set('');
    this.toast.info({
      title: 'Contexto cambiado',
      description: 'Ahora ves el entorno de ' + emp.nombre + '.',
      duration: 3_500,
    });
  }

  /** Sale del entorno tras confirmar y vuelve a la consola de la firma. */
  salir(): void {
    this.contexto.set(null);
    this.toast.success({
      title: 'Sesión finalizada',
      description: 'Vuelves a la consola de la firma.',
      duration: 3_500,
    });
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'impersonation.html',
      language: 'html',
      code: `@if (contexto(); as emp) {
  <div class="flex flex-wrap items-center justify-between gap-3 p-4"
    style="background: var(--sirem-tint-strong-bg); color: var(--sirem-tint-strong-text); border-radius: var(--sirem-radius-lg)">
    <div class="flex flex-col gap-1">
      <div class="flex items-center gap-2">
        <sirem-badge tone="warning">Impersonation</sirem-badge>
        <span class="text-sm font-semibold">Vista de {{ emp.nombre }}</span>
      </div>
      <sirem-breadcrumbs [items]="migas()" />
    </div>
    <button type="button" (click)="salidaConfirm.set(true)"
      class="rounded-lg border border-current px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current">
      Salir de la vista
    </button>
  </div>

  <sirem-card title="Entorno activo" [subtitle]="emp.nombre">
    <p>NIT {{ emp.nit }} · {{ emp.sector }} · contador {{ emp.contador }}</p>
  </sirem-card>
} @else {
  <sirem-page-header title="Consola de administrador"
    subtitle="Vista multiempresa de la firma: entra a un entorno para operar en su nombre" />
}

<sirem-card-list [items]="empresas" titleKey="nombre" subtitleKey="nit" badgeKey="salud"
  [badgeTones]="tonos" [fields]="campos" (itemPressed)="abrirSelector()" />

<sirem-modal [(open)]="selectorAbierto" title="Entrar a un entorno">
  <sirem-search-field label="Buscar empresa" placeholder="Por nombre, NIT o contador…"
    [(value)]="busqueda" />
  <sirem-list [items]="resultados()" (itemPressed)="entrar($event)" />
</sirem-modal>

<sirem-confirm-dialog [(open)]="salidaConfirm" title="Salir de la vista"
  message="Estás operando con los permisos de otra empresa."
  detail="Si dejaste cambios sin guardar en este entorno, se perderán al salir."
  confirmLabel="Salir" cancelLabel="Seguir aquí" variant="primary"
  (confirmed)="salir()" />`,
    },
    {
      name: 'impersonation.component.ts',
      language: 'typescript',
      code: `import { Component, computed, inject, signal } from '@angular/core';
import {
  SiremBreadcrumbs, SiremConfirmDialog, SiremList, type SiremListItem, SiremModal,
  SiremSearchField, type SiremCrumb,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { EMPRESAS_CLIENTES, type ErpEmpresa } from '../../data/erp-mock';

export class ImpersonationPage {
  private readonly toast = inject(DynamicToastService);

  readonly contexto = signal<ErpEmpresa | null>(null);
  readonly busqueda = signal('');
  readonly selectorAbierto = signal(false);
  readonly salidaConfirm = signal(false);

  readonly migas = computed<SiremCrumb[]>(() => {
    const emp = this.contexto();
    return [
      { label: 'Inicio', link: ['/'] },
      { label: 'Consola' },
      { label: emp ? emp.nombre : 'Entorno' },
    ];
  });

  readonly resultados = computed<SiremListItem[]>(() => {
    const texto = this.busqueda().trim().toLowerCase();
    return EMPRESAS_CLIENTES
      .filter(e => !texto ||
        (e.nombre + ' ' + e.nit + ' ' + e.contador).toLowerCase().includes(texto))
      .map(e => ({
        title: e.nombre,
        subtitle: e.nit + ' · ' + e.sector,
        badge: e.salud,
        chevron: true,
        value: e,
      }));
  });

  /** Entra al entorno elegido y avisa con toast de contexto cambiado. */
  entrar(item: SiremListItem): void {
    const emp = item.value as ErpEmpresa | null;
    if (!emp) return;
    this.selectorAbierto.set(false);
    this.contexto.set(emp);
    this.toast.info({
      title: 'Contexto cambiado',
      description: 'Ahora ves el entorno de ' + emp.nombre + '.',
      duration: 3_500,
    });
  }

  /** Sale del entorno tras confirmar y vuelve a la consola de la firma. */
  salir(): void {
    this.contexto.set(null);
    this.toast.success({
      title: 'Sesión finalizada',
      description: 'Vuelves a la consola de la firma.',
      duration: 3_500,
    });
  }
}`,
    },
  ];
}
