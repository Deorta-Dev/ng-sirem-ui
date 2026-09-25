import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiremList } from './sirem-list';

describe('SiremList', () => {
  let fixture: ComponentFixture<SiremList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SiremList] }).compileComponents();
    fixture = TestBed.createComponent(SiremList);
    fixture.componentRef.setInput('items', [{ title: 'María Torres', subtitle: 'CC 1020' }]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should emit the item on row click', () => {
    let received: unknown = null;
    fixture.componentInstance.itemPressed.subscribe((i) => (received = i));
    (fixture.nativeElement as HTMLElement).querySelector('.sirem-list__row')?.dispatchEvent(new Event('click'));
    expect(received).toEqual(expect.objectContaining({ title: 'María Torres' }));
  });
});
