import { Component, signal } from '@angular/core';
import { SiremTextarea } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-textarea-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremTextarea],
  template: `
    <app-demo-page-layout title="Textarea" category="Formularios" subtitle="sirem-textarea-field — texto multilínea.">
      <app-demo-variant-card title="3 filas" description="Altura compacta por defecto." [htmlCode]="h1" [tsCode]="t">
        <sirem-textarea-field label="Motivo de consulta" placeholder="Describa…" [(value)]="a" />
      </app-demo-variant-card>
      <app-demo-variant-card title="6 filas + hint" description="Evolución extensa con ayuda." [htmlCode]="h2" [tsCode]="t">
        <sirem-textarea-field label="Evolución" [rows]="6" hint="Incluya AV y RX." [(value)]="b" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Error y disabled" description="Validación y solo lectura visual." [htmlCode]="h3" [tsCode]="t">
        <sirem-textarea-field label="Observaciones" error="Mínimo 10 caracteres." [(value)]="c" />
        <sirem-textarea-field label="Cerrada" [disabled]="true" [(value)]="d" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class TextareaDemoPage {
  readonly a = signal(''); readonly b = signal(''); readonly c = signal(''); readonly d = signal('Nota cerrada.');
  readonly h1 = '<sirem-textarea-field label="Motivo de consulta"\n  placeholder="Describa…" [(value)]="a" />';
  readonly h2 = '<sirem-textarea-field label="Evolución" [rows]="6"\n  hint="Incluya AV y RX." [(value)]="b" />';
  readonly h3 = '<sirem-textarea-field label="Observaciones"\n  error="Mínimo 10 caracteres." [(value)]="c" />\n<sirem-textarea-field label="Cerrada" [disabled]="true" [(value)]="d" />';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremTextarea } from 'deorta-sirem-ui';\n\nreadonly a = signal('');\nreadonly b = signal('');\nreadonly c = signal('');\nreadonly d = signal('Nota cerrada.');";
}
