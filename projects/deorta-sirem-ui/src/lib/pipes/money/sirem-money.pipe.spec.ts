import { SiremMoneyPipe } from './sirem-money.pipe';

describe('SiremMoneyPipe', () => {
  it('should format COP without decimals', () => {
    expect(new SiremMoneyPipe().transform(250000)).toContain('250.000');
  });

  it('should return em dash on invalid input', () => {
    expect(new SiremMoneyPipe().transform(null)).toBe('—');
  });
});
