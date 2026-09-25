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
});
