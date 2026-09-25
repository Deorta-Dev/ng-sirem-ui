import { Component, signal } from '@angular/core';
import { SiremCardList } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-card-list-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremCardList],
  template: `
    <app-demo-page-layout title="Card List" category="Datos" subtitle="sirem-card-list — grilla de tarjetas como alternativa a tablas.">
      <app-demo-variant-card title="Pacientes" description="Avatar + badge + campos." [htmlCode]="h1" [tsCode]="t">
        <sirem-card-list
          [items]="pacientes"
          titleKey="nombre"
          subtitleKey="doc"
          badgeKey="estado"
          [badgeTones]="{ Activa: 'success', Pendiente: 'warning' }"
          avatarKey="nombre"
          [fields]="campos"
          (itemPressed)="sel.set($any($event)['nombre'])"
        />
        <span class="text-sm text-slate-600 w-full text-center">Seleccionado: {{ sel() }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card title="Seleccionable" description="Resalta con doble vía." [htmlCode]="h2" [tsCode]="t2">
        <sirem-card-list [items]="pacientes" titleKey="nombre" [selectable]="true" [(selection)]="multi" />
        <span class="text-sm text-slate-600 w-full text-center">Elegidas: {{ multi().length }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card title="Vacía" description="Estado sin registros." [htmlCode]="h3" [tsCode]="t">
        <sirem-card-list [items]="[]" titleKey="nombre" emptyText="Sin pacientes con ese filtro." />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class CardListDemoPage {
  readonly sel = signal('');
  readonly multi = signal<number[]>([]);
  readonly pacientes = [
    { id: 1, nombre: 'María Torres', doc: 'CC 1020', estado: 'Activa', tel: '300 111 2233', cita: '24 SEP 8:00' },
    { id: 2, nombre: 'Juan Pérez', doc: 'CC 1031', estado: 'Pendiente', tel: '310 444 5566', cita: '25 SEP 9:30' },
    { id: 3, nombre: 'Ana Ruiz', doc: 'CC 1042', estado: 'Activa', tel: '320 777 8899', cita: '25 SEP 11:00' },
  ];
  readonly campos = [
    { key: 'tel', label: 'Teléfono', icon: 'fi fi-rr-phone' },
    { key: 'cita', label: 'Próxima cita', icon: 'fi fi-rr-calendar' },
  ];
  readonly h1 = '<sirem-card-list [items]="pacientes" titleKey="nombre" subtitleKey="doc"\n  badgeKey="estado" [badgeTones]="{ Activa: \'success\', Pendiente: \'warning\' }"\n  avatarKey="nombre" [fields]="campos"\n  (itemPressed)="sel.set($any($event)[\'nombre\'])" />';
  readonly h2 = '<sirem-card-list [items]="pacientes" titleKey="nombre"\n  [selectable]="true" [(selection)]="multi" />';
  readonly h3 = '<sirem-card-list [items]="[]" titleKey="nombre" emptyText="Sin pacientes con ese filtro." />';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremCardList } from 'deorta-sirem-ui';\n\nreadonly sel = signal('');\nreadonly pacientes = [\n  { id: 1, nombre: 'María Torres', doc: 'CC 1020', estado: 'Activa', tel: '300 111 2233', cita: '24 SEP 8:00' },\n  { id: 2, nombre: 'Juan Pérez', doc: 'CC 1031', estado: 'Pendiente', tel: '310 444 5566', cita: '25 SEP 9:30' },\n  { id: 3, nombre: 'Ana Ruiz', doc: 'CC 1042', estado: 'Activa', tel: '320 777 8899', cita: '25 SEP 11:00' },\n];\nreadonly campos = [\n  { key: 'tel', label: 'Teléfono', icon: 'fi fi-rr-phone' },\n  { key: 'cita', label: 'Próxima cita', icon: 'fi fi-rr-calendar' },\n];";
  readonly t2 = "import { signal } from '@angular/core';\n\nreadonly multi = signal<number[]>([]);";
}
