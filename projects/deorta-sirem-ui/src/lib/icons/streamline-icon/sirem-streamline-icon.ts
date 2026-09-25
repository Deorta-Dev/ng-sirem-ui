import {
  Component,
  EnvironmentProviders,
  InjectionToken,
  computed,
  inject,
  input,
  makeEnvironmentProviders,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/** Mapa nombre → SVG inline. Ej: `{ 'home-duotone': '<svg ...>...</svg>' }`. */
export type StreamlineIconMap = Record<string, string>;

/**
 * Registro de iconos Streamline de la app consumidora.
 * Los SVG se exportan desde https://www.streamlinehq.com/ (estilo Ultimate Duotone)
 * y se registran con `provideStreamlineIcons()`.
 */
export const STREAMLINE_ICON_REGISTRY = new InjectionToken<StreamlineIconMap>(
  'STREAMLINE_ICON_REGISTRY',
  { factory: () => ({}) },
);

/**
 * Registra los SVG de Streamline disponibles en la app.
 *
 * ```ts
 * // app.config.ts
 * import { provideStreamlineIcons } from 'deorta-sirem-ui';
 * import { STREAMLINE_HOME, STREAMLINE_USER } from './icons/streamline.icons';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideStreamlineIcons({ 'home-duotone': STREAMLINE_HOME })],
 * };
 * ```
 */
export function provideStreamlineIcons(icons: StreamlineIconMap): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: STREAMLINE_ICON_REGISTRY, useValue: icons, multi: false },
  ]);
}

/**
 * Icono Streamline (SVG inline registrado por nombre).
 *
 * Diseñado para Streamline Ultimate Duotone: respeta las dos capas del SVG
 * (relleno `opacity="0.2"` + forma sólida) y hereda `currentColor`.
 * Acepta también `svg` directo para casos puntuales / demos.
 *
 * Uso:
 * ```html
 * <sirem-streamline-icon name="home-duotone" [size]="24" />
 * <sirem-streamline-icon [svg]="miSvg" class="text-sirem-600" />
 * ```
 *
 * NOTA LICENCIA: Ultimate Duotone es un set Pro de Streamline.
 * Descarga los SVG con tu suscripción desde la web y colócalos en
 * `src/app/icons/` (ver `docs/STREAMLINE.md` en la demo). Sin suscripción
 * puedes usar los sets gratuitos (CC BY 4.0) o Phosphor Duotone.
 */
@Component({
  selector: 'sirem-streamline-icon',
  standalone: true,
  styleUrl: './sirem-streamline-icon.scss',
  template: `
    <span
      class="sirem-streamline"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [innerHTML]="safeSvg()"
      [attr.aria-hidden]="label() ? null : 'true'"
      [attr.aria-label]="label() ?? null"
      [attr.role]="label() ? 'img' : null"
      [attr.data-icon]="resolvedName()"
    ></span>
  `,
})
export class SiremStreamlineIcon {
  /** Nombre registrado vía `provideStreamlineIcons()`. */
  readonly name = input<string | null>(null);
  /** SVG directo (tiene prioridad sobre `name`). */
  readonly svg = input<string | null>(null);
  readonly size = input<number>(24);
  readonly label = input<string | null>(null);

  private readonly sanitizer = inject(DomSanitizer);
  private readonly registry = inject(STREAMLINE_ICON_REGISTRY, { optional: true }) ?? {};

  readonly resolvedName = computed(() => this.name() ?? 'inline');

  private readonly rawSvg = computed(() => {
    const direct = this.svg();
    if (direct) return direct;
    const name = this.name();
    if (name && this.registry[name]) return this.registry[name];
    return missingIconSvg(name ?? 'desconocido');
  });

  readonly safeSvg = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.rawSvg()),
  );
}

function missingIconSvg(name: string): string {
  void name;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="4" opacity="0.2" fill="currentColor" stroke="none"/><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg>`;
}
