import { Component, signal } from '@angular/core';
import { SiremSidebar } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

const DUO_USERS = '<svg viewBox="0 0 256 256" fill="currentColor"><path opacity="0.2" d="M168 128a40 40 0 1 0-40-40"/><path d="M168 128a40 40 0 1 0-40-40 40 40 0 0 0 40 40Zm40 88a88 95 0 0 0-80-51.6A88 95 0 0 0 48 216a8 8 0 0 0 8 8h144a8 8 0 0 0 8-8Z"/></svg>';

@Component({
  selector: 'app-sidebar-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremSidebar],
  template: `
    <app-demo-page-layout title="Sidebar" category="Layout" subtitle="sirem-sidebar — vertical/horizontal, colapsable con restauración, iconos fi/svg y fixed+blur.">
      <app-demo-variant-card title="Expandida" description="Estado normal con etiquetas." [htmlCode]="h1" [tsCode]="t">
        <div class="w-64"><sirem-sidebar [items]="items" brand="SIREM" /></div>
      </app-demo-variant-card>
      <app-demo-variant-card title="Colapsable" description="El botón ⇤/⇥ queda visible para restaurar." [htmlCode]="h2" [tsCode]="t3">
        <div class="w-64"><sirem-sidebar [items]="items" brand="SIREM" [(collapsed)]="col" /></div>
        <span class="text-sm text-slate-600 w-full text-center">Colapsada: {{ col() ? 'sí (pulsa ⇥)' : 'no' }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card title="Horizontal" description="Barra superior con desplegables." [htmlCode]="h4" [tsCode]="t">
        <sirem-sidebar layout="horizontal" [items]="itemsMenu" brand="SIREM" />
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
  readonly h1 = '<div class="w-64"><sirem-sidebar [items]="items" brand="SIREM" /></div>';
  readonly h2 = '<div class="w-64"><sirem-sidebar [items]="items"\n  brand="SIREM" [(collapsed)]="col" /></div>  <!-- ⇤/⇥ siempre visible -->';
  readonly h3 = '<div class="w-64"><sirem-sidebar [items]="itemsPerm"\n  [permissions]="permisos" /></div>';
  readonly h4 = '<sirem-sidebar layout="horizontal" [items]="itemsMenu" brand="SIREM" />';
  readonly h5 = '<div class="w-64"><sirem-sidebar [items]="itemsMix" brand="SIREM" /></div>';
  readonly h6 = '<sirem-sidebar layout="horizontal" [items]="items"\n  brand="SIREM" [fixed]="true" [blur]="true" />';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremSidebar } from 'deorta-sirem-ui';\n\nreadonly col = signal(false);\nreadonly items = [\n  { label: 'Pacientes', icon: 'fi fi-rr-users', route: '/demo/data-table' },\n  { label: 'Agenda', icon: 'fi fi-rr-calendar', route: '/demo/calendar' },\n  { label: 'Facturación', icon: 'fi fi-rr-receipt', route: '/demo/data-table' },\n];\nreadonly itemsMenu = [\n  { label: 'Pacientes', icon: 'fi fi-rr-users', route: '/demo/data-table' },\n  { label: 'Clínica', icon: 'fi fi-rr-stethoscope', children: [\n    { label: 'Historias', route: '/demo/card-list' },\n    { label: 'Evoluciones', route: '/demo/rich-text' },\n  ] },\n  { label: 'Agenda', icon: 'fi fi-rr-calendar', route: '/demo/calendar' },\n];\nreadonly itemsMix = [\n  { label: 'Pacientes', svg: DUO_USERS, route: '/demo/data-table' },\n  { label: 'Agenda', icon: 'fi fi-rr-calendar', route: '/demo/calendar' },\n];\nreadonly DUO_USERS = '<svg viewBox=\"0 0 256 256\" fill=\"currentColor\"><path opacity=\"0.2\" d=\"M168 128a40 40 0 1 0-40-40\"/><path d=\"M168 128a40 40 0 1 0-40-40 40 40 0 0 0 40 40Zm40 88a88 95 0 0 0-80-51.6A88 95 0 0 0 48 216a8 8 0 0 0 8 8h144a8 8 0 0 0 8-8Z\"/></svg>';";
  readonly t2 = 'readonly permisos = ["ver-pacientes", "ver-agenda"];\nreadonly itemsPerm = [\n  { label: "Pacientes", icon: "fi fi-rr-users", permission: "ver-pacientes" },\n  { label: "Nómina", icon: "fi fi-rr-wallet", permission: "ver-nomina" },\n];';
  readonly t3 = "import { signal } from '@angular/core';\n\nreadonly col = signal(false);";
}
