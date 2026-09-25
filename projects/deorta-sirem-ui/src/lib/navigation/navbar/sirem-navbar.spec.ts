import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SiremNavbar } from './sirem-navbar';

const ITEMS = [
  { label: 'Clínica', icon: 'fi fi-rr-heart', children: [{ label: 'Pacientes', route: '/x' }] },
  { label: 'Ajustes', icon: 'fi fi-rr-settings', route: '/y', permission: 'ADMIN' },
];

describe('SiremNavbar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('should render vertical items and expand children', () => {
    const fixture = TestBed.createComponent(SiremNavbar);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Clínica');
    c.toggle('Clínica');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Pacientes');
  });

  it('should hide items without permission', () => {
    const fixture = TestBed.createComponent(SiremNavbar);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.componentRef.setInput('permissions', new Set<string>());
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Ajustes');
  });

  it('should render minibar and horizontal layouts', () => {
    const fixture = TestBed.createComponent(SiremNavbar);
    fixture.componentRef.setInput('items', ITEMS);
    for (const layout of ['minibar', 'horizontal', 'floating'] as const) {
      fixture.componentRef.setInput('layout', layout);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.sirem-navbar')).toBeTruthy();
    }
  });
});
