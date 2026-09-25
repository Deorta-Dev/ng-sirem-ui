import { Component, signal } from '@angular/core';
import { SiremRichText } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-rich-text-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremRichText],
  template: `
    <app-demo-page-layout title="Rich Text" category="Formularios" subtitle="sirem-rich-text — texto enriquecido que devuelve HTML.">
      <app-demo-variant-card title="Evolución" description="Toolbar + contador." [htmlCode]="h1" [tsCode]="t">
        <sirem-rich-text label="Evolución" placeholder="Describe la atención…" hint="Se guarda como HTML." [(value)]="evo" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con valor inicial" description="Hidrata HTML previo." [htmlCode]="h2" [tsCode]="t">
        <sirem-rich-text label="Fórmula" [(value)]="formula" />
        <div class="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
          <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">HTML generado</p>
          <code class="break-all">{{ formula() }}</code>
        </div>
      </app-demo-variant-card>
      <app-demo-variant-card title="Con error" description="Validación de requerido." [htmlCode]="h3" [tsCode]="t">
        <sirem-rich-text label="Consentimiento" error="Describe el consentimiento informado." [(value)]="vacio" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class RichTextDemoPage {
  readonly evo = signal('');
  readonly vacio = signal('');
  readonly formula = signal('<b>OD:</b> -1.25 (-0.50 x 180)<br><b>OI:</b> -1.00');
  readonly h1 = '<sirem-rich-text label="Evolución"\n  placeholder="Describe la atención…" hint="Se guarda como HTML."\n  [(value)]="evo" />';
  readonly h2 = '<sirem-rich-text label="Fórmula" [(value)]="formula" />\n<div class="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">\n  <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">HTML generado</p>\n  <code class="break-all">{{ formula() }}</code>\n</div>';
  readonly h3 = '<sirem-rich-text label="Consentimiento"\n  error="Describe el consentimiento informado." [(value)]="vacio" />';
  readonly t = `import { signal } from '@angular/core';
import { SiremRichText } from 'deorta-sirem-ui';

readonly evo = signal('');
readonly vacio = signal('');
readonly formula = signal('<b>OD:</b> -1.25 (-0.50 x 180)<br><b>OI:</b> -1.00');`;
}
