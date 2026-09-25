import { TestBed } from '@angular/core/testing';
import { SiremDatepicker } from './sirem-datepicker';

describe('SiremDatepicker', () => {
  it('should bind ISO date value', () => {
    const fixture = TestBed.createComponent(SiremDatepicker);
    fixture.componentRef.setInput('value', '2026-10-01');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('2026-10-01');
  });
});
