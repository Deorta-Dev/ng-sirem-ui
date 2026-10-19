import { booleanAttribute, Component, computed, input } from '@angular/core';

/** Semántica de color del badge. */
export type SiremBadgeTone = 'neutral' | 'info' | 'accent' | 'success' | 'warning' | 'danger';

/**
 * Pastilla de estado (última visita, estado CUFE/DIAN, estado de cita,
 * sincronización Xubio…). Con o sin punto.
 */
@Component({
  selector: 'sirem-badge',
  standalone: true,
  styleUrl: './sirem-badge.scss',
  template: `
    <span [class]="classes()" [attr.aria-label]="label() ?? null">
      @if (dot()) {
        <span [class]="'sirem-badge__dot ' + dotClass()" aria-hidden="true"></span>
      }
      <ng-content />
    </span>
  `,
})
export class SiremBadge {
  /** Semántica de color: `neutral`, `info`, `accent`, `success`, `warning` o `danger`. */
  readonly tone = input<SiremBadgeTone>('neutral');
  /** Añade un punto de color a la izquierda del texto. */
  readonly dot = input(false, { transform: booleanAttribute });
  /** Nombre accesible cuando el propio texto del badge no basta. */
  readonly label = input<string | null>(null);

  private readonly tones: Record<SiremBadgeTone, string> = {
    neutral: 'sirem-badge--neutral',
    info: 'sirem-badge--info',
    accent: 'sirem-badge--accent',
    success: 'sirem-badge--success',
    warning: 'sirem-badge--warning',
    danger: 'sirem-badge--danger',
  };

  private readonly dots: Record<SiremBadgeTone, string> = {
    neutral: 'sirem-badge__dot--neutral',
    info: 'sirem-badge__dot--info',
    accent: 'sirem-badge__dot--accent',
    success: 'sirem-badge__dot--success',
    warning: 'sirem-badge__dot--warning',
    danger: 'sirem-badge__dot--danger',
  };

  readonly classes = computed(() => 'sirem-badge ' + this.tones[this.tone()]);
  readonly dotClass = computed(() => this.dots[this.tone()]);
}
