import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SiremButton } from '../../button/sirem-button';
import { SiremNavItem, SiremSidebar } from './sirem-sidebar';

@Component({
  standalone: true,
  imports: [SiremButton, SiremSidebar],
  template: `
    <sirem-sidebar brand="SIREM" [items]="items" [pinned]="true" [centerNav]="true">
      <sirem-button slot="apps" size="sm" variant="secondary"> Apps </sirem-button>
      <span slot="user">Ana Pérez</span>
    </sirem-sidebar>
  `,
})
class SidebarHost {
  readonly items: SiremNavItem[] = [
    { label: 'Pacientes', icon: 'fi fi-rr-users' },
    { label: 'Agenda', icon: 'fi fi-rr-calendar' },
  ];
}

/** Contenido que haya en la capa de overlays, o cadena vacía. */
function layerText(): string {
  return document.querySelector('.sirem-overlay-layer')?.textContent ?? '';
}

const NAV: SiremNavItem[] = [
  {
    label: 'Clínica',
    icon: 'fi fi-rr-heart',
    children: [
      { label: 'Pacientes', route: '/x' },
      { label: 'Historia', icon: 'fi fi-rr-notes' },
    ],
  },
  { label: 'Ajustes', icon: 'fi fi-rr-settings' },
];

describe('SiremSidebar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SidebarHost],
      providers: [provideRouter([])],
    });
  });

  afterEach(() => {
    document.querySelectorAll('.sirem-overlay-layer').forEach((el) => el.remove());
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SiremSidebar);
    fixture.componentRef.setInput('items', [{ label: 'Pacientes', route: '/x' }]);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should hide items without permission', () => {
    const fixture = TestBed.createComponent(SiremSidebar);
    fixture.componentRef.setInput('items', [
      { label: 'Pacientes', permission: 'CLINIC_PATIENTS_LIST' },
      { label: 'Agenda' },
    ]);
    fixture.componentRef.setInput('permissions', new Set<string>());
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('Pacientes');
    expect(text).toContain('Agenda');
  });

  it('should render projected apps and user in a pinned centered sidebar', () => {
    const fixture = TestBed.createComponent(SidebarHost);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Apps');
    expect(element.textContent).toContain('Ana Pérez');
    expect(element.querySelector('.sirem-sidebar--pinned')).toBeTruthy();
    expect(element.querySelector('.sirem-sidebar__nav--center')).toBeTruthy();
  });

  it('should render external links (href) and image icons (img)', () => {
    const fixture = TestBed.createComponent(SiremSidebar);
    fixture.componentRef.setInput('items', [
      { label: 'Documentación', href: 'https://example.com/docs' },
      { label: 'Espacio', img: '/logo.png' },
    ]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    const link = element.querySelector<HTMLAnchorElement>('a[href="https://example.com/docs"]');
    expect(link).toBeTruthy();
    expect(link?.querySelector('.sirem-sidebar__label')?.textContent).toContain('Documentación');

    const img = element.querySelector<HTMLImageElement>('img.sirem-sidebar__img');
    expect(img?.getAttribute('src')).toBe('/logo.png');
  });

  it('should send children to the overlay layer, not inline', () => {
    const fixture = TestBed.createComponent(SiremSidebar);
    fixture.componentRef.setInput('items', NAV);
    fixture.componentRef.setInput('submenu', { trigger: 'click' });
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Clínica');
    // Los hijos no viven en el rail: se montan en la capa de overlays.
    expect(host.textContent).not.toContain('Pacientes');

    const trigger = host.querySelector('.sirem-sidebar__link') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-haspopup')).toBe('true');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(layerText()).toContain('Pacientes');
    expect(layerText()).toContain('Historia');
  });

  it('should close the submenu after picking an option', async () => {
    const fixture = TestBed.createComponent(SiremSidebar);
    fixture.componentRef.setInput('items', NAV);
    fixture.componentRef.setInput('submenu', { trigger: 'click' });
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      '.sirem-sidebar__link',
    ) as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    const option = [...document.querySelectorAll('.sirem-overlay__panel button')].find(
      (b) => b.textContent?.trim() === 'Historia',
    ) as HTMLButtonElement;
    option.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await new Promise((r) => setTimeout(r, 220));
    expect(layerText()).not.toContain('Historia');
  });

  it('should show the parent title in the panel when collapsed', () => {
    const fixture = TestBed.createComponent(SiremSidebar);
    fixture.componentRef.setInput('items', NAV);
    fixture.componentRef.setInput('collapsed', true);
    fixture.componentRef.setInput('submenu', { trigger: 'click' });
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.sirem-sidebar__link') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(document.querySelector('.sirem-sidebar__panel-title')?.textContent).toContain(
      'Clínica',
    );
    expect(layerText()).toContain('Pacientes');
  });

  it('should resolve the submenu gesture by viewport band and layout', () => {
    const fixture = TestBed.createComponent(SiremSidebar);
    fixture.componentRef.setInput('items', NAV);
    fixture.detectChanges();
    const c = fixture.componentInstance;

    // jsdom mide 1024px: por encima del breakpoint (768) aplica la banda desktop.
    expect(c.submenuResolved().trigger).toBe('hover');
    expect(c.submenuResolved().placement).toBe('right-start');

    // Barra horizontal: el panel sale por debajo.
    fixture.componentRef.setInput('layout', 'horizontal');
    expect(c.submenuResolved().placement).toBe('bottom-start');

    // Un breakpoint mayor que el ancho actual deja la pantalla en banda móvil.
    fixture.componentRef.setInput('layout', 'vertical');
    fixture.componentRef.setInput('submenu', {
      breakpoint: 2048,
      trigger: 'dblclick',
      desktop: { trigger: 'hover' },
    });
    expect(c.submenuResolved().trigger).toBe('dblclick');
    expect(c.submenuResolved().placement).toBe('right-start');
  });
});
