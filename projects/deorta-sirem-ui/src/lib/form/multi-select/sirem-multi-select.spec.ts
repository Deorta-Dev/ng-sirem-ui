import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiremMultiSelect } from './sirem-multi-select';

describe('SiremMultiSelect', () => {
  let fixture: ComponentFixture<SiremMultiSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SiremMultiSelect] }).compileComponents();
    fixture = TestBed.createComponent(SiremMultiSelect);
    fixture.componentRef.setInput('options', [
      { value: 'crear', label: 'Crear citas', group: 'Agenda' },
      { value: 'ver', label: 'Ver historia', group: 'Clínica' },
    ]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should toggle values on option change', () => {
    const first = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '.sirem-multi__check',
    );
    first?.click();
    expect(fixture.componentInstance.value()).toEqual(['crear']);
  });
});
