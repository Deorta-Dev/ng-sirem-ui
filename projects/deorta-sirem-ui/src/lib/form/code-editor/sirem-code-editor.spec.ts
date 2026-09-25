import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiremCodeEditor } from './sirem-code-editor';

describe('SiremCodeEditor', () => {
  let fixture: ComponentFixture<SiremCodeEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SiremCodeEditor] }).compileComponents();
    fixture = TestBed.createComponent(SiremCodeEditor);
    fixture.componentRef.setInput('code', 'const a = 1;');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the editor box', () => {
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.sirem-codeed__editor .cm-editor'),
    ).toBeTruthy();
  });
});
