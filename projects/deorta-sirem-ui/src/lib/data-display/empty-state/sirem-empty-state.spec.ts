import { TestBed } from '@angular/core/testing';
import { SiremEmptyState } from './sirem-empty-state';

describe('SiremEmptyState', () => {
  it('should render custom title', () => {
    const fixture = TestBed.createComponent(SiremEmptyState);
    fixture.componentRef.setInput('title', 'Sin pacientes');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Sin pacientes');
  });
});
