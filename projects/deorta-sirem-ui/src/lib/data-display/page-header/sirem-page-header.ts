import { Component, computed, inject, input } from '@angular/core';
import {
  SIREM_STICKY_STATE,
  type SiremStickyAppearance,
} from '../../layout/sticky/sirem-sticky';

/**
 * Cabecera estandarizada de listados (`lo-resource-set-list`):
 * título + subtítulo descriptivo + acciones proyectadas.
 *
 * ## Sticky
 * La fijación se hace con la directiva **`siremSticky`**, común a topbar,
 * navbar y page-header. Aplícala en el elemento y configura allí el offset,
 * el límite numérico o el componente que marca el final:
 *
 * ```html
 * <sirem-page-header
 *   siremSticky
 *   title="Pacientes"
 *   subtitle="1.240 registros · actualizados hoy"
 *   stickyAppearance="elevated"
 * >…</sirem-page-header>
 * ```
 *
 * `appearance` es la piel normal (`default` transparente, el aspecto clásico)
 * y `stickyAppearance` la piel mientras la directiva la mantiene fija
 * (`elevated` por defecto, para que el contenido no se vea detrás del título).
 */
@Component({
  selector: 'sirem-page-header',
  standalone: true,
  styleUrl: './sirem-page-header.scss',
  template: `
    <div
      class="sirem-page-header"
      [class.sirem-page-header--elevated]="activeAppearance() === 'elevated'"
      [class.sirem-page-header--glass]="activeAppearance() === 'glass'"
      [class.sirem-page-header--flat]="activeAppearance() === 'flat'"
    >
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
  /** Título de la página. */
  readonly title = input.required<string>();
  /** Línea de contexto bajo el título. */
  readonly subtitle = input('');
  /** Aspecto normal: `default` (transparente), `elevated`, `glass` o `flat`. */
  readonly appearance = input<SiremStickyAppearance>('default');
  /**
   * Aspecto **mientras la directiva `siremSticky` la mantiene fija**. `auto`
   * hereda `appearance`; por defecto `elevated`, para que el contenido no se
   * vea detrás del título.
   */
  readonly stickyAppearance = input<'auto' | SiremStickyAppearance>('elevated');
  /** Directiva de fijación aplicada al host, si la hay. */
  private readonly stickyRef = inject(SIREM_STICKY_STATE, {
    optional: true,
    host: true,
  });
  /** `true` mientras la directiva mantiene la cabecera fija. */
  private readonly stuck = computed(() => this.stickyRef?.stuck() ?? false);

  /**
   * Aspecto efectivo: `stickyAppearance` cuando está fija y no es `auto`;
   * en el resto de casos, `appearance`.
   */
  readonly activeAppearance = computed<SiremStickyAppearance>(() => {
    const whenStuck = this.stickyAppearance();
    return this.stuck() && whenStuck !== 'auto' ? whenStuck : this.appearance();
  });
}
