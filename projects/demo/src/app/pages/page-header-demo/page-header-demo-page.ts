import { Component, signal } from '@angular/core';
import { SiremPageHeader, SiremButton, SiremSticky } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-page-header-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremPageHeader, SiremButton, SiremSticky],
  template: `
    <app-demo-page-layout title="Page Header" category="Datos" subtitle="sirem-page-header — título, subtítulo y acciones; con sticky configurable y evento al fijarse.">
      <app-demo-variant-card title="Solo título" description="Cabecera mínima." [htmlCode]="h1" [tsCode]="t">
        <sirem-page-header title="Pacientes" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con subtítulo" description="Contexto bajo el título." [htmlCode]="h2" [tsCode]="t">
        <sirem-page-header title="Pacientes" subtitle="1.240 registros · actualizados hoy" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con acciones" description="Slot actions para botones." [htmlCode]="h3" [tsCode]="t">
        <sirem-page-header title="Facturación" subtitle="Septiembre 2026">
          <div slot="actions" class="flex gap-2">
            <sirem-button size="sm" variant="secondary">Exportar</sirem-button>
            <sirem-button size="sm">Nueva factura</sirem-button>
          </div>
        </sirem-page-header>
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Sticky con cambio de piel"
        description="Dentro de un panel con scroll: se fija arriba, pasa a elevated al pegarse y emite (siremStickyChange)."
        [htmlCode]="h4"
        [tsCode]="tSticky"
      >
        <div
          class="h-64 overflow-auto rounded-lg border"
          style="border-color: var(--sirem-border-soft)"
        >
          <sirem-page-header
            title="Pacientes"
            subtitle="1.240 registros · actualizados hoy"
            siremSticky
            (siremStickyChange)="stuck.set($event)"
          >
            <sirem-button slot="actions" size="sm" variant="secondary">Exportar</sirem-button>
          </sirem-page-header>
          <div class="min-h-[22rem] space-y-3 p-4 text-sm text-slate-500">
            <p>Desplaza este panel para ver la cabecera fijarse arriba.</p>
            @for (line of filler; track line) {
              <p>{{ line }}</p>
            }
          </div>
        </div>
        <span class="text-xs font-semibold text-slate-600">
          stuck: {{ stuck() ? 'sí (pegada arriba)' : 'no' }}
        </span>
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Sticky glass"
        description="Aspecto normal transparente y glass al fijarse, con 8px de separación superior."
        [htmlCode]="h5"
        [tsCode]="tSticky"
      >
        <div
          class="h-64 overflow-auto rounded-lg border"
          style="border-color: var(--sirem-border-soft)"
        >
          <sirem-page-header
            title="Agenda"
            subtitle="Semana del 19 al 25 de octubre"
            appearance="flat"
            siremSticky
            [siremStickyOffset]="8"
            stickyAppearance="glass"
            (siremStickyChange)="stuck.set($event)"
          />
          <div class="min-h-[22rem] space-y-3 p-4 text-sm text-slate-500">
            <p>El cristal solo aparece mientras la cabecera está fija.</p>
            @for (line of filler; track line) {
              <p>{{ line }}</p>
            }
          </div>
        </div>
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Límite por componente"
        description="La fijación termina donde empieza el bloque #fin: al llegar, la cabecera lo acompaña y se suelta."
        [htmlCode]="h6"
        [tsCode]="tSticky"
      >
        <div
          class="h-64 overflow-auto rounded-lg border"
          style="border-color: var(--sirem-border-soft)"
        >
          <sirem-page-header
            title="Pacientes"
            subtitle="La cabecera se fija hasta el bloque marcado"
            siremSticky
            [siremStickyBoundary]="fin"
            (siremStickyChange)="stuck.set($event)"
          >
            <sirem-button slot="actions" size="sm" variant="secondary">Exportar</sirem-button>
          </sirem-page-header>
          <div class="space-y-3 p-4 text-sm text-slate-500">
            <p>Desplaza: la cabecera se despega al llegar al bloque «Fin del área fija».</p>
            @for (line of filler; track line) {
              <p>{{ line }}</p>
            }
          </div>
          <!-- Elemento que marca el final de la fijación. -->
          <div
            #fin
            class="mx-4 mb-4 rounded-lg border p-3 text-xs font-semibold"
            style="border-color: var(--sirem-border-soft); background: var(--sirem-surface-alt); color: var(--sirem-text-soft)"
          >
            Fin del área fija
          </div>
          <div class="min-h-[10rem] p-4 text-sm text-slate-500">
            A partir de aquí la cabecera deja de estar fija y sigue al contenido.
          </div>
        </div>
        <span class="text-xs font-semibold text-slate-600">
          stuck: {{ stuck() ? 'sí (pegada)' : 'no' }}
        </span>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class PageHeaderDemoPage {
  readonly stuck = signal(false);
  /** Texto de relleno para que el panel de demo tenga scroll. */
  readonly filler = [
    'La cabecera agrupa título, contexto y acciones de la pantalla.',
    'Al fijarse reserva su aire vertical: el contenido no salta.',
    'Con sticky no hace falta compensar ningún hueco.',
    'El evento (siremStickyChange) permite reaccionar desde la página.',
    'La apariencia de reposo y la de fijado son independientes.',
    'Al soltarse vuelve a su aspecto normal.',
  ];

  readonly h1 = '<sirem-page-header title="Pacientes" />';
  readonly h2 = '<sirem-page-header title="Pacientes"\n  subtitle="1.240 registros · actualizados hoy" />';
  readonly h3 = '<sirem-page-header title="Facturación" subtitle="Septiembre 2026">\n  <div slot="actions" class="flex gap-2">\n    <sirem-button size="sm" variant="secondary">Exportar</sirem-button>\n    <sirem-button size="sm">Nueva factura</sirem-button>\n  </div>\n</sirem-page-header>';
  readonly h4 = `<div class="h-64 overflow-auto">
  <sirem-page-header
    title="Pacientes"
    subtitle="1.240 registros · actualizados hoy"
    siremSticky
    (siremStickyChange)="stuck.set($event)"
  >
    <sirem-button slot="actions" size="sm" variant="secondary">Exportar</sirem-button>
  </sirem-page-header>
  <!-- contenido alto para poder desplazar -->
</div>
<span>stuck: {{ stuck() }}</span>`;
  readonly h5 = `<div class="h-64 overflow-auto">
  <sirem-page-header
    title="Agenda"
    subtitle="Semana del 19 al 25 de octubre"
    appearance="flat"
    siremSticky
    [siremStickyOffset]="8"
    stickyAppearance="glass"
  />
  <!-- contenido alto para poder desplazar -->
</div>`;
  readonly h6 = `<div class="h-64 overflow-auto">
  <sirem-page-header
    title="Pacientes"
    subtitle="La cabecera se fija hasta el bloque marcado"
    siremSticky
    [siremStickyBoundary]="fin"
    (siremStickyChange)="stuck.set($event)"
  >
    <sirem-button slot="actions" size="sm" variant="secondary">Exportar</sirem-button>
  </sirem-page-header>
  <!-- contenido alto para poder desplazar -->
  <div #fin>Fin del área fija</div>
  <!-- más contenido -->
</div>`;
  readonly t = "import { SiremPageHeader, SiremButton } from 'deorta-sirem-ui';";
  readonly tSticky = "import { signal } from '@angular/core';\nimport { SiremPageHeader, SiremButton, SiremSticky } from 'deorta-sirem-ui';\n\nreadonly stuck = signal(false);";
}
