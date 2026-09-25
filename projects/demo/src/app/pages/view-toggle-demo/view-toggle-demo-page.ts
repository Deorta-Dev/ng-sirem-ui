import { Component, signal } from '@angular/core';
import { SiremViewToggle } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-view-toggle-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremViewToggle],
  template: `
    <app-demo-page-layout title="View Toggle" category="Datos" subtitle="sirem-view-toggle — alternar tabla / tarjetas.">
      <app-demo-variant-card title="Tabla activa" description="Estado inicial en tabla." [htmlCode]="h1" [tsCode]="t1">
        <sirem-view-toggle [(view)]="v1" />
        <span class="text-sm text-slate-600">Vista: {{ v1() }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card title="Tarjetas activa" description="Estado inicial en tarjetas." [htmlCode]="h2" [tsCode]="t2">
        <sirem-view-toggle [(view)]="v2" />
        <span class="text-sm text-slate-600">Vista: {{ v2() }}</span>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class ViewToggleDemoPage {
  readonly v1 = signal<'table' | 'cards'>('table');
  readonly v2 = signal<'table' | 'cards'>('cards');
  readonly h1 = '<sirem-view-toggle [(view)]="v1" />\n<span class="text-sm text-slate-600">Vista: {{ v1() }}</span>';
  readonly h2 = '<sirem-view-toggle [(view)]="v2" />\n<span class="text-sm text-slate-600">Vista: {{ v2() }}</span>';
  readonly t1 = "import { signal } from '@angular/core';\nimport { SiremViewToggle } from 'deorta-sirem-ui';\n\nreadonly v1 = signal<'table' | 'cards'>('table');";
  readonly t2 = "import { signal } from '@angular/core';\nimport { SiremViewToggle } from 'deorta-sirem-ui';\n\nreadonly v2 = signal<'table' | 'cards'>('cards');";
}
