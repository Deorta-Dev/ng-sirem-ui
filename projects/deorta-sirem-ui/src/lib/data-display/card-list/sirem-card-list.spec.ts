import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiremCardList } from './sirem-card-list';

describe('SiremCardList', () => {
  let fixture: ComponentFixture<SiremCardList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SiremCardList] }).compileComponents();
    fixture = TestBed.createComponent(SiremCardList);
    fixture.componentRef.setInput('items', [{ id: 1, title: 'María Torres' }]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should emit the record on card click', () => {
    let received: unknown = null;
    fixture.componentInstance.itemPressed.subscribe((r) => (received = r));
    const card = (fixture.nativeElement as HTMLElement).querySelector('.sirem-cards__card');
    card?.dispatchEvent(new Event('click'));
    expect(received).toEqual(expect.objectContaining({ title: 'María Torres' }));
  });
});
