import { Component, computed, input } from '@angular/core';

/**
 * Wrapper de Flaticon UIcons (icon font).
 *
 * El paquete `@flaticon/flaticon-uicons` expone clases `fi fi-<peso>-<nombre>`:
 * - Regular rounded: `rr-user` → `<i class="fi fi-rr-user"></i>`
 * - Bold rounded: `br-arrow-right`
 * - Solid rounded: `sr-book`
 * - Regular straight: `rs-bell` · Bold straight: `bs-bell` · Solid straight: `ss-bell`
 * - Thin: `tr-...` / `ts-...` · Brands: `brands-facebook` (clase `fi-brands-...`)
 *
 * Uso:
 * ```html
 * <sirem-fi-icon name="rr-user" [size]="20" label="Usuario" />
 * <sirem-fi-icon name="br-arrow-right" class="text-sirem-600" />
 * ```
 * El color se hereda (`currentColor`): controla con `class="text-..."` o `style="color:..."`.
 */
@Component({
  selector: 'sirem-fi-icon',
  standalone: true,
  styleUrl: './sirem-fi-icon.scss',
  template: `
    <i
      [class]="iconClass()"
      [style.font-size.px]="size()"
      [attr.aria-hidden]="label() ? null : 'true'"
      [attr.aria-label]="label() ?? null"
      [attr.role]="label() ? 'img' : null"
    ></i>
  `,
})
export class SiremFiIcon {
  /** Sufijo del icono sin el prefijo `fi-`. Ej: `rr-user`, `sr-book`, `brands-facebook`. */
  readonly name = input.required<string>();
  /** Tamaño en px (font-size del icon font). */
  readonly size = input<number>(20);
  /** Si se informa, el icono es decorativo→accesible (role="img"). */
  readonly label = input<string | null>(null);

  readonly iconClass = computed(() => {
    const name = this.name().trim();
    if (name.startsWith('brands-')) return `fi fi-brands-${name.slice('brands-'.length)}`;
    return `fi fi-${name}`;
  });
}
