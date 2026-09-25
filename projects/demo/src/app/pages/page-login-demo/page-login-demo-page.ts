import { Component, signal } from '@angular/core';
import { SiremButton, SiremCard, SiremInput } from 'deorta-sirem-ui';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

@Component({
  selector: 'app-page-login-demo-page',
  standalone: true,
  imports: [PageDemoShell, SiremButton, SiremCard, SiremInput],
  template: `
    <app-page-demo-shell label="Página de login" [files]="codeFiles">
      <main
        class="grid min-h-[calc(100dvh-2.75rem)] place-items-center bg-slate-100 p-4 sm:p-8 dark:bg-slate-950"
      >
        <sirem-card class="w-full max-w-md" title="Iniciar sesión" subtitle="SIREM · Óptica Norte">
          <sirem-input-field
            label="Usuario"
            prefixIcon="fi fi-rr-user"
            placeholder="usuario@sirem.com"
            [(value)]="user"
          />
          <sirem-input-field
            label="Clave"
            type="password"
            placeholder="••••••••"
            [(value)]="pass"
          />
          @if (error()) {
            <p class="text-sm font-semibold text-red-600 dark:text-red-400">
              {{ error() }}
            </p>
          }
          <div slot="footer" class="flex justify-end gap-2">
            <sirem-button variant="secondary" (pressed)="limpiar()"> Limpiar </sirem-button>
            <sirem-button [action]="entrar">Entrar</sirem-button>
          </div>
        </sirem-card>
      </main>
    </app-page-demo-shell>
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

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'page-login.html',
      language: 'html',
      code: `<main class="grid min-h-screen place-items-center bg-slate-100 p-4 sm:p-8">
  <sirem-card class="w-full max-w-md" title="Iniciar sesión" subtitle="SIREM · Óptica Norte">
    <sirem-input-field
      label="Usuario"
      prefixIcon="fi fi-rr-user"
      placeholder="usuario@sirem.com"
      [(value)]="user"
    />
    <sirem-input-field
      label="Clave"
      type="password"
      placeholder="••••••••"
      [(value)]="pass"
    />

    @if (error()) {
      <p class="text-sm font-semibold text-red-600">{{ error() }}</p>
    }

    <div slot="footer" class="flex justify-end gap-2">
      <sirem-button variant="secondary" (pressed)="limpiar()">Limpiar</sirem-button>
      <sirem-button [action]="entrar">Entrar</sirem-button>
    </div>
  </sirem-card>
</main>`,
    },
    {
      name: 'page-login.component.ts',
      language: 'typescript',
      code: `import { signal } from '@angular/core';
import { SiremButton, SiremCard, SiremInput } from 'deorta-sirem-ui';

export class PageLoginPage {
  readonly user = signal('');
  readonly pass = signal('');
  readonly error = signal('');

  readonly entrar = () =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        this.error.set(
          !this.user() || !this.pass() ? 'Usuario y clave son requeridos.' : '',
        );
        resolve();
      }, 800);
    });

  limpiar(): void {
    this.user.set('');
    this.pass.set('');
    this.error.set('');
  }
}`,
    },
  ];
}
