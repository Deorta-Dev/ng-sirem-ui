import { TestBed } from '@angular/core/testing';
import { SiremDate } from './sirem-date';

describe('SiremDate', () => {
  it('should display the ISO value formatted', () => {
    const fixture = TestBed.createComponent(SiremDate);
    fixture.componentRef.setInput('label', 'Nacimiento');
    fixture.componentRef.setInput('value', '2026-10-05');
    fixture.detectChanges();
    expect(fixture.componentInstance.box()).toContain('2026');
  });

  it('should set ISO value when picking a day', () => {
    const fixture = TestBed.createComponent(SiremDate);
    fixture.detectChanges();
    fixture.componentInstance.chooseDay('2026-10-05');
    expect(fixture.componentInstance.value()).toBe('2026-10-05');
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('should reject out-of-range days', () => {
    const fixture = TestBed.createComponent(SiremDate);
    fixture.componentRef.setInput('min', '2026-10-01');
    fixture.componentRef.setInput('max', '2026-10-31');
    fixture.detectChanges();
    fixture.componentInstance.chooseDay('2026-11-02');
    expect(fixture.componentInstance.value()).toBe(null);
    expect(fixture.componentInstance.dateError()).toContain('rango');
  });

  it('should render the toggle button inside the field', () => {
    const fixture = TestBed.createComponent(SiremDate);
    fixture.componentRef.setInput('label', 'Nacimiento');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector(
      '.sirem-date__wrap > button[aria-label="Abrir calendario"]',
    ) as HTMLButtonElement;
    expect(btn).toBeTruthy();
    btn.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(true);
  });

  it('should parse typed dd/mm/aaaa on commit', () => {
    const fixture = TestBed.createComponent(SiremDate);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    c.onBox('05/10/2026');
    c.commitBox();
    expect(c.value()).toBe('2026-10-05');
    c.onBox('no-fecha');
    c.commitBox();
    expect(c.dateError()).toContain('inválida');
  });
});
