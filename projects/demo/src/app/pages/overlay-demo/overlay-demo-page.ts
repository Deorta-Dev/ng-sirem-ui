import { Component, signal } from '@angular/core';
import {
  SiremBadge,
  SiremButton,
  SiremCard,
  SiremList,
  SiremListItem,
  SiremOverlayTrigger,
  SiremStatCard,
} from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

/** Ítem del menú de la demo. */
interface MenuItem {
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-overlay-demo-page',
  standalone: true,
  imports: [
    DemoVariantCard,
    DemoPageLayout,
    SiremBadge,
    SiremButton,
    SiremCard,
    SiremList,
    SiremStatCard,
    SiremOverlayTrigger,
  ],
  template: `
    <app-demo-page-layout
      title="Overlay"
      category="Overlays"
      subtitle="siremOverlay — paneles en una capa superior que escapan al overflow, nunca tocan los bordes y se abren con el evento que elijas."
    >
      <app-demo-variant-card
        title="Dentro de un contenedor con overflow oculto"
        description="El recorte está activo (overflow: hidden); el panel sale igualmente."
        [htmlCode]="h1"
        [tsCode]="t1"
      >
        <div class="w-full max-w-sm">
          <div class="h-44 overflow-hidden rounded-xl border border-slate-200 p-4">
            <p class="text-sm text-slate-600">Contenedor con <code>overflow: hidden</code>.</p>
            <button
              type="button"
              class="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              [siremOverlay]="menu"
              siremOverlayPlacement="bottom-start"
            >
              Abrir menú
            </button>
          </div>
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Cualquier componente dentro"
        description="El panel admite sirem-card, sirem-stat-card, sirem-list… para fichas y resúmenes."
        [htmlCode]="h2"
        [tsCode]="t1"
      >
        <div class="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            [siremOverlay]="detailCard"
            siremOverlayTrigger="hover"
            [siremOverlayHoverDelayMs]="150"
            siremOverlayPlacement="bottom-start"
          >
            Resumen al pasar el puntero
          </button>
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            [siremOverlay]="detailList"
            siremOverlayTrigger="longpress"
            [siremOverlayLongPressMs]="450"
            siremOverlayPlacement="right-start"
          >
            Mantener pulsado
          </button>
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Tipos de evento"
        description="click, dblclick, longpress, hover y manual; cada uno con su retardo."
        [htmlCode]="h3"
        [tsCode]="t1"
      >
        <div class="flex w-full max-w-2xl flex-wrap gap-2">
          <sirem-button
            size="sm"
            variant="secondary"
            [siremOverlay]="menu"
            siremOverlayTrigger="click"
            siremOverlayPlacement="bottom-start"
          >
            click
          </sirem-button>
          <sirem-button
            size="sm"
            variant="secondary"
            [siremOverlay]="menu"
            siremOverlayTrigger="dblclick"
            siremOverlayPlacement="bottom"
          >
            dblclick
          </sirem-button>
          <sirem-button
            size="sm"
            variant="secondary"
            [siremOverlay]="menu"
            siremOverlayTrigger="longpress"
            [siremOverlayLongPressMs]="500"
            siremOverlayPlacement="top-start"
          >
            longpress
          </sirem-button>
          <sirem-button
            size="sm"
            variant="secondary"
            [siremOverlay]="menu"
            siremOverlayTrigger="hover"
            [siremOverlayHoverDelayMs]="200"
            siremOverlayPlacement="right-start"
          >
            hover
          </sirem-button>
          <sirem-button
            size="sm"
            variant="secondary"
            [siremOverlay]="menu"
            siremOverlayTrigger="manual"
            [open]="manualOpen()"
            (openChange)="manualOpen.set($event)"
            siremOverlayPlacement="left-start"
          >
            manual (abre con el interruptor)
          </sirem-button>
        </div>
        <p class="w-full text-xs text-slate-500">
          <code>manual</code> ignora los eventos del ratón y solo responde a
          <code>[(open)]</code>: útil para abrir desde código.
        </p>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Direcciones de salida"
        description="top, bottom, left, right, inline-start e inline-end con sus alineaciones."
        [htmlCode]="h4"
        [tsCode]="t1"
      >
        <div class="grid w-full max-w-lg grid-cols-3 gap-2">
          @for (p of placements; track p) {
            <sirem-button
              size="sm"
              variant="secondary"
              [siremOverlay]="menu"
              [siremOverlayPlacement]="p"
            >
              {{ p }}
            </sirem-button>
          }
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Ancho igual al disparador"
        description="matchTriggerWidth, como en un selector o combo."
        [htmlCode]="h5"
        [tsCode]="t1"
      >
        <div class="w-full max-w-sm">
          <button
            type="button"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-left text-sm"
            [siremOverlay]="menu"
            siremOverlayPlacement="bottom"
            [siremOverlayMatchTriggerWidth]="true"
          >
            Elegir una opción
          </button>
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Pegado al borde inferior"
        description="El motor voltea, desplaza y acota: el panel nunca se corta por abajo."
        [htmlCode]="h6"
        [tsCode]="t2"
      >
        <p class="w-full text-sm text-slate-600">
          Abre el panel pegado a la esquina inferior derecha. Si no cabía abajo,
          saldría arriba; y si tampoco, se acotaría para que desplace dentro.
        </p>
        <div class="flex w-full max-w-lg justify-end">
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            [siremOverlay]="menu"
            siremOverlayPlacement="bottom-end"
          >
            Abajo a la derecha
          </button>
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Panel más alto que el hueco"
        description="Se acota con max-height y el contenido se desplaza dentro."
        [htmlCode]="h7"
        [tsCode]="t2"
      >
        <div class="flex w-full max-w-lg justify-center">
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            [siremOverlay]="tallPanel"
            siremOverlayPlacement="top-start"
          >
            Lista muy larga
          </button>
        </div>
      </app-demo-variant-card>
    </app-demo-page-layout>

    <ng-template #menu>
      <div class="sirem-overlay__panel">
        @for (item of items; track item.label) {
          <button type="button" class="sirem-overlay__item">
            <i [class]="item.icon" aria-hidden="true"></i>
            <span class="flex flex-col">
              <span>{{ item.label }}</span>
              <span class="text-xs text-slate-500">{{ item.description }}</span>
            </span>
          </button>
        }
      </div>
    </ng-template>

    <ng-template #detailCard>
      <sirem-card
        class="w-72"
        surface="glass"
        title="María Torres"
        subtitle="Control visual · Optometría"
        bodyPadding="sm"
        footerPadding="sm"
      >
        <div class="grid grid-cols-2 gap-2">
          <sirem-stat-card label="Edad" value="34" variant="tint" color="brand" />
          <sirem-stat-card label="Riesgo" value="Bajo" variant="tint" color="success" />
        </div>
        <div slot="footer" class="flex items-center justify-between gap-2">
          <sirem-badge tone="success" dot>Activo</sirem-badge>
          <span class="text-xs text-slate-500">Última visita: 12/09</span>
        </div>
      </sirem-card>
    </ng-template>

    <ng-template #detailList>
      <sirem-card class="w-72" surface="glass" title="Historial" bodyPadding="none">
        <sirem-list [items]="history" />
      </sirem-card>
    </ng-template>

    <ng-template #tallPanel>
      <div class="sirem-overlay__panel max-w-64">
        @for (row of manyRows; track $index) {
          <button type="button" class="sirem-overlay__item">
            <span>Fila {{ $index + 1 }}</span>
          </button>
        }
      </div>
    </ng-template>
  `,
})
export class OverlayDemoPage {
  /** Interruptor del overlay con evento `manual`. */
  readonly manualOpen = signal(false);

  readonly placements = [
    'top',
    'top-start',
    'top-end',
    'bottom',
    'bottom-start',
    'bottom-end',
    'left',
    'right',
    'inline-start',
    'inline-end',
  ] as const;

  readonly items: MenuItem[] = [
    { label: 'Ver ficha', icon: 'fi fi-rr-user', description: 'Abrir historial' },
    { label: 'Editar', icon: 'fi fi-rr-edit', description: 'Cambiar datos' },
    { label: 'Duplicar', icon: 'fi fi-rr-copy', description: 'Crear una copia' },
    { label: 'Eliminar', icon: 'fi fi-rr-trash', description: 'Acción destructiva' },
  ];

  readonly history: SiremListItem[] = [
    { title: 'Control visual', subtitle: '12/09/2026', meta: 'OK' },
    { title: 'Campimetría', subtitle: '04/06/2026', meta: 'OK' },
    { title: 'Tonometría', subtitle: '21/03/2026', meta: 'Revisar' },
    { title: 'OCT', subtitle: '15/01/2026', meta: 'OK' },
  ];

  /** Filas para el panel que no cabe en la pantalla. */
  readonly manyRows = Array.from({ length: 40 }, (_, i) => i);

  readonly h1 = `<div class="h-44 overflow-hidden rounded-xl border p-4">
  <button [siremOverlay]="menu" siremOverlayPlacement="bottom-start">
    Abrir menú
  </button>
</div>

<!-- El panel se inserta en la capa superior, fuera de este div,
     por eso el overflow: hidden no lo recorta. -->
<ng-template #menu>
  <div class="sirem-overlay__panel">…</div>
</ng-template>`;

  readonly h2 = `<!-- Admite cualquier componente de SIREM -->
<button [siremOverlay]="detail" siremOverlayTrigger="hover"
        [siremOverlayHoverDelayMs]="150">
  Resumen al pasar el puntero
</button>

<ng-template #detail>
  <sirem-card class="w-72" surface="glass" title="María Torres">
    <sirem-stat-card label="Edad" value="34" variant="tint" color="brand" />
    <div slot="footer"><sirem-badge tone="success">Activo</sirem-badge></div>
  </sirem-card>
</ng-template>`;

  readonly h3 = `<sirem-button [siremOverlay]="menu" siremOverlayTrigger="click">click</sirem-button>
<sirem-button [siremOverlay]="menu" siremOverlayTrigger="dblclick">dblclick</sirem-button>
<sirem-button [siremOverlay]="menu" siremOverlayTrigger="longpress"
              [siremOverlayLongPressMs]="500">longpress</sirem-button>
<sirem-button [siremOverlay]="menu" siremOverlayTrigger="hover"
              [siremOverlayHoverDelayMs]="200">hover</sirem-button>

<!-- manual: ignora el ratón y solo responde a [(open)] -->
<sirem-button [siremOverlay]="menu" siremOverlayTrigger="manual"
              [open]="abierto()" (openChange)="abierto.set($event)">
  manual
</sirem-button>`;

  readonly h4 = `<sirem-button [siremOverlay]="menu" siremOverlayPlacement="top-start">top-start</sirem-button>
<sirem-button [siremOverlay]="menu" siremOverlayPlacement="bottom-end">bottom-end</sirem-button>
<sirem-button [siremOverlay]="menu" siremOverlayPlacement="inline-start">inline-start</sirem-button>`;

  readonly h5 = `<button [siremOverlay]="menu" siremOverlayPlacement="bottom"
               [siremOverlayMatchTriggerWidth]="true">
  Elegir una opción
</button>`;

  readonly h6 = `<!-- No hay que configurar nada: el motor
   1. voltea si el lado pedido no cabe,
   2. desplaza en el eje cruzado,
   3. acota con maxWidth/maxHeight y vuelve a medir para que
      el panel no se corte por el borde inferior. -->

<button [siremOverlay]="menu" siremOverlayPlacement="bottom-end">
  Abajo a la derecha
</button>`;

  readonly h7 = `<!-- Un panel más alto que el hueco no desborda:
     se acota y el contenido desplaza dentro. -->
<button [siremOverlay]="largo" siremOverlayPlacement="top-start">
  Lista muy larga
</button>`;

  readonly t1 = `import { SiremOverlayTrigger } from 'deorta-sirem-ui';

@Component({ imports: [SiremOverlayTrigger], /* … */ })
export class MiPagina {}`;

  readonly t2 = `// computeOverlayPosition es una función pura y se puede usar
// por separado si necesitas calcular la posición a mano.
import { computeOverlayPosition } from 'deorta-sirem-ui';

const { x, y, placement, flipped, shifted, maxWidth, maxHeight } =
  computeOverlayPosition(
    { trigger, overlay, viewport },
    { placement: 'bottom-end', offset: 8, viewportPadding: 8,
      flip: true, shift: true, matchTriggerWidth: false, direction: 'ltr' },
  );`;
}
