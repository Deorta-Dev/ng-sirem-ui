import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/** Acción del menú de usuario. */
export interface SiremUserMenuAction {
  label: string;
  /** Clase CSS del icono (p. ej. `fi fi-rr-user`). */
  icon?: string;
  /** SVG inline (duotone / streamline). Tiene prioridad sobre `icon`. */
  svg?: string;
  /** Marca la acción como peligrosa (p. ej. cerrar sesión). */
  danger?: boolean;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

/** Grupo opcional de acciones (con título y separador automático). */
export interface SiremUserMenuGroup {
  title?: string;
  actions: SiremUserMenuAction[];
}

/**
 * Menú desplegable del perfil (datos del usuario + acciones).
 * Las acciones pueden declararse con `groups` (agrupadas y con iconos)
 * o proyectarse libremente; cualquier clic dentro del panel lo cierra.
 *
 * Uso:
 * ```html
 * <sirem-user-menu userName="Ana Pérez" userDetail="ana@clinica.com"
 *   [groups]="[{ title: 'Cuenta', actions: [{ label: 'Mi perfil', icon: 'fi fi-rr-user' }] }]"
 *   (actionPressed)="ir($event)">
 * </sirem-user-menu>
 * ```
 */
@Component({
  selector: 'sirem-user-menu',
  standalone: true,
  styleUrl: './sirem-user-menu.scss',
  template: `
    <div class="sirem-user">
      <button
        type="button"
        (click)="toggle()"
        [attr.aria-expanded]="open()"
        aria-haspopup="menu"
        aria-label="Menú de usuario"
        class="sirem-user__trigger"
      >
        @if (avatarSrc()) {
          <img
            [src]="avatarSrc()"
            [alt]="userName()"
            class="sirem-user__photo"
          />
        } @else {
          <span
            class="sirem-user__initials"
            aria-hidden="true"
          >
            {{ initials() }}
          </span>
        }
        <span aria-hidden="true" class="sirem-user__chev">▾</span>
      </button>

      @if (open()) {
        <div
          class="sirem-user__backdrop"
          (click)="open.set(false)"
          aria-hidden="true"
        ></div>
        <div
          role="menu"
          (click)="open.set(false)"
          class="sirem-user__panel"
        >
          <div class="sirem-user__head">
            <p class="sirem-user__name">{{ userName() }}</p>
            <p class="sirem-user__detail">{{ userDetail() }}</p>
          </div>
          @if (groups().length) {
            <div class="sirem-user__items">
              @for (group of groups(); track $index; let last = $last) {
                @if (group.title) {
                  <p class="sirem-user__group-title">{{ group.title }}</p>
                }
                @for (action of group.actions; track action.label) {
                  <button
                    type="button"
                    (click)="actionPressed.emit(action)"
                    [disabled]="action.disabled"
                    class="sirem-user__item"
                    [class.sirem-user__item--danger]="action.danger"
                    role="menuitem"
                  >
                    @if (action.svg) {
                      <span class="sirem-user__svgicon" [innerHTML]="safeSvg(action.svg)" aria-hidden="true"></span>
                    } @else if (action.icon) {
                      <i [class]="action.icon" aria-hidden="true"></i>
                    }
                    <span>{{ action.label }}</span>
                  </button>
                }
                @if (!last) {
                  <hr class="sirem-user__separator" />
                }
              }
            </div>
          }
          <div class="sirem-user__items">
            <ng-content />
          </div>
        </div>
      }
    </div>
  `,
})
export class SiremUserMenu {
  readonly userName = input.required<string>();
  readonly userDetail = input('');
  readonly avatarSrc = input<string | null>(null);
  /** Grupos de acciones con iconos (alternativa a proyectar contenido). */
  readonly groups = input<SiremUserMenuGroup[]>([]);

  readonly actionPressed = output<SiremUserMenuAction>();

  readonly open = signal(false);

  private readonly sanitizer = inject(DomSanitizer);

  /** Sanitiza el SVG inline de una acción. */
  safeSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  readonly initials = computed(() =>
    this.userName()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join(''),
  );

  toggle(): void {
    this.open.update((v) => !v);
  }
}
