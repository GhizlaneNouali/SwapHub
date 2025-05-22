import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule,RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;  // Variable per saber si estem carregant (per exemple, quan es fa la petició)
  errorMessage: string = '';  // Missatge d'error
  successMessage: string = '';  // Missatge d'èxit
  showPassword = false;  // Controla si es mostra la contrasenya
  showConfirmPassword = false;  // Controla si es mostra la confirmació de contrasenya 

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router
  ) {
    // Creem el formulari de registre amb validacions
    this.registerForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[A-Za-záéíóúÁÉÍÓÚñÑ]+$')
      ]],
      surnames: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[A-Za-záéíóúÁÉÍÓÚñÑ]+$') 
      ]],
      email: ['', [
        Validators.required,
        Validators.email 
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('.*[0-9].*'), 
        Validators.pattern('.*[!@#$%^&*(),.?":{}|<>].*'), 
        Validators.pattern('.*[A-Z].*'), 
        Validators.pattern('.*[a-z].*') 
      ]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  // Validació per comparar les contrasenyes
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
  // Quan s'envia el formulari
  onSubmit() {
    if (this.registerForm.invalid) return;

    const formData = this.registerForm.value;

    this.loading = true;

    this.authService.register(formData).subscribe({
      next: (response) => {
        // Si el registre és correcte, fem el login automàticament
        this.authService.login({
          username: formData.email, 
          password: formData.password
        }).subscribe({
          next: (loginResponse) => {
            localStorage.setItem('token', loginResponse.token);
            this.authService.setCurrentUser(loginResponse.token); 
            this.successMessage = 'Account created successfully! Redirecting...';
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 1500);
          },
          error: (loginError) => {
            this.errorMessage = 'Error logging in after registration.';
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.errorMessage = 'There was a problem. Please try again.';
        this.loading = false;
      }
    });
  }
}
