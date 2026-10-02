import { TestBed } from '@angular/core/testing';
import { SiremUserMenu } from './sirem-user-menu';

describe('SiremUserMenu', () => {
  it('should create with initials', () => {
    const fixture = TestBed.createComponent(SiremUserMenu);
    fixture.componentRef.setInput('userName', 'Ana Pérez');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('AP');
  });

  it('should toggle the menu', () => {
    const fixture = TestBed.createComponent(SiremUserMenu);
    fixture.componentRef.setInput('userName', 'Ana Pérez');
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
    fixture.componentInstance.toggle();
    expect(fixture.componentInstance.open()).toBe(true);
  });

  it('should override the initials background with avatarBg', () => {
    const fixture = TestBed.createComponent(SiremUserMenu);
    fixture.componentRef.setInput('userName', 'Ana Pérez');
    fixture.detectChanges();

    const initials = () => (fixture.nativeElement as HTMLElement)
      .querySelector('.sirem-user__initials');
    expect(initials()?.getAttribute('style') ?? '').not.toContain('red');

    fixture.componentRef.setInput('avatarBg', 'red');
    fixture.detectChanges();
    expect(initials()?.getAttribute('style') ?? '').toContain('red');
  });

  it('should render userDetail only when it has content', () => {
    // El panel vive en la capa de overlays (document.body), no en el host.

    // Sin userDetail: el panel no incluye la línea.
    const fixture = TestBed.createComponent(SiremUserMenu);
    fixture.componentRef.setInput('userName', 'Ana Pérez');
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    fixture.detectChanges();
    expect(document.querySelector('.sirem-user__detail')).toBeNull();
    fixture.destroy();

    // Con userDetail: se muestra en el panel.
    const withDetail = TestBed.createComponent(SiremUserMenu);
    withDetail.componentRef.setInput('userName', 'Ana Pérez');
    withDetail.componentRef.setInput('userDetail', 'ana@clinic.cl');
    withDetail.detectChanges();
    (withDetail.nativeElement as HTMLElement).querySelector('button')?.click();
    withDetail.detectChanges();
    expect(document.querySelector('.sirem-user__detail')?.textContent).toContain('ana@clinic.cl');
    withDetail.destroy();

    document.querySelectorAll('.sirem-overlay-layer').forEach((el) => el.remove());
  });
});
