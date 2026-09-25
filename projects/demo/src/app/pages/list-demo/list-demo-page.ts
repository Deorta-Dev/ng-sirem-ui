import { Component, signal } from '@angular/core';
import { SiremList } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-list-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremList],
  template: `
    <app-demo-page-layout title="List" category="Datos" subtitle="sirem-list — filas con icono, badge y chevron.">
      <app-demo-variant-card title="Con avatares" description="Pacientes con estado." [htmlCode]="h1" [tsCode]="t">
        <sirem-list [items]="pacientes" (itemPressed)="sel.set($event.title)" />
        <span class="text-sm text-slate-600 w-full text-center">Seleccionado: {{ sel() }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card title="Con iconos" description="Módulos con meta a la derecha." [htmlCode]="h2" [tsCode]="t">
        <sirem-list [items]="modulos" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con chevron" description="Navegación con ›." [htmlCode]="h3" [tsCode]="t">
        <sirem-list [items]="ajustes" [dividers]="false" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Vacía" description="Texto personalizable." [htmlCode]="h4" [tsCode]="t">
        <sirem-list [items]="[]" emptyText="Sin notificaciones." />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class ListDemoPage {
  readonly sel = signal('');
  readonly pacientes = [
    { title: 'María Torres', subtitle: 'CC 1020 · Sura', avatarName: 'María Torres', badge: 'Activa', badgeTone: 'success' as const },
    { title: 'Juan Pérez', subtitle: 'CC 1031 · Sanitas', avatarName: 'Juan Pérez', badge: 'Pendiente', badgeTone: 'warning' as const },
  ];
  readonly modulos = [
    { title: 'Agenda', subtitle: '32 citas hoy', icon: 'fi fi-rr-calendar', meta: '8:00–17:00', chevron: true },
    { title: 'Facturación', subtitle: '$18,5 M del mes', icon: 'fi fi-rr-receipt', meta: 'SEP', chevron: true },
  ];
  readonly ajustes = [
    { title: 'Mi perfil', icon: 'fi fi-rr-user', chevron: true },
    { title: 'Sucursales', icon: 'fi fi-rr-shop', chevron: true },
  ];
  readonly h1 = '<sirem-list [items]="pacientes" (itemPressed)="sel.set($event.title)" />\n<span class="text-sm text-slate-600 w-full text-center">Seleccionado: {{ sel() }}</span>';
  readonly h2 = '<sirem-list [items]="modulos" />';
  readonly h3 = '<sirem-list [items]="ajustes" [dividers]="false" />';
  readonly h4 = '<sirem-list [items]="[]" emptyText="Sin notificaciones." />';
  readonly t = `import { signal } from '@angular/core';
import { SiremList } from 'deorta-sirem-ui';

readonly sel = signal('');
readonly pacientes = [
  { title: 'María Torres', subtitle: 'CC 1020 · Sura', avatarName: 'María Torres', badge: 'Activa', badgeTone: 'success' as const },
  { title: 'Juan Pérez', subtitle: 'CC 1031 · Sanitas', avatarName: 'Juan Pérez', badge: 'Pendiente', badgeTone: 'warning' as const },
];
readonly modulos = [
  { title: 'Agenda', subtitle: '32 citas hoy', icon: 'fi fi-rr-calendar', meta: '8:00–17:00', chevron: true },
  { title: 'Facturación', subtitle: '$18,5 M del mes', icon: 'fi fi-rr-receipt', meta: 'SEP', chevron: true },
];
readonly ajustes = [
  { title: 'Mi perfil', icon: 'fi fi-rr-user', chevron: true },
  { title: 'Sucursales', icon: 'fi fi-rr-shop', chevron: true },
];`;
}
