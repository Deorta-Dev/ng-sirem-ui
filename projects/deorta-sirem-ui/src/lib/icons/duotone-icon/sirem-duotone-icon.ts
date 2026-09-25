import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Icono duotone genérico (SVG inline de dos capas).
 *
 * Patrón duotone (igual en Streamline Ultimate Duotone y Phosphor Duotone):
 * - Capa 1 con `opacity="0.2"` (relleno tenue).
 * - Capa 2 sólida (trazo/forma principal).
 * - `fill="currentColor"` para heredar el color del contexto.
 *
 * Uso con Phosphor (@ng-icons/phosphor-icons/duotone) en la app consumidora:
 * ```ts
 * import { phosphorHouseDuotone } from '@ng-icons/phosphor-icons/duotone';
 * ```
 * ```html
 * <sirem-duotone-icon [svg]="phosphorHouseDuotone" [size]="24" />
 * ```
 */
@Component({
  selector: 'sirem-duotone-icon',
  standalone: true,
  styleUrl: './sirem-duotone-icon.scss',
  template: `
    <span
      class="sirem-duotone"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [innerHTML]="safeSvg()"
      [attr.aria-hidden]="label() ? null : 'true'"
      [attr.aria-label]="label() ?? null"
      [attr.role]="label() ? 'img' : null"
    ></span>
  `,
})
export class SiremDuotoneIcon {
  /** SVG completo del icono (debe usar fill="currentColor" + capa opacity="0.2"). */
  readonly svg = input.required<string>();
  readonly size = input<number>(24);
  readonly label = input<string | null>(null);

  private readonly sanitizer = inject(DomSanitizer);

  readonly safeSvg = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.svg()),
  );
}
