import { TestBed } from '@angular/core/testing';
import { SiremStatCard } from './sirem-stat-card';

describe('SiremStatCard', () => {
  it('should render value and positive delta', () => {
    const fixture = TestBed.createComponent(SiremStatCard);
    fixture.componentRef.setInput('label', 'Pacientes activos');
    fixture.componentRef.setInput('value', 248);
    fixture.componentRef.setInput('delta', 4.2);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('248');
    expect(text).toContain('+4.2');
  });
});
