import { TestBed } from '@angular/core/testing';
import { SiremSegmented } from './sirem-segmented';

describe('SiremSegmented', () => {
  it('should keep the first option active by default and update on select', () => {
    const fixture = TestBed.createComponent(SiremSegmented);
    fixture.componentRef.setInput('items', [
      { value: 'bnb', label: '0.34 BNB' },
      { value: 'btc', label: '0.09 BTC' },
    ]);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll(
      '.sirem-seg__item',
    ) as NodeListOf<HTMLButtonElement>;
    expect(buttons[0].className).toContain('sirem-seg__item--active');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');

    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('btc');
    expect(buttons[1].className).toContain('sirem-seg__item--active');
    expect(buttons[0].className).not.toContain('sirem-seg__item--active');
  });

  it('should apply the accent and stretch modifiers', () => {
    const fixture = TestBed.createComponent(SiremSegmented);
    fixture.componentRef.setInput('items', [{ value: 'a', label: 'A' }]);
    fixture.componentRef.setInput('tone', 'accent');
    fixture.componentRef.setInput('stretch', true);
    fixture.detectChanges();
    const group = fixture.nativeElement.querySelector('.sirem-seg') as HTMLElement;
    expect(group.className).toContain('sirem-seg--accent');
    expect(group.className).toContain('sirem-seg--stretch');
  });

  it('should fall back to the table/cards preset when no items are given', () => {
    const fixture = TestBed.createComponent(SiremSegmented);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll(
      '.sirem-seg__item',
    ) as NodeListOf<HTMLButtonElement>;

    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain('Tabla');
    expect(buttons[1].textContent).toContain('Tarjetas');
    // Sin `value`, la primera opción hace de activa.
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');

    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('cards');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
  });
});
