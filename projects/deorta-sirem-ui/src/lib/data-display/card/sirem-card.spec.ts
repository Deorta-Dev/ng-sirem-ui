import { Component, signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SiremCard, type SiremCardPadding } from './sirem-card';

@Component({
  standalone: true,
  imports: [SiremCard],
  template: `
    <sirem-card
      title="Historia clínica"
      subtitle="HC-2026-001"
      [headerPadding]="headerPadding()"
      [bodyPadding]="bodyPadding()"
      [footerPadding]="footerPadding()"
      [showHeader]="showHeader()"
      [showFooter]="showFooter()"
    >
      <p>Cuerpo</p>
      @if (withFooter()) {
        <div slot="footer">Acciones</div>
      }
    </sirem-card>
  `,
})
class Host {
  readonly headerPadding = signal<SiremCardPadding>('sm');
  readonly bodyPadding = signal<SiremCardPadding | null>(null);
  readonly footerPadding = signal<SiremCardPadding | null>(null);
  readonly showHeader = signal(true);
  readonly showFooter = signal(true);
  readonly withFooter = signal(true);
}

describe('SiremCard', () => {
  const host = (fixture: { nativeElement: unknown }) => fixture.nativeElement as HTMLElement;
  const expectHas = (el: Element | null, cls: string) =>
    expect(!!el?.classList.contains(cls)).toBe(true);

  it('should render title when provided', () => {
    const fixture = TestBed.createComponent(SiremCard);
    fixture.componentRef.setInput('title', 'Ficha del paciente');
    fixture.detectChanges();
    expect(host(fixture).textContent).toContain('Ficha del paciente');
  });

  it('should hide the header when there is no title or subtitle', () => {
    const fixture = TestBed.createComponent(SiremCard);
    fixture.detectChanges();
    expect(host(fixture).querySelector('.sirem-card__header')).toBeNull();
    expect(host(fixture).querySelector('.sirem-card__body')).toBeTruthy();
  });

  it('should apply a default padding per zone', () => {
    const fixture = TestBed.createComponent(SiremCard);
    fixture.componentRef.setInput('title', 'T');
    fixture.detectChanges();
    expectHas(host(fixture).querySelector('.sirem-card__header'), 'sirem-card__part--sm');
    expectHas(host(fixture).querySelector('.sirem-card__body'), 'sirem-card__part--md');
  });

  it('should let per-zone padding win over the padding shortcut', () => {
    const fixture = TestBed.createComponent(SiremCard);
    fixture.componentRef.setInput('title', 'T');
    fixture.componentRef.setInput('padding', 'none');
    fixture.componentRef.setInput('bodyPadding', 'lg');
    fixture.componentRef.setInput('headerPadding', 'none');
    fixture.detectChanges();
    expectHas(host(fixture).querySelector('.sirem-card__header'), 'sirem-card__part--none');
    expectHas(host(fixture).querySelector('.sirem-card__body'), 'sirem-card__part--lg');
  });

  it('should not give padding to the footer when no footer content is projected', () => {
    const fixture = TestBed.createComponent(SiremCard);
    fixture.componentRef.setInput('title', 'T');
    fixture.detectChanges();
    // El pie existe pero `:empty` lo oculta: ni aire ni borde de más.
    const footer = host(fixture).querySelector<HTMLElement>('.sirem-card__footer');
    expect(footer).toBeTruthy();
    expect(footer?.matches(':empty')).toBe(true);
  });

  it('should render the footer when content is projected', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const footer = host(fixture).querySelector<HTMLElement>('.sirem-card__footer');
    expect(footer).toBeTruthy();
    expect(footer?.matches(':empty')).toBe(false);
    expect(footer?.textContent).toContain('Acciones');
  });

  it('should hide header and footer on demand via showHeader/showFooter', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(host(fixture).querySelector('.sirem-card__header')).toBeTruthy();

    (fixture.componentInstance.showHeader as WritableSignal<boolean>).set(false);
    (fixture.componentInstance.showFooter as WritableSignal<boolean>).set(false);
    fixture.detectChanges();
    expect(host(fixture).querySelector('.sirem-card__header')).toBeNull();
    expect(host(fixture).querySelector('.sirem-card__footer')).toBeNull();
  });

  it('should accept independent paddings bound from the host', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    (fixture.componentInstance.headerPadding as WritableSignal<SiremCardPadding>).set('lg');
    (fixture.componentInstance.footerPadding as WritableSignal<SiremCardPadding | null>).set('none');
    fixture.detectChanges();
    expectHas(host(fixture).querySelector('.sirem-card__header'), 'sirem-card__part--lg');
    expectHas(host(fixture).querySelector('.sirem-card__footer'), 'sirem-card__part--none');
  });
});
