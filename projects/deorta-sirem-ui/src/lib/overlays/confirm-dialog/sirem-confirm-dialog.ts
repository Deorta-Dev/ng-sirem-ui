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
  readonly open = model(false);
  readonly title = input('Confirmar acción');
  readonly message = input('¿Deseas continuar?');
  readonly detail = input('');
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  readonly variant = input<'primary' | 'danger'>('primary');

  readonly confirmed = output<void>();
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
