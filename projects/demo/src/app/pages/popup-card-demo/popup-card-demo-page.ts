import { Component } from '@angular/core';
import { SiremPopupCard, SiremPopupRow } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-popup-card-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremPopupCard],
  template: `
    <app-demo-page-layout title="Popup Card" category="Overlays" subtitle="sirem-popup-card — tarjeta popup de mapa.">
      <app-demo-variant-card title="Telemetría" description="Filas con tonos de estado." [htmlCode]="h1" [tsCode]="t">
        <sirem-popup-card title="Vehículo 12" [rows]="gps" (closed)="nada()" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Simple" description="Sin cierre, solo lectura." [htmlCode]="h2" [tsCode]="t">
        <sirem-popup-card title="Sede Norte" [rows]="sede" [closable]="false" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class PopupCardDemoPage {
  readonly gps: SiremPopupRow[] = [
    { label: 'Placa', value: 'ABC-123' },
    { label: 'Estado', value: 'En ruta', tone: 'info' },
    { label: 'Batería', value: '82 %', tone: 'success' },
  ];
  readonly sede: SiremPopupRow[] = [{ label: 'Dirección', value: 'Cra 10 #20-30' }, { label: 'Hoy', value: '32 citas' }];
  nada() {}
  readonly h1 = '<sirem-popup-card title="Vehículo 12" [rows]="gps" (closed)="nada()" />';
  readonly h2 = '<sirem-popup-card title="Sede Norte" [rows]="sede" [closable]="false" />';
  readonly t = `import { SiremPopupCard, SiremPopupRow } from 'deorta-sirem-ui';

readonly gps: SiremPopupRow[] = [
  { label: 'Placa', value: 'ABC-123' },
  { label: 'Estado', value: 'En ruta', tone: 'info' },
  { label: 'Batería', value: '82 %', tone: 'success' },
];
readonly sede: SiremPopupRow[] = [
  { label: 'Dirección', value: 'Cra 10 #20-30' },
  { label: 'Hoy', value: '32 citas' },
];`;
}
