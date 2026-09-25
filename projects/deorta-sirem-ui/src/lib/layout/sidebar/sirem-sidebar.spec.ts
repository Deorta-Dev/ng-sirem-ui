import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SiremSidebar } from './sirem-sidebar';

describe('SiremSidebar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SiremSidebar);
    fixture.componentRef.setInput('items', [{ label: 'Pacientes', route: '/x' }]);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should hide items without permission', () => {
    const fixture = TestBed.createComponent(SiremSidebar);
    fixture.componentRef.setInput('items', [
      { label: 'Pacientes', permission: 'CLINIC_PATIENTS_LIST' },
      { label: 'Agenda' },
    ]);
    fixture.componentRef.setInput('permissions', new Set<string>());
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('Pacientes');
    expect(text).toContain('Agenda');
  });
});
