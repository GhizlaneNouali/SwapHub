import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from '../../services/cookie/cookie.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cookie',
  imports: [CommonModule,RouterModule],
  templateUrl: './cookie.component.html',
  styleUrls: ['./cookie.component.css']
})
export class CookieComponent implements OnInit {
  showBanner = false;

  constructor(private cookieService: CookieService, private router: Router) {}

  ngOnInit(): void {
    // Comprovem si ja existeix una cookie que indica si l'usuari ha donat consentiment
    const consent = this.cookieService.getCookie('cookieConsent');
    if (!consent) {
      this.showBanner = true;
    }
  }

  acceptCookies(): void {
    // Si l'usuari accepta les cookies, establim la cookie per 365 dies
    this.cookieService.setCookie('cookieConsent', 'true', 365);
    this.showBanner = false;
  }

  declineCookies(): void {
    // Si l'usuari rebutja les cookies, redirigim a la pàgina d'informació sobre cookies
    this.router.navigate(['/cookies-info']); 
  }
}