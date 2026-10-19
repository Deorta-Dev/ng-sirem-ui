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

  it('should support the compact size and an empty delta label', () => {
    const fixture = TestBed.createComponent(SiremStatCard);
    fixture.componentRef.setInput('label', 'Costes');
    fixture.componentRef.setInput('value', '4.9k');
    fixture.componentRef.setInput('delta', 20.5);
    fixture.componentRef.setInput('deltaLabel', '');
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.sirem-stat--sm')).toBeTruthy();
    expect(el.textContent).toContain('+20.5');
    expect(el.textContent).not.toContain('periodo anterior');
  });
});
