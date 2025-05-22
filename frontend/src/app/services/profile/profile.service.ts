import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}api/profile`;

  private profileImageSubject = new BehaviorSubject<string | null>(null);
  profileImage$ = this.profileImageSubject.asObservable();


  constructor(private http: HttpClient) { }

  // Obté el perfil de l'usuari autenticat
  getUserProfile(): Observable<any> {
    const token = localStorage.getItem('token');    
    const headers = new HttpHeaders({ 
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}/my-profile`, { headers });
  }

  // Actualitza el perfil de l'usuari amb noves dades
  updateUserProfile(userData: any): Observable<any> {
    const token = localStorage.getItem('token');    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put<any>(`${this.apiUrl}/my-profile`, userData, { headers });
  }
  
  // Actualitza la imatge de perfil de l'usuari
  updateProfileImage(imageFile: File): Observable<any> {
    const token = localStorage.getItem('token');    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const formData = new FormData();  
    formData.append('image', imageFile);
    
    return this.http.post(`${this.apiUrl}/image`, formData, { headers });
  }

  setProfileImage(imageUrl: string): void {
    this.profileImageSubject.next(imageUrl); // Actualiza la imatge
  }
}