import { Component, signal } from '@angular/core';
import { SiremDrawer, SiremButton, SiremInput } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-drawer-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremDrawer, SiremButton, SiremInput],
  template: `
    <app-demo-page-layout title="Drawer" category="Overlays" subtitle="sirem-drawer — panel lateral.">
      <app-demo-variant-card title="Derecha" description="Detalle o filtros." [htmlCode]="h1" [tsCode]="t">
        <sirem-button size="sm" (pressed)="r.set(true)">Abrir derecha</sirem-button>
        <sirem-drawer [(open)]="r" title="Detalle paciente">
          <sirem-input-field label="Nombres" [(value)]="nombre" />
        </sirem-drawer>
      </app-demo-variant-card>
      <app-demo-variant-card title="Izquierda" description="Navegación auxiliar." [htmlCode]="h2" [tsCode]="t">
        <sirem-button size="sm" variant="secondary" (pressed)="l.set(true)">Abrir izquierda</sirem-button>
        <sirem-drawer [(open)]="l" title="Menú" side="left">
          <p class="text-sm text-slate-600">Contenido de navegación.</p>
        </sirem-drawer>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class DrawerDemoPage {
  readonly r = signal(false); readonly l = signal(false); readonly nombre = signal('');
  readonly h1 = '<sirem-button size="sm" (pressed)="r.set(true)">Abrir derecha</sirem-button>\n<sirem-drawer [(open)]="r" title="Detalle paciente">\n  <sirem-input-field label="Nombres" [(value)]="nombre" />\n</sirem-drawer>';
  readonly h2 = '<sirem-button size="sm" variant="secondary" (pressed)="l.set(true)">Abrir izquierda</sirem-button>\n<sirem-drawer [(open)]="l" title="Menú" side="left">\n  <p class="text-sm text-slate-600">Contenido de navegación.</p>\n</sirem-drawer>';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremDrawer, SiremButton, SiremInput } from 'deorta-sirem-ui';\n\nreadonly r = signal(false);\nreadonly l = signal(false);\nreadonly nombre = signal('');";
}
