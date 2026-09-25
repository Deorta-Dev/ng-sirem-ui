import { Component, inject } from '@angular/core';
import { DynamicToastPosition, DynamicToastService, DynamicToastState } from 'ngx-dynamic-toast';
import { SiremButton } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-toast-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremButton],
  template: `
    <app-demo-page-layout
      title="Dynamic Toast"
      category="Overlays"
      subtitle="ngx-dynamic-toast: Dynamic Island, spring physics, estados y promesas."
    >
      <app-demo-variant-card
        title="Estados"
        description="La librería incluye success, error, warning, info y loading con animación spring."
        [htmlCode]="htmlStates"
        [tsCode]="tsService"
      >
        <div class="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <sirem-button variant="success" (pressed)="showTone('success')"> Success </sirem-button>
          <sirem-button variant="danger" (pressed)="showTone('error')"> Error </sirem-button>
          <sirem-button variant="warning" (pressed)="showTone('warning')"> Warning </sirem-button>
          <sirem-button variant="secondary" (pressed)="showTone('info')"> Info </sirem-button>
          <sirem-button (pressed)="showLoading()">Loading</sirem-button>
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Autopilot"
        description="El toast puede permanecer compacto o expandirse automáticamente como en Sileo."
        [htmlCode]="htmlAutopilot"
        [tsCode]="tsAutopilot"
      >
        <div class="flex w-full flex-wrap justify-center gap-3">
          <sirem-button variant="secondary" (pressed)="showCompact()">
            Mostrar compacto
          </sirem-button>
          <sirem-button (pressed)="showAutopilot()"> Mostrar autopilot </sirem-button>
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Posiciones"
        description="Un solo viewport administra las seis posiciones del playground."
        [htmlCode]="htmlPositions"
        [tsCode]="tsPositions"
      >
        <div class="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
          @for (position of positions; track position) {
            <sirem-button variant="secondary" size="sm" (pressed)="showAt(position)">
              {{ position }}
            </sirem-button>
          }
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Fill y roundness"
        description="Personaliza la superficie y el radio de la isla sin reemplazar el viewport."
        [htmlCode]="htmlCustom"
        [tsCode]="tsCustom"
      >
        <div class="flex w-full flex-wrap justify-center gap-3">
          <sirem-button (pressed)="showCustom('dark')"> Fill oscuro </sirem-button>
          <sirem-button variant="secondary" (pressed)="showCustom('light')">
            Fill claro
          </sirem-button>
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Duración y persistencia"
        description="Un toast puede permanecer abierto, actualizarse en el mismo ID y cerrarse desde código."
        [htmlCode]="htmlControl"
        [tsCode]="tsControl"
      >
        <div class="flex w-full flex-wrap justify-center gap-3">
          <sirem-button variant="secondary" (pressed)="showSticky()">
            Abrir persistente
          </sirem-button>
          <sirem-button (pressed)="updateSticky()"> Actualizar a success </sirem-button>
          <sirem-button variant="ghost" (pressed)="dismissSticky()">
            Cerrar persistente
          </sirem-button>
          <sirem-button variant="ghost" (pressed)="clear()"> Limpiar todos </sirem-button>
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Acción y Promise"
        description="Los botones y promesas transforman el estado sin recrear el toast."
        [htmlCode]="htmlPromise"
        [tsCode]="tsPromise"
      >
        <div class="flex w-full flex-wrap justify-center gap-3">
          <sirem-button variant="secondary" (pressed)="showAction()">
            Toast con acción
          </sirem-button>
          <sirem-button (pressed)="runPromise()"> Ejecutar promise </sirem-button>
        </div>
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Stacking"
        description="Varias notificaciones pueden coexistir y se apilan en la posición configurada."
        [htmlCode]="htmlStack"
        [tsCode]="tsStack"
      >
        <div class="flex w-full justify-center">
          <sirem-button (pressed)="showStack()"> Mostrar tres toasts </sirem-button>
        </div>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class ToastDemoPage {
  private readonly toast = inject(DynamicToastService);
  private stickyId: string | null = null;

  readonly positions: DynamicToastPosition[] = [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ];

  showTone(tone: Exclude<DynamicToastState, 'loading' | 'action'>): void {
    const messages: Record<
      Exclude<DynamicToastState, 'loading' | 'action'>,
      { title: string; description: string }
    > = {
      success: {
        title: 'Cambios guardados',
        description: 'La historia clínica se actualizó correctamente.',
      },
      error: {
        title: 'No se pudo guardar',
        description: 'Revisa la conexión e inténtalo nuevamente.',
      },
      warning: {
        title: 'Revisión pendiente',
        description: 'Hay 3 resultados que requieren tu atención.',
      },
      info: {
        title: 'Nueva notificación',
        description: 'El laboratorio publicó un resultado nuevo.',
      },
    };

    this.toast.show({
      ...messages[tone],
      state: tone,
      duration: 5_000,
    });
  }

  showCompact(): void {
    this.toast.show({
      title: 'Notificación compacta',
      description: 'Autopilot está desactivado; haz hover para expandir.',
      state: 'info',
      autopilot: false,
      duration: null,
    });
  }

  showAutopilot(): void {
    this.toast.info({
      title: 'Notificación autopilot',
      description: 'La isla se expande y colapsa automáticamente.',
      duration: 5_000,
    });
  }

  showAt(position: DynamicToastPosition): void {
    this.toast.show({
      title: `Notificación ${position}`,
      description: 'La posición se define por toast, no por el botón.',
      position,
      state: 'info',
      duration: 4_000,
    });
  }

  showCustom(fill: 'dark' | 'light'): void {
    this.toast.show({
      title: fill === 'dark' ? 'Fill oscuro' : 'Fill claro',
      description: 'La librería permite cambiar el color de la superficie.',
      state: fill === 'dark' ? 'warning' : 'info',
      fill: fill === 'dark' ? '#171717' : '#f8fafc',
      roundness: 20,
      duration: 6_000,
    });
  }

  showSticky(): void {
    this.stickyId = this.toast.info({
      title: 'Sincronización pendiente',
      description: 'Este toast no tiene duración automática.',
      duration: null,
    });
  }

  updateSticky(): void {
    if (!this.stickyId) {
      this.showSticky();
      return;
    }

    this.toast.update(this.stickyId, {
      state: 'success',
      title: 'Sincronización completada',
      description: 'El estado cambió sin recrear la notificación.',
      duration: 5_000,
    });
  }

  dismissSticky(): void {
    if (this.stickyId) this.toast.dismiss(this.stickyId);
  }

  showAction(): void {
    this.toast.action({
      title: 'Paciente archivado',
      description: 'Puedes deshacer este cambio durante unos segundos.',
      button: {
        title: 'Deshacer',
        onClick: () => {
          this.toast.success('Acción deshecha', {
            description: 'El paciente volvió a estar activo.',
          });
        },
      },
    });
  }

  showLoading(): void {
    const id = this.toast.loading('Sincronizando datos', {
      description: 'Consultando el servidor…',
    });
    setTimeout(() => {
      this.toast.update(id, {
        state: 'success',
        title: 'Sincronización completa',
        description: 'Todos los datos están actualizados.',
        duration: 4_000,
      });
    }, 1_800);
  }

  runPromise(): void {
    void this.toast.promise(
      new Promise<string>((resolve) => setTimeout(() => resolve('payload'), 1_500)),
      {
        loading: { title: 'Guardando cambios' },
        success: {
          title: 'Cambios guardados',
          description: 'La operación se completó correctamente.',
        },
        error: {
          title: 'No se pudo guardar',
          description: 'Inténtalo de nuevo.',
        },
      },
    );
  }

  showStack(): void {
    this.toast.success('Primero: cambios guardados');
    this.toast.info('Segundo: sincronización en curso');
    this.toast.warning('Tercero: una alerta importante');
  }

  clear(): void {
    this.toast.clear();
    this.stickyId = null;
  }

  readonly htmlStates = `<sirem-button (pressed)="toast.success('Guardado')">Success</sirem-button>
<sirem-button (pressed)="toast.error('Error')">Error</sirem-button>
<sirem-button (pressed)="toast.warning('Warning')">Warning</sirem-button>
<sirem-button (pressed)="toast.info('Info')">Info</sirem-button>`;

  readonly htmlAutopilot = `<sirem-button (pressed)="showCompact()">Compacto</sirem-button>
<sirem-button (pressed)="showAutopilot()">Autopilot</sirem-button>`;

  readonly htmlPositions = `@for (position of positions; track position) {
  <sirem-button (pressed)="showAt(position)">
    {{ position }}
  </sirem-button>
}`;

  readonly htmlCustom = `<sirem-button (pressed)="showCustom('dark')">Fill oscuro</sirem-button>
<sirem-button (pressed)="showCustom('light')">Fill claro</sirem-button>`;

  readonly htmlControl = `<sirem-button (pressed)="showSticky()">Abrir persistente</sirem-button>
<sirem-button (pressed)="updateSticky()">Actualizar</sirem-button>
<sirem-button (pressed)="dismissSticky()">Cerrar</sirem-button>`;

  readonly htmlPromise = `<sirem-button (pressed)="runPromise()">Guardar</sirem-button>`;

  readonly htmlStack = `<sirem-button (pressed)="showStack()">Mostrar tres toasts</sirem-button>`;

  readonly tsService = `private readonly toast = inject(DynamicToastService);

success() {
  this.toast.success('Cambios guardados', {
    description: 'La historia clínica se actualizó.',
  });
}`;

  readonly tsAutopilot = `this.toast.show({
  title: 'Notificación compacta',
  state: 'info',
  autopilot: false,
  duration: null,
});`;

  readonly tsPositions = `readonly positions: DynamicToastPosition[] = [
  'top-left', 'top-center', 'top-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];`;

  readonly tsCustom = `this.toast.show({
  title: 'Fill oscuro',
  state: 'warning',
  fill: '#171717',
  roundness: 20,
});`;

  readonly tsControl = `const id = this.toast.info({
  title: 'Sincronización pendiente',
  duration: null,
});

this.toast.update(id, {
  state: 'success',
  title: 'Completado',
  duration: 5000,
});`;

  readonly tsPromise = `runPromise() {
  return this.toast.promise(save(), {
    loading: { title: 'Guardando…' },
    success: { title: 'Listo', description: 'Se guardó correctamente.' },
    error: { title: 'Error', description: 'No se pudo guardar.' },
  });
}`;

  readonly tsStack = `showStack() {
  this.toast.success('Primero');
  this.toast.info('Segundo');
  this.toast.warning('Tercero');
}`;
}
