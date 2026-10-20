import { Component, inject, signal } from '@angular/core';
import {
  SiremInvoiceCustomer,
  SiremInvoiceDraft,
  SiremInvoiceEditor,
  siremEmptyInvoice,
  siremInvoiceLine,
  siremLineTotals,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { CLIENTES } from '../../data/erp-mock';

/**
 * Demo de `sirem-invoice-editor`: crear una factura de venta nueva y
 * editar una ya emitida, con datos en memoria y confirmación por toast.
 */
@Component({
  selector: 'app-invoice-editor-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremInvoiceEditor],
  template: `
    <app-demo-page-layout
      title="Invoice Editor"
      category="Formularios"
      subtitle="sirem-invoice-editor — crea o edita facturas de venta: cabecera, conceptos con IVA y totales en vivo."
    >
      <app-demo-variant-card
        title="Crear factura"
        description="Formulario vacío con correlativo sugerido. Guardar valida cliente, fechas y conceptos antes de confirmar."
        [htmlCode]="htmlCrear"
        [tsCode]="tsCrear"
      >
        <sirem-invoice-editor
          class="w-full max-w-5xl"
          [(draft)]="nueva"
          [customers]="customers"
          nextNumber="FV-1043"
          status="draft"
          (saved)="onSaved($event, 'Factura nueva')"
          (cancelled)="onCancelled('Factura nueva')"
        />
      </app-demo-variant-card>

      <app-demo-variant-card
        title="Editar factura emitida"
        description="Carga una factura existente con tres conceptos, ajusta cantidades y descuentos y vuelve a guardarla."
        [htmlCode]="htmlEditar"
        [tsCode]="tsEditar"
      >
        <sirem-invoice-editor
          class="w-full max-w-5xl"
          [(draft)]="editada"
          [customers]="customers"
          status="issued"
          (saved)="onSaved($event, 'Factura editada')"
          (cancelled)="onCancelled('Factura editada')"
        />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class InvoiceEditorDemoPage {
  private readonly toast = inject(DynamicToastService);

  readonly customers: SiremInvoiceCustomer[] = CLIENTES.slice(0, 6).map((cliente) => ({
    value: cliente.id,
    label: cliente.nombre,
    taxId: cliente.nit,
  }));

  /** Factura en blanco para el modo de creación. */
  readonly nueva = signal<SiremInvoiceDraft>(siremEmptyInvoice('FV-1043'));

  /** Factura ya emitida que se carga en modo de edición. */
  readonly editada = signal<SiremInvoiceDraft>({
    number: 'FV-1002',
    customerId: CLIENTES[0].id,
    issueDate: '2026-09-12',
    dueDate: '2026-10-12',
    notes: 'Pedido 4471 · crédito a 30 días.',
    lines: [
      siremInvoiceLine({
        description: 'Armazón Titanio X2',
        quantity: 2,
        unitPrice: 189900,
        taxRate: 19,
      }),
      siremInvoiceLine({
        description: 'Lente antirreflejante',
        quantity: 4,
        unitPrice: 75000,
        discount: 10,
        taxRate: 19,
      }),
      siremInvoiceLine({ description: 'Ajuste y entrega a domicilio', quantity: 1, unitPrice: 0, taxRate: 0 }),
    ],
  });

  onSaved(invoice: SiremInvoiceDraft, contexto: string): void {
    const total = invoice.lines.reduce((sum, line) => sum + siremLineTotals(line).total, 0);
    this.toast.success({
      title: invoice.number + ' guardada',
      description: contexto + ' · ' + invoice.lines.length + ' conceptos · ' + this.money(total),
      duration: 3500,
    });
  }

  onCancelled(contexto: string): void {
    this.toast.info({
      title: 'Edición cancelada',
      description: contexto + ' · se restableció el formulario.',
      duration: 2500,
    });
  }

  private money(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  readonly htmlCrear = `<sirem-invoice-editor
  [(draft)]="nueva"
  [customers]="customers"
  nextNumber="FV-1043"
  status="draft"
  (saved)="onSaved($event, 'Factura nueva')"
  (cancelled)="onCancelled('Factura nueva')" />`;

  readonly htmlEditar = `<sirem-invoice-editor
  [(draft)]="editada"
  [customers]="customers"
  status="issued"
  (saved)="onSaved($event, 'Factura editada')" />`;

  readonly tsCrear = `import { signal } from '@angular/core';
import {
  SiremInvoiceCustomer,
  SiremInvoiceDraft,
  SiremInvoiceEditor,
  siremEmptyInvoice,
} from '@deorta-dev/ng-sirem-ui';
import { DynamicToastService } from 'ngx-dynamic-toast';
import { CLIENTES } from './erp-mock';

private readonly toast = inject(DynamicToastService);

readonly customers: SiremInvoiceCustomer[] = CLIENTES.slice(0, 6).map((cliente) => ({
  value: cliente.id,
  label: cliente.nombre,
  taxId: cliente.nit,
}));

readonly nueva = signal<SiremInvoiceDraft>(siremEmptyInvoice('FV-1043'));

onSaved(invoice: SiremInvoiceDraft, contexto: string): void {
  this.toast.success({
    title: invoice.number + ' guardada',
    description: contexto,
    duration: 3500,
  });
}`;

  readonly tsEditar = `readonly editada = signal<SiremInvoiceDraft>({
  number: 'FV-1002',
  customerId: CLIENTES[0].id,
  issueDate: '2026-09-12',
  dueDate: '2026-10-12',
  notes: 'Pedido 4471 · crédito a 30 días.',
  lines: [
    siremInvoiceLine({ description: 'Armazón Titanio X2', quantity: 2, unitPrice: 189900, taxRate: 19 }),
    siremInvoiceLine({ description: 'Lente antirreflejante', quantity: 4, unitPrice: 75000, discount: 10, taxRate: 19 }),
    siremInvoiceLine({ description: 'Ajuste y entrega a domicilio', quantity: 1, unitPrice: 0, taxRate: 0 }),
  ],
});`;
}
