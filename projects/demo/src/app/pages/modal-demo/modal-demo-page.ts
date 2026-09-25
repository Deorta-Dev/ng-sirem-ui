import { Component, signal } from '@angular/core';
import { SiremModal, SiremModalAction, SiremButton, SiremInput } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-modal-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremModal, SiremButton, SiremInput],
  template: `
    <app-demo-page-layout title="Modal" category="Overlays" subtitle="sirem-modal — botones configurables con actions y footer con estilo propio.">
      <app-demo-variant-card title="sm confirmación" description="Dos acciones declarativas." [htmlCode]="h1" [tsCode]="t">
        <sirem-button size="sm" (pressed)="sm.set(true)">Abrir sm</sirem-button>
        <sirem-modal [(open)]="sm" title="Eliminar" size="sm"
          [actions]="delActions" (actionPressed)="onDel($event)" />
        <span class="text-sm text-slate-600 w-full text-center">Acción: {{ msg() }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card title="md formulario" description="Tres acciones: secundarias + primaria." [htmlCode]="h2" [tsCode]="t">
        <sirem-button size="sm" variant="secondary" (pressed)="md.set(true)">Abrir md</sirem-button>
        <sirem-modal [(open)]="md" title="Nuevo paciente" size="md"
          [actions]="formActions" (actionPressed)="onForm($event)">
          <sirem-input-field label="Nombres" [(value)]="nombre" />
        </sirem-modal>
      </app-demo-variant-card>
      <app-demo-variant-card title="Alineación centrada" description="actionsAlign start/center/end/stretch." [htmlCode]="h3" [tsCode]="t">
        <sirem-button size="sm" variant="secondary" (pressed)="lg.set(true)">Abrir centrado</sirem-button>
        <sirem-modal [(open)]="lg" title="Historia completa" size="lg"
          [persistent]="true" actionsAlign="center"
          [actions]="okActions" (actionPressed)="lg.set(false)">
          <p class="text-sm text-slate-600">Contenido amplio: tablas o formularios largos.</p>
        </sirem-modal>
      </app-demo-variant-card>
      <app-demo-variant-card title="Footer libre" description="slot=footer recibe el mismo contenedor con estilo." [htmlCode]="h4" [tsCode]="t">
        <sirem-button size="sm" variant="secondary" (pressed)="free.set(true)">Abrir libre</sirem-button>
        <sirem-modal [(open)]="free" title="Recordatorio" size="sm">
          <p class="text-sm text-slate-600">Tu fórmula está lista para descargar.</p>
          <div slot="footer" class="flex items-center justify-between gap-2">
            <span class="text-xs text-slate-500">Válida por 30 días</span>
            <sirem-button size="sm" (pressed)="free.set(false)">Descargar</sirem-button>
          </div>
        </sirem-modal>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class ModalDemoPage {
  readonly sm = signal(false);
  readonly md = signal(false);
  readonly lg = signal(false);
  readonly free = signal(false);
  readonly nombre = signal('');
  readonly msg = signal('');

  readonly delActions: SiremModalAction[] = [
    { label: 'Cancelar', variant: 'secondary', value: 'cancel' },
    { label: 'Eliminar', variant: 'danger', icon: 'fi fi-rr-trash', value: 'del' },
  ];
  readonly formActions: SiremModalAction[] = [
    { label: 'Limpiar', variant: 'ghost', value: 'clear' },
    { label: 'Cerrar', variant: 'secondary', value: 'close' },
    { label: 'Guardar', variant: 'primary', icon: 'fi fi-rr-check', value: 'save' },
  ];
  readonly okActions: SiremModalAction[] = [
    { label: 'Entendido', variant: 'primary', value: 'ok' },
  ];

  onDel(action: SiremModalAction): void {
    this.msg.set(action.label);
    this.sm.set(false);
  }

  onForm(action: SiremModalAction): void {
    if (action.value === 'clear') this.nombre.set('');
    else this.md.set(false);
  }

  readonly h1 = '<sirem-button size="sm" (pressed)="sm.set(true)">Abrir sm</sirem-button>\n<sirem-modal [(open)]="sm" title="Eliminar" size="sm"\n  [actions]="delActions" (actionPressed)="onDel($event)" />\n<span class="text-sm text-slate-600 w-full text-center">Acción: {{ msg() }}</span>';
  readonly h2 = '<sirem-button size="sm" variant="secondary" (pressed)="md.set(true)">Abrir md</sirem-button>\n<sirem-modal [(open)]="md" title="Nuevo paciente" size="md"\n  [actions]="formActions" (actionPressed)="onForm($event)">\n  <sirem-input-field label="Nombres" [(value)]="nombre" />\n</sirem-modal>';
  readonly h3 = '<sirem-button size="sm" variant="secondary" (pressed)="lg.set(true)">Abrir centrado</sirem-button>\n<sirem-modal [(open)]="lg" title="Historia completa" size="lg"\n  [persistent]="true" actionsAlign="center"\n  [actions]="okActions" (actionPressed)="lg.set(false)">\n  <p class="text-sm text-slate-600">Contenido amplio: tablas o formularios largos.</p>\n</sirem-modal>';
  readonly h4 = '<sirem-button size="sm" variant="secondary" (pressed)="free.set(true)">Abrir libre</sirem-button>\n<sirem-modal [(open)]="free" title="Recordatorio" size="sm">\n  <p class="text-sm text-slate-600">Tu fórmula está lista para descargar.</p>\n  <div slot="footer" class="flex items-center justify-between gap-2">\n    <span class="text-xs text-slate-500">Válida por 30 días</span>\n    <sirem-button size="sm" (pressed)="free.set(false)">Descargar</sirem-button>\n  </div>\n</sirem-modal>';
  readonly t = `import { signal } from '@angular/core';
import { SiremModal, SiremModalAction, SiremButton, SiremInput } from 'deorta-sirem-ui';

readonly sm = signal(false);
readonly md = signal(false);
readonly lg = signal(false);
readonly free = signal(false);
readonly nombre = signal('');
readonly msg = signal('');

readonly delActions: SiremModalAction[] = [
  { label: 'Cancelar', variant: 'secondary', value: 'cancel' },
  { label: 'Eliminar', variant: 'danger', icon: 'fi fi-rr-trash', value: 'del' },
];
readonly formActions: SiremModalAction[] = [
  { label: 'Limpiar', variant: 'ghost', value: 'clear' },
  { label: 'Cerrar', variant: 'secondary', value: 'close' },
  { label: 'Guardar', variant: 'primary', icon: 'fi fi-rr-check', value: 'save' },
];
readonly okActions: SiremModalAction[] = [
  { label: 'Entendido', variant: 'primary', value: 'ok' },
];

onDel(action: SiremModalAction): void {
  this.msg.set(action.label);
  this.sm.set(false);
}`;
}
