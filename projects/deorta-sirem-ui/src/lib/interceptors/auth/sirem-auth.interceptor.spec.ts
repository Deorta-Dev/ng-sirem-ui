import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideSiremAuth, siremAuthInterceptor } from './sirem-auth.interceptor';

describe('siremAuthInterceptor', () => {
  it('should add the Bearer header when a token exists', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([siremAuthInterceptor])),
        provideHttpClientTesting(),
        provideSiremAuth(() => 'abc123'),
      ],
    });
    TestBed.inject(HttpClient).get('/api/pacientes').subscribe();
    const req = TestBed.inject(HttpTestingController).expectOne('/api/pacientes');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc123');
    req.flush([]);
  });
});
