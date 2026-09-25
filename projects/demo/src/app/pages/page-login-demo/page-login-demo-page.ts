import { Component, signal } from '@angular/core';
import {
  SiremButton,
  SiremCard,
  SiremInput,
} from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-page-login-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremButton, SiremCard, SiremInput],
  template: `
    <app-demo-page-layout title="Página: Login" category="Páginas" subtitle="Ejemplo compuesto solo con componentes SIREM.">
      <app-demo-variant-card title="Vista completa" description="Card + inputs + botón." [htmlCode]="h1" [tsCode]="t">
        <div class="flex w-full justify-center">
          <sirem-card title="Iniciar sesión" subtitle="SIREM · Óptica Norte">
            <sirem-input-field label="Usuario" prefixIcon="fi fi-rr-user" placeholder="usuario@sirem.com" [(value)]="user" />
            <sirem-input-field label="Clave" type="password" placeholder="••••••••" [(value)]="pass" />
            @if (error()) {
              <p class="text-sm font-semibold text-red-600">{{ error() }}</p>
            }
            <div slot="footer" class="flex gap-2">
              <sirem-button variant="secondary" (pressed)="limpiar()">Limpiar</sirem-button>
              <sirem-button [action]="entrar">Entrar</sirem-button>
            </div>
          </sirem-card>
        </div>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class PageLoginDemoPage {
  readonly user = signal('');
  readonly pass = signal('');
  readonly error = signal('');

  readonly entrar = () =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        this.error.set(!this.user() || !this.pass() ? 'Usuario y clave son requeridos.' : '');
        resolve();
      }, 800);
    });

  limpiar(): void {
    this.user.set('');
    this.pass.set('');
    this.error.set('');
  }

  readonly h1 = `<sirem-card title="Iniciar sesión" subtitle="SIREM · Óptica Norte">
  <sirem-input-field label="Usuario" prefixIcon="fi fi-rr-user"
    placeholder="usuario@sirem.com" [(value)]="user" />
  <sirem-input-field label="Clave" type="password"
    placeholder="••••••••" [(value)]="pass" />
  <div slot="footer" class="flex gap-2">
    <sirem-button variant="secondary" (pressed)="limpiar()">Limpiar</sirem-button>
    <sirem-button [action]="entrar">Entrar</sirem-button>
  </div>
</sirem-card>`;
  readonly t = `import { signal } from '@angular/core';
import { SiremButton, SiremCard, SiremInput } from 'deorta-sirem-ui';

readonly user = signal('');
readonly pass = signal('');
readonly error = signal('');

readonly entrar = () => new Promise<void>((resolve) => {
  setTimeout(() => {
    this.error.set(!this.user() || !this.pass() ? 'Usuario y clave son requeridos.' : '');
    resolve();
  }, 800);
});`;
}
