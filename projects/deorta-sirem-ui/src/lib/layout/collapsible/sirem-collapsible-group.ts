import { Component, forwardRef, input } from '@angular/core';
import {
  SIREM_COLLAPSIBLE_GROUP,
  type SiremCollapsibleGroupApi,
  type SiremCollapsiblePeer,
} from './sirem-collapsible.tokens';

/**
 * Agrupador de secciones `sirem-collapsible`.
 *
 * - Con `[accordion]="true"` (defecto) solo queda **una sección abierta**:
 *   al abrir una, el grupo cierra las demás.
 * - Con `[accordion]="false"` cada sección se abre y cierra por su cuenta.
 *
 * El grupo no pinta nada: la carta o el estilo los pone cada sección con su
 * `variant`, así se pueden mezclar estilos dentro del mismo grupo.
 *
 * Uso:
 * ```html
 * <sirem-collapsible-group>
 *   <sirem-collapsible title="Datos del paciente" [(open)]="datos">…</sirem-collapsible>
 *   <sirem-collapsible title="Antecedentes" [(open)]="antecedentes">…</sirem-collapsible>
 * </sirem-collapsible-group>
 *
 * <sirem-collapsible-group [accordion]="false">
 *   …
 * </sirem-collapsible-group>
 * ```
 */
@Component({
  selector: 'sirem-collapsible-group',
  standalone: true,
  styleUrl: './sirem-collapsible-group.scss',
  providers: [
    { provide: SIREM_COLLAPSIBLE_GROUP, useExisting: forwardRef(() => SiremCollapsibleGroup) },
  ],
  template: `
    <div class="sirem-collapsible-group" role="presentation">
      <ng-content />
    </div>
  `,
})
export class SiremCollapsibleGroup implements SiremCollapsibleGroupApi {
  /** Solo una sección abierta a la vez (comportamiento de acordeón). */
  readonly accordion = input(true);

  private readonly items: SiremCollapsiblePeer[] = [];

  register(item: SiremCollapsiblePeer): void {
    if (!this.items.includes(item)) this.items.push(item);
  }

  unregister(item: SiremCollapsiblePeer): void {
    const index = this.items.indexOf(item);
    if (index >= 0) this.items.splice(index, 1);
  }

  opened(item: SiremCollapsiblePeer): void {
    if (!this.accordion()) return;
    for (const other of this.items) {
      if (other !== item && other.open()) other.open.set(false);
    }
  }
}
