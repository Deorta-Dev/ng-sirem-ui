import { TestBed } from '@angular/core/testing';
import { SiremAdminLayout } from './sirem-admin-layout';

describe('SiremAdminLayout', () => {
  it('should create', () => {
    const fixture = TestBed.createComponent(SiremAdminLayout);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should hide chrome in fullscreen', () => {
    const fixture = TestBed.createComponent(SiremAdminLayout);
    fixture.componentRef.setInput('fullscreen', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Salir de pantalla completa');
  });
});
