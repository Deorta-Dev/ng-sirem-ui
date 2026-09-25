import { Component, input } from '@angular/core';

/**
 * Cabecera estandarizada de listados (`lo-resource-set-list`):
 * título + subtítulo descriptivo + acciones proyectadas.
 */
@Component({
  selector: 'sirem-page-header',
  standalone: true,
  styleUrl: './sirem-page-header.scss',
  template: `
    <div class="sirem-page-header">
      <div class="sirem-page-header__titles">
        <h1 class="sirem-page-header__title">
          {{ title() }}
        </h1>
        @if (subtitle()) {
          <p class="sirem-page-header__subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="sirem-page-header__actions">
        <ng-content select="[slot='actions']" />
        <ng-content />
      </div>
    </div>
  `,
})
export class SiremPageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
