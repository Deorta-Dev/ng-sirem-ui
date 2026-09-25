import { Component } from '@angular/core';
import { SiremDuotoneIcon } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

const CASA = '<svg viewBox="0 0 256 256" fill="currentColor"><path opacity="0.2" d="M224 120 128 24 32 120v96a8 8 0 0 0 8 8h176a8 8 0 0 0 8-8Z"/><path d="M224 120 128 24 32 120v96a8 8 0 0 0 8 8h48V152h80v72h48a8 8 0 0 0 8-8Z"/></svg>';
const CAMPANA = '<svg viewBox="0 0 256 256" fill="currentColor"><path opacity="0.2" d="M221 128a93 93 0 0 1-186 0c0-40 20-66 36-80V40a35 35 0 0 1 70 0v8c16 14 36 40 36 80Z"/><path d="M221 128a93 93 0 0 1-186 0c0-40 20-66 36-80V40a35 35 0 0 1 70 0v8c16 14 36 40 36 80Zm-93 64a24 24 0 0 0 24-24H104a24 24 0 0 0 24 24Z"/></svg>';

@Component({
  selector: 'app-duotone-icon-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremDuotoneIcon],
  template: `
    <app-demo-page-layout title="Duotone Icon" category="Iconos" subtitle="sirem-duotone-icon — dos tonos con currentColor.">
      <app-demo-variant-card title="Dos iconos" description="Capa opacity 0.2 + capa sólida." [htmlCode]="h1" [tsCode]="t">
        <span class="text-sirem-600"><sirem-duotone-icon [svg]="casa" /></span>
        <span class="text-amber-600"><sirem-duotone-icon [svg]="campana" /></span>
      </app-demo-variant-card>
      <app-demo-variant-card title="Tamaños" description="size en px." [htmlCode]="h2" [tsCode]="t">
        <sirem-duotone-icon [svg]="casa" [size]="16" />
        <sirem-duotone-icon [svg]="casa" [size]="32" />
        <sirem-duotone-icon [svg]="casa" [size]="48" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con label" description="Accesible como imagen." [htmlCode]="h3" [tsCode]="t">
        <sirem-duotone-icon [svg]="campana" label="Notificaciones" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class DuotoneIconDemoPage {
  readonly casa = CASA;
  readonly campana = CAMPANA;
  readonly h1 = '<span class="text-sirem-600"><sirem-duotone-icon [svg]="casa" /></span>\n<span class="text-amber-600"><sirem-duotone-icon [svg]="campana" /></span>';
  readonly h2 = '<sirem-duotone-icon [svg]="casa" [size]="16" />\n<sirem-duotone-icon [svg]="casa" [size]="32" />\n<sirem-duotone-icon [svg]="casa" [size]="48" />';
  readonly h3 = '<sirem-duotone-icon [svg]="campana" label="Notificaciones" />';
  readonly t = `import { SiremDuotoneIcon } from 'deorta-sirem-ui';

// SVG de dos capas: opacity 0.2 + sólida, fill currentColor (Phosphor duotone).
readonly casa = '<svg viewBox="0 0 256 256" fill="currentColor"><path opacity="0.2" d="M224 120 128 24 32 120v96a8 8 0 0 0 8 8h176a8 8 0 0 0 8-8Z"/><path d="M224 120 128 24 32 120v96a8 8 0 0 0 8 8h48V152h80v72h48a8 8 0 0 0 8-8Z"/></svg>';
readonly campana = '<svg viewBox="0 0 256 256" fill="currentColor"><path opacity="0.2" d="M221 128a93 93 0 0 1-186 0c0-40 20-66 36-80V40a35 35 0 0 1 70 0v8c16 14 36 40 36 80Z"/><path d="M221 128a93 93 0 0 1-186 0c0-40 20-66 36-80V40a35 35 0 0 1 70 0v8c16 14 36 40 36 80Zm-93 64a24 24 0 0 0 24-24H104a24 24 0 0 0 24 24Z"/></svg>';`;
}
