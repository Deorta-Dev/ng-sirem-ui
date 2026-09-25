import { Component, input } from '@angular/core';

/**
 * Tarjeta contenedora genérica (fichas de paciente, tarjetas de inventario,
 * paneles de configuración…). Encabezado opcional + contenido proyectado.
 * Borde siempre visible; `padding` ajusta el cuerpo (none/sm/md).
 */
@Component({
  selector: 'sirem-card',
  standalone: true,
  styleUrl: './sirem-card.scss',
  template: `
    <article class="sirem-card">
      @if (title() || subtitle()) {
        <header class="sirem-card__header">
          @if (title()) {
            <h3 class="sirem-card__title">{{ title() }}</h3>
          }
          @if (subtitle()) {
            <p class="sirem-card__subtitle">{{ subtitle() }}</p>
          }
        </header>
      }
      <div [class]="'sirem-card__body ' + bodyClass()">
        <ng-content />
      </div>
      <ng-content select="[slot='footer']" />
    </article>
  `,
})
export class SiremCard {
  readonly title = input('');
  readonly subtitle = input('');
  /** Relleno del cuerpo: none (bordes pegados, p. ej. tablas) · sm · md. */
  readonly padding = input<'none' | 'sm' | 'md'>('md');

  bodyClass(): string {
    switch (this.padding()) {
      case 'none':
        return 'sirem-card__body--none';
      case 'sm':
        return 'sirem-card__body--sm';
      default:
        return '';
    }
  }
}
