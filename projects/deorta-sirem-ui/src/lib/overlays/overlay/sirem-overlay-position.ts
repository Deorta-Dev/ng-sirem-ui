/**
 * Motor de posicionamiento de overlays (SIREM).
 *
 * Función pura, sin DOM: recibe la geometría del disparador, la del panel y
 * el espacio disponible, y devuelve coordenadas ya ajustadas para que el panel
 * **nunca toque los bordes** del viewport. Al ser pura se testea de forma
 * exhaustiva sin necesidad de navegador.
 */

/** Lado del disparador por el que sale el panel. */
export type SiremOverlaySide = 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
/** Alineación sobre el eje cruzado. */
export type SiremOverlayAlign = 'start' | 'center' | 'end';
/** Combinación de lado y alineación admitida. */
export type SiremOverlayPlacement =
  | SiremOverlaySide
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end'
  | 'left-start'
  | 'left-center'
  | 'left-end'
  | 'right-start'
  | 'right-center'
  | 'right-end';

/** Geometría mínima (coordenadas de viewport) necesaria para calcular. */
export interface SiremOverlayGeometry {
  /** Rectángulo del elemento disparador. */
  trigger: { top: number; left: number; width: number; height: number };
  /** Tamaño ya medido del panel. */
  overlay: { width: number; height: number };
  /** Espacio visible disponible. */
  viewport: { width: number; height: number };
}

export interface SiremOverlayPositionOptions {
  /** Posición deseada; puede cambiar si hay que voltear. */
  placement: SiremOverlayPlacement;
  /** Separación en px entre el disparador y el panel. */
  offset: number;
  /** Margen mínimo que el panel deja contra cada borde. */
  viewportPadding: number;
  /** Voltea al lado opuesto cuando el preferido no cabe. */
  flip: boolean;
  /** Desplaza en el eje cruzado para no salirse del viewport. */
  shift: boolean;
  /** Iguala el ancho del panel al del disparador. */
  matchTriggerWidth: boolean;
  /** Dirección de escritura, para resolver `inline-start` / `inline-end`. */
  direction: 'ltr' | 'rtl';
}

/** Resultado del cálculo. */
export interface SiremOverlayPositionResult {
  /** Esquina superior izquierda del panel, en coordenadas de viewport. */
  x: number;
  y: number;
  /** Placement realmente aplicado (cambia si hubo `flip`). */
  placement: SiremOverlayPlacement;
  /** `true` si el panel se movió al lado opuesto por falta de espacio. */
  flipped: boolean;
  /** `true` si tuvo que desplazarse en el eje cruzado. */
  shifted: boolean;
  /** Anchos máximos para que un panel mayor que el viewport haga scroll. */
  maxWidth: number;
  maxHeight: number;
}

const OPPOSITE: Record<'top' | 'bottom' | 'left' | 'right', 'top' | 'bottom' | 'left' | 'right'> =
  {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };

/** Lados concretos tras resolver `inline-*` con la dirección de escritura. */
type ResolvedSide = 'top' | 'bottom' | 'left' | 'right';

const isVertical = (side: ResolvedSide) => side === 'left' || side === 'right';

/** Lados válidos, para validar la parte izquierda de un placement. */
const SIDES = [
  'top',
  'bottom',
  'left',
  'right',
  'inline-start',
  'inline-end',
] as const satisfies readonly SiremOverlaySide[];

/** Descompone el placement en lado y alineación. */
function split(placement: SiremOverlayPlacement): {
  side: SiremOverlaySide;
  align: SiremOverlayAlign;
} {
  // `inline-start` e `inline-end` son un único token que ya implica alineación:
  // no deben descomponerse por su guion, o "inline" no sería un lado válido.
  if (placement === 'inline-start') return { side: 'inline-start', align: 'start' };
  if (placement === 'inline-end') return { side: 'inline-end', align: 'end' };

  const i = placement.lastIndexOf('-');
  const tail = i > 0 ? placement.slice(i + 1) : '';
  const head = i > 0 ? placement.slice(0, i) : placement;
  const align: SiremOverlayAlign =
    tail === 'start' || tail === 'center' || tail === 'end' ? tail : 'center';
  const side = (SIDES as readonly string[]).includes(head)
    ? (head as SiremOverlaySide)
    : 'bottom';
  return { side, align };
}

function resolveSide(side: SiremOverlaySide, direction: 'ltr' | 'rtl'): ResolvedSide {
  if (side === 'inline-start') return direction === 'rtl' ? 'right' : 'left';
  if (side === 'inline-end') return direction === 'rtl' ? 'left' : 'right';
  return side;
}

function clamp(value: number, min: number, max: number): number {
  // Si max < min (el panel no cabe ni con el margen) se queda en min.
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/**
 * Calcula la posición del panel.
 *
 * Prioridad de ajustes, en orden:
 * 1. Se coloca en el lado pedido.
 * 2. Si no cabe y `flip` está activo, se prueban los lados adyacentes en el
 *    orden de espacio disponible, y se elige el que más espacio ofrece.
 * 3. Se desplaza en el eje cruzado (`shift`) para no invadir el borde opuesto.
 * 4. Si el panel es más grande que el hueco disponible, se ancla contra el
 *    borde de inicio y se le acota el tamaño (`maxWidth` / `maxHeight`) para
 *    que el contenido desplace en lugar de desbordar.
 */
export function computeOverlayPosition(
  geometry: SiremOverlayGeometry,
  options: SiremOverlayPositionOptions,
): SiremOverlayPositionResult {
  const { trigger, overlay, viewport } = geometry;
  const { placement, offset, viewportPadding: pad, flip, shift, matchTriggerWidth, direction } =
    options;

  const width = matchTriggerWidth ? trigger.width : overlay.width;

  let { side, align } = split(placement);
  let resolved = resolveSide(side, direction);
  const requestedResolved = resolved;

  // Espacio libre del trigger a cada borde del viewport.
  const space: Record<ResolvedSide, number> = {
    top: trigger.top - pad,
    bottom: viewport.height - (trigger.top + trigger.height) - pad,
    left: trigger.left - pad,
    right: viewport.width - (trigger.left + trigger.width) - pad,
  };

  const fits = (s: ResolvedSide) => space[s] >= (isVertical(s) ? width : overlay.height) + offset;

  let flipped = false;
  if (flip && !fits(resolved)) {
    // Se prueban los otros tres lados y se elige el de más espacio.
    const candidates = (Object.keys(space) as ResolvedSide[])
      .filter((s) => s !== requestedResolved)
      .sort((a, b) => space[b] - space[a]);

    for (const candidate of candidates) {
      if (fits(candidate)) {
        resolved = candidate;
        flipped = true;
        break;
      }
    }
    if (!flipped) {
      // Ninguno cabe: se queda en el de más espacio para minimizar el recorte.
      const best = (Object.keys(space) as ResolvedSide[]).sort((a, b) => space[b] - space[a])[0];
      if (best !== requestedResolved && space[best] > space[requestedResolved]) {
        resolved = best;
        flipped = true;
      }
    }
  }

  // Eje principal: coordenada perpendicular al lado.
  let x: number;
  let y: number;
  if (isVertical(resolved)) {
    x =
      resolved === 'right'
        ? trigger.left + trigger.width + offset
        : trigger.left - width - offset;
    y =
      align === 'start'
        ? trigger.top
        : align === 'end'
          ? trigger.top + trigger.height - overlay.height
          : trigger.top + (trigger.height - overlay.height) / 2;
  } else {
    y =
      resolved === 'bottom'
        ? trigger.top + trigger.height + offset
        : trigger.top - overlay.height - offset;
    x =
      align === 'start'
        ? trigger.left
        : align === 'end'
          ? trigger.left + trigger.width - width
          : trigger.left + (trigger.width - width) / 2;
  }

  const originalX = x;
  const originalY = y;

  // Eje cruzado: se mantiene dentro del viewport respetando el margen.
  if (shift) {
    if (isVertical(resolved)) {
      y = clamp(y, pad, viewport.height - overlay.height - pad);
    } else {
      x = clamp(x, pad, viewport.width - width - pad);
    }
  }
  const shifted = x !== originalX || y !== originalY;

  // Tope disponible: un panel mayor que el hueco se ancla y se hace scroll.
  const availableWidth = Math.max(0, viewport.width - pad * 2);
  const availableHeight = Math.max(0, viewport.height - pad * 2);

  if (x < pad) x = pad;
  if (y < pad) y = pad;
  if (x + width > viewport.width - pad) x = Math.max(pad, viewport.width - pad - width);
  if (y + overlay.height > viewport.height - pad) {
    y = Math.max(pad, viewport.height - pad - overlay.height);
  }

  return {
    x,
    y,
    placement: flipped ? (resolved as SiremOverlayPlacement) : placement,
    flipped,
    shifted,
    maxWidth: Math.min(availableWidth, matchTriggerWidth ? Math.max(width, availableWidth) : availableWidth),
    maxHeight: availableHeight,
  };
}
