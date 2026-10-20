import { Component } from '@angular/core';
import { SiremCard, SiremButton } from '@deorta-dev/ng-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-card-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremCard, SiremButton],
  template: `
    <app-demo-page-layout title="Card" category="Datos" subtitle="sirem-card — contenedor con header, padding y footer.">
      <app-demo-variant-card title="Solo cuerpo" description="Tarjeta mínima sin título." [htmlCode]="h1" [tsCode]="t">
        <sirem-card><p class="text-sm text-slate-600">Contenido libre de la tarjeta.</p></sirem-card>
      </app-demo-variant-card>
      <app-demo-variant-card title="Con header" description="Título + subtítulo descriptivo." [htmlCode]="h2" [tsCode]="t">
        <sirem-card title="Historia clínica" subtitle="HC-2026-001 · María Torres">
          <p class="text-sm text-slate-600">Motivo de consulta y evolución.</p>
        </sirem-card>
      </app-demo-variant-card>
      <app-demo-variant-card title="Con footer" description="Slot footer para acciones." [htmlCode]="h3" [tsCode]="t">
        <sirem-card title="Factura" subtitle="FAC-1042 · $250.000">
          <p class="text-sm text-slate-600">Detalle de la factura.</p>
          <div slot="footer" class="flex gap-2">
            <sirem-button size="sm" variant="secondary">Cancelar</sirem-button>
            <sirem-button size="sm">Pagar</sirem-button>
          </div>
        </sirem-card>
      </app-demo-variant-card>
      <app-demo-variant-card title="Sin padding" description="padding=none para tablas o mapas." [htmlCode]="h4" [tsCode]="t">
        <sirem-card title="Listado" padding="none"><p class="p-4 text-sm text-slate-600">Aquí iría una tabla sin aire interno.</p></sirem-card>
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Superficie glass"
        description="surface=glass: translúcida con desenfoque, para dashboards."
        [htmlCode]="h5"
        [tsCode]="t"
      >
        <sirem-card surface="glass" title="Panel de control" subtitle="Se adapta al fondo">
          <p class="text-sm text-slate-600">Superficie translúcida con backdrop-filter.</p>
        </sirem-card>
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Padding por zona"
        description="headerPadding, bodyPadding y footerPadding independientes; none las deja a cero."
        [htmlCode]="h6"
        [tsCode]="t"
      >
        <sirem-card
          title="Historial"
          subtitle="Sin aire en el encabezado"
          headerPadding="none"
          bodyPadding="lg"
          footerPadding="sm"
        >
          <p class="text-sm text-slate-600">Cuerpo con relleno amplio.</p>
          <div slot="footer" class="flex justify-end">
            <sirem-button size="sm" variant="secondary">Cerrar</sirem-button>
          </div>
        </sirem-card>
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Ocultar header y footer"
        description="showHeader y showFooter a false ocultan la zona aunque haya contenido."
        [htmlCode]="h7"
        [tsCode]="t"
      >
        <sirem-card
          title="Se oculta"
          subtitle="También esto"
          [showHeader]="false"
          [showFooter]="false"
        >
          <p class="text-sm text-slate-600">Solo el cuerpo.</p>
          <div slot="footer" class="text-xs text-slate-400">Pie oculto</div>
        </sirem-card>
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Slot header"
        description="Proyecta acciones en el encabezado con slot=header."
        [htmlCode]="h8"
        [tsCode]="t"
      >
        <sirem-card title="Pacientes" subtitle="1.240 activos" bodyPadding="sm">
          <span slot="header" class="ml-auto">
            <sirem-button size="sm" variant="ghost" iconOnly aria-label="Filtrar">
              <i slot="icon" class="fi fi-rr-filter"></i>
            </sirem-button>
          </span>
          <p class="text-sm text-slate-600">Listado de pacientes.</p>
        </sirem-card>
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Tonos Bento"
        description="tone='sage' | 'accent' | 'muted' para las tarjetas pastel del dashboard."
        [htmlCode]="h9"
        [tsCode]="t"
      >
        <div class="grid w-full gap-4 sm:grid-cols-3">
          <sirem-card tone="sage" title="Total Spend" subtitle="Bloque secundario">
            <p class="text-lg font-bold text-slate-900 dark:text-slate-100">$59,638</p>
          </sirem-card>
          <sirem-card tone="accent" title="Ahorro" subtitle="Bloque protagonista">
            <p class="text-lg font-bold text-slate-900 dark:text-slate-100">$990</p>
          </sirem-card>
          <sirem-card tone="muted" title="Balance" subtitle="Datos neutros">
            <p class="text-lg font-bold text-slate-900 dark:text-slate-100">$0.8</p>
          </sirem-card>
        </div>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class CardDemoPage {
  readonly h1 = '<sirem-card>\n  <p class="text-sm text-slate-600">Contenido libre de la tarjeta.</p>\n</sirem-card>';
  readonly h2 = '<sirem-card title="Historia clínica" subtitle="HC-2026-001 · María Torres">\n  <p class="text-sm text-slate-600">Motivo de consulta y evolución.</p>\n</sirem-card>';
  readonly h3 = '<sirem-card title="Factura" subtitle="FAC-1042 · $250.000">\n  <p class="text-sm text-slate-600">Detalle de la factura.</p>\n  <div slot="footer" class="flex gap-2">\n    <sirem-button size="sm" variant="secondary">Cancelar</sirem-button>\n    <sirem-button size="sm">Pagar</sirem-button>\n  </div>\n</sirem-card>';
  readonly h4 = '<sirem-card title="Listado" padding="none">\n  <p class="p-4 text-sm text-slate-600">Aquí iría una tabla sin aire interno.</p>\n</sirem-card>';
  readonly h5 = '<sirem-card surface="glass" title="Panel de control" subtitle="Se adapta al fondo">\n  <p class="text-sm text-slate-600">Superficie translúcida con backdrop-filter.</p>\n</sirem-card>';
  readonly h6 = '<sirem-card title="Historial" subtitle="Sin aire en el encabezado"\n  headerPadding="none" bodyPadding="lg" footerPadding="sm">\n  <p class="text-sm text-slate-600">Cuerpo con relleno amplio.</p>\n  <div slot="footer" class="flex justify-end">\n    <sirem-button size="sm" variant="secondary">Cerrar</sirem-button>\n  </div>\n</sirem-card>';
  readonly h7 = '<sirem-card title="Se oculta" subtitle="También esto"\n  [showHeader]="false" [showFooter]="false">\n  <p class="text-sm text-slate-600">Solo el cuerpo.</p>\n  <div slot="footer" class="text-xs text-slate-400">Pie oculto</div>\n</sirem-card>';
  readonly h8 = '<sirem-card title="Pacientes" subtitle="1.240 activos" bodyPadding="sm">\n  <span slot="header" class="ml-auto">\n    <sirem-button size="sm" variant="ghost" iconOnly aria-label="Filtrar">\n      <i slot="icon" class="fi fi-rr-filter"></i>\n    </sirem-button>\n  </span>\n  <p class="text-sm text-slate-600">Listado de pacientes.</p>\n</sirem-card>';
  readonly t = "import { SiremCard, SiremButton } from '@deorta-dev/ng-sirem-ui';";
  readonly h9 = '<sirem-card tone="sage" title="Total Spend" subtitle="Bloque secundario" />\n<sirem-card tone="accent" title="Ahorro" subtitle="Bloque protagonista" />\n<sirem-card tone="muted" title="Balance" subtitle="Datos neutros" />';
}
