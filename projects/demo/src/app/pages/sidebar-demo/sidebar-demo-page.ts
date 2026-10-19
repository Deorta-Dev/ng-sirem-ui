import { Component, signal } from '@angular/core';
import { SiremSidebar, type SiremSubmenuConfig } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

const DUO_USERS = '<svg viewBox="0 0 256 256" fill="currentColor"><path opacity="0.2" d="M168 128a40 40 0 1 0-40-40"/><path d="M168 128a40 40 0 1 0-40-40 40 40 0 0 0 40 40Zm40 88a88 95 0 0 0-80-51.6A88 95 0 0 0 48 216a8 8 0 0 0 8 8h144a8 8 0 0 0 8-8Z"/></svg>';

@Component({
  selector: 'app-sidebar-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremSidebar],
  template: `
    <app-demo-page-layout title="Sidebar" category="Layout" subtitle="sirem-sidebar — vertical/horizontal, submenús en overlay por breakpoint, colapsable con restauración, iconos fi/svg, fixed+blur y floating (panel redondeado para dashboards, ver /demo/page-admin).">
      <app-demo-variant-card title="Expandida con submenús" description="Configuración principal: submenu con breakpoint 1024 (hover en escritorio, click en móvil) y panel en la capa de overlays." [htmlCode]="h1" [tsCode]="t4">
        <div class="w-64"><sirem-sidebar [items]="itemsMenu" brand="SIREM" [submenu]="submenuCfg" /></div>
      </app-demo-variant-card>
      <app-demo-variant-card title="Configuración por defecto" description="Sin input submenu: hover en escritorio y click en móvil (breakpoint 768), con el panel en la capa de overlays." [htmlCode]="h7" [tsCode]="t">
        <div class="w-64"><sirem-sidebar [items]="itemsMenu" brand="SIREM" /></div>
      </app-demo-variant-card>
      <app-demo-variant-card title="Colapsable" description="Colapsada (solo iconos) los hijos siguen accesibles: el panel lleva el título del padre." [htmlCode]="h2" [tsCode]="t3">
        <div class="w-64"><sirem-sidebar [items]="itemsMenu" brand="SIREM" [(collapsed)]="col" /></div>
        <span class="text-sm text-slate-600 w-full text-center">Colapsada: {{ col() ? 'sí (pulsa ⇥)' : 'no' }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Riel con tooltips (Bento)"
        description="Con collapsed, cada ítem muestra su tooltip flotante; 'tooltip' permite un texto propio."
        [htmlCode]="h9"
        [tsCode]="t6"
      >
        <div class="w-20">
          <sirem-sidebar [items]="itemsRail" brand="S" [(collapsed)]="railCol" />
        </div>
        <span class="text-sm text-slate-600 w-full text-center">
          Pasa el ratón por los iconos: {{ railCol() ? 'riel colapsado' : 'pulsa ⇤ para colapsar' }}
        </span>
      </app-demo-variant-card>
      <app-demo-variant-card title="Horizontal" description="Barra superior con desplegables en overlay." [htmlCode]="h4" [tsCode]="t">
        <sirem-sidebar layout="horizontal" [items]="itemsMenu" brand="SIREM" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Submenús con click" description="Un solo gesto en todas las franjas: trigger 'click', también en escritorio." [htmlCode]="h8" [tsCode]="t5">
        <div class="w-64"><sirem-sidebar [items]="itemsMenu" brand="SIREM" [submenu]="submenuClick" /></div>
      </app-demo-variant-card>
      <app-demo-variant-card title="Iconos mixtos" description="fi por clase y duotone por svg." [htmlCode]="h5" [tsCode]="t">
        <div class="w-64"><sirem-sidebar [items]="itemsMix" brand="SIREM" /></div>
      </app-demo-variant-card>
      <app-demo-variant-card title="Fixed + blur" description="Fija al scroll con desenfoque." [htmlCode]="h6" [tsCode]="t">
        <sirem-sidebar layout="horizontal" [items]="items" brand="SIREM" [fixed]="true" [blur]="true" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con permisos" description="Filtra items sin permiso." [htmlCode]="h3" [tsCode]="t2">
        <div class="w-64"><sirem-sidebar [items]="itemsPerm" [permissions]="permisos" /></div>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class SidebarDemoPage {
  readonly col = signal(false);
  readonly railCol = signal(true);
  readonly itemsRail = [
    { label: 'Inicio', icon: 'fi fi-rr-home', route: '/demo/page-admin' },
    { label: 'Explorar', icon: 'fi fi-rr-compass', route: '/demo/chart' },
    { label: 'Seguridad', icon: 'fi fi-rr-shield', route: '/demo/data-table', tooltip: 'Shield' },
  ];
  readonly items = [
    { label: 'Pacientes', icon: 'fi fi-rr-users', route: '/demo/data-table' },
    { label: 'Agenda', icon: 'fi fi-rr-calendar', route: '/demo/calendar' },
    { label: 'Facturación', icon: 'fi fi-rr-receipt', route: '/demo/data-table' },
  ];
  readonly itemsMenu = [
    { label: 'Pacientes', icon: 'fi fi-rr-users', route: '/demo/data-table' },
    {
      label: 'Clínica', icon: 'fi fi-rr-stethoscope',
      children: [
        { label: 'Historias', route: '/demo/card-list' },
        { label: 'Evoluciones', route: '/demo/rich-text' },
      ],
    },
    { label: 'Agenda', icon: 'fi fi-rr-calendar', route: '/demo/calendar' },
  ];
  readonly itemsMix = [
    { label: 'Pacientes', svg: DUO_USERS, route: '/demo/data-table' },
    { label: 'Agenda', icon: 'fi fi-rr-calendar', route: '/demo/calendar' },
  ];
  readonly permisos = ['ver-pacientes', 'ver-agenda'];
  readonly itemsPerm = [
    { label: 'Pacientes', icon: 'fi fi-rr-users', permission: 'ver-pacientes' },
    { label: 'Nómina', icon: 'fi fi-rr-wallet', permission: 'ver-nomina' },
  ];
  readonly h1 = '<div class="w-64"><sirem-sidebar [items]="itemsMenu"\n  brand="SIREM" [submenu]="submenuCfg" /></div>';
  readonly h2 = '<div class="w-64"><sirem-sidebar [items]="itemsMenu"\n  brand="SIREM" [(collapsed)]="col" /></div>  <!-- ⇤/⇥ siempre visible -->';
  readonly h3 = '<div class="w-64"><sirem-sidebar [items]="itemsPerm"\n  [permissions]="permisos" /></div>';
  readonly h4 = '<sirem-sidebar layout="horizontal" [items]="itemsMenu" brand="SIREM" />';
  readonly h5 = '<div class="w-64"><sirem-sidebar [items]="itemsMix" brand="SIREM" /></div>';
  readonly h6 = '<sirem-sidebar layout="horizontal" [items]="items"\n  brand="SIREM" [fixed]="true" [blur]="true" />';
  readonly h7 = '<div class="w-64"><sirem-sidebar [items]="itemsMenu" brand="SIREM" /></div>';
  readonly h8 = '<div class="w-64"><sirem-sidebar [items]="itemsMenu"\n  brand="SIREM" [submenu]="submenuClick" /></div>';
  /** Gesto por franja de ancho; sin config: hover desktop / click móvil (768). */
  readonly submenuCfg: SiremSubmenuConfig = {
    breakpoint: 1024,
    desktop: { trigger: 'hover' },
    mobile: { trigger: 'click' },
  };
  /** El mismo gesto en todas las franjas (valor común, sin `breakpoint`). */
  readonly submenuClick: SiremSubmenuConfig = { trigger: 'click' };
  readonly t = "import { signal } from '@angular/core';\nimport { SiremSidebar } from 'deorta-sirem-ui';\n\nreadonly col = signal(false);\nreadonly items = [\n  { label: 'Pacientes', icon: 'fi fi-rr-users', route: '/demo/data-table' },\n  { label: 'Agenda', icon: 'fi fi-rr-calendar', route: '/demo/calendar' },\n  { label: 'Facturación', icon: 'fi fi-rr-receipt', route: '/demo/data-table' },\n];\nreadonly itemsMenu = [\n  { label: 'Pacientes', icon: 'fi fi-rr-users', route: '/demo/data-table' },\n  { label: 'Clínica', icon: 'fi fi-rr-stethoscope', children: [\n    { label: 'Historias', route: '/demo/card-list' },\n    { label: 'Evoluciones', route: '/demo/rich-text' },\n  ] },\n  { label: 'Agenda', icon: 'fi fi-rr-calendar', route: '/demo/calendar' },\n];\nreadonly itemsMix = [\n  { label: 'Pacientes', svg: DUO_USERS, route: '/demo/data-table' },\n  { label: 'Agenda', icon: 'fi fi-rr-calendar', route: '/demo/calendar' },\n];\nreadonly DUO_USERS = '<svg viewBox=\"0 0 256 256\" fill=\"currentColor\"><path opacity=\"0.2\" d=\"M168 128a40 40 0 1 0-40-40\"/><path d=\"M168 128a40 40 0 1 0-40-40 40 40 0 0 0 40 40Zm40 88a88 95 0 0 0-80-51.6A88 95 0 0 0 48 216a8 8 0 0 0 8 8h144a8 8 0 0 0 8-8Z\"/></svg>';";
  readonly t2 = 'readonly permisos = ["ver-pacientes", "ver-agenda"];\nreadonly itemsPerm = [\n  { label: "Pacientes", icon: "fi fi-rr-users", permission: "ver-pacientes" },\n  { label: "Nómina", icon: "fi fi-rr-wallet", permission: "ver-nomina" },\n];';
  readonly t3 = "import { signal } from '@angular/core';\n\nreadonly col = signal(false);";
  readonly t4 =
    "import { SiremSidebar, type SiremSubmenuConfig } from 'deorta-sirem-ui';\n\n" +
    'readonly itemsMenu = [\n' +
    "  { label: 'Pacientes', icon: 'fi fi-rr-users', route: '/demo/data-table' },\n" +
    "  { label: 'Clínica', icon: 'fi fi-rr-stethoscope', children: [\n" +
    "    { label: 'Historias', route: '/demo/card-list' },\n" +
    "    { label: 'Evoluciones', route: '/demo/rich-text' },\n" +
    '  ] },\n' +
    "  { label: 'Agenda', icon: 'fi fi-rr-calendar', route: '/demo/calendar' },\n" +
    '];\n\n' +
    '// hover por encima de 1024 px y click por debajo\n' +
    'readonly submenuCfg: SiremSubmenuConfig = {\n' +
    '  breakpoint: 1024,\n' +
    "  desktop: { trigger: 'hover' },\n" +
    "  mobile: { trigger: 'click' },\n" +
    '};';
  readonly t5 =
    "import { SiremSidebar, type SiremSubmenuConfig } from 'deorta-sirem-ui';\n\n" +
    '// valor común: el mismo gesto en mobile y desktop\n' +
    "readonly submenuClick: SiremSubmenuConfig = { trigger: 'click' };";
  readonly t6 =
    "import { SiremSidebar } from 'deorta-sirem-ui';\n\n" +
    '// Con el sidebar colapsado, cada ítem muestra su label (o su tooltip) al pasar el ratón.\n' +
    "readonly itemsRail = [\n" +
    "  { label: 'Inicio', icon: 'fi fi-rr-home', route: '/inicio' },\n" +
    "  { label: 'Explorar', icon: 'fi fi-rr-compass', route: '/explorar' },\n" +
    "  { label: 'Seguridad', icon: 'fi fi-rr-shield', route: '/seguridad', tooltip: 'Shield' },\n" +
    '];';
  readonly h9 =
    '<div class="w-20"><sirem-sidebar [items]="itemsRail" brand="S" [(collapsed)]="railCol" /></div>';
}
