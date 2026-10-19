import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  SiremAgenda,
  type SiremAgendaEvent,
  type SiremAgendaMode,
  type SiremAgendaSlot,
  type SiremAgendaSticky,
} from './sirem-agenda';

@Component({
  standalone: true,
  imports: [SiremAgenda],
  template: `
    <sirem-agenda
      [events]="events()"
      [modes]="modes()"
      [mode]="mode()"
      (modeChange)="mode.set($event)"
      [date]="date()"
      (dateChange)="date.set($event)"
      [now]="now"
      [weekStartsOn]="1"
      [sticky]="sticky()"
      stickyOffset="4rem"
      [toolbarStickyHeight]="toolbarStickyHeight()"
      [toolbarBlur]="toolbarBlur()"
      [toolbarBackground]="toolbarBackground()"
      [toolbarBackgroundStuck]="toolbarBackgroundStuck()"
      [daysBlur]="daysBlur()"
      (eventPressed)="pressed.set($event)"
      (slotPressed)="slot.set($event)"
    />
  `,
})
class Host {
  readonly events = signal<SiremAgendaEvent[]>([]);
  readonly modes = signal<SiremAgendaMode[]>(['day', 'week', 'month', 'list']);
  readonly mode = signal<SiremAgendaMode>('week');
  readonly sticky = signal<SiremAgendaSticky>('none');
  readonly toolbarStickyHeight = signal(0);
  readonly toolbarBlur = signal<number | null>(null);
  readonly toolbarBackground = signal('');
  readonly toolbarBackgroundStuck = signal('');
  readonly daysBlur = signal<number | null>(null);
  /** Miércoles 21 de octubre de 2026. */
  readonly date = signal(new Date(2026, 9, 21));
  readonly now = new Date(2026, 9, 21, 10, 30);
  readonly pressed = signal<SiremAgendaEvent | null>(null);
  readonly slot = signal<SiremAgendaSlot | null>(null);
}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return fixture;
}

const element = (fixture: ReturnType<typeof setup>) => fixture.nativeElement as HTMLElement;

describe('SiremAgenda', () => {
  it('should render the week with seven date chips starting on Monday', () => {
    const fixture = setup();
    const chips = element(fixture).querySelectorAll('.sirem-agenda__head sirem-date-chip');

    expect(chips.length).toBe(7);
    expect(chips[0].textContent).toContain('19');
    expect(chips[6].textContent).toContain('25');
  });

  it('should show the week rail and one column in day mode', () => {
    const fixture = setup();
    fixture.componentInstance.mode.set('day');
    fixture.detectChanges();

    expect(element(fixture).querySelectorAll('.sirem-agenda__rail sirem-date-chip').length).toBe(7);
    expect(element(fixture).querySelectorAll('.sirem-agenda__col').length).toBe(1);
  });

  it('should navigate by day, week and month depending on the view', () => {
    const fixture = setup();
    const next = () => {
      const button = element(fixture).querySelector(
        'button[aria-label="Siguiente"]',
      ) as HTMLButtonElement;
      button.click();
      fixture.detectChanges();
    };

    next();
    expect(fixture.componentInstance.date().getDate()).toBe(28);

    fixture.componentInstance.mode.set('day');
    fixture.detectChanges();
    next();
    expect(fixture.componentInstance.date().getDate()).toBe(29);

    fixture.componentInstance.mode.set('month');
    fixture.detectChanges();
    next();
    expect(fixture.componentInstance.date().getMonth()).toBe(10);
  });

  it('should jump to the day view when a week chip is pressed', () => {
    const fixture = setup();
    const chips = element(fixture).querySelectorAll('.sirem-agenda__head sirem-date-chip');

    (chips[3].querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.mode()).toBe('day');
    expect(fixture.componentInstance.date().getDate()).toBe(22);
  });

  it('should place an event at its hour with its real duration', () => {
    const fixture = setup();
    fixture.componentInstance.events.set([
      {
        id: 'a',
        title: 'Control visual',
        start: new Date(2026, 9, 21, 9, 0),
        end: new Date(2026, 9, 21, 10, 0),
      },
    ]);
    fixture.detectChanges();

    const block = element(fixture).querySelector('.sirem-agenda__event') as HTMLElement;
    expect(block.textContent).toContain('Control visual');
    // startHour 7 y 64 px por hora: las 09:00 caen a 128 px y la hora dura 62 px.
    expect(block.style.top).toBe('128px');
    expect(block.style.height).toBe('62px');
  });

  it('should share the column between overlapping events', () => {
    const fixture = setup();
    fixture.componentInstance.events.set([
      { title: 'A', start: new Date(2026, 9, 21, 9, 0), end: new Date(2026, 9, 21, 11, 0) },
      { title: 'B', start: new Date(2026, 9, 21, 10, 0), end: new Date(2026, 9, 21, 12, 0) },
    ]);
    fixture.detectChanges();

    const blocks = element(fixture).querySelectorAll('.sirem-agenda__event');
    expect(blocks.length).toBe(2);
    expect((blocks[0] as HTMLElement).style.width).toBe('calc(50% - 3px)');
    expect((blocks[0] as HTMLElement).style.left).toBe('0%');
    expect((blocks[1] as HTMLElement).style.left).toBe('50%');
  });

  it('should summarize a busy day with +N more in month mode', () => {
    const fixture = setup();
    fixture.componentInstance.mode.set('month');
    fixture.componentInstance.events.set([
      { title: 'A', start: new Date(2026, 9, 21, 9) },
      { title: 'B', start: new Date(2026, 9, 21, 10) },
      { title: 'C', start: new Date(2026, 9, 21, 11) },
    ]);
    fixture.detectChanges();

    expect(element(fixture).textContent).toContain('Octubre de 2026');
    expect(element(fixture).textContent).toContain('+1 más');
  });

  it('should group days with events in list mode', () => {
    const fixture = setup();
    fixture.componentInstance.mode.set('list');
    fixture.componentInstance.events.set([
      { title: 'A', start: new Date(2026, 9, 21, 9) },
      { title: 'B', start: new Date(2026, 9, 23, 10) },
    ]);
    fixture.detectChanges();

    const groups = element(fixture).querySelectorAll('.sirem-agenda__group');
    expect(groups.length).toBe(2);
    expect(groups[0].textContent).toContain('A');
    expect(groups[1].textContent).toContain('B');
  });

  it('should emit the snapped slot when the grid is pressed', () => {
    const fixture = setup();
    const column = element(fixture).querySelector('.sirem-agenda__col') as HTMLElement;

    column.dispatchEvent(new MouseEvent('click', { bubbles: true, clientY: 128 }));

    expect(fixture.componentInstance.slot()).toEqual({
      date: new Date(2026, 9, 19),
      hour: 9,
      minute: 0,
    });
  });

  it('should only offer the configured views', () => {
    const fixture = setup();
    fixture.componentInstance.modes.set(['month', 'list']);
    fixture.detectChanges();

    // `week` ya no está disponible: se cae a la primera vista ofrecida.
    expect(fixture.componentInstance.mode()).toBe('month');
    expect(element(fixture).querySelectorAll('.sirem-seg__item').length).toBe(2);
  });

  it('should follow the page scroll and stick only the requested headers', () => {
    const fixture = setup();

    // Sin scroll interno ni cabeceras fijas por defecto.
    expect(element(fixture).querySelector('.sirem-agenda__scroll')).toBeNull();
    expect(element(fixture).querySelector('.sirem-agenda__bar--sticky')).toBeNull();
    expect(element(fixture).querySelector('.sirem-agenda__head--sticky')).toBeNull();

    fixture.componentInstance.sticky.set('both');
    fixture.detectChanges();

    expect(element(fixture).querySelector('.sirem-agenda__bar--sticky')).not.toBeNull();
    expect(element(fixture).querySelector('.sirem-agenda__head--sticky')).not.toBeNull();

    const root = element(fixture).querySelector('.sirem-agenda') as HTMLElement;
    expect(root.style.getPropertyValue('--sirem-agenda-top')).toBe('4rem');
    // El segundo encabezado arranca en el mismo offset (alto 0 en jsdom).
    expect(root.style.getPropertyValue('--sirem-agenda-days-top')).toBe('4rem');
  });

  it('should configure the surface of each sticky header separately', () => {
    const fixture = setup();
    fixture.componentInstance.sticky.set('both');
    fixture.componentInstance.toolbarStickyHeight.set(56);
    fixture.componentInstance.toolbarBlur.set(4);
    fixture.componentInstance.toolbarBackground.set('var(--sirem-surface)');
    fixture.componentInstance.toolbarBackgroundStuck.set('#123456');
    fixture.componentInstance.daysBlur.set(6);
    fixture.detectChanges();

    const root = element(fixture).querySelector('.sirem-agenda') as HTMLElement;
    // En reposo manda la configuración normal; la de «pegado» solo al pegarse.
    expect(root.style.getPropertyValue('--sirem-agenda-bar-bg')).toBe('var(--sirem-surface)');
    expect(root.style.getPropertyValue('--sirem-agenda-bar-filter')).toBe('blur(4px)');
    expect(root.style.getPropertyValue('--sirem-agenda-days-filter')).toBe('blur(6px)');
    expect(root.style.getPropertyValue('--sirem-agenda-days-bg')).toBe('');
    // El alto del sticky solo se aplica ya pegado (aquí, sin scroll, no lo está).
    expect(root.style.getPropertyValue('--sirem-agenda-bar-h')).toBe('');
    // El segundo encabezado se apila con el alto configurado de la barra.
    expect(root.style.getPropertyValue('--sirem-agenda-days-top')).toBe('calc(4rem + 56px)');

    fixture.componentInstance.sticky.set('days');
    fixture.detectChanges();
    expect(root.style.getPropertyValue('--sirem-agenda-days-top')).toBe('4rem');
  });
});
