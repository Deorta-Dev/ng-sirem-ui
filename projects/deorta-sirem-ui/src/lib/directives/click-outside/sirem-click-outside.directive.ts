import { Directive, ElementRef, inject, output } from '@angular/core';

/**
 * Emite cuando el usuario pulsa fuera del elemento anfitrión.
 * Ideal para cerrar menús, paletas y desplegables.
 *
 * Uso:
 * ```html
 * <div (siremClickOutside)="menu.set(false)">…</div>
 * ```
 */
@Directive({
  selector: '[siremClickOutside]',
  standalone: true,
  host: {
    '(document:pointerdown)': 'onPointerDown($event)',
  },
})
export class SiremClickOutsideDirective {
  readonly siremClickOutside = output<PointerEvent>();

  private readonly el = inject(ElementRef<HTMLElement>);

  onPointerDown(event: PointerEvent): void {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.siremClickOutside.emit(event);
    }
  }
}
