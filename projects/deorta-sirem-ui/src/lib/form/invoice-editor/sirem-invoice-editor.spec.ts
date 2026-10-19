import { TestBed } from '@angular/core/testing';
import {
  SiremInvoiceDraft,
  SiremInvoiceEditor,
  siremEmptyInvoice,
  siremInvoiceLine,
  siremLineTotals,
} from './sirem-invoice-editor';

function draftFixture(): SiremInvoiceDraft {
  return {
    number: 'FV-1001',
    customerId: 7,
    issueDate: '2026-10-01',
    dueDate: '2026-10-31',
    notes: 'Crédito 30 días.',
    lines: [
      siremInvoiceLine({ description: 'Lente oftálmica', quantity: 2, unitPrice: 50000, taxRate: 19 }),
    ],
  };
}

describe('SiremInvoiceEditor', () => {
  it('should create with a default empty draft', () => {
    const fixture = TestBed.createComponent(SiremInvoiceEditor);
    fixture.detectChanges();
    const draft = fixture.componentInstance.draft();
    expect(draft.lines.length).toBe(1);
    expect(fixture.componentInstance.canSave()).toBe(false);
  });

  it('should render the document number and totals', () => {
    const fixture = TestBed.createComponent(SiremInvoiceEditor);
    fixture.componentRef.setInput('draft', draftFixture());
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent ?? '';

    expect(text).toContain('FV-1001');
    // 2 × 50.000 = 100.000 + 19 % = 119.000
    expect(text).toContain('100.000');
    expect(text).toContain('119.000');
    expect(fixture.componentInstance.totals().total).toBe(119000);
  });

  it('should pick the customer from the strict combobox', () => {
    const fixture = TestBed.createComponent(SiremInvoiceEditor);
    fixture.componentRef.setInput('draft', { ...siremEmptyInvoice('FV-1004'), customerId: null });
    fixture.componentRef.setInput('customers', [
      { value: 7, label: 'Óptica Visión SAS' },
      { value: 8, label: 'Clínica del Norte' },
    ]);
    fixture.detectChanges();

    const field = (fixture.nativeElement as HTMLElement).querySelector(
      'sirem-input-field',
    ) as HTMLElement;
    expect(field).toBeTruthy();
    // Estricto → indicador ▾ (no el ✎ de las opciones libres).
    expect(field.querySelector('.sirem-input__chev')).toBeTruthy();
    expect(field.querySelector('.sirem-input__chev--free')).toBeNull();

    fixture.componentInstance.setCustomer(7);
    fixture.detectChanges();
    expect(fixture.componentInstance.draft().customerId).toBe(7);
    expect(fixture.componentInstance.selectedCustomer()?.label).toBe('Óptica Visión SAS');
  });

  it('should add and remove concept lines', () => {
    const fixture = TestBed.createComponent(SiremInvoiceEditor);
    fixture.componentRef.setInput('draft', draftFixture());
    fixture.detectChanges();

    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    );
    const add = buttons.find((b) => b.textContent?.includes('Agregar concepto')) as HTMLButtonElement;
    add.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.draft().lines.length).toBe(2);

    const remove = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-label^="Eliminar"]',
    ) as HTMLButtonElement;
    remove.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.draft().lines.length).toBe(1);
  });

  it('should emit saved only when the invoice is valid', () => {
    const fixture = TestBed.createComponent(SiremInvoiceEditor);
    fixture.componentRef.setInput('draft', draftFixture());
    fixture.detectChanges();

    const saved: SiremInvoiceDraft[] = [];
    fixture.componentInstance.saved.subscribe((draft) => saved.push(draft));

    fixture.componentInstance.save();
    expect(saved.length).toBe(1);
    expect(saved[0].number).toBe('FV-1001');
    expect(fixture.componentInstance.touched()).toBe(true);
  });

  it('should block saving without customer or concepts', () => {
    const fixture = TestBed.createComponent(SiremInvoiceEditor);
    fixture.componentRef.setInput('draft', {
      ...siremEmptyInvoice('FV-1002'),
      customerId: null,
      issueDate: '',
      dueDate: '',
      lines: [],
    });
    fixture.detectChanges();

    const saved: SiremInvoiceDraft[] = [];
    fixture.componentInstance.saved.subscribe((draft) => saved.push(draft));

    fixture.componentInstance.save();
    expect(saved.length).toBe(0);
    expect(fixture.componentInstance.touched()).toBe(true);
    expect(fixture.componentInstance.errorList().length).toBeGreaterThan(1);
  });

  it('should compute line totals with discount and tax', () => {
    const totals = siremLineTotals(
      siremInvoiceLine({ quantity: 3, unitPrice: 10000, discount: 10, taxRate: 19 }),
    );
    expect(totals.base).toBe(30000);
    expect(totals.discount).toBe(3000);
    expect(totals.tax).toBe(5130);
    expect(totals.total).toBe(32130);
  });
});
