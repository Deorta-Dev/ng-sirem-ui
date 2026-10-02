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

  it('should apply the mainPadding variant to the content area', () => {
    const fixture = TestBed.createComponent(SiremAdminLayout);
    fixture.detectChanges();
    const main = () => (fixture.nativeElement as HTMLElement).querySelector('main');

    // Por defecto (md) no lleva modificadores.
    expect(main()?.classList.contains('sirem-admin__main--none')).toBe(false);
    expect(main()?.classList.contains('sirem-admin__main--sm')).toBe(false);

    fixture.componentRef.setInput('mainPadding', 'none');
    fixture.detectChanges();
    expect(main()?.classList.contains('sirem-admin__main--none')).toBe(true);

    fixture.componentRef.setInput('mainPadding', 'sm');
    fixture.detectChanges();
    expect(main()?.classList.contains('sirem-admin__main--sm')).toBe(true);
    expect(main()?.classList.contains('sirem-admin__main--none')).toBe(false);
  });
});
