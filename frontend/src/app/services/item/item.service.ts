import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Item } from '../../models/item.model';


@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = `${environment.apiUrl}api/item`;

  constructor(private http: HttpClient) { }
  
  // Crea un nou ítem amb les dades passades via FormData
  createItem(itemData: FormData): Observable<any> {

    const token = localStorage.getItem('token');    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post(`${this.apiUrl}/new`, itemData, { headers });
    
  }

  // Obté tots els ítems disponibles
  getItems(): Observable<any> {
    const token = localStorage.getItem('token');    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Item[]>(this.apiUrl, { headers });
  }

  // Obté la informació detallada d’un ítem concret
  getItem(id: number): Observable<any> {
    const token = localStorage.getItem('token');    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Item>(`${this.apiUrl}/${id}`, {headers});
  }
  
  // Obté ítems relacionats segons la categoria, excloent l’ítem actual
  getRelatedItems(itemId: number, category: string): Observable<Item[]> {
    const token = localStorage.getItem('token');    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.get<Item[]>(`${this.apiUrl}/related?category=${category}&excludeId=${itemId}`, { headers });
  }

  // Obté tots els ítems de l’usuari autenticat
  getMyItems(): Observable<Item[]> {
    const token = localStorage.getItem('token');    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.get<Item[]>(`${this.apiUrl}/my-items`, { headers });

  }

  // Actualitza un ítem específic amb noves dades
  updateItem(itemId: string, formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(`${this.apiUrl}/${itemId}`, formData, { headers });
    
  }  

  // Elimina un ítem concret
  deleteItem(itemId: number): Observable<any> {
    const token = localStorage.getItem('token');    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.apiUrl}/${itemId}`, {headers});
  }
}