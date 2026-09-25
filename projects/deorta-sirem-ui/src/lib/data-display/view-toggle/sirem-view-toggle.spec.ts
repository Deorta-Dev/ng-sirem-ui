import { TestBed } from '@angular/core/testing';
import { SiremViewToggle } from './sirem-view-toggle';

describe('SiremViewToggle', () => {
  it('should default to table and switch to cards', () => {
    const fixture = TestBed.createComponent(SiremViewToggle);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    expect(c.view()).toBe('table');
    c.view.set('cards');
    fixture.detectChanges();
    const active = fixture.nativeElement.querySelector('[aria-pressed="true"]');
    expect(active?.textContent).toContain('Tarjetas');
  });
});
