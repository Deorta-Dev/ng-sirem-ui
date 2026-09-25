import { TestBed } from '@angular/core/testing';
import { SiremSearchPalette } from './sirem-search-palette';

describe('SiremSearchPalette', () => {
  it('should create closed by default', () => {
    const fixture = TestBed.createComponent(SiremSearchPalette);
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(fixture.nativeElement.textContent).not.toContain('Búsqueda global');
  });

  it('should filter items by query', () => {
    const fixture = TestBed.createComponent(SiremSearchPalette);
    fixture.componentRef.setInput('items', [
      { label: 'Ana Pérez', group: 'Pacientes' },
      { label: 'Factura FV-001', group: 'Facturación' },
    ]);
    const c = fixture.componentInstance;
    c.query.set('ana');
    expect(c.filtered().length).toBe(1);
    expect(c.filtered()[0].label).toBe('Ana Pérez');
  });
});
