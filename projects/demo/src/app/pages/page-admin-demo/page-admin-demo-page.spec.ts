import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { SiremTopbar } from '@deorta-dev/ng-sirem-ui';
import { PageAdminDemoPage } from './page-admin-demo-page';

describe('PageAdminDemoPage', () => {
  let fixture: ComponentFixture<PageAdminDemoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageAdminDemoPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PageAdminDemoPage);
    fixture.detectChanges();
  });

  afterEach(() => {
    document.querySelectorAll('.sirem-overlay-layer').forEach((el) => el.remove());
  });

  it('should create the admin workspace', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.sirem-sidebar--pinned'),
    ).toBeTruthy();
  });

  it('should send the hierarchical nav to the overlay layer', () => {
    const host = fixture.nativeElement as HTMLElement;
    const trigger = [...host.querySelectorAll('button.sirem-sidebar__link')].find((b) =>
      b.textContent?.includes('Pacientes'),
    ) as HTMLButtonElement;
    expect(trigger).toBeTruthy();

    // Los hijos no se pintan dentro del rail: el padre es un disparador de overlay.
    expect(trigger.getAttribute('aria-haspopup')).toBe('true');
    expect(host.textContent).not.toContain('Ficha del paciente');

    // jsdom mide 1024 px y el breakpoint es 1024 → banda móvil → gesto click.
    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const layer = document.querySelector('.sirem-overlay-layer');
    expect(layer?.textContent).toContain('Listado');
    expect(layer?.textContent).toContain('Ficha del paciente');
  });

  it('should open the search palette from the topbar', () => {
    const topbar = fixture.debugElement.query(By.directive(SiremTopbar));
    topbar.triggerEventHandler('searchPressed');
    fixture.detectChanges();

    expect(fixture.componentInstance.searchOpen()).toBe(true);
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]')).toBeTruthy();
  });

  it('should show the "Ver todos los pacientes" button in the table card footer', () => {
    const host = fixture.nativeElement as HTMLElement;
    // Varias cards proyectan `.sirem-card__footer`; solo la de la tabla tiene
    // contenido (las demás quedan ocultas por `:empty`). Se busca la que lo tiene.
    const footer = [...host.querySelectorAll('.sirem-card__footer')].find(
      (el) => !el.matches(':empty'),
    );
    expect(footer).toBeTruthy();
    expect(footer?.textContent).toContain('Ver todos los pacientes');
  });

  it('should render the sidebar as a floating panel and the topbar in cards mode', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.sirem-sidebar--floating')).toBeTruthy();
    expect(host.querySelector('.sirem-topbar--cards')).toBeTruthy();
    // El buscador centrado se marca con su propia clase de layout.
    expect(host.querySelector('.sirem-topbar--search-center')).toBeTruthy();
  });

  it('should collapse the sidebar and expose mini mode', () => {
    // El aria-label vive en el host <sirem-button>, no en un <button> nativo.
    const collapse = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      'sirem-button[aria-label="Contraer menú"]',
    );
    collapse?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.sidebarCollapsed()).toBe(true);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.sirem-sidebar--collapsed'),
    ).toBeTruthy();
  });
});
