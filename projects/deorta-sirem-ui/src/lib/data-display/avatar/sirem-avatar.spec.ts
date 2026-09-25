import { TestBed } from '@angular/core/testing';
import { SiremAvatar } from './sirem-avatar';

describe('SiremAvatar', () => {
  it('should render initials from name', () => {
    const fixture = TestBed.createComponent(SiremAvatar);
    fixture.componentRef.setInput('name', 'Juan Ríos');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('JR');
  });
});
