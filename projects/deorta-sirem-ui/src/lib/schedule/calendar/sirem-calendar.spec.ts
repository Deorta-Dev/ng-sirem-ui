import { TestBed } from '@angular/core/testing';
import { SiremCalendar } from './sirem-calendar';

function isoOfCurrentMonth(day: number): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

describe('SiremCalendar', () => {
  it('should select a day and emit', () => {
    const fixture = TestBed.createComponent(SiremCalendar);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    let pressed: string | null = null;
    c.dayPressed.subscribe((iso) => (pressed = iso));
    const iso = isoOfCurrentMonth(5);
    c.pick(iso);
    expect(c.selected()).toBe(iso);
    expect(pressed).toBe(iso);
  });

  it('should show dots for events of the visible month', () => {
    const fixture = TestBed.createComponent(SiremCalendar);
    const iso = isoOfCurrentMonth(12);
    fixture.componentRef.setInput('events', [
      { date: iso, label: 'Control', color: '#1d64f1' },
    ]);
    fixture.detectChanges();
    const cells = fixture.componentInstance.cells();
    const day = cells.find((c) => c.iso === iso);
    expect(day).toBeTruthy();
    expect(day?.dots.length).toBe(1);
  });

  it('should navigate months and years with the picker', () => {
    const fixture = TestBed.createComponent(SiremCalendar);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    const before = c.monthLabel();
    c.go(1);
    expect(c.monthLabel()).not.toBe(before);
    c.goYear(1);
    expect(c.year()).toBe(new Date().getFullYear() + 1);
    c.titlePressed();
    expect(c.pickerOpen()).toBe(true);
    c.pickMonth(0);
    expect(c.month()).toBe(0);
    expect(c.pickerOpen()).toBe(false);
  });

  it('should default to medium size and accept small/large', () => {
    const fixture = TestBed.createComponent(SiremCalendar);
    fixture.detectChanges();
    expect(fixture.componentInstance.size()).toBe('medium');
    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Lun');
  });

  it('should render only days without events in small mode', () => {
    const fixture = TestBed.createComponent(SiremCalendar);
    const iso = isoOfCurrentMonth(12);
    fixture.componentRef.setInput('size', 'small');
    fixture.componentRef.setInput('events', [
      { date: iso, label: 'Control', color: '#1d64f1' },
    ]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    // sin puntos de evento (spans con fondo en línea) y sin leyenda
    expect(el.querySelector('span[style]')).toBeNull();
    expect(el.textContent).not.toContain('Control');
  });
});
