import { AfterViewInit, Directive, ElementRef, booleanAttribute, inject, input } from '@angular/core';

/**
 * Enfoca el elemento anfitrión al aparecer en vista.
 *
 * Uso:
 * ```html
 * <input siremAutofocus placeholder="Buscar…" />
 * <input [siremAutofocus]="true" [siremAutofocusDelay]="300" />
 * ```
 */
@Directive({
  selector: '[siremAutofocus]',
  standalone: true,
})
export class SiremAutofocusDirective implements AfterViewInit {
  /** Activa/desactiva el autofocus (defecto true). */
  readonly siremAutofocus = input(true, { transform: booleanAttribute });
  /** Retraso en ms antes de enfocar (defecto 0). */
  readonly siremAutofocusDelay = input(0);

  private readonly el = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    if (!this.siremAutofocus()) return;
    const target = this.el.nativeElement;
    const focusable =
      (target.matches('input,select,textarea,button,a,[tabindex]')
        ? target
        : (target.querySelector('input,select,textarea,button') as HTMLElement | null)) ?? null;
    const node = focusable ?? target;
    const delay = this.siremAutofocusDelay();
    if (delay > 0) setTimeout(() => node.focus({ preventScroll: true }), delay);
    else node.focus({ preventScroll: true });
  }
}
