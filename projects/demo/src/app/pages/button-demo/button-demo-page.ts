import { Component, signal } from '@angular/core';
import { SiremButton } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-button-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremButton],
  template: `
    <app-demo-page-layout title="Button" category="Botones" subtitle="sirem-button — variantes, tamaños, iconos y async.">
      <app-demo-variant-card title="Variantes" description="Seis tonos semánticos del sistema." [htmlCode]="h1" [tsCode]="t1">
        <sirem-button variant="primary">Primario</sirem-button>
        <sirem-button variant="secondary">Secundario</sirem-button>
        <sirem-button variant="success">Éxito</sirem-button>
        <sirem-button variant="warning">Aviso</sirem-button>
        <sirem-button variant="ghost">Fantasma</sirem-button>
        <sirem-button variant="danger">Peligro</sirem-button>
      </app-demo-variant-card>
      <app-demo-variant-card title="Tamaños" description="sm compacto, md base (h-10), lg amplio." [htmlCode]="h2" [tsCode]="t1">
        <sirem-button size="sm">Pequeño</sirem-button>
        <sirem-button size="md">Mediano</sirem-button>
        <sirem-button size="lg">Grande</sirem-button>
      </app-demo-variant-card>
      <app-demo-variant-card title="Con icono y solo icono" description="Slot icon con Flaticon; iconOnly para acciones." [htmlCode]="h3" [tsCode]="t1">
        <sirem-button variant="primary"><i slot="icon" class="fi fi-rr-check"></i>Guardar</sirem-button>
        <sirem-button variant="secondary" iconOnly aria-label="Buscar"><i slot="icon" class="fi fi-rr-search"></i></sirem-button>
      </app-demo-variant-card>
      <app-demo-variant-card title="Loading y disabled" description="Carga externa y estado deshabilitado." [htmlCode]="h4" [tsCode]="t2">
        <sirem-button variant="primary" [(loading)]="cargando">Guardar</sirem-button>
        <sirem-button variant="secondary" [disabled]="true">Deshabilitado</sirem-button>
      </app-demo-variant-card>
      <app-demo-variant-card title="Acción async" description="action devuelve Promise; emite finished/failed." [htmlCode]="h5" [tsCode]="t3">
        <sirem-button variant="success" [action]="guardar" (finished)="msg.set('Guardado ✓')" (failed)="msg.set('Falló')">
          Guardar historia
        </sirem-button>
        <span class="text-sm text-slate-600">{{ msg() }}</span>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class ButtonDemoPage {
  readonly cargando = signal(false);
  readonly msg = signal('');
  readonly guardar = () => new Promise((r) => setTimeout(r, 1200));
  readonly h1 = '<sirem-button variant="primary">Primario</sirem-button>\n<sirem-button variant="secondary">Secundario</sirem-button>\n<sirem-button variant="success">Éxito</sirem-button>\n<sirem-button variant="warning">Aviso</sirem-button>\n<sirem-button variant="ghost">Fantasma</sirem-button>\n<sirem-button variant="danger">Peligro</sirem-button>';
  readonly h2 = '<sirem-button size="sm">Pequeño</sirem-button>\n<sirem-button size="md">Mediano</sirem-button>\n<sirem-button size="lg">Grande</sirem-button>';
  readonly h3 = '<sirem-button variant="primary">\n  <i slot="icon" class="fi fi-rr-check"></i>Guardar\n</sirem-button>\n<sirem-button variant="secondary" iconOnly aria-label="Buscar">\n  <i slot="icon" class="fi fi-rr-search"></i>\n</sirem-button>';
  readonly h4 = '<sirem-button variant="primary" [(loading)]="cargando">Guardar</sirem-button>\n<sirem-button variant="secondary" [disabled]="true">Deshabilitado</sirem-button>';
  readonly h5 = '<sirem-button variant="success" [action]="guardar"\n  (finished)="msg.set(\'Guardado ✓\')" (failed)="msg.set(\'Falló\')">\n  Guardar historia\n</sirem-button>';
  readonly t1 = "import { SiremButton } from 'deorta-sirem-ui';";
  readonly t2 = "import { signal } from '@angular/core';\nimport { SiremButton } from 'deorta-sirem-ui';\n\nreadonly cargando = signal(false);";
  readonly t3 = "import { signal } from '@angular/core';\nimport { SiremButton } from 'deorta-sirem-ui';\n\nreadonly msg = signal('');\nreadonly guardar = () => new Promise((r) => setTimeout(r, 1200));";
}
