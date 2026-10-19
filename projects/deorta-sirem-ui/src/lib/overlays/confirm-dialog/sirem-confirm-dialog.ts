import { Component, input, model, output } from '@angular/core';
import { SiremButton } from '../../button/sirem-button';
import { SiremModal } from '../modal/sirem-modal';

/**
 * Diálogo de confirmación sí/no (equivale a `BoolModalFormDynamicComponent`):
 * eliminar paciente, anular factura, confirmar envío masivo…
 *
 * Uso:
 * ```html
 * <sirem-confirm-dialog
 *   [(open)]="eliminar"
 *   title="Eliminar paciente"
 *   message="Esta acción no se puede deshacer."
 *   variant="danger"
 *   (confirmed)="borrar()"
 * />
 * ```
 */
@Component({
  selector: 'sirem-confirm-dialog',
  standalone: true,
  imports: [SiremModal, SiremButton],
  styleUrl: './sirem-confirm-dialog.scss',
  template: `
    <sirem-modal [(open)]="open" [title]="title()" size="sm">
      <p class="sirem-confirm__message">{{ message() }}</p>
      @if (detail()) {
        <p class="sirem-confirm__detail">{{ detail() }}</p>
      }
      <div slot="footer" class="sirem-confirm__footer">
        <sirem-button variant="secondary" (pressed)="cancel()">
          {{ cancelLabel() }}
        </sirem-button>
        <sirem-button [variant]="variant()" (pressed)="confirm()">
          {{ confirmLabel() }}
        </sirem-button>
      </div>
    </sirem-modal>
  `,
})
export class SiremConfirmDialog {
  /** Controla la visibilidad del diálogo, con enlace de dos vías. */
  readonly open = model(false);
  /** Título del diálogo. */
  readonly title = input('Confirmar acción');
  /** Pregunta principal. */
  readonly message = input('¿Deseas continuar?');
  /** Aclaración o consecuencia bajo el mensaje; vacío la oculta. */
  readonly detail = input('');
  /** Texto del botón de confirmación. */
  readonly confirmLabel = input('Confirmar');
  /** Texto del botón de cancelación. */
  readonly cancelLabel = input('Cancelar');
  /** Estilo del botón principal: `primary` o `danger`. */
  readonly variant = input<'primary' | 'danger'>('primary');

  /** Se emite al confirmar; el diálogo se cierra. */
  readonly confirmed = output<void>();
  /** Se emite al cancelar o cerrar sin confirmar. */
  readonly cancelled = output<void>();

  confirm(): void {
    this.open.set(false);
    this.confirmed.emit();
  }

  cancel(): void {
    this.open.set(false);
    this.cancelled.emit();
  }
}
