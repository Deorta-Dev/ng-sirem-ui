import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SiremBreadcrumbs } from './sirem-breadcrumbs';

describe('SiremBreadcrumbs', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('should create and mark current page', () => {
    const fixture = TestBed.createComponent(SiremBreadcrumbs);
    fixture.componentRef.setInput('items', [
      { label: 'Inicio', link: '/' },
      { label: 'Pacientes' },
    ]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('Pacientes');
  });
});
