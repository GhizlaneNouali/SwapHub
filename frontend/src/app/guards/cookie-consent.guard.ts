import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from '../services/cookie/cookie.service';

@Injectable({
  providedIn: 'root'
})
export class CookieConsentGuard implements CanActivate {
  constructor(private cookieService: CookieService, private router: Router) {}

  // Mètode que determina si una ruta es pot activar o no
  canActivate(): boolean {
    const consent = this.cookieService.getCookie('cookieConsent');  // Obtenim el valor de la cookie de consentiment
    // Si l'usuari ha donat el consentiment, permetem accedir a la ruta
    if (consent === 'true') {
      return true;
    } else {
      // Si no hi ha consentiment, redirigim a la pàgina d'informació sobre cookies
      this.router.navigate(['/cookies-info']);
      return false;
    }
  }
}
