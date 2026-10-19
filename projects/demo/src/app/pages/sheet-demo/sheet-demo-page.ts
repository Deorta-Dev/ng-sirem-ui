import { Component, signal } from '@angular/core';
import {
  SiremButton,
  SiremInput,
  SiremSheet,
  type SiremSheetSize,
} from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-sheet-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremSheet, SiremButton, SiremInput],
  template: `
    <app-demo-page-layout
      title="Sheet"
      category="Overlays"
      subtitle="sirem-sheet — hoja inferior redimensionable con presets y pantalla completa."
    >
      <app-demo-variant-card
        title="Básico (md) con gestos"
        description="Asidero o gesto dentro del contenido: arriba crece, abajo encoge y encaja en el preset más cercano."
        [htmlCode]="h1"
        [tsCode]="t1"
      >
        <sirem-button size="sm" (pressed)="basico.set(true)">Abrir sheet</sirem-button>
        <sirem-sheet
          [(open)]="basico"
          [(size)]="tamano"
          [gestureResize]="true"
          title="Detalle del paciente"
          subtitle="HC-2026-001 · María Torres"
        >
          <div class="flex flex-col gap-3">
            <sirem-input-field label="Nombres" [(value)]="nombre" />
            <sirem-input-field label="Teléfono" [(value)]="telefono" />
            <p class="text-sm text-slate-600 dark:text-slate-400">
              Doble clic en el asidero para maximizar. Con <code>gestureResize</code>
              también puedes arrastrar dentro del contenido: hacia arriba crece (si el
              contenido ya llegó al final) y hacia abajo encoge (solo si está al
              principio). En pantalla completa el asidero desaparece y a la derecha
              quedan <strong>restaurar</strong> y <strong>cerrar</strong>.
            </p>
          </div>
          <div slot="footer" class="flex items-center justify-end gap-2">
            <sirem-button size="sm" variant="secondary" (pressed)="basico.set(false)">
              Cancelar
            </sirem-button>
            <sirem-button size="sm" (pressed)="basico.set(false)">Guardar</sirem-button>
          </div>
        </sirem-sheet>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Tamaño inicial grande"
        description="size='lg' y botón de pantalla completa en la cabecera."
        [htmlCode]="h2"
        [tsCode]="t2"
      >
        <sirem-button size="sm" variant="secondary" (pressed)="grande.set(true)">
          Abrir en lg
        </sirem-button>
        <sirem-sheet
          [(open)]="grande"
          [(size)]="tamanoGrande"
          title="Historia clínica"
          subtitle="Contenido largo: el cuerpo hace scroll y la cabecera queda fija"
        >
          <div class="flex flex-col gap-2">
            @for (item of notas; track item) {
              <p class="rounded-xl bg-slate-100 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {{ item }}
              </p>
            }
          </div>
        </sirem-sheet>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Pantalla completa"
        description="'full' de entrada: sin asidero; a la derecha, maximizar se convierte en restaurar."
        [htmlCode]="h3"
        [tsCode]="t3"
      >
        <sirem-button size="sm" variant="secondary" (pressed)="completo.set(true)">
          Abrir maximizado
        </sirem-button>
        <sirem-sheet
          [(open)]="completo"
          [(size)]="tamanoCompleto"
          title="Modo pantalla completa"
          subtitle="Restaurar vuelve al último tamaño no maximizado"
        >
          <p class="text-sm text-slate-600 dark:text-slate-400">
            El sheet ocupa toda la pantalla. El asidero se ha retirado y las acciones
            siguen a la derecha: restaurar en el sitio de maximizar y cerrar sin moverse.
          </p>
        </sirem-sheet>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Sin asidero"
        description="[resizable]='false': solo presets, sin arrastre."
        [htmlCode]="h4"
        [tsCode]="t4"
      >
        <sirem-button size="sm" variant="secondary" (pressed)="fijo.set(true)">
          Abrir fijo
        </sirem-button>
        <sirem-sheet
          [(open)]="fijo"
          [(size)]="tamanoFijo"
          [resizable]="false"
          title="Sin redimensionar"
          subtitle="La altura se cambia solo por código o con el botón de maximizar"
        >
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Útil para confirmaciones que no deben crecer ni encogerse.
          </p>
        </sirem-sheet>
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Full fijo (no minimizable)"
        description="[minimizable]='false': siempre ocupa la pantalla; sin asidero ni restaurar, solo cerrar."
        [htmlCode]="h5"
        [tsCode]="t5"
      >
        <sirem-button size="sm" variant="secondary" (pressed)="fijoFull.set(true)">
          Abrir full fijo
        </sirem-button>
        <sirem-sheet
          [(open)]="fijoFull"
          [minimizable]="false"
          title="Siempre en pantalla completa"
          subtitle="minimizable = false"
        >
          <p class="text-sm text-slate-600 dark:text-slate-400">
            No hay asidero ni botón de restaurar: el sheet no puede encoger. La única
            acción de la cabecera es cerrar.
          </p>
        </sirem-sheet>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="No cerrar al fondo"
        description="[backdropClose]='false': pulsar fuera no lo cierra; Escape y el botón de cerrar siguen funcionando."
        [htmlCode]="h7"
        [tsCode]="t7"
      >
        <sirem-button size="sm" variant="secondary" (pressed)="noFondo.set(true)">
          Abrir sin cerrar al fondo
        </sirem-button>
        <sirem-sheet
          [(open)]="noFondo"
          [backdropClose]="false"
          title="No se cierra al fondo"
          subtitle="backdropClose = false"
        >
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Pulsa fuera del panel: se queda abierto. Para cerrarlo usa la X o Escape.
          </p>
        </sirem-sheet>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Sin maximizar"
        description="[maximizable]='false': el alto máximo es lg y no aparece el botón de pantalla completa."
        [htmlCode]="h6"
        [tsCode]="t6"
      >
        <sirem-button size="sm" variant="secondary" (pressed)="sinMax.set(true)">
          Abrir sin maximizar
        </sirem-button>
        <sirem-sheet
          [(open)]="sinMax"
          [(size)]="tamanoSinMax"
          [maximizable]="false"
          title="Tope en lg"
          subtitle="maximizable = false"
        >
          <p class="text-sm text-slate-600 dark:text-slate-400">
            El asidero puede crecer como mucho hasta el preset grande; no hay pantalla
            completa.
          </p>
        </sirem-sheet>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class SheetDemoPage {
  readonly basico = signal(false);
  readonly tamano = signal<SiremSheetSize>('md');
  readonly grande = signal(false);
  readonly tamanoGrande = signal<SiremSheetSize>('lg');
  readonly completo = signal(false);
  readonly tamanoCompleto = signal<SiremSheetSize>('full');
  readonly fijo = signal(false);
  readonly tamanoFijo = signal<SiremSheetSize>('sm');
  readonly fijoFull = signal(false);
  readonly sinMax = signal(false);
  readonly noFondo = signal(false);
  readonly tamanoSinMax = signal<SiremSheetSize>('lg');

  readonly nombre = signal('María Torres');
  readonly telefono = signal('+57 300 123 4567');

  readonly notas = [
    'Consulta de control: evolución favorable, sin dolor.',
    'Refracción estable respecto a la última visita.',
    'Se ajusta la graduación del ojo derecho -0.25.',
    'Recomendaciones: lubricante 3 veces al día y revisión en 6 meses.',
    'Se entrega fórmula actualizada en recepción.',
  ];

  readonly t1 = `import { signal } from '@angular/core';
import { SiremSheet, type SiremSheetSize } from 'deorta-sirem-ui';

readonly abierto = signal(false);
readonly tamano = signal<SiremSheetSize>('md');`;

  readonly h1 = `<sirem-sheet [(open)]="abierto" [(size)]="tamano" [gestureResize]="true"
  title="Detalle del paciente" subtitle="HC-2026-001">
  …
  <div slot="footer">…acciones…</div>
</sirem-sheet>`;

  readonly t2 = `readonly abierto = signal(false);
readonly tamano = signal<SiremSheetSize>('lg');`;

  readonly h2 = `<sirem-sheet [(open)]="abierto" [(size)]="tamano" title="Historia clínica">
  …
</sirem-sheet>`;

  readonly t3 = `readonly abierto = signal(false);
readonly tamano = signal<SiremSheetSize>('full');`;

  readonly h3 = `<sirem-sheet [(open)]="abierto" [(size)]="tamano" title="Pantalla completa">
  …
</sirem-sheet>`;

  readonly t4 = `readonly abierto = signal(false);
readonly tamano = signal<SiremSheetSize>('sm');`;

  readonly h4 = `<sirem-sheet [(open)]="abierto" [(size)]="tamano" [resizable]="false" title="Sin redimensionar">
  …
</sirem-sheet>`;

  readonly t5 = `readonly abierto = signal(false);`;

  readonly h5 = `<sirem-sheet [(open)]="abierto" [minimizable]="false" title="Siempre en pantalla completa">
  …
</sirem-sheet>`;

  readonly t6 = `readonly abierto = signal(false);
readonly tamano = signal<SiremSheetSize>('lg');`;

  readonly h6 = `<sirem-sheet [(open)]="abierto" [(size)]="tamano" [maximizable]="false" title="Tope en lg">
  …
</sirem-sheet>`;

  readonly t7 = `readonly abierto = signal(false);`;

  readonly h7 = `<sirem-sheet [(open)]="abierto" [backdropClose]="false" title="No se cierra al fondo">
  …
</sirem-sheet>`;
}
