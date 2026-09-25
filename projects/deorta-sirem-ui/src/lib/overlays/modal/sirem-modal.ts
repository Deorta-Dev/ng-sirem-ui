import { Component, HostListener, computed, input, model, output } from '@angular/core';
import { SiremButton, SiremButtonSize, SiremButtonVariant } from '../../button/sirem-button';

export type SiremModalSize = 'sm' | 'md' | 'lg' | 'xl';
export type SiremModalActionsAlign = 'start' | 'center' | 'end' | 'stretch';

/** Botón del footer declarativo del modal. */
export interface SiremModalAction {
  label: string;
  /** Variante visual (defecto `secondary`). */
  variant?: SiremButtonVariant;
  /** Tamaño (defecto `sm`). */
  size?: SiremButtonSize;
  /** Clase CSS del icono en `slot="icon"` (p. ej. `fi fi-rr-check`). */
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

/**
 * Diálogo modal genérico (CRUD sin recargar página:
 * equivale a `ElementModalFormDynamicComponent`).
 *
 * Botones configurables con `actions` (se pintan en un footer con
 * padding, borde superior y alineación) o footer 100% libre con
 * `slot="footer"` (recibe el mismo contenedor con estilo):
 *
 * Uso:
 * ```html
 * <sirem-modal [(open)]="editar" title="Editar paciente" size="lg"
 *   [actions]="[{ label: 'Cancelar', variant: 'secondary' }, { label: 'Guardar' }]"
 *   (actionPressed)="guardar($event)">
 *   <sirem-dynamic-form ... />
 * </sirem-modal>
 * ```
 */
@Component({
  selector: 'sirem-modal',
  standalone: true,
  imports: [SiremButton],
  styleUrl: './sirem-modal.scss',
  template: `
    @if (open()) {
      <div class="sirem-modal">
        <div
          class="sirem-modal__backdrop"
          (click)="onBackdrop()"
          aria-hidden="true"
        ></div>
        <div
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title()"
          class="sirem-modal__panel"
          [class]="panel()"
        >
          <div class="sirem-modal__head">
            <h2 class="sirem-modal__title">
              {{ title() }}
            </h2>
            <button
              type="button"
              (click)="close()"
              aria-label="Cerrar diálogo"
              class="sirem-modal__close"
            >
              ✕
            </button>
          </div>
          <div class="sirem-modal__body">
            <ng-content />
          </div>
          <div class="sirem-modal__footer" [class]="footerClass()">@if (actions().length) {@for (action of actions(); track $index) {<sirem-button
                [variant]="action.variant ?? 'secondary'"
                [size]="action.size ?? 'md'"
                [disabled]="action.disabled ?? false"
                [loading]="action.loading ?? false"
                (pressed)="actionPressed.emit(action)"
              >@if (action.icon) {<i slot="icon" [class]="action.icon" aria-hidden="true"></i>}{{ action.label }}</sirem-button>}}<ng-content select="[slot='footer']" /></div>
        </div>
      </div>
    }
  `,
})
export class SiremModal {
  readonly open = model(false);
  readonly title = input('');
  readonly size = input<SiremModalSize>('md');
  /** Si es true, el backdrop y Escape no lo cierran. */
  readonly persistent = input(false);
  /** Botones del footer (admiten N acciones con variante, icono y loading). */
  readonly actions = input<SiremModalAction[]>([]);
  /** Alineación de los botones declarativos. */
  readonly actionsAlign = input<SiremModalActionsAlign>('end');

  readonly closed = output<void>();
  readonly actionPressed = output<SiremModalAction>();

  readonly footerClass = computed(() =>
    this.actions().length ? `sirem-modal__footer--${this.actionsAlign()}` : 'sirem-modal__footer--auto',
  );

  panel(): string {
    switch (this.size()) {
      case 'sm':
        return 'sirem-modal__panel--sm';
      case 'lg':
        return 'sirem-modal__panel--lg';
      case 'xl':
        return 'sirem-modal__panel--xl';
      default:
        return 'sirem-modal__panel--md';
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open() && !this.persistent()) this.close();
  }

  onBackdrop(): void {
    if (!this.persistent()) this.close();
  }

  close(): void {
    this.open.set(false);
    this.closed.emit();
  }
}
