import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SiremAgendaBody } from './sirem-agenda-body';
import type {
  SiremAgendaEvent,
  SiremAgendaMode,
  SiremAgendaSlot,
} from './sirem-agenda-types';

@Component({
  standalone: true,
  imports: [SiremAgendaBody],
  template: `
    <sirem-agenda-body
      [mode]="mode()"
      [date]="date()"
      [events]="events()"
      (slotPressed)="slot.set($event)"
      (eventPressed)="pressedEvent.set($event)"
      (reachEnd)="endReached.set(true)"
      (reachStart)="startReached.set(true)"
    />
  `,
})
class HostComponent {
  readonly mode = signal<SiremAgendaMode>('week');
  readonly date = signal(new Date(2026, 9, 21));
  readonly events = signal<SiremAgendaEvent[]>([
    {
      id: 'e1',
      title: 'Consulta General',
      start: new Date(2026, 9, 21, 9, 0),
      end: new Date(2026, 9, 21, 10, 0),
    },
  ]);
  readonly slot = signal<SiremAgendaSlot | null>(null);
  readonly pressedEvent = signal<SiremAgendaEvent | null>(null);
  readonly endReached = signal(false);
  readonly startReached = signal(false);
}

describe('SiremAgendaBody', () => {
  it('should render seven columns in week mode', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const cols = fixture.nativeElement.querySelectorAll('.sirem-agenda__col');
    expect(cols.length).toBe(7);
  });

  it('should render one column in day mode', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.mode.set('day');
    fixture.detectChanges();

    const cols = fixture.nativeElement.querySelectorAll('.sirem-agenda__col');
    expect(cols.length).toBe(1);
  });

  it('should render month cells in month mode', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.mode.set('month');
    fixture.detectChanges();

    const cells = fixture.nativeElement.querySelectorAll('.sirem-agenda__mcell');
    expect(cells.length).toBeGreaterThan(27);
  });

  it('should emit reachEnd and extend list when scrolling near bottom', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.mode.set('list');
    fixture.detectChanges();

    const comp = fixture.debugElement.children[0].componentInstance as SiremAgendaBody;
    const initialDays = comp.effectiveListDays();

    // Simular evento de scroll
    const dummyEl = {
      scrollTop: 1000,
      clientHeight: 500,
      scrollHeight: 1520, // 1520 - 500 = 1020 <= 1000 + 100
    } as unknown as HTMLElement;

    comp.onContainerScroll({ target: dummyEl } as unknown as Event);
    fixture.detectChanges();

    expect(fixture.componentInstance.endReached()).toBe(true);
    expect(comp.effectiveListDays()).toBe(initialDays + 15);
  });
});
