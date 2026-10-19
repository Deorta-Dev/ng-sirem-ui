import { Component, computed, input } from '@angular/core';

/** Escala de relleno de cada zona de la tarjeta. */
export type SiremCardPadding = 'none' | 'sm' | 'md' | 'lg';
/** Zona de la tarjeta a la que se le aplica el relleno. */
export type SiremCardPart = 'header' | 'body' | 'footer';

/**
 * Tarjeta contenedora genérica (fichas de paciente, tarjetas de inventario,
 * paneles de configuración…). Encabezado opcional + contenido proyectado.
 *
 * ## Relleno
 * Cada zona (`header`, `body`, `footer`) tiene su propio relleno y puede
 * quedar a cero por completo:
 * ```html
 * <sirem-card
 *   title="Historia clínica"
 *   headerPadding="none"
 *   bodyPadding="lg"
 *   footerPadding="sm">
 *   …
 * </sirem-card>
 * ```
 * `padding` sigue siendo el atajo que fija `body` y `footer` a la vez; los
 * inputs por zona tienen prioridad sobre él. Valores por defecto:
 * `headerPadding="sm"`, `bodyPadding` y `footerPadding` heredan `padding="md"`.
 *
 * ## Visibilidad
 * El header solo aparece si hay `title` o `subtitle`; el footer solo si se
 * proyecta contenido en `slot="footer"`. `[showHeader]` y `[showFooter]`
 * permiten forzar el ocultado aunque el contenido exista.
 *
 * ## Superficie
 * `surface="glass"` da el acabado translúcido de los dashboards.
 *
 * Uso:
 * ```html
 * <sirem-card title="Historia clínica" subtitle="HC-2026-001">…</sirem-card>
 * <sirem-card surface="glass" title="Panel" padding="none">…</sirem-card>
 * <sirem-card title="Tabla" padding="none" footerPadding="sm">…</sirem-card>
 * ```
 */
@Component({
  selector: 'sirem-card',
  standalone: true,
  styleUrl: './sirem-card.scss',
  template: `
    <article
      class="sirem-card"
      [class.sirem-card--glass]="surface() === 'glass'"
      [class.sirem-card--brand]="tone() === 'brand'"
      [class.sirem-card--muted]="tone() === 'muted'"
      [class.sirem-card--sage]="tone() === 'sage'"
      [class.sirem-card--accent]="tone() === 'accent'"
    >
      @if (showHeader() && (title() || subtitle())) {
        <header [class]="'sirem-card__header ' + partClass('header')">
          @if (title()) {
            <h3 class="sirem-card__title">{{ title() }}</h3>
          }
          @if (subtitle()) {
            <p class="sirem-card__subtitle">{{ subtitle() }}</p>
          }
          <ng-content select="[slot='header']" />
        </header>
      }

      <div [class]="'sirem-card__body ' + partClass('body')">
        <ng-content />
      </div>

      @if (showFooter()) {
        <footer [class]="'sirem-card__footer ' + partClass('footer')">
          <ng-content select="[slot='footer']" />
        </footer>
      }
    </article>
  `,
})
export class SiremCard {
  readonly title = input('');
  readonly subtitle = input('');
  /** Superficie sólida (defecto) o translúcida tipo dashboard. */
  readonly surface = input<'solid' | 'glass'>('solid');
  /**
   * Tono de la tarjeta:
   * - `brand`: color de marca con texto claro (banners destacados).
   * - `sage`: tinte salvia, para bloques secundarios del dashboard.
   * - `accent`: tinte lima suave, para el bloque protagonista.
   * - `muted`: gris de panel, para datos neutros.
   */
  readonly tone = input<'default' | 'brand' | 'sage' | 'accent' | 'muted'>('default');
  /**
   * Atajo de relleno para `body` y `footer`. Usa `none` para contenido que
   * toca los bordes (tablas, imágenes, mapas).
   */
  readonly padding = input<SiremCardPadding>('md');
  /** Relleno del encabezado. Defecto `sm`. */
  readonly headerPadding = input<SiremCardPadding>('sm');
  /** Relleno del cuerpo; si es `null` hereda `padding`. */
  readonly bodyPadding = input<SiremCardPadding | null>(null);
  /** Relleno del pie; si es `null` hereda `padding`. */
  readonly footerPadding = input<SiremCardPadding | null>(null);
  /** Muestra el encabezado si hay título o subtítulo. */
  readonly showHeader = input(true);
  /**
   * Muestra el pie. Si no se proyecta nada en `slot="footer"`, el pie se
   * oculta por CSS (`:empty`), de modo que no añade relleno fantasma.
   */
  readonly showFooter = input(true);

  /** Relleno efectivo de una zona, resolviendo la herencia de `padding`. */
  partClass(part: SiremCardPart): string {
    const value =
      part === 'header'
        ? this.headerPadding()
        : part === 'body'
          ? (this.bodyPadding() ?? this.padding())
          : (this.footerPadding() ?? this.padding());
    return `sirem-card__part--${value}`;
  }
}
