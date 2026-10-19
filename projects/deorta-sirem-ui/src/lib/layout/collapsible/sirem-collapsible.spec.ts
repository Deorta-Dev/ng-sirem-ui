import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SiremCollapsible } from './sirem-collapsible';
import { SiremCollapsibleGroup } from './sirem-collapsible-group';

@Component({
  standalone: true,
  imports: [SiremCollapsible, SiremCollapsibleGroup],
  template: `
    <sirem-collapsible-group>
      <sirem-collapsible title="Datos" [(open)]="datos">Contenido A</sirem-collapsible>
      <sirem-collapsible title="Antecedentes" [(open)]="antecedentes">Contenido B</sirem-collapsible>
    </sirem-collapsible-group>
  `,
})
class AccordionHost {
  readonly datos = signal(false);
  readonly antecedentes = signal(false);
}

describe('SiremCollapsible', () => {
  it('should toggle from the header and expose its state', () => {
    const fixture = TestBed.createComponent(SiremCollapsible);
    fixture.componentRef.setInput('title', 'Datos del paciente');
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      '.sirem-collapsible__trigger',
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector('.sirem-collapsible--open')).toBeNull();

    trigger.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('.sirem-collapsible--open')).not.toBeNull();

    trigger.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('should keep only one section open inside an accordion group', () => {
    const fixture = TestBed.createComponent(AccordionHost);
    fixture.detectChanges();

    const triggers = fixture.nativeElement.querySelectorAll(
      '.sirem-collapsible__trigger',
    ) as NodeListOf<HTMLButtonElement>;

    triggers[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.datos()).toBe(true);
    expect(fixture.componentInstance.antecedentes()).toBe(false);

    triggers[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.antecedentes()).toBe(true);
    expect(fixture.componentInstance.datos()).toBe(false);
  });
});
