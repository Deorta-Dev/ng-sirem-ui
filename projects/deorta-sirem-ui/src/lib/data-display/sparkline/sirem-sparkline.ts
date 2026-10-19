import { Component, computed, input } from '@angular/core';

/** Forma de la minigráfica (área, línea o barras). */
export type SiremSparklineVariant = 'bar' | 'line';
/** Color semántico de la minigráfica. */
export type SiremSparklineTone = 'neutral' | 'accent' | 'sage' | 'danger';

/**
 * Minigráfico sin ejes (sparkline) para KPIs dentro de una tarjeta.
 *
 * - `variant="bar"` (defecto): barras tipo píldora, ideal para el Bento.
 * - `variant="line"`: polilínea suave, para tendencias.
 * - `highlight`: índice de la barra/punto destacado (p. ej. el valor actual,
 *   que se pinta con el acento del tono).
 * - `tone`: color del resalte (`neutral` = tinta, `accent` = lima, `sage`,
 *   `danger`). Las barras no resaltadas quedan muy tenues.
 *
 * Uso:
 * ```html
 * <sirem-sparkline [data]="[4, 9, 6, 12, 8]" [highlight]="3" label="Costes" />
 * <sirem-sparkline variant="line" tone="accent" [data]="ventas" [height]="56" />
 * ```
 */
@Component({
  selector: 'sirem-sparkline',
  standalone: true,
  styleUrl: './sirem-sparkline.scss',
  template: `
    <div
      class="sirem-spark"
      [class.sirem-spark--line]="variant() === 'line'"
      [class.sirem-spark--accent]="tone() === 'accent'"
      [class.sirem-spark--sage]="tone() === 'sage'"
      [class.sirem-spark--danger]="tone() === 'danger'"
      [style.height.px]="height()"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label()"
      [attr.aria-hidden]="label() ? null : 'true'"
    >
      @if (variant() === 'line') {
        <svg
          class="sirem-spark__svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline class="sirem-spark__line" pathLength="1" [attr.points]="points()" />
        </svg>
      } @else {
        @for (bar of bars(); track $index) {
          <span
            class="sirem-spark__bar"
            [class.sirem-spark__bar--on]="highlight() === $index"
            [style.height.%]="bar"
          ></span>
        }
      }
    </div>
  `,
})
export class SiremSparkline {
  /** Serie de valores (positivos). */
  readonly data = input.required<number[]>();
  /** Barras (defecto) o línea. */
  readonly variant = input<SiremSparklineVariant>('bar');
  /** Color del valor destacado. */
  readonly tone = input<SiremSparklineTone>('neutral');
  /** Índice destacado; `null` los deja todos tenues. */
  readonly highlight = input<number | null>(null);
  /** Alto en px. */
  readonly height = input(40);
  /** Etiqueta accesible; sin ella el gráfico es decorativo. */
  readonly label = input<string | null>(null);

  /** Alturas en % (mínimo 8 % para que un valor bajo siga visible). */
  readonly bars = computed<number[]>(() => {
    const data = this.data();
    const max = Math.max(...data, 1);
    return data.map((value) => Math.max(8, Math.round((value / max) * 100)));
  });

  /** Polilínea normalizada al viewBox 0..100 con margen vertical. */
  readonly points = computed<string>(() => {
    const data = this.data();
    if (data.length === 0) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const step = data.length > 1 ? 100 / (data.length - 1) : 0;
    return data
      .map((value, index) => {
        const x = (index * step).toFixed(2);
        const y = (92 - ((value - min) / span) * 84).toFixed(2);
        return `${x},${y}`;
      })
      .join(' ');
  });
}
