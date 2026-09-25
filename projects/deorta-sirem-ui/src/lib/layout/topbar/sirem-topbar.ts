import { Component, input, output } from '@angular/core';

/**
 * Barra superior: hamburguesa (móvil), buscador global (Ctrl+K),
 * selector de sucursal/espacio y pantalla completa.
 * El menú de usuario se proyecta en `slot="user"`.
 *
 * Uso:
 * ```html
 * <sirem-topbar
 *   spaceLabel="Clínica Norte"
 *   (menuPressed)="menuAbierto = true"
 *   (searchPressed)="paleta.set(true)"
 *   (spacePressed)="abrirSucursales()"
 *   (fullscreenPressed)="fs.set(true)"
 * >
 *   <sirem-user-menu slot="user" userName="..." userDetail="..." />
 * </sirem-topbar>
 * ```
 */
@Component({
  selector: 'sirem-topbar',
  standalone: true,
  styleUrl: './sirem-topbar.scss',
  template: `
    <header
      class="sirem-topbar"
      [class.sirem-topbar--fixed]="fixed()"
      [class.sirem-topbar--blur]="blur()"
    >
      <button
        type="button"
        (click)="menuPressed.emit()"
        class="sirem-topbar__icon-btn sirem-topbar__icon-btn--menu"
        aria-label="Abrir menú"
      >
        <span aria-hidden="true" class="sirem-topbar__glyph">☰</span>
      </button>

      <button
        type="button"
        (click)="searchPressed.emit()"
        class="sirem-topbar__search"
        aria-label="Búsqueda global (Ctrl+K)"
      >
        <span aria-hidden="true">⌕</span>
        <span class="sirem-topbar__search-text">Buscar pacientes, facturas, placas…</span>
        <kbd class="sirem-topbar__kbd">
          Ctrl K
        </kbd>
      </button>
      <button
        type="button"
        (click)="searchPressed.emit()"
        class="sirem-topbar__icon-btn sirem-topbar__search-btn"
        aria-label="Búsqueda global"
      >
        <span aria-hidden="true" class="sirem-topbar__glyph">⌕</span>
      </button>

      <div class="sirem-topbar__right">
        <button
          type="button"
          (click)="spacePressed.emit()"
          class="sirem-topbar__space"
          aria-label="Cambiar de sucursal"
          title="Cambiar de sucursal"
        >
          <span aria-hidden="true" class="sirem-topbar__space-dot">◉</span>
          <span class="sirem-topbar__space-label">{{ spaceLabel() }}</span>
          <span aria-hidden="true" class="sirem-topbar__space-chev">▾</span>
        </button>

        <button
          type="button"
          (click)="fullscreenPressed.emit()"
          class="sirem-topbar__icon-btn"
          aria-label="Pantalla completa"
          title="Pantalla completa"
        >
          <span aria-hidden="true" class="sirem-topbar__glyph">⛶</span>
        </button>

        <ng-content select="[slot='actions']" />
        <ng-content select="[slot='user']" />
      </div>
    </header>
  `,
})
export class SiremTopbar {
  /** Sucursal / espacio actual. Dispara `spacePressed` (diálogo de sucursales). */
  readonly spaceLabel = input('Mi espacio');
  /** Fija la barra al hacer scroll (`position: sticky`). */
  readonly fixed = input(false);
  /** Fondo translúcido con desenfoque (ideal con `fixed`). */
  readonly blur = input(false);

  readonly menuPressed = output<void>();
  readonly searchPressed = output<void>();
  readonly spacePressed = output<void>();
  readonly fullscreenPressed = output<void>();
}
