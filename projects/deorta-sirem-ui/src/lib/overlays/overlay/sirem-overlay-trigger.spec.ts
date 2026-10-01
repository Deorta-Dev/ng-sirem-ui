import { Component, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SiremOverlayTrigger } from './sirem-overlay-trigger';

/**
 * Host mínimo: un disparador dentro de un contenedor con `overflow: hidden`,
 * que es justo el caso que motivó el componente.
 */
@Component({
  standalone: true,
  imports: [SiremOverlayTrigger],
  template: `
    <div class="clip" style="overflow: hidden; height: 80px">
      <button type="button" [siremOverlay]="panel" siremOverlayPlacement="bottom-start">
        Abrir
      </button>
    </div>

    <ng-template #panel>
      <div class="sirem-overlay__panel">Contenido</div>
    </ng-template>
  `,
})
class Host {
  readonly panel = viewChild.required<TemplateRef<unknown>>('panel');
}

@Component({
  standalone: true,
  imports: [SiremOverlayTrigger],
  template: `
    <button type="button" [siremOverlay]="panel">Abrir</button>
    <ng-template #panel><div>Panel</div></ng-template>
  `,
})
class RefHost {}

describe('SiremOverlayTrigger', () => {
  afterEach(() => {
    document.querySelectorAll('.sirem-overlay-layer').forEach((el) => el.remove());
  });

  it('should create the layer on first open, without mounting the viewport', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    // La capa es perezosa: se crea al primer panel, no al renderizar.
    expect(document.querySelector('.sirem-overlay-layer')).toBeNull();

    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(document.querySelector('.sirem-overlay-layer')).toBeTruthy();
  });

  it('should inject its own stylesheet so the panel shows without extra CSS', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(document.getElementById('sirem-overlay-styles')?.textContent).toContain(
      '.sirem-overlay-panel',
    );
  });

  it('should open on click and move the panel into the layer, not next to the trigger', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const trigger = fixture.nativeElement as HTMLElement;
    const button = trigger.querySelector('button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    const layer = document.querySelector('.sirem-overlay-layer') as HTMLElement;
    const panel = layer.querySelector('.sirem-overlay-panel') as HTMLElement;
    expect(panel).toBeTruthy();
    // El panel ya no está dentro del contenedor con overflow: hidden.
    expect(panel.closest('.clip')).toBeNull();
    expect(panel.textContent).toContain('Contenido');
  });

  it('should set aria-expanded and position the panel with translate3d', () => {
    const fixture = TestBed.createComponent(RefHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const button = host.querySelector('button') as HTMLButtonElement;

    expect(button.getAttribute('aria-expanded')).toBe('false');
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');

    const panel = document.querySelector('.sirem-overlay-panel') as HTMLElement;
    expect(panel.style.transform).toMatch(/translate3d\(-?\d/);
  });

  it('should toggle closed on a second click', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    ) as HTMLButtonElement;

    button.click();
    fixture.detectChanges();
    expect(document.querySelector('.sirem-overlay-panel')).toBeTruthy();

    button.click();
    fixture.detectChanges();
    // destroyView puede diferirse por la transición, pero el estado ya cerró.
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });
});

@Component({
  standalone: true,
  imports: [SiremOverlayTrigger],
  template: `
    <button
      type="button"
      [siremOverlay]="menu"
      siremOverlayTrigger="click"
    >
      Menu
    </button>
    <button
      type="button"
      [siremOverlay]="detail"
      siremOverlayTrigger="dblclick"
    >
      Detalle
    </button>
    <ng-template #menu><div>PANEL-MENU</div></ng-template>
    <ng-template #detail><div>PANEL-DETALLE</div></ng-template>
  `,
})
class TwoTriggersHost {}

@Component({
  standalone: true,
  imports: [SiremOverlayTrigger],
  template: `
    <button
      type="button"
      [siremOverlay]="panel"
      siremOverlayTrigger="longpress"
      [siremOverlayLongPressMs]="30"
    >
      Mantener
    </button>
    <ng-template #panel><div>PANEL-FICHA</div></ng-template>
  `,
})
class LongPressHost {}

@Component({
  standalone: true,
  imports: [SiremOverlayTrigger],
  template: `
    <button
      type="button"
      [siremOverlay]="panel"
      siremOverlayTrigger="hover"
      [siremOverlayHoverDelayMs]="30"
    >
      Encima
    </button>
    <ng-template #panel><div>PANEL-RESUMEN</div></ng-template>
  `,
})
class HoverHost {}

const clickOn = (el: HTMLElement, type = 'click') =>
  el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true }));
const pointer = (el: HTMLElement, type: string) =>
  el.dispatchEvent(new PointerEvent(type, { bubbles: true }));

describe('SiremOverlayTrigger · eventos', () => {
  afterEach(() => {
    document.querySelectorAll('.sirem-overlay-layer').forEach((el) => el.remove());
  });

  it('should let each element keep its own trigger type', async () => {
    const fixture = TestBed.createComponent(TwoTriggersHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const [menuBtn, detailBtn] = [...host.querySelectorAll('button')] as HTMLElement[];

    // El de menú responde al clic, el de detalle solo al doble clic.
    clickOn(menuBtn);
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 60));
    fixture.detectChanges();
    expect(document.body.textContent).toContain('PANEL-MENU');
    expect(document.body.textContent).not.toContain('PANEL-DETALLE');

    // Un clic sobre el de detalle no abre nada.
    clickOn(detailBtn);
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 60));
    fixture.detectChanges();
    expect(document.body.textContent).not.toContain('PANEL-DETALLE');

    // El doble clic sí.
    clickOn(detailBtn, 'dblclick');
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 60));
    fixture.detectChanges();
    expect(document.body.textContent).toContain('PANEL-DETALLE');
  });

  it('should open a longpress overlay only after holding', async () => {
    const fixture = TestBed.createComponent(LongPressHost);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    ) as HTMLElement;

    pointer(button, 'pointerdown');
    fixture.detectChanges();
    expect(document.body.textContent).not.toContain('PANEL-FICHA');

    await new Promise((r) => setTimeout(r, 60));
    fixture.detectChanges();
    expect(document.body.textContent).toContain('PANEL-FICHA');
  });

  it('should not open longpress if the pointer is released first', async () => {
    const fixture = TestBed.createComponent(LongPressHost);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    ) as HTMLElement;

    pointer(button, 'pointerdown');
    pointer(button, 'pointerup');
    await new Promise((r) => setTimeout(r, 60));
    fixture.detectChanges();
    expect(document.body.textContent).not.toContain('PANEL-FICHA');
  });

  it('should open a hover overlay after the delay', async () => {
    const fixture = TestBed.createComponent(HoverHost);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    ) as HTMLElement;

    pointer(button, 'pointerenter');
    fixture.detectChanges();
    expect(document.body.textContent).not.toContain('PANEL-RESUMEN');

    await new Promise((r) => setTimeout(r, 60));
    fixture.detectChanges();
    expect(document.body.textContent).toContain('PANEL-RESUMEN');
  });
});

@Component({
  standalone: true,
  imports: [SiremOverlayTrigger],
  template: `
    <button type="button" [siremOverlay]="panel" siremOverlayPlacement="bottom-start">
      Abrir
    </button>
    <ng-template #panel><div class="panel-fijo">PANEL</div></ng-template>
  `,
})
class PositionHost {}

describe('SiremOverlayTrigger · posicion', () => {
  let originals: { w: number; h: number };
  let rect: { top: number; left: number; width: number; height: number };

  beforeEach(() => {
    originals = { w: window.innerWidth, h: window.innerHeight };
    // El disparador esta en una posicion conocida y el panel es pequeno, para
    // que quepa de sobra: la posicion final debe ser la calculada.
    rect = { top: 300, left: 400, width: 120, height: 32 };
    HTMLElement.prototype.getBoundingClientRect = function () {
      return { ...rect, right: 520, bottom: 332, x: 400, y: 300, toJSON: () => ({}) };
    } as never;
  });

  afterEach(() => {
    document.querySelectorAll('.sirem-overlay-layer').forEach((el) => el.remove());
  });

  it('should place the panel relative to the trigger, not at the viewport origin', () => {
    const fixture = TestBed.createComponent(PositionHost);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    const panel = document.querySelector('.sirem-overlay-panel') as HTMLElement;
    const m = /translate3d\((-?[\d.]+)px,\s*(-?[\d.]+)px/.exec(panel.style.transform);
    expect(m).toBeTruthy();

    const x = Number(m![1]);
    const y = Number(m![2]);
    // `bottom-start` con offset 8: x = left del disparador, y = bottom + 8.
    expect(x).toBe(400);
    expect(y).toBe(332 + 8);

    // Y no debe haber acabado en la esquina (el bug que se reportó).
    expect(x).toBeGreaterThan(8);
    expect(y).toBeGreaterThan(8);
  });

  it('should keep the position on reposition even if transform was normalized', () => {
    const fixture = TestBed.createComponent(PositionHost);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    const panel = document.querySelector('.sirem-overlay-panel') as HTMLElement;
    const first = panel.style.transform;
    expect(first).toContain('400px');

    // Un navegador real devuelve el transform COMPUTADO como matriz, no como
    // `translate3d`. Se simula, porque el entorno de test devuelve el valor
    // en crudo y por eso no detectaba el fallo.
    const real = window.getComputedStyle.bind(window);
    const stub = (el: Element, pseudo?: string | null) => {
      const style = real(el, pseudo);
      if (el === panel) {
        return new Proxy(style, {
          get(target, prop) {
            if (prop === 'transform') return 'matrix3d(1, 0, 0, 1, 0, 0, 0, 0)';
            const v = (target as unknown as Record<string | symbol, unknown>)[prop];
            return typeof v === 'function' ? v.bind(target) : v;
          },
        }) as CSSStyleDeclaration;
      }
      return style;
    };
    window.getComputedStyle = stub as typeof window.getComputedStyle;

    const dir = fixture.debugElement
      .query(By.directive(SiremOverlayTrigger))
      .injector.get(SiremOverlayTrigger);
    dir.reposition();

    expect(panel.style.transform).toBe(first);
  });
});
