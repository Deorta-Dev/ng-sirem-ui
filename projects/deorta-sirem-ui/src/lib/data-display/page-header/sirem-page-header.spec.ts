import { TestBed } from '@angular/core/testing';
import { SiremPageHeader } from './sirem-page-header';

describe('SiremPageHeader', () => {
  it('should render title and subtitle', () => {
    const fixture = TestBed.createComponent(SiremPageHeader);
    fixture.componentRef.setInput('title', 'Pacientes');
    fixture.componentRef.setInput('subtitle', 'Gestión de pacientes de la clínica');
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Pacientes');
    expect(text).toContain('Gestión de pacientes');
  });

  it('should keep the default appearance when no sticky directive is applied', () => {
    const fixture = TestBed.createComponent(SiremPageHeader);
    fixture.componentRef.setInput('title', 'Pacientes');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.sirem-page-header--elevated')).toBeNull();
    expect(el.querySelector('.sirem-page-header--glass')).toBeNull();
  });
});
