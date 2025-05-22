import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { cookieConsentGuard } from './cookie-consent.guard';

describe('cookieConsentGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => cookieConsentGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
