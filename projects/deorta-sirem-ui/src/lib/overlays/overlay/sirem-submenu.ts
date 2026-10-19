import { DestroyRef, inject, signal, type Signal } from '@angular/core';
import type { SiremOverlayPlacement } from './sirem-overlay-position';
import type { SiremOverlayTriggerType } from './sirem-overlay-trigger';

/**
 * Configuración de submenús en capa de overlays (navbar, sidebar…).
 *
 * Compartida por la navegación jerárquica: todos los componentes abren sus
 * hijos con `SiremOverlayTrigger` y resuelven gesto y colocación con
 * `resolveSiremSubmenu`, así el comportamiento responsivo es idéntico.
 *
 * Por defecto: `hover` en escritorio y `click` en móvil, con `breakpoint` 768.
 */

/** Ajustes del overlay de submenú para una franja de ancho concreto. */
export interface SiremSubmenuBand {
  /** Evento que abre el panel: `hover`, `click`, `dblclick`, `contextmenu`, `longpress` o `manual`. */
  trigger?: SiremOverlayTriggerType;
  /** Lado del ítem por el que sale el panel y su alineación (`bottom-start`, `right-start`…). */
  placement?: SiremOverlayPlacement;
  /** Separación en px entre el ítem y el panel. */
  offset?: number;
  /** Espera con el puntero encima antes de abrir (`hover`). */
  hoverDelayMs?: number;
  /** Espera tras salir del panel antes de cerrar (`hover`); da tiempo a llegar a él. */
  hoverHideDelayMs?: number;
}

/**
 * Configuración de los submenús de un componente de navegación.
 *
 * Cada ajuste se resuelve con esta prioridad: banda activa
 * (`mobile`/`desktop`) → valor común → defecto.
 */
export interface SiremSubmenuConfig extends SiremSubmenuBand {
  /** Ancho en px que separa las bandas: `≤ breakpoint` es móvil. Defecto `768`. */
  breakpoint?: number;
  /** Ajustes solo en pantallas estrechas (≤ `breakpoint`). */
  mobile?: SiremSubmenuBand;
  /** Ajustes solo en pantallas anchas (> `breakpoint`). */
  desktop?: SiremSubmenuBand;
}

/** Opciones ya resueltas para la franja activa: es lo que recibe la directiva. */
export type SiremSubmenuResolved = Required<SiremSubmenuBand>;

/** Ancho que separa móvil de escritorio cuando no se configura `breakpoint`. */
export const DEFAULT_SUBMENU_BREAKPOINT = 768;

/**
 * Fusiona la config con los defectos para la franja activa.
 *
 * @param config Configuración del componente (puede venir vacía).
 * @param viewportWidth Ancho actual del viewport.
 * @param defaultPlacement Lado por defecto según la disposición del componente
 *   (`bottom-start` para barras superiores, `right-start` para rieles laterales).
 */
export function resolveSiremSubmenu(
  config: SiremSubmenuConfig,
  viewportWidth: number,
  defaultPlacement: SiremOverlayPlacement,
): SiremSubmenuResolved {
  const isMobile = viewportWidth <= (config.breakpoint ?? DEFAULT_SUBMENU_BREAKPOINT);
  const band = isMobile ? config.mobile : config.desktop;
  return {
    trigger: band?.trigger ?? config.trigger ?? (isMobile ? 'click' : 'hover'),
    placement: band?.placement ?? config.placement ?? defaultPlacement,
    offset: band?.offset ?? config.offset ?? 8,
    hoverDelayMs: band?.hoverDelayMs ?? config.hoverDelayMs ?? 250,
    hoverHideDelayMs: band?.hoverHideDelayMs ?? config.hoverHideDelayMs ?? 200,
  };
}

/**
 * Signal con el ancho del viewport, actualizado en cada `resize`.
 *
 * Se crea en contexto de inyección (campo o constructor). En SSR no hay
 * `window`: devuelve `0`, que cae en la banda móvil (gesto `click`).
 */
export function injectSiremViewportWidth(): Signal<number> {
  const width = signal(typeof window === 'undefined' ? 0 : window.innerWidth);
  if (typeof window !== 'undefined') {
    const onResize = () => width.set(window.innerWidth);
    window.addEventListener('resize', onResize);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('resize', onResize));
  }
  return width.asReadonly();
}
