import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './services/auth/auth.service';
import { SessionExpiredService } from './services/session/session-expired.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionExpiredService = inject(SessionExpiredService);
  const authService = inject(AuthService)
  // Rutes públiques on no es verifica la sessió, com login i registre
  const publicEndpoints = ['/login', '/register'];
  const isPublicRequest = publicEndpoints.some(endpoint => req.url.includes(endpoint));


  let tokenExpiredHandled = false;


  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Comprovem si el codi d'estat és 401 (No autoritzat) i si no estem fent una petició pública
      if (error.status === 401 && !isPublicRequest) {
        tokenExpiredHandled = true
        // Mostrem el modal per informar que la sessió ha caducat
        sessionExpiredService.show();
        // Després de 5 minuts (300000 ms), amaguem el modal i tanquem la sessió
        setTimeout(() => {
          sessionExpiredService.hide();
          authService.logout();
        }, 300000);
      }
      
      return throwError(() => error);
    })
  );
};