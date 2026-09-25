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

  it('should collapse the sidebar and expose mini mode', () => {
    const collapse = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button[aria-label="Contraer menú"]',
    );
    collapse?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.sidebarCollapsed()).toBe(true);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.sirem-sidebar--collapsed'),
    ).toBeTruthy();
  });
});
