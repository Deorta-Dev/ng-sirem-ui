import {
  computeOverlayPosition,
  type SiremOverlayGeometry,
  type SiremOverlayPositionOptions,
} from './sirem-overlay-position';

const VIEWPORT = { width: 1000, height: 800 };

const opts = (over: Partial<SiremOverlayPositionOptions> = {}): SiremOverlayPositionOptions => ({
  placement: 'bottom-start',
  offset: 8,
  viewportPadding: 8,
  flip: true,
  shift: true,
  matchTriggerWidth: false,
  direction: 'ltr',
  ...over,
});

const geo = (
  trigger: Partial<SiremOverlayGeometry['trigger']>,
  overlay: SiremOverlayGeometry['overlay'] = { width: 200, height: 100 },
): SiremOverlayGeometry => ({
  trigger: { top: 300, left: 400, width: 120, height: 32, ...trigger },
  overlay,
  viewport: VIEWPORT,
});

describe('computeOverlayPosition', () => {
  describe('colocación básica', () => {
    it('coloca debajo alineado al inicio con el offset aplicado', () => {
      const r = computeOverlayPosition(geo({ top: 300, left: 400, width: 120, height: 32 }), opts());
      expect(r.x).toBe(400);
      expect(r.y).toBe(300 + 32 + 8);
      expect(r.flipped).toBe(false);
    });

    it('coloca encima aligning por el borde inferior', () => {
      const r = computeOverlayPosition(geo({ top: 300 }), opts({ placement: 'top' }));
      expect(r.y).toBe(300 - 100 - 8);
    });

    it('alinea al centro en el eje cruzado', () => {
      const r = computeOverlayPosition(
        geo({ left: 400, width: 120 }, { width: 200, height: 100 }),
        opts({ placement: 'bottom' }),
      );
      expect(r.x).toBe(400 + (120 - 200) / 2);
    });

    it('alinea al final en el eje cruzado', () => {
      const r = computeOverlayPosition(geo({ left: 400, width: 120 }), opts({ placement: 'bottom-end' }));
      expect(r.x).toBe(400 + 120 - 200);
    });

    it('coloca a la derecha y a la izquierda con su offset', () => {
      expect(computeOverlayPosition(geo({ left: 400, width: 120 }), opts({ placement: 'right' })).x)
        .toBe(400 + 120 + 8);
      expect(computeOverlayPosition(geo({ left: 400, width: 120 }), opts({ placement: 'left' })).x)
        .toBe(400 - 200 - 8);
    });

    it('resuelve inline-start según la dirección de escritura', () => {
      const ltr = computeOverlayPosition(geo({ left: 400, width: 120 }), opts({ placement: 'inline-start' }));
      const rtl = computeOverlayPosition(
        geo({ left: 400, width: 120 }),
        opts({ placement: 'inline-start', direction: 'rtl' }),
      );
      expect(ltr.x).toBe(400 - 200 - 8);
      expect(rtl.x).toBe(400 + 120 + 8);
    });
  });

  describe('nunca toca los bordes', () => {
    it('desplaza a la derecha cuando el panel se sale por la derecha', () => {
      const r = computeOverlayPosition(
        geo({ left: 900, width: 100 }),
        opts({ placement: 'bottom-start' }),
      );
      expect(r.x + 200).toBeLessThanOrEqual(VIEWPORT.width - 8);
      expect(r.shifted).toBe(true);
    });

    it('desplaza hacia dentro cuando el panel se sale por la izquierda', () => {
      const r = computeOverlayPosition(
        geo({ left: 2, width: 100 }),
        opts({ placement: 'bottom-end' }),
      );
      expect(r.x).toBeGreaterThanOrEqual(8);
    });

    it('respeta el margen de viewportPadding exacto', () => {
      const r = computeOverlayPosition(
        geo({ left: 900, width: 100 }),
        opts({ viewportPadding: 24, placement: 'bottom-start' }),
      );
      expect(r.x).toBe(VIEWPORT.width - 24 - 200);
    });

    it('nunca deja el panel fuera por ninguno de los cuatro lados', () => {
      const corners = [
        { top: 0, left: 0 },
        { top: 0, left: 900 },
        { top: 700, left: 0 },
        { top: 700, left: 900 },
      ];
      for (const c of corners) {
        for (const placement of [
          'top',
          'bottom',
          'left',
          'right',
          'top-start',
          'bottom-end',
          'left-start',
          'right-end',
        ] as const) {
          const r = computeOverlayPosition(
            geo({ ...c, width: 120, height: 32 }),
            opts({ placement }),
          );
          expect(r.x).toBeGreaterThanOrEqual(8);
          expect(r.y).toBeGreaterThanOrEqual(8);
          expect(r.x + 200).toBeLessThanOrEqual(VIEWPORT.width - 8);
          expect(r.y + 100).toBeLessThanOrEqual(VIEWPORT.height - 8);
        }
      }
    });
  });

  describe('volteado (flip)', () => {
    it('voltea a arriba cuando no cabe abajo', () => {
      const r = computeOverlayPosition(
        geo({ top: 700, height: 32 }),
        opts({ placement: 'bottom' }),
      );
      expect(r.flipped).toBe(true);
      expect(r.placement).toBe('top');
    });

    it('no voltea si el lado preferido cabe', () => {
      const r = computeOverlayPosition(geo({ top: 300 }), opts({ placement: 'bottom' }));
      expect(r.flipped).toBe(false);
    });

    it('elige el lado con más espacio cuando ninguno cabe', () => {
      // Espacio libre (viewport 1000x800, margen 8), trigger en (700, 500, 20x20):
      //   top 692 · bottom 72 · left 492 · right 472
      // El panel (800x700) no cabe en ninguno: ni por alto (700) ni por ancho (800).
      // Se queda en `top`, que es el de más espacio.
      const r = computeOverlayPosition(
        geo({ top: 700, left: 500, width: 20, height: 20 }, { width: 800, height: 700 }),
        opts({ placement: 'bottom' }),
      );
      expect(r.flipped).toBe(true);
      expect(r.placement).toBe('top');
      expect(r.maxHeight).toBe(800 - 16);
    });

    it('mantiene el lado pedido cuando ya es el de más espacio', () => {
      const r = computeOverlayPosition(
        geo({ top: 700, left: 500, width: 20, height: 20 }, { width: 800, height: 700 }),
        opts({ placement: 'top' }),
      );
      expect(r.placement).toBe('top');
      expect(r.flipped).toBe(false);
    });

    it('no voltea cuando flip está desactivado', () => {
      const r = computeOverlayPosition(
        geo({ top: 700, height: 32 }),
        opts({ placement: 'bottom', flip: false }),
      );
      expect(r.flipped).toBe(false);
      // Aun así se recorta contra el borde inferior, sin salirse.
      expect(r.y + 100).toBeLessThanOrEqual(VIEWPORT.height - 8);
    });
  });

  describe('paneles mayores que el hueco', () => {
    it('acota el tamaño máximo al viewport menos los márgenes', () => {
      const r = computeOverlayPosition(
        geo({ top: 390, left: 490, width: 20, height: 20 }, { width: 2000, height: 2000 }),
        opts(),
      );
      expect(r.maxWidth).toBe(VIEWPORT.width - 16);
      expect(r.maxHeight).toBe(VIEWPORT.height - 16);
    });

    it('ancla contra el borde de inicio en vez de desbordar', () => {
      const r = computeOverlayPosition(
        geo({ top: 0, left: 0, width: 20, height: 20 }, { width: 2000, height: 2000 }),
        opts(),
      );
      expect(r.x).toBe(8);
      expect(r.y).toBe(8);
    });
  });

  describe('ancho igual al disparador', () => {
    it('usa el ancho del trigger para alinear y acotar', () => {
      const r = computeOverlayPosition(
        geo({ left: 400, width: 320 }, { width: 50, height: 100 }),
        opts({ placement: 'bottom-end', matchTriggerWidth: true }),
      );
      // Alinea al final con el ancho del trigger, no con el medido.
      expect(r.x).toBe(400 + 320 - 320);
    });
  });

  describe('desplazamiento desactivado', () => {
    it('permite invadir el borde si shift está apagado, pero nunca lo cruza', () => {
      const r = computeOverlayPosition(
        geo({ left: 900, width: 100 }),
        opts({ placement: 'bottom-start', shift: false }),
      );
      expect(r.x + 200).toBeLessThanOrEqual(VIEWPORT.width - 8);
    });
  });
});
