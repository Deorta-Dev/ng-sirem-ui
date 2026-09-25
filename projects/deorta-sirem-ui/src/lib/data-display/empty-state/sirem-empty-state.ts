import { Component, input } from '@angular/core';

/**
 * Estado vacío de listados (sin pacientes, sin resultados de filtro…).
 */
@Component({
  selector: 'sirem-empty-state',
  standalone: true,
  styleUrl: './sirem-empty-state.scss',
  template: `
    <div class="sirem-empty">
      <div class="sirem-empty__icon" aria-hidden="true">
        <ng-content select="[slot='icon']">∅</ng-content>
      </div>
      <p class="sirem-empty__title">{{ title() }}</p>
      @if (description()) {
        <p class="sirem-empty__description">{{ description() }}</p>
      }
      <div class="sirem-empty__actions">
        <ng-content select="[slot='action']" />
        <ng-content />
      </div>
    </div>
  `,
})
export class SiremEmptyState {
  readonly title = input('Sin resultados');
  readonly description = input('');
}
