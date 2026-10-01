import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { SiremTopbar } from 'deorta-sirem-ui';
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

  it('should create the admin workspace', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.sirem-sidebar--pinned'),
    ).toBeTruthy();
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
