import { TestBed } from '@angular/core/testing';
import { SiremSearchField } from './sirem-search-field';

describe('SiremSearchField', () => {
  it('should clear value with the clear button', () => {
    const fixture = TestBed.createComponent(SiremSearchField);
    fixture.componentRef.setInput('value', 'ana');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector(
      'button[aria-label="Limpiar búsqueda"]',
    ) as HTMLButtonElement;
    expect(btn).toBeTruthy();
    btn.click();
    expect(fixture.componentInstance.value()).toBe('');
  });

  it('should share the unified field box and error border', () => {
    const fixture = TestBed.createComponent(SiremSearchField);
    fixture.detectChanges();
    expect(fixture.componentInstance.box()).toContain('sirem-field__box');
    expect(fixture.componentInstance.box()).not.toContain('sirem-field__box--error');
    fixture.componentRef.setInput('error', 'Requerido');
    fixture.detectChanges();
    expect(fixture.componentInstance.box()).toContain('sirem-field__box--error');
  });
});
