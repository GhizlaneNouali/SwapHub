import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Comprovem si l'usuari està autenticat
  if (authService.isAuthenticated()) {
    return true;  // Si està autenticat, permetem l'accés a la ruta
  }
  
  // Si l'usuari no està autenticat, redirigim a la pàgina d'inici
  router.navigate(['/']);
  return false; // Impedim l'accés a la ruta protegida
};