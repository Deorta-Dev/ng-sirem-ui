import { Component, effect, input } from '@angular/core';
import { setSiremOverlayZIndex } from './sirem-overlay-layer';

/**
 * Configurador opcional de la capa de overlays.
 *
 * **No hace falta montarlo**: `[siremOverlay]` crea la capa por sí sola la
 * primera vez que se usa, con estilos y `z-index` por defecto. Este componente
 * solo sirve para cambiar el `z-index` (o el color de la capa) de forma
 * declarativa en la app.
 *
 * @example
 * ```html
 * <router-outlet />
 * <sirem-overlay-viewport [zIndex]="1400" />
 * ```
 */
@Component({
  selector: 'sirem-overlay-viewport',
  standalone: true,
  template: '',
})
export class SiremOverlayViewport {
  /** z-index de la capa de overlays. */
  readonly zIndex = input(1200);

  constructor() {
    effect(() => setSiremOverlayZIndex(this.zIndex()));
  }
}
