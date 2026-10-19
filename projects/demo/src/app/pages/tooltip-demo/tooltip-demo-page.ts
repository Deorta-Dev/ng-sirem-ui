import { Component } from '@angular/core';
import { SiremButton, SiremFiIcon, SiremTooltipDirective } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-tooltip-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremButton, SiremFiIcon, SiremTooltipDirective],
  template: `
    <app-demo-page-layout
      title="Tooltip"
      category="Overlays"
      subtitle="[siremTooltip] — globo oscuro flotante con flecha, al pasar el ratón o enfocar."
    >
      <app-demo-variant-card
        title="Posiciones"
        description="'siremTooltipPlacement' coloca el globo arriba, abajo, izquierda o derecha."
        [htmlCode]="h1"
        [tsCode]="t1"
      >
        <sirem-button [siremTooltip]="'Arriba'">Top</sirem-button>
        <sirem-button [siremTooltip]="'Abajo'" siremTooltipPlacement="bottom">Bottom</sirem-button>
        <sirem-button [siremTooltip]="'Izquierda'" siremTooltipPlacement="left">Left</sirem-button>
        <sirem-button [siremTooltip]="'Derecha'" siremTooltipPlacement="right">Right</sirem-button>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Rail de iconos"
        description="El uso del dashboard Bento: solo el icono y el nombre al pasar el ratón."
        [htmlCode]="h2"
        [tsCode]="t2"
      >
        <div style="display: inline-flex; flex-direction: column; gap: 0.5rem">
          @for (item of rail; track item.label) {
            <button
              type="button"
              [siremTooltip]="item.label"
              siremTooltipPlacement="right"
              [attr.aria-label]="item.label"
              style="
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 2.75rem;
                height: 2.75rem;
                border: 0;
                border-radius: var(--sirem-radius-md);
                background: var(--sirem-surface-alt);
                color: var(--sirem-text);
                cursor: pointer;
              "
            >
              <sirem-fi-icon [name]="item.icon" />
            </button>
          }
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Retardo y desactivado"
        description="'siremTooltipDelay' en ms y 'siremTooltipDisabled' para apagarlo en un contexto."
        [htmlCode]="h3"
        [tsCode]="t3"
      >
        <sirem-button [siremTooltip]="'Instantáneo'" [siremTooltipDelay]="0">Sin retardo</sirem-button>
        <sirem-button [siremTooltip]="'No debería verse'" [siremTooltipDisabled]="true">
          Desactivado
        </sirem-button>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class TooltipDemoPage {
  readonly rail = [
    { label: 'Inicio', icon: 'rr-home' },
    { label: 'Explorar', icon: 'rr-compass' },
    { label: 'Equipo', icon: 'rr-users' },
  ];

  readonly t1 = `import { SiremTooltipDirective } from 'deorta-sirem-ui';`;

  readonly t2 = `readonly rail = [
  { label: 'Inicio', icon: 'rr-home' },
  { label: 'Explorar', icon: 'rr-compass' },
  { label: 'Equipo', icon: 'rr-users' },
];`;

  readonly t3 = `import { SiremTooltipDirective } from 'deorta-sirem-ui';`;

  readonly h1 = `<sirem-button [siremTooltip]="'Arriba'">Top</sirem-button>
<sirem-button [siremTooltip]="'Abajo'" siremTooltipPlacement="bottom">Bottom</sirem-button>
<sirem-button [siremTooltip]="'Izquierda'" siremTooltipPlacement="left">Left</sirem-button>
<sirem-button [siremTooltip]="'Derecha'" siremTooltipPlacement="right">Right</sirem-button>`;

  readonly h2 = `@for (item of rail; track item.label) {
  <button
    type="button"
    [siremTooltip]="item.label"
    siremTooltipPlacement="right"
    [attr.aria-label]="item.label"
  >
    <sirem-fi-icon [name]="item.icon" />
  </button>
}`;

  readonly h3 = `<sirem-button [siremTooltip]="'Instantáneo'" [siremTooltipDelay]="0">Sin retardo</sirem-button>
<sirem-button [siremTooltip]="'No debería verse'" [siremTooltipDisabled]="true">Desactivado</sirem-button>`;
}
