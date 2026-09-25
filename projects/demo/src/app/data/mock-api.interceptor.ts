import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';

/**
 * Backend simulado de la demo: responde `{ result: { objects: [...] } }`
 * con items `{ nombre, valor }` para probar `optionsResponsePath`.
 * Cualquier otra petición pasa intacta.
 */
export const mockEpsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'GET' && req.url === '/api-demo/eps') {
    return of(
      new HttpResponse({
        status: 200,
        body: {
          result: {
            objects: [
              { nombre: 'Sura EPS', valor: 'sura' },
              { nombre: 'Sanitas EPS', valor: 'sanitas' },
              { nombre: 'Nueva EPS', valor: 'nueva-eps' },
            ],
          },
        },
      }),
    ).pipe(delay(600));
  }
  return next(req);
};
