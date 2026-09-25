import { Component, input } from '@angular/core';
import { SiremBadgeTone } from '../badge/sirem-badge';

export interface SiremTimelineItem {
  title: string;
  description?: string;
  time?: string;
  tone?: SiremBadgeTone;
}

/**
 * Línea de tiempo vertical (histórico del paciente, trazabilidad
 * de documentos, eventos de un dispositivo GPS…).
 */
@Component({
  selector: 'sirem-timeline',
  standalone: true,
  styleUrl: './sirem-timeline.scss',
  template: `
    <ol class="sirem-timeline">
      @for (item of items(); track item.title + item.time) {
        <li class="sirem-timeline__item">
          <span
            [class]="'sirem-timeline__dot ' + dot(item.tone)"
            aria-hidden="true"
          ></span>
          <p class="sirem-timeline__title">{{ item.title }}</p>
          @if (item.time) {
            <p class="sirem-timeline__time">{{ item.time }}</p>
          }
          @if (item.description) {
            <p class="sirem-timeline__description">{{ item.description }}</p>
          }
        </li>
      } @empty {
        <li class="sirem-timeline__empty">Sin eventos registrados.</li>
      }
    </ol>
  `,
})
export class SiremTimeline {
  readonly items = input<SiremTimelineItem[]>([]);

  dot(tone: SiremBadgeTone = 'neutral'): string {
    switch (tone) {
      case 'info':
        return 'sirem-timeline__dot--info';
      case 'success':
        return 'sirem-timeline__dot--success';
      case 'warning':
        return 'sirem-timeline__dot--warning';
      case 'danger':
        return 'sirem-timeline__dot--danger';
      default:
        return 'sirem-timeline__dot--neutral';
    }
  }
}
