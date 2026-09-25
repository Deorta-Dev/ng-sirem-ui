import { TestBed } from '@angular/core/testing';
import { SiremDrawer } from './sirem-drawer';

describe('SiremDrawer', () => {
  it('should render panel on the right by default', () => {
    const fixture = TestBed.createComponent(SiremDrawer);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Filtros');
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('aside');
    expect(panel).toBeTruthy();
    expect(panel.className).toContain('sirem-drawer__panel--right');
  });
});
