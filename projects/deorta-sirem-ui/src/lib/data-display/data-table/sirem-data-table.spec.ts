import { TestBed } from '@angular/core/testing';
import { SiremDataTable } from './sirem-data-table';

const COLS = [{ key: 'nombre', label: 'Nombre' }];
const ROWS = [
  { id: 1, nombre: 'Ana' },
  { id: 2, nombre: 'Luis' },
];

describe('SiremDataTable', () => {
  it('should render rows', () => {
    const fixture = TestBed.createComponent(SiremDataTable);
    fixture.componentRef.setInput('columns', COLS);
    fixture.componentRef.setInput('rows', ROWS);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Ana');
    expect(text).toContain('Luis');
  });

  it('should sort by column on header click', () => {
    const fixture = TestBed.createComponent(SiremDataTable);
    fixture.componentRef.setInput('columns', COLS);
    fixture.componentRef.setInput('rows', ROWS);
    fixture.detectChanges();
    fixture.componentInstance.sortBy('nombre');
    const names = fixture.componentInstance.sortedRows().map((r) => r['nombre']);
    expect(names).toEqual(['Ana', 'Luis']);
    fixture.componentInstance.sortBy('nombre');
    expect(fixture.componentInstance.sortedRows().map((r) => r['nombre'])).toEqual([
      'Luis',
      'Ana',
    ]);
  });
});
