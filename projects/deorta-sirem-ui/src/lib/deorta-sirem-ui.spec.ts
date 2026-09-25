import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeortaSiremUi } from './deorta-sirem-ui';

describe('DeortaSiremUi', () => {
  let component: DeortaSiremUi;
  let fixture: ComponentFixture<DeortaSiremUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeortaSiremUi],
    }).compileComponents();

    fixture = TestBed.createComponent(DeortaSiremUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
