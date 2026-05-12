import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor() {
    // Carica l'utente dal localStorage all'avvio
    const savedUser = localStorage.getItem('byte_or_bite_user');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): Observable<User> {
    // Mock login
    return of({ id: '1', email, name: 'Utente Mock' }).pipe(
      delay(1000),
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('byte_or_bite_user', JSON.stringify(user));
      })
    );
  }

  register(email: string, password: string, name: string): Observable<User> {
    // Mock registration
    return of({ id: '2', email, name }).pipe(
      delay(1000),
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('byte_or_bite_user', JSON.stringify(user));
      })
    );
  }

  logout() {
    this.currentUserSubject.next(null);
    localStorage.removeItem('byte_or_bite_user');
  }

  resetPassword(email: string): Observable<boolean> {
    // Mock reset password
    console.log(`Reset password request for: ${email}`);
    return of(true).pipe(delay(1000));
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
}
