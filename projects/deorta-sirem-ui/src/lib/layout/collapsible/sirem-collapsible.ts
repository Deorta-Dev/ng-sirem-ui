import {
  Component,
  DestroyRef,
  booleanAttribute,
  effect,
  inject,
  untracked,
  input,
  model,
  output,
} from '@angular/core';
import { SIREM_COLLAPSIBLE_GROUP } from './sirem-collapsible.tokens';

/** Marco visual de la sección plegable. */
export type SiremCollapsibleVariant = 'card' | 'plain';

let uid = 0;

/**
 * Sección plegable con cabecera pulsable y contenido proyectado.
 *
 * - `variant="card"` (defecto) dibuja el marco Bento: borde, radio y sombra.
 *   `variant="plain"` deja solo la cabecera y el contenido, sin marco.
 * - `[background]="true"` (defecto) pinta la superficie del panel; con
 *   `false` queda transparente (útil dentro de una card o sobre un tinte).
 * - `[(open)]` es la única fuente de verdad; `opened`/`closed` avisan del
 *   cambio. El contenido se anima en alto (no hay salto).
 * - Dentro de `sirem-collapsible-group` con `[accordion]="true"` solo puede
 *   haber una sección abierta: abrir una cierra las demás.
 * - Slot `[slot="actions"]` en la cabecera para botones o badges (su clic no
 *   pliega la sección).
 *
 * Uso:
 * ```html
 * <sirem-collapsible title="Datos del paciente" [(open)]="abierto">
 *   …
 * </sirem-collapsible>
 *
 * <sirem-collapsible title="Filtros" variant="plain" [background]="false">
 *   <span slot="actions"><sirem-badge text="3" /></span>
 *   …
 * </sirem-collapsible>
 * ```
 */
@Component({
  selector: 'sirem-collapsible',
  standalone: true,
  styleUrl: './sirem-collapsible.scss',
  template: `
    <div
      class="sirem-collapsible"
      [class.sirem-collapsible--card]="variant() === 'card'"
      [class.sirem-collapsible--plain]="variant() === 'plain'"
      [class.sirem-collapsible--filled]="background()"
      [class.sirem-collapsible--open]="open()"
      [class.sirem-collapsible--disabled]="disabled()"
    >
      <header class="sirem-collapsible__head">
        <button
          type="button"
          class="sirem-collapsible__trigger"
          [id]="triggerId"
          [attr.aria-expanded]="open()"
          [attr.aria-controls]="panelId"
          [disabled]="disabled()"
          (click)="toggle()"
        >
          @if (icon()) {
            <i class="sirem-collapsible__icon" [class]="icon()!" aria-hidden="true"></i>
          }
          <span class="sirem-collapsible__texts">
            <span class="sirem-collapsible__title">{{ title() }}</span>
            @if (subtitle()) {
              <span class="sirem-collapsible__subtitle">{{ subtitle() }}</span>
            }
          </span>
          <i class="sirem-collapsible__chev fi fi-rr-angle-small-down" aria-hidden="true"></i>
        </button>
        <span class="sirem-collapsible__actions">
          <ng-content select="[slot='actions']" />
        </span>
      </header>

      <div
        class="sirem-collapsible__panel"
        [id]="panelId"
        role="region"
        [attr.aria-labelledby]="triggerId"
        [attr.inert]="open() ? null : ''"
      >
        <div class="sirem-collapsible__clip">
          <div class="sirem-collapsible__inner">
            <ng-content />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SiremCollapsible {
  /** Texto de la cabecera. */
  readonly title = input.required<string>();
  /** Línea secundaria bajo el título. */
  readonly subtitle = input<string | null>(null);
  /** Clase CSS de icono (p. ej. `fi fi-rr-user`). */
  readonly icon = input<string | null>(null);
  /** Estado abierto (doble vía). */
  readonly open = model(false);
  /** Con marco de tarjeta (`card`) o sin él (`plain`). */
  readonly variant = input<SiremCollapsibleVariant>('card');
  /** Superficie propia; `false` deja el cuerpo transparente. */
  readonly background = input(true);
  /** Bloquea abrir y cerrar la sección. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Se emite al abrirse. */
  readonly opened = output<void>();
  /** Se emite al cerrarse. */
  readonly closed = output<void>();

  /** Identificadores estables para `aria-controls` / `aria-labelledby`. */
  protected readonly triggerId = `sirem-collapsible-trigger-${++uid}`;
  protected readonly panelId = `sirem-collapsible-panel-${uid}`;

  private readonly group = inject(SIREM_COLLAPSIBLE_GROUP);

  constructor() {
    this.group?.register(this);
    inject(DestroyRef).onDestroy(() => this.group?.unregister(this));

    // Al abrirse avisa al grupo para que cierre las demás secciones.
    effect(() => {
      if (!this.open()) return;
      // `untracked`: el grupo lee el `open` de las demás secciones y este efecto
      // no debe reaccionar a esos cambios (se re-dispararía y cerraría la
      // sección que se acaba de abrir).
      untracked(() => this.group?.opened(this));
    });
  }

  toggle(): void {
    if (this.disabled()) return;
    this.open() ? this.close() : this.show();
  }

  show(): void {
    if (this.disabled() || this.open()) return;
    this.open.set(true);
    this.opened.emit();
  }

  close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.closed.emit();
  }
}
