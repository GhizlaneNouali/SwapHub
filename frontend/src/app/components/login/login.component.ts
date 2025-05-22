import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;  // El formulari de login
  loading = false;       // Indica si el formulari està carregant
  message = '';          // Missatge d'error
  successMessage = '';   // Missatge d'èxit
  showPassword = false;  // Controla si es mostra la contraseny

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.message = '';
    this.successMessage = '';

    const loginData = {
      username: this.loginForm.value.email,  
      password: this.loginForm.value.password,
    };

    // S'envia la petició al servei d'autenticació
    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Login successful! Redirecting...';
        this.authService.setCurrentUser(response.token);

        setTimeout(() => {
          this.router.navigate(['/app']);
        }, 50);  
      },
      error: (error) => {
        this.loading = false;
        this.message = 'Invalid email or password';
      },
    });
  }
}