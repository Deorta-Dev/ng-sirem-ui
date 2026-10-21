import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SiremSticky } from '../sticky/sirem-sticky';
import { SiremTopbar, type SiremTopbarAppearance, type SiremTopbarSearchAlign } from './sirem-topbar';

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
  imports: [SiremTopbar],
  template: `
    <sirem-topbar
      [appearance]="appearance()"
      [searchAlign]="searchAlign()"
      [searchPlaceholder]="searchPlaceholder()"
      [searchHighlight]="searchHighlight()"
      [searchHint]="searchHint()"
      [showFullscreen]="showFullscreen()"
      [showMenu]="showMenu()"
      [spaceLabel]="'Panel principal'"
    />
  `,
})
class Host {
  readonly appearance = signal<SiremTopbarAppearance>('default');
  readonly searchAlign = signal<SiremTopbarSearchAlign>('start');
  readonly searchPlaceholder = signal('Buscar en ');
  readonly searchHighlight = signal('Soeimn Lion Master');
  readonly searchHint = signal('Ctrl + K');
  readonly showFullscreen = signal(true);
  readonly showMenu = signal(true);
}

describe('SiremTopbar', () => {
  const host = (f: { nativeElement: unknown }) => f.nativeElement as HTMLElement;

  it('should render the workspace label', () => {
    const fixture = TestBed.createComponent(SiremTopbar);
    fixture.componentRef.setInput('spaceLabel', 'Panel principal');
    fixture.detectChanges();
    expect(host(fixture).textContent).toContain('Panel principal');
  });

  it('should split the placeholder into muted prefix and bold highlight', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.searchHighlight.set('Clínica Norte');
    fixture.detectChanges();

    const prefix = host(fixture).querySelector('.sirem-topbar__search-prefix');
    const highlight = host(fixture).querySelector('.sirem-topbar__search-hl');
    expect(prefix?.textContent).toBe('Buscar en ');
    expect(highlight?.textContent).toBe('Clínica Norte');
    // El resaltado va en negrita, el resto atenuado.
    expect(highlight?.tagName).toBe('STRONG');
  });

  it('should hide the keyboard hint when it is empty', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.searchHint.set('');
    fixture.detectChanges();
    expect(host(fixture).querySelector('.sirem-topbar__kbd')).toBeNull();
  });

  it('should show the hint when it has content', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.searchHint.set('Ctrl + K');
    fixture.detectChanges();
    expect(host(fixture).querySelector('.sirem-topbar__kbd')?.textContent).toContain('Ctrl + K');
  });

  it('should toggle the fullscreen button', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    // El aria-label vive en el host <sirem-button>, no en el <button> nativo.
    expect(
      host(fixture).querySelector('[aria-label="Pantalla completa"]'),
    ).toBeTruthy();

    fixture.componentInstance.showFullscreen.set(false);
    fixture.detectChanges();
    expect(
      host(fixture).querySelector('[aria-label="Pantalla completa"]'),
    ).toBeNull();
  });

  it('should toggle the menu button and emit when pressed', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const menu = host(fixture).querySelector<HTMLButtonElement>('.sirem-topbar__icon-btn--menu');
    expect(menu).toBeTruthy();

    const topbar = fixture.debugElement.query(By.directive(SiremTopbar))
      .componentInstance as SiremTopbar;
    const pressed: string[] = [];
    topbar.menuPressed.subscribe(() => pressed.push('ok'));
    menu?.click();
    expect(pressed).toEqual(['ok']);

    fixture.componentInstance.showMenu.set(false);
    fixture.detectChanges();
    expect(host(fixture).querySelector('.sirem-topbar__icon-btn--menu')).toBeNull();
  });

  it('should apply the cards appearance class', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(host(fixture).querySelector('.sirem-topbar--cards')).toBeNull();

    fixture.componentInstance.appearance.set('cards');
    fixture.detectChanges();
    expect(host(fixture).querySelector('.sirem-topbar--cards')).toBeTruthy();
  });

  it('should apply the centered search layout class', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.searchAlign.set('center');
    fixture.detectChanges();
    expect(host(fixture).querySelector('.sirem-topbar--search-center')).toBeTruthy();
  });

  it('should render the page title chip and hide it when empty', () => {
    const fixture = TestBed.createComponent(SiremTopbar);
    fixture.detectChanges();
    expect(host(fixture).querySelector('.sirem-topbar__page')).toBeNull();

    fixture.componentRef.setInput('pageTitle', 'Agenda');
    fixture.componentRef.setInput('pageSupTitle', 'Hoy');
    fixture.detectChanges();

    const chip = host(fixture).querySelector('.sirem-topbar__page');
    expect(chip?.querySelector('.sirem-topbar__page-title')?.textContent).toContain('Agenda');
    expect(chip?.querySelector('.sirem-topbar__page-sub')?.textContent).toContain('Hoy');
  });

  it('should emit spacePressed and searchPressed', () => {
    const fixture = TestBed.createComponent(SiremTopbar);
    fixture.detectChanges();
    const root = host(fixture);

    const space: string[] = [];
    const search: string[] = [];
    fixture.componentInstance.spacePressed.subscribe(() => space.push('ok'));
    fixture.componentInstance.searchPressed.subscribe(() => search.push('ok'));

    // El disparador de espacio es un <sirem-button> con aria-label en el host;
    // la búsqueda la hace el icono nativo (`.sirem-topbar__search-btn`).
    root.querySelector<HTMLElement>('[aria-label^="Cambiar de"]')?.click();
    root.querySelector<HTMLButtonElement>('.sirem-topbar__search-btn')?.click();

    expect(space).toEqual(['ok']);
    expect(search).toEqual(['ok']);
  });

  it('should switch to the sticky appearance while the directive keeps it stuck', async () => {
    const fixture = TestBed.createComponent(StickyTopbarHost);
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const el = fixture.nativeElement.querySelector('sirem-topbar') as HTMLElement;
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(rect(0, 64));

    try {
      Object.defineProperty(window, 'scrollY', { value: 120, configurable: true });
      document.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      expect(
        fixture.debugElement.query(By.directive(SiremTopbar)).componentInstance.activeAppearance(),
      ).toBe('elevated');
      expect(el.querySelector('.sirem-topbar--elevated')).toBeTruthy();
    } finally {
      Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    }
  });
});

/** Host con la directiva aplicada al componente: valida la integración por DI. */
@Component({
  standalone: true,
  imports: [SiremTopbar, SiremSticky],
  template: `<sirem-topbar siremSticky stickyAppearance="elevated" />`,
})
class StickyTopbarHost {}
