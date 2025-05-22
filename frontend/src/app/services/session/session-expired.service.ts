import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionExpiredService {
  private _showModal$ = new BehaviorSubject<boolean>(false);
  showModal$ = this._showModal$.asObservable();


  // Mostra el modal de sessió expirada
  show() {
    this._showModal$.next(true);
  }

  // Amaga el modal de sessió expirada
  hide() {
    this._showModal$.next(false);
  }
}
