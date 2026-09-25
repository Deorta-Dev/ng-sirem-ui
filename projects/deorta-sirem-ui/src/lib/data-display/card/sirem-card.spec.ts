import { TestBed } from '@angular/core/testing';
import { SiremCard } from './sirem-card';

describe('SiremCard', () => {
  it('should render title when provided', () => {
    const fixture = TestBed.createComponent(SiremCard);
    fixture.componentRef.setInput('title', 'Ficha del paciente');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Ficha del paciente');
  });
});
