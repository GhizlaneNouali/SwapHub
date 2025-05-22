import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavComponent } from './components/nav/nav.component';
import { SessionExpiredModalComponent } from './components/session-expired-modal/session-expired-modal.component';
import { CookieComponent } from './components/cookie/cookie.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule,NavComponent, SessionExpiredModalComponent, CookieComponent  ] ,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isAuthenticated: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.checkAuth();
  }

  checkAuth(): void {
    this.isAuthenticated = !!localStorage.getItem('token');
  }
}
