import { TestBed } from '@angular/core/testing';
import { SiremPopupCard } from './sirem-popup-card';

describe('SiremPopupCard', () => {
  it('should render telemetry rows', () => {
    const fixture = TestBed.createComponent(SiremPopupCard);
    fixture.componentRef.setInput('title', 'ABC-123');
    fixture.componentRef.setInput('rows', [{ label: 'Velocidad', value: '62 km/h' }]);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('ABC-123');
    expect(text).toContain('62 km/h');
  });
});
