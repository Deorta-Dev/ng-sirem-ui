import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SiremMaskDirective, type SiremMaskPattern } from './sirem-mask.directive';

@Component({
  standalone: true,
  imports: [SiremMaskDirective],
  template: `
    <input
      [siremMask]="pattern()"
      (maskedChange)="maskedVal.set($event)"
      (rawChange)="rawVal.set($event)"
    />
  `,
})
class HostComponent {
  readonly pattern = signal<SiremMaskPattern | null>('00/00/0000');
  readonly maskedVal = signal('');
  readonly rawVal = signal('');
}

describe('SiremMaskDirective', () => {
  it('should format a date mask properly', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = '25122026';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('25/12/2026');
    expect(fixture.componentInstance.maskedVal()).toBe('25/12/2026');
    expect(fixture.componentInstance.rawVal()).toBe('25122026');
  });

  it('should filter characters when using regex pattern', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.pattern.set(/^[0-9]*$/);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = '123abc45';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('12345');
  });

  it('should handle custom configuration with tokens', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.pattern.set({
      pattern: 'AAA-000',
      tokens: { A: /[A-Z]/, '0': /\d/ },
    });
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = 'ABC123';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('ABC-123');
  });
});
