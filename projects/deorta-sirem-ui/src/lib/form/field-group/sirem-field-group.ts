import { Component, input } from '@angular/core';

/**
 * Grupo de campos con título (equivale a `lib-group-field-dynamic`):
 * agrupa campos relacionados dentro de un formulario y los distribuye
 * en la cuadrícula de 12 columnas mediante el `span` de cada campo
 * (ver `sirem-dynamic-form`) o el contenido proyectado.
 *
 * Uso manual:
 * ```html
 * <sirem-field-group title="Datos personales" description="…">
 *   <sirem-input-field label="Nombres" class="col-span-6" ... />
 * </sirem-field-group>
 * ```
 */
@Component({
  selector: 'sirem-field-group',
  standalone: true,
  styleUrl: './sirem-field-group.scss',
  template: `
    <section class="sirem-field-group">
      @if (title()) {
        <h3 class="sirem-field-group__title">{{ title() }}</h3>
      }
      @if (description()) {
        <p class="sirem-field-group__description">{{ description() }}</p>
      }
      <div class="sirem-field-group__grid">
        <ng-content />
      </div>
    </section>
  `,
})
export class SiremFieldGroup {
  readonly title = input('');
  readonly description = input('');
}
