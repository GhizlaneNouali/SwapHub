import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileService } from '../../services/profile/profile.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-nav',
  standalone: true,  
  imports: [CommonModule, RouterModule],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit, OnDestroy {
  private authSubscription: Subscription | null = null;
  isAuthenticated: boolean = false;
  profileImage: string = '';
  apiUrl = environment.apiUrl;
  private profileImageSubscription: Subscription | null = null;

  constructor(private authService: AuthService, 
              private profileService: ProfileService,
            ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser.subscribe(token => {
      this.isAuthenticated = !!token;
  
      if (this.isAuthenticated) {
        this.loadProfile();
      } else {
        this.profileImage = '';
        this.profileService.setProfileImage('');
      }
    });
  
    this.profileImageSubscription = this.profileService.profileImage$.subscribe(imageUrl => {
      this.profileImage = imageUrl || '';
    });
  }
            

  // Mètode per carregar el perfil de l'usuari
  loadProfile(): void {
    this.profileService.getUserProfile().subscribe({
      next: (data) => {
        this.profileImage = data.profileImage;
        this.profileService.setProfileImage(this.profileImage);  
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
      }
    });
  }

  // Mètode que s'executa quan el component es destruït
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }

    if (this.profileImageSubscription) {
      this.profileImageSubscription.unsubscribe();
    }
  }

  // Mètode per comprovar si l'usuari està autenticat
  checkAuth(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  // Mètode per tancar sessió
  logout(): void {
    this.authService.logout();
  }
  closeDropdown(dropdownMenu: HTMLElement): void {
    dropdownMenu.blur();
  }
  
}