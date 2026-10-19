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
        title="Tabla / Tarjetas (preset)"
        description="Sin 'items' es el switch fijo Tabla ⇄ Tarjetas (sustituye a sirem-view-toggle)."
        [htmlCode]="h0"
        [tsCode]="t0"
      >
        <sirem-segmented [(value)]="vista" />
      </app-demo-variant-card>

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
        title="Tamaños"
        description="'size' admite sm, md y lg; la ficha se desliza hasta la opción elegida."
        [htmlCode]="h4"
        [tsCode]="t4"
      >
        <div class="flex flex-wrap items-center gap-3">
          <sirem-segmented size="sm" [items]="periodos" [(value)]="periodoSm" ariaLabel="Periodo sm" />
          <sirem-segmented [items]="periodos" [(value)]="periodoMd" ariaLabel="Periodo md" />
          <sirem-segmented size="lg" [items]="periodos" [(value)]="periodoLg" ariaLabel="Periodo lg" />
        </div>
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
  readonly vista = signal<string | null>('table');
  readonly divisa = signal<string | null>('btc');
  readonly dia = signal<string | null>('30');
  readonly periodo = signal<string | null>('mes');
  readonly periodoSm = signal<string | null>('semana');
  readonly periodoMd = signal<string | null>('mes');
  readonly periodoLg = signal<string | null>('año');

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

  readonly t0 = `import { signal } from '@angular/core';
import { SiremSegmented } from 'deorta-sirem-ui';

/** 'table' | 'cards' (SiremViewMode); sin items = preset Tabla ⇄ Tarjetas. */
readonly vista = signal<string | null>('table');`;

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

  readonly h0 = '<sirem-segmented [(value)]="vista" />';
  readonly h1 =
    '<sirem-segmented tone="accent" ariaLabel="Divisa" [items]="divisas" [(value)]="divisa" />';
  readonly h2 = '<sirem-segmented size="sm" [items]="dias" [(value)]="dia" ariaLabel="Día" />';
  readonly h3 =
    '<sirem-segmented [items]="periodos" [(value)]="periodo" [stretch]="true" ariaLabel="Periodo" />';

  readonly t4 = `readonly periodoSm = signal<string | null>('semana');
readonly periodoMd = signal<string | null>('mes');
readonly periodoLg = signal<string | null>('año');`;

  readonly h4 = `<sirem-segmented size="sm" [items]="periodos" [(value)]="periodoSm" ariaLabel="Periodo sm" />
<sirem-segmented [items]="periodos" [(value)]="periodoMd" ariaLabel="Periodo md" />
<sirem-segmented size="lg" [items]="periodos" [(value)]="periodoLg" ariaLabel="Periodo lg" />`;
}
