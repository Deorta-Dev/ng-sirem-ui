import { TestBed } from '@angular/core/testing';
import { SiremFieldGroup } from './sirem-field-group';

describe('SiremFieldGroup', () => {
  it('should render title and description', () => {
    const fixture = TestBed.createComponent(SiremFieldGroup);
    fixture.componentRef.setInput('title', 'Datos personales');
    fixture.componentRef.setInput('description', 'Identificación del paciente');
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Datos personales');
    expect(text).toContain('Identificación');
  });
});
