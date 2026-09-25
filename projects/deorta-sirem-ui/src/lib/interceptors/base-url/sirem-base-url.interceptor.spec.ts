import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideSiremApiUrl, siremBaseUrlInterceptor } from './sirem-base-url.interceptor';

describe('siremBaseUrlInterceptor', () => {
  it('should prefix relative urls with the base', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([siremBaseUrlInterceptor])),
        provideHttpClientTesting(),
        provideSiremApiUrl('https://api.sirem.com'),
      ],
    });
    TestBed.inject(HttpClient).get('/api/pacientes').subscribe();
    TestBed.inject(HttpTestingController).expectOne('https://api.sirem.com/api/pacientes').flush([]);
  });
});
