import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SiremSheet } from './sirem-sheet';

describe('SiremSheet', () => {
  it('should render the dialog and the resize handle when open', () => {
    const fixture = TestBed.createComponent(SiremSheet);
    fixture.componentRef.setInput('title', 'Detalle');
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.sirem-sheet__panel')).not.toBeNull();
    expect(el.querySelector('[role="dialog"]')).not.toBeNull();
    expect(el.querySelector('.sirem-sheet__handle')).not.toBeNull();
  });

  it('should swap the handle for close + restore buttons in fullscreen', () => {
    const fixture = TestBed.createComponent(SiremSheet);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    fixture.componentInstance.size.set('full');
    fixture.detectChanges();

    // El control desaparece, pero su hueco sigue reservado.
    expect(el.querySelector('.sirem-sheet__grip')).toBeNull();
    expect(el.querySelector('.sirem-sheet__handle--spacer')).not.toBeNull();
    expect(el.querySelector('.sirem-sheet__panel--full')).not.toBeNull();

    // Las acciones no se mueven: restaurar ocupa el sitio de maximizar y
    // cerrar se queda donde estaba (a la derecha, el último).
    const actions = el.querySelectorAll(
      '.sirem-sheet__head .sirem-sheet__icon',
    ) as NodeListOf<HTMLButtonElement>;
    expect(actions.length).toBe(2);
    expect(actions[0].getAttribute('aria-label')).toBe('Restaurar tamaño');
    expect(actions[1].getAttribute('aria-label')).toBe('Cerrar');
  });

  it('should restore the last non-full size', () => {
    const fixture = TestBed.createComponent(SiremSheet);
    const sheet = fixture.componentInstance;
    sheet.open.set(true);
    sheet.size.set('lg');
    fixture.detectChanges();

    sheet.size.set('full');
    fixture.detectChanges();
    expect(sheet.maximized()).toBe(true);

    sheet.restore();
    fixture.detectChanges();
    expect(sheet.size()).toBe('lg');
  });

  it('should stay in full and hide restore when not minimizable', () => {
    const fixture = TestBed.createComponent(SiremSheet);
    fixture.componentRef.setInput('minimizable', false);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance.size()).toBe('full');
    expect(el.querySelector('.sirem-sheet__grip')).toBeNull();
    expect(el.querySelector('.sirem-sheet__handle--spacer')).not.toBeNull();
    const labels = Array.from(el.querySelectorAll('.sirem-sheet__head .sirem-sheet__icon')).map(
      (button) => button.getAttribute('aria-label'),
    );
    expect(labels).toEqual(['Cerrar']);
  });

  it('should hide the maximize button when not maximizable', () => {
    const fixture = TestBed.createComponent(SiremSheet);
    fixture.componentRef.setInput('maximizable', false);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const labels = Array.from(el.querySelectorAll('.sirem-sheet__head .sirem-sheet__icon')).map(
      (button) => button.getAttribute('aria-label'),
    );
    expect(labels).toEqual(['Cerrar']);
  });

  it('should only shrink with a downward gesture when the content is at the top', () => {
    type GestureHost = {
      onContentTouchStart(event: { touches: { clientY: number }[] }): void;
      onContentTouchMove(event: {
        touches: { clientY: number }[];
        cancelable: boolean;
        preventDefault(): void;
      }): void;
      onContentTouchEnd(): void;
    };

    const fixture = TestBed.createComponent(SiremSheet);
    const sheet = fixture.componentInstance;
    fixture.componentRef.setInput('gestureResize', true);
    sheet.open.set(true);
    sheet.size.set('full');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const panel = el.querySelector('.sirem-sheet__panel') as HTMLElement;
    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ height: 700 } as DOMRect);
    const body = el.querySelector('.sirem-sheet__body') as HTMLElement;
    const gesture = sheet as unknown as GestureHost;

    const down = {
      touches: [{ clientY: 320 }],
      cancelable: true,
      preventDefault: () => {},
    };

    // Con el contenido desplazado, el gesto hacia abajo es scroll, no resize.
    body.scrollTop = 120;
    gesture.onContentTouchStart({ touches: [{ clientY: 200 }] });
    gesture.onContentTouchMove(down);
    gesture.onContentTouchEnd();
    expect(sheet.size()).toBe('full');

    // Desde el principio del scroll sí encoge (y sale de `full`).
    body.scrollTop = 0;
    gesture.onContentTouchStart({ touches: [{ clientY: 200 }] });
    gesture.onContentTouchMove(down);
    gesture.onContentTouchEnd();
    expect(sheet.size()).not.toBe('full');
  });

  it('should animate out before unmounting', () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(SiremSheet);
      fixture.componentInstance.open.set(true);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      fixture.componentInstance.close();
      fixture.detectChanges();

      // Sigue montado y con la clase de salida (slide hacia abajo).
      expect(el.querySelector('.sirem-sheet--closing')).not.toBeNull();
      expect(el.querySelector('.sirem-sheet__panel')).not.toBeNull();

      vi.advanceTimersByTime(400);
      fixture.detectChanges();
      expect(el.querySelector('.sirem-sheet__panel')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('should close from the header button', () => {
    const fixture = TestBed.createComponent(SiremSheet);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll(
      '.sirem-sheet__head .sirem-sheet__icon',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[buttons.length - 1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toBe(false);
  });
});
