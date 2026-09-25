import {
  EnvironmentProviders,
  InjectionToken,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

/** URL base del API (p. ej. `https://api.sirem.com`). Sin valor por defecto. */
export const SIREM_API_BASE_URL = new InjectionToken<string>(
  'SIREM_API_BASE_URL',
  { factory: () => '' },
);

/**
 * Prefija la base URL a las peticiones relativas (`/api/...`).
 * Las URLs absolutas (`http…`) pasan intactas. Ideal para los
 * `optionsEndpoint` de los campos remotos.
 *
 * Uso:
 * ```ts
 * providers: [
 *   provideHttpClient(withInterceptors([siremBaseUrlInterceptor])),
 *   provideSiremApiUrl('https://api.sirem.com'),
 * ]
 * ```
 */
export const siremBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const base = inject(SIREM_API_BASE_URL).replace(/\/+$/, '');
  if (!base || !req.url.startsWith('/')) return next(req);
  return next(req.clone({ url: `${base}${req.url}` }));
};

/** Registra la base URL para `siremBaseUrlInterceptor`. */
export function provideSiremApiUrl(baseUrl: string): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: SIREM_API_BASE_URL, useValue: baseUrl }]);
}
