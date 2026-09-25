import { Component, signal } from '@angular/core';
import { SiremTopbar, SiremButton, SiremUserMenu } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-topbar-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremTopbar, SiremButton, SiremUserMenu],
  template: `
    <app-demo-page-layout title="Topbar" category="Layout" subtitle="sirem-topbar — barra superior de espacio y acciones.">
      <app-demo-variant-card title="Básica" description="Label de espacio por defecto." [htmlCode]="h1" [tsCode]="t">
        <sirem-topbar />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con acciones" description="Slot actions para botones." [htmlCode]="h2" [tsCode]="t">
        <sirem-topbar spaceLabel="Óptica Norte">
          <div slot="actions" class="flex gap-2">
            <sirem-button size="sm" variant="secondary">Buscar</sirem-button>
          </div>
        </sirem-topbar>
      </app-demo-variant-card>
      <app-demo-variant-card title="Con usuario" description="Slot user con menú de perfil." [htmlCode]="h3" [tsCode]="t">
        <sirem-topbar spaceLabel="SIREM">
          <sirem-user-menu slot="user" userName="María Torres" userDetail="Optómetra" />
        </sirem-topbar>
        <span class="text-sm text-slate-600">Menú: {{ msg() }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card title="Fixed + blur" description="Fija al scroll con fondo translúcido." [htmlCode]="h4" [tsCode]="t">
        <sirem-topbar spaceLabel="SIREM" [fixed]="true" [blur]="true" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class TopbarDemoPage {
  readonly msg = signal('');
  readonly h1 = '<sirem-topbar />';
  readonly h2 = '<sirem-topbar spaceLabel="Óptica Norte">\n  <div slot="actions" class="flex gap-2">\n    <sirem-button size="sm" variant="secondary">Buscar</sirem-button>\n  </div>\n</sirem-topbar>';
  readonly h3 = '<sirem-topbar spaceLabel="SIREM">\n  <sirem-user-menu slot="user" userName="María Torres" userDetail="Optómetra" />\n</sirem-topbar>\n<span class="text-sm text-slate-600">Menú: {{ msg() }}</span>';
  readonly h4 = '<sirem-topbar spaceLabel="SIREM" [fixed]="true" [blur]="true" />';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremTopbar, SiremButton, SiremUserMenu } from 'deorta-sirem-ui';\n\nreadonly msg = signal('');";
}
