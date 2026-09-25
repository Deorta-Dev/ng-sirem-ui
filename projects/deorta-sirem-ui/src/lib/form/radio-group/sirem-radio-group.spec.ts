import { TestBed } from '@angular/core/testing';
import { SiremRadioGroup } from './sirem-radio-group';

describe('SiremRadioGroup', () => {
  it('should select an option', () => {
    const fixture = TestBed.createComponent(SiremRadioGroup);
    fixture.componentRef.setInput('options', [
      { value: 'cc', label: 'Cédula' },
      { value: 'nit', label: 'NIT' },
    ]);
    fixture.detectChanges();
    const radios = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    expect(radios.length).toBe(2);
    (radios[1] as HTMLInputElement).click();
    expect(fixture.componentInstance.value()).toBe('nit');
  });
});
