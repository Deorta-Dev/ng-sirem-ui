import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PageDemoShell } from './page-demo-shell';

describe('PageDemoShell', () => {
  let fixture: ComponentFixture<PageDemoShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageDemoShell],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PageDemoShell);
    fixture.componentRef.setInput('label', 'Página de prueba');
    fixture.componentRef.setInput('files', [
      { name: 'page.html', language: 'html', code: '<main>Hola</main>' },
      {
        name: 'page.component.ts',
        language: 'typescript',
        code: 'export class Page {}',
      },
    ]);
    fixture.detectChanges();
  });

  it('should open the code modal from the fixed bar', () => {
    const codeButton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'footer .sirem-btn',
    );

    codeButton?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.codeOpen()).toBe(true);
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]')).toBeTruthy();
  });

  it('should switch the active file tab', () => {
    fixture.componentInstance.codeOpen.set(true);
    fixture.detectChanges();

    const tabs = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    tabs[1]?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.activeIndex()).toBe(1);
    expect(fixture.componentInstance.activeFile()?.name).toBe('page.component.ts');
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
  });
});
