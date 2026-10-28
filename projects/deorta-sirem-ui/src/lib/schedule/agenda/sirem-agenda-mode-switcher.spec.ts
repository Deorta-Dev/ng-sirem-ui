import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SiremAgendaModeSwitcher } from './sirem-agenda-mode-switcher';
import type { SiremAgendaMode } from './sirem-agenda-types';

@Component({
  standalone: true,
  imports: [SiremAgendaModeSwitcher],
  template: `
    <sirem-agenda-mode-switcher
      [(mode)]="activeMode"
      (modeChange)="lastChanged.set($event)"
    />
  `,
})
class HostComponent {
  readonly activeMode = signal<SiremAgendaMode>('week');
  readonly lastChanged = signal<SiremAgendaMode | null>(null);
}

describe('SiremAgendaModeSwitcher', () => {
  it('should render mode options and emit when switched', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const switcher = fixture.nativeElement.querySelector('sirem-agenda-mode-switcher');
    expect(switcher).toBeTruthy();

    fixture.componentInstance.activeMode.set('day');
    fixture.detectChanges();

    expect(fixture.componentInstance.activeMode()).toBe('day');
  });

  it('should filter week mode when compact is true', () => {
    const fixture = TestBed.createComponent(SiremAgendaModeSwitcher);
    fixture.componentRef.setInput('compact', true);
    fixture.detectChanges();

    expect(fixture.componentInstance.availableModes()).not.toContain('week');
    expect(fixture.componentInstance.availableModes()).toContain('day');
  });
});
