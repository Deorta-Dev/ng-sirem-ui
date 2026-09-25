import { SiremPhonePipe } from './sirem-phone.pipe';

describe('SiremPhonePipe', () => {
  it('should group 10 digits as 3-3-4', () => {
    expect(new SiremPhonePipe().transform('3001112233')).toBe('300 111 2233');
  });

  it('should return the input when it is not 10 digits', () => {
    expect(new SiremPhonePipe().transform('123')).toBe('123');
  });
});
