import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Nivel del breadcrumb. `link` ausente = nivel actual (no clicable). */
export interface SiremCrumb {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  link?: string | any[];
}

/**
 * Ubicación jerárquica (p. ej. Inicio › Clínica › Pacientes).
 */
@Component({
  selector: 'sirem-breadcrumbs',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './sirem-breadcrumbs.scss',
  template: `
    <nav aria-label="Migas de pan">
      <ol class="sirem-crumbs">
        @for (crumb of items(); track crumb.label; let last = $last) {
          <li class="sirem-crumbs__item">
            @if ($index > 0) {
              <span aria-hidden="true" class="sirem-crumbs__sep">›</span>
            }
            @if (!last && crumb.link) {
              <a
                [routerLink]="crumb.link"
                class="sirem-crumbs__link"
              >
                {{ crumb.label }}
              </a>
            } @else {
              <span [attr.aria-current]="last ? 'page' : null" class="sirem-crumbs__current">
                {{ crumb.label }}
              </span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class SiremBreadcrumbs {
  readonly items = input.required<SiremCrumb[]>();
}
