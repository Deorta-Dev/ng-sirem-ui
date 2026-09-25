import { TestBed } from '@angular/core/testing';
import { SiremTimeline } from './sirem-timeline';

describe('SiremTimeline', () => {
  it('should render items', () => {
    const fixture = TestBed.createComponent(SiremTimeline);
    fixture.componentRef.setInput('items', [
      { title: 'Consulta general', time: '2026-09-01', tone: 'success' },
    ]);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Consulta general');
  });
});
