import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL base de l'API, definida a l'arxiu d'entorn
  private apiUrl = `${environment.apiUrl}api`;
  // Inicialitzem el BehaviorSubject amb el token o null
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('token');
    this.currentUserSubject = new BehaviorSubject<any>(token || null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Verifica si l'usuari està autenticat comprovant si hi ha token
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;  
  }

  // Registra un nou usuari enviant les dades al backend
  register(userData: any): Observable<any> {  
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Inicia sessió enviant les credencials i retorna la resposta del backend (amb token)
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login_check`, credentials);
  }

  // Desa el token i actualitza l'usuari actual
  setCurrentUser(token: string): void {
    localStorage.setItem('token', token);
    this.currentUserSubject.next(token);  
  }

  // Elimina el token i redirigeix a la pàgina d'inici
  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);  
    this.router.navigate(['/']);

  }

  // Getter per accedir fàcilment al valor actual del token
  get currentUserValue(): any {
    return this.currentUserSubject.value;
  }
  
}
