import { Component, signal } from '@angular/core';
import { SiremSelect } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-select-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremSelect],
  template: `
    <app-demo-page-layout title="Select" category="Formularios" subtitle="sirem-select-field — lista desplegable.">
      <app-demo-variant-card title="Básico" description="Placeholder + opciones." [htmlCode]="h1" [tsCode]="t">
        <sirem-select-field label="EPS" [options]="eps" [(value)]="a" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Hint y error" description="Ayuda y validación." [htmlCode]="h2" [tsCode]="t">
        <sirem-select-field label="Tipo doc" [options]="docs" hint="Según registro civil." [(value)]="b" />
        <sirem-select-field label="Sede" [options]="sedes" error="Selecciona una sede." [(value)]="c" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Required y disabled" description="Estados de formulario." [htmlCode]="h3" [tsCode]="t">
        <sirem-select-field label="Médico" [options]="med" [required]="true" [(value)]="d" />
        <sirem-select-field label="Bloqueado" [options]="med" [disabled]="true" [(value)]="e" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class SelectDemoPage {
  readonly a = signal(null); readonly b = signal(null); readonly c = signal(null); readonly d = signal(null); readonly e = signal(null);
  readonly eps = [{ value: 'sura', label: 'Sura' }, { value: 'sanitas', label: 'Sanitas' }];
  readonly docs = [{ value: 'cc', label: 'CC' }, { value: 'ti', label: 'TI' }];
  readonly sedes = [{ value: 'norte', label: 'Norte' }, { value: 'sur', label: 'Sur' }];
  readonly med = [{ value: 'm1', label: 'Dra. Ruiz' }, { value: 'm2', label: 'Dr. Pérez' }];
  readonly h1 = '<sirem-select-field label="EPS" [options]="eps" [(value)]="a" />';
  readonly h2 = '<sirem-select-field label="Tipo doc" [options]="docs"\n  hint="Según registro civil." [(value)]="b" />\n<sirem-select-field label="Sede" [options]="sedes"\n  error="Selecciona una sede." [(value)]="c" />';
  readonly h3 = '<sirem-select-field label="Médico" [options]="med"\n  [required]="true" [(value)]="d" />\n<sirem-select-field label="Bloqueado" [options]="med"\n  [disabled]="true" [(value)]="e" />';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremSelect } from 'deorta-sirem-ui';\n\nreadonly a = signal(null);\nreadonly b = signal(null);\nreadonly c = signal(null);\nreadonly d = signal(null);\nreadonly e = signal(null);\nreadonly eps = [{ value: 'sura', label: 'Sura' }, { value: 'sanitas', label: 'Sanitas' }];\nreadonly docs = [{ value: 'cc', label: 'CC' }, { value: 'ti', label: 'TI' }];\nreadonly sedes = [{ value: 'norte', label: 'Norte' }, { value: 'sur', label: 'Sur' }];\nreadonly med = [{ value: 'm1', label: 'Dra. Ruiz' }, { value: 'm2', label: 'Dr. Pérez' }];";
}
