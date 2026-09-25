import { TestBed } from '@angular/core/testing';
import { SiremModal } from './sirem-modal';

describe('SiremModal', () => {
  it('should render dialog when open', () => {
    const fixture = TestBed.createComponent(SiremModal);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Editar paciente');
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-label')).toBe('Editar paciente');
  });

  it('should close and emit on close()', () => {
    const fixture = TestBed.createComponent(SiremModal);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    let closed = false;
    fixture.componentInstance.closed.subscribe(() => (closed = true));
    fixture.componentInstance.close();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(closed).toBe(true);
  });

  it('should render declarative actions and emit on press', () => {
    const fixture = TestBed.createComponent(SiremModal);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('actions', [
      { label: 'Cancelar', variant: 'secondary' },
      { label: 'Eliminar', variant: 'danger' },
    ]);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.sirem-modal__footer sirem-button');
    expect(buttons.length).toBe(2);
    let received: unknown = null;
    fixture.componentInstance.actionPressed.subscribe((a) => (received = a));
    buttons[1].querySelector('button')?.click();
    expect(received).toEqual(expect.objectContaining({ label: 'Eliminar' }));
  });
});
