import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SiremAgendaNav } from './sirem-agenda-nav';
import type {
  SiremAgendaDateRange,
  SiremAgendaLazyLoadEvent,
} from './sirem-agenda-types';

@Component({
  standalone: true,
  imports: [SiremAgendaNav],
  template: `
    <sirem-agenda-nav
      [(date)]="selectedDate"
      [showChips]="true"
      (reachStart)="reachStartEvent.set($event)"
      (reachEnd)="reachEndEvent.set($event)"
      (lazyLoad)="lazyLoadEvent.set($event)"
      (dayPressed)="pressedDate.set($event)"
    />
  `,
})
class HostComponent {
  readonly selectedDate = signal(new Date(2026, 9, 21));
  readonly reachStartEvent = signal<SiremAgendaDateRange | null>(null);
  readonly reachEndEvent = signal<SiremAgendaDateRange | null>(null);
  readonly lazyLoadEvent = signal<SiremAgendaLazyLoadEvent | null>(null);
  readonly pressedDate = signal<Date | null>(null);
}

describe('SiremAgendaNav', () => {
  it('should initialize loaded days and allow navigating next/prev', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const comp = fixture.debugElement.children[0].componentInstance as SiremAgendaNav;
    expect(comp.loadedDays().length).toBeGreaterThan(0);

    const nextBtn = fixture.nativeElement.querySelector('button[aria-label="Siguiente"]') as HTMLButtonElement;
    expect(nextBtn).toBeTruthy();
    nextBtn.click();
    fixture.detectChanges();

    // In week mode, shifts by 7 days
    expect(fixture.componentInstance.selectedDate().getDate()).toBe(28);
  });

  it('should trigger appendDays and emit reachEnd when scrolling right', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const comp = fixture.debugElement.children[0].componentInstance as SiremAgendaNav;
    const initialCount = comp.loadedDays().length;

    comp.appendDays();
    fixture.detectChanges();

    expect(comp.loadedDays().length).toBe(initialCount + comp.pageSize());
    expect(fixture.componentInstance.reachEndEvent()).toBeTruthy();
    expect(fixture.componentInstance.lazyLoadEvent()?.direction).toBe('next');
  });

  it('should trigger prependDays and emit reachStart when scrolling left', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const comp = fixture.debugElement.children[0].componentInstance as SiremAgendaNav;
    const initialCount = comp.loadedDays().length;

    comp.prependDays();
    fixture.detectChanges();

    expect(comp.loadedDays().length).toBe(initialCount + comp.pageSize());
    expect(fixture.componentInstance.reachStartEvent()).toBeTruthy();
    expect(fixture.componentInstance.lazyLoadEvent()?.direction).toBe('prev');
  });
});
