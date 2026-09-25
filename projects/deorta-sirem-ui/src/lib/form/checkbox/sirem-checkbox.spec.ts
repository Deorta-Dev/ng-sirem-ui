import { TestBed } from '@angular/core/testing';
import { SiremCheckbox } from './sirem-checkbox';

describe('SiremCheckbox', () => {
  it('should check on click', () => {
    const fixture = TestBed.createComponent(SiremCheckbox);
    fixture.componentRef.setInput('label', 'Acepto');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.click();
    expect(fixture.componentInstance.checked()).toBe(true);
  });
});
