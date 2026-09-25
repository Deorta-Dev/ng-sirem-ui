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
  SiremPageHeader,
  SiremPaletteItem,
  SiremRadioGroup,
  SiremSearchPalette,
  SiremSelectOption,
  SiremSidebar,
  SiremStatCard,
  SiremTableColumn,
  SiremTimeline,
  SiremTimelineItem,
  SiremTopbar,
  SiremUserMenu,
  SiremUserMenuGroup,
} from 'deorta-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

interface DemoApp {
  label: string;
  icon: string;
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
    SiremPageHeader,
    SiremRadioGroup,
    SiremSearchPalette,
    SiremSidebar,
    SiremStatCard,
    SiremTimeline,
    SiremTopbar,
    SiremUserMenu,
    SiremFiIcon,
  ],
  template: `
    <app-page-demo-shell label="Panel administrativo" [files]="codeFiles">
      <div class="min-h-[calc(100dvh-2.75rem)] bg-slate-50 dark:bg-slate-950">
        <sirem-sidebar
          brand="SIREM"
          [items]="navItems"
          [pinned]="true"
          [centerNav]="true"
          [blur]="true"
          [(collapsed)]="sidebarCollapsed"
          [(mobileOpen)]="mobileOpen"
        >
          <sirem-button
            slot="apps"
            size="sm"
            variant="secondary"
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
          class="min-h-[calc(100dvh-2.75rem)] transition-[padding] duration-200 md:pl-[var(--workspace-sidebar-width)]"
          [style.--workspace-sidebar-width]="sidebarCollapsed() ? '4rem' : '15rem'"
        >
          <sirem-topbar
            [spaceLabel]="workspace()"
            [fixed]="true"
            [blur]="true"
            (menuPressed)="mobileOpen.set(true)"
            (searchPressed)="searchOpen.set(true)"
            (spacePressed)="openWorkspace()"
            (fullscreenPressed)="toggleFullscreen()"
          >
            <sirem-button
              slot="actions"
              size="sm"
              variant="secondary"
              (pressed)="quickCreateOpen.set(true)"
            >
              <i slot="icon" class="fi fi-rr-plus" aria-hidden="true"></i>
              <span class="sr-only sm:not-sr-only">Nuevo paciente</span>
            </sirem-button>

            <div slot="actions" class="relative">
              <sirem-button
                size="sm"
                variant="secondary"
                iconOnly
                aria-label="Abrir notificaciones"
                (pressed)="showNotifications()"
              >
                <i slot="icon" class="fi fi-rr-bell" aria-hidden="true"></i>
                <span class="sr-only">Notificaciones</span>
              </sirem-button>
              <span
                class="pointer-events-none absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white"
                aria-label="3 notificaciones nuevas"
              >
                3
              </span>
            </div>
          </sirem-topbar>

          <main class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5 p-4 sm:p-6 lg:p-8">
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
                variant="solid"
                color="brand"
              >
                <i slot="icon" class="fi fi-rr-users" aria-hidden="true"></i>
              </sirem-stat-card>
              <sirem-stat-card label="Citas hoy" value="32" [delta]="8.1">
                <i slot="icon" class="fi fi-rr-calendar" aria-hidden="true"></i>
              </sirem-stat-card>
              <sirem-stat-card label="Facturado" value="$18,5 M" [delta]="12.4">
                <i slot="icon" class="fi fi-rr-wallet" aria-hidden="true"></i>
              </sirem-stat-card>
              <sirem-stat-card label="Cartera" value="$4,2 M" [delta]="-2.1">
                <i slot="icon" class="fi fi-rr-receipt" aria-hidden="true"></i>
              </sirem-stat-card>
            </div>

            <div class="grid gap-4 xl:grid-cols-5">
              <sirem-card
                class="xl:col-span-3"
                title="Próximas citas"
                subtitle="Agenda de la mañana"
              >
                <sirem-list [items]="appointments" />
              </sirem-card>

              <sirem-card
                class="xl:col-span-2"
                title="Actividad reciente"
                subtitle="Actualizaciones del equipo"
              >
                <sirem-timeline [items]="activity" />
              </sirem-card>
            </div>

            <sirem-card
              title="Pacientes recientes"
              subtitle="Últimos registros actualizados"
              padding="none"
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

      <sirem-modal [(open)]="appsOpen" title="Aplicaciones" size="sm">
        <div class="grid grid-cols-2 gap-3">
          @for (app of apps; track app.label) {
            <sirem-button variant="secondary" (pressed)="openApp(app.route)">
              <i slot="icon" [class]="app.icon" aria-hidden="true"></i>
              {{ app.label }}
            </sirem-button>
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

  readonly workspace = signal('Clínica Norte');
  readonly pendingWorkspace = signal<string | number | null>('norte');
  readonly newPatientName = signal('');
  readonly newPatientDocument = signal('');

  readonly navItems: SiremNavItem[] = [
    {
      label: 'Pacientes',
      icon: 'fi fi-rr-users',
      route: '/demo/page-listado',
      badge: 12,
    },
    {
      label: 'Historias clínicas',
      icon: 'fi fi-rr-copy',
      route: '/demo/page-detalle',
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

  readonly apps: DemoApp[] = [
    {
      label: 'Pacientes',
      icon: 'fi fi-rr-users',
      route: '/demo/page-listado',
    },
    {
      label: 'Historias',
      icon: 'fi fi-rr-copy',
      route: '/demo/page-detalle',
    },
    { label: 'Agenda', icon: 'fi fi-rr-calendar', route: '/demo/calendar' },
    {
      label: 'Configuración',
      icon: 'fi fi-rr-settings',
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

  showNotifications(): void {
    this.toasts.info({
      title: 'Notificaciones nuevas',
      description: 'Hay 3 novedades del equipo y 1 historia clínica por revisar.',
      duration: 5_000,
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
      code: `<div class="min-h-screen bg-slate-50">
  <sirem-sidebar
    brand="SIREM"
    [items]="navItems"
    [pinned]="true"
    [centerNav]="true"
    [(collapsed)]="sidebarCollapsed"
    [(mobileOpen)]="mobileOpen"
  >
    <sirem-button
      slot="apps"
      size="sm"
      [iconOnly]="sidebarCollapsed()"
      (pressed)="appsOpen.set(true)"
    >
      <i slot="icon" class="fi fi-rr-apps"></i>
      @if (sidebarCollapsed()) {
        <span class="sr-only">Aplicaciones</span>
      } @else {
        Aplicaciones
      }
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
    class="min-h-screen transition-[padding] md:pl-[var(--workspace-sidebar-width)]"
    [style.--workspace-sidebar-width]="sidebarCollapsed() ? '5rem' : '18rem'"
  >
    <sirem-topbar
      spaceLabel="Clínica Norte"
      [fixed]="true"
      (menuPressed)="mobileOpen.set(true)"
      (searchPressed)="searchOpen.set(true)"
    >
      <sirem-button slot="actions">Nuevo paciente</sirem-button>
      <sirem-button slot="actions" iconOnly>
        <i slot="icon" class="fi fi-rr-bell"></i>
        <span class="sr-only">Notificaciones</span>
      </sirem-button>
    </sirem-topbar>

    <main class="p-4 md:p-6 lg:p-8">
      <!-- KPIs, agenda, actividad y pacientes -->
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
  SiremTopbar,
  SiremUserMenu,
} from 'deorta-sirem-ui';

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

  readonly navItems: SiremNavItem[] = [
    { label: 'Pacientes', icon: 'fi fi-rr-users', route: '/patients' },
    { label: 'Historias clínicas', icon: 'fi fi-rr-copy', route: '/records' },
    { label: 'Agenda', icon: 'fi fi-rr-calendar', route: '/calendar' },
    { label: 'Configuración', icon: 'fi fi-rr-settings', route: '/settings' },
  ];
}`,
    },
  ];
}
