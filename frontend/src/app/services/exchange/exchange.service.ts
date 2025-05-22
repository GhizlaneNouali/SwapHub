import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Exchange } from '../../models/exchange.model';

@Injectable({
  providedIn: 'root'
})
export class ExchangeService {
  private apiUrl = `${environment.apiUrl}api/exchange`;

  constructor(private http: HttpClient) { }

  // Crea un nou intercanvi enviant els IDs dels ítems implicats i un missatge opcional
  createExchange(requestedItemId: number, offeredItemId: number, message: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    });
    const requestBody = {
      requestedItemId,
      offeredItemId,
      message,
    }
    return this.http.post(`${this.apiUrl}/new`, requestBody, {headers})
  }

  // Obté tots els intercanvis de l'usuari: enviats i rebuts
  getMyExchanges(): Observable<{ sent: Exchange[], received: Exchange[] }>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    });
    return this.http.get<{ sent: Exchange[], received: Exchange[] }>(`${this.apiUrl}/my`, {headers});
  }

  // Accepta una sol·licitud d’intercanvi
  acceptExchange(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    });
    return this.http.post(`${this.apiUrl}/${id}/accept`, {}, {headers});
  }

  // Rebutja una sol·licitud d’intercanvi
  rejectExchange(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    });
    return this.http.post(`${this.apiUrl}/${id}/reject`, {}, { headers })
  }
}



