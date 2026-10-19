import { InjectionToken, type WritableSignal } from '@angular/core';

/**
 * Lo mínimo que el grupo necesita saber de cada sección: si está abierta.
 * Se usa una interfaz propia (y no la clase) para que el grupo y la sección
 * no se importen entre sí y no haya ciclos.
 */
export interface SiremCollapsiblePeer {
  readonly open: WritableSignal<boolean>;
}

/** API que expone `sirem-collapsible-group` a sus secciones. */
export interface SiremCollapsibleGroupApi {
  register(item: SiremCollapsiblePeer): void;
  unregister(item: SiremCollapsiblePeer): void;
  /** Una sección se abrió: el grupo decide si cierra las demás. */
  opened(item: SiremCollapsiblePeer): void;
}

/**
 * Token del grupo. Con `factory: () => null` una sección suelta puede
 * inyectarlo sin `@Optional` y sin grupo el comportamiento es independiente.
 */
export const SIREM_COLLAPSIBLE_GROUP = new InjectionToken<SiremCollapsibleGroupApi | null>(
  'SIREM_COLLAPSIBLE_GROUP',
  { factory: () => null },
);
