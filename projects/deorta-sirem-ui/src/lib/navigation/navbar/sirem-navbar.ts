import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import type { SiremNavItem } from '../../layout/sidebar/sirem-sidebar';

export type SiremNavbarLayout = 'vertical' | 'horizontal' | 'minibar' | 'floating';

/**
 * Barra de navegación con cuatro disposiciones:
 * - `vertical`: lista apilada en panel (módulos, ajustes).
 * - `horizontal`: fila superior con submenús desplegables.
 * - `minibar`: riel solo-iconos con submenús flotantes.
 * - `floating`: tarjeta despegada (p. ej. sobre mapas); la app la posiciona.
 *
 * Reutiliza `SiremNavItem` (label, icon con clase `fi-*`, svg inline
 * duotone/streamline, route, badge, permission, children). Los ítems con `permission` se ocultan
 * si no está en `permissions`.
 *
 * Uso:
 * ```html
 * <sirem-navbar layout="horizontal" [items]="nav" [permissions]="perms" />
 * ```
 */
@Component({
  selector: 'sirem-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet],
  styleUrl: './sirem-navbar.scss',
  template: `
    @if (layout() === 'horizontal') {
      <nav
        class="sirem-navbar sirem-navbar--horizontal"
        [class.sirem-navbar--fixed]="fixed()"
        [class.sirem-navbar--blur]="blur()"
        aria-label="Navegación principal"
      >
        @for (item of visible(); track item.label) {
          <div class="sirem-navbar__hitem">
            @if (item.children?.length) {
              <button
                type="button"
                (click)="toggle(item.label)"
                [attr.aria-expanded]="isExpanded(item.label)"
                class="sirem-navbar__link"
                [class.sirem-navbar__link--open]="isExpanded(item.label)"
              >
                @if (item.svg) {
                  <span class="sirem-navbar__svgicon" [innerHTML]="safeSvg(item.svg)" aria-hidden="true"></span>
                } @else if (item.icon) {
                  <i [class]="item.icon + ' sirem-navbar__icon'" aria-hidden="true"></i>
                }
                <span>{{ item.label }}</span>
                <span class="sirem-navbar__chev" aria-hidden="true">▾</span>
              </button>
              @if (isExpanded(item.label)) {
                <div class="sirem-navbar__drop">
                  @for (child of visibleChildren(item); track child.label) {
                    <ng-container *ngTemplateOutlet="linkTpl; context: { $implicit: child }" />
                  }
                </div>
              }
            } @else {
              <ng-container *ngTemplateOutlet="linkTpl; context: { $implicit: item }" />
            }
          </div>
        }
      </nav>
    } @else if (layout() === 'minibar') {
      <nav
        class="sirem-navbar sirem-navbar--minibar"
        [class.sirem-navbar--fixed]="fixed()"
        [class.sirem-navbar--blur]="blur()"
        aria-label="Navegación principal"
      >
        @for (item of visible(); track item.label) {
          <div class="sirem-navbar__rail-item">
            @if (item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="sirem-navbar__link--active"
                [attr.title]="item.label"
                [attr.aria-label]="item.label"
                class="sirem-navbar__rail-btn"
              >
                @if (item.svg) {
                  <span class="sirem-navbar__svgicon" [innerHTML]="safeSvg(item.svg)" aria-hidden="true"></span>
                } @else if (item.icon) {
                  <i [class]="item.icon + ' sirem-navbar__rail-icon'" aria-hidden="true"></i>
                } @else {
                  <span aria-hidden="true">{{ item.label.charAt(0) }}</span>
                }
              </a>
            } @else {
              <button
                type="button"
                (click)="item.children?.length ? toggle(item.label) : itemPressed.emit(item)"
                [attr.title]="item.label"
                [attr.aria-label]="item.label"
                [attr.aria-expanded]="item.children?.length ? isExpanded(item.label) : null"
                class="sirem-navbar__rail-btn"
              >
                @if (item.svg) {
                  <span class="sirem-navbar__svgicon" [innerHTML]="safeSvg(item.svg)" aria-hidden="true"></span>
                } @else if (item.icon) {
                  <i [class]="item.icon + ' sirem-navbar__rail-icon'" aria-hidden="true"></i>
                } @else {
                  <span aria-hidden="true">{{ item.label.charAt(0) }}</span>
                }
              </button>
            }
            @if (item.children?.length && isExpanded(item.label)) {
              <div class="sirem-navbar__flyout" role="menu">
                <p class="sirem-navbar__flyout-title">{{ item.label }}</p>
                @for (child of visibleChildren(item); track child.label) {
                  <ng-container *ngTemplateOutlet="linkTpl; context: { $implicit: child }" />
                }
              </div>
            }
          </div>
        }
      </nav>
    } @else {
      <nav
        class="sirem-navbar"
        [class.sirem-navbar--vertical]="layout() === 'vertical'"
        [class.sirem-navbar--floating]="layout() === 'floating'"
        [class.sirem-navbar--fixed]="fixed()"
        [class.sirem-navbar--blur]="blur()"
        aria-label="Navegación principal"
      >
        @for (item of visible(); track item.label) {
          @if (item.children?.length) {
            <button
              type="button"
              (click)="toggle(item.label)"
              [attr.aria-expanded]="isExpanded(item.label)"
              class="sirem-navbar__link"
            >
            @if (item.svg) {
              <span class="sirem-navbar__svgicon" [innerHTML]="safeSvg(item.svg)" aria-hidden="true"></span>
            } @else if (item.icon) {
              <i [class]="item.icon + ' sirem-navbar__icon'" aria-hidden="true"></i>
            }
              <span class="sirem-navbar__text">{{ item.label }}</span>
              @if (item.badge !== undefined) {
                <span class="sirem-navbar__badge">{{ item.badge }}</span>
              }
              <span class="sirem-navbar__chev" aria-hidden="true">
                {{ isExpanded(item.label) ? '▾' : '▸' }}
              </span>
            </button>
            @if (isExpanded(item.label)) {
              <div class="sirem-navbar__children">
                @for (child of visibleChildren(item); track child.label) {
                  <ng-container *ngTemplateOutlet="linkTpl; context: { $implicit: child }" />
                }
              </div>
            }
          } @else {
            <ng-container *ngTemplateOutlet="linkTpl; context: { $implicit: item }" />
          }
        }
      </nav>
    }

    <ng-template #linkTpl let-item>
      @if (item.route) {
        <a
          [routerLink]="item.route"
          routerLinkActive="sirem-navbar__link--active"
          (click)="itemPressed.emit(item)"
          class="sirem-navbar__link"
        >
          @if (item.icon) {
            <i [class]="item.icon + ' sirem-navbar__icon'" aria-hidden="true"></i>
          }
          <span class="sirem-navbar__text">{{ item.label }}</span>
          @if (item.badge !== undefined) {
            <span class="sirem-navbar__badge">{{ item.badge }}</span>
          }
        </a>
      } @else {
        <button
          type="button"
          (click)="itemPressed.emit(item)"
          class="sirem-navbar__link"
        >
          @if (item.icon) {
            <i [class]="item.icon + ' sirem-navbar__icon'" aria-hidden="true"></i>
          }
          <span class="sirem-navbar__text">{{ item.label }}</span>
        </button>
      }
    </ng-template>
  `,
})
export class SiremNavbar {
  readonly items = input.required<SiremNavItem[]>();
  readonly layout = input<SiremNavbarLayout>('vertical');
  /** Permisos del usuario; oculta ítems con `permission` ausente. */
  readonly permissions = input<Set<string> | string[] | null>(null);
  /** Fija la barra al hacer scroll (`position: sticky`). */
  readonly fixed = input(false);
  /** Fondo translúcido con desenfoque (ideal con `fixed`). */
  readonly blur = input(false);

  readonly itemPressed = output<SiremNavItem>();

  private readonly sanitizer = inject(DomSanitizer);

  /** Sanitiza el SVG inline de un ítem (duotone / streamline). */
  safeSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  private readonly expandedSet = signal<ReadonlySet<string>>(new Set());

  private readonly permissionSet = computed<Set<string> | null>(() => {
    const p = this.permissions();
    if (!p) return null;
    return p instanceof Set ? p : new Set(p);
  });

  private canSee(item: SiremNavItem): boolean {
    if (!item.permission) return true;
    const set = this.permissionSet();
    if (!set) return true;
    return set.has(item.permission);
  }

  readonly visible = computed(() => this.items().filter((i) => this.canSee(i)));

  visibleChildren(item: SiremNavItem): SiremNavItem[] {
    return (item.children ?? []).filter((c) => this.canSee(c));
  }

  isExpanded(label: string): boolean {
    return this.expandedSet().has(label);
  }

  toggle(label: string): void {
    const next = new Set(this.expandedSet());
    if (next.has(label)) next.delete(label);
    else next.add(label);
    this.expandedSet.set(next);
  }
}
