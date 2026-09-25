import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SiremFiIcon } from '../../icons/fi-icon/sirem-fi-icon';
import { SiremButton } from '../../button/sirem-button';

/** Ítem de navegación jerárquica del sidebar / navbar. */
export interface SiremNavItem {
  label: string;
  /** Clase CSS del icono (p. ej. `fi fi-rr-users`). */
  icon?: string;
  /** SVG inline (duotone/streamline). Tiene prioridad sobre `icon`. */
  svg?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  route?: string | any[];
  badge?: string | number;
  /** Permiso requerido; se oculta si no está en `permissions`. */
  permission?: string;
  children?: SiremNavItem[];
}

/**
 * Menú lateral jerárquico, colapsable y responsivo.
 * - Expande/colapsa submenús; colapso total (solo iconos) en desktop
 *   para vistas de mapa (módulo inmobiliario). El botón ⇤/⇥ queda
 *   siempre visible para restaurar.
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
 * ```html
 * <sirem-sidebar [items]="items" [(collapsed)]="collapsed" [pinned]="true">
 *   <sirem-button slot="apps" iconOnly aria-label="Aplicaciones" />
 *   <sirem-user-menu slot="user" userName="Ana Pérez" />
 * </sirem-sidebar>
 * ```
 */
@Component({
  selector: 'sirem-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet, SiremFiIcon, SiremButton],
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
                  (click)="toggle(item.label)"
                  [attr.aria-expanded]="isExpanded(item.label)"
                  class="sirem-sidebar__link"
                >
                  @if (item.svg) {
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
                    {{ isExpanded(item.label) ? '▾' : '▸' }}
                  </span>
                </button>
                @if (isExpanded(item.label)) {
                  <div class="sirem-sidebar__drop" role="menu">
                    @for (child of visibleChildren(item); track child.label) {
                      <ng-container
                        *ngTemplateOutlet="linkTpl; context: { $implicit: child }"
                      ></ng-container>
                    }
                  </div>
                }
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
            <sirem-button size="sm" variant="secondary"

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
                (click)="toggle(item.label)"
                [attr.aria-expanded]="isExpanded(item.label)"
                class="sirem-sidebar__link"
                [attr.title]="collapsed() ? item.label : null"
              >
                @if (item.svg) {
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
                  {{ isExpanded(item.label) ? '▾' : '▸' }}
                </span>
              </button>
              @if (isExpanded(item.label)) {
                <div class="sirem-sidebar__label sirem-sidebar__children">
                  @for (child of visibleChildren(item); track child.label) {
                    <ng-container
                      *ngTemplateOutlet="linkTpl; context: { $implicit: child }"
                    ></ng-container>
                  }
                </div>
              }
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

    <ng-template #linkTpl let-item>
      @if (item.route) {
        <a
          [routerLink]="item.route"
          routerLinkActive="sirem-sidebar__link--active"
          (click)="mobileOpen.set(false)"
          class="sirem-sidebar__link"
          [attr.title]="collapsed() ? item.label : null"
        >
          @if (item.svg) {
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
          (click)="itemPressed.emit(item); mobileOpen.set(false)"
          class="sirem-sidebar__link"
          [attr.title]="collapsed() ? item.label : null"
        >
          @if (item.svg) {
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
  /** Colapso total (desktop): solo iconos. Ideal para mapas. */
  readonly collapsed = model(false);
  /** Drawer en móvil. */
  readonly mobileOpen = model(false);
  readonly brand = input('SIREM UI');

  readonly itemPressed = output<SiremNavItem>();

  private readonly sanitizer = inject(DomSanitizer);

  /** Sanitiza el SVG inline de un ítem (duotone / streamline). */
  safeSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  private readonly expandedSet = signal<ReadonlySet<string>>(new Set());

  readonly brandInitial = computed(() => this.brand().trim().charAt(0).toUpperCase() || 'S');

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
