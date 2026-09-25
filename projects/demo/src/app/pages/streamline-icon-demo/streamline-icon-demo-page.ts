import { Component } from '@angular/core';
import { SiremStreamlineIcon } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-streamline-icon-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremStreamlineIcon],
  template: `
    <app-demo-page-layout title="Streamline Icon" category="Iconos" subtitle="sirem-streamline-icon — SVG oficiales registrados. Flujo en docs/STREAMLINE.md.">
      <app-demo-variant-card title="Por nombre" description="Resuelve del registro provideStreamlineIcons()." [htmlCode]="h1" [tsCode]="t">
        <sirem-streamline-icon name="home-duotone" />
        <sirem-streamline-icon name="calendar-duotone" />
      </app-demo-variant-card>
      <app-demo-variant-card title="SVG directo" description="Sin registro, útil en demos." [htmlCode]="h2" [tsCode]="t">
        <sirem-streamline-icon [svg]="demo" [size]="32" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class StreamlineIconDemoPage {
  readonly demo = '<svg viewBox="0 0 24 24" fill="currentColor"><path opacity="0.2" d="M12 3 3 11v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-9Z"/><path d="M12 3 3 11v9a1 1 0 0 0 1 1h5v-6h6v6h5a1 1 0 0 0 1-1v-9Z"/></svg>';
  readonly h1 = '<sirem-streamline-icon name="home-duotone" />\n<sirem-streamline-icon name="calendar-duotone" />';
  readonly h2 = '<sirem-streamline-icon [svg]="demo" [size]="32" />';
  readonly t = `import { SiremStreamlineIcon, provideStreamlineIcons } from 'deorta-sirem-ui';

// app.config.ts — SVG exportados de streamlinehq.com (Ultimate Duotone)
providers: [provideStreamlineIcons({ 'home-duotone': DEMO_SVG, 'calendar-duotone': DEMO_SVG })]

readonly demo = '<svg viewBox="0 0 24 24" fill="currentColor"><path opacity="0.2" d="M12 3 3 11v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-9Z"/><path d="M12 3 3 11v9a1 1 0 0 0 1 1h5v-6h6v6h5a1 1 0 0 0 1-1v-9Z"/></svg>';`;
}
