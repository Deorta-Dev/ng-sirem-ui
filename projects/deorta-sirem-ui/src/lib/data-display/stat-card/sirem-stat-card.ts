import { Component, computed, input } from '@angular/core';

/**
 * Tarjeta KPI (total pacientes, facturado del mes, cartera vencida…).
 *
 * - `variant="soft"` (defecto): tarjeta clara habitual.
 * - `variant="tint"`: fondo pastel del tono `color` con icono en chip.
 * - `variant="solid"`: color pleno con texto de contraste.
 * - `surface="glass"`: superficie translúcida con desenfoque.
 *
 * `color="accent"` usa el acento lima de marca (con texto tinta encima).
 *
 * El icono proyectado en `slot="icon"` se pinta en un chip redondeado del
 * mismo tono que la tarjeta.
 *
 * - `size="sm"` compacta relleno y tipografía (filas de KPIs dentro de un Bento).
 * - `deltaLabel` controla el texto que sigue al porcentaje; vacío lo deja solo
 *   en `+12,4 %`.
 *
 * Uso:
 * ```html
 * <sirem-stat-card label="Citas hoy" value="32" [delta]="5" />
 * <sirem-stat-card size="sm" label="Costes" value="4.9k" [delta]="28.3" deltaLabel="" />
 * <sirem-stat-card label="Facturado" value="$18,5 M" variant="tint" color="success">
 *   <i slot="icon" class="fi fi-rr-wallet"></i>
 * </sirem-stat-card>
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
    <article class="sirem-stat" [class]="rootClass()">
      <div class="sirem-stat__head">
        <span class="sirem-stat__icon">
          <ng-content select="[slot='icon']" />
        </span>
        <p class="sirem-stat__label">{{ label() }}</p>
      </div>
      <p class="sirem-stat__value">{{ value() }}</p>
      @if (delta() !== null) {
        <p class="sirem-stat__delta" [class]="deltaClass()">
          {{ deltaPrefix() }}{{ absDelta() }} %{{ deltaLabel() ? ' ' + deltaLabel() : '' }}
        </p>
      }
      <ng-content />
    </article>
  `,
})
export class SiremStatCard {
  /** Título de la métrica (p. ej. «Pacientes activos»). */
  readonly label = input.required<string>();
  /** Valor principal, ya formateado (`'1.248'`, `'98 %'`…). */
  readonly value = input.required<string | number>();
  /** Variación porcentual; null la oculta. */
  readonly delta = input<number | null>(null);
  /**
   * Texto que acompaña a la variación (`+12.4 % vs. periodo anterior`).
   * Vacío deja solo el porcentaje.
   */
  readonly deltaLabel = input('vs. periodo anterior');
  /** `md` (defecto) o `sm`: compacta, para filas de KPIs. */
  readonly size = input<'md' | 'sm'>('md');
  /** `soft` (clara), `tint` (pastel) o `solid` (color pleno). */
  readonly variant = input<'soft' | 'tint' | 'solid'>('soft');
  /** Superficie sólida (defecto) o translúcida. */
  readonly surface = input<'solid' | 'glass'>('solid');
  /** Color para `variant="solid"` o `variant="tint"`. */
  readonly color = input<'brand' | 'accent' | 'info' | 'success' | 'warning' | 'danger'>('brand');

  readonly absDelta = computed(() => Math.abs(this.delta() ?? 0).toFixed(1));
  readonly deltaPrefix = computed(() => ((this.delta() ?? 0) >= 0 ? '+' : '−'));
  readonly deltaClass = computed(() =>
    (this.delta() ?? 0) >= 0 ? 'sirem-stat__delta--up' : 'sirem-stat__delta--down',
  );
  readonly rootClass = computed(() => {
    const classes: string[] = [];
    if (this.size() === 'sm') {
      classes.push('sirem-stat--sm');
    }
    if (this.surface() === 'glass') {
      classes.push('sirem-stat--glass');
    }
    if (this.variant() === 'solid') {
      classes.push('sirem-stat--solid', `sirem-stat--${this.color()}`);
    }
    if (this.variant() === 'tint') {
      classes.push('sirem-stat--tint', `sirem-stat--tint-${this.color()}`);
    }
    return classes.join(' ');
  });
}
