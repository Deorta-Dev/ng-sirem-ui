import { Component, signal } from '@angular/core';
import { SiremDateChip } from '@deorta-dev/ng-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-date-chip-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremDateChip],
  template: `
    <app-demo-page-layout
      title="Date Chip"
      category="Datos"
      subtitle="sirem-date-chip — chip de día grande para un selector rápido de fechas."
    >
      <app-demo-variant-card
        title="Días"
        description="El activo va en tinta con texto claro; el resto en superficie suave."
        [htmlCode]="h1"
        [tsCode]="t1"
      >
        @for (d of dias; track d.day) {
          <sirem-date-chip
            [weekday]="d.weekday"
            [day]="d.day"
            [active]="seleccionado() === d.day"
            [dot]="d.dot"
            [ariaLabel]="d.weekday + ' ' + d.day"
            (pressed)="seleccionado.set(d.day)"
          />
        }
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Tamaño grande"
        description="'size='lg'' para un selector protagonista."
        [htmlCode]="h2"
        [tsCode]="t2"
      >
        <sirem-date-chip size="lg" weekday="Lun" day="19" [active]="true" ariaLabel="Lunes 19" />
        <sirem-date-chip size="lg" weekday="Vie" day="23" [dot]="true" ariaLabel="Viernes 23" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class DateChipDemoPage {
  readonly seleccionado = signal<string | number>('19');

  readonly dias = [
    { weekday: 'L', day: '19', dot: false },
    { weekday: 'M', day: '20', dot: false },
    { weekday: 'V', day: '23', dot: true },
    { weekday: 'S', day: '24', dot: true },
  ];

  readonly t1 = `import { signal } from '@angular/core';
import { SiremDateChip } from '@deorta-dev/ng-sirem-ui';

readonly seleccionado = signal<string | number>('19');
readonly dias = [
  { weekday: 'L', day: '19', dot: false },
  { weekday: 'M', day: '20', dot: false },
  { weekday: 'V', day: '23', dot: true },
  { weekday: 'S', day: '24', dot: true },
];`;

  readonly t2 = `readonly seleccionado = signal<string | number>('19');`;

  readonly h1 = `@for (d of dias; track d.day) {
  <sirem-date-chip
    [weekday]="d.weekday"
    [day]="d.day"
    [active]="seleccionado() === d.day"
    [dot]="d.dot"
    (pressed)="seleccionado.set(d.day)"
  />
}`;

  readonly h2 = `<sirem-date-chip size="lg" weekday="Lun" day="19" [active]="true" />
<sirem-date-chip size="lg" weekday="Vie" day="23" [dot]="true" />`;
}
