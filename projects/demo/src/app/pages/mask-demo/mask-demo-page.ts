import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  SiremInput,
  SiremMaskDirective,
  type SiremMaskConfig,
} from '@deorta-dev/ng-sirem-ui';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';

@Component({
  selector: 'app-mask-demo-page',
  standalone: true,
  imports: [
    DemoPageLayout,
    DemoVariantCard,
    FormsModule,
    SiremMaskDirective,
    SiremInput,
  ],
  template: `
    <app-demo-page-layout
      title="Mask"
      category="Directivas"
      subtitle="siremMask — formateo de inputs mediante tokens comodín o expresiones regulares."
    >
      <app-demo-variant-card
        title="Fecha dd/mm/aaaa"
        description="Máscara de fecha con inserción automática de separadores '/'. Los tokens '0' representan dígitos numéricos."
        [htmlCode]="h1"
        [tsCode]="t1"
      >
        <div class="flex flex-col gap-2 w-full max-w-sm">
          <input
            siremMask="00/00/0000"
            [(ngModel)]="fecha"
            (rawChange)="rawFecha.set($event)"
            placeholder="dd/mm/aaaa"
            class="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-slate-800 dark:text-zinc-100"
          />
          <p class="text-xs text-slate-500">
            Formateado: <b>{{ fecha || '—' }}</b> · Crudo (sin '/'): <b>{{ rawFecha() || '—' }}</b>
          </p>
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Teléfono con código"
        description="Patrón '(000) 000-0000' para teléfonos fijos o celulares con código de área."
        [htmlCode]="h2"
        [tsCode]="t2"
      >
        <div class="flex flex-col gap-2 w-full max-w-sm">
          <input
            siremMask="(000) 000-0000"
            [(ngModel)]="telefono"
            (rawChange)="rawTel.set($event)"
            placeholder="(555) 000-0000"
            class="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-slate-800 dark:text-zinc-100"
          />
          <p class="text-xs text-slate-500">
            Formateado: <b>{{ telefono || '—' }}</b> · Crudo: <b>{{ rawTel() || '—' }}</b>
          </p>
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Filtro por Expresión Regular"
        description="Pasa una RegExp a siremMask (ej. /^[0-9]*$/) para restringir y filtrar caracteres en vivo."
        [htmlCode]="h3"
        [tsCode]="t3"
      >
        <div class="flex flex-col gap-2 w-full max-w-sm">
          <input
            [siremMask]="soloNumerosRegex"
            [(ngModel)]="codigoNumerico"
            placeholder="Solo números"
            class="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-slate-800 dark:text-zinc-100"
          />
          <p class="text-xs text-slate-500">
            Valor: <b>{{ codigoNumerico || '—' }}</b>
          </p>
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Tokens personalizados (SiremMaskConfig)"
        description="Configura tokens adicionales en un objeto SiremMaskConfig (ej. 'AAA-000' donde 'A' es mayúscula obligatoria)."
        [htmlCode]="h4"
        [tsCode]="t4"
      >
        <div class="flex flex-col gap-2 w-full max-w-sm">
          <input
            [siremMask]="placaConfig"
            [(ngModel)]="placa"
            placeholder="ABC-123"
            class="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-slate-800 dark:text-zinc-100 uppercase"
          />
          <p class="text-xs text-slate-500">
            Placa: <b>{{ placa || '—' }}</b>
          </p>
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Integrado en sirem-input-field"
        description="El componente sirem-input-field admite la propiedad [mask] directamente."
        [htmlCode]="h5"
        [tsCode]="t5"
      >
        <div class="w-full max-w-sm">
          <sirem-input-field
            label="Documento con máscara"
            mask="000.000.000-00"
            placeholder="000.000.000-00"
            [(value)]="docField"
          />
          <p class="text-xs text-slate-500 mt-2">
            Valor en modelo: <b>{{ docField() || '—' }}</b>
          </p>
        </div>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class MaskDemoPage {
  fecha = '';
  readonly rawFecha = signal('');

  telefono = '';
  readonly rawTel = signal('');

  codigoNumerico = '';
  readonly soloNumerosRegex = /^[0-9]*$/;

  placa = '';
  readonly placaConfig: SiremMaskConfig = {
    pattern: 'AAA-000',
    tokens: { A: /[A-Z]/, '0': /\d/ },
  };

  readonly docField = signal<string | null>(null);

  readonly h1 = `<input siremMask="00/00/0000" [(ngModel)]="fecha" placeholder="dd/mm/aaaa" />`;
  readonly t1 = `fecha = '';\nrawFecha = signal('');`;

  readonly h2 = `<input siremMask="(000) 000-0000" [(ngModel)]="telefono" />`;
  readonly t2 = `telefono = '';\nrawTel = signal('');`;

  readonly h3 = `<input [siremMask]="soloNumerosRegex" [(ngModel)]="codigoNumerico" />`;
  readonly t3 = `codigoNumerico = '';\nsoloNumerosRegex = /^[0-9]*$/;`;

  readonly h4 = `<input [siremMask]="placaConfig" [(ngModel)]="placa" />`;
  readonly t4 = `readonly placaConfig: SiremMaskConfig = {\n  pattern: 'AAA-000',\n  tokens: { A: /[A-Z]/, '0': /\\d/ },\n};`;

  readonly h5 = `<sirem-input-field label="Documento" mask="000.000.000-00" [(value)]="doc" />`;
  readonly t5 = `readonly doc = signal<string | null>(null);`;
}
