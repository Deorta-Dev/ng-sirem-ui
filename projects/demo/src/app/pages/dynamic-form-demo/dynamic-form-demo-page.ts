import { Component, signal } from '@angular/core';
import { SiremDynamicForm, SiremFormNode } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-dynamic-form-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremDynamicForm],
  template: `
    <app-demo-page-layout title="Dynamic Form" category="Formularios" subtitle="sirem-dynamic-form — schema Lion con grupos y tablas.">
      <app-demo-variant-card title="Simple" description="Campos planos con columnas." [htmlCode]="h1" [tsCode]="t">
        <sirem-dynamic-form [fields]="simple" [(values)]="v1" (submitted)="m1.set('Enviado ✓')" />
        <span class="text-sm text-slate-600">{{ m1() }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card title="Con grupo" description="Sección con hijos." [htmlCode]="h2" [tsCode]="t">
        <sirem-dynamic-form [fields]="conGrupo" [(values)]="v2" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con HTML" description="Encabezados y ayudas ricas." [htmlCode]="h3" [tsCode]="t">
        <sirem-dynamic-form [fields]="conHtml" [(values)]="v3" [showActions]="false" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class DynamicFormDemoPage {
  readonly v1 = signal<Record<string, unknown>>({});
  readonly v2 = signal<Record<string, unknown>>({});
  readonly v3 = signal<Record<string, unknown>>({});
  readonly m1 = signal('');
  readonly simple: SiremFormNode[] = [
    { key: 'nombres', type: 'text', label: 'Nombres', column: ['md-6'] },
    { key: 'doc', type: 'text', label: 'Documento', column: ['md-6'] },
  ];
  readonly conGrupo: SiremFormNode[] = [
    { type: 'group', label: 'Contacto', children: [
      { key: 'tel', type: 'tel', label: 'Teléfono', column: ['md-6'] },
      { key: 'email', type: 'email', label: 'Correo', column: ['md-6'] },
    ] },
  ];
  readonly conHtml: SiremFormNode[] = [
    { type: 'html', label: '<b>RX final</b> — registre esfera y cilindro.' },
    { key: 'esfera-od', type: 'text', label: 'Esfera OD', column: ['md-6'] },
    { key: 'esfera-oi', type: 'text', label: 'Esfera OI', column: ['md-6'] },
  ];
  readonly h1 = '<sirem-dynamic-form [fields]="simple" [(values)]="v1"\n  (submitted)="m1.set(\'Enviado ✓\')" />';
  readonly h2 = '<sirem-dynamic-form [fields]="conGrupo" [(values)]="v2" />';
  readonly h3 = '<sirem-dynamic-form [fields]="conHtml" [(values)]="v3" [showActions]="false" />';
  readonly t = `import { signal } from '@angular/core';
import { SiremDynamicForm, SiremFormNode } from 'deorta-sirem-ui';

readonly v1 = signal<Record<string, unknown>>({});
readonly v2 = signal<Record<string, unknown>>({});
readonly v3 = signal<Record<string, unknown>>({});
readonly m1 = signal('');

readonly simple: SiremFormNode[] = [
  { key: 'nombres', type: 'text', label: 'Nombres', column: ['md-6'] },
  { key: 'doc', type: 'text', label: 'Documento', column: ['md-6'] },
];
readonly conGrupo: SiremFormNode[] = [
  { type: 'group', label: 'Contacto', children: [
    { key: 'tel', type: 'tel', label: 'Teléfono', column: ['md-6'] },
    { key: 'email', type: 'email', label: 'Correo', column: ['md-6'] },
  ] },
];
readonly conHtml: SiremFormNode[] = [
  { type: 'html', label: '<b>RX final</b> — registre esfera y cilindro.' },
  { key: 'esfera-od', type: 'text', label: 'Esfera OD', column: ['md-6'] },
  { key: 'esfera-oi', type: 'text', label: 'Esfera OI', column: ['md-6'] },
];`;
}
