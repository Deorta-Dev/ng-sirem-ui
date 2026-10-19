import { Component, signal } from '@angular/core';
import { SiremBadge, SiremCollapsible, SiremCollapsibleGroup } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-collapsible-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremCollapsible, SiremCollapsibleGroup, SiremBadge],
  template: `
    <app-demo-page-layout
      title="Collapsible"
      category="Layout"
      subtitle="sirem-collapsible — sección plegable con variantes de carta y acordeón."
    >
      <app-demo-variant-card
        title="Carta con fondo (defecto)"
        description="variant='card' + background: marco Bento, cabecera con acción y alto animado."
        [htmlCode]="h1"
        [tsCode]="t1"
      >
        <sirem-collapsible
          title="Datos del paciente"
          subtitle="HC-2026-001 · María Torres"
          icon="fi fi-rr-user"
          [(open)]="datos"
        >
          <span slot="actions"><sirem-badge tone="success">Nuevo</sirem-badge></span>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Motivo de consulta, evolución y observaciones. El contenido se despliega sin
            saltos: la sección anima su alto y el foco no entra en lo que está cerrado.
          </p>
        </sirem-collapsible>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Sin carta y sin fondo"
        description="variant='plain' + [background]='false': solo cabecera y contenido."
        [htmlCode]="h2"
        [tsCode]="t2"
      >
        <div class="w-full rounded-2xl bg-slate-200/70 p-3 dark:bg-slate-700/50">
          <sirem-collapsible
            title="Filtros avanzados"
            variant="plain"
            [background]="false"
            [(open)]="filtros"
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              Sin marco ni superficie: se apoya en el contenedor que ya tiene el color.
            </p>
          </sirem-collapsible>
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Acordeón"
        description="sirem-collapsible-group: abrir una sección cierra las demás."
        [htmlCode]="h3"
        [tsCode]="t3"
      >
        <sirem-collapsible-group>
          <sirem-collapsible title="Motivo de consulta" icon="fi fi-rr-comment" [open]="true">
            <p class="text-sm text-slate-600 dark:text-slate-400">
              Visión borrosa de lejos en el ojo derecho desde hace dos semanas.
            </p>
          </sirem-collapsible>
          <sirem-collapsible title="Antecedentes" icon="fi fi-rr-clipboard-list">
            <p class="text-sm text-slate-600 dark:text-slate-400">
              Sin cirugías previas. Usa lentes desde los 12 años.
            </p>
          </sirem-collapsible>
          <sirem-collapsible title="Examen" icon="fi fi-rr-eye">
            <p class="text-sm text-slate-600 dark:text-slate-400">
              AV OD 0.8, OI 1.0. Refracción y biomicroscopía sin hallazgos.
            </p>
          </sirem-collapsible>
        </sirem-collapsible-group>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Independientes"
        description="[accordion]='false': cada sección se abre y cierra por su cuenta."
        [htmlCode]="h4"
        [tsCode]="t4"
      >
        <sirem-collapsible-group [accordion]="false">
          <sirem-collapsible title="Cobertura" variant="plain">
            <p class="text-sm text-slate-600 dark:text-slate-400">Plan complementario activo.</p>
          </sirem-collapsible>
          <sirem-collapsible title="Autorización" variant="plain">
            <p class="text-sm text-slate-600 dark:text-slate-400">Vigente hasta 12/2026.</p>
          </sirem-collapsible>
        </sirem-collapsible-group>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class CollapsibleDemoPage {
  readonly datos = signal(true);
  readonly filtros = signal(false);

  readonly t1 = `import { signal } from '@angular/core';
import { SiremCollapsible } from 'deorta-sirem-ui';

readonly datos = signal(true);`;

  readonly h1 = `<sirem-collapsible title="Datos del paciente" subtitle="HC-2026-001" icon="fi fi-rr-user" [(open)]="datos">
  <span slot="actions"><sirem-badge tone="success">Nuevo</sirem-badge></span>
  …
</sirem-collapsible>`;

  readonly t2 = `import { signal } from '@angular/core';
import { SiremCollapsible } from 'deorta-sirem-ui';

readonly filtros = signal(false);`;

  readonly h2 = `<sirem-collapsible title="Filtros avanzados" variant="plain" [background]="false" [(open)]="filtros">
  …
</sirem-collapsible>`;

  readonly t3 = `import { SiremCollapsible, SiremCollapsibleGroup } from 'deorta-sirem-ui';`;

  readonly h3 = `<sirem-collapsible-group>
  <sirem-collapsible title="Motivo de consulta">…</sirem-collapsible>
  <sirem-collapsible title="Antecedentes">…</sirem-collapsible>
  <sirem-collapsible title="Examen">…</sirem-collapsible>
</sirem-collapsible-group>`;

  readonly t4 = `import { SiremCollapsible, SiremCollapsibleGroup } from 'deorta-sirem-ui';`;

  readonly h4 = `<sirem-collapsible-group [accordion]="false">
  <sirem-collapsible title="Cobertura" variant="plain">…</sirem-collapsible>
  <sirem-collapsible title="Autorización" variant="plain">…</sirem-collapsible>
</sirem-collapsible-group>`;
}
