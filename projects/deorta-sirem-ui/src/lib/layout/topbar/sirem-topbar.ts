import { Component, computed, HostListener, input, output, signal } from '@angular/core';
import { SiremFiIcon } from '../../icons/fi-icon/sirem-fi-icon';
import { SiremButton } from '../../button/sirem-button';

/** Cómo se alinea el buscador dentro de la barra. */
export type SiremTopbarSearchAlign = 'start' | 'center';
/** Estética global de la barra. */
export type SiremTopbarAppearance = 'default' | 'cards';

/**
 * Barra superior: hamburguesa (móvil), workspace a la izquierda,
 * buscador global (Ctrl+K), acciones especiales y pantalla completa.
 * El menú de usuario se proyecta en `slot="user"`.
 *
 * ## Apariencia
 * - `default`: barra continua con borde inferior (uso clásico).
 * - `cards`: la barra se vuelve transparente y cada pieza (workspace,
 *   buscador, acciones) se convierte en una tarjeta flotante con sombra,
 *   como en la referencia. Se combina con `searchAlign="center"` para dejar
 *   el buscador centrado.
 *
 * ## Buscador
 * `searchPlaceholder` admite emphasis con `searchHighlight`, que se pinta en
 * negrita dentro del texto atenuado. `searchHint` es la tecla sugerida y se
 * oculta si va vacía.
 *
 * Uso:
 * ```html
 * <sirem-topbar
 *   appearance="cards"
 *   searchAlign="center"
 *   spaceLabel="Panel principal"
 *   searchPlaceholder="Buscar en "
 *   searchHighlight="Soeimn Lion Master"
 *   searchHint="Ctrl + K"
 *   (searchPressed)="paleta.set(true)"
 * >
 *   <sirem-user-menu slot="user" userName="..." userDetail="..." />
 * </sirem-topbar>
 * ```
 */
@Component({
  selector: 'sirem-topbar',
  standalone: true,
  imports: [SiremFiIcon, SiremButton],
  styleUrl: './sirem-topbar.scss',
  template: `
    <header
      class="sirem-topbar"
      [class.sirem-topbar--fixed]="fixed()"
      [class.sirem-topbar--blur]="blur()"
      [class.sirem-topbar--transparent]="transparent()"
      [class.sirem-topbar--shadow]="scrolled()"
      [class.sirem-topbar--floating]="floating()"
      [class.sirem-topbar--cards]="appearance() === 'cards'"
      [class.sirem-topbar--search-center]="searchAlign() === 'center'"
    >
      <!-- Cabezal izquierdo: menú + workspace + chip de página agrupados en
           una sola celda, para que el buscador centrado no los desplace. -->
      <div class="sirem-topbar__left">
        <button
          type="button"
          (click)="menuPressed.emit()"
          class="sirem-topbar__icon-btn sirem-topbar__icon-btn--menu"
          aria-label="Abrir menú"
        >
          <sirem-fi-icon name="rr-menu" />
        </button>

        @if (showSpace()) {
          <sirem-button
            size="md"
            variant="secondary"
            (click)="spacePressed.emit()"
            [attr.aria-label]="'Cambiar de ' + spaceAriaLabel()"
            [title]="'Cambiar de ' + spaceAriaLabel()"
          >
            @if (showSpaceDot()) {
              <span aria-hidden="true" class="sirem-topbar__space-dot">◉</span>
            }
            <span class="sirem-topbar__space-label">{{ spaceLabel() }}</span>
            @if (showSpaceChevron()) {
              <span aria-hidden="true" class="sirem-topbar__space-chev">▾</span>
            }
          </sirem-button>
        }

        @if (pageTitle()) {
          <div class="sirem-topbar__page">
            <span class="sirem-topbar__page-title">{{ pageTitle() }}</span>
            @if (pageSupTitle()) {
              <span class="sirem-topbar__page-sub">{{ pageSupTitle() }}</span>
            }
          </div>
        }
      </div>

      <sirem-button
        class="sirem-topbar__search-toggle"
        (click)="searchPressed.emit()"
        [attr.aria-label]="searchAriaLabel()"
        size="md" variant="secondary"
      >
        <sirem-fi-icon name="rr-search" class="sirem-topbar__search-icon" />
        <span class="sirem-topbar__search-text">
          <span class="sirem-topbar__search-prefix">{{ searchPlaceholder() }}</span
          >@if (searchHighlight()) {
            <strong class="sirem-topbar__search-hl">{{ searchHighlight() }}</strong>
          }
        </span>
        @if (searchHint()) {
          <kbd class="sirem-topbar__kbd">{{ searchHint() }}</kbd>
        }
      </sirem-button>

      <button
        type="button"
        (click)="searchPressed.emit()"
        class="sirem-topbar__icon-btn sirem-topbar__search-btn"
        aria-label="Búsqueda global"
      >
        <sirem-fi-icon name="rr-search" />
      </button>

      <div class="sirem-topbar__right">
        @if (showFullscreen()) {
          <sirem-button
            (click)="fullscreenPressed.emit()"
            aria-label="Pantalla completa"
            title="Pantalla completa"
            variant="secondary"
            size="md"
          >
            <sirem-fi-icon name="rr-expand" />
          </sirem-button>
        }

        <ng-content select="[slot='actions']" />
        <ng-content select="[slot='user']" />
      </div>
    </header>
  `,
})
export class SiremTopbar {
  /** Workspace o sede actual. Dispara `spacePressed` para abrir su selector. */
  readonly spaceLabel = input('Mi espacio');
  /** Texto del workspace cuando no se muestra como botón (móvil). */
  readonly spaceAriaLabel = input('workspace');
  /** Título de la página actual (chip al lado del workspace). */
  readonly pageTitle = input('');
  /** Subtítulo del chip de página (opcional, en versalitas). */
  readonly pageSupTitle = input('');
  /** Fija la barra al hacer scroll (`position: sticky`). */
  readonly fixed = input(false);
  /** Fondo translúcido con desenfoque (ideal con `fixed`). */
  readonly blur = input(false);
  /**
   * Fondo transparente: el shell de la app se ve a través de la barra.
   * Se puede combinar con `blur` (queda transparente + `backdrop-filter`,
   * el clásico header cristal) o con `floating`/`appearance="cards"`.
   */
  readonly transparent = input(false);
  /**
   * Muestra la sombra al hacer scroll (`shadowOnScroll`): la barra gana
   * elevación cuando el contenido pasa por debajo (útil con `fixed`).
   */
  readonly shadowOnScroll = input(false);
  /** Muestra el botón de workspace/sucursal. */
  readonly showSpace = input(true);
  /**
   * Barra flotante: se separa de los bordes con margen y radio, con fondo
   * transparente (se ve el shell; borde + blur dan legibilidad). El margen
   * izquierdo lo puede fijar el shell con `--sirem-topbar-inset-left`.
   */
  readonly floating = input(false);
  /** Estética global: `default` continua, `cards` piezas flotantes. */
  readonly appearance = input<SiremTopbarAppearance>('default');
  /** Alineación del buscador; `center` lo deja centrado en la barra. */
  readonly searchAlign = input<SiremTopbarSearchAlign>('start');
  /** Texto atenuado del buscador. */
  readonly searchPlaceholder = input('Buscar pacientes, facturas, placas…');
  /** Parte del placeholder que se muestra en negrita. */
  readonly searchHighlight = input('');
  /** Tecla sugerida; cadena vacía la oculta. */
  readonly searchHint = input('Ctrl K');
  /** Muestra el botón de pantalla completa. */
  readonly showFullscreen = input(true);
  /** Muestra el punto decorativo junto al workspace. */
  readonly showSpaceDot = input(true);
  /** Muestra la flecha del workspace (indica que abre un selector). */
  readonly showSpaceChevron = input(true);

  /** Etiqueta accesible del buscador, con la tecla sugerida incluida. */
  readonly searchAriaLabel = computed(() =>
    this.searchHint() ? `Búsqueda global (${this.searchHint()})` : 'Búsqueda global',
  );

  /** Posición de scroll actual (solo se observa con `shadowOnScroll`). */
  readonly scrolled = signal(false);

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!this.shadowOnScroll()) {
      this.scrolled.set(false);
      return;
    }
    this.scrolled.set(window.scrollY > 5);
  }

  readonly menuPressed = output<void>();
  readonly searchPressed = output<void>();
  readonly spacePressed = output<void>();
  readonly fullscreenPressed = output<void>();
}
