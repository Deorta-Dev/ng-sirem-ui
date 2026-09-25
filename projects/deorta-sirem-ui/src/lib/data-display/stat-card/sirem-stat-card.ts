import { Component, computed, input } from '@angular/core';

/**
 * Tarjeta KPI (total pacientes, facturado del mes, cartera vencida…).
 *
 * `variant="solid"` la pinta a color pleno (`color`: brand, info,
 * success, warning o danger) con texto blanco; `variant="soft"`
 * (defecto) es la tarjeta clara habitual.
 *
 * Uso:
 * ```html
 * <sirem-stat-card label="Citas hoy" value="32" [delta]="5" />
 * <sirem-stat-card label="Urgencias" value="7" variant="solid" color="danger">
 *   <i slot="icon" class="fi fi-rr-siren"></i>
 * </sirem-stat-card>
 * ```
 */
@Component({
  selector: 'sirem-stat-card',
  standalone: true,
  styleUrl: './sirem-stat-card.scss',
  template: `
    <article class="sirem-stat" [class]="toneClass()">
      <div class="sirem-stat__head">
        <ng-content select="[slot='icon']" />
        <p class="sirem-stat__label">{{ label() }}</p>
      </div>
      <p class="sirem-stat__value">{{ value() }}</p>
      @if (delta() !== null) {
        <p class="sirem-stat__delta" [class]="deltaClass()">
          {{ deltaPrefix() }}{{ absDelta() }} % vs. periodo anterior
        </p>
      }
      <ng-content />
    </article>
  `,
})
export class SiremStatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  /** Variación porcentual; null la oculta. */
  readonly delta = input<number | null>(null);
  /** `soft` (clara) o `solid` (color pleno). */
  readonly variant = input<'soft' | 'solid'>('soft');
  /** Color pleno cuando `variant="solid"`. */
  readonly color = input<'brand' | 'info' | 'success' | 'warning' | 'danger'>('brand');

  readonly absDelta = computed(() => Math.abs(this.delta() ?? 0).toFixed(1));
  readonly deltaPrefix = computed(() => ((this.delta() ?? 0) >= 0 ? '+' : '−'));
  readonly deltaClass = computed(() =>
    (this.delta() ?? 0) >= 0 ? 'sirem-stat__delta--up' : 'sirem-stat__delta--down',
  );
  readonly toneClass = computed(() =>
    this.variant() === 'solid' ? `sirem-stat--solid sirem-stat--${this.color()}` : '',
  );
}
