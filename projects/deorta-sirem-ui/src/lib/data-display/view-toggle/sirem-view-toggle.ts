import { Component, model } from '@angular/core';

export type SiremViewMode = 'table' | 'cards';

/**
 * Switch Tabla ⇄ Tarjetas de los listados.
 */
@Component({
  selector: 'sirem-view-toggle',
  standalone: true,
  styleUrl: './sirem-view-toggle.scss',
  template: `
    <div
      role="group"
      aria-label="Cambiar vista"
      class="sirem-view-toggle"
    >
      <button
        type="button"
        (click)="view.set('table')"
        [attr.aria-pressed]="view() === 'table'"
        class="sirem-view-toggle__btn"
        [class.sirem-view-toggle__btn--active]="view() === 'table'"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 3.5h12M2 8h12M2 12.5h12" /></svg>
        Tabla
      </button>
      <button
        type="button"
        (click)="view.set('cards')"
        [attr.aria-pressed]="view() === 'cards'"
        class="sirem-view-toggle__btn"
        [class.sirem-view-toggle__btn--active]="view() === 'cards'"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" /><rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" /></svg>
        Tarjetas
      </button>
    </div>
  `,
})
export class SiremViewToggle {
  readonly view = model<SiremViewMode>('table');
}
