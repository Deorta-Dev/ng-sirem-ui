import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SiremAutofocusDirective } from './sirem-autofocus.directive';

@Component({
  standalone: true,
  imports: [SiremAutofocusDirective],
  template: `<input siremAutofocus aria-label="demo" />`,
})
class Host {}

describe('SiremAutofocusDirective', () => {
  it('should focus the host input', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('input'));
  });
});
