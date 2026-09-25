import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiremRichText } from './sirem-rich-text';

describe('SiremRichText', () => {
  let fixture: ComponentFixture<SiremRichText>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SiremRichText] }).compileComponents();
    fixture = TestBed.createComponent(SiremRichText);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should sync input into the model', () => {
    const area = (fixture.nativeElement as HTMLElement).querySelector('.sirem-rich__area')!;
    area.innerHTML = '<b>Hola</b>';
    area.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.value()).toBe('<b>Hola</b>');
  });
});
