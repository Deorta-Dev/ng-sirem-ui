import { Component, inject, input, output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SiremAvatar } from '../avatar/sirem-avatar';
import { SiremBadge, SiremBadgeTone } from '../badge/sirem-badge';

/** Fila de la lista. */
export interface SiremListItem {
  /** Texto principal de la fila. */
  title: string;
  /** Línea secundaria bajo el título. */
  subtitle?: string;
  /** Texto a la derecha (hora, valor…). */
  meta?: string;
  /** Clase CSS del icono líder (p. ej. `fi fi-rr-user`). */
  icon?: string;
  /** SVG inline líder (duotone / streamline). Prioridad sobre `icon`. */
  svg?: string;
  /** Muestra avatar con estas iniciales en lugar de icono. */
  avatarName?: string;
  /** URL del avatar, usado junto a `avatarName`. */
  avatarSrc?: string | null;
  /** Texto del badge de la derecha. */
  badge?: string;
  /** Color del badge (`neutral` si se omite). */
  badgeTone?: SiremBadgeTone;
  /** Muestra chevron › a la derecha. */
  chevron?: boolean;
  /** Atenúa la fila y bloquea la pulsación. */
  disabled?: boolean;
  /** Dato libre que se devuelve en `itemPressed`. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

/**
 * Lista simple de filas (título + subtítulo + icono/avatar + badge).
 * Alternativa ligera a la tabla para móviles y paneles.
 *
 * Uso:
 * ```html
 * <sirem-list [items]="pacientes" (itemPressed)="ver($event)" />
 * <!-- [{ title: 'María Torres', subtitle: 'CC 1020', badge: 'Activa', badgeTone: 'success' }] -->
 * ```
 */
@Component({
  selector: 'sirem-list',
  standalone: true,
  imports: [SiremAvatar, SiremBadge],
  styleUrl: './sirem-list.scss',
  template: `
    <ul class="sirem-list" [class.sirem-list--dividers]="dividers()">
      @for (item of items(); track item.title) {
        <li>
          <button
            type="button"
            (click)="itemPressed.emit(item)"
            [disabled]="item.disabled"
            class="sirem-list__row"
          >
            @if (item.avatarName || item.avatarSrc) {
              <sirem-avatar [name]="item.avatarName ?? ''" [src]="item.avatarSrc ?? null" size="sm" />
            } @else if (item.svg) {
              <span class="sirem-list__icon" [innerHTML]="safeSvg(item.svg)" aria-hidden="true"></span>
            } @else if (item.icon) {
              <i [class]="item.icon + ' sirem-list__icon'" aria-hidden="true"></i>
            }
            <span class="sirem-list__body">
              <span class="sirem-list__title">{{ item.title }}</span>
              @if (item.subtitle) {
                <span class="sirem-list__subtitle">{{ item.subtitle }}</span>
              }
            </span>
            @if (item.badge) {
              <sirem-badge [tone]="item.badgeTone ?? 'neutral'">{{ item.badge }}</sirem-badge>
            }
            @if (item.meta) {
              <span class="sirem-list__meta">{{ item.meta }}</span>
            }
            @if (item.chevron) {
              <span class="sirem-list__chev" aria-hidden="true">›</span>
            }
          </button>
        </li>
      } @empty {
        <li class="sirem-list__empty">{{ emptyText() }}</li>
      }
    </ul>
  `,
})
export class SiremList {
  /** Elementos a mostrar (título, subtítulo, icono, avatar…). */
  readonly items = input.required<SiremListItem[]>();
  /** Separadores entre filas. */
  readonly dividers = input(true);
  /** Texto que se muestra cuando `items` está vacío. */
  readonly emptyText = input('Sin elementos.');

  /** Se emite con el elemento pulsado. */
  readonly itemPressed = output<SiremListItem>();

  private readonly sanitizer = inject(DomSanitizer);

  safeSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
