import { Component, HostListener, input, model, output } from '@angular/core';

/**
 * Panel lateral deslizante (navegación de la agenda, detalle de paciente,
 * filtros avanzados…). En móvil ocupa casi todo el ancho.
 */
@Component({
  selector: 'sirem-drawer',
  standalone: true,
  styleUrl: './sirem-drawer.scss',
  template: `
    @if (open()) {
      <div class="sirem-drawer">
        <div
          class="sirem-drawer__backdrop"
          (click)="close()"
          aria-hidden="true"
        ></div>
        <aside
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title()"
          class="sirem-drawer__panel"
          [class.sirem-drawer__panel--right]="side() === 'right'"
          [class.sirem-drawer__panel--left]="side() === 'left'"
        >
          <div class="sirem-drawer__head">
            <h2 class="sirem-drawer__title">
              {{ title() }}
            </h2>
            <button
              type="button"
              (click)="close()"
              aria-label="Cerrar panel"
              class="sirem-drawer__close"
            >
              ✕
            </button>
          </div>
          <div class="sirem-drawer__body">
            <ng-content />
          </div>
          <ng-content select="[slot='footer']" />
        </aside>
      </div>
    }
  `,
})
export class SiremDrawer {
  readonly open = model(false);
  readonly title = input('');
  readonly side = input<'left' | 'right'>('right');

  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.close();
  }

  close(): void {
    this.open.set(false);
    this.closed.emit();
  }
}
