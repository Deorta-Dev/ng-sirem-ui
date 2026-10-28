import { TestBed } from '@angular/core/testing';
import { SiremSearchPalette, type SiremPaletteItem } from './sirem-search-palette';

describe('SiremSearchPalette', () => {
  it('should create closed by default', () => {
    const fixture = TestBed.createComponent(SiremSearchPalette);
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(fixture.nativeElement.textContent).not.toContain('Búsqueda global');
  });

  it('should filter items by query and description', () => {
    const fixture = TestBed.createComponent(SiremSearchPalette);
    fixture.componentRef.setInput('items', [
      { label: 'Ana Pérez', description: 'Historia clínica 1024', group: 'Pacientes' },
      { label: 'Factura FV-001', group: 'Facturación' },
    ]);
    const c = fixture.componentInstance;
    c.query.set('1024');
    expect(c.filtered().length).toBe(1);
    expect(c.filtered()[0].label).toBe('Ana Pérez');
  });

  it('should navigate horizontal sub-items using ArrowRight and ArrowLeft', () => {
    const fixture = TestBed.createComponent(SiremSearchPalette);
    const items: SiremPaletteItem[] = [
      {
        label: 'Paciente Juan',
        icon: 'fi fi-rr-user',
        subItemsLayout: 'horizontal',
        subItems: [
          { label: 'Ver HC' },
          { label: 'Facturar' },
          { label: 'Agendar' },
        ],
      },
    ];
    fixture.componentRef.setInput('items', items);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const c = fixture.componentInstance;
    expect(c.active()).toBe(0);
    expect(c.activeSub()).toBe(null);

    // Flecha derecha activa el primer subitem
    c.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(c.activeSub()).toBe(0);

    // Flecha derecha se mueve al siguiente subitem
    c.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(c.activeSub()).toBe(1);

    // Flecha izquierda retrocede al anterior subitem
    c.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(c.activeSub()).toBe(0);

    // Flecha izquierda vuelve a deseleccionar el subitem (enfoca el item principal)
    c.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(c.activeSub()).toBe(null);
  });

  it('should select sub-item and emit subItemSelected on Enter', () => {
    const fixture = TestBed.createComponent(SiremSearchPalette);
    const items: SiremPaletteItem[] = [
      {
        label: 'Factura 100',
        subItemsLayout: 'horizontal',
        subItems: [{ label: 'Descargar PDF' }],
      },
    ];
    fixture.componentRef.setInput('items', items);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    let emittedSub: unknown = null;
    fixture.componentInstance.subItemSelected.subscribe((val) => {
      emittedSub = val;
    });

    const c = fixture.componentInstance;
    c.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(c.activeSub()).toBe(0);

    c.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(emittedSub).toEqual({
      item: items[0],
      subItem: items[0].subItems![0],
    });
    expect(c.open()).toBe(false);
  });

  it('should focus and scroll active item into view when setting active', () => {
    const fixture = TestBed.createComponent(SiremSearchPalette);
    const items = Array.from({ length: 20 }, (_, i) => ({ label: `Item ${i}` }));
    fixture.componentRef.setInput('items', items);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const c = fixture.componentInstance;
    c.setActive(15);
    expect(c.active()).toBe(15);
  });
});
