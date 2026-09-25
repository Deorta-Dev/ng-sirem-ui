import { Component, signal } from '@angular/core';
import { SiremConfirmDialog, SiremButton } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-confirm-dialog-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremConfirmDialog, SiremButton],
  template: `
    <app-demo-page-layout title="Confirm Dialog" category="Overlays" subtitle="sirem-confirm-dialog — confirmación primary/danger.">
      <app-demo-variant-card title="Primary" description="Confirmación neutra." [htmlCode]="h1" [tsCode]="t">
        <sirem-button size="sm" (pressed)="a.set(true)">Guardar cambios</sirem-button>
        <sirem-confirm-dialog [(open)]="a" title="Guardar" message="¿Guardar los cambios?" (confirmed)="msg.set('Guardado')" (cancelled)="msg.set('Cancelado')" />
        <span class="text-sm text-slate-600">{{ msg() }}</span>
      </app-demo-variant-card>
      <app-demo-variant-card title="Danger" description="Eliminar con detalle." [htmlCode]="h2" [tsCode]="t">
        <sirem-button size="sm" variant="danger" (pressed)="b.set(true)">Eliminar</sirem-button>
        <sirem-confirm-dialog [(open)]="b" variant="danger" title="Eliminar factura" message="¿Eliminar FAC-1042?" detail="Esta acción no se puede deshacer." confirmLabel="Sí, eliminar" (confirmed)="msg.set('Eliminada')" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class ConfirmDialogDemoPage {
  readonly a = signal(false); readonly b = signal(false); readonly msg = signal('');
  readonly h1 = '<sirem-button size="sm" (pressed)="a.set(true)">Guardar cambios</sirem-button>\n<sirem-confirm-dialog [(open)]="a" title="Guardar" message="¿Guardar los cambios?"\n  (confirmed)="msg.set(\'Guardado\')" (cancelled)="msg.set(\'Cancelado\')" />';
  readonly h2 = '<sirem-button size="sm" variant="danger" (pressed)="b.set(true)">Eliminar</sirem-button>\n<sirem-confirm-dialog [(open)]="b" variant="danger"\n  title="Eliminar factura" message="¿Eliminar FAC-1042?"\n  detail="Esta acción no se puede deshacer." confirmLabel="Sí, eliminar"\n  (confirmed)="msg.set(\'Eliminada\')" />';
  readonly t = "import { signal } from '@angular/core';\nimport { SiremConfirmDialog, SiremButton } from 'deorta-sirem-ui';\n\nreadonly a = signal(false);\nreadonly b = signal(false);\nreadonly msg = signal('');";
}
