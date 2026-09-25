import { Component, signal } from '@angular/core';
import { SiremImageUpload } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-image-upload-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremImageUpload],
  template: `
    <app-demo-page-layout title="Image Upload" category="Formularios" subtitle="sirem-image-upload-field — subida con preview.">
      <app-demo-variant-card title="Vacío" description="Placeholder táctil." [htmlCode]="h1" [tsCode]="t">
        <sirem-image-upload-field label="Foto paciente" [(value)]="a" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Error y accept" description="Validación y filtro de tipos." [htmlCode]="h2" [tsCode]="t">
        <sirem-image-upload-field label="Consentimiento" error="Solo PNG o JPG." [(value)]="b" />
        <sirem-image-upload-field label="Solo PNG" accept="image/png" [(value)]="c" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class ImageUploadDemoPage {
  readonly a = signal(null); readonly b = signal(null); readonly c = signal(null);
  readonly h1 = '<sirem-image-upload-field label="Foto paciente" [(value)]="a" />';
  readonly h2 = '<sirem-image-upload-field label="Consentimiento"\n  error="Solo PNG o JPG." [(value)]="b" />\n<sirem-image-upload-field label="Solo PNG" accept="image/png" [(value)]="c" />';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremImageUpload } from 'deorta-sirem-ui';\n\nreadonly a = signal(null);\nreadonly b = signal(null);\nreadonly c = signal(null);";
}
