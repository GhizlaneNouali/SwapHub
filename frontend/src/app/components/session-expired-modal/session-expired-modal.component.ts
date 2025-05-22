import { Component } from '@angular/core';
import { SessionExpiredService } from '../../services/session/session-expired.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-session-expired-modal',
  imports: [CommonModule, RouterModule, AsyncPipe],
  templateUrl: './session-expired-modal.component.html',
  styleUrl: './session-expired-modal.component.css'
})
export class SessionExpiredModalComponent {
  visible$: any;

  constructor(private sessionExpired: SessionExpiredService,
              private authService: AuthService  
  ) {
    this.visible$ = this.sessionExpired.showModal$;
  }

  // Mètode que s'executa quan l'usuari fa clic al botó "Continue"
  logout(): void {
    this.sessionExpired.hide();
    this.authService.logout(); 
  }
  
}
