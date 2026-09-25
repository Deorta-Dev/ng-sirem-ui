import { Component, signal } from '@angular/core';
import { SiremSearchPalette, SiremButton } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-search-palette-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremSearchPalette, SiremButton],
  template: `
    <app-demo-page-layout title="Search Palette" category="Navegación" subtitle="sirem-search-palette — paleta Ctrl+K.">
      <app-demo-variant-card title="Cerrada / Abierta" description="Control con open en doble vía." [htmlCode]="h1" [tsCode]="t">
        <sirem-button size="sm" (pressed)="abierta.set(true)">Abrir (Ctrl+K)</sirem-button>
        <sirem-search-palette [items]="items" [(open)]="abierta" (selected)="sel.set($event.label)" />
        <span class="text-sm text-slate-600">Seleccionado: {{ sel() }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card title="Con grupos" description="Agrupa por módulo con hint." [htmlCode]="h2" [tsCode]="t">
        <sirem-search-palette [items]="grupos" [(open)]="gAbierta" placeholder="Buscar…" />
        <sirem-button size="sm" variant="secondary" (pressed)="gAbierta.set(true)">Ver grupos</sirem-button>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class SearchPaletteDemoPage {
  readonly abierta = signal(false);
  readonly gAbierta = signal(false);
  readonly sel = signal('');
  readonly items = [{ label: 'María Torres' }, { label: 'FAC-1042' }, { label: 'Agenda hoy' }];
  readonly grupos = [
    { label: 'María Torres', group: 'Pacientes', hint: 'HC-001' },
    { label: 'FAC-1042', group: 'Facturas', hint: '$250.000' },
  ];
  readonly h1 = '<sirem-button size="sm" (pressed)="abierta.set(true)">Abrir (Ctrl+K)</sirem-button>\n<sirem-search-palette [items]="items"\n  [(open)]="abierta" (selected)="sel.set($event.label)" />\n<span class="text-sm text-slate-600">Seleccionado: {{ sel() }}</span>';
  readonly h2 = '<sirem-search-palette [items]="grupos"\n  [(open)]="gAbierta" placeholder="Buscar…" />\n<sirem-button size="sm" variant="secondary" (pressed)="gAbierta.set(true)">Ver grupos</sirem-button>';
  readonly t = `import { signal } from '@angular/core';
import { SiremSearchPalette, SiremButton } from 'deorta-sirem-ui';

readonly abierta = signal(false);
readonly gAbierta = signal(false);
readonly sel = signal('');
readonly items = [{ label: 'María Torres' }, { label: 'FAC-1042' }, { label: 'Agenda hoy' }];
readonly grupos = [
  { label: 'María Torres', group: 'Pacientes', hint: 'HC-001' },
  { label: 'FAC-1042', group: 'Facturas', hint: '$250.000' },
];`;
}
