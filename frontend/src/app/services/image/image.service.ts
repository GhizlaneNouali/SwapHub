import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = `${environment.apiUrl}api/images`;

  constructor(private http: HttpClient) { }

  // Actualitza les imatges associades a un ítem concret.
  updateImages(itemId: string, formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(`${this.apiUrl}/${itemId}`, formData, { headers });
  } 
  
}