import { Component } from '@angular/core';
import { SiremAvatar } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-avatar-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremAvatar],
  template: `
    <app-demo-page-layout title="Avatar" category="Datos" subtitle="sirem-avatar — iniciales, foto y presencia.">
      <app-demo-variant-card title="Iniciales" description="Genera iniciales desde el nombre." [htmlCode]="h1" [tsCode]="t">
        <sirem-avatar name="María Torres" />
        <sirem-avatar name="Juan Pérez" />
        <sirem-avatar name="Óptica SIREM" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Tamaños" description="xs a lg para listados y perfiles." [htmlCode]="h2" [tsCode]="t">
        <sirem-avatar name="Ana Ruiz" size="xs" />
        <sirem-avatar name="Ana Ruiz" size="sm" />
        <sirem-avatar name="Ana Ruiz" size="md" />
        <sirem-avatar name="Ana Ruiz" size="lg" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Presencia" description="Punto de estado del usuario o equipo." [htmlCode]="h3" [tsCode]="t">
        <sirem-avatar name="Luis Gómez" presence="success" />
        <sirem-avatar name="Luis Gómez" presence="warning" />
        <sirem-avatar name="Luis Gómez" presence="danger" />
        <sirem-avatar name="Luis Gómez" presence="neutral" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class AvatarDemoPage {
  readonly h1 = '<sirem-avatar name="María Torres" />\n<sirem-avatar name="Juan Pérez" />\n<sirem-avatar name="Óptica SIREM" />';
  readonly h2 = '<sirem-avatar name="Ana Ruiz" size="xs" />\n<sirem-avatar name="Ana Ruiz" size="sm" />\n<sirem-avatar name="Ana Ruiz" size="md" />\n<sirem-avatar name="Ana Ruiz" size="lg" />';
  readonly h3 = '<sirem-avatar name="Luis Gómez" presence="success" />\n<sirem-avatar name="Luis Gómez" presence="warning" />\n<sirem-avatar name="Luis Gómez" presence="danger" />\n<sirem-avatar name="Luis Gómez" presence="neutral" />';
  readonly t = "import { SiremAvatar } from 'deorta-sirem-ui';";
}
