import { TestBed } from '@angular/core/testing';
import { SiremTopbar } from './sirem-topbar';

describe('SiremTopbar', () => {
  it('should create and show space label', () => {
    const fixture = TestBed.createComponent(SiremTopbar);
    fixture.componentRef.setInput('spaceLabel', 'Clínica Norte');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Clínica Norte');
  });

  it('should emit searchPressed', () => {
    const fixture = TestBed.createComponent(SiremTopbar);
    fixture.detectChanges();
    let pressed = false;
    fixture.componentInstance.searchPressed.subscribe(() => (pressed = true));
    (fixture.nativeElement as HTMLElement)
      .querySelector('button[aria-label^="Búsqueda global"]')
      ?.dispatchEvent(new MouseEvent('click'));
    expect(pressed).toBe(true);
  });
});
