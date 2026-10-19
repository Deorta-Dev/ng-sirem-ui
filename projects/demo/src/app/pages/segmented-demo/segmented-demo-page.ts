import { Component, signal } from '@angular/core';
import { SiremSegmented, type SiremSegmentedItem } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-segmented-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremSegmented],
  template: `
    <app-demo-page-layout
      title="Segmented"
      category="Navegación"
      subtitle="sirem-segmented — control de pastillas con la opción activa resaltada."
    >
      <app-demo-variant-card
        title="Acento (divisas)"
        description="Tono accent para la opción activa; 'hint' añade una segunda línea (referencia Bento)."
        [htmlCode]="h1"
        [tsCode]="t1"
      >
        <sirem-segmented
          tone="accent"
          ariaLabel="Divisa"
          [items]="divisas"
          [(value)]="divisa"
        />
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Pequeño con fechas"
        description="'size='sm'' y 'hint' para un selector de día compacto."
        [htmlCode]="h2"
        [tsCode]="t2"
      >
        <sirem-segmented
          size="sm"
          [items]="dias"
          [(value)]="dia"
          ariaLabel="Día"
        />
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Ancho completo"
        description="'stretch' reparte las opciones a lo ancho del contenedor."
        [htmlCode]="h3"
        [tsCode]="t3"
      >
        <div style="width: min(420px, 100%)">
          <sirem-segmented [items]="periodos" [(value)]="periodo" [stretch]="true" ariaLabel="Periodo" />
        </div>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class SegmentedDemoPage {
  readonly divisa = signal<string | null>('btc');
  readonly dia = signal<string | null>('30');
  readonly periodo = signal<string | null>('mes');

  readonly divisas: SiremSegmentedItem[] = [
    { value: 'bnb', label: '0.34 BNB' },
    { value: 'sol', label: '19 SOL' },
    { value: 'btc', label: '0.09 BTC' },
    { value: 'eth', label: '0.8 ETH' },
  ];

  readonly dias: SiremSegmentedItem[] = [
    { value: '29', label: 'L', hint: '29' },
    { value: '30', label: 'M', hint: '30' },
    { value: '31', label: 'X', hint: '31' },
  ];

  readonly periodos: SiremSegmentedItem[] = [
    { value: 'semana', label: 'Semana' },
    { value: 'mes', label: 'Mes' },
    { value: 'año', label: 'Año' },
  ];

  readonly t1 = `import { signal } from '@angular/core';
import { SiremSegmented, type SiremSegmentedItem } from 'deorta-sirem-ui';

readonly divisa = signal<string | null>('btc');
readonly divisas: SiremSegmentedItem[] = [
  { value: 'bnb', label: '0.34 BNB' },
  { value: 'sol', label: '19 SOL' },
  { value: 'btc', label: '0.09 BTC' },
  { value: 'eth', label: '0.8 ETH' },
];`;

  readonly t2 = `readonly dia = signal<string | null>('30');
readonly dias: SiremSegmentedItem[] = [
  { value: '29', label: 'L', hint: '29' },
  { value: '30', label: 'M', hint: '30' },
  { value: '31', label: 'X', hint: '31' },
];`;

  readonly t3 = `readonly periodo = signal<string | null>('mes');
readonly periodos: SiremSegmentedItem[] = [
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
  { value: 'año', label: 'Año' },
];`;

  readonly h1 =
    '<sirem-segmented tone="accent" ariaLabel="Divisa" [items]="divisas" [(value)]="divisa" />';
  readonly h2 = '<sirem-segmented size="sm" [items]="dias" [(value)]="dia" ariaLabel="Día" />';
  readonly h3 =
    '<sirem-segmented [items]="periodos" [(value)]="periodo" [stretch]="true" ariaLabel="Periodo" />';
}
