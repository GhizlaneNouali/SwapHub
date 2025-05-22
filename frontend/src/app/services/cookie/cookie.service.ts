// src/app/services/cookie.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
// Estableix una cookie amb nom, valor i durada en dies
  setCookie(name: string, value: string, days: number): void {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  }

// Obté el valor d’una cookie pel seu nom
  getCookie(name: string): string | null {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith(name + '='))
      ?.split('=')[1] ?? null;
  }

// Elimina una cookie establint la seva expiració en el passat
  deleteCookie(name: string): void {
    this.setCookie(name, '', -1);
  }
}
