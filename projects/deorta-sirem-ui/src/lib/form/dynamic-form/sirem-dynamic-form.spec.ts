import { TestBed } from '@angular/core/testing';
import { SiremDynamicForm, SiremFormNode } from './sirem-dynamic-form';

describe('SiremDynamicForm', () => {
  it('should validate required fields and emit on submit', () => {
    const fixture = TestBed.createComponent(SiremDynamicForm);
    fixture.componentRef.setInput('fields', [
      { key: 'nombres', type: 'text', label: 'Nombres', required: true },
    ]);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    expect(c.valid()).toBe(false);
    c.setValue('nombres', 'Ana');
    expect(c.valid()).toBe(true);
    let emitted: Record<string, unknown> | null = null;
    c.submitted.subscribe((v) => (emitted = v));
    c.submit();
    expect(emitted).toEqual({ nombres: 'Ana' });
  });

  it('should resolve Lion column classes', () => {
    const fixture = TestBed.createComponent(SiremDynamicForm);
    fixture.componentRef.setInput('fields', []);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    expect(c.colClass({ key: 'a', type: 'text', column: ['md-4'] })).toBe(
      'sirem-col-12 sirem-col-md-4',
    );
    expect(c.colClass({ key: 'b', type: 'text' })).toBe('sirem-col-12 sirem-col-md-6');
    expect(c.colClass({ type: 'table', key: 't', tableChildren: [] })).toBe('sirem-col-12');
  });

  it('should render groups, tables and dotted keys', () => {
    const fields: SiremFormNode[] = [
      {
        type: 'group',
        label: 'RX EN USO',
        children: [
          { key: 'tipo-lente-uso', type: 'text', column: ['md-4'] },
          {
            type: 'table',
            key: 'rx-use-table',
            tableChildren: [
              [{ type: 'html', label: '<strong>ESFERA</strong>' }],
              [{ type: 'html', label: '<strong>OD</strong>' }, { key: 'rx-use.esfera-od', type: 'text' }],
            ],
          },
        ],
      },
    ];
    const fixture = TestBed.createComponent(SiremDynamicForm);
    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('RX EN USO');
    expect(el.textContent).toContain('ESFERA');
    // clave con puntos convive plana en values
    fixture.componentInstance.setValue('rx-use.esfera-od', '-1.25');
    expect(fixture.componentInstance.values()['rx-use.esfera-od']).toBe('-1.25');
  });
});
