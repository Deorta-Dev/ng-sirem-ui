import { TestBed } from '@angular/core/testing';
import { SiremBadge } from './sirem-badge';

describe('SiremBadge', () => {
  it('should apply tone classes', () => {
    const fixture = TestBed.createComponent(SiremBadge);
    fixture.componentRef.setInput('tone', 'success');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span')?.className).toContain(
      'sirem-badge--success',
    );
  });
});
