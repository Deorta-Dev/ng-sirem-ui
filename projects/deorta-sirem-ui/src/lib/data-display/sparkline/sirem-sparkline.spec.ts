import { TestBed } from '@angular/core/testing';
import { SiremSparkline } from './sirem-sparkline';

describe('SiremSparkline', () => {
  it('should normalize bars to percentages with a visible minimum', () => {
    const fixture = TestBed.createComponent(SiremSparkline);
    fixture.componentRef.setInput('data', [0, 5, 10]);
    fixture.detectChanges();
    const bars = fixture.nativeElement.querySelectorAll('.sirem-spark__bar');
    expect(bars.length).toBe(3);
    // El valor 0 conserva el 8 % mínimo; el máximo llega al 100 %.
    expect((bars[0] as HTMLElement).style.height).toBe('8%');
    expect((bars[2] as HTMLElement).style.height).toBe('100%');
  });

  it('should mark the highlighted bar and swap to a line variant', () => {
    const fixture = TestBed.createComponent(SiremSparkline);
    fixture.componentRef.setInput('data', [3, 9, 4]);
    fixture.componentRef.setInput('highlight', 1);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll('.sirem-spark__bar--on').length,
    ).toBe(1);

    fixture.componentRef.setInput('variant', 'line');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sirem-spark__line')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.sirem-spark__bar').length).toBe(0);
  });
});
