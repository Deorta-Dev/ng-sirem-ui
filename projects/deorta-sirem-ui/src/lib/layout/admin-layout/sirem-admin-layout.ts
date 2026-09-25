import { Component, model } from '@angular/core';

/**
 * Contenedor maestro de la app autenticada (equivale a `lo-admin-layout`).
 * Header a todo el ancho arriba; debajo, sidebar + contenido.
 * El modo `fullscreen` oculta el chrome para vistas que necesitan el 100%
 * (mapas, GPS).
 *
 * Uso:
 * ```html
 * <sirem-admin-layout [(fullscreen)]="fs">
 *   <sirem-topbar slot="topbar" (menuPressed)="menuAbierto = true" ... />
 *   <sirem-sidebar slot="sidebar" [items]="nav" [(mobileOpen)]="menuAbierto" />
 *   <router-outlet />
 * </sirem-admin-layout>
 * ```
 */
@Component({
  selector: 'sirem-admin-layout',
  standalone: true,
  styleUrl: './sirem-admin-layout.scss',
  template: `
    <div class="sirem-admin">
      @if (!fullscreen()) {
        <ng-content select="[slot='topbar']" />
      } @else {
        <div class="sirem-admin__exit">
          <button
            type="button"
            (click)="fullscreen.set(false)"
            class="sirem-admin__exit-btn"
          >
            Salir de pantalla completa
          </button>
        </div>
      }
      <div class="sirem-admin__body">
        @if (!fullscreen()) {
          <ng-content select="[slot='sidebar']" />
        }
        <main class="sirem-admin__main">
          <ng-content />
        </main>
      </div>
    </div>
  `,
})
export class SiremAdminLayout {
  readonly fullscreen = model(false);
}
