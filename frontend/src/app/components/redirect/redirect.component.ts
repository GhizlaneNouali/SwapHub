import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-redirect',
  template: '',
})
export class RedirectComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Comprovem si l'usuari està autenticat
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/app']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
