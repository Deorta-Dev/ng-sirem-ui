import { Component } from '@angular/core';
import { SiremEmptyState, SiremButton } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-empty-state-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremEmptyState, SiremButton],
  template: `
    <app-demo-page-layout title="Empty State" category="Datos" subtitle="sirem-empty-state — vacío con icono y acción.">
      <app-demo-variant-card title="Básico" description="Título por defecto." [htmlCode]="h1" [tsCode]="t">
        <sirem-empty-state />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con descripción" description="Explica por qué no hay datos." [htmlCode]="h2" [tsCode]="t">
        <sirem-empty-state title="Sin pacientes" description="No hay registros con ese filtro. Prueba con otro criterio." />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con icono y acción" description="Slots icon y action." [htmlCode]="h3" [tsCode]="t">
        <sirem-empty-state title="Sin resultados" description="Crea el primer paciente para empezar.">
          <i slot="icon" class="fi fi-rr-users"></i>
          <sirem-button slot="action" size="sm">Crear paciente</sirem-button>
        </sirem-empty-state>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class EmptyStateDemoPage {
  readonly h1 = '<sirem-empty-state />';
  readonly h2 = '<sirem-empty-state title="Sin pacientes"\n  description="No hay registros con ese filtro. Prueba con otro criterio." />';
  readonly h3 = '<sirem-empty-state title="Sin resultados"\n  description="Crea el primer paciente para empezar.">\n  <i slot="icon" class="fi fi-rr-users"></i>\n  <sirem-button slot="action" size="sm">Crear paciente</sirem-button>\n</sirem-empty-state>';
  readonly t = "import { SiremEmptyState, SiremButton } from 'deorta-sirem-ui';";
}
