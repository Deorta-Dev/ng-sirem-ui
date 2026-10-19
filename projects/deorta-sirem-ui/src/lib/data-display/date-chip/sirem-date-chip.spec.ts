import { TestBed } from '@angular/core/testing';
import { SiremDateChip } from './sirem-date-chip';

describe('SiremDateChip', () => {
  it('should render weekday, day and emit on press', () => {
    const fixture = TestBed.createComponent(SiremDateChip);
    fixture.componentRef.setInput('weekday', 'L');
    fixture.componentRef.setInput('day', '19');
    let pressed = 0;
    fixture.componentInstance.pressed.subscribe(() => (pressed += 1));
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.querySelector('.sirem-date-chip__weekday')?.textContent).toContain('L');
    expect(button.querySelector('.sirem-date-chip__day')?.textContent).toContain('19');
    button.click();
    expect(pressed).toBe(1);
  });

  it('should hide the status dot when active and mark aria-pressed', () => {
    const fixture = TestBed.createComponent(SiremDateChip);
    fixture.componentRef.setInput('day', '23');
    fixture.componentRef.setInput('dot', true);
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.className).toContain('sirem-date-chip--active');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.querySelector('.sirem-date-chip__dot')).toBeNull();
  });
});
