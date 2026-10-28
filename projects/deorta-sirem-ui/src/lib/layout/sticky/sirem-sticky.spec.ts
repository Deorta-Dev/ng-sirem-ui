import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SiremSticky } from './sirem-sticky';

/** `DOMRect` mínimo para simular posiciones de scroll en jsdom. */
const rect = (top: number, bottom: number) =>
  ({
    top,
    bottom,
    left: 0,
    right: 0,
    width: 0,
    height: bottom - top,
    x: 0,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

@Component({
  standalone: true,
  imports: [SiremSticky],
  template: `
    <div class="box">
      <div
        class="target"
        [siremSticky]="enabled()"
        [siremStickyOffset]="offset()"
        [siremStickyLimit]="limit()"
        [siremStickyBoundary]="boundary()"
        (siremStickyChange)="events.push($event)"
      >
        fijo
      </div>
    </div>
    <div id="mark" class="mark">fin</div>
  `,
})
class StickyHost {
  readonly enabled = signal(true);
  readonly offset = signal(0);
  readonly limit = signal<number | null>(null);
  readonly boundary = signal<HTMLElement | string | null>(null);
  readonly events: boolean[] = [];
}

/** Deja correr el primer cálculo (se programa con `setTimeout(..., 0)`). */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function setup() {
  const fixture = TestBed.createComponent(StickyHost);
  fixture.detectChanges();
  return fixture;
}

function target(fixture: ReturnType<typeof setup>): HTMLElement {
  return fixture.nativeElement.querySelector('.target') as HTMLElement;
}

describe('SiremSticky', () => {
  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });

  it('should apply sticky position, offset, z-index and the marker class', async () => {
    const fixture = setup();
    fixture.componentInstance.offset.set(8);
    fixture.detectChanges();
    await flush();

    const el = target(fixture);
    expect(el.classList.contains('sirem-sticky')).toBe(true);
    expect(el.style.position).toBe('sticky');
    expect(el.style.top).toBe('8px');
    expect(el.style.zIndex).toBe('30');
    expect(el.classList.contains('sirem-sticky--stuck')).toBe(false);
  });

  it('should detect the stuck state and emit only on changes', async () => {
    const fixture = setup();
    await flush();

    const el = target(fixture);
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(rect(0, 48));

    // Sin scroll: no está pegada.
    document.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(el.classList.contains('sirem-sticky--stuck')).toBe(false);
    expect(fixture.componentInstance.events).toEqual([]);

    Object.defineProperty(window, 'scrollY', { value: 120, configurable: true });
    document.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(el.classList.contains('sirem-sticky--stuck')).toBe(true);
    expect(fixture.componentInstance.events).toEqual([true]);

    // Repetir scroll sin cambiar de estado no vuelve a emitir.
    document.dispatchEvent(new Event('scroll'));
    expect(fixture.componentInstance.events).toEqual([true]);

    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    document.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(el.classList.contains('sirem-sticky--stuck')).toBe(false);
    expect(fixture.componentInstance.events).toEqual([true, false]);
  });

  it('should release after the numeric limit', async () => {
    const fixture = setup();
    const el = target(fixture);
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(rect(0, 48));
    fixture.componentInstance.limit.set(50);
    fixture.detectChanges();
    await flush();

    // 40 px de recorrido: aún dentro del límite, se mantiene en top 0.
    Object.defineProperty(window, 'scrollY', { value: 40, configurable: true });
    document.dispatchEvent(new Event('scroll'));
    expect(el.style.top).toBe('0px');

    // 90 px: se ha pasado 40 px del límite, así que se suelta hacia arriba.
    Object.defineProperty(window, 'scrollY', { value: 90, configurable: true });
    document.dispatchEvent(new Event('scroll'));
    expect(el.style.top).toBe('-40px');
  });

  it('should use another element as the sticky limit', async () => {
    const fixture = setup();
    await flush();

    const el = target(fixture);
    const mark = fixture.nativeElement.querySelector('.mark') as HTMLElement;
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(rect(0, 48));
    vi.spyOn(mark, 'getBoundingClientRect').mockReturnValue(rect(-200, 30));

    fixture.componentInstance.boundary.set(mark);
    fixture.detectChanges();

    Object.defineProperty(window, 'scrollY', { value: 120, configurable: true });
    document.dispatchEvent(new Event('scroll'));

    // top = borde inferior del boundary (30) - alto del host (48) = -18.
    expect(el.style.top).toBe('-18px');
  });

  it('should accept a CSS selector as the boundary', async () => {
    const fixture = setup();
    await flush();

    const el = target(fixture);
    const mark = fixture.nativeElement.querySelector('.mark') as HTMLElement;
    // `#mark` se resuelve con `document.querySelector`: el fixture debe estar
    // en el documento para que el selector lo encuentre.
    document.body.appendChild(fixture.nativeElement);
    try {
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(rect(0, 48));
      vi.spyOn(mark, 'getBoundingClientRect').mockReturnValue(rect(-200, 20));

      fixture.componentInstance.boundary.set('#mark');
      fixture.detectChanges();

      Object.defineProperty(window, 'scrollY', { value: 120, configurable: true });
      document.dispatchEvent(new Event('scroll'));

      // top = 20 - 48 = -28 (el límite obliga a soltarse hacia arriba).
      expect(el.style.top).toBe('-28px');
    } finally {
      fixture.nativeElement.remove();
    }
  });

  it('should clear the styles and state when disabled', async () => {
    const fixture = setup();
    await flush();

    const el = target(fixture);
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(rect(0, 48));
    Object.defineProperty(window, 'scrollY', { value: 120, configurable: true });
    document.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(el.classList.contains('sirem-sticky--stuck')).toBe(true);

    fixture.componentInstance.enabled.set(false);
    fixture.detectChanges();
    document.dispatchEvent(new Event('scroll'));

    expect(el.classList.contains('sirem-sticky')).toBe(false);
    expect(el.classList.contains('sirem-sticky--stuck')).toBe(false);
    expect(el.style.position).toBe('');
    expect(el.style.top).toBe('');
    expect(fixture.componentInstance.events).toEqual([true, false]);
  });
});
