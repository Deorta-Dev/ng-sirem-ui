import { Component, signal } from '@angular/core';
import {
  SiremButton,
  SiremSearchPalette,
  type SiremPaletteItem,
  type SiremPaletteSubItem,
} from '@deorta-dev/ng-sirem-ui';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';

@Component({
  selector: 'app-search-palette-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremSearchPalette, SiremButton],
  template: `
    <app-demo-page-layout
      title="Search Palette"
      category="Navegación"
      subtitle="sirem-search-palette — paleta Ctrl+K con iconos, descripciones y sub-elementos configurables."
    >
      <app-demo-variant-card
        title="Cerrada / Abierta"
        description="Control con open en doble vía."
        [htmlCode]="h1"
        [tsCode]="t"
      >
        <sirem-button size="sm" (pressed)="abierta.set(true)">Abrir (Ctrl+K)</sirem-button>
        <sirem-search-palette [items]="items" [(open)]="abierta" (selected)="sel.set($event.label)" />
        <span class="text-sm text-slate-600">Seleccionado: {{ sel() }}</span>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Con grupos"
        description="Agrupa por módulo con hint."
        [htmlCode]="h2"
        [tsCode]="t"
      >
        <sirem-search-palette [items]="grupos" [(open)]="gAbierta" placeholder="Buscar…" />
        <sirem-button size="sm" variant="secondary" (pressed)="gAbierta.set(true)">Ver grupos</sirem-button>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Iconos, descripción y sub-ítems horizontales (gestos ← y →)"
        description="Cada ítem configura sus propios iconos, descripción y sub-ítems. Cuando la disposición es horizontal, las flechas hacia los lados (← / →) mueven la selección entre sub-ítems."
        [htmlCode]="h3"
        [tsCode]="t3"
      >
        <div class="flex flex-col gap-2">
          <sirem-button size="sm" (pressed)="avanzadaAbierta.set(true)">
            Abrir paleta con sub-ítems
          </sirem-button>
          <sirem-search-palette
            [items]="avanzados"
            [(open)]="avanzadaAbierta"
            placeholder="Buscar pacientes, cirugías o facturas…"
            (selected)="onSelected($event)"
            (subItemSelected)="onSubSelected($event)"
          />
          <p class="text-xs text-slate-600 dark:text-zinc-400">
            Última acción: <b>{{ log() || 'Abre la paleta y usa las flechas arriba/abajo y laterales' }}</b>
          </p>
        </div>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class SearchPaletteDemoPage {
  readonly abierta = signal(false);
  readonly gAbierta = signal(false);
  readonly avanzadaAbierta = signal(false);
  readonly sel = signal('');
  readonly log = signal('');

  readonly items = [{ label: 'María Torres' }, { label: 'FAC-1042' }, { label: 'Agenda hoy' }];

  readonly grupos = [
    { label: 'María Torres', group: 'Pacientes', hint: 'HC-001' },
    { label: 'FAC-1042', group: 'Facturas', hint: '$250.000' },
  ];

  readonly avanzados: SiremPaletteItem[] = [
    {
      label: 'Ana María Gómez',
      icon: 'fi fi-rr-user',
      group: 'Pacientes',
      hint: 'HC-2045',
      description: 'Historia clínica activa · Control post-quirúrgico pendiente',
      subItemsLayout: 'horizontal',
      subItems: [
        { label: 'Ver HC', icon: 'fi fi-rr-eye' },
        { label: 'Nueva Cita', icon: 'fi fi-rr-calendar-plus' },
        { label: 'Facturar', icon: 'fi fi-rr-receipt' },
      ],
    },
    {
      label: 'Factura Electrónica FE-892',
      icon: 'fi fi-rr-document-signed',
      group: 'Facturación',
      hint: '$ 1.450.000',
      description: 'Emitida para Clínica Los Andes · DIAN Aceptada',
      subItemsLayout: 'horizontal',
      subItems: [
        { label: 'Descargar PDF', icon: 'fi fi-rr-download' },
        { label: 'Ver XML', icon: 'fi fi-rr-file-code' },
        { label: 'Reenviar', icon: 'fi fi-rr-envelope' },
      ],
    },
    {
      label: 'Cirugía Refractiva PRK',
      icon: 'fi fi-rr-stethoscope',
      group: 'Procedimientos',
      description: 'Protocolo de intervención corneal bilateral',
      subItemsLayout: 'vertical',
      subItems: [
        { label: 'Paso 1: Consentimiento informado', hint: 'Obligatorio' },
        { label: 'Paso 2: Topografía corneal', hint: 'Revisar' },
        { label: 'Paso 3: Reserva de quirófano', hint: 'Disponible' },
      ],
    },
  ];

  onSelected(item: SiremPaletteItem): void {
    if (item.selectedSubItem) {
      this.log.set(`Sub-ítem seleccionado: "${item.selectedSubItem.label}" de "${item.label}"`);
    } else {
      this.log.set(`Ítem principal seleccionado: "${item.label}"`);
    }
  }

  onSubSelected(ev: { item: SiremPaletteItem; subItem: SiremPaletteSubItem }): void {
    this.log.set(`Sub-ítem elegido: "${ev.subItem.label}" en "${ev.item.label}"`);
  }

  readonly h1 = '<sirem-button size="sm" (pressed)="abierta.set(true)">Abrir (Ctrl+K)</sirem-button>\n<sirem-search-palette [items]="items"\n  [(open)]="abierta" (selected)="sel.set($event.label)" />\n<span class="text-sm text-slate-600">Seleccionado: {{ sel() }}</span>';
  readonly h2 = '<sirem-search-palette [items]="grupos"\n  [(open)]="gAbierta" placeholder="Buscar…" />\n<sirem-button size="sm" variant="secondary" (pressed)="gAbierta.set(true)">Ver grupos</sirem-button>';
  readonly h3 = `<sirem-search-palette
  [items]="avanzados"
  [(open)]="abierta"
  (selected)="onSelected($event)"
  (subItemSelected)="onSubSelected($event)"
/>`;

  readonly t = `import { signal } from '@angular/core';
import { SiremSearchPalette, SiremButton } from '@deorta-dev/ng-sirem-ui';

readonly abierta = signal(false);
readonly gAbierta = signal(false);
readonly sel = signal('');
readonly items = [{ label: 'María Torres' }, { label: 'FAC-1042' }, { label: 'Agenda hoy' }];
readonly grupos = [
  { label: 'María Torres', group: 'Pacientes', hint: 'HC-001' },
  { label: 'FAC-1042', group: 'Facturas', hint: '$250.000' },
];`;

  readonly t3 = `readonly avanzados: SiremPaletteItem[] = [
  {
    label: 'Ana María Gómez',
    icon: 'fi fi-rr-user',
    description: 'Historia clínica activa',
    subItemsLayout: 'horizontal',
    subItems: [
      { label: 'Ver HC', icon: 'fi fi-rr-eye' },
      { label: 'Nueva Cita', icon: 'fi fi-rr-calendar-plus' },
    ],
  },
];`;
}
