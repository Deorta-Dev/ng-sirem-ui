import { TestBed } from '@angular/core/testing';
import { SiremInput } from './sirem-input';

describe('SiremInput', () => {
  it('should update value on input', () => {
    const fixture = TestBed.createComponent(SiremInput);
    fixture.componentRef.setInput('label', 'Documento');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '12345';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.value()).toBe('12345');
  });

  it('should filter static options as autocomplete', () => {
    const fixture = TestBed.createComponent(SiremInput);
    fixture.componentRef.setInput('options', [
      { value: 'LENTE MONOFOCAL', label: 'LENTE MONOFOCAL' },
      { value: 'LENTE PROGRESIVO', label: 'LENTE PROGRESIVO' },
    ]);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    c.text.set('progresivo');
    expect(c.suggestions().length).toBe(1);
    expect(c.suggestions()[0].value).toBe('LENTE PROGRESIVO');
  });

  it('should revert free text in strict mode', () => {
    const fixture = TestBed.createComponent(SiremInput);
    fixture.componentRef.setInput('options', [{ value: 'A', label: 'Opción A' }]);
    fixture.componentRef.setInput('strictOptions', true);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    c.text.set('texto libre');
    c.value.set('texto libre');
    c.onBlur();
    expect(c.value()).toBe(null);
    expect(c.strictError()).toContain('opción válida');
  });

  it('should accumulate chips in multiple mode', () => {
    const fixture = TestBed.createComponent(SiremInput);
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    c.choose({ value: 'H52.1', label: 'H52.1 - Miopía' });
    c.choose({ value: 'H52.2', label: 'H52.2 - Astigmatismo' });
    expect(c.value()).toEqual(['H52.1', 'H52.2']);
    expect(c.chips().length).toBe(2);
  });

  it('should show a clear button in strict single mode', () => {
    const fixture = TestBed.createComponent(SiremInput);
    fixture.componentRef.setInput('options', [{ value: 'A', label: 'Opción A' }]);
    fixture.componentRef.setInput('strictOptions', true);
    fixture.componentRef.setInput('value', 'A');
    fixture.detectChanges();
    const c = fixture.componentInstance;
    expect(c.showClear()).toBe(true);
    expect(
      fixture.nativeElement.querySelector('button[aria-label="Quitar selección"]'),
    ).toBeTruthy();
    c.clear();
    expect(c.value()).toBe(null);
    expect(c.showClear()).toBe(false);
  });

  it('should show a value set from outside as its option label', () => {
    const fixture = TestBed.createComponent(SiremInput);
    fixture.componentRef.setInput('options', [
      { value: 'H52.1', label: 'H52.1 Miopía' },
      { value: 'H52.0', label: 'H52.0 Hipermetropía' },
    ]);
    fixture.componentRef.setInput('value', 'H52.1');
    fixture.detectChanges();
    expect(fixture.componentInstance.text()).toBe('H52.1 Miopía');
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('H52.1 Miopía');
  });

  it('should mark free-text options with the pen indicator', () => {
    const fixture = TestBed.createComponent(SiremInput);
    fixture.componentRef.setInput('options', [{ value: 'A', label: 'Opción A' }]);
    fixture.detectChanges();
    const chev = fixture.nativeElement.querySelector('.sirem-input__chev') as HTMLElement;
    expect(chev).toBeTruthy();
    expect(chev.classList.contains('sirem-input__chev--free')).toBe(true);
    expect(chev.querySelector('i')?.className).toContain('fi-rr-pen-field');
    // Reserva sitio para el indicador (0.75rem + 1.25rem).
    expect(fixture.componentInstance.padRight()).toBe(2);
  });

  it('should mark strict options with the dropdown indicator', () => {
    const fixture = TestBed.createComponent(SiremInput);
    fixture.componentRef.setInput('options', [{ value: 'A', label: 'Opción A' }]);
    fixture.componentRef.setInput('strictOptions', true);
    fixture.detectChanges();
    const chev = fixture.nativeElement.querySelector('.sirem-input__chev') as HTMLElement;
    expect(chev).toBeTruthy();
    expect(chev.classList.contains('sirem-input__chev--free')).toBe(false);
    expect(chev.querySelector('i')?.className).toContain('fi-rr-angle-small-down');
  });
});
