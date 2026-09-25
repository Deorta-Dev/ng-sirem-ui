import { Component, signal } from '@angular/core';
import { SiremInput } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-input-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremInput],
  template: `
    <app-demo-page-layout title="Input" category="Formularios" subtitle="sirem-input-field — texto, iconos, validación y autocompletado.">
      <app-demo-variant-card title="Texto simple" description="Label + placeholder." [htmlCode]="h1" [tsCode]="t1">
        <sirem-input-field label="Nombres" placeholder="Ej. María Torres" [(value)]="nombre" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con iconos y ayuda" description="prefix/suffix + hint y error." [htmlCode]="h2" [tsCode]="t1">
        <sirem-input-field label="Correo" type="email" prefixIcon="fi fi-rr-envelope" hint="Te enviaremos la fórmula." [(value)]="correo" />
        <sirem-input-field label="Documento" error="Campo requerido." [(value)]="doc" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Autocompletado" description="options filtra; strictOptions lo vuelve select." [htmlCode]="h3" [tsCode]="t2">
        <sirem-input-field label="Diagnóstico" [options]="dx" placeholder="Buscar…" [(value)]="dxSel" />
        <sirem-input-field label="EPS (estricto)" [options]="eps" [strictOptions]="true" [(value)]="epsSel" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Autocompletado con valor" description="El ✕ borra el texto y la selección." [htmlCode]="h5" [tsCode]="t2">
        <sirem-input-field label="Diagnóstico" [options]="dx" [(value)]="dxCon" />
        <span class="text-sm text-slate-600 w-full">Valor: {{ dxCon() || '—' }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card title="Estados" description="Campos requeridos y deshabilitados." [htmlCode]="h4" [tsCode]="t1">
        <sirem-input-field label="Requerido" [required]="true" placeholder="Obligatorio" [(value)]="req" />
        <sirem-input-field label="Deshabilitado" [disabled]="true" placeholder="No editable" [(value)]="dis" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Remota con envoltura" description="optionsResponsePath=result.objects + items { nombre, valor } sin mapper." [htmlCode]="h6" [tsCode]="t3">
        <sirem-input-field label="EPS (remota)" optionsEndpoint="/api-demo/eps"
          optionsResponsePath="result.objects" [strictOptions]="true" [(value)]="epsRemota" />
        <span class="text-sm text-slate-600 w-full">Valor: {{ epsRemota() || '—' }}</span>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class InputDemoPage {
  readonly nombre = signal('');
  readonly correo = signal('');
  readonly doc = signal('');
  readonly dxSel = signal('');
  readonly dxCon = signal<string | number | (string | number)[] | null>('H52.1');
  readonly epsSel = signal('');
  readonly req = signal('');
  readonly dis = signal('');
  readonly dx = [{ value: 'H52.1', label: 'H52.1 Miopía' }, { value: 'H52.0', label: 'H52.0 Hipermetropía' }];
  readonly eps = [{ value: 'sura', label: 'Sura' }, { value: 'sanitas', label: 'Sanitas' }];
  readonly h1 = '<sirem-input-field label="Nombres" placeholder="Ej. María Torres" [(value)]="nombre" />';
  readonly h2 = '<sirem-input-field label="Correo" type="email"\n  prefixIcon="fi fi-rr-envelope" hint="Te enviaremos la fórmula."\n  [(value)]="correo" />\n<sirem-input-field label="Documento" error="Campo requerido." [(value)]="doc" />';
  readonly h3 = '<sirem-input-field label="Diagnóstico" [options]="dx"\n  placeholder="Buscar…" [(value)]="dxSel" />\n<sirem-input-field label="EPS (estricto)" [options]="eps"\n  [strictOptions]="true" [(value)]="epsSel" />';
  readonly h4 = '<sirem-input-field label="Requerido" [required]="true"\n  placeholder="Obligatorio" [(value)]="req" />\n<sirem-input-field label="Deshabilitado" [disabled]="true"\n  placeholder="No editable" [(value)]="dis" />';
  readonly h5 = '<sirem-input-field label="Diagnóstico" [options]="dx" [(value)]="dxCon" />\n<span class="text-sm text-slate-600 w-full">Valor: {{ dxCon() || \'—\' }}</span>';
  readonly t1 = `import { signal } from '@angular/core';
import { SiremInput } from 'deorta-sirem-ui';

readonly nombre = signal('');
readonly correo = signal('');
readonly doc = signal('');
readonly req = signal('');
readonly dis = signal('');`;
  readonly t2 = `import { signal } from '@angular/core';
import { SiremInput } from 'deorta-sirem-ui';

readonly dxSel = signal('');
readonly dxCon = signal<string | number | (string | number)[] | null>('H52.1');
readonly epsSel = signal('');
readonly dx = [
  { value: 'H52.1', label: 'H52.1 Miopía' },
  { value: 'H52.0', label: 'H52.0 Hipermetropía' },
];
  readonly eps = [
    { value: 'sura', label: 'Sura' },
    { value: 'sanitas', label: 'Sanitas' },
  ];`;
  readonly epsRemota = signal('');
  readonly h6 = '<sirem-input-field label="EPS (remota)" optionsEndpoint="/api-demo/eps"\n  optionsResponsePath="result.objects" [strictOptions]="true" [(value)]="epsRemota" />\n<span class="text-sm text-slate-600 w-full">Valor: {{ epsRemota() || \'—\' }}</span>';
  readonly t3 = `import { signal } from '@angular/core';
import { HttpInterceptorFn, HttpResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { delay, of } from 'rxjs';
import { SiremInput } from 'deorta-sirem-ui';

// Simula GET /api-demo/eps → { result: { objects: [{ nombre, valor }] } }
export const mockEpsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'GET' && req.url === '/api-demo/eps') {
    return of(new HttpResponse({ status: 200, body: {
      result: { objects: [
        { nombre: 'Sura EPS', valor: 'sura' },
        { nombre: 'Sanitas EPS', valor: 'sanitas' },
        { nombre: 'Nueva EPS', valor: 'nueva-eps' },
      ] },
    } })).pipe(delay(600));
  }
  return next(req);
};

// En el app.config.ts:
// provideHttpClient(withInterceptors([mockEpsInterceptor]))

readonly epsRemota = signal('');`;
}
