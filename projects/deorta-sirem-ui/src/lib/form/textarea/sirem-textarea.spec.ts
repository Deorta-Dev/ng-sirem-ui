import { TestBed } from '@angular/core/testing';
import { SiremTextarea } from './sirem-textarea';

describe('SiremTextarea', () => {
  it('should render label and rows', () => {
    const fixture = TestBed.createComponent(SiremTextarea);
    fixture.componentRef.setInput('label', 'Observaciones');
    fixture.componentRef.setInput('rows', 5);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(el.rows).toBe(5);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Observaciones');
  });
});
