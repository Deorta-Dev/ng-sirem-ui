import { Component, signal } from '@angular/core';
import { SiremNavbar } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

const DUO_HOME = '<svg viewBox="0 0 256 256" fill="currentColor"><path opacity="0.2" d="M224 120 128 24 32 120v96a8 8 0 0 0 8 8h176a8 8 0 0 0 8-8Z"/><path d="M224 120 128 24 32 120v96a8 8 0 0 0 8 8h48V152h80v72h48a8 8 0 0 0 8-8Z"/></svg>';
const DUO_CAL = '<svg viewBox="0 0 256 256" fill="currentColor"><path opacity="0.2" d="M200 32h-24v-8a8 8 0 0 0-16 0v8H96v-8a8 8 0 0 0-16 0v8H56a16 16 0 0 0-16 16v136a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16Z"/><path d="M200 32h-24v-8a8 8 0 0 0-16 0v8H96v-8a8 8 0 0 0-16 0v8H56a16 16 0 0 0-16 16v136a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16Zm-144 48h144v8H56Z"/></svg>';

@Component({
  selector: 'app-navbar-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremNavbar],
  template: `
    <app-demo-page-layout title="Navbar" category="Navegación" subtitle="sirem-navbar — layouts, iconos fi/svg y modo fixed con blur.">
      <app-demo-variant-card title="Vertical con iconos fi" description="Clases Flaticon UIcons." [htmlCode]="h1" [tsCode]="t">
        <div class="w-56"><sirem-navbar [items]="itemsFi" (itemPressed)="msg.set($event.label)" /></div>
        <span class="text-sm text-slate-600">{{ msg() }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card title="Vertical con duotone" description="SVG inline por ítem (svg tiene prioridad)." [htmlCode]="h4" [tsCode]="t2">
        <div class="w-56"><sirem-navbar [items]="itemsSvg" /></div>
      </app-demo-variant-card>
      <app-demo-variant-card title="Horizontal" description="Barra superior con submenús." [htmlCode]="h2" [tsCode]="t">
        <sirem-navbar layout="horizontal" [items]="itemsFi" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Fixed + blur" description="Se fija al scroll con fondo translúcido." [htmlCode]="h3" [tsCode]="t">
        <sirem-navbar layout="horizontal" [items]="itemsFi" [fixed]="true" [blur]="true" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class NavbarDemoPage {
  readonly msg = signal('');
  readonly itemsFi = [
    { label: 'Inicio', icon: 'fi fi-rr-home', route: '/' },
    { label: 'Pacientes', icon: 'fi fi-rr-users', route: '/demo/data-table' },
    { label: 'Agenda', icon: 'fi fi-rr-calendar', route: '/demo/calendar' },
  ];
  readonly itemsSvg = [
    { label: 'Inicio', svg: DUO_HOME, route: '/' },
    { label: 'Agenda', svg: DUO_CAL, route: '/demo/calendar' },
  ];
  readonly h1 = '<div class="w-56"><sirem-navbar [items]="itemsFi"\n  (itemPressed)="msg.set($event.label)" /></div>\n<span class="text-sm text-slate-600">{{ msg() }}</span>';
  readonly h2 = '<sirem-navbar layout="horizontal" [items]="itemsFi" />';
  readonly h3 = '<sirem-navbar layout="horizontal" [items]="itemsFi"\n  [fixed]="true" [blur]="true" />';
  readonly h4 = '<div class="w-56"><sirem-navbar [items]="itemsSvg" /></div>';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremNavbar } from 'deorta-sirem-ui';\n\nreadonly msg = signal('');\nreadonly itemsFi = [\n  { label: 'Inicio', icon: 'fi fi-rr-home', route: '/' },\n  { label: 'Pacientes', icon: 'fi fi-rr-users', route: '/demo/data-table' },\n  { label: 'Agenda', icon: 'fi fi-rr-calendar', route: '/demo/calendar' },\n];";
  readonly t2 = "readonly itemsSvg = [\n  { label: 'Inicio', svg: DUO_HOME, route: '/' },\n  { label: 'Agenda', svg: DUO_CAL, route: '/demo/calendar' },\n];\nreadonly DUO_HOME = '<svg viewBox=\"0 0 256 256\" fill=\"currentColor\"><path opacity=\"0.2\" d=\"M224 120 128 24 32 120v96a8 8 0 0 0 8 8h176a8 8 0 0 0 8-8Z\"/><path d=\"M224 120 128 24 32 120v96a8 8 0 0 0 8 8h48V152h80v72h48a8 8 0 0 0 8-8Z\"/></svg>';\nreadonly DUO_CAL = '<svg viewBox=\"0 0 256 256\" fill=\"currentColor\"><path opacity=\"0.2\" d=\"M200 32h-24v-8a8 8 0 0 0-16 0v8H96v-8a8 8 0 0 0-16 0v8H56a16 16 0 0 0-16 16v136a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16Z\"/><path d=\"M200 32h-24v-8a8 8 0 0 0-16 0v8H96v-8a8 8 0 0 0-16 0v8H56a16 16 0 0 0-16 16v136a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16Zm-144 48h144v8H56Z\"/></svg>';";
}
