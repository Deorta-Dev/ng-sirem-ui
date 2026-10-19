import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SiremNavbar } from './sirem-navbar';

const ITEMS = [
  {
    label: 'Clínica',
    icon: 'fi fi-rr-heart',
    children: [
      { label: 'Pacientes', route: '/x' },
      { label: 'Historia', icon: 'fi fi-rr-notes' },
    ],
  },
  { label: 'Ajustes', icon: 'fi fi-rr-settings', route: '/y', permission: 'ADMIN' },
];

/** Panel abierto que haya en la capa de overlays, o `null`. */
function layerText(): string {
  return document.querySelector('.sirem-overlay-layer')?.textContent ?? '';
}

describe('SiremNavbar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => {
    document.querySelectorAll('.sirem-overlay-layer').forEach((el) => el.remove());
  });

  it('should render vertical items and send children to the overlay', () => {
    const fixture = TestBed.createComponent(SiremNavbar);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.componentRef.setInput('submenu', { trigger: 'click' });
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Clínica');
    // Los hijos no viven en la barra: se montan en la capa de overlays.
    expect(host.textContent).not.toContain('Pacientes');

    const trigger = host.querySelector('.sirem-navbar__link') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-haspopup')).toBe('true');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(layerText()).toContain('Pacientes');
    expect(layerText()).toContain('Historia');
  });

  it('should close the submenu after picking an option and when destroyed', async () => {
    const fixture = TestBed.createComponent(SiremNavbar);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.componentRef.setInput('submenu', { trigger: 'click' });
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      '.sirem-navbar__link',
    ) as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    const option = [...document.querySelectorAll('.sirem-overlay__panel button')].find(
      (b) => b.textContent?.trim() === 'Historia',
    ) as HTMLButtonElement;
    option.click();
    fixture.detectChanges();

    // Elige un enlace: el submenú no debe quedar flotando sobre la nueva vista.
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await new Promise((r) => setTimeout(r, 220));
    expect(layerText()).not.toContain('Historia');

    // Al destruir la barra con el overlay abierto, el panel se retira también.
    trigger.click();
    fixture.detectChanges();
    expect(layerText()).toContain('Pacientes');
    fixture.destroy();
    expect(layerText()).not.toContain('Pacientes');
  });

  it('should resolve the submenu gesture by viewport band', () => {
    const fixture = TestBed.createComponent(SiremNavbar);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.detectChanges();
    const c = fixture.componentInstance;

    // jsdom mide 1024px: por encima del breakpoint (768) aplica la banda desktop.
    expect(c.submenuResolved().trigger).toBe('hover');
    expect(c.submenuResolved().placement).toBe('right-start');

    // Un breakpoint mayor que el ancho actual deja la pantalla en banda móvil.
    fixture.componentRef.setInput('submenu', { breakpoint: 2048 });
    expect(c.submenuResolved().trigger).toBe('click');

    // Gesto común para ambas bandas.
    fixture.componentRef.setInput('submenu', {
      breakpoint: 2048,
      trigger: 'dblclick',
      placement: 'bottom-start',
      hoverDelayMs: 40,
    });
    expect(c.submenuResolved().trigger).toBe('dblclick');
    expect(c.submenuResolved().placement).toBe('bottom-start');
    expect(c.submenuResolved().hoverDelayMs).toBe(40);

    // La banda activa tiene prioridad sobre el valor común.
    fixture.componentRef.setInput('submenu', {
      breakpoint: 2048,
      trigger: 'click',
      desktop: { trigger: 'hover' },
    });
    expect(c.submenuResolved().trigger).toBe('click');
  });

  it('should use a different default placement per layout', () => {
    const fixture = TestBed.createComponent(SiremNavbar);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.componentRef.setInput('layout', 'horizontal');
    fixture.detectChanges();

    expect(fixture.componentInstance.submenuResolved().placement).toBe('bottom-start');
  });

  it('should react to viewport resizes by switching band', () => {
    const original = window.innerWidth;
    const fixture = TestBed.createComponent(SiremNavbar);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.componentRef.setInput('submenu', {
      desktop: { trigger: 'hover' },
      mobile: { trigger: 'click' },
    });
    fixture.detectChanges();
    expect(fixture.componentInstance.submenuResolved().trigger).toBe('hover');

    try {
      Object.defineProperty(window, 'innerWidth', {
        value: 500,
        configurable: true,
        writable: true,
      });
      window.dispatchEvent(new Event('resize'));
      expect(fixture.componentInstance.submenuResolved().trigger).toBe('click');
    } finally {
      Object.defineProperty(window, 'innerWidth', {
        value: original,
        configurable: true,
        writable: true,
      });
      window.dispatchEvent(new Event('resize'));
    }
  });

  it('should open on hover after the configured delay in the desktop band', async () => {
    const fixture = TestBed.createComponent(SiremNavbar);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.componentRef.setInput('submenu', { desktop: { trigger: 'hover', hoverDelayMs: 10 } });
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.sirem-navbar__link') as HTMLElement;
    trigger.dispatchEvent(new Event('pointerenter'));
    fixture.detectChanges();
    expect(layerText()).not.toContain('Pacientes');

    await new Promise((r) => setTimeout(r, 40));
    fixture.detectChanges();
    expect(layerText()).toContain('Pacientes');

    // Al salir, el panel se retira tras el margen de aproximación y el fade.
    trigger.dispatchEvent(new Event('pointerleave'));
    await new Promise((r) => setTimeout(r, 240));
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await new Promise((r) => setTimeout(r, 240));
    expect(layerText()).not.toContain('Pacientes');
  });

  it('should hide items without permission', () => {
    const fixture = TestBed.createComponent(SiremNavbar);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.componentRef.setInput('permissions', new Set<string>());
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Ajustes');
  });

  it('should render minibar and horizontal layouts', () => {
    const fixture = TestBed.createComponent(SiremNavbar);
    fixture.componentRef.setInput('items', ITEMS);
    for (const layout of ['minibar', 'horizontal', 'floating'] as const) {
      fixture.componentRef.setInput('layout', layout);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.sirem-navbar')).toBeTruthy();
    }
  });
});
