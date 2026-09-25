import { Component, input, output } from '@angular/core';
import { SiremBadgeTone } from '../../data-display/badge/sirem-badge';

/** Fila de telemetría clave → valor (velocidad, batería…). */
export interface SiremPopupRow {
  label: string;
  value: string;
  tone?: SiremBadgeTone;
}

/**
 * Tarjeta flotante ligera para ventanas emergentes de mapa
 * (telemetría GPS: velocidad, batería, última posición…).
 * El posicionamiento lo resuelve la librería de mapas consumidora;
 * este componente solo presenta el contenido.
 */
@Component({
  selector: 'sirem-popup-card',
  standalone: true,
  styleUrl: './sirem-popup-card.scss',
  template: `
    <article class="sirem-popup" role="status">
      <div class="sirem-popup__head">
        <span class="sirem-popup__live" aria-hidden="true"></span>
        <h3 class="sirem-popup__title">{{ title() }}</h3>
        @if (closable()) {
          <button
            type="button"
            (click)="closed.emit()"
            aria-label="Cerrar ventana"
            class="sirem-popup__close"
          >
            ✕
          </button>
        }
      </div>
      <dl class="sirem-popup__rows">
        @for (row of rows(); track row.label) {
          <div class="sirem-popup__row">
            <dt class="sirem-popup__term">{{ row.label }}</dt>
            <dd class="sirem-popup__value">{{ row.value }}</dd>
          </div>
        }
      </dl>
      <ng-content />
    </article>
  `,
})
export class SiremPopupCard {
  /** Identificador del dispositivo (p. ej. placa o IMEI corto). */
  readonly title = input('Dispositivo');
  readonly rows = input<SiremPopupRow[]>([]);
  readonly closable = input(true);

  readonly closed = output<void>();
}
