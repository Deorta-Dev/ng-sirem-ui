import {
  EnvironmentProviders,
  InjectionToken,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

/** Provee el token Bearer (`() => string | null`). Por defecto no hay token. */
export const SIREM_AUTH_TOKEN_PROVIDER = new InjectionToken<() => string | null>(
  'SIREM_AUTH_TOKEN_PROVIDER',
  { factory: () => () => null },
);

/**
 * Agrega `Authorization: Bearer <token>` a cada petición cuando
 * el proveedor configurado devuelve un token.
 *
 * Uso:
 * ```ts
 * providers: [
 *   provideHttpClient(withInterceptors([siremAuthInterceptor])),
 *   provideSiremAuth(() => localStorage.getItem('token')),
 * ]
 * ```
 */
export const siremAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(SIREM_AUTH_TOKEN_PROVIDER)();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

/** Registra el proveedor de token para `siremAuthInterceptor`. */
export function provideSiremAuth(getToken: () => string | null): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: SIREM_AUTH_TOKEN_PROVIDER, useValue: getToken },
  ]);
}
