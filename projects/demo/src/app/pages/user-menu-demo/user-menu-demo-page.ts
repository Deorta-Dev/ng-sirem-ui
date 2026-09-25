import { Component, signal } from '@angular/core';
import { SiremUserMenu, SiremUserMenuGroup, SiremButton } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-user-menu-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremUserMenu, SiremButton],
  template: `
    <app-demo-page-layout title="User Menu" category="Navegación" subtitle="sirem-user-menu — perfil con grupos de opciones.">
      <app-demo-variant-card title="Iniciales" description="Avatar generado del nombre." [htmlCode]="h1" [tsCode]="t">
        <sirem-user-menu userName="María Torres" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con detalle" description="Rol o correo bajo el nombre." [htmlCode]="h2" [tsCode]="t">
        <sirem-user-menu userName="Juan Pérez" userDetail="juan@sirem.com" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Con acciones" description="Slot para contenido libre." [htmlCode]="h3" [tsCode]="t">
        <sirem-user-menu userName="Ana Ruiz" userDetail="Administradora">
          <div class="flex flex-col gap-1">
            <sirem-button size="sm" variant="ghost">Mi perfil</sirem-button>
            <sirem-button size="sm" variant="ghost">Salir</sirem-button>
          </div>
        </sirem-user-menu>
      </app-demo-variant-card>
      <app-demo-variant-card title="Grupos de opciones" description="groups con títulos, iconos y separadores." [htmlCode]="h4" [tsCode]="t2">
        <sirem-user-menu userName="Luis Gómez" userDetail="luis@sirem.com" [groups]="grupos" (actionPressed)="msg.set($event.label)" />
        <span class="text-sm text-slate-600">Acción: {{ msg() }}</span>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class UserMenuDemoPage {
  readonly msg = signal('');
  readonly grupos: SiremUserMenuGroup[] = [
    {
      title: 'Cuenta',
      actions: [
        { label: 'Mi perfil', icon: 'fi fi-rr-user' },
        { label: 'Cambiar sucursal', icon: 'fi fi-rr-shop' },
      ],
    },
    {
      title: 'Sesión',
      actions: [{ label: 'Cerrar sesión', icon: 'fi fi-rr-exit', danger: true }],
    },
  ];
  readonly h1 = '<sirem-user-menu userName="María Torres" />';
  readonly h2 = '<sirem-user-menu userName="Juan Pérez" userDetail="juan@sirem.com" />';
  readonly h3 = '<sirem-user-menu userName="Ana Ruiz" userDetail="Administradora">\n  <div class="flex flex-col gap-1">\n    <sirem-button size="sm" variant="ghost">Mi perfil</sirem-button>\n    <sirem-button size="sm" variant="ghost">Salir</sirem-button>\n  </div>\n</sirem-user-menu>';
  readonly h4 = '<sirem-user-menu userName="Luis Gómez" userDetail="luis@sirem.com"\n  [groups]="grupos" (actionPressed)="msg.set($event.label)" />\n<span class="text-sm text-slate-600">Acción: {{ msg() }}</span>';
  readonly t = "import { SiremUserMenu, SiremButton } from 'deorta-sirem-ui';";
  readonly t2 = `import { signal } from '@angular/core';
import { SiremUserMenu, SiremUserMenuGroup } from 'deorta-sirem-ui';

readonly msg = signal('');
readonly grupos: SiremUserMenuGroup[] = [
  { title: 'Cuenta', actions: [
    { label: 'Mi perfil', icon: 'fi fi-rr-user' },
    { label: 'Cambiar sucursal', icon: 'fi fi-rr-shop' },
  ] },
  { title: 'Sesión', actions: [
    { label: 'Cerrar sesión', icon: 'fi fi-rr-exit', danger: true },
  ] },
];`;
}
