import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { mockEpsInterceptor } from './data/mock-api.interceptor';
import { provideStreamlineIcons } from 'deorta-sirem-ui';

const DEMO_STREAMLINE = '<svg viewBox="0 0 24 24" fill="currentColor"><path opacity="0.2" d="M12 3 3 11v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-9Z"/><path d="M12 3 3 11v9a1 1 0 0 0 1 1h5v-6h6v6h5a1 1 0 0 0 1-1v-9Z"/></svg>';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([mockEpsInterceptor])),
    // SVGs de ejemplo propios (no oficiales) para no bloquear sin suscripción.
    provideStreamlineIcons({ 'home-duotone': DEMO_STREAMLINE, 'calendar-duotone': DEMO_STREAMLINE }),
  ],
};
