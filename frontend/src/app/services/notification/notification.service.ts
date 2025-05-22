import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}api/notification`;

  constructor(private http:HttpClient) { }

  // Obté totes les notificacions de l'usuari autenticat
  getNotifications(): Observable<Notification[]> {

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    });
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications`, {headers})
  }
}
