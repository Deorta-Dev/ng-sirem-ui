import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SiremTooltipDirective } from './sirem-tooltip.directive';

@Component({
  standalone: true,
  imports: [SiremTooltipDirective],
  template: `<button
    [siremTooltip]="'Shield'"
    [siremTooltipDelay]="0"
    [siremTooltipDisabled]="disabled()"
    data-testid="host"
  >
    x
  </button>`,
})
class Host {
  readonly disabled = input(false);
}

describe('SiremTooltipDirective', () => {
  afterEach(() => {
    document.querySelectorAll('.sirem-tooltip').forEach((node) => node.remove());
    document.getElementById('sirem-tooltip-styles')?.remove();
  });

  it('should create a described tooltip on pointerenter and remove it on leave', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector(
      '[data-testid="host"]',
    ) as HTMLButtonElement;

    host.dispatchEvent(new PointerEvent('pointerenter'));
    const tip = document.body.querySelector('.sirem-tooltip') as HTMLElement;
    expect(tip).not.toBeNull();
    expect(tip.textContent).toContain('Shield');
    expect(tip.getAttribute('role')).toBe('tooltip');
    expect(host.getAttribute('aria-describedby')).toBe(tip.id);

    host.dispatchEvent(new PointerEvent('pointerleave'));
    vi.runAllTimers();
    expect(document.body.querySelector('.sirem-tooltip')).toBeNull();
    expect(host.hasAttribute('aria-describedby')).toBe(false);
    vi.useRealTimers();
  });

  it('should not render when disabled', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
    host.dispatchEvent(new PointerEvent('pointerenter'));
    expect(document.body.querySelector('.sirem-tooltip')).toBeNull();
  });
});
