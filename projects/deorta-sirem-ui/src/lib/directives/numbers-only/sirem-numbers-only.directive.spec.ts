import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SiremNumbersOnlyDirective } from './sirem-numbers-only.directive';

@Component({
  standalone: true,
  imports: [SiremNumbersOnlyDirective],
  template: `<input siremNumbersOnly aria-label="demo" />`,
})
class Host {}

describe('SiremNumbersOnlyDirective', () => {
  it('should strip non digits on input', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'AB12-34';
    input.dispatchEvent(new Event('input'));
    expect(input.value).toBe('1234');
  });
});
