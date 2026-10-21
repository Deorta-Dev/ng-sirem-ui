import { Component, signal } from '@angular/core';
import { SiremTopbar, SiremButton, SiremCard, SiremSticky, SiremUserMenu } from '@deorta-dev/ng-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-topbar-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremTopbar, SiremButton, SiremCard, SiremSticky, SiremUserMenu],
  template: `
    <app-demo-page-layout title="Topbar" category="Layout" subtitle="sirem-topbar — barra superior de espacio y acciones, con sticky configurable (apariencia al fijarse + evento) y floating para dashboards.">
      <app-demo-variant-card title="Básica" description="Label de espacio por defecto." [htmlCode]="h1" [tsCode]="t">
        <sirem-topbar />
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Sin botón de menú"
        description="showMenu=false oculta la hamburguesa también en móvil (en escritorio ya no se muestra). Útil si el menú lo abre otro control del shell."
        [htmlCode]="hNoMenu"
        [tsCode]="t"
      >
        <sirem-topbar [showMenu]="false" spaceLabel="Sin hamburguesa" [showFullscreen]="false" />
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Apariencia cards"
        description="Barra transparente con cada pieza como tarjeta flotante y buscador centrado."
        [htmlCode]="hCards"
        [tsCode]="t"
      >
        <sirem-topbar
          appearance="cards"
          searchAlign="center"
          spaceLabel="Panel principal"
          searchPlaceholder="Buscar en "
          searchHighlight="Soeimn Lion Master"
          searchHint="Ctrl + K"
          [showFullscreen]="false"
        >
          <sirem-button
            slot="actions"
            size="sm"
            variant="secondary"
            iconOnly
            aria-label="Notificaciones"
          >
            <i slot="icon" class="fi fi-rr-bell"></i>
          </sirem-button>
        </sirem-topbar>
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Banner de marca"
        description="sirem-card con tone=brand para avisos destacados."
        [htmlCode]="hBanner"
        [tsCode]="t"
      >
        <sirem-card tone="brand" bodyPadding="sm">
          <p class="text-sm font-semibold text-white">Bienvenido a Li-On</p>
        </sirem-card>
      </app-demo-variant-card>
      <app-demo-variant-card title="Con acciones" description="Slot actions para botones." [htmlCode]="h2" [tsCode]="t">
        <sirem-topbar spaceLabel="Óptica Norte">
          <div slot="actions" class="flex gap-2">
            <sirem-button size="sm" variant="secondary">Buscar</sirem-button>
          </div>
        </sirem-topbar>
      </app-demo-variant-card>
      <app-demo-variant-card title="Con usuario" description="Slot user con menú de perfil." [htmlCode]="h3" [tsCode]="t">
        <sirem-topbar spaceLabel="SIREM">
          <sirem-user-menu slot="user" userName="María Torres" userDetail="Optómetra" />
        </sirem-topbar>
        <span class="text-sm text-slate-600">Menú: {{ msg() }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Sticky con cambio de piel"
        description="Dentro de un panel con scroll: se fija arriba, pasa a elevated al pegarse y emite (siremStickyChange)."
        [htmlCode]="hSticky"
        [tsCode]="tSticky"
      >
        <div
          class="h-64 overflow-auto rounded-lg border"
          style="border-color: var(--sirem-border-soft)"
        >
          <sirem-topbar
            spaceLabel="SIREM"
            [showFullscreen]="false"
            siremSticky
            stickyAppearance="elevated"
            (siremStickyChange)="stuck.set($event)"
          />
          <div class="min-h-[22rem] space-y-3 p-4 text-sm text-slate-500">
            <p>Desplaza este panel para ver cómo la barra se fija arriba.</p>
            @for (line of filler; track line) {
              <p>{{ line }}</p>
            }
          </div>
        </div>
        <span class="text-xs font-semibold text-slate-600">
          stuck: {{ stuck() ? 'sí (pegada arriba)' : 'no' }}
        </span>
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Sticky glass"
        description="Fondo flat en reposo y glass al fijarse, con 8px de separación superior."
        [htmlCode]="hGlass"
        [tsCode]="tSticky"
      >
        <div
          class="h-64 overflow-auto rounded-lg border"
          style="border-color: var(--sirem-border-soft)"
        >
          <sirem-topbar
            spaceLabel="Clínica Norte"
            appearance="flat"
            [showFullscreen]="false"
            siremSticky
            [siremStickyOffset]="8"
            stickyAppearance="glass"
            (siremStickyChange)="stuck.set($event)"
          />
          <div class="min-h-[22rem] space-y-3 p-4 text-sm text-slate-500">
            <p>El aspecto cambia solo mientras la barra está pegada.</p>
            @for (line of filler; track line) {
              <p>{{ line }}</p>
            }
          </div>
        </div>
        <span class="text-xs font-semibold text-slate-600">
          stuck: {{ stuck() ? 'sí (pegada arriba)' : 'no' }}
        </span>
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Sticky con límite"
        description="Modo acotado: se queda fija 120 px de recorrido y después se suelta y sigue con el contenido."
        [htmlCode]="hLimit"
        [tsCode]="tSticky"
      >
        <div
          class="h-64 overflow-auto rounded-lg border"
          style="border-color: var(--sirem-border-soft)"
        >
          <sirem-topbar
            spaceLabel="Límite 120"
            [showFullscreen]="false"
            siremSticky
            [siremStickyLimit]="120"
            stickyAppearance="elevated"
            (siremStickyChange)="stuck.set($event)"
          />
          <div class="min-h-[22rem] space-y-3 p-4 text-sm text-slate-500">
            <p>Tras 120 px fija, la barra se suelta y acompaña al contenido.</p>
            @for (line of filler; track line) {
              <p>{{ line }}</p>
            }
          </div>
        </div>
        <span class="text-xs font-semibold text-slate-600">
          stuck: {{ stuck() ? 'sí (pegada arriba)' : 'no' }}
        </span>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class TopbarDemoPage {
  readonly msg = signal('');
  readonly stuck = signal(false);
  /** Texto de relleno para que el panel de demo tenga scroll. */
  readonly filler = [
    'Historia clínica, agenda y facturación conviven en la misma barra.',
    'El workspace cambia de sede sin salir de la página.',
    'El buscador global abre la paleta con Ctrl + K.',
    'Las acciones del slot derecho son las de la pantalla actual.',
    'La barra no sale del flujo: no hay hueco que compensar.',
    'Al soltarse, la apariencia vuelve a la de reposo.',
  ];
  readonly hSticky = `<div class="h-64 overflow-auto">
  <sirem-topbar
    spaceLabel="SIREM"
    siremSticky
    stickyAppearance="elevated"
    (siremStickyChange)="stuck.set($event)"
  />
  <!-- contenido alto para poder desplazar -->
</div>
<span>stuck: {{ stuck() }}</span>`;
  readonly hGlass = `<div class="h-64 overflow-auto">
  <sirem-topbar
    spaceLabel="Clínica Norte"
    appearance="flat"
    siremSticky
    [siremStickyOffset]="8"
    stickyAppearance="glass"
  />
  <!-- contenido alto para poder desplazar -->
</div>`;
  readonly hLimit = `<div class="h-64 overflow-auto">
  <sirem-topbar
    spaceLabel="Límite 120"
    siremSticky
    [siremStickyLimit]="120"
    stickyAppearance="elevated"
    (siremStickyChange)="stuck.set($event)"
  />
  <!-- contenido alto para poder desplazar -->
</div>
<span>stuck: {{ stuck() }}</span>`;
  readonly tSticky = "import { signal } from '@angular/core';\nimport { SiremTopbar, SiremSticky } from '@deorta-dev/ng-sirem-ui';\n\nreadonly stuck = signal(false);";
  readonly hCards = `<sirem-topbar
  appearance="cards"
  searchAlign="center"
  spaceLabel="Panel principal"
  searchPlaceholder="Buscar en "
  searchHighlight="Soeimn Lion Master"
  searchHint="Ctrl + K"
  [showFullscreen]="false"
>
  <sirem-button slot="actions" size="sm" variant="secondary" iconOnly
                 aria-label="Notificaciones">
    <i slot="icon" class="fi fi-rr-bell"></i>
  </sirem-button>
</sirem-topbar>`;

  readonly hBanner = `<sirem-card tone="brand" bodyPadding="sm">
  <p class="text-sm font-semibold text-white">Bienvenido a Li-On</p>
</sirem-card>`;

  readonly h1 = '<sirem-topbar />';
  readonly hNoMenu = '<sirem-topbar [showMenu]="false" spaceLabel="Sin hamburguesa" [showFullscreen]="false" />';
  readonly h2 = '<sirem-topbar spaceLabel="Óptica Norte">\n  <div slot="actions" class="flex gap-2">\n    <sirem-button size="sm" variant="secondary">Buscar</sirem-button>\n  </div>\n</sirem-topbar>';
  readonly h3 = '<sirem-topbar spaceLabel="SIREM">\n  <sirem-user-menu slot="user" userName="María Torres" userDetail="Optómetra" />\n</sirem-topbar>\n<span class="text-sm text-slate-600">Menú: {{ msg() }}</span>';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremTopbar, SiremButton, SiremUserMenu } from '@deorta-dev/ng-sirem-ui';\n\nreadonly msg = signal('');";
}
