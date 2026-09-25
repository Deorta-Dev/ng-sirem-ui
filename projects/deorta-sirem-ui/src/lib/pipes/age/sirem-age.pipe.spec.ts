import { SiremAgePipe } from './sirem-age.pipe';

describe('SiremAgePipe', () => {
  it('should return years with suffix', () => {
    expect(new SiremAgePipe().transform('2000-01-01')).toMatch(/\d+ años?/);
  });

  it('should return em dash on invalid input', () => {
    expect(new SiremAgePipe().transform('no-fecha')).toBe('—');
  });
});
