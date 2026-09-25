import { TestBed } from '@angular/core/testing';
import { SiremSelect } from './sirem-select';

describe('SiremSelect', () => {
  it('should render options and update value', () => {
    const fixture = TestBed.createComponent(SiremSelect);
    fixture.componentRef.setInput('options', [{ value: 'cc', label: 'Cédula' }]);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.options.length).toBe(2);
    select.value = 'cc';
    select.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.value()).toBe('cc');
  });
});
