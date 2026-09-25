import { TestBed } from '@angular/core/testing';
import { SiremConfirmDialog } from './sirem-confirm-dialog';

describe('SiremConfirmDialog', () => {
  it('should emit confirmed and close', () => {
    const fixture = TestBed.createComponent(SiremConfirmDialog);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    let confirmed = false;
    fixture.componentInstance.confirmed.subscribe(() => (confirmed = true));
    fixture.componentInstance.confirm();
    expect(confirmed).toBe(true);
    expect(fixture.componentInstance.open()).toBe(false);
  });
});
