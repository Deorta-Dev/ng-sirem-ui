import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import type { SiremNavItem } from '../../layout/sidebar/sirem-sidebar';
import { SiremOverlayTrigger } from '../../overlays/overlay/sirem-overlay-trigger';
import {
  injectSiremViewportWidth,
  resolveSiremSubmenu,
  type SiremSubmenuConfig,
  type SiremSubmenuResolved,
} from '../../overlays/overlay/sirem-submenu';

export type SiremNavbarLayout = 'vertical' | 'horizontal' | 'minibar' | 'floating';

/**
 * Barra de navegación con cuatro disposiciones:
 * - `vertical`: lista apilada en panel (módulos, ajustes).
 * - `horizontal`: fila superior con submenús desplegables.
 * - `minibar`: riel solo-iconos con submenús flotantes.
 * - `floating`: tarjeta despegada (p. ej. sobre mapas); la app la posiciona.
 *
 * Los ítems con hijos abren sus submenús en la **capa de overlays**
 * (`SiremOverlayTrigger`), por lo que se pintan por encima de cualquier
 * contenedor con `overflow`. El gesto se configura con `submenu` y varía
 * según el ancho de pantalla: por defecto `hover` en escritorio y `click` en
 * móvil (breakpoint 768 px).
 *
 * Reutiliza `SiremNavItem` (label, icon con clase `fi-*`, svg inline
 * duotone/streamline, route, badge, permission, children). Los ítems con `permission` se ocultan
 * si no está en `permissions`.
 *
 * Inputs:
 * - `items`: ítems a mostrar (obligatorio).
 * - `layout`: `vertical` (defecto) | `horizontal` | `minibar` | `floating`.
 * - `permissions`: `Set` o array de permisos; oculta los ítems restringidos.
 * - `fixed`: barra `sticky` al hacer scroll.
 * - `blur`: fondo translúcido con desenfoque.
 * - `submenu`: gesto, placement y retardo de los submenús por franja de ancho.
 *
 * Outputs:
 * - `itemPressed`: se emite al pulsar un ítem (incluidos los hijos del overlay).
 *
 * Uso:
 * ```html
 * <sirem-navbar layout="horizontal" [items]="nav" [permissions]="perms" />
 *
 * <sirem-navbar
 *   [items]="nav"
 *   [submenu]="{ breakpoint: 1024, desktop: { trigger: 'hover' }, mobile: { trigger: 'click' } }"
 * />
 * ```
 */
@Component({
  selector: 'sirem-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet, SiremOverlayTrigger],
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
                [siremOverlay]="dropTpl"
                [siremOverlayData]="{ item: item }"
                [siremOverlayTrigger]="submenuResolved().trigger"
                [siremOverlayPlacement]="submenuResolved().placement"
                [siremOverlayOffset]="submenuResolved().offset"
                [siremOverlayHoverDelayMs]="submenuResolved().hoverDelayMs"
                [siremOverlayHoverHideDelayMs]="submenuResolved().hoverHideDelayMs"
                [open]="submenuOpen(item.label)"
                (openChange)="setSubmenuOpen(item.label, $event)"
                [class.sirem-navbar__link--open]="submenuOpen(item.label)"
                class="sirem-navbar__link"
              >
                @if (item.svg) {
                  <span class="sirem-navbar__svgicon" [innerHTML]="safeSvg(item.svg)" aria-hidden="true"></span>
                } @else if (item.icon) {
                  <i [class]="item.icon + ' sirem-navbar__icon'" aria-hidden="true"></i>
                }
                <span>{{ item.label }}</span>
                <span class="sirem-navbar__chev" aria-hidden="true">
                  {{ submenuOpen(item.label) ? '▴' : '▾' }}
                </span>
              </button>
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
                <ng-container *ngTemplateOutlet="railIconTpl; context: { $implicit: item }" />
              </a>
            } @else if (item.children?.length) {
              <button
                type="button"
                [siremOverlay]="dropTpl"
                [siremOverlayData]="{ item: item, showTitle: true }"
                [siremOverlayTrigger]="submenuResolved().trigger"
                [siremOverlayPlacement]="submenuResolved().placement"
                [siremOverlayOffset]="submenuResolved().offset"
                [siremOverlayHoverDelayMs]="submenuResolved().hoverDelayMs"
                [siremOverlayHoverHideDelayMs]="submenuResolved().hoverHideDelayMs"
                [open]="submenuOpen(item.label)"
                (openChange)="setSubmenuOpen(item.label, $event)"
                [class.sirem-navbar__link--open]="submenuOpen(item.label)"
                [attr.title]="item.label"
                [attr.aria-label]="item.label"
                class="sirem-navbar__rail-btn"
              >
                <ng-container *ngTemplateOutlet="railIconTpl; context: { $implicit: item }" />
              </button>
            } @else {
              <button
                type="button"
                (click)="itemPressed.emit(item)"
                [attr.title]="item.label"
                [attr.aria-label]="item.label"
                class="sirem-navbar__rail-btn"
              >
                <ng-container *ngTemplateOutlet="railIconTpl; context: { $implicit: item }" />
              </button>
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
              [siremOverlay]="dropTpl"
              [siremOverlayData]="{ item: item }"
              [siremOverlayTrigger]="submenuResolved().trigger"
              [siremOverlayPlacement]="submenuResolved().placement"
              [siremOverlayOffset]="submenuResolved().offset"
              [siremOverlayHoverDelayMs]="submenuResolved().hoverDelayMs"
              [siremOverlayHoverHideDelayMs]="submenuResolved().hoverHideDelayMs"
              [open]="submenuOpen(item.label)"
              (openChange)="setSubmenuOpen(item.label, $event)"
              [class.sirem-navbar__link--open]="submenuOpen(item.label)"
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
                {{ submenuOpen(item.label) ? '▾' : '▸' }}
              </span>
            </button>
          } @else {
            <ng-container *ngTemplateOutlet="linkTpl; context: { $implicit: item }" />
          }
        }
      </nav>
    }

    <!--
      Desplegable en la capa de overlays: asi no lo recorta el overflow de
      la barra ni el de un contenedor con scroll. El gesto (hover/click) y el
      lado salen de submenuResolved(), que varia con el ancho de pantalla.
    -->
    <ng-template #dropTpl let-data>
      <div class="sirem-overlay__panel" role="menu">
        @if (data.showTitle) {
          <p class="sirem-navbar__flyout-title">{{ data.item.label }}</p>
        }
        @for (child of visibleChildren(data.item); track child.label) {
          <ng-container
            *ngTemplateOutlet="linkTpl; context: { $implicit: child, inPanel: true }"
          />
        }
      </div>
    </ng-template>

    <ng-template #linkTpl let-item let-inPanel="inPanel">
      @if (item.route) {
        <a
          [routerLink]="item.route"
          routerLinkActive="sirem-navbar__link--active"
          (click)="linkPressed(item, inPanel)"
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
          (click)="linkPressed(item, inPanel)"
          class="sirem-navbar__link"
        >
          @if (item.icon) {
            <i [class]="item.icon + ' sirem-navbar__icon'" aria-hidden="true"></i>
          }
          <span class="sirem-navbar__text">{{ item.label }}</span>
        </button>
      }
    </ng-template>

    <!-- Icono del riel: svg inline, clase fi o inicial de la etiqueta. -->
    <ng-template #railIconTpl let-item>
      @if (item.svg) {
        <span class="sirem-navbar__svgicon" [innerHTML]="safeSvg(item.svg)" aria-hidden="true"></span>
      } @else if (item.icon) {
        <i [class]="item.icon + ' sirem-navbar__rail-icon'" aria-hidden="true"></i>
      } @else {
        <span aria-hidden="true">{{ item.label.charAt(0) }}</span>
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

  /**
   * Gesto y colocación de los submenús, por franja de ancho de pantalla.
   *
   * - `[submenu]="{ trigger: 'hover' }"` → el mismo gesto en todas las franjas.
   * - `[submenu]="{ breakpoint: 1024, desktop: { trigger: 'hover' }, mobile: { trigger: 'click' } }"`
   *   → hover por encima de 1024 px y click por debajo.
   *
   * Sin configurar: `hover` en escritorio, `click` en móvil y `breakpoint` 768.
   */
  readonly submenu = input<SiremSubmenuConfig>({});

  readonly itemPressed = output<SiremNavItem>();

  private readonly sanitizer = inject(DomSanitizer);

  /** Sanitiza el SVG inline de un ítem (duotone / streamline). */
  safeSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  /** Ancho del viewport; define qué banda (`mobile` / `desktop`) está activa. */
  private readonly viewportWidth = injectSiremViewportWidth();

  /**
   * Opciones del overlay efectivas para el ancho actual: fusiona la banda
   * activa, los valores comunes y los defectos (`hover` en escritorio,
   * `click` en móvil; `bottom-start` en horizontal y `right-start` en el resto).
   */
  readonly submenuResolved = computed<SiremSubmenuResolved>(() =>
    resolveSiremSubmenu(
      this.submenu(),
      this.viewportWidth(),
      this.layout() === 'horizontal' ? 'bottom-start' : 'right-start',
    ),
  );

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

  // ------------------------------------------------------------ submenús

  /** Ítems con el overlay abierto; mueve el chevron y sincroniza la directiva. */
  private readonly openSet = signal<ReadonlySet<string>>(new Set());

  /** Estado abierto del submenú de un ítem. */
  submenuOpen(label: string): boolean {
    return this.openSet().has(label);
  }

  /** Sincroniza el estado del submenú con `[(open)]` de la directiva. */
  setSubmenuOpen(label: string, open: boolean): void {
    const next = new Set(this.openSet());
    if (open) next.add(label);
    else next.delete(label);
    this.openSet.set(next);
  }

  /** Cierra todos los submenús (al elegir un enlace del panel). */
  closeSubmenus(): void {
    this.openSet.set(new Set());
  }

  /**
   * Pulsación de un enlace: emite `itemPressed` y, si el enlace estaba dentro
   * de un panel de overlay, cierra el submenú para no dejarlo flotando sobre
   * la nueva vista.
   */
  linkPressed(item: SiremNavItem, inPanel?: boolean): void {
    this.itemPressed.emit(item);
    if (inPanel) this.closeSubmenus();
  }
}
