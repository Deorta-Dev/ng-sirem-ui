import { TestBed } from '@angular/core/testing';
import { SiremImageUpload } from './sirem-image-upload';

describe('SiremImageUpload', () => {
  it('should show dropzone when empty and preview when set', () => {
    const fixture = TestBed.createComponent(SiremImageUpload);
    fixture.componentRef.setInput('label', 'Foto');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('subir');
    fixture.componentRef.setInput('value', 'data:image/png;base64,AAA');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeTruthy();
  });
});
