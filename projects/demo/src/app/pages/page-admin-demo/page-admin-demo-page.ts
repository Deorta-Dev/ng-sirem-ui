import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  SiremBadge,
  SiremButton,
  SiremCard,
  SiremDataTable,
  SiremFiIcon,
  SiremInput,
  SiremList,
  SiremListItem,
  SiremModal,
  SiremNavItem,
  SiremOverlayTrigger,
  SiremPageHeader,
  SiremPaletteItem,
  SiremRadioGroup,
  SiremSearchPalette,
  SiremSelectOption,
  SiremSidebar,
  SiremStatCard,
  SiremSticky,
  SiremSubmenuConfig,
  SiremTableColumn,
  SiremTimeline,
  SiremTimelineItem,
  SiremTopbar,
  SiremUserMenu,
  SiremUserMenuGroup,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

interface DemoApp {
  label: string;
  icon: string;
  description: string;
  route: string;
}

@Component({
  selector: 'app-page-admin-demo-page',
  standalone: true,
  imports: [
    PageDemoShell,
    SiremBadge,
    SiremButton,
    SiremCard,
    SiremDataTable,
    SiremInput,
    SiremList,
    SiremModal,
    SiremOverlayTrigger,
    SiremPageHeader,
    SiremRadioGroup,
    SiremSearchPalette,
    SiremSidebar,
    SiremStatCard,
    SiremSticky,
    SiremTimeline,
    SiremTopbar,
    SiremUserMenu,
    SiremFiIcon,
  ],
  template: `
    <app-page-demo-shell label="Panel administrativo" [files]="codeFiles">
      <div class="min-h-[calc(100dvh-2.75rem)]" style="background: var(--sirem-page-bg)">
        <sirem-sidebar
          brand="SIREM"
          [items]="navItems"
          [submenu]="submenuCfg"
          [pinned]="true"
          [centerNav]="true"
          [blur]="true"
          [floating]="true"
          [(collapsed)]="sidebarCollapsed"
          [(mobileOpen)]="mobileOpen"
        >
          <sirem-button
            slot="apps"
            size="sm"
            variant="ghost"
            [bordered]="false"
            [iconOnly]="sidebarCollapsed()"
            aria-label="Abrir aplicaciones"
            (pressed)="appsOpen.set(true)"
          >
            <sirem-fi-icon name="rr-category" />
            <span class="sr-only">Aplicaciones</span>
          </sirem-button>

          <div slot="user" class="flex w-full items-center gap-2">
            @if (!sidebarCollapsed()) {
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Ana Pérez
                </p>
                <p class="truncate text-xs text-slate-500 dark:text-slate-400">Administradora</p>
              </div>
            }
            <sirem-user-menu
              userName="Ana Pérez"
              userDetail="ana@opticorte.co"
              [groups]="userGroups"
            />
          </div>
        </sirem-sidebar>

        <section
          class="min-h-[calc(100dvh-2.75rem)] transition-[padding] duration-200 md:pl-[calc(var(--workspace-sidebar-width)+1.5rem)]"
          [style.--workspace-sidebar-width]="sidebarCollapsed() ? '4rem' : '15rem'"
        >
          <sirem-topbar
            [spaceLabel]="workspace()"
            spaceAriaLabel="sede"
            appearance="cards"
            searchAlign="center"
            searchPlaceholder="Buscar en "
            searchHighlight="Clínica Norte"
            searchHint="Ctrl + K"
            [showSpaceDot]="false"
            siremSticky
            (menuPressed)="mobileOpen.set(true)"
            (searchPressed)="searchOpen.set(true)"
            (spacePressed)="openWorkspace()"
          >
            <sirem-button
              slot="actions"
              size="md"
              variant="secondary"
              (pressed)="quickCreateOpen.set(true)"
            >
              <i slot="icon" class="fi fi-rr-plus" aria-hidden="true"></i>
              <span class="sr-only sm:not-sr-only">Nuevo paciente</span>
            </sirem-button>

            <div slot="actions" class="relative">
              <sirem-button
                size="md"
                variant="secondary"
                iconOnly
                aria-label="Abrir notificaciones"
                [siremOverlay]="notifTpl"
                siremOverlayTrigger="click"
                siremOverlayPlacement="bottom-end"
              >
                <i slot="icon" class="fi fi-rr-bell" aria-hidden="true"></i>
                <span class="sr-only">Notificaciones</span>
              </sirem-button>
              <span
                class="pointer-events-none absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                style="
                  background: var(--sirem-tint-danger-bg);
                  color: var(--sirem-tint-danger-text);
                  box-shadow: 0 0 0 2px var(--sirem-surface);
                "
                aria-label="3 notificaciones nuevas"
              >
                3
              </span>
            </div>
          </sirem-topbar>

          <main
            class="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 p-3 sm:p-4 lg:p-5"
          >
            <sirem-page-header
              title="Panel de trabajo"
              [subtitle]="workspace() + ' · Viernes, 25 de septiembre'"
            >
              <div slot="actions">
                <sirem-badge tone="success" dot>Operación normal</sirem-badge>
              </div>
            </sirem-page-header>

            <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <sirem-stat-card
                label="Pacientes activos"
                value="1.240"
                [delta]="4.8"
                variant="tint"
                color="brand"
              >
                <i slot="icon" class="fi fi-rr-users" aria-hidden="true"></i>
              </sirem-stat-card>
              <sirem-stat-card
                label="Citas hoy"
                value="32"
                [delta]="8.1"
                variant="tint"
                color="info"
              >
                <i slot="icon" class="fi fi-rr-calendar" aria-hidden="true"></i>
              </sirem-stat-card>
              <sirem-stat-card
                label="Facturado"
                value="$18,5 M"
                [delta]="12.4"
                variant="tint"
                color="success"
              >
                <i slot="icon" class="fi fi-rr-wallet" aria-hidden="true"></i>
              </sirem-stat-card>
              <sirem-stat-card
                label="Cartera"
                value="$4,2 M"
                [delta]="-2.1"
                variant="tint"
                color="warning"
              >
                <i slot="icon" class="fi fi-rr-receipt" aria-hidden="true"></i>
              </sirem-stat-card>
            </div>

            <div class="grid gap-4 xl:grid-cols-5">
              <sirem-card
                class="xl:col-span-3"
                title="Próximas citas"
                subtitle="Agenda de la mañana"
                surface="glass"
              >
                <sirem-list [items]="appointments" />
              </sirem-card>

              <sirem-card
                class="xl:col-span-2"
                title="Actividad reciente"
                subtitle="Actualizaciones del equipo"
                surface="glass"
              >
                <sirem-timeline [items]="activity" />
              </sirem-card>
            </div>

            <sirem-card
              title="Pacientes recientes"
              subtitle="Últimos registros actualizados"
              padding="none"
              footerPadding="sm"
              surface="glass"
            >
              <sirem-data-table [columns]="patientColumns" [rows]="patients" />
              <div slot="footer" class="flex justify-end">
                <sirem-button size="sm" variant="secondary"> Ver todos los pacientes </sirem-button>
              </div>
            </sirem-card>
          </main>
        </section>
      </div>

      <sirem-search-palette
        [items]="searchItems"
        placeholder="Buscar paciente, historia o módulo…"
        [(open)]="searchOpen"
        (selected)="selectSearchResult($event)"
      />

      <!-- Notificaciones: panel en la capa de overlays, no un modal. -->
      <ng-template #notifTpl>
        <sirem-card
          class="w-[22rem]"
          title="Notificaciones"
          subtitle="3 sin leer"
          surface="glass"
          headerPadding="sm"
          bodyPadding="none"
          footerPadding="sm"
        >
          <sirem-list [items]="notifications" (itemPressed)="readNotification($event)" />
          <div slot="footer" class="flex justify-end">
            <sirem-button size="sm" variant="ghost" (pressed)="markAllRead()">
              Marcar todas como leídas
            </sirem-button>
          </div>
        </sirem-card>
      </ng-template>

      <sirem-modal [(open)]="appsOpen" title="Aplicaciones" size="md">
        <div class="grid gap-3 sm:grid-cols-2">
          @for (app of apps; track app.label) {
            <sirem-card
              class="relative transition hover:-translate-y-0.5"
              surface="glass"
              headerPadding="none"
              bodyPadding="none"
              [showHeader]="false"
              [showFooter]="false"
            >
              <div class="flex flex-col items-center gap-2 p-4 text-center">
                <span
                  class="flex h-11 w-11 items-center justify-center rounded-xl text-lg"
                  style="background: var(--sirem-tint-bg); color: var(--sirem-tint-text)"
                  aria-hidden="true"
                >
                  <i [class]="app.icon"></i>
                </span>
                <span class="text-sm font-semibold text-slate-900">{{ app.label }}</span>
                @if (app.description) {
                  <span class="text-xs text-slate-500">{{ app.description }}</span>
                }
              </div>

              <!-- Botón estirado: mantiene la semántica y el foco por teclado
                   de un enlace, manteniendo el aspecto de tarjeta. -->
              <button
                type="button"
                class="absolute inset-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2"
                [attr.aria-label]="app.label + ': ' + app.description"
                (click)="openApp(app.route)"
              ></button>
            </sirem-card>
          }
        </div>
      </sirem-modal>

      <sirem-modal [(open)]="workspaceOpen" title="Cambiar workspace" size="sm">
        <sirem-radio-group-field
          label="Selecciona la sede activa"
          [(value)]="pendingWorkspace"
          [options]="workspaceOptions"
          orientation="vertical"
          groupName="admin-workspace"
        />
        <div slot="footer" class="flex justify-end gap-2">
          <sirem-button size="sm" variant="secondary" (pressed)="workspaceOpen.set(false)">
            Cancelar
          </sirem-button>
          <sirem-button size="sm" (pressed)="applyWorkspace()"> Aplicar </sirem-button>
        </div>
      </sirem-modal>

      <sirem-modal [(open)]="quickCreateOpen" title="Nuevo paciente" size="md">
        <div class="flex flex-col gap-4">
          <sirem-input-field
            label="Nombre completo"
            prefixIcon="fi fi-rr-user"
            placeholder="Nombre del paciente"
            [(value)]="newPatientName"
          />
          <sirem-input-field
            label="Documento"
            prefixIcon="fi fi-rr-id-badge"
            placeholder="CC o CE"
            [(value)]="newPatientDocument"
          />
        </div>
        <div slot="footer" class="flex justify-end gap-2">
          <sirem-button size="sm" variant="secondary" (pressed)="quickCreateOpen.set(false)">
            Cancelar
          </sirem-button>
          <sirem-button size="sm" (pressed)="createPatient()"> Crear paciente </sirem-button>
        </div>
      </sirem-modal>
    </app-page-demo-shell>
  `,
})
export class PageAdminDemoPage {
  private readonly router = inject(Router);
  private readonly toasts = inject(DynamicToastService);

  readonly sidebarCollapsed = signal(false);
  readonly mobileOpen = signal(false);
  readonly searchOpen = signal(false);
  readonly appsOpen = signal(false);
  readonly workspaceOpen = signal(false);
  readonly quickCreateOpen = signal(false);

  /**
   * Gesto de los submenús del sidebar: hover por encima de 1024 px y click
   * por debajo. El panel siempre sale en la capa de overlays (también con el
   * rail colapsado o en el drawer móvil).
   */
  readonly submenuCfg: SiremSubmenuConfig = {
    breakpoint: 1024,
    desktop: { trigger: 'hover' },
    mobile: { trigger: 'click' },
  };

  readonly workspace = signal('Clínica Norte');
  readonly pendingWorkspace = signal<string | number | null>('norte');
  readonly newPatientName = signal('');
  readonly newPatientDocument = signal('');

  readonly navItems: SiremNavItem[] = [
    {
      label: 'Pacientes',
      icon: 'fi fi-rr-users',
      badge: 12,
      children: [
        { label: 'Listado', route: '/demo/page-listado' },
        { label: 'Ficha del paciente', route: '/demo/page-detalle' },
      ],
    },
    {
      label: 'Historias clínicas',
      icon: 'fi fi-rr-copy',
      children: [
        { label: 'Evoluciones', route: '/demo/rich-text' },
        { label: 'Documentos', route: '/demo/card-list' },
      ],
    },
    {
      label: 'Agenda',
      icon: 'fi fi-rr-calendar',
      route: '/demo/calendar',
    },
    {
      label: 'Configuración',
      icon: 'fi fi-rr-settings',
      route: '/demo/page-admin',
    },
  ];

  readonly userGroups: SiremUserMenuGroup[] = [
    {
      title: 'Cuenta',
      actions: [
        { label: 'Mi perfil', icon: 'fi fi-rr-user' },
        { label: 'Preferencias', icon: 'fi fi-rr-settings' },
      ],
    },
    {
      title: 'Sesión',
      actions: [{ label: 'Cerrar sesión', icon: 'fi fi-rr-exit', danger: true }],
    },
  ];

  readonly workspaceOptions: SiremSelectOption[] = [
    { value: 'norte', label: 'Clínica Norte' },
    { value: 'centro', label: 'Clínica Centro' },
    { value: 'sur', label: 'Clínica Sur' },
  ];

  readonly notifications: SiremListItem[] = [
    {
      title: 'Historia clínica por revisar',
      subtitle: 'María Torres · hace 5 min',
      badge: 'Nueva',
      badgeTone: 'info',
    },
    {
      title: 'Stock de lentes bajo',
      subtitle: 'Lente progresivo · hace 40 min',
      badge: 'Aviso',
      badgeTone: 'warning',
    },
    {
      title: 'Cita cancelada',
      subtitle: 'Juan Pérez · mañana 09:00',
      badge: 'Info',
      badgeTone: 'neutral',
    },
  ];

  readonly apps: DemoApp[] = [
    {
      label: 'Pacientes',
      icon: 'fi fi-rr-users',
      description: 'Listado y ficha clínica',
      route: '/demo/page-listado',
    },
    {
      label: 'Historias',
      icon: 'fi fi-rr-copy',
      description: 'Evoluciones y anexos',
      route: '/demo/page-detalle',
    },
    {
      label: 'Agenda',
      icon: 'fi fi-rr-calendar',
      description: 'Citas del día',
      route: '/demo/calendar',
    },
    {
      label: 'Configuración',
      icon: 'fi fi-rr-settings',
      description: 'Sedes y permisos',
      route: '/demo/page-admin',
    },
  ];

  readonly searchItems: SiremPaletteItem[] = [
    { label: 'María Torres', hint: 'CC 1020', group: 'Pacientes' },
    { label: 'Juan Pérez', hint: 'CC 1031', group: 'Pacientes' },
    { label: 'Historias clínicas', hint: 'Módulo', group: 'Navegación' },
    { label: 'Agenda de hoy', hint: '32 citas', group: 'Acciones' },
    { label: 'Configuración', hint: 'Workspace', group: 'Navegación' },
  ];

  readonly appointments: SiremListItem[] = [
    {
      title: 'María Torres',
      subtitle: 'Control visual · Optometría',
      meta: '08:30',
      badge: 'Confirmada',
      badgeTone: 'success',
    },
    {
      title: 'Juan Pérez',
      subtitle: 'Historia clínica · Consulta',
      meta: '09:15',
      badge: 'En sala',
      badgeTone: 'warning',
    },
    {
      title: 'Ana Ruiz',
      subtitle: 'Entrega de fórmula',
      meta: '10:00',
      badge: 'Pendiente',
      badgeTone: 'neutral',
    },
  ];

  readonly activity: SiremTimelineItem[] = [
    {
      title: 'Historia actualizada',
      description: 'María Torres · Evolution',
      time: '08:42',
      tone: 'success',
    },
    {
      title: 'Cita reasignada',
      description: 'Juan Pérez · Sala 2',
      time: '08:18',
      tone: 'info',
    },
    {
      title: 'Factura pagada',
      description: 'FAC-1042 · $180.000',
      time: '07:55',
      tone: 'success',
    },
  ];

  readonly patientColumns: SiremTableColumn[] = [
    { key: 'avatar', label: 'Paciente', kind: 'avatar' },
    { key: 'documento', label: 'Documento' },
    {
      key: 'estado',
      label: 'Estado',
      kind: 'badge',
      badgeTones: {
        Activa: 'success',
        'En seguimiento': 'warning',
      },
    },
    { key: 'ultima', label: 'Última visita', kind: 'date' },
  ];

  readonly patients: Record<string, unknown>[] = [
    {
      id: 1,
      avatar: { name: 'María Torres' },
      nombre: 'María Torres',
      documento: 'CC 1020',
      estado: 'Activa',
      ultima: '2026-09-24',
    },
    {
      id: 2,
      avatar: { name: 'Juan Pérez' },
      nombre: 'Juan Pérez',
      documento: 'CC 1031',
      estado: 'En seguimiento',
      ultima: '2026-09-20',
    },
    {
      id: 3,
      avatar: { name: 'Ana Ruiz' },
      nombre: 'Ana Ruiz',
      documento: 'CC 1042',
      estado: 'Activa',
      ultima: '2026-09-18',
    },
  ];

  private readonly searchRoutes = new Map<string, string>([
    ['María Torres', '/demo/page-detalle'],
    ['Juan Pérez', '/demo/page-detalle'],
    ['Historias clínicas', '/demo/page-detalle'],
    ['Agenda de hoy', '/demo/calendar'],
    ['Configuración', '/demo/page-admin'],
  ]);

  /** Al pulsar una notificación se marca leída y se avisa con un toast. */
  readNotification(item: SiremListItem): void {
    this.toasts.info({ title: item.title, description: item.subtitle, duration: 4_000 });
  }

  markAllRead(): void {
    this.toasts.success({
      title: 'Notificaciones leídas',
      description: 'Se marcaron las 3 notificaciones como leídas.',
      duration: 3_000,
    });
  }

  openWorkspace(): void {
    const active = this.workspaceOptions.find((option) => option.label === this.workspace());
    this.pendingWorkspace.set(active?.value ?? null);
    this.workspaceOpen.set(true);
  }

  applyWorkspace(): void {
    const selected = this.workspaceOptions.find(
      (option) => option.value === this.pendingWorkspace(),
    );
    if (selected) this.workspace.set(selected.label);
    this.workspaceOpen.set(false);
  }

  openApp(route: string): void {
    this.appsOpen.set(false);
    void this.router.navigateByUrl(route);
  }

  selectSearchResult(item: SiremPaletteItem): void {
    const route = this.searchRoutes.get(item.label);
    if (route) void this.router.navigateByUrl(route);
  }

  createPatient(): void {
    this.newPatientName.set('');
    this.newPatientDocument.set('');
    this.quickCreateOpen.set(false);
  }

  toggleFullscreen(): void {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'page-admin.html',
      language: 'html',
      code: `<div class="min-h-[calc(100dvh-2.75rem)]" style="background: var(--sirem-page-bg)">
  <sirem-sidebar
    brand="SIREM"
    [items]="navItems"
    [submenu]="submenuCfg"
    [pinned]="true"
    [centerNav]="true"
    [blur]="true"
    [floating]="true"
    [(collapsed)]="sidebarCollapsed"
    [(mobileOpen)]="mobileOpen"
  >
    <sirem-button
      slot="apps"
      size="sm"
      variant="ghost"
      [bordered]="false"
      [iconOnly]="sidebarCollapsed()"
      (pressed)="appsOpen.set(true)"
    >
      <sirem-fi-icon name="rr-category" />
      <span class="sr-only">Aplicaciones</span>
    </sirem-button>

    <div slot="user" class="flex w-full items-center gap-2">
      @if (!sidebarCollapsed()) {
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold">Ana Pérez</p>
          <p class="truncate text-xs text-slate-500">Administradora</p>
        </div>
      }
      <sirem-user-menu userName="Ana Pérez" [groups]="userGroups" />
    </div>
  </sirem-sidebar>

  <section
    class="min-h-[calc(100dvh-2.75rem)] transition-[padding] md:pl-[calc(var(--workspace-sidebar-width)+1.5rem)]"
    [style.--workspace-sidebar-width]="sidebarCollapsed() ? '4rem' : '15rem'"
  >
    <!-- sticky + blur + floating: tarjeta redondeada pegada al borde superior -->
    <sirem-topbar
      spaceLabel="Clínica Norte"
      siremSticky
      [blur]="true"
      [floating]="true"
      (menuPressed)="mobileOpen.set(true)"
      (searchPressed)="searchOpen.set(true)"
      (spacePressed)="openWorkspace()"
      (fullscreenPressed)="toggleFullscreen()"
    >
      <sirem-button slot="actions" size="sm" variant="secondary">
        <i slot="icon" class="fi fi-rr-plus"></i>
        Nuevo paciente
      </sirem-button>

      <div slot="actions" class="relative">
        <sirem-button
          size="sm"
          variant="secondary"
          iconOnly
          aria-label="Abrir notificaciones"
          (pressed)="showNotifications()"
        >
          <i slot="icon" class="fi fi-rr-bell"></i>
        </sirem-button>
        <span class="absolute -right-1 -top-1 … rounded-full px-1 text-[9px] font-bold">3</span>
      </div>
    </sirem-topbar>

    <main class="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 p-3 sm:p-4 lg:p-5">
      <sirem-page-header title="Panel de trabajo" subtitle="Clínica Norte · Viernes, 25 de septiembre">
        <div slot="actions"><sirem-badge tone="success" dot>Operación normal</sirem-badge></div>
      </sirem-page-header>

      <!-- KPIs: variant="tint" = fondo pastel + icono en chip -->
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <sirem-stat-card label="Pacientes activos" value="1.240" [delta]="4.8" variant="tint" color="brand">
          <i slot="icon" class="fi fi-rr-users"></i>
        </sirem-stat-card>
        <sirem-stat-card label="Citas hoy" value="32" [delta]="8.1" variant="tint" color="info">
          <i slot="icon" class="fi fi-rr-calendar"></i>
        </sirem-stat-card>
        <sirem-stat-card label="Facturado" value="$18,5 M" [delta]="12.4" variant="tint" color="success">
          <i slot="icon" class="fi fi-rr-wallet"></i>
        </sirem-stat-card>
        <sirem-stat-card label="Cartera" value="$4,2 M" [delta]="-2.1" variant="tint" color="warning">
          <i slot="icon" class="fi fi-rr-receipt"></i>
        </sirem-stat-card>
      </div>

      <!-- Paneles: surface="glass" = translúcidos -->
      <div class="grid gap-4 xl:grid-cols-5">
        <sirem-card class="xl:col-span-3" title="Próximas citas" subtitle="Agenda de la mañana" surface="glass">
          <sirem-list [items]="appointments" />
        </sirem-card>

        <sirem-card class="xl:col-span-2" title="Actividad reciente" subtitle="Actualizaciones del equipo" surface="glass">
          <sirem-timeline [items]="activity" />
        </sirem-card>
      </div>

      <sirem-card title="Pacientes recientes" subtitle="Últimos registros actualizados" padding="none" footerPadding="sm" surface="glass">
        <sirem-data-table [columns]="patientColumns" [rows]="patients" />
        <div slot="footer" class="flex justify-end">
          <sirem-button size="sm" variant="secondary">Ver todos los pacientes</sirem-button>
        </div>
      </sirem-card>
    </main>
  </section>
</div>`,
    },
    {
      name: 'page-admin.component.ts',
      language: 'typescript',
      code: `import { Component, signal } from '@angular/core';
import {
  SiremButton,
  SiremNavItem,
  SiremSidebar,
  SiremSubmenuConfig,
  SiremTopbar,
  SiremUserMenu,
} from '@deorta-dev/ng-sirem-ui';

@Component({
  selector: 'app-page-admin',
  standalone: true,
  imports: [SiremButton, SiremSidebar, SiremTopbar, SiremUserMenu],
  templateUrl: './page-admin.html',
})
export class PageAdmin {
  readonly sidebarCollapsed = signal(false);
  readonly mobileOpen = signal(false);
  readonly searchOpen = signal(false);
  readonly appsOpen = signal(false);

  // Los hijos salen en overlay: hover en escritorio, click en móvil.
  readonly submenuCfg: SiremSubmenuConfig = {
    breakpoint: 1024,
    desktop: { trigger: 'hover' },
    mobile: { trigger: 'click' },
  };

  readonly navItems: SiremNavItem[] = [
    {
      label: 'Pacientes',
      icon: 'fi fi-rr-users',
      children: [
        { label: 'Listado', route: '/patients' },
        { label: 'Nueva ficha', route: '/patients/new' },
      ],
    },
    {
      label: 'Historias clínicas',
      icon: 'fi fi-rr-copy',
      children: [
        { label: 'Evoluciones', route: '/records/evolutions' },
        { label: 'Documentos', route: '/records/documents' },
      ],
    },
    { label: 'Agenda', icon: 'fi fi-rr-calendar', route: '/calendar' },
    { label: 'Configuración', icon: 'fi fi-rr-settings', route: '/settings' },
  ];
}`,
    },
  ];
}
