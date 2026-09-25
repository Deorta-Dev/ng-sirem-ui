import { TestBed } from '@angular/core/testing';
import { SiremSwitch } from './sirem-switch';

describe('SiremSwitch', () => {
  it('should toggle checked with aria-checked', () => {
    const fixture = TestBed.createComponent(SiremSwitch);
    fixture.componentRef.setInput('label', 'Sincronizar Xubio');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('[role="switch"]') as HTMLElement;
    expect(btn.getAttribute('aria-checked')).toBe('false');
    btn.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(true);
  });
});
