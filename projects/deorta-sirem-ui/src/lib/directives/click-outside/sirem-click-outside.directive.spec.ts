import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SiremClickOutsideDirective } from './sirem-click-outside.directive';

@Component({
  standalone: true,
  imports: [SiremClickOutsideDirective],
  template: `<div (siremClickOutside)="count = count + 1" data-testid="box">x</div><button data-testid="out">y</button>`,
})
class Host {
  count = 0;
}

describe('SiremClickOutsideDirective', () => {
  it('should emit only on outside pointerdown', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    el.querySelector('[data-testid="box"]')!.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    expect(fixture.componentInstance.count).toBe(0);
    el.querySelector('[data-testid="out"]')!.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    expect(fixture.componentInstance.count).toBe(1);
  });
});
