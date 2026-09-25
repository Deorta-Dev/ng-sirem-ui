import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SiremButton } from '../../button/sirem-button';
import { SiremNavItem, SiremSidebar } from './sirem-sidebar';

@Component({
  standalone: true,
  imports: [SiremButton, SiremSidebar],
  template: `
    <sirem-sidebar brand="SIREM" [items]="items" [pinned]="true" [centerNav]="true">
      <sirem-button slot="apps" size="sm" variant="secondary"> Apps </sirem-button>
      <span slot="user">Ana Pérez</span>
    </sirem-sidebar>
  `,
})
class SidebarHost {
  readonly items: SiremNavItem[] = [
    { label: 'Pacientes', icon: 'fi fi-rr-users' },
    { label: 'Agenda', icon: 'fi fi-rr-calendar' },
  ];
}

describe('SiremSidebar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SidebarHost],
      providers: [provideRouter([])],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SiremSidebar);
    fixture.componentRef.setInput('items', [{ label: 'Pacientes', route: '/x' }]);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should hide items without permission', () => {
    const fixture = TestBed.createComponent(SiremSidebar);
    fixture.componentRef.setInput('items', [
      { label: 'Pacientes', permission: 'CLINIC_PATIENTS_LIST' },
      { label: 'Agenda' },
    ]);
    fixture.componentRef.setInput('permissions', new Set<string>());
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('Pacientes');
    expect(text).toContain('Agenda');
  });

  it('should render projected apps and user in a pinned centered sidebar', () => {
    const fixture = TestBed.createComponent(SidebarHost);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Apps');
    expect(element.textContent).toContain('Ana Pérez');
    expect(element.querySelector('.sirem-sidebar--pinned')).toBeTruthy();
    expect(element.querySelector('.sirem-sidebar__nav--center')).toBeTruthy();
  });
});
