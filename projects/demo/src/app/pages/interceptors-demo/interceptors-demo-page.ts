import { Component } from '@angular/core';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-interceptors-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard],
  template: `
    <app-demo-page-layout title="Interceptores" category="Interceptores" subtitle="Auth Bearer + base URL para el HttpClient.">
      <app-demo-variant-card title="Autenticación" description="Cabecera Bearer en cada petición." [htmlCode]="h1" [tsCode]="t1">
        <p class="text-sm text-slate-600">El token sale del proveedor que registres; sin token la petición pasa intacta.</p>
      </app-demo-variant-card>
      <app-demo-variant-card title="Base URL" description="Prefija /api/… con tu dominio." [htmlCode]="h2" [tsCode]="t2">
        <p class="text-sm text-slate-600">Las URLs absolutas pasan intactas. Ideal para los optionsEndpoint remotos.</p>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class InterceptorsDemoPage {
  readonly h1 = `// app.config.ts
providers: [
  provideHttpClient(withInterceptors([siremAuthInterceptor])),
  provideSiremAuth(() => localStorage.getItem('token')),
]

// La petición sale así:
// GET /api/pacientes  →  Authorization: Bearer abc123`;
  readonly t1 = `import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideSiremAuth, siremAuthInterceptor } from 'deorta-sirem-ui';`;
  readonly h2 = `// app.config.ts
providers: [
  provideHttpClient(withInterceptors([siremBaseUrlInterceptor])),
  provideSiremApiUrl('https://api.sirem.com'),
]

// GET /api/pacientes  →  GET https://api.sirem.com/api/pacientes`;
  readonly t2 = `import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideSiremApiUrl, siremBaseUrlInterceptor } from 'deorta-sirem-ui';`;
}
