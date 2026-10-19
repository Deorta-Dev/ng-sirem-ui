import { Component, signal } from '@angular/core';
import { SiremNavbar, SiremSticky, type SiremSubmenuConfig } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

const DUO_HOME = '<svg viewBox="0 0 256 256" fill="currentColor"><path opacity="0.2" d="M224 120 128 24 32 120v96a8 8 0 0 0 8 8h176a8 8 0 0 0 8-8Z"/><path d="M224 120 128 24 32 120v96a8 8 0 0 0 8 8h48V152h80v72h48a8 8 0 0 0 8-8Z"/></svg>';
const DUO_CAL = '<svg viewBox="0 0 256 256" fill="currentColor"><path opacity="0.2" d="M200 32h-24v-8a8 8 0 0 0-16 0v8H96v-8a8 8 0 0 0-16 0v8H56a16 16 0 0 0-16 16v136a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16Z"/><path d="M200 32h-24v-8a8 8 0 0 0-16 0v8H96v-8a8 8 0 0 0-16 0v8H56a16 16 0 0 0-16 16v136a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16Zm-144 48h144v8H56Z"/></svg>';

@Component({
  selector: 'app-navbar-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremNavbar, SiremSticky],
  template: `
    <app-demo-page-layout title="Navbar" category="Navegación" subtitle="sirem-navbar — layouts, iconos fi/svg, submenús en overlay por breakpoint y sticky configurable con apariencia y evento.">
      <app-demo-variant-card title="Vertical con iconos fi" description="Clases Flaticon UIcons." [htmlCode]="h1" [tsCode]="t">
        <div class="w-56"><sirem-navbar [items]="itemsFi" (itemPressed)="msg.set($event.label)" /></div>
        <span class="text-sm text-slate-600">{{ msg() }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card title="Vertical con duotone" description="SVG inline por ítem (svg tiene prioridad)." [htmlCode]="h4" [tsCode]="t2">
        <div class="w-56"><sirem-navbar [items]="itemsSvg" /></div>
      </app-demo-variant-card>
      <app-demo-variant-card title="Vertical con submenús" description="Los hijos salen a la derecha en la capa de overlays: hover en escritorio, click en móvil." [htmlCode]="h7" [tsCode]="t3">
        <div class="w-56"><sirem-navbar [items]="itemsTree" /></div>
      </app-demo-variant-card>
      <app-demo-variant-card title="Horizontal" description="Barra superior; los hijos abren en overlay (hover en escritorio, click en móvil)." [htmlCode]="h2" [tsCode]="t3">
        <sirem-navbar layout="horizontal" [items]="itemsTree" />
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Sticky con cambio de piel"
        description="Se fija al hacer scroll dentro de un panel; pasa a elevated al pegarse y emite (siremStickyChange)."
        [htmlCode]="h3"
        [tsCode]="tSticky"
      >
        <div
          class="h-64 overflow-auto rounded-lg border"
          style="border-color: var(--sirem-border-soft)"
        >
          <sirem-navbar
            layout="horizontal"
            [items]="itemsFi"
            siremSticky
            stickyAppearance="elevated"
            (siremStickyChange)="stuck.set($event)"
          />
          <div class="min-h-[22rem] space-y-3 p-4 text-sm text-slate-500">
            <p>Desplaza este panel para ver la barra fijarse arriba.</p>
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
        description="Fondo plano en reposo y glass al fijarse, con 6px de separación superior."
        [htmlCode]="h3b"
        [tsCode]="tSticky"
      >
        <div
          class="h-64 overflow-auto rounded-lg border"
          style="border-color: var(--sirem-border-soft)"
        >
          <sirem-navbar
            layout="horizontal"
            [items]="itemsFi"
            appearance="flat"
            siremSticky
            [siremStickyOffset]="6"
            stickyAppearance="glass"
          />
          <div class="min-h-[22rem] space-y-3 p-4 text-sm text-slate-500">
            <p>Cambia la piel solo mientras la barra está fija.</p>
            @for (line of filler; track line) {
              <p>{{ line }}</p>
            }
          </div>
        </div>
      </app-demo-variant-card>
      <app-demo-variant-card title="Submenús por breakpoint" description="submenu con breakpoint 1024: hover por encima, click por debajo." [htmlCode]="h5" [tsCode]="t3">
        <sirem-navbar layout="horizontal" [items]="itemsTree" [submenu]="submenuCfg" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Minibar con submenús" description="Riel solo-iconos; el panel lleva el título del padre." [htmlCode]="h6" [tsCode]="t">
        <div class="flex h-56"><sirem-navbar layout="minibar" [items]="itemsTree" /></div>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class NavbarDemoPage {
  readonly msg = signal('');
  readonly stuck = signal(false);
  /** Texto de relleno para que el panel de demo tenga scroll. */
  readonly filler = [
    'Módulos, ajustes y accesos rápidos en una sola barra.',
    'Los ítems con hijos abren su panel en la capa de overlays.',
    'El gesto cambia por breakpoint: hover en escritorio, click en móvil.',
    'La barra sigue en el flujo: al fijarse no empuja el contenido.',
    'La apariencia se puede cambiar solo mientras está pegada.',
    'Al soltarse vuelve a su piel de reposo.',
  ];
  readonly itemsFi = [
    { label: 'Inicio', icon: 'fi fi-rr-home', route: '/' },
    { label: 'Pacientes', icon: 'fi fi-rr-users', route: '/demo/data-table' },
    { label: 'Agenda', icon: 'fi fi-rr-calendar', route: '/demo/calendar' },
  ];
  readonly itemsSvg = [
    { label: 'Inicio', svg: DUO_HOME, route: '/' },
    { label: 'Agenda', svg: DUO_CAL, route: '/demo/calendar' },
  ];
  /** Ítems con hijos: los que abren overlay en los tres layouts. */
  readonly itemsTree = [
    { label: 'Inicio', icon: 'fi fi-rr-home', route: '/' },
    {
      label: 'Pacientes',
      icon: 'fi fi-rr-users',
      children: [
        { label: 'Listado', icon: 'fi fi-rr-list', route: '/demo/data-table' },
        { label: 'Historia clínica', icon: 'fi fi-rr-notes', route: '/demo/data-table' },
      ],
    },
    {
      label: 'Agenda',
      icon: 'fi fi-rr-calendar',
      children: [
        { label: 'Citas', icon: 'fi fi-rr-calendar', route: '/demo/calendar' },
        { label: 'Recursos', icon: 'fi fi-rr-building', route: '/demo/calendar' },
      ],
    },
  ];
  /** Gesto por franja: hover en escritorio y click en móvil. */
  readonly submenuCfg: SiremSubmenuConfig = {
    breakpoint: 1024,
    desktop: { trigger: 'hover' },
    mobile: { trigger: 'click' },
  };
  readonly h1 = '<div class="w-56"><sirem-navbar [items]="itemsFi"\n  (itemPressed)="msg.set($event.label)" /></div>\n<span class="text-sm text-slate-600">{{ msg() }}</span>';
  readonly h2 = '<sirem-navbar layout="horizontal" [items]="itemsTree" />';
  readonly h3 = `<div class="h-64 overflow-auto">
  <sirem-navbar
    layout="horizontal"
    [items]="itemsFi"
    siremSticky
    stickyAppearance="elevated"
    (siremStickyChange)="stuck.set($event)"
  />
  <!-- contenido alto para poder desplazar -->
</div>
<span>stuck: {{ stuck() }}</span>`;
  readonly h3b = `<div class="h-64 overflow-auto">
  <sirem-navbar
    layout="horizontal"
    [items]="itemsFi"
    appearance="flat"
    siremSticky
    [siremStickyOffset]="6"
    stickyAppearance="glass"
  />
  <!-- contenido alto para poder desplazar -->
</div>`;
  readonly tSticky = "import { signal } from '@angular/core';\nimport { SiremNavbar, SiremSticky } from 'deorta-sirem-ui';\n\nreadonly stuck = signal(false);";
  readonly h4 = '<div class="w-56"><sirem-navbar [items]="itemsSvg" /></div>';
  readonly h5 = '<sirem-navbar layout="horizontal" [items]="itemsTree"\n  [submenu]="submenuCfg" />';
  readonly h6 = '<div class="flex h-56">\n  <sirem-navbar layout="minibar" [items]="itemsTree" />\n</div>';
  readonly h7 = '<div class="w-56"><sirem-navbar [items]="itemsTree" /></div>';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremNavbar } from 'deorta-sirem-ui';\n\nreadonly msg = signal('');\nreadonly itemsFi = [\n  { label: 'Inicio', icon: 'fi fi-rr-home', route: '/' },\n  { label: 'Pacientes', icon: 'fi fi-rr-users', route: '/demo/data-table' },\n  { label: 'Agenda', icon: 'fi fi-rr-calendar', route: '/demo/calendar' },\n];";
  readonly t2 = "readonly itemsSvg = [\n  { label: 'Inicio', svg: DUO_HOME, route: '/' },\n  { label: 'Agenda', svg: DUO_CAL, route: '/demo/calendar' },\n];\nreadonly DUO_HOME = '<svg viewBox=\"0 0 256 256\" fill=\"currentColor\"><path opacity=\"0.2\" d=\"M224 120 128 24 32 120v96a8 8 0 0 0 8 8h176a8 8 0 0 0 8-8Z\"/><path d=\"M224 120 128 24 32 120v96a8 8 0 0 0 8 8h48V152h80v72h48a8 8 0 0 0 8-8Z\"/></svg>';\nreadonly DUO_CAL = '<svg viewBox=\"0 0 256 256\" fill=\"currentColor\"><path opacity=\"0.2\" d=\"M200 32h-24v-8a8 8 0 0 0-16 0v8H96v-8a8 8 0 0 0-16 0v8H56a16 16 0 0 0-16 16v136a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16Z\"/><path d=\"M200 32h-24v-8a8 8 0 0 0-16 0v8H96v-8a8 8 0 0 0-16 0v8H56a16 16 0 0 0-16 16v136a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16Zm-144 48h144v8H56Z\"/></svg>';";
  readonly t3 =
    "import { SiremNavbar, type SiremSubmenuConfig } from 'deorta-sirem-ui';\n\n" +
    'readonly itemsTree = [\n' +
    "  { label: 'Inicio', icon: 'fi fi-rr-home', route: '/' },\n" +
    "  { label: 'Pacientes', icon: 'fi fi-rr-users', children: [\n" +
    "      { label: 'Listado', icon: 'fi fi-rr-list', route: '/demo/data-table' },\n" +
    "      { label: 'Historia clínica', icon: 'fi fi-rr-notes', route: '/demo/data-table' },\n" +
    '  ] },\n' +
    "  { label: 'Agenda', icon: 'fi fi-rr-calendar', children: [\n" +
    "      { label: 'Citas', icon: 'fi fi-rr-calendar', route: '/demo/calendar' },\n" +
    "      { label: 'Recursos', icon: 'fi fi-rr-building', route: '/demo/calendar' },\n" +
    '  ] },\n' +
    '];\n\n' +
    '// Gesto por franja de ancho; sin config: hover desktop / click móvil (768).\n' +
    'readonly submenuCfg: SiremSubmenuConfig = {\n' +
    '  breakpoint: 1024,\n' +
    "  desktop: { trigger: 'hover' },\n" +
    "  mobile: { trigger: 'click' },\n" +
    '};';
}
