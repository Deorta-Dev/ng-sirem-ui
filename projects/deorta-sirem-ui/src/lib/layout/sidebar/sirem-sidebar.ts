import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SiremFiIcon } from '../../icons/fi-icon/sirem-fi-icon';
import { SiremButton } from '../../button/sirem-button';
import { SiremOverlayTrigger } from '../../overlays/overlay/sirem-overlay-trigger';
import { SiremTooltipDirective } from '../../directives/tooltip/sirem-tooltip.directive';
import {
  injectSiremViewportWidth,
  resolveSiremSubmenu,
  type SiremSubmenuConfig,
  type SiremSubmenuResolved,
} from '../../overlays/overlay/sirem-submenu';

/** Ítem de navegación jerárquica del sidebar / navbar. */
export interface SiremNavItem {
  label: string;
  /** Clase CSS del icono (p. ej. `fi fi-rr-users`). */
  icon?: string;
  /** SVG inline (duotone/streamline). Tiene prioridad sobre `icon`. */
  svg?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  route?: string | any[];
  /** Enlace externo (`href`); alternativa a `route` para URLs fuera de la app. */
  href?: string;
  /** Imagen redonda como icono (p. ej. logo); prioridad sobre `svg`/`icon`. */
  img?: string;
  badge?: string | number;
  /** Permiso requerido; se oculta si no está en `permissions`. */
  permission?: string;
  /**
   * Texto del tooltip flotante al pasar el ratón con el sidebar colapsado
   * (solo iconos). Por defecto usa `label`.
   */
  tooltip?: string;
  children?: SiremNavItem[];
}

/**
 * Menú lateral jerárquico, colapsable y responsivo.
 * - Los ítems con hijos abren sus submenús en la **capa de overlays**
 *   (`SiremOverlayTrigger`), también con el sidebar colapsado (solo iconos)
 *   y en el drawer móvil: ningún `overflow` los recorta.
 * - El gesto se configura con `submenu` según el ancho de pantalla; por
 *   defecto `hover` en escritorio y `click` en móvil (breakpoint 768 px).
 * - Colapso total (solo iconos) en desktop para vistas de mapa (módulo
 *   inmobiliario). El botón ⇤/⇥ queda siempre visible para restaurar.
 * - `layout="horizontal"` lo vuelve barra superior con desplegables.
 * - `fixed` lo hace sticky; `pinned` lo mantiene fijo en escritorio.
 * - `blur` le da fondo translúcido.
 * - En móvil es off-canvas con backdrop (`mobileOpen`).
 * - En vertical admite `header`, `apps` y `user` proyectados; si no se
 *   proyecta `header`, conserva la marca configurada en `brand`.
 * - Filtra ítems por `permission` (p. ej. `CLINIC_PATIENTS_LIST`).
 * - Iconos por clase `icon` (`fi fi-rr-users`) o SVG inline `svg`
 *   (duotone / streamline, con prioridad sobre `icon`).
 *
 * Inputs: `items` (obligatorio), `permissions`, `layout`, `fixed`, `pinned`,
 * `centerNav`, `blur`, `floating`, `brand`, `submenu`; models `collapsed` y
 * `mobileOpen`; output `itemPressed`.
 *
 * ```html
 * <sirem-sidebar [items]="items" [(collapsed)]="collapsed" [pinned]="true">
 *   <sirem-button slot="apps" iconOnly aria-label="Aplicaciones" />
 *   <sirem-user-menu slot="user" userName="Ana Pérez" />
 * </sirem-sidebar>
 *
 * <sirem-sidebar
 *   [items]="items"
 *   [submenu]="{ breakpoint: 1024, desktop: { trigger: 'hover' }, mobile: { trigger: 'click' } }"
 * />
 * ```
 */
@Component({
  selector: 'sirem-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    SiremFiIcon,
    SiremButton,
    SiremOverlayTrigger,
    SiremTooltipDirective,
  ],
  host: { '[class.is-collapsed]': 'collapsed()' },
  template: `
    @if (layout() === 'horizontal') {
      <div
        class="sirem-sidebar sirem-sidebar--horizontal"
        [class.sirem-sidebar--fixed]="fixed()"
        [class.sirem-sidebar--blur]="blur()"
        aria-label="Navegación principal"
      >
        <div class="sirem-sidebar__brand sirem-sidebar__brand--h">
          <span class="sirem-sidebar__logo" aria-hidden="true">
            {{ brandInitial() }}
          </span>
          <span class="sirem-sidebar__brand-name">{{ brand() }}</span>
        </div>
        <nav class="sirem-sidebar__nav sirem-sidebar__nav--h">
          @for (item of visibleItems(); track item.label) {
            <div class="sirem-sidebar__hitem">
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
                  class="sirem-sidebar__link"
                >
                  @if (item.img) {
                    <img [src]="item.img" alt="" class="sirem-sidebar__img" aria-hidden="true" />
                  } @else if (item.svg) {
                    <span
                      class="sirem-sidebar__svgicon"
                      [innerHTML]="safeSvg(item.svg)"
                      aria-hidden="true"
                    ></span>
                  } @else if (item.icon) {
                    <i [class]="item.icon + ' sirem-sidebar__icon'" aria-hidden="true"></i>
                  }
                  <span>{{ item.label }}</span>
                  <span class="sirem-sidebar__chev" aria-hidden="true">
                    {{ submenuOpen(item.label) ? '▴' : '▾' }}
                  </span>
                </button>
              } @else {
                <ng-container
                  *ngTemplateOutlet="linkTpl; context: { $implicit: item }"
                ></ng-container>
              }
            </div>
          }
        </nav>
      </div>
    } @else {
      @if (mobileOpen()) {
        <div
          class="sirem-sidebar__backdrop"
          (click)="mobileOpen.set(false)"
          aria-hidden="true"
        ></div>
      }
      <aside
        class="sirem-sidebar"
        [class.sirem-sidebar--open]="mobileOpen()"
        [class.sirem-sidebar--collapsed]="collapsed()"
        [class.sirem-sidebar--fixed]="fixed()"
        [class.sirem-sidebar--pinned]="pinned()"
        [class.sirem-sidebar--blur]="blur()"
        [class.sirem-sidebar--floating]="floating()"
        aria-label="Navegación principal"
      >
        <div class="sirem-sidebar__brand">
          <div class="sirem-sidebar__header">
            <ng-content select="[slot='header']">
              <span class="sirem-sidebar__logo" aria-hidden="true">
                {{ brandInitial() }}
              </span>
              <span class="sirem-sidebar__label sirem-sidebar__brand-name">
                {{ brand() }}
              </span>
            </ng-content>
          </div>

          <div class="sirem-sidebar__header-actions">
            <sirem-button size="sm" variant="ghost" [bordered]="false"

              (click)="collapsed.set(!collapsed())"
              [attr.aria-label]="collapsed() ? 'Expandir menú' : 'Contraer menú'"
              [attr.aria-expanded]="!collapsed()"
              [attr.title]="collapsed() ? 'Expandir menú' : 'Contraer menú'"
                          [iconOnly]="true"
            >
              @if(collapsed()){
                <sirem-fi-icon name="rr-angle-small-right" />
              } @else {
                <sirem-fi-icon name="rr-angle-small-left" />
              }
              <span class="sr-only">Aplicaciones</span>

            </sirem-button>
            <ng-content select="[slot='apps']" />
          </div>
        </div>

        <nav class="sirem-sidebar__nav" [class.sirem-sidebar__nav--center]="centerNav()">
          @for (item of visibleItems(); track item.label) {
            @if (item.children?.length) {
              <button
                type="button"
                [siremOverlay]="dropTpl"
                [siremOverlayData]="{ item: item, showTitle: collapsed() }"
                [siremOverlayTrigger]="submenuResolved().trigger"
                [siremOverlayPlacement]="submenuResolved().placement"
                [siremOverlayOffset]="submenuResolved().offset"
                [siremOverlayHoverDelayMs]="submenuResolved().hoverDelayMs"
                [siremOverlayHoverHideDelayMs]="submenuResolved().hoverHideDelayMs"
                [open]="submenuOpen(item.label)"
                (openChange)="setSubmenuOpen(item.label, $event)"
                class="sirem-sidebar__link"
                [attr.title]="collapsed() ? item.label : null"
              >
                @if (item.img) {
                  <img [src]="item.img" alt="" class="sirem-sidebar__img" aria-hidden="true" />
                } @else if (item.svg) {
                  <span
                    class="sirem-sidebar__svgicon"
                    [innerHTML]="safeSvg(item.svg)"
                    aria-hidden="true"
                  ></span>
                } @else if (item.icon) {
                  <i [class]="item.icon + ' sirem-sidebar__icon'" aria-hidden="true"></i>
                }
                <span class="sirem-sidebar__label">{{ item.label }}</span>
                @if (item.badge !== undefined) {
                  <span class="sirem-sidebar__label sirem-sidebar__badge">
                    {{ item.badge }}
                  </span>
                }
                <span class="sirem-sidebar__label sirem-sidebar__chev" aria-hidden="true">
                  {{ submenuOpen(item.label) ? '▾' : '▸' }}
                </span>
              </button>
            } @else {
              <ng-container
                *ngTemplateOutlet="linkTpl; context: { $implicit: item }"
              ></ng-container>
            }
          }
        </nav>

        <div class="sirem-sidebar__user">
          <ng-content select="[slot='user']" />
        </div>
      </aside>
    }

    <!--
      Desplegable en la capa de overlays: asi no lo recorta ningun overflow
      de la barra, del rail colapsado ni del drawer movil. El gesto (hover/
      click) y el lado salen de submenuResolved(), segun el ancho de pantalla.
    -->
    <ng-template #dropTpl let-data>
      <div class="sirem-overlay__panel" role="menu">
        @if (data.showTitle) {
          <p class="sirem-sidebar__panel-title">{{ data.item.label }}</p>
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
          routerLinkActive="sirem-sidebar__link--active"
          (click)="closeMenus(inPanel)"
          [siremTooltip]="linkTooltip(item)"
          siremTooltipPlacement="right"
          class="sirem-sidebar__link"
          [attr.title]="collapsed() ? item.label : null"
        >
          @if (item.img) {
            <img [src]="item.img" alt="" class="sirem-sidebar__img" aria-hidden="true" />
          } @else if (item.svg) {
            <span
              class="sirem-sidebar__svgicon"
              [innerHTML]="safeSvg(item.svg)"
              aria-hidden="true"
            ></span>
          } @else if (item.icon) {
            <i [class]="item.icon + ' sirem-sidebar__icon'" aria-hidden="true"></i>
          }
          <span class="sirem-sidebar__label">{{ item.label }}</span>
          @if (item.badge !== undefined) {
            <span class="sirem-sidebar__label sirem-sidebar__badge">
              {{ item.badge }}
            </span>
          }
        </a>
      } @else if (item.href) {
        <a
          [href]="item.href"
          (click)="closeMenus(inPanel)"
          [siremTooltip]="linkTooltip(item)"
          siremTooltipPlacement="right"
          class="sirem-sidebar__link"
          [attr.title]="collapsed() ? item.label : null"
        >
          @if (item.img) {
            <img [src]="item.img" alt="" class="sirem-sidebar__img" aria-hidden="true" />
          } @else if (item.svg) {
            <span
              class="sirem-sidebar__svgicon"
              [innerHTML]="safeSvg(item.svg)"
              aria-hidden="true"
            ></span>
          } @else if (item.icon) {
            <i [class]="item.icon + ' sirem-sidebar__icon'" aria-hidden="true"></i>
          }
          <span class="sirem-sidebar__label">{{ item.label }}</span>
          @if (item.badge !== undefined) {
            <span class="sirem-sidebar__label sirem-sidebar__badge">
              {{ item.badge }}
            </span>
          }
        </a>
      } @else {
        <button
          type="button"
          (click)="itemPressed.emit(item); closeMenus(inPanel)"
          [siremTooltip]="linkTooltip(item)"
          siremTooltipPlacement="right"
          class="sirem-sidebar__link"
          [attr.title]="collapsed() ? item.label : null"
        >
          @if (item.img) {
            <img [src]="item.img" alt="" class="sirem-sidebar__img" aria-hidden="true" />
          } @else if (item.svg) {
            <span
              class="sirem-sidebar__svgicon"
              [innerHTML]="safeSvg(item.svg)"
              aria-hidden="true"
            ></span>
          } @else if (item.icon) {
            <i [class]="item.icon + ' sirem-sidebar__icon'" aria-hidden="true"></i>
          }
          <span class="sirem-sidebar__label">{{ item.label }}</span>
        </button>
      }
    </ng-template>
  `,
  styleUrl: './sirem-sidebar.scss',
})
export class SiremSidebar {
  readonly items = input.required<SiremNavItem[]>();
  /** Permisos del usuario; los ítems con `permission` ausente se ocultan. */
  readonly permissions = input<Set<string> | string[] | null>(null);
  /** Disposición: lateral clásica u horizontal superior. */
  readonly layout = input<'vertical' | 'horizontal'>('vertical');
  /** Fija la barra al hacer scroll (`position: sticky`). */
  readonly fixed = input(false);
  /** Mantiene el sidebar vertical fijo a pantalla completa en escritorio. */
  readonly pinned = input(false);
  /** Centra verticalmente los ítems de navegación cuando hay espacio. */
  readonly centerNav = input(false);
  /** Fondo translúcido con desenfoque (ideal con `fixed`). */
  readonly blur = input(false);
  /** Panel flotante: se separa de los bordes con margen y radio (dashboard). */
  readonly floating = input(false);
  /** Colapso total (desktop): solo iconos. Ideal para mapas. */
  readonly collapsed = model(false);
  /** Drawer en móvil. */
  readonly mobileOpen = model(false);
  readonly brand = input('SIREM UI');

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

  readonly brandInitial = computed(() => this.brand().trim().charAt(0).toUpperCase() || 'S');

  /**
   * Texto del tooltip de un enlace: solo con el sidebar colapsado (rail de
   * iconos), donde la etiqueta queda oculta. `null` desactiva el tooltip.
   */
  linkTooltip(item: SiremNavItem): string | null {
    return this.collapsed() ? (item.tooltip ?? item.label) : null;
  }

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

  readonly visibleItems = computed(() => this.items().filter((i) => this.canSee(i)));

  visibleChildren(item: SiremNavItem): SiremNavItem[] {
    return (item.children ?? []).filter((c) => this.canSee(c));
  }

  // ------------------------------------------------------------ submenús

  /** Ancho del viewport; define qué banda (`mobile` / `desktop`) está activa. */
  private readonly viewportWidth = injectSiremViewportWidth();

  /**
   * Opciones del overlay efectivas para el ancho actual: fusiona la banda
   * activa, los valores comunes y los defectos (`hover` en escritorio,
   * `click` en móvil; `bottom-start` en la barra horizontal y `right-start`
   * en el rail lateral).
   */
  readonly submenuResolved = computed<SiremSubmenuResolved>(() =>
    resolveSiremSubmenu(
      this.submenu(),
      this.viewportWidth(),
      this.layout() === 'horizontal' ? 'bottom-start' : 'right-start',
    ),
  );

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
   * Pulsación de un enlace: cierra el drawer móvil y, si el enlace estaba
   * dentro de un panel de overlay, también su submenú, para no dejarlo
   * flotando sobre la vista recién abierta.
   */
  closeMenus(inPanel?: boolean): void {
    this.mobileOpen.set(false);
    if (inPanel) this.closeSubmenus();
  }
}
