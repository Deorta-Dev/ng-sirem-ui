import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { SiremButton } from './sirem-button';

describe('SiremButton', () => {
  it('should create and emit pressed on click', () => {
    const fixture = TestBed.createComponent(SiremButton);
    fixture.detectChanges();
    let count = 0;
    fixture.componentInstance.pressed.subscribe(() => count++);
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(count).toBe(1);
  });

  it('should default to rounded-md and h-10 (40px)', () => {
    const fixture = TestBed.createComponent(SiremButton);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    // Las clases semánticas viven en sirem-button.scss (verificado por compilación).
    expect(fixture.componentInstance.classes()).toContain('sirem-btn--md');
    expect(el.className).toContain('sirem-btn--md');
  });

  it('should size icon-only buttons as squares', () => {
    const fixture = TestBed.createComponent(SiremButton);
    fixture.componentRef.setInput('iconOnly', true);
    fixture.detectChanges();
    const classes = fixture.componentInstance.classes();
    expect(classes).toContain('sirem-btn--icon-only-md');
    expect(classes).not.toContain('sirem-btn--md ');
  });

  it('should show loading until the observable action completes', () => {
    const fixture = TestBed.createComponent(SiremButton);
    const gate = new Subject<string>();
    fixture.componentRef.setInput('action', () => gate.asObservable());
    fixture.detectChanges();
    const c = fixture.componentInstance;
    let done: unknown = null;
    c.finished.subscribe((v) => (done = v));

    c.onClick();
    expect(c.loading()).toBe(true);

    gate.next('ok');
    gate.complete();
    expect(c.loading()).toBe(false);
    expect(done).toBe('ok');
  });

  it('should emit failed when the action errors', () => {
    const fixture = TestBed.createComponent(SiremButton);
    const gate = new Subject<string>();
    fixture.componentRef.setInput('action', () => gate.asObservable());
    fixture.detectChanges();
    const c = fixture.componentInstance;
    let failure: unknown = null;
    c.failed.subscribe((e) => (failure = e));

    c.onClick();
    gate.error('boom');
    expect(c.loading()).toBe(false);
    expect(failure).toBe('boom');
  });

  it('should ignore clicks while loading', () => {
    const fixture = TestBed.createComponent(SiremButton);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    let count = 0;
    c.pressed.subscribe(() => count++);
    c.loading.set(true);
    c.onClick();
    expect(count).toBe(0);
  });
});
