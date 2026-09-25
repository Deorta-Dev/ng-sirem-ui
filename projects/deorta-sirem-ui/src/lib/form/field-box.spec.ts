import { siremFieldBox, SIREM_FIELD_BOX } from './field-box';

describe('siremFieldBox', () => {
  it('should use the same border for every field', () => {
    expect(SIREM_FIELD_BOX).toContain('rounded-lg border');
    expect(siremFieldBox(false, 'h-10 px-3')).toContain('border-slate-300');
  });

  it('should switch to the error border when invalid', () => {
    expect(siremFieldBox(true)).toContain('border-red-400');
    expect(siremFieldBox(true)).not.toContain('border-slate-300');
  });
});
